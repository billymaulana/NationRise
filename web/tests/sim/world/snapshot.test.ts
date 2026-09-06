import { describe, expect, it } from 'vitest'
import { readWorld } from '~/sim/data/WorldFile'
import { type ArmyView, snapshotOf } from '~/sim/world/Snapshot'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Military/ConquestTests.cs. */
describe('WorldSnapshot', () => {
  it('hanya memaparkan keadaan yang boleh dibaca', () => {
    const state = readWorld(worldBinary()).toWorldState(1)
    const snapshot = snapshotOf(state, [
      { id: 1, nation: 0, province: 5, unitCount: 3, health: 1 },
    ])

    expect(snapshot.day).toBe(1)
    expect(snapshot.controller.length).toBe(state.provinces.count)
    expect(snapshot.armies).toHaveLength(1)
    expect(snapshot.armies[0]!.unitCount).toBe(3)
  })

  it('membawa tick dan jam dari jam dunia', () => {
    const state = readWorld(worldBinary()).toWorldState(1)
    state.clock.advanceTo(25)

    const snapshot = snapshotOf(state, [])

    expect(snapshot.tick).toBe(25)
    expect(snapshot.day).toBe(2)
    expect(snapshot.hour).toBe(1)
  })

  it('menyalin daftar pasukan alih-alih memandangnya', () => {
    const state = readWorld(worldBinary()).toWorldState(1)
    const source: ArmyView[] = [{ id: 1, nation: 0, province: 5, unitCount: 3, health: 1 }]

    const snapshot = snapshotOf(state, source)
    source.push({ id: 2, nation: 0, province: 6, unitCount: 1, health: 1 })

    expect(snapshot.armies).toHaveLength(1)
  })
})
