import { describe, expect, it } from 'vitest'
import { BuildingType } from '~/sim/buildings/BuildingType'
import { CityBuildings, ConstructionRejected } from '~/sim/buildings/CityBuildings'
import { readWorld } from '~/sim/data/WorldFile'
import { f32 } from '~/sim/determinism/float32'
import { Resource } from '~/sim/economy/Resource'
import {
  burnsFuel,
  CAP_PERMILLE,
  DAYS_TO_FLOOR,
  readsEmptyStore,
  ShortageSystem,
} from '~/sim/economy/ShortageSystem'
import { Stockpile } from '~/sim/economy/Stockpile'
import { UpkeepSystem } from '~/sim/economy/Upkeep'
import { Army } from '~/sim/military/Army'
import { Mobilisation, unitRecipeFor } from '~/sim/military/Mobilisation'
import { DESTROYER, MAIN_BATTLE_TANK, MOTORIZED_INFANTRY } from '~/sim/military/UnitCatalogue'
import type { UnitClass } from '~/sim/military/UnitClass'
import { ResearchQueue } from '~/sim/research/ResearchQueue'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/*
 * Diport dari NationRise.Core.Tests/Economy/ShortageTests.cs.
 *
 * Upkeep mencatat kekurangan jauh sebelum ada yang membacanya, sehingga sebuah
 * negara bisa gagal memberi makan pasukannya setiap hari selama sebulan tanpa
 * menderita apa pun. Uji inilah yang menahan celah itu supaya tidak terbuka
 * lagi.
 */
interface Harness {
  state: WorldState
  stock: Stockpile
  buildings: CityBuildings
  upkeep: UpkeepSystem
  shortage: ShortageSystem
  armies: Map<number, Army>
  nation: number
}

function setup(money = 100_000_000): Harness {
  const state = readWorld(worldBinary()).toWorldState(1)
  const stock = new Stockpile(state.nations.count)
  const buildings = new CityBuildings(state, stock)
  const shortage = new ShortageSystem(state.nations.count)
  const upkeep = new UpkeepSystem(state, stock, buildings)
  upkeep.shortage = shortage

  const nation = state.nations.indexOf('IDN')
  stock.add(nation, Resource.Money, money)

  return { state, stock, buildings, upkeep, shortage, armies: new Map(), nation }
}

function days(h: Harness, count: number): void {
  for (let day = 0; day < count; day++) h.upkeep.runDay(h.armies)
}

function firstCityOf(state: WorldState, nation: number): number {
  for (let i = 0; i < state.provinces.count; i++) {
    if (state.provinces.owner[i] === nation && state.provinces.isCity[i] !== 0) return i
  }

  throw new Error('No city.')
}

function garrison(h: Harness, province: number, ...units: UnitClass[]): void {
  const army = new Army(h.armies.size, h.nation, province)
  for (const unit of units) army.add(unit)
  h.armies.set(army.id, army)
}

describe('ShortageSystem', () => {
  /* Angka yang disepakati riset sumber daya: lima persen pada hari pertama,
     tiga persen lagi setiap hari sesudahnya, berhenti di lima puluh. */
  it.each([
    [1, 50],
    [2, 80],
    [5, 170],
    [10, 320],
    [16, 500],
    [40, 500],
  ])('tanjakannya mengikuti bentuk yang diriset: %i hari', (day, expectedPermille) => {
    const h = setup()
    garrison(h, firstCityOf(h.state, h.nation), MOTORIZED_INFANTRY)

    days(h, day)

    expect(h.shortage.rampPermilleOf(h.nation, Resource.Food)).toBe(expectedPermille)
  })

  it('negara yang mulai membayar lagi menuruni tanjakan yang sama', () => {
    const h = setup()
    garrison(h, firstCityOf(h.state, h.nation), MOTORIZED_INFANTRY)

    days(h, 10)
    const worst = h.shortage.rampPermilleOf(h.nation, Resource.Food)

    h.stock.add(h.nation, Resource.Food, 1_000_000)
    days(h, 3)
    const recovering = h.shortage.rampPermilleOf(h.nation, Resource.Food)

    days(h, 20)

    expect(worst).toBe(320)
    expect(recovering).toBeLessThan(worst)
    expect(h.shortage.rampPermilleOf(h.nation, Resource.Food)).toBe(0)
  })

  /* Aturan yang menjaga hukumannya jujur: kelangkaan adalah tagihan yang tidak
     terbayar, bukan simpanan yang kebetulan bernilai nol. Negara tanpa tank
     tidak berutang bahan bakar dan tidak boleh dihukum karena tidak punya. */
  it('negara yang tidak berutang apa pun tidak pernah kekurangan', () => {
    const h = setup()

    days(h, 30)

    expect(h.stock.get(h.nation, Resource.Fuel)).toBe(0)
    expect(h.shortage.isShort(h.nation, Resource.Fuel)).toBe(false)
    expect(h.shortage.isShort(h.nation, Resource.Food)).toBe(false)
    expect(h.shortage.moralePenaltyOf(h.nation)).toBe(0)
  })

  /* Setiap provinsi membayar uang setiap hari, jadi kas yang bernilai nol
     berarti negara menghabiskan segalanya. Yang satu itu krisis apa pun yang
     ditagihkan pasukan pagi ini. */
  it('kas kosong sudah merupakan kelangkaan tersendiri', () => {
    const h = setup(0)

    days(h, 4)

    expect(h.shortage.isShort(h.nation, Resource.Money)).toBe(true)
    expect(h.shortage.rampPermilleOf(h.nation, Resource.Money)).toBe(140)
  })

  it('hukuman morale dibatasi di lantai alih-alih dijumlahkan', () => {
    const h = setup(0)
    garrison(h, firstCityOf(h.state, h.nation), MOTORIZED_INFANTRY)

    days(h, 60)

    expect(h.shortage.isShort(h.nation, Resource.Food)).toBe(true)
    expect(h.shortage.isShort(h.nation, Resource.Money)).toBe(true)
    expect(h.shortage.moralePenaltyOf(h.nation)).toBe(CAP_PERMILLE / 1000)
  })

  it('tanpa kelangkaan tidak ada hukuman di mana pun', () => {
    const h = setup()
    h.stock.add(h.nation, Resource.Food, 1_000_000)
    h.stock.add(h.nation, Resource.Fuel, 1_000_000)
    h.stock.add(h.nation, Resource.Materials, 1_000_000)
    garrison(h, firstCityOf(h.state, h.nation), MAIN_BATTLE_TANK)

    days(h, 30)

    expect(h.shortage.moralePenaltyOf(h.nation)).toBe(0)
    expect(h.shortage.isProductionHalted(h.nation)).toBe(false)
  })

  /* Materials dan Technology menghentikan pekerjaan baru alih-alih melemahkan
     pasukan, dan risetnya tegas soal itu: tidak ada hukuman tempur sama sekali. */
  it('kelangkaan materials menghentikan pembangunan', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)
    garrison(h, city, MAIN_BATTLE_TANK)

    h.buildings.shortage = h.shortage
    days(h, 3)

    expect(h.shortage.isProductionHalted(h.nation)).toBe(true)
    expect(() => h.buildings.begin(city, BuildingType.ArmyBase)).toThrow(ConstructionRejected)
    expect(() => h.buildings.begin(city, BuildingType.ArmyBase)).toThrow(/Materials/)
  })

  it('kelangkaan materials menghentikan mobilisasi', () => {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)
    garrison(h, city, MAIN_BATTLE_TANK)

    const research = new ResearchQueue(h.state, h.stock, h.buildings)
    const mobilisation = new Mobilisation(h.state, h.stock, h.buildings, research)
    mobilisation.shortage = h.shortage

    days(h, 3)

    const check = mobilisation.canMobilise(city, unitRecipeFor('motorized_infantry'))

    expect(check.ok).toBe(false)
    expect(check.reason).toContain('Materials')
  })

  /* Kelangkaan yang belum pernah terjadi harus membiarkan setiap gerbang
     terbuka, atau seluruh ekonominya macet pada hari pertama. */
  it('sistem kelangkaan yang baru tidak menghalangi apa pun', () => {
    const shortage = new ShortageSystem(4)

    for (let nation = 0; nation < 4; nation++) {
      expect(shortage.isProductionHalted(nation)).toBe(false)
      expect(shortage.moralePenaltyOf(nation)).toBe(0)
    }
  })
})

describe('garis bahan bakar', () => {
  it('hanya yang bermesin yang membakar bahan bakar per tangki', () => {
    expect(burnsFuel(MOTORIZED_INFANTRY)).toBe(false)
    expect(burnsFuel(MAIN_BATTLE_TANK)).toBe(true)
    expect(burnsFuel(DESTROYER)).toBe(true)
  })

  it('hanya kas yang dihitung kurang saat simpanannya kosong', () => {
    expect(readsEmptyStore(Resource.Money)).toBe(true)
    expect(readsEmptyStore(Resource.Food)).toBe(false)
    expect(readsEmptyStore(Resource.Fuel)).toBe(false)
  })

  it('lantainya enam belas hari dari pembayaran pertama yang terlewat', () => {
    expect(DAYS_TO_FLOOR).toBe(16)
  })
})

/*
 * Tidak ada uji C# yang menyentuh dua pengali ini, jadi nilai harapannya
 * diambil dengan menjalankan ShortageSystem rujukan pada susunan yang sama,
 * bukan dihitung ulang di sini.
 *
 * Tabel ini memaku aritmetika float 32-bitnya: 0,9499999 dan 0,89000005 adalah
 * hasil sungguhan dari 1,2f dikalikan sisa tanjakan lalu dibagi 1,2f lagi.
 * Menghitungnya dalam double memberi 0,95 dan 0,89 bulat, dan port itu akan
 * menyimpang dari implementasi rujukan.
 */
describe('pengali kelangkaan bahan bakar', () => {
  function afterDays(count: number): { h: Harness; city: number } {
    const h = setup()
    const city = firstCityOf(h.state, h.nation)
    garrison(h, city, MOTORIZED_INFANTRY, MAIN_BATTLE_TANK)
    days(h, count)
    return { h, city }
  }

  it.each([
    [1, 50, 0.9625, 1, 0.95, 0.9499999],
    [2, 80, 0.94, 1, 0.92, 0.92],
    [3, 110, 0.9175, 1, 0.89, 0.89000005],
    [6, 200, 0.85, 1, 0.8, 0.8],
  ])(
    'setelah %i hari kering pengalinya cocok dengan implementasi rujukan',
    (day, permille, mixedAttack, mixedSpeed, armourAttack, armourSpeed) => {
      const { h, city } = afterDays(day)
      const mixed = h.armies.get(0)!

      const armour = new Army(9, h.nation, city)
      armour.add(MAIN_BATTLE_TANK)

      expect(h.shortage.rampPermilleOf(h.nation, Resource.Fuel)).toBe(permille)
      expect(h.shortage.attackMultiplierFor(mixed)).toBe(f32(mixedAttack))
      expect(h.shortage.speedMultiplierFor(mixed)).toBe(f32(mixedSpeed))
      expect(h.shortage.attackMultiplierFor(armour)).toBe(f32(armourAttack))
      expect(h.shortage.speedMultiplierFor(armour)).toBe(f32(armourSpeed))
    },
  )

  /* Batalion senapan yang menempel pada divisi lapis baja tidak boleh
     tiba-tiba bertempur dengan setengah kekuatan. */
  it('pasukan berjalan kaki tidak tersentuh kelangkaan bahan bakar', () => {
    const { h, city } = afterDays(6)

    const foot = new Army(9, h.nation, city)
    foot.add(MOTORIZED_INFANTRY)

    expect(h.shortage.attackMultiplierFor(foot)).toBe(1)
    expect(h.shortage.speedMultiplierFor(foot)).toBe(1)
  })

  it('tumpukan kosong dan negara yang tidak kering tidak dikurangi', () => {
    const { h, city } = afterDays(6)

    expect(h.shortage.attackMultiplierFor(new Army(9, h.nation, city))).toBe(1)
    expect(h.shortage.speedMultiplierFor(new Army(9, h.nation, city))).toBe(1)

    const dry = setup()
    const stack = new Army(0, dry.nation, 0)
    stack.add(MAIN_BATTLE_TANK)

    expect(dry.shortage.attackMultiplierFor(stack)).toBe(1)
    expect(dry.shortage.speedMultiplierFor(stack)).toBe(1)
  })
})
