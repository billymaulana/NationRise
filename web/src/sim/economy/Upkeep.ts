import { divF32, f32, mulF32 } from '~/sim/determinism/float32'
import { roundHalfToEven } from '~/sim/determinism/rounding'
import { ALL_BUILDING_TYPES, type BuildingType } from '~/sim/buildings/BuildingType'
import type { CityBuildings } from '~/sim/buildings/CityBuildings'
import { ALL_RESOURCES, Resource, RESOURCE_COUNT } from '~/sim/economy/Resource'
import type { Stockpile } from '~/sim/economy/Stockpile'
import { ArmourClass } from '~/sim/military/ArmourClass'
import type { Army } from '~/sim/military/Army'
import { Domain, type UnitClass } from '~/sim/military/UnitClass'
import type { WorldState } from '~/sim/world/WorldState'

/*
 * Berapa biaya sebuah pasukan tetap dan negara yang terbangun setiap hari,
 * hanya untuk ada.
 *
 * Tanpa ini ekonominya tidak punya saluran keluar sama sekali: produksi jadi
 * satu-satunya suku, cadangan naik tanpa batas, pasar tidak punya apa pun untuk
 * diarbitrase, aturan kelangkaan tidak pernah bisa menyala, dan laju yang
 * ditampilkan ke pemain tidak pernah bisa selain positif.
 */

/* Diturunkan dari unitnya, bukan ditabelkan per unit. Tabel per unit adalah
   tempat kedua untuk melupakan sebuah angka saat unit baru ditambahkan;
   aturan yang membaca Domain dan armour tidak bisa diam-diam mengembalikan nol
   untuk unit baru. */
export function dailyUnitCost(unit: UnitClass, resource: Resource): number {
  /* Mesin yang lebih besar lebih mahal dijalankan, diskalakan dari hit point
     karena itulah satu-satunya angka yang sudah dinyatakan jujur oleh setiap
     kelas. */
  const bulk = divF32(unit.maxHitPoints, f32(20))

  switch (resource) {
    case Resource.Money:
      switch (unit.domain) {
        case Domain.Land:
          return round(mulF32(f32(70), bulk))
        case Domain.Sea:
          return round(mulF32(f32(140), bulk))
        case Domain.Air:
          return round(mulF32(f32(180), bulk))
        default:
          return 0
      }
    case Resource.Food:
      return unit.domain === Domain.Land
        ? round(mulF32(f32(50), bulk))
        : round(mulF32(f32(25), bulk))
    case Resource.Fuel:
      return unit.armour === ArmourClass.Infantry && unit.domain === Domain.Land
        ? round(mulF32(f32(20), bulk))
        : round(mulF32(f32(70), bulk))
    case Resource.Materials:
      return unit.domain === Domain.Land && unit.armour === ArmourClass.Infantry
        ? 0
        : round(mulF32(f32(12), bulk))
    default:
      return 0
  }
}

/* Kru bangunan dibayar apa pun bangunannya, dan tagihannya naik mengikuti
   tingkat alih-alih mengikuti apa yang dibuka tingkat itu. */
export function dailyBuildingCost(
  _type: BuildingType,
  level: number,
  resource: Resource,
): number {
  return resource === Resource.Money ? 100 * level : 0
}

function round(amount: number): number {
  return roundHalfToEven(amount)
}

/*
 * Yang dibutuhkan sistem kelangkaan dari upkeep, dinyatakan sesempit ini supaya
 * upkeep tidak menarik seluruh rantai kelangkaan hanya untuk memajukan tanjakan
 * tekanannya.
 */
export interface ShortageRamp {
  runDay(stockpile: Stockpile, upkeep: UpkeepSystem): void
}

/*
 * Menagih tagihan harian dan melaporkan apa yang tidak terbayar. Kekurangan
 * dimunculkan, bukan diserap: negara yang tidak sanggup memberi makan
 * pasukannya harus merasakannya, dan pemanggil adalah tempat yang tepat untuk
 * memutuskan bagaimana.
 */
export class UpkeepSystem {
  readonly #shortfall: Float64Array
  readonly #bill: Float64Array

  /* Tanjakan yang mengubah tagihan tak terbayar menjadi tekanan, dimajukan dari
     sini karena hanya di sinilah diketahui apa yang tidak terbayar, dan ia
     berjalan tepat sekali sehari. Memajukannya dari dua pemanggil akan
     melipatgandakan setiap kelangkaan. */
  shortage: ShortageRamp | null = null

  constructor(
    private readonly world: WorldState,
    private readonly stockpile: Stockpile,
    private readonly buildings: CityBuildings,
  ) {
    this.#shortfall = new Float64Array(world.nations.count * RESOURCE_COUNT)
    this.#bill = new Float64Array(world.nations.count * RESOURCE_COUNT)
  }

  shortfallOf(nation: number, resource: Resource): number {
    return this.#shortfall[nation * RESOURCE_COUNT + resource]!
  }

  /* Berapa yang sebenarnya dihabiskan hari terakhir yang ditagih. Menghitungnya
     ulang berarti menyusuri setiap pasukan dan setiap kota lagi, sementara
     pasar membutuhkannya sekali per negara per barang untuk mengukur kuota beli
     terhadap penggunaan nyata alih-alih terhadap berapa banyak uang yang
     kebetulan tergeletak. */
  billOf(nation: number, resource: Resource): number {
    return this.#bill[nation * RESOURCE_COUNT + resource]!
  }

  isStarved(nation: number): boolean {
    return (
      this.shortfallOf(nation, Resource.Food) > 0 || this.shortfallOf(nation, Resource.Money) > 0
    )
  }

  dailyCostOf(nation: number, resource: Resource, armies: ReadonlyMap<number, Army>): number {
    let total = 0

    for (const army of armies.values()) {
      if (army.nation !== nation || army.isDestroyed) continue

      for (const unit of army.units) {
        total += dailyUnitCost(unit.unitClass, resource)
      }
    }

    const provinces = this.world.provinces
    for (let province = 0; province < provinces.count; province++) {
      if (provinces.controller[province] !== nation || provinces.isCity[province] === 0) continue

      for (const type of ALL_BUILDING_TYPES) {
        const level = this.buildings.levelOf(province, type)
        if (level > 0) total += dailyBuildingCost(type, level, resource)
      }
    }

    return total
  }

  runDay(armies: ReadonlyMap<number, Army>): void {
    this.#shortfall.fill(0)
    this.#bill.fill(0)

    for (let nation = 0; nation < this.world.nations.count; nation++) {
      for (const resource of ALL_RESOURCES) {
        const bill = this.dailyCostOf(nation, resource, armies)
        this.#bill[nation * RESOURCE_COUNT + resource] = bill

        if (bill <= 0) continue
        if (this.stockpile.trySpend(nation, resource, bill)) continue

        /* Apa pun yang ada diambil; sisanya dicatat sebagai utang hari itu
           alih-alih mendorong cadangan menjadi negatif, yang akan membuat
           setiap pembacaan sesudahnya kehilangan makna. */
        const held = this.stockpile.get(nation, resource)
        if (held > 0) this.stockpile.trySpend(nation, resource, held)

        this.#shortfall[nation * RESOURCE_COUNT + resource] = bill - held
      }
    }

    this.shortage?.runDay(this.stockpile, this)
  }
}
