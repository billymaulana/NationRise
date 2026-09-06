const MAGIC = 0x4e524254

export interface DepthField {
  readonly width: number
  readonly height: number
  readonly levels: number
  readonly depth: Uint8Array
}

/*
 * Kedalaman laut yang dihasilkan pipeline. Nol berarti daratan atau paparan di
 * atas dua ratus meter; 255 berarti palung terdalam.
 *
 * Dimuat sebagai bita mentah, bukan PNG. Nilainya adalah bilangan, dan
 * membawanya lewat dekoder gambar berarti menyerahkannya pada manajemen warna
 * peramban — jalur yang sama yang harus dimatikan eksplisit untuk tekstur id.
 * Berkas 2,3 MB tidak cukup besar untuk membuat kompresi sepadan dengan risiko
 * itu.
 */
export async function loadBathymetry(url: string): Promise<DepthField> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`batimetri tidak bisa dimuat: ${response.status} ${url}`)
  }

  const buffer = await response.arrayBuffer()
  const view = new DataView(buffer)

  const magic = view.getUint32(0, true)
  if (magic !== MAGIC) {
    throw new Error(`bukan berkas batimetri: magic 0x${magic.toString(16).padStart(8, '0')}`)
  }

  const width = view.getUint16(6, true)
  const height = view.getUint16(8, true)
  const levels = view.getUint16(10, true)

  if (buffer.byteLength !== 12 + width * height) {
    throw new Error(
      `batimetri terpotong: ${width}x${height} butuh ${12 + width * height} bita, ada ${buffer.byteLength}`,
    )
  }

  return { width, height, levels, depth: new Uint8Array(buffer, 12, width * height) }
}
