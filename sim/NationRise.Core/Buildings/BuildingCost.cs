using NationRise.Core.Economy;

namespace NationRise.Core.Buildings;

public readonly record struct ResourceCost(Resource Resource, int Amount);

/*
   Costs and durations taken from Conflict of Nations screenshots, remapped to
   this game's seven resources. Higher levels cost more and take longer, so a
   city that spreads itself thin finishes nothing.
*/
public static class BuildingCost
{
    private static readonly (int Food, int Materials, int Fuel, int Technology, int Rare, int Money, int Hours)[] Level1 =
    [
        (250, 250, 500, 250, 0, 2000, 28),   // ArmyBase
        (400, 350, 350, 250, 225, 1250, 10), // ArmsIndustry
        (750, 1000, 1000, 500, 0, 2750, 24), // AirBase
        (500, 750, 750, 500, 0, 2000, 10),   // NavalBase
        (250, 250, 250, 250, 0, 1350, 1),    // RecruitingOffice
        (500, 500, 250, 250, 0, 1350, 25),   // MilitaryHospital
        (500, 750, 750, 0, 0, 2000, 9),      // UndergroundBunkers
        (750, 400, 250, 750, 500, 3500, 25), // SecretWeaponsLab
    ];

    public static IReadOnlyList<ResourceCost> For(BuildingType type, int level)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(level, 1);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(level, BuildingInfo.MaxLevel);

        var basis = Level1[(int)type];
        float scale = ScaleFor(level);

        var costs = new List<ResourceCost>(6);
        Add(costs, Resource.Food, basis.Food, scale);
        Add(costs, Resource.Materials, basis.Materials, scale);
        Add(costs, Resource.Fuel, basis.Fuel, scale);
        Add(costs, Resource.Technology, basis.Technology, scale);
        Add(costs, Resource.RareResources, basis.Rare, scale);
        Add(costs, Resource.Money, basis.Money, scale);

        return costs;
    }

    public static int HoursFor(BuildingType type, int level) =>
        (int)MathF.Round(Level1[(int)type].Hours * ScaleFor(level));

    /* Each level costs roughly 1.4 times the previous one, so a level-five
       building represents about five level-one buildings' worth of investment
       and cannot be reached by accident. */
    private static float ScaleFor(int level) => MathF.Pow(1.40f, level - 1);

    private static void Add(List<ResourceCost> costs, Resource resource, int amount, float scale)
    {
        if (amount > 0)
        {
            costs.Add(new ResourceCost(resource, (int)MathF.Round(amount * scale)));
        }
    }
}
