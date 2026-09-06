import { describe, expect, it } from 'vitest'
import { factorOf, isCityGood, isTradeable, Resource, RESOURCE_COUNT } from '~/sim/economy/Resource'

/* Diport dari NationRise.Core. Faktor hasil diambil dari Conflict of Nations
   dan diverifikasi terhadap keluaran kota Indonesia sungguhan; mengubah satu
   saja menyeimbangkan ulang seluruh ekonomi. */
describe('Resource', () => {
  it('tujuh slot sesuai K19 sampai K25', () => {
    expect(RESOURCE_COUNT).toBe(7)
    expect(Resource.Money).toBe(0)
    expect(Resource.RareResources).toBe(6)
  })

  it.each([
    [Resource.Money, 0.375],
    [Resource.Manpower, 0],
    [Resource.Food, 0.525],
    [Resource.Fuel, 0.525],
    [Resource.Materials, 0.45],
    [Resource.Technology, 0.25],
    [Resource.RareResources, 0.3],
  ])('faktor hasil %i adalah %f', (resource, factor) => {
    expect(factorOf(resource)).toBeCloseTo(factor, 5)
  })

  it('manpower tidak bisa diperdagangkan', () => {
    expect(isTradeable(Resource.Manpower)).toBe(false)
    expect(isTradeable(Resource.Money)).toBe(true)
  })

  it('lima barang boleh jadi spesialisasi kota', () => {
    const goods = [
      Resource.Food,
      Resource.Fuel,
      Resource.Materials,
      Resource.Technology,
      Resource.RareResources,
    ]

    for (const good of goods) expect(isCityGood(good)).toBe(true)

    /* Money datang dari setiap provinsi, manpower diturunkan dari populasi. */
    expect(isCityGood(Resource.Money)).toBe(false)
    expect(isCityGood(Resource.Manpower)).toBe(false)
  })
})
