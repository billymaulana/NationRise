import type { ResourceCost } from '~/sim/buildings/BuildingCost'
import { BuildingType } from '~/sim/buildings/BuildingType'
import { Resource } from '~/sim/economy/Resource'

export enum ResearchBranch {
  Infantry = 0,
  Armour = 1,
  Support = 2,
  Air = 3,
  Naval = 4,
  Doctrine = 5,
}

export interface ResearchNode {
  readonly id: string
  readonly name: string
  readonly branch: ResearchBranch
  readonly tier: number
  readonly availableFromDay: number
  readonly hours: number
  readonly cost: readonly ResourceCost[]
  readonly requires: string | null
  readonly requiresBuilding: BuildingType | null
  readonly requiredBuildingLevel: number
}

interface NodeGates {
  readonly requires?: string
  readonly requiresBuilding?: BuildingType
  readonly requiredBuildingLevel?: number
}

function cost(food: number, rare: number, money: number, technology = 0): readonly ResourceCost[] {
  return technology > 0
    ? [
        { resource: Resource.Food, amount: food },
        { resource: Resource.RareResources, amount: rare },
        { resource: Resource.Technology, amount: technology },
        { resource: Resource.Money, amount: money },
      ]
    : [
        { resource: Resource.Food, amount: food },
        { resource: Resource.RareResources, amount: rare },
        { resource: Resource.Money, amount: money },
      ]
}

function node(
  id: string,
  name: string,
  branch: ResearchBranch,
  tier: number,
  availableFromDay: number,
  hours: number,
  nodeCost: readonly ResourceCost[],
  gates: NodeGates = {},
): ResearchNode {
  return {
    id,
    name,
    branch,
    tier,
    availableFromDay,
    hours,
    cost: nodeCost,
    requires: gates.requires ?? null,
    requiresBuilding: gates.requiresBuilding ?? null,
    requiredBuildingLevel: gates.requiredBuildingLevel ?? 0,
  }
}

/*
 * Riset digerbangi hari permainan sekaligus prasyarat, dan itulah yang menjaga
 * setiap kampanye berada di busur yang sebanding: pemain tidak bisa berlari ke
 * perlengkapan akhir perang pada hari ketiga sekaya apa pun dia.
 */
export const ALL_RESEARCH_NODES: readonly ResearchNode[] = [
  node('motorized_1', 'Motorized Infantry', ResearchBranch.Infantry, 1, 1, 6,
    cost(1075, 1325, 1500)),
  node('motorized_2', 'Motorized Infantry II', ResearchBranch.Infantry, 2, 7, 12,
    cost(1500, 1850, 2100), { requires: 'motorized_1' }),
  node('mechanized_1', 'Mechanized Infantry', ResearchBranch.Infantry, 1, 2, 8,
    cost(1200, 1500, 1750), { requiresBuilding: BuildingType.ArmyBase, requiredBuildingLevel: 2 }),
  node('naval_infantry', 'Naval Infantry', ResearchBranch.Infantry, 2, 4, 10,
    cost(1300, 1600, 1900), { requiresBuilding: BuildingType.NavalBase, requiredBuildingLevel: 2 }),

  node('tank_1', 'Main Battle Tank', ResearchBranch.Armour, 1, 5, 14,
    cost(1600, 1900, 2400), { requiresBuilding: BuildingType.ArmyBase, requiredBuildingLevel: 2 }),
  node('tank_2', 'Main Battle Tank II', ResearchBranch.Armour, 2, 13, 24,
    cost(2200, 2600, 3200), { requires: 'tank_1' }),

  node('artillery_1', 'Towed Artillery', ResearchBranch.Support, 1, 3, 8,
    cost(1100, 1350, 1600), { requiresBuilding: BuildingType.ArmyBase, requiredBuildingLevel: 1 }),
  node('mobile_artillery', 'Mobile Artillery', ResearchBranch.Support, 2, 9, 16,
    cost(1700, 2000, 2400), { requires: 'artillery_1' }),

  node('fighter_1', 'Air Superiority Fighter', ResearchBranch.Air, 1, 6, 18,
    cost(1900, 1900, 4000, 900),
    { requiresBuilding: BuildingType.AirBase, requiredBuildingLevel: 1 }),
  node('strike_fighter', 'Strike Fighter', ResearchBranch.Air, 2, 10, 22,
    cost(2100, 2100, 4400, 1100), { requires: 'fighter_1' }),

  node('corvette', 'Corvette', ResearchBranch.Naval, 1, 4, 12,
    cost(1400, 1500, 2000), { requiresBuilding: BuildingType.NavalBase, requiredBuildingLevel: 2 }),
  node('destroyer', 'Destroyer', ResearchBranch.Naval, 2, 11, 20,
    cost(2000, 2200, 3000, 800), { requires: 'corvette' }),

  node('logistics', 'Field Logistics', ResearchBranch.Doctrine, 1, 8, 16,
    cost(1500, 1700, 2600)),
  node('entrenchment', 'Entrenchment Doctrine', ResearchBranch.Doctrine, 1, 5, 12,
    cost(1200, 1400, 2000)),
]

export function researchNodeById(id: string): ResearchNode {
  const found = ALL_RESEARCH_NODES.find((n) => n.id === id)
  if (found === undefined) {
    throw new Error(`Unknown research node '${id}'.`)
  }

  return found
}
