import type { ProvinceGraph } from '~/sim/data/WorldFile'
import { addF32, f32, mulF32, subF32 } from '~/sim/determinism/float32'
import type { Relations } from '~/sim/diplomacy/Relation'
import type { Army } from '~/sim/military/Army'
import { Domain } from '~/sim/military/UnitClass'
import { NO_OWNER } from '~/sim/world/ProvinceStore'
import type { WorldState } from '~/sim/world/WorldState'

export interface BlockadeReport {
  readonly province: number
  readonly blockader: number
  readonly victim: number
  readonly fleetStrength: number
}

/* Armada yang memblokade harus melebihi apa pun yang menjaga lintasannya, atau
   satu kapal patroli bisa mencekik sebuah garis pantai. */
export const STRENGTH_RATIO = f32(2)

export const PRODUCTION_PENALTY = f32(0.5)
export const MORALE_PENALTY_PER_DAY = f32(0.03)
export const SIEGE_PROGRESS_PER_DAY = 3

const MORALE_FLOOR = f32(0.05)

/*
 * Armada yang duduk di tautan laut sebuah provinsi pesisir memutusnya dari
 * dunia. Di kepulauan inilah satu-satunya pengepungan yang ada: graf lautnya
 * cukup padat sehingga tidak ada satu pun provinsi darat yang jadi titik
 * cekik, jadi pengepungan Indonesia harus dilakukan di laut atau tidak sama
 * sekali.
 */
export class Blockade {
  readonly #blockaded: Uint8Array
  readonly #blockader: Uint16Array
  readonly #reports: BlockadeReport[] = []

  constructor(
    private readonly world: WorldState,
    private readonly relations: Relations,
    private readonly sea: ProvinceGraph,
  ) {
    this.#blockaded = new Uint8Array(world.provinces.count)
    this.#blockader = new Uint16Array(world.provinces.count)
  }

  get reports(): readonly BlockadeReport[] {
    return this.#reports
  }

  isBlockaded(province: number): boolean {
    return this.#blockaded[province] !== 0
  }

  blockaderOf(province: number): number {
    return this.#blockader[province]!
  }

  productionMultiplierFor(province: number): number {
    return this.#blockaded[province] !== 0 ? subF32(1, PRODUCTION_PENALTY) : 1
  }

  /* Pesisir berarti ia punya lintasan laut sama sekali. Provinsi pedalaman
     tidak bisa diblokade sekuat apa pun armadanya, dan itulah yang membuat
     memegang pedalaman bernilai sesuatu di sebuah kepulauan. */
  isCoastal(province: number): boolean {
    return this.sea.neighboursOf(province).length > 0
  }

  recompute(armies: ReadonlyMap<number, Army>): void {
    this.#blockaded.fill(0)
    this.#blockader.fill(NO_OWNER)
    this.#reports.length = 0

    const fleetsByProvince = new Map<number, Map<number, number>>()

    for (const army of armies.values()) {
      if (army.isDestroyed || !carriesFleet(army)) continue

      let byNation = fleetsByProvince.get(army.province)
      if (byNation === undefined) {
        byNation = new Map<number, number>()
        fleetsByProvince.set(army.province, byNation)
      }

      byNation.set(army.nation, addF32(byNation.get(army.nation) ?? 0, army.hitPoints))
    }

    for (let province = 0; province < this.world.provinces.count; province++) {
      if (!this.isCoastal(province)) continue

      const owner = this.world.provinces.controller[province]!
      if (owner === NO_OWNER) continue

      this.#evaluateCrossings(province, owner, fleetsByProvince)
    }
  }

  applyDailyEffects(): void {
    const morale = this.world.provinces.morale

    for (let province = 0; province < this.world.provinces.count; province++) {
      if (this.#blockaded[province] === 0) continue

      morale[province] = Math.max(MORALE_FLOOR, subF32(morale[province]!, MORALE_PENALTY_PER_DAY))
    }
  }

  blockadedCountOf(nation: number): number {
    let count = 0

    for (let province = 0; province < this.world.provinces.count; province++) {
      if (this.#blockaded[province] !== 0 && this.world.provinces.controller[province] === nation) {
        count++
      }
    }

    return count
  }

  /*
   * Map, bukan objek biasa: urutan sisipnya adalah urutan yang sama yang
   * dijalani Dictionary rujukan, dan penjumlahan float tidak asosiatif sehingga
   * mengubah urutannya mengubah hasilnya. Seri kekuatan juga jatuh ke armada
   * yang tercatat lebih dulu, bukan ke indeks negara terkecil.
   */
  #evaluateCrossings(
    province: number,
    owner: number,
    fleetsByProvince: ReadonlyMap<number, ReadonlyMap<number, number>>,
  ): void {
    const hostile = new Map<number, number>()
    let friendly = 0

    for (const crossing of this.sea.neighboursOf(province)) {
      const byNation = fleetsByProvince.get(crossing)
      if (byNation === undefined) continue

      for (const [nation, strength] of byNation) {
        if (nation === owner) {
          friendly = addF32(friendly, strength)
        } else if (this.relations.atWar(nation, owner)) {
          hostile.set(nation, addF32(hostile.get(nation) ?? 0, strength))
        }
      }
    }

    if (hostile.size === 0) return

    let strongest = 0
    let best = 0
    for (const [nation, strength] of hostile) {
      if (strength > best) {
        best = strength
        strongest = nation
      }
    }

    if (best < mulF32(Math.max(friendly, 1), STRENGTH_RATIO)) return

    this.#blockaded[province] = 1
    this.#blockader[province] = strongest
    this.#reports.push({
      province,
      blockader: strongest,
      victim: owner,
      fleetStrength: Math.trunc(best),
    })
  }
}

function carriesFleet(army: Army): boolean {
  for (const unit of army.units) {
    if (unit.unitClass.domain === Domain.Sea) return true
  }

  return false
}
