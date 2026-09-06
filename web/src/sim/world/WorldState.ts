import type { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { roundHalfToEven } from '~/sim/determinism/rounding'
import type { GameClock } from '~/sim/time/GameClock'
import type { NationStore } from '~/sim/world/NationStore'
import type { ProvinceStore } from '~/sim/world/ProvinceStore'

/* Kota bernilai populasinya yang dibulatkan, provinsi biasa bernilai satu.
   Dinyatakan sekali di sini karena penghitung kemenangan menilai provinsi yang
   sama; dua salinan aturan ini akan menyimpang tanpa satu uji pun menyadarinya. */
export function victoryPointValueOf(provinces: ProvinceStore, province: number): number {
  return provinces.isCity[province] !== 0 ? roundHalfToEven(provinces.population[province]!) : 1
}

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

      points += victoryPointValueOf(this.provinces, i)
    }

    return points
  }
}
