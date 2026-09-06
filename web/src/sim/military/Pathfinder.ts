import type { ProvinceGraph } from '~/sim/data/WorldFile'
import { addF32 } from '~/sim/determinism/float32'

/*
 * A* di atas graf provinsi. Biayanya dalam jam permainan, sehingga sebuah jalur
 * bisa dilaporkan ke pemain sebagai waktu tiba alih-alih angka abstrak, dan
 * rutin yang sama melayani gerak darat, laut dan campuran dengan menukar fungsi
 * biayanya, bukan algoritmanya.
 */

export interface StepCost {
  (from: number, to: number, bySea: boolean): number
}

const ARITY = 4

/*
 * PriorityQueue .NET adalah heap 4-ary yang tidak stabil: saat dua simpul
 * berbiaya sama, urutan keluarnya ditentukan bentuk heap, bukan urutan masuk.
 * Menirunya persis di sini adalah satu-satunya cara jalur yang dipilih port ini
 * sama dengan jalur implementasi rujukan setiap kali biayanya seri, dan jalur
 * yang berbeda pada seri berarti dua simulasi yang seharusnya identik menaruh
 * pasukan di provinsi yang berbeda tanpa satu pun galat menandainya.
 */
class MinHeap {
  readonly #elements: number[] = []
  readonly #priorities: number[] = []

  #size = 0

  get size(): number {
    return this.#size
  }

  enqueue(element: number, priority: number): void {
    let nodeIndex = this.#size++

    while (nodeIndex > 0) {
      const parentIndex = Math.trunc((nodeIndex - 1) / ARITY)
      if (priority >= this.#priorities[parentIndex]!) break

      this.#elements[nodeIndex] = this.#elements[parentIndex]!
      this.#priorities[nodeIndex] = this.#priorities[parentIndex]!
      nodeIndex = parentIndex
    }

    this.#elements[nodeIndex] = element
    this.#priorities[nodeIndex] = priority
  }

  dequeue(): number {
    const root = this.#elements[0]!
    const lastNodeIndex = --this.#size

    if (lastNodeIndex > 0) {
      this.#moveDown(this.#elements[lastNodeIndex]!, this.#priorities[lastNodeIndex]!, 0)
    }

    return root
  }

  #moveDown(element: number, priority: number, startIndex: number): void {
    const size = this.#size
    let nodeIndex = startIndex
    let i = nodeIndex * ARITY + 1

    while (i < size) {
      let minPriority = this.#priorities[i]!
      let minIndex = i

      const upperBound = Math.min(i + ARITY, size)
      while (++i < upperBound) {
        const next = this.#priorities[i]!
        if (next < minPriority) {
          minPriority = next
          minIndex = i
        }
      }

      if (priority <= minPriority) break

      this.#elements[nodeIndex] = this.#elements[minIndex]!
      this.#priorities[nodeIndex] = minPriority
      nodeIndex = minIndex
      i = nodeIndex * ARITY + 1
    }

    this.#elements[nodeIndex] = element
    this.#priorities[nodeIndex] = priority
  }
}

export class Pathfinder {
  readonly #cost: Float32Array
  readonly #cameFrom: Int32Array
  readonly #closed: Uint8Array

  constructor(
    private readonly land: ProvinceGraph,
    private readonly sea: ProvinceGraph,
    provinceCount: number,
  ) {
    this.#cost = new Float32Array(provinceCount)
    this.#cameFrom = new Int32Array(provinceCount)
    this.#closed = new Uint8Array(provinceCount)
  }

  findPath(start: number, goal: number, stepCost: StepCost, allowSea = true): number[] {
    if (start < 0) throw new RangeError(`provinsi awal tidak boleh negatif: ${start}`)
    if (goal < 0) throw new RangeError(`provinsi tujuan tidak boleh negatif: ${goal}`)

    if (start === goal) return [start]

    this.#cost.fill(Infinity)
    this.#cameFrom.fill(-1)
    this.#closed.fill(0)

    const open = new MinHeap()
    this.#cost[start] = 0
    open.enqueue(start, 0)

    while (open.size > 0) {
      const current = open.dequeue()

      if (current === goal) return this.#reconstruct(goal)
      if (this.#closed[current] !== 0) continue

      this.#closed[current] = 1

      this.#relax(current, this.land.neighboursOf(current), false, stepCost, open)
      if (allowSea) {
        this.#relax(current, this.sea.neighboursOf(current), true, stepCost, open)
      }
    }

    return []
  }

  costTo(province: number): number {
    return this.#cost[province]!
  }

  #relax(
    current: number,
    neighbours: Uint16Array,
    bySea: boolean,
    stepCost: StepCost,
    open: MinHeap,
  ): void {
    for (const next of neighbours) {
      if (this.#closed[next] !== 0) continue

      const candidate = addF32(this.#cost[current]!, stepCost(current, next, bySea))
      if (candidate >= this.#cost[next]!) continue

      this.#cost[next] = candidate
      this.#cameFrom[next] = current
      open.enqueue(next, candidate)
    }
  }

  #reconstruct(goal: number): number[] {
    const path: number[] = []

    for (let node = goal; node !== -1; node = this.#cameFrom[node]!) {
      path.push(node)
    }

    path.reverse()
    return path
  }
}
