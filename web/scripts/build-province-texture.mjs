import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { encodePng } from './png.mjs'

/*
 * Merasterkan poligon provinsi menjadi tekstur id.
 *
 * Alih-alih menggambar ulang ribuan poligon setiap kali kepemilikan berubah,
 * satu tekstur menyimpan id provinsi sebagai warna dan shader menerjemahkannya
 * lewat tabel pencarian kecil berisi pemilik. Mengganti kepemilikan berarti
 * mengubah satu texel di tabel itu, bukan membangun ulang geometri.
 *
 * Tekstur yang sama dipakai untuk memilih provinsi: baca satu piksel di posisi
 * kursor, warnanya adalah id provinsi. Tidak perlu uji titik-dalam-poligon di
 * CPU untuk dua ribu provinsi.
 *
 * Id disimpan di kanal merah dan hijau sebagai bilangan bulat 16 bit little
 * endian. Kanal biru menyimpan penanda: 0 berarti laut, 1 berarti darat. Nilai
 * 0xffff di R dan G berarti tidak ada provinsi.
 */
const WIDTH = 4096
const HEIGHT = 2048
const NO_PROVINCE = 0xffff

const here = dirname(fileURLToPath(import.meta.url))
const source = join(here, '..', 'public', 'data', 'provinces.geojson')
const target = join(here, '..', 'public', 'data', 'province-ids.png')

const geo = JSON.parse(readFileSync(source, 'utf8'))

/* Equirectangular: bujur memetakan linear ke x, lintang ke y. Proyeksi yang
   sama dipakai penyaji, sehingga tekstur ini sejajar dengan citra dasar mana
   pun yang memakai proyeksi itu. */
function project(lon, lat) {
  return [((lon + 180) / 360) * WIDTH, ((90 - lat) / 180) * HEIGHT]
}

const ids = new Uint16Array(WIDTH * HEIGHT).fill(NO_PROVINCE)

/*
 * Pengisian scanline dengan aturan even-odd, dievaluasi di tengah piksel.
 * Cincin luar dan cincin lubang ikut dalam daftar tepi yang sama, sehingga
 * lubang muncul sendirinya tanpa penanganan terpisah.
 */
function fillRings(rings, id) {
  const edges = []
  let minY = Infinity
  let maxY = -Infinity

  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const [x0, y0] = project(ring[i][0], ring[i][1])
      const [x1, y1] = project(ring[i + 1][0], ring[i + 1][1])
      if (y0 === y1) continue

      edges.push({ x0, y0, x1, y1 })
      minY = Math.min(minY, y0, y1)
      maxY = Math.max(maxY, y0, y1)
    }
  }

  if (edges.length === 0) return

  const from = Math.max(0, Math.floor(minY))
  const to = Math.min(HEIGHT - 1, Math.ceil(maxY))
  const crossings = []

  for (let y = from; y <= to; y++) {
    const sampleY = y + 0.5
    crossings.length = 0

    for (const e of edges) {
      const low = Math.min(e.y0, e.y1)
      const high = Math.max(e.y0, e.y1)
      if (sampleY < low || sampleY >= high) continue

      crossings.push(e.x0 + ((sampleY - e.y0) / (e.y1 - e.y0)) * (e.x1 - e.x0))
    }

    if (crossings.length < 2) continue
    crossings.sort((a, b) => a - b)

    for (let i = 0; i + 1 < crossings.length; i += 2) {
      const left = Math.max(0, Math.ceil(crossings[i] - 0.5))
      const right = Math.min(WIDTH - 1, Math.floor(crossings[i + 1] - 0.5))
      const row = y * WIDTH

      for (let x = left; x <= right; x++) ids[row + x] = id
    }
  }
}

let filled = 0
for (const feature of geo.features) {
  const id = feature.properties.id
  const g = feature.geometry
  const polygons = g.type === 'Polygon' ? [g.coordinates] : g.coordinates

  for (const polygon of polygons) fillRings(polygon, id)
  filled++
}

/*
 * Provinsi yang lebih kecil dari satu piksel tidak menutup satu pun pusat
 * piksel, sehingga pengisian scanline melewatinya sama sekali. Pada resolusi
 * ini itu terjadi pada puluhan mikronegara dan pulau kecil: Monaco, San Marino,
 * Liechtenstein, Sint Maarten.
 *
 * Menaikkan resolusi tidak menyelesaikannya, hanya menggeser ambangnya, sambil
 * melipatempatkan anggaran memori yang justru ketat di mesin target. Jadi
 * setiap provinsi dijamin mendapat satu piksel di titik wakilnya. Piksel yang
 * ditimpa selalu milik provinsi yang jauh lebih besar dan kehilangan satu
 * piksel tidak mengubah apa pun baginya; pemeriksaan sesudahnya menegaskan
 * tidak ada yang justru hilang karena penimpaan itu.
 */
function representativePoint(geometry) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates

  let best = null
  let bestSpan = -1

  for (const polygon of polygons) {
    const ring = polygon[0]
    let minLon = Infinity
    let maxLon = -Infinity
    let minLat = Infinity
    let maxLat = -Infinity

    for (const [lon, lat] of ring) {
      minLon = Math.min(minLon, lon)
      maxLon = Math.max(maxLon, lon)
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
    }

    const span = (maxLon - minLon) * (maxLat - minLat)
    if (span > bestSpan) {
      bestSpan = span
      best = [(minLon + maxLon) / 2, (minLat + maxLat) / 2]
    }
  }

  return best
}

function stampMissing() {
  const pixelCount = new Map()
  for (const id of ids) {
    if (id !== NO_PROVINCE) pixelCount.set(id, (pixelCount.get(id) ?? 0) + 1)
  }

  /* Sebuah piksel boleh direbut hanya kalau penghuninya masih punya piksel lain.
     Tanpa syarat itu dua mikronegara yang berbagi satu piksel akan saling
     menghapus, dan yang tercap belakangan mengusir yang lebih dulu. */
  function claimable(index) {
    const occupant = ids[index]
    if (occupant === NO_PROVINCE) return true
    return (pixelCount.get(occupant) ?? 0) > 1
  }

  let stamped = 0
  for (const feature of geo.features) {
    const id = feature.properties.id
    if (pixelCount.has(id)) continue

    const point = representativePoint(feature.geometry)
    if (point === null) continue

    const [px, py] = project(point[0], point[1])
    const cx = Math.min(WIDTH - 1, Math.max(0, Math.floor(px)))
    const cy = Math.min(HEIGHT - 1, Math.max(0, Math.floor(py)))

    /* Cari melingkar keluar dari titik wakilnya. Radius empat sudah cukup untuk
       setiap gugusan mikronegara di peta ini; melampauinya berarti provinsinya
       akan tercap jauh dari tempat sebenarnya, dan itu lebih buruk daripada
       melaporkannya sebagai kegagalan. */
    let placed = false
    for (let radius = 0; radius <= 4 && !placed; radius++) {
      for (let dy = -radius; dy <= radius && !placed; dy++) {
        for (let dx = -radius; dx <= radius && !placed; dx++) {
          if (radius > 0 && Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue

          const x = cx + dx
          const y = cy + dy
          if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) continue

          const index = y * WIDTH + x
          if (!claimable(index)) continue

          const occupant = ids[index]
          if (occupant !== NO_PROVINCE) pixelCount.set(occupant, pixelCount.get(occupant) - 1)

          ids[index] = id
          pixelCount.set(id, 1)
          placed = true
          stamped++
        }
      }
    }
  }

  return stamped
}

const stamped = stampMissing()

const seen = new Set(ids)
seen.delete(NO_PROVINCE)
const missing = []
for (const feature of geo.features) {
  if (!seen.has(feature.properties.id)) missing.push(feature.properties)
}

const rgb = Buffer.alloc(WIDTH * HEIGHT * 3)
let land = 0
for (let i = 0; i < ids.length; i++) {
  const id = ids[i]
  rgb[i * 3] = id & 0xff
  rgb[i * 3 + 1] = (id >> 8) & 0xff
  /* 255, bukan 1: shader membaca kanal sebagai float ternormalisasi, sehingga
     nilai byte 1 menjadi 0,0039 dan setiap uji ambang menganggapnya laut. */
  rgb[i * 3 + 2] = id === NO_PROVINCE ? 0 : 255
  if (id !== NO_PROVINCE) land++
}

writeFileSync(target, encodePng(WIDTH, HEIGHT, rgb))

const stats = {
  ukuran: `${WIDTH}x${HEIGHT}`,
  provinsi: filled,
  terlihat: seen.size,
  dicap: stamped,
  hilang: missing.length,
  daratan: `${((100 * land) / ids.length).toFixed(1)}%`,
  berkas: `${(Buffer.byteLength(readFileSync(target)) / 1024).toFixed(0)} KB`,
}
for (const [k, v] of Object.entries(stats)) console.log(`  ${k.padEnd(10)} ${v}`)

if (missing.length > 0) {
  console.error(`\n  GAGAL: ${missing.length} provinsi tetap tidak terwakili`)
  for (const p of missing.slice(0, 10)) console.error(`    ${p.id} ${p.name} (${p.nation})`)
  process.exit(1)
}
