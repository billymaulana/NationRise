import { readFile, writeFile } from 'node:fs/promises'
import { splitPolygon } from './split.mjs'
import { useRelativePaths, OUT } from './paths.mjs'
useRelativePaths()

const SEED = 20260906

const allocation = JSON.parse(await readFile(`${OUT}/allocation.json`, 'utf8'))
const targetOf = new Map(allocation.nations.map((n) => [n.tag, n.provinces]))
const fc = JSON.parse(await readFile(`${OUT}/provinces-merged.json`, 'utf8'))

const byNation = new Map()
for (const f of fc.features) {
  const tag = f.properties.adm0_a3
  if (!byNation.has(tag)) byNation.set(tag, [])
  byNation.get(tag).push(f)
}

const output = []
let created = 0
let failed = 0
const t0 = Date.now()

for (const [tag, units] of byNation) {
  const target = targetOf.get(tag) ?? units.length

  if (units.length >= target) {
    output.push(...units)
    continue
  }

  /* Give the extra provinces to the largest units: splitting a small unit
     produces slivers, while a single huge one distorts movement times. */
  const totalArea = units.reduce((s, f) => s + (f.properties.area_km2 ?? 0), 0)
  const idealArea = totalArea / target

  const plan = units.map((f) => ({
    feature: f,
    parts: Math.max(1, Math.round((f.properties.area_km2 ?? 0) / idealArea)),
  }))

  let planned = plan.reduce((s, p) => s + p.parts, 0)
  const sorted = [...plan].sort((a, b) => (b.feature.properties.area_km2 ?? 0) - (a.feature.properties.area_km2 ?? 0))
  let i = 0
  while (planned < target && i < sorted.length * 4) {
    sorted[i % sorted.length].parts++
    planned++
    i++
  }
  while (planned > target && i < sorted.length * 8) {
    const candidate = sorted[i % sorted.length]
    if (candidate.parts > 1) {
      candidate.parts--
      planned--
    }
    i++
  }

  for (const { feature, parts } of plan) {
    if (parts <= 1) {
      output.push(feature)
      continue
    }
    const pieces = splitPolygon(feature, parts, SEED + hash(tag) + parts)
    if (pieces.length < 2) failed++
    created += pieces.length - 1
    output.push(...pieces)
  }
}

function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

output.forEach((f, i) => { f.properties.province_id = i })

await writeFile(`${OUT}/provinces.json`, JSON.stringify({ type: 'FeatureCollection', features: output }))

console.log(`Sebelum : ${fc.features.length.toLocaleString('id-ID')} unit`)
console.log(`Sesudah : ${output.length.toLocaleString('id-ID')} provinsi  (${Math.round((Date.now() - t0) / 1000)} detik)`)
console.log(`  dibuat lewat pemecahan : ${created.toLocaleString('id-ID')}`)
console.log(`  pemecahan gagal        : ${failed}`)
console.log(`\nTarget alokasi : ${allocation.total.toLocaleString('id-ID')}`)
console.log(`Selisih        : ${(output.length - allocation.total).toLocaleString('id-ID')}`)

const idn = output.filter((f) => f.properties.adm0_a3 === 'IDN').length
console.log(`\nIndonesia : ${idn} provinsi (target 54)`)
for (const t of ['AUS', 'CAN', 'RUS', 'USA', 'MYS', 'PHL', 'JPN'])
  console.log(`${t.padStart(10)} : ${output.filter((f) => f.properties.adm0_a3 === t).length}`)
