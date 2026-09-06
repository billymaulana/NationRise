import { mulF32 } from '~/sim/determinism/float32'

/*
 * Semua yang di luar kedua tumpukan yang mengubah sekeras apa mereka memukul:
 * pasokan, sikap, penggalian, kepala pantai. Pertempuran mengalikannya dan
 * tidak tahu asalnya, dan itulah yang membuat pengubah baru bisa ditambahkan
 * tanpa menyentuh kode kerusakan.
 */
export interface CombatModifiers {
  readonly attackerAttack: number
  readonly attackerDamageTaken: number
  readonly defenderAttack: number
  readonly defenderDamageTaken: number
}

export const NO_MODIFIERS: CombatModifiers = {
  attackerAttack: 1,
  attackerDamageTaken: 1,
  defenderAttack: 1,
  defenderDamageTaken: 1,
}

export function withAttackerAttack(mods: CombatModifiers, factor: number): CombatModifiers {
  return { ...mods, attackerAttack: mulF32(mods.attackerAttack, factor) }
}

export function withAttackerDamageTaken(mods: CombatModifiers, factor: number): CombatModifiers {
  return { ...mods, attackerDamageTaken: mulF32(mods.attackerDamageTaken, factor) }
}

export function withDefenderAttack(mods: CombatModifiers, factor: number): CombatModifiers {
  return { ...mods, defenderAttack: mulF32(mods.defenderAttack, factor) }
}

export function withDefenderDamageTaken(mods: CombatModifiers, factor: number): CombatModifiers {
  return { ...mods, defenderDamageTaken: mulF32(mods.defenderDamageTaken, factor) }
}
