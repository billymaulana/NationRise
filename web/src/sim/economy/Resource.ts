import { f32 } from '~/sim/determinism/float32'

export enum Resource {
  Money = 0,
  Manpower = 1,
  Food = 2,
  Fuel = 3,
  Materials = 4,
  Technology = 5,
  RareResources = 6,
}

export const RESOURCE_COUNT = 7

/* Urutan tetap, dan larik alih-alih Object.keys atau Set: logika simulasi tidak
   boleh bergantung pada urutan iterasi yang tidak dijamin. */
export const ALL_RESOURCES: readonly Resource[] = [
  Resource.Money,
  Resource.Manpower,
  Resource.Food,
  Resource.Fuel,
  Resource.Materials,
  Resource.Technology,
  Resource.RareResources,
]

/* Faktor hasil diambil dari Conflict of Nations dan diverifikasi terhadap
   keluaran kota Indonesia sungguhan; mengubah satu saja menyeimbangkan ulang
   seluruh ekonomi. */
/* Dibulatkan ke float32 karena literalnya di C# bertipe float, dan seluruh
   rantai perhitungan keluaran harian harus memakai presisi yang sama. */
const FACTORS: Readonly<Record<Resource, number>> = {
  [Resource.Money]: f32(0.375),
  [Resource.Manpower]: 0, // diturunkan dari populasi, bukan dihasilkan slot
  [Resource.Food]: f32(0.525),
  [Resource.Fuel]: f32(0.525),
  [Resource.Materials]: f32(0.45),
  [Resource.Technology]: f32(0.25),
  [Resource.RareResources]: f32(0.3),
}

export function factorOf(resource: Resource): number {
  return FACTORS[resource]
}

export function isTradeable(resource: Resource): boolean {
  return resource !== Resource.Manpower
}

/* Lima barang yang bisa jadi spesialisasi kota. Money datang dari setiap
   provinsi tanpa kecuali, dan manpower diturunkan dari populasi. */
export function isCityGood(resource: Resource): boolean {
  return (
    resource === Resource.Food ||
    resource === Resource.Fuel ||
    resource === Resource.Materials ||
    resource === Resource.Technology ||
    resource === Resource.RareResources
  )
}
