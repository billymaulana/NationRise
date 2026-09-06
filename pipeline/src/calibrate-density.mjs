import mapshaper from 'mapshaper'
import { useRelativePaths, RAW } from './paths.mjs'
useRelativePaths()

async function load(path, withArea) {
  const cmd = withArea
    ? `-i ${path} -proj +proj=cea -each 'this.properties.area_km2 = Math.round(this.area / 1e6)' -o out.json format=geojson`
    : `-i ${path} -o out.json format=geojson`
  const r = await mapshaper.applyCommands(cmd, {})
  return JSON.parse(Buffer.from(r['out.json']).toString()).features
}

const provinces = await load(`${RAW}/shp/ne_10m_admin_1_states_provinces.shp`, true)
const countries = await load(`${RAW}/shp/ne_10m_admin_0_countries.shp`, true)

const density = new Map()
for (const c of countries) {
  const pop = c.properties.POP_EST ?? 0
  const area = c.properties.area_km2 ?? 0
  const tag = c.properties.ADM0_A3
  if (tag && area > 0) density.set(tag, pop / area)
}

const areaByCountry = new Map()
for (const p of provinces) {
  const tag = p.properties.adm0_a3
  if (tag === 'ATA') continue
  areaByCountry.set(tag, (areaByCountry.get(tag) ?? 0) + (p.properties.area_km2 ?? 0))
}

const MEDIAN_DENSITY = 83.2
const IDEAL = 43184
const MIN_AREA = 8000
const MAX_AREA = 180000

function targetArea(dens, exponent) {
  const d = Math.max(dens, 0.05)
  const raw = IDEAL * Math.pow(MEDIAN_DENSITY / d, exponent)
  return Math.min(Math.max(raw, MIN_AREA), MAX_AREA)
}

function totalProvinces(exponent) {
  let n = 0
  for (const [tag, area] of areaByCountry) {
    n += Math.max(1, Math.round(area / targetArea(density.get(tag) ?? MEDIAN_DENSITY, exponent)))
  }
  return n
}

console.log('Mencari eksponen yang menghasilkan 3.400 provinsi:\n')
console.log(`  ${'eksponen'.padEnd(10)}${'total'.padStart(8)}`)
let best = null
for (let e = 0.10; e <= 0.60; e += 0.05) {
  const n = totalProvinces(e)
  console.log(`  ${e.toFixed(2).padEnd(10)}${n.toLocaleString('id-ID').padStart(8)}`)
  if (best === null || Math.abs(n - 3400) < Math.abs(best.n - 3400)) best = { e, n }
}

/* Refine around the coarse winner. */
for (let e = best.e - 0.05; e <= best.e + 0.05; e += 0.005) {
  const n = totalProvinces(e)
  if (Math.abs(n - 3400) < Math.abs(best.n - 3400)) best = { e, n }
}

console.log(`\nTerpilih: eksponen ${best.e.toFixed(3)} -> ${best.n.toLocaleString('id-ID')} provinsi\n`)
console.log('Luas target yang dihasilkan:')
for (const t of ['SGP', 'BGD', 'JPN', 'GBR', 'DEU', 'IDN', 'USA', 'BRA', 'RUS', 'CAN', 'AUS', 'MNG'])
  console.log(`  ${t}  ${(density.get(t) ?? 0).toFixed(1).padStart(9)} jiwa/km2  ->  ${Math.round(targetArea(density.get(t) ?? 0, best.e)).toLocaleString('id-ID').padStart(8)} km2  (sisi ~${Math.round(Math.sqrt(targetArea(density.get(t) ?? 0, best.e)))} km)`)

console.log('\nProvinsi per negara yang dihasilkan:')
for (const t of ['IDN', 'USA', 'RUS', 'CHN', 'IND', 'AUS', 'BRA', 'MYS', 'PHL', 'JPN', 'DEU', 'SVN'])
  console.log(`  ${t}  ${String(Math.max(1, Math.round((areaByCountry.get(t) ?? 0) / targetArea(density.get(t) ?? MEDIAN_DENSITY, best.e)))).padStart(4)}`)
