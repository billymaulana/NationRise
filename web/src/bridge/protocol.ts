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

export interface ArmyReadout {
  readonly id: number
  readonly province: number
  readonly nation: number
  readonly count: number
  readonly health: number
  readonly mine: boolean
}

export interface WorldReadout {
  readonly tick: number
  readonly day: number
  readonly hour: number
  readonly player: NationReadout
  readonly armies: readonly ArmyReadout[]
}

export type SpeedName = 'Paused' | 'Ambient' | 'Relaxed' | 'Normal' | 'Fast' | 'Blitz'

export interface Command {
  readonly kind: 'setSpeed' | 'advanceHours'
  readonly speed?: SpeedName
  readonly hours?: number
}

export interface ResourceAmount {
  readonly resource: Resource
  readonly amount: number
}

export interface CostReadout extends ResourceAmount {
  readonly affordable: boolean
}

export interface CityBuildingReadout {
  readonly type: number
  readonly name: string
  readonly level: number
}

export interface BuildingOptionReadout {
  readonly type: number
  readonly name: string
  readonly level: number
  readonly targetLevel: number
  readonly costs: readonly CostReadout[]
  readonly baseHours: number
  readonly hours: number
  readonly blockedReason: string
}

export interface WorkInProgressReadout {
  readonly name: string
  readonly targetLevel: number
  readonly hoursRemaining: number
}

/*
 * Satu kota, sebagaimana panel kota membacanya.
 *
 * Nama kota sengaja tidak ada di sini. Berkas dunia simulasi tidak menyimpan
 * teks apa pun selain tag negara, dan menambahkannya berarti menaruh data milik
 * penyaji ke dalam berkas yang sengaja tidak memuatnya; nama datang dari
 * lapisan render bersama geometrinya.
 */
export interface CityReadout {
  readonly province: number
  readonly nationTag: string
  readonly nationName: string
  readonly population: number
  readonly victoryPoints: number
  readonly morale: number
  readonly occupied: boolean
  readonly slots: number
  readonly usedSlots: number
  readonly production: readonly ResourceAmount[]
  readonly buildings: readonly CityBuildingReadout[]
  readonly constructing: WorkInProgressReadout | null
  readonly mobilising: WorkInProgressReadout | null
  readonly options: readonly BuildingOptionReadout[]
}
