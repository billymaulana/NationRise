import type { ProvinceGraph } from '~/sim/data/WorldFile'
import { addF32, divF32, f32, mulF32, subF32 } from '~/sim/determinism/float32'
import type { ShortageSystem } from '~/sim/economy/ShortageSystem'
import type { Army } from '~/sim/military/Army'
import { hoursFor } from '~/sim/military/MovementCost'
import { isWater } from '~/sim/world/Terrain'
import type { WorldState } from '~/sim/world/WorldState'

export class MovementOrder {
  #step = 0
  #hoursIntoStep = 0

  constructor(
    readonly armyId: number,
    readonly path: readonly number[],
  ) {}

  get step(): number {
    return this.#step
  }

  get hoursIntoStep(): number {
    return this.#hoursIntoStep
  }

  get isComplete(): boolean {
    return this.#step >= this.path.length - 1
  }

  get nextProvince(): number {
    return this.path[Math.min(this.#step + 1, this.path.length - 1)]!
  }

  advance(hours: number): void {
    this.#hoursIntoStep = addF32(this.#hoursIntoStep, hours)
  }

  completeStep(): void {
    this.#step++
    this.#hoursIntoStep = 0
  }

  hoursRemainingInStep(stepHours: number): number {
    return Math.max(0, subF32(stepHours, this.#hoursIntoStep))
  }
}

/*
 * Menggerakkan pasukan satu jam permainan sekali. Gerakan diselesaikan di tick
 * simulasi, tidak pernah di panggilan balik bingkai, sehingga simpanan yang
 * dimuat di tengah pawai melanjut di titik yang sama berapa pun laju
 * bingkainya.
 */
export class MovementSystem {
  readonly #orders = new Map<number, MovementOrder>()

  /* Boleh kosong supaya gerak tetap bisa diuji sendirian; kalau dipasang,
     inilah yang membuat kelangkaan bahan bakar menelantarkan kolom lapis baja
     di tengah jalan ke garis depan. */
  shortage: ShortageSystem | null = null

  constructor(
    private readonly world: WorldState,
    private readonly land: ProvinceGraph | null = null,
  ) {}

  get pendingOrders(): number {
    return this.#orders.size
  }

  order(army: Army, path: readonly number[]): void {
    if (path.length < 2) {
      this.#orders.delete(army.id)
      return
    }

    if (path[0] !== army.province) {
      throw new RangeError(
        `jalur mulai di ${path[0]} sedangkan pasukan ${army.id} ada di ${army.province}`,
      )
    }

    this.#orders.set(army.id, new MovementOrder(army.id, path))
  }

  cancel(armyId: number): void {
    this.#orders.delete(armyId)
  }

  isMoving(armyId: number): boolean {
    return this.#orders.has(armyId)
  }

  tick(armies: ReadonlyMap<number, Army>, hours = 1): void {
    const finished: number[] = []

    for (const [armyId, order] of this.#orders) {
      const army = armies.get(armyId)
      if (army === undefined || army.isDestroyed) {
        finished.push(armyId)
        continue
      }

      let budget = hours
      while (budget > 0 && !order.isComplete) {
        const stepHours = this.#stepHours(army, order.nextProvince)
        const remaining = order.hoursRemainingInStep(stepHours)

        if (budget < remaining) {
          order.advance(budget)
          budget = 0
          continue
        }

        budget = subF32(budget, remaining)
        const from = army.province
        order.completeStep()
        army.province = order.path[order.step]!

        if (this.#crossedWater(from, army.province)) {
          army.landedOnTick = this.world.clock.tick
        }
      }

      if (order.isComplete) finished.push(armyId)
    }

    for (const armyId of finished) this.#orders.delete(armyId)
  }

  #stepHours(army: Army, destination: number): number {
    const terrain = this.world.provinces.at(destination).terrain
    const speed = Math.max(
      mulF32(army.speed, this.shortage?.speedMultiplierFor(army) ?? 1),
      f32(0.1),
    )
    const bySea = isWater(terrain) || this.#crossedWater(army.province, destination)

    return divF32(hoursFor(terrain, bySea), speed)
  }

  /* Dua provinsi yang hanya tersambung lewat graf laut menuntut naik kapal.
     Tanpa graf darat untuk dibandingkan, setiap langkah diperlakukan sebagai
     jalur darat, yang merupakan pembacaan aman alih-alih pendaratan gratis yang
     diam-diam. */
  #crossedWater(from: number, to: number): boolean {
    if (this.land === null || from === to) return false

    for (const neighbour of this.land.neighboursOf(from)) {
      if (neighbour === to) return false
    }

    return true
  }
}
