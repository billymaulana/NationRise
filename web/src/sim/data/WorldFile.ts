import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { Resource } from '~/sim/economy/Resource'
import { GameClock } from '~/sim/time/GameClock'
import { NationStore } from '~/sim/world/NationStore'
import { ProvinceStore } from '~/sim/world/ProvinceStore'
import { WorldState } from '~/sim/world/WorldState'

export class WorldFileError extends Error {
  override readonly name = 'WorldFileError'
}

const MAGIC = 0x4e525744
const SUPPORTED_VERSION = 2
const INITIAL_MORALE = 0.7

/*
 * Pembaca biner yang dihasilkan pipeline peta. Formatnya tidak membawa
 * geometri sama sekali: simulasi tidak pernah butuh koordinat, dan
 * meninggalkannya membuat urusan penyajian mustahil menyusup lewat lapisan
 * data.
 *
 * Berbeda dari versi C# yang menerima Stream, di sini masukannya ArrayBuffer.
 * Simulasi harus bisa berjalan di Worker peramban, tempat berkas tidak ada,
 * sehingga I/O ditinggalkan ke pemanggil.
 */
class Cursor {
  #offset = 0

  constructor(private readonly view: DataView) {}

  get offset(): number {
    return this.#offset
  }

  #ensure(bytes: number): void {
    if (this.#offset + bytes > this.view.byteLength) {
      throw new WorldFileError(
        `berkas terpotong: butuh ${bytes} bita pada offset ${this.#offset}, tersisa ${this.view.byteLength - this.#offset}`,
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

  /*
   * Larik dibaca elemen per elemen lewat DataView, bukan dengan membuat
   * pandangan typed array di atas buffer. Offset di dalam berkas ini tidak
   * dijamin selaras: panjang blok tag adalah tiga bita per negara, sehingga
   * larik sesudahnya bisa mulai di alamat ganjil, dan `new Uint16Array(buffer,
   * offset)` melempar untuk offset yang tidak kelipatan dua.
   */
  bytes(count: number): Uint8Array {
    this.#ensure(count)
    const slice = new Uint8Array(this.view.buffer, this.view.byteOffset + this.#offset, count).slice()
    this.#offset += count
    return slice
  }

  uint16Array(count: number): Uint16Array {
    const out = new Uint16Array(count)
    for (let i = 0; i < count; i++) out[i] = this.uint16()
    return out
  }

  int32Array(count: number): Int32Array {
    this.#ensure(count * 4)
    const out = new Int32Array(count)
    for (let i = 0; i < count; i++) {
      out[i] = this.view.getInt32(this.#offset, true)
      this.#offset += 4
    }
    return out
  }

  float32Array(count: number): Float32Array {
    this.#ensure(count * 4)
    const out = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      out[i] = this.view.getFloat32(this.#offset, true)
      this.#offset += 4
    }
    return out
  }

  ascii(count: number): string {
    let out = ''
    for (let i = 0; i < count; i++) out += String.fromCharCode(this.uint8())
    return out.trim()
  }
}

export class ProvinceGraph {
  constructor(
    private readonly offsets: Int32Array,
    private readonly neighbours: Uint16Array,
  ) {}

  neighboursOf(province: number): Uint16Array {
    const start = this.offsets[province]!
    return this.neighbours.subarray(start, this.offsets[province + 1]!)
  }

  get edgeCount(): number {
    return this.neighbours.length / 2
  }
}

export class WorldData {
  readonly provinceCount: number

  constructor(
    readonly nationTags: string[],
    private readonly owner: Uint16Array,
    private readonly terrain: Uint8Array,
    private readonly population: Float32Array,
    private readonly cityFlags: Uint8Array,
    private readonly resource: Uint8Array,
    private readonly claimOffsets: Int32Array,
    private readonly claims: Uint16Array,
    readonly land: ProvinceGraph,
    readonly sea: ProvinceGraph,
  ) {
    this.provinceCount = owner.length
  }

  resourceOf(province: number): Resource {
    return this.resource[province]! as Resource
  }

  toWorldState(seed: bigint | number): WorldState {
    const provinces = new ProvinceStore(this.provinceCount, this.claimOffsets, this.claims)
    const nations = new NationStore(this.nationTags.length)

    for (let i = 0; i < this.nationTags.length; i++) {
      nations.tag[i] = this.nationTags[i]!
      nations.name[i] = this.nationTags[i]!
    }

    for (let i = 0; i < this.provinceCount; i++) {
      provinces.owner[i] = this.owner[i]!
      provinces.controller[i] = this.owner[i]!
      provinces.terrain[i] = this.terrain[i]!
      provinces.population[i] = this.population[i]!
      provinces.isCity[i] = this.cityFlags[i]!
      provinces.morale[i] = INITIAL_MORALE
    }

    return new WorldState(provinces, nations, new GameClock(), new DeterministicRandom(seed))
  }
}

export function readWorld(buffer: ArrayBuffer): WorldData {
  const cursor = new Cursor(new DataView(buffer))

  const magic = cursor.uint32()
  if (magic !== MAGIC) {
    throw new WorldFileError(`bukan berkas dunia: magic 0x${magic.toString(16).padStart(8, '0')}`)
  }

  const version = cursor.uint16()
  if (version !== SUPPORTED_VERSION) {
    throw new WorldFileError(
      `versi berkas dunia ${version} tidak didukung (diharapkan ${SUPPORTED_VERSION})`,
    )
  }

  const nationCount = cursor.uint16()
  const provinceCount = cursor.uint32()
  cursor.uint32() // dilewati; ruang cadangan format

  const tags: string[] = []
  for (let i = 0; i < nationCount; i++) tags.push(cursor.ascii(3))

  const owner = cursor.uint16Array(provinceCount)
  const terrain = cursor.bytes(provinceCount)
  const population = cursor.float32Array(provinceCount)
  const isCity = cursor.bytes(provinceCount)
  const resource = cursor.bytes(provinceCount)
  const claimOffsets = cursor.int32Array(provinceCount + 1)
  const claims = cursor.uint16Array(claimOffsets[provinceCount]!)

  const land = readGraph(cursor, provinceCount)
  const sea = readGraph(cursor, provinceCount)

  return new WorldData(
    tags, owner, terrain, population, isCity, resource, claimOffsets, claims, land, sea,
  )
}

function readGraph(cursor: Cursor, provinceCount: number): ProvinceGraph {
  const edgeCount = cursor.uint32()
  const offsets = cursor.int32Array(provinceCount + 1)
  const neighbours = cursor.uint16Array(edgeCount)
  return new ProvinceGraph(offsets, neighbours)
}
