import { describe, expect, it } from 'vitest'
import { readWorld, type WorldData } from '~/sim/data/WorldFile'
import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { f32 } from '~/sim/determinism/float32'
import { Relation, Relations } from '~/sim/diplomacy/Relation'
import { Army } from '~/sim/military/Army'
import type { UnitClass } from '~/sim/military/UnitClass'
import { MAIN_BATTLE_TANK, MOTORIZED_INFANTRY } from '~/sim/military/UnitCatalogue'
import { WarSystem } from '~/sim/military/WarSystem'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Military/WarSystemTests.cs. */

interface Harness {
  state: WorldState
  relations: Relations
  province: number
}

let cached: WorldData | null = null

function setup(): Harness {
  cached ??= readWorld(worldBinary())

  const state = cached.toWorldState(1)
  const relations = new Relations(state.nations.count)
  const idn = state.nations.indexOf('IDN')

  for (let i = 0; i < state.provinces.count; i++) {
    if (state.provinces.owner[i] === idn) return { state, relations, province: i }
  }

  throw new Error('tidak ada provinsi Indonesia.')
}

function stack(id: number, nation: number, province: number, ...units: UnitClass[]): Army {
  const army = new Army(id, nation, province)
  for (const unit of units) army.add(unit)
  return army
}

describe('WarSystem', () => {
  it('negara yang berdamai tidak bertempur', () => {
    const { state, relations, province } = setup()
    const owner = state.provinces.controller[province]!
    const other = owner + 1

    const war = new WarSystem(state, relations, new DeterministicRandom(1))
    const armies = new Map([
      [1, stack(1, owner, province, MOTORIZED_INFANTRY)],
      [2, stack(2, other, province, MOTORIZED_INFANTRY)],
    ])

    war.tick(armies)

    expect(war.lastReports).toEqual([])
    expect(state.provinces.controller[province]).toBe(owner)
  })

  it('tumpukan bermusuhan di satu provinsi bertempur', () => {
    const { state, relations, province } = setup()
    const owner = state.provinces.controller[province]!
    const invader = owner + 1
    relations.set(owner, invader, Relation.War)

    const war = new WarSystem(state, relations, new DeterministicRandom(1))
    const armies = new Map([
      [1, stack(1, owner, province, MOTORIZED_INFANTRY)],
      [2, stack(2, invader, province, MAIN_BATTLE_TANK)],
    ])

    war.tick(armies)

    expect(war.lastReports).toHaveLength(1)
    expect(war.lastReports[0]!.damageToDefender).toBeGreaterThan(0)
  })

  it('garnisun bertahan, jadi penyerang adalah yang tidak menguasai tanah', () => {
    const { state, relations, province } = setup()
    const owner = state.provinces.controller[province]!
    const invader = owner + 1
    relations.set(owner, invader, Relation.War)

    const war = new WarSystem(state, relations, new DeterministicRandom(1))
    const armies = new Map([
      [1, stack(1, invader, province, MOTORIZED_INFANTRY)],
      [2, stack(2, owner, province, MOTORIZED_INFANTRY)],
    ])

    war.tick(armies)

    expect(war.lastReports).toHaveLength(1)
    expect(war.lastReports[0]!.attacker).toBe(invader)
    expect(war.lastReports[0]!.defender).toBe(owner)
  })

  it('penyerbu tanpa lawan merebut provinsinya', () => {
    const { state, relations, province } = setup()
    const owner = state.provinces.controller[province]!
    const invader = owner + 1
    relations.set(owner, invader, Relation.War)

    const war = new WarSystem(state, relations, new DeterministicRandom(1))
    const armies = new Map([[1, stack(1, invader, province, MOTORIZED_INFANTRY)]])

    war.tick(armies)

    expect(war.lastConquests).toHaveLength(1)
    expect(state.provinces.controller[province]).toBe(invader)
  })

  it('lapis baja sendirian tidak bisa merebut tanah', () => {
    const { state, relations, province } = setup()
    const owner = state.provinces.controller[province]!
    const invader = owner + 1
    relations.set(owner, invader, Relation.War)

    const war = new WarSystem(state, relations, new DeterministicRandom(1))
    const armies = new Map([[1, stack(1, invader, province, MAIN_BATTLE_TANK)]])

    war.tick(armies)

    expect(war.lastConquests).toEqual([])
    expect(state.provinces.controller[province]).toBe(owner)
  })

  it('penyerang akhirnya menembus dan merebut tanahnya', () => {
    const { state, relations, province } = setup()
    const owner = state.provinces.controller[province]!
    const invader = owner + 1
    relations.set(owner, invader, Relation.War)

    const war = new WarSystem(state, relations, new DeterministicRandom(3))
    const attacker = stack(
      1,
      invader,
      province,
      MOTORIZED_INFANTRY,
      MAIN_BATTLE_TANK,
      MAIN_BATTLE_TANK,
    )
    const defender = stack(2, owner, province, MOTORIZED_INFANTRY)

    const armies = new Map([
      [1, attacker],
      [2, defender],
    ])

    for (let hour = 0; hour < 200 && !defender.isDestroyed; hour++) {
      war.tick(armies)
    }

    expect(defender.isDestroyed).toBe(true)

    war.tick(armies)
    expect(state.provinces.controller[province]).toBe(invader)
  })

  /* Uji C#-nya hanya menuntut terobosan itu terjadi dalam dua ratus jam. Jam
     keberapa dan sisa kekuatan penyerangnya diambil dengan menjalankan
     implementasi rujukan: keduanya bergantung pada deret PRNG yang sama persis
     dan pada rantai float 32-bit di dalam Combat. */
  it('menembus pada jam yang sama dengan implementasi rujukan', () => {
    const { state, relations, province } = setup()
    const owner = state.provinces.controller[province]!
    const invader = owner + 1
    relations.set(owner, invader, Relation.War)

    const war = new WarSystem(state, relations, new DeterministicRandom(3))
    const attacker = stack(
      1,
      invader,
      province,
      MOTORIZED_INFANTRY,
      MAIN_BATTLE_TANK,
      MAIN_BATTLE_TANK,
    )
    const defender = stack(2, owner, province, MOTORIZED_INFANTRY)

    const armies = new Map([
      [1, attacker],
      [2, defender],
    ])

    let hours = 0
    for (; hours < 200 && !defender.isDestroyed; hours++) {
      war.tick(armies)
    }

    expect(hours).toBe(3)
    expect(attacker.count).toBe(3)
    expect(attacker.hitPoints).toBe(f32(100.13897))
  })
})
