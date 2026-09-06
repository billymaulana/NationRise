import { mulF32 } from '~/sim/determinism/float32'
import { intDiv } from '~/sim/determinism/rounding'
import type { Relations } from '~/sim/diplomacy/Relation'
import type { WorldState } from '~/sim/world/WorldState'

/*
 * Seberapa besar pasukan tetap yang ingin dipelihara sebuah negara.
 *
 * Aturan yang digantikannya hanya mengangkat tentara untuk negara yang sudah
 * punya musuh, sehingga sebagian besar dunia tidak menurunkan apa pun: 247
 * negara bersama-sama memegang 400 tumpukan, dan upkeep harian yang ditanggung
 * pasukan itu hanyalah seperdelapan dari yang dihasilkan negara yang sama.
 * Ekonomi tanpa pasukan untuk dibayar tidak punya kelangkaan di dalamnya, dan
 * tanpa kelangkaan pasar, tanjakan kekurangan, dan blokade semuanya menjadi
 * mesin yang tidak punya apa pun untuk digerakkan.
 *
 * Pasukan masa damai karena itu menjadi bawaan alih-alih pengecualian,
 * diukur dari tanah yang dipegang sebuah negara, dan perang menaikkan niatnya
 * alih-alih menciptakannya.
 */

/* Bahkan negara satu kota tetap memelihara sesuatu. */
export const STANDING = 2

/* Conflict of Nations memberi negara menengah sekitar dua lusin unit di tujuh
   atau delapan kota di awal kampanye, dan dari sanalah angka ini datang, bukan
   dari selera. */
export const PER_CITY = 3
export const PER_TEN_PROVINCES = 2

export const WAR_APPETITE = Math.fround(1.7)
export const CEILING = 60

export class ArmyPolicy {
  constructor(
    private readonly world: WorldState,
    private readonly relations: Relations,
  ) {}

  targetFor(nation: number): number {
    if (nation < 0) throw new RangeError(`negara tidak boleh negatif: ${nation}`)

    let cities = 0
    let provinces = 0

    const store = this.world.provinces
    for (let i = 0; i < store.count; i++) {
      if (store.controller[i] !== nation) continue

      provinces++
      if (store.isCity[i] !== 0) cities++
    }

    if (provinces === 0) return 0

    let target = STANDING + cities * PER_CITY + intDiv(provinces * PER_TEN_PROVINCES, 10)

    if (this.relations.enemiesOf(nation).length > 0) {
      target = Math.trunc(mulF32(target, WAR_APPETITE))
    }

    return Math.min(target, CEILING)
  }

  /* Dihitung dalam unit, bukan tumpukan: tumpukan adalah pengelompokan yang
     dipilih pemain, dan menagih upkeep per tumpukan akan menghadiahi
     pemecahan. */
  wantsMore(nation: number, unitsHeld: number): boolean {
    return unitsHeld < this.targetFor(nation)
  }
}
