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
    /*
       Costs are spread across the goods the world actually produces.

       Of five hundred and thirty cities, twenty-seven make Technology and a
       hundred and twenty-six make Rare Resources. Charging every building in
       Technology meant no nation could afford an army base; without a base it
       could not research a unit, without the research it could not mobilise,
       and across a measured sixty-day run not one unit was built anywhere in
       the world while the same world accumulated a hundred million in money.

       Technology is therefore reserved for the buildings that are genuinely
       technical, and the everyday barracks and yards are paid for in the food,
       materials and rare goods that a nation has to hand. Conflict of Nations
       does the same: its Supplies pay for construction, not its Electronics.
    */
    private static readonly (int Food, int Materials, int Fuel, int Technology, int Rare, int Money, int Hours)[] Level1 =
    [
        (450, 250, 500, 0, 150, 2000, 28),   // ArmyBase
        (600, 350, 350, 80, 300, 1250, 10),  // ArmsIndustry
        (900, 900, 1000, 220, 200, 2750, 24), // AirBase
        (700, 700, 750, 160, 200, 2000, 10), // NavalBase
        (450, 250, 250, 0, 150, 1350, 1),    // RecruitingOffice
        (700, 450, 250, 60, 150, 1350, 25),  // MilitaryHospital
        (600, 750, 750, 0, 0, 2000, 9),      // UndergroundBunkers
        (750, 400, 250, 620, 500, 3500, 25), // SecretWeaponsLab
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
