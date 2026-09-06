import { addF32, f32, mulF32 } from '~/sim/determinism/float32'
import { Resource } from '~/sim/economy/Resource'
import type { Stockpile } from '~/sim/economy/Stockpile'
import type { WorldState } from '~/sim/world/WorldState'

export enum MobilisationLevel {
  Peace = 0,
  Partial = 1,
  Total = 2,
}

/*
 * Manpower ditarik dari populasi, bukan dihasilkan slot sumber daya, dan
 * seberapa keras sebuah negara menariknya adalah pilihan tetap yang berbiaya.
 * Mobilisasi total menerjunkan pasukan yang tidak sanggup dibiayai ekonomi masa
 * damai, dan membayarnya dengan uang serta morale setiap hari ia menyala.
 */

/*
 * Porsi rakyat sebuah negara yang bisa dipersenjatai.
 *
 * Angka ini pernah sepuluh kali terlalu kecil. Satu unit memerlukan 850
 * manpower, dan pada porsi masa damai yang lama batas Indonesia hanya 1.440 —
 * tidak sampai dua formasi, untuk negara berpopulasi sembilan puluh enam. Tidak
 * ada negara di dunia yang bisa memelihara pasukan tetap, dan sepanjang
 * sembilan puluh hari terukur tidak satu unit pun dimobilisasi di mana pun.
 *
 * Conflict of Nations membayar Indonesia sekitar 1.464 manpower per hari pada
 * ukuran yang sama, jadi batas di sekitar angka itu sebenarnya pemasukan satu
 * hari yang disalahartikan sebagai persediaan seumur hidup.
 */
const FRACTIONS: Readonly<Record<MobilisationLevel, number>> = {
  [MobilisationLevel.Peace]: f32(0.15),
  [MobilisationLevel.Partial]: f32(0.25),
  [MobilisationLevel.Total]: f32(0.4),
}

const MONEY_PENALTIES: Readonly<Record<MobilisationLevel, number>> = {
  [MobilisationLevel.Peace]: 0,
  [MobilisationLevel.Partial]: f32(0.05),
  [MobilisationLevel.Total]: f32(0.15),
}

const MORALE_PENALTIES: Readonly<Record<MobilisationLevel, number>> = {
  [MobilisationLevel.Peace]: 0,
  [MobilisationLevel.Partial]: f32(0.05),
  [MobilisationLevel.Total]: f32(0.1),
}

const LABELS: Readonly<Record<MobilisationLevel, string>> = {
  [MobilisationLevel.Peace]: 'Peacetime',
  [MobilisationLevel.Partial]: 'Partial mobilisation',
  [MobilisationLevel.Total]: 'Total mobilisation',
}

export function fractionFor(level: MobilisationLevel): number {
  return FRACTIONS[level]
}

export function moneyPenalty(level: MobilisationLevel): number {
  return MONEY_PENALTIES[level]
}

export function moralePenalty(level: MobilisationLevel): number {
  return MORALE_PENALTIES[level]
}

export function labelOf(level: MobilisationLevel): string {
  return LABELS[level]
}

export const DAILY_REFILL_FRACTION = f32(0.02)

const OCCUPIED_SHARE = f32(0.25)

export class ManpowerPool {
  readonly #level: Uint8Array

  constructor(private readonly world: WorldState) {
    this.#level = new Uint8Array(world.nations.count)
  }

  levelOf(nation: number): MobilisationLevel {
    return this.#level[nation]! as MobilisationLevel
  }

  setLevel(nation: number, level: MobilisationLevel): void {
    this.#level[nation] = level
  }

  /* Batas yang bisa dicapai sebuah negara, bukan yang dipegangnya: kolamnya
     terisi menuju angka ini setiap hari, sehingga kehilangan butuh waktu untuk
     digantikan meski populasinya ada. */
  capacityOf(nation: number): number {
    let population = 0

    for (let i = 0; i < this.world.provinces.count; i++) {
      if (this.world.provinces.controller[i] !== nation) continue

      const share = this.world.provinces.owner[i] === nation ? f32(1) : OCCUPIED_SHARE
      population = addF32(population, mulF32(this.world.provinces.population[i]!, share))
    }

    return mulF32(mulF32(population, f32(1000)), fractionFor(this.levelOf(nation)))
  }

  /* Yang akan ditambahkan runDay, tanpa menambahkannya. Manpower tidak datang
     dari tick ekonomi seperti sumber daya lain, sehingga tampilan yang
     menanyakannya ke ekonomi melaporkan nol datar dan diam-diam memberi tahu
     pemain bahwa cadangannya tidak bergerak. */
  dailyRegenOf(nation: number, stockpile: Stockpile): number {
    const missing = Math.trunc(this.capacityOf(nation)) - stockpile.get(nation, Resource.Manpower)

    /* `long * float` di C# dihitung sebagai float 32-bit, lalu cast ke long
       memotongnya ke arah nol. */
    return missing > 0 ? Math.trunc(mulF32(f32(missing), DAILY_REFILL_FRACTION)) + 1 : 0
  }

  runDay(stockpile: Stockpile): void {
    for (let nation = 0; nation < this.world.nations.count; nation++) {
      const gain = this.dailyRegenOf(nation, stockpile)
      if (gain > 0) stockpile.add(nation, Resource.Manpower, gain)
    }
  }
}
