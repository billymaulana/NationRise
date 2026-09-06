import { addF32, divF32, mulF32, subF32 } from '~/sim/determinism/float32'
import { intDiv } from '~/sim/determinism/rounding'
import { ALL_RESOURCES, Resource, RESOURCE_COUNT } from '~/sim/economy/Resource'
import type { Stockpile } from '~/sim/economy/Stockpile'
import type { UpkeepSystem } from '~/sim/economy/Upkeep'
import { ArmourClass } from '~/sim/military/ArmourClass'
import type { Army } from '~/sim/military/Army'
import { Domain, type UnitClass } from '~/sim/military/UnitClass'

/*
 * Yang terjadi begitu sebuah tagihan tidak terbayar.
 *
 * Upkeep mencatat kekurangan; sebelum ini ada tidak ada yang membacanya,
 * sehingga sebuah negara bisa gagal memberi makan pasukannya setiap hari selama
 * sebulan tanpa menderita apa pun. Tekanannya berupa tanjakan, bukan jurang:
 * hari pertama yang terlewat berbiaya sedikit lalu biayanya menumpuk, yang
 * memberi pemain beberapa hari untuk melihatnya datang dan berdagang keluar
 * darinya. Jurang membuat kegagalan yang sama entah tak terlihat atau langsung
 * fatal, dan keduanya bukan keputusan.
 */

/* Bentuk yang disepakati riset sumber daya: lima persen pada hari pertama
   kekurangan, tiga persen lagi setiap hari sesudahnya, berhenti di lima puluh.
   Enam belas hari dari pembayaran pertama yang terlewat sampai ke lantai
   itulah yang menyisakan lima sampai sepuluh hari peringatan yang diminta
   rancangannya. */
export const START_PERMILLE = 50
export const STEP_PERMILLE = 30
export const CAP_PERMILLE = 500

export const DAYS_TO_FLOOR = 1 + intDiv(CAP_PERMILLE - START_PERMILLE, STEP_PERMILLE)

/* Padanan float.MaxValue: penanda awal untuk pencarian minimum yang tidak
   pernah bisa dikalahkan oleh kecepatan unit mana pun. */
const FLOAT32_MAX = 3.4028234663852886e38

/*
 * Kelangkaan adalah tagihan yang tidak terbayar, bukan simpanan yang kebetulan
 * bernilai nol. Bedanya penting: negara tanpa pasukan dan tanpa lumbung tidak
 * berutang pangan dan tidak sedang dalam kesulitan, dan aturan lama yang
 * membaca simpanan saja menaruh lima belas negara semacam itu di lantai morale
 * sepanjang permainan karena pangan yang tak satu pun dari mereka butuhkan.
 *
 * Kas adalah satu-satunya perkecualian. Setiap provinsi membayar uang setiap
 * hari, jadi saldo nol berarti negara menghabiskan segala yang dimilikinya, dan
 * itu krisis apa pun yang ditagihkan pasukan pagi ini.
 */
export function readsEmptyStore(resource: Resource): boolean {
  return resource === Resource.Money
}

/* Garis yang sama yang ditarik upkeep saat memutuskan siapa membakar bahan
   bakar per tangki dan siapa per jeriken. Pasukan berjalan kaki aman menurut
   rancangan. */
export function burnsFuel(unit: UnitClass): boolean {
  return unit.domain !== Domain.Land || unit.armour !== ArmourClass.Infantry
}

export class ShortageSystem {
  readonly nationCount: number

  readonly #daysShort: Int32Array

  constructor(nationCount: number) {
    if (nationCount < 0) {
      throw new RangeError(`jumlah negara tidak boleh negatif: ${nationCount}`)
    }

    this.nationCount = nationCount
    this.#daysShort = new Int32Array(nationCount * RESOURCE_COUNT)
  }

  daysShortOf(nation: number, resource: Resource): number {
    return this.#daysShort[this.#index(nation, resource)]!
  }

  rampPermilleOf(nation: number, resource: Resource): number {
    const days = this.#daysShort[this.#index(nation, resource)]!
    return days <= 0 ? 0 : Math.min(START_PERMILLE + STEP_PERMILLE * (days - 1), CAP_PERMILLE)
  }

  rampOf(nation: number, resource: Resource): number {
    return divF32(this.rampPermilleOf(nation, resource), 1000)
  }

  isShort(nation: number, resource: Resource): boolean {
    return this.#daysShort[this.#index(nation, resource)]! > 0
  }

  /* Satu hukuman, bukan dua yang dijumlahkan: batas dalam risetnya adalah lima
     puluh morale karena kekurangan, bukan lima puluh per barang. Negara yang
     sekaligus bangkrut dan kelaparan sudah berada di lantai. */
  moralePenaltyOf(nation: number): number {
    return Math.max(this.rampOf(nation, Resource.Food), this.rampOf(nation, Resource.Money))
  }

  /* Kehabisan barang yang dimakan pabrik menghentikan pekerjaan baru alih-alih
     melemahkan pasukan di lapangan: kelangkaan baja terasa di galangan, bukan
     di garis depan, dan risetnya tegas bahwa yang satu ini sama sekali tidak
     membawa hukuman tempur. */
  isProductionHalted(nation: number): boolean {
    return this.haltingResource(nation) !== null
  }

  haltingResource(nation: number): Resource | null {
    if (this.isShort(nation, Resource.Materials)) return Resource.Materials
    if (this.isShort(nation, Resource.Technology)) return Resource.Technology

    return null
  }

  /*
   * Berapa banyak pukulan sebuah tumpukan yang diambil kelangkaan bahan bakar.
   * Hanya bagian yang berjalan dengan mesin yang dilemahkan, ditimbang menurut
   * bobot karena itulah angka yang sama yang ditagihkan upkeep, sehingga
   * batalion senapan yang menempel pada divisi lapis baja tidak tiba-tiba
   * bertempur dengan setengah kekuatan.
   */
  attackMultiplierFor(army: Army): number {
    const ramp = this.rampOf(army.nation, Resource.Fuel)
    if (ramp <= 0 || army.count === 0) return 1

    let total = 0
    let mechanised = 0

    for (const unit of army.units) {
      const bulk = unit.unitClass.maxHitPoints
      total = addF32(total, bulk)

      if (burnsFuel(unit.unitClass)) mechanised = addF32(mechanised, bulk)
    }

    return total <= 0 ? 1 : subF32(1, divF32(mulF32(ramp, mechanised), total))
  }

  /*
   * Sebuah tumpukan sudah bergerak secepat anggota terlambatnya, sehingga
   * kelangkaan bahan bakar diterapkan pada kecepatan tiap unit sebelum minimum
   * itu diambil. Tank yang kering karena itu menyeret kolom campuran turun
   * alih-alih dirata-ratakan hilang oleh infanteri yang berbaris di sampingnya.
   */
  speedMultiplierFor(army: Army): number {
    const ramp = this.rampOf(army.nation, Resource.Fuel)
    if (ramp <= 0 || army.count === 0) return 1

    let raw = FLOAT32_MAX
    let slowed = FLOAT32_MAX

    for (const unit of army.units) {
      const speed = unit.unitClass.speed
      raw = Math.min(raw, speed)
      slowed = Math.min(slowed, burnsFuel(unit.unitClass) ? mulF32(speed, subF32(1, ramp)) : speed)
    }

    return raw <= 0 ? 1 : divF32(slowed, raw)
  }

  runDay(stockpile: Stockpile, upkeep?: UpkeepSystem | null): void {
    for (let nation = 0; nation < this.nationCount; nation++) {
      for (const resource of ALL_RESOURCES) {
        const isShort =
          (upkeep?.shortfallOf(nation, resource) ?? 0) > 0 ||
          (readsEmptyStore(resource) && stockpile.isShort(nation, resource))

        const index = this.#index(nation, resource)

        /* Pemulihan menuruni tanjakan yang sama yang ia daki: hari sebuah
           negara mulai membayar lagi ia tidak langsung pulih, tapi terlihat
           membaik, dan itulah yang membuat membeli jalan keluar dari kelangkaan
           terasa berhasil. */
        this.#daysShort[index] = isShort
          ? Math.min(this.#daysShort[index]! + 1, DAYS_TO_FLOOR)
          : Math.max(this.#daysShort[index]! - 1, 0)
      }
    }
  }

  #index(nation: number, resource: Resource): number {
    if (nation < 0 || nation >= this.nationCount) {
      throw new RangeError(`negara ${nation} di luar 0..${this.nationCount - 1}`)
    }

    return nation * RESOURCE_COUNT + resource
  }
}
