import { readFile } from 'node:fs/promises'
import { splitPolygon } from './split.mjs'
import { useRelativePaths, OUT } from './paths.mjs'
useRelativePaths()

const fc = JSON.parse(await readFile(`${OUT}/provinces-merged.json`, 'utf8'))
const idn = fc.features.filter((f) => f.properties.adm0_a3 === 'IDN')

console.log(`Indonesia sebelum: ${idn.length} unit, target 54`)
console.log('Lima unit terluas:')
const sorted = [...idn].sort((a, b) => (b.properties.area_km2 ?? 0) - (a.properties.area_km2 ?? 0))
for (const f of sorted.slice(0, 5)) {
  console.log(`  ${(f.properties.name ?? '?').padEnd(24)} ${(f.properties.area_km2 ?? 0).toLocaleString('id-ID').padStart(9)} km2`)
}

const t0 = Date.now()
const biggest = sorted[0]
const pieces = splitPolygon(biggest, 4, 1)
console.log(`\nUji pecah "${biggest.properties.name}" menjadi 4:`)
console.log(`  hasil: ${pieces.length} bagian dalam ${Date.now() - t0} ms`)
