import { readFile, writeFile } from 'node:fs/promises'
import * as turf from '@turf/turf'
import { useRelativePaths, OUT } from './paths.mjs'
useRelativePaths()

/* Land adjacency alone leaves every island unreachable, which would make an
   archipelago nation unplayable. Sea links connect coastal provinces that sit
   within a short crossing of each other; the threshold is deliberately small
   so fleets still matter for anything further. */
const MAX_CROSSING_KM = 250
const BOUNDARY_SAMPLES = 200

const fc = JSON.parse(await readFile(`${OUT}/provinces.json`, 'utf8'))
const land = JSON.parse(await readFile(`${OUT}/adjacency.json`, 'utf8'))
const features = fc.features

const landNeighbours = features.map((_, id) =>
  new Set(land.neighbours.slice(land.offsets[id], land.offsets[id + 1])))

const boxes = features.map((f) => turf.bbox(f))
const centres = boxes.map((b) => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2])

const seaNeighbours = features.map(() => new Set())
const degPad = MAX_CROSSING_KM / 111 + 0.5

let checked = 0
for (let a = 0; a < features.length; a++) {
  for (let b = a + 1; b < features.length; b++) {
    if (landNeighbours[a].has(b)) continue

    const ba = boxes[a]
    const bb = boxes[b]
    if (ba[0] - bb[2] > degPad || bb[0] - ba[2] > degPad) continue
    if (ba[1] - bb[3] > degPad || bb[1] - ba[3] > degPad) continue

    checked++

    /* Centre-to-centre distance is not a usable filter: Sakhalin sits 223 km
       from the mainland but its centre is 1,154 km away, so any such shortcut
       silently strands elongated provinces. The bounding-box test above is
       the only prefilter that stays correct. */
    const gap = minimumGapKm(features[a], features[b])
    if (gap <= MAX_CROSSING_KM) {
      seaNeighbours[a].add(b)
      seaNeighbours[b].add(a)
    }
  }
}

function minimumGapKm(a, b) {
  const pointsA = sampleBoundary(a, BOUNDARY_SAMPLES)
  const pointsB = sampleBoundary(b, BOUNDARY_SAMPLES)
  let best = Infinity

  for (const pa of pointsA) {
    for (const pb of pointsB) {
      const d = turf.distance(turf.point(pa), turf.point(pb), { units: 'kilometers' })
      if (d < best) best = d
      if (best <= 1) return best
    }
  }

  return best
}

function sampleBoundary(feature, limit) {
  const all = []
  const stack = [feature.geometry.coordinates]
  while (stack.length > 0) {
    const node = stack.pop()
    if (typeof node[0] === 'number') {
      all.push(node)
      continue
    }
    for (const child of node) stack.push(child)
  }
  if (all.length <= limit) return all
  const step = Math.ceil(all.length / limit)
  return all.filter((_, i) => i % step === 0)
}

const offsets = new Int32Array(features.length + 1)
const flat = []
features.forEach((_, id) => {
  offsets[id] = flat.length
  flat.push(...[...seaNeighbours[id]].sort((x, y) => x - y))
})
offsets[features.length] = flat.length

await writeFile(`${OUT}/sea-links.json`, JSON.stringify({
  count: features.length,
  maxCrossingKm: MAX_CROSSING_KM,
  offsets: [...offsets],
  neighbours: flat,
}))

const stillIsolated = features.filter((_, id) =>
  landNeighbours[id].size === 0 && seaNeighbours[id].size === 0).length

console.log(`Pasangan diperiksa : ${checked.toLocaleString('id-ID')}`)
console.log(`Tautan laut        : ${(flat.length / 2).toLocaleString('id-ID')}`)
console.log(`Ambang penyeberangan: ${MAX_CROSSING_KM} km`)
console.log(`\nTerisolasi sebelum : 129`)
console.log(`Terisolasi sesudah : ${stillIsolated}`)

const idn = features.map((f, i) => (f.properties.adm0_a3 === 'IDN' ? i : -1)).filter((i) => i >= 0)
const idnSea = idn.reduce((s, i) => s + seaNeighbours[i].size, 0) / 2
console.log(`\nIndonesia: ${Math.round(idnSea)} tautan laut internal`)
console.log(`  masih terisolasi: ${idn.filter((i) => landNeighbours[i].size === 0 && seaNeighbours[i].size === 0).length}`)
