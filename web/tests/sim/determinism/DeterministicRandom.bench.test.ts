import { describe, expect, it } from 'vitest'
import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'

const DRAWS = 1_000_000
const BUDGET_MS = 1_200

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
 * Yang diukur adalah lari tercepat, bukan rata-rata, karena rata-rata ikut
 * memuat beban proses lain.
 *
 * Anggarannya sengaja longgar. Versi pertama memakai 250 ms, yang cukup saat
 * rangkaian ujinya kecil tetapi mulai merah secara acak begitu berkas uji
 * bertambah: vitest menjalankan berkasnya paralel, dan pada mesin yang sibuk
 * lantai waktunya pun ikut naik dua sampai tiga kali. Uji waktu-dinding di
 * runner paralel tidak bisa mengukur mikro-drift, dan memaksanya melakukan itu
 * hanya menghasilkan uji yang gagal karena hal yang tidak diujinya.
 *
 * Yang dijaga sekarang adalah regresi ordo besar — mengganti generator dengan
 * sesuatu yang sepuluh kali lebih lambat tetap tertangkap, dan itulah satu-
 * satunya hal yang bisa dijamin uji ini.
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
