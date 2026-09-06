import { Terrain } from '~/sim/world/Terrain'

export interface Rgb {
  readonly r: number
  readonly g: number
  readonly b: number
}

function rgb(r: number, g: number, b: number): Rgb {
  return { r, g, b }
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return rgb(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t)
}

function clamp(v: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, v))
}

export const DEEP_OCEAN = rgb(0.031, 0.086, 0.141)
export const SHELF_WATER = rgb(0.098, 0.278, 0.353)

/*
 * Tanah diwarnai seperti tanah, dan kebangsaan dilukis di atasnya sebagai
 * arsiran, bukan isian. Peta politik yang setiap provinsinya pastel sembarang
 * terbaca sebagai diagram; mempertahankan medannya di bawah membuat pemain bisa
 * melihat sekaligus siapa pemiliknya dan seberapa mahal melintasinya.
 *
 * Nada di bawah ini disampel ke arah warna satelit sungguhan, bukan dipilih
 * dengan mata: peta rujukannya semua terbaca sebagai foto daratan lebih dulu
 * dan diagram belakangan, dan hue sembarang itulah yang merusaknya.
 */
const TERRAIN_BASE: readonly Rgb[] = [
  rgb(0.528, 0.556, 0.372), // OpenGround, padang rumput kering
  rgb(0.284, 0.39, 0.248), // Forest, kanopi sedang
  rgb(0.22, 0.377, 0.229), // Jungle, tropis basah
  rgb(0.482, 0.482, 0.339), // Hills
  rgb(0.564, 0.528, 0.473), // Mountains, batuan telanjang
  rgb(0.821, 0.716, 0.5), // Desert, pasir
  rgb(0.697, 0.721, 0.702), // Tundra
  rgb(0.325, 0.39, 0.335), // Marsh
  rgb(0.528, 0.5, 0.449), // Urban
  rgb(0.509, 0.504, 0.436), // Suburban
]

export function baseFor(terrain: Terrain): Rgb {
  return TERRAIN_BASE[terrain] ?? TERRAIN_BASE[0]!
}

/* Bioma yang akan dimiliki sebuah tempat kalau tidak ada yang membangun di
   sana: hijau basah di khatulistiwa, pasir melintasi gurun, hutan di sabuk
   sedang, pucat menuju kutub. */
function regionalSoil(latitude: number): Rgb {
  const absolute = Math.abs(latitude)

  if (absolute < 12) return baseFor(Terrain.Jungle)

  if (absolute < 32) {
    const t = clamp((absolute - 12) / 20, 0, 1)
    return mix(baseFor(Terrain.OpenGround), baseFor(Terrain.Desert), t * 0.75)
  }

  if (absolute < 55) return mix(baseFor(Terrain.Forest), baseFor(Terrain.OpenGround), 0.45)

  return baseFor(Terrain.Tundra)
}

/* Seperempat provinsi dunia memuat kota, dan mengecat semuanya dengan abu yang
   sama mengubah peta jadi kerikil. Provinsi terbangun mempertahankan nada tanah
   di sekitarnya dan hanya terbaca lebih hangat serta lebih pucat, yang juga
   caranya terlihat dari orbit. */
export function groundFor(terrain: Terrain, latitude: number): Rgb {
  const soil = baseFor(terrain)

  if (terrain !== Terrain.Urban && terrain !== Terrain.Suburban) return soil

  return mix(regionalSoil(latitude), soil, terrain === Terrain.Urban ? 0.55 : 0.4)
}

/*
 * Lintang mewarnai tanah sebagaimana dilakukannya pada citra satelit: pudar dan
 * hangat melintasi lintang kuda, dingin dan pucat menuju kutub. Versi
 * sebelumnya memvariasikan kecerahan lewat hash id provinsi, yang memberi tiap
 * negara ladang bintik alih-alih bentang alam.
 */
export function weatheredBy(ground: Rgb, latitude: number): Rgb {
  const absolute = Math.abs(latitude)

  const aridity = Math.exp(-Math.pow((absolute - 24) / 16, 2))
  const cold = clamp((absolute - 48) / 22, 0, 1)

  const sun = rgb(0.78, 0.7, 0.51)
  const frost = rgb(0.72, 0.75, 0.78)

  return mix(mix(ground, sun, aridity * 0.14), frost, cold * 0.22)
}

/* Warna negara disebar dengan rasio emas supaya tetangga jarang bertabrakan,
   lalu ditahan di pita saturasi dan nilai yang sempit: arsirannya harus terbaca
   sebagai satu keluarga penanda, bukan sekantong spidol stabilo. */
export function nationColour(nation: number, isPlayer: boolean): Rgb {
  if (isPlayer) return rgb(1, 0.62, 0.24)

  return hsvToRgb((nation * 0.618033988) % 1, 0.55, 0.8)
}

function hsvToRgb(h: number, s: number, v: number): Rgb {
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0:
      return rgb(v, t, p)
    case 1:
      return rgb(q, v, p)
    case 2:
      return rgb(p, v, t)
    case 3:
      return rgb(p, q, v)
    case 4:
      return rgb(t, p, v)
    default:
      return rgb(v, p, q)
  }
}
