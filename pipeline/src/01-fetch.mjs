import { createWriteStream } from 'node:fs'
import { mkdir, stat } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const rawDir = join(here, '..', 'raw')

const SOURCES = [
  {
    name: 'admin-1 provinces',
    file: 'ne_10m_admin_1_states_provinces.zip',
    url: 'https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_1_states_provinces.zip',
  },
  {
    name: 'admin-0 countries',
    file: 'ne_10m_admin_0_countries.zip',
    url: 'https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_0_countries.zip',
  },
  {
    name: 'geography regions',
    file: 'ne_10m_geography_regions_polys.zip',
    url: 'https://naciscdn.org/naturalearth/10m/physical/ne_10m_geography_regions_polys.zip',
  },
  {
    name: 'rivers and lakes',
    file: 'ne_10m_rivers_lake_centerlines.zip',
    url: 'https://naciscdn.org/naturalearth/10m/physical/ne_10m_rivers_lake_centerlines.zip',
  },
  {
    name: 'populated places',
    file: 'ne_10m_populated_places.zip',
    url: 'https://naciscdn.org/naturalearth/10m/cultural/ne_10m_populated_places.zip',
  },
]

async function alreadyFetched(path) {
  try {
    const info = await stat(path)
    return info.size > 0
  } catch {
    return false
  }
}

async function download({ name, file, url }) {
  const target = join(rawDir, file)

  if (await alreadyFetched(target)) {
    const { size } = await stat(target)
    console.log(`  skip  ${name.padEnd(22)} ${(size / 1e6).toFixed(1)} MB (sudah ada)`)
    return
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${name}: HTTP ${response.status} dari ${url}`)
  }

  await pipeline(Readable.fromWeb(response.body), createWriteStream(target))
  const { size } = await stat(target)
  console.log(`  ok    ${name.padEnd(22)} ${(size / 1e6).toFixed(1)} MB`)
}

await mkdir(rawDir, { recursive: true })
console.log(`Mengunduh ${SOURCES.length} berkas Natural Earth ke pipeline/raw/`)

for (const source of SOURCES) {
  await download(source)
}

console.log('Selesai.')
