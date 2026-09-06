import type { ResourceCost } from '~/sim/buildings/BuildingCost'
import { BuildingType, nameOf } from '~/sim/buildings/BuildingType'
import type { CityBuildings, ShortageGate } from '~/sim/buildings/CityBuildings'
import { addF32, divF32, f32, mulF32 } from '~/sim/determinism/float32'
import { roundHalfToEven } from '~/sim/determinism/rounding'
import { Resource } from '~/sim/economy/Resource'
import type { Stockpile } from '~/sim/economy/Stockpile'
import { Army } from '~/sim/military/Army'
import { MAX_STACK_WITHOUT_PENALTY } from '~/sim/military/Combat'
import { unitById } from '~/sim/military/UnitCatalogue'
import type { ResearchQueue } from '~/sim/research/ResearchQueue'
import { researchNodeById } from '~/sim/research/ResearchTree'
import type { WorldState } from '~/sim/world/WorldState'

export interface MobilisationOrder {
  readonly province: number
  readonly unitClassId: string
  readonly completesAtTick: number
}

export class MobilisationRejected extends Error {
  override readonly name = 'MobilisationRejected'
}

export interface UnitRecipe {
  readonly unitClassId: string
  readonly cost: readonly ResourceCost[]
  readonly hours: number
  readonly requiresResearch: string
  readonly requiresBuilding: BuildingType
  readonly requiredBuildingLevel: number
}

export interface MobilisationCheck {
  readonly ok: boolean
  readonly reason: string
}

function costs(
  food: number,
  materials: number,
  manpower: number,
  technology: number,
  money: number,
): readonly ResourceCost[] {
  return technology > 0
    ? [
        { resource: Resource.Food, amount: food },
        { resource: Resource.Materials, amount: materials },
        { resource: Resource.Manpower, amount: manpower },
        { resource: Resource.Technology, amount: technology },
        { resource: Resource.Money, amount: money },
      ]
    : [
        { resource: Resource.Food, amount: food },
        { resource: Resource.Materials, amount: materials },
        { resource: Resource.Manpower, amount: manpower },
        { resource: Resource.Money, amount: money },
      ]
}

/*
 * Mengubah cadangan menjadi pasukan. Hanya kota yang memobilisasi, dan hanya
 * kota dengan bangunan yang tepat; itulah yang membuat merebut kota bernilai
 * lebih daripada merebut tanah di sekelilingnya.
 */
export const ALL_UNIT_RECIPES: readonly UnitRecipe[] = [
  {
    unitClassId: 'motorized_infantry',
    cost: costs(650, 350, 850, 0, 1000),
    hours: 20,
    requiresResearch: 'motorized_1',
    requiresBuilding: BuildingType.ArmyBase,
    requiredBuildingLevel: 1,
  },
  {
    unitClassId: 'mechanized_infantry',
    cost: costs(500, 950, 1000, 0, 1750),
    hours: 22,
    requiresResearch: 'mechanized_1',
    requiresBuilding: BuildingType.ArmyBase,
    requiredBuildingLevel: 2,
  },
  {
    unitClassId: 'main_battle_tank',
    cost: costs(0, 1800, 700, 700, 1700),
    hours: 28,
    requiresResearch: 'tank_1',
    requiresBuilding: BuildingType.ArmyBase,
    requiredBuildingLevel: 2,
  },
  {
    unitClassId: 'towed_artillery',
    cost: costs(1000, 950, 400, 0, 1200),
    hours: 20,
    requiresResearch: 'artillery_1',
    requiresBuilding: BuildingType.ArmyBase,
    requiredBuildingLevel: 1,
  },
  {
    unitClassId: 'naval_infantry',
    cost: costs(400, 800, 850, 0, 1500),
    hours: 24,
    requiresResearch: 'naval_infantry',
    requiresBuilding: BuildingType.NavalBase,
    requiredBuildingLevel: 2,
  },
  {
    unitClassId: 'corvette',
    cost: costs(1500, 0, 400, 600, 1250),
    hours: 24,
    requiresResearch: 'corvette',
    requiresBuilding: BuildingType.NavalBase,
    requiredBuildingLevel: 2,
  },
  {
    unitClassId: 'destroyer',
    cost: costs(0, 2500, 650, 900, 1950),
    hours: 28,
    requiresResearch: 'destroyer',
    requiresBuilding: BuildingType.NavalBase,
    requiredBuildingLevel: 3,
  },
]

export function unitRecipeFor(unitClassId: string): UnitRecipe {
  const found = ALL_UNIT_RECIPES.find((recipe) => recipe.unitClassId === unitClassId)
  if (found === undefined) {
    throw new Error(`No recipe for '${unitClassId}'.`)
  }

  return found
}

export class Mobilisation {
  readonly #queue = new Map<number, MobilisationOrder>()
  #completed: MobilisationOrder[] = []

  /* Aturan yang sama dengan pembangunan: pabriknya berhenti menerima pesanan,
     unit yang sudah berada di jalur perakitan tetap keluar. */
  shortage: ShortageGate | null = null

  constructor(
    private readonly world: WorldState,
    private readonly stockpile: Stockpile,
    private readonly buildings: CityBuildings,
    private readonly research: ResearchQueue,
  ) {}

  get recentlyCompleted(): readonly MobilisationOrder[] {
    return this.#completed
  }

  isMobilising(province: number): boolean {
    return this.#queue.has(province)
  }

  orderIn(province: number): MobilisationOrder | null {
    return this.#queue.get(province) ?? null
  }

  canMobilise(province: number, recipe: UnitRecipe): MobilisationCheck {
    if (this.world.provinces.isCity[province] === 0) {
      return { ok: false, reason: 'Only cities mobilise.' }
    }

    if (this.#queue.has(province)) {
      return { ok: false, reason: 'That city is already mobilising.' }
    }

    const nation = this.world.provinces.controller[province]!

    /* Kota yang diduduki tidak bisa mengerahkan pasukan sampai dianeksasi:
       penaklukan yang langsung membiayai penaklukan berikutnya membuat momentum
       tidak terhentikan. */
    if (this.world.provinces.owner[province] !== nation) {
      return { ok: false, reason: 'Occupied cities cannot mobilise.' }
    }

    const missing = this.shortage?.haltingResource(nation) ?? null
    if (missing !== null) {
      return { ok: false, reason: `Not enough ${Resource[missing]} to start new work.` }
    }

    if (!this.research.hasCompleted(nation, recipe.requiresResearch)) {
      return { ok: false, reason: `Requires ${researchNodeById(recipe.requiresResearch).name}.` }
    }

    if (this.buildings.levelOf(province, recipe.requiresBuilding) < recipe.requiredBuildingLevel) {
      return {
        ok: false,
        reason: `Requires ${nameOf(recipe.requiresBuilding)} level ${recipe.requiredBuildingLevel}.`,
      }
    }

    for (const cost of recipe.cost) {
      if (this.stockpile.get(nation, cost.resource) < cost.amount) {
        return { ok: false, reason: `Not enough ${Resource[cost.resource]}.` }
      }
    }

    return { ok: true, reason: '' }
  }

  begin(province: number, recipe: UnitRecipe): MobilisationOrder {
    const check = this.canMobilise(province, recipe)
    if (!check.ok) throw new MobilisationRejected(check.reason)

    const nation = this.world.provinces.controller[province]!
    for (const cost of recipe.cost) {
      this.stockpile.trySpend(nation, cost.resource, cost.amount)
    }

    const recruiting = this.buildings.levelOf(province, BuildingType.RecruitingOffice)
    const speedup = divF32(1, addF32(1, mulF32(recruiting, f32(0.15))))
    const hours = Math.trunc(roundHalfToEven(mulF32(recipe.hours, speedup)))

    const order: MobilisationOrder = {
      province,
      unitClassId: recipe.unitClassId,
      completesAtTick: this.world.clock.tick + hours,
    }

    this.#queue.set(province, order)
    return order
  }

  /* Padanan parameter ref di sumbernya: id pasukan berikutnya masuk sebagai
     nilai dan keluar sebagai nilai kembalian, karena pemanggil menyimpannya
     dan angka itu tidak boleh dibagi dua salinan yang bisa menyimpang. */
  tick(armies: Map<number, Army>, nextArmyId: number): number {
    this.#completed = []
    if (this.#queue.size === 0) return nextArmyId

    let nextId = nextArmyId

    /* Diurutkan menaik, bukan mengikuti urutan penyisipan: yang terakhir
       bergantung pada riwayat penyelesaian, sehingga dua simulasi dengan state
       sama bisa memberi id pasukan yang berbeda pada kota yang sama. */
    const provinces = [...this.#queue.keys()].sort((a, b) => a - b)

    for (const province of provinces) {
      const order = this.#queue.get(province)!
      if (this.world.clock.tick < order.completesAtTick) continue

      const nation = this.world.provinces.controller[province]!
      const unitClass = unitById(order.unitClassId)

      const existing = this.#garrisonIn(armies, province, nation)

      if (existing !== null) {
        existing.add(unitClass)
      } else {
        const army = new Army(nextId++, nation, province)
        army.add(unitClass)
        armies.set(army.id, army)
      }

      this.#completed.push(order)
      this.#queue.delete(province)
    }

    return nextId
  }

  /* Unit baru bergabung dengan tumpukan yang sudah duduk di kota selama masih
     ada ruang, sehingga kota yang dijaga menumbuhkan garnisun alih-alih
     menyebarkan unit tunggal ke seluruh peta.

     Kandidatnya dipilih menurut id menaik, bukan urutan penyisipan peta:
     penyisipan bergantung pada pasukan mana yang kebetulan dihancurkan lebih
     dulu, dan tumpukan yang menerima unit menentukan siapa bertempur di mana. */
  #garrisonIn(armies: ReadonlyMap<number, Army>, province: number, nation: number): Army | null {
    const ids = [...armies.keys()].sort((a, b) => a - b)

    for (const id of ids) {
      const army = armies.get(id)!
      if (
        army.province === province &&
        army.nation === nation &&
        army.count < MAX_STACK_WITHOUT_PENALTY
      ) {
        return army
      }
    }

    return null
  }
}
