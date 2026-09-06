import mapshaper from 'mapshaper'
import * as turf from '@turf/turf'
import { useRelativePaths, RAW } from './paths.mjs'
useRelativePaths()

const r = await mapshaper.applyCommands(
  `-i ${RAW}/shp/ne_10m_geography_regions_polys.shp -o out.json format=geojson`, {})
const regions = JSON.parse(Buffer.from(r['out.json']).toString()).features

const INDONESIA = [95, -11, 141, 6]
const inside = regions.filter((f) => {
  const b = turf.bbox(f)
  return b[0] < INDONESIA[2] && b[2] > INDONESIA[0] && b[1] < INDONESIA[3] && b[3] > INDONESIA[1]
})

console.log(`Region geografis yang menyentuh Indonesia: ${inside.length}`)
const kinds = new Map()
for (const f of inside) {
  const k = f.properties.FEATURECLA ?? '?'
  kinds.set(k, (kinds.get(k) ?? 0) + 1)
}
for (const [k, n] of [...kinds].sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(18)}${n}`)

console.log('\nPegunungan dan dataran tinggi di wilayah itu:')
for (const f of inside.filter((x) => ['Range/mtn', 'Plateau'].includes(x.properties.FEATURECLA)))
  console.log(`  ${(f.properties.FEATURECLA ?? '').padEnd(12)}${f.properties.NAME ?? '?'}`)
