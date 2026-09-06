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
