import { addF32, divF32, f32, mulF32, subF32 } from '~/sim/determinism/float32'
import { ARMOUR_CLASS_COUNT, type ArmourClass } from '~/sim/military/ArmourClass'
import type { Army } from '~/sim/military/Army'
import {
  DAMAGE_SCALE,
  RANDOM_SPREAD,
  stackPenalty,
  terrainAttackModifier,
} from '~/sim/military/Combat'
import {
  attackAgainst,
  defenceAgainst,
  echelonWeight,
  type UnitClass,
} from '~/sim/military/UnitClass'
import type { Terrain } from '~/sim/world/Terrain'

/*
 * Rantai perkaliannya persis seperti yang dipakai Combat. Memecah faktornya
 * adalah seluruh maksudnya: pemain yang melihat 0,75 di sebelah "hutan"
 * mempelajari aturan medannya dalam satu pertempuran alih-alih sepuluh.
 */
export interface StrengthBreakdown {
  readonly baseRating: number
  readonly terrain: number
  readonly stackPenalty: number
  readonly healthPenalty: number
  readonly situational: number
  readonly total: number
}

export interface BattleForecast {
  readonly attacker: StrengthBreakdown
  readonly defender: StrengthBreakdown
  readonly fastestTicks: number
  readonly slowestTicks: number
  readonly attackerLossesLow: number
  readonly attackerLossesHigh: number
  readonly defenderLossesLow: number
  readonly defenderLossesHigh: number
  readonly attackerWinsBestCase: boolean
  readonly attackerWinsWorstCase: boolean
}

export function isDecisive(forecast: BattleForecast): boolean {
  return forecast.attackerWinsBestCase === forecast.attackerWinsWorstCase
}

export const TICK_CEILING = 96

export function breakdown(
  army: Army,
  opponent: Army,
  terrain: Terrain,
  attacking: boolean,
  situational = 1,
): StrengthBreakdown {
  let rated = 0
  let weighted = 0

  for (let armour = 0; armour < ARMOUR_CLASS_COUNT; armour++) {
    if (!contains(opponent, armour as ArmourClass)) continue

    for (const unit of army.units) {
      const rating = attacking
        ? attackAgainst(unit.unitClass, armour as ArmourClass)
        : defenceAgainst(unit.unitClass, armour as ArmourClass)

      rated = addF32(rated, rating)
      weighted = addF32(weighted, mulF32(rating, unit.healthPenalty))
    }
  }

  const health = rated <= 0 ? 1 : divF32(weighted, rated)
  const terrainModifier = attacking ? terrainAttackModifier(terrain) : 1
  const stack = stackPenalty(army.count)

  return {
    baseRating: rated,
    terrain: terrainModifier,
    stackPenalty: stack,
    healthPenalty: health,
    situational,
    total: mulF32(mulF32(mulF32(mulF32(rated, terrainModifier), stack), health), situational),
  }
}

/*
 * Meramalkan pertempuran tanpa mengundinya. Ramalannya berupa rentang alih-alih
 * persentase menang karena undian kerusakannya memang rentang: menyebut "80%"
 * lalu kalah terbaca sebagai bohong, menyebut "12 sampai 18 tick" tidak.
 *
 * `attackerSituational` membawa pengubah yang belum ditanggung tumpukannya —
 * pendaratan yang dilawan adalah yang paling berarti di kepulauan.
 */
export function forecast(
  attacker: Army,
  defender: Army,
  terrain: Terrain,
  attackerSituational = 1,
): BattleForecast {
  const attack = breakdown(attacker, defender, terrain, true, attackerSituational)
  const defence = breakdown(defender, attacker, terrain, false)

  const best = simulate(attacker, defender, terrain, attackerSituational, addF32(1, RANDOM_SPREAD))
  const worst = simulate(attacker, defender, terrain, attackerSituational, subF32(1, RANDOM_SPREAD))

  return {
    attacker: attack,
    defender: defence,
    fastestTicks: Math.min(best.ticks, worst.ticks),
    slowestTicks: Math.max(best.ticks, worst.ticks),
    attackerLossesLow: Math.min(best.attackerLosses, worst.attackerLosses),
    attackerLossesHigh: Math.max(best.attackerLosses, worst.attackerLosses),
    defenderLossesLow: Math.min(best.defenderLosses, worst.defenderLosses),
    defenderLossesHigh: Math.max(best.defenderLosses, worst.defenderLosses),
    attackerWinsBestCase: best.attackerWins,
    attackerWinsWorstCase: worst.attackerWins,
  }
}

interface Outcome {
  readonly ticks: number
  readonly attackerLosses: number
  readonly defenderLosses: number
  readonly attackerWins: boolean
}

interface Shadow {
  readonly unitClass: UnitClass
  hitPoints: number
}

/*
 * Menjalankan pertempuran dengan dadu dibekukan di satu ujung rentangnya.
 * Kekuatannya dihitung ulang tiap tick dari unit yang masih hidup, sehingga
 * ramalannya menangkap spiral tempat pihak yang kalah kian cepat kalah.
 */
function simulate(
  attacker: Army,
  defender: Army,
  terrain: Terrain,
  attackerSituational: number,
  attackerLuck: number,
): Outcome {
  const defenderLuck = subF32(2, attackerLuck)

  const attackers = copy(attacker)
  const defenders = copy(defender)

  const attackTerrain = terrainAttackModifier(terrain)

  let tick = 0
  let aliveAttackers = attackers.length
  let aliveDefenders = defenders.length

  while (tick < TICK_CEILING && aliveAttackers > 0 && aliveDefenders > 0) {
    tick++

    const toDefender = mulF32(
      mulF32(
        mulF32(
          mulF32(effectiveStrength(attackers, defender, true), attackTerrain),
          attackerSituational,
        ),
        DAMAGE_SCALE,
      ),
      attackerLuck,
    )

    const toAttacker = mulF32(
      mulF32(effectiveStrength(defenders, attacker, false), DAMAGE_SCALE),
      defenderLuck,
    )

    apply(defenders, toDefender)
    apply(attackers, toAttacker)

    aliveAttackers = countAlive(attackers)
    aliveDefenders = countAlive(defenders)
  }

  return {
    ticks: tick,
    attackerLosses: attackers.length - aliveAttackers,
    defenderLosses: defenders.length - aliveDefenders,
    attackerWins: aliveDefenders === 0 && aliveAttackers > 0,
  }
}

function copy(army: Army): Shadow[] {
  return army.units.map((unit) => ({ unitClass: unit.unitClass, hitPoints: unit.hitPoints }))
}

function healthPenaltyOf(unit: Shadow): number {
  return addF32(f32(0.25), mulF32(f32(0.75), divF32(unit.hitPoints, unit.unitClass.maxHitPoints)))
}

function effectiveStrength(units: readonly Shadow[], opponent: Army, attacking: boolean): number {
  let total = 0

  for (let armour = 0; armour < ARMOUR_CLASS_COUNT; armour++) {
    if (!contains(opponent, armour as ArmourClass)) continue

    for (const unit of units) {
      if (unit.hitPoints <= 0) continue

      const rating = attacking
        ? attackAgainst(unit.unitClass, armour as ArmourClass)
        : defenceAgainst(unit.unitClass, armour as ArmourClass)

      total = addF32(total, mulF32(rating, healthPenaltyOf(unit)))
    }
  }

  return mulF32(total, stackPenalty(countAlive(units)))
}

function apply(units: readonly Shadow[], damage: number): void {
  let totalWeight = 0
  for (const unit of units) {
    if (unit.hitPoints > 0) totalWeight = addF32(totalWeight, echelonWeight(unit.unitClass.echelon))
  }

  if (totalWeight <= 0) return

  for (const unit of units) {
    if (unit.hitPoints <= 0) continue

    const share = divF32(echelonWeight(unit.unitClass.echelon), totalWeight)
    unit.hitPoints = Math.max(0, subF32(unit.hitPoints, mulF32(damage, share)))
  }
}

function countAlive(units: readonly Shadow[]): number {
  let alive = 0
  for (const unit of units) {
    if (unit.hitPoints > 0) alive++
  }

  return alive
}

function contains(army: Army, armour: ArmourClass): boolean {
  for (const unit of army.units) {
    if (unit.unitClass.armour === armour) return true
  }

  return false
}
