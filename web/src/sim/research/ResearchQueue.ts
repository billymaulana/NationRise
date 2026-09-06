import { type BuildingType, nameOf } from '~/sim/buildings/BuildingType'
import type { CityBuildings } from '~/sim/buildings/CityBuildings'
import { Resource } from '~/sim/economy/Resource'
import type { Stockpile } from '~/sim/economy/Stockpile'
import { ALL_RESEARCH_NODES, type ResearchNode, researchNodeById } from '~/sim/research/ResearchTree'
import type { WorldState } from '~/sim/world/WorldState'

export interface ResearchOrder {
  readonly nodeId: string
  readonly completesAtTick: number
}

export interface ResearchCheck {
  readonly ok: boolean
  readonly reason: string
}

export interface ResearchCompletion {
  readonly nation: number
  readonly nodeId: string
}

export class ResearchRejected extends Error {
  override readonly name = 'ResearchRejected'
}

/*
 * Dua slot paralel, seperti di Conflict of Nations. Batas itulah seluruh
 * rancangannya: dengan slot tanpa batas negara kaya tinggal meneliti segalanya,
 * dan cabang yang dipilih pemain berhenti berarti apa pun.
 */
export const RESEARCH_SLOTS = 2

const NOTHING_COMPLETED: ReadonlySet<string> = new Set<string>()

export class ResearchQueue {
  readonly #completed = new Map<number, Set<string>>()
  readonly #active = new Map<number, ResearchOrder[]>()
  #finishedThisTick: ResearchCompletion[] = []

  constructor(
    private readonly world: WorldState,
    private readonly stockpile: Stockpile,
    private readonly buildings: CityBuildings,
  ) {}

  get finishedThisTick(): readonly ResearchCompletion[] {
    return this.#finishedThisTick
  }

  hasCompleted(nation: number, nodeId: string): boolean {
    return this.#completed.get(nation)?.has(nodeId) ?? false
  }

  completedFor(nation: number): ReadonlySet<string> {
    return this.#completed.get(nation) ?? NOTHING_COMPLETED
  }

  activeCount(nation: number): number {
    return this.#active.get(nation)?.length ?? 0
  }

  canStart(nation: number, node: ResearchNode): ResearchCheck {
    if (this.hasCompleted(nation, node.id)) {
      return { ok: false, reason: 'Already researched.' }
    }

    if (this.activeCount(nation) >= RESEARCH_SLOTS) {
      return { ok: false, reason: 'Both research slots are busy.' }
    }

    if (this.world.clock.date.day < node.availableFromDay) {
      return { ok: false, reason: `Available from day ${node.availableFromDay}.` }
    }

    if (node.requires !== null && !this.hasCompleted(nation, node.requires)) {
      return { ok: false, reason: `Requires ${researchNodeById(node.requires).name}.` }
    }

    if (
      node.requiresBuilding !== null &&
      !this.#hasBuilding(nation, node.requiresBuilding, node.requiredBuildingLevel)
    ) {
      return {
        ok: false,
        reason: `Requires ${nameOf(node.requiresBuilding)} level ${node.requiredBuildingLevel}.`,
      }
    }

    for (const cost of node.cost) {
      if (this.stockpile.get(nation, cost.resource) < cost.amount) {
        return { ok: false, reason: `Not enough ${Resource[cost.resource]}.` }
      }
    }

    return { ok: true, reason: '' }
  }

  start(nation: number, node: ResearchNode): ResearchOrder {
    const check = this.canStart(nation, node)
    if (!check.ok) throw new ResearchRejected(check.reason)

    for (const cost of node.cost) {
      this.stockpile.trySpend(nation, cost.resource, cost.amount)
    }

    const order: ResearchOrder = {
      nodeId: node.id,
      completesAtTick: this.world.clock.tick + node.hours,
    }

    let list = this.#active.get(nation)
    if (list === undefined) {
      list = []
      this.#active.set(nation, list)
    }

    list.push(order)
    return order
  }

  tick(): void {
    this.#finishedThisTick = []
    if (this.#active.size === 0) return

    /* Diurutkan menaik, bukan mengikuti urutan penyisipan: urutan penyisipan
       bergantung pada negara mana yang kebetulan meneliti lebih dulu, sehingga
       dua simulasi dengan state sama bisa melaporkan urutan penyelesaian yang
       berbeda. */
    const nations = [...this.#active.keys()].sort((a, b) => a - b)

    for (const nation of nations) {
      const orders = this.#active.get(nation)!

      for (let i = orders.length - 1; i >= 0; i--) {
        const order = orders[i]!
        if (this.world.clock.tick < order.completesAtTick) continue

        let done = this.#completed.get(nation)
        if (done === undefined) {
          done = new Set<string>()
          this.#completed.set(nation, done)
        }

        done.add(order.nodeId)
        this.#finishedThisTick.push({ nation, nodeId: order.nodeId })
        orders.splice(i, 1)
      }
    }
  }

  availableTo(nation: number): ResearchNode[] {
    return ALL_RESEARCH_NODES.filter((node) => this.canStart(nation, node).ok)
  }

  #hasBuilding(nation: number, type: BuildingType, level: number): boolean {
    const provinces = this.world.provinces

    for (let province = 0; province < provinces.count; province++) {
      if (provinces.controller[province] !== nation) continue
      if (this.buildings.levelOf(province, type) >= level) return true
    }

    return false
  }
}
