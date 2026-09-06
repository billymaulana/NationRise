import { intDiv } from '~/sim/determinism/rounding'
import { Resource, RESOURCE_COUNT } from '~/sim/economy/Resource'
import type { Stockpile } from '~/sim/economy/Stockpile'

export class TradeRejected extends Error {
  override readonly name = 'TradeRejected'
}

export interface Trade {
  readonly resource: Resource
  readonly units: number
  readonly gross: number
  readonly fee: number
  readonly net: number
}

export interface TradeCheck {
  readonly ok: boolean
  readonly reason: string
}

/* Yang dibutuhkan pasar dari sistem upkeep, dinyatakan sesempit itu supaya
   pasar tidak ikut menarik seluruh rantai Military dan Buildings. */
export interface DailyBill {
  billOf(nation: number, resource: Resource): number
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value))
}

/*
 * Satu pasar untuk seluruh dunia alih-alih kesepakatan antar negara: setiap
 * order dibereskan terhadap buku yang sama, sehingga ada satu harga per barang
 * yang bisa dinalar simulasi, AI, dan pemain.
 *
 * Harga memakai titik tetap dalam perseribu satuan uang. Cadangan menyimpan
 * bilangan bulat dan satu hari harus terputar ulang identik dari order yang
 * sama, sehingga membawa harga titik mengambang lintas tick tidak mungkin.
 */
export class WorldMarket {
  static readonly PRICE_SCALE = 1_000

  /* Pasokan dan permintaan selalu diukur terhadap peserta ini, tidak pernah
     terhadap nol. Itu menjaga sisi yang lebih kecil tetap positif, dan itulah
     yang mencegah pasar mati ketika setiap negara menabung surplus barang yang
     sama dan tidak ada lagi yang bisa dijuali. */
  static readonly REST_OF_WORLD_DAILY_VOLUME = 20_000

  static readonly SUPPLY_WEIGHT_PERCENT = 75
  static readonly FLOOR_PERCENT = 25
  static readonly CEILING_PERCENT = 175

  /* Sepuluh per tiga, sehingga alfa 0,30: paruh waktu dua hari cukup cepat
     bereaksi terhadap perang tanpa membiarkan satu hari perdagangan
     mendefinisikan harganya. */
  static readonly SMOOTHING_DIVISOR = 3

  static readonly FEE_PERCENT = 5
  static readonly DAILY_BUY_QUOTA_PERCENT = 25

  /* Kedua angka berasal dari studi sensitivitas pasar, bukan dipilih menurut
     rasa. Batas harian 30 per mille membiarkan harga berlari dari 40 ke 70
     dalam tiga hari, yang membuat perencanaan produksi mustahil. */
  static readonly MAX_DAILY_SHIFT_PERMILLE = 120
  static readonly PRICE_IMPACT_PERCENT = 50

  /* Akses, bukan harga, yang dirampas blokade. Negara yang terputus tetap
     melihat harga dunia tetapi hanya bisa memindahkan seperempat volumenya —
     itulah sebabnya menguasai selat lebih berarti daripada menguasai kas. */
  static readonly BASE_ACCESS_PERCENT = 75
  static readonly BLOCKADED_ACCESS_PERCENT = 25

  readonly #price: Float64Array
  readonly #dayOpenPrice: Float64Array
  readonly #boughtToday: Float64Array
  readonly #soldToday: Float64Array
  readonly #shiftPermille: Float64Array
  readonly #nationBoughtToday: Float64Array

  /*
   * Apa yang sebenarnya dihabiskan tiap negara dalam sehari. Terpasang, inilah
   * yang mengikat kuota beli pada penggunaan alih-alih pada kekayaan: tanpanya
   * kuota berbagi saja membiarkan empat negara kaya mengosongkan papan sebelum
   * siapa pun ditanya.
   */
  upkeep: DailyBill | null = null

  constructor(private readonly stockpile: Stockpile) {
    this.#price = WorldMarket.#openingPrices()
    this.#dayOpenPrice = WorldMarket.#openingPrices()
    this.#boughtToday = new Float64Array(RESOURCE_COUNT)
    this.#soldToday = new Float64Array(RESOURCE_COUNT)
    this.#shiftPermille = new Float64Array(RESOURCE_COUNT)
    this.#nationBoughtToday = new Float64Array(stockpile.nationCount * RESOURCE_COUNT)
  }

  /* Harga dasar nol menandai sumber daya tidak diperdagangkan: uang adalah alat
     tukar dan bukan barang, sedangkan manpower tidak bisa dikapalkan. */
  static basePriceOf(resource: Resource): number {
    switch (resource) {
      case Resource.Food:
        return 8 * WorldMarket.PRICE_SCALE
      case Resource.Fuel:
        return 8 * WorldMarket.PRICE_SCALE
      case Resource.Materials:
        return 9 * WorldMarket.PRICE_SCALE
      case Resource.Technology:
        return 20 * WorldMarket.PRICE_SCALE
      case Resource.RareResources:
        return 15 * WorldMarket.PRICE_SCALE
      default:
        return 0
    }
  }

  static isTraded(resource: Resource): boolean {
    return WorldMarket.basePriceOf(resource) > 0
  }

  /* Pita ini sepasang kuotasi tetap, bukan batas sembarang: tidak ada yang bisa
     diperdagangkan di bawah harga beli dunia luar, atau di atas harga saat ia
     menjual dari stoknya sendiri. */
  static restOfWorldBuyPrice(resource: Resource): number {
    return intDiv(WorldMarket.basePriceOf(resource) * WorldMarket.FLOOR_PERCENT, 100)
  }

  static restOfWorldSellPrice(resource: Resource): number {
    return intDiv(WorldMarket.basePriceOf(resource) * WorldMarket.CEILING_PERCENT, 100)
  }

  static #openingPrices(): Float64Array {
    const prices = new Float64Array(RESOURCE_COUNT)
    for (let i = 0; i < prices.length; i++) prices[i] = WorldMarket.basePriceOf(i as Resource)
    return prices
  }

  priceOf(resource: Resource): number {
    return this.#price[resource]!
  }

  /* Volume dunia luar sengaja tetap, tidak elastis terhadap harga. Membuatnya
     berskala pernah dicoba dan dibatalkan: batas harian 120 per mille sudah
     menjaga pita keras tetap di luar jangkauan, sehingga elastisitas hampir
     tidak membeli kestabilan sambil membuat kedalaman pasar bergerak di bawah
     kaki pemain. */
  supplyOf(resource: Resource): number {
    return WorldMarket.isTraded(resource)
      ? WorldMarket.REST_OF_WORLD_DAILY_VOLUME + this.#soldToday[resource]!
      : 0
  }

  demandOf(resource: Resource): number {
    return WorldMarket.isTraded(resource)
      ? WorldMarket.REST_OF_WORLD_DAILY_VOLUME + this.#boughtToday[resource]!
      : 0
  }

  accessPercentFor(blockaded: boolean): number {
    return blockaded ? WorldMarket.BLOCKADED_ACCESS_PERCENT : WorldMarket.BASE_ACCESS_PERCENT
  }

  /* Berapa banyak yang benar-benar bisa dipindahkan sebuah negara hari ini
     menurut akses dagangnya. Blokade tidak mengubah harga, hanya berapa banyak
     yang sampai ke dermaga. */
  tradeableVolumeFor(resource: Resource, blockaded: boolean): number {
    return intDiv(this.availableOf(resource) * this.accessPercentFor(blockaded), 100)
  }

  availableOf(resource: Resource): number {
    return Math.max(0, this.supplyOf(resource) - this.#boughtToday[resource]!)
  }

  absorbableOf(resource: Resource): number {
    return Math.max(0, this.demandOf(resource) - this.#soldToday[resource]!)
  }

  /* Tidak ada negara boleh memonopoli satu barang: seperempat pasokan hari itu
     adalah maksimum yang bisa diambil satu pembeli. */
  quotaLeftFor(nation: number, resource: Resource, dailyConsumption?: number): number {
    if (dailyConsumption === undefined) {
      return this.upkeep === null
        ? this.#shareQuotaLeftFor(nation, resource)
        : this.quotaLeftFor(nation, resource, this.upkeep.billOf(nation, resource))
    }

    /* Yang sudah diambil negara itu hari ini dikurangkan dari kedua batas.
       Membebankannya hanya pada kuota berbagi membuat batas konsumsi mengukur
       order tunggal dan tidak membatasi apa pun. */
    const byUse =
      Math.max(dailyConsumption * 3, intDiv(WorldMarket.REST_OF_WORLD_DAILY_VOLUME, 40)) -
      this.#nationBoughtToday[this.#index(nation, resource)]!

    return Math.max(0, Math.min(this.#shareQuotaLeftFor(nation, resource), byUse))
  }

  #shareQuotaLeftFor(nation: number, resource: Resource): number {
    return Math.max(
      0,
      intDiv(this.supplyOf(resource) * WorldMarket.DAILY_BUY_QUOTA_PERCENT, 100) -
        this.#nationBoughtToday[this.#index(nation, resource)]!,
    )
  }

  /* Sebuah order menyusuri buku: ia terisi pada rata-rata harga sebelum dan
     sesudah dampaknya sendiri. Mengisinya pada harga pra-transaksi akan
     membiarkan sebuah negara membeli, mendorong harga naik, lalu menjual stok
     yang sama dengan untung dalam satu hari. */
  executionPriceOf(resource: Resource, units: number, buying: boolean): number {
    if (!WorldMarket.isTraded(resource) || units <= 0) return this.priceOf(resource)

    return intDiv(this.#price[resource]! + this.#impact(resource, units, buying).price, 2)
  }

  costOf(resource: Resource, units: number): number {
    const gross = WorldMarket.#roundUp(
      this.executionPriceOf(resource, units, true) * units,
      WorldMarket.PRICE_SCALE,
    )
    return gross + WorldMarket.#roundUp(gross * WorldMarket.FEE_PERCENT, 100)
  }

  proceedsOf(resource: Resource, units: number): number {
    const gross = intDiv(
      this.executionPriceOf(resource, units, false) * units,
      WorldMarket.PRICE_SCALE,
    )
    return gross - WorldMarket.#roundUp(gross * WorldMarket.FEE_PERCENT, 100)
  }

  canBuy(nation: number, resource: Resource, units: number): TradeCheck {
    if (units <= 0) return { ok: false, reason: 'An order must be at least one unit.' }

    if (!WorldMarket.isTraded(resource)) {
      return { ok: false, reason: `${Resource[resource]} is not traded on the world market.` }
    }

    if (units > this.quotaLeftFor(nation, resource)) {
      return { ok: false, reason: `The daily buying quota for ${Resource[resource]} is used up.` }
    }

    if (units > this.availableOf(resource)) {
      return { ok: false, reason: `The market has no more ${Resource[resource]} to sell today.` }
    }

    if (this.stockpile.get(nation, Resource.Money) < this.costOf(resource, units)) {
      return { ok: false, reason: 'Not enough money.' }
    }

    return { ok: true, reason: '' }
  }

  canSell(nation: number, resource: Resource, units: number): TradeCheck {
    if (units <= 0) return { ok: false, reason: 'An order must be at least one unit.' }

    if (!WorldMarket.isTraded(resource)) {
      return { ok: false, reason: `${Resource[resource]} is not traded on the world market.` }
    }

    if (this.stockpile.get(nation, resource) < units) {
      return { ok: false, reason: `Not enough ${Resource[resource]} to sell.` }
    }

    if (units > this.absorbableOf(resource)) {
      return { ok: false, reason: `The market will not take any more ${Resource[resource]} today.` }
    }

    return { ok: true, reason: '' }
  }

  buy(nation: number, resource: Resource, units: number): Trade {
    const check = this.canBuy(nation, resource, units)
    if (!check.ok) throw new TradeRejected(check.reason)

    const { shift, price: shiftedPrice } = this.#impact(resource, units, true)
    const execution = intDiv(this.#price[resource]! + shiftedPrice, 2)

    const gross = WorldMarket.#roundUp(execution * units, WorldMarket.PRICE_SCALE)
    const fee = WorldMarket.#roundUp(gross * WorldMarket.FEE_PERCENT, 100)

    this.stockpile.trySpend(nation, Resource.Money, gross + fee)
    this.stockpile.add(nation, resource, units)

    this.#boughtToday[resource] = this.#boughtToday[resource]! + units
    const slot = this.#index(nation, resource)
    this.#nationBoughtToday[slot] = this.#nationBoughtToday[slot]! + units
    this.#shiftPermille[resource] = shift
    this.#price[resource] = shiftedPrice

    return { resource, units, gross, fee, net: -(gross + fee) }
  }

  sell(nation: number, resource: Resource, units: number): Trade {
    const check = this.canSell(nation, resource, units)
    if (!check.ok) throw new TradeRejected(check.reason)

    const { shift, price: shiftedPrice } = this.#impact(resource, units, false)
    const execution = intDiv(this.#price[resource]! + shiftedPrice, 2)

    const gross = intDiv(execution * units, WorldMarket.PRICE_SCALE)
    const fee = WorldMarket.#roundUp(gross * WorldMarket.FEE_PERCENT, 100)

    this.stockpile.trySpend(nation, resource, units)
    this.stockpile.add(nation, Resource.Money, gross - fee)

    this.#soldToday[resource] = this.#soldToday[resource]! + units
    this.#shiftPermille[resource] = shift
    this.#price[resource] = shiftedPrice

    return { resource, units, gross, fee, net: gross - fee }
  }

  /* Ke mana pasokan dan permintaan saja akan menaruh harga hari ini. Sengaja
     bukan harganya sendiri: satu hari order yang tidak biasa akan menggergaji
     setiap rencana produksi di dunia. */
  targetPriceOf(resource: Resource): number {
    if (!WorldMarket.isTraded(resource)) return 0

    const buy = this.demandOf(resource)
    const sell = this.supplyOf(resource)
    const balance = clamp(intDiv((buy - sell) * 1000, Math.min(buy, sell)), -1000, 1000)
    const baseline = WorldMarket.basePriceOf(resource)

    return WorldMarket.#bound(
      resource,
      baseline + intDiv(baseline * WorldMarket.SUPPLY_WEIGHT_PERCENT * balance, 100_000),
    )
  }

  runDay(): void {
    for (let i = 0; i < RESOURCE_COUNT; i++) {
      const resource = i as Resource

      if (WorldMarket.isTraded(resource)) {
        this.#price[i] = WorldMarket.#smooth(this.#price[i]!, this.targetPriceOf(resource))
      }

      this.#boughtToday[i] = 0
      this.#soldToday[i] = 0
      this.#shiftPermille[i] = 0
      this.#dayOpenPrice[i] = this.#price[i]!
    }

    this.#nationBoughtToday.fill(0)
  }

  #impact(resource: Resource, units: number, buying: boolean): { shift: number; price: number } {
    const direction = buying ? 1 : -1
    const moved = intDiv(
      direction * units * 1000 * WorldMarket.PRICE_IMPACT_PERCENT,
      this.supplyOf(resource) * 100,
    )
    const shift = clamp(
      this.#shiftPermille[resource]! + moved,
      -WorldMarket.MAX_DAILY_SHIFT_PERMILLE,
      WorldMarket.MAX_DAILY_SHIFT_PERMILLE,
    )

    const open = this.#dayOpenPrice[resource]!
    return { shift, price: WorldMarket.#bound(resource, open + intDiv(open * shift, 1000)) }
  }

  /* Pembagian bilangan bulat berhenti dalam beberapa perseribu dari target dan
     harganya akan merayap selamanya tanpa pernah tiba; menutup langkah terakhir
     membuat pasar yang sudah tenang benar-benar tenang. */
  static #smooth(price: number, target: number): number {
    const step = intDiv(target - price, WorldMarket.SMOOTHING_DIVISOR)
    return step === 0 ? target : price + step
  }

  static #bound(resource: Resource, price: number): number {
    return clamp(
      price,
      WorldMarket.restOfWorldBuyPrice(resource),
      WorldMarket.restOfWorldSellPrice(resource),
    )
  }

  static #roundUp(value: number, divisor: number): number {
    return intDiv(value + divisor - 1, divisor)
  }

  #index(nation: number, resource: Resource): number {
    if (nation < 0 || nation >= this.stockpile.nationCount) {
      throw new RangeError(`negara ${nation} di luar 0..${this.stockpile.nationCount - 1}`)
    }

    return nation * RESOURCE_COUNT + resource
  }
}
