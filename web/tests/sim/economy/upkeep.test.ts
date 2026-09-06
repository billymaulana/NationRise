import { describe, expect, it } from 'vitest'
import { CityBuildings } from '~/sim/buildings/CityBuildings'
import { BuildingType } from '~/sim/buildings/BuildingType'
import { readWorld } from '~/sim/data/WorldFile'
import { Resource } from '~/sim/economy/Resource'
import { Stockpile } from '~/sim/economy/Stockpile'
import { dailyBuildingCost, dailyUnitCost, UpkeepSystem } from '~/sim/economy/Upkeep'
import { Army } from '~/sim/military/Army'
import type { UnitClass } from '~/sim/military/UnitClass'
import {
  CORVETTE,
  DESTROYER,
  MAIN_BATTLE_TANK,
  MECHANIZED_INFANTRY,
  MOTORIZED_INFANTRY,
  NAVAL_INFANTRY,
  TOWED_ARTILLERY,
} from '~/sim/military/UnitCatalogue'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/*
 * Diport dari NationRise.Core.Tests/Economy/UpkeepTests.cs.
 *
 * Sebelum upkeep ada, ekonominya tidak punya saluran keluar sama sekali:
 * cadangan naik tanpa batas, pasar tidak punya apa pun untuk diarbitrase, dan
 * aturan kelangkaan tidak pernah bisa menyala. Uji ini ada supaya keadaan itu
 * tidak bisa kembali.
 */
interface Harness {
  state: WorldState
  stock: Stockpile
  buildings: CityBuildings
  upkeep: UpkeepSystem
  nation: number
}

function setup(): Harness {
  const state = readWorld(worldBinary()).toWorldState(1)
  const stock = new Stockpile(state.nations.count)
  const buildings = new CityBuildings(state, stock)

  return {
    state,
    stock,
    buildings,
    upkeep: new UpkeepSystem(state, stock, buildings),
    nation: state.nations.indexOf('IDN'),
  }
}

function stack(id: number, nation: number, province: number, ...units: UnitClass[]): Army {
  const army = new Army(id, nation, province)
  for (const unit of units) army.add(unit)
  return army
}

describe('biaya harian per unit', () => {
  it('setiap unit darat berbiaya uang dan pangan tiap hari', () => {
    expect(dailyUnitCost(MOTORIZED_INFANTRY, Resource.Money)).toBeGreaterThan(0)
    expect(dailyUnitCost(MOTORIZED_INFANTRY, Resource.Food)).toBeGreaterThan(0)
  })

  /* Kapal perang adalah kota yang mengapung; ia tidak seharusnya sama mahalnya
     dengan satu kompi senapan. */
  it('kapal lebih mahal dioperasikan daripada infanteri', () => {
    expect(dailyUnitCost(DESTROYER, Resource.Money)).toBeGreaterThan(
      dailyUnitCost(MOTORIZED_INFANTRY, Resource.Money),
    )
  })

  it('pasukan berjalan kaki membakar bahan bakar lebih sedikit daripada kendaraan', () => {
    expect(dailyUnitCost(MAIN_BATTLE_TANK, Resource.Fuel)).toBeGreaterThan(
      dailyUnitCost(MOTORIZED_INFANTRY, Resource.Fuel),
    )
  })

  /*
   * Tabel biaya penuh, diambil dengan menjalankan UnitUpkeep.DailyCost pada
   * implementasi rujukan, bukan dihitung ulang di sini.
   *
   * Tabel ini memaku pembulatan bankirnya: menukar roundHalfToEven dengan
   * Math.round memerahkan empat baris. Ia TIDAK memaku bahwa `bulk` memakai
   * pembagian dan bukan perkalian dengan 0,05 — keduanya berbeda bit hanya
   * untuk hit point tertentu (18 salah satunya), dan tidak ada unit di katalog
   * yang punya nilai itu. Pembagian dipakai karena setia pada sumbernya, bukan
   * karena uji ini bisa membuktikannya.
   */
  it.each([
    ['Motorized Infantry', MOTORIZED_INFANTRY, 52, 38, 15, 0],
    ['Mechanized Infantry', MECHANIZED_INFANTRY, 88, 62, 88, 15],
    ['Main Battle Tank', MAIN_BATTLE_TANK, 158, 112, 158, 27],
    ['Towed Artillery', TOWED_ARTILLERY, 42, 30, 42, 7],
    ['Naval Infantry', NAVAL_INFANTRY, 66, 48, 19, 0],
    ['Corvette', CORVETTE, 210, 38, 105, 18],
    ['Destroyer', DESTROYER, 315, 56, 158, 27],
  ] as const)('biaya harian %s cocok dengan implementasi rujukan', (_name, unit, money, food, fuel, materials) => {
    expect(dailyUnitCost(unit, Resource.Money)).toBe(money)
    expect(dailyUnitCost(unit, Resource.Food)).toBe(food)
    expect(dailyUnitCost(unit, Resource.Fuel)).toBe(fuel)
    expect(dailyUnitCost(unit, Resource.Materials)).toBe(materials)
  })

  it('sumber daya di luar empat itu tidak berbiaya', () => {
    expect(dailyUnitCost(DESTROYER, Resource.Technology)).toBe(0)
    expect(dailyUnitCost(DESTROYER, Resource.Manpower)).toBe(0)
    expect(dailyUnitCost(DESTROYER, Resource.RareResources)).toBe(0)
  })

  it('kru bangunan dibayar menurut tingkatnya', () => {
    expect(dailyBuildingCost(BuildingType.ArmyBase, 2, Resource.Money)).toBe(200)
    expect(dailyBuildingCost(BuildingType.ArmyBase, 2, Resource.Food)).toBe(0)
  })
})

describe('UpkeepSystem', () => {
  it('sehari upkeep benar-benar keluar dari cadangan', () => {
    const h = setup()
    h.stock.add(h.nation, Resource.Money, 1_000_000)

    const armies = new Map([[1, stack(1, h.nation, 0, MOTORIZED_INFANTRY, MAIN_BATTLE_TANK)]])

    const before = h.stock.get(h.nation, Resource.Money)
    const bill = h.upkeep.dailyCostOf(h.nation, Resource.Money, armies)

    h.upkeep.runDay(armies)

    expect(bill).toBeGreaterThan(0)
    expect(h.stock.get(h.nation, Resource.Money)).toBe(before - bill)
  })

  it('biaya yang dilaporkan sama dengan yang ditagihkan', () => {
    const h = setup()
    h.stock.add(h.nation, Resource.Food, 1_000_000)

    const armies = new Map([
      [1, stack(1, h.nation, 0, MOTORIZED_INFANTRY, MOTORIZED_INFANTRY)],
    ])

    const reported = h.upkeep.dailyCostOf(h.nation, Resource.Food, armies)
    const before = h.stock.get(h.nation, Resource.Food)

    h.upkeep.runDay(armies)

    expect(before - h.stock.get(h.nation, Resource.Food)).toBe(reported)
  })

  /* Tagihan yang tidak terjangkau tidak boleh mendorong cadangan di bawah nol:
     setiap pembacaan sesudahnya akan kehilangan makna, dan kelangkaan adalah
     hasil yang menarik, bukan angka negatif. */
  it('tagihan yang tidak terjangkau mengosongkan simpanan dan dicatat', () => {
    const h = setup()
    h.stock.add(h.nation, Resource.Money, 50)

    const armies = new Map([[1, stack(1, h.nation, 0, DESTROYER, DESTROYER)]])

    const bill = h.upkeep.dailyCostOf(h.nation, Resource.Money, armies)
    h.upkeep.runDay(armies)

    expect(bill).toBeGreaterThan(50)
    expect(h.stock.get(h.nation, Resource.Money)).toBe(0)
    expect(h.upkeep.shortfallOf(h.nation, Resource.Money)).toBe(bill - 50)
    expect(h.upkeep.isStarved(h.nation)).toBe(true)
  })

  it('negara tanpa pasukan dan tanpa bangunan tidak membayar apa pun', () => {
    const h = setup()
    const empty = h.state.nations.indexOf('BRA')

    expect(h.upkeep.dailyCostOf(empty, Resource.Money, new Map())).toBe(0)
  })

  it('bangunan menambah tagihan harian', () => {
    const h = setup()

    let city = -1
    for (let i = 0; i < h.state.provinces.count && city < 0; i++) {
      if (h.state.provinces.controller[i] === h.nation && h.state.provinces.isCity[i] !== 0) {
        city = i
      }
    }

    expect(city).toBeGreaterThanOrEqual(0)

    const none = new Map<number, Army>()
    const before = h.upkeep.dailyCostOf(h.nation, Resource.Money, none)

    for (const resource of [
      Resource.Money,
      Resource.Materials,
      Resource.Food,
      Resource.Fuel,
      Resource.Technology,
      Resource.RareResources,
    ]) {
      h.stock.add(h.nation, resource, 10_000_000)
    }

    h.buildings.begin(city, BuildingType.ArmsIndustry)
    for (let hour = 0; hour < 24 * 40; hour++) {
      h.state.clock.advance()
      h.buildings.tick()
    }

    const after = h.upkeep.dailyCostOf(h.nation, Resource.Money, none)

    expect(h.buildings.levelOf(city, BuildingType.ArmsIndustry)).toBeGreaterThan(0)
    expect(after).toBeGreaterThan(before)
  })

  it('pasukan yang hancur dan pasukan negara lain tidak ditagihkan', () => {
    const h = setup()
    const other = h.nation === 0 ? 1 : 0

    const mine = stack(1, h.nation, 0, MOTORIZED_INFANTRY)
    const foreign = stack(2, other, 0, DESTROYER, DESTROYER)

    const withForeign = new Map([
      [1, mine],
      [2, foreign],
    ])

    expect(h.upkeep.dailyCostOf(h.nation, Resource.Money, withForeign)).toBe(
      h.upkeep.dailyCostOf(h.nation, Resource.Money, new Map([[1, mine]])),
    )
  })
})
