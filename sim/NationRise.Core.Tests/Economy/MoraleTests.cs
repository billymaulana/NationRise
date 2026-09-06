using NationRise.Core.Buildings;
using NationRise.Core.Diplomacy;
using NationRise.Core.Economy;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Economy;

public class MoraleTests
{
    private static (WorldState State, Stockpile Stock, Relations Relations, MoraleSystem Morale, int Nation)
        Setup()
    {
        var state = WorldFixture.Load().ToWorldState(1);
        var stock = new Stockpile(state.Nations.Count);
        var relations = new Relations(state.Nations.Count);
        var buildings = new CityBuildings(state, stock);
        int nation = state.Nations.IndexOf("IDN");

        foreach (Resource resource in Enum.GetValues<Resource>())
        {
            stock.Add(nation, resource, 100_000);
        }

        return (state, stock, relations, new MoraleSystem(state, relations, buildings), nation);
    }

    private static int FirstCityOf(WorldState state, int nation)
    {
        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Owner[i] == nation && state.Provinces.IsCity[i])
            {
                return i;
            }
        }

        throw new InvalidOperationException("No city.");
    }

    [Fact]
    public void HomelandCitiesClimbTowardsTheirTarget()
    {
        var (state, stock, _, morale, nation) = Setup();
        int city = FirstCityOf(state, nation);
        state.Provinces.Morale[city] = 0.30f;

        for (int day = 0; day < 40; day++)
        {
            morale.RunDay(stock);
        }

        Assert.InRange(state.Provinces.Morale[city], 0.85f, 0.92f);
    }

    [Fact]
    public void MoraleMovesGraduallyNotInstantly()
    {
        var (state, stock, _, morale, nation) = Setup();
        int city = FirstCityOf(state, nation);
        state.Provinces.Morale[city] = 0.25f;

        morale.RunDay(stock);
        float afterOneDay = state.Provinces.Morale[city];

        Assert.True(afterOneDay > 0.25f);
        Assert.True(afterOneDay < 0.40f);
    }

    [Fact]
    public void OccupiedCitiesSettleLowerThanHomeland()
    {
        var (state, stock, _, morale, nation) = Setup();
        int city = FirstCityOf(state, nation);

        int occupier = nation + 1;
        state.Provinces.Controller[city] = (ushort)occupier;
        state.Provinces.Morale[city] = 0.25f;

        /* The occupier needs supplies of its own, or the test measures its
           bankruptcy rather than the occupation penalty. */
        foreach (Resource resource in Enum.GetValues<Resource>())
        {
            stock.Add(occupier, resource, 100_000);
        }

        for (int day = 0; day < 40; day++)
        {
            morale.RunDay(stock);
        }

        Assert.InRange(state.Provinces.Morale[city], 0.55f, 0.65f);
        Assert.True(state.Provinces.Morale[city] < MoraleSystem.HomelandTarget);
    }

    [Fact]
    public void WarDragsMoraleDown()
    {
        var (state, stock, relations, morale, nation) = Setup();
        int city = FirstCityOf(state, nation);
        state.Provinces.Morale[city] = 0.90f;

        for (int enemy = 0; enemy < 8; enemy++)
        {
            int other = nation + enemy + 1;
            if (other < relations.NationCount)
            {
                relations.Set(nation, other, Relation.War);
            }
        }

        for (int day = 0; day < 30; day++)
        {
            morale.RunDay(stock);
        }

        Assert.True(state.Provinces.Morale[city] < 0.90f);
    }

    [Fact]
    public void WarPenaltyIsCapped()
    {
        var (state, stock, relations, morale, nation) = Setup();
        int city = FirstCityOf(state, nation);

        for (int other = 0; other < relations.NationCount; other++)
        {
            if (other != nation)
            {
                relations.Set(nation, other, Relation.War);
            }
        }

        for (int day = 0; day < 40; day++)
        {
            morale.RunDay(stock);
        }

        float floor = MoraleSystem.HomelandTarget - MoraleSystem.MaxWarPenalty - 0.05f;
        Assert.True(state.Provinces.Morale[city] > floor);
    }

    /* A supply failure should be felt as a political crisis, not a rounding
       error, so it hits every province at once. */
    [Fact]
    public void RunningOutOfFoodCrushesMorale()
    {
        var (state, stock, relations, morale, nation) = Setup();
        int city = FirstCityOf(state, nation);
        state.Provinces.Morale[city] = 0.90f;

        stock.TrySpend(nation, Resource.Food, stock.Get(nation, Resource.Food));

        for (int day = 0; day < 20; day++)
        {
            morale.RunDay(stock);
        }

        Assert.True(state.Provinces.Morale[city] < 0.60f);
    }

    /* Conquering ground you cannot feed makes it worthless: the occupier's own
       shortage drags the captured province down further than occupation alone. */
    [Fact]
    public void BankruptOccupierMakesConqueredGroundWorthless()
    {
        var (state, stock, _, morale, nation) = Setup();
        int city = FirstCityOf(state, nation);

        state.Provinces.Controller[city] = (ushort)(nation + 1);
        state.Provinces.Morale[city] = 0.60f;

        for (int day = 0; day < 40; day++)
        {
            morale.RunDay(stock);
        }

        Assert.True(state.Provinces.Morale[city] < 0.20f);
    }

    [Fact]
    public void MoraleNeverLeavesItsBounds()
    {
        var (state, stock, relations, morale, nation) = Setup();

        for (int other = 0; other < relations.NationCount; other++)
        {
            if (other != nation)
            {
                relations.Set(nation, other, Relation.War);
            }
        }

        stock.TrySpend(nation, Resource.Food, stock.Get(nation, Resource.Food));

        for (int day = 0; day < 200; day++)
        {
            morale.RunDay(stock);
        }

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            Assert.InRange(state.Provinces.Morale[i], 0.0f, 1.10f);
        }
    }
}
