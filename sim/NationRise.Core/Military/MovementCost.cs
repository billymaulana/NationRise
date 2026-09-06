using NationRise.Core.World;

namespace NationRise.Core.Military;

public static class MovementCost
{
    /* One province crossing at base speed, in game hours. Terrain multipliers
       follow the ratios the combat research settled on, so mountains cost
       three times what open ground does. */
    public const float BaseHours = 2.0f;

    private static readonly float[] TerrainMultiplier =
    [
        1.00f, // OpenGround
        1.52f, // Forest
        1.75f, // Jungle
        2.00f, // Hills
        3.03f, // Mountains
        1.00f, // Desert
        1.00f, // Tundra
        2.20f, // Marsh
        2.00f, // Urban
        1.54f, // Suburban
        0.77f, // CoastalWaters
        0.60f, // HighSeas
        1.00f, // Strait
    ];

    public static float HoursFor(Terrain terrain, bool bySea)
    {
        /* Crossing water without a land link means embarking, which costs more
           than the distance alone suggests. */
        float multiplier = bySea ? 1.60f : TerrainMultiplier[(int)terrain];
        return BaseHours * multiplier;
    }
}
