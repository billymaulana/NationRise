import { describe, expect, it } from 'vitest'
import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'

const DRAWS = 1_000_000
const BUDGET_MS = 250

function timeMillionDraws(): number {
  const rng = new DeterministicRandom(1)
  const started = performance.now()

  let sink = 0n
  for (let i = 0; i < DRAWS; i++) sink ^= rng.nextUInt64()

  const elapsed = performance.now() - started
  if (sink === 0n) throw new Error('undian tidak terpakai; pengukuran tidak sah')

  return elapsed
}

/*
 * Generator memakai BigInt supaya 64 bitnya eksak, dan BigInt jauh lebih lambat
 * dari number. Anggaran ini menjaga agar keputusan itu tetap layak: kalau suatu
 * saat melar, penggantinya adalah representasi pasangan uint32, bukan mengubah
 * algoritmanya.
 *
 * Yang diukur adalah lari tercepat, bukan rata-rata. Vitest menjalankan berkas
 * uji secara paralel, sehingga rata-rata ikut memuat beban proses lain dan
 * anggaran ini akan gagal secara acak. Lantai waktunya jauh lebih stabil dan
 * tetap menangkap regresi yang sebenarnya.
 */
describe('anggaran kinerja', () => {
  it(`sejuta undian selesai di bawah ${BUDGET_MS} ms`, () => {
    timeMillionDraws() /* pemanasan: biarkan JIT selesai mengoptimalkan */

    const runs = [timeMillionDraws(), timeMillionDraws(), timeMillionDraws()]
    const fastest = Math.min(...runs)

    console.log(`  ${DRAWS.toLocaleString('id-ID')} undian: ${runs.map((r) => r.toFixed(0)).join(' / ')} ms`)
    expect(fastest).toBeLessThan(BUDGET_MS)
  })
})
