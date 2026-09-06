import { describe, expect, it } from 'vitest'
import {
  ALL_BUILDING_TYPES,
  BUILDING_COUNT,
  BuildingType,
  MAX_BUILDING_LEVEL,
  manpowerBonus,
  moraleBonus,
  nameOf,
  productionBonus,
  requiresCoast,
  slotsFor,
} from '~/sim/buildings/BuildingType'
import { costsFor, hoursFor } from '~/sim/buildings/BuildingCost'
import { f32 } from '~/sim/determinism/float32'
import { Resource } from '~/sim/economy/Resource'

/* Diport dari NationRise.Core.Tests/Buildings/CityBuildingsTests.cs, ditambah
   tabel biaya dan durasi yang dibaca langsung dari NationRise.Core.dll. Angka
   itu hasil pembulatan float 32-bit; menghitungnya dengan double menggeser
   sebagian satu satuan. */

describe('BuildingInfo', () => {
  it('slot bertambah mengikuti populasi', () => {
    expect(slotsFor(1)).toBe(2)
    expect(slotsFor(4)).toBe(4)
    expect(slotsFor(6)).toBe(5)
    expect(slotsFor(10)).toBe(7)
    expect(slotsFor(50)).toBe(7)
  })

  it('kurva slot dipotong di dua dan di tujuh', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11].map(slotsFor)).toEqual([
      2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 7,
    ])
  })

  it('delapan bangunan berebut paling banyak tujuh slot', () => {
    expect(BUILDING_COUNT).toBe(8)
    expect(BUILDING_COUNT).toBeGreaterThan(slotsFor(10))
    expect(ALL_BUILDING_TYPES.length).toBe(BUILDING_COUNT)
    expect(MAX_BUILDING_LEVEL).toBe(5)
  })

  it('hanya pangkalan laut menuntut garis pantai', () => {
    expect(requiresCoast(BuildingType.NavalBase)).toBe(true)
    expect(ALL_BUILDING_TYPES.filter(requiresCoast)).toEqual([BuildingType.NavalBase])
  })

  it('setiap tipe punya nama', () => {
    expect(ALL_BUILDING_TYPES.map(nameOf)).toEqual([
      'Army Base',
      'Arms Industry',
      'Air Base',
      'Naval Base',
      'Recruiting Office',
      'Military Hospital',
      'Underground Bunkers',
      'Secret Weapons Lab',
    ])
  })

  it('hanya industri senjata menaikkan keluaran', () => {
    expect(productionBonus(BuildingType.ArmsIndustry, 3)).toBe(f32(0.3))
    expect(productionBonus(BuildingType.ArmsIndustry, 5)).toBe(f32(0.5))
    expect(productionBonus(BuildingType.AirBase, 5)).toBe(0)
    expect(productionBonus(BuildingType.ArmsIndustry, 0)).toBe(0)
  })

  it('hanya kantor rekrutmen menaikkan manpower', () => {
    expect(manpowerBonus(BuildingType.RecruitingOffice, 1)).toBe(f32(0.05))
    expect(manpowerBonus(BuildingType.RecruitingOffice, 4)).toBe(f32(0.2))
    expect(manpowerBonus(BuildingType.ArmyBase, 4)).toBe(0)
  })

  /* Bunker naik melompat, bukan linear: dua tingkat pertama hampir tidak
     terasa dan tingkat kelima menggandakan ketahanan kota. */
  it('bonus morale bunker naik melompat', () => {
    expect([1, 2, 3, 4, 5].map((l) => moraleBonus(BuildingType.UndergroundBunkers, l))).toEqual([
      f32(0.05),
      f32(0.1),
      f32(0.2),
      f32(0.35),
      f32(0.5),
    ])
    expect(moraleBonus(BuildingType.ArmyBase, 5)).toBe(0)
  })
})

describe('BuildingCost', () => {
  it('tingkat lebih tinggi lebih mahal dan lebih lama', () => {
    const cheap = costsFor(BuildingType.ArmyBase, 1).reduce((sum, c) => sum + c.amount, 0)
    const dear = costsFor(BuildingType.ArmyBase, 5).reduce((sum, c) => sum + c.amount, 0)

    expect(dear).toBeGreaterThan(cheap * 3)
    expect(hoursFor(BuildingType.ArmyBase, 5)).toBeGreaterThan(hoursFor(BuildingType.ArmyBase, 1))
  })

  it.each([
    [BuildingType.ArmyBase, [28, 39, 55, 77, 108]],
    [BuildingType.ArmsIndustry, [10, 14, 20, 27, 38]],
    [BuildingType.AirBase, [24, 34, 47, 66, 92]],
    [BuildingType.NavalBase, [10, 14, 20, 27, 38]],
    [BuildingType.RecruitingOffice, [1, 1, 2, 3, 4]],
    [BuildingType.MilitaryHospital, [25, 35, 49, 69, 96]],
    [BuildingType.UndergroundBunkers, [9, 13, 18, 25, 35]],
    [BuildingType.SecretWeaponsLab, [25, 35, 49, 69, 96]],
  ])('durasi bangunan %i per tingkat', (type, expected) => {
    expect([1, 2, 3, 4, 5].map((level) => hoursFor(type, level))).toEqual(expected)
  })

  it('biaya pangkalan darat tingkat satu tersebar di lima barang', () => {
    expect(costsFor(BuildingType.ArmyBase, 1)).toEqual([
      { resource: Resource.Food, amount: 450 },
      { resource: Resource.Materials, amount: 250 },
      { resource: Resource.Fuel, amount: 500 },
      { resource: Resource.RareResources, amount: 150 },
      { resource: Resource.Money, amount: 2000 },
    ])
  })

  it('biaya tingkat lima adalah hasil pembulatan float, bukan double', () => {
    expect(costsFor(BuildingType.ArmyBase, 5)).toEqual([
      { resource: Resource.Food, amount: 1729 },
      { resource: Resource.Materials, amount: 960 },
      { resource: Resource.Fuel, amount: 1921 },
      { resource: Resource.RareResources, amount: 576 },
      { resource: Resource.Money, amount: 7683 },
    ])

    expect(costsFor(BuildingType.SecretWeaponsLab, 5)).toEqual([
      { resource: Resource.Food, amount: 2881 },
      { resource: Resource.Materials, amount: 1537 },
      { resource: Resource.Fuel, amount: 960 },
      { resource: Resource.Technology, amount: 2382 },
      { resource: Resource.RareResources, amount: 1921 },
      { resource: Resource.Money, amount: 13446 },
    ])
  })

  it('barang bernilai nol tidak masuk daftar biaya', () => {
    const bunkers = costsFor(BuildingType.UndergroundBunkers, 1)

    expect(bunkers.map((c) => c.resource)).toEqual([
      Resource.Food,
      Resource.Materials,
      Resource.Fuel,
      Resource.Money,
    ])
  })

  it.each([
    [BuildingType.ArmyBase, [3350, 4690, 6566, 9193, 12869]],
    [BuildingType.ArmsIndustry, [2930, 4102, 5743, 8039, 11256]],
  ])('jumlah biaya bangunan %i per tingkat', (type, expected) => {
    expect(
      [1, 2, 3, 4, 5].map((level) =>
        costsFor(type, level).reduce((sum, c) => sum + c.amount, 0),
      ),
    ).toEqual(expected)
  })

  it('tingkat di luar satu sampai lima ditolak', () => {
    expect(() => costsFor(BuildingType.ArmyBase, 0)).toThrow(RangeError)
    expect(() => costsFor(BuildingType.ArmyBase, 6)).toThrow(RangeError)
  })
})
