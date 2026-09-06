import { describe, expect, it } from 'vitest'
import { ProvinceGraph, readWorld, WorldData } from '~/sim/data/WorldFile'
import { roundHalfToEven } from '~/sim/determinism/rounding'
import {
  CampaignLength,
  campaignPresetOf,
  VictoryTracker,
} from '~/sim/victory/VictoryTracker'
import type { WorldState } from '~/sim/world/WorldState'
import { worldBinary } from '../../helpers/worldAssets'

/* Diport dari NationRise.Core.Tests/Victory/VictoryTrackerTests.cs. */

function realWorld(): WorldState {
  return readWorld(worldBinary()).toWorldState(1)
}

function indonesia(state: WorldState): number {
  return state.nations.indexOf('IDN')
}

/* Aritmetika yang cukup kecil untuk diperiksa dengan tangan: dengan nilai
   bawaannya, sembilan puluh provinsi biasa ditambah sepuluh kota berpopulasi
   lima adalah 140 poin. */
function smallWorld(provinces = 100): WorldState {
  const owner = new Uint16Array(provinces)
  const terrain = new Uint8Array(provinces)
  const population = new Float32Array(provinces)
  const isCity = new Uint8Array(provinces)
  const resource = new Uint8Array(provinces)
  const claimOffsets = new Int32Array(provinces + 1)
  const claims: number[] = []

  for (let i = 0; i < provinces; i++) {
    owner[i] = i < Math.trunc((provinces * 6) / 10) ? 0 : 1
    isCity[i] = i % 10 === 0 ? 1 : 0
    population[i] = isCity[i] !== 0 ? 5 : 1
    claimOffsets[i] = claims.length
    claims.push(owner[i]!)
  }

  claimOffsets[provinces] = claims.length

  const unlinked = new ProvinceGraph(new Int32Array(provinces + 1), new Uint16Array(0))
  return new WorldData(
    ['AAA', 'BBB'], owner, terrain, population, isCity, resource,
    claimOffsets, Uint16Array.from(claims), unlinked, unlinked,
  ).toWorldState(1)
}

function runTo(state: WorldState, day: number): void {
  while (state.clock.date.day < day) state.clock.advance()
}

describe('VictoryTracker', () => {
  it('ambangnya adalah bagian dari total dunia, bukan sebuah konstanta', () => {
    const standard = campaignPresetOf(CampaignLength.Standard)
    const hundred = new VictoryTracker(smallWorld(), 0, standard)
    const twoHundred = new VictoryTracker(smallWorld(200), 0, standard)

    expect(hundred.worldPoints).toBe(140)
    expect(hundred.threshold).toBe(42)

    expect(twoHundred.worldPoints).toBe(280)
    expect(twoHundred.threshold).toBe(84)
  })

  it('total dunia adalah provinsi biasa ditambah populasi kota', () => {
    const state = realWorld()
    let plain = 0
    let cityPopulation = 0

    for (let i = 0; i < state.provinces.count; i++) {
      if (state.provinces.isCity[i] !== 0) {
        cityPopulation += roundHalfToEven(state.provinces.population[i]!)
      } else {
        plain++
      }
    }

    const tracker = new VictoryTracker(
      state, indonesia(state), campaignPresetOf(CampaignLength.Standard),
    )

    expect(tracker.worldPoints).toBe(plain + cityPopulation)
    expect(tracker.threshold).toBe(Math.trunc((tracker.worldPoints * 30) / 100))
  })

  it('setiap preset menetapkan panjang dan ambangnya sendiri', () => {
    const world = smallWorld()
    const shortRun = new VictoryTracker(world, 0, campaignPresetOf(CampaignLength.Short))
    const standard = new VictoryTracker(world, 0, campaignPresetOf(CampaignLength.Standard))
    const longRun = new VictoryTracker(world, 0, campaignPresetOf(CampaignLength.Long))

    expect([shortRun.preset.days, shortRun.preset.worldSharePercent, shortRun.threshold])
      .toEqual([30, 25, 35])
    expect([standard.preset.days, standard.preset.worldSharePercent, standard.threshold])
      .toEqual([45, 30, 42])
    expect([longRun.preset.days, longRun.preset.worldSharePercent, longRun.threshold])
      .toEqual([60, 35, 49])
  })

  it('Indonesia mulai jauh di bawah ambangnya', () => {
    const state = realWorld()
    const tracker = new VictoryTracker(
      state, indonesia(state), campaignPresetOf(CampaignLength.Standard),
    )

    expect(tracker.playerPoints).toBeGreaterThan(0)
    expect(tracker.playerPoints * 5).toBeLessThan(tracker.threshold)
    expect(tracker.playerProgressPercent).toBeGreaterThanOrEqual(1)
    expect(tracker.playerProgressPercent).toBeLessThanOrEqual(20)
    expect(tracker.hasReachedThreshold(tracker.player)).toBe(false)
  })

  it('merebut tanah menaikkan poin dan kemajuan', () => {
    const state = realWorld()
    const idn = indonesia(state)
    const tracker = new VictoryTracker(state, idn, campaignPresetOf(CampaignLength.Standard))

    const pointsBefore = tracker.playerPoints
    const percentBefore = tracker.playerProgressPercent
    const thresholdBefore = tracker.threshold
    let taken = 0

    for (let i = 0; i < state.provinces.count && taken < 400; i++) {
      if (state.provinces.controller[i] !== idn) {
        state.provinces.controller[i] = idn
        taken++
      }
    }

    expect(taken).toBe(400)
    expect(tracker.playerPoints).toBeGreaterThan(pointsBefore)
    expect(tracker.playerProgressPercent).toBeGreaterThan(percentBefore)
    expect(tracker.threshold).toBe(thresholdBefore)
  })

  it('negara tanpa provinsi tersingkir', () => {
    const state = realWorld()
    const idn = indonesia(state)
    const tracker = new VictoryTracker(state, idn, campaignPresetOf(CampaignLength.Standard))

    expect(tracker.eliminatedNations()).toEqual([])

    const victim = tracker.leader.nation
    for (let i = 0; i < state.provinces.count; i++) {
      if (state.provinces.controller[i] === victim) state.provinces.controller[i] = idn
    }

    expect(tracker.isEliminated(victim)).toBe(true)
    expect(tracker.pointsOf(victim)).toBe(0)
    expect(tracker.eliminatedNations()).toContain(victim)
    expect(tracker.isEliminated(idn)).toBe(false)
    expect(tracker.hasLost).toBe(false)
  })

  it('pemain yang kehilangan setiap provinsi berarti kalah', () => {
    const state = realWorld()
    const idn = indonesia(state)
    const tracker = new VictoryTracker(state, idn, campaignPresetOf(CampaignLength.Standard))
    const conqueror = idn === 0 ? 1 : 0

    for (let i = 0; i < state.provinces.count; i++) {
      if (state.provinces.controller[i] === idn) state.provinces.controller[i] = conqueror
    }

    expect(tracker.hasLost).toBe(true)
    expect(tracker.playerPoints).toBe(0)
    expect(tracker.playerProgressPercent).toBe(0)
  })

  it('papan peringkat menurun dan menghormati batas atas', () => {
    const state = realWorld()
    const tracker = new VictoryTracker(
      state, indonesia(state), campaignPresetOf(CampaignLength.Standard),
    )

    const board = tracker.leaderboard(5)

    expect(board).toHaveLength(5)
    for (let i = 1; i < board.length; i++) {
      expect(board[i - 1]!.points).toBeGreaterThanOrEqual(board[i]!.points)
    }

    expect(board[0]).toEqual(tracker.leader)
    expect(tracker.pointsOf(board[0]!.nation)).toBe(board[0]!.points)
    expect(tracker.leaderboard(0)).toEqual([])
    expect(tracker.leaderboard(1)).toHaveLength(1)
  })

  it('pemuncak memegang lebih banyak poin daripada pemain awal', () => {
    const state = realWorld()
    const tracker = new VictoryTracker(
      state, indonesia(state), campaignPresetOf(CampaignLength.Standard),
    )

    expect(tracker.leader.points).toBeGreaterThan(tracker.playerPoints)
    expect(tracker.leader.nation).not.toBe(tracker.player)
  })

  it('kemenangan dicatat tanpa menghentikan permainan', () => {
    const state = realWorld()
    const idn = indonesia(state)
    const tracker = new VictoryTracker(state, idn, campaignPresetOf(CampaignLength.Standard))

    runTo(state, 5)
    for (let i = 0; i < state.provinces.count; i++) state.provinces.controller[i] = idn

    tracker.tick()

    expect(tracker.hasWon).toBe(true)
    expect(tracker.wonOnDay).toBe(5)
    expect(tracker.playerProgressPercent).toBeGreaterThan(100)

    const rival = idn === 0 ? 1 : 0
    runTo(state, 12)
    for (let i = 0; i < 200; i++) state.provinces.controller[i] = rival

    tracker.tick()

    expect(state.clock.date.day).toBe(12)
    expect(tracker.hasWon).toBe(true)
    expect(tracker.wonOnDay).toBe(5)
    expect(tracker.wonDayOf(rival)).toBeNull()
    expect(tracker.pointsOf(rival)).toBeGreaterThan(0)
    expect(tracker.playerPoints).toBeLessThan(tracker.worldPoints)
    expect(tracker.isEliminated(idn)).toBe(false)
    expect(tracker.leaderboard(5)).toHaveLength(2)
  })

  it('negara yang tidak dikenal ditolak', () => {
    const world = smallWorld()
    const preset = campaignPresetOf(CampaignLength.Standard)

    expect(() => new VictoryTracker(world, 7, preset)).toThrow(RangeError)
    expect(() => new VictoryTracker(world, 0, preset).pointsOf(-1)).toThrow(RangeError)
  })
})
