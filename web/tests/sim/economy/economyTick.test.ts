import { beforeEach, describe, expect, it } from 'vitest'
import { readWorld, type WorldData } from '~/sim/data/WorldFile'
import { EconomyTick } from '~/sim/economy/EconomyTick'
import { ManpowerPool } from '~/sim/economy/Manpower'
import { ceilingOf, canMobilise, ProvinceStatus } from '~/sim/economy/ProvinceStatus'
import { ALL_RESOURCES, isCityGood, Resource } from '~/sim/economy/Resource'
import { Stockpile } from '~/sim/economy/Stockpile'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari EconomyTickTests.cs dan IncomeTests.cs. */

let data: WorldData
let state: WorldState
let stock: Stockpile
let economy: EconomyTick
let idn: number

beforeEach(() => {
  data = readWorld(worldBinary())
  state = data.toWorldState(1)
  stock = new Stockpile(state.nations.count)
  economy = new EconomyTick(state, stock)
  idn = state.nations.indexOf('IDN')

  for (let i = 0; i < state.provinces.count; i++) {
    economy.assignResource(i, data.resourceOf(i))
  }
})

describe('Stockpile', () => {
  it('menolak belanja melebihi cadangan', () => {
    const s = new Stockpile(2)
    s.add(0, Resource.Money, 100)

    expect(s.trySpend(0, Resource.Money, 60)).toBe(true)
    expect(s.trySpend(0, Resource.Money, 60)).toBe(false)
    expect(s.get(0, Resource.Money)).toBe(40)
  })

  it('negara tidak berbagi cadangan', () => {
    const s = new Stockpile(3)
    s.add(1, Resource.Food, 500)

    expect(s.get(1, Resource.Food)).toBe(500)
    expect(s.get(0, Resource.Food)).toBe(0)
    expect(s.get(2, Resource.Food)).toBe(0)
  })
})

describe('ProvinceStatus', () => {
  it('provinsi biasa dibatasi separuh', () => {
    expect(ceilingOf(ProvinceStatus.Homeland)).toBeCloseTo(1, 3)
    expect(ceilingOf(ProvinceStatus.PlainProvince)).toBeCloseTo(0.5, 3)
    expect(ceilingOf(ProvinceStatus.Occupied)).toBeCloseTo(0.25, 3)
    expect(canMobilise(ProvinceStatus.Occupied)).toBe(false)
    expect(canMobilise(ProvinceStatus.Homeland)).toBe(true)
  })
})

describe('EconomyTick', () => {
  it('Indonesia memperoleh uang yang masuk akal di hari pertama', () => {
    economy.runDay()

    /* Conflict of Nations memberi Indonesia 10.299 money di hari pertama
       dengan tujuh kota; dua belas kota di peta yang sedikit lebih besar harus
       mendarat di kisaran yang sama, bukan dua kali lipatnya. */
    const money = stock.get(idn, Resource.Money)
    expect(money).toBeGreaterThanOrEqual(8_000)
    expect(money).toBeLessThanOrEqual(18_000)
  })

  it('hanya kota yang menghasilkan barang', () => {
    for (let i = 0; i < state.provinces.count; i++) {
      economy.assignResource(i, Resource.Food)
    }
    economy.runDay()

    let cityCount = 0
    for (let i = 0; i < state.provinces.count; i++) {
      if (state.provinces.owner[i] === idn && state.provinces.isCity[i] !== 0) cityCount++
    }

    expect(stock.get(idn, Resource.Food)).toBeGreaterThan(0)
    expect(cityCount).toBe(12)
    expect(isCityGood(Resource.Food)).toBe(true)
    expect(isCityGood(Resource.Money)).toBe(false)
    expect(isCityGood(Resource.Manpower)).toBe(false)
  })

  /* Laju yang dilaporkan harus laju yang benar-benar datang. Tampilan yang
     mengutip angka tidak dihormati ekonominya lebih buruk daripada tidak
     mengutip apa pun. */
  it('pemasukan yang dilaporkan sama dengan yang dibayar satu hari', () => {
    for (const resource of ALL_RESOURCES) {
      const predicted = economy.dailyIncomeOf(idn, resource)
      const before = stock.get(idn, resource)

      economy.runDay()

      expect(stock.get(idn, resource) - before).toBe(predicted)
    }
  })

  it('sapuan seluruh negara sama dengan kueri satu negara', () => {
    const into = new Float64Array(state.nations.count * ALL_RESOURCES.length)
    economy.dailyIncomeInto(into)

    for (const resource of ALL_RESOURCES) {
      expect(into[idn * ALL_RESOURCES.length + resource]).toBe(
        economy.dailyIncomeOf(idn, resource),
      )
    }
  })

  it('uang datang dari setiap provinsi, bukan hanya kota', () => {
    const money = economy.dailyIncomeOf(idn, Resource.Money)
    const food = economy.dailyIncomeOf(idn, Resource.Food)

    expect(money).toBeGreaterThan(0)
    expect(money, 'uang dibayar setiap provinsi dan harus melebihi satu barang kota').toBeGreaterThan(food)
  })

  /* Setiap negara di fixture punya tanah, jadi kasus tanpa tanah dibuat, bukan
     ditemukan: penaklukan adalah situasi yang harus benar di sini. */
  it('negara yang kehilangan seluruh provinsinya tidak memperoleh apa pun', () => {
    expect(economy.dailyIncomeOf(idn, Resource.Money)).toBeGreaterThan(0)

    const conqueror = state.nations.indexOf('AUS')
    for (let i = 0; i < state.provinces.count; i++) {
      if (state.provinces.controller[i] === idn) state.provinces.controller[i] = conqueror
    }

    expect(economy.dailyIncomeOf(idn, Resource.Money)).toBe(0)
    expect(economy.dailyIncomeOf(conqueror, Resource.Money)).toBeGreaterThan(0)
  })
})

describe('ManpowerPool', () => {
  it('regenerasi dilaporkan oleh kolam yang memilikinya', () => {
    const pool = new ManpowerPool(state)
    const predicted = pool.dailyRegenOf(idn, stock)
    const before = stock.get(idn, Resource.Manpower)

    pool.runDay(stock)

    expect(stock.get(idn, Resource.Manpower) - before).toBe(predicted)
    expect(predicted, 'negara tanpa cadangan awal harus sedang mengisi').toBeGreaterThan(0)
  })
})
