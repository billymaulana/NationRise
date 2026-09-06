import mapshaper from 'mapshaper'
import { useRelativePaths, RAW } from './paths.mjs'
useRelativePaths()

async function load(path) {
  const r = await mapshaper.applyCommands(
    `-i ${path} -proj +proj=cea -each 'this.properties.area_km2 = Math.round(this.area / 1e6)' -o out.json format=geojson`, {})
  return JSON.parse(Buffer.from(r['out.json']).toString()).features
}

const countries = (await load(`${RAW}/shp/ne_10m_admin_0_countries.shp`))
  .filter((c) => c.properties.ADM0_A3 !== 'ATA' && (c.properties.area_km2 ?? 0) > 0)
  .map((c) => ({ tag: c.properties.ADM0_A3, area: c.properties.area_km2, pop: Math.max(c.properties.POP_EST ?? 0, 0) }))

const totalArea = countries.reduce((s, c) => s + c.area, 0)
const totalPop = countries.reduce((s, c) => s + c.pop, 0)

/* Indonesia is the anchor rather than a fitted point: the map research fixed
   it at 54 provinces, and the player spends every campaign there. Matching
   Conflict of Nations elsewhere is secondary to that. */
const ANCHOR = { tag: 'IDN', provinces: 54 }
const AREA_WEIGHT = 0.55
const CAP = 90
const FLOOR = 2

const idn = countries.find((c) => c.tag === ANCHOR.tag)
const idnShare = AREA_WEIGHT * (idn.area / totalArea) + (1 - AREA_WEIGHT) * (idn.pop / totalPop)
const scale = ANCHOR.provinces / idnShare

function provincesFor(c) {
  const share = AREA_WEIGHT * (c.area / totalArea) + (1 - AREA_WEIGHT) * (c.pop / totalPop)
  return Math.min(CAP, Math.max(FLOOR, Math.round(share * scale)))
}

const alloc = new Map(countries.map((c) => [c.tag, provincesFor(c)]))
const total = [...alloc.values()].reduce((s, n) => s + n, 0)

console.log(`Jangkar: ${ANCHOR.tag} = ${ANCHOR.provinces} provinsi, bobot luas ${AREA_WEIGHT}`)
console.log(`Total provinsi: ${total.toLocaleString('id-ID')}\n`)

console.log('Negara besar:')
for (const t of ['RUS','CAN','CHN','USA','BRA','AUS','IND','IDN','ARG','KAZ','DZA','MEX'])
  console.log(`  ${t}  ${String(alloc.get(t) ?? 0).padStart(3)}`)

console.log('\nTetangga Indonesia:')
for (const t of ['MYS','PHL','PNG','TLS','BRN','SGP','THA','VNM','AUS'])
  console.log(`  ${t}  ${String(alloc.get(t) ?? 0).padStart(3)}`)

console.log('\nEropa dan Asia Timur:')
for (const t of ['DEU','GBR','FRA','ITA','ESP','POL','JPN','KOR','NLD','BEL'])
  console.log(`  ${t}  ${String(alloc.get(t) ?? 0).padStart(3)}`)

console.log('\nPembanding Conflict of Nations: USA 82, IDN 53, DEU 44')
const d = [...alloc.values()].sort((a, b) => b - a)
console.log(`Sebaran: maks ${d[0]}, median ${d[Math.floor(d.length/2)]}, min ${d.at(-1)}`)
console.log(`Kena batas atas ${CAP}: ${d.filter((n) => n === CAP).length} negara`)
console.log(`Kena batas bawah ${FLOOR}: ${d.filter((n) => n === FLOOR).length} negara`)
