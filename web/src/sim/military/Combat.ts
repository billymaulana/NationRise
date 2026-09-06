import type { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { addF32, divF32, f32, mulF32, subF32 } from '~/sim/determinism/float32'
import { ARMOUR_CLASS_COUNT, type ArmourClass } from '~/sim/military/ArmourClass'
import { NEVER_LANDED, type Army } from '~/sim/military/Army'
import { NO_MODIFIERS, type CombatModifiers } from '~/sim/military/CombatModifiers'
import { attackAgainst, defenceAgainst, echelonWeight } from '~/sim/military/UnitClass'
import { favoursDefence, type Terrain } from '~/sim/world/Terrain'

export interface CombatResult {
  readonly damageToAttacker: number
  readonly damageToDefender: number
  readonly attackerDestroyed: boolean
  readonly defenderDestroyed: boolean
}

export const DAMAGE_SCALE = f32(0.35)
export const RANDOM_SPREAD = f32(0.15)

/* Tumpukan darat bertempur tanpa denda sampai sepuluh unit; di atas itu suku
   logaritmanya membuat menumpuk justru lebih buruk daripada memecah. */
export const MAX_STACK_WITHOUT_PENALTY = 10

/* Pendaratan yang dilawan bertempur pada separuh kekuatan sampai kepala
   pantainya berumur dua hari. Inilah yang menghalangi sebuah kepulauan
   diseberangi sebebas dataran, dan itulah sebabnya penguasaan laut layak
   dibayar. */
export const LANDING_PENALTY = f32(0.5)
export const LANDING_WINDOW_TICKS = 48

/* Padanan long.MaxValue sebagai tick baku: pemanggil yang tidak punya jam
   sedang menyatakan "tidak ada kepala pantai yang masih hangat", bukan sebuah
   waktu tertentu. */
export const TICK_UNBOUNDED = Number.MAX_SAFE_INTEGER

/* Penanda "belum pernah mendarat" diperiksa sebelum pengurangan: selisih dua
   ujung rentang tick akan meluap negatif dan menghukum setiap pasukan yang
   tidak pernah mendekati kapal. */
export function landingModifier(army: Army, tick: number): number {
  return army.landedOnTick !== NEVER_LANDED && tick - army.landedOnTick < LANDING_WINDOW_TICKS
    ? LANDING_PENALTY
    : 1
}

export function stackPenalty(size: number): number {
  if (size <= MAX_STACK_WITHOUT_PENALTY) return 1

  const excess = f32(Math.log(divF32(size, MAX_STACK_WITHOUT_PENALTY)))
  return Math.max(f32(0.3), subF32(1, mulF32(f32(0.56), excess)))
}

export function terrainAttackModifier(terrain: Terrain): number {
  return favoursDefence(terrain) ? f32(0.75) : 1
}

export function strengthOf(
  army: Army,
  target: ArmourClass,
  terrain: Terrain,
  attacking: boolean,
): number {
  let total = 0

  for (const unit of army.units) {
    const rating = attacking
      ? attackAgainst(unit.unitClass, target)
      : defenceAgainst(unit.unitClass, target)

    total = addF32(total, mulF32(rating, unit.healthPenalty))
  }

  const terrainModifier = attacking ? terrainAttackModifier(terrain) : 1
  return mulF32(mulF32(total, terrainModifier), stackPenalty(army.count))
}

/*
 * Satu jam pertempuran. Kedua pihak memberi kerusakan serentak: penyerang
 * memakai peringkat serangnya, yang bertahan memakai peringkat bertahannya, dan
 * itulah sebabnya garis infanteri yang menggali mengalahkan jumlah yang sama
 * ketika menyerang melintasi tanah terbuka.
 */
export class Combat {
  constructor(private readonly random: DeterministicRandom) {}

  resolveHour(
    attacker: Army,
    defender: Army,
    terrain: Terrain,
    tick: number = TICK_UNBOUNDED,
    modifiers: CombatModifiers = NO_MODIFIERS,
  ): CombatResult {
    let toDefender = 0
    let toAttacker = 0

    for (let armour = 0; armour < ARMOUR_CLASS_COUNT; armour++) {
      if (!presentIn(defender, armour as ArmourClass)) continue

      toDefender = addF32(toDefender, strengthOf(attacker, armour as ArmourClass, terrain, true))
    }

    for (let armour = 0; armour < ARMOUR_CLASS_COUNT; armour++) {
      if (!presentIn(attacker, armour as ArmourClass)) continue

      toAttacker = addF32(toAttacker, strengthOf(defender, armour as ArmourClass, terrain, false))
    }

    toDefender = this.#roll(
      mulF32(
        mulF32(mulF32(toDefender, landingModifier(attacker, tick)), modifiers.attackerAttack),
        modifiers.defenderDamageTaken,
      ),
    )

    toAttacker = this.#roll(
      mulF32(mulF32(toAttacker, modifiers.defenderAttack), modifiers.attackerDamageTaken),
    )

    distribute(defender, toDefender)
    distribute(attacker, toAttacker)

    attacker.removeDestroyed()
    defender.removeDestroyed()

    return {
      damageToAttacker: toAttacker,
      damageToDefender: toDefender,
      attackerDestroyed: attacker.isDestroyed,
      defenderDestroyed: defender.isDestroyed,
    }
  }

  /* Undiannya dihitung dalam double lalu dipotong sekali ke float, persis
     seperti sumbernya: sebaran adalah float yang naik ke double di dalam
     perkalian, dan memotongnya lebih awal menggeser setiap pertempuran. */
  #roll(strength: number): number {
    const variation = addF32(1, f32((this.random.nextDouble() * 2 - 1) * RANDOM_SPREAD))
    return mulF32(mulF32(strength, DAMAGE_SCALE), variation)
  }
}

function presentIn(army: Army, armour: ArmourClass): boolean {
  for (const unit of army.units) {
    if (unit.unitClass.armour === armour) return true
  }

  return false
}

/* Kerusakan mendarat pada eselon menurut bobot, sehingga unit garis depan
   menyerapnya sebelum artileri di belakang. */
function distribute(army: Army, damage: number): void {
  if (army.count === 0 || damage <= 0) return

  let totalWeight = 0
  for (const unit of army.units) {
    totalWeight = addF32(totalWeight, echelonWeight(unit.unitClass.echelon))
  }

  if (totalWeight <= 0) return

  for (const unit of army.units) {
    const share = divF32(echelonWeight(unit.unitClass.echelon), totalWeight)
    unit.applyDamage(mulF32(damage, share))
  }
}
