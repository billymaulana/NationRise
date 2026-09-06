using NationRise.Core.Economy;
using NationRise.Core.Tests.Data;

namespace NationRise.Core.Tests.Economy;

public class EconomyTickTests
{
    [Fact]
    public void StockpileRefusesToOverspend()
    {
        var stock = new Stockpile(2);
        stock.Add(0, Resource.Money, 100);

        Assert.True(stock.TrySpend(0, Resource.Money, 60));
        Assert.False(stock.TrySpend(0, Resource.Money, 60));
        Assert.Equal(40, stock.Get(0, Resource.Money));
    }

    [Fact]
    public void NationsDoNotShareReserves()
    {
        var stock = new Stockpile(3);
        stock.Add(1, Resource.Food, 500);

        Assert.Equal(500, stock.Get(1, Resource.Food));
        Assert.Equal(0, stock.Get(0, Resource.Food));
        Assert.Equal(0, stock.Get(2, Resource.Food));
    }

    [Fact]
    public void IndonesiaEarnsPlausibleMoneyOnDayOne()
    {
        var state = WorldFixture.Load().ToWorldState(1);
        var stock = new Stockpile(state.Nations.Count);
        var economy = new EconomyTick(state, stock);
        int idn = state.Nations.IndexOf("IDN");

        economy.RunDay();

        /* Conflict of Nations gives Indonesia 10,299 money on day one with
           seven cities; twelve cities on a slightly larger map should land in
           the same neighbourhood, not double it. */
        long money = stock.Get(idn, Resource.Money);
        Assert.InRange(money, 8_000, 18_000);
    }

    [Fact]
    public void PlainProvincesAreCappedAtHalf()
    {
        Assert.Equal(1.00f, ProvinceStatusInfo.CeilingOf(ProvinceStatus.Homeland), 3);
        Assert.Equal(0.50f, ProvinceStatusInfo.CeilingOf(ProvinceStatus.PlainProvince), 3);
        Assert.Equal(0.25f, ProvinceStatusInfo.CeilingOf(ProvinceStatus.Occupied), 3);
        Assert.False(ProvinceStatusInfo.CanMobilise(ProvinceStatus.Occupied));
        Assert.True(ProvinceStatusInfo.CanMobilise(ProvinceStatus.Homeland));
    }

    [Fact]
    public void OnlyCitiesProduceGoods()
    {
        var state = WorldFixture.Load().ToWorldState(1);
        var stock = new Stockpile(state.Nations.Count);
        var economy = new EconomyTick(state, stock);
        int idn = state.Nations.IndexOf("IDN");

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            economy.AssignResource(i, Resource.Food);
        }

        economy.RunDay();

        long food = stock.Get(idn, Resource.Food);
        int cityCount = 0;
        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Owner[i] == idn && state.Provinces.IsCity[i])
            {
                cityCount++;
            }
        }

        Assert.True(food > 0);
        Assert.Equal(12, cityCount);
        Assert.True(ResourceInfo.IsCityGood(Resource.Food));
        Assert.False(ResourceInfo.IsCityGood(Resource.Money));
        Assert.False(ResourceInfo.IsCityGood(Resource.Manpower));
    }
}
