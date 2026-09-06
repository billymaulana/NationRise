/*
 * Warna diukur dari layar riset Conflict of Nations. Keadaan 'unavailable'
 * memakai abu netral murni, satu-satunya tempat CoN keluar dari disiplin
 * satu-hue-nya; netral penuh itulah yang membuatnya terbaca mati.
 */
export type DiamondState = 'available' | 'locked' | 'unavailable' | 'done' | 'empty'

export const diamondFills: Record<DiamondState, string> = {
  available: '#6a8c70',
  locked: '#a76a79',
  unavailable: '#757575',
  done: '#596d7a',
  empty: 'transparent',
}
