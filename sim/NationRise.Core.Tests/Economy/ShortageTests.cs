using NationRise.Core.Buildings;
using NationRise.Core.Economy;
using NationRise.Core.Military;
using NationRise.Core.Research;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Economy;

/*
   Upkeep recorded a shortfall long before anything read it, so a nation could
   fail to feed its army every day for a month and suffer nothing at all. These
   tests are what stops that gap reopening.
*/
public class ShortageTests
{
    private sealed record Harness(
        WorldState State,
        Stockpile Stock,
        CityBuildings Buildings,
        UpkeepSystem Upkeep,
        ShortageSystem Shortage,
        Dictionary<int, Army> Armies,
        ushort Nation)
    {
        public void Days(int count)
        {
            for (int day = 0; day < count; day++)
            {
                Upkeep.RunDay(Armies);
            }
        }
    }

    private static Harness Setup(long money = 100_000_000)
    {
        WorldState state = WorldFixture.Load().ToWorldState(1);
        var stock = new Stockpile(state.Nations.Count);
        var buildings = new CityBuildings(state, stock);
        var shortage = new ShortageSystem(state.Nations.Count);
        var upkeep = new UpkeepSystem(state, stock, buildings) { Shortage = shortage };
        var nation = (ushort)state.Nations.IndexOf("IDN");

        stock.Add(nation, Resource.Money, money);

        return new Harness(state, stock, buildings, upkeep, shortage, [], nation);
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

    private static void Garrison(Harness h, int province, params UnitClass[] units)
    {
        var army = new Army { Id = h.Armies.Count, Nation = h.Nation, Province = province };
        foreach (UnitClass unit in units)
        {
            army.Add(unit);
        }

        h.Armies[army.Id] = army;
    }

    /* The figures the resource research settles on: five per cent on the first
       day, three more each day after, stopping at fifty. */
    [Theory]
    [InlineData(1, 50)]
    [InlineData(2, 80)]
    [InlineData(5, 170)]
    [InlineData(10, 320)]
    [InlineData(16, 500)]
    [InlineData(40, 500)]
    public void TheRampFollowsTheResearchedShape(int days, int expectedPermille)
    {
        Harness h = Setup();
        Garrison(h, FirstCityOf(h.State, h.Nation), UnitCatalogue.MotorizedInfantry);

        h.Days(days);

        Assert.Equal(expectedPermille, h.Shortage.RampPermilleOf(h.Nation, Resource.Food));
    }

    [Fact]
    public void ANationThatStartsPayingAgainWalksBackDownTheRamp()
    {
        Harness h = Setup();
        Garrison(h, FirstCityOf(h.State, h.Nation), UnitCatalogue.MotorizedInfantry);

        h.Days(10);
        int worst = h.Shortage.RampPermilleOf(h.Nation, Resource.Food);

        h.Stock.Add(h.Nation, Resource.Food, 1_000_000);
        h.Days(3);
        int recovering = h.Shortage.RampPermilleOf(h.Nation, Resource.Food);

        h.Days(20);

        Assert.Equal(320, worst);
        Assert.True(recovering < worst, $"Ramp did not fall: {worst} then {recovering}.");
        Assert.Equal(0, h.Shortage.RampPermilleOf(h.Nation, Resource.Food));
    }

    /* The rule that keeps the penalty honest: a shortage is a bill that could
       not be paid, not a store that happens to read zero. A country with no
       tanks owes nothing for fuel and must never be punished for having none. */
    [Fact]
    public void ANationThatOwesNothingIsNeverShort()
    {
        Harness h = Setup();

        h.Days(30);

        Assert.Equal(0, h.Stock.Get(h.Nation, Resource.Fuel));
        Assert.False(h.Shortage.IsShort(h.Nation, Resource.Fuel));
        Assert.False(h.Shortage.IsShort(h.Nation, Resource.Food));
        Assert.Equal(0f, h.Shortage.MoralePenaltyOf(h.Nation));
    }

    /* Every province pays money every day, so a treasury reading zero means the
       state spent everything it had. That one is a crisis whatever the army was
       owed this morning. */
    [Fact]
    public void AnEmptyTreasuryIsAShortageOnItsOwn()
    {
        Harness h = Setup(money: 0);

        h.Days(4);

        Assert.True(h.Shortage.IsShort(h.Nation, Resource.Money));
        Assert.Equal(140, h.Shortage.RampPermilleOf(h.Nation, Resource.Money));
    }

    [Fact]
    public void TheMoralePenaltyIsCappedAtTheFloorRatherThanAddedUp()
    {
        Harness h = Setup(money: 0);
        Garrison(h, FirstCityOf(h.State, h.Nation), UnitCatalogue.MotorizedInfantry);

        h.Days(60);

        Assert.True(h.Shortage.IsShort(h.Nation, Resource.Food));
        Assert.True(h.Shortage.IsShort(h.Nation, Resource.Money));
        Assert.Equal(ShortageSystem.CapPermille / 1000f, h.Shortage.MoralePenaltyOf(h.Nation));
    }

    [Fact]
    public void NoShortageMeansNoPenaltyAnywhere()
    {
        Harness h = Setup();
        h.Stock.Add(h.Nation, Resource.Food, 1_000_000);
        h.Stock.Add(h.Nation, Resource.Fuel, 1_000_000);
        h.Stock.Add(h.Nation, Resource.Materials, 1_000_000);
        Garrison(h, FirstCityOf(h.State, h.Nation), UnitCatalogue.MainBattleTank);

        h.Days(30);

        Assert.Equal(0f, h.Shortage.MoralePenaltyOf(h.Nation));
        Assert.False(h.Shortage.IsProductionHalted(h.Nation));
    }

    /* Materials and technology stop new work rather than weakening the army,
       which the research is explicit about: no combat penalty at all. */
    [Fact]
    public void AMaterialsShortageStopsConstruction()
    {
        Harness h = Setup();
        int city = FirstCityOf(h.State, h.Nation);
        Garrison(h, city, UnitCatalogue.MainBattleTank);

        h.Buildings.Shortage = h.Shortage;
        h.Days(3);

        Assert.True(h.Shortage.IsProductionHalted(h.Nation));

        ConstructionRejected rejected = Assert.Throws<ConstructionRejected>(
            () => h.Buildings.Begin(city, BuildingType.ArmyBase));
        Assert.Contains("Materials", rejected.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void AMaterialsShortageStopsMobilisation()
    {
        Harness h = Setup();
        int city = FirstCityOf(h.State, h.Nation);
        Garrison(h, city, UnitCatalogue.MainBattleTank);

        var research = new ResearchQueue(h.State, h.Stock, h.Buildings);
        var mobilisation = new Mobilisation(h.State, h.Stock, h.Buildings, research)
        {
            Shortage = h.Shortage,
        };

        h.Days(3);

        Assert.False(
            mobilisation.CanMobilise(city, UnitRecipes.For("motorized_infantry"), out string reason));
        Assert.Contains("Materials", reason, StringComparison.Ordinal);
    }

    /* A shortage that has never happened must leave every gate open, or the
       whole economy stalls on day one. */
    [Fact]
    public void AFreshShortageSystemBlocksNothing()
    {
        var shortage = new ShortageSystem(4);

        for (int nation = 0; nation < 4; nation++)
        {
            Assert.False(shortage.IsProductionHalted(nation));
            Assert.Equal(0f, shortage.MoralePenaltyOf(nation));
        }
    }
}
