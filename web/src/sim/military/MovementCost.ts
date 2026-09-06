import { f32, mulF32 } from '~/sim/determinism/float32'
import type { Terrain } from '~/sim/world/Terrain'

/* Satu penyeberangan provinsi pada kecepatan dasar, dalam jam permainan.
   Pengali medannya mengikuti rasio yang disepakati riset tempur, sehingga
   pegunungan berbiaya tiga kali lipat tanah terbuka. */
export const BASE_HOURS = 2

/* Float32Array, bukan number[]: pengalinya bertipe float di implementasi
   rujukan, dan larik bertipe membulatkan tiap literal ke 32 bit tanpa
   membungkusnya satu per satu. */
const TERRAIN_MULTIPLIER = new Float32Array([
  1.0, 1.52, 1.75, 2.0, 3.03, 1.0, 1.0, 2.2, 2.0, 1.54, 0.77, 0.6, 1.0,
])

/* Menyeberang tanpa tautan darat berarti naik kapal, dan itu berbiaya lebih
   daripada yang disiratkan jaraknya saja. */
const SEA_MULTIPLIER = f32(1.6)

export function hoursFor(terrain: Terrain, bySea: boolean): number {
  const multiplier = bySea ? SEA_MULTIPLIER : TERRAIN_MULTIPLIER[terrain]!
  return mulF32(BASE_HOURS, multiplier)
}
