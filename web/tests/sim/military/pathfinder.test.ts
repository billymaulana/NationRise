import { describe, expect, it } from 'vitest'
import { f32, mulF32 } from '~/sim/determinism/float32'
import { readWorld, type WorldData } from '~/sim/data/WorldFile'
import { BASE_HOURS, hoursFor } from '~/sim/military/MovementCost'
import { Pathfinder, type StepCost } from '~/sim/military/Pathfinder'
import { Terrain } from '~/sim/world/Terrain'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Military/PathfinderTests.cs. */

interface Harness {
  data: WorldData
  state: WorldState
  finder: Pathfinder
}

function build(): Harness {
  const data = readWorld(worldBinary())
  const state = data.toWorldState(1)

  return { data, state, finder: new Pathfinder(data.land, data.sea, state.provinces.count) }
}

function costFor(state: WorldState): StepCost {
  return (_from, to, bySea) => hoursFor(state.provinces.at(to).terrain, bySea)
}

function ownedBy(state: WorldState, tag: string): number[] {
  const nation = state.nations.indexOf(tag)
  const owned: number[] = []

  for (let i = 0; i < state.provinces.count; i++) {
    if (state.provinces.owner[i] === nation) owned.push(i)
  }

  return owned
}

describe('biaya gerak per medan', () => {
  it('pegunungan berbiaya lebih daripada tanah terbuka', () => {
    expect(hoursFor(Terrain.Mountains, false)).toBeGreaterThan(hoursFor(Terrain.OpenGround, false))
    expect(hoursFor(Terrain.Mountains, false)).toBeCloseTo(mulF32(f32(3.03), BASE_HOURS), 2)
  })

  /* Diambil dengan menjalankan MovementCost.HoursFor pada implementasi rujukan.
     Pengalinya bertipe float, jadi hasilnya harus dihitung dalam 32 bit. */
  it('tabel jam per medan sesuai implementasi rujukan', () => {
    expect(BASE_HOURS).toBe(2)
    expect(hoursFor(Terrain.OpenGround, false)).toBe(2)
    expect(hoursFor(Terrain.Jungle, false)).toBe(3.5)
    expect(hoursFor(Terrain.Mountains, false)).toBe(f32(6.06))
    expect(hoursFor(Terrain.CoastalWaters, false)).toBe(f32(1.54))
    expect(hoursFor(Terrain.HighSeas, false)).toBe(f32(1.2))
  })

  /* Menyeberang tanpa tautan darat berarti naik kapal, dan itu berbiaya lebih
     daripada yang disiratkan jaraknya saja. */
  it('menyeberang lewat laut memakai pengali tersendiri, bukan medan tujuannya', () => {
    expect(hoursFor(Terrain.OpenGround, true)).toBe(f32(3.2))
    expect(hoursFor(Terrain.Mountains, true)).toBe(f32(3.2))
  })
})

describe('Pathfinder', () => {
  it('jalur ke diri sendiri sepele', () => {
    const { state, finder } = build()

    expect(finder.findPath(10, 10, costFor(state))).toEqual([10])
  })

  it('setiap provinsi Indonesia terjangkau dari ibu kota', () => {
    const { state, finder } = build()
    const owned = ownedBy(state, 'IDN')
    const capital = owned[0]!
    const cost = costFor(state)

    for (const target of owned) {
      expect(finder.findPath(capital, target, cost).length).toBeGreaterThan(0)
    }
  })

  it('jalur yang dikembalikan bersambung', () => {
    const { data, state, finder } = build()
    const owned = ownedBy(state, 'IDN')
    const path = finder.findPath(owned[0]!, owned[1]!, costFor(state))

    expect(path.length).toBeGreaterThanOrEqual(2)

    for (let i = 0; i + 1 < path.length; i++) {
      const linked =
        data.land.neighboursOf(path[i]!).includes(path[i + 1]!) ||
        data.sea.neighboursOf(path[i]!).includes(path[i + 1]!)

      expect(linked, `langkah ${path[i]} -> ${path[i + 1]} bukan tautan sungguhan`).toBe(true)
    }
  })

  /*
   * Bukan dari uji C#, melainkan dari menjalankan Pathfinder rujukan pada
   * world.bin yang sama. Saat dua simpul berbiaya sama, jalur mana yang menang
   * ditentukan bentuk antrean prioritasnya; tanpa nilai ini tidak ada yang
   * menangkap antrean pengganti yang memutus seri secara berbeda.
   */
  it('memutus biaya seri persis seperti implementasi rujukan', () => {
    const { state, finder } = build()
    const owned = ownedBy(state, 'IDN')
    const cost = costFor(state)

    expect(finder.findPath(owned[0]!, owned[5]!, cost)).toEqual([34, 71, 60, 39])
    expect(finder.costTo(owned[5]!)).toBe(f32(9.6))

    expect(finder.findPath(owned[0]!, owned[4]!, cost)).toEqual([34, 63, 38])
    expect(finder.costTo(owned[4]!)).toBe(f32(6.4))

    expect(finder.findPath(owned[0]!, owned[1]!, cost)).toEqual([34, 35])
    expect(finder.costTo(owned[1]!)).toBe(f32(3.2))
  })

  /*
   * Jalur pendek di atas menempuh rute yang sama apa pun cara antreannya
   * memutus seri, jadi ia tidak membuktikan apa pun soal antreannya. Rute
   * lintas benua sepanjang tiga puluh sembilan provinsi ini membuktikannya:
   * antrean yang memutus seri menurut urutan masuk menyimpang di simpul
   * kesembilan, dan yang memutus terbalik menyimpang di dua tempat lain. Hanya
   * bentuk heap yang sama dengan implementasi rujukan yang memberi larik ini.
   */
  it('rute panjang sama persis dengan implementasi rujukan', () => {
    const { state, finder } = build()

    expect(finder.findPath(30, 34, costFor(state))).toEqual([
      30, 28, 8, 96, 95, 123, 130, 118, 1387, 1374, 1660, 447, 1365, 1247, 1640, 1630, 1627, 1479,
      1511, 1457, 1455, 1538, 1536, 1486, 725, 722, 709, 271, 274, 284, 315, 280, 1857, 1839, 1837,
      1829, 88, 91, 34,
    ])
    expect(finder.costTo(34)).toBe(f32(116.93997))
  })

  /* Tautan darat provinsi pertama Indonesia tidak menyeberang ke pulau
     tetangga, sehingga tanpa graf laut tujuannya memang tidak terjangkau. */
  it('tanpa graf laut tujuan seberang laut memberi jalur kosong', () => {
    const { state, finder } = build()
    const owned = ownedBy(state, 'IDN')

    expect(finder.findPath(owned[0]!, owned[5]!, costFor(state), false)).toEqual([])
  })

  it('indeks negatif ditolak', () => {
    const { state, finder } = build()

    expect(() => finder.findPath(-1, 3, costFor(state))).toThrow(RangeError)
    expect(() => finder.findPath(3, -1, costFor(state))).toThrow(RangeError)
  })
})
