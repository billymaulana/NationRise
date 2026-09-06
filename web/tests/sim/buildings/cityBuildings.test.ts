import { describe, expect, it } from 'vitest'
import { costsFor } from '~/sim/buildings/BuildingCost'
import { ALL_BUILDING_TYPES, BuildingType, slotsFor } from '~/sim/buildings/BuildingType'
import { CityBuildings, ConstructionRejected } from '~/sim/buildings/CityBuildings'
import { readWorld } from '~/sim/data/WorldFile'
import { RESOURCE_COUNT, Resource } from '~/sim/economy/Resource'
import { Stockpile } from '~/sim/economy/Stockpile'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Buildings/CityBuildingsTests.cs. */

interface Harness {
  state: WorldState
  stock: Stockpile
  buildings: CityBuildings
  city: number
}

function setup(): Harness {
  const state = readWorld(worldBinary()).toWorldState(1)
  const stock = new Stockpile(state.nations.count)
  const idn = state.nations.indexOf('IDN')

  for (let i = 0; i < state.provinces.count; i++) {
    if (state.provinces.owner[i] !== idn || state.provinces.isCity[i] === 0) continue

    for (let resource = 0; resource < RESOURCE_COUNT; resource++) {
      stock.add(idn, resource as Resource, 1_000_000)
    }

    return { state, stock, buildings: new CityBuildings(state, stock), city: i }
  }

  throw new Error('tidak ada kota Indonesia di berkas dunia')
}

describe('CityBuildings', () => {
  it('bangunan selesai setelah durasinya', () => {
    const { state, buildings, city } = setup()
    const order = buildings.begin(city, BuildingType.ArmsIndustry)

    expect(buildings.isBuilding(city)).toBe(true)
    expect(buildings.levelOf(city, BuildingType.ArmsIndustry)).toBe(0)

    while (state.clock.tick < order.completesAtTick) state.clock.advance()
    buildings.tick()

    expect(buildings.levelOf(city, BuildingType.ArmsIndustry)).toBe(1)
    expect(buildings.isBuilding(city)).toBe(false)
    expect(buildings.recentlyCompleted).toHaveLength(1)
  })

  /*
   * Berkas dunia memulai setiap provinsi pada morale 0,7, yang membuat faktor
   * pembangunan 1,0810810. Sepuluh jam dasar industri senjata menjadi sebelas
   * dan dua puluh delapan jam pangkalan darat menjadi tiga puluh. Dihitung
   * dengan double atau dengan pembulatan menjauhi nol, keduanya meleset.
   */
  it('morale awal dunia memberi durasi yang persis', () => {
    const { buildings, city } = setup()

    expect(buildings.begin(city, BuildingType.ArmsIndustry).completesAtTick).toBe(11)
    buildings.cancel(city)
    expect(buildings.begin(city, BuildingType.ArmyBase).completesAtTick).toBe(30)
  })

  /*
   * Pada morale 0,52 tingkat tiga pangkalan darat mendarat persis di 62,5 jam.
   * MathF.Round membulatkan setengah ke genap dan memberi 62; Math.round
   * JavaScript memberi 63, begitu pula rantai yang sama dihitung dengan double.
   * Ini satu-satunya titik di seluruh tabel biaya tempat ketiganya berpisah.
   */
  it('setengah jam dibulatkan ke genap seperti MathF.Round', () => {
    const { state, buildings, city } = setup()
    state.provinces.morale[city] = 0.52

    const first = buildings.begin(city, BuildingType.ArmyBase)
    expect(first.completesAtTick - state.clock.tick).toBe(32)
    state.clock.advanceTo(first.completesAtTick)
    buildings.tick()

    const second = buildings.begin(city, BuildingType.ArmyBase)
    expect(second.completesAtTick - state.clock.tick).toBe(44)
    state.clock.advanceTo(second.completesAtTick)
    buildings.tick()

    const third = buildings.begin(city, BuildingType.ArmyBase)
    expect(third.completesAtTick - state.clock.tick).toBe(62)
  })

  it('pembangunan menarik dari cadangan', () => {
    const { state, stock, buildings, city } = setup()
    const nation = state.provinces.controller[city]!
    const before = stock.get(nation, Resource.Money)

    buildings.begin(city, BuildingType.ArmyBase)

    expect(stock.get(nation, Resource.Money)).toBe(
      before - costsFor(BuildingType.ArmyBase, 1).find((c) => c.resource === Resource.Money)!.amount,
    )
  })

  it('kota membangun satu hal dalam satu waktu', () => {
    const { buildings, city } = setup()
    buildings.begin(city, BuildingType.ArmyBase)

    expect(() => buildings.begin(city, BuildingType.AirBase)).toThrow(ConstructionRejected)
  })

  it('kas kosong menghentikan pembangunan', () => {
    const { state, stock, buildings, city } = setup()
    const nation = state.provinces.controller[city]!
    stock.trySpend(nation, Resource.Money, stock.get(nation, Resource.Money))

    expect(() => buildings.begin(city, BuildingType.ArmyBase)).toThrow(ConstructionRejected)
  })

  it('slot habis', () => {
    const { state, buildings, city } = setup()
    const slots = slotsFor(state.provinces.population[city]!)

    for (let i = 0; i < slots; i++) {
      const order = buildings.begin(city, ALL_BUILDING_TYPES[i]!)
      state.clock.advanceTo(order.completesAtTick)
      buildings.tick()
    }

    expect(buildings.usedSlots(city)).toBe(slots)
    expect(() => buildings.begin(city, ALL_BUILDING_TYPES[slots]!)).toThrow(ConstructionRejected)
  })

  it('menaikkan bangunan yang sudah ada tidak menuntut slot baru', () => {
    const { state, buildings, city } = setup()
    const slots = slotsFor(state.provinces.population[city]!)

    for (let i = 0; i < slots; i++) {
      const order = buildings.begin(city, ALL_BUILDING_TYPES[i]!)
      state.clock.advanceTo(order.completesAtTick)
      buildings.tick()
    }

    expect(buildings.begin(city, ALL_BUILDING_TYPES[0]!).targetLevel).toBe(2)
  })

  it('industri senjata menaikkan keluaran', () => {
    const { state, buildings, city } = setup()
    expect(buildings.productionMultiplier(city)).toBeCloseTo(1, 3)

    for (let level = 0; level < 3; level++) {
      const order = buildings.begin(city, BuildingType.ArmsIndustry)
      state.clock.advanceTo(order.completesAtTick)
      buildings.tick()
    }

    expect(buildings.productionMultiplier(city)).toBeCloseTo(1.3, 2)
  })

  /* Kota yang direbut kemarin tidak boleh jadi benteng hari ini. */
  it('morale rendah memperlambat pembangunan', () => {
    const { state, buildings, city } = setup()

    state.provinces.morale[city] = 1
    const fast = buildings.begin(city, BuildingType.ArmyBase).completesAtTick
    buildings.cancel(city)

    state.provinces.morale[city] = 0.25
    const slow = buildings.begin(city, BuildingType.ArmyBase).completesAtTick

    expect(slow).toBeGreaterThan(fast)
  })

  it('provinsi biasa tidak bisa membangun', () => {
    const { state, buildings } = setup()

    for (let i = 0; i < state.provinces.count; i++) {
      if (state.provinces.isCity[i] !== 0) continue

      expect(() => buildings.begin(i, BuildingType.ArmyBase)).toThrow(ConstructionRejected)
      return
    }
  })

  it('bangunan yang sudah maksimal tidak bisa dinaikkan lagi', () => {
    const { state, buildings, city } = setup()

    for (let level = 0; level < 5; level++) {
      const order = buildings.begin(city, BuildingType.ArmsIndustry)
      state.clock.advanceTo(order.completesAtTick)
      buildings.tick()
    }

    expect(buildings.levelOf(city, BuildingType.ArmsIndustry)).toBe(5)
    expect(() => buildings.begin(city, BuildingType.ArmsIndustry)).toThrow(ConstructionRejected)
  })

  it('pesanan bisa dibaca dan dibatalkan', () => {
    const { buildings, city } = setup()

    expect(buildings.orderIn(city)).toBeNull()

    const order = buildings.begin(city, BuildingType.AirBase)
    expect(buildings.orderIn(city)).toEqual(order)

    buildings.cancel(city)
    expect(buildings.orderIn(city)).toBeNull()
    expect(buildings.isBuilding(city)).toBe(false)
  })

  it('daftar selesai dikosongkan tiap tick dan bisa dibersihkan sendiri', () => {
    const { state, buildings, city } = setup()
    const order = buildings.begin(city, BuildingType.RecruitingOffice)
    state.clock.advanceTo(order.completesAtTick)

    buildings.tick()
    expect(buildings.recentlyCompleted).toHaveLength(1)

    buildings.clearCompleted()
    expect(buildings.recentlyCompleted).toHaveLength(0)
  })

  /*
   * Diport dari ShortageTests.AMaterialsShortageStopsConstruction. ShortageSystem
   * sendiri belum diport, sehingga gerbangnya diisi tiruan: yang diuji di sini
   * adalah bahwa CityBuildings menanyakannya sebelum memulai pekerjaan baru,
   * bukan bagaimana kelangkaan itu terbentuk.
   */
  it('kelangkaan menghentikan pekerjaan baru, bukan yang sedang berjalan', () => {
    const { state, buildings, city } = setup()
    const running = buildings.begin(city, BuildingType.RecruitingOffice)

    buildings.shortage = { haltingResource: () => Resource.Materials }

    state.clock.advanceTo(running.completesAtTick)
    buildings.tick()
    expect(buildings.levelOf(city, BuildingType.RecruitingOffice)).toBe(1)

    expect(() => buildings.begin(city, BuildingType.ArmyBase)).toThrow(/Materials/)
  })
})
