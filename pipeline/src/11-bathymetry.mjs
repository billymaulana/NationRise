import { mkdir, writeFile } from 'node:fs/promises'
import mapshaper from 'mapshaper'
import { useRelativePaths, RAW, OUT } from './paths.mjs'
useRelativePaths()

const MAGIC = 0x4e524254
const FORMAT_VERSION = 1

/* Six samples per degree. Natural Earth generalises these contours for a
   1:10,000,000 sheet, so finer sampling would only interpolate detail the
   source never had; coarser and the closest zoom the camera allows shows the
   texels, because two degrees of latitude fill a ninety-pixel screen there. */
const WIDTH = 2160
const HEIGHT = 1080

/* Each isobath is a separate sheet whose polygon nests inside the next
   shallower one, so painting from 200 m downwards leaves every texel holding
   the deepest contour that still reaches it. Everything the sheets never cover
   — land, and water shallower than 200 m — keeps level zero, which is what
   puts the bright shelf tone around every coast for free. */
const SHEETS = [200, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]
const LETTERS = ['K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A']
const DEEPEST_LEVEL = SHEETS.length

/* Two box passes of this radius carry a variance of 2r(r+1)/3, so the contour
   steps dissolve over about two texels. Less and the twelve levels read as
   twelve painted bands; more and the shelf break stops being an edge. */
const BLUR_RADIUS = 2
const BLUR_PASSES = 2

const PROBES = [
  ['Laut Jawa', 112.0, -5.0],
  ['Palung Sunda', 110.0, -10.6],
  ['Selat Makassar', 118.0, -2.0],
  ['Laut Banda', 127.0, -5.5],
  ['Cekungan Pasifik', -150.0, 20.0],
  ['Laut Utara', 3.0, 55.0],
]

const grid = new Uint8Array(WIDTH * HEIGHT)

function pixelX(longitude) {
  return (longitude + 180) * (WIDTH / 360)
}

function pixelY(latitude) {
  return (90 - latitude) * (HEIGHT / 180)
}

/* A scanline fill over an active edge table: without it every row would walk
   all of a sheet's edges, and the 200 m sheet alone carries a hundred and
   eighty thousand points across a thousand rows. */
function paint(rings, level) {
  const starts = []
  let topRow = HEIGHT
  let bottomRow = -1

  for (const ring of rings) {
    for (let i = 0; i + 1 < ring.length; i++) {
      const ax = pixelX(ring[i][0])
      const ay = pixelY(ring[i][1])
      const bx = pixelX(ring[i + 1][0])
      const by = pixelY(ring[i + 1][1])
      if (ay === by) continue

      const first = Math.max(0, Math.ceil(Math.min(ay, by) - 0.5))
      const last = Math.min(HEIGHT - 1, Math.floor(Math.max(ay, by) - 0.5))
      if (first > last) continue

      ;(starts[first] ??= []).push(ax, ay, bx, by, last)
      if (first < topRow) topRow = first
      if (last > bottomRow) bottomRow = last
    }
  }

  let active = []
  const crossings = []

  for (let row = topRow; row <= bottomRow; row++) {
    const arriving = starts[row]
    if (arriving) for (const value of arriving) active.push(value)
    if (active.length === 0) continue

    const y = row + 0.5
    crossings.length = 0

    for (let e = 0; e < active.length; e += 5) {
      if (active[e + 4] < row) {
        const tail = active.length - 5
        for (let k = 0; k < 5; k++) active[e + k] = active[tail + k]
        active.length = tail
        e -= 5
        continue
      }

      const ay = active[e + 1]
      const by = active[e + 3]
      if ((ay <= y) === (by <= y)) continue
      crossings.push(active[e] + ((y - ay) / (by - ay)) * (active[e + 2] - active[e]))
    }

    if (crossings.length < 2) continue
    crossings.sort((a, b) => a - b)

    const base = row * WIDTH
    for (let i = 0; i + 1 < crossings.length; i += 2) {
      const from = Math.max(0, Math.ceil(crossings[i] - 0.5))
      const to = Math.min(WIDTH - 1, Math.floor(crossings[i + 1] - 0.5))
      for (let x = from; x <= to; x++) grid[base + x] = level
    }
  }
}

async function sheet(letter, metres) {
  const loaded = await mapshaper.applyCommands(
    `-i ${RAW}/shp/ne_10m_bathymetry_${letter}_${metres}.shp -o out.json format=geojson`, {})
  const collection = JSON.parse(Buffer.from(loaded['out.json']).toString())

  for (const feature of collection.features) {
    if (feature.properties.depth !== metres) {
      throw new Error(`lembar ${letter} menyebut kedalaman ${feature.properties.depth}, bukan ${metres}`)
    }
  }

  return collection.features
}

for (const [index, metres] of SHEETS.entries()) {
  const features = await sheet(LETTERS[index], metres)
  const level = index + 1

  for (const feature of features) {
    const { type, coordinates } = feature.geometry
    const polygons = type === 'Polygon' ? [coordinates] : coordinates
    /* Rings of one polygon are filled together so the even-odd rule turns its
       holes back into shallower water; separate polygons are kept apart so two
       that touch cannot cancel each other out. */
    for (const rings of polygons) paint(rings, level)
  }

  console.log(`  ${String(metres).padStart(5)} m  ${String(features.length).padStart(4)} poligon`)
}

const field = new Float32Array(WIDTH * HEIGHT)
for (let i = 0; i < field.length; i++) field[i] = grid[i] / DEEPEST_LEVEL

const scratch = new Float32Array(field.length)

function blurRows(source, target) {
  const span = BLUR_RADIUS * 2 + 1

  for (let row = 0; row < HEIGHT; row++) {
    const base = row * WIDTH
    let sum = 0
    /* Longitude wraps, so the window has to reach around the antimeridian
       rather than clamp: the Pacific is one ocean, not two edges. */
    for (let k = -BLUR_RADIUS; k <= BLUR_RADIUS; k++) sum += source[base + ((k + WIDTH) % WIDTH)]

    for (let x = 0; x < WIDTH; x++) {
      target[base + x] = sum / span
      sum -= source[base + ((x - BLUR_RADIUS + WIDTH) % WIDTH)]
      sum += source[base + ((x + BLUR_RADIUS + 1) % WIDTH)]
    }
  }
}

function blurColumns(source, target) {
  const span = BLUR_RADIUS * 2 + 1

  for (let x = 0; x < WIDTH; x++) {
    let sum = 0
    for (let k = -BLUR_RADIUS; k <= BLUR_RADIUS; k++) {
      sum += source[Math.min(HEIGHT - 1, Math.max(0, k)) * WIDTH + x]
    }

    for (let row = 0; row < HEIGHT; row++) {
      target[row * WIDTH + x] = sum / span
      sum -= source[Math.min(HEIGHT - 1, Math.max(0, row - BLUR_RADIUS)) * WIDTH + x]
      sum += source[Math.min(HEIGHT - 1, Math.max(0, row + BLUR_RADIUS + 1)) * WIDTH + x]
    }
  }
}

for (let pass = 0; pass < BLUR_PASSES; pass++) {
  blurRows(field, scratch)
  blurColumns(scratch, field)
}

const depth = Buffer.alloc(12 + WIDTH * HEIGHT)
depth.writeUInt32LE(MAGIC, 0)
depth.writeUInt16LE(FORMAT_VERSION, 4)
depth.writeUInt16LE(WIDTH, 6)
depth.writeUInt16LE(HEIGHT, 8)
depth.writeUInt16LE(DEEPEST_LEVEL, 10)
for (let i = 0; i < field.length; i++) depth[12 + i] = Math.round(field[i] * 255)

await mkdir(`${OUT}/game`, { recursive: true })
await writeFile(`${OUT}/game/bathymetry.bin`, depth)

const installed = new URL('../../game/data/bathymetry.bin', import.meta.url)
await mkdir(new URL('.', installed), { recursive: true })

/* The renderer reads from game/data, and no step in this pipeline installs
   anything there, so this one carries its own artefact across. */
await writeFile(installed, depth)

const histogram = new Array(DEEPEST_LEVEL + 1).fill(0)
for (const level of grid) histogram[level]++

console.log(`\nbathymetry.bin     : ${(depth.length / 1024).toFixed(0)} KB  (${WIDTH}x${HEIGHT}, ${DEEPEST_LEVEL + 1} tingkat)`)
console.log('\nSebaran tingkat (sebelum pelunakan):')
histogram.forEach((n, level) => {
  const label = level === 0 ? 'darat / <200 m' : `${SHEETS[level - 1]} m`
  console.log(`  ${label.padEnd(15)}${String(n).padStart(9)}  ${(n / grid.length * 100).toFixed(1)}%`)
})

console.log('\nUji titik:')
for (const [name, longitude, latitude] of PROBES) {
  const x = Math.min(WIDTH - 1, Math.max(0, Math.floor(pixelX(longitude))))
  const y = Math.min(HEIGHT - 1, Math.max(0, Math.floor(pixelY(latitude))))
  const level = grid[y * WIDTH + x]
  const metres = level === 0 ? '<200' : `>${SHEETS[level - 1]}`
  console.log(`  ${name.padEnd(18)}tingkat ${level}  (${metres} m)  bita ${depth[12 + y * WIDTH + x]}`)
}
