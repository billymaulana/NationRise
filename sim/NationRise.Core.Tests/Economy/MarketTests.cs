using NationRise.Core.Determinism;
using NationRise.Core.Economy;

namespace NationRise.Core.Tests.Economy;

public class MarketTests
{
    private static readonly Resource[] Goods =
    [
        Resource.Food,
        Resource.Fuel,
        Resource.Materials,
        Resource.Technology,
        Resource.RareResources,
    ];

    /* Money per unit taken from the same source as the production factors; a
       drift here silently reprices every army and every building. */
    [Theory]
    [InlineData(Resource.Food, 8)]
    [InlineData(Resource.Fuel, 8)]
    [InlineData(Resource.Materials, 9)]
    [InlineData(Resource.RareResources, 15)]
    [InlineData(Resource.Technology, 20)]
    public void BasePricesMatchTheResearchedFigures(Resource resource, long money)
    {
        var market = new WorldMarket(new Stockpile(1));

        Assert.Equal(money * WorldMarket.PriceScale, WorldMarket.BasePriceOf(resource));
        Assert.Equal(money * WorldMarket.PriceScale, market.PriceOf(resource));
        Assert.True(WorldMarket.IsTraded(resource));
    }

    [Theory]
    [InlineData(Resource.Money)]
    [InlineData(Resource.Manpower)]
    public void MoneyAndManpowerAreNotTraded(Resource resource)
    {
        var stock = new Stockpile(1);
        stock.Add(0, Resource.Money, 1_000_000);
        stock.Add(0, Resource.Manpower, 1_000_000);
        var market = new WorldMarket(stock);

        Assert.False(WorldMarket.IsTraded(resource));
        Assert.Equal(0, WorldMarket.BasePriceOf(resource));
        Assert.False(market.CanBuy(0, resource, 100, out _));
        Assert.False(market.CanSell(0, resource, 100, out _));
        Assert.Throws<TradeRejected>(() => market.Buy(0, resource, 100));
        Assert.Throws<TradeRejected>(() => market.Sell(0, resource, 100));
    }

    [Fact]
    public void PriceStaysInsideTheRestOfWorldBand()
    {
        var stock = new Stockpile(4);
        var market = new WorldMarket(stock);
        var rng = new DeterministicRandom(20_260_906);

        for (int nation = 0; nation < 4; nation++)
        {
            stock.Add(nation, Resource.Money, 2_000_000_000);
        }

        for (int day = 0; day < 200; day++)
        {
            for (int nation = 0; nation < 4; nation++)
            {
                foreach (Resource good in Goods)
                {
                    long units = rng.NextInt(1, 9_000);

                    if (rng.NextInt(2) == 0)
                    {
                        stock.Add(nation, good, units);

                        if (market.CanSell(nation, good, units, out _))
                        {
                            market.Sell(nation, good, units);
                        }
                    }
                    else if (market.CanBuy(nation, good, units, out _))
                    {
                        market.Buy(nation, good, units);
                    }

                    AssertInsideBand(market);
                }
            }

            market.RunDay();
            AssertInsideBand(market);
        }
    }

    [Fact]
    public void OversupplyDrivesThePriceDown()
    {
        var stock = new Stockpile(1);
        stock.Add(0, Resource.Food, 1_000_000);
        var market = new WorldMarket(stock);

        for (int day = 0; day < 5; day++)
        {
            market.Sell(0, Resource.Food, WorldMarket.RestOfWorldDailyVolume);
            market.RunDay();
        }

        Assert.True(market.PriceOf(Resource.Food) < WorldMarket.BasePriceOf(Resource.Food));
    }

    [Fact]
    public void ScarcityDrivesThePriceUp()
    {
        var stock = new Stockpile(4);
        var market = new WorldMarket(stock);

        for (int nation = 0; nation < 4; nation++)
        {
            stock.Add(nation, Resource.Money, 10_000_000);
        }

        for (int day = 0; day < 5; day++)
        {
            for (int nation = 0; nation < 4; nation++)
            {
                market.Buy(nation, Resource.Food, 5_000);
            }

            market.RunDay();
        }

        Assert.True(market.PriceOf(Resource.Food) > WorldMarket.BasePriceOf(Resource.Food));
    }

    [Fact]
    public void BuyingRaisesThePriceImmediately()
    {
        var stock = new Stockpile(1);
        stock.Add(0, Resource.Money, 1_000_000);
        var market = new WorldMarket(stock);

        market.Buy(0, Resource.Food, 1_000);

        Assert.Equal(8_200, market.PriceOf(Resource.Food));
    }

    [Fact]
    public void SellingLowersThePriceImmediately()
    {
        var stock = new Stockpile(1);
        stock.Add(0, Resource.Food, 5_000);
        var market = new WorldMarket(stock);

        market.Sell(0, Resource.Food, 1_000);

        Assert.Equal(7_800, market.PriceOf(Resource.Food));
    }

    [Fact]
    public void RestOfWorldStopsThePriceCollapsingToNothing()
    {
        var stock = new Stockpile(1);
        var market = new WorldMarket(stock);

        for (int day = 0; day < 120; day++)
        {
            stock.Add(0, Resource.Food, WorldMarket.RestOfWorldDailyVolume);
            market.Sell(0, Resource.Food, WorldMarket.RestOfWorldDailyVolume);
            market.RunDay();
        }

        Assert.Equal(WorldMarket.RestOfWorldBuyPrice(Resource.Food), market.PriceOf(Resource.Food));
        Assert.True(market.PriceOf(Resource.Food) > 0);

        stock.Add(0, Resource.Food, 1_000);
        Assert.True(market.CanSell(0, Resource.Food, 1_000, out _));
    }

    [Fact]
    public void RestOfWorldCapsThePriceAtItsSellQuote()
    {
        var stock = new Stockpile(4);
        var market = new WorldMarket(stock);

        for (int nation = 0; nation < 4; nation++)
        {
            stock.Add(nation, Resource.Money, 1_000_000_000);
        }

        for (int day = 0; day < 120; day++)
        {
            for (int nation = 0; nation < 4; nation++)
            {
                market.Buy(nation, Resource.Food, 5_000);
            }

            market.RunDay();
        }

        Assert.Equal(WorldMarket.RestOfWorldSellPrice(Resource.Food), market.PriceOf(Resource.Food));
        Assert.True(market.CanBuy(0, Resource.Food, 1_000, out _));
    }

    [Fact]
    public void RestOfWorldKeepsTheBoardStockedWhenNoNationSells()
    {
        var stock = new Stockpile(1);
        stock.Add(0, Resource.Money, 1_000_000);
        var market = new WorldMarket(stock);

        Assert.Equal(WorldMarket.RestOfWorldDailyVolume, market.SupplyOf(Resource.Food));
        Assert.Equal(WorldMarket.RestOfWorldDailyVolume, market.DemandOf(Resource.Food));
        Assert.Equal(WorldMarket.RestOfWorldDailyVolume, market.AvailableOf(Resource.Food));
        Assert.Equal(WorldMarket.RestOfWorldDailyVolume, market.AbsorbableOf(Resource.Food));
        Assert.True(market.CanBuy(0, Resource.Food, 5_000, out _));
        Assert.Equal(WorldMarket.BasePriceOf(Resource.Food), market.TargetPriceOf(Resource.Food));
    }

    [Fact]
    public void DailyBuyingQuotaIsEnforced()
    {
        var stock = new Stockpile(2);
        stock.Add(0, Resource.Money, 10_000_000);
        var market = new WorldMarket(stock);

        Assert.Equal(5_000, market.QuotaLeftFor(0, Resource.Food));

        market.Buy(0, Resource.Food, 5_000);

        Assert.Equal(0, market.QuotaLeftFor(0, Resource.Food));
        Assert.False(market.CanBuy(0, Resource.Food, 1, out string reason));
        Assert.Contains("quota", reason);
        Assert.Throws<TradeRejected>(() => market.Buy(0, Resource.Food, 1));
        Assert.Equal(5_000, market.QuotaLeftFor(1, Resource.Food));

        market.RunDay();

        Assert.Equal(5_000, market.QuotaLeftFor(0, Resource.Food));
    }

    [Fact]
    public void QuotaTracksTotalWorldSupply()
    {
        var stock = new Stockpile(2);
        stock.Add(0, Resource.Food, 20_000);
        var market = new WorldMarket(stock);

        Assert.Equal(5_000, market.QuotaLeftFor(1, Resource.Food));

        market.Sell(0, Resource.Food, 20_000);

        Assert.Equal(40_000, market.SupplyOf(Resource.Food));
        Assert.Equal(10_000, market.QuotaLeftFor(1, Resource.Food));
    }

    [Fact]
    public void TransactionFeeIsChargedOnBothSides()
    {
        var stock = new Stockpile(1);
        stock.Add(0, Resource.Money, 1_000_000);
        stock.Add(0, Resource.Food, 5_000);
        var market = new WorldMarket(stock);

        long quotedCost = market.CostOf(Resource.Food, 1_000);
        Trade bought = market.Buy(0, Resource.Food, 1_000);

        Assert.Equal(8_100, bought.Gross);
        Assert.Equal(405, bought.Fee);
        Assert.Equal(-8_505, bought.Net);
        Assert.Equal(quotedCost, -bought.Net);
        Assert.Equal(1_000_000 - 8_505, stock.Get(0, Resource.Money));
        Assert.Equal(6_000, stock.Get(0, Resource.Food));

        long quotedProceeds = market.ProceedsOf(Resource.Food, 1_000);
        Trade sold = market.Sell(0, Resource.Food, 1_000);

        Assert.Equal(8_100, sold.Gross);
        Assert.Equal(405, sold.Fee);
        Assert.Equal(7_695, sold.Net);
        Assert.Equal(quotedProceeds, sold.Net);
        Assert.Equal(5_000, stock.Get(0, Resource.Food));
    }

    /* Every order fills at the average of the price before and after its own
       impact, so buying and selling the same stock in one day cannot turn a
       profit out of the price it moved. Whatever the order size, the round
       trip costs exactly the two fees. */
    [Fact]
    public void ARoundTripLosesAtLeastTheTwoFees()
    {
        const long units = 5_000;

        var stock = new Stockpile(1);
        stock.Add(0, Resource.Money, 1_000_000);
        var market = new WorldMarket(stock);

        Trade bought = market.Buy(0, Resource.Food, units);
        Trade sold = market.Sell(0, Resource.Food, units);

        /* Two fees is the floor, not the exact figure: integer prices round
           against the trader on each leg, so a round trip can lose a little
           more. What matters is that it can never lose less. */
        long lost = 1_000_000 - stock.Get(0, Resource.Money);
        Assert.True(lost >= bought.Fee + sold.Fee);
        Assert.True(lost <= bought.Fee + sold.Fee + units);
        Assert.Equal(0, stock.Get(0, Resource.Food));
        /* The price returns to within a rounding step of where it started,
           not exactly: each leg's integer division loses a fraction. */
        long drift = Math.Abs(market.PriceOf(Resource.Food) - WorldMarket.BasePriceOf(Resource.Food));
        Assert.True(drift <= WorldMarket.BasePriceOf(Resource.Food) / 100);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(7)]
    [InlineData(999)]
    [InlineData(2_500)]
    [InlineData(5_000)]
    public void ARoundTripNeverTurnsAProfit(long units)
    {
        var stock = new Stockpile(1);
        stock.Add(0, Resource.Money, 1_000_000);
        var market = new WorldMarket(stock);

        market.Buy(0, Resource.Food, units);
        market.Sell(0, Resource.Food, units);

        Assert.True(stock.Get(0, Resource.Money) < 1_000_000);
        Assert.Equal(0, stock.Get(0, Resource.Food));
    }

    [Fact]
    public void ANationWithoutMoneyCannotBuy()
    {
        var stock = new Stockpile(1);
        var market = new WorldMarket(stock);

        Assert.False(market.CanBuy(0, Resource.Food, 1, out string reason));
        Assert.Equal("Not enough money.", reason);
        Assert.Throws<TradeRejected>(() => market.Buy(0, Resource.Food, 1_000));
        Assert.Equal(0, stock.Get(0, Resource.Food));
        Assert.Equal(WorldMarket.BasePriceOf(Resource.Food), market.PriceOf(Resource.Food));

        stock.Add(0, Resource.Money, market.CostOf(Resource.Food, 1) - 1);
        Assert.False(market.CanBuy(0, Resource.Food, 1, out _));

        stock.Add(0, Resource.Money, 1);
        Assert.True(market.CanBuy(0, Resource.Food, 1, out _));
    }

    [Fact]
    public void ANationCannotSellStockItDoesNotHold()
    {
        var stock = new Stockpile(1);
        stock.Add(0, Resource.Food, 100);
        var market = new WorldMarket(stock);

        Assert.False(market.CanSell(0, Resource.Food, 101, out _));
        Assert.True(market.CanSell(0, Resource.Food, 100, out _));
        Assert.Throws<TradeRejected>(() => market.Sell(0, Resource.Food, 101));
    }

    [Fact]
    public void SameOrdersProduceTheSamePrices()
    {
        (Stockpile firstStock, WorldMarket firstMarket) = RunScriptedWeek();
        (Stockpile secondStock, WorldMarket secondMarket) = RunScriptedWeek();

        Assert.Contains(Goods, good => firstMarket.PriceOf(good) != WorldMarket.BasePriceOf(good));

        foreach (Resource good in Goods)
        {
            Assert.Equal(firstMarket.PriceOf(good), secondMarket.PriceOf(good));
            Assert.Equal(firstMarket.SupplyOf(good), secondMarket.SupplyOf(good));

            for (int nation = 0; nation < 3; nation++)
            {
                Assert.Equal(firstStock.Get(nation, good), secondStock.Get(nation, good));
            }
        }

        for (int nation = 0; nation < 3; nation++)
        {
            Assert.Equal(firstStock.Get(nation, Resource.Money), secondStock.Get(nation, Resource.Money));
        }
    }

    [Fact]
    public void IntradayPriceRiseIsCappedAtTwelvePercent()
    {
        var stock = new Stockpile(4);
        var market = new WorldMarket(stock);

        for (int nation = 0; nation < 4; nation++)
        {
            stock.Add(nation, Resource.Money, 10_000_000);
            market.Buy(nation, Resource.Food, 5_000);
        }

        Assert.Equal(WorldMarket.BasePriceOf(Resource.Food) * 112 / 100, market.PriceOf(Resource.Food));
    }

    [Fact]
    public void IntradayPriceDropIsCappedAtTwelvePercent()
    {
        var stock = new Stockpile(1);
        stock.Add(0, Resource.Food, 100_000);
        var market = new WorldMarket(stock);

        market.Sell(0, Resource.Food, WorldMarket.RestOfWorldDailyVolume);

        Assert.Equal(WorldMarket.BasePriceOf(Resource.Food) * 88 / 100, market.PriceOf(Resource.Food));
    }

    [Fact]
    public void PriceMovesOnlyAThirdOfTheWayTowardsTheTarget()
    {
        var stock = new Stockpile(1);
        stock.Add(0, Resource.Money, 1_000_000);
        var market = new WorldMarket(stock);

        market.Buy(0, Resource.Food, 5_000);

        long before = market.PriceOf(Resource.Food);
        long target = market.TargetPriceOf(Resource.Food);

        market.RunDay();

        Assert.Equal(9_500, target);
        Assert.Equal(before + ((target - before) / WorldMarket.SmoothingDivisor), market.PriceOf(Resource.Food));
        Assert.NotEqual(target, market.PriceOf(Resource.Food));
    }

    [Fact]
    public void TheMarketCanRunOutOfStockForTheDay()
    {
        var stock = new Stockpile(5);
        var market = new WorldMarket(stock);

        for (int nation = 0; nation < 5; nation++)
        {
            stock.Add(nation, Resource.Money, 10_000_000);
        }

        for (int nation = 0; nation < 4; nation++)
        {
            market.Buy(nation, Resource.Food, 5_000);
        }

        Assert.Equal(0, market.AvailableOf(Resource.Food));
        Assert.Equal(5_000, market.QuotaLeftFor(4, Resource.Food));
        Assert.False(market.CanBuy(4, Resource.Food, 1, out string reason));
        Assert.Contains("no more", reason);

        market.RunDay();

        Assert.Equal(WorldMarket.RestOfWorldDailyVolume, market.AvailableOf(Resource.Food));
    }

    [Fact]
    public void TheMarketWillOnlyAbsorbSoMuchInADay()
    {
        var stock = new Stockpile(1);
        stock.Add(0, Resource.Food, 100_000);
        var market = new WorldMarket(stock);

        market.Sell(0, Resource.Food, WorldMarket.RestOfWorldDailyVolume);

        Assert.Equal(0, market.AbsorbableOf(Resource.Food));
        Assert.False(market.CanSell(0, Resource.Food, 1, out _));

        market.RunDay();

        Assert.True(market.CanSell(0, Resource.Food, 1, out _));
    }

    [Fact]
    public void PricesDriftBackToBaseWhenTradingStops()
    {
        var stock = new Stockpile(1);
        stock.Add(0, Resource.Food, 1_000_000);
        var market = new WorldMarket(stock);

        for (int day = 0; day < 20; day++)
        {
            market.Sell(0, Resource.Food, WorldMarket.RestOfWorldDailyVolume);
            market.RunDay();
        }

        Assert.True(market.PriceOf(Resource.Food) < WorldMarket.BasePriceOf(Resource.Food));

        for (int day = 0; day < 60; day++)
        {
            market.RunDay();
        }

        Assert.Equal(WorldMarket.BasePriceOf(Resource.Food), market.PriceOf(Resource.Food));
    }

    private static void AssertInsideBand(WorldMarket market)
    {
        foreach (Resource good in Goods)
        {
            Assert.InRange(
                market.PriceOf(good),
                WorldMarket.BasePriceOf(good) * 25 / 100,
                WorldMarket.BasePriceOf(good) * 175 / 100);
        }
    }

    private static (Stockpile Stock, WorldMarket Market) RunScriptedWeek()
    {
        var stock = new Stockpile(3);
        var market = new WorldMarket(stock);
        var rng = new DeterministicRandom(4_071);

        for (int nation = 0; nation < 3; nation++)
        {
            stock.Add(nation, Resource.Money, 50_000_000);
        }

        for (int day = 0; day < 7; day++)
        {
            for (int nation = 0; nation < 3; nation++)
            {
                foreach (Resource good in Goods)
                {
                    long units = rng.NextInt(1, 6_000);

                    if (rng.NextInt(2) == 0)
                    {
                        stock.Add(nation, good, units);

                        if (market.CanSell(nation, good, units, out _))
                        {
                            market.Sell(nation, good, units);
                        }
                    }
                    else if (market.CanBuy(nation, good, units, out _))
                    {
                        market.Buy(nation, good, units);
                    }
                }
            }

            market.RunDay();
        }

        return (stock, market);
    }

    [Fact]
    public void BlockadeCutsVolumeNotPrice()
    {
        var stock = new Stockpile(1);
        var market = new WorldMarket(stock);

        long open = market.TradeableVolumeFor(Resource.Food, blockaded: false);
        long cut = market.TradeableVolumeFor(Resource.Food, blockaded: true);

        Assert.True(cut < open);
        Assert.Equal(WorldMarket.BlockadedAccessPercent, market.AccessPercentFor(blockaded: true));
        Assert.Equal(WorldMarket.BaseAccessPercent, market.AccessPercentFor(blockaded: false));

        /* The price a blockaded nation sees is unchanged: what it loses is the
           ability to move goods, which is why holding a strait beats holding
           a treasury. */
        Assert.Equal(WorldMarket.BasePriceOf(Resource.Food), market.PriceOf(Resource.Food));
    }

    [Fact]
    public void ConsumptionCapsHoardingBelowTheShareQuota()
    {
        var stock = new Stockpile(2);
        stock.Add(0, Resource.Money, 10_000_000);
        var market = new WorldMarket(stock);

        long byShare = market.QuotaLeftFor(0, Resource.Food);
        long modest = market.QuotaLeftFor(0, Resource.Food, dailyConsumption: 1_000);

        /* Three days of consumption, since that clears the floor a nation with
           no consumption at all still gets. */
        Assert.True(modest < byShare);
        Assert.Equal(3_000, modest);
    }

    [Fact]
    public void HeavyConsumersStillHitTheShareQuotaFirst()
    {
        var stock = new Stockpile(2);
        var market = new WorldMarket(stock);

        long byShare = market.QuotaLeftFor(0, Resource.Food);
        long hungry = market.QuotaLeftFor(0, Resource.Food, dailyConsumption: 1_000_000);

        Assert.Equal(byShare, hungry);
    }

    [Fact]
    public void EvenNationsThatConsumeNothingKeepAFloor()
    {
        var stock = new Stockpile(2);
        var market = new WorldMarket(stock);

        Assert.True(market.QuotaLeftFor(0, Resource.Food, dailyConsumption: 0) > 0);
    }
}
