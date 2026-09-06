import { describe, expect, it } from 'vitest'
import { f32 } from '~/sim/determinism/float32'
import { dailyOutput, moraleFactor, populationFactor } from '~/sim/economy/Production'
import { isTradeable, Resource } from '~/sim/economy/Resource'

/* Diport dari NationRise.Core.Tests/Economy/ProductionTests.cs. Nilai Conflict
   of Nations sungguhan untuk Indonesia hari pertama pada morale 70 persen.
   Angka inilah yang memaku rumusnya; kalau satu bergeser, ekonominya sudah
   diam-diam berubah. */
describe('Production', () => {
  it.each([
    [6, Resource.Materials, 1205],
    [5, Resource.Food, 1275],
    [5, Resource.Fuel, 1275],
    [5, Resource.Technology, 607],
    [5, Resource.RareResources, 729],
    [4, Resource.Food, 1020],
    [4, Resource.Materials, 874],
    [6, Resource.Money, 1004],
  ])('populasi %i sumber daya %i menghasilkan %i', (population, resource, expected) => {
    expect(dailyOutput(population, f32(0.7), resource)).toBe(expected)
  })

  it('faktor populasi berganti kurva di angka lima', () => {
    expect(populationFactor(4)).toBeCloseTo(0.8, 3)
    expect(populationFactor(5)).toBeCloseTo(1, 3)
    expect(populationFactor(6)).toBeCloseTo(1.1025, 3)
  })

  it('morale lebih tinggi menghasilkan lebih banyak', () => {
    const low = dailyOutput(5, f32(0.25), Resource.Food)
    const high = dailyOutput(5, f32(1), Resource.Food)

    expect(high).toBeGreaterThan(low)
    expect(moraleFactor(f32(1))).toBeCloseTo(1.05, 3)
  })

  it('manpower tidak dihasilkan slot sumber daya', () => {
    expect(dailyOutput(6, f32(1), Resource.Manpower)).toBe(0)
    expect(isTradeable(Resource.Manpower)).toBe(false)
  })
})
