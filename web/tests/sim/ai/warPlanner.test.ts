import { beforeEach, describe, expect, it } from 'vitest'
import { WarPlanner } from '~/sim/ai/WarPlanner'
import { readWorld, type WorldData } from '~/sim/data/WorldFile'
import { Relation, Relations } from '~/sim/diplomacy/Relation'
import { Army } from '~/sim/military/Army'
import { MAIN_BATTLE_TANK, MOTORIZED_INFANTRY } from '~/sim/military/UnitCatalogue'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Ai/WarPlannerTests.cs. */

let data: WorldData
let state: WorldState
let relations: Relations
let planner: WarPlanner
let player: number
let enemy: number

beforeEach(() => {
  data = readWorld(worldBinary())
  state = data.toWorldState(1)
  relations = new Relations(state.nations.count)

  player = state.nations.indexOf('IDN')
  enemy = state.nations.indexOf('MYS')
  relations.set(player, enemy, Relation.War)

  planner = new WarPlanner(state, relations, data.land)
})

function stack(nation: number, province: number): Army {
  const army = new Army(1, nation, province)
  army.add(MOTORIZED_INFANTRY)
  return army
}

function firstProvinceOf(nation: number): number {
  for (let i = 0; i < state.provinces.count; i++) {
    if (state.provinces.controller[i] === nation) return i
  }

  throw new Error('negara tidak memegang satu provinsi pun')
}

describe('WarPlanner', () => {
  it('tanpa perang tidak ada sasaran', () => {
    const quiet = new WarPlanner(state, new Relations(state.nations.count), data.land)

    expect(quiet.chooseTarget(stack(player, firstProvinceOf(player)), new Map())).toBeNull()
  })

  it('sasarannya milik musuh', () => {
    const choice = planner.chooseTarget(stack(player, firstProvinceOf(player)), new Map())

    expect(choice).not.toBeNull()
    expect(relations.atWar(player, state.provinces.controller[choice!.province]!)).toBe(true)
  })

  it('kota mengalahkan tanah kosong', () => {
    const choice = planner.chooseTarget(stack(player, firstProvinceOf(player)), new Map())

    expect(choice).not.toBeNull()
    expect(['enemy city', 'undefended']).toContain(choice!.reason)
  })

  it('provinsi yang dijaga bernilai lebih rendah', () => {
    const start = firstProvinceOf(player)
    const undefended = planner.chooseTarget(stack(player, start), new Map())
    expect(undefended).not.toBeNull()

    const garrison = new Army(99, enemy, undefended!.province)
    for (let i = 0; i < 8; i++) garrison.add(MAIN_BATTLE_TANK)

    const defended = planner.chooseTarget(stack(player, start), new Map([[99, garrison]]))

    expect(defended).not.toBeNull()
    expect(defended!.province).not.toBe(undefended!.province)
  })

  it('pilihannya menjelaskan dirinya sendiri', () => {
    const choice = planner.chooseTarget(stack(player, firstProvinceOf(player)), new Map())

    expect(choice).not.toBeNull()
    expect(choice!.reason.trim().length).toBeGreaterThan(0)
  })

  /* Pasukan sendiri tidak boleh dihitung sebagai garnisun musuh: kalau ia ikut,
     sebuah negara akan menghindari provinsi yang justru sedang dikuasainya. */
  it('pasukan sendiri tidak dihitung sebagai penjaga', () => {
    const start = firstProvinceOf(player)
    const alone = planner.chooseTarget(stack(player, start), new Map())

    const own = new Army(7, player, alone!.province)
    for (let i = 0; i < 8; i++) own.add(MAIN_BATTLE_TANK)

    const withOwn = planner.chooseTarget(stack(player, start), new Map([[7, own]]))

    expect(withOwn!.province).toBe(alone!.province)
  })
})
