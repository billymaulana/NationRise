import type { ShortageSystem } from '~/sim/economy/ShortageSystem'
import type { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import type { Relations } from '~/sim/diplomacy/Relation'
import type { Army } from '~/sim/military/Army'
import { Combat } from '~/sim/military/Combat'
import {
  NO_MODIFIERS,
  withAttackerAttack,
  withAttackerDamageTaken,
  withDefenderAttack,
  withDefenderDamageTaken,
  type CombatModifiers,
} from '~/sim/military/CombatModifiers'
import { Conquest, type ConquestEvent } from '~/sim/military/Conquest'
import type { SupplySystem } from '~/sim/military/SupplySystem'
import type { Terrain } from '~/sim/world/Terrain'
import type { WorldState } from '~/sim/world/WorldState'

export interface BattleReport {
  readonly province: number
  readonly attacker: number
  readonly defender: number
  readonly damageToAttacker: number
  readonly damageToDefender: number
  readonly attackerWiped: boolean
  readonly defenderWiped: boolean
}

/* Perang hanya butuh ketiga pengali ini dari sistem sikap. Menyebutkan
   bentuknya alih-alih kelasnya membuat sistem perang berdiri dan bisa diuji
   tanpa modul sikap ikut terpasang. */
export interface StanceModifierSource {
  attackMultiplierFor(armyId: number, terrain: Terrain): number
  damageTakenMultiplierFor(armyId: number): number
  cityAssaultMultiplierFor(armyId: number): number
}

/*
 * Mencari perkelahian lalu menyelesaikannya. Pasukan tidak memilih untuk
 * menyerang: dua tumpukan bermusuhan di provinsi yang sama sudah bertempur
 * menurut definisinya, dan itulah yang membuat petanya sendiri menjadi lapisan
 * taktis alih-alih sebuah menu.
 */
export class WarSystem {
  readonly #combat: Combat
  readonly #conquest: Conquest
  readonly #reports: BattleReport[] = []

  /* Boleh kosong supaya sistem perang bisa dibangun dan diuji sendirian, tetapi
     sekali terpasang keduanya menentukan sebuah pertempuran sebanyak peringkat
     unitnya. */
  supply: SupplySystem | null = null
  stances: StanceModifierSource | null = null

  /* Negara yang tidak sanggup membeli bahan bakar bertempur dengan apa pun yang
     masih ada di mesinnya. Ia datang sebagai pengubah alih-alih sebagai cabang
     lain di dalam kode kerusakan, dan justru itulah alasan CombatModifiers
     ada. */
  shortage: ShortageSystem | null = null

  constructor(
    private readonly world: WorldState,
    private readonly relations: Relations,
    random: DeterministicRandom,
  ) {
    this.#combat = new Combat(random)
    this.#conquest = new Conquest(world)
  }

  get lastReports(): readonly BattleReport[] {
    return this.#reports
  }

  get lastConquests(): readonly ConquestEvent[] {
    return this.#conquest.recentEvents
  }

  tick(armies: ReadonlyMap<number, Army>): void {
    this.#reports.length = 0
    this.#conquest.clearEvents()

    const byProvince = new Map<number, Army[]>()

    for (const army of armies.values()) {
      if (army.isDestroyed) continue

      let here = byProvince.get(army.province)
      if (here === undefined) {
        here = []
        byProvince.set(army.province, here)
      }

      here.push(army)
    }

    for (const [province, present] of byProvince) {
      this.#resolveProvince(province, present)
    }
  }

  #resolveProvince(province: number, present: readonly Army[]): void {
    const terrain = this.world.provinces.at(province).terrain

    for (let i = 0; i < present.length; i++) {
      for (let j = i + 1; j < present.length; j++) {
        const a = present[i]!
        const b = present[j]!

        if (a.isDestroyed || b.isDestroyed || a.nation === b.nation) continue
        if (!this.relations.atWar(a.nation, b.nation)) continue

        /* Siapa pun yang tidak menguasai tanahnya adalah penyerang, sehingga
           garnisun menyimpan peringkat bertahan yang memang haknya. */
        const holdsGround = b.nation === this.world.provinces.controller[province]
        const attacker = holdsGround ? a : b
        const defender = holdsGround ? b : a

        const result = this.#combat.resolveHour(
          attacker,
          defender,
          terrain,
          this.world.clock.tick,
          this.#modifiersFor(attacker, defender, province, terrain),
        )

        this.#reports.push({
          province,
          attacker: attacker.nation,
          defender: defender.nation,
          damageToAttacker: result.damageToAttacker,
          damageToDefender: result.damageToDefender,
          attackerWiped: result.attackerDestroyed,
          defenderWiped: result.defenderDestroyed,
        })
      }
    }

    for (const army of present) {
      if (army.isDestroyed) continue

      const controller = this.world.provinces.controller[province]!
      if (army.nation === controller || !this.relations.atWar(army.nation, controller)) continue

      this.#conquest.tryCapture(army, present)
    }
  }

  #modifiersFor(
    attacker: Army,
    defender: Army,
    province: number,
    terrain: Terrain,
  ): CombatModifiers {
    let mods = NO_MODIFIERS

    /* Keluaran tiap pihak digerakkan oleh peringkat yang benar-benar ia pakai,
       sehingga pasokan penyerang menskalakan serangannya dan pasokan yang
       bertahan menskalakan pertahanannya. Memberi pengali serangan kepada
       keduanya akan menghukum garnisun yang terputus dua kali. */
    if (this.supply !== null) {
      mods = withAttackerAttack(
        mods,
        this.supply.attackMultiplierForStackIn(attacker.nation, attacker.province),
      )
      mods = withDefenderAttack(
        mods,
        this.supply.defenceMultiplierForStackIn(defender.nation, defender.province),
      )
    }

    /* Kedua pihak ditimbang menurut susunannya sendiri: kelangkaan hanya
       menjangkau bagian tumpukan yang berjalan dengan mesin, sehingga garnisun
       infanteri yang bertahan tidak kehilangan apa pun atas tank yang tidak
       dimilikinya. */
    if (this.shortage !== null) {
      mods = withAttackerAttack(mods, this.shortage.attackMultiplierFor(attacker))
      mods = withDefenderAttack(mods, this.shortage.attackMultiplierFor(defender))
    }

    if (this.stances !== null) {
      const inCity = this.world.provinces.isCity[province] !== 0

      mods = withAttackerAttack(mods, this.stances.attackMultiplierFor(attacker.id, terrain))
      mods = withAttackerDamageTaken(mods, this.stances.damageTakenMultiplierFor(attacker.id))
      mods = withDefenderAttack(mods, this.stances.attackMultiplierFor(defender.id, terrain))
      mods = withDefenderDamageTaken(mods, this.stances.damageTakenMultiplierFor(defender.id))

      if (inCity) {
        mods = withAttackerAttack(mods, this.stances.cityAssaultMultiplierFor(attacker.id))
      }
    }

    return mods
  }
}
