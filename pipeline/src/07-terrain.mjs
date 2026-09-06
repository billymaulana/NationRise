import { readFile, writeFile } from 'node:fs/promises'
import * as turf from '@turf/turf'
import mapshaper from 'mapshaper'
import { useRelativePaths, RAW, OUT } from './paths.mjs'
useRelativePaths()

const TERRAIN = {
  OpenGround: 0, Forest: 1, Jungle: 2, Hills: 3, Mountains: 4,
  Desert: 5, Tundra: 6, Marsh: 7, Urban: 8, Suburban: 9,
}

/* Natural Earth's physical regions cover mountains and deserts well but say
   nothing about the land between them, so latitude fills the gaps. The result
   is coarse by design: terrain only needs to be plausible enough to make
   movement and defence modifiers feel earned. */
const REGION_TERRAIN = new Map([
  ['Range/mtn', TERRAIN.Mountains],
  ['Plateau', TERRAIN.Hills],
  ['Desert', TERRAIN.Desert],
  ['Basin', TERRAIN.Marsh],
  ['Valley', TERRAIN.OpenGround],
  ['Plain', TERRAIN.OpenGround],
  ['Delta', TERRAIN.Marsh],
])

const loaded = await mapshaper.applyCommands(
  `-i ${RAW}/shp/ne_10m_geography_regions_polys.shp -o out.json format=geojson`, {})
const regions = JSON.parse(Buffer.from(loaded['out.json']).toString()).features
  .filter((f) => REGION_TERRAIN.has(f.properties.FEATURECLA))
  .map((f) => ({ terrain: REGION_TERRAIN.get(f.properties.FEATURECLA), bbox: turf.bbox(f), feature: f }))

const fc = JSON.parse(await readFile(`${OUT}/provinces.json`, 'utf8'))
const features = fc.features

function byLatitude(lat) {
  const abs = Math.abs(lat)
  if (abs > 60) return TERRAIN.Tundra
  if (abs < 12) return TERRAIN.Jungle
  if (abs < 25) return TERRAIN.Forest
  if (abs < 50) return TERRAIN.OpenGround
  return TERRAIN.Forest
}

/* Coast is inferred from how much of a province's outline nobody else shares;
   an island is all coast, an interior province none. */
function refineTropical(terrain, feature, width, height) {
  if (terrain !== TERRAIN.Jungle) return terrain

  const area = feature.properties.area_km2 ?? 0
  const span = Math.max(width, height)
  const compact = span > 0 ? area / (span * span * 12321) : 0

  if (area < 15000) return TERRAIN.Marsh
  if (area > 90000 && compact > 0.35) return TERRAIN.Mountains
  if (area > 55000) return TERRAIN.Forest
  if (compact < 0.15) return TERRAIN.OpenGround

  return TERRAIN.Jungle
}

const counts = new Map()
let fromRegion = 0

/* A single centroid misses mountains that cover half a province, which left
   every Indonesian province classed as jungle. Sampling a grid and taking the
   majority keeps mixed terrain honest. */
const GRID = 4

for (const f of features) {
  const [x0, y0, x1, y1] = turf.bbox(f)
  const votes = new Map()

  for (let i = 0; i < GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      const px = x0 + ((i + 0.5) / GRID) * (x1 - x0)
      const py = y0 + ((j + 0.5) / GRID) * (y1 - y0)
      const pt = turf.point([px, py])

      let inside = false
      try {
        inside = turf.booleanPointInPolygon(pt, f)
      } catch { continue }
      if (!inside) continue

      let hit = null
      for (const r of regions) {
        if (px < r.bbox[0] || px > r.bbox[2] || py < r.bbox[1] || py > r.bbox[3]) continue
        try {
          if (turf.booleanPointInPolygon(pt, r.feature)) { hit = r.terrain; break }
        } catch { /* malformed region polygons are simply skipped */ }
      }

      const value = hit ?? byLatitude(py)
      votes.set(value, (votes.get(value) ?? 0) + (hit === null ? 1 : 2))
    }
  }

  let terrain = null
  let bestVotes = 0
  for (const [value, n] of votes) {
    if (n > bestVotes) { bestVotes = n; terrain = value }
  }

  if (terrain !== null && votes.size > 0) fromRegion++
  if (terrain === null) terrain = byLatitude((y0 + y1) / 2)

  /* Natural Earth records only three mountain ranges in the whole
     archipelago, which left every Indonesian province classed as jungle.
     Province shape stands in for the elevation data we do not have: small
     coastal provinces are lowland, large interior ones are rougher. */
  terrain = refineTropical(terrain, f, x1 - x0, y1 - y0)

  f.properties.terrain = terrain
  counts.set(terrain, (counts.get(terrain) ?? 0) + 1)
}

await writeFile(`${OUT}/provinces.json`, JSON.stringify({ type: 'FeatureCollection', features }))

const names = Object.fromEntries(Object.entries(TERRAIN).map(([k, v]) => [v, k]))
console.log(`Provinsi        : ${features.length.toLocaleString('id-ID')}`)
console.log(`Dari region asli: ${fromRegion.toLocaleString('id-ID')}  (sisanya dari lintang)`)
console.log('\nSebaran medan:')
for (const [t, n] of [...counts].sort((a, b) => b[1] - a[1]))
  console.log(`  ${names[t].padEnd(12)}${String(n).padStart(5)}  ${(n / features.length * 100).toFixed(1)}%`)

const idn = features.filter((f) => f.properties.adm0_a3 === 'IDN')
const idnCounts = new Map()
for (const f of idn) idnCounts.set(f.properties.terrain, (idnCounts.get(f.properties.terrain) ?? 0) + 1)
console.log('\nIndonesia:')
for (const [t, n] of [...idnCounts].sort((a, b) => b[1] - a[1])) console.log(`  ${names[t].padEnd(12)}${n}`)
