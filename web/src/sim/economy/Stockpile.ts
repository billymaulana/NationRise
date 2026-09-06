import { RESOURCE_COUNT, type Resource } from '~/sim/economy/Resource'

/*
 * Cadangan nasional sebagai satu larik datar berindeks negara dan sumber daya.
 * Produksi harian mendarat di sini; semua yang berbiaya menarik darinya.
 *
 * Float64Array, bukan BigInt64Array: nilainya bilangan bulat dan tetap eksak
 * sampai 2^53, jauh di atas apa pun yang bisa dikumpulkan sebuah negara,
 * sementara BigInt jauh lebih lambat di jalur yang dijalankan tiap tick.
 */
export class Stockpile {
  readonly nationCount: number

  readonly #amounts: Float64Array

  constructor(nationCount: number) {
    if (nationCount < 0) {
      throw new RangeError(`jumlah negara tidak boleh negatif: ${nationCount}`)
    }

    this.nationCount = nationCount
    this.#amounts = new Float64Array(nationCount * RESOURCE_COUNT)
  }

  get(nation: number, resource: Resource): number {
    return this.#amounts[this.#index(nation, resource)]!
  }

  add(nation: number, resource: Resource, amount: number): void {
    const i = this.#index(nation, resource)
    this.#amounts[i] = this.#amounts[i]! + amount
  }

  trySpend(nation: number, resource: Resource, amount: number): boolean {
    if (amount < 0) {
      throw new RangeError(`jumlah belanja tidak boleh negatif: ${amount}`)
    }

    const i = this.#index(nation, resource)
    const held = this.#amounts[i]!
    if (held < amount) return false

    this.#amounts[i] = held - amount
    return true
  }

  /* Kelangkaan dilaporkan, bukan dijepit diam-diam: kehabisan adalah keadaan
     yang direaksikan sisa simulasi, bukan galat yang disembunyikan. */
  isShort(nation: number, resource: Resource): boolean {
    return this.get(nation, resource) <= 0
  }

  #index(nation: number, resource: Resource): number {
    if (nation < 0 || nation >= this.nationCount) {
      throw new RangeError(`negara ${nation} di luar 0..${this.nationCount - 1}`)
    }

    return nation * RESOURCE_COUNT + resource
  }
}
