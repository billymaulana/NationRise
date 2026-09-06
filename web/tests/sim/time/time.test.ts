import { describe, expect, it } from 'vitest'
import { GameClock } from '~/sim/time/GameClock'
import { fromTick, HOURS_PER_DAY, toTick } from '~/sim/time/GameDate'
import { GameSpeed, faster, label, minutesPerGameDay, secondsPerTick, slower } from '~/sim/time/GameSpeed'

/* Diport dari NationRise.Core.Tests/Time. Nilai harapan disalin apa adanya. */

describe('GameClock', () => {
  it('mulai di hari pertama', () => {
    const clock = new GameClock()

    expect(clock.tick).toBe(0)
    expect(clock.date.day).toBe(1)
    expect(clock.isDayBoundary).toBe(true)
  })

  it('batas hari jatuh setiap dua puluh empat tick', () => {
    const clock = new GameClock()
    let boundaries = 0

    for (let i = 0; i < 72; i++) {
      clock.advance()
      if (clock.isDayBoundary) boundaries++
    }

    expect(boundaries).toBe(3)
  })

  it('hanya restore yang boleh mundur', () => {
    const clock = new GameClock()
    clock.advanceTo(500)

    clock.restoreTo(100)
    expect(clock.tick).toBe(100)

    expect(() => clock.restoreTo(-1)).toThrow(RangeError)
  })

  it('menolak mundur saat bermain', () => {
    const clock = new GameClock()
    clock.advanceTo(100)

    expect(() => clock.advanceTo(99)).toThrow(RangeError)
  })
})

describe('GameDate', () => {
  it.each([
    [0, 1, 0],
    [23, 1, 23],
    [24, 2, 0],
    [1080, 46, 0],
  ])('tick %i memetakan ke hari %i jam %i', (tick, day, hour) => {
    const date = fromTick(tick)

    expect(date.day).toBe(day)
    expect(date.hour).toBe(hour)
  })

  it.each([[0], [37], [1079]])('tick %i pulang pergi lewat tanggal', (tick) => {
    expect(toTick(fromTick(tick))).toBe(tick)
  })

  it('kampanye standar berdurasi empat puluh lima hari', () => {
    expect(fromTick(45 * HOURS_PER_DAY).day).toBe(46)
  })

  it('menolak tick negatif', () => {
    expect(() => fromTick(-1)).toThrow(RangeError)
  })
})

describe('GameSpeed', () => {
  it('jeda tidak pernah berdetak', () => {
    expect(secondsPerTick(GameSpeed.Paused)).toBe(Number.POSITIVE_INFINITY)
    expect(minutesPerGameDay(GameSpeed.Paused)).toBe(0)
  })

  it('normal berarti lima menit per hari', () => {
    expect(minutesPerGameDay(GameSpeed.Normal)).toBeCloseTo(5, 2)
    expect(secondsPerTick(GameSpeed.Normal)).toBeCloseTo(12.5, 2)
  })

  it('kecepatan lebih tinggi memakan waktu nyata lebih sedikit', () => {
    let previous = Number.POSITIVE_INFINITY

    for (const speed of [
      GameSpeed.Ambient,
      GameSpeed.Relaxed,
      GameSpeed.Normal,
      GameSpeed.Fast,
      GameSpeed.Blitz,
    ]) {
      const seconds = secondsPerTick(speed)
      expect(seconds).toBeLessThan(previous)
      previous = seconds
    }
  })

  it('langkah kecepatan tetap dalam rentang', () => {
    expect(slower(GameSpeed.Paused)).toBe(GameSpeed.Paused)
    expect(faster(GameSpeed.Blitz)).toBe(GameSpeed.Blitz)
    expect(faster(GameSpeed.Normal)).toBe(GameSpeed.Fast)
    expect(slower(GameSpeed.Normal)).toBe(GameSpeed.Relaxed)
  })

  /* Kampanye 45 hari pada Normal harus muat satu malam; tangga kecepatan ada
     supaya pemain memilih sendiri seberapa panjang malam itu. */
  it('kampanye standar muat satu malam', () => {
    const hours = (45 * minutesPerGameDay(GameSpeed.Normal)) / 60
    expect(hours).toBeGreaterThanOrEqual(3)
    expect(hours).toBeLessThanOrEqual(4.5)

    const blitz = (45 * minutesPerGameDay(GameSpeed.Blitz)) / 60
    expect(blitz).toBeGreaterThanOrEqual(0.7)
    expect(blitz).toBeLessThanOrEqual(1.2)
  })

  it('memberi label untuk setiap kecepatan', () => {
    expect(label(GameSpeed.Paused)).toBe('Paused')
    expect(label(GameSpeed.Blitz)).toBe('Blitz')
  })
})
