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

/* Faktor hasil diambil dari Conflict of Nations dan diverifikasi terhadap
   keluaran kota Indonesia sungguhan; mengubah satu saja menyeimbangkan ulang
   seluruh ekonomi. */
const FACTORS: Readonly<Record<Resource, number>> = {
  [Resource.Money]: 0.375,
  [Resource.Manpower]: 0, // diturunkan dari populasi, bukan dihasilkan slot
  [Resource.Food]: 0.525,
  [Resource.Fuel]: 0.525,
  [Resource.Materials]: 0.45,
  [Resource.Technology]: 0.25,
  [Resource.RareResources]: 0.3,
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
