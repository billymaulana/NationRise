namespace NationRise.Core.World;

public enum Terrain : byte
{
    OpenGround = 0,
    Forest = 1,
    Jungle = 2,
    Hills = 3,
    Mountains = 4,
    Desert = 5,
    Tundra = 6,
    Marsh = 7,
    Urban = 8,
    Suburban = 9,
    CoastalWaters = 10,
    HighSeas = 11,
    Strait = 12,
}

public static class TerrainExtensions
{
    public static bool IsWater(this Terrain t) =>
        t is Terrain.CoastalWaters or Terrain.HighSeas or Terrain.Strait;

    public static bool FavoursDefence(this Terrain t) =>
        t is Terrain.Forest or Terrain.Jungle or Terrain.Hills or Terrain.Mountains or Terrain.Urban;
}
