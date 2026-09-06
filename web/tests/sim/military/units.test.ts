import { describe, expect, it } from 'vitest'
import { f32, mulF32 } from '~/sim/determinism/float32'
import { ArmourClass, ARMOUR_CLASS_COUNT } from '~/sim/military/ArmourClass'
import { Army, NEVER_LANDED, UnitInstance } from '~/sim/military/Army'
import { ALL_UNITS, MAIN_BATTLE_TANK, MOTORIZED_INFANTRY, NAVAL_INFANTRY, TOWED_ARTILLERY, unitById } from '~/sim/military/UnitCatalogue'
import { attackAgainst, defenceAgainst, Domain, echelonWeight } from '~/sim/military/UnitClass'

/* Diport dari NationRise.Core/Military. Nilai harapannya diambil dari
   NationRise.Core.dll yang dijalankan langsung, bukan dari pembacaan sumber. */

describe('ArmourClass', () => {
  it('sepuluh kelas lapis baja dengan indeks yang tetap', () => {
    expect(ARMOUR_CLASS_COUNT).toBe(10)
    expect(ArmourClass.Infantry).toBe(0)
    expect(ArmourClass.Population).toBe(9)
  })
})

describe('UnitClass', () => {
  it('eselon depan menyerap tiga kali lipat, eselon dua dua kali', () => {
    expect(echelonWeight(1)).toBe(3)
    expect(echelonWeight(2)).toBe(2)
    expect(echelonWeight(3)).toBe(1)
    expect(echelonWeight(0)).toBe(1)
  })

  it('peringkat dibaca per kelas lapis baja', () => {
    expect(attackAgainst(MAIN_BATTLE_TANK, ArmourClass.Infantry)).toBe(9)
    expect(attackAgainst(MAIN_BATTLE_TANK, ArmourClass.Population)).toBe(1)
    expect(defenceAgainst(MAIN_BATTLE_TANK, ArmourClass.FixedWing)).toBe(f32(0.5))
    expect(attackAgainst(TOWED_ARTILLERY, ArmourClass.Building)).toBe(3)
    expect(defenceAgainst(TOWED_ARTILLERY, ArmourClass.Helicopter)).toBe(0)
  })
})

describe('UnitCatalogue', () => {
  it('tujuh kelas dalam urutan yang tetap', () => {
    expect(ALL_UNITS.map((u) => u.id)).toEqual([
      'motorized_infantry',
      'mechanized_infantry',
      'main_battle_tank',
      'towed_artillery',
      'naval_infantry',
      'corvette',
      'destroyer',
    ])
  })

  it('nilai kartu unit sesuai riset', () => {
    expect(MOTORIZED_INFANTRY.maxHitPoints).toBe(15)
    expect(MOTORIZED_INFANTRY.speed).toBe(f32(0.9))
    expect(MOTORIZED_INFANTRY.domain).toBe(Domain.Land)
    expect(MOTORIZED_INFANTRY.armour).toBe(ArmourClass.Infantry)
    expect(MOTORIZED_INFANTRY.echelon).toBe(1)

    expect(TOWED_ARTILLERY.armour).toBe(ArmourClass.UnarmouredVehicle)
    expect(TOWED_ARTILLERY.echelon).toBe(3)
    expect(TOWED_ARTILLERY.speed).toBe(f32(0.6))

    expect(unitById('destroyer').domain).toBe(Domain.Sea)
    expect(unitById('destroyer').maxHitPoints).toBe(45)
  })

  it('setiap unit punya peringkat untuk kesepuluh kelas', () => {
    for (const unit of ALL_UNITS) {
      expect(unit.attack.length).toBe(ARMOUR_CLASS_COUNT)
      expect(unit.defence.length).toBe(ARMOUR_CLASS_COUNT)
    }
  })

  it('id yang tidak dikenal ditolak, bukan dikembalikan kosong', () => {
    expect(() => unitById('nope')).toThrow(/nope/)
  })
})

describe('Army', () => {
  it('pasukan kosong sudah hancur dan tidak bergerak', () => {
    const army = new Army(1, 2, 3)

    expect(army.count).toBe(0)
    expect(army.isDestroyed).toBe(true)
    expect(army.speed).toBe(0)
    expect(army.hitPoints).toBe(0)
    expect(army.maxHitPoints).toBe(0)
    expect(army.health).toBe(0)
    expect(army.landedOnTick).toBe(NEVER_LANDED)
  })

  it('tumpukan bergerak secepat anggota terlambatnya', () => {
    const army = new Army(1, 0, 0)
    army.add(MAIN_BATTLE_TANK)
    army.add(TOWED_ARTILLERY)
    army.add(MOTORIZED_INFANTRY)

    expect(army.count).toBe(3)
    expect(army.speed).toBe(f32(0.6))
    expect(army.hitPoints).toBe(72)
    expect(army.maxHitPoints).toBe(72)
    expect(army.health).toBe(1)
  })

  it('kerusakan menurunkan kesehatan tumpukan', () => {
    const army = new Army(1, 0, 0)
    army.add(MAIN_BATTLE_TANK)
    army.add(TOWED_ARTILLERY)
    army.add(MOTORIZED_INFANTRY)

    army.units[0]!.applyDamage(10)

    expect(army.hitPoints).toBe(62)
    expect(army.health).toBe(f32(62 / 72))
  })

  it('unit yang habis dibuang dan artileri berhenti memperlambat', () => {
    const army = new Army(1, 0, 0)
    army.add(MAIN_BATTLE_TANK)
    army.add(TOWED_ARTILLERY)
    army.add(MOTORIZED_INFANTRY)

    army.units[0]!.applyDamage(10)
    army.units[1]!.applyDamage(1000)
    army.removeDestroyed()

    expect(army.count).toBe(2)
    expect(army.speed).toBe(f32(0.9))
    expect(army.hitPoints).toBe(50)
  })

  /*
   * LINQ Sum untuk float menjumlahkan dalam double lalu memotong sekali ke
   * float di akhir. Menjumlahkan langkah demi langkah dalam float32 memberi
   * 566,99994 di sini, bukan 567 seperti implementasi rujukan.
   */
  it('menjumlahkan hit point seperti LINQ Sum, bukan per langkah', () => {
    const army = new Army(1, 0, 0)
    for (let i = 0; i < 30; i++) army.add(NAVAL_INFANTRY)
    for (const unit of army.units) unit.applyDamage(f32(0.1))

    expect(army.units[0]!.hitPoints).toBe(f32(18.9))
    expect(army.hitPoints).toBe(567)
    expect(army.maxHitPoints).toBe(570)
    expect(army.health).toBe(f32(567 / 570))
  })
})

/* Diport dari NationRise.Core.Tests/Military/MovementTests.cs
   (DamagedUnitsStillFightButLessWell). */
describe('UnitInstance', () => {
  it('unit rusak tetap bertempur tapi kurang baik', () => {
    const unit = new UnitInstance(MAIN_BATTLE_TANK)
    expect(unit.healthPenalty).toBeCloseTo(1, 3)

    unit.applyDamage(unit.unitClass.maxHitPoints)
    expect(unit.healthPenalty).toBeCloseTo(0.25, 3)
    expect(unit.hitPoints).toBe(0)
  })

  it('kerusakan tidak pernah menembus nol', () => {
    const unit = new UnitInstance(TOWED_ARTILLERY)
    unit.applyDamage(1000)

    expect(unit.hitPoints).toBe(0)
  })

  it('hukuman kesehatan turun linear dari satu ke seperempat', () => {
    const unit = new UnitInstance(MAIN_BATTLE_TANK)

    unit.hitPoints = mulF32(MAIN_BATTLE_TANK.maxHitPoints, f32(0.5))
    expect(unit.healthPenalty).toBe(f32(0.625))

    unit.hitPoints = mulF32(MAIN_BATTLE_TANK.maxHitPoints, f32(0.2))
    expect(unit.healthPenalty).toBe(f32(0.4))
  })
})
