import { describe, expect, it } from 'vitest'
import { BuildingType } from '~/sim/buildings/BuildingType'
import { CityBuildings } from '~/sim/buildings/CityBuildings'
import { readWorld } from '~/sim/data/WorldFile'
import { ALL_RESOURCES, Resource } from '~/sim/economy/Resource'
import { Stockpile } from '~/sim/economy/Stockpile'
import { RESEARCH_SLOTS, ResearchQueue, ResearchRejected } from '~/sim/research/ResearchQueue'
import { ALL_RESEARCH_NODES, researchNodeById } from '~/sim/research/ResearchTree'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Research/ResearchTests.cs. */

interface Harness {
  state: WorldState
  stock: Stockpile
  buildings: CityBuildings
  queue: ResearchQueue
  nation: number
}

function setup(rich = true): Harness {
  const state = readWorld(worldBinary()).toWorldState(1)
  const stock = new Stockpile(state.nations.count)
  const buildings = new CityBuildings(state, stock)
  const nation = state.nations.indexOf('IDN')

  if (rich) {
    for (const resource of ALL_RESOURCES) stock.add(nation, resource, 1_000_000)
  }

  return { state, stock, buildings, queue: new ResearchQueue(state, stock, buildings), nation }
}

function runTo(state: WorldState, day: number): void {
  while (state.clock.date.day < day) state.clock.advance()
}

function firstCityOf(state: WorldState, nation: number): number {
  for (let i = 0; i < state.provinces.count; i++) {
    if (state.provinces.owner[i] === nation && state.provinces.isCity[i] !== 0) return i
  }

  throw new Error('Nation has no city.')
}

describe('ResearchQueue', () => {
  it('riset hari pertama langsung tersedia', () => {
    const h = setup()
    expect(h.queue.canStart(h.nation, researchNodeById('motorized_1')).ok).toBe(true)
  })

  it('riset yang lebih jauh digerbangi hari permainan', () => {
    const h = setup()
    const node = researchNodeById('tank_2')

    const early = h.queue.canStart(h.nation, node)
    expect(early.ok).toBe(false)
    expect(early.reason.toLowerCase()).toContain('day')

    runTo(h.state, node.availableFromDay)
    expect(h.queue.canStart(h.nation, node).reason.toLowerCase()).not.toContain('day')
  })

  it('hanya dua hal yang bisa diteliti sekaligus', () => {
    const h = setup()
    runTo(h.state, 10)

    /* Tiga simpul tanpa prasyarat bangunan, supaya yang diuji adalah batas slot
       alih-alih tersandung Army Base yang tidak ada. */
    h.queue.start(h.nation, researchNodeById('motorized_1'))
    h.queue.start(h.nation, researchNodeById('entrenchment'))

    expect(h.queue.activeCount(h.nation)).toBe(RESEARCH_SLOTS)
    expect(() => h.queue.start(h.nation, researchNodeById('logistics'))).toThrow(ResearchRejected)
  })

  it('riset selesai setelah durasinya', () => {
    const h = setup()
    const node = researchNodeById('motorized_1')
    const order = h.queue.start(h.nation, node)

    expect(h.queue.hasCompleted(h.nation, node.id)).toBe(false)

    while (h.state.clock.tick < order.completesAtTick) h.state.clock.advance()

    h.queue.tick()

    expect(h.queue.hasCompleted(h.nation, node.id)).toBe(true)
    expect(h.queue.activeCount(h.nation)).toBe(0)
    expect(h.queue.finishedThisTick).toHaveLength(1)
  })

  it('prasyarat harus diteliti lebih dulu', () => {
    const h = setup()
    runTo(h.state, 15)

    const blocked = h.queue.canStart(h.nation, researchNodeById('motorized_2'))
    expect(blocked.ok).toBe(false)
    expect(blocked.reason).toContain('Requires')

    const first = h.queue.start(h.nation, researchNodeById('motorized_1'))
    h.state.clock.advanceTo(first.completesAtTick)
    h.queue.tick()

    expect(h.queue.canStart(h.nation, researchNodeById('motorized_2')).ok).toBe(true)
  })

  it('sebagian riset butuh bangunan lebih dulu', () => {
    const h = setup()
    runTo(h.state, 10)

    const node = researchNodeById('fighter_1')
    const blocked = h.queue.canStart(h.nation, node)
    expect(blocked.ok).toBe(false)
    expect(blocked.reason).toContain('Air Base')

    const city = firstCityOf(h.state, h.nation)
    const order = h.buildings.begin(city, BuildingType.AirBase)
    h.state.clock.advanceTo(order.completesAtTick)
    h.buildings.tick()

    expect(h.queue.canStart(h.nation, node).ok).toBe(true)
  })

  it('riset memakan sumber daya', () => {
    const h = setup()
    const before = h.stock.get(h.nation, Resource.RareResources)

    h.queue.start(h.nation, researchNodeById('motorized_1'))

    expect(h.stock.get(h.nation, Resource.RareResources)).toBeLessThan(before)
  })

  it('negara miskin tidak bisa meneliti', () => {
    const h = setup(false)

    const blocked = h.queue.canStart(h.nation, researchNodeById('motorized_1'))
    expect(blocked.ok).toBe(false)
    expect(blocked.reason).toContain('Not enough')
  })

  it('daftar tersedia menghormati setiap gerbang', () => {
    const h = setup()
    const earlyCount = h.queue.availableTo(h.nation).length

    runTo(h.state, 12)
    const laterCount = h.queue.availableTo(h.nation).length

    expect(laterCount).toBeGreaterThan(earlyCount)
  })
})

describe('ResearchTree', () => {
  /* Setiap simpul harus bisa dicapai, atau pohonnya memuat cabang mati yang
     bisa dilihat pemain tapi tidak pernah bisa diambil. */
  it('setiap prasyarat simpul benar-benar ada', () => {
    for (const node of ALL_RESEARCH_NODES) {
      if (node.requires !== null) expect(researchNodeById(node.requires)).toBeDefined()
    }
  })

  it('prasyarat terbuka tidak lebih awal daripada induknya', () => {
    for (const node of ALL_RESEARCH_NODES) {
      if (node.requires === null) continue

      const parent = researchNodeById(node.requires)
      expect(node.availableFromDay).toBeGreaterThanOrEqual(parent.availableFromDay)
    }
  })
})

/*
 * Uji C# hanya memeriksa potongan kata dalam alasan penolakan dan jumlah
 * relatif dalam daftar tersedia, sehingga pesan yang salah tulis atau gerbang
 * yang salah urut tetap lolos. Nilai di bawah diambil dengan menjalankan
 * ResearchQueue rujukan pada susunan yang sama.
 */
describe('gerbang riset cocok dengan implementasi rujukan', () => {
  it('pohonnya menyimpan simpul dalam urutan yang sama persis', () => {
    expect(ALL_RESEARCH_NODES.map((node) => node.id)).toEqual([
      'motorized_1',
      'motorized_2',
      'mechanized_1',
      'naval_infantry',
      'tank_1',
      'tank_2',
      'artillery_1',
      'mobile_artillery',
      'fighter_1',
      'strike_fighter',
      'corvette',
      'destroyer',
      'logistics',
      'entrenchment',
    ])
  })

  it('daftar tersedia berisi simpul yang sama persis', () => {
    const h = setup()
    expect(h.queue.availableTo(h.nation).map((node) => node.id)).toEqual(['motorized_1'])

    runTo(h.state, 12)
    expect(h.queue.availableTo(h.nation).map((node) => node.id)).toEqual([
      'motorized_1',
      'logistics',
      'entrenchment',
    ])
  })

  it('setiap alasan penolakan berbunyi sama persis', () => {
    const h = setup()
    runTo(h.state, 12)

    expect(h.queue.canStart(h.nation, researchNodeById('tank_2')).reason).toBe(
      'Available from day 13.',
    )
    expect(h.queue.canStart(h.nation, researchNodeById('fighter_1')).reason).toBe(
      'Requires Air Base level 1.',
    )
    expect(h.queue.canStart(h.nation, researchNodeById('motorized_2')).reason).toBe(
      'Requires Motorized Infantry.',
    )
    expect(setup(false).queue.canStart(h.nation, researchNodeById('motorized_1')).reason).toBe(
      'Not enough Food.',
    )

    h.queue.start(h.nation, researchNodeById('motorized_1'))
    h.queue.start(h.nation, researchNodeById('entrenchment'))

    expect(h.queue.canStart(h.nation, researchNodeById('logistics')).reason).toBe(
      'Both research slots are busy.',
    )
  })

  it('pesanan selesai pada tick dan harga yang sama persis', () => {
    const h = setup()
    runTo(h.state, 12)

    const money = h.stock.get(h.nation, Resource.Money)
    const order = h.queue.start(h.nation, researchNodeById('motorized_1'))

    expect(h.state.clock.tick).toBe(264)
    expect(order.completesAtTick).toBe(270)
    expect(money - h.stock.get(h.nation, Resource.Money)).toBe(1500)

    h.state.clock.advanceTo(order.completesAtTick)
    h.queue.tick()

    expect(h.queue.finishedThisTick).toEqual([{ nation: h.nation, nodeId: 'motorized_1' }])
    expect([...h.queue.completedFor(h.nation)]).toEqual(['motorized_1'])
    expect(h.queue.canStart(h.nation, researchNodeById('motorized_1')).reason).toBe(
      'Already researched.',
    )
  })
})
