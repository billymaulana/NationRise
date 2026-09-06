using NationRise.Core.Buildings;
using NationRise.Core.Economy;
using NationRise.Core.Research;
using NationRise.Core.World;

namespace NationRise.Core.Military;

public readonly record struct MobilisationOrder(
    int Province,
    string UnitClassId,
    long CompletesAtTick);

public sealed class MobilisationRejected(string reason) : Exception(reason);

public sealed record UnitRecipe(
    string UnitClassId,
    IReadOnlyList<ResourceCost> Cost,
    int Hours,
    string RequiresResearch,
    BuildingType RequiresBuilding,
    int RequiredBuildingLevel);

/*
   Turning stockpiles into troops. Only cities mobilise, and only cities with
   the right building, which is what makes taking a city worth more than taking
   the ground around it.
*/
public static class UnitRecipes
{
    private static ResourceCost[] Cost(int food, int materials, int manpower, int technology, int money) =>
        technology > 0
            ? [new(Resource.Food, food), new(Resource.Materials, materials),
               new(Resource.Manpower, manpower), new(Resource.Technology, technology),
               new(Resource.Money, money)]
            : [new(Resource.Food, food), new(Resource.Materials, materials),
               new(Resource.Manpower, manpower), new(Resource.Money, money)];

    public static readonly IReadOnlyList<UnitRecipe> All =
    [
        new("motorized_infantry", Cost(650, 350, 850, 0, 1000), 20,
            "motorized_1", BuildingType.ArmyBase, 1),
        new("mechanized_infantry", Cost(500, 950, 1000, 0, 1750), 22,
            "mechanized_1", BuildingType.ArmyBase, 2),
        new("main_battle_tank", Cost(0, 1800, 700, 700, 1700), 28,
            "tank_1", BuildingType.ArmyBase, 2),
        new("towed_artillery", Cost(1000, 950, 400, 0, 1200), 20,
            "artillery_1", BuildingType.ArmyBase, 1),
        new("naval_infantry", Cost(400, 800, 850, 0, 1500), 24,
            "naval_infantry", BuildingType.NavalBase, 2),
    ];

    public static UnitRecipe For(string unitClassId) =>
        All.FirstOrDefault(r => r.UnitClassId == unitClassId)
        ?? throw new KeyNotFoundException($"No recipe for '{unitClassId}'.");
}

public sealed class Mobilisation(
    WorldState world,
    Stockpile stockpile,
    CityBuildings buildings,
    ResearchQueue research)
{
    private readonly Dictionary<int, MobilisationOrder> _queue = [];
    private readonly List<MobilisationOrder> _completed = [];

    public IReadOnlyList<MobilisationOrder> RecentlyCompleted => _completed;

    public bool IsMobilising(int province) => _queue.ContainsKey(province);

    public MobilisationOrder? OrderIn(int province) =>
        _queue.TryGetValue(province, out MobilisationOrder order) ? order : null;

    public bool CanMobilise(int province, UnitRecipe recipe, out string reason)
    {
        reason = string.Empty;

        if (!world.Provinces.IsCity[province])
        {
            reason = "Only cities mobilise.";
            return false;
        }

        if (_queue.ContainsKey(province))
        {
            reason = "That city is already mobilising.";
            return false;
        }

        ushort nation = world.Provinces.Controller[province];

        /* Occupied cities cannot raise troops until annexed: a conquest that
           immediately funds the next conquest makes momentum unstoppable. */
        if (world.Provinces.Owner[province] != nation)
        {
            reason = "Occupied cities cannot mobilise.";
            return false;
        }

        if (!research.HasCompleted(nation, recipe.RequiresResearch))
        {
            reason = $"Requires {ResearchTree.ById(recipe.RequiresResearch).Name}.";
            return false;
        }

        if (buildings.LevelOf(province, recipe.RequiresBuilding) < recipe.RequiredBuildingLevel)
        {
            reason = $"Requires {BuildingInfo.NameOf(recipe.RequiresBuilding)} level {recipe.RequiredBuildingLevel}.";
            return false;
        }

        foreach (ResourceCost cost in recipe.Cost)
        {
            if (stockpile.Get(nation, cost.Resource) < cost.Amount)
            {
                reason = $"Not enough {cost.Resource}.";
                return false;
            }
        }

        return true;
    }

    public MobilisationOrder Begin(int province, UnitRecipe recipe)
    {
        if (!CanMobilise(province, recipe, out string reason))
        {
            throw new MobilisationRejected(reason);
        }

        ushort nation = world.Provinces.Controller[province];
        foreach (ResourceCost cost in recipe.Cost)
        {
            stockpile.TrySpend(nation, cost.Resource, cost.Amount);
        }

        int recruiting = buildings.LevelOf(province, BuildingType.RecruitingOffice);
        float speedup = 1f / (1f + recruiting * 0.15f);
        int hours = (int)MathF.Round(recipe.Hours * speedup);

        var order = new MobilisationOrder(province, recipe.UnitClassId, world.Clock.Tick + hours);
        _queue[province] = order;
        return order;
    }

    public void Tick(Dictionary<int, Army> armies, ref int nextArmyId)
    {
        _completed.Clear();
        if (_queue.Count == 0)
        {
            return;
        }

        var finished = new List<int>();
        foreach ((int province, MobilisationOrder order) in _queue)
        {
            if (world.Clock.Tick < order.CompletesAtTick)
            {
                continue;
            }

            ushort nation = world.Provinces.Controller[province];
            UnitClass unitClass = UnitCatalogue.ById(order.UnitClassId);

            /* New units join a stack already sitting in the city when there is
               room, so a defended city grows a garrison instead of scattering
               single units across the map. */
            Army? existing = armies.Values.FirstOrDefault(a =>
                a.Province == province && a.Nation == nation && a.Count < Combat.MaxStackWithoutPenalty);

            if (existing is not null)
            {
                existing.Add(unitClass);
            }
            else
            {
                var army = new Army { Id = nextArmyId++, Nation = nation, Province = province };
                army.Add(unitClass);
                armies[army.Id] = army;
            }

            _completed.Add(order);
            finished.Add(province);
        }

        foreach (int province in finished)
        {
            _queue.Remove(province);
        }
    }
}
