export const HOURS_PER_DAY = 24

export interface GameDate {
  readonly day: number
  readonly hour: number
}

export function fromTick(tick: number): GameDate {
  if (tick < 0) {
    throw new RangeError(`tick tidak boleh negatif: ${tick}`)
  }

  /* Math.trunc, bukan Math.floor: C# membulatkan pembagian bilangan bulat ke
     arah nol, dan keduanya berbeda satu untuk nilai negatif. Di sini negatif
     sudah ditolak, tetapi aturannya dipegang seragam supaya tidak ada tempat
     yang diam-diam menyimpang saat disalin ke subsistem lain. */
  return { day: Math.trunc(tick / HOURS_PER_DAY) + 1, hour: tick % HOURS_PER_DAY }
}

export function toTick(date: GameDate): number {
  return (date.day - 1) * HOURS_PER_DAY + date.hour
}

export function formatDate(date: GameDate): string {
  return `Day ${date.day}, ${String(date.hour).padStart(2, '0')}:00`
}
