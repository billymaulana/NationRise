import { addF32, f32, mulF32, subF32 } from '~/sim/determinism/float32'
import { BuildingType } from '~/sim/buildings/BuildingType'
import type { CityBuildings } from '~/sim/buildings/CityBuildings'
import type { Stockpile } from '~/sim/economy/Stockpile'
import type { Relations } from '~/sim/diplomacy/Relation'
import { NO_OWNER } from '~/sim/world/ProvinceStore'
import type { WorldState } from '~/sim/world/WorldState'

/*
 * Morale bergerak menuju sebuah target alih-alih diset langsung, sehingga
 * setiap perubahan punya jeda yang bisa dirasakan pemain. Tanah rebutan pulih
 * pelan-pelan, dan itulah yang membuat serbuan cepat menghasilkan wilayah yang
 * tidak menghasilkan apa-apa.
 */

/* Nilai float32 dari literal `f`-suffix di implementasi rujukan. Dibulatkan di
   sini sekali supaya setiap operasi sesudahnya bekerja pada bit yang sama. */
const BUNKER_TARGET_PER_LEVEL = f32(0.02)
const TARGET_FLOOR = f32(0.05)
const TARGET_CEILING = f32(1.05)

/*
 * Sisi kelangkaan yang dilihat morale. Dipisahkan jadi antarmuka mengikuti
 * seam yang sama seperti upkeep dan pembangunan: morale tidak perlu menarik
 * seluruh rantai kelangkaan hanya untuk membaca satu angka tekanan.
 */
export interface ShortagePressure {
  moralePenaltyOf(nation: number): number
}

export class MoraleSystem {
  static readonly HOMELAND_TARGET = f32(0.9)
  static readonly ANNEXED_TARGET = f32(0.75)
  static readonly OCCUPIED_TARGET = f32(0.6)
  static readonly PLAIN_PROVINCE_TARGET = 1

  /* Seperdelapan jarak per hari: sekitar sepekan untuk terasa tenang, sebulan
     untuk tuntas. Cukup cepat untuk membayar upaya menahan wilayah, cukup
     lambat supaya penaklukan tidak langsung menguntungkan. */
  static readonly APPROACH_RATE = 0.125

  static readonly WAR_PENALTY_PER_ENEMY = f32(0.02)
  static readonly MAX_WAR_PENALTY = 0.25

  /*
   * Tanjakan kelangkaan bersama. Attached, morale, tempur, gerak dan produksi
   * membaca angka hari-kekurangan yang sama, sehingga pemain yang ditunjukkan
   * satu angka tidak dibantah oleh angka berikutnya. Dibiarkan kosong tidak ada
   * hukuman kelangkaan sama sekali, sebagaimana sistem perbekalan yang tidak
   * tersambung meninggalkan tempur tanpa pengubah perbekalan.
   */
  shortage: ShortagePressure | null = null

  constructor(
    private readonly world: WorldState,
    private readonly relations: Relations,
    private readonly buildings: CityBuildings,
  ) {}

  /* Cadangan tidak dibaca di sini, tapi tetap diminta: pemanggil yang
     menjalankan hari harus sudah memegangnya, dan menghapusnya dari tanda
     tangan akan menyembunyikan bahwa morale adalah bagian dari giliran ekonomi
     harian, bukan sistem yang berdiri sendiri. */
  runDay(_stockpile: Stockpile): void {
    const nationCount = this.world.nations.count
    const warPenalty = new Float32Array(nationCount)
    const shortagePenalty = new Float32Array(nationCount)

    for (let nation = 0; nation < nationCount; nation++) {
      const enemies = this.relations.enemiesOf(nation).length
      warPenalty[nation] = Math.min(
        mulF32(enemies, MoraleSystem.WAR_PENALTY_PER_ENEMY),
        MoraleSystem.MAX_WAR_PENALTY,
      )

      /* Kehabisan pangan atau uang memukul morale di mana-mana sekaligus, dan
         itulah yang mengubah kegagalan perbekalan jadi masalah politik alih-alih
         galat pembulatan. Ia datang lewat tanjakan supaya masalahnya terlihat
         berhari-hari sebelum menentukan. */
      shortagePenalty[nation] = this.shortage?.moralePenaltyOf(nation) ?? 0
    }

    const provinces = this.world.provinces

    for (let province = 0; province < provinces.count; province++) {
      const nation = provinces.controller[province]!
      if (nation === NO_OWNER || nation >= nationCount) continue

      let target = this.targetFor(province, nation)
      target = subF32(target, warPenalty[nation]!)

      target = subF32(target, shortagePenalty[nation]!)

      target = addF32(
        target,
        mulF32(
          this.buildings.levelOf(province, BuildingType.UndergroundBunkers),
          BUNKER_TARGET_PER_LEVEL,
        ),
      )
      target = Math.min(Math.max(target, TARGET_FLOOR), TARGET_CEILING)

      const current = provinces.morale[province]!
      provinces.morale[province] = addF32(
        current,
        mulF32(subF32(target, current), MoraleSystem.APPROACH_RATE),
      )
    }
  }

  targetFor(province: number, nation: number): number {
    if (this.world.provinces.isCity[province] === 0) {
      return MoraleSystem.PLAIN_PROVINCE_TARGET
    }

    if (this.world.provinces.owner[province] === nation) {
      return MoraleSystem.HOMELAND_TARGET
    }

    return MoraleSystem.OCCUPIED_TARGET
  }
}
