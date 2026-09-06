using NationRise.Core.Data;
using NationRise.Core.Economy;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Economy;

/*
   The reported rate has to be the rate that actually arrives. A heads-up
   display quoting a number the economy does not honour is worse than one
   quoting nothing.
*/
public class IncomeTests
{
    private static (WorldState State, Stockpile Stock, EconomyTick Economy, ushort Nation) Setup()
    {
        WorldData data = WorldFixture.Load();
        WorldState state = data.ToWorldState(1);
        var stock = new Stockpile(state.Nations.Count);
        var economy = new EconomyTick(state, stock);

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            economy.AssignResource(i, data.ResourceOf(i));
        }

        return (state, stock, economy, (ushort)state.Nations.IndexOf("IDN"));
    }

    [Fact]
    public void ReportedIncomeMatchesWhatADayActuallyPays()
    {
        var (_, stock, economy, nation) = Setup();

        foreach (Resource resource in Enum.GetValues<Resource>())
        {
            long predicted = economy.DailyIncomeOf(nation, resource);
            long before = stock.Get(nation, resource);

            economy.RunDay();

            long gained = stock.Get(nation, resource) - before;
            Assert.Equal(predicted, gained);
        }
    }

    [Fact]
    public void MoneyComesFromEveryProvinceNotJustCities()
    {
        var (state, _, economy, nation) = Setup();

        long money = economy.DailyIncomeOf(nation, Resource.Money);
        long food = economy.DailyIncomeOf(nation, Resource.Food);

        Assert.True(money > 0);
        Assert.True(money > food, "Money is paid by every province and should outweigh one city good.");
        Assert.True(state.Provinces.Count > 0);
    }

    [Fact]
    public void ManpowerRegenerationIsReportedByThePoolThatOwnsIt()
    {
        var (state, stock, _, nation) = Setup();
        var pool = new ManpowerPool(state);

        long predicted = pool.DailyRegenOf(nation, stock);
        long before = stock.Get(nation, Resource.Manpower);

        pool.RunDay(stock);

        Assert.Equal(predicted, stock.Get(nation, Resource.Manpower) - before);
        Assert.True(predicted > 0, "A nation starting with no reserves should be refilling.");
    }

    /* Every nation in the fixture starts with ground, so the landless case is
       made rather than found: conquest is the situation this has to be right
       for. */
    [Fact]
    public void ANationStrippedOfItsProvincesEarnsNothing()
    {
        var (state, _, economy, nation) = Setup();

        Assert.True(economy.DailyIncomeOf(nation, Resource.Money) > 0);

        ushort conqueror = (ushort)state.Nations.IndexOf("AUS");
        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Controller[i] == nation)
            {
                state.Provinces.Controller[i] = conqueror;
            }
        }

        Assert.Equal(0, economy.DailyIncomeOf(nation, Resource.Money));
        Assert.True(economy.DailyIncomeOf(conqueror, Resource.Money) > 0);
    }
}
