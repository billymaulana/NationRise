import { beforeAll, describe, expect, it } from 'vitest'
import { ProvinceGraph, readWorld, WorldData } from '~/sim/data/WorldFile'
import { isCityGood } from '~/sim/economy/Resource'
import { ProvinceQuery } from '~/sim/world/ProvinceQuery'
import type { WorldState } from '~/sim/world/WorldState'
import { provinceNames, worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/World/ProvinceQueryTests.cs. */

let world: WorldData
let state: WorldState
let query: ProvinceQuery
let idn: number

beforeAll(() => {
  world = readWorld(worldBinary())
  state = world.toWorldState(1)
  query = new ProvinceQuery(state, world, provinceNames(world.provinceCount))
  idn = state.nations.indexOf('IDN')
})

/* Dunia kecil bertiga provinsi: satu tak disengketakan, satu diklaim dua
   pihak, satu milik negara lain. */
function disputedWorld(): { state: WorldState; data: WorldData } {
  const claimsPerProvince = [[0], [0, 1], [1]]
  const offsets = new Int32Array(claimsPerProvince.length + 1)
  const flat: number[] = []

  for (let i = 0; i < claimsPerProvince.length; i++) {
    offsets[i] = flat.length
    flat.push(...claimsPerProvince[i]!)
  }
  offsets[claimsPerProvince.length] = flat.length

  const unlinked = new ProvinceGraph(new Int32Array(claimsPerProvince.length + 1), new Uint16Array(0))
  const data = new WorldData(
    ['AAA', 'BBB'],
    Uint16Array.from([0, 0, 1]),
    new Uint8Array(3),
    new Float32Array(3),
    new Uint8Array(3),
    new Uint8Array(3),
    offsets,
    Uint16Array.from(flat),
    unlinked,
    unlinked,
  )

  return { state: data.toWorldState(1), data }
}

describe('ProvinceQuery', () => {
  it('ringkasan cocok dengan provinsi yang digambarkannya', () => {
    const jakarta = query.findCity('Jakarta')
    const summary = query.summarise(jakarta)

    expect(summary.id).toBe(jakarta)
    expect(summary.ownerName).toBe('IDN')
    expect(summary.controllerName).toBe('IDN')
    expect(state.provinces.owner[jakarta]).toBe(idn)
    expect(summary.isCity).toBe(true)
    expect(summary.population).toBe(state.provinces.population[jakarta])
    expect(summary.terrain).toBe(state.provinces.terrain[jakarta])
    expect(summary.morale).toBe(state.provinces.morale[jakarta])
    expect(summary.resource).toBe(world.resourceOf(jakarta))
    expect(isCityGood(summary.resource)).toBe(true)
    expect(summary.isOccupied).toBe(false)
    expect(summary.isContested).toBe(false)
    expect(summary.landNeighbours).toBe(world.land.neighboursOf(jakarta).length)
    expect(summary.seaNeighbours).toBe(world.sea.neighboursOf(jakarta).length)
  })

  it('kota Indonesia ditemukan apa pun kapitalisasinya', () => {
    const jakarta = query.findCity('Jakarta')

    expect(jakarta).toBeGreaterThanOrEqual(0)
    expect(query.findCity('jakarta')).toBe(jakarta)
    expect(query.findCity('  JAKARTA  ')).toBe(jakarta)
    expect(query.nameOf(jakarta)).toBe('Jakarta')
    expect(state.provinces.owner[jakarta]).toBe(idn)
    expect(state.provinces.isCity[jakarta]).not.toBe(0)
  })

  it('hanya kota yang menjawab pencarian kota', () => {
    expect(query.findCity('Atlantis')).toBe(-1)
    expect(query.findCity('')).toBe(-1)
    expect(query.findCity('Papua')).toBe(-1)
  })

  it('pendudukan tampak sebagai pengendali yang berbeda', () => {
    const jakarta = query.findCity('Jakarta')
    const invader = idn === 0 ? 1 : 0

    state.provinces.controller[jakarta] = invader
    const summary = query.summarise(jakarta)

    expect(summary.isOccupied).toBe(true)
    expect(summary.ownerName).toBe('IDN')
    expect(summary.controllerName).toBe(state.nations.name[invader])
    expect(summary.ownerName).not.toBe(summary.controllerName)

    state.provinces.controller[jakarta] = idn
  })

  it('tetangga dilaporkan terpisah per domain', () => {
    let amphibious = -1
    for (let i = 0; i < state.provinces.count && amphibious < 0; i++) {
      if (
        state.provinces.owner[i] === idn &&
        world.land.neighboursOf(i).length > 0 &&
        world.sea.neighboursOf(i).length > 0
      ) {
        amphibious = i
      }
    }

    expect(amphibious, 'kepulauan harus punya provinsi dengan tautan darat dan laut').toBeGreaterThanOrEqual(0)

    const { land, sea } = query.neighboursOf(amphibious)

    expect(land).toEqual([...world.land.neighboursOf(amphibious)])
    expect(sea).toEqual([...world.sea.neighboursOf(amphibious)])
    expect(query.summarise(amphibious).landNeighbours).toBe(land.length)
    expect(query.summarise(amphibious).seaNeighbours).toBe(sea.length)
  })

  it('provinsi dengan dua pengklaim berarti disengketakan', () => {
    const { state: small, data } = disputedWorld()
    const q = new ProvinceQuery(small, data)

    expect(q.summarise(0).isContested).toBe(false)
    expect(q.summarise(1).isContested).toBe(true)
    expect(q.summarise(2).isContested).toBe(false)
  })

  it('kueri tanpa nama tetap bisa meringkas', () => {
    const { state: small, data } = disputedWorld()
    const q = new ProvinceQuery(small, data)

    expect(q.nameOf(0)).toBe('')
    expect(q.findCity('Jakarta')).toBe(-1)
    expect(q.summarise(0).ownerName).toBe('AAA')
    expect(q.count).toBe(3)
  })

  it('provinsi di luar peta ditolak', () => {
    expect(() => query.summarise(-1)).toThrow(RangeError)
    expect(() => query.summarise(query.count)).toThrow(RangeError)
    expect(() => query.neighboursOf(query.count)).toThrow(RangeError)
  })

  it('menolak data yang jumlah provinsinya tidak cocok', () => {
    const { data } = disputedWorld()
    expect(() => new ProvinceQuery(state, data)).toThrow(RangeError)
  })
})
