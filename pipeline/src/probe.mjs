import mapshaper from 'mapshaper'
import { useRelativePaths, RAW } from './paths.mjs'
useRelativePaths()
const r = await mapshaper.applyCommands(`-i ${RAW}/shp/ne_10m_geography_regions_polys.shp -o out.json format=geojson`, {})
const fc = JSON.parse(Buffer.from(r['out.json']).toString())
const p = fc.features[0].properties
console.log('Atribut:', Object.keys(p).join(', '))
console.log('Contoh:', JSON.stringify(p).slice(0, 300))
const key = Object.keys(p).find((k) => /class|type|cla/i.test(k))
if (key) {
  const kinds = new Map()
  for (const f of fc.features) {
    const v = f.properties[key] ?? '?'
    kinds.set(v, (kinds.get(v) ?? 0) + 1)
  }
  console.log(`\nSebaran "${key}":`)
  for (const [k, n] of [...kinds].sort((a, b) => b[1] - a[1]).slice(0, 14)) console.log(`  ${String(k).padEnd(26)}${n}`)
}
