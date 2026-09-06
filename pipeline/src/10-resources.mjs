import { readFile, writeFile } from 'node:fs/promises'
import { useRelativePaths, OUT } from './paths.mjs'
useRelativePaths()

/* Which good a city produces decides what a nation must trade for, so it
   cannot be arbitrary. Indonesia is specified by hand from the map research;
   everywhere else derives from national traits, then terrain, then a stable
   fallback that keeps the global mix balanced. */
const GOODS = ['Food', 'Fuel', 'Materials', 'Technology', 'RareResources']
const TERRAIN_HINT = new Map([
  [5, 'Fuel'],        // Desert
  [4, 'RareResources'], // Mountains
  [3, 'RareResources'], // Hills
  [2, 'Food'],        // Jungle
  [1, 'Food'],        // Forest
  [0, 'Food'],        // OpenGround
  [7, 'Food'],        // Marsh
  [6, 'RareResources'], // Tundra
])

const overrides = JSON.parse(await readFile('overrides/resources.json', 'utf8'))
const fc = JSON.parse(await readFile(`${OUT}/provinces.json`, 'utf8'))
const features = fc.features

const traitOf = new Map()
for (const [good, tags] of Object.entries(overrides.nationTraits)) {
  if (good === 'note') continue
  for (const tag of tags) {
    if (!traitOf.has(tag)) traitOf.set(tag, good)
  }
}

const counts = new Map(GOODS.map((g) => [g, 0]))
let fromOverride = 0
let fromTrait = 0
let fromTerrain = 0

const cityIndex = new Map()
let rotation = 0

for (const f of features) {
  if (!f.properties.is_city) {
    delete f.properties.resource
    continue
  }

  const tag = f.properties.adm0_a3
  const name = f.properties.city_name ?? ''
  let good = overrides.cities[tag]?.[name]

  if (good) {
    fromOverride++
  } else if (traitOf.has(tag)) {
    /* A nation's second and third cities should not all produce the same
       thing, so the trait applies to roughly half of them. */
    const seen = cityIndex.get(tag) ?? 0
    cityIndex.set(tag, seen + 1)
    good = seen % 2 === 0 ? traitOf.get(tag) : null
    if (good) fromTrait++
  }

  if (!good) {
    /* Terrain under the city, not the urban tile that replaced it. Falling
       back to a rotating good keeps the world mix from collapsing into one
       resource when terrain is uninformative. */
    const natural = f.properties.terrain_natural ?? f.properties.terrain
    good = TERRAIN_HINT.get(natural) ?? GOODS[rotation++ % GOODS.length]
    fromTerrain++
  }

  f.properties.resource = good
  counts.set(good, counts.get(good) + 1)
}

await writeFile(`${OUT}/provinces.json`, JSON.stringify({ type: 'FeatureCollection', features }))

const cities = features.filter((f) => f.properties.is_city).length
console.log(`Kota          : ${cities}`)
console.log(`  dari override : ${fromOverride}`)
console.log(`  dari sifat    : ${fromTrait}`)
console.log(`  dari medan    : ${fromTerrain}`)
console.log('\nSebaran sumber daya global:')
for (const [g, n] of [...counts].sort((a, b) => b[1] - a[1]))
  console.log(`  ${g.padEnd(16)}${String(n).padStart(4)}  ${(n / cities * 100).toFixed(1)}%`)

const idn = features.filter((f) => f.properties.adm0_a3 === 'IDN' && f.properties.is_city)
console.log('\nIndonesia:')
for (const c of idn.sort((a, b) => b.properties.city_population - a.properties.city_population))
  console.log(`  ${String(c.properties.city_population).padStart(2)}  ${(c.properties.city_name ?? '').padEnd(14)}${c.properties.resource}`)
