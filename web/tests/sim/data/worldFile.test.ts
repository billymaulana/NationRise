import { beforeAll, describe, expect, it } from 'vitest'
import { readWorld, WorldFileError, type WorldData } from '~/sim/data/WorldFile'
import { Resource } from '~/sim/economy/Resource'
import { NO_OWNER } from '~/sim/world/ProvinceStore'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/*
 * Diport dari NationRise.Core.Tests/Data/WorldFileTests.cs. Angka harapannya
 * disalin apa adanya: 54 provinsi dan 12 kota Indonesia adalah keputusan peta
 * yang sudah dikunci, bukan hasil pengukuran yang boleh bergeser.
 *
 * Berbeda dari versi C# yang menerima Stream, pembaca di sini menerima
 * ArrayBuffer. Simulasi harus jalan di Worker peramban, tempat berkas tidak
 * ada; I/O ditinggalkan ke pemanggil.
 */
let world: WorldData
let state: WorldState
let idn: number

beforeAll(() => {
  world = readWorld(worldBinary())
  state = world.toWorldState(1n)
  idn = state.nations.indexOf('IDN')
})

describe('WorldFile', () => {
  it('memuat berkas dunia sungguhan', () => {
    expect(world.provinceCount).toBeGreaterThan(1500)
    expect(world.nationTags.length).toBeGreaterThan(150)
  })

  it('menolak magic yang salah', () => {
    expect(() => readWorld(new ArrayBuffer(64))).toThrow(WorldFileError)
  })

  it('Indonesia punya provinsi yang sudah ditetapkan riset peta', () => {
    expect(idn).toBeGreaterThanOrEqual(0)

    let provinces = 0
    let cities = 0
    for (let i = 0; i < state.provinces.count; i++) {
      if (state.provinces.owner[i] !== idn) continue
      provinces++
      if (state.provinces.isCity[i] !== 0) cities++
    }

    expect(provinces).toBe(54)
    expect(cities).toBe(12)
  })

  it('setiap provinsi punya pemilik dan medan', () => {
    for (let i = 0; i < state.provinces.count; i++) {
      expect(state.provinces.owner[i]).not.toBe(NO_OWNER)
      expect(state.provinces.terrain[i]).toBeGreaterThanOrEqual(0)
      expect(state.provinces.terrain[i]).toBeLessThanOrEqual(12)
    }
  })

  it('ketetanggaan darat bersifat simetris', () => {
    for (let a = 0; a < world.provinceCount; a++) {
      for (const b of world.land.neighboursOf(a)) {
        expect(world.land.neighboursOf(b)).toContain(a)
      }
    }
  })

  it('setiap provinsi Indonesia terjangkau', () => {
    for (let i = 0; i < state.provinces.count; i++) {
      if (state.provinces.owner[i] !== idn) continue
      const links = world.land.neighboursOf(i).length + world.sea.neighboursOf(i).length
      expect(links, `provinsi ${i} terputus`).toBeGreaterThan(0)
    }
  })

  it('poin kemenangan cocok dengan angka desain', () => {
    const points = state.victoryPointsOf(idn)
    expect(points).toBeGreaterThanOrEqual(90)
    expect(points).toBeLessThanOrEqual(105)
  })

  it('kota Indonesia memproduksi apa yang diputuskan riset peta', () => {
    const produced = new Map<Resource, number>()

    for (let i = 0; i < state.provinces.count; i++) {
      if (state.provinces.owner[i] !== idn || state.provinces.isCity[i] === 0) continue
      const resource = world.resourceOf(i)
      produced.set(resource, (produced.get(resource) ?? 0) + 1)
    }

    /* Indonesia harus tetap kekurangan teknologi: kelangkaan itulah yang
       membuat pasar dunia berarti, bukan sekadar menghias antarmuka. */
    expect(produced.get(Resource.Technology)).toBe(1)
    expect(produced.get(Resource.Food) ?? 0).toBeGreaterThanOrEqual(3)
    expect(produced.get(Resource.Fuel) ?? 0).toBeGreaterThanOrEqual(2)
    expect(produced.get(Resource.RareResources) ?? 0).toBeGreaterThanOrEqual(2)
  })

  it('wilayah sengketa membawa seluruh pengklaimnya', () => {
    let contested = 0
    for (let i = 0; i < state.provinces.count; i++) {
      if (state.provinces.isContested(i)) contested++
    }

    expect(contested, `hanya ${contested} provinsi sengketa sampai ke peta`).toBeGreaterThanOrEqual(10)
  })

  it('setiap provinsi punya sedikitnya satu pengklaim', () => {
    for (let i = 0; i < state.provinces.count; i++) {
      expect(state.provinces.claimsOf(i).length).toBeGreaterThan(0)
    }
  })

  it('provinsi sengketa diklaim pihak yang tidak menguasainya', () => {
    const contested = Array.from({ length: state.provinces.count }, (_, i) => i).find((i) =>
      state.provinces.isContested(i),
    )

    expect(contested).toBeDefined()

    const holder = state.provinces.controller[contested!]
    expect([...state.provinces.claimsOf(contested!)].some((c) => c !== holder)).toBe(true)
  })
})
