import { describe, expect, it } from 'vitest'
import { readWorld, type WorldData } from '~/sim/data/WorldFile'
import { Relation, Relations } from '~/sim/diplomacy/Relation'
import { Blockade } from '~/sim/military/Blockade'
import { Army } from '~/sim/military/Army'
import { CORVETTE, DESTROYER, MAIN_BATTLE_TANK, MOTORIZED_INFANTRY } from '~/sim/military/UnitCatalogue'
import { Domain } from '~/sim/military/UnitClass'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Military/BlockadeTests.cs. */

interface Harness {
  state: WorldState
  data: WorldData
  relations: Relations
  blockade: Blockade
  player: number
  enemy: number
}

let cached: WorldData | null = null

function setup(): Harness {
  cached ??= readWorld(worldBinary())
  const data = cached
  const state = data.toWorldState(1)
  const relations = new Relations(state.nations.count)

  const player = state.nations.indexOf('IDN')
  const enemy = state.nations.indexOf('AUS')
  relations.set(player, enemy, Relation.War)

  return {
    state,
    data,
    relations,
    blockade: new Blockade(state, relations, data.sea),
    player,
    enemy,
  }
}

function coastalProvinceOf(h: Harness, nation: number): number {
  for (let i = 0; i < h.state.provinces.count; i++) {
    if (h.state.provinces.controller[i] === nation && h.blockade.isCoastal(i)) return i
  }

  throw new Error('Tidak ada provinsi pesisir.')
}

function fleet(id: number, nation: number, province: number, ships: number): Army {
  const army = new Army(id, nation, province)
  for (let i = 0; i < ships; i++) army.add(DESTROYER)

  return army
}

describe('Blockade', () => {
  it('tanpa armada tidak ada yang diblokade', () => {
    const h = setup()
    h.blockade.recompute(new Map())

    expect(h.blockade.reports).toHaveLength(0)
    expect(h.blockade.blockadedCountOf(h.player)).toBe(0)
  })

  it('armada musuh di sebuah lintasan memblokade pesisirnya', () => {
    const h = setup()
    const coast = coastalProvinceOf(h, h.player)
    const crossing = h.data.sea.neighboursOf(coast)[0]!

    h.blockade.recompute(new Map([[1, fleet(1, h.enemy, crossing, 3)]]))

    expect(h.blockade.isBlockaded(coast)).toBe(true)
    expect(h.blockade.blockaderOf(coast)).toBe(h.enemy)
  })

  it('negara yang berdamai tidak saling memblokade', () => {
    const h = setup()
    const peaceful = new Relations(h.state.nations.count)
    const blockade = new Blockade(h.state, peaceful, h.data.sea)

    const coast = coastalProvinceOf(h, h.player)
    const crossing = h.data.sea.neighboursOf(coast)[0]!

    blockade.recompute(new Map([[1, fleet(1, h.enemy, crossing, 5)]]))

    expect(blockade.isBlockaded(coast)).toBe(false)
  })

  /* Sebuah kapal patroli tidak boleh bisa mencekik garis pantai; penyerangnya
     harus benar-benar menguasai perairannya. */
  it('lintasan yang dijaga bertahan', () => {
    const h = setup()
    const coast = coastalProvinceOf(h, h.player)
    const crossing = h.data.sea.neighboursOf(coast)[0]!

    h.blockade.recompute(
      new Map([
        [1, fleet(1, h.enemy, crossing, 2)],
        [2, fleet(2, h.player, crossing, 2)],
      ]),
    )

    expect(h.blockade.isBlockaded(coast)).toBe(false)
  })

  it('armada yang jauh lebih besar menembus pertahanannya', () => {
    const h = setup()
    const coast = coastalProvinceOf(h, h.player)
    const crossing = h.data.sea.neighboursOf(coast)[0]!

    h.blockade.recompute(
      new Map([
        [1, fleet(1, h.enemy, crossing, 6)],
        [2, fleet(2, h.player, crossing, 2)],
      ]),
    )

    expect(h.blockade.isBlockaded(coast)).toBe(true)
  })

  it('pasukan darat tidak bisa memblokade', () => {
    const h = setup()
    const coast = coastalProvinceOf(h, h.player)
    const crossing = h.data.sea.neighboursOf(coast)[0]!

    const infantry = new Army(1, h.enemy, crossing)
    infantry.add(MOTORIZED_INFANTRY)
    infantry.add(MAIN_BATTLE_TANK)

    h.blockade.recompute(new Map([[1, infantry]]))

    expect(h.blockade.isBlockaded(coast)).toBe(false)
  })

  it('blokade memangkas produksi separuh', () => {
    const h = setup()
    const coast = coastalProvinceOf(h, h.player)
    const crossing = h.data.sea.neighboursOf(coast)[0]!

    expect(h.blockade.productionMultiplierFor(coast)).toBeCloseTo(1, 3)

    h.blockade.recompute(new Map([[1, fleet(1, h.enemy, crossing, 4)]]))

    expect(h.blockade.productionMultiplierFor(coast)).toBeCloseTo(0.5, 3)
  })

  it('blokade menggerus morale', () => {
    const h = setup()
    const coast = coastalProvinceOf(h, h.player)
    const crossing = h.data.sea.neighboursOf(coast)[0]!

    h.state.provinces.morale[coast] = Math.fround(0.9)
    h.blockade.recompute(new Map([[1, fleet(1, h.enemy, crossing, 4)]]))

    for (let day = 0; day < 10; day++) h.blockade.applyDailyEffects()

    expect(h.state.provinces.morale[coast]!).toBeLessThan(0.65)
  })

  /* Inti persoalannya di kepulauan: negara tanpa pesisir tidak bisa dicekik
     armada, sehingga tanah pedalaman tetap layak dipertahankan. */
  it('provinsi pedalaman tidak bisa diblokade', () => {
    const h = setup()

    let inland = -1
    for (let i = 0; i < h.state.provinces.count && inland < 0; i++) {
      if (!h.blockade.isCoastal(i)) inland = i
    }

    expect(inland).toBeGreaterThanOrEqual(0)
    expect(h.blockade.isBlockaded(inland)).toBe(false)
  })

  it('Indonesia sebagian besar pesisir sehingga blokade berarti', () => {
    const h = setup()

    let coastal = 0
    let total = 0

    for (let i = 0; i < h.state.provinces.count; i++) {
      if (h.state.provinces.controller[i] !== h.player) continue

      total++
      if (h.blockade.isCoastal(i)) coastal++
    }

    expect(coastal).toBeGreaterThan(total / 2)
  })

  it('kedua kapal perang berada di domain laut', () => {
    expect(CORVETTE.domain).toBe(Domain.Sea)
    expect(DESTROYER.domain).toBe(Domain.Sea)
  })
})
