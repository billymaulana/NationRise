import { describe, expect, it } from 'vitest'
import { f32 } from '~/sim/determinism/float32'
import {
  NO_MODIFIERS,
  withAttackerAttack,
  withAttackerDamageTaken,
  withDefenderAttack,
  withDefenderDamageTaken,
} from '~/sim/military/CombatModifiers'

/* Diport dari NationRise.Core.Tests/Military/CombatModifierTests.cs. Bagian yang
   memutar pertempuran sungguhan menunggu Combat, WarSystem, SupplySystem dan
   StanceSystem diport; yang di sini adalah aljabar pengalinya. */
describe('CombatModifiers', () => {
  it('tanpa pengubah semuanya satu', () => {
    expect(NO_MODIFIERS).toEqual({
      attackerAttack: 1,
      attackerDamageTaken: 1,
      defenderAttack: 1,
      defenderDamageTaken: 1,
    })
  })

  it('faktor berlipat, bukan saling menggantikan', () => {
    const stacked = withAttackerAttack(withAttackerAttack(NO_MODIFIERS, f32(0.8)), f32(0.5))

    expect(stacked.attackerAttack).toBeCloseTo(0.4, 4)
    expect(stacked.attackerAttack).toBe(f32(0.4))
  })

  it('setiap faktor hanya menyentuh medannya sendiri', () => {
    const mods = withDefenderDamageTaken(
      withDefenderAttack(withAttackerDamageTaken(NO_MODIFIERS, f32(0.7)), f32(0.3)),
      f32(0.75),
    )

    expect(mods.attackerAttack).toBe(1)
    expect(mods.attackerDamageTaken).toBe(f32(0.7))
    expect(mods.defenderAttack).toBe(f32(0.3))
    expect(mods.defenderDamageTaken).toBe(f32(0.75))
  })

  it('pengubah tidak mengubah nilai asalnya', () => {
    const weakened = withAttackerAttack(NO_MODIFIERS, f32(0.8))

    expect(weakened.attackerAttack).toBe(f32(0.8))
    expect(NO_MODIFIERS.attackerAttack).toBe(1)
  })
})
