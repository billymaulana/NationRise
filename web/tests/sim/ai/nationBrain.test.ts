import { describe, expect, it } from 'vitest'
import { Archetype } from '~/sim/ai/Archetype'
import { Momentum } from '~/sim/ai/Momentum'
import { NationBrain } from '~/sim/ai/NationBrain'
import { readWorld } from '~/sim/data/WorldFile'
import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { Relations } from '~/sim/diplomacy/Relation'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Ai/AiTests.cs. */

function brainFor(seed: number): NationBrain {
  const state = readWorld(worldBinary()).toWorldState(seed)
  return new NationBrain(
    state,
    new Relations(state.nations.count),
    new Momentum(),
    new DeterministicRandom(seed),
  )
}

function assign(seed: number): Archetype[] {
  const brain = brainFor(seed)
  brain.assignArchetypes()
  return Array.from({ length: 40 }, (_, i) => brain.archetypeOf(i))
}

describe('NationBrain', () => {
  it('penetapan kepribadian bersifat deterministik', () => {
    expect(assign(20260906)).toEqual(assign(20260906))
    expect(assign(20260906)).not.toEqual(assign(1))
  })

  it('negara besar cenderung ekspansionis', () => {
    const data = readWorld(worldBinary())
    const state = data.toWorldState(1)
    const brain = new NationBrain(
      state,
      new Relations(state.nations.count),
      new Momentum(),
      new DeterministicRandom(1),
    )

    brain.assignArchetypes()

    const counts = new Map<Archetype, number>()
    for (let i = 0; i < state.nations.count; i++) {
      const archetype = brain.archetypeOf(i)
      counts.set(archetype, (counts.get(archetype) ?? 0) + 1)
    }

    expect(counts.size).toBeGreaterThanOrEqual(4)
    for (const count of counts.values()) expect(count).toBeGreaterThan(0)
  })

  /* Tanpa graf provinsi tidak ada tetangga, dan tanpa tetangga tidak ada
     keputusan sama sekali. Cabang itu mudah terlewat karena kelasnya tetap
     berjalan tanpa galat. */
  it('tanpa graf tidak ada keputusan', () => {
    const brain = brainFor(1)
    brain.assignArchetypes()
    brain.think(0, 0)

    expect(brain.lastDecisions).toHaveLength(0)
  })

  it('dengan graf, keputusan membawa pertimbangan yang menghasilkannya', () => {
    const data = readWorld(worldBinary())
    const state = data.toWorldState(1)
    const brain = new NationBrain(
      state,
      new Relations(state.nations.count),
      new Momentum(),
      new DeterministicRandom(1),
    )

    brain.graph = data.land
    brain.assignArchetypes()

    const indonesia = state.nations.indexOf('IDN')
    brain.think(indonesia, 0)

    expect(brain.lastDecisions.length).toBeLessThanOrEqual(1)

    for (const decision of brain.lastDecisions) {
      expect(decision.considerations.map((c) => c.name)).toEqual([
        'relative strength',
        'territory on offer',
        'unfulfilled claims',
        'target already at war',
        'cost of war',
      ])
      expect(decision.subject).not.toBe(indonesia)
    }
  })

  it('keputusan yang sama berulang untuk seed yang sama', () => {
    const run = (): string => {
      const data = readWorld(worldBinary())
      const state = data.toWorldState(7)
      const brain = new NationBrain(
        state,
        new Relations(state.nations.count),
        new Momentum(),
        new DeterministicRandom(7),
      )

      brain.graph = data.land
      brain.assignArchetypes()
      brain.think(state.nations.indexOf('IDN'), 0)

      return JSON.stringify(brain.lastDecisions)
    }

    expect(run()).toBe(run())
  })
})
