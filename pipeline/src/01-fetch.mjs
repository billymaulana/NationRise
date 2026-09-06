import { createWriteStream } from 'node:fs'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { inflateRawSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { basename, dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const rawDir = join(here, '..', 'raw')
const shpDir = join(rawDir, 'shp')

const PHYSICAL = 'https://naciscdn.org/naturalearth/10m/physical'
const CULTURAL = 'https://naciscdn.org/naturalearth/10m/cultural'

/* Depth contours come one shapefile per isobath, each polygon nested inside
   the next shallower one. The 0 m sheet is deliberately absent: it marks the
   sea surface, and the raster already starts at the shallowest level, so
   fetching three more megabytes would paint the value that is already there. */
const BATHYMETRY = [
  ['K', 200], ['J', 1000], ['I', 2000], ['H', 3000], ['G', 4000], ['F', 5000],
  ['E', 6000], ['D', 7000], ['C', 8000], ['B', 9000], ['A', 10000],
]

const SOURCES = [
  {
    name: 'admin-1 provinces',
    file: 'ne_10m_admin_1_states_provinces.zip',
    url: `${CULTURAL}/ne_10m_admin_1_states_provinces.zip`,
  },
  {
    name: 'admin-0 countries',
    file: 'ne_10m_admin_0_countries.zip',
    url: `${CULTURAL}/ne_10m_admin_0_countries.zip`,
  },
  {
    name: 'geography regions',
    file: 'ne_10m_geography_regions_polys.zip',
    url: `${PHYSICAL}/ne_10m_geography_regions_polys.zip`,
  },
  {
    name: 'rivers and lakes',
    file: 'ne_10m_rivers_lake_centerlines.zip',
    url: `${PHYSICAL}/ne_10m_rivers_lake_centerlines.zip`,
  },
  {
    name: 'populated places',
    file: 'ne_10m_populated_places.zip',
    url: `${CULTURAL}/ne_10m_populated_places.zip`,
  },
  ...BATHYMETRY.map(([letter, metres]) => ({
    name: `bathymetry ${metres} m`,
    file: `ne_10m_bathymetry_${letter}_${metres}.zip`,
    url: `${PHYSICAL}/ne_10m_bathymetry_${letter}_${metres}.zip`,
  })),
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

const EOCD_SIGNATURE = 0x06054b50
const CENTRAL_SIGNATURE = 0x02014b50

function endOfCentralDirectory(zip) {
  const earliest = Math.max(0, zip.length - 0xffff - 22)
  for (let at = zip.length - 22; at >= earliest; at--) {
    if (zip.readUInt32LE(at) === EOCD_SIGNATURE) return at
  }
  throw new Error('katalog zip tidak ditemukan')
}

function* membersOf(zip) {
  const eocd = endOfCentralDirectory(zip)
  const total = zip.readUInt16LE(eocd + 10)
  let at = zip.readUInt32LE(eocd + 16)

  for (let i = 0; i < total; i++) {
    if (zip.readUInt32LE(at) !== CENTRAL_SIGNATURE) {
      throw new Error('katalog zip rusak')
    }

    const method = zip.readUInt16LE(at + 10)
    const compressed = zip.readUInt32LE(at + 20)
    const nameLength = zip.readUInt16LE(at + 28)
    const extraLength = zip.readUInt16LE(at + 30)
    const commentLength = zip.readUInt16LE(at + 32)
    const localAt = zip.readUInt32LE(at + 42)
    const name = zip.toString('utf8', at + 46, at + 46 + nameLength)

    /* The local header repeats name and extra fields at its own lengths, which
       archivers are free to make different from the catalogue's. Trusting the
       catalogue's lengths here lands a few bytes into the payload. */
    const start = localAt + 30 + zip.readUInt16LE(localAt + 26) + zip.readUInt16LE(localAt + 28)
    const payload = zip.subarray(start, start + compressed)

    yield { name, data: method === 0 ? payload : inflateRawSync(payload) }
    at += 46 + nameLength + extraLength + commentLength
  }
}

async function extract(file) {
  const zip = await readFile(join(rawDir, file))
  let written = 0

  for (const member of membersOf(zip)) {
    if (member.name.endsWith('/')) continue
    await writeFile(join(shpDir, basename(member.name)), member.data)
    written++
  }

  return written
}

await mkdir(rawDir, { recursive: true })
await mkdir(shpDir, { recursive: true })
console.log(`Mengunduh ${SOURCES.length} berkas Natural Earth ke pipeline/raw/`)

for (const source of SOURCES) {
  await download(source)
}

console.log('\nMembongkar ke pipeline/raw/shp/')
let members = 0
for (const source of SOURCES) {
  members += await extract(source.file)
}
console.log(`  ${members} berkas dari ${SOURCES.length} arsip`)

console.log('Selesai.')
