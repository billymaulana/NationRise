import type { WorldData } from '~/sim/data/WorldFile'
import type { Resource } from '~/sim/economy/Resource'
import type { Terrain } from '~/sim/world/Terrain'
import type { WorldState } from '~/sim/world/WorldState'

export interface ProvinceSummary {
  readonly id: number
  readonly ownerName: string
  readonly controllerName: string
  readonly isCity: boolean
  readonly population: number
  readonly terrain: Terrain
  readonly morale: number
  readonly resource: Resource
  readonly isOccupied: boolean
  readonly isContested: boolean
  readonly landNeighbours: number
  readonly seaNeighbours: number
}

/*
 * Semua yang boleh ditanyakan antarmuka tentang satu provinsi, dikumpulkan di
 * satu tempat supaya panel tidak pernah menjangkau larik provinsi sendiri.
 *
 * Nama datang dari luar: berkas biner simulasi tidak menyimpan teks apa pun
 * selain tag negara, dan menambahkannya berarti menaruh teks milik penyaji ke
 * dalam berkas yang sengaja tidak memuat data penyajian.
 */
export class ProvinceQuery {
  readonly #world: WorldState
  readonly #data: WorldData
  readonly #names: string[]

  constructor(world: WorldState, data: WorldData, provinceNames?: readonly string[]) {
    if (data.provinceCount !== world.provinces.count) {
      throw new RangeError(
        `data dunia memuat ${data.provinceCount} provinsi tetapi state memuat ${world.provinces.count}`,
      )
    }

    this.#world = world
    this.#data = data
    this.#names = new Array<string>(world.provinces.count).fill('')

    if (provinceNames) {
      const shared = Math.min(provinceNames.length, this.#names.length)
      for (let i = 0; i < shared; i++) this.#names[i] = provinceNames[i] ?? ''
    }
  }

  get count(): number {
    return this.#world.provinces.count
  }

  nameOf(province: number): string {
    return this.#names[this.#checked(province)]!
  }

  summarise(province: number): ProvinceSummary {
    const p = this.#world.provinces.at(this.#checked(province))

    return {
      id: province,
      ownerName: this.#nationName(p.owner),
      controllerName: this.#nationName(p.controller),
      isCity: p.isCity,
      population: p.population,
      terrain: p.terrain,
      morale: p.morale,
      resource: this.#data.resourceOf(province),
      isOccupied: p.isOccupied,
      isContested: p.isContested,
      landNeighbours: this.#data.land.neighboursOf(province).length,
      seaNeighbours: this.#data.sea.neighboursOf(province).length,
    }
  }

  neighboursOf(province: number): { land: number[]; sea: number[] } {
    this.#checked(province)

    return {
      land: [...this.#data.land.neighboursOf(province)],
      sea: [...this.#data.sea.neighboursOf(province)],
    }
  }

  findCity(name: string): number {
    const wanted = name.trim().toLowerCase()
    if (wanted.length === 0) return -1

    for (let i = 0; i < this.#names.length; i++) {
      if (this.#world.provinces.isCity[i] !== 0 && this.#names[i]!.toLowerCase() === wanted) {
        return i
      }
    }

    return -1
  }

  #nationName(nation: number): string {
    return nation < this.#world.nations.count ? this.#world.nations.name[nation]! : ''
  }

  #checked(province: number): number {
    if (province < 0 || province >= this.#world.provinces.count) {
      throw new RangeError(
        `provinsi ${province} di luar peta 0..${this.#world.provinces.count - 1}`,
      )
    }

    return province
  }
}
