import * as turf from '@turf/turf'
import { cluster } from './kmeans.mjs'

/* Splits one polygon into `parts` pieces by scattering sample points inside
   it, clustering them, and cutting the polygon along the Voronoi cells of the
   cluster centres. Sampling rather than pure Voronoi keeps the pieces roughly
   equal in area even when the shape is long or full of holes. */
export function splitPolygon(feature, parts, seed) {
  if (parts <= 1) return [feature]

  const samples = scatter(feature, parts * 40)
  if (samples.length < parts * 3) return [feature]

  const assign = cluster(samples.map((p) => [p[0], p[1], 1]), parts, seed)
  const centres = []
  for (let c = 0; c < parts; c++) {
    const own = samples.filter((_, i) => assign[i] === c)
    if (own.length === 0) continue
    centres.push([
      own.reduce((s, p) => s + p[0], 0) / own.length,
      own.reduce((s, p) => s + p[1], 0) / own.length,
    ])
  }

  if (centres.length < 2) return [feature]

  const bbox = turf.bbox(feature)
  const pad = 0.5
  const cells = turf.voronoi(
    turf.featureCollection(centres.map((c) => turf.point(c))),
    { bbox: [bbox[0] - pad, bbox[1] - pad, bbox[2] + pad, bbox[3] + pad] }
  )

  const pieces = []
  for (const cell of cells.features) {
    if (!cell) continue
    let clipped
    try {
      clipped = turf.intersect(turf.featureCollection([feature, cell]))
    } catch {
      continue
    }
    if (!clipped) continue
    clipped.properties = { ...feature.properties }
    pieces.push(clipped)
  }

  return pieces.length >= 2 ? pieces : [feature]
}

function scatter(feature, count) {
  const [minX, minY, maxX, maxY] = turf.bbox(feature)
  const step = Math.sqrt(((maxX - minX) * (maxY - minY)) / Math.max(count, 1))
  const points = []

  for (let x = minX + step / 2; x < maxX; x += step) {
    for (let y = minY + step / 2; y < maxY; y += step) {
      if (turf.booleanPointInPolygon(turf.point([x, y]), feature)) {
        points.push([x, y])
      }
    }
  }

  return points
}
