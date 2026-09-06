import { describe, expect, it } from 'vitest'
import { BuildingType } from '~/sim/buildings/BuildingType'
import { CityBuildings } from '~/sim/buildings/CityBuildings'
import { readWorld } from '~/sim/data/WorldFile'
import { ALL_RESOURCES, Resource } from '~/sim/economy/Resource'
import { Stockpile } from '~/sim/economy/Stockpile'
import type { Army } from '~/sim/military/Army'
import {
  ALL_UNIT_RECIPES,
  Mobilisation,
  MobilisationRejected,
  unitRecipeFor,
} from '~/sim/military/Mobilisation'
import { unitById } from '~/sim/military/UnitCatalogue'
import { ResearchQueue } from '~/sim/research/ResearchQueue'
import { researchNodeById } from '~/sim/research/ResearchTree'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Military/MobilisationTests.cs. */

interface Harness {
  state: WorldState
  stock: Stockpile
  buildings: CityBuildings
  research: ResearchQueue
  mobilisation: Mobilisation
  nation: number
  city: number
}

function setup(rich = true): Harness {
  const state = readWorld(worldBinary()).toWorldState(1)
  const stock = new Stockpile(state.nations.count)
  const buildings = new CityBuildings(state, stock)
  const research = new ResearchQueue(state, stock, buildings)
  const mobilisation = new Mobilisation(state, stock, buildings, research)
  const nation = state.nations.indexOf('IDN')

  if (rich) {
    for (const resource of ALL_RESOURCES) stock.add(nation, resource, 10_000_000)
  }

  for (let i = 0; i < state.provinces.count; i++) {
    if (state.provinces.owner[i] !== nation || state.provinces.isCity[i] === 0) continue

    return { state, stock, buildings, research, mobilisation, nation, city: i }
  }

  throw new Error('tidak ada kota Indonesia di berkas dunia')
}

function completeBuilding(h: Harness, type: BuildingType, times = 1): void {
  for (let i = 0; i < times; i++) {
    const order = h.buildings.begin(h.city, type)
    h.state.clock.advanceTo(order.completesAtTick)
    h.buildings.tick()
  }
}

function completeResearch(h: Harness, nodeId: string): void {
  const order = h.research.start(h.nation, researchNodeById(nodeId))
  h.state.clock.advanceTo(order.completesAtTick)
  h.research.tick()
}

describe('Mobilisation', () => {
  it('mobilisasi menuntut risetnya lebih dulu', () => {
    const h = setup()
    completeBuilding(h, BuildingType.ArmyBase)

    const check = h.mobilisation.canMobilise(h.city, unitRecipeFor('motorized_infantry'))

    expect(check.ok).toBe(false)
    expect(check.reason).toContain('Requires')
  })

  it('mobilisasi menuntut bangunan yang tepat', () => {
    const h = setup()
    completeResearch(h, 'motorized_1')

    const check = h.mobilisation.canMobilise(h.city, unitRecipeFor('motorized_infantry'))

    expect(check.ok).toBe(false)
    expect(check.reason).toContain('Army Base')
  })

  it('unitnya muncul setelah mobilisasi selesai', () => {
    const h = setup()
    completeResearch(h, 'motorized_1')
    completeBuilding(h, BuildingType.ArmyBase)

    const armies = new Map<number, Army>()
    let nextId = 1

    const order = h.mobilisation.begin(h.city, unitRecipeFor('motorized_infantry'))
    expect(h.mobilisation.isMobilising(h.city)).toBe(true)
    expect(armies.size).toBe(0)

    h.state.clock.advanceTo(order.completesAtTick)
    nextId = h.mobilisation.tick(armies, nextId)

    expect(armies.size).toBe(1)
    expect([...armies.values()][0]!.province).toBe(h.city)
    expect([...armies.values()][0]!.nation).toBe(h.nation)
    expect(h.mobilisation.isMobilising(h.city)).toBe(false)
  })

  it('mobilisasi membelanjakan manpower', () => {
    const h = setup()
    completeResearch(h, 'motorized_1')
    completeBuilding(h, BuildingType.ArmyBase)

    const before = h.stock.get(h.nation, Resource.Manpower)
    h.mobilisation.begin(h.city, unitRecipeFor('motorized_infantry'))

    expect(h.stock.get(h.nation, Resource.Manpower)).toBeLessThan(before)
  })

  it('negara miskin tidak bisa memobilisasi', () => {
    const h = setup(false)

    const check = h.mobilisation.canMobilise(h.city, unitRecipeFor('motorized_infantry'))

    expect(check.ok).toBe(false)
    expect(check.reason.trim()).not.toBe('')
  })

  it('kota yang diduduki tidak bisa memobilisasi', () => {
    const h = setup()
    completeResearch(h, 'motorized_1')
    completeBuilding(h, BuildingType.ArmyBase)

    h.state.provinces.controller[h.city] = h.nation + 1

    const check = h.mobilisation.canMobilise(h.city, unitRecipeFor('motorized_infantry'))

    expect(check.ok).toBe(false)
    expect(check.reason).toContain('Occupied')
  })

  it('kantor rekrutmen mempercepat mobilisasi', () => {
    const slow = setup()
    completeResearch(slow, 'motorized_1')
    completeBuilding(slow, BuildingType.ArmyBase)
    const slowTicks =
      slow.mobilisation.begin(slow.city, unitRecipeFor('motorized_infantry')).completesAtTick -
      slow.state.clock.tick

    const fast = setup()
    completeResearch(fast, 'motorized_1')
    completeBuilding(fast, BuildingType.ArmyBase)
    completeBuilding(fast, BuildingType.RecruitingOffice, 3)
    const fastTicks =
      fast.mobilisation.begin(fast.city, unitRecipeFor('motorized_infantry')).completesAtTick -
      fast.state.clock.tick

    expect(fastTicks).toBeLessThan(slowTicks)
  })

  it('unit baru bergabung dengan garnisun yang sudah ada', () => {
    const h = setup()
    completeResearch(h, 'motorized_1')
    completeBuilding(h, BuildingType.ArmyBase)

    const armies = new Map<number, Army>()
    let nextId = 1

    for (let i = 0; i < 3; i++) {
      const order = h.mobilisation.begin(h.city, unitRecipeFor('motorized_infantry'))
      h.state.clock.advanceTo(order.completesAtTick)
      nextId = h.mobilisation.tick(armies, nextId)
    }

    expect(armies.size).toBe(1)
    expect([...armies.values()][0]!.count).toBe(3)
  })

  it('satu kota memobilisasi satu barang dalam satu waktu', () => {
    const h = setup()
    completeResearch(h, 'motorized_1')
    completeBuilding(h, BuildingType.ArmyBase)

    h.mobilisation.begin(h.city, unitRecipeFor('motorized_infantry'))

    expect(() => h.mobilisation.begin(h.city, unitRecipeFor('motorized_infantry'))).toThrow(
      MobilisationRejected,
    )
  })

  /*
   * Tidak ada uji C# yang memaku durasinya, jadi angka ini diambil dengan
   * menjalankan Mobilisation rujukan pada susunan yang sama, bukan dihitung
   * ulang di sini.
   *
   * Kantor rekrutmen tingkat empat adalah kasus penentu: 20 jam dikali 1/1,6
   * mendarat persis di 12,5, dan MathF.Round membulatkan setengah ke genap
   * sehingga hasilnya 12. Math.round memberi 13 dan port itu akan menyimpang.
   */
  it.each([
    [0, 20],
    [1, 17],
    [2, 15],
    [3, 14],
    [4, 12],
    [5, 11],
  ])('kantor rekrutmen tingkat %i memberi durasi yang persis', (level, expectedHours) => {
    const h = setup()
    completeResearch(h, 'motorized_1')
    completeBuilding(h, BuildingType.ArmyBase)
    if (level > 0) completeBuilding(h, BuildingType.RecruitingOffice, level)

    const order = h.mobilisation.begin(h.city, unitRecipeFor('motorized_infantry'))

    expect(order.completesAtTick - h.state.clock.tick).toBe(expectedHours)
  })

  it('setiap resep menunjuk riset dan unit yang sungguh ada', () => {
    for (const recipe of ALL_UNIT_RECIPES) {
      expect(unitById(recipe.unitClassId)).toBeDefined()
      expect(researchNodeById(recipe.requiresResearch)).toBeDefined()
      expect(recipe.cost.length).toBeGreaterThan(0)
      expect(recipe.hours).toBeGreaterThan(0)
    }
  })
})
