using NationRise.Core.Buildings;
using NationRise.Core.Economy;
using NationRise.Core.Military;
using NationRise.Core.Research;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Military;

public class MobilisationTests
{
    private sealed record Harness(
        WorldState State,
        Stockpile Stock,
        CityBuildings Buildings,
        ResearchQueue Research,
        Mobilisation Mobilisation,
        int Nation,
        int City);

    private static Harness Setup(bool rich = true)
    {
        var state = WorldFixture.Load().ToWorldState(1);
        var stock = new Stockpile(state.Nations.Count);
        var buildings = new CityBuildings(state, stock);
        var research = new ResearchQueue(state, stock, buildings);
        var mobilisation = new Mobilisation(state, stock, buildings, research);
        int nation = state.Nations.IndexOf("IDN");

        if (rich)
        {
            foreach (Resource resource in Enum.GetValues<Resource>())
            {
                stock.Add(nation, resource, 10_000_000);
            }
        }

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Owner[i] == nation && state.Provinces.IsCity[i])
            {
                return new Harness(state, stock, buildings, research, mobilisation, nation, i);
            }
        }

        throw new InvalidOperationException("No Indonesian city found.");
    }

    private static void Complete(Harness h, BuildingType type, int times = 1)
    {
        for (int i = 0; i < times; i++)
        {
            ConstructionOrder order = h.Buildings.Begin(h.City, type);
            h.State.Clock.AdvanceTo(order.CompletesAtTick);
            h.Buildings.Tick();
        }
    }

    private static void Complete(Harness h, string researchId)
    {
        ResearchOrder order = h.Research.Start(h.Nation, ResearchTree.ById(researchId));
        h.State.Clock.AdvanceTo(order.CompletesAtTick);
        h.Research.Tick();
    }

    [Fact]
    public void MobilisationNeedsResearchFirst()
    {
        var h = Setup();
        Complete(h, BuildingType.ArmyBase);

        Assert.False(h.Mobilisation.CanMobilise(
            h.City, UnitRecipes.For("motorized_infantry"), out string reason));
        Assert.Contains("Requires", reason);
    }

    [Fact]
    public void MobilisationNeedsTheRightBuilding()
    {
        var h = Setup();
        Complete(h, "motorized_1");

        Assert.False(h.Mobilisation.CanMobilise(
            h.City, UnitRecipes.For("motorized_infantry"), out string reason));
        Assert.Contains("Army Base", reason);
    }

    [Fact]
    public void UnitAppearsAfterMobilisation()
    {
        var h = Setup();
        Complete(h, "motorized_1");
        Complete(h, BuildingType.ArmyBase);

        var armies = new Dictionary<int, Army>();
        int nextId = 1;

        MobilisationOrder order = h.Mobilisation.Begin(h.City, UnitRecipes.For("motorized_infantry"));
        Assert.True(h.Mobilisation.IsMobilising(h.City));
        Assert.Empty(armies);

        h.State.Clock.AdvanceTo(order.CompletesAtTick);
        h.Mobilisation.Tick(armies, ref nextId);

        Assert.Single(armies);
        Assert.Equal(h.City, armies.Values.First().Province);
        Assert.Equal(h.Nation, armies.Values.First().Nation);
        Assert.False(h.Mobilisation.IsMobilising(h.City));
    }

    [Fact]
    public void MobilisationSpendsManpower()
    {
        var h = Setup();
        Complete(h, "motorized_1");
        Complete(h, BuildingType.ArmyBase);

        long before = h.Stock.Get(h.Nation, Resource.Manpower);
        h.Mobilisation.Begin(h.City, UnitRecipes.For("motorized_infantry"));

        Assert.True(h.Stock.Get(h.Nation, Resource.Manpower) < before);
    }

    [Fact]
    public void PoorNationsCannotMobilise()
    {
        var h = Setup(rich: false);

        Assert.False(h.Mobilisation.CanMobilise(
            h.City, UnitRecipes.For("motorized_infantry"), out string reason));
        Assert.False(string.IsNullOrWhiteSpace(reason));
    }

    [Fact]
    public void OccupiedCitiesCannotMobilise()
    {
        var h = Setup();
        Complete(h, "motorized_1");
        Complete(h, BuildingType.ArmyBase);

        h.State.Provinces.Controller[h.City] = (ushort)(h.Nation + 1);

        Assert.False(h.Mobilisation.CanMobilise(
            h.City, UnitRecipes.For("motorized_infantry"), out string reason));
        Assert.Contains("Occupied", reason);
    }

    [Fact]
    public void RecruitingOfficeSpeedsMobilisation()
    {
        var slow = Setup();
        Complete(slow, "motorized_1");
        Complete(slow, BuildingType.ArmyBase);
        long slowTicks = slow.Mobilisation.Begin(slow.City, UnitRecipes.For("motorized_infantry")).CompletesAtTick
            - slow.State.Clock.Tick;

        var fast = Setup();
        Complete(fast, "motorized_1");
        Complete(fast, BuildingType.ArmyBase);
        Complete(fast, BuildingType.RecruitingOffice, 3);
        long fastTicks = fast.Mobilisation.Begin(fast.City, UnitRecipes.For("motorized_infantry")).CompletesAtTick
            - fast.State.Clock.Tick;

        Assert.True(fastTicks < slowTicks);
    }

    [Fact]
    public void NewUnitsJoinAnExistingGarrison()
    {
        var h = Setup();
        Complete(h, "motorized_1");
        Complete(h, BuildingType.ArmyBase);

        var armies = new Dictionary<int, Army>();
        int nextId = 1;

        for (int i = 0; i < 3; i++)
        {
            MobilisationOrder order = h.Mobilisation.Begin(h.City, UnitRecipes.For("motorized_infantry"));
            h.State.Clock.AdvanceTo(order.CompletesAtTick);
            h.Mobilisation.Tick(armies, ref nextId);
        }

        Assert.Single(armies);
        Assert.Equal(3, armies.Values.First().Count);
    }

    [Fact]
    public void MobilisationTakesOneCityAtATime()
    {
        var h = Setup();
        Complete(h, "motorized_1");
        Complete(h, BuildingType.ArmyBase);

        h.Mobilisation.Begin(h.City, UnitRecipes.For("motorized_infantry"));

        Assert.Throws<MobilisationRejected>(() =>
            h.Mobilisation.Begin(h.City, UnitRecipes.For("motorized_infantry")));
    }

    [Fact]
    public void EveryRecipePointsAtRealResearchAndUnits()
    {
        foreach (UnitRecipe recipe in UnitRecipes.All)
        {
            Assert.NotNull(UnitCatalogue.ById(recipe.UnitClassId));
            Assert.NotNull(ResearchTree.ById(recipe.RequiresResearch));
            Assert.True(recipe.Cost.Count > 0);
            Assert.True(recipe.Hours > 0);
        }
    }
}
