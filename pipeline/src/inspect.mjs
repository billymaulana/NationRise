import mapshaper from 'mapshaper'
import { useRelativePaths, RAW } from './paths.mjs'

useRelativePaths()

const result = await mapshaper.applyCommands(
  `-i ${RAW}/ne_10m_admin_1_states_provinces.zip -o out.json format=geojson`,
  {}
)

const fc = JSON.parse(Buffer.from(result['out.json']).toString())
console.log(`Total fitur admin-1: ${fc.features.length.toLocaleString('id-ID')}`)

const perCountry = new Map()
for (const f of fc.features) {
  const key = f.properties.adm0_a3 ?? '???'
  perCountry.set(key, (perCountry.get(key) ?? 0) + 1)
}

console.log(`Negara berbeda: ${perCountry.size}`)
console.log('\n10 negara dengan provinsi terbanyak:')
for (const [tag, n] of [...perCountry].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${tag}  ${String(n).padStart(4)}`)
}

console.log('\nIndonesia dan tetangga:')
for (const tag of ['IDN', 'MYS', 'PHL', 'PNG', 'AUS', 'TLS', 'BRN', 'SGP']) {
  console.log(`  ${tag}  ${String(perCountry.get(tag) ?? 0).padStart(4)}`)
}

const sample = fc.features.find((f) => f.properties.adm0_a3 === 'IDN')
const useful = Object.keys(sample.properties).filter((k) => sample.properties[k] !== null)
console.log(`\nAtribut tersedia (${useful.length}):`)
console.log('  ' + useful.slice(0, 20).join(', '))
console.log('\nContoh provinsi Indonesia:')
console.log('  name:', sample.properties.name, '| type:', sample.properties.type_en, '| iso:', sample.properties.iso_3166_2)
