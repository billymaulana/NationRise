import { writeFile, mkdir } from 'node:fs/promises'
import mapshaper from 'mapshaper'
import { useRelativePaths, RAW, OUT } from './paths.mjs'
useRelativePaths()

const AREA_WEIGHT = 0.55
const CAP = 90
const FLOOR = 2
const ANCHOR_TAG = 'IDN'
const ANCHOR_PROVINCES = 54

const r = await mapshaper.applyCommands(
  `-i ${RAW}/shp/ne_10m_admin_0_countries.shp -proj +proj=cea ` +
  `-each 'this.properties.area_km2 = Math.round(this.area / 1e6)' -o out.json format=geojson`, {})

const countries = JSON.parse(Buffer.from(r['out.json']).toString()).features
  .filter((c) => c.properties.ADM0_A3 !== 'ATA' && (c.properties.area_km2 ?? 0) > 0)
  .map((c) => ({
    tag: c.properties.ADM0_A3,
    name: c.properties.NAME ?? c.properties.ADM0_A3,
    area: c.properties.area_km2,
    pop: Math.max(c.properties.POP_EST ?? 0, 0),
  }))

const totalArea = countries.reduce((s, c) => s + c.area, 0)
const totalPop = countries.reduce((s, c) => s + c.pop, 0)

/* Blending area with population, then anchoring the scale on Indonesia, keeps
   empty land from swallowing the map while still giving the player's nation
   the province count the map research settled on. */
const shareOf = (c) => AREA_WEIGHT * (c.area / totalArea) + (1 - AREA_WEIGHT) * (c.pop / totalPop)
const anchor = countries.find((c) => c.tag === ANCHOR_TAG)
const scale = ANCHOR_PROVINCES / shareOf(anchor)

const allocation = countries
  .map((c) => ({
    tag: c.tag,
    name: c.name,
    areaKm2: c.area,
    population: c.pop,
    provinces: Math.min(CAP, Math.max(FLOOR, Math.round(shareOf(c) * scale))),
  }))
  .sort((a, b) => b.provinces - a.provinces)

const total = allocation.reduce((s, c) => s + c.provinces, 0)

await mkdir(OUT, { recursive: true })
await writeFile(
  `${OUT}/allocation.json`,
  JSON.stringify({ areaWeight: AREA_WEIGHT, cap: CAP, floor: FLOOR, total, nations: allocation }, null, 2)
)

console.log(`Alokasi ditulis ke ${OUT}/allocation.json`)
console.log(`  negara         : ${allocation.length}`)
console.log(`  total provinsi : ${total.toLocaleString('id-ID')}`)
console.log(`  Indonesia      : ${allocation.find((c) => c.tag === 'IDN').provinces}`)
console.log('\n12 negara terbesar:')
for (const c of allocation.slice(0, 12)) {
  console.log(`  ${c.tag}  ${String(c.provinces).padStart(3)}  ${c.name}`)
}
