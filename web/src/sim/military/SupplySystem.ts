import type { ProvinceGraph } from '~/sim/data/WorldFile'
import { f32, mulF32 } from '~/sim/determinism/float32'
import type { Army } from '~/sim/military/Army'
import type { WorldState } from '~/sim/world/WorldState'

export enum SupplyStatus {
  Supplied = 0,
  Low = 1,
  CutOff = 2,
}

export const MODERN_RANGE = 6
export const RECOMPUTE_INTERVAL = 6
export const GRACE_TICKS = 48

export const LOW_ATTACK = f32(0.9)
export const CUT_OFF_ATTACK = f32(0.8)
export const CUT_OFF_DEFENCE = f32(0.7)
export const CUT_OFF_DAILY_ATTRITION = f32(0.01)

export const UNREACHABLE = -1

const ALL_NATIONS = -1

/*
 * Pasokan tidak lain adalah keterjangkauan di graf provinsi: tanah diberi makan
 * ketika rantai provinsi yang dikuasai negara yang sama menautkannya ke salah
 * satu kota negara itu. Pengepungan karena itu tidak pernah jadi peristiwa yang
 * diskenariokan; ia adalah bentuk yang diambil peta setelah sebuah perebutan,
 * dan banjir yang sama menghasilkannya untuk pemain maupun untuk setiap AI.
 *
 * Graf laut dilalui berdampingan dengan graf darat. Peta ini sama sekali tidak
 * punya provinsi air: lapisan lautnya adalah ketetanggaan antar provinsi darat
 * pesisir, sehingga membanjiri lewat darat saja akan mengasingkan setiap pulau
 * sepanjang permainan dan membuat kepulauan tidak bisa dimainkan. Memutus
 * sebuah pulau dari kotanya karena itu menuntut tautan lautnya sendiri, bukan
 * sekadar sebuah pantai tetangga.
 */
export class SupplySystem {
  readonly range: number

  readonly #status: Uint8Array
  readonly #statusBeforeCutOff: Uint8Array
  readonly #cutOffSince: Float64Array
  readonly #hops: Int32Array

  readonly #distance: Int32Array

  /* Antrean BFS sebagai larik datar dengan kepala berjalan. Setiap provinsi
     masuk paling banyak sekali per banjir karena jaraknya baru ditulis saat
     dimasukkan, sehingga kapasitas sebesar jumlah provinsi sudah cukup dan
     tidak ada penyalinan melingkar yang bisa mengacak urutannya. */
  readonly #frontier: Int32Array
  #frontierHead = 0
  #frontierTail = 0

  #lastComputedTick = 0

  constructor(
    private readonly world: WorldState,
    private readonly land: ProvinceGraph,
    private readonly sea: ProvinceGraph,
    range: number = MODERN_RANGE,
  ) {
    if (range < 0) {
      throw new RangeError(`jangkauan pasokan tidak boleh negatif: ${range}`)
    }

    this.range = range

    const count = world.provinces.count
    this.#status = new Uint8Array(count)
    this.#statusBeforeCutOff = new Uint8Array(count)
    this.#cutOffSince = new Float64Array(count)
    this.#hops = new Int32Array(count)
    this.#distance = new Int32Array(count)
    this.#frontier = new Int32Array(count)

    this.recomputeAll()
  }

  get lastComputedTick(): number {
    return this.#lastComputedTick
  }

  get isDue(): boolean {
    return this.world.clock.tick - this.#lastComputedTick >= RECOMPUTE_INTERVAL
  }

  statusOf(province: number): SupplyStatus {
    return this.#status[province]! as SupplyStatus
  }

  distanceToSupplyOf(province: number): number {
    return this.#hops[province]!
  }

  /*
   * Sebuah tumpukan membawa ransumnya sendiri, sehingga kehilangan jalurnya
   * belum menggigit sampai apa yang dibawanya habis. Selama jendela itu ia
   * mempertahankan kedudukan yang sudah dimilikinya alih-alih kedudukan penuh:
   * kolom yang sudah kekurangan pasokan tidak pulih dengan dikepung.
   */
  effectiveStatusOf(province: number): SupplyStatus {
    const status = this.#status[province]! as SupplyStatus
    if (status !== SupplyStatus.CutOff) return status

    return this.world.clock.tick - this.#cutOffSince[province]! >= GRACE_TICKS
      ? SupplyStatus.CutOff
      : (this.#statusBeforeCutOff[province]! as SupplyStatus)
  }

  /*
   * Pasokan untuk tumpukan yang berdiri di tanah yang tidak dikuasai negaranya.
   * Status provinsi itu sendiri menjawab pertanyaan pembela, bukan pertanyaan
   * penyerbu: brigade Australia di Jawa tidak diberi makan kota Indonesia.
   * Jalurnya berjalan mundur lewat provinsi tetangga mana pun yang dipegang
   * negaranya sendiri, dan itulah sebabnya serbuan yang melampaui rebutannya
   * kelaparan.
   */
  statusForStackIn(nation: number, province: number): SupplyStatus {
    if (this.world.provinces.controller[province] === nation) {
      return this.effectiveStatusOf(province)
    }

    let best = UNREACHABLE
    best = this.#nearestFriendlyHop(this.land.neighboursOf(province), nation, best)
    best = this.#nearestFriendlyHop(this.sea.neighboursOf(province), nation, best)

    if (best === UNREACHABLE) return SupplyStatus.CutOff

    return best + 1 <= this.range ? SupplyStatus.Supplied : SupplyStatus.Low
  }

  attackMultiplierForStackIn(nation: number, province: number): number {
    switch (this.statusForStackIn(nation, province)) {
      case SupplyStatus.Low:
        return LOW_ATTACK
      case SupplyStatus.CutOff:
        return CUT_OFF_ATTACK
      default:
        return 1
    }
  }

  defenceMultiplierForStackIn(nation: number, province: number): number {
    return this.statusForStackIn(nation, province) === SupplyStatus.CutOff ? CUT_OFF_DEFENCE : 1
  }

  graceRemainingOf(province: number): number {
    if (this.#status[province] !== SupplyStatus.CutOff) return 0

    const elapsed = this.world.clock.tick - this.#cutOffSince[province]!
    return elapsed >= GRACE_TICKS ? 0 : GRACE_TICKS - elapsed
  }

  attackMultiplierFor(province: number): number {
    switch (this.effectiveStatusOf(province)) {
      case SupplyStatus.Low:
        return LOW_ATTACK
      case SupplyStatus.CutOff:
        return CUT_OFF_ATTACK
      default:
        return 1
    }
  }

  defenceMultiplierFor(province: number): number {
    return this.effectiveStatusOf(province) === SupplyStatus.CutOff ? CUT_OFF_DEFENCE : 1
  }

  canEntrench(province: number): boolean {
    return this.effectiveStatusOf(province) === SupplyStatus.Supplied
  }

  acceptsReinforcements(province: number): boolean {
    return this.effectiveStatusOf(province) !== SupplyStatus.CutOff
  }

  dailyAttritionFor(province: number): number {
    return this.effectiveStatusOf(province) === SupplyStatus.CutOff ? CUT_OFF_DAILY_ATTRITION : 0
  }

  applyDailyAttrition(army: Army): void {
    const rate = this.dailyAttritionFor(army.province)
    if (rate <= 0) return

    for (const unit of army.units) {
      unit.applyDamage(mulF32(unit.unitClass.maxHitPoints, rate))
    }

    army.removeDestroyed()
  }

  cutOffProvincesOf(nation: number): number[] {
    const found: number[] = []

    for (let i = 0; i < this.world.provinces.count; i++) {
      if (this.world.provinces.controller[i] === nation && this.#status[i] === SupplyStatus.CutOff) {
        found.push(i)
      }
    }

    return found
  }

  /* Banjirnya O(V+E) dan garis depan tidak bergerak cukup cepat untuk mengubah
     jawabannya jam demi jam, sehingga menjalankannya pada interval dan pada
     perebutan berbiaya sepersekian dari menjalankannya tiap tick. */
  tick(): void {
    if (this.isDue) this.recomputeAll()
  }

  recomputeAll(): void {
    this.#flood(ALL_NATIONS)
    this.#commit(ALL_NATIONS)
    this.#lastComputedTick = this.world.clock.tick
  }

  recompute(nation: number): void {
    if (nation < 0 || nation >= this.world.nations.count) return

    this.#flood(nation)
    this.#commit(nation)
  }

  /* Pasokan hanya berjalan lewat tanah yang dikuasai satu negara, sehingga
     provinsi yang berpindah tangan hanya bisa mengubah dua negara yang
     terlibat: tidak pernah ada pihak ketiga yang jalurnya melewatinya. */
  onControlChanged(previousController: number, newController: number): void {
    this.recompute(previousController)

    if (newController !== previousController) this.recompute(newController)
  }

  #nearestFriendlyHop(neighbours: Uint16Array, nation: number, best: number): number {
    let nearest = best

    for (const neighbour of neighbours) {
      if (this.world.provinces.controller[neighbour] !== nation) continue

      const hops = this.#hops[neighbour]!
      if (hops !== UNREACHABLE && (nearest === UNREACHABLE || hops < nearest)) nearest = hops
    }

    return nearest
  }

  #flood(nation: number): void {
    this.#distance.fill(UNREACHABLE)
    this.#frontierHead = 0
    this.#frontierTail = 0

    const provinces = this.world.provinces
    const nations = this.world.nations.count

    for (let i = 0; i < provinces.count; i++) {
      if (provinces.isCity[i] === 0) continue

      const controller = provinces.controller[i]!
      if (controller >= nations || (nation !== ALL_NATIONS && controller !== nation)) continue

      this.#distance[i] = 0
      this.#frontier[this.#frontierTail++] = i
    }

    while (this.#frontierHead < this.#frontierTail) {
      const current = this.#frontier[this.#frontierHead++]!
      const controller = provinces.controller[current]!
      const next = this.#distance[current]! + 1

      this.#expand(this.land.neighboursOf(current), controller, next)
      this.#expand(this.sea.neighboursOf(current), controller, next)
    }
  }

  /* Menyemai kota setiap negara ke dalam satu antrean tetap benar karena sebuah
     provinsi hanya punya satu penguasa: penyaringan di bawah memecah grafnya
     menjadi komponen per negara yang terpisah, sehingga tidak ada banjir yang
     bisa bocor melintasi perbatasan dan memendekkan jarak seorang lawan. */
  #expand(neighbours: Uint16Array, controller: number, distance: number): void {
    for (const neighbour of neighbours) {
      if (this.#distance[neighbour] !== UNREACHABLE) continue
      if (this.world.provinces.controller[neighbour] !== controller) continue

      this.#distance[neighbour] = distance
      this.#frontier[this.#frontierTail++] = neighbour
    }
  }

  #commit(nation: number): void {
    const provinces = this.world.provinces

    for (let i = 0; i < provinces.count; i++) {
      if (nation !== ALL_NATIONS && provinces.controller[i] !== nation) continue

      const hops = this.#distance[i]!
      this.#hops[i] = hops

      this.#apply(
        i,
        hops === UNREACHABLE
          ? SupplyStatus.CutOff
          : hops <= this.range
            ? SupplyStatus.Supplied
            : SupplyStatus.Low,
      )
    }
  }

  #apply(province: number, status: SupplyStatus): void {
    if (status === SupplyStatus.CutOff && this.#status[province] !== SupplyStatus.CutOff) {
      this.#cutOffSince[province] = this.world.clock.tick
      this.#statusBeforeCutOff[province] = this.#status[province]!
    }

    this.#status[province] = status
  }
}
