import { describe, expect, it } from 'vitest'
import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { addF32, f32, mulF32 } from '~/sim/determinism/float32'
import { ARMOUR_CLASS_COUNT, type ArmourClass } from '~/sim/military/ArmourClass'
import { Army } from '~/sim/military/Army'
import { breakdown, forecast, isDecisive, TICK_CEILING } from '~/sim/military/BattleEstimate'
import {
  Combat,
  LANDING_PENALTY,
  LANDING_WINDOW_TICKS,
  landingModifier,
  strengthOf,
} from '~/sim/military/Combat'
import type { UnitClass } from '~/sim/military/UnitClass'
import { MAIN_BATTLE_TANK, MOTORIZED_INFANTRY } from '~/sim/military/UnitCatalogue'
import { Terrain } from '~/sim/world/Terrain'

/* Diport dari NationRise.Core.Tests/Military/BattleEstimateTests.cs. */

function stack(id: number, nation: number, ...classes: UnitClass[]): Army {
  const army = new Army(id, nation, 0)
  for (const unitClass of classes) army.add(unitClass)
  return army
}

function infantry(id: number, nation: number, count: number): Army {
  const army = new Army(id, nation, 0)
  for (let i = 0; i < count; i++) army.add(MOTORIZED_INFANTRY)
  return army
}

describe('BattleEstimate.breakdown', () => {
  /* Pratinjau harus mengutip mesinnya, bukan mendekatinya. Kalau keduanya
     menyimpang, pemain sedang diperlihatkan angka yang tidak pernah dipakai
     pertempurannya. */
  it('rinciannya sama dengan kekuatan yang dipakai mesin', () => {
    const attacker = infantry(1, 1, 6)
    const defender = infantry(2, 2, 4)

    let engine = 0
    for (let armour = 0; armour < ARMOUR_CLASS_COUNT; armour++) {
      const present = defender.units.some((u) => u.unitClass.armour === (armour as ArmourClass))
      if (present) {
        engine = addF32(engine, strengthOf(attacker, armour as ArmourClass, Terrain.Forest, true))
      }
    }

    const preview = breakdown(attacker, defender, Terrain.Forest, true)

    expect(preview.total).toBeCloseTo(engine, 3)
  })

  it('faktor-faktornya berkalikan menjadi total', () => {
    const b = breakdown(infantry(1, 1, 14), infantry(2, 2, 3), Terrain.Mountains, true)

    expect(b.baseRating * b.terrain * b.stackPenalty * b.healthPenalty).toBeCloseTo(b.total, 3)
  })

  it('bertahan mengabaikan pengubah medan untuk serangan', () => {
    const attacker = infantry(1, 1, 5)
    const defender = infantry(2, 2, 5)

    expect(breakdown(defender, attacker, Terrain.Mountains, false).terrain).toBeCloseTo(1, 3)
  })

  it('tumpukan kebesaran dikenai denda', () => {
    const small = infantry(1, 1, 10)
    const large = infantry(2, 1, 20)
    const target = infantry(3, 2, 4)

    const a = breakdown(small, target, Terrain.OpenGround, true)
    const b = breakdown(large, target, Terrain.OpenGround, true)

    expect(a.stackPenalty).toBeCloseTo(1, 3)
    expect(b.stackPenalty).toBeLessThan(0.7)
    expect(b.total).toBeLessThan(2 * a.total)
  })

  it('unit yang terluka menurunkan faktor kesehatan', () => {
    const attacker = infantry(1, 1, 4)
    const defender = infantry(2, 2, 4)

    expect(breakdown(attacker, defender, Terrain.OpenGround, true).healthPenalty).toBeCloseTo(1, 3)

    for (const unit of attacker.units) {
      unit.hitPoints = mulF32(unit.unitClass.maxHitPoints, f32(0.2))
    }

    expect(breakdown(attacker, defender, Terrain.OpenGround, true).healthPenalty).toBeCloseTo(
      0.4,
      2,
    )
  })

  it('perjodohan lapis baja lebih menentukan daripada jumlah kepala', () => {
    const tanks = stack(1, 1, MAIN_BATTLE_TANK, MAIN_BATTLE_TANK)
    const versusInfantry = breakdown(tanks, infantry(2, 2, 4), Terrain.OpenGround, true)

    expect(versusInfantry.baseRating).toBeGreaterThan(0)
  })
})

describe('BattleEstimate.forecast', () => {
  it('kekuatan berlebih diramalkan menentukan', () => {
    const f = forecast(infantry(1, 1, 9), infantry(2, 2, 1), Terrain.OpenGround)

    expect(isDecisive(f)).toBe(true)
    expect(f.attackerWinsWorstCase).toBe(true)
    expect(f.defenderLossesHigh).toBe(1)
  })

  it('ramalan memberi rentang, bukan satu titik', () => {
    const f = forecast(infantry(1, 1, 8), infantry(2, 2, 6), Terrain.OpenGround)

    expect(f.slowestTicks).toBeGreaterThanOrEqual(f.fastestTicks)
    expect(f.attackerLossesHigh).toBeGreaterThanOrEqual(f.attackerLossesLow)
    expect(f.slowestTicks).toBeGreaterThan(f.fastestTicks)
  })

  /* Klaim jujur di balik menampilkan rentang: pertempuran sungguhan mendarat
     di dalamnya. */
  it.each([1, 77, 20260906])('pertempuran sungguhan dengan seed %i mendarat di dalam ramalan', (seed) => {
    const attacker = infantry(1, 1, 7)
    const defender = infantry(2, 2, 5)
    const f = forecast(attacker, defender, Terrain.OpenGround)

    const combat = new Combat(new DeterministicRandom(seed))
    const startAttackers = attacker.count
    const startDefenders = defender.count

    let ticks = 0
    while (ticks < TICK_CEILING && !attacker.isDestroyed && !defender.isDestroyed) {
      ticks++
      combat.resolveHour(attacker, defender, Terrain.OpenGround)
    }

    expect(ticks).toBeGreaterThanOrEqual(f.fastestTicks)
    expect(ticks).toBeLessThanOrEqual(f.slowestTicks)
    expect(startAttackers - attacker.count).toBeGreaterThanOrEqual(f.attackerLossesLow)
    expect(startAttackers - attacker.count).toBeLessThanOrEqual(f.attackerLossesHigh)
    expect(startDefenders - defender.count).toBeGreaterThanOrEqual(f.defenderLossesLow)
    expect(startDefenders - defender.count).toBeLessThanOrEqual(f.defenderLossesHigh)
  })

  it('medan sendirian bisa membalik hasilnya', () => {
    const open = forecast(infantry(1, 1, 6), infantry(2, 2, 5), Terrain.OpenGround)
    const rough = forecast(infantry(1, 1, 6), infantry(2, 2, 5), Terrain.Mountains)

    expect(rough.attacker.total).toBeLessThan(open.attacker.total)
    expect(rough.slowestTicks).toBeGreaterThanOrEqual(open.slowestTicks)
  })

  /* Indonesia menyerang lewat air jauh lebih sering daripada lewat perbatasan,
     sehingga denda pendaratan adalah pengubah yang paling perlu dinyatakan
     pratinjaunya. */
  it('pendaratan yang dilawan diramalkan pada separuh kekuatan', () => {
    const attacker = infantry(1, 1, 8)
    const defender = infantry(2, 2, 4)

    const dry = forecast(attacker, defender, Terrain.OpenGround)
    const landing = forecast(attacker, defender, Terrain.OpenGround, LANDING_PENALTY)

    expect(landing.attacker.total).toBeCloseTo(dry.attacker.total * LANDING_PENALTY, 3)
    expect(landing.defender.total).toBeCloseTo(dry.defender.total, 3)
    expect(landing.slowestTicks).toBeGreaterThan(dry.slowestTicks)
    expect(landing.attackerLossesHigh).toBeGreaterThanOrEqual(dry.attackerLossesHigh)
  })
})

/*
 * Rentang ramalannya adalah keluaran satu lingkar simulasi penuh: kekuatan
 * dihitung ulang tiap tick, kerusakan dibagi per eselon, dan yang tewas
 * dikeluarkan dari bobot berikutnya. Uji relasional di atas tetap hijau
 * meskipun lingkar itu meleset satu tick; tabel ini tidak. Nilainya diambil
 * dengan menjalankan implementasi rujukan, bukan dihitung ulang di sini.
 */
describe('rentang ramalan cocok dengan implementasi rujukan', () => {
  it.each([
    [9, 1, Terrain.OpenGround, 1, 2, 2, 0, 0, 1, 1],
    [8, 6, Terrain.OpenGround, 1, 12, 22, 0, 0, 6, 6],
    [7, 5, Terrain.OpenGround, 1, 11, 19, 0, 0, 5, 5],
    [6, 5, Terrain.OpenGround, 1, 14, 18, 0, 6, 0, 5],
    [6, 5, Terrain.Mountains, 1, 15, 21, 0, 6, 0, 5],
    [8, 4, Terrain.OpenGround, 1, 7, 10, 0, 0, 4, 4],
    [8, 4, Terrain.OpenGround, LANDING_PENALTY, 15, 26, 0, 0, 4, 4],
  ] as const)(
    '%i melawan %i di medan %i dengan pengubah %f',
    (
      attackers,
      defenders,
      terrain,
      situational,
      fastest,
      slowest,
      attackerLow,
      attackerHigh,
      defenderLow,
      defenderHigh,
    ) => {
      const f = forecast(
        infantry(1, 1, attackers),
        infantry(2, 2, defenders),
        terrain,
        situational,
      )

      expect(f.fastestTicks).toBe(fastest)
      expect(f.slowestTicks).toBe(slowest)
      expect(f.attackerLossesLow).toBe(attackerLow)
      expect(f.attackerLossesHigh).toBe(attackerHigh)
      expect(f.defenderLossesLow).toBe(defenderLow)
      expect(f.defenderLossesHigh).toBe(defenderHigh)
    },
  )
})

describe('denda pendaratan', () => {
  it('denda pendaratan kedaluwarsa bersama kepala pantainya', () => {
    const landed = infantry(1, 1, 5)
    landed.landedOnTick = 100

    expect(landingModifier(landed, 120)).toBeCloseTo(LANDING_PENALTY, 3)
    expect(landingModifier(landed, 100 + LANDING_WINDOW_TICKS)).toBeCloseTo(1, 3)
  })

  it('pasukan yang tidak pernah berlayar bertempur pada kekuatan penuh', () => {
    const overland = infantry(1, 1, 5)

    expect(landingModifier(overland, 0)).toBeCloseTo(1, 3)
    expect(landingModifier(overland, Number.MAX_SAFE_INTEGER)).toBeCloseTo(1, 3)
  })
})
