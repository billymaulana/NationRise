using NationRise.Core.Buildings;
using NationRise.Core.Data;
using NationRise.Core.Economy;
using NationRise.Core.Military;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Economy;

/*
   Before upkeep existed the economy had no sink at all: stockpiles climbed
   without limit, the market had nothing to arbitrate, and the shortage rules
   could never fire. These tests exist so that cannot come back.
*/
public class UpkeepTests
{
    private sealed record Harness(
        WorldState State,
        Stockpile Stock,
        CityBuildings Buildings,
        UpkeepSystem Upkeep,
        ushort Nation);

    private static Harness Setup()
    {
        WorldData data = WorldFixture.Load();
        WorldState state = data.ToWorldState(1);
        var stock = new Stockpile(state.Nations.Count);
        var buildings = new CityBuildings(state, stock);

        return new Harness(
            state, stock, buildings,
            new UpkeepSystem(state, stock, buildings),
            (ushort)state.Nations.IndexOf("IDN"));
    }

    private static Army Stack(int id, ushort nation, int province, params UnitClass[] units)
    {
        var army = new Army { Id = id, Nation = nation, Province = province };
        foreach (UnitClass unit in units)
        {
            army.Add(unit);
        }

        return army;
    }

    [Fact]
    public void EveryLandUnitCostsMoneyAndFoodEveryDay()
    {
        Assert.True(UnitUpkeep.DailyCost(UnitCatalogue.MotorizedInfantry, Resource.Money) > 0);
        Assert.True(UnitUpkeep.DailyCost(UnitCatalogue.MotorizedInfantry, Resource.Food) > 0);
    }

    /* A warship is a town that floats; it should not cost the same as a rifle
       company. */
    [Fact]
    public void ShipsCostMoreToRunThanInfantry()
    {
        int ship = UnitUpkeep.DailyCost(UnitCatalogue.Destroyer, Resource.Money);
        int foot = UnitUpkeep.DailyCost(UnitCatalogue.MotorizedInfantry, Resource.Money);

        Assert.True(ship > foot, $"Destroyer {ship} should cost more than infantry {foot}.");
    }

    [Fact]
    public void FootTroopsBurnLessFuelThanVehicles()
    {
        int foot = UnitUpkeep.DailyCost(UnitCatalogue.MotorizedInfantry, Resource.Fuel);
        int armour = UnitUpkeep.DailyCost(UnitCatalogue.MainBattleTank, Resource.Fuel);

        Assert.True(armour > foot);
    }

    [Fact]
    public void ADayOfUpkeepActuallyLeavesTheStockpile()
    {
        Harness h = Setup();
        h.Stock.Add(h.Nation, Resource.Money, 1_000_000);

        var armies = new Dictionary<int, Army>
        {
            [1] = Stack(1, h.Nation, 0, UnitCatalogue.MotorizedInfantry, UnitCatalogue.MainBattleTank),
        };

        long before = h.Stock.Get(h.Nation, Resource.Money);
        long bill = h.Upkeep.DailyCostOf(h.Nation, Resource.Money, armies);

        h.Upkeep.RunDay(armies);

        Assert.True(bill > 0);
        Assert.Equal(before - bill, h.Stock.Get(h.Nation, Resource.Money));
    }

    [Fact]
    public void ReportedCostMatchesWhatIsCharged()
    {
        Harness h = Setup();
        h.Stock.Add(h.Nation, Resource.Food, 1_000_000);

        var armies = new Dictionary<int, Army>
        {
            [1] = Stack(1, h.Nation, 0, UnitCatalogue.MotorizedInfantry, UnitCatalogue.MotorizedInfantry),
        };

        long reported = h.Upkeep.DailyCostOf(h.Nation, Resource.Food, armies);
        long before = h.Stock.Get(h.Nation, Resource.Food);

        h.Upkeep.RunDay(armies);

        Assert.Equal(reported, before - h.Stock.Get(h.Nation, Resource.Food));
    }

    /* An unaffordable bill must not push the stockpile below zero: every later
       reading would be meaningless, and shortage is the interesting outcome
       rather than a negative number. */
    [Fact]
    public void AnUnaffordableBillEmptiesTheStoreAndIsRecorded()
    {
        Harness h = Setup();
        h.Stock.Add(h.Nation, Resource.Money, 50);

        var armies = new Dictionary<int, Army>
        {
            [1] = Stack(1, h.Nation, 0, UnitCatalogue.Destroyer, UnitCatalogue.Destroyer),
        };

        long bill = h.Upkeep.DailyCostOf(h.Nation, Resource.Money, armies);
        h.Upkeep.RunDay(armies);

        Assert.True(bill > 50);
        Assert.Equal(0, h.Stock.Get(h.Nation, Resource.Money));
        Assert.Equal(bill - 50, h.Upkeep.ShortfallOf(h.Nation, Resource.Money));
        Assert.True(h.Upkeep.IsStarved(h.Nation));
    }

    [Fact]
    public void ANationWithNoArmyAndNoBuildingsPaysNothing()
    {
        Harness h = Setup();
        ushort empty = (ushort)h.State.Nations.IndexOf("BRA");

        Assert.Equal(0, h.Upkeep.DailyCostOf(empty, Resource.Money, new Dictionary<int, Army>()));
    }

    [Fact]
    public void BuildingsAddToTheDailyBill()
    {
        Harness h = Setup();

        int city = -1;
        for (int i = 0; i < h.State.Provinces.Count && city < 0; i++)
        {
            if (h.State.Provinces.Controller[i] == h.Nation && h.State.Provinces.IsCity[i])
            {
                city = i;
            }
        }

        Assert.True(city >= 0);

        var none = new Dictionary<int, Army>();
        long before = h.Upkeep.DailyCostOf(h.Nation, Resource.Money, none);

        h.Stock.Add(h.Nation, Resource.Money, 10_000_000);
        h.Stock.Add(h.Nation, Resource.Materials, 10_000_000);
        h.Stock.Add(h.Nation, Resource.Food, 10_000_000);
        h.Stock.Add(h.Nation, Resource.Fuel, 10_000_000);
        h.Stock.Add(h.Nation, Resource.Technology, 10_000_000);
        h.Stock.Add(h.Nation, Resource.RareResources, 10_000_000);

        h.Buildings.Begin(city, BuildingType.ArmsIndustry);
        for (int hour = 0; hour < 24 * 40; hour++)
        {
            h.State.Clock.Advance();
            h.Buildings.Tick();
        }

        long after = h.Upkeep.DailyCostOf(h.Nation, Resource.Money, none);

        Assert.True(h.Buildings.LevelOf(city, BuildingType.ArmsIndustry) > 0, "Building never finished.");
        Assert.True(after > before, $"Bill did not rise: {before} then {after}.");
    }
}
