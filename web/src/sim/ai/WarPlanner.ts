import { addF32, f32, mulF32, subF32 } from '~/sim/determinism/float32'
import type { ProvinceGraph } from '~/sim/data/WorldFile'
import type { Relations } from '~/sim/diplomacy/Relation'
import type { Army } from '~/sim/military/Army'
import { NO_OWNER } from '~/sim/world/ProvinceStore'
import type { WorldState } from '~/sim/world/WorldState'

export interface TargetChoice {
  readonly province: number
  readonly value: number
  readonly reason: string
}

export const CITY_WEIGHT = f32(40)
export const UNDEFENDED_WEIGHT = f32(25)
export const DISTANCE_PENALTY = f32(3)
export const FRONTLINE_WEIGHT = f32(15)

/* Pencarian jalur penuh untuk setiap provinsi kandidat akan berbiaya lebih
   besar daripada nilai keputusannya, jadi jaraknya dihitung sebagai jumlah
   lompatan yang dibatasi. */
const DISTANCE_CAP = 8

/*
 * Menentukan ke mana sebuah pasukan harus pergi setelah perang berjalan.
 *
 * Memutuskan untuk bertempur dan memutuskan di mana bertempur adalah dua
 * masalah terpisah: yang pertama diplomasi, ini operasi. Menggabungkannya
 * menghasilkan pasukan yang berbaris ke provinsi musuh mana pun yang kebetulan
 * pertama di larik.
 */
export class WarPlanner {
  constructor(
    private readonly world: WorldState,
    private readonly relations: Relations,
    private readonly land: ProvinceGraph,
  ) {}

  chooseTarget(army: Army, allArmies: ReadonlyMap<number, Army>): TargetChoice | null {
    const garrisons = new Map<number, number>()
    for (const other of allArmies.values()) {
      if (other.isDestroyed || other.nation === army.nation) continue
      garrisons.set(other.province, (garrisons.get(other.province) ?? 0) + other.count)
    }

    let best: TargetChoice | null = null
    let bestValue = Number.NEGATIVE_INFINITY

    for (let province = 0; province < this.world.provinces.count; province++) {
      const owner = this.world.provinces.controller[province]!
      if (owner === NO_OWNER || !this.relations.atWar(army.nation, owner)) continue

      const scored = this.#valueOf(province, army.province, garrisons)
      if (scored.value > bestValue) {
        bestValue = scored.value
        best = { province, value: scored.value, reason: scored.reason }
      }
    }

    return best
  }

  #valueOf(
    province: number,
    from: number,
    garrisons: ReadonlyMap<number, number>,
  ): { value: number; reason: string } {
    let value = f32(10)
    let reason = 'enemy ground'

    if (this.world.provinces.isCity[province] !== 0) {
      value = addF32(
        value,
        addF32(CITY_WEIGHT, mulF32(this.world.provinces.population[province]!, f32(4))),
      )
      reason = 'enemy city'
    }

    const defenders = garrisons.get(province) ?? 0
    if (defenders === 0) {
      value = addF32(value, UNDEFENDED_WEIGHT)
      if (reason === 'enemy ground') reason = 'undefended'
    } else {
      value = subF32(value, mulF32(defenders, f32(6)))
    }

    /* Provinsi yang berbatasan dengan tanah yang sudah dikuasai lebih berharga
       daripada hadiah jauh di dalam wilayah musuh: front yang maju bersama bisa
       dipasok, ujung tombak sendirian tidak. */
    if (this.#bordersOwnTerritory(province, this.world.provinces.controller[from]!)) {
      value = addF32(value, FRONTLINE_WEIGHT)
    }

    return {
      value: subF32(value, mulF32(this.#approximateDistance(from, province), DISTANCE_PENALTY)),
      reason,
    }
  }

  #bordersOwnTerritory(province: number, nation: number): boolean {
    for (const neighbour of this.land.neighboursOf(province)) {
      if (this.world.provinces.controller[neighbour] === nation) return true
    }

    return false
  }

  /* Pencarian melebar dengan jumlah lompatan, dibatasi. Antreannya larik dengan
     penunjuk kepala, bukan shift(): shift memindahkan seluruh isi larik setiap
     kali, dan pencarian ini dijalankan sekali per provinsi kandidat. */
  #approximateDistance(from: number, to: number): number {
    const seen = new Set<number>([from])
    const provinces: number[] = [from]
    const depths: number[] = [0]

    for (let head = 0; head < provinces.length; head++) {
      const province = provinces[head]!
      const depth = depths[head]!

      if (province === to) return depth
      if (depth >= DISTANCE_CAP) continue

      for (const neighbour of this.land.neighboursOf(province)) {
        if (seen.has(neighbour)) continue

        seen.add(neighbour)
        provinces.push(neighbour)
        depths.push(depth + 1)
      }
    }

    return DISTANCE_CAP
  }
}
