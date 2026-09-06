import { describe, expect, it } from 'vitest'
import { readWorld, type WorldData } from '~/sim/data/WorldFile'
import {
  CUT_OFF_ATTACK,
  CUT_OFF_DEFENCE,
  SupplyStatus,
  SupplySystem,
} from '~/sim/military/SupplySystem'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/*
 * Diport dari NationRise.Core.Tests/Military/StackSupplyTests.cs.
 *
 * Pasokan provinsi menjawab "bisakah pemiliknya menahan tanah ini". Tumpukan
 * yang berdiri di tanah orang lain menanyakan hal yang berbeda, dan menjawabnya
 * dengan status provinsi memberi penyerbu logistik pembela secara cuma-cuma.
 */
interface Harness {
  state: WorldState
  data: WorldData
  supply: SupplySystem
  owner: number
}

let cached: WorldData | null = null

function setup(): Harness {
  cached ??= readWorld(worldBinary())
  const data = cached
  const state = data.toWorldState(1)
  const supply = new SupplySystem(state, data.land, data.sea)
  supply.recomputeAll()

  return { state, data, supply, owner: state.nations.indexOf('IDN') }
}

function homeProvinceOf(h: Harness, nation: number): number {
  for (let i = 0; i < h.state.provinces.count; i++) {
    if (h.state.provinces.controller[i] === nation && h.supply.statusOf(i) === SupplyStatus.Supplied) {
      return i
    }
  }

  throw new Error('Tidak ada provinsi yang tersuplai.')
}

describe('pasokan tumpukan', () => {
  it('di tanah sendiri tumpukan memakai status provinsinya', () => {
    const h = setup()
    const home = homeProvinceOf(h, h.owner)

    expect(h.supply.statusForStackIn(h.owner, home)).toBe(h.supply.effectiveStatusOf(home))
  })

  it('penyerbu tidak mewarisi pasokan pembela', () => {
    const h = setup()
    const home = homeProvinceOf(h, h.owner)
    const stranger = h.state.nations.indexOf('BRA')

    expect(h.supply.statusOf(home)).toBe(SupplyStatus.Supplied)
    expect(h.supply.statusForStackIn(stranger, home)).toBe(SupplyStatus.CutOff)
  })

  /* Satu provinsi di seberang perbatasan masih diberi makan: hukumannya untuk
     melampaui tanah sendiri, bukan untuk menyeberanginya. */
  it('tumpukan tepat di seberang perbatasan tetap diberi makan', () => {
    const h = setup()

    let home = -1
    let abroad = -1

    for (let i = 0; i < h.state.provinces.count && abroad < 0; i++) {
      if (h.state.provinces.controller[i] !== h.owner) continue
      if (h.supply.statusOf(i) !== SupplyStatus.Supplied) continue

      for (const neighbour of h.data.land.neighboursOf(i)) {
        if (h.state.provinces.controller[neighbour] !== h.owner) {
          home = i
          abroad = neighbour
          break
        }
      }
    }

    expect(abroad).toBeGreaterThanOrEqual(0)
    expect(h.supply.statusForStackIn(h.owner, abroad)).not.toBe(SupplyStatus.CutOff)
    expect(h.supply.statusOf(home)).toBe(SupplyStatus.Supplied)
  })

  it('pengali pasokan mengikuti tumpukan, bukan tanahnya', () => {
    const h = setup()
    const home = homeProvinceOf(h, h.owner)
    const stranger = h.state.nations.indexOf('BRA')

    expect(h.supply.attackMultiplierForStackIn(h.owner, home)).toBeCloseTo(1, 3)
    expect(h.supply.attackMultiplierForStackIn(stranger, home)).toBeCloseTo(CUT_OFF_ATTACK, 3)
    expect(h.supply.defenceMultiplierForStackIn(stranger, home)).toBeCloseTo(CUT_OFF_DEFENCE, 3)
  })
})
