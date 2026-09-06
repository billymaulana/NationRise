using Godot;
using GodotFile = Godot.FileAccess;
using NationRise.Core.Data;
using NationRise.Core.Time;
using NationRise.Core.World;

namespace NationRise.Game.Bridge;

/*
   The only place that knows about both the simulation and the engine.
   Everything above reads snapshots; the simulation below never learns that a
   renderer exists.
*/
public sealed partial class SimulationHost : Node
{
    private const string WorldPath = "res://data/world.bin";

    [Export] public ulong Seed { get; set; } = 20260906;
    [Export] public double MinutesPerGameDay { get; set; } = 5.0;
    [Export] public bool Paused { get; set; } = true;

    private WorldState? _world;
    private WorldData? _data;
    private double _accumulator;

    public WorldState World =>
        _world ?? throw new InvalidOperationException("World not loaded.");

    public WorldData Data =>
        _data ?? throw new InvalidOperationException("World not loaded.");

    [Signal] public delegate void DayChangedEventHandler(int day);

    public override void _Ready()
    {
        using var file = GodotFile.Open(WorldPath, GodotFile.ModeFlags.Read);
        if (file is null)
        {
            GD.PushError($"Cannot open {WorldPath}: {GodotFile.GetOpenError()}");
            return;
        }

        using var stream = new MemoryStream(file.GetBuffer((long)file.GetLength()));
        _data = WorldFile.Read(stream);
        _world = _data.ToWorldState(Seed);

        int indonesia = _world.Nations.IndexOf("IDN");
        GD.Print($"World loaded: {_world.Provinces.Count} provinces, {_world.Nations.Count} nations.");
        GD.Print($"Indonesia starts with {_world.VictoryPointsOf((ushort)indonesia)} victory points.");

        CallDeferred(nameof(PaintMap), indonesia);
    }

    private void PaintMap(int highlightNation)
    {
        if (_world is null)
        {
            return;
        }

        var map = GetParent()?.GetNodeOrNull<Render.ProvinceMap>("ProvinceMap");
        if (map is null)
        {
            GD.PushWarning("ProvinceMap node not found; map stays unpainted.");
            return;
        }

        map.ApplyOwners(_world.Provinces.Owner, highlightNation);
        GD.Print($"Map painted, highlighting nation {highlightNation}.");
    }

    public override void _Process(double delta)
    {
        if (_world is null || Paused)
        {
            return;
        }

        double secondsPerTick = MinutesPerGameDay * 60.0 / GameDate.HoursPerDay;
        _accumulator += delta;

        while (_accumulator >= secondsPerTick)
        {
            _accumulator -= secondsPerTick;
            int dayBefore = _world.Clock.Date.Day;
            _world.Clock.Advance();

            if (_world.Clock.Date.Day != dayBefore)
            {
                EmitSignal(SignalName.DayChanged, _world.Clock.Date.Day);
            }
        }
    }
}
