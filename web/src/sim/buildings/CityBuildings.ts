import { addF32, divF32, f32, mulF32 } from '~/sim/determinism/float32'
import { roundHalfToEven } from '~/sim/determinism/rounding'
import { costsFor, hoursFor } from '~/sim/buildings/BuildingCost'
import {
  BUILDING_COUNT,
  BuildingType,
  MAX_BUILDING_LEVEL,
  nameOf,
  productionBonus,
  slotsFor,
} from '~/sim/buildings/BuildingType'
import { Resource } from '~/sim/economy/Resource'
import type { Stockpile } from '~/sim/economy/Stockpile'
import type { WorldState } from '~/sim/world/WorldState'

export interface ConstructionOrder {
  readonly province: number
  readonly type: BuildingType
  readonly targetLevel: number
  readonly completesAtTick: number
}

export class ConstructionRejected extends Error {
  override readonly name = 'ConstructionRejected'
}

/*
 * Sisi kelangkaan yang dilihat pembangunan. Dipisahkan jadi antarmuka supaya
 * bangunan tidak menarik seluruh sistem kelangkaan ke dalam grafik impornya,
 * dan supaya gerbangnya bisa diuji tanpa memutar ekonomi sampai kehabisan.
 */
export interface ShortageGate {
  haltingResource(nation: number): Resource | null
}

/*
 * Bangunan per kota dan antrean yang mendirikannya. Satu barang dalam satu
 * waktu per kota, seperti di Conflict of Nations: batasan itulah yang mengubah
 * kota menjadi rangkaian keputusan alih-alih daftar belanja.
 */
export class CityBuildings {
  readonly #levels = new Map<number, Uint8Array>()
  readonly #queue = new Map<number, ConstructionOrder>()
  #completed: ConstructionOrder[] = []

  /* Kelangkaan menghentikan pekerjaan dimulai, tidak pernah pekerjaan yang
     sudah berjalan: pembangkit setengah jadi tidak roboh karena bajanya habis
     pagi ini, tapi tidak ada yang baru diletakkan sampai ia kembali. */
  shortage: ShortageGate | null = null

  constructor(
    private readonly world: WorldState,
    private readonly stockpile: Stockpile,
  ) {}

  get recentlyCompleted(): readonly ConstructionOrder[] {
    return this.#completed
  }

  clearCompleted(): void {
    this.#completed = []
  }

  levelOf(province: number, type: BuildingType): number {
    return this.#levels.get(province)?.[type] ?? 0
  }

  usedSlots(province: number): number {
    const levels = this.#levels.get(province)
    if (levels === undefined) return 0

    let used = 0
    for (const level of levels) {
      if (level > 0) used++
    }

    return used
  }

  isBuilding(province: number): boolean {
    return this.#queue.has(province)
  }

  orderIn(province: number): ConstructionOrder | null {
    return this.#queue.get(province) ?? null
  }

  begin(province: number, type: BuildingType): ConstructionOrder {
    if (this.world.provinces.isCity[province] === 0) {
      throw new ConstructionRejected('Only cities can build.')
    }

    if (this.#queue.has(province)) {
      throw new ConstructionRejected('That city is already building something.')
    }

    const current = this.levelOf(province, type)
    if (current >= MAX_BUILDING_LEVEL) {
      throw new ConstructionRejected(`${nameOf(type)} is already at maximum level.`)
    }

    if (
      current === 0 &&
      this.usedSlots(province) >= slotsFor(this.world.provinces.population[province]!)
    ) {
      throw new ConstructionRejected('No building slots left in that city.')
    }

    const level = current + 1
    const nation = this.world.provinces.controller[province]!

    const missing = this.shortage?.haltingResource(nation) ?? null
    if (missing !== null) {
      throw new ConstructionRejected(`Not enough ${Resource[missing]} to start new work.`)
    }

    const costs = costsFor(type, level)
    for (const cost of costs) {
      if (this.stockpile.get(nation, cost.resource) < cost.amount) {
        throw new ConstructionRejected(`Not enough ${Resource[cost.resource]}.`)
      }
    }

    for (const cost of costs) {
      this.stockpile.trySpend(nation, cost.resource, cost.amount)
    }

    /* Morale rendah memperlambat pembangunan, sehingga kota yang baru direbut
       tidak bisa diubah jadi benteng dalam semalam. */
    const morale = Math.max(this.world.provinces.morale[province]!, f32(0.25))
    const moraleFactor = divF32(1, addF32(f32(0.75), mulF32(f32(0.25), morale)))
    const hours = Math.trunc(roundHalfToEven(mulF32(hoursFor(type, level), moraleFactor)))

    const order: ConstructionOrder = {
      province,
      type,
      targetLevel: level,
      completesAtTick: this.world.clock.tick + hours,
    }

    this.#queue.set(province, order)
    return order
  }

  cancel(province: number): void {
    this.#queue.delete(province)
  }

  tick(): void {
    this.#completed = []
    if (this.#queue.size === 0) return

    /* Diurutkan menaik, bukan mengikuti urutan penyisipan: yang terakhir
       bergantung pada riwayat pembatalan dan penyelesaian, sehingga dua
       simulasi dengan state sama bisa melaporkan urutan penyelesaian berbeda. */
    const provinces = [...this.#queue.keys()].sort((a, b) => a - b)

    for (const province of provinces) {
      const order = this.#queue.get(province)!
      if (this.world.clock.tick < order.completesAtTick) continue

      let levels = this.#levels.get(province)
      if (levels === undefined) {
        levels = new Uint8Array(BUILDING_COUNT)
        this.#levels.set(province, levels)
      }

      levels[order.type] = order.targetLevel
      this.#completed.push(order)
      this.#queue.delete(province)
    }
  }

  productionMultiplier(province: number): number {
    return addF32(
      1,
      productionBonus(
        BuildingType.ArmsIndustry,
        this.levelOf(province, BuildingType.ArmsIndustry),
      ),
    )
  }
}
