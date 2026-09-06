using Godot;
using NationRise.Core.World;

namespace NationRise.Game.Render;

/*
   Colour comes from terrain first and nationality second, the way Conflict of
   Nations does it. A political map where every province is an arbitrary pastel
   reads as a chart; tinting real ground makes the map look like somewhere that
   exists, and terrain stays legible even under a nation's colour.
*/
public static class MapPalette
{
    public static readonly Color Ocean = new(0.055f, 0.106f, 0.157f);
    public static readonly Color ShallowWater = new(0.098f, 0.192f, 0.259f);
    public static readonly Color ProvinceBorder = new(0.10f, 0.13f, 0.14f, 0.55f);
    public static readonly Color NationBorder = new(0.96f, 0.97f, 0.96f, 0.95f);
    public static readonly Color PlayerBorder = new(1.00f, 0.62f, 0.30f);

    private static readonly Color[] TerrainBase =
    [
        new(0.353f, 0.400f, 0.259f), // OpenGround
        new(0.220f, 0.310f, 0.204f), // Forest
        new(0.176f, 0.294f, 0.184f), // Jungle
        new(0.400f, 0.396f, 0.278f), // Hills
        new(0.463f, 0.435f, 0.376f), // Mountains
        new(0.588f, 0.518f, 0.365f), // Desert
        new(0.518f, 0.545f, 0.541f), // Tundra
        new(0.267f, 0.318f, 0.267f), // Marsh
        new(0.427f, 0.408f, 0.376f), // Urban
        new(0.396f, 0.400f, 0.337f), // Suburban
    ];

    public static Color BaseFor(Terrain terrain)
    {
        int index = (int)terrain;
        return index < TerrainBase.Length ? TerrainBase[index] : TerrainBase[0];
    }

    /* Nation hue is blended over the terrain rather than replacing it, so a
       desert stays sandy whoever owns it. */
    /* A deterministic per-province wobble in brightness. Real ground is never
       one flat tone, and without it 2,000 provinces of the same nation read as
       one undifferentiated slab. Derived from the id so it never flickers. */
    public static float Variation(int province)
    {
        uint h = (uint)province * 2654435761u;
        h ^= h >> 15;
        return 0.93f + (h % 1000) / 1000f * 0.14f;
    }

    public static Color Tinted(Terrain terrain, int nation, bool isPlayer, bool isCity, int province = 0)
    {
        Color ground = BaseFor(terrain);

        float wobble = Variation(province);
        ground = new Color(ground.R * wobble, ground.G * wobble, ground.B * wobble);

        if (nation < 0)
        {
            return ground;
        }

        /* Conflict of Nations keeps the ground looking like ground and lets a
           heavy white border carry nationality. A light tint is enough to tell
           neighbours apart; a heavy one turns the map into a pie chart. */
        float hue = (nation * 0.618033988f) % 1f;
        var national = Color.FromHsv(hue, isPlayer ? 0.62f : 0.45f, isPlayer ? 0.72f : 0.55f);

        Color blended = ground.Lerp(national, isPlayer ? 0.75f : 0.38f);

        /* Cities read as slightly brighter ground: enough to find at a glance
           without needing a marker on top. */
        return isCity ? blended.Lightened(0.18f) : blended;
    }
}
