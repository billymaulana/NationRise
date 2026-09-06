namespace NationRise.Core.World;

public readonly record struct ArmyView(int Id, ushort Nation, int Province, int UnitCount, float Health);

/*
   What the renderer is allowed to see. Read-only by construction, produced at
   the interface's refresh rate rather than the simulation's, so the renderer
   can lag or skip ticks without the simulation noticing.
*/
public sealed class WorldSnapshot
{
    public required long Tick { get; init; }
    public required int Day { get; init; }
    public required int Hour { get; init; }
    public required ReadOnlyMemory<ushort> Controller { get; init; }
    public required ReadOnlyMemory<float> Morale { get; init; }
    public required IReadOnlyList<ArmyView> Armies { get; init; }

    public static WorldSnapshot From(WorldState world, IEnumerable<ArmyView> armies)
    {
        ArgumentNullException.ThrowIfNull(world);

        return new WorldSnapshot
        {
            Tick = world.Clock.Tick,
            Day = world.Clock.Date.Day,
            Hour = world.Clock.Date.Hour,
            Controller = world.Provinces.Controller.AsMemory(),
            Morale = world.Provinces.Morale.AsMemory(),
            Armies = armies.ToArray(),
        };
    }
}
