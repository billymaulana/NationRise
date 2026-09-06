import { cp, mkdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * Data dunia tidak digandakan sebagai sumber kebenaran. Pipeline tetap
 * satu-satunya penghasilnya; skrip ini hanya menyalin keluarannya ke aset
 * publik supaya peramban bisa mengambilnya.
 */
const here = dirname(fileURLToPath(import.meta.url))
const source = join(here, '..', '..', 'pipeline', 'out', 'game')
const target = join(here, '..', 'public', 'data')

const artefacts = ['provinces.geojson', 'world.bin', 'nations.json', 'bathymetry.bin']

await mkdir(target, { recursive: true })

let copied = 0
for (const name of artefacts) {
  const from = join(source, name)

  try {
    await stat(from)
  } catch {
    console.error(`  hilang: ${name} — jalankan pipeline lebih dulu`)
    continue
  }

  await cp(from, join(target, name))
  const { size } = await stat(join(target, name))
  console.log(`  ${name.padEnd(20)} ${(size / 1024).toFixed(0)} KB`)
  copied++
}

if (copied !== artefacts.length) {
  console.error(`\n${artefacts.length - copied} berkas tidak tersalin`)
  process.exit(1)
}

console.log(`\n${copied} berkas disalin ke public/data`)
