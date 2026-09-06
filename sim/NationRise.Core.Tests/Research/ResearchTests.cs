using NationRise.Core.Buildings;
using NationRise.Core.Economy;
using NationRise.Core.Research;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Research;

public class ResearchTests
{
    private static (WorldState State, Stockpile Stock, CityBuildings Buildings, ResearchQueue Queue, int Nation)
        Setup(bool rich = true)
    {
        var state = WorldFixture.Load().ToWorldState(1);
        var stock = new Stockpile(state.Nations.Count);
        var buildings = new CityBuildings(state, stock);
        int nation = state.Nations.IndexOf("IDN");

        if (rich)
        {
            foreach (Resource resource in Enum.GetValues<Resource>())
            {
                stock.Add(nation, resource, 1_000_000);
            }
        }

        return (state, stock, buildings, new ResearchQueue(state, stock, buildings), nation);
    }

    private static void RunTo(WorldState state, int day)
    {
        while (state.Clock.Date.Day < day)
        {
            state.Clock.Advance();
        }
    }

    [Fact]
    public void DayOneResearchIsAvailableImmediately()
    {
        var (_, _, _, queue, nation) = Setup();
        Assert.True(queue.CanStart(nation, ResearchTree.ById("motorized_1"), out _));
    }

    [Fact]
    public void LaterResearchIsGatedByGameDay()
    {
        var (state, _, _, queue, nation) = Setup();
        var node = ResearchTree.ById("tank_2");

        Assert.False(queue.CanStart(nation, node, out string reason));
        Assert.Contains("day", reason, StringComparison.OrdinalIgnoreCase);

        RunTo(state, node.AvailableFromDay);
        Assert.DoesNotContain("day", Because(queue, nation, node), StringComparison.OrdinalIgnoreCase);

        static string Because(ResearchQueue q, int n, ResearchNode node)
        {
            q.CanStart(n, node, out string why);
            return why;
        }
    }

    [Fact]
    public void OnlyTwoThingsCanBeResearchedAtOnce()
    {
        var (state, _, _, queue, nation) = Setup();
        RunTo(state, 10);

        /* Three nodes with no building prerequisite, so the test exercises the
           slot limit rather than tripping over a missing Army Base. */
        queue.Start(nation, ResearchTree.ById("motorized_1"));
        queue.Start(nation, ResearchTree.ById("entrenchment"));

        Assert.Equal(ResearchQueue.Slots, queue.ActiveCount(nation));
        Assert.Throws<ResearchRejected>(() => queue.Start(nation, ResearchTree.ById("logistics")));
    }

    [Fact]
    public void ResearchCompletesAfterItsDuration()
    {
        var (state, _, _, queue, nation) = Setup();
        var node = ResearchTree.ById("motorized_1");
        ResearchOrder order = queue.Start(nation, node);

        Assert.False(queue.HasCompleted(nation, node.Id));

        while (state.Clock.Tick < order.CompletesAtTick)
        {
            state.Clock.Advance();
        }

        queue.Tick();

        Assert.True(queue.HasCompleted(nation, node.Id));
        Assert.Equal(0, queue.ActiveCount(nation));
        Assert.Single(queue.FinishedThisTick);
    }

    [Fact]
    public void PrerequisitesMustBeResearchedFirst()
    {
        var (state, _, _, queue, nation) = Setup();
        RunTo(state, 15);

        Assert.False(queue.CanStart(nation, ResearchTree.ById("motorized_2"), out string reason));
        Assert.Contains("Requires", reason);

        ResearchOrder first = queue.Start(nation, ResearchTree.ById("motorized_1"));
        state.Clock.AdvanceTo(first.CompletesAtTick);
        queue.Tick();

        Assert.True(queue.CanStart(nation, ResearchTree.ById("motorized_2"), out _));
    }

    [Fact]
    public void SomeResearchNeedsABuildingFirst()
    {
        var (state, stock, buildings, queue, nation) = Setup();
        RunTo(state, 10);

        var node = ResearchTree.ById("fighter_1");
        Assert.False(queue.CanStart(nation, node, out string reason));
        Assert.Contains("Air Base", reason);

        int city = FirstCityOf(state, nation);
        ConstructionOrder order = buildings.Begin(city, BuildingType.AirBase);
        state.Clock.AdvanceTo(order.CompletesAtTick);
        buildings.Tick();

        Assert.True(queue.CanStart(nation, node, out _));
    }

    [Fact]
    public void ResearchCostsResources()
    {
        var (_, stock, _, queue, nation) = Setup();
        long before = stock.Get(nation, Resource.RareResources);

        queue.Start(nation, ResearchTree.ById("motorized_1"));

        Assert.True(stock.Get(nation, Resource.RareResources) < before);
    }

    [Fact]
    public void PoorNationsCannotResearch()
    {
        var (_, _, _, queue, nation) = Setup(rich: false);

        Assert.False(queue.CanStart(nation, ResearchTree.ById("motorized_1"), out string reason));
        Assert.Contains("Not enough", reason);
    }

    [Fact]
    public void AvailableListRespectsEveryGate()
    {
        var (state, _, _, queue, nation) = Setup();
        var earlyCount = queue.AvailableTo(nation).Count();

        RunTo(state, 12);
        var laterCount = queue.AvailableTo(nation).Count();

        Assert.True(laterCount > earlyCount);
    }

    /* Every node must be reachable, or the tree contains dead branches the
       player can see but never take. */
    [Fact]
    public void EveryNodePrerequisiteExists()
    {
        foreach (ResearchNode node in ResearchTree.All)
        {
            if (node.Requires is not null)
            {
                Assert.NotNull(ResearchTree.ById(node.Requires));
            }
        }
    }

    [Fact]
    public void PrerequisitesUnlockNoEarlierThanTheirParent()
    {
        foreach (ResearchNode node in ResearchTree.All.Where(n => n.Requires is not null))
        {
            ResearchNode parent = ResearchTree.ById(node.Requires!);
            Assert.True(node.AvailableFromDay >= parent.AvailableFromDay);
        }
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

        throw new InvalidOperationException("Nation has no city.");
    }
}
