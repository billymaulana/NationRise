/*
 * Tipe bangunan menyeberangi jembatan sebagai angka, bukan sebagai enum
 * simulasi: antarmuka tidak boleh menyentuh `~/sim`, dan angka itulah satu
 * -satunya bagian enum yang bermakna di sisi ini.
 */
export const ARMY_BASE = 0
export const ARMS_INDUSTRY = 1
export const AIR_BASE = 2
export const NAVAL_BASE = 3
export const RECRUITING_OFFICE = 4
export const MILITARY_HOSPITAL = 5
export const UNDERGROUND_BUNKERS = 6
export const SECRET_WEAPONS_LAB = 7

/*
 * Lambang digambar sebagai path, bukan dimuat sebagai ikon: tidak ada satu pun
 * koleksi ikon terpasang, sehingga utility ikon menghasilkan kotak kosong tanpa
 * galat apa pun. Semuanya bersudut tajam, mengikuti geometri antarmuka.
 */
const GLYPHS: Readonly<Record<number, string>> = {
  [ARMY_BASE]: 'M12 2 14.6 9h7.4l-6 4.6L18.3 21 12 16.5 5.7 21 8 13.6 2 9h7.4z',
  [ARMS_INDUSTRY]: 'M3 21V10l5 3V10l5 3V10l5 3V6h3v15zM6 15v3h3v-3zm6 0v3h3v-3z',
  [AIR_BASE]: 'M12 2 14 9l8 4v2l-8-2v5l3 2v2l-5-1.5L9 22v-2l3-2v-5l-8 2v-2l8-4z',
  [NAVAL_BASE]: 'M11 2h2v3h3v2h-3v11.2l5-3.4-1.3 3.6L12 22l-4.7-3.6L6 14.8l5 3.4V7H8V5h3z',
  [RECRUITING_OFFICE]: 'M12 2 20 6v6l-8 10L4 12V6zm0 4-4 2v3l4 5 4-5V8z',
  [MILITARY_HOSPITAL]: 'M9 2h6v7h7v6h-7v7H9v-7H2V9h7z',
  [UNDERGROUND_BUNKERS]: 'M2 20v-2h20v2zM4 16 6 8h12l2 8zm4-6-1 4h10l-1-4z',
  [SECRET_WEAPONS_LAB]: 'M9 2h6v2h-1v5l6 11v2H4v-2l6-11V4H9zm3 8-3.4 6h6.8z',
}

export function glyphOf(type: number): string {
  return GLYPHS[type] ?? GLYPHS[ARMY_BASE]!
}

export interface BuildingCategory {
  readonly id: string
  readonly label: string
  readonly types: readonly number[]
}

/*
 * Korpus rujukan tidak memperlihatkan nama tab kategori pada modal konstruksi,
 * hanya keberadaannya. Pengelompokan di bawah karena itu diturunkan dari apa
 * yang benar-benar dilakukan tiap bangunan di simulasi, bukan disalin dari
 * tangkapan layar.
 */
export const BUILDING_CATEGORIES: readonly BuildingCategory[] = [
  {
    id: 'all',
    label: 'All',
    types: [
      ARMY_BASE,
      ARMS_INDUSTRY,
      AIR_BASE,
      NAVAL_BASE,
      RECRUITING_OFFICE,
      MILITARY_HOSPITAL,
      UNDERGROUND_BUNKERS,
      SECRET_WEAPONS_LAB,
    ],
  },
  { id: 'bases', label: 'Bases', types: [ARMY_BASE, AIR_BASE, NAVAL_BASE] },
  { id: 'industry', label: 'Industry', types: [ARMS_INDUSTRY, SECRET_WEAPONS_LAB] },
  {
    id: 'support',
    label: 'Support',
    types: [RECRUITING_OFFICE, MILITARY_HOSPITAL, UNDERGROUND_BUNKERS],
  },
]

const GROUPED = new Intl.NumberFormat('en-US')

export function formatAmount(value: number): string {
  return GROUPED.format(Math.trunc(value))
}

/* Populasi disimpan dalam juta; layar rujukan menulisnya sebagai orang. */
export function formatPopulation(millions: number): string {
  return GROUPED.format(Math.round(millions * 1_000_000))
}

/*
 * Durasi ditulis seperti layar rujukan: hari, jam, menit, dan hanya bagian yang
 * bukan nol. Simulasi menjadwalkan dalam jam bulat, sehingga menit hanya muncul
 * untuk selisih yang memang pecahan jam.
 */
export function formatDuration(hours: number): string {
  const whole = Math.trunc(hours)
  const minutes = Math.round((hours - whole) * 60)
  const days = Math.trunc(whole / 24)
  const rest = whole % 24

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (rest > 0) parts.push(`${rest}h`)
  if (minutes > 0) parts.push(`${minutes}min`)

  return parts.length > 0 ? parts.join(' ') : '0h'
}

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`
}

/*
 * Nilai yang sudah terbaca di tangkapan layar kota Conflict of Nations tetapi
 * belum punya model di simulasi ini. Ditulis sebagai konstanta bernama supaya
 * jelas bahwa keduanya belum dihitung, bukan diam-diam lolos sebagai hasil.
 */
export const HEALING_PER_DAY = 1
export const DEFENCE_BONUS = 0
