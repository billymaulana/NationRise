export const NO_PROVINCE = 0xffff

export interface ProvinceIdMap {
  readonly width: number
  readonly height: number
  readonly ids: Uint16Array
  readonly isLand: Uint8Array
  idAt(lon: number, lat: number): number
}

/*
 * Memuat tekstur id provinsi dan menyimpan salinannya di CPU.
 *
 * Konversi ruang warna dimatikan secara eksplisit. Nilai piksel di sini adalah
 * bilangan, bukan warna: kalau peramban memperlakukannya sebagai sRGB dan
 * memetakan ulang, id-nya rusak tanpa galat apa pun dan setiap pemilihan
 * provinsi akan menunjuk tempat yang salah. Pemuatannya diverifikasi terhadap
 * satu titik yang diketahui, bukan dipercaya begitu saja.
 */
export async function loadProvinceIds(url: string): Promise<ProvinceIdMap> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`tekstur id provinsi tidak bisa dimuat: ${response.status} ${url}`)
  }

  const bitmap = await createImageBitmap(await response.blob(), {
    colorSpaceConversion: 'none',
    premultiplyAlpha: 'none',
  })

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (context === null) throw new Error('konteks 2d tidak tersedia untuk membaca tekstur id')

  context.drawImage(bitmap, 0, 0)
  const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data
  bitmap.close()

  const count = bitmap.width * bitmap.height
  const ids = new Uint16Array(count)
  const isLand = new Uint8Array(count)

  for (let i = 0; i < count; i++) {
    ids[i] = pixels[i * 4]! | (pixels[i * 4 + 1]! << 8)
    isLand[i] = pixels[i * 4 + 2]! > 127 ? 1 : 0
  }

  const width = bitmap.width
  const height = bitmap.height

  return {
    width,
    height,
    ids,
    isLand,
    idAt(lon: number, lat: number): number {
      const x = Math.floor(((lon + 180) / 360) * width)
      const y = Math.floor(((90 - lat) / 180) * height)
      if (x < 0 || x >= width || y < 0 || y >= height) return NO_PROVINCE
      return ids[y * width + x]!
    },
  }
}
