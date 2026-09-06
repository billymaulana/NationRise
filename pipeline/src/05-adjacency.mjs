import { readFile, writeFile } from 'node:fs/promises'
import { useRelativePaths, OUT } from './paths.mjs'
useRelativePaths()

/* Provinces that share a boundary share vertices, because every polygon here
   descends from the same topology. Hashing rounded coordinates finds those
   neighbours in one pass instead of comparing 2,000 polygons pairwise. */
const PRECISION = 4

const fc = JSON.parse(await readFile(`${OUT}/provinces.json`, 'utf8'))
const features = fc.features

const vertexOwners = new Map()

features.forEach((f, id) => {
  for (const key of vertexKeys(f.geometry)) {
    let owners = vertexOwners.get(key)
    if (!owners) {
      owners = new Set()
      vertexOwners.set(key, owners)
    }
    owners.add(id)
  }
})

const neighbours = features.map(() => new Set())

for (const owners of vertexOwners.values()) {
  if (owners.size < 2) continue
  const list = [...owners]
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      neighbours[list[i]].add(list[j])
      neighbours[list[j]].add(list[i])
    }
  }
}

function* vertexKeys(geometry) {
  const stack = [geometry.coordinates]
  while (stack.length > 0) {
    const node = stack.pop()
    if (typeof node[0] === 'number') {
      yield `${node[0].toFixed(PRECISION)},${node[1].toFixed(PRECISION)}`
      continue
    }
    for (const child of node) stack.push(child)
  }
}

const offsets = new Int32Array(features.length + 1)
const flat = []
features.forEach((_, id) => {
  offsets[id] = flat.length
  flat.push(...[...neighbours[id]].sort((a, b) => a - b))
})
offsets[features.length] = flat.length

await writeFile(`${OUT}/adjacency.json`, JSON.stringify({
  count: features.length,
  offsets: [...offsets],
  neighbours: flat,
}))

const degrees = neighbours.map((n) => n.size).sort((a, b) => a - b)
const isolated = degrees.filter((d) => d === 0).length
const q = (p) => degrees[Math.floor(degrees.length * p)]

console.log(`Provinsi        : ${features.length.toLocaleString('id-ID')}`)
console.log(`Sisi ketetanggaan: ${(flat.length / 2).toLocaleString('id-ID')}`)
console.log(`\nDerajat ketetanggaan:`)
console.log(`  median ${q(0.5)}, p90 ${q(0.9)}, maks ${degrees.at(-1)}`)
console.log(`  terisolasi (0 tetangga): ${isolated}  <- pulau, wajar untuk kepulauan`)

const idnIds = features.map((f, i) => (f.properties.adm0_a3 === 'IDN' ? i : -1)).filter((i) => i >= 0)
const idnIsolated = idnIds.filter((i) => neighbours[i].size === 0).length
console.log(`\nIndonesia: ${idnIds.length} provinsi, ${idnIsolated} tanpa tetangga darat`)
