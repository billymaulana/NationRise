using NationRise.Core.Buildings;
using NationRise.Core.Economy;
using NationRise.Core.Time;
using NationRise.Core.World;

namespace NationRise.Core.Research;

public readonly record struct ResearchOrder(string NodeId, long CompletesAtTick);

public sealed class ResearchRejected(string reason) : Exception(reason);

/*
   Two parallel slots, as in Conflict of Nations. The limit is the whole design:
   with unlimited slots a rich nation simply researches everything, and the
   branch a player picks stops meaning anything.
*/
public sealed class ResearchQueue(WorldState world, Stockpile stockpile, CityBuildings buildings)
{
    public const int Slots = 2;

    private readonly Dictionary<int, HashSet<string>> _completed = [];
    private readonly Dictionary<int, List<ResearchOrder>> _active = [];
    private readonly List<(int Nation, string NodeId)> _finishedThisTick = [];


    public IReadOnlyList<(int Nation, string NodeId)> FinishedThisTick => _finishedThisTick;

    public bool HasCompleted(int nation, string nodeId) =>
        _completed.TryGetValue(nation, out HashSet<string>? done) && done.Contains(nodeId);

    public IReadOnlyCollection<string> CompletedFor(int nation) =>
        _completed.TryGetValue(nation, out HashSet<string>? done) ? done : [];

    public int ActiveCount(int nation) =>
        _active.TryGetValue(nation, out List<ResearchOrder>? list) ? list.Count : 0;

    public bool CanStart(int nation, ResearchNode node, out string reason)
    {
        reason = string.Empty;

        if (HasCompleted(nation, node.Id))
        {
            reason = "Already researched.";
            return false;
        }

        if (ActiveCount(nation) >= Slots)
        {
            reason = $"Both research slots are busy.";
            return false;
        }

        if (world.Clock.Date.Day < node.AvailableFromDay)
        {
            reason = $"Available from day {node.AvailableFromDay}.";
            return false;
        }

        if (node.Requires is not null && !HasCompleted(nation, node.Requires))
        {
            reason = $"Requires {ResearchTree.ById(node.Requires).Name}.";
            return false;
        }

        if (node.RequiresBuilding is BuildingType required && !HasBuilding(nation, required, node.RequiredBuildingLevel))
        {
            reason = $"Requires {BuildingInfo.NameOf(required)} level {node.RequiredBuildingLevel}.";
            return false;
        }

        foreach (ResourceCost cost in node.Cost)
        {
            if (stockpile.Get(nation, cost.Resource) < cost.Amount)
            {
                reason = $"Not enough {cost.Resource}.";
                return false;
            }
        }

        return true;
    }

    public ResearchOrder Start(int nation, ResearchNode node)
    {
        if (!CanStart(nation, node, out string reason))
        {
            throw new ResearchRejected(reason);
        }

        foreach (ResourceCost cost in node.Cost)
        {
            stockpile.TrySpend(nation, cost.Resource, cost.Amount);
        }

        var order = new ResearchOrder(node.Id, world.Clock.Tick + node.Hours);

        if (!_active.TryGetValue(nation, out List<ResearchOrder>? list))
        {
            list = [];
            _active[nation] = list;
        }

        list.Add(order);
        return order;
    }

    public void Tick()
    {
        _finishedThisTick.Clear();
        if (_active.Count == 0)
        {
            return;
        }

        foreach ((int nation, List<ResearchOrder> orders) in _active)
        {
            for (int i = orders.Count - 1; i >= 0; i--)
            {
                if (world.Clock.Tick < orders[i].CompletesAtTick)
                {
                    continue;
                }

                if (!_completed.TryGetValue(nation, out HashSet<string>? done))
                {
                    done = [];
                    _completed[nation] = done;
                }

                done.Add(orders[i].NodeId);
                _finishedThisTick.Add((nation, orders[i].NodeId));
                orders.RemoveAt(i);
            }
        }
    }

    public IEnumerable<ResearchNode> AvailableTo(int nation) =>
        ResearchTree.All.Where(node => CanStart(nation, node, out _));

    private bool HasBuilding(int nation, BuildingType type, int level)
    {
        for (int province = 0; province < world.Provinces.Count; province++)
        {
            if (world.Provinces.Controller[province] != nation)
            {
                continue;
            }

            if (buildings.LevelOf(province, type) >= level)
            {
                return true;
            }
        }

        return false;
    }
}
