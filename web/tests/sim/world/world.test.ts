import { describe, expect, it } from 'vitest'
import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { GameClock } from '~/sim/time/GameClock'
import { Doctrine, NationStore } from '~/sim/world/NationStore'
import { NO_OWNER, ProvinceStore } from '~/sim/world/ProvinceStore'
import { favoursDefence, isWater, Terrain } from '~/sim/world/Terrain'
import { WorldState } from '~/sim/world/WorldState'

/* Diport dari NationRise.Core.Tests/World/ProvinceStoreTests.cs. */
function build(...claimsPerProvince: number[][]): ProvinceStore {
  const count = claimsPerProvince.length
  const offsets = new Int32Array(count + 1)
  const flat: number[] = []

  for (let i = 0; i < count; i++) {
    offsets[i] = flat.length
    flat.push(...claimsPerProvince[i]!)
  }

  offsets[count] = flat.length
  return new ProvinceStore(count, offsets, Uint16Array.from(flat))
}

describe('ProvinceStore', () => {
  it('gudang baru belum punya pemilik', () => {
    const store = build([1], [2])

    expect(store.at(0).owner).toBe(NO_OWNER)
    expect(store.at(1).owner).toBe(NO_OWNER)
  })

  it('klaim bergerigi memetakan ke provinsi yang benar', () => {
    const store = build([7], [3, 4, 5], [9])

    expect([...store.claimsOf(0)]).toEqual([7])
    expect([...store.claimsOf(1)]).toEqual([3, 4, 5])
    expect([...store.claimsOf(2)]).toEqual([9])
  })

  it('provinsi dengan beberapa klaim berarti disengketakan', () => {
    const store = build([7], [3, 4, 5])

    expect(store.at(0).isContested).toBe(false)
    expect(store.at(1).isContested).toBe(true)
  })

  it('pendudukan adalah pengendali yang berbeda dari pemilik', () => {
    const store = build([1], [1])
    store.owner[0] = 1
    store.controller[0] = 1
    store.owner[1] = 1
    store.controller[1] = 2

    expect(store.at(0).isOccupied).toBe(false)
    expect(store.at(1).isOccupied).toBe(true)
  })

  it('pencarian klaim menemukan pengklaim', () => {
    const store = build([3, 4, 5])

    expect(store.at(0).isClaimedBy(4)).toBe(true)
    expect(store.at(0).isClaimedBy(6)).toBe(false)
  })

  it('menolak panjang offset yang tidak cocok', () => {
    expect(() => new ProvinceStore(2, new Int32Array(2), new Uint16Array(0))).toThrow(RangeError)
  })
})

describe('Terrain', () => {
  it('mengenali medan air', () => {
    expect(isWater(Terrain.CoastalWaters)).toBe(true)
    expect(isWater(Terrain.HighSeas)).toBe(true)
    expect(isWater(Terrain.Strait)).toBe(true)
    expect(isWater(Terrain.OpenGround)).toBe(false)
  })

  it('mengenali medan yang menguntungkan bertahan', () => {
    expect(favoursDefence(Terrain.Mountains)).toBe(true)
    expect(favoursDefence(Terrain.Urban)).toBe(true)
    expect(favoursDefence(Terrain.OpenGround)).toBe(false)
    expect(favoursDefence(Terrain.Desert)).toBe(false)
  })
})

describe('NationStore', () => {
  it('semua negara hidup dan tanpa ibu kota saat dibuat', () => {
    const nations = new NationStore(3)

    expect(nations.count).toBe(3)
    expect([...nations.isAlive]).toEqual([1, 1, 1])
    expect([...nations.capitalProvince]).toEqual([-1, -1, -1])
    expect(nations.tag).toEqual(['', '', ''])
  })

  it('mencari negara berdasarkan tag', () => {
    const nations = new NationStore(2)
    nations.tag[0] = 'IDN'
    nations.tag[1] = 'MYS'

    expect(nations.indexOf('MYS')).toBe(1)
    expect(nations.indexOf('SGP')).toBe(-1)
  })

  it('doktrin bawaan adalah Western', () => {
    expect(new NationStore(1).doctrine[0]).toBe(Doctrine.Western)
  })
})

describe('WorldState', () => {
  function world(): WorldState {
    const provinces = build([0], [0], [0])
    const nations = new NationStore(2)
    return new WorldState(provinces, nations, new GameClock(), new DeterministicRandom(1))
  }

  it('kota bernilai populasinya, provinsi biasa bernilai satu', () => {
    const state = world()
    state.provinces.controller[0] = 0
    state.provinces.isCity[0] = 1
    state.provinces.population[0] = 6
    state.provinces.controller[1] = 0
    state.provinces.controller[2] = 1

    expect(state.victoryPointsOf(0)).toBe(7)
    expect(state.victoryPointsOf(1)).toBe(1)
  })

  /*
   * MathF.Round di .NET memakai pembulatan bankir: 2,5 menjadi 2, bukan 3.
   * Math.round JavaScript membulatkan ke atas dan akan menyimpang di sini.
   */
  it('membulatkan populasi kota ke genap seperti MathF.Round', () => {
    const state = world()
    state.provinces.controller[0] = 0
    state.provinces.isCity[0] = 1

    state.provinces.population[0] = 2.5
    expect(state.victoryPointsOf(0)).toBe(2)

    state.provinces.population[0] = 3.5
    expect(state.victoryPointsOf(0)).toBe(4)

    state.provinces.population[0] = 2.6
    expect(state.victoryPointsOf(0)).toBe(3)
  })
})
