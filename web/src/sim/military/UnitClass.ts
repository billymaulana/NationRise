import type { ArmourClass } from '~/sim/military/ArmourClass'

export enum Domain {
  Land = 0,
  Air = 1,
  Sea = 2,
}

/*
 * Satu tipe unit seperti yang dilihat pemain di kartu. Peringkatnya disimpan
 * per kelas lapis baja dalam dua larik datar supaya pertempuran bisa
 * mengindeksnya tanpa percabangan.
 *
 * Float32Array, bukan number[]: peringkatnya bertipe float di implementasi
 * rujukan, dan larik bertipe menjamin presisinya tanpa membungkus tiap literal.
 */
export interface UnitClass {
  readonly id: string
  readonly name: string
  readonly domain: Domain
  readonly armour: ArmourClass
  readonly maxHitPoints: number
  readonly speed: number

  /* Eselon menentukan berapa banyak kerusakan masuk yang diserap sebuah unit:
     unit garis depan menerima tiga kali lipat unit belakang, dan itulah yang
     menghentikan artileri mati lebih dulu di tumpukan campuran. */
  readonly echelon: number

  readonly attack: Float32Array
  readonly defence: Float32Array
}

export function attackAgainst(unit: UnitClass, target: ArmourClass): number {
  return unit.attack[target]!
}

export function defenceAgainst(unit: UnitClass, attacker: ArmourClass): number {
  return unit.defence[attacker]!
}

export function echelonWeight(echelon: number): number {
  if (echelon === 1) return 3
  if (echelon === 2) return 2
  return 1
}
