import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { useRelativePaths, OUT } from './paths.mjs'
useRelativePaths()

/* Two outputs with different audiences: a compact binary the simulation reads
   without parsing, and geometry the renderer reads. The simulation file
   carries no coordinates at all, which is what keeps the layering honest. */
const MAGIC = 0x4e525744
const FORMAT_VERSION = 1

const fc = JSON.parse(await readFile(`${OUT}/provinces.json`, 'utf8'))
const land = JSON.parse(await readFile(`${OUT}/adjacency.json`, 'utf8'))
const sea = JSON.parse(await readFile(`${OUT}/sea-links.json`, 'utf8'))
const features = fc.features

const tags = [...new Set(features.map((f) => f.properties.adm0_a3).filter(Boolean))].sort()
const nationIndex = new Map(tags.map((t, i) => [t, i]))

const count = features.length
const owner = new Uint16Array(count)
const terrain = new Uint8Array(count)
const population = new Float32Array(count)
const isCity = new Uint8Array(count)
const claimOffsets = new Int32Array(count + 1)
const claims = []

features.forEach((f, i) => {
  const tag = f.properties.adm0_a3
  const nation = nationIndex.get(tag)
  owner[i] = nation ?? 0xffff
  terrain[i] = f.properties.terrain ?? 0
  population[i] = f.properties.is_city ? (f.properties.city_population ?? 0) : 1
  isCity[i] = f.properties.is_city ? 1 : 0
  claimOffsets[i] = claims.length
  if (nation !== undefined) claims.push(nation)
})
claimOffsets[count] = claims.length

const parts = []
const header = Buffer.alloc(16)
header.writeUInt32LE(MAGIC, 0)
header.writeUInt16LE(FORMAT_VERSION, 4)
header.writeUInt16LE(tags.length, 6)
header.writeUInt32LE(count, 8)
header.writeUInt32LE(0, 12)
parts.push(header)

const tagBlock = Buffer.alloc(tags.length * 3)
tags.forEach((t, i) => tagBlock.write(t.padEnd(3).slice(0, 3), i * 3, 'ascii'))
parts.push(tagBlock)

parts.push(Buffer.from(owner.buffer))
parts.push(Buffer.from(terrain.buffer))
parts.push(Buffer.from(population.buffer))
parts.push(Buffer.from(isCity.buffer))
parts.push(Buffer.from(claimOffsets.buffer))
parts.push(Buffer.from(new Uint16Array(claims).buffer))

for (const graph of [land, sea]) {
  const offsets = new Int32Array(graph.offsets)
  const neighbours = new Uint16Array(graph.neighbours)
  const size = Buffer.alloc(4)
  size.writeUInt32LE(neighbours.length, 0)
  parts.push(size, Buffer.from(offsets.buffer), Buffer.from(neighbours.buffer))
}

const binary = Buffer.concat(parts)
await mkdir(`${OUT}/game`, { recursive: true })
await writeFile(`${OUT}/game/world.bin`, binary)

const geometry = {
  type: 'FeatureCollection',
  features: features.map((f, i) => ({
    type: 'Feature',
    properties: {
      id: i,
      name: f.properties.city_name || f.properties.name || '',
      nation: f.properties.adm0_a3 ?? '',
    },
    geometry: f.geometry,
  })),
}
await writeFile(`${OUT}/game/provinces.geojson`, JSON.stringify(geometry))

const nations = tags.map((tag, i) => ({
  index: i,
  tag,
  provinces: features.filter((f) => f.properties.adm0_a3 === tag).length,
  cities: features.filter((f) => f.properties.adm0_a3 === tag && f.properties.is_city).length,
}))
await writeFile(`${OUT}/game/nations.json`, JSON.stringify(nations, null, 2))

const geoSize = (await readFile(`${OUT}/game/provinces.geojson`)).length
console.log(`world.bin          : ${(binary.length / 1024).toFixed(1)} KB   (dibaca simulasi)`)
console.log(`provinces.geojson  : ${(geoSize / 1024 / 1024).toFixed(1)} MB  (dibaca renderer)`)
console.log(`nations.json       : ${nations.length} negara`)
console.log(`\nIsi world.bin: ${count.toLocaleString('id-ID')} provinsi, ${tags.length} negara`)
console.log(`  tautan darat : ${(land.neighbours.length / 2).toLocaleString('id-ID')}`)
console.log(`  tautan laut  : ${(sea.neighbours.length / 2).toLocaleString('id-ID')}`)
console.log(`  indeks Indonesia: ${nationIndex.get('IDN')}`)
