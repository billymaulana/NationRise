import type { Resource } from '~/sim/economy/Resource'

/*
 * Yang menyeberang antara simulasi dan antarmuka.
 *
 * Semuanya harus bisa diserialkan, dan itu bukan sekadar syarat teknis Worker:
 * state yang bisa diserialkan adalah state yang bisa disimpan dan diputar
 * ulang, yang merupakan syarat determinisme yang sama.
 *
 * Perintah tidak pernah diterapkan di tengah tick. Ia diantrekan dan diproses
 * di awal tick berikutnya, sehingga satu tick tetap fungsi murni dari state dan
 * seed.
 */

export interface ResourceReadout {
  readonly resource: Resource
  readonly stock: number
  readonly perDay: number
}

export interface NationReadout {
  readonly nation: number
  readonly tag: string
  readonly victoryPoints: number
  readonly resources: readonly ResourceReadout[]
}

export interface WorldReadout {
  readonly tick: number
  readonly day: number
  readonly hour: number
  readonly player: NationReadout
}

export type SpeedName = 'Paused' | 'Ambient' | 'Relaxed' | 'Normal' | 'Fast' | 'Blitz'

export interface Command {
  readonly kind: 'setSpeed' | 'advanceHours'
  readonly speed?: SpeedName
  readonly hours?: number
}
