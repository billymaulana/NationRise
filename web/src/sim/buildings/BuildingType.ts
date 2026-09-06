import { divF32, f32, mulF32 } from '~/sim/determinism/float32'

export enum BuildingType {
  ArmyBase = 0,
  ArmsIndustry = 1,
  AirBase = 2,
  NavalBase = 3,
  RecruitingOffice = 4,
  MilitaryHospital = 5,
  UndergroundBunkers = 6,
  SecretWeaponsLab = 7,
}

export const BUILDING_COUNT = 8
export const MAX_BUILDING_LEVEL = 5

/* Urutan tetap menggantikan Enum.GetValues: mengiterasi kunci objek enum akan
   ikut memuat pemetaan balik namanya dan urutannya tidak dijamin. */
export const ALL_BUILDING_TYPES: readonly BuildingType[] = [
  BuildingType.ArmyBase,
  BuildingType.ArmsIndustry,
  BuildingType.AirBase,
  BuildingType.NavalBase,
  BuildingType.RecruitingOffice,
  BuildingType.MilitaryHospital,
  BuildingType.UndergroundBunkers,
  BuildingType.SecretWeaponsLab,
]

const NAMES: readonly string[] = [
  'Army Base',
  'Arms Industry',
  'Air Base',
  'Naval Base',
  'Recruiting Office',
  'Military Hospital',
  'Underground Bunkers',
  'Secret Weapons Lab',
]

/* Tekanan slot itulah yang membuat kota jadi sekumpulan keputusan alih-alih
   daftar centang: delapan bangunan ada, satu kota memuat paling banyak tujuh,
   sehingga spesialisasi dipaksa, bukan dianjurkan. */
export function slotsFor(population: number): number {
  const slots = 2 + Math.trunc(divF32(population, 2))
  return Math.min(Math.max(slots, 2), 7)
}

export function nameOf(type: BuildingType): string {
  return NAMES[type] ?? 'Secret Weapons Lab'
}

export function requiresCoast(type: BuildingType): boolean {
  return type === BuildingType.NavalBase
}

/* Bonus keluaran dari Arms Industry, mengikuti kemajuan Conflict of Nations
   yang dicatat riset ekonomi. */
export function productionBonus(type: BuildingType, level: number): number {
  return type === BuildingType.ArmsIndustry ? mulF32(level, f32(0.1)) : 0
}

export function manpowerBonus(type: BuildingType, level: number): number {
  return type === BuildingType.RecruitingOffice ? mulF32(level, f32(0.05)) : 0
}

export function moraleBonus(type: BuildingType, level: number): number {
  if (type !== BuildingType.UndergroundBunkers) return 0

  switch (level) {
    case 1:
      return f32(0.05)
    case 2:
      return f32(0.1)
    case 3:
      return f32(0.2)
    case 4:
      return f32(0.35)
    default:
      return f32(0.5)
  }
}
