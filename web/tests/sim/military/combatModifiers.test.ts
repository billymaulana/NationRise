import { describe, expect, it } from 'vitest'
import { readWorld, type WorldData } from '~/sim/data/WorldFile'
import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { f32 } from '~/sim/determinism/float32'
import { Relation, Relations } from '~/sim/diplomacy/Relation'
import { Army } from '~/sim/military/Army'
import {
  NO_MODIFIERS,
  withAttackerAttack,
  withAttackerDamageTaken,
  withDefenderAttack,
  withDefenderDamageTaken,
} from '~/sim/military/CombatModifiers'
import { REORGANISATION_TICKS, StanceKind, StanceSystem } from '~/sim/military/Stance'
import { SupplySystem } from '~/sim/military/SupplySystem'
import { MOTORIZED_INFANTRY } from '~/sim/military/UnitCatalogue'
import { WarSystem } from '~/sim/military/WarSystem'
import { Terrain } from '~/sim/world/Terrain'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Military/CombatModifierTests.cs. Bagian yang
   memutar pertempuran satu lawan satu hidup di combat.test.ts; yang di sini
   adalah aljabar pengalinya dan penyambungannya ke sistem perang. */
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

interface BattleDamage {
  readonly attacker: number
  readonly defender: number
}

let cached: WorldData | null = null

function worldData(): WorldData {
  cached ??= readWorld(worldBinary())
  return cached
}

function stack(id: number, nation: number, province: number, count: number): Army {
  const army = new Army(id, nation, province)
  for (let i = 0; i < count; i++) army.add(MOTORIZED_INFANTRY)
  return army
}

function fight(withSupply: boolean): BattleDamage {
  const data = worldData()
  const state = data.toWorldState(1)
  const relations = new Relations(state.nations.count)

  const idn = state.nations.indexOf('IDN')
  let province = -1
  for (let i = 0; i < state.provinces.count && province < 0; i++) {
    if (state.provinces.controller[i] === idn) province = i
  }

  const invader = state.nations.indexOf('AUS')
  relations.set(idn, invader, Relation.War)

  const war = new WarSystem(state, relations, new DeterministicRandom(5))

  if (withSupply) {
    const supply = new SupplySystem(state, data.land, data.sea)
    supply.recomputeAll()
    war.supply = supply
  }

  const armies = new Map([
    [1, stack(1, invader, province, 5)],
    [2, stack(2, idn, province, 5)],
  ])

  war.tick(armies)

  expect(war.lastReports).toHaveLength(1)
  const report = war.lastReports[0]!

  return { attacker: report.damageToAttacker, defender: report.damageToDefender }
}

function fightWithStance(kind: StanceKind | null): BattleDamage {
  const data = worldData()
  const state = data.toWorldState(1)
  const relations = new Relations(state.nations.count)

  const idn = state.nations.indexOf('IDN')
  let province = -1
  for (let i = 0; i < state.provinces.count && province < 0; i++) {
    if (state.provinces.controller[i] === idn && state.provinces.isCity[i] === 0) province = i
  }

  const invader = state.nations.indexOf('AUS')
  relations.set(idn, invader, Relation.War)

  const supply = new SupplySystem(state, data.land, data.sea)
  supply.recomputeAll()

  const stances = new StanceSystem(state, supply)
  const war = new WarSystem(state, relations, new DeterministicRandom(5))
  war.stances = stances

  const attacker = stack(1, invader, province, 5)
  const defender = stack(2, idn, province, 5)

  if (kind !== null) {
    /* Lewat jendela reorganisasi, kalau tidak sikapnya belum berlaku dan
       ujinya tidak membuktikan apa pun. */
    stances.set(attacker, kind, Terrain.OpenGround)
    state.clock.advanceTo(REORGANISATION_TICKS + 1)
  }

  war.tick(
    new Map([
      [1, attacker],
      [2, defender],
    ]),
  )

  expect(war.lastReports).toHaveLength(1)
  const report = war.lastReports[0]!

  return { attacker: report.damageToAttacker, defender: report.damageToDefender }
}

/* Uji penyambungan: WarSystem sungguhan dengan SupplySystem sungguhan harus
   menghasilkan pertempuran yang berbeda dari yang tanpa keduanya. */
describe('pengubah tempur pada WarSystem sungguhan', () => {
  it('pasokan sampai ke pertempuran sungguhan', () => {
    const plain = fight(false)
    const supplied = fight(true)

    /* Penyerbu tanpa jalur pulang menyerang dengan potongan; garnisun tuan
       rumah tidak. */
    expect(supplied.defender).toBeLessThan(plain.defender)
    expect(supplied.attacker).toBeCloseTo(plain.attacker, 4)
  })

  /* Uji C#-nya hanya menyatakan arahnya, dan arah tetap benar bahkan kalau
     rantai float 32-bit di dalamnya dihitung dalam double. Angka-angka ini
     diambil dengan menjalankan implementasi rujukan, bukan dihitung ulang di
     sini, dan itulah yang menangkap selisihnya. */
  it('kerusakannya cocok dengan implementasi rujukan', () => {
    expect(fight(false)).toEqual({ attacker: f32(6.853655), defender: f32(3.6875608) })
    expect(fight(true)).toEqual({ attacker: f32(6.853655), defender: f32(2.9500484) })
  })

  it('sikap sampai ke pertempuran sungguhan', () => {
    const neutral = fightWithStance(null)
    const assaulting = fightWithStance(StanceKind.Assault)

    expect(assaulting.defender).toBeGreaterThan(neutral.defender)
  })

  it('sikap serbu menaikkan kedua arah kerusakan seperti implementasi rujukan', () => {
    expect(fightWithStance(null)).toEqual({
      attacker: f32(6.853655),
      defender: f32(3.6875608),
    })
    expect(fightWithStance(StanceKind.Assault)).toEqual({
      attacker: f32(7.5390196),
      defender: f32(4.2406945),
    })
  })
})
