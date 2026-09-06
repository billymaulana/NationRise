import { describe, expect, it } from 'vitest'
import { readWorld, type WorldData } from '~/sim/data/WorldFile'
import { mulF32, subF32 } from '~/sim/determinism/float32'
import { Army } from '~/sim/military/Army'
import {
  CUT_OFF_ATTACK,
  CUT_OFF_DAILY_ATTRITION,
  CUT_OFF_DEFENCE,
  GRACE_TICKS,
  LOW_ATTACK,
  RECOMPUTE_INTERVAL,
  SupplyStatus,
  SupplySystem,
  UNREACHABLE,
} from '~/sim/military/SupplySystem'
import { MOTORIZED_INFANTRY } from '~/sim/military/UnitCatalogue'
import { NO_OWNER } from '~/sim/world/ProvinceStore'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Military/SupplyTests.cs. */

interface Pocket {
  nation: number
  link: number
  isolated: number
}

interface Fixture {
  state: WorldState
  data: WorldData
}

let cached: WorldData | null = null

function worldData(): WorldData {
  cached ??= readWorld(worldBinary())
  return cached
}

function build(): Fixture {
  const data = worldData()
  return { state: data.toWorldState(1), data }
}

function indonesia(state: WorldState): number {
  return state.nations.indexOf('IDN')
}

function provincesOf(state: WorldState, nation: number): number[] {
  const owned: number[] = []

  for (let i = 0; i < state.provinces.count; i++) {
    if (state.provinces.controller[i] === nation) owned.push(i)
  }

  return owned
}

function neighboursOf(data: WorldData, province: number): number[] {
  const neighbours: number[] = []

  for (const neighbour of data.land.neighboursOf(province)) neighbours.push(neighbour)
  for (const neighbour of data.sea.neighboursOf(province)) neighbours.push(neighbour)

  return neighbours
}

function holdsACity(state: WorldState, nation: number): boolean {
  for (let i = 0; i < state.provinces.count; i++) {
    if (state.provinces.isCity[i] !== 0 && state.provinces.controller[i] === nation) return true
  }

  return false
}

function invaderWithoutAFootholdNear(state: WorldState, data: WorldData, province: number): number {
  const neighbours = neighboursOf(data, province)
  const defender = state.provinces.controller[province]!

  for (let nation = 0; nation < state.nations.count; nation++) {
    if (nation === defender || !holdsACity(state, nation)) continue
    if (neighbours.some((n) => state.provinces.controller[n] === nation)) continue

    return nation
  }

  throw new Error(`Setiap negara bertetangga dengan provinsi ${province}.`)
}

function soleNeighbourWithin(
  state: WorldState,
  data: WorldData,
  province: number,
  nation: number,
): number {
  let only = -1

  for (const neighbour of neighboursOf(data, province)) {
    if (state.provinces.controller[neighbour] !== nation || neighbour === only) continue
    if (only >= 0) return -1

    only = neighbour
  }

  return only
}

/* Provinsi yang satu-satunya tetangga senegaranya adalah satu provinsi biasa
   adalah pengepungan yang menunggu terjadi: graf itu sendiri sudah menyatakan
   bahwa merebut satu tautan itu pasti mengasingkannya, sehingga penegasannya
   tidak bergantung pada kode supply menyetujui dirinya sendiri. */
function findLeafPocket(state: WorldState, data: WorldData, supply: SupplySystem): Pocket {
  for (let isolated = 0; isolated < state.provinces.count; isolated++) {
    if (state.provinces.isCity[isolated] !== 0) continue
    if (supply.statusOf(isolated) !== SupplyStatus.Supplied) continue

    const nation = state.provinces.controller[isolated]!
    const link = soleNeighbourWithin(state, data, isolated, nation)

    if (link < 0 || state.provinces.isCity[link] !== 0) continue
    if (supply.cutOffProvincesOf(nation).length > 0) continue

    return { nation, link, isolated }
  }

  throw new Error('Tidak ada provinsi yang menggantung pada satu tetangga.')
}

describe('SupplySystem', () => {
  it('provinsi berkota selalu tersuplai', () => {
    const { state, data } = build()
    const idn = indonesia(state)
    const supply = new SupplySystem(state, data.land, data.sea)

    const cities = provincesOf(state, idn).filter((p) => state.provinces.isCity[p] !== 0)
    expect(cities.length).toBeGreaterThan(0)

    for (const city of cities) {
      expect(supply.statusOf(city)).toBe(SupplyStatus.Supplied)
      expect(supply.distanceToSupplyOf(city)).toBe(0)
    }
  })

  it('setiap provinsi Indonesia tersuplai saat permainan dimulai', () => {
    const { state, data } = build()
    const idn = indonesia(state)
    const supply = new SupplySystem(state, data.land, data.sea)
    const provinces = provincesOf(state, idn)

    expect(provinces).toHaveLength(54)
    expect(supply.cutOffProvincesOf(idn)).toEqual([])

    for (const province of provinces) {
      expect(supply.statusOf(province)).toBe(SupplyStatus.Supplied)
      expect(supply.attackMultiplierFor(province)).toBe(1)
      expect(supply.defenceMultiplierFor(province)).toBe(1)
      expect(supply.canEntrench(province)).toBe(true)
      expect(supply.acceptsReinforcements(province)).toBe(true)
    }
  })

  it('status selalu sesuai dengan jarak di graf', () => {
    const { state, data } = build()
    const supply = new SupplySystem(state, data.land, data.sea)

    for (let province = 0; province < state.provinces.count; province++) {
      const hops = supply.distanceToSupplyOf(province)

      switch (supply.statusOf(province)) {
        case SupplyStatus.Supplied:
          expect(hops).toBeGreaterThanOrEqual(0)
          expect(hops).toBeLessThanOrEqual(supply.range)
          break
        case SupplyStatus.Low:
          expect(hops).toBeGreaterThan(supply.range)
          break
        default:
          expect(hops).toBe(UNREACHABLE)
          break
      }
    }
  })

  it('provinsi yang terputus dari setiap kota jadi terkepung', () => {
    const { state, data } = build()
    const idn = indonesia(state)
    const supply = new SupplySystem(state, data.land, data.sea)

    const target = provincesOf(state, idn).find((p) => state.provinces.isCity[p] === 0)!
    const invader = invaderWithoutAFootholdNear(state, data, target)

    state.provinces.controller[target] = invader
    supply.onControlChanged(idn, invader)

    expect(supply.statusOf(target)).toBe(SupplyStatus.CutOff)
    expect(supply.distanceToSupplyOf(target)).toBe(UNREACHABLE)
    expect(supply.cutOffProvincesOf(invader)).toContain(target)
    expect(supply.cutOffProvincesOf(idn)).not.toContain(target)
  })

  it('jauh dari kota tetapi masih tersambung berarti pasokan menipis', () => {
    const { state, data } = build()
    const idn = indonesia(state)
    const supply = new SupplySystem(state, data.land, data.sea)

    const provinces = provincesOf(state, idn)
    const cities = provinces.filter((p) => state.provinces.isCity[p] !== 0)

    /* Dua belas sumber menaruh setiap provinsi Indonesia dalam dua langkah,
       sehingga jangkauannya baru terlihat begitu satu kota memberi makan
       seluruh kepulauan. */
    for (const source of cities) {
      for (const city of cities) {
        state.provinces.isCity[city] = city === source ? 1 : 0
      }

      supply.recompute(idn)

      const low = provinces.filter((p) => supply.statusOf(p) === SupplyStatus.Low)
      if (low.length === 0) continue

      expect(provinces.some((p) => supply.statusOf(p) === SupplyStatus.CutOff)).toBe(false)

      for (const province of low) {
        expect(supply.distanceToSupplyOf(province)).toBeGreaterThan(supply.range)
        expect(supply.attackMultiplierFor(province)).toBe(LOW_ATTACK)
        expect(supply.defenceMultiplierFor(province)).toBe(1)
        expect(supply.canEntrench(province)).toBe(false)
        expect(supply.acceptsReinforcements(province)).toBe(true)
      }

      return
    }

    throw new Error('Tidak ada provinsi Indonesia yang berada di luar jangkauan satu kota.')
  })

  it('provinsi terkepung kehilangan serangan dan pertahanan setelah tenggangnya habis', () => {
    const { state, data } = build()
    const idn = indonesia(state)
    const supply = new SupplySystem(state, data.land, data.sea)

    const target = provincesOf(state, idn).find((p) => state.provinces.isCity[p] === 0)!
    const invader = invaderWithoutAFootholdNear(state, data, target)

    state.provinces.controller[target] = invader
    supply.onControlChanged(idn, invader)
    state.clock.advanceTo(GRACE_TICKS)

    expect(supply.attackMultiplierFor(target)).toBe(CUT_OFF_ATTACK)
    expect(supply.defenceMultiplierFor(target)).toBe(CUT_OFF_DEFENCE)
    expect(supply.canEntrench(target)).toBe(false)
    expect(supply.acceptsReinforcements(target)).toBe(false)
    expect(supply.dailyAttritionFor(target)).toBe(CUT_OFF_DAILY_ATTRITION)
  })

  it('provinsi yang baru terkepung menahan kekuatannya sampai tenggangnya habis', () => {
    const { state, data } = build()
    const idn = indonesia(state)
    const supply = new SupplySystem(state, data.land, data.sea)

    const target = provincesOf(state, idn).find((p) => state.provinces.isCity[p] === 0)!
    const invader = invaderWithoutAFootholdNear(state, data, target)

    state.provinces.controller[target] = invader
    supply.onControlChanged(idn, invader)

    expect(supply.statusOf(target)).toBe(SupplyStatus.CutOff)
    expect(supply.graceRemainingOf(target)).toBe(GRACE_TICKS)
    expect(supply.attackMultiplierFor(target)).toBe(1)
    expect(supply.defenceMultiplierFor(target)).toBe(1)
    expect(supply.acceptsReinforcements(target)).toBe(true)

    state.clock.advanceTo(GRACE_TICKS - 1)

    expect(supply.graceRemainingOf(target)).toBe(1)
    expect(supply.attackMultiplierFor(target)).toBe(1)
    expect(supply.defenceMultiplierFor(target)).toBe(1)

    state.clock.advanceTo(GRACE_TICKS)

    expect(supply.graceRemainingOf(target)).toBe(0)
    expect(supply.attackMultiplierFor(target)).toBe(CUT_OFF_ATTACK)
  })

  it('tumpukan terkepung baru berdarah setelah bekalnya sendiri habis', () => {
    const { state, data } = build()
    const idn = indonesia(state)
    const supply = new SupplySystem(state, data.land, data.sea)

    const target = provincesOf(state, idn).find((p) => state.provinces.isCity[p] === 0)!
    const invader = invaderWithoutAFootholdNear(state, data, target)

    state.provinces.controller[target] = invader
    supply.onControlChanged(idn, invader)

    const army = new Army(1, invader, target)
    army.add(MOTORIZED_INFANTRY)
    const full = army.hitPoints

    supply.applyDailyAttrition(army)
    expect(army.hitPoints).toBe(full)

    state.clock.advanceTo(GRACE_TICKS)
    supply.applyDailyAttrition(army)

    expect(army.hitPoints).toBeCloseTo(mulF32(full, subF32(1, CUT_OFF_DAILY_ATTRITION)), 3)
  })

  it('cutOffProvincesOf mendaftar tepat kantong itu saja', () => {
    const { state, data } = build()
    const supply = new SupplySystem(state, data.land, data.sea)
    const pocket = findLeafPocket(state, data, supply)

    const invader = invaderWithoutAFootholdNear(state, data, pocket.link)
    state.provinces.controller[pocket.link] = invader
    supply.onControlChanged(pocket.nation, invader)

    expect(supply.cutOffProvincesOf(pocket.nation)).toEqual([pocket.isolated])
  })

  it('merebut satu-satunya tautan memutus pasokan di baliknya', () => {
    const { state, data } = build()
    const supply = new SupplySystem(state, data.land, data.sea)
    const pocket = findLeafPocket(state, data, supply)

    expect(supply.statusOf(pocket.isolated)).toBe(SupplyStatus.Supplied)
    expect(supply.statusOf(pocket.link)).toBe(SupplyStatus.Supplied)

    const invader = invaderWithoutAFootholdNear(state, data, pocket.link)
    state.provinces.controller[pocket.link] = invader
    supply.onControlChanged(pocket.nation, invader)

    expect(supply.statusOf(pocket.isolated)).toBe(SupplyStatus.CutOff)
    expect(supply.distanceToSupplyOf(pocket.isolated)).toBe(UNREACHABLE)

    state.provinces.controller[pocket.link] = pocket.nation
    supply.onControlChanged(invader, pocket.nation)

    expect(supply.statusOf(pocket.isolated)).toBe(SupplyStatus.Supplied)
  })

  it('banjirnya berjalan pada intervalnya, bukan setiap tick', () => {
    const { state, data } = build()
    const supply = new SupplySystem(state, data.land, data.sea)

    for (let tick = 1; tick < RECOMPUTE_INTERVAL; tick++) {
      state.clock.advance()
      supply.tick()

      expect(supply.isDue).toBe(false)
      expect(supply.lastComputedTick).toBe(0)
    }

    state.clock.advance()
    expect(supply.isDue).toBe(true)

    supply.tick()
    expect(supply.lastComputedTick).toBe(RECOMPUTE_INTERVAL)
  })

  /* Negara tanpa kota tidak pernah bisa memobilisasi, tidak pernah bisa
     membangun, dan hanya memegang tanah yang kelaparan permanen. Dua puluh
     tujuh negara memulai begitu sebelum pipeline belajar mengangkat ibu kota. */
  it('setiap negara yang memegang tanah punya tempat untuk memasok', () => {
    const { state } = build()

    const provinces = new Map<number, number>()
    const cities = new Map<number, number>()

    for (let i = 0; i < state.provinces.count; i++) {
      const nation = state.provinces.controller[i]!
      if (nation === NO_OWNER) continue

      provinces.set(nation, (provinces.get(nation) ?? 0) + 1)
      if (state.provinces.isCity[i] !== 0) cities.set(nation, (cities.get(nation) ?? 0) + 1)
    }

    const starved = [...provinces.keys()].filter((n) => (cities.get(n) ?? 0) === 0)
    expect(starved).toEqual([])
  })

  it('jauh lebih sedikit provinsi yang mulai terkepung', () => {
    const { state, data } = build()
    const supply = new SupplySystem(state, data.land, data.sea)
    supply.recomputeAll()

    let cutOff = 0
    for (let i = 0; i < state.provinces.count; i++) {
      if (supply.statusOf(i) === SupplyStatus.CutOff) cutOff++
    }

    /* Eksklave sungguhan tetap ada, tetapi peta yang empat persen dunianya
       mulai kelaparan adalah cacat data, bukan rancangan. */
    expect(cutOff).toBeLessThan(state.provinces.count / 40)
  })
})
