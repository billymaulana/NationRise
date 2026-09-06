import { intDiv } from '~/sim/determinism/rounding'
import { Resource, RESOURCE_COUNT } from '~/sim/economy/Resource'
import type { Stockpile } from '~/sim/economy/Stockpile'
import type { DailyBill, WorldMarket } from '~/sim/economy/WorldMarket'
import type { WorldState } from '~/sim/world/WorldState'

/*
 * Bagaimana sebuah negara memutuskan apa yang ditaruhnya di pasar dunia tiap
 * hari.
 *
 * Aturannya yang disepakati riset sumber daya: produksi dikurangi konsumsi,
 * dikurangi apa pun yang dibutuhkan untuk menarik gudang kembali ke seminggu
 * upkeep. Negara yang sekadar menipis membeli sedikit tiap hari alih-alih tidak
 * membeli apa pun sampai hari ia kosong, dan itulah yang mengubah pasar menjadi
 * jawaban atas kelangkaan alih-alih layar yang dikunjungi pemain setelah
 * kerusakannya terjadi.
 */
export class TradePolicy {
  /* Tujuh hari cadangan, dari riset. Cukup pendek supaya sebuah negara masih
     rentan terhadap blokade, cukup panjang supaya satu hari buruk tidak memulai
     kepanikan. */
  static readonly BUFFER_DAYS = 7

  static readonly GOODS: readonly Resource[] = [
    Resource.Food,
    Resource.Fuel,
    Resource.Materials,
    Resource.Technology,
    Resource.RareResources,
  ]

  /*
   * Bahan bangunan yang tidak dibuat sendiri oleh sebuah negara.
   *
   * Diukur terhadap produksi dan upkeep saja, negara yang tidak menambang
   * material tidak menginginkannya sama sekali: sasarannya nol, sehingga ia tak
   * pernah menawar dan tak pernah mendirikan pangkalan. Diukur selama enam
   * puluh hari itu membuat seluruh dunia tidak bisa membangun, sementara dua
   * setengah juta ton barangnya menganggur di tangan segelintir produsen.
   *
   * Lantainya kira-kira seharga satu barak, per kota, sehingga sebuah negara
   * selalu berusaha memegang cukup untuk mulai menggali di suatu tempat.
   */
  static readonly CAPITAL_PER_CITY = 900

  constructor(
    private readonly world: WorldState,
    private readonly stockpile: Stockpile,
    private readonly market: WorldMarket,
    private readonly upkeep: DailyBill,
  ) {}

  /*
   * Positif berarti penjual, negatif berarti pembeli. Suku cadangan disebar
   * sepanjang minggu alih-alih dituntut sekaligus, supaya pengisian ulang tidak
   * terlihat seperti kelaparan mendadak bagi semua orang lain di buku.
   *
   * Cadangannya diukur terhadap keluaran, bukan hanya terhadap upkeep. Upkeep
   * saja adalah yang ditentukan riset, dan itu tidak cukup di sini: tidak ada
   * yang menagih upkeep harian dalam teknologi atau tanah jarang, sehingga
   * seminggu upkeep adalah cadangan nol dan seorang produsen menjual seluruh
   * stok yang justru diantre galangan dan laboratoriumnya sendiri. Jalannya
   * yang pertama mengosongkan dunia dari teknologi pada hari kedelapan puluh
   * dan menyisakan tidak satu negara pun yang bisa membuat tank.
   */
  desiredNetOf(nation: number, resource: Resource, dailyProduction: number): number {
    const consumption = this.upkeep.billOf(nation, resource)
    const target = Math.max(
      Math.max(consumption, dailyProduction) * TradePolicy.BUFFER_DAYS,
      this.#capitalFloorOf(nation, resource),
    )

    const held = this.stockpile.get(nation, resource)

    return dailyProduction - consumption - intDiv(target - held, TradePolicy.BUFFER_DAYS)
  }

  /*
   * Negara dilayani mulai dari indeks yang berbeda tiap hari. Selalu menyusuri
   * dari 0 ke atas akan menyerahkan seluruh pasokan hari itu kepada negara mana
   * pun yang kebetulan duduk di depan daftar, dan di pasar yang tipis negara
   * yang sama akan kelaparan tiap hari tanpa alasan yang bisa dilihat siapa pun.
   */
  runDay(day: number, dailyProduction: ArrayLike<number>): void {
    const nations = this.stockpile.nationCount
    if (nations === 0) return

    const offset = ((day % nations) + nations) % nations

    for (let i = 0; i < TradePolicy.GOODS.length; i++) {
      const resource = TradePolicy.GOODS[i]!

      for (let step = 0; step < nations; step++) {
        const nation = (offset + step) % nations
        const produced = dailyProduction[nation * RESOURCE_COUNT + resource]!
        const net = this.desiredNetOf(nation, resource, produced)

        if (net > 0) {
          this.#place(nation, resource, net, false)
        } else if (net < 0) {
          this.#place(nation, resource, -net, true)
        }
      }
    }
  }

  #capitalFloorOf(nation: number, resource: Resource): number {
    if (
      resource !== Resource.Materials &&
      resource !== Resource.Technology &&
      resource !== Resource.RareResources
    ) {
      return 0
    }

    let cities = 0
    const provinces = this.world.provinces

    for (let i = 0; i < provinces.count; i++) {
      if (provinces.controller[i] === nation && provinces.isCity[i] !== 0) cities++
    }

    return cities * TradePolicy.CAPITAL_PER_CITY
  }

  /* Order yang tidak muat dipangkas ke yang muat alih-alih dibuang. Menolak
     seluruhnya itulah yang membuat pasar tipis terlihat rusak: negara yang
     butuh seratus unit dan bisa mendapat enam puluh seharusnya mendapat enam
     puluh. */
  #place(nation: number, resource: Resource, units: number, buying: boolean): void {
    let allowed = buying
      ? Math.min(
          units,
          Math.min(this.market.quotaLeftFor(nation, resource), this.market.availableOf(resource)),
        )
      : Math.min(
          units,
          Math.min(this.stockpile.get(nation, resource), this.market.absorbableOf(resource)),
        )

    if (buying) {
      allowed = this.#affordableUnits(nation, resource, allowed)
    }

    if (allowed <= 0) return

    if (buying) {
      this.market.buy(nation, resource, allowed)
    } else {
      this.market.sell(nation, resource, allowed)
    }
  }

  /* Pencarian biner alih-alih pembagian: harga eksekusi naik mengikuti besar
     order, sehingga order terbesar yang terjangkau bukan anggaran dibagi harga
     hari ini. */
  #affordableUnits(nation: number, resource: Resource, units: number): number {
    if (units <= 0) return 0

    const budget = this.stockpile.get(nation, Resource.Money)
    if (this.market.costOf(resource, units) <= budget) return units

    let low = 0
    let high = units

    while (low < high) {
      const mid = low + intDiv(high - low + 1, 2)
      if (this.market.costOf(resource, mid) <= budget) {
        low = mid
      } else {
        high = mid - 1
      }
    }

    return low
  }
}
