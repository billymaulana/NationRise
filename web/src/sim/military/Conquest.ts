import { ProvinceStatus } from '~/sim/economy/ProvinceStatus'
import { ArmourClass } from '~/sim/military/ArmourClass'
import type { Army } from '~/sim/military/Army'
import type { WorldState } from '~/sim/world/WorldState'

export interface ConquestEvent {
  readonly province: number
  readonly from: number
  readonly to: number
  readonly wasCity: boolean
}

/* Hanya infanteri yang bisa menahan sebuah provinsi: lapis baja yang berlari
   mendahului infanterinya tidak mendapat apa pun di peta, dan itulah yang
   menghalangi kolom tank membalik sebuah negara dalam sehari. */
export function canHoldGround(army: Army): boolean {
  for (const unit of army.units) {
    if (unit.unitClass.armour === ArmourClass.Infantry) return true
  }

  return false
}

export function statusAfterCapture(isOriginalOwner: boolean): ProvinceStatus {
  return isOriginalOwner ? ProvinceStatus.Homeland : ProvinceStatus.Occupied
}

/* Merebut tanah, sebagai lawan dari memenangkan pertempuran. */
export class Conquest {
  readonly #events: ConquestEvent[] = []

  constructor(private readonly world: WorldState) {}

  get recentEvents(): readonly ConquestEvent[] {
    return this.#events
  }

  clearEvents(): void {
    this.#events.length = 0
  }

  tryCapture(army: Army, defenders: Iterable<Army>): boolean {
    if (army.isDestroyed || !canHoldGround(army)) return false

    const province = army.province
    const provinces = this.world.provinces
    const current = provinces.controller[province]!

    if (current === army.nation) return false

    for (const defender of defenders) {
      if (defender.province === province && defender.nation === current && !defender.isDestroyed) {
        return false
      }
    }

    provinces.controller[province] = army.nation

    /* Moral runtuh saat direbut dan pulih perlahan, dan itulah sebabnya
       gerak maju yang cepat menghasilkan wilayah yang nyaris tidak
       menghasilkan apa pun. */
    provinces.morale[province] = 0.25

    this.#events.push({
      province,
      from: current,
      to: army.nation,
      wasCity: provinces.isCity[province] !== 0,
    })

    return true
  }
}
