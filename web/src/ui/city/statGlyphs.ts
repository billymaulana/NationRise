/*
 * Lambang belah ketupat di blok INFORMATION: kerumunan orang, bintang, salib
 * medis, perisai. Digambar sebagai path karena tidak ada koleksi ikon terpasang
 * dan utility ikon yang tidak ter-generate menghasilkan kotak kosong tanpa galat.
 */
const GLYPHS: Readonly<Record<string, string>> = {
  population:
    'M8 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6m8 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6M2 20v-3l4-2h4l4 2v3zm12 0v-3l-1.5-1 2-1h3.5l4 2v3z',
  victory: 'M12 2 14.9 8.6 22 9.3l-5.4 4.7L18.2 21 12 17.3 5.8 21l1.6-7L2 9.3l7.1-.7z',
  healing: 'M9 2h6v7h7v6h-7v7H9v-7H2V9h7z',
  defence: 'M12 2 21 5v7c0 5-3.8 8.6-9 10-5.2-1.4-9-5-9-10V5z',
}

export function glyphOf(stat: string): string {
  return GLYPHS[stat] ?? GLYPHS.victory!
}
