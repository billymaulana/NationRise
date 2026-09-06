import { Terrain } from '~/sim/world/Terrain'

export const NO_OWNER = 0xffff

export class ProvinceStore {
  readonly count: number

  readonly owner: Uint16Array
  readonly controller: Uint16Array
  readonly terrain: Uint8Array
  readonly population: Float32Array
  readonly resourceType: Uint8Array
  readonly resourceAmount: Uint16Array
  readonly infrastructure: Uint8Array
  readonly development: Float32Array
  readonly morale: Float32Array
  readonly isCity: Uint8Array

  /* Klaim bergerigi: kebanyakan provinsi punya satu, yang disengketakan punya
     beberapa. Disimpan sebagai satu larik datar plus offset supaya jalur panas
     tetap satu pembacaan berurutan, bukan mengejar larik per provinsi. */
  readonly #claimOffsets: Int32Array
  readonly #claims: Uint16Array

  constructor(count: number, claimOffsets: Int32Array, claims: Uint16Array) {
    if (count < 0) {
      throw new RangeError(`jumlah provinsi tidak boleh negatif: ${count}`)
    }

    if (claimOffsets.length !== count + 1) {
      throw new RangeError(
        `claimOffsets harus punya ${count + 1} entri untuk ${count} provinsi, bukan ${claimOffsets.length}`,
      )
    }

    this.count = count
    this.owner = new Uint16Array(count).fill(NO_OWNER)
    this.controller = new Uint16Array(count).fill(NO_OWNER)
    this.terrain = new Uint8Array(count)
    this.population = new Float32Array(count)
    this.resourceType = new Uint8Array(count)
    this.resourceAmount = new Uint16Array(count)
    this.infrastructure = new Uint8Array(count)
    this.development = new Float32Array(count)
    this.morale = new Float32Array(count)
    this.isCity = new Uint8Array(count)

    this.#claimOffsets = claimOffsets
    this.#claims = claims
  }

  at(id: number): ProvinceRef {
    return new ProvinceRef(this, id)
  }

  /* subarray, bukan slice: ini pandangan tanpa salinan, padanan ReadOnlySpan. */
  claimsOf(id: number): Uint16Array {
    const start = this.#claimOffsets[id]!
    return this.#claims.subarray(start, this.#claimOffsets[id + 1]!)
  }

  isOccupied(id: number): boolean {
    return this.controller[id] !== this.owner[id]
  }

  isContested(id: number): boolean {
    return this.claimsOf(id).length > 1
  }
}

export class ProvinceRef {
  constructor(
    private readonly store: ProvinceStore,
    readonly id: number,
  ) {}

  get owner(): number {
    return this.store.owner[this.id]!
  }

  get controller(): number {
    return this.store.controller[this.id]!
  }

  get terrain(): Terrain {
    return this.store.terrain[this.id]! as Terrain
  }

  get population(): number {
    return this.store.population[this.id]!
  }

  get infrastructure(): number {
    return this.store.infrastructure[this.id]!
  }

  get development(): number {
    return this.store.development[this.id]!
  }

  get morale(): number {
    return this.store.morale[this.id]!
  }

  get isCity(): boolean {
    return this.store.isCity[this.id] !== 0
  }

  get claims(): Uint16Array {
    return this.store.claimsOf(this.id)
  }

  get isOccupied(): boolean {
    return this.store.isOccupied(this.id)
  }

  get isContested(): boolean {
    return this.store.isContested(this.id)
  }

  isClaimedBy(nation: number): boolean {
    return this.store.claimsOf(this.id).includes(nation)
  }
}
