import { describe, expect, it } from 'vitest'
import { intDiv, roundHalfToEven } from '~/sim/determinism/rounding'

describe('roundHalfToEven', () => {
  /* Nilai harapan diambil dari keluaran MathF.Round pada .NET, dijalankan
     langsung, bukan dari dokumentasi. */
  it.each([
    [2.5, 2],
    [3.5, 4],
    [2.6, 3],
    [0.5, 0],
    [1.5, 2],
    [-2.5, -2],
    [-1.5, -2],
    [-2.6, -3],
  ])('membulatkan %f menjadi %i seperti MathF.Round', (input, expected) => {
    expect(roundHalfToEven(input)).toBe(expected)
  })

  it('berbeda dari Math.round tepat di titik tengah', () => {
    expect(Math.round(2.5)).toBe(3)
    expect(roundHalfToEven(2.5)).toBe(2)
  })
})

describe('intDiv', () => {
  it('membulatkan ke arah nol, bukan ke bawah', () => {
    expect(intDiv(7, 2)).toBe(3)
    expect(intDiv(-7, 2)).toBe(-3)
    expect(Math.floor(-7 / 2)).toBe(-4)
  })
})
