import { addF32, f32, mulF32, subF32 } from '~/sim/determinism/float32'
import { factorOf, type Resource } from '~/sim/economy/Resource'
import type { ProvinceRef } from '~/sim/world/ProvinceStore'

export const BASE_OUTPUT = f32(3000)

/*
 * Seluruh rantai ini memakai float 32-bit di implementasi rujukan, dan
 * hasilnya dilewatkan Math.floor. Menghitungnya dengan double menghasilkan
 * bilangan bulat yang berbeda untuk sebagian masukan; lihat
 * src/sim/determinism/float32.ts.
 */

/* Populasi menskalakan keluaran lewat dua kurva berbeda: di bawah lima ia
   linear saja, di atasnya tumbuh kuadratik — itulah sebabnya satu kota
   berukuran enam mengalahkan dua kota berukuran tiga. */
export function populationFactor(population: number): number {
  if (population < 5) {
    return mulF32(population, f32(0.2))
  }

  const growth = addF32(f32(1), mulF32(f32(0.05), subF32(population, f32(5))))
  return mulF32(growth, growth)
}

export function moraleFactor(morale: number): number {
  return addF32(mulF32(morale, f32(0.8)), f32(0.25))
}

export function dailyOutput(population: number, morale: number, resource: Resource): number {
  const raw = mulF32(
    mulF32(mulF32(BASE_OUTPUT, moraleFactor(morale)), factorOf(resource)),
    populationFactor(population),
  )

  return Math.floor(raw)
}

export function dailyOutputOf(province: ProvinceRef, resource: Resource): number {
  return dailyOutput(province.population, province.morale, resource)
}
