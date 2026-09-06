import { beforeEach, describe, expect, it } from 'vitest'
import { readWorld } from '~/sim/data/WorldFile'
import {
  fractionFor,
  labelOf,
  ManpowerPool,
  MobilisationLevel,
  moneyPenalty,
  moralePenalty,
} from '~/sim/economy/Manpower'
import { Resource } from '~/sim/economy/Resource'
import { Stockpile } from '~/sim/economy/Stockpile'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Economy/ManpowerTests.cs. */

let state: WorldState
let pool: ManpowerPool
let idn: number

beforeEach(() => {
  state = readWorld(worldBinary()).toWorldState(1)
  pool = new ManpowerPool(state)
  idn = state.nations.indexOf('IDN')
})

describe('ManpowerInfo', () => {
  it('mobilisasi lebih tinggi menaikkan kapasitas dan biaya', () => {
    expect(fractionFor(MobilisationLevel.Total)).toBeGreaterThan(fractionFor(MobilisationLevel.Peace))

    expect(moneyPenalty(MobilisationLevel.Peace)).toBe(0)
    expect(moneyPenalty(MobilisationLevel.Total)).toBeGreaterThan(0)
    expect(moralePenalty(MobilisationLevel.Total)).toBeGreaterThan(0)
  })

  it('memberi label untuk setiap tingkat', () => {
    expect(labelOf(MobilisationLevel.Peace)).toBe('Peacetime')
    expect(labelOf(MobilisationLevel.Total)).toBe('Total mobilisation')
  })
})

describe('ManpowerPool', () => {
  it('kapasitas mengikuti wilayah', () => {
    const peace = pool.capacityOf(idn)
    pool.setLevel(idn, MobilisationLevel.Total)
    const total = pool.capacityOf(idn)

    expect(peace).toBeGreaterThan(0)

    /* Mobilisasi penuh sedikit di bawah tiga kali kolam masa damai. Dulu
       hampir tujuh, yang terbaca sebagai negara yang nyaris tidak
       mempersenjatai siapa pun sampai perang datang. */
    expect(total / peace).toBeGreaterThanOrEqual(2)
    expect(total / peace).toBeLessThanOrEqual(4)
  })

  it('tanah pendudukan menghasilkan manpower lebih sedikit', () => {
    const owned = pool.capacityOf(idn)

    for (let i = 0; i < state.provinces.count; i++) {
      if (state.provinces.owner[i] === idn) state.provinces.owner[i] = idn + 1
    }

    expect(pool.capacityOf(idn)).toBeLessThan(owned)
  })

  /* Kehilangan butuh waktu untuk digantikan meski populasinya ada, dan itulah
     yang mencegah sebuah negara menggilas lawan dengan pasukan tanpa batas. */
  it('kolam terisi bertahap menuju kapasitas', () => {
    const stock = new Stockpile(state.nations.count)
    const capacity = pool.capacityOf(idn)

    pool.runDay(stock)
    const afterOneDay = stock.get(idn, Resource.Manpower)

    for (let day = 0; day < 60; day++) pool.runDay(stock)
    const afterTwoMonths = stock.get(idn, Resource.Manpower)

    expect(afterOneDay).toBeGreaterThan(0)
    expect(afterTwoMonths).toBeGreaterThan(afterOneDay * 5)
    expect(afterTwoMonths).toBeLessThan(capacity)
  })
})
