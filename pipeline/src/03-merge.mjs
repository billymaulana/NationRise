import { readFile, writeFile } from 'node:fs/promises'
import mapshaper from 'mapshaper'
import { cluster } from './kmeans.mjs'
import { useRelativePaths, RAW, OUT } from './paths.mjs'
useRelativePaths()

const SEED = 20260906

const allocation = JSON.parse(await readFile(`${OUT}/allocation.json`, 'utf8'))
const targetOf = new Map(allocation.nations.map((n) => [n.tag, n.provinces]))

const loaded = await mapshaper.applyCommands(
  `-i ${RAW}/shp/ne_10m_admin_1_states_provinces.shp -proj +proj=cea ` +
  `-each 'this.properties.area_km2 = Math.round(this.area / 1e6)' ` +
  `-proj wgs84 -o out.json format=geojson`, {})
const features = JSON.parse(Buffer.from(loaded['out.json']).toString()).features

const byNation = new Map()
for (const f of features) {
  const tag = f.properties.adm0_a3
  if (!tag || tag === 'ATA') continue
  if (!byNation.has(tag)) byNation.set(tag, [])
  byNation.get(tag).push(f)
}

let merged = 0
let untouched = 0
let needSplit = 0

for (const [tag, units] of byNation) {
  const target = targetOf.get(tag) ?? 2

  if (units.length <= target) {
    units.forEach((f, i) => { f.properties.cluster = `${tag}_${i}` })
    if (units.length < target) needSplit += target - units.length
    else untouched++
    continue
  }

  /* Weight by area so a cluster does not end up as one large unit plus a
     handful of tiny ones; centroid alone ignores how much land each carries. */
  const points = units.map((f) => {
    const c = centroid(f.geometry)
    return [c[0], c[1], Math.max(f.properties.area_km2 ?? 1, 1)]
  })

  const assign = cluster(points, target, SEED + hash(tag))
  units.forEach((f, i) => { f.properties.cluster = `${tag}_${assign[i]}` })
  merged += units.length - target
}

function centroid(geometry) {
  let x = 0, y = 0, n = 0
  const walk = (coords, depth) => {
    if (depth === 0) { x += coords[0]; y += coords[1]; n++; return }
    for (const c of coords) walk(c, depth - 1)
  }
  const depth = geometry.type === 'Polygon' ? 2 : 3
  walk(geometry.coordinates, depth)
  return n > 0 ? [x / n, y / n] : [0, 0]
}

function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

await writeFile(`${OUT}/clustered.json`, JSON.stringify({ type: 'FeatureCollection', features }))

const dissolved = await mapshaper.applyCommands(
  `-i ${OUT}/clustered.json -dissolve cluster ` +
  `copy-fields=adm0_a3,name,type_en sum-fields=area_km2 ` +
  `-o out.json format=geojson`, {})
const result = JSON.parse(Buffer.from(dissolved['out.json']).toString())

await writeFile(`${OUT}/provinces-merged.json`, JSON.stringify(result))

console.log(`Sebelum : ${features.length.toLocaleString('id-ID')} unit`)
console.log(`Sesudah : ${result.features.length.toLocaleString('id-ID')} unit`)
console.log(`  digabung          : ${merged.toLocaleString('id-ID')} unit`)
console.log(`  negara sudah pas  : ${untouched}`)
console.log(`  masih perlu pecah : ${needSplit.toLocaleString('id-ID')} provinsi`)
console.log(`\nTarget alokasi     : ${allocation.total.toLocaleString('id-ID')}`)
