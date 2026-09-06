import mapshaper from 'mapshaper'
import { useRelativePaths, RAW } from './paths.mjs'
useRelativePaths()

const r = await mapshaper.applyCommands(
  `-i ${RAW}/shp/ne_10m_admin_0_countries.shp -proj +proj=cea ` +
  `-each 'this.properties.area_km2 = Math.round(this.area / 1e6)' -o out.json format=geojson`, {})

const countries = JSON.parse(Buffer.from(r['out.json']).toString()).features
  .filter((c) => c.properties.ADM0_A3 !== 'ATA' && (c.properties.area_km2 ?? 0) > 0)
  .map((c) => ({ tag: c.properties.ADM0_A3, area: c.properties.area_km2, pop: Math.max(c.properties.POP_EST ?? 0, 0) }))

const totalArea = countries.reduce((s, c) => s + c.area, 0)
const totalPop = countries.reduce((s, c) => s + c.pop, 0)
const idn = countries.find((c) => c.tag === 'IDN')

function build(areaWeight, cap, floor) {
  const shareOf = (c) => areaWeight * (c.area / totalArea) + (1 - areaWeight) * (c.pop / totalPop)
  const scale = 54 / shareOf(idn)
  const alloc = new Map(countries.map((c) => [c.tag, Math.min(cap, Math.max(floor, Math.round(shareOf(c) * scale)))]))
  return { alloc, total: [...alloc.values()].reduce((s, n) => s + n, 0), scale }
}

console.log('Mencari kombinasi yang memberi Indonesia 54 DAN total mendekati 3.400:\n')
console.log(`  ${'bobot luas'.padEnd(12)}${'cap'.padStart(6)}${'floor'.padStart(7)}${'total'.padStart(9)}`)

let best = null
for (const aw of [0.45, 0.55, 0.65, 0.75, 0.85]) {
  for (const cap of [90, 120, 150, 200]) {
    for (const floor of [2, 3, 4]) {
      const b = build(aw, cap, floor)
      if (b.alloc.get('IDN') !== 54) continue
      if (best === null || Math.abs(b.total - 3400) < Math.abs(best.total - 3400)) best = { aw, cap, floor, ...b }
      if (cap === 150 && floor === 3) console.log(`  ${aw.toFixed(2).padEnd(12)}${String(cap).padStart(6)}${String(floor).padStart(7)}${b.total.toLocaleString('id-ID').padStart(9)}`)
    }
  }
}

console.log(`\nTerbaik: bobot luas ${best.aw}, cap ${best.cap}, floor ${best.floor} -> total ${best.total.toLocaleString('id-ID')}`)
console.log(`Indonesia: ${best.alloc.get('IDN')} provinsi = ${(54 / best.total * 100).toFixed(2)}% dunia`)
console.log(`Conflict of Nations : 53 dari 3.358 = 1,58% dunia\n`)

console.log('Alokasi yang dihasilkan:')
for (const group of [['RUS','CAN','CHN','USA','BRA','AUS','IND','IDN'], ['MYS','PHL','PNG','THA','VNM','JPN','KOR'], ['DEU','GBR','FRA','ITA','ESP','POL']]) {
  console.log('  ' + group.map((t) => `${t} ${String(best.alloc.get(t) ?? 0).padStart(3)}`).join('   '))
}
const d = [...best.alloc.values()].sort((a, b) => b - a)
console.log(`\nSebaran: maks ${d[0]}, median ${d[Math.floor(d.length/2)]}, min ${d.at(-1)}, negara ${d.length}`)
