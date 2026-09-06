import { f32 } from '~/sim/determinism/float32'

export enum ProvinceStatus {
  Homeland = 0,
  Annexed = 1,
  Occupied = 2,
  PlainProvince = 3,
}

/* Batas keluaran menurut status. Provinsi biasa dibatasi separuh, dan itulah
   yang mencegah sebuah negara membiayai perang hanya dari tanah kosong;
   wilayah pendudukan menghasilkan seperempat sampai dianeksasi. */
const CEILINGS: Readonly<Record<ProvinceStatus, number>> = {
  [ProvinceStatus.Homeland]: f32(1.0),
  [ProvinceStatus.Annexed]: f32(0.5),
  [ProvinceStatus.Occupied]: f32(0.25),
  [ProvinceStatus.PlainProvince]: f32(0.5),
}

export function ceilingOf(status: ProvinceStatus): number {
  return CEILINGS[status]
}

export function canMobilise(status: ProvinceStatus): boolean {
  return status === ProvinceStatus.Homeland || status === ProvinceStatus.Annexed
}
