import { Relation, type Relations } from '~/sim/diplomacy/Relation'
import { ALL_RESOURCES, RESOURCE_COUNT } from '~/sim/economy/Resource'
import type { Stockpile } from '~/sim/economy/Stockpile'
import { Army } from '~/sim/military/Army'
import { unitById } from '~/sim/military/UnitCatalogue'
import type { WorldState } from '~/sim/world/WorldState'

export class SaveFileError extends Error {
  override readonly name = 'SaveFileError'
}

const MAGIC = 0x4e525356
export const CURRENT_VERSION = 1

const INITIAL_CAPACITY = 4096

/*
 * Simpanan biner bernomor versi. Berkas dunia sudah memegang semua yang statis,
 * sehingga simpanan hanya perlu apa yang berubah: penguasaan, moral, cadangan,
 * hubungan, pasukan, dan jam. Simpanannya jadi kecil dan tetap bisa dibuka
 * setelah peta dibangun ulang selama jumlah provinsinya sama.
 *
 * Berbeda dari versi C# yang menerima dan mengembalikan Stream, di sini
 * masukan dan keluarannya ArrayBuffer. Simulasi harus bisa berjalan di Worker
 * peramban tempat berkas tidak ada, jadi I/O ditinggalkan ke pemanggil — sama
 * seperti pembaca berkas dunia.
 *
 * Tata letak bitanya sengaja identik dengan yang ditulis BinaryWriter di jalur
 * C#, termasuk awalan panjang string tujuh-bit, supaya simpanan dari kedua
 * implementasi bisa saling dibaca.
 */

export interface SavedUnit {
  readonly classId: string
  readonly hitPoints: number
}

export interface SavedArmy {
  readonly id: number
  readonly nation: number
  readonly province: number
  readonly units: readonly SavedUnit[]
}

/* Pasangan negara yang berperang. Tuple C# `(int A, int B)` tidak punya
   padanan bernama di TypeScript, dan larik dua elemen menghilangkan nama
   medannya di setiap tempat pemakaian. */
export interface WarPair {
  readonly a: number
  readonly b: number
}

export interface SaveState {
  /* bigint, bukan number: seed adalah 64 bit penuh dan number hanya eksak
     sampai 2^53. Seed yang kehilangan bit membuat simpanan mustahil diputar
     ulang, dan tidak ada yang menandainya saat itu terjadi. */
  readonly seed: bigint
  readonly tick: number
  readonly playerNation: number
  readonly controller: Uint16Array
  readonly morale: Float32Array
  readonly nationCount: number
  readonly stockpiles: Float64Array
  readonly wars: readonly WarPair[]
  readonly armies: readonly SavedArmy[]
}

/*
 * Kursor tulis yang tumbuh sendiri. Panjang berkas baru diketahui setelah
 * pasukan dan perangnya ditelusuri, dan menghitungnya lebih dulu berarti
 * menyalin aturan tata letak ke tempat kedua yang bisa menyimpang.
 */
/*
 * Setiap penulisan memesan tempatnya lebih dulu, lalu baru menyentuh pandangan.
 *
 * Urutan itu bukan gaya. `this.#view.setUint32(this.#reserve(4), ...)` terlihat
 * benar tetapi rusak: JavaScript mengevaluasi `this.#view` sebelum menjalankan
 * argumennya, sehingga ketika reserve menumbuhkan buffer dan mengganti
 * pandangan, tulisannya mengenai pandangan lama dengan offset yang hanya sah di
 * pandangan baru. Gejalanya muncul jauh dari sebabnya, dan hanya pada simpanan
 * yang cukup besar untuk memicu pertumbuhan.
 */
class Writer {
  #buffer = new ArrayBuffer(INITIAL_CAPACITY)
  #view = new DataView(this.#buffer)
  #offset = 0

  #reserve(bytes: number): number {
    const at = this.#offset
    const needed = at + bytes

    if (needed > this.#buffer.byteLength) {
      let capacity = this.#buffer.byteLength
      while (capacity < needed) capacity *= 2

      const grown = new ArrayBuffer(capacity)
      new Uint8Array(grown).set(new Uint8Array(this.#buffer, 0, at))
      this.#buffer = grown
      this.#view = new DataView(grown)
    }

    this.#offset = needed
    return at
  }

  uint8(value: number): void {
    const at = this.#reserve(1)
    this.#view.setUint8(at, value)
  }

  uint16(value: number): void {
    const at = this.#reserve(2)
    this.#view.setUint16(at, value, true)
  }

  uint32(value: number): void {
    const at = this.#reserve(4)
    this.#view.setUint32(at, value, true)
  }

  int32(value: number): void {
    const at = this.#reserve(4)
    this.#view.setInt32(at, value, true)
  }

  uint64(value: bigint): void {
    const at = this.#reserve(8)
    this.#view.setBigUint64(at, value, true)
  }

  /* Dipotong ke arah nol, seperti cast ke long di C#. Cadangan disimpan sebagai
     number di sisi ini, jadi nilai pecahan mungkin secara tipe walau tidak
     mungkin secara aturan ekonomi; BigInt() akan melempar untuknya. */
  int64(value: number): void {
    const at = this.#reserve(8)
    this.#view.setBigInt64(at, BigInt(Math.trunc(value)), true)
  }

  /* setFloat32, bukan setFloat64: nilai float yang ditulis harus terbaca
     kembali persis sama, dan menyimpannya sebagai double lalu membacanya
     sebagai float akan menggeser bit terakhirnya. */
  float32(value: number): void {
    const at = this.#reserve(4)
    this.#view.setFloat32(at, value, true)
  }

  /* Awalan panjang tujuh-bit milik BinaryWriter: tujuh bit muatan per bita,
     bit tertinggi menandakan masih ada lanjutannya. */
  string(value: string): void {
    const bytes = new TextEncoder().encode(value)

    let remaining = bytes.length
    while (remaining >= 0x80) {
      this.uint8((remaining & 0x7f) | 0x80)
      remaining >>>= 7
    }
    this.uint8(remaining)

    for (const byte of bytes) this.uint8(byte)
  }

  finish(): ArrayBuffer {
    return this.#buffer.slice(0, this.#offset)
  }
}

class Cursor {
  #offset = 0

  constructor(private readonly view: DataView) {}

  #ensure(bytes: number): void {
    if (this.#offset + bytes > this.view.byteLength) {
      throw new SaveFileError(
        `simpanan terpotong: butuh ${bytes} bita pada offset ${this.#offset}, tersisa ${this.view.byteLength - this.#offset}`,
      )
    }
  }

  uint8(): number {
    this.#ensure(1)
    return this.view.getUint8(this.#offset++)
  }

  uint16(): number {
    this.#ensure(2)
    const value = this.view.getUint16(this.#offset, true)
    this.#offset += 2
    return value
  }

  uint32(): number {
    this.#ensure(4)
    const value = this.view.getUint32(this.#offset, true)
    this.#offset += 4
    return value
  }

  int32(): number {
    this.#ensure(4)
    const value = this.view.getInt32(this.#offset, true)
    this.#offset += 4
    return value
  }

  uint64(): bigint {
    this.#ensure(8)
    const value = this.view.getBigUint64(this.#offset, true)
    this.#offset += 8
    return value
  }

  int64(): number {
    this.#ensure(8)
    const value = this.view.getBigInt64(this.#offset, true)
    this.#offset += 8
    return Number(value)
  }

  float32(): number {
    this.#ensure(4)
    const value = this.view.getFloat32(this.#offset, true)
    this.#offset += 4
    return value
  }

  /*
   * Larik dibaca elemen per elemen lewat DataView, bukan dengan membuat
   * pandangan typed array di atas buffer: nama kelas unit panjangnya sembarang,
   * sehingga tidak ada satu pun offset sesudahnya yang dijamin kelipatan dua
   * atau empat, dan `new Float32Array(buffer, offset)` melempar untuk offset
   * yang tidak selaras.
   */
  uint16Array(count: number): Uint16Array {
    const out = new Uint16Array(count)
    for (let i = 0; i < count; i++) out[i] = this.uint16()
    return out
  }

  float32Array(count: number): Float32Array {
    const out = new Float32Array(count)
    for (let i = 0; i < count; i++) out[i] = this.float32()
    return out
  }

  string(): string {
    let length = 0
    let shift = 0

    for (;;) {
      /* Lima bita adalah batas BinaryReader untuk panjang 32 bit; melewatinya
         berarti berkasnya rusak, bukan sekadar panjang. */
      if (shift === 35) throw new SaveFileError('panjang string rusak di simpanan')

      const byte = this.uint8()
      length += (byte & 0x7f) * 2 ** shift
      shift += 7

      if ((byte & 0x80) === 0) break
    }

    this.#ensure(length)
    const bytes = new Uint8Array(this.view.buffer, this.view.byteOffset + this.#offset, length)
    const value = new TextDecoder().decode(bytes)
    this.#offset += length

    return value
  }
}

export function writeSave(state: SaveState): ArrayBuffer {
  const writer = new Writer()

  writer.uint32(MAGIC)
  writer.uint16(CURRENT_VERSION)
  writer.uint64(state.seed)
  writer.int64(state.tick)
  writer.uint16(state.playerNation)

  writer.int32(state.controller.length)
  for (const value of state.controller) writer.uint16(value)
  for (const value of state.morale) writer.float32(value)

  writer.int32(state.nationCount)
  for (const amount of state.stockpiles) writer.int64(amount)

  writer.int32(state.wars.length)
  for (const war of state.wars) {
    writer.int32(war.a)
    writer.int32(war.b)
  }

  writer.int32(state.armies.length)
  for (const army of state.armies) {
    writer.int32(army.id)
    writer.uint16(army.nation)
    writer.int32(army.province)
    writer.int32(army.units.length)

    for (const unit of army.units) {
      writer.string(unit.classId)
      writer.float32(unit.hitPoints)
    }
  }

  return writer.finish()
}

export function readSave(buffer: ArrayBuffer): SaveState {
  const cursor = new Cursor(new DataView(buffer))

  const magic = cursor.uint32()
  if (magic !== MAGIC) {
    throw new SaveFileError(`bukan berkas simpanan: magic 0x${magic.toString(16).padStart(8, '0')}`)
  }

  const version = cursor.uint16()
  if (version !== CURRENT_VERSION) {
    throw new SaveFileError(
      `versi simpanan ${version} tidak didukung (diharapkan ${CURRENT_VERSION})`,
    )
  }

  const seed = cursor.uint64()
  const tick = cursor.int64()
  const playerNation = cursor.uint16()

  const provinceCount = cursor.int32()
  const controller = cursor.uint16Array(provinceCount)
  const morale = cursor.float32Array(provinceCount)

  const nationCount = cursor.int32()
  const stockpiles = new Float64Array(nationCount * RESOURCE_COUNT)
  for (let i = 0; i < stockpiles.length; i++) stockpiles[i] = cursor.int64()

  const warCount = cursor.int32()
  const wars: WarPair[] = []
  for (let i = 0; i < warCount; i++) {
    wars.push({ a: cursor.int32(), b: cursor.int32() })
  }

  const armyCount = cursor.int32()
  const armies: SavedArmy[] = []
  for (let i = 0; i < armyCount; i++) {
    const id = cursor.int32()
    const nation = cursor.uint16()
    const province = cursor.int32()
    const unitCount = cursor.int32()

    const units: SavedUnit[] = []
    for (let u = 0; u < unitCount; u++) {
      units.push({ classId: cursor.string(), hitPoints: cursor.float32() })
    }

    armies.push({ id, nation, province, units })
  }

  return { seed, tick, playerNation, controller, morale, nationCount, stockpiles, wars, armies }
}

export function captureSave(
  world: WorldState,
  stockpile: Stockpile,
  relations: Relations,
  armies: ReadonlyMap<number, Army>,
  playerNation: number,
): SaveState {
  const wars: WarPair[] = []
  for (let a = 0; a < relations.nationCount; a++) {
    for (let b = a + 1; b < relations.nationCount; b++) {
      if (relations.atWar(a, b)) wars.push({ a, b })
    }
  }

  const saved: SavedArmy[] = []
  for (const army of armies.values()) {
    if (army.isDestroyed) continue

    saved.push({
      id: army.id,
      nation: army.nation,
      province: army.province,
      units: army.units.map((unit) => ({
        classId: unit.unitClass.id,
        hitPoints: unit.hitPoints,
      })),
    })
  }

  const stockpiles = new Float64Array(world.nations.count * RESOURCE_COUNT)
  for (let nation = 0; nation < world.nations.count; nation++) {
    for (const resource of ALL_RESOURCES) {
      stockpiles[nation * RESOURCE_COUNT + resource] = stockpile.get(nation, resource)
    }
  }

  return {
    seed: world.random.seed,
    tick: world.clock.tick,
    playerNation,
    controller: world.provinces.controller.slice(),
    morale: world.provinces.morale.slice(),
    nationCount: world.nations.count,
    stockpiles,
    wars,
    armies: saved,
  }
}

export function restoreSave(
  state: SaveState,
  world: WorldState,
  stockpile: Stockpile,
  relations: Relations,
  armies: Map<number, Army>,
): void {
  if (state.controller.length !== world.provinces.count) {
    throw new SaveFileError(
      `simpanan memuat ${state.controller.length} provinsi sementara petanya punya ${world.provinces.count}`,
    )
  }

  world.provinces.controller.set(state.controller)
  world.provinces.morale.set(state.morale)
  world.clock.restoreTo(state.tick)

  /* Selisih, bukan penetapan: Stockpile tidak memberi cara menetapkan saldo,
     dan menambahkannya membuat aturan "tidak pernah negatif" tetap berjalan
     lewat satu pintu yang sama. */
  for (let nation = 0; nation < state.nationCount && nation < world.nations.count; nation++) {
    for (const resource of ALL_RESOURCES) {
      const target = state.stockpiles[nation * RESOURCE_COUNT + resource]!
      stockpile.add(nation, resource, target - stockpile.get(nation, resource))
    }
  }

  /* Damai lebih dulu di seluruh matriks: simpanan hanya membawa daftar perang,
     sehingga perang yang sudah berakhir di simpanan tetapi masih tercatat di
     dunia tujuan tidak akan pernah dicabut tanpa sapuan ini. */
  for (let a = 0; a < relations.nationCount; a++) {
    for (let b = a + 1; b < relations.nationCount; b++) {
      relations.set(a, b, Relation.Peace)
    }
  }

  for (const war of state.wars) relations.set(war.a, war.b, Relation.War)

  armies.clear()
  for (const saved of state.armies) {
    const army = new Army(saved.id, saved.nation, saved.province)
    for (const unit of saved.units) army.add(unitById(unit.classId))

    for (let i = 0; i < army.units.length; i++) {
      army.units[i]!.hitPoints = saved.units[i]!.hitPoints
    }

    armies.set(army.id, army)
  }
}
