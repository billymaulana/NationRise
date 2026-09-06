import { describe, expect, it } from 'vitest'
import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'

describe('DeterministicRandom', () => {
  it('seed sama menghasilkan deret sama', () => {
    const a = new DeterministicRandom(20260906)
    const b = new DeterministicRandom(20260906)

    for (let i = 0; i < 1000; i++) {
      expect(a.nextUInt64()).toBe(b.nextUInt64())
    }
  })

  it('seed berbeda memisah', () => {
    const a = new DeterministicRandom(1)
    const b = new DeterministicRandom(2)

    let diverged = false
    for (let i = 0; i < 100 && !diverged; i++) {
      diverged = a.nextUInt64() !== b.nextUInt64()
    }

    expect(diverged).toBe(true)
  })

  it('undian berbatas tetap dalam rentang', () => {
    const rng = new DeterministicRandom(42)

    for (let i = 0; i < 10_000; i++) {
      const v = rng.nextInt(10, 20)
      expect(v).toBeGreaterThanOrEqual(10)
      expect(v).toBeLessThanOrEqual(19)
    }
  })

  it('undian double tetap di interval satuan', () => {
    const rng = new DeterministicRandom(7)

    for (let i = 0; i < 10_000; i++) {
      const v = rng.nextDouble()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('menolak rentang kosong', () => {
    const rng = new DeterministicRandom(1)
    expect(() => rng.nextInt(0)).toThrow(RangeError)
    expect(() => rng.nextInt(5, 5)).toThrow(RangeError)
  })

  /*
   * Nilai ini disalin apa adanya dari DeterministicRandomTests.cs. Ia memaku
   * algoritmanya, bukan sekadar konsistensi dua instans: kalau port TypeScript
   * berbeda satu bit dari C#, uji ini merah dan portnya yang salah, bukan
   * ujinya.
   */
  it('menghasilkan undian yang identik dengan implementasi C#', () => {
    const rng = new DeterministicRandom(20260906)

    expect(rng.nextUInt64()).toBe(16976369440443965981n)
    expect(rng.nextUInt64()).toBe(14008061297598852737n)
    expect(rng.nextUInt64()).toBe(7531599346850374646n)
  })
})
