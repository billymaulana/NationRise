import { describe, expect, it } from 'vitest'
import { readWorld } from '~/sim/data/WorldFile'
import { Army } from '~/sim/military/Army'
import { hoursFor } from '~/sim/military/MovementCost'
import { MovementSystem } from '~/sim/military/Movement'
import { Pathfinder, type StepCost } from '~/sim/military/Pathfinder'
import { MAIN_BATTLE_TANK, MOTORIZED_INFANTRY, TOWED_ARTILLERY } from '~/sim/military/UnitCatalogue'
import type { UnitClass } from '~/sim/military/UnitClass'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/*
 * Diport dari NationRise.Core.Tests/Military/MovementTests.cs, kecuali
 * DamagedUnitsStillFightButLessWell yang sudah ada di units.test.ts bersama
 * sisa uji UnitInstance.
 */

interface Harness {
  state: WorldState
  finder: Pathfinder
  owned: number[]
}

function build(): Harness {
  const data = readWorld(worldBinary())
  const state = data.toWorldState(1)
  const nation = state.nations.indexOf('IDN')
  const owned: number[] = []

  for (let i = 0; i < state.provinces.count; i++) {
    if (state.provinces.owner[i] === nation) owned.push(i)
  }

  return { state, finder: new Pathfinder(data.land, data.sea, state.provinces.count), owned }
}

function costFor(state: WorldState): StepCost {
  return (_from, to, bySea) => hoursFor(state.provinces.at(to).terrain, bySea)
}

function stack(id: number, province: number, unit: UnitClass): Army {
  const army = new Army(id, 0, province)
  army.add(unit)
  return army
}

describe('MovementSystem', () => {
  it('tumpukan bergerak secepat anggota terlambatnya', () => {
    const army = new Army(1, 0, 0)
    army.add(MAIN_BATTLE_TANK)
    army.add(TOWED_ARTILLERY)

    expect(army.speed).toBeCloseTo(TOWED_ARTILLERY.speed, 3)
  })

  it('pasukan tiba setelah jam yang cukup', () => {
    const { state, finder, owned } = build()
    const army = stack(1, owned[0]!, MOTORIZED_INFANTRY)

    const path = finder.findPath(owned[0]!, owned[5]!, costFor(state))
    expect(path.length).toBeGreaterThanOrEqual(2)

    const movement = new MovementSystem(state)
    const armies = new Map([[army.id, army]])
    movement.order(army, path)

    for (let hour = 0; hour < 500 && movement.isMoving(army.id); hour++) {
      movement.tick(armies)
    }

    expect(army.province).toBe(path[path.length - 1])
    expect(movement.isMoving(army.id)).toBe(false)
  })

  it('pasukan melewati setiap provinsi di jalurnya', () => {
    const { state, finder, owned } = build()
    const army = stack(7, owned[0]!, MOTORIZED_INFANTRY)

    const path = finder.findPath(owned[0]!, owned[4]!, costFor(state))

    const movement = new MovementSystem(state)
    const armies = new Map([[army.id, army]])
    movement.order(army, path)

    const visited = [army.province]
    for (let hour = 0; hour < 500 && movement.isMoving(army.id); hour++) {
      movement.tick(armies)
      if (visited[visited.length - 1] !== army.province) visited.push(army.province)
    }

    expect(visited).toEqual([...path])
  })

  it('perintah harus dimulai di tempat pasukan berada', () => {
    const { state } = build()
    const army = stack(2, 10, MOTORIZED_INFANTRY)
    const movement = new MovementSystem(state)

    expect(() => movement.order(army, [11, 12])).toThrow(RangeError)
  })

  it('tumpukan yang lebih lambat butuh waktu lebih lama', () => {
    const { state, finder, owned } = build()
    const path = finder.findPath(owned[0]!, owned[5]!, costFor(state))

    function hoursToArrive(unit: UnitClass): number {
      const army = stack(1, owned[0]!, unit)
      const movement = new MovementSystem(state)
      const armies = new Map([[army.id, army]])
      movement.order(army, path)

      let hours = 0
      while (movement.isMoving(army.id) && hours < 1000) {
        movement.tick(armies)
        hours++
      }

      return hours
    }

    expect(hoursToArrive(TOWED_ARTILLERY)).toBeGreaterThan(hoursToArrive(MAIN_BATTLE_TANK))
  })

  /*
   * Bukan dari uji C#, melainkan dari menjalankan MovementSystem rujukan pada
   * jalur yang sama. Jumlah jamnya adalah tempat presisi 32 bit terlihat:
   * tiga langkah rimba pada kecepatan 0,9 berjumlah 10,0000005 jam, sehingga
   * kolomnya butuh tick kesebelas untuk tiba. Dihitung dengan double jumlahnya
   * tepat 10 dan uji ini akan menyebut 10.
   */
  it('jumlah jam sampai tiba sama dengan implementasi rujukan', () => {
    const { state, finder, owned } = build()
    const path = finder.findPath(owned[0]!, owned[5]!, costFor(state))

    function hoursToArrive(unit: UnitClass): number {
      const army = stack(1, owned[0]!, unit)
      const movement = new MovementSystem(state)
      const armies = new Map([[army.id, army]])
      movement.order(army, path)

      let hours = 0
      while (movement.isMoving(army.id) && hours < 1000) {
        movement.tick(armies)
        hours++
      }

      return hours
    }

    expect(hoursToArrive(MOTORIZED_INFANTRY)).toBe(11)
    expect(hoursToArrive(TOWED_ARTILLERY)).toBe(15)
    expect(hoursToArrive(MAIN_BATTLE_TANK)).toBe(8)
  })

  it('jalur pendek membatalkan perintah alih-alih menyimpannya', () => {
    const { state, owned } = build()
    const army = stack(3, owned[0]!, MOTORIZED_INFANTRY)
    const movement = new MovementSystem(state)

    movement.order(army, [owned[0]!, owned[1]!])
    expect(movement.pendingOrders).toBe(1)

    movement.order(army, [owned[0]!])
    expect(movement.pendingOrders).toBe(0)
    expect(movement.isMoving(army.id)).toBe(false)
  })

  it('perintah bisa dibatalkan', () => {
    const { state, owned } = build()
    const army = stack(4, owned[0]!, MOTORIZED_INFANTRY)
    const movement = new MovementSystem(state)

    movement.order(army, [owned[0]!, owned[1]!])
    movement.cancel(army.id)

    expect(movement.isMoving(army.id)).toBe(false)
    expect(movement.pendingOrders).toBe(0)
  })

  /* Tumpukan yang hancur di tengah jalan berhenti membebani daftar perintah,
     jika tidak setiap tick sesudahnya menyusuri jalur yang tidak akan pernah
     ditempuh siapa pun. */
  it('pasukan yang hancur melepaskan perintahnya', () => {
    const { state, finder, owned } = build()
    const army = stack(5, owned[0]!, MOTORIZED_INFANTRY)
    const path = finder.findPath(owned[0]!, owned[5]!, costFor(state))

    const movement = new MovementSystem(state)
    movement.order(army, path)

    movement.tick(new Map())

    expect(movement.pendingOrders).toBe(0)
  })
})
