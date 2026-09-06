using Godot;
using NationRise.Core.World;

namespace NationRise.Game.Render;

/*
   Ground is coloured like ground, and nationality is painted over it as a
   hatch rather than a fill. A political map where every province is an
   arbitrary pastel reads as a chart; keeping the terrain underneath means the
   player can see both who owns a province and what it will cost to cross it.
*/
public static class MapPalette
{
    public static readonly Color DeepOcean = new(0.031f, 0.086f, 0.141f);
    public static readonly Color MinimapSea = new(0.055f, 0.129f, 0.192f);
    public static readonly Color ShelfWater = new(0.098f, 0.278f, 0.353f);

    /* The turquoise band and its foam line are the loudest thing on the
       reference map, and they are doing real work: on an archipelago the
       shallows are where ports, landings and blockades happen, so the eye
       should be drawn to them rather than to the open sea. */
    public static readonly Color Coastline = new(0.90f, 0.96f, 0.96f, 0.90f);
    public static readonly Color CoastalHaze = new(0.31f, 0.79f, 0.77f, 0.85f);
    public static readonly Color OpenShelf = new(0.15f, 0.48f, 0.55f, 0.60f);
    public static readonly Color ProvinceBorder = new(0.08f, 0.10f, 0.11f, 0.34f);
    public static readonly Color RoadSketch = new(0.93f, 0.94f, 0.92f, 0.40f);
    public static readonly Color RidgeMark = new(0.72f, 0.72f, 0.70f, 0.30f);
    public static readonly Color NationBorder = new(0.93f, 0.95f, 0.94f, 0.80f);
    public static readonly Color PlayerBorder = new(1.00f, 0.72f, 0.38f, 0.95f);

    /* Sampled towards real satellite tones rather than chosen by eye: the
       reference maps all read as photographs of land first and diagrams
       second, and arbitrary hues are what break that. */
    private static readonly Color[] TerrainBase =
    [
        new(0.528f, 0.556f, 0.372f), // OpenGround   dry grassland
        new(0.284f, 0.390f, 0.248f), // Forest       temperate canopy
        new(0.220f, 0.377f, 0.229f), // Jungle       wet tropical
        new(0.482f, 0.482f, 0.339f), // Hills
        new(0.564f, 0.528f, 0.473f), // Mountains    bare rock
        new(0.821f, 0.716f, 0.500f), // Desert       sand
        new(0.697f, 0.721f, 0.702f), // Tundra
        new(0.325f, 0.390f, 0.335f), // Marsh
        new(0.528f, 0.500f, 0.449f), // Urban
        new(0.509f, 0.504f, 0.436f), // Suburban
    ];

    /*
       Every colour here is written the way a colour picker shows it, but
       BaseMaterial3D.vertex_color_is_srgb defaults to false, so Godot treats a
       per-vertex colour as already linear while it converts a material's
       albedo. Without this the whole landmass renders about half a stop bright
       and washed of its saturation. The engine flag would fix the ground
       surface alone; the hatch reads COLOR in its own shader, where no flag
       applies, so the conversion is done here for both.
    */
    public static Color ForVertex(Color srgb)
    {
        Color linear = srgb.SrgbToLinear();
        return linear with { A = srgb.A };
    }

    public static Color BaseFor(Terrain terrain)
    {
        int index = (int)terrain;
        return index < TerrainBase.Length ? TerrainBase[index] : TerrainBase[0];
    }

    /*
       A quarter of the world's provinces hold a city, and painting every one
       of them the same grey turned the map into gravel. A built-up province
       keeps the tone of the land around it and only reads warmer and paler,
       which is also how it looks from orbit.
    */
    public static Color GroundFor(Terrain terrain, float latitude)
    {
        Color soil = BaseFor(terrain);

        if (terrain is not (Terrain.Urban or Terrain.Suburban))
        {
            return soil;
        }

        return RegionalSoil(latitude).Lerp(soil, terrain == Terrain.Urban ? 0.55f : 0.40f);
    }

    /* The biome a place would have if nobody had built on it: wet green at the
       equator, sand through the deserts, forest in the temperate belt, pale
       towards the poles. */
    private static Color RegionalSoil(float latitude)
    {
        float absolute = Mathf.Abs(latitude);

        if (absolute < 12f)
        {
            return BaseFor(Terrain.Jungle);
        }

        if (absolute < 32f)
        {
            float t = Mathf.Clamp((absolute - 12f) / 20f, 0f, 1f);
            return BaseFor(Terrain.OpenGround).Lerp(BaseFor(Terrain.Desert), t * 0.75f);
        }

        if (absolute < 55f)
        {
            return BaseFor(Terrain.Forest).Lerp(BaseFor(Terrain.OpenGround), 0.45f);
        }

        return BaseFor(Terrain.Tundra);
    }

    /*
       Latitude tints the ground the way it does on a satellite image: bleached
       and warm through the horse latitudes, cool and pale towards the poles.
       An earlier version varied brightness by a hash of the province id, which
       gave every nation a field of static instead of a landscape.
    */
    public static Color WeatheredBy(Color ground, float latitude)
    {
        float absolute = Mathf.Abs(latitude);

        float aridity = Mathf.Exp(-Mathf.Pow((absolute - 24f) / 16f, 2f));
        float cold = Mathf.Clamp((absolute - 48f) / 22f, 0f, 1f);

        var sun = new Color(0.78f, 0.70f, 0.51f);
        var frost = new Color(0.72f, 0.75f, 0.78f);

        Color warmed = ground.Lerp(sun, aridity * 0.14f);
        return warmed.Lerp(frost, cold * 0.22f);
    }

    /* Nation colours are spread by the golden ratio so neighbours rarely
       collide, then held to a narrow band of saturation and value: the hatch
       has to read as one family of markings, not a bag of highlighter pens. */
    public static Color NationColour(int nation, bool isPlayer)
    {
        float hue = (nation * 0.618033988f) % 1f;
        return isPlayer
            ? new Color(1.00f, 0.62f, 0.24f)
            : Color.FromHsv(hue, 0.55f, 0.80f);
    }
}
