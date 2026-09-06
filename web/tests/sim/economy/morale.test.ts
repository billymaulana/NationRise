import { describe, expect, it } from 'vitest'
import { BuildingType } from '~/sim/buildings/BuildingType'
import { CityBuildings } from '~/sim/buildings/CityBuildings'
import { readWorld } from '~/sim/data/WorldFile'
import { f32, subF32 } from '~/sim/determinism/float32'
import { Relation, Relations } from '~/sim/diplomacy/Relation'
import { MoraleSystem } from '~/sim/economy/MoraleSystem'
import { ALL_RESOURCES, Resource } from '~/sim/economy/Resource'
import { ShortageSystem } from '~/sim/economy/ShortageSystem'
import { Stockpile } from '~/sim/economy/Stockpile'
import { UpkeepSystem } from '~/sim/economy/Upkeep'
import { Army } from '~/sim/military/Army'
import { MOTORIZED_INFANTRY } from '~/sim/military/UnitCatalogue'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Economy/MoraleTests.cs. */

interface Harness {
  state: WorldState
  stock: Stockpile
  relations: Relations
  buildings: CityBuildings
  upkeep: UpkeepSystem
  shortage: ShortageSystem
  morale: MoraleSystem
  armies: Map<number, Army>
  nation: number
}

function setup(): Harness {
  const state = readWorld(worldBinary()).toWorldState(1)
  const stock = new Stockpile(state.nations.count)
  const relations = new Relations(state.nations.count)
  const buildings = new CityBuildings(state, stock)
  const shortage = new ShortageSystem(state.nations.count)

  const upkeep = new UpkeepSystem(state, stock, buildings)
  upkeep.shortage = shortage

  const morale = new MoraleSystem(state, relations, buildings)
  morale.shortage = shortage

  const nation = state.nations.indexOf('IDN')
  for (const resource of ALL_RESOURCES) stock.add(nation, resource, 100_000)

  return { state, stock, relations, buildings, upkeep, shortage, morale, armies: new Map(), nation }
}

/* Urutan hari berjalan: tagihannya ditagih, yang tak terbayar jadi satu hari di
   tanjakan, lalu morale membaca tanjakan itu. Menjalankan morale lebih dulu
   akan melaporkan krisis kemarin. */
function day(h: Harness): void {
  h.upkeep.runDay(h.armies)
  h.morale.runDay(h.stock)
}

function days(h: Harness, count: number): void {
  for (let i = 0; i < count; i++) day(h)
}

function firstCityOf(state: WorldState, nation: number): number {
  for (let i = 0; i < state.provinces.count; i++) {
    if (state.provinces.owner[i] === nation && state.provinces.isCity[i] !== 0) return i
  }

  throw new Error('No city.')
}

function garrison(h: Harness, nation: number, province: number, units: number): void {
  const army = new Army(h.armies.size, nation, province)
  for (let i = 0; i < units; i++) army.add(MOTORIZED_INFANTRY)
  h.armies.set(army.id, army)
}

describe('MoraleSystem', () => {
  it('kota tanah air merangkak naik menuju targetnya', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)
    h.state.provinces.morale[city] = 0.3

    days(h, 40)

    expect(h.state.provinces.morale[city]!).toBeGreaterThanOrEqual(f32(0.85))
    expect(h.state.provinces.morale[city]!).toBeLessThanOrEqual(f32(0.92))
  })

  it('morale bergerak berangsur, bukan seketika', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)
    h.state.provinces.morale[city] = 0.25

    day(h)
    const afterOneDay = h.state.provinces.morale[city]!

    expect(afterOneDay).toBeGreaterThan(f32(0.25))
    expect(afterOneDay).toBeLessThan(f32(0.4))
  })

  it('kota terjajah mengendap lebih rendah daripada tanah air', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)

    const occupier = h.nation + 1
    h.state.provinces.controller[city] = occupier
    h.state.provinces.morale[city] = 0.25

    /* Penjajah butuh perbekalannya sendiri, atau yang diukur uji ini adalah
       kebangkrutannya, bukan hukuman pendudukan. */
    for (const resource of ALL_RESOURCES) h.stock.add(occupier, resource, 100_000)

    days(h, 40)

    expect(h.state.provinces.morale[city]!).toBeGreaterThanOrEqual(f32(0.55))
    expect(h.state.provinces.morale[city]!).toBeLessThanOrEqual(f32(0.65))
    expect(h.state.provinces.morale[city]!).toBeLessThan(MoraleSystem.HOMELAND_TARGET)
  })

  it('perang menyeret morale turun', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)
    h.state.provinces.morale[city] = 0.9

    for (let enemy = 0; enemy < 8; enemy++) {
      const other = h.nation + enemy + 1
      if (other < h.relations.nationCount) h.relations.set(h.nation, other, Relation.War)
    }

    days(h, 30)

    expect(h.state.provinces.morale[city]!).toBeLessThan(f32(0.9))
  })

  it('hukuman perang dibatasi', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)

    for (let other = 0; other < h.relations.nationCount; other++) {
      if (other !== h.nation) h.relations.set(h.nation, other, Relation.War)
    }

    days(h, 40)

    const floor = subF32(subF32(MoraleSystem.HOMELAND_TARGET, MoraleSystem.MAX_WAR_PENALTY), f32(0.05))
    expect(h.state.provinces.morale[city]!).toBeGreaterThan(floor)
  })

  /* Kegagalan perbekalan harus terasa sebagai krisis politik, bukan galat
     pembulatan, sehingga ia memukul setiap provinsi sekaligus. Pasukan yang
     tidak bisa diberi makan itulah yang membuat kegagalannya nyata: negara
     tanpa pasukan tidak berutang pangan dan tidak dalam kesulitan apa pun
     karena lumbungnya kosong. */
  it('pasukan yang tidak bisa diberi makan menghancurkan morale', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)
    h.state.provinces.morale[city] = 0.9

    garrison(h, h.nation, city, 4)
    h.stock.trySpend(h.nation, Resource.Food, h.stock.get(h.nation, Resource.Food))

    days(h, 20)

    expect(h.upkeep.shortfallOf(h.nation, Resource.Food)).toBeGreaterThan(0)
    expect(h.state.provinces.morale[city]!).toBeLessThan(f32(0.6))
  })

  /* Merebut tanah yang tidak sanggup kau beri makan membuatnya tak bernilai:
     kelangkaan penjajah sendiri menyeret provinsi rebutan lebih dalam daripada
     pendudukan saja. */
  it('penjajah bangkrut membuat tanah rebutan tak bernilai', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)

    h.state.provinces.controller[city] = h.nation + 1
    h.state.provinces.morale[city] = 0.6

    days(h, 40)

    expect(h.state.provinces.morale[city]!).toBeLessThan(f32(0.2))
  })

  it('morale tidak pernah keluar dari batasnya', () => {
    const h = setup()

    for (let other = 0; other < h.relations.nationCount; other++) {
      if (other !== h.nation) h.relations.set(h.nation, other, Relation.War)
    }

    garrison(h, h.nation, firstCityOf(h.state, h.nation), 4)
    h.stock.trySpend(h.nation, Resource.Food, h.stock.get(h.nation, Resource.Food))

    days(h, 200)

    for (let i = 0; i < h.state.provinces.count; i++) {
      expect(h.state.provinces.morale[i]!).toBeGreaterThanOrEqual(0)
      expect(h.state.provinces.morale[i]!).toBeLessThanOrEqual(f32(1.1))
    }
  })

  /* Inti seluruh tanjakan: pada hari pertama kekurangan hukumannya cukup kecil
     untuk jadi peringatan, bukan vonis. Jurang di angka lima puluh membuat
     kegagalan yang sama entah tak terlihat atau sudah kalah. */
  it('hari pertama kekurangan nyaris tidak menggerakkan morale', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)

    garrison(h, h.nation, city, 4)
    h.stock.trySpend(h.nation, Resource.Food, h.stock.get(h.nation, Resource.Food))
    h.state.provinces.morale[city] = MoraleSystem.HOMELAND_TARGET

    day(h)

    expect(h.shortage.daysShortOf(h.nation, Resource.Food)).toBe(1)
    expect(h.state.provinces.morale[city]!).toBeGreaterThan(f32(0.88))
  })

  /* Tidak ada yang terpasang pada bawaan yang dikirim, dan harinya tetap harus
     berjalan: sambungan kosong berarti tanpa hukuman, tidak pernah runtuh. */
  it('morale berjalan tanpa sistem kelangkaan terpasang', () => {
    const h = setup()
    const bare = new MoraleSystem(h.state, h.relations, new CityBuildings(h.state, h.stock))
    const city = firstCityOf(h.state, h.nation)
    h.state.provinces.morale[city] = 0.3

    for (let i = 0; i < 40; i++) bare.runDay(h.stock)

    expect(h.state.provinces.morale[city]!).toBeGreaterThanOrEqual(f32(0.85))
    expect(h.state.provinces.morale[city]!).toBeLessThanOrEqual(f32(0.92))
  })
})

/*
 * Rentang di uji C# cukup longgar untuk menyembunyikan rantai float 32-bit yang
 * salah: sebuah port yang menghitung dalam double tetap mendarat di dalamnya.
 * Angka di bawah diambil dengan menjalankan MoraleSystem rujukan pada susunan
 * yang sama, bukan dihitung ulang di sini, sehingga tiap pembulatan per operasi
 * ikut terpaku.
 */
describe('morale cocok dengan implementasi rujukan', () => {
  it('kota tanah air naik lewat nilai yang sama persis', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)
    expect(city).toBe(34)

    h.state.provinces.morale[city] = 0.3

    day(h)
    expect(h.state.provinces.morale[city]!).toBe(f32(0.375))

    days(h, 4)
    expect(h.state.provinces.morale[city]!).toBe(f32(0.59225464))

    days(h, 35)
    expect(h.state.provinces.morale[city]!).toBe(f32(0.8971261))
  })

  it('kota terjajah dengan penjajah yang terbekali', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)
    const occupier = h.nation + 1

    h.state.provinces.controller[city] = occupier
    h.state.provinces.morale[city] = 0.25
    for (const resource of ALL_RESOURCES) h.stock.add(occupier, resource, 100_000)

    days(h, 40)

    expect(h.state.provinces.morale[city]!).toBe(f32(0.5983236))
  })

  it('kota terjajah dengan penjajah bangkrut', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)

    h.state.provinces.controller[city] = h.nation + 1
    h.state.provinces.morale[city] = 0.6

    days(h, 40)

    expect(h.state.provinces.morale[city]!).toBe(f32(0.10760943))
  })

  it('tanjakan kelaparan memukul lewat nilai yang sama persis', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)
    h.state.provinces.morale[city] = 0.9

    garrison(h, h.nation, city, 4)
    h.stock.trySpend(h.nation, Resource.Food, h.stock.get(h.nation, Resource.Food))

    day(h)
    expect(h.shortage.daysShortOf(h.nation, Resource.Food)).toBe(1)
    expect(h.state.provinces.morale[city]!).toBe(f32(0.89374995))

    days(h, 19)
    expect(h.shortage.daysShortOf(h.nation, Resource.Food)).toBe(16)
    expect(h.upkeep.shortfallOf(h.nation, Resource.Food)).toBe(152)
    expect(h.state.provinces.morale[city]!).toBe(f32(0.5099485))
  })

  it('hukuman perang yang dibatasi mendarat di nilai yang sama persis', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)

    for (let other = 0; other < h.relations.nationCount; other++) {
      if (other !== h.nation) h.relations.set(h.nation, other, Relation.War)
    }

    expect(h.relations.enemiesOf(h.nation)).toHaveLength(246)
    expect(h.state.provinces.morale[city]!).toBe(f32(0.7))

    days(h, 40)

    expect(h.state.provinces.morale[city]!).toBe(f32(0.6502394))
  })

  it('tanpa kelangkaan terpasang hasilnya sama dengan negara yang terbekali', () => {
    const h = setup()
    const bare = new MoraleSystem(h.state, h.relations, new CityBuildings(h.state, h.stock))
    const city = firstCityOf(h.state, h.nation)
    h.state.provinces.morale[city] = 0.3

    for (let i = 0; i < 40; i++) bare.runDay(h.stock)

    expect(h.state.provinces.morale[city]!).toBe(f32(0.8971261))
  })

  /* Tidak ada uji C# yang menyentuh suku bunker sama sekali, sehingga tanpa ini
     seluruh bonusnya bisa hilang tanpa satu pun uji berubah merah. */
  it('underground bunkers mengangkat target provinsi', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)

    const order = h.buildings.begin(city, BuildingType.UndergroundBunkers)
    h.state.clock.advanceTo(order.completesAtTick)
    h.buildings.tick()

    h.state.provinces.morale[city] = 0.3
    days(h, 40)

    expect(h.buildings.levelOf(city, BuildingType.UndergroundBunkers)).toBe(1)
    expect(h.state.provinces.morale[city]!).toBe(f32(0.9170302))
  })
})
