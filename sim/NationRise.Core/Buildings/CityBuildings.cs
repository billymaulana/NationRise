using NationRise.Core.Economy;
using NationRise.Core.World;

namespace NationRise.Core.Buildings;

public readonly record struct ConstructionOrder(
    int Province,
    BuildingType Type,
    int TargetLevel,
    long CompletesAtTick);

public sealed class ConstructionRejected(string reason) : Exception(reason);

/*
   Buildings per city and the queue that raises them. One item at a time per
   city, as in Conflict of Nations: the constraint is what turns a city into a
   sequence of decisions instead of a shopping list.
*/
public sealed class CityBuildings(WorldState world, Stockpile stockpile)
{
    private readonly Dictionary<int, byte[]> _levels = [];
    private readonly Dictionary<int, ConstructionOrder> _queue = [];
    private readonly List<ConstructionOrder> _completed = [];

    public IReadOnlyList<ConstructionOrder> RecentlyCompleted => _completed;

    public void ClearCompleted() => _completed.Clear();

    public int LevelOf(int province, BuildingType type) =>
        _levels.TryGetValue(province, out byte[]? levels) ? levels[(int)type] : 0;

    public int UsedSlots(int province)
    {
        if (!_levels.TryGetValue(province, out byte[]? levels))
        {
            return 0;
        }

        int used = 0;
        foreach (byte level in levels)
        {
            if (level > 0)
            {
                used++;
            }
        }

        return used;
    }

    public bool IsBuilding(int province) => _queue.ContainsKey(province);

    public ConstructionOrder? OrderIn(int province) =>
        _queue.TryGetValue(province, out ConstructionOrder order) ? order : null;

    public ConstructionOrder Begin(int province, BuildingType type)
    {
        if (!world.Provinces.IsCity[province])
        {
            throw new ConstructionRejected("Only cities can build.");
        }

        if (_queue.ContainsKey(province))
        {
            throw new ConstructionRejected("That city is already building something.");
        }

        int current = LevelOf(province, type);
        if (current >= BuildingInfo.MaxLevel)
        {
            throw new ConstructionRejected($"{BuildingInfo.NameOf(type)} is already at maximum level.");
        }

        if (current == 0 && UsedSlots(province) >= BuildingInfo.SlotsFor(world.Provinces.Population[province]))
        {
            throw new ConstructionRejected("No building slots left in that city.");
        }

        int level = current + 1;
        ushort nation = world.Provinces.Controller[province];

        foreach (ResourceCost cost in BuildingCost.For(type, level))
        {
            if (stockpile.Get(nation, cost.Resource) < cost.Amount)
            {
                throw new ConstructionRejected($"Not enough {cost.Resource}.");
            }
        }

        foreach (ResourceCost cost in BuildingCost.For(type, level))
        {
            stockpile.TrySpend(nation, cost.Resource, cost.Amount);
        }

        /* Low morale slows construction, so a freshly conquered city cannot be
           turned into a fortress overnight. */
        float moraleFactor = 1f / (0.75f + 0.25f * MathF.Max(world.Provinces.Morale[province], 0.25f));
        int hours = (int)MathF.Round(BuildingCost.HoursFor(type, level) * moraleFactor);

        var order = new ConstructionOrder(province, type, level, world.Clock.Tick + hours);
        _queue[province] = order;
        return order;
    }

    public void Cancel(int province) => _queue.Remove(province);

    public void Tick()
    {
        _completed.Clear();
        if (_queue.Count == 0)
        {
            return;
        }

        var finished = new List<int>();
        foreach ((int province, ConstructionOrder order) in _queue)
        {
            if (world.Clock.Tick < order.CompletesAtTick)
            {
                continue;
            }

            if (!_levels.TryGetValue(province, out byte[]? levels))
            {
                levels = new byte[BuildingInfo.Count];
                _levels[province] = levels;
            }

            levels[(int)order.Type] = (byte)order.TargetLevel;
            _completed.Add(order);
            finished.Add(province);
        }

        foreach (int province in finished)
        {
            _queue.Remove(province);
        }
    }

    public float ProductionMultiplier(int province) =>
        1f + BuildingInfo.ProductionBonus(BuildingType.ArmsIndustry, LevelOf(province, BuildingType.ArmsIndustry));
}
