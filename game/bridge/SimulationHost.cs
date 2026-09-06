using Godot;
using GodotFile = Godot.FileAccess;
using NationRise.Core.Data;
using NationRise.Core.Economy;
using GameResource = NationRise.Core.Economy.Resource;
using NationRise.Core.Military;
using System.Linq;
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
    [Export] public bool Paused { get; set; }

    private WorldState? _world;
    private WorldData? _data;
    private Stockpile? _stockpile;
    private EconomyTick? _economy;
    private MovementSystem? _movement;
    private Pathfinder? _pathfinder;
    private readonly Dictionary<int, Army> _armies = [];
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

        _stockpile = new Stockpile(_world.Nations.Count);
        _economy = new EconomyTick(_world, _stockpile);
        AssignProvinceResources();

        _movement = new MovementSystem(_world);
        _pathfinder = new Pathfinder(_data.Land, _data.Sea, _world.Provinces.Count);

        int indonesia = _world.Nations.IndexOf("IDN");
        SpawnStartingArmies((ushort)indonesia);

        GD.Print($"World loaded: {_world.Provinces.Count} provinces, {_world.Nations.Count} nations.");
        GD.Print($"Indonesia starts with {_world.VictoryPointsOf((ushort)indonesia)} victory points.");

        CallDeferred(nameof(PaintMap), indonesia);
    }

    private void AssignProvinceResources()
    {
        if (_world is null || _economy is null || _data is null)
        {
            return;
        }

        for (int i = 0; i < _world.Provinces.Count; i++)
        {
            _economy.AssignResource(i, _data.ResourceOf(i));
        }
    }

    /* One stack per city, which is where mobilisation happens; enough to show
       movement working without pretending to be a real order of battle. */
    private void SpawnStartingArmies(ushort playerNation)
    {
        if (_world is null || _pathfinder is null || _movement is null || _data is null)
        {
            return;
        }

        int nextId = 0;
        for (int i = 0; i < _world.Provinces.Count && nextId < 400; i++)
        {
            if (!_world.Provinces.IsCity[i])
            {
                continue;
            }

            var army = new Army { Id = nextId++, Nation = _world.Provinces.Owner[i], Province = i };
            army.Add(UnitCatalogue.MotorizedInfantry);
            army.Add(UnitCatalogue.MechanizedInfantry);
            _armies[army.Id] = army;
        }

        Pathfinder.StepCost cost = (_, to, bySea) =>
            MovementCost.HoursFor(_world.Provinces[to].Terrain, bySea);

        foreach (Army army in _armies.Values.Where(a => a.Nation == playerNation))
        {
            int target = FindNeighbourProvince(army.Province);
            if (target < 0)
            {
                continue;
            }

            var path = _pathfinder.FindPath(army.Province, target, cost);
            if (path.Count >= 2)
            {
                _movement.Order(army, path);
            }
        }

        GD.Print($"Spawned {_armies.Count} stacks, {_movement.PendingOrders} moving.");
    }

    private int FindNeighbourProvince(int from)
    {
        if (_data is null)
        {
            return -1;
        }

        var land = _data.Land.NeighboursOf(from);
        if (land.Length > 0)
        {
            return land[0];
        }

        var sea = _data.Sea.NeighboursOf(from);
        return sea.Length > 0 ? sea[0] : -1;
    }

    public WorldSnapshot Snapshot() =>
        WorldSnapshot.From(World, _armies.Values.Select(a =>
            new ArmyView(a.Id, a.Nation, a.Province, a.Count, a.Health)));

    public long StockOf(int nation, GameResource resource) =>
        _stockpile?.Get(nation, resource) ?? 0;

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
            _movement?.Tick(_armies);
            _world.Clock.Advance();

            if (_world.Clock.Date.Day != dayBefore)
            {
                _economy?.RunDay();
                EmitSignal(SignalName.DayChanged, _world.Clock.Date.Day);
            }
        }
    }
}
