using NationRise.Core.Buildings;
using NationRise.Core.Economy;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Buildings;

public class CityBuildingsTests
{
    private static (WorldState State, Stockpile Stock, CityBuildings Buildings, int City) Setup()
    {
        var state = WorldFixture.Load().ToWorldState(1);
        var stock = new Stockpile(state.Nations.Count);
        int idn = state.Nations.IndexOf("IDN");

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Owner[i] != idn || !state.Provinces.IsCity[i])
            {
                continue;
            }

            foreach (Resource resource in Enum.GetValues<Resource>())
            {
                stock.Add(idn, resource, 1_000_000);
            }

            return (state, stock, new CityBuildings(state, stock), i);
        }

        throw new InvalidOperationException("No Indonesian city found.");
    }

    [Fact]
    public void SlotsScaleWithPopulation()
    {
        Assert.Equal(2, BuildingInfo.SlotsFor(1f));
        Assert.Equal(4, BuildingInfo.SlotsFor(4f));
        Assert.Equal(5, BuildingInfo.SlotsFor(6f));
        Assert.Equal(7, BuildingInfo.SlotsFor(10f));
        Assert.Equal(7, BuildingInfo.SlotsFor(50f));
    }

    [Fact]
    public void NineBuildingsCompeteForAtMostSevenSlots()
    {
        Assert.True(BuildingInfo.Count > BuildingInfo.SlotsFor(10f));
    }

    [Fact]
    public void HigherLevelsCostMore()
    {
        int cheap = BuildingCost.For(BuildingType.ArmyBase, 1).Sum(c => c.Amount);
        int dear = BuildingCost.For(BuildingType.ArmyBase, 5).Sum(c => c.Amount);

        Assert.True(dear > cheap * 3);
        Assert.True(BuildingCost.HoursFor(BuildingType.ArmyBase, 5) >
                    BuildingCost.HoursFor(BuildingType.ArmyBase, 1));
    }

    [Fact]
    public void BuildingCompletesAfterItsDuration()
    {
        var (state, _, buildings, city) = Setup();
        ConstructionOrder order = buildings.Begin(city, BuildingType.ArmsIndustry);

        Assert.True(buildings.IsBuilding(city));
        Assert.Equal(0, buildings.LevelOf(city, BuildingType.ArmsIndustry));

        while (state.Clock.Tick < order.CompletesAtTick)
        {
            state.Clock.Advance();
        }

        buildings.Tick();

        Assert.Equal(1, buildings.LevelOf(city, BuildingType.ArmsIndustry));
        Assert.False(buildings.IsBuilding(city));
        Assert.Single(buildings.RecentlyCompleted);
    }

    [Fact]
    public void ConstructionSpendsFromTheStockpile()
    {
        var (state, stock, buildings, city) = Setup();
        int nation = state.Provinces.Controller[city];
        long before = stock.Get(nation, Resource.Money);

        buildings.Begin(city, BuildingType.ArmyBase);

        Assert.True(stock.Get(nation, Resource.Money) < before);
    }

    [Fact]
    public void CityBuildsOneThingAtATime()
    {
        var (_, _, buildings, city) = Setup();
        buildings.Begin(city, BuildingType.ArmyBase);

        Assert.Throws<ConstructionRejected>(() => buildings.Begin(city, BuildingType.AirBase));
    }

    [Fact]
    public void EmptyTreasuryStopsConstruction()
    {
        var (state, stock, buildings, city) = Setup();
        int nation = state.Provinces.Controller[city];
        stock.TrySpend(nation, Resource.Money, stock.Get(nation, Resource.Money));

        Assert.Throws<ConstructionRejected>(() => buildings.Begin(city, BuildingType.ArmyBase));
    }

    [Fact]
    public void SlotsRunOut()
    {
        var (state, _, buildings, city) = Setup();
        int slots = BuildingInfo.SlotsFor(state.Provinces.Population[city]);
        var types = Enum.GetValues<BuildingType>();

        for (int i = 0; i < slots; i++)
        {
            ConstructionOrder order = buildings.Begin(city, types[i]);
            state.Clock.AdvanceTo(order.CompletesAtTick);
            buildings.Tick();
        }

        Assert.Equal(slots, buildings.UsedSlots(city));
        Assert.Throws<ConstructionRejected>(() => buildings.Begin(city, types[slots]));
    }

    [Fact]
    public void UpgradingAnExistingBuildingNeedsNoNewSlot()
    {
        var (state, _, buildings, city) = Setup();
        int slots = BuildingInfo.SlotsFor(state.Provinces.Population[city]);
        var types = Enum.GetValues<BuildingType>();

        for (int i = 0; i < slots; i++)
        {
            ConstructionOrder order = buildings.Begin(city, types[i]);
            state.Clock.AdvanceTo(order.CompletesAtTick);
            buildings.Tick();
        }

        ConstructionOrder upgrade = buildings.Begin(city, types[0]);
        Assert.Equal(2, upgrade.TargetLevel);
    }

    [Fact]
    public void ArmsIndustryRaisesOutput()
    {
        var (state, _, buildings, city) = Setup();
        Assert.Equal(1.0f, buildings.ProductionMultiplier(city), 3);

        for (int level = 0; level < 3; level++)
        {
            ConstructionOrder order = buildings.Begin(city, BuildingType.ArmsIndustry);
            state.Clock.AdvanceTo(order.CompletesAtTick);
            buildings.Tick();
        }

        Assert.Equal(1.30f, buildings.ProductionMultiplier(city), 2);
    }

    /* A city taken yesterday should not become a fortress today. */
    [Fact]
    public void LowMoraleSlowsConstruction()
    {
        var (state, _, buildings, city) = Setup();

        state.Provinces.Morale[city] = 1.0f;
        long fast = buildings.Begin(city, BuildingType.ArmyBase).CompletesAtTick;
        buildings.Cancel(city);

        state.Provinces.Morale[city] = 0.25f;
        long slow = buildings.Begin(city, BuildingType.ArmyBase).CompletesAtTick;

        Assert.True(slow > fast);
    }

    [Fact]
    public void PlainProvincesCannotBuild()
    {
        var (state, _, buildings, _) = Setup();

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (!state.Provinces.IsCity[i])
            {
                Assert.Throws<ConstructionRejected>(() => buildings.Begin(i, BuildingType.ArmyBase));
                return;
            }
        }
    }
}
