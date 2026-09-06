import mapshaper from 'mapshaper'
import { useRelativePaths, RAW } from './paths.mjs'
useRelativePaths()

const r = await mapshaper.applyCommands(
  `-i ${RAW}/shp/ne_10m_admin_1_states_provinces.shp -o out.json format=geojson`, {})
const fc = JSON.parse(Buffer.from(r['out.json']).toString())

const have = new Map()
for (const f of fc.features) {
  const k = f.properties.adm0_a3 ?? '???'
  have.set(k, (have.get(k) ?? 0) + 1)
}

/* Target allocation from the world model: 20 large nations at 78 provinces,
   50 medium at 22, 125 small at 6. Nations are bucketed by how many admin-1
   units they already have as a rough proxy for size until real area data
   is wired in. */
const LARGE = ['RUS','CAN','CHN','USA','BRA','AUS','IND','ARG','KAZ','DZA','COD','SAU','MEX','IDN','SDN','LBY','IRN','MNG','PER','TCD']
const MEDIUM = ['NER','AGO','MLI','ZAF','COL','ETH','BOL','MRT','EGY','TZA','NGA','VEN','NAM','PAK','MOZ','TUR','CHL','ZMB','MMR','AFG','SSD','FRA','SOM','CAF','UKR','MDG','BWA','KEN','YEM','THA','ESP','TKM','CMR','PNG','SWE','UZB','MAR','IRQ','PRY','ZWE','JPN','DEU','COG','FIN','VNM','MYS','NOR','POL','OMN','ITA']

function target(tag) {
  if (LARGE.includes(tag)) return 78
  if (MEDIUM.includes(tag)) return 22
  return 6
}

let merge = 0, split = 0, keep = 0, total = 0
const worstMerge = [], worstSplit = []

for (const [tag, n] of have) {
  const t = target(tag)
  total += t
  const d = n - t
  if (d > 2) { merge += d; worstMerge.push([tag, n, t, d]) }
  else if (d < -2) { split += -d; worstSplit.push([tag, n, t, -d]) }
  else keep++
}

console.log(`Natural Earth admin-1 : ${fc.features.length.toLocaleString('id-ID')} unit di ${have.size} negara`)
console.log(`Target model dunia    : ${total.toLocaleString('id-ID')} provinsi\n`)
console.log(`Perlu DIGABUNG : ${merge.toLocaleString('id-ID')} unit`)
console.log(`Perlu DIPECAH  : ${split.toLocaleString('id-ID')} unit  <- ini yang tidak diperkirakan`)
console.log(`Sudah pas      : ${keep} negara\n`)

console.log('10 negara paling perlu DIGABUNG (punya jauh lebih banyak dari target):')
for (const [t, n, tg, d] of worstMerge.sort((a,b)=>b[3]-a[3]).slice(0,10))
  console.log(`  ${t}  punya ${String(n).padStart(4)}  target ${String(tg).padStart(3)}  gabung ${String(d).padStart(4)}`)

console.log('\n10 negara paling perlu DIPECAH (punya jauh lebih sedikit):')
for (const [t, n, tg, d] of worstSplit.sort((a,b)=>b[3]-a[3]).slice(0,10))
  console.log(`  ${t}  punya ${String(n).padStart(4)}  target ${String(tg).padStart(3)}  pecah  ${String(d).padStart(4)}`)
