import { describe, expect, it } from 'vitest'
import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { f32 } from '~/sim/determinism/float32'
import { Army } from '~/sim/military/Army'
import { Combat, stackPenalty } from '~/sim/military/Combat'
import {
  NO_MODIFIERS,
  withAttackerAttack,
  withDefenderAttack,
  withDefenderDamageTaken,
  type CombatModifiers,
} from '~/sim/military/CombatModifiers'
import type { UnitClass } from '~/sim/military/UnitClass'
import {
  MAIN_BATTLE_TANK,
  MOTORIZED_INFANTRY,
  TOWED_ARTILLERY,
} from '~/sim/military/UnitCatalogue'
import { Terrain } from '~/sim/world/Terrain'

/* Diport dari NationRise.Core.Tests/Military/CombatTests.cs, ditambah bagian
   CombatModifierTests.cs yang memutar pertempuran sungguhan. */

function stack(id: number, ...units: UnitClass[]): Army {
  const army = new Army(id, 0, 0)
  for (const unit of units) army.add(unit)
  return army
}

function infantry(id: number, nation: number, count: number): Army {
  const army = new Army(id, nation, 0)
  for (let i = 0; i < count; i++) army.add(MOTORIZED_INFANTRY)
  return army
}

describe('Combat', () => {
  it('penumpukan di atas sepuluh dikenai denda', () => {
    expect(stackPenalty(10)).toBeCloseTo(1, 3)
    expect(stackPenalty(20)).toBeLessThan(1)
    expect(stackPenalty(40)).toBeLessThan(stackPenalty(20))
    expect(stackPenalty(1000)).toBeGreaterThanOrEqual(f32(0.3))
  })

  it('kedua pihak sama-sama terluka', () => {
    const combat = new Combat(new DeterministicRandom(1))
    const attacker = stack(1, MAIN_BATTLE_TANK, MAIN_BATTLE_TANK)
    const defender = stack(2, MOTORIZED_INFANTRY, MOTORIZED_INFANTRY)

    const result = combat.resolveHour(attacker, defender, Terrain.OpenGround)

    expect(result.damageToAttacker).toBeGreaterThan(0)
    expect(result.damageToDefender).toBeGreaterThan(0)
  })

  it('medan yang berpihak pada pertahanan menolong yang bertahan', () => {
    function damage(terrain: Terrain): number {
      const combat = new Combat(new DeterministicRandom(42))
      const attacker = stack(1, MAIN_BATTLE_TANK)
      const defender = stack(2, MOTORIZED_INFANTRY)
      return combat.resolveHour(attacker, defender, terrain).damageToDefender
    }

    expect(damage(Terrain.Mountains)).toBeLessThan(damage(Terrain.OpenGround))
  })

  it('unit garis depan menyerap lebih banyak daripada artileri', () => {
    const combat = new Combat(new DeterministicRandom(7))
    const attacker = stack(1, MAIN_BATTLE_TANK, MAIN_BATTLE_TANK)
    const defender = stack(2, MOTORIZED_INFANTRY, TOWED_ARTILLERY)

    combat.resolveHour(attacker, defender, Terrain.OpenGround)

    const infantryUnit = defender.units.find((u) => u.unitClass === MOTORIZED_INFANTRY)!
    const artilleryUnit = defender.units.find((u) => u.unitClass === TOWED_ARTILLERY)!

    const infantryLost = infantryUnit.unitClass.maxHitPoints - infantryUnit.hitPoints
    const artilleryLost = artilleryUnit.unitClass.maxHitPoints - artilleryUnit.hitPoints

    expect(infantryLost).toBeGreaterThan(artilleryLost)
  })

  it('seed yang sama memberi pertempuran yang sama', () => {
    function fight(seed: number): number {
      const combat = new Combat(new DeterministicRandom(seed))
      const attacker = stack(1, MAIN_BATTLE_TANK)
      const defender = stack(2, MOTORIZED_INFANTRY)
      return combat.resolveHour(attacker, defender, Terrain.OpenGround).damageToDefender
    }

    expect(fight(99)).toBe(fight(99))
    expect(fight(1)).not.toBe(fight(2))
  })

  it('kekuatan berlebih menang dalam waktu yang masuk akal', () => {
    const combat = new Combat(new DeterministicRandom(5))
    const attacker = stack(1, MAIN_BATTLE_TANK, MAIN_BATTLE_TANK, MAIN_BATTLE_TANK)
    const defender = stack(2, MOTORIZED_INFANTRY)

    let hours = 0
    while (!defender.isDestroyed && hours < 100) {
      combat.resolveHour(attacker, defender, Terrain.OpenGround)
      hours++
    }

    expect(defender.isDestroyed).toBe(true)
    expect(hours).toBeGreaterThanOrEqual(1)
    expect(hours).toBeLessThanOrEqual(30)
  })
})

/*
 * Rantai float 32-bit di ResolveHour panjang: denda tumpukan lewat logaritma,
 * hukuman kesehatan per unit, undian di atas double lalu dipotong ke float, dan
 * pembagian eselon. Uji relasional di atas tetap hijau kalau satu di antaranya
 * dihitung dalam double; nilai-nilai ini tidak. Diambil dengan menjalankan
 * implementasi rujukan, bukan dihitung ulang di sini.
 */
describe('kerusakan satu jam cocok dengan implementasi rujukan', () => {
  it('dua tank melawan dua infanteri di tanah lapang, seed 1', () => {
    const combat = new Combat(new DeterministicRandom(1))
    const result = combat.resolveHour(
      stack(1, MAIN_BATTLE_TANK, MAIN_BATTLE_TANK),
      stack(2, MOTORIZED_INFANTRY, MOTORIZED_INFANTRY),
      Terrain.OpenGround,
    )

    expect(result.damageToAttacker).toBe(f32(1.7607291))
    expect(result.damageToDefender).toBe(f32(6.683522))
  })

  it('satu tank melawan satu infanteri, seed 42, per medan', () => {
    function damage(terrain: Terrain): number {
      return new Combat(new DeterministicRandom(42)).resolveHour(
        stack(1, MAIN_BATTLE_TANK),
        stack(2, MOTORIZED_INFANTRY),
        terrain,
      ).damageToDefender
    }

    expect(damage(Terrain.OpenGround)).toBe(f32(2.7567503))
    expect(damage(Terrain.Mountains)).toBe(f32(2.0675628))
  })

  it('kerusakan terbagi menurut eselon, seed 7', () => {
    const defender = stack(2, MOTORIZED_INFANTRY, TOWED_ARTILLERY)
    new Combat(new DeterministicRandom(7)).resolveHour(
      stack(1, MAIN_BATTLE_TANK, MAIN_BATTLE_TANK),
      defender,
      Terrain.OpenGround,
    )

    expect(defender.units[0]!.hitPoints).toBe(f32(4.981366))
    expect(defender.units[1]!.hitPoints).toBe(f32(8.660456))
  })
})

/*
 * Diport dari CombatModifierTests.cs. Pasokan dan sikap keduanya sudah lengkap
 * dan sekaligus tak terjangkau: tidak ada yang meneruskan pengalinya ke Combat,
 * sehingga pasukan yang terputus bertempur sama baiknya dengan yang tersuplai.
 */
describe('pengubah tempur pada pertempuran sungguhan', () => {
  function damageToDefender(mods: CombatModifiers): number {
    return new Combat(new DeterministicRandom(9)).resolveHour(
      infantry(1, 1, 6),
      infantry(2, 2, 6),
      Terrain.OpenGround,
      0,
      mods,
    ).damageToDefender
  }

  function damageToAttacker(mods: CombatModifiers): number {
    return new Combat(new DeterministicRandom(9)).resolveHour(
      infantry(1, 1, 6),
      infantry(2, 2, 6),
      Terrain.OpenGround,
      0,
      mods,
    ).damageToAttacker
  }

  it('tanpa pengubah hasilnya sama dengan pertempuran polos', () => {
    const plain = new Combat(new DeterministicRandom(9)).resolveHour(
      infantry(1, 1, 6),
      infantry(2, 2, 6),
      Terrain.OpenGround,
      0,
    )

    expect(damageToDefender(NO_MODIFIERS)).toBeCloseTo(plain.damageToDefender, 4)
    expect(damageToAttacker(NO_MODIFIERS)).toBeCloseTo(plain.damageToAttacker, 4)
  })

  it('penyerang yang lemah memukul lebih pelan', () => {
    const full = damageToDefender(NO_MODIFIERS)
    const starved = damageToDefender(withAttackerAttack(NO_MODIFIERS, f32(0.8)))

    expect(starved).toBeCloseTo(mulFloat(full, 0.8), 4)
  })

  it('bertahan yang menggali menerima lebih sedikit', () => {
    const exposed = damageToDefender(NO_MODIFIERS)
    const dugIn = damageToDefender(withDefenderDamageTaken(NO_MODIFIERS, f32(0.75)))

    expect(dugIn).toBeCloseTo(mulFloat(exposed, 0.75), 4)
  })

  it('balasan diskalakan oleh faktor milik yang bertahan', () => {
    const full = damageToAttacker(NO_MODIFIERS)
    const cutOff = damageToAttacker(withDefenderAttack(NO_MODIFIERS, f32(0.7)))

    expect(cutOff).toBeCloseTo(mulFloat(full, 0.7), 4)
  })

  function mulFloat(value: number, factor: number): number {
    return f32(value * f32(factor))
  }
})
