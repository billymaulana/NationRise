import { describe, expect, it } from 'vitest'
import { readWorld } from '~/sim/data/WorldFile'
import { Relation, Relations } from '~/sim/diplomacy/Relation'
import { ArmyPolicy, CEILING, PER_CITY, STANDING } from '~/sim/military/ArmyPolicy'
import { NO_OWNER } from '~/sim/world/ProvinceStore'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/*
 * Diport dari NationRise.Core.Tests/Military/ArmyPolicyTests.cs.
 *
 * Dunia dulu hanya memuat 400 tumpukan di antara 247 negara karena hanya negara
 * yang sudah berperang yang mengangkat tentara. Uji ini memegang penggantinya
 * pada sifat yang penting: siapa pun yang memegang tanah memelihara pasukan.
 */

interface Harness {
  state: WorldState
  relations: Relations
  policy: ArmyPolicy
}

function setup(): Harness {
  const state = readWorld(worldBinary()).toWorldState(1)
  const relations = new Relations(state.nations.count)

  return { state, relations, policy: new ArmyPolicy(state, relations) }
}

describe('ArmyPolicy', () => {
  it('negara dalam damai tetap memelihara pasukan', () => {
    const { state, policy } = setup()
    const idn = state.nations.indexOf('IDN')

    expect(policy.targetFor(idn)).toBeGreaterThan(0)
    expect(policy.wantsMore(idn, 0)).toBe(true)
  })

  it('setiap negara yang memegang tanah menginginkan sesuatu', () => {
    const { state, policy } = setup()

    const landed = new Set<number>()
    for (let i = 0; i < state.provinces.count; i++) {
      const controller = state.provinces.controller[i]!
      if (controller < state.nations.count) landed.add(controller)
    }

    expect(landed.size).toBeGreaterThan(100)
    for (const nation of landed) {
      expect(policy.targetFor(nation)).toBeGreaterThanOrEqual(STANDING)
    }
  })

  it('negara tanpa tanah tidak menginginkan apa pun', () => {
    const { state, policy } = setup()
    const idn = state.nations.indexOf('IDN')
    const conqueror = state.nations.indexOf('AUS')

    for (let i = 0; i < state.provinces.count; i++) {
      if (state.provinces.controller[i] === idn) state.provinces.controller[i] = conqueror
    }

    expect(policy.targetFor(idn)).toBe(0)
    expect(policy.wantsMore(idn, 0)).toBe(false)
  })

  it('lebih banyak kota berarti pasukan yang diinginkan lebih besar', () => {
    const { state, policy } = setup()
    const idn = state.nations.indexOf('IDN')
    const before = policy.targetFor(idn)

    let added = 0
    for (let i = 0; i < state.provinces.count && added < 3; i++) {
      if (state.provinces.controller[i] === idn && state.provinces.isCity[i] === 0) {
        state.provinces.isCity[i] = 1
        added++
      }
    }

    expect(added).toBe(3)
    expect(policy.targetFor(idn)).toBe(before + 3 * PER_CITY)
  })

  it('perang menaikkan niat, bukan menciptakannya', () => {
    const { state, relations, policy } = setup()
    const idn = state.nations.indexOf('IDN')
    const aus = state.nations.indexOf('AUS')

    const peace = policy.targetFor(idn)
    relations.set(idn, aus, Relation.War)
    const war = policy.targetFor(idn)

    expect(peace).toBeGreaterThan(0)
    expect(war).toBeGreaterThan(peace)
  })

  /* Tanpa langit-langit, kekaisaran terbesar sendirian akan mengeluarkan
     seluruh dunia dari pasar. */
  it('negara terbesar dibatasi langit-langit', () => {
    const { state, policy } = setup()

    for (let nation = 0; nation < state.nations.count; nation++) {
      expect(policy.targetFor(nation)).toBeGreaterThanOrEqual(0)
      expect(policy.targetFor(nation)).toBeLessThanOrEqual(CEILING)
    }
  })

  /* Bukan dari uji C#, melainkan dari menjalankan ArmyPolicy rujukan pada
     world.bin yang sama: dua belas kota dan lima puluh empat provinsi. */
  it('angka Indonesia sama dengan implementasi rujukan', () => {
    const { state, relations, policy } = setup()
    const idn = state.nations.indexOf('IDN')
    const aus = state.nations.indexOf('AUS')

    expect(policy.targetFor(idn)).toBe(48)

    relations.set(idn, aus, Relation.War)
    expect(policy.targetFor(idn)).toBe(CEILING)
  })

  /*
   * Selera perang memotong ke arah nol, bukan membulat. Sepuluh kota di lima
   * belas provinsi memberi niat damai 35, dan 35 kali 1,7 adalah tepat 59,5:
   * pembulatan akan menyebut 60 dan menyentuh langit-langit, pemotongan
   * menyebut 59. Nilainya diambil dari implementasi rujukan.
   */
  it('selera perang memotong pecahannya, bukan membulatkannya', () => {
    const { state, relations, policy } = setup()
    const idn = state.nations.indexOf('IDN')
    const aus = state.nations.indexOf('AUS')

    state.provinces.controller.fill(NO_OWNER)
    state.provinces.isCity.fill(0)

    for (let i = 0; i < 15; i++) {
      state.provinces.controller[i] = idn
      state.provinces.isCity[i] = i < 10 ? 1 : 0
    }

    expect(policy.targetFor(idn)).toBe(35)

    relations.set(idn, aus, Relation.War)
    expect(policy.targetFor(idn)).toBe(59)
    expect(policy.targetFor(aus)).toBe(0)
  })

  it('negara negatif ditolak', () => {
    const { policy } = setup()

    expect(() => policy.targetFor(-1)).toThrow(RangeError)
  })
})
