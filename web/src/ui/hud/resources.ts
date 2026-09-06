/*
 * Tujuh slot mengikuti K19-K25; Gold sengaja belum ada karena nasibnya belum
 * diputuskan (lihat docs/01-kunci-web.md §5).
 */
export interface ResourceReading {
  id: string
  label: string
  stock: number
  rate: number
}

const ICON_OF: Readonly<Record<number, string>> = {
  0: 'money',
  1: 'manpower',
  2: 'food',
  3: 'fuel',
  4: 'materials',
  5: 'technology',
  6: 'rare-resources',
}

const LABEL_OF: Readonly<Record<number, string>> = {
  0: 'Money',
  1: 'Manpower',
  2: 'Food',
  3: 'Fuel',
  4: 'Materials',
  5: 'Technology',
  6: 'Rare Resources',
}

export function iconOf(resource: number): string {
  return ICON_OF[resource] ?? 'money'
}

export function labelOf(resource: number): string {
  return LABEL_OF[resource] ?? ''
}

export interface ResourceSnapshot {
  readonly resource: number
  readonly stock: number
  readonly perDay: number
}

/*
 * Laju yang ditampilkan adalah per jam, bukan per hari — itulah yang ditulis
 * layar rujukan, dan pemain membacanya sebagai kecepatan pengisian. Pembagian
 * dua puluh empatnya dipotong, bukan dibulatkan, supaya angka yang ditampilkan
 * tidak pernah menjanjikan lebih dari yang benar-benar datang.
 */
export function readingsFrom(snapshot: readonly ResourceSnapshot[]): ResourceReading[] {
  return snapshot.map((entry) => ({
    id: iconOf(entry.resource),
    label: labelOf(entry.resource),
    stock: entry.stock,
    rate: Math.trunc(entry.perDay / 24),
  }))
}
