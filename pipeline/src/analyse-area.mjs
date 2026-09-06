import mapshaper from 'mapshaper'
import { useRelativePaths, RAW } from './paths.mjs'
useRelativePaths()

/* Area is what actually matters for a province-movement game: a unit crossing
   one province should take a comparable amount of game time everywhere. The
   number of administrative units a country happens to have is unrelated. */
const r = await mapshaper.applyCommands(
  `-i ${RAW}/shp/ne_10m_admin_1_states_provinces.shp ` +
  `-proj +proj=cea ` +
  `-each 'this.properties.area_km2 = Math.round(this.area / 1e6)' ` +
  `-o out.json format=geojson`, {})

const fc = JSON.parse(Buffer.from(r['out.json']).toString())
const areas = fc.features.map((f) => f.properties.area_km2).filter((a) => a > 0).sort((a, b) => a - b)
const total = areas.reduce((s, a) => s + a, 0)

const q = (p) => areas[Math.floor(areas.length * p)]
console.log(`Unit      : ${areas.length.toLocaleString('id-ID')}`)
console.log(`Luas total: ${(total / 1e6).toFixed(1)} juta km2`)
console.log(`Rata-rata : ${Math.round(total / areas.length).toLocaleString('id-ID')} km2\n`)
console.log('Sebaran luas:')
for (const [lbl, p] of [['p10', .10], ['p25', .25], ['median', .50], ['p75', .75], ['p90', .90], ['p99', .99]])
  console.log(`  ${lbl.padEnd(7)} ${q(p).toLocaleString('id-ID').padStart(10)} km2`)
console.log(`  maks    ${areas.at(-1).toLocaleString('id-ID').padStart(10)} km2`)

const TARGET = 3400
const ideal = Math.round(total / TARGET)
console.log(`\nUntuk ${TARGET.toLocaleString('id-ID')} provinsi, luas ideal = ${ideal.toLocaleString('id-ID')} km2 (sisi ~${Math.round(Math.sqrt(ideal))} km)\n`)

const HI = ideal * 2.5
const LO = ideal * 0.25
const tooBig = fc.features.filter((f) => f.properties.area_km2 > HI)
const tooSmall = areas.filter((a) => a < LO).length
const extra = tooBig.reduce((s, f) => s + Math.round(f.properties.area_km2 / ideal) - 1, 0)

console.log(`Ambang pecah  (> ${Math.round(HI).toLocaleString('id-ID')} km2): ${tooBig.length} unit -> +${extra.toLocaleString('id-ID')} provinsi baru`)
console.log(`Ambang gabung (< ${Math.round(LO).toLocaleString('id-ID')} km2): ${tooSmall.toLocaleString('id-ID')} unit`)
console.log(`\nPerkiraan hasil: ${areas.length} - ~${Math.round(tooSmall * 0.6)} gabung + ${extra} pecah = ~${(areas.length - Math.round(tooSmall * 0.6) + extra).toLocaleString('id-ID')} provinsi`)

console.log('\n8 unit terluas yang harus dipecah:')
for (const f of tooBig.sort((a, b) => b.properties.area_km2 - a.properties.area_km2).slice(0, 8))
  console.log(`  ${(f.properties.adm0_a3 ?? '???')} ${(f.properties.name ?? '?').slice(0, 22).padEnd(24)} ${f.properties.area_km2.toLocaleString('id-ID').padStart(10)} km2 -> ${Math.round(f.properties.area_km2 / ideal)} provinsi`)
