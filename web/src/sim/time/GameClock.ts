import { fromTick, HOURS_PER_DAY, type GameDate } from '~/sim/time/GameDate'

export class GameClock {
  #tick = 0

  get tick(): number {
    return this.#tick
  }

  get date(): GameDate {
    return fromTick(this.#tick)
  }

  get isDayBoundary(): boolean {
    return this.#tick % HOURS_PER_DAY === 0
  }

  advance(): void {
    this.#tick++
  }

  advanceTo(tick: number): void {
    if (tick < this.#tick) {
      throw new RangeError(`tidak bisa memundurkan jam dari ${this.#tick} ke ${tick}`)
    }

    this.#tick = tick
  }

  /* Memuat simpanan adalah satu-satunya alasan sah waktu berjalan mundur.
     Metodenya dipisah dari advanceTo supaya kemunduran tak sengaja saat bermain
     tetap melempar, bukan merusak garis waktu diam-diam. */
  restoreTo(tick: number): void {
    if (tick < 0) {
      throw new RangeError(`tick tidak boleh negatif: ${tick}`)
    }

    this.#tick = tick
  }
}
