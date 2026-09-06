import * as Comlink from 'comlink'
import type { Command, NationReadout, WorldReadout } from '~/bridge/protocol'
import { readWorld, type WorldData } from '~/sim/data/WorldFile'
import { CityBuildings } from '~/sim/buildings/CityBuildings'
import { EconomyTick } from '~/sim/economy/EconomyTick'
import { ManpowerPool } from '~/sim/economy/Manpower'
import { ALL_RESOURCES, Resource, RESOURCE_COUNT } from '~/sim/economy/Resource'
import { Stockpile } from '~/sim/economy/Stockpile'
import { UpkeepSystem } from '~/sim/economy/Upkeep'
import type { Army } from '~/sim/military/Army'
import { GameSpeed, secondsPerTick } from '~/sim/time/GameSpeed'
import type { WorldState } from '~/sim/world/WorldState'

/*
 * Simulasi hidup di sini, bukan di utas utama.
 *
 * Bukan sekadar demi kelancaran: batas lapisannya jadi fisik, bukan sekadar
 * konvensi. Kode yang tidak bisa mengakses DOM tidak akan menyentuh DOM.
 */
class Simulation {
  #world!: WorldState
  #data!: WorldData
  #stock!: Stockpile
  #economy!: EconomyTick
  #manpower!: ManpowerPool
  #upkeep!: UpkeepSystem
  #player = 0
  #speed = GameSpeed.Paused

  readonly #armies = new Map<number, Army>()
  readonly #pending: Command[] = []

  async load(worldBytes: ArrayBuffer, playerTag: string): Promise<WorldReadout> {
    this.#data = readWorld(worldBytes)
    this.#world = this.#data.toWorldState(20260906)
    this.#stock = new Stockpile(this.#world.nations.count)
    this.#economy = new EconomyTick(this.#world, this.#stock)
    this.#manpower = new ManpowerPool(this.#world)
    this.#upkeep = new UpkeepSystem(
      this.#world,
      this.#stock,
      new CityBuildings(this.#world, this.#stock),
    )

    for (let province = 0; province < this.#data.provinceCount; province++) {
      this.#economy.assignResource(province, this.#data.resourceOf(province))
    }

    this.#player = Math.max(0, this.#world.nations.indexOf(playerTag))

    return this.readout()
  }

  send(command: Command): void {
    this.#pending.push(command)
  }

  /* Satu hari permainan, dijalankan sebagai dua puluh empat tick. Perintah
     diterapkan sebelum tick pertama, tidak pernah di tengah. */
  advance(hours: number): WorldReadout {
    this.#drain()

    for (let i = 0; i < hours; i++) {
      this.#world.clock.advance()

      if (this.#world.clock.isDayBoundary) {
        this.#economy.runDay()
        this.#manpower.runDay(this.#stock)
        this.#upkeep.runDay(this.#armies)
      }
    }

    return this.readout()
  }

  secondsPerTick(): number {
    return secondsPerTick(this.#speed)
  }

  #drain(): void {
    while (this.#pending.length > 0) {
      const command = this.#pending.shift()!
      if (command.kind === 'setSpeed' && command.speed !== undefined) {
        this.#speed = GameSpeed[command.speed]
      }
    }
  }

  readout(): WorldReadout {
    const date = this.#world.clock.date

    return {
      tick: this.#world.clock.tick,
      day: date.day,
      hour: date.hour,
      player: this.#nationReadout(this.#player),
    }
  }

  #nationReadout(nation: number): NationReadout {
    const income = new Float64Array(this.#world.nations.count * RESOURCE_COUNT)
    this.#economy.dailyIncomeInto(income)

    return {
      nation,
      tag: this.#world.nations.tag[nation] ?? '',
      victoryPoints: this.#world.victoryPointsOf(nation),
      resources: ALL_RESOURCES.map((resource) => ({
        resource,
        stock: this.#stock.get(nation, resource),
        perDay:
          /* Manpower tidak datang dari tick ekonomi seperti sumber daya lain;
             menanyakannya ke sana melaporkan nol datar dan diam-diam memberi
             tahu pemain bahwa cadangannya tidak bergerak. */
          resource === Resource.Manpower
            ? this.#manpower.dailyRegenOf(nation, this.#stock)
            : (income[nation * RESOURCE_COUNT + resource] ?? 0) -
              this.#upkeep.billOf(nation, resource),
      })),
    }
  }
}

Comlink.expose(new Simulation())

export type SimulationApi = Simulation
