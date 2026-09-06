import { describe, expect, it } from 'vitest'
import { readWorld, type WorldData } from '~/sim/data/WorldFile'
import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { addF32, divF32, f32, mulF32, subF32 } from '~/sim/determinism/float32'
import { Army } from '~/sim/military/Army'
import { Combat } from '~/sim/military/Combat'
import {
  attackMultiplier,
  damageTakenMultiplier,
  DAILY_ENTRENCHMENT,
  entrenchmentCap,
  entrenchmentDamageTaken,
  entrenches,
  maxDugHours,
  RAID_SUPPLY_TICKS,
  REORGANISATION_TICKS,
  SCREEN_WITHDRAWAL_HEALTH,
  speedMultiplier,
  StanceKind,
  StanceSystem,
  ASSAULT_ATTACK,
  ASSAULT_ROUGH_TERRAIN_ATTACK,
} from '~/sim/military/Stance'
import { GRACE_TICKS, SupplyStatus, SupplySystem } from '~/sim/military/SupplySystem'
import { MAIN_BATTLE_TANK, MOTORIZED_INFANTRY } from '~/sim/military/UnitCatalogue'
import type { UnitClass } from '~/sim/military/UnitClass'
import { Terrain } from '~/sim/world/Terrain'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Military/StanceTests.cs. */

interface Fixture {
  readonly data: WorldData
  readonly state: WorldState
  readonly supply: SupplySystem
  readonly stances: StanceSystem
  readonly nation: number
}

const ALL_STANCES = Object.values(StanceKind).filter(
  (value): value is StanceKind => typeof value === 'number',
)

let cached: WorldData | null = null

function worldData(): WorldData {
  cached ??= readWorld(worldBinary())
  return cached
}

function build(): Fixture {
  const data = worldData()
  const state = data.toWorldState(1)
  const supply = new SupplySystem(state, data.land, data.sea)

  return {
    data,
    state,
    supply,
    stances: new StanceSystem(state, supply),
    nation: state.nations.indexOf('IDN'),
  }
}

function advance(f: Fixture, hours: number): void {
  for (let i = 0; i < hours; i++) {
    f.state.clock.advance()
    f.stances.tick()
  }
}

function provinceOf(f: Fixture, city: boolean): number {
  for (let i = 0; i < f.state.provinces.count; i++) {
    if (
      f.state.provinces.controller[i] === f.nation &&
      (f.state.provinces.isCity[i] !== 0) === city &&
      f.supply.statusOf(i) === SupplyStatus.Supplied
    ) {
      return i
    }
  }

  throw new Error(`tidak ada provinsi Indonesia tersuplai dengan isCity=${city}.`)
}

function field(f: Fixture): number {
  return provinceOf(f, false)
}

function city(f: Fixture): number {
  return provinceOf(f, true)
}

function stack(id: number, nation: number, province: number, ...units: UnitClass[]): Army {
  const army = new Army(id, nation, province)
  for (const unit of units) army.add(unit)
  return army
}

function rifles(f: Fixture, id: number, province: number, count = 1): Army {
  const units = new Array<UnitClass>(count).fill(MOTORIZED_INFANTRY)
  return stack(id, f.nation, province, ...units)
}

function holdsACity(f: Fixture, nation: number): boolean {
  for (let i = 0; i < f.state.provinces.count; i++) {
    if (f.state.provinces.isCity[i] !== 0 && f.state.provinces.controller[i] === nation) return true
  }

  return false
}

function invaderFarFrom(f: Fixture, province: number): number {
  const neighbours: number[] = []
  for (const neighbour of f.data.land.neighboursOf(province)) neighbours.push(neighbour)
  for (const neighbour of f.data.sea.neighboursOf(province)) neighbours.push(neighbour)

  for (let nation = 0; nation < f.state.nations.count; nation++) {
    if (nation === f.nation || !holdsACity(f, nation)) continue
    if (neighbours.some((n) => f.state.provinces.controller[n] === nation)) continue

    return nation
  }

  throw new Error(`setiap negara berkota bertetangga dengan provinsi ${province}.`)
}

/* Menyerahkan sebuah provinsi kepada negara yang tidak memegang tanah di
   dekatnya memutusnya dari setiap kota negara itu, dan itulah satu-satunya cara
   mencapai kedudukan yang benar-benar tanpa pasokan di peta yang mulai utuh. */
function sever(f: Fixture): { province: number; invader: number } {
  const province = field(f)
  const invader = invaderFarFrom(f, province)

  f.state.provinces.controller[province] = invader
  f.supply.onControlChanged(f.nation, invader)

  return { province, invader }
}

function damage(army: Army, amount: number): void {
  if (army.count === 0) return

  const share = divF32(amount, army.count)
  for (const unit of army.units) unit.applyDamage(share)
}

describe('StanceSystem', () => {
  it('tiap sikap membawa pengali yang dikunci riset', () => {
    expect(ALL_STANCES).toHaveLength(6)

    expect(attackMultiplier(StanceKind.Assault)).toBeCloseTo(1.15, 4)
    expect(damageTakenMultiplier(StanceKind.Assault)).toBeCloseTo(1.1, 4)

    expect(attackMultiplier(StanceKind.Hold)).toBeCloseTo(1, 4)
    expect(damageTakenMultiplier(StanceKind.Hold)).toBeCloseTo(1, 4)
    expect(entrenchmentCap(StanceKind.Hold)).toBeCloseTo(1, 4)

    expect(entrenchmentCap(StanceKind.Ambush)).toBeCloseTo(0.5, 4)

    expect(attackMultiplier(StanceKind.Screen)).toBeCloseTo(0.7, 4)
    expect(damageTakenMultiplier(StanceKind.Screen)).toBeCloseTo(0.8, 4)

    expect(attackMultiplier(StanceKind.Raid)).toBeCloseTo(0.8, 4)
    expect(speedMultiplier(StanceKind.Raid)).toBeCloseTo(1.2, 4)

    for (const kind of ALL_STANCES) {
      if (kind !== StanceKind.Raid) expect(speedMultiplier(kind)).toBeCloseTo(1, 4)
    }
  })

  it('setiap sikap sampai ke pasukan yang mengambilnya', () => {
    const f = build()
    const province = field(f)

    const armies = new Map<StanceKind, Army>()
    let id = 1

    for (const kind of ALL_STANCES) {
      const army = rifles(f, id++, province)
      const terrain = kind === StanceKind.Ambush ? Terrain.Forest : Terrain.OpenGround

      expect(f.stances.set(army, kind, terrain).accepted).toBe(true)
      armies.set(kind, army)
    }

    advance(f, REORGANISATION_TICKS)

    for (const kind of ALL_STANCES) {
      const armyId = armies.get(kind)!.id
      const dugIn = f.stances.entrenchmentOf(armyId)

      expect(f.stances.isReorganising(armyId)).toBe(false)
      expect(f.stances.attackMultiplierFor(armyId)).toBeCloseTo(attackMultiplier(kind), 4)
      expect(f.stances.speedMultiplierFor(armyId)).toBeCloseTo(speedMultiplier(kind), 4)

      /* Penggalian dimulai pada tick yang mengakhiri reorganisasi, sehingga dua
         sikap yang menggali sudah memiliki serpihan parit di sini. */
      expect(dugIn > 0).toBe(entrenches(kind))
      expect(f.stances.damageTakenMultiplierFor(armyId)).toBeCloseTo(
        mulF32(damageTakenMultiplier(kind), entrenchmentDamageTaken(dugIn, false)),
        4,
      )
    }
  })

  it('sikap netral selama enam tick sebelum menggigit', () => {
    const f = build()
    const army = rifles(f, 1, field(f))

    expect(f.stances.set(army, StanceKind.Assault, Terrain.OpenGround).accepted).toBe(true)

    for (let tick = 1; tick < REORGANISATION_TICKS; tick++) {
      advance(f, 1)

      expect(f.stances.isReorganising(army.id)).toBe(true)
      expect(f.stances.stanceOf(army.id)).toBe(StanceKind.Assault)
      expect(f.stances.effectiveStanceOf(army.id)).toBeNull()
      expect(f.stances.attackMultiplierFor(army.id)).toBeCloseTo(1, 4)
      expect(f.stances.damageTakenMultiplierFor(army.id)).toBeCloseTo(1, 4)
    }

    advance(f, 1)

    expect(f.stances.isReorganising(army.id)).toBe(false)
    expect(f.stances.effectiveStanceOf(army.id)).toBe(StanceKind.Assault)
    expect(f.stances.attackMultiplierFor(army.id)).toBeCloseTo(1.15, 4)
    expect(f.stances.damageTakenMultiplierFor(army.id)).toBeCloseTo(1.1, 4)
  })

  it('berganti sikap membayar enam tick lagi', () => {
    const f = build()
    const army = rifles(f, 1, field(f))

    expect(f.stances.set(army, StanceKind.Assault, Terrain.OpenGround).accepted).toBe(true)
    advance(f, REORGANISATION_TICKS)
    expect(f.stances.attackMultiplierFor(army.id)).toBeCloseTo(1.15, 4)

    expect(f.stances.set(army, StanceKind.Screen, Terrain.OpenGround).accepted).toBe(true)

    advance(f, REORGANISATION_TICKS - 1)
    expect(f.stances.isReorganising(army.id)).toBe(true)
    expect(f.stances.attackMultiplierFor(army.id)).toBeCloseTo(1, 4)

    advance(f, 1)
    expect(f.stances.attackMultiplierFor(army.id)).toBeCloseTo(0.7, 4)
  })

  it('mengulang perintah yang berlaku tidak mengubah apa pun', () => {
    const f = build()
    const army = rifles(f, 1, field(f))

    expect(f.stances.set(army, StanceKind.Hold, Terrain.OpenGround).accepted).toBe(true)
    advance(f, REORGANISATION_TICKS + 24)

    const dugIn = f.stances.entrenchmentOf(army.id)
    expect(dugIn).toBeGreaterThan(0)

    expect(f.stances.set(army, StanceKind.Hold, Terrain.OpenGround).accepted).toBe(true)

    expect(f.stances.isReorganising(army.id)).toBe(false)
    expect(f.stances.entrenchmentOf(army.id)).toBeCloseTo(dugIn, 4)
  })

  it('hold menggali sepuluh persen sehari dan berhenti di penuh', () => {
    const f = build()
    const army = rifles(f, 1, field(f))

    expect(f.stances.set(army, StanceKind.Hold, Terrain.OpenGround).accepted).toBe(true)
    advance(f, REORGANISATION_TICKS)

    const start = f.stances.entrenchmentOf(army.id)
    advance(f, 24)
    expect(f.stances.entrenchmentOf(army.id) - start).toBeCloseTo(DAILY_ENTRENCHMENT, 4)

    advance(f, maxDugHours(StanceKind.Hold))
    expect(f.stances.entrenchmentOf(army.id)).toBeCloseTo(1, 4)

    advance(f, 240)
    expect(f.stances.entrenchmentOf(army.id)).toBeCloseTo(1, 4)
  })

  it('ambush hanya menggali sedalam separuh hold', () => {
    const f = build()
    const army = rifles(f, 1, field(f))

    expect(f.stances.set(army, StanceKind.Ambush, Terrain.Jungle).accepted).toBe(true)
    advance(f, REORGANISATION_TICKS + maxDugHours(StanceKind.Hold) + 240)

    expect(f.stances.entrenchmentOf(army.id)).toBeCloseTo(0.5, 4)
  })

  it('ambush ditolak di tanah terbuka beserta alasannya', () => {
    const f = build()
    const army = rifles(f, 1, field(f))

    for (const terrain of [Terrain.OpenGround, Terrain.Desert, Terrain.Tundra, Terrain.Marsh]) {
      const order = f.stances.set(army, StanceKind.Ambush, terrain)

      expect(order.accepted).toBe(false)
      expect(order.reason).toContain('rough terrain')
      expect(order.reason).toContain(Terrain[terrain])
    }

    expect(f.stances.stanceOf(army.id)).toBeNull()
    expect(f.stances.trackedArmies).toBe(0)
  })

  it('ambush diizinkan di mana pun tanah memberi perlindungan', () => {
    const f = build()
    const province = field(f)
    let id = 1

    for (const terrain of [
      Terrain.Forest,
      Terrain.Jungle,
      Terrain.Hills,
      Terrain.Mountains,
      Terrain.Urban,
    ]) {
      const army = rifles(f, id++, province)
      expect(f.stances.set(army, StanceKind.Ambush, terrain).accepted).toBe(true)
    }
  })

  it('bergerak langsung menghabiskan paritnya', () => {
    const f = build()
    const army = rifles(f, 1, field(f))

    expect(f.stances.set(army, StanceKind.Hold, Terrain.OpenGround).accepted).toBe(true)
    advance(f, REORGANISATION_TICKS + 120)
    expect(f.stances.entrenchmentOf(army.id)).toBeGreaterThan(0)

    f.stances.onArmyMoved(army.id)

    expect(f.stances.entrenchmentOf(army.id)).toBeCloseTo(0, 4)
    expect(f.stances.damageTakenMultiplierFor(army.id)).toBeCloseTo(1, 4)
    expect(f.stances.stanceOf(army.id)).toBe(StanceKind.Hold)
  })

  it('menggali dua kali lebih cepat di tanah yang menolong', () => {
    const f = build()
    const province = field(f)

    const open = rifles(f, 1, province)
    const forest = rifles(f, 2, province)

    expect(f.stances.set(open, StanceKind.Hold, Terrain.OpenGround).accepted).toBe(true)
    expect(f.stances.set(forest, StanceKind.Hold, Terrain.Forest).accepted).toBe(true)

    advance(f, REORGANISATION_TICKS + 24)

    expect(f.stances.entrenchmentOf(forest.id)).toBeCloseTo(
      mulF32(2, f.stances.entrenchmentOf(open.id)),
      4,
    )
  })

  it('pasokan yang putus menghentikan penggalian', () => {
    const f = build()
    const { province, invader } = sever(f)

    expect(f.supply.statusOf(province)).toBe(SupplyStatus.CutOff)

    const army = stack(1, invader, province, MOTORIZED_INFANTRY)
    expect(f.stances.set(army, StanceKind.Hold, Terrain.OpenGround).accepted).toBe(true)

    /* Ransum yang dibawa membuat kedudukannya tetap bisa dikerjakan selama
       jendela tenggang, sehingga penggaliannya baru berhenti setelah itu habis. */
    advance(f, GRACE_TICKS)

    expect(f.supply.canEntrench(province)).toBe(false)
    const dugIn = f.stances.entrenchmentOf(army.id)
    expect(dugIn).toBeGreaterThan(0)

    advance(f, GRACE_TICKS)
    expect(f.stances.entrenchmentOf(army.id)).toBeCloseTo(dugIn, 4)
  })

  it('pasukan terkepung ditolak sikap assault', () => {
    const f = build()
    const { province, invader } = sever(f)
    advance(f, GRACE_TICKS)

    const army = stack(1, invader, province, MOTORIZED_INFANTRY)

    const assault = f.stances.set(army, StanceKind.Assault, Terrain.OpenGround)
    expect(assault.accepted).toBe(false)
    expect(assault.reason).toContain('cut off')

    const ambush = f.stances.set(army, StanceKind.Ambush, Terrain.Forest)
    expect(ambush.accepted).toBe(false)
    expect(ambush.reason).toContain('supplied')

    expect(f.stances.set(army, StanceKind.Hold, Terrain.OpenGround).accepted).toBe(true)
  })

  it('raid tidak merebut tanah dan sikap lain merebutnya', () => {
    const f = build()
    const province = field(f)
    let id = 1

    for (const kind of ALL_STANCES) {
      const army = rifles(f, id++, province)
      const terrain = kind === StanceKind.Ambush ? Terrain.Forest : Terrain.OpenGround
      expect(f.stances.set(army, kind, terrain).accepted).toBe(true)
    }

    advance(f, REORGANISATION_TICKS)

    id = 1
    for (const kind of ALL_STANCES) {
      expect(f.stances.canCapture(id)).toBe(kind !== StanceKind.Raid)
      expect(f.stances.canMove(id)).toBe(kind !== StanceKind.Hold && kind !== StanceKind.Ambush)
      expect(f.stances.engagesEnemyArmies(id)).toBe(kind !== StanceKind.Siege)
      expect(f.stances.advancesSiege(id)).toBe(kind === StanceKind.Siege)
      id++
    }
  })

  it('raid memotong separuh pasokan provinsi selama tiga hari', () => {
    const f = build()
    const province = field(f)
    const raider = f.nation === 0 ? 1 : 0

    const army = stack(1, raider, province, MOTORIZED_INFANTRY)
    expect(f.stances.set(army, StanceKind.Raid, Terrain.OpenGround).accepted).toBe(true)

    advance(f, REORGANISATION_TICKS - 1)
    expect(f.stances.isRaided(province)).toBe(false)

    advance(f, 1)
    expect(f.stances.isRaided(province)).toBe(true)
    expect(f.stances.raidedSupplyMultiplierOf(province)).toBeCloseTo(0.5, 4)

    f.stances.forget(army.id)

    advance(f, RAID_SUPPLY_TICKS - 1)
    expect(f.stances.isRaided(province)).toBe(true)

    advance(f, 1)
    expect(f.stances.isRaided(province)).toBe(false)
    expect(f.stances.raidedSupplyMultiplierOf(province)).toBeCloseTo(1, 4)
  })

  it('raid di tanah sendiri tidak memotong apa pun', () => {
    const f = build()
    const province = field(f)

    const army = rifles(f, 1, province)
    expect(f.stances.set(army, StanceKind.Raid, Terrain.OpenGround).accepted).toBe(true)
    advance(f, REORGANISATION_TICKS + 24)

    expect(f.stances.isRaided(province)).toBe(false)
  })

  it('screen mundur begitu kehilangan empat puluh persen', () => {
    const f = build()
    const province = field(f)

    const screening = rifles(f, 1, province, 2)
    const holding = rifles(f, 2, province, 2)

    expect(f.stances.set(screening, StanceKind.Screen, Terrain.OpenGround).accepted).toBe(true)
    expect(f.stances.set(holding, StanceKind.Hold, Terrain.OpenGround).accepted).toBe(true)
    advance(f, REORGANISATION_TICKS)

    expect(f.stances.shouldWithdraw(screening.id)).toBe(false)

    const toJustAbove = mulF32(
      screening.maxHitPoints,
      addF32(SCREEN_WITHDRAWAL_HEALTH, f32(0.01)),
    )
    damage(screening, subF32(screening.maxHitPoints, toJustAbove))
    damage(holding, subF32(holding.maxHitPoints, toJustAbove))

    expect(screening.health).toBeGreaterThan(SCREEN_WITHDRAWAL_HEALTH)
    expect(f.stances.shouldWithdraw(screening.id)).toBe(false)

    damage(screening, mulF32(screening.maxHitPoints, f32(0.02)))
    damage(holding, mulF32(holding.maxHitPoints, f32(0.02)))

    expect(screening.health).toBeLessThan(SCREEN_WITHDRAWAL_HEALTH)
    expect(f.stances.shouldWithdraw(screening.id)).toBe(true)
    expect(f.stances.retreatsWithoutPenalty(screening.id)).toBe(true)

    expect(f.stances.shouldWithdraw(holding.id)).toBe(false)
    expect(f.stances.retreatsWithoutPenalty(holding.id)).toBe(false)
  })

  it('ambush bersembunyi sampai lawan punya perkiraan sungguhan', () => {
    const f = build()
    const province = field(f)

    const hidden = rifles(f, 1, province)
    const holding = rifles(f, 2, province)

    expect(f.stances.set(hidden, StanceKind.Ambush, Terrain.Forest).accepted).toBe(true)
    expect(f.stances.set(holding, StanceKind.Hold, Terrain.Forest).accepted).toBe(true)

    expect(f.stances.isHiddenFrom(hidden.id, 0)).toBe(false)

    advance(f, REORGANISATION_TICKS)

    expect(f.stances.isHiddenFrom(hidden.id, 0)).toBe(true)
    expect(f.stances.isHiddenFrom(hidden.id, 1)).toBe(true)
    expect(f.stances.isHiddenFrom(hidden.id, 2)).toBe(false)
    expect(f.stances.isHiddenFrom(hidden.id, 3)).toBe(false)
    expect(f.stances.isHiddenFrom(holding.id, 0)).toBe(false)
  })

  it('assault membeli jalan masuk ke kota tetapi tidak ke pegunungan', () => {
    const f = build()
    const province = field(f)

    const assaulting = rifles(f, 1, province)
    const holding = rifles(f, 2, province)

    expect(f.stances.set(assaulting, StanceKind.Assault, Terrain.OpenGround).accepted).toBe(true)
    expect(f.stances.set(holding, StanceKind.Hold, Terrain.OpenGround).accepted).toBe(true)
    advance(f, REORGANISATION_TICKS)

    expect(f.stances.cityAssaultMultiplierFor(assaulting.id)).toBeCloseTo(0.85, 4)
    expect(f.stances.cityAssaultMultiplierFor(holding.id)).toBeCloseTo(0.75, 4)

    expect(f.stances.attackMultiplierFor(assaulting.id, Terrain.OpenGround)).toBeCloseTo(1.15, 4)
    expect(f.stances.attackMultiplierFor(assaulting.id, Terrain.Mountains)).toBeCloseTo(
      mulF32(ASSAULT_ATTACK, ASSAULT_ROUGH_TERRAIN_ATTACK),
      4,
    )
    expect(f.stances.attackMultiplierFor(assaulting.id, Terrain.Urban)).toBeCloseTo(
      mulF32(ASSAULT_ATTACK, ASSAULT_ROUGH_TERRAIN_ATTACK),
      4,
    )
    expect(f.stances.attackMultiplierFor(holding.id, Terrain.Mountains)).toBeCloseTo(1, 4)
  })

  it('berganti dari hold ke ambush memangkas parit jadi separuh', () => {
    const f = build()
    const army = rifles(f, 1, field(f))

    expect(f.stances.set(army, StanceKind.Hold, Terrain.Forest).accepted).toBe(true)
    advance(f, REORGANISATION_TICKS + maxDugHours(StanceKind.Hold))
    expect(f.stances.entrenchmentOf(army.id)).toBeCloseTo(1, 4)

    expect(f.stances.set(army, StanceKind.Ambush, Terrain.Forest).accepted).toBe(true)

    expect(f.stances.entrenchmentOf(army.id)).toBeCloseTo(0.5, 4)
    expect(f.stances.isReorganising(army.id)).toBe(true)
  })

  it('parit tetap melindungi selama tumpukan berorganisasi ulang', () => {
    const f = build()
    const army = rifles(f, 1, city(f))

    expect(f.stances.set(army, StanceKind.Hold, Terrain.Urban).accepted).toBe(true)
    advance(f, REORGANISATION_TICKS + maxDugHours(StanceKind.Hold))
    expect(f.stances.damageTakenMultiplierFor(army.id)).toBeCloseTo(0.75, 4)

    expect(f.stances.set(army, StanceKind.Ambush, Terrain.Urban).accepted).toBe(true)

    /* Separuh paritnya, tanpa sikapnya sama sekali: pengalinya adalah parit
       belaka selama tumpukan berorganisasi ulang. */
    expect(f.stances.damageTakenMultiplierFor(army.id)).toBeCloseTo(0.875, 4)
  })

  it('parit lebih berharga di kota daripada di lapangan', () => {
    const f = build()

    const urban = rifles(f, 1, city(f))
    const inField = rifles(f, 2, field(f))

    expect(f.stances.set(urban, StanceKind.Hold, Terrain.OpenGround).accepted).toBe(true)
    expect(f.stances.set(inField, StanceKind.Hold, Terrain.OpenGround).accepted).toBe(true)
    advance(f, REORGANISATION_TICKS + maxDugHours(StanceKind.Hold))

    expect(f.stances.damageTakenMultiplierFor(urban.id)).toBeCloseTo(0.75, 4)
    expect(f.stances.damageTakenMultiplierFor(inField.id)).toBeCloseTo(0.9, 4)
  })

  it('pasukan tanpa perintah netral dalam segala hal', () => {
    const f = build()

    expect(f.stances.stanceOf(99)).toBeNull()
    expect(f.stances.isReorganising(99)).toBe(false)
    expect(f.stances.attackMultiplierFor(99)).toBeCloseTo(1, 4)
    expect(f.stances.damageTakenMultiplierFor(99)).toBeCloseTo(1, 4)
    expect(f.stances.speedMultiplierFor(99)).toBeCloseTo(1, 4)
    expect(f.stances.entrenchmentOf(99)).toBeCloseTo(0, 4)
    expect(f.stances.canCapture(99)).toBe(true)
    expect(f.stances.canMove(99)).toBe(true)
    expect(f.stances.shouldWithdraw(99)).toBe(false)
    expect(f.stances.isHiddenFrom(99, 0)).toBe(false)
  })

  it('pasukan yang hancur berhenti dilacak', () => {
    const f = build()
    const army = rifles(f, 1, field(f))

    expect(f.stances.set(army, StanceKind.Hold, Terrain.OpenGround).accepted).toBe(true)
    expect(f.stances.trackedArmies).toBe(1)

    damage(army, army.maxHitPoints)
    army.removeDestroyed()
    advance(f, 1)

    expect(f.stances.trackedArmies).toBe(0)
    expect(f.stances.stanceOf(army.id)).toBeNull()
  })

  it('tick dua kali dalam satu jam menggali sekali', () => {
    const f = build()
    const army = rifles(f, 1, field(f))

    expect(f.stances.set(army, StanceKind.Hold, Terrain.OpenGround).accepted).toBe(true)
    advance(f, REORGANISATION_TICKS + 24)

    const dugIn = f.stances.entrenchmentOf(army.id)

    f.stances.tick()
    f.stances.tick()

    expect(f.stances.entrenchmentOf(army.id)).toBeCloseTo(dugIn, 4)
  })

  it('pembela yang menggali penuh menerima jauh lebih sedikit dari pertempuran sungguhan', () => {
    const f = build()
    const province = city(f)

    const dugIn = rifles(f, 1, province, 8)
    expect(f.stances.set(dugIn, StanceKind.Hold, Terrain.Urban).accepted).toBe(true)
    advance(f, REORGANISATION_TICKS + maxDugHours(StanceKind.Hold))

    expect(f.stances.entrenchmentOf(dugIn.id)).toBeCloseTo(1, 4)
    const shielded = f.stances.damageTakenMultiplierFor(dugIn.id)
    expect(shielded).toBeCloseTo(0.75, 4)

    const combat = new Combat(new DeterministicRandom(11))
    const attacker = stack(
      3,
      1,
      province,
      MAIN_BATTLE_TANK,
      MAIN_BATTLE_TANK,
      MAIN_BATTLE_TANK,
      MAIN_BATTLE_TANK,
    )
    const defender = rifles(f, 4, province, 8)

    const pool = defender.maxHitPoints
    let raw = 0

    for (let hour = 0; hour < 48 && !defender.isDestroyed; hour++) {
      raw = addF32(raw, combat.resolveHour(attacker, defender, Terrain.Urban).damageToDefender)
    }

    expect(defender.isDestroyed).toBe(true)

    const entrenched = mulF32(raw, shielded)

    expect(subF32(raw, entrenched)).toBeGreaterThan(MOTORIZED_INFANTRY.maxHitPoints)

    /* Pertempuran yang sama yang menyapu tumpukan terbuka meninggalkan yang
       menggali tetap berdiri, dan itulah seluruh alasan membayar enam tick
       untuk Hold. */
    expect(raw).toBeGreaterThanOrEqual(pool)
    expect(entrenched).toBeLessThan(pool)
  })
})

/*
 * Batas jam menggali tidak ditegaskan satu pun uji C#: di sana `MaxDugHours`
 * hanya dipakai sebagai nilai, tidak pernah dibandingkan dengan angka. Blok ini
 * mengunci angkanya, yang diambil dari implementasi rujukan dan bukan dihitung
 * ulang di sini.
 *
 * Yang TIDAK dijaga blok ini: apakah pembagiannya memang pembagian. Untuk kedua
 * nilai cap yang ada, `divF32(cap, 0.1f)` dan `mulF32(cap, 10)` menghasilkan
 * bit yang sama, sehingga tidak ada uji yang bisa membedakannya. Pembagian
 * dipakai karena setia pada sumbernya, bukan karena terbukti — kalau suatu saat
 * ada sikap dengan cap lain, keduanya bisa berpisah dan tidak ada yang
 * memperingatkan.
 */
describe('batas jam menggali cocok dengan implementasi rujukan', () => {
  it.each([
    ['Hold', StanceKind.Hold, 240],
    ['Ambush', StanceKind.Ambush, 120],
  ] as const)('%s berhenti menggali pada %i jam', (_name, kind, hours) => {
    expect(maxDugHours(kind)).toBe(hours)
  })

  it('sikap yang tidak menggali berhenti di nol jam', () => {
    for (const kind of [StanceKind.Assault, StanceKind.Screen, StanceKind.Raid]) {
      expect(maxDugHours(kind)).toBe(0)
    }
  })
})
