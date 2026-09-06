namespace NationRise.Core.Economy;

public enum Resource : byte
{
    Money = 0,
    Manpower = 1,
    Food = 2,
    Fuel = 3,
    Materials = 4,
    Technology = 5,
    RareResources = 6,
}

public static class ResourceInfo
{
    public const int Count = 7;

    /* Yield factors taken from Conflict of Nations and verified against real
       Indonesian city output; changing one rebalances the whole economy. */
    private static readonly float[] Factors =
    [
        0.375f, // Money
        0.000f, // Manpower is derived from population, not produced by a slot
        0.525f, // Food
        0.525f, // Fuel
        0.450f, // Materials
        0.250f, // Technology
        0.300f, // RareResources
    ];

    public static float FactorOf(Resource resource) => Factors[(int)resource];

    public static bool IsTradeable(Resource resource) => resource != Resource.Manpower;
}
