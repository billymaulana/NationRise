import { describe, expect, it } from 'vitest'
import { readWorld } from '~/sim/data/WorldFile'
import { ProvinceStatus } from '~/sim/economy/ProvinceStatus'
import { Army } from '~/sim/military/Army'
import { canHoldGround, Conquest, statusAfterCapture } from '~/sim/military/Conquest'
import type { UnitClass } from '~/sim/military/UnitClass'
import {
  MAIN_BATTLE_TANK,
  MOTORIZED_INFANTRY,
  NAVAL_INFANTRY,
  TOWED_ARTILLERY,
} from '~/sim/military/UnitCatalogue'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Military/ConquestTests.cs. */

interface Harness {
  state: WorldState
  province: number
}

function setup(): Harness {
  const state = readWorld(worldBinary()).toWorldState(1)
  const idn = state.nations.indexOf('IDN')

  for (let i = 0; i < state.provinces.count; i++) {
    if (state.provinces.owner[i] === idn) return { state, province: i }
  }

  throw new Error('tidak ada provinsi Indonesia.')
}

function stack(nation: number, province: number, ...units: UnitClass[]): Army {
  const army = new Army(1, nation, province)
  for (const unit of units) army.add(unit)
  return army
}

describe('Conquest', () => {
  it('infanteri bisa menahan tanah, lapis baja sendirian tidak', () => {
    expect(canHoldGround(stack(0, 0, MOTORIZED_INFANTRY))).toBe(true)
    expect(canHoldGround(stack(0, 0, NAVAL_INFANTRY))).toBe(true)
    expect(canHoldGround(stack(0, 0, MAIN_BATTLE_TANK))).toBe(false)
    expect(canHoldGround(stack(0, 0, TOWED_ARTILLERY))).toBe(false)
  })

  it('provinsi tanpa penjaga berpindah tangan', () => {
    const { state, province } = setup()
    const defender = state.provinces.controller[province]!
    const invader = defender + 1

    const conquest = new Conquest(state)
    const army = stack(invader, province, MOTORIZED_INFANTRY)

    expect(conquest.tryCapture(army, [])).toBe(true)
    expect(state.provinces.controller[province]).toBe(invader)
    expect(state.provinces.owner[province]).toBe(defender)
    expect(state.provinces.isOccupied(province)).toBe(true)
  })

  it('provinsi yang dijaga bertahan', () => {
    const { state, province } = setup()
    const owner = state.provinces.controller[province]!
    const invader = owner + 1

    const conquest = new Conquest(state)
    const attacker = stack(invader, province, MOTORIZED_INFANTRY)
    const garrison = new Army(2, owner, province)
    garrison.add(MOTORIZED_INFANTRY)

    expect(conquest.tryCapture(attacker, [garrison])).toBe(false)
    expect(state.provinces.controller[province]).toBe(owner)
  })

  it('penaklukan meruntuhkan moral', () => {
    const { state, province } = setup()
    const invader = state.provinces.controller[province]! + 1

    state.provinces.morale[province] = 0.9
    new Conquest(state).tryCapture(stack(invader, province, MOTORIZED_INFANTRY), [])

    expect(state.provinces.morale[province]).toBeCloseTo(0.25, 3)
  })

  it('penaklukan memindahkan poin kemenangan', () => {
    const { state, province } = setup()
    const owner = state.provinces.controller[province]!
    const invader = owner + 1

    const before = state.victoryPointsOf(owner)
    new Conquest(state).tryCapture(stack(invader, province, MOTORIZED_INFANTRY), [])
    const after = state.victoryPointsOf(owner)

    expect(after).toBeLessThan(before)
    expect(state.victoryPointsOf(invader)).toBeGreaterThan(0)
  })

  it('mencatat peristiwa penaklukan sampai dibersihkan', () => {
    const { state, province } = setup()
    const owner = state.provinces.controller[province]!
    const invader = owner + 1

    const conquest = new Conquest(state)
    conquest.tryCapture(stack(invader, province, MOTORIZED_INFANTRY), [])

    expect(conquest.recentEvents).toEqual([
      {
        province,
        from: owner,
        to: invader,
        wasCity: state.provinces.isCity[province] !== 0,
      },
    ])

    conquest.clearEvents()
    expect(conquest.recentEvents).toEqual([])
  })

  it('pemilik asal yang merebut kembali tanahnya kembali ke tanah air', () => {
    expect(statusAfterCapture(true)).toBe(ProvinceStatus.Homeland)
    expect(statusAfterCapture(false)).toBe(ProvinceStatus.Occupied)
  })
})
