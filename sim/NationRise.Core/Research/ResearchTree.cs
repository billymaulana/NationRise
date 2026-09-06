using NationRise.Core.Buildings;
using NationRise.Core.Economy;

namespace NationRise.Core.Research;

public enum ResearchBranch : byte
{
    Infantry = 0,
    Armour = 1,
    Support = 2,
    Air = 3,
    Naval = 4,
    Doctrine = 5,
}

public sealed record ResearchNode(
    string Id,
    string Name,
    ResearchBranch Branch,
    int Tier,
    int AvailableFromDay,
    int Hours,
    IReadOnlyList<ResourceCost> Cost,
    string? Requires = null,
    BuildingType? RequiresBuilding = null,
    int RequiredBuildingLevel = 0);

/*
   Research is gated by game day as well as prerequisites, which is what keeps
   every campaign on a comparable arc: a player cannot rush to late-war
   equipment on day three no matter how rich they are.
*/
public static class ResearchTree
{
    private static ResourceCost[] Cost(int food, int rare, int money, int technology = 0) =>
        technology > 0
            ? [new(Resource.Food, food), new(Resource.RareResources, rare),
               new(Resource.Technology, technology), new(Resource.Money, money)]
            : [new(Resource.Food, food), new(Resource.RareResources, rare), new(Resource.Money, money)];

    public static readonly IReadOnlyList<ResearchNode> All =
    [
        new("motorized_1", "Motorized Infantry", ResearchBranch.Infantry, 1, 1, 6,
            Cost(1075, 1325, 1500)),
        new("motorized_2", "Motorized Infantry II", ResearchBranch.Infantry, 2, 7, 12,
            Cost(1500, 1850, 2100), Requires: "motorized_1"),
        new("mechanized_1", "Mechanized Infantry", ResearchBranch.Infantry, 1, 2, 8,
            Cost(1200, 1500, 1750), RequiresBuilding: BuildingType.ArmyBase, RequiredBuildingLevel: 2),
        new("naval_infantry", "Naval Infantry", ResearchBranch.Infantry, 2, 4, 10,
            Cost(1300, 1600, 1900), RequiresBuilding: BuildingType.NavalBase, RequiredBuildingLevel: 2),

        new("tank_1", "Main Battle Tank", ResearchBranch.Armour, 1, 5, 14,
            Cost(1600, 1900, 2400), RequiresBuilding: BuildingType.ArmyBase, RequiredBuildingLevel: 2),
        new("tank_2", "Main Battle Tank II", ResearchBranch.Armour, 2, 13, 24,
            Cost(2200, 2600, 3200), Requires: "tank_1"),

        new("artillery_1", "Towed Artillery", ResearchBranch.Support, 1, 3, 8,
            Cost(1100, 1350, 1600), RequiresBuilding: BuildingType.ArmyBase, RequiredBuildingLevel: 1),
        new("mobile_artillery", "Mobile Artillery", ResearchBranch.Support, 2, 9, 16,
            Cost(1700, 2000, 2400), Requires: "artillery_1"),

        new("fighter_1", "Air Superiority Fighter", ResearchBranch.Air, 1, 6, 18,
            Cost(1900, 1900, 4000, technology: 900),
            RequiresBuilding: BuildingType.AirBase, RequiredBuildingLevel: 1),
        new("strike_fighter", "Strike Fighter", ResearchBranch.Air, 2, 10, 22,
            Cost(2100, 2100, 4400, technology: 1100), Requires: "fighter_1"),

        new("corvette", "Corvette", ResearchBranch.Naval, 1, 4, 12,
            Cost(1400, 1500, 2000), RequiresBuilding: BuildingType.NavalBase, RequiredBuildingLevel: 2),
        new("destroyer", "Destroyer", ResearchBranch.Naval, 2, 11, 20,
            Cost(2000, 2200, 3000, technology: 800), Requires: "corvette"),

        new("logistics", "Field Logistics", ResearchBranch.Doctrine, 1, 8, 16,
            Cost(1500, 1700, 2600)),
        new("entrenchment", "Entrenchment Doctrine", ResearchBranch.Doctrine, 1, 5, 12,
            Cost(1200, 1400, 2000)),
    ];

    public static ResearchNode ById(string id) =>
        All.FirstOrDefault(n => n.Id == id)
        ?? throw new KeyNotFoundException($"Unknown research node '{id}'.");
}
