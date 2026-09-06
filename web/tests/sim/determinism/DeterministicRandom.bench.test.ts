import { describe, expect, it } from 'vitest'
import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'

/*
 * Generator memakai BigInt supaya 64 bitnya eksak, dan BigInt jauh lebih lambat
 * dari number. Anggaran ini menjaga agar keputusan itu tetap layak: kalau suatu
 * saat melar, penggantinya adalah representasi pasangan uint32, bukan mengubah
 * algoritmanya.
 */
describe('anggaran kinerja', () => {
  it('sejuta undian selesai di bawah 250 ms', () => {
    const rng = new DeterministicRandom(1)

    const started = performance.now()
    let sink = 0n
    for (let i = 0; i < 1_000_000; i++) {
      sink ^= rng.nextUInt64()
    }
    const elapsed = performance.now() - started

    expect(sink).not.toBe(0n)
    console.log(`  1.000.000 undian dalam ${elapsed.toFixed(0)} ms`)
    expect(elapsed).toBeLessThan(250)
  })
})
