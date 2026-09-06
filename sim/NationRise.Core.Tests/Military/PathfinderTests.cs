using NationRise.Core.Military;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Military;

public class PathfinderTests
{
    private static (Pathfinder Finder, WorldState State) Build()
    {
        var data = WorldFixture.Load();
        var state = data.ToWorldState(1);
        return (new Pathfinder(data.Land, data.Sea, state.Provinces.Count), state);
    }

    private static Pathfinder.StepCost CostFor(WorldState state) =>
        (_, to, bySea) => MovementCost.HoursFor(state.Provinces[to].Terrain, bySea);

    [Fact]
    public void PathToSelfIsTrivial()
    {
        var (finder, state) = Build();
        Assert.Single(finder.FindPath(10, 10, CostFor(state)));
    }

    [Fact]
    public void EveryIndonesianProvinceIsReachableFromTheCapital()
    {
        var (finder, state) = Build();
        int idn = state.Nations.IndexOf("IDN");
        var owned = new List<int>();

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Owner[i] == idn)
            {
                owned.Add(i);
            }
        }

        int capital = owned[0];
        var cost = CostFor(state);

        foreach (int target in owned)
        {
            Assert.NotEmpty(finder.FindPath(capital, target, cost));
        }
    }

    [Fact]
    public void MountainsCostMoreThanOpenGround()
    {
        Assert.True(
            MovementCost.HoursFor(Terrain.Mountains, false) >
            MovementCost.HoursFor(Terrain.OpenGround, false));

        Assert.Equal(3.03f * MovementCost.BaseHours, MovementCost.HoursFor(Terrain.Mountains, false), 2);
    }

    [Fact]
    public void PathsAreContiguous()
    {
        var (finder, state) = Build();
        var data = WorldFixture.Load();
        int idn = state.Nations.IndexOf("IDN");

        int start = -1;
        int goal = -1;
        for (int i = 0; i < state.Provinces.Count && goal < 0; i++)
        {
            if (state.Provinces.Owner[i] != idn)
            {
                continue;
            }

            if (start < 0) start = i;
            else goal = i;
        }

        var path = finder.FindPath(start, goal, CostFor(state));
        Assert.True(path.Count >= 2);

        for (int i = 0; i + 1 < path.Count; i++)
        {
            bool linked =
                data.Land.NeighboursOf(path[i]).Contains((ushort)path[i + 1]) ||
                data.Sea.NeighboursOf(path[i]).Contains((ushort)path[i + 1]);
            Assert.True(linked, $"Step {path[i]} -> {path[i + 1]} is not a real link.");
        }
    }
}
