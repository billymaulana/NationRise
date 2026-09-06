import { readFile, writeFile } from 'node:fs/promises'
import * as turf from '@turf/turf'
import mapshaper from 'mapshaper'
import { useRelativePaths, RAW, OUT } from './paths.mjs'
useRelativePaths()

/* Indonesia is fixed at twelve cities by the map research, which sets the
   ratio for everyone else. Cities are what produce goods and mobilise units,
   so too few makes a nation unplayable and too many makes it a chore. */
const CITY_RATIO = 12 / 54
const TERRAIN_URBAN = 8

const overrides = JSON.parse(await readFile('overrides/cities.json', 'utf8'))

const loaded = await mapshaper.applyCommands(
  `-i ${RAW}/shp/ne_10m_populated_places.shp -o out.json format=geojson`, {})
const places = JSON.parse(Buffer.from(loaded['out.json']).toString()).features

const fc = JSON.parse(await readFile(`${OUT}/provinces.json`, 'utf8'))
const features = fc.features

/* Every stage must be idempotent: the pipeline is rerun constantly during
   tuning, and leftover flags from an earlier pass silently accumulate. */
for (const f of features) {
  delete f.properties.is_city
  delete f.properties.city_name
  delete f.properties.city_population
  delete f.properties.is_capital
  if (f.properties.terrain_natural !== undefined) {
    f.properties.terrain = f.properties.terrain_natural
    delete f.properties.terrain_natural
  }
}

const byNation = new Map()
features.forEach((f, id) => {
  const tag = f.properties.adm0_a3
  if (!byNation.has(tag)) byNation.set(tag, [])
  byNation.get(tag).push({ id, feature: f, bbox: turf.bbox(f) })
})

/* Population on the game scale, from the formula the economy research fixed
   against real Conflict of Nations city values. */
const gamePopulation = (popMax) =>
  Math.min(10, Math.max(1, Math.round(1.72 * Math.log10(Math.max(popMax, 1)) - 6.0)))

const placesByNation = new Map()
for (const p of places) {
  const tag = p.properties.ADM0_A3 ?? p.properties.SOV_A3
  if (!tag) continue
  if (!placesByNation.has(tag)) placesByNation.set(tag, [])
  placesByNation.get(tag).push(p)
}

let assigned = 0
let unmatched = 0

for (const [tag, provinces] of byNation) {
  const quota = Math.max(1, Math.round(provinces.length * CITY_RATIO))
  const forced = overrides.nations[tag]?.force ?? []
  const forcedSet = new Set(forced.map((n) => n.toLowerCase()))

  const nameOf = (p) => (p.properties.NAME ?? p.properties.NAMEASCII ?? '').toLowerCase()

  /* Forced cities come first regardless of size: population alone would leave
     whole theatres with nowhere to mobilise. */
  const candidates = (placesByNation.get(tag) ?? [])
    .filter((p) => (p.properties.POP_MAX ?? 0) > 0)
    .sort((a, b) => {
      const isForced = (x) => (forcedSet.has(nameOf(x)) ? 1 : 0)
      const byForced = isForced(b) - isForced(a)
      if (byForced !== 0) return byForced
      const capital = (x) => ((x.properties.FEATURECLA ?? '').includes('Admin-0 capital') ? 1 : 0)
      const byCapital = capital(b) - capital(a)
      return byCapital !== 0 ? byCapital : (b.properties.POP_MAX ?? 0) - (a.properties.POP_MAX ?? 0)
    })

  if (forced.length > 0) {
    const found = candidates.slice(0, forced.length).filter((p) => forcedSet.has(nameOf(p))).length
    if (found < forced.length) {
      console.warn(`  ${tag}: hanya ${found} dari ${forced.length} kota wajib ditemukan di data`)
    }
  }

  const used = new Set()
  let placed = 0

  for (const place of candidates) {
    if (placed >= quota) break
    const [lon, lat] = place.geometry.coordinates
    const point = turf.point([lon, lat])

    let host = null
    for (const p of provinces) {
      if (used.has(p.id)) continue
      if (lon < p.bbox[0] || lon > p.bbox[2] || lat < p.bbox[1] || lat > p.bbox[3]) continue
      try {
        if (turf.booleanPointInPolygon(point, p.feature)) { host = p; break }
      } catch { /* skip malformed geometry */ }
    }

    if (host === null) {
      unmatched++
      continue
    }

    used.add(host.id)
    host.feature.properties.is_city = true
    host.feature.properties.city_name = place.properties.NAME ?? place.properties.NAMEASCII ?? ''
    host.feature.properties.city_population = gamePopulation(place.properties.POP_MAX ?? 0)
    host.feature.properties.is_capital = (place.properties.FEATURECLA ?? '').includes('Admin-0 capital')
    /* Keep what the land was before the city covered it: resource assignment
       later needs the underlying geography, not the fact that it is now built
       over. */
    host.feature.properties.terrain_natural = host.feature.properties.terrain
    host.feature.properties.terrain = TERRAIN_URBAN
    placed++
    assigned++
  }
}

/* A nation with no city cannot mobilise, cannot build, and every province it
   holds is permanently cut off from supply. Where the populated-places data
   has nothing inside the borders, the largest province becomes the capital so
   the nation is at least playable. */
let promoted = 0
for (const [tag, provinces] of byNation) {
  if (provinces.some((p) => p.feature.properties.is_city)) continue

  const largest = [...provinces].sort(
    (a, b) => (b.feature.properties.area_km2 ?? 0) - (a.feature.properties.area_km2 ?? 0))[0]
  if (!largest) continue

  largest.feature.properties.terrain_natural = largest.feature.properties.terrain
  largest.feature.properties.terrain = TERRAIN_URBAN
  largest.feature.properties.is_city = true
  largest.feature.properties.city_name = largest.feature.properties.name || tag
  largest.feature.properties.city_population = provinces.length >= 5 ? 4 : 3
  largest.feature.properties.is_capital = true
  promoted++
}

for (const f of features) {
  if (!f.properties.is_city) {
    f.properties.is_city = false
    f.properties.city_population = 0
  }
}

console.log(`Negara tanpa kota diberi ibu kota: ${promoted}`)

await writeFile(`${OUT}/provinces.json`, JSON.stringify({ type: 'FeatureCollection', features }))

const cities = features.filter((f) => f.properties.is_city)
const pops = cities.map((f) => f.properties.city_population)
const totalPop = pops.reduce((s, p) => s + p, 0)
const nonCity = features.length - cities.length

console.log(`Provinsi   : ${features.length.toLocaleString('id-ID')}`)
console.log(`Kota       : ${cities.length.toLocaleString('id-ID')}  (${(cities.length / features.length * 100).toFixed(1)}%)`)
console.log(`Tak terpetakan: ${unmatched}`)
console.log(`\nPOIN KEMENANGAN DUNIA = ${nonCity.toLocaleString('id-ID')} provinsi + ${totalPop.toLocaleString('id-ID')} populasi = ${(nonCity + totalPop).toLocaleString('id-ID')}`)

const idn = features.filter((f) => f.properties.adm0_a3 === 'IDN')
const idnCities = idn.filter((f) => f.properties.is_city)
const idnPop = idnCities.reduce((s, f) => s + f.properties.city_population, 0)
console.log(`\nIndonesia: ${idn.length} provinsi, ${idnCities.length} kota, populasi ${idnPop}`)
console.log(`  poin kemenangan = ${idn.length - idnCities.length} + ${idnPop} = ${idn.length - idnCities.length + idnPop}`)
console.log('  kota:')
for (const c of idnCities.sort((a, b) => b.properties.city_population - a.properties.city_population))
  console.log(`    ${String(c.properties.city_population).padStart(2)}  ${c.properties.city_name}${c.properties.is_capital ? ' (ibu kota)' : ''}`)
