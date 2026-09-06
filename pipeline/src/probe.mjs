import mapshaper from 'mapshaper'
import { useRelativePaths, RAW } from './paths.mjs'
useRelativePaths()

const r = await mapshaper.applyCommands(
  `-i ${RAW}/shp/ne_10m_admin_1_states_provinces.shp -o out.json format=geojson`, {})

const fc = JSON.parse(Buffer.from(r['out.json']).toString())
console.log(`Total fitur: ${fc.features.length.toLocaleString('id-ID')}`)

const per = new Map()
for (const f of fc.features) {
  const k = f.properties.adm0_a3 ?? '???'
  per.set(k, (per.get(k) ?? 0) + 1)
}
console.log(`Negara: ${per.size}`)
console.log('\nTerbanyak:')
for (const [t, n] of [...per].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${t} ${String(n).padStart(4)}`)
console.log('\nIndonesia dan tetangga:')
for (const t of ['IDN', 'MYS', 'PHL', 'PNG', 'AUS', 'TLS', 'BRN', 'SGP']) console.log(`  ${t} ${String(per.get(t) ?? 0).padStart(4)}`)
const s = fc.features.find((f) => f.properties.adm0_a3 === 'IDN')
console.log(`\nContoh IDN: ${s.properties.name} (${s.properties.type_en}) iso=${s.properties.iso_3166_2}`)
