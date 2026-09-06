import type { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { roundHalfToEven } from '~/sim/determinism/rounding'
import type { GameClock } from '~/sim/time/GameClock'
import type { NationStore } from '~/sim/world/NationStore'
import type { ProvinceStore } from '~/sim/world/ProvinceStore'

export class WorldState {
  constructor(
    readonly provinces: ProvinceStore,
    readonly nations: NationStore,
    readonly clock: GameClock,
    readonly random: DeterministicRandom,
  ) {}

  victoryPointsOf(nation: number): number {
    let points = 0

    for (let i = 0; i < this.provinces.count; i++) {
      if (this.provinces.controller[i] !== nation) continue

      points += this.provinces.isCity[i] !== 0
        ? roundHalfToEven(this.provinces.population[i]!)
        : 1
    }

    return points
  }
}
