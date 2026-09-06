import { describe, expect, it } from 'vitest'
import { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { Resource } from '~/sim/economy/Resource'
import { Stockpile } from '~/sim/economy/Stockpile'
import { TradeRejected, WorldMarket } from '~/sim/economy/WorldMarket'

/* Diport dari NationRise.Core.Tests/Economy/MarketTests.cs. */

const GOODS = [
  Resource.Food,
  Resource.Fuel,
  Resource.Materials,
  Resource.Technology,
  Resource.RareResources,
] as const

function expectInsideBand(market: WorldMarket): void {
  for (const good of GOODS) {
    const price = market.priceOf(good)
    expect(price).toBeGreaterThanOrEqual(Math.trunc((WorldMarket.basePriceOf(good) * 25) / 100))
    expect(price).toBeLessThanOrEqual(Math.trunc((WorldMarket.basePriceOf(good) * 175) / 100))
  }
}

function runScriptedWeek(): { stock: Stockpile; market: WorldMarket } {
  const stock = new Stockpile(3)
  const market = new WorldMarket(stock)
  const rng = new DeterministicRandom(4_071)

  for (let nation = 0; nation < 3; nation++) stock.add(nation, Resource.Money, 50_000_000)

  for (let day = 0; day < 7; day++) {
    for (let nation = 0; nation < 3; nation++) {
      for (const good of GOODS) {
        const units = rng.nextInt(1, 6_000)

        if (rng.nextInt(2) === 0) {
          stock.add(nation, good, units)
          if (market.canSell(nation, good, units).ok) market.sell(nation, good, units)
        } else if (market.canBuy(nation, good, units).ok) {
          market.buy(nation, good, units)
        }
      }
    }

    market.runDay()
  }

  return { stock, market }
}

describe('harga dasar', () => {
  /* Uang per unit diambil dari sumber yang sama dengan faktor produksi; geseran
     di sini diam-diam mengubah harga setiap pasukan dan setiap bangunan. */
  it.each([
    [Resource.Food, 8],
    [Resource.Fuel, 8],
    [Resource.Materials, 9],
    [Resource.RareResources, 15],
    [Resource.Technology, 20],
  ])('sumber daya %i berharga %i money', (resource, money) => {
    const market = new WorldMarket(new Stockpile(1))

    expect(WorldMarket.basePriceOf(resource)).toBe(money * WorldMarket.PRICE_SCALE)
    expect(market.priceOf(resource)).toBe(money * WorldMarket.PRICE_SCALE)
    expect(WorldMarket.isTraded(resource)).toBe(true)
  })

  it.each([[Resource.Money], [Resource.Manpower]])(
    'sumber daya %i tidak diperdagangkan',
    (resource) => {
      const stock = new Stockpile(1)
      stock.add(0, Resource.Money, 1_000_000)
      stock.add(0, Resource.Manpower, 1_000_000)
      const market = new WorldMarket(stock)

      expect(WorldMarket.isTraded(resource)).toBe(false)
      expect(WorldMarket.basePriceOf(resource)).toBe(0)
      expect(market.canBuy(0, resource, 100).ok).toBe(false)
      expect(market.canSell(0, resource, 100).ok).toBe(false)
      expect(() => market.buy(0, resource, 100)).toThrow(TradeRejected)
      expect(() => market.sell(0, resource, 100)).toThrow(TradeRejected)
    },
  )
})

describe('pergerakan harga', () => {
  it('harga tetap di dalam pita rest of world', () => {
    const stock = new Stockpile(4)
    const market = new WorldMarket(stock)
    const rng = new DeterministicRandom(20_260_906)

    for (let nation = 0; nation < 4; nation++) stock.add(nation, Resource.Money, 2_000_000_000)

    for (let day = 0; day < 200; day++) {
      for (let nation = 0; nation < 4; nation++) {
        for (const good of GOODS) {
          const units = rng.nextInt(1, 9_000)

          if (rng.nextInt(2) === 0) {
            stock.add(nation, good, units)
            if (market.canSell(nation, good, units).ok) market.sell(nation, good, units)
          } else if (market.canBuy(nation, good, units).ok) {
            market.buy(nation, good, units)
          }

          expectInsideBand(market)
        }
      }

      market.runDay()
      expectInsideBand(market)
    }
  })

  it('kelebihan pasokan menekan harga turun', () => {
    const stock = new Stockpile(1)
    stock.add(0, Resource.Food, 1_000_000)
    const market = new WorldMarket(stock)

    for (let day = 0; day < 5; day++) {
      market.sell(0, Resource.Food, WorldMarket.REST_OF_WORLD_DAILY_VOLUME)
      market.runDay()
    }

    expect(market.priceOf(Resource.Food)).toBeLessThan(WorldMarket.basePriceOf(Resource.Food))
  })

  it('kelangkaan mendorong harga naik', () => {
    const stock = new Stockpile(4)
    const market = new WorldMarket(stock)

    for (let nation = 0; nation < 4; nation++) stock.add(nation, Resource.Money, 10_000_000)

    for (let day = 0; day < 5; day++) {
      for (let nation = 0; nation < 4; nation++) market.buy(nation, Resource.Food, 5_000)
      market.runDay()
    }

    expect(market.priceOf(Resource.Food)).toBeGreaterThan(WorldMarket.basePriceOf(Resource.Food))
  })

  it('membeli menaikkan harga seketika', () => {
    const stock = new Stockpile(1)
    stock.add(0, Resource.Money, 1_000_000)
    const market = new WorldMarket(stock)

    market.buy(0, Resource.Food, 1_000)

    expect(market.priceOf(Resource.Food)).toBe(8_200)
  })

  it('menjual menurunkan harga seketika', () => {
    const stock = new Stockpile(1)
    stock.add(0, Resource.Food, 5_000)
    const market = new WorldMarket(stock)

    market.sell(0, Resource.Food, 1_000)

    expect(market.priceOf(Resource.Food)).toBe(7_800)
  })

  it('kenaikan harga intraday dibatasi dua belas persen', () => {
    const stock = new Stockpile(4)
    const market = new WorldMarket(stock)

    for (let nation = 0; nation < 4; nation++) {
      stock.add(nation, Resource.Money, 10_000_000)
      market.buy(nation, Resource.Food, 5_000)
    }

    expect(market.priceOf(Resource.Food)).toBe(
      Math.trunc((WorldMarket.basePriceOf(Resource.Food) * 112) / 100),
    )
  })

  it('penurunan harga intraday dibatasi dua belas persen', () => {
    const stock = new Stockpile(1)
    stock.add(0, Resource.Food, 100_000)
    const market = new WorldMarket(stock)

    market.sell(0, Resource.Food, WorldMarket.REST_OF_WORLD_DAILY_VOLUME)

    expect(market.priceOf(Resource.Food)).toBe(
      Math.trunc((WorldMarket.basePriceOf(Resource.Food) * 88) / 100),
    )
  })

  it('harga hanya bergerak sepertiga jalan menuju targetnya', () => {
    const stock = new Stockpile(1)
    stock.add(0, Resource.Money, 1_000_000)
    const market = new WorldMarket(stock)

    market.buy(0, Resource.Food, 5_000)

    const before = market.priceOf(Resource.Food)
    const target = market.targetPriceOf(Resource.Food)

    market.runDay()

    expect(target).toBe(9_500)
    expect(market.priceOf(Resource.Food)).toBe(
      before + Math.trunc((target - before) / WorldMarket.SMOOTHING_DIVISOR),
    )
    expect(market.priceOf(Resource.Food)).not.toBe(target)
  })

  it('harga kembali ke dasar saat perdagangan berhenti', () => {
    const stock = new Stockpile(1)
    stock.add(0, Resource.Food, 1_000_000)
    const market = new WorldMarket(stock)

    for (let day = 0; day < 20; day++) {
      market.sell(0, Resource.Food, WorldMarket.REST_OF_WORLD_DAILY_VOLUME)
      market.runDay()
    }

    expect(market.priceOf(Resource.Food)).toBeLessThan(WorldMarket.basePriceOf(Resource.Food))

    for (let day = 0; day < 60; day++) market.runDay()

    expect(market.priceOf(Resource.Food)).toBe(WorldMarket.basePriceOf(Resource.Food))
  })
})

describe('rest of world', () => {
  it('menahan harga agar tidak runtuh ke nol', () => {
    const stock = new Stockpile(1)
    const market = new WorldMarket(stock)

    for (let day = 0; day < 120; day++) {
      stock.add(0, Resource.Food, WorldMarket.REST_OF_WORLD_DAILY_VOLUME)
      market.sell(0, Resource.Food, WorldMarket.REST_OF_WORLD_DAILY_VOLUME)
      market.runDay()
    }

    expect(market.priceOf(Resource.Food)).toBe(WorldMarket.restOfWorldBuyPrice(Resource.Food))
    expect(market.priceOf(Resource.Food)).toBeGreaterThan(0)

    stock.add(0, Resource.Food, 1_000)
    expect(market.canSell(0, Resource.Food, 1_000).ok).toBe(true)
  })

  it('membatasi harga pada kuotasi jualnya', () => {
    const stock = new Stockpile(4)
    const market = new WorldMarket(stock)

    for (let nation = 0; nation < 4; nation++) stock.add(nation, Resource.Money, 1_000_000_000)

    for (let day = 0; day < 120; day++) {
      for (let nation = 0; nation < 4; nation++) market.buy(nation, Resource.Food, 5_000)
      market.runDay()
    }

    expect(market.priceOf(Resource.Food)).toBe(WorldMarket.restOfWorldSellPrice(Resource.Food))
    expect(market.canBuy(0, Resource.Food, 1_000).ok).toBe(true)
  })

  it('menjaga papan tetap terisi saat tidak ada negara menjual', () => {
    const stock = new Stockpile(1)
    stock.add(0, Resource.Money, 1_000_000)
    const market = new WorldMarket(stock)
    const volume = WorldMarket.REST_OF_WORLD_DAILY_VOLUME

    expect(market.supplyOf(Resource.Food)).toBe(volume)
    expect(market.demandOf(Resource.Food)).toBe(volume)
    expect(market.availableOf(Resource.Food)).toBe(volume)
    expect(market.absorbableOf(Resource.Food)).toBe(volume)
    expect(market.canBuy(0, Resource.Food, 5_000).ok).toBe(true)
    expect(market.targetPriceOf(Resource.Food)).toBe(WorldMarket.basePriceOf(Resource.Food))
  })
})

describe('kuota dan batas harian', () => {
  it('kuota beli harian ditegakkan', () => {
    const stock = new Stockpile(2)
    stock.add(0, Resource.Money, 10_000_000)
    const market = new WorldMarket(stock)

    expect(market.quotaLeftFor(0, Resource.Food)).toBe(5_000)

    market.buy(0, Resource.Food, 5_000)

    expect(market.quotaLeftFor(0, Resource.Food)).toBe(0)
    const refused = market.canBuy(0, Resource.Food, 1)
    expect(refused.ok).toBe(false)
    expect(refused.reason).toContain('quota')
    expect(() => market.buy(0, Resource.Food, 1)).toThrow(TradeRejected)
    expect(market.quotaLeftFor(1, Resource.Food)).toBe(5_000)

    market.runDay()

    expect(market.quotaLeftFor(0, Resource.Food)).toBe(5_000)
  })

  it('kuota mengikuti total pasokan dunia', () => {
    const stock = new Stockpile(2)
    stock.add(0, Resource.Food, 20_000)
    const market = new WorldMarket(stock)

    expect(market.quotaLeftFor(1, Resource.Food)).toBe(5_000)

    market.sell(0, Resource.Food, 20_000)

    expect(market.supplyOf(Resource.Food)).toBe(40_000)
    expect(market.quotaLeftFor(1, Resource.Food)).toBe(10_000)
  })

  it('pasar bisa kehabisan stok untuk hari itu', () => {
    const stock = new Stockpile(5)
    const market = new WorldMarket(stock)

    for (let nation = 0; nation < 5; nation++) stock.add(nation, Resource.Money, 10_000_000)
    for (let nation = 0; nation < 4; nation++) market.buy(nation, Resource.Food, 5_000)

    expect(market.availableOf(Resource.Food)).toBe(0)
    expect(market.quotaLeftFor(4, Resource.Food)).toBe(5_000)

    const refused = market.canBuy(4, Resource.Food, 1)
    expect(refused.ok).toBe(false)
    expect(refused.reason).toContain('no more')

    market.runDay()

    expect(market.availableOf(Resource.Food)).toBe(WorldMarket.REST_OF_WORLD_DAILY_VOLUME)
  })

  it('pasar hanya menyerap sekian banyak dalam sehari', () => {
    const stock = new Stockpile(1)
    stock.add(0, Resource.Food, 100_000)
    const market = new WorldMarket(stock)

    market.sell(0, Resource.Food, WorldMarket.REST_OF_WORLD_DAILY_VOLUME)

    expect(market.absorbableOf(Resource.Food)).toBe(0)
    expect(market.canSell(0, Resource.Food, 1).ok).toBe(false)

    market.runDay()

    expect(market.canSell(0, Resource.Food, 1).ok).toBe(true)
  })

  /* Kuota berbagi saja masih membiarkan sebuah negara menimbun pasokan
     bertahun-tahun dalam satu minggu tenang. */
  it('konsumsi membatasi penimbunan di bawah kuota berbagi', () => {
    const stock = new Stockpile(2)
    stock.add(0, Resource.Money, 10_000_000)
    const market = new WorldMarket(stock)

    const byShare = market.quotaLeftFor(0, Resource.Food)
    const modest = market.quotaLeftFor(0, Resource.Food, 1_000)

    expect(modest).toBeLessThan(byShare)
    expect(modest).toBe(3_000)
  })

  it('konsumen berat tetap membentur kuota berbagi lebih dulu', () => {
    const market = new WorldMarket(new Stockpile(2))

    expect(market.quotaLeftFor(0, Resource.Food, 1_000_000)).toBe(
      market.quotaLeftFor(0, Resource.Food),
    )
  })

  it('negara yang tidak mengonsumsi apa pun tetap punya lantai', () => {
    const market = new WorldMarket(new Stockpile(2))
    expect(market.quotaLeftFor(0, Resource.Food, 0)).toBeGreaterThan(0)
  })
})

describe('biaya dan penolakan', () => {
  it('biaya transaksi dikenakan di kedua sisi', () => {
    const stock = new Stockpile(1)
    stock.add(0, Resource.Money, 1_000_000)
    stock.add(0, Resource.Food, 5_000)
    const market = new WorldMarket(stock)

    const quotedCost = market.costOf(Resource.Food, 1_000)
    const bought = market.buy(0, Resource.Food, 1_000)

    expect(bought.gross).toBe(8_100)
    expect(bought.fee).toBe(405)
    expect(bought.net).toBe(-8_505)
    expect(-bought.net).toBe(quotedCost)
    expect(stock.get(0, Resource.Money)).toBe(1_000_000 - 8_505)
    expect(stock.get(0, Resource.Food)).toBe(6_000)

    const quotedProceeds = market.proceedsOf(Resource.Food, 1_000)
    const sold = market.sell(0, Resource.Food, 1_000)

    expect(sold.gross).toBe(8_100)
    expect(sold.fee).toBe(405)
    expect(sold.net).toBe(7_695)
    expect(sold.net).toBe(quotedProceeds)
    expect(stock.get(0, Resource.Food)).toBe(5_000)
  })

  /* Setiap order terisi pada rata-rata harga sebelum dan sesudah dampaknya
     sendiri, sehingga membeli lalu menjual stok yang sama dalam satu hari tidak
     bisa menghasilkan untung dari harga yang ia gerakkan sendiri. */
  it('bolak-balik kehilangan setidaknya dua biaya', () => {
    const units = 5_000
    const stock = new Stockpile(1)
    stock.add(0, Resource.Money, 1_000_000)
    const market = new WorldMarket(stock)

    const bought = market.buy(0, Resource.Food, units)
    const sold = market.sell(0, Resource.Food, units)

    const lost = 1_000_000 - stock.get(0, Resource.Money)
    expect(lost).toBeGreaterThanOrEqual(bought.fee + sold.fee)
    expect(lost).toBeLessThanOrEqual(bought.fee + sold.fee + units)
    expect(stock.get(0, Resource.Food)).toBe(0)

    const drift = Math.abs(market.priceOf(Resource.Food) - WorldMarket.basePriceOf(Resource.Food))
    expect(drift).toBeLessThanOrEqual(WorldMarket.basePriceOf(Resource.Food) / 100)
  })

  it.each([[1], [7], [999], [2_500], [5_000]])(
    'bolak-balik %i unit tidak pernah untung',
    (units) => {
      const stock = new Stockpile(1)
      stock.add(0, Resource.Money, 1_000_000)
      const market = new WorldMarket(stock)

      market.buy(0, Resource.Food, units)
      market.sell(0, Resource.Food, units)

      expect(stock.get(0, Resource.Money)).toBeLessThan(1_000_000)
      expect(stock.get(0, Resource.Food)).toBe(0)
    },
  )

  it('negara tanpa uang tidak bisa membeli', () => {
    const stock = new Stockpile(1)
    const market = new WorldMarket(stock)

    const refused = market.canBuy(0, Resource.Food, 1)
    expect(refused.ok).toBe(false)
    expect(refused.reason).toBe('Not enough money.')
    expect(() => market.buy(0, Resource.Food, 1_000)).toThrow(TradeRejected)
    expect(stock.get(0, Resource.Food)).toBe(0)
    expect(market.priceOf(Resource.Food)).toBe(WorldMarket.basePriceOf(Resource.Food))

    stock.add(0, Resource.Money, market.costOf(Resource.Food, 1) - 1)
    expect(market.canBuy(0, Resource.Food, 1).ok).toBe(false)

    stock.add(0, Resource.Money, 1)
    expect(market.canBuy(0, Resource.Food, 1).ok).toBe(true)
  })

  it('negara tidak bisa menjual stok yang tidak dipegangnya', () => {
    const stock = new Stockpile(1)
    stock.add(0, Resource.Food, 100)
    const market = new WorldMarket(stock)

    expect(market.canSell(0, Resource.Food, 101).ok).toBe(false)
    expect(market.canSell(0, Resource.Food, 100).ok).toBe(true)
    expect(() => market.sell(0, Resource.Food, 101)).toThrow(TradeRejected)
  })
})

describe('blokade dan determinisme', () => {
  it('blokade memotong volume, bukan harga', () => {
    const market = new WorldMarket(new Stockpile(1))

    const open = market.tradeableVolumeFor(Resource.Food, false)
    const cut = market.tradeableVolumeFor(Resource.Food, true)

    expect(cut).toBeLessThan(open)
    expect(market.accessPercentFor(true)).toBe(WorldMarket.BLOCKADED_ACCESS_PERCENT)
    expect(market.accessPercentFor(false)).toBe(WorldMarket.BASE_ACCESS_PERCENT)

    /* Harga yang dilihat negara terblokade tidak berubah: yang hilang adalah
       kemampuan memindahkan barang. */
    expect(market.priceOf(Resource.Food)).toBe(WorldMarket.basePriceOf(Resource.Food))
  })

  it('order yang sama menghasilkan harga yang sama', () => {
    const first = runScriptedWeek()
    const second = runScriptedWeek()

    expect(GOODS.some((g) => first.market.priceOf(g) !== WorldMarket.basePriceOf(g))).toBe(true)

    for (const good of GOODS) {
      expect(first.market.priceOf(good)).toBe(second.market.priceOf(good))
      expect(first.market.supplyOf(good)).toBe(second.market.supplyOf(good))

      for (let nation = 0; nation < 3; nation++) {
        expect(first.stock.get(nation, good)).toBe(second.stock.get(nation, good))
      }
    }

    for (let nation = 0; nation < 3; nation++) {
      expect(first.stock.get(nation, Resource.Money)).toBe(
        second.stock.get(nation, Resource.Money),
      )
    }
  })
})
