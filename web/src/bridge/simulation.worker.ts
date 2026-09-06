import * as Comlink from 'comlink'
import type {
  ArmyReadout,
  BuildingOptionReadout,
  CityBuildingReadout,
  CityReadout,
  Command,
  NationReadout,
  ResourceAmount,
  WorldReadout,
} from '~/bridge/protocol'
import { readWorld, type WorldData } from '~/sim/data/WorldFile'
import { costsFor, hoursFor } from '~/sim/buildings/BuildingCost'
import {
  ALL_BUILDING_TYPES,
  BuildingType,
  MAX_BUILDING_LEVEL,
  nameOf,
  slotsFor,
} from '~/sim/buildings/BuildingType'
import { CityBuildings } from '~/sim/buildings/CityBuildings'
import { f32, mulF32 } from '~/sim/determinism/float32'
import { EconomyTick } from '~/sim/economy/EconomyTick'
import { ManpowerPool, fractionFor } from '~/sim/economy/Manpower'
import { dailyOutput } from '~/sim/economy/Production'
import { ceilingOf } from '~/sim/economy/ProvinceStatus'
import { ALL_RESOURCES, isCityGood, Resource, RESOURCE_COUNT } from '~/sim/economy/Resource'
import { Stockpile } from '~/sim/economy/Stockpile'
import { UpkeepSystem } from '~/sim/economy/Upkeep'
import { Army } from '~/sim/military/Army'
import { MECHANIZED_INFANTRY, MOTORIZED_INFANTRY } from '~/sim/military/UnitCatalogue'
import { GameSpeed, secondsPerTick } from '~/sim/time/GameSpeed'
import { victoryPointValueOf, type WorldState } from '~/sim/world/WorldState'

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
  #buildings!: CityBuildings
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
    this.#buildings = new CityBuildings(this.#world, this.#stock)
    this.#upkeep = new UpkeepSystem(this.#world, this.#stock, this.#buildings)

    for (let province = 0; province < this.#data.provinceCount; province++) {
      this.#economy.assignResource(province, this.#data.resourceOf(province))
    }

    this.#player = Math.max(0, this.#world.nations.indexOf(playerTag))
    this.#spawnStartingArmies()

    return this.readout()
  }

  /*
   * Setiap kota memulai dengan satu garnisun. Aturan yang sama dipakai jalur
   * penyaji lain, dan batas empat ratus tumpukan ada karena peta akhir
   * kampanye bisa membawa ratusan — di atas itu penanda saling menimpa dan
   * pemain tidak lagi membaca apa pun darinya.
   *
   * Ini penyiapan skenario sementara, bukan aturan permainan: begitu pemilihan
   * negara dan skenario ada, komposisi awalnya datang dari sana.
   */
  #spawnStartingArmies(): void {
    let nextId = 1

    for (let province = 0; province < this.#data.provinceCount && nextId <= 400; province++) {
      if (!this.#data.isCity(province)) continue

      const army = new Army(nextId++, this.#data.ownerOf(province), province)
      army.add(MOTORIZED_INFANTRY)
      army.add(MECHANIZED_INFANTRY)
      this.#armies.set(army.id, army)
    }
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
      this.#buildings.tick()

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

  /* Provinsi kota yang dikendalikan pemain, dalam urutan indeks yang tetap. */
  cities(): number[] {
    const provinces = this.#world.provinces
    const out: number[] = []

    for (let i = 0; i < provinces.count; i++) {
      if (provinces.isCity[i] !== 0 && provinces.controller[i] === this.#player) out.push(i)
    }

    return out
  }

  city(province: number): CityReadout {
    const provinces = this.#world.provinces
    const nation = provinces.controller[province]!
    const order = this.#buildings.orderIn(province)

    return {
      province,
      nationTag: this.#world.nations.tag[nation] ?? '',
      nationName: this.#world.nations.name[nation] ?? '',
      population: provinces.population[province]!,
      victoryPoints: victoryPointValueOf(provinces, province),
      morale: provinces.morale[province]!,
      occupied: provinces.isOccupied(province),
      slots: slotsFor(provinces.population[province]!),
      usedSlots: this.#buildings.usedSlots(province),
      production: this.#productionOf(province, nation),
      buildings: this.#buildingsIn(province),
      constructing:
        order === null
          ? null
          : {
              name: nameOf(order.type),
              targetLevel: order.targetLevel,
              hoursRemaining: Math.max(0, order.completesAtTick - this.#world.clock.tick),
            },
      /* Mobilisasi belum tersambung ke jembatan; kolomnya sengaja kosong alih-alih
         diisi angka yang tidak berasal dari simulasi. */
      mobilising: null,
      options: this.#optionsIn(province),
    }
  }

  startConstruction(province: number, type: number): CityReadout {
    this.#buildings.begin(province, type as BuildingType)
    return this.city(province)
  }

  cancelConstruction(province: number): CityReadout {
    this.#buildings.cancel(province)
    return this.city(province)
  }

  /* Tiga angka yang ditulis panel kota: barang khas kota, uang, dan manpower. */
  #productionOf(province: number, nation: number): ResourceAmount[] {
    const provinces = this.#world.provinces
    const population = provinces.population[province]!
    const morale = provinces.morale[province]!
    const ceiling = ceilingOf(this.#economy.statusOf(province))
    const good = this.#economy.resourceOf(province)

    const perDay = (resource: Resource): number =>
      Math.trunc(mulF32(dailyOutput(population, morale, resource), ceiling))

    const out: ResourceAmount[] = []
    if (isCityGood(good)) out.push({ resource: good, amount: perDay(good) })
    out.push({ resource: Resource.Money, amount: perDay(Resource.Money) })
    out.push({ resource: Resource.Manpower, amount: this.#manpowerShare(province, nation) })

    return out
  }

  /*
   * Manpower adalah kolam nasional, bukan keluaran provinsi, sehingga tidak ada
   * angka per kota untuk dibaca. Yang dilaporkan di sini adalah porsi kota atas
   * kapasitas negaranya, dipakai membagi pengisian harian yang sudah dihitung
   * simulasi — pembagian angka yang ada, bukan angka baru.
   */
  #manpowerShare(province: number, nation: number): number {
    const capacity = this.#manpower.capacityOf(nation)
    if (capacity <= 0) return 0

    const provinces = this.#world.provinces
    const share = provinces.owner[province] === nation ? f32(1) : f32(0.25)
    const contribution = mulF32(
      mulF32(mulF32(provinces.population[province]!, f32(1000)), share),
      fractionFor(this.#manpower.levelOf(nation)),
    )

    return Math.trunc((this.#manpower.dailyRegenOf(nation, this.#stock) * contribution) / capacity)
  }

  #buildingsIn(province: number): CityBuildingReadout[] {
    const built: CityBuildingReadout[] = []

    for (const type of ALL_BUILDING_TYPES) {
      const level = this.#buildings.levelOf(province, type)
      if (level > 0) built.push({ type, name: nameOf(type), level })
    }

    return built
  }

  #optionsIn(province: number): BuildingOptionReadout[] {
    const nation = this.#world.provinces.controller[province]!

    return ALL_BUILDING_TYPES.map((type) => {
      const level = this.#buildings.levelOf(province, type)
      const targetLevel = Math.min(level + 1, MAX_BUILDING_LEVEL)

      return {
        type,
        name: nameOf(type),
        level,
        targetLevel,
        costs: costsFor(type, targetLevel).map((cost) => ({
          resource: cost.resource,
          amount: cost.amount,
          affordable: this.#stock.get(nation, cost.resource) >= cost.amount,
        })),
        baseHours: hoursFor(type, targetLevel),
        hours: this.#buildings.hoursNeeded(province, type, targetLevel),
        blockedReason: this.#buildings.reasonBlocking(province, type) ?? '',
      }
    })
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
      armies: this.#armyReadouts(),
    }
  }

  #armyReadouts(): ArmyReadout[] {
    const out: ArmyReadout[] = []

    for (const army of this.#armies.values()) {
      if (army.isDestroyed) continue

      out.push({
        id: army.id,
        province: army.province,
        nation: army.nation,
        count: army.count,
        health: army.health,
        mine: army.nation === this.#player,
      })
    }

    return out
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
