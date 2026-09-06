/*
 * Padanan MathF.Round dan Math.Round di .NET, yang membulatkan setengah ke
 * bilangan genap. Math.round JavaScript membulatkan setengah menjauhi nol,
 * sehingga 2,5 menjadi 3 di sini dan 2 di implementasi rujukan.
 *
 * Selisih satu unit per pembulatan cukup untuk memisahkan dua simulasi yang
 * seharusnya identik, dan simpanan yang ditulis oleh salah satunya tidak lagi
 * bisa diputar ulang oleh yang lain. Nilai harapannya diverifikasi langsung
 * terhadap .NET, bukan disimpulkan dari dokumentasi.
 */
export function roundHalfToEven(value: number): number {
  const floor = Math.floor(value)
  const diff = value - floor

  if (diff > 0.5) return floor + 1
  if (diff < 0.5) return floor

  return floor % 2 === 0 ? floor : floor + 1
}

/*
 * Pembagian bilangan bulat ala C#, yang membulatkan ke arah nol. Math.floor
 * membulatkan ke bawah dan berbeda satu untuk hasil negatif.
 */
export function intDiv(numerator: number, denominator: number): number {
  return Math.trunc(numerator / denominator)
}
