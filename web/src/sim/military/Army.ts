import { addF32, divF32, f32, mulF32, subF32 } from '~/sim/determinism/float32'
import type { UnitClass } from '~/sim/military/UnitClass'

/*
 * long.MinValue tidak bisa diwakili persis oleh number, dan nilainya hanya
 * dipakai sebagai penanda "belum pernah mendarat" yang dibandingkan dengan
 * sama-dengan. MIN_SAFE_INTEGER memberi penanda yang sama tanpa kehilangan
 * presisi pada aritmetika tick.
 */
export const NEVER_LANDED = Number.MIN_SAFE_INTEGER

export class UnitInstance {
  hitPoints: number

  constructor(readonly unitClass: UnitClass) {
    this.hitPoints = unitClass.maxHitPoints
  }

  /* Keluaran kerusakan turun seiring unit terkikis, tapi tidak pernah di bawah
     seperempat: formasi yang nyaris mati masih bertempur, ia hanya berhenti
     menang. */
  get healthPenalty(): number {
    return addF32(f32(0.25), mulF32(f32(0.75), divF32(this.hitPoints, this.unitClass.maxHitPoints)))
  }

  applyDamage(amount: number): void {
    this.hitPoints = Math.max(0, subF32(this.hitPoints, amount))
  }
}

export class Army {
  readonly #units: UnitInstance[] = []

  /* Diisi saat tumpukan melangkah ke darat lewat tautan laut. Kepala pantai
     tidak punya kedalaman untuk mundur, dan itulah yang membuat pendaratan yang
     dilawan jadi taruhan alih-alih manuver sayap gratis. */
  landedOnTick = NEVER_LANDED

  constructor(
    readonly id: number,
    readonly nation: number,
    public province: number,
  ) {}

  get units(): readonly UnitInstance[] {
    return this.#units
  }

  get count(): number {
    return this.#units.length
  }

  get isDestroyed(): boolean {
    return this.#units.length === 0
  }

  /* Tumpukan bergerak secepat anggota terlambatnya, sehingga membawa artileri
     adalah keputusan sungguhan, bukan peningkatan gratis. */
  get speed(): number {
    if (this.#units.length === 0) return 0

    let slowest = this.#units[0]!.unitClass.speed
    for (const unit of this.#units) {
      if (unit.unitClass.speed < slowest) slowest = unit.unitClass.speed
    }

    return slowest
  }

  get hitPoints(): number {
    return this.#sum((unit) => unit.hitPoints)
  }

  get maxHitPoints(): number {
    return this.#sum((unit) => unit.unitClass.maxHitPoints)
  }

  get health(): number {
    const max = this.maxHitPoints
    return max <= 0 ? 0 : divF32(this.hitPoints, max)
  }

  add(unitClass: UnitClass): void {
    this.#units.push(new UnitInstance(unitClass))
  }

  removeDestroyed(): void {
    for (let i = this.#units.length - 1; i >= 0; i--) {
      if (this.#units[i]!.hitPoints <= 0) this.#units.splice(i, 1)
    }
  }

  /* LINQ Sum atas float menumpuk dalam double dan memotong sekali ke float di
     akhir. Menumpuk per langkah dalam float32 menggeser hasilnya: tiga puluh
     unit pada 18,9 memberi 566,99994, bukan 567. */
  #sum(valueOf: (unit: UnitInstance) => number): number {
    let total = 0
    for (const unit of this.#units) total += valueOf(unit)
    return f32(total)
  }
}
