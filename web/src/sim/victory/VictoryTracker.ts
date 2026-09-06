import { intDiv } from '~/sim/determinism/rounding'
import { victoryPointValueOf, type WorldState } from '~/sim/world/WorldState'

export enum CampaignLength {
  Short = 0,
  Standard = 1,
  Long = 2,
}

export interface CampaignPreset {
  readonly length: CampaignLength
  readonly days: number
  readonly worldSharePercent: number
}

export function campaignPresetOf(length: CampaignLength): CampaignPreset {
  switch (length) {
    case CampaignLength.Short:
      return { length: CampaignLength.Short, days: 30, worldSharePercent: 25 }
    case CampaignLength.Standard:
      return { length: CampaignLength.Standard, days: 45, worldSharePercent: 30 }
    case CampaignLength.Long:
      return { length: CampaignLength.Long, days: 60, worldSharePercent: 35 }
    default:
      throw new RangeError(`panjang kampanye tidak dikenal: ${length}`)
  }
}

export interface LeaderboardEntry {
  readonly nation: number
  readonly points: number
}

export function totalPointsOf(world: WorldState): number {
  const provinces = world.provinces
  let total = 0

  for (let i = 0; i < provinces.count; i++) {
    total += victoryPointValueOf(provinces, i)
  }

  return total
}

/*
 * Mencatat skor dan tidak lebih. Mencapai ambangnya dicatat, tidak pernah
 * dipaksakan: kampanyenya boleh berjalan melewati kondisi kemenangannya
 * sendiri, sehingga tidak ada anggota di sini yang mengembalikan vonis yang
 * harus dihentikan pemanggilnya.
 */
export class VictoryTracker {
  readonly preset: CampaignPreset
  readonly player: number
  readonly worldPoints: number
  readonly threshold: number

  readonly #points: Int32Array
  readonly #provinces: Int32Array
  readonly #wonOnDay: Int32Array

  constructor(
    private readonly world: WorldState,
    player: number,
    preset: CampaignPreset,
  ) {
    if (player < 0 || player >= world.nations.count) {
      throw new RangeError(`negara ${player} di luar 0..${world.nations.count - 1}`)
    }

    this.#points = new Int32Array(world.nations.count)
    this.#provinces = new Int32Array(world.nations.count)
    this.#wonOnDay = new Int32Array(world.nations.count)

    this.player = player
    this.preset = preset

    /* Dipatok saat permainan dibuat. Penaklukan memindahkan poin antar negara
       tanpa mengubah berapa banyak yang ada, sehingga ambang yang diambil dari
       totalnya tidak bisa melorot di bawah pemain di tengah kampanye, dan
       jumlah provinsi tetap parameter pipeline alih-alih konstanta imbang yang
       dipanggang ke dalam aturannya. */
    this.worldPoints = totalPointsOf(world)
    this.threshold = intDiv(this.worldPoints * preset.worldSharePercent, 100)

    this.#tally()
  }

  pointsOf(nation: number): number {
    this.#tally()
    return this.#points[this.#checked(nation)]!
  }

  get playerPoints(): number {
    return this.pointsOf(this.player)
  }

  /* Sengaja tanpa batas atas: pemain yang terus menaklukkan setelah ambangnya
     seharusnya melihat angkanya terus memanjat alih-alih diam di bilah yang
     sudah selesai. */
  progressPercentOf(nation: number): number {
    return this.threshold <= 0 ? 0 : intDiv(this.pointsOf(nation) * 100, this.threshold)
  }

  get playerProgressPercent(): number {
    return this.progressPercentOf(this.player)
  }

  hasReachedThreshold(nation: number): boolean {
    return this.threshold > 0 && this.pointsOf(nation) >= this.threshold
  }

  provinceCountOf(nation: number): number {
    this.#tally()
    return this.#provinces[this.#checked(nation)]!
  }

  isEliminated(nation: number): boolean {
    return this.provinceCountOf(nation) === 0
  }

  get hasLost(): boolean {
    return this.isEliminated(this.player)
  }

  wonDayOf(nation: number): number | null {
    const day = this.#wonOnDay[this.#checked(nation)]!
    return day === 0 ? null : day
  }

  get wonOnDay(): number | null {
    return this.wonDayOf(this.player)
  }

  get hasWon(): boolean {
    return this.wonOnDay !== null
  }

  get leader(): LeaderboardEntry {
    this.#tally()

    let best = -1
    for (let nation = 0; nation < this.#points.length; nation++) {
      if (best < 0 || this.#points[nation]! > this.#points[best]!) best = nation
    }

    return best < 0 ? { nation: -1, points: 0 } : { nation: best, points: this.#points[best]! }
  }

  leaderboard(top: number): LeaderboardEntry[] {
    if (top < 0) {
      throw new RangeError(`batas papan peringkat tidak boleh negatif: ${top}`)
    }

    this.#tally()

    const ranked: LeaderboardEntry[] = []
    for (let nation = 0; nation < this.#points.length; nation++) {
      if (this.#points[nation]! > 0) ranked.push({ nation, points: this.#points[nation]! })
    }

    /* Seri dipecah berdasarkan indeks negara supaya dua kali menjalankan
       simpanan yang sama menghasilkan papan yang sama. */
    ranked.sort((a, b) => (a.points === b.points ? a.nation - b.nation : b.points - a.points))

    return ranked.length <= top ? ranked : ranked.slice(0, top)
  }

  eliminatedNations(): number[] {
    this.#tally()

    const gone: number[] = []
    for (let nation = 0; nation < this.#provinces.length; nation++) {
      if (this.#provinces[nation] === 0) gone.push(nation)
    }

    return gone
  }

  tick(): void {
    this.#tally()

    if (this.threshold <= 0) return

    const day = this.world.clock.date.day

    for (let nation = 0; nation < this.#points.length; nation++) {
      if (this.#wonOnDay[nation] === 0 && this.#points[nation]! >= this.threshold) {
        this.#wonOnDay[nation] = day
      }
    }
  }

  #checked(nation: number): number {
    if (nation < 0 || nation >= this.#points.length) {
      throw new RangeError(`negara ${nation} di luar 0..${this.#points.length - 1}`)
    }

    return nation
  }

  #tally(): void {
    this.#points.fill(0)
    this.#provinces.fill(0)

    const provinces = this.world.provinces

    for (let i = 0; i < provinces.count; i++) {
      const controller = provinces.controller[i]!

      /* NoOwner duduk melewati ujung tabel negara, sehingga satu pemeriksaan
         batas menutupi provinsi tak berpemilik sekaligus indeks yang rusak. */
      if (controller >= this.#points.length) continue

      this.#points[controller] = this.#points[controller]! + victoryPointValueOf(provinces, i)
      this.#provinces[controller] = this.#provinces[controller]! + 1
    }
  }
}
