import { f32 } from '~/sim/determinism/float32'
import { ArmourClass, ARMOUR_CLASS_COUNT } from '~/sim/military/ArmourClass'
import { Domain, type UnitClass } from '~/sim/military/UnitClass'

/*
 * Daftar awal dengan nilai dari riset unit. Masih di dalam kode karena angkanya
 * belum berhenti bergerak; begitu mengendap ia menjadi berkas data yang
 * dikeluarkan pipeline seperti yang lain.
 */

interface Ratings {
  infantry?: number
  armour?: number
  vehicle?: number
  helicopter?: number
  fixedWing?: number
  missile?: number
  ship?: number
  submarine?: number
  building?: number
  population?: number
}

function ratings(values: Ratings): Float32Array {
  const out = new Float32Array(ARMOUR_CLASS_COUNT)

  out[ArmourClass.Infantry] = values.infantry ?? 0
  out[ArmourClass.Armour] = values.armour ?? 0
  out[ArmourClass.UnarmouredVehicle] = values.vehicle ?? 0
  out[ArmourClass.Helicopter] = values.helicopter ?? 0
  out[ArmourClass.FixedWing] = values.fixedWing ?? 0
  out[ArmourClass.Missile] = values.missile ?? 0
  out[ArmourClass.SurfaceShip] = values.ship ?? 0
  out[ArmourClass.Submarine] = values.submarine ?? 0
  out[ArmourClass.Building] = values.building ?? 0
  out[ArmourClass.Population] = values.population ?? 0

  return out
}

export const MOTORIZED_INFANTRY: UnitClass = {
  id: 'motorized_infantry',
  name: 'Motorized Infantry',
  domain: Domain.Land,
  armour: ArmourClass.Infantry,
  maxHitPoints: 15,
  speed: f32(0.9),
  echelon: 1,
  attack: ratings({ infantry: 3.0, armour: 2.0, vehicle: 3.0, building: 0.1, population: 2.0 }),
  defence: ratings({ infantry: 3.8, armour: 2.5, vehicle: 3.8, helicopter: 0.6, fixedWing: 0.3 }),
}

export const MECHANIZED_INFANTRY: UnitClass = {
  id: 'mechanized_infantry',
  name: 'Mechanized Infantry',
  domain: Domain.Land,
  armour: ArmourClass.Armour,
  maxHitPoints: 25,
  speed: f32(1.1),
  echelon: 1,
  attack: ratings({ infantry: 3.0, armour: 5.0, vehicle: 5.0, building: 0.2, population: 1.5 }),
  defence: ratings({ infantry: 3.8, armour: 6.3, vehicle: 6.3, helicopter: 0.9, fixedWing: 0.4 }),
}

export const MAIN_BATTLE_TANK: UnitClass = {
  id: 'main_battle_tank',
  name: 'Main Battle Tank',
  domain: Domain.Land,
  armour: ArmourClass.Armour,
  maxHitPoints: 45,
  speed: f32(1.2),
  echelon: 1,
  attack: ratings({ infantry: 9.0, armour: 8.0, vehicle: 9.0, building: 0.5, population: 1.0 }),
  defence: ratings({ infantry: 9.0, armour: 8.0, vehicle: 9.0, helicopter: 1.0, fixedWing: 0.5 }),
}

export const TOWED_ARTILLERY: UnitClass = {
  id: 'towed_artillery',
  name: 'Towed Artillery',
  domain: Domain.Land,
  armour: ArmourClass.UnarmouredVehicle,
  maxHitPoints: 12,
  speed: f32(0.6),
  echelon: 3,
  attack: ratings({ infantry: 7.0, armour: 4.0, vehicle: 7.0, building: 3.0, population: 4.0 }),
  defence: ratings({ infantry: 1.5, armour: 1.0, vehicle: 1.5 }),
}

export const NAVAL_INFANTRY: UnitClass = {
  id: 'naval_infantry',
  name: 'Naval Infantry',
  domain: Domain.Land,
  armour: ArmourClass.Infantry,
  maxHitPoints: 19,
  speed: f32(0.95),
  echelon: 1,
  attack: ratings({ infantry: 6.0, armour: 3.0, vehicle: 6.0, building: 0.2, population: 2.0 }),
  defence: ratings({ infantry: 5.0, armour: 3.0, vehicle: 5.0, helicopter: 0.8, fixedWing: 0.4 }),
}

export const CORVETTE: UnitClass = {
  id: 'corvette',
  name: 'Corvette',
  domain: Domain.Sea,
  armour: ArmourClass.SurfaceShip,
  maxHitPoints: 30,
  speed: f32(2.2),
  echelon: 1,
  attack: ratings({ ship: 6.0, submarine: 4.0, infantry: 2.0, building: 1.0 }),
  defence: ratings({ ship: 6.0, submarine: 3.0, fixedWing: 2.5, missile: 1.5 }),
}

export const DESTROYER: UnitClass = {
  id: 'destroyer',
  name: 'Destroyer',
  domain: Domain.Sea,
  armour: ArmourClass.SurfaceShip,
  maxHitPoints: 45,
  speed: f32(2.6),
  echelon: 1,
  attack: ratings({ ship: 9.0, submarine: 7.0, infantry: 3.0, building: 2.0 }),
  defence: ratings({ ship: 9.0, submarine: 6.0, fixedWing: 4.0, missile: 3.0 }),
}

export const ALL_UNITS: readonly UnitClass[] = [
  MOTORIZED_INFANTRY,
  MECHANIZED_INFANTRY,
  MAIN_BATTLE_TANK,
  TOWED_ARTILLERY,
  NAVAL_INFANTRY,
  CORVETTE,
  DESTROYER,
]

export function unitById(id: string): UnitClass {
  const found = ALL_UNITS.find((unit) => unit.id === id)
  if (found === undefined) {
    throw new Error(`Unknown unit class '${id}'.`)
  }

  return found
}
