import { beforeEach, describe, expect, it } from 'vitest'
import { CityBuildings } from '~/sim/buildings/CityBuildings'
import { readWorld } from '~/sim/data/WorldFile'
import { Relation, Relations } from '~/sim/diplomacy/Relation'
import { EconomyTick } from '~/sim/economy/EconomyTick'
import { Resource } from '~/sim/economy/Resource'
import { Stockpile } from '~/sim/economy/Stockpile'
import { UpkeepSystem } from '~/sim/economy/Upkeep'
import { Army } from '~/sim/military/Army'
import { MAIN_BATTLE_TANK, MOTORIZED_INFANTRY } from '~/sim/military/UnitCatalogue'
import {
  captureSave,
  CURRENT_VERSION,
  readSave,
  restoreSave,
  SaveFileError,
  writeSave,
  type SaveState,
} from '~/sim/persistence/SaveFile'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Persistence/SaveFileTests.cs. */

interface Harness {
  state: WorldState
  stock: Stockpile
  relations: Relations
  armies: Map<number, Army>
}

function fresh(): Harness {
  const state = readWorld(worldBinary()).toWorldState(20260906)

  return {
    state,
    stock: new Stockpile(state.nations.count),
    relations: new Relations(state.nations.count),
    armies: new Map<number, Army>(),
  }
}

function roundTrip(original: SaveState): SaveState {
  return readSave(writeSave(original))
}

function hex(buffer: ArrayBuffer): string {
  let out = ''
  for (const byte of new Uint8Array(buffer)) out += byte.toString(16).padStart(2, '0')
  return out
}

let harness: Harness

beforeEach(() => {
  harness = fresh()
})

describe('putaran simpan-muat', () => {
  it('permainan kosong bertahan', () => {
    const { state, stock, relations, armies } = harness
    const saved = captureSave(state, stock, relations, armies, 0)
    const loaded = roundTrip(saved)

    expect(loaded.seed).toBe(saved.seed)
    expect(loaded.tick).toBe(saved.tick)
    expect(loaded.controller.length).toBe(saved.controller.length)
  })

  it('kepemilikan dan moral bertahan', () => {
    const { state, stock, relations, armies } = harness
    state.provinces.controller[5] = 42
    state.provinces.morale[5] = 0.31

    const loaded = roundTrip(captureSave(state, stock, relations, armies, 0))

    expect(loaded.controller[5]).toBe(42)
    expect(loaded.morale[5]).toBeCloseTo(0.31, 3)
  })

  it('cadangan bertahan', () => {
    const { state, stock, relations, armies } = harness
    stock.add(7, Resource.Food, 4321)
    stock.add(7, Resource.Technology, 99)

    const loaded = roundTrip(captureSave(state, stock, relations, armies, 7))

    const restored = new Stockpile(state.nations.count)
    restoreSave(loaded, state, restored, relations, armies)

    expect(restored.get(7, Resource.Food)).toBe(4321)
    expect(restored.get(7, Resource.Technology)).toBe(99)
  })

  it('perang bertahan', () => {
    const { state, stock, relations, armies } = harness
    relations.set(3, 9, Relation.War)
    relations.set(11, 40, Relation.War)

    const loaded = roundTrip(captureSave(state, stock, relations, armies, 0))

    const restored = new Relations(state.nations.count)
    restoreSave(loaded, state, new Stockpile(state.nations.count), restored, armies)

    expect(restored.atWar(3, 9)).toBe(true)
    expect(restored.atWar(11, 40)).toBe(true)
    expect(restored.atWar(3, 11)).toBe(false)
  })

  it('pasukan bertahan beserta kerusakannya', () => {
    const { state, stock, relations, armies } = harness
    const army = new Army(3, 5, 77)
    army.add(MAIN_BATTLE_TANK)
    army.add(MOTORIZED_INFANTRY)
    army.units[0]!.applyDamage(12)
    armies.set(3, army)

    const loaded = roundTrip(captureSave(state, stock, relations, armies, 0))

    const restored = new Map<number, Army>()
    restoreSave(
      loaded,
      state,
      new Stockpile(state.nations.count),
      new Relations(state.nations.count),
      restored,
    )

    expect(restored.size).toBe(1)
    const back = restored.get(3)!
    expect(back.nation).toBe(5)
    expect(back.province).toBe(77)
    expect(back.count).toBe(2)
    expect(back.units[0]!.hitPoints).toBeCloseTo(33, 2)
  })

  /* Pasukan yang sudah habis unitnya tidak ikut disimpan; memuatnya kembali
     akan menghidupkan tumpukan kosong yang hanya menagih upkeep. */
  it('pasukan yang hancur tidak ikut tersimpan', () => {
    const { state, stock, relations, armies } = harness
    armies.set(1, new Army(1, 0, 0))

    const saved = captureSave(state, stock, relations, armies, 0)

    expect(saved.armies).toHaveLength(0)
  })
})

describe('determinisme lintas simpanan', () => {
  /* Inti dari simulasi deterministik adalah simpanan yang melanjutkan tepat di
     tempat ia berhenti. Bila ini menyimpang, putar ulang dan penelusuran galat
     sama-sama berhenti bekerja. */
  it('simpanan melanjutkan ke dunia yang identik', () => {
    const { state, stock, relations, armies } = harness
    const economy = new EconomyTick(state, stock)
    for (let i = 0; i < state.provinces.count; i++) {
      economy.assignResource(i, Resource.Food)
    }

    for (let day = 0; day < 5; day++) {
      economy.runDay()
      for (let hour = 0; hour < 24; hour++) state.clock.advance()
    }

    const moneyBefore = stock.get(0, Resource.Money)
    const loaded = roundTrip(captureSave(state, stock, relations, armies, 0))

    const next = fresh()
    restoreSave(loaded, next.state, next.stock, next.relations, next.armies)

    expect(next.state.clock.tick).toBe(state.clock.tick)
    expect(next.stock.get(0, Resource.Money)).toBe(moneyBefore)
    expect(next.state.victoryPointsOf(0)).toBe(state.victoryPointsOf(0))
  })

  /* Memuat ke dunia yang sudah berjalan melewati titik simpan adalah kejadian
     biasa di permainan yang berjalan, dan dulu ia melempar. */
  it('simpanan bisa dimuat ke dunia yang sudah berjalan lebih jauh', () => {
    const { state, stock, relations, armies } = harness
    for (let i = 0; i < 72; i++) state.clock.advance()

    const saved = roundTrip(captureSave(state, stock, relations, armies, 0))

    for (let i = 0; i < 48; i++) state.clock.advance()

    expect(state.clock.tick).toBe(120)
    restoreSave(saved, state, stock, relations, armies)
    expect(state.clock.tick).toBe(72)
  })

  /* Seluruh disiplin float32 dan pembulatan ada supaya yang ini benar:
     melanjutkan dari simpanan harus memberi angka yang sama persis dengan tidak
     pernah menyimpan sama sekali. Ekonomi dan upkeep dijalankan bersama supaya
     pasukan yang dipulihkan ikut menentukan hasilnya. */
  it('lanjutan dari simpanan sama persis dengan tanpa menyimpan', () => {
    function harnessWithArmy(): Harness & { economy: EconomyTick; upkeep: UpkeepSystem } {
      const base = fresh()
      const nation = base.state.nations.indexOf('IDN')
      const economy = new EconomyTick(base.state, base.stock)
      for (let i = 0; i < base.state.provinces.count; i++) {
        economy.assignResource(i, Resource.Food)
      }

      const army = new Army(1, nation, 0)
      army.add(MAIN_BATTLE_TANK)
      army.add(MOTORIZED_INFANTRY)
      base.armies.set(1, army)

      return {
        ...base,
        economy,
        upkeep: new UpkeepSystem(base.state, base.stock, new CityBuildings(base.state, base.stock)),
      }
    }

    function runDays(
      run: { state: WorldState; economy: EconomyTick; upkeep: UpkeepSystem; armies: Map<number, Army> },
      days: number,
    ): void {
      for (let day = 0; day < days; day++) {
        run.economy.runDay()
        run.upkeep.runDay(run.armies)
        for (let hour = 0; hour < 24; hour++) run.state.clock.advance()
      }
    }

    const straight = harnessWithArmy()
    runDays(straight, 5)

    const saved = roundTrip(
      captureSave(straight.state, straight.stock, straight.relations, straight.armies, 0),
    )
    runDays(straight, 5)

    const resumed = harnessWithArmy()
    restoreSave(saved, resumed.state, resumed.stock, resumed.relations, resumed.armies)
    runDays(resumed, 5)

    expect(resumed.state.clock.tick).toBe(straight.state.clock.tick)
    expect([...resumed.state.provinces.morale]).toEqual([...straight.state.provinces.morale])
    expect([...resumed.state.provinces.controller]).toEqual([
      ...straight.state.provinces.controller,
    ])

    const nation = resumed.state.nations.indexOf('IDN')
    for (const resource of [Resource.Money, Resource.Food, Resource.Fuel, Resource.Materials]) {
      expect(resumed.stock.get(nation, resource)).toBe(straight.stock.get(nation, resource))
    }

    expect(resumed.armies.get(1)!.hitPoints).toBe(straight.armies.get(1)!.hitPoints)
  })

  it('seluruh medan pulih apa adanya', () => {
    const { state, stock, relations, armies } = harness
    state.provinces.controller[2] = 11
    state.provinces.morale[2] = 0.42
    stock.add(1, Resource.Fuel, 777)
    relations.set(0, 4, Relation.War)
    const army = new Army(9, 1, 30)
    army.add(MOTORIZED_INFANTRY)
    army.units[0]!.applyDamage(2.5)
    armies.set(9, army)
    for (let i = 0; i < 13; i++) state.clock.advance()

    const saved = captureSave(state, stock, relations, armies, 3)
    const loaded = roundTrip(saved)

    expect(loaded.seed).toBe(saved.seed)
    expect(loaded.tick).toBe(saved.tick)
    expect(loaded.playerNation).toBe(saved.playerNation)
    expect(loaded.nationCount).toBe(saved.nationCount)
    expect([...loaded.controller]).toEqual([...saved.controller])
    expect([...loaded.morale]).toEqual([...saved.morale])
    expect([...loaded.stockpiles]).toEqual([...saved.stockpiles])
    expect(loaded.wars).toEqual(saved.wars)
    expect(loaded.armies).toEqual(saved.armies)
  })

  /* Seed yang hilang berarti simpanan tidak bisa diputar ulang sama sekali,
     jadi ia disimpan sebagai 64 bit penuh, bukan diperas ke double. */
  it('seed 64 bit bertahan tanpa kehilangan bit', () => {
    const { state, stock, relations, armies } = harness
    const saved = captureSave(state, stock, relations, armies, 0)
    const wide: SaveState = { ...saved, seed: 0xfedcba9876543210n }

    expect(roundTrip(wide).seed).toBe(0xfedcba9876543210n)
  })
})

describe('berkas rusak', () => {
  it('magic yang salah ditolak', () => {
    expect(() => readSave(new ArrayBuffer(64))).toThrow(SaveFileError)
  })

  it('versi yang tidak didukung ditolak', () => {
    const { state, stock, relations, armies } = harness
    const bytes = new Uint8Array(writeSave(captureSave(state, stock, relations, armies, 0)))
    new DataView(bytes.buffer).setUint16(4, CURRENT_VERSION + 1, true)

    expect(() => readSave(bytes.buffer)).toThrow(SaveFileError)
  })

  it('berkas terpotong ditolak', () => {
    const { state, stock, relations, armies } = harness
    const bytes = new Uint8Array(writeSave(captureSave(state, stock, relations, armies, 0)))

    expect(() => readSave(bytes.buffer.slice(0, 40))).toThrow(SaveFileError)
  })

  it('ukuran peta yang tidak cocok ditolak', () => {
    const { state, stock, relations, armies } = harness
    const saved = captureSave(state, stock, relations, armies, 0)
    const wrongSize: SaveState = {
      ...saved,
      controller: new Uint16Array(10),
      morale: new Float32Array(10),
    }

    expect(() => restoreSave(wrongSize, state, stock, relations, armies)).toThrow(SaveFileError)
  })
})

/*
 * Bita harapan diambil dengan menjalankan SaveFile.Write versi C# atas state
 * yang sama. Format simpanan adalah kontrak lintas dua implementasi; tanpa
 * pemakuan ini, satu tipe bilangan yang bergeser diam-diam membuat simpanan
 * lama tidak bisa dibaca dan tidak ada uji yang menyadarinya.
 */
describe('kesetaraan bita dengan implementasi rujukan', () => {
  const GOLDEN =
    '5653524e0100efcdab896745230139300000000000000700030000000300ffff00003333333f52b89e3e0000803f0200' +
    '000048f4ffffffffffff30f8ffffffffffff18fcffffffffffff0000000000000000e803000000000000d00700000000' +
    '0000b80b000000000000a00f00000000000088130000000000007017000000000000581b000000000000401f00000000' +
    '000028230000000000001027000000000000020000000000000001000000030000000900000002000000030000000500' +
    '4d00000002000000106d61696e5f626174746c655f74616e6b00000442126d6f746f72697a65645f696e66616e747279' +
    '000070410400000001000200000000000000'

  function sample(): SaveState {
    const stockpiles = new Float64Array(14)
    for (let i = 0; i < stockpiles.length; i++) stockpiles[i] = i * 1000 - 3000

    return {
      seed: 0x0123456789abcdefn,
      tick: 12345,
      playerNation: 7,
      controller: Uint16Array.from([3, 65535, 0]),
      morale: Float32Array.from([0.7, 0.31, 1]),
      nationCount: 2,
      stockpiles,
      wars: [
        { a: 0, b: 1 },
        { a: 3, b: 9 },
      ],
      armies: [
        {
          id: 3,
          nation: 5,
          province: 77,
          units: [
            { classId: 'main_battle_tank', hitPoints: 33 },
            { classId: 'motorized_infantry', hitPoints: 15 },
          ],
        },
        { id: 4, nation: 1, province: 2, units: [] },
      ],
    }
  }

  it('menulis bita yang identik', () => {
    expect(hex(writeSave(sample()))).toBe(GOLDEN)
  })

  it('membaca kembali bita rujukan', () => {
    const bytes = new Uint8Array(GOLDEN.length / 2)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Number.parseInt(GOLDEN.slice(i * 2, i * 2 + 2), 16)
    }

    const loaded = readSave(bytes.buffer)
    const expected = sample()

    expect(loaded.seed).toBe(expected.seed)
    expect(loaded.tick).toBe(expected.tick)
    expect(loaded.playerNation).toBe(expected.playerNation)
    expect([...loaded.controller]).toEqual([...expected.controller])
    expect([...loaded.morale]).toEqual([...expected.morale])
    expect(loaded.nationCount).toBe(expected.nationCount)
    expect([...loaded.stockpiles]).toEqual([...expected.stockpiles])
    expect(loaded.wars).toEqual(expected.wars)
    expect(loaded.armies).toEqual(expected.armies)
  })
})
