using NationRise.Core.Economy;
using NationRise.Core.Tests.Data;

namespace NationRise.Core.Tests.Economy;

public class ManpowerTests
{
    [Fact]
    public void HigherMobilisationRaisesCapacityAndCost()
    {
        Assert.True(ManpowerInfo.FractionFor(MobilisationLevel.Total) >
                    ManpowerInfo.FractionFor(MobilisationLevel.Peace));

        Assert.Equal(0f, ManpowerInfo.MoneyPenalty(MobilisationLevel.Peace));
        Assert.True(ManpowerInfo.MoneyPenalty(MobilisationLevel.Total) > 0f);
        Assert.True(ManpowerInfo.MoralePenalty(MobilisationLevel.Total) > 0f);
    }

    [Fact]
    public void CapacityFollowsTerritory()
    {
        var state = WorldFixture.Load().ToWorldState(1);
        var pool = new ManpowerPool(state);
        int idn = state.Nations.IndexOf("IDN");

        float peace = pool.CapacityOf(idn);
        pool.SetLevel(idn, MobilisationLevel.Total);
        float total = pool.CapacityOf(idn);

        Assert.True(peace > 0f);

        /* Full mobilisation is a little under three times the peacetime pool.
           It used to be nearly seven, which read as a country that keeps almost
           nobody under arms until war comes; at that peacetime share no nation
           could hold even two formations and none was ever raised anywhere. */
        Assert.InRange(total / peace, 2.0f, 4.0f);
    }

    [Fact]
    public void OccupiedGroundYieldsLessManpower()
    {
        var state = WorldFixture.Load().ToWorldState(1);
        var pool = new ManpowerPool(state);
        int idn = state.Nations.IndexOf("IDN");

        float owned = pool.CapacityOf(idn);

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Owner[i] == idn)
            {
                state.Provinces.Owner[i] = (ushort)(idn + 1);
            }
        }

        Assert.True(pool.CapacityOf(idn) < owned);
    }

    /* Losses take time to replace even when the population is there, which is
       what stops a nation from grinding through unlimited armies. */
    [Fact]
    public void PoolRefillsGraduallyTowardsCapacity()
    {
        var state = WorldFixture.Load().ToWorldState(1);
        var pool = new ManpowerPool(state);
        var stock = new Stockpile(state.Nations.Count);
        int idn = state.Nations.IndexOf("IDN");

        float capacity = pool.CapacityOf(idn);

        pool.RunDay(stock);
        long afterOneDay = stock.Get(idn, Resource.Manpower);

        for (int day = 0; day < 60; day++)
        {
            pool.RunDay(stock);
        }

        long afterTwoMonths = stock.Get(idn, Resource.Manpower);

        Assert.True(afterOneDay > 0);
        Assert.True(afterTwoMonths > afterOneDay * 5);
        Assert.True(afterTwoMonths < capacity);
    }
}
