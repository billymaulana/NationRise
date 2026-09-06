import { divF32, f32, mulF32, subF32 } from '~/sim/determinism/float32'
import { roundHalfToEven } from '~/sim/determinism/rounding'
import type { Army } from '~/sim/military/Army'
import { SupplyStatus, type SupplySystem } from '~/sim/military/SupplySystem'
import { HOURS_PER_DAY } from '~/sim/time/GameDate'
import { favoursDefence, Terrain } from '~/sim/world/Terrain'
import type { WorldState } from '~/sim/world/WorldState'

export enum StanceKind {
  Assault = 0,
  Hold = 1,
  Ambush = 2,
  Siege = 3,
  Screen = 4,
  Raid = 5,
}

export const REORGANISATION_TICKS = 6

export const ASSAULT_ATTACK = f32(1.15)
export const ASSAULT_DAMAGE_TAKEN = f32(1.1)
export const ASSAULT_ROUGH_TERRAIN_ATTACK = f32(0.85)

export const SCREEN_ATTACK = f32(0.7)
export const SCREEN_DAMAGE_TAKEN = f32(0.8)
export const SCREEN_WITHDRAWAL_HEALTH = f32(0.6)

export const RAID_ATTACK = f32(0.8)
export const RAID_SPEED = f32(1.2)
export const RAID_SUPPLY_PENALTY = f32(0.5)
export const RAID_SUPPLY_TICKS = 72

export const DAILY_ENTRENCHMENT = f32(0.1)
export const AMBUSH_ENTRENCHMENT_CAP = f32(0.5)
export const ENTRENCHED_CITY_DAMAGE_TAKEN = f32(0.75)
export const ENTRENCHED_FIELD_DAMAGE_TAKEN = f32(0.9)

export const CITY_ASSAULT_PENALTY = f32(0.75)
export const ASSAULT_CITY_PENALTY = f32(0.85)

/* Pengintaian yang menyelesaikan sebuah provinsi menjadi perkiraan atau lebih
   baik menembus penyergapan; apa pun yang lebih kabur dari itu tidak. */
export const HIDDEN_INTEL_THRESHOLD = 2

/* Padanan int.MaxValue: batas atas C# saat memotong selisih tick yang bertipe
   long menjadi jumlah jam yang bertipe int. */
const INT32_MAX = 2147483647

export function attackMultiplier(kind: StanceKind): number {
  switch (kind) {
    case StanceKind.Assault:
      return ASSAULT_ATTACK
    case StanceKind.Screen:
      return SCREEN_ATTACK
    case StanceKind.Raid:
      return RAID_ATTACK
    default:
      return 1
  }
}

export function damageTakenMultiplier(kind: StanceKind): number {
  switch (kind) {
    case StanceKind.Assault:
      return ASSAULT_DAMAGE_TAKEN
    case StanceKind.Screen:
      return SCREEN_DAMAGE_TAKEN
    default:
      return 1
  }
}

export function speedMultiplier(kind: StanceKind): number {
  return kind === StanceKind.Raid ? RAID_SPEED : 1
}

/* Menyerbu celah gunung atau blok padat dengan sikap assault menghabiskan
   bonusnya dan lebih: berat tambahannya tidak punya tempat untuk digelar. */
export function terrainAttackModifier(kind: StanceKind, terrain: Terrain): number {
  return kind === StanceKind.Assault &&
    (terrain === Terrain.Mountains || terrain === Terrain.Urban)
    ? ASSAULT_ROUGH_TERRAIN_ATTACK
    : 1
}

export function cityAssaultMultiplier(kind: StanceKind): number {
  return kind === StanceKind.Assault ? ASSAULT_CITY_PENALTY : CITY_ASSAULT_PENALTY
}

export function entrenchmentCap(kind: StanceKind): number {
  switch (kind) {
    case StanceKind.Hold:
      return 1
    case StanceKind.Ambush:
      return AMBUSH_ENTRENCHMENT_CAP
    default:
      return 0
  }
}

export function maxDugHours(kind: StanceKind): number {
  return Math.trunc(
    roundHalfToEven(mulF32(divF32(entrenchmentCap(kind), DAILY_ENTRENCHMENT), HOURS_PER_DAY)),
  )
}

export function entrenchmentFrom(kind: StanceKind, dugHours: number): number {
  return Math.min(
    entrenchmentCap(kind),
    divF32(mulF32(dugHours, DAILY_ENTRENCHMENT), HOURS_PER_DAY),
  )
}

export function entrenchmentDamageTaken(entrenchment: number, inCity: boolean): number {
  if (entrenchment <= 0) return 1

  const lowest = inCity ? ENTRENCHED_CITY_DAMAGE_TAKEN : ENTRENCHED_FIELD_DAMAGE_TAKEN
  return subF32(1, mulF32(entrenchment, subF32(1, lowest)))
}

export function entrenches(kind: StanceKind): boolean {
  return kind === StanceKind.Hold || kind === StanceKind.Ambush
}

export function canCapture(kind: StanceKind): boolean {
  return kind !== StanceKind.Raid
}

/* Tidak bisa bergerak adalah izin, bukan kecepatan nol: tumpukan yang menggali
   dan lalu kocar-kacir atau diperintahkan keluar tetap harus menempuh jalan
   dengan laju yang bisa dipakai. */
export function canMove(kind: StanceKind): boolean {
  return kind !== StanceKind.Hold && kind !== StanceKind.Ambush
}

export function engagesEnemyArmies(kind: StanceKind): boolean {
  return kind !== StanceKind.Siege
}

export function advancesSiege(kind: StanceKind): boolean {
  return kind === StanceKind.Siege
}

/* Menggali lebih cepat di tanah yang sudah memberi awalan: garis pepohonan atau
   deretan rumah sudah setengah kedudukan sebelum ada yang mengangkat sekop. */
export function diggingRateIn(terrain: Terrain): number {
  return terrain === Terrain.Forest || terrain === Terrain.Hills || terrain === Terrain.Urban
    ? 2
    : 1
}

/*
 * Parit disimpan sebagai jam yang benar-benar dipakai menggali, bukan sebagai
 * pecahan yang tumbuh tiap tick. Menurunkan tingkatnya dari bilangan bulat
 * menjaga laju menggali yang berlipat dan sikap yang dibatasi agar tidak
 * menyimpang sepanjang ratusan tick yang dilewati garis yang menggali.
 */
export class StanceState {
  dugHours = 0

  constructor(
    public army: Army,
    public kind: StanceKind,
    public terrain: Terrain,
    public changedAtTick: number,
  ) {}

  get armyId(): number {
    return this.army.id
  }

  get entrenchment(): number {
    return entrenchmentFrom(this.kind, this.dugHours)
  }
}

export interface StanceOrder {
  readonly accepted: boolean
  readonly reason: string
}

const ACCEPTED: StanceOrder = { accepted: true, reason: '' }

/*
 * Enam sikap yang bisa diambil sebuah tumpukan, dan ongkos berubah pikiran.
 * Sikap baru berlaku setelah jendela reorganisasi, sehingga ia adalah komitmen
 * yang dibuat sebelum pertempuran alih-alih tuas yang ditarik setelah tembakan
 * dimulai; selama enam tick itu tumpukan bertempur tanpa satu pun keunggulan
 * sikapnya dan tanpa satu pun kerugiannya.
 *
 * Parit sengaja berada di luar aturan itu. Parit adalah tanah yang sudah
 * digali, bukan niat, sehingga ia tetap melindungi tumpukan selama ia
 * berorganisasi ulang dan baru hilang ketika tumpukan meninggalkannya.
 */
export class StanceSystem {
  readonly #states = new Map<number, StanceState>()
  readonly #ordered: StanceState[] = []
  readonly #raidedUntil = new Map<number, number>()

  #lastTick: number

  constructor(
    private readonly world: WorldState,
    private readonly supply: SupplySystem,
  ) {
    this.#lastTick = world.clock.tick
  }

  get trackedArmies(): number {
    return this.#ordered.length
  }

  stateOf(armyId: number): StanceState | null {
    return this.#states.get(armyId) ?? null
  }

  stanceOf(armyId: number): StanceKind | null {
    return this.stateOf(armyId)?.kind ?? null
  }

  effectiveStanceOf(armyId: number): StanceKind | null {
    const state = this.stateOf(armyId)
    return state === null || this.#isReorganising(state) ? null : state.kind
  }

  isReorganising(armyId: number): boolean {
    const state = this.stateOf(armyId)
    return state !== null && this.#isReorganising(state)
  }

  attackMultiplierFor(armyId: number, terrain?: Terrain): number {
    const kind = this.effectiveStanceOf(armyId)
    if (kind === null) return 1

    return terrain === undefined
      ? attackMultiplier(kind)
      : mulF32(attackMultiplier(kind), terrainAttackModifier(kind, terrain))
  }

  damageTakenMultiplierFor(armyId: number): number {
    const state = this.stateOf(armyId)
    if (state === null) return 1

    const stance = this.#isReorganising(state) ? 1 : damageTakenMultiplier(state.kind)
    return mulF32(stance, this.#entrenchmentDamageTakenFor(state))
  }

  speedMultiplierFor(armyId: number): number {
    const kind = this.effectiveStanceOf(armyId)
    return kind === null ? 1 : speedMultiplier(kind)
  }

  cityAssaultMultiplierFor(armyId: number): number {
    const kind = this.effectiveStanceOf(armyId)
    return kind === null ? CITY_ASSAULT_PENALTY : cityAssaultMultiplier(kind)
  }

  entrenchmentOf(armyId: number): number {
    return this.stateOf(armyId)?.entrenchment ?? 0
  }

  canCapture(armyId: number): boolean {
    const kind = this.effectiveStanceOf(armyId)
    return kind === null || canCapture(kind)
  }

  canMove(armyId: number): boolean {
    const kind = this.effectiveStanceOf(armyId)
    return kind === null || canMove(kind)
  }

  engagesEnemyArmies(armyId: number): boolean {
    const kind = this.effectiveStanceOf(armyId)
    return kind === null || engagesEnemyArmies(kind)
  }

  advancesSiege(armyId: number): boolean {
    return this.effectiveStanceOf(armyId) === StanceKind.Siege
  }

  retreatsWithoutPenalty(armyId: number): boolean {
    return this.effectiveStanceOf(armyId) === StanceKind.Screen
  }

  shouldWithdraw(armyId: number): boolean {
    const state = this.stateOf(armyId)

    return (
      state !== null &&
      !this.#isReorganising(state) &&
      state.kind === StanceKind.Screen &&
      state.army.health < SCREEN_WITHDRAWAL_HEALTH
    )
  }

  isHiddenFrom(armyId: number, enemyIntelLevel: number): boolean {
    const state = this.stateOf(armyId)

    return (
      state !== null &&
      !this.#isReorganising(state) &&
      state.kind === StanceKind.Ambush &&
      enemyIntelLevel < HIDDEN_INTEL_THRESHOLD
    )
  }

  isRaided(province: number): boolean {
    const until = this.#raidedUntil.get(province)
    return until !== undefined && until > this.world.clock.tick
  }

  raidedSupplyMultiplierOf(province: number): number {
    return this.isRaided(province) ? RAID_SUPPLY_PENALTY : 1
  }

  set(army: Army, kind: StanceKind, terrain: Terrain): StanceOrder {
    const refusal = this.#refusalFor(army, kind, terrain)
    if (refusal !== null) return { accepted: false, reason: refusal }

    const now = this.world.clock.tick
    const state = this.#states.get(army.id)

    if (state !== undefined) {
      state.army = army
      state.terrain = terrain

      /* Mengulang perintah yang sedang berlaku bukan perubahan pikiran,
         sehingga ia tidak boleh mengulang reorganisasi maupun penggaliannya. */
      if (state.kind === kind) return ACCEPTED

      state.kind = kind
      state.changedAtTick = now
      state.dugHours = Math.min(state.dugHours, maxDugHours(kind))
      return ACCEPTED
    }

    const created = new StanceState(army, kind, terrain, now)
    this.#states.set(army.id, created)
    this.#ordered.push(created)
    return ACCEPTED
  }

  onArmyMoved(armyId: number): void {
    const state = this.#states.get(armyId)
    if (state !== undefined) state.dugHours = 0
  }

  forget(armyId: number): void {
    const state = this.#states.get(armyId)
    if (state === undefined) return

    this.#states.delete(armyId)

    const index = this.#ordered.indexOf(state)
    if (index >= 0) this.#ordered.splice(index, 1)
  }

  /* Tidak ada yang terjadi dua kali dalam satu jam permainan: jam, bukan jumlah
     panggilan, yang menentukan seberapa banyak sebuah tumpukan sudah menggali. */
  tick(): void {
    const now = this.world.clock.tick

    if (now <= this.#lastTick) {
      this.#lastTick = now
      return
    }

    const hours = Math.min(now - this.#lastTick, INT32_MAX)
    this.#lastTick = now

    this.#dropDestroyed()
    this.#expireRaids(now)

    for (const state of this.#ordered) {
      if (this.#isReorganising(state)) continue

      this.#dig(state, hours)
      this.#raid(state, now)
    }
  }

  #isReorganising(state: StanceState): boolean {
    return this.world.clock.tick - state.changedAtTick < REORGANISATION_TICKS
  }

  #entrenchmentDamageTakenFor(state: StanceState): number {
    return entrenchmentDamageTaken(
      state.entrenchment,
      this.world.provinces.isCity[state.army.province] !== 0,
    )
  }

  #dig(state: StanceState, hours: number): void {
    if (!entrenches(state.kind) || !this.supply.canEntrench(state.army.province)) return

    const cap = maxDugHours(state.kind)
    if (state.dugHours >= cap) return

    state.dugHours = Math.min(cap, state.dugHours + hours * diggingRateIn(state.terrain))
  }

  #raid(state: StanceState, now: number): void {
    if (state.kind !== StanceKind.Raid) return

    const province = state.army.province
    if (this.world.provinces.controller[province] === state.army.nation) return

    this.#raidedUntil.set(province, now + RAID_SUPPLY_TICKS)
  }

  /* Kunci yang kedaluwarsa dikumpulkan dulu lalu dihapus: himpunannya tidak
     bergantung pada urutan kunjungan, sehingga peta tetap boleh diiterasi
     menurut urutan sisipnya. */
  #expireRaids(now: number): void {
    if (this.#raidedUntil.size === 0) return

    const expired: number[] = []
    for (const [province, until] of this.#raidedUntil) {
      if (until <= now) expired.push(province)
    }

    for (const province of expired) this.#raidedUntil.delete(province)
  }

  #dropDestroyed(): void {
    for (let i = this.#ordered.length - 1; i >= 0; i--) {
      const state = this.#ordered[i]!
      if (!state.army.isDestroyed) continue

      this.#ordered.splice(i, 1)
      this.#states.delete(state.armyId)
    }
  }

  #refusalFor(army: Army, kind: StanceKind, terrain: Terrain): string | null {
    if (army.isDestroyed) return `Army ${army.id} has been destroyed.`

    if (
      kind === StanceKind.Assault &&
      this.supply.effectiveStatusOf(army.province) === SupplyStatus.CutOff
    ) {
      return `Army ${army.id} is cut off and cannot mount an assault.`
    }

    /* Perlindungan yang dibutuhkan penyergapan adalah tanah yang sama yang
       sudah memihak pembela, sehingga aturannya dibaca dari satu tempat
       alih-alih dieja dua kali lalu menyimpang. */
    if (kind === StanceKind.Ambush && !favoursDefence(terrain)) {
      return `Ambush needs rough terrain; ${Terrain[terrain]} leaves the stack in the open.`
    }

    if (kind === StanceKind.Ambush && !this.#isSupplied(army.province)) {
      return `Ambush needs a supplied position; army ${army.id} has none.`
    }

    if (kind === StanceKind.Siege && !this.#isSupplied(army.province)) {
      return `A siege cannot be maintained on broken supply by army ${army.id}.`
    }

    return null
  }

  #isSupplied(province: number): boolean {
    return this.supply.effectiveStatusOf(province) === SupplyStatus.Supplied
  }
}
