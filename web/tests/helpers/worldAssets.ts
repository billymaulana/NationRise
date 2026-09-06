import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/*
 * Aset dunia dihasilkan pipeline dan tidak masuk git, sehingga klon baru tidak
 * memilikinya. Tanpa pesan ini kegagalannya muncul sebagai ENOENT mentah yang
 * tidak memberi tahu apa pun soal cara memperbaikinya.
 */
function load(name: string): Buffer {
  const path = fileURLToPath(new URL(`../../public/data/${name}`, import.meta.url))

  try {
    return readFileSync(path)
  } catch (cause) {
    throw new Error(
      `aset dunia "${name}" tidak ada di public/data. Jalankan "pnpm data" untuk menyalinnya dari keluaran pipeline.`,
      { cause },
    )
  }
}

export function worldBinary(): ArrayBuffer {
  const bytes = load('world.bin')

  /* Salin ke ArrayBuffer baru alih-alih memandang Buffer.buffer: yang terakhir
     bertipe ArrayBufferLike, bisa berupa SharedArrayBuffer, dan node memakai
     satu buffer bersama di balik banyak Buffer sehingga irisannya bisa memuat
     data berkas lain. */
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
}

export function provinceNames(count: number): string[] {
  const names = new Array<string>(count).fill('')
  const geo = JSON.parse(load('provinces.geojson').toString('utf8')) as {
    features: { properties: { id: number; name?: string } }[]
  }

  for (const feature of geo.features) {
    const { id, name } = feature.properties
    if (id >= 0 && id < count) names[id] = name ?? ''
  }

  return names
}
