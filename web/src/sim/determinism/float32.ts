/*
 * Emulasi aritmetika float 32-bit C#.
 *
 * `number` di JavaScript selalu double 64-bit, sedangkan `float` di C# dibulatkan
 * ke 32 bit setelah setiap operasi. Selisihnya kecil sampai sebuah hasil
 * dilewatkan Math.floor, dan di sana ia menjadi selisih bilangan bulat penuh.
 *
 * Ini bukan kekhawatiran teoretis. Keluaran harian Rare Resources pada populasi
 * 5 dan morale 70 persen adalah 729 di implementasi rujukan; dihitung dengan
 * double, hasilnya 728. Nilai itu diambil dari Conflict of Nations sungguhan,
 * jadi yang meleset adalah portnya.
 *
 * Setiap perhitungan yang di C# memakai `float` harus memakai pembungkus di
 * sini, satu per operasi, mengikuti urutan evaluasi yang sama.
 */
export const f32 = Math.fround

export function mulF32(a: number, b: number): number {
  return Math.fround(a * b)
}

export function addF32(a: number, b: number): number {
  return Math.fround(a + b)
}

export function subF32(a: number, b: number): number {
  return Math.fround(a - b)
}

export function divF32(a: number, b: number): number {
  return Math.fround(a / b)
}
