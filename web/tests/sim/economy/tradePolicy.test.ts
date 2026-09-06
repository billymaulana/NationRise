import { describe, expect, it } from 'vitest'
import { CityBuildings } from '~/sim/buildings/CityBuildings'
import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { Resource, RESOURCE_COUNT } from '~/sim/economy/Resource'
import { Stockpile } from '~/sim/economy/Stockpile'
import { TradePolicy } from '~/sim/economy/TradePolicy'
import { UpkeepSystem } from '~/sim/economy/Upkeep'
import { WorldMarket } from '~/sim/economy/WorldMarket'
import { Army } from '~/sim/military/Army'
import type { UnitClass } from '~/sim/military/UnitClass'
import { MAIN_BATTLE_TANK, MOTORIZED_INFANTRY } from '~/sim/military/UnitCatalogue'
import { GameClock } from '~/sim/time/GameClock'
import { NationStore } from '~/sim/world/NationStore'
import { ProvinceStore } from '~/sim/world/ProvinceStore'
import { WorldState } from '~/sim/world/WorldState'

/*
 * Tidak ada padanan di NationRise.Core.Tests: TradePolicy tidak punya uji di
 * jalur C#. Setiap nilai harapan di berkas ini diambil dengan menjalankan
 * implementasi C# atas skenario yang sama persis, bukan dihitung ulang di sini.
 */

interface ProvinceSpec {
  readonly controller: number
  readonly city: boolean
}

interface Rig {
  readonly world: WorldState
  readonly stock: Stockpile
  readonly buildings: CityBuildings
  readonly upkeep: UpkeepSystem
  readonly market: WorldMarket
  readonly policy: TradePolicy
}

function make(nations: number, provinces: readonly ProvinceSpec[]): Rig {
  const count = provinces.length
  const offsets = new Int32Array(count + 1)
  const claims = new Uint16Array(count)

  for (let i = 0; i < count; i++) {
    offsets[i] = i
    claims[i] = provinces[i]!.controller
  }
  offsets[count] = count

  const store = new ProvinceStore(count, offsets, claims)
  for (let i = 0; i < count; i++) {
    store.owner[i] = provinces[i]!.controller
    store.controller[i] = provinces[i]!.controller
    store.isCity[i] = provinces[i]!.city ? 1 : 0
  }

  const world = new WorldState(
    store,
    new NationStore(nations),
    new GameClock(),
    new DeterministicRandom(1),
  )
  const stock = new Stockpile(nations)
  const buildings = new CityBuildings(world, stock)
  const upkeep = new UpkeepSystem(world, stock, buildings)
  const market = new WorldMarket(stock)

  return { world, stock, buildings, upkeep, market, policy: new TradePolicy(world, stock, market, upkeep) }
}

function stack(id: number, nation: number, province: number, unit: UnitClass, howMany: number): Army {
  const army = new Army(id, nation, province)
  for (let i = 0; i < howMany; i++) army.add(unit)
  return army
}

function land(controller: number): ProvinceSpec {
  return { controller, city: false }
}

function city(controller: number): ProvinceSpec {
  return { controller, city: true }
}

/* Dua motorized infantry dan satu main battle tank, cukup untuk menagih pangan,
   bahan bakar dan material sekaligus. */
function garrison(): Map<number, Army> {
  const army = stack(1, 0, 0, MOTORIZED_INFANTRY, 2)
  army.add(MAIN_BATTLE_TANK)
  return new Map([[1, army]])
}

function noProduction(nations: number): Float64Array {
  return new Float64Array(nations * RESOURCE_COUNT)
}

describe('berapa yang ingin dijual atau dibeli', () => {
  it('cadangan sasarannya tujuh hari konsumsi atau keluaran, mana yang lebih besar', () => {
    const rig = make(3, [city(0), city(0), land(0), city(1)])
    rig.upkeep.runDay(garrison())

    expect(rig.upkeep.billOf(0, Resource.Food)).toBe(188)

    /* (3500 - 10000) / 7 memotong ke arah nol, bukan ke bawah: membulatkan ke
       bawah menghasilkan 1241 dan seluruh hari perdagangan bergeser satu unit. */
    rig.stock.add(0, Resource.Food, 10_000)
    expect(rig.policy.desiredNetOf(0, Resource.Food, 500)).toBe(1240)
  })

  it('negara yang sekadar menipis membeli sedikit tiap hari, bukan nol lalu panik', () => {
    const rig = make(3, [city(0), city(0), land(0), city(1)])
    rig.upkeep.runDay(garrison())

    expect(rig.policy.desiredNetOf(0, Resource.Food, 0)).toBe(-376)

    rig.stock.add(0, Resource.Food, 350)
    expect(rig.policy.desiredNetOf(0, Resource.Food, 0)).toBe(-326)
  })

  it('lantai ibu kota membuat negara tanpa tambang tetap menawar', () => {
    const rig = make(3, [city(0), city(0), land(0), city(1)])
    rig.upkeep.runDay(garrison())

    expect(rig.policy.desiredNetOf(0, Resource.Materials, 0)).toBe(-284)
    expect(rig.policy.desiredNetOf(0, Resource.Technology, 0)).toBe(-257)
    expect(rig.policy.desiredNetOf(0, Resource.RareResources, 0)).toBe(-257)

    /* Pangan dan bahan bakar tidak punya lantai: keduanya sudah dijaga oleh
       upkeep harian yang nyata. */
    expect(rig.policy.desiredNetOf(0, Resource.Fuel, 0)).toBe(-376)

    /* Lantainya per kota yang benar-benar dikuasai negara itu. */
    expect(rig.policy.desiredNetOf(1, Resource.Materials, 0)).toBe(-128)
    expect(rig.policy.desiredNetOf(2, Resource.Materials, 0)).toBe(0)
  })

  it('menahan tetapan cadangan dan daftar barangnya', () => {
    expect(TradePolicy.BUFFER_DAYS).toBe(7)
    expect(TradePolicy.CAPITAL_PER_CITY).toBe(900)
    expect(TradePolicy.GOODS).toEqual([
      Resource.Food,
      Resource.Fuel,
      Resource.Materials,
      Resource.Technology,
      Resource.RareResources,
    ])
  })
})

describe('hari perdagangan', () => {
  function rotationRig(): Rig {
    const rig = make(3, [land(0), land(1), land(2)])
    const stacks = new Map<number, Army>()
    for (let n = 0; n < 3; n++) stacks.set(n, stack(n, n, n, MOTORIZED_INFANTRY, 50))
    rig.upkeep.runDay(stacks)
    for (let n = 0; n < 3; n++) rig.stock.add(n, Resource.Money, 1_000_000)
    return rig
  }

  function moneyAfter(day: number): number[] {
    const rig = rotationRig()
    rig.policy.runDay(day, noProduction(3))
    return [0, 1, 2].map((n) => rig.stock.get(n, Resource.Money))
  }

  /* Yang dilayani lebih dulu membayar lebih murah, karena ordernya sendiri yang
     mendorong harga. Itulah yang membuat urutan giliran terlihat sama sekali. */
  it('negara dilayani mulai dari indeks yang bergeser tiap hari', () => {
    const rig = rotationRig()
    expect(rig.upkeep.billOf(0, Resource.Food)).toBe(1_900)
    expect(rig.policy.desiredNetOf(0, Resource.Food, 0)).toBe(-3_800)

    expect(moneyAfter(0)).toEqual([953_729, 951_348, 950_483])
    expect(moneyAfter(1)).toEqual([950_483, 953_729, 951_348])
    expect(moneyAfter(2)).toEqual([951_348, 950_483, 953_729])

    /* Hari negatif tetap mendarat di dalam rentang: sisa C# bisa negatif. */
    expect(moneyAfter(-1)).toEqual([951_348, 950_483, 953_729])
  })

  it('semua negara tetap dilayani, hanya urutannya yang berputar', () => {
    const rig = rotationRig()
    rig.policy.runDay(0, noProduction(3))

    for (let n = 0; n < 3; n++) expect(rig.stock.get(n, Resource.Food)).toBe(3_800)
  })

  it('order yang tidak muat dipangkas, bukan dibuang', () => {
    const rig = make(1, [land(0)])
    rig.stock.add(0, Resource.Food, 200_000)

    const production = noProduction(1)
    production[Resource.Food] = 30_000

    expect(rig.policy.desiredNetOf(0, Resource.Food, 30_000)).toBe(28_572)
    expect(rig.market.absorbableOf(Resource.Food)).toBe(20_000)

    rig.policy.runDay(0, production)

    expect(rig.stock.get(0, Resource.Food)).toBe(180_000)
    expect(rig.stock.get(0, Resource.Money)).toBe(142_880)
  })

  /* Harga eksekusi naik mengikuti besar order, sehingga order terbesar yang
     terjangkau bukan anggaran dibagi harga hari ini. */
  it('pembelian dipangkas sampai batas anggaran, sampai unit terakhir', () => {
    const rig = make(1, [land(0)])
    rig.upkeep.runDay(new Map([[0, stack(0, 0, 0, MOTORIZED_INFANTRY, 50)]]))
    rig.stock.add(0, Resource.Money, 1_000)

    rig.policy.runDay(0, noProduction(1))

    expect(rig.stock.get(0, Resource.Food)).toBe(118)
    expect(rig.stock.get(0, Resource.Money)).toBe(7)

    const fresh = make(1, [land(0)])
    expect(fresh.market.costOf(Resource.Food, 118)).toBe(993)
    expect(fresh.market.costOf(Resource.Food, 119)).toBe(1_001)
  })

  it('lantai ibu kota benar-benar berbelanja, bukan sekadar angka', () => {
    const rig = make(1, [city(0), city(0), land(0)])
    rig.stock.add(0, Resource.Money, 1_000_000)

    rig.policy.runDay(0, noProduction(1))

    expect(rig.stock.get(0, Resource.Materials)).toBe(257)
    expect(rig.stock.get(0, Resource.Technology)).toBe(257)
    expect(rig.stock.get(0, Resource.RareResources)).toBe(257)
    expect(rig.stock.get(0, Resource.Food)).toBe(0)
    expect(rig.stock.get(0, Resource.Money)).toBe(988_089)
  })

  it('dunia tanpa negara tidak melakukan apa pun', () => {
    const rig = make(0, [])

    expect(() => rig.policy.runDay(0, noProduction(0))).not.toThrow()
  })
})
