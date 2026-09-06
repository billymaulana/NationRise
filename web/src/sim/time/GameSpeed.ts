import { HOURS_PER_DAY } from '~/sim/time/GameDate'

export enum GameSpeed {
  Paused = 0,
  Ambient = 1,
  Relaxed = 2,
  Normal = 3,
  Fast = 4,
  Blitz = 5,
}

/*
 * Kecepatan dinyatakan dalam menit nyata per hari permainan, bukan pengali,
 * supaya lajunya terbaca: "lima menit sehari" bisa dipakai merencanakan satu
 * malam, "4x" tidak.
 */
const MINUTES_PER_DAY: Readonly<Record<GameSpeed, number>> = {
  [GameSpeed.Paused]: 0,
  [GameSpeed.Ambient]: 60,
  [GameSpeed.Relaxed]: 15,
  [GameSpeed.Normal]: 5,
  [GameSpeed.Fast]: 2.5,
  [GameSpeed.Blitz]: 1.25,
}

const LABELS: Readonly<Record<GameSpeed, string>> = {
  [GameSpeed.Paused]: 'Paused',
  [GameSpeed.Ambient]: 'Ambient',
  [GameSpeed.Relaxed]: 'Relaxed',
  [GameSpeed.Normal]: 'Normal',
  [GameSpeed.Fast]: 'Fast',
  [GameSpeed.Blitz]: 'Blitz',
}

export function minutesPerGameDay(speed: GameSpeed): number {
  return MINUTES_PER_DAY[speed]
}

export function secondsPerTick(speed: GameSpeed): number {
  return speed === GameSpeed.Paused
    ? Number.POSITIVE_INFINITY
    : (minutesPerGameDay(speed) * 60) / HOURS_PER_DAY
}

export function label(speed: GameSpeed): string {
  return LABELS[speed]
}

export function faster(speed: GameSpeed): GameSpeed {
  return speed >= GameSpeed.Blitz ? GameSpeed.Blitz : speed + 1
}

export function slower(speed: GameSpeed): GameSpeed {
  return speed <= GameSpeed.Paused ? GameSpeed.Paused : speed - 1
}
