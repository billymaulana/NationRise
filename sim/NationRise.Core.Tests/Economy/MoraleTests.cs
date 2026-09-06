using NationRise.Core.Buildings;
using NationRise.Core.Diplomacy;
using NationRise.Core.Economy;
using NationRise.Core.Military;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Economy;

public class MoraleTests
{
    private sealed record Harness(
        WorldState State,
        Stockpile Stock,
        Relations Relations,
        UpkeepSystem Upkeep,
        ShortageSystem Shortage,
        MoraleSystem Morale,
        Dictionary<int, Army> Armies,
        int Nation)
    {
        /* The order the day runs in: the bill is charged, what went unpaid
           becomes a day on the ramp, and morale reads the ramp. Running morale
           first would report yesterday's crisis. */
        public void Day()
        {
            Upkeep.RunDay(Armies);
            Morale.RunDay(Stock);
        }

        public void Days(int count)
        {
            for (int day = 0; day < count; day++)
            {
                Day();
            }
        }
    }

    private static Harness Setup()
    {
        var state = WorldFixture.Load().ToWorldState(1);
        var stock = new Stockpile(state.Nations.Count);
        var relations = new Relations(state.Nations.Count);
        var buildings = new CityBuildings(state, stock);
        var shortage = new ShortageSystem(state.Nations.Count);
        var upkeep = new UpkeepSystem(state, stock, buildings) { Shortage = shortage };
        var morale = new MoraleSystem(state, relations, buildings) { Shortage = shortage };
        int nation = state.Nations.IndexOf("IDN");

        foreach (Resource resource in Enum.GetValues<Resource>())
        {
            stock.Add(nation, resource, 100_000);
        }

        return new Harness(state, stock, relations, upkeep, shortage, morale, [], nation);
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

    private static void Garrison(Harness h, int nation, int province, int units)
    {
        var army = new Army { Id = h.Armies.Count, Nation = (ushort)nation, Province = province };
        for (int i = 0; i < units; i++)
        {
            army.Add(UnitCatalogue.MotorizedInfantry);
        }

        h.Armies[army.Id] = army;
    }

    [Fact]
    public void HomelandCitiesClimbTowardsTheirTarget()
    {
        Harness h = Setup();
        int city = FirstCityOf(h.State, h.Nation);
        h.State.Provinces.Morale[city] = 0.30f;

        h.Days(40);

        Assert.InRange(h.State.Provinces.Morale[city], 0.85f, 0.92f);
    }

    [Fact]
    public void MoraleMovesGraduallyNotInstantly()
    {
        Harness h = Setup();
        int city = FirstCityOf(h.State, h.Nation);
        h.State.Provinces.Morale[city] = 0.25f;

        h.Day();
        float afterOneDay = h.State.Provinces.Morale[city];

        Assert.True(afterOneDay > 0.25f);
        Assert.True(afterOneDay < 0.40f);
    }

    [Fact]
    public void OccupiedCitiesSettleLowerThanHomeland()
    {
        Harness h = Setup();
        int city = FirstCityOf(h.State, h.Nation);

        int occupier = h.Nation + 1;
        h.State.Provinces.Controller[city] = (ushort)occupier;
        h.State.Provinces.Morale[city] = 0.25f;

        /* The occupier needs supplies of its own, or the test measures its
           bankruptcy rather than the occupation penalty. */
        foreach (Resource resource in Enum.GetValues<Resource>())
        {
            h.Stock.Add(occupier, resource, 100_000);
        }

        h.Days(40);

        Assert.InRange(h.State.Provinces.Morale[city], 0.55f, 0.65f);
        Assert.True(h.State.Provinces.Morale[city] < MoraleSystem.HomelandTarget);
    }

    [Fact]
    public void WarDragsMoraleDown()
    {
        Harness h = Setup();
        int city = FirstCityOf(h.State, h.Nation);
        h.State.Provinces.Morale[city] = 0.90f;

        for (int enemy = 0; enemy < 8; enemy++)
        {
            int other = h.Nation + enemy + 1;
            if (other < h.Relations.NationCount)
            {
                h.Relations.Set(h.Nation, other, Relation.War);
            }
        }

        h.Days(30);

        Assert.True(h.State.Provinces.Morale[city] < 0.90f);
    }

    [Fact]
    public void WarPenaltyIsCapped()
    {
        Harness h = Setup();
        int city = FirstCityOf(h.State, h.Nation);

        for (int other = 0; other < h.Relations.NationCount; other++)
        {
            if (other != h.Nation)
            {
                h.Relations.Set(h.Nation, other, Relation.War);
            }
        }

        h.Days(40);

        float floor = MoraleSystem.HomelandTarget - MoraleSystem.MaxWarPenalty - 0.05f;
        Assert.True(h.State.Provinces.Morale[city] > floor);
    }

    /* A supply failure should be felt as a political crisis, not a rounding
       error, so it hits every province at once. An army that cannot be fed is
       what makes the failure real: a country with no army owes nothing for
       food and is in no trouble for having an empty granary. */
    [Fact]
    public void AnArmyThatCannotBeFedCrushesMorale()
    {
        Harness h = Setup();
        int city = FirstCityOf(h.State, h.Nation);
        h.State.Provinces.Morale[city] = 0.90f;

        Garrison(h, h.Nation, city, units: 4);
        h.Stock.TrySpend(h.Nation, Resource.Food, h.Stock.Get(h.Nation, Resource.Food));

        h.Days(20);

        Assert.True(h.Upkeep.ShortfallOf(h.Nation, Resource.Food) > 0);
        Assert.True(h.State.Provinces.Morale[city] < 0.60f);
    }

    /* Conquering ground you cannot feed makes it worthless: the occupier's own
       shortage drags the captured province down further than occupation alone. */
    [Fact]
    public void BankruptOccupierMakesConqueredGroundWorthless()
    {
        Harness h = Setup();
        int city = FirstCityOf(h.State, h.Nation);

        h.State.Provinces.Controller[city] = (ushort)(h.Nation + 1);
        h.State.Provinces.Morale[city] = 0.60f;

        h.Days(40);

        Assert.True(h.State.Provinces.Morale[city] < 0.20f);
    }

    [Fact]
    public void MoraleNeverLeavesItsBounds()
    {
        Harness h = Setup();

        for (int other = 0; other < h.Relations.NationCount; other++)
        {
            if (other != h.Nation)
            {
                h.Relations.Set(h.Nation, other, Relation.War);
            }
        }

        Garrison(h, h.Nation, FirstCityOf(h.State, h.Nation), units: 4);
        h.Stock.TrySpend(h.Nation, Resource.Food, h.Stock.Get(h.Nation, Resource.Food));

        h.Days(200);

        for (int i = 0; i < h.State.Provinces.Count; i++)
        {
            Assert.InRange(h.State.Provinces.Morale[i], 0.0f, 1.10f);
        }
    }

    /* The whole point of the ramp: on the first day short the penalty is small
       enough to be a warning rather than a verdict. A cliff at fifty makes the
       same failure either invisible or already lost. */
    [Fact]
    public void TheFirstDayShortBarelyMovesMorale()
    {
        Harness h = Setup();
        int city = FirstCityOf(h.State, h.Nation);

        Garrison(h, h.Nation, city, units: 4);
        h.Stock.TrySpend(h.Nation, Resource.Food, h.Stock.Get(h.Nation, Resource.Food));
        h.State.Provinces.Morale[city] = MoraleSystem.HomelandTarget;

        h.Day();

        Assert.Equal(1, h.Shortage.DaysShortOf(h.Nation, Resource.Food));
        Assert.True(h.State.Provinces.Morale[city] > 0.88f);
    }

    /* Nothing is attached in the shipped default, and the day still has to
       run: a null seam means no penalty, never a crash. */
    [Fact]
    public void MoraleRunsWithNoShortageSystemAttached()
    {
        Harness h = Setup();
        var bare = new MoraleSystem(h.State, h.Relations, new CityBuildings(h.State, h.Stock));
        int city = FirstCityOf(h.State, h.Nation);
        h.State.Provinces.Morale[city] = 0.30f;

        for (int day = 0; day < 40; day++)
        {
            bare.RunDay(h.Stock);
        }

        Assert.InRange(h.State.Provinces.Morale[city], 0.85f, 0.92f);
    }
}
