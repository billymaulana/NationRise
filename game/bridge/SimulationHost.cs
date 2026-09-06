using Godot;
using GodotFile = Godot.FileAccess;
using NationRise.Core.Data;
using NationRise.Core.Economy;
using GameResource = NationRise.Core.Economy.Resource;
using NationRise.Core.Ai;
using NationRise.Core.Buildings;
using NationRise.Core.Research;
using NationRise.Core.Victory;
using NationRise.Core.Diplomacy;
using NationRise.Core.Military;
using System.Linq;
using NationRise.Core.Persistence;
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

    public GameSpeed Speed { get; private set; } = GameSpeed.Normal;

    private WorldState? _world;
    private WorldData? _data;
    private Stockpile? _stockpile;
    private EconomyTick? _economy;
    private CityBuildings? _buildings;
    private ResearchQueue? _research;
    private Mobilisation? _mobilisation;
    private ManpowerPool? _manpower;
    private MoraleSystem? _morale;
    private WorldMarket? _market;
    private VictoryTracker? _victory;
    private ProvinceQuery? _query;
    private int _nextArmyId;
    private MovementSystem? _movement;
    private WarSystem? _war;
    private NationBrain? _brain;
    private WarPlanner? _planner;
    private Momentum? _momentum;
    private Relations? _relations;
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
        _buildings = new CityBuildings(_world, _stockpile);
        _research = new ResearchQueue(_world, _stockpile, _buildings);
        _mobilisation = new Mobilisation(_world, _stockpile, _buildings, _research);
        _manpower = new ManpowerPool(_world);
        AssignProvinceResources();

        _relations = new Relations(_world.Nations.Count);

        /* Morale reads relations every day, so it cannot be built before them.
           The compiler allowed it because the field is nullable; the crash
           only appeared once a day actually elapsed. */
        _morale = new MoraleSystem(_world, _relations, _buildings);
        _market = new WorldMarket(_stockpile);
        _victory = new VictoryTracker(
            _world, _world.Nations.IndexOf("IDN"), CampaignPreset.Of(CampaignLength.Standard));
        _momentum = new Momentum();
        _brain = new NationBrain(
            _world, _relations, _momentum,
            new NationRise.Core.Determinism.DeterministicRandom(Seed))
        {
            Graph = _data.Land,
        };
        _brain.AssignArchetypes();
        _planner = new WarPlanner(_world, _relations, _data.Land);
        _war = new WarSystem(_world, _relations, new NationRise.Core.Determinism.DeterministicRandom(Seed));
        _movement = new MovementSystem(_world);
        _pathfinder = new Pathfinder(_data.Land, _data.Sea, _world.Provinces.Count);

        int indonesia = _world.Nations.IndexOf("IDN");
        DeclareStartingWars(indonesia);
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

    /* A scripted opening war until the AI can decide for itself. Neighbours
       are chosen because their fronts are reachable on foot, which exercises
       movement, combat and conquest rather than just one of them. */
    private void DeclareStartingWars(int indonesia)
    {
        if (_world is null || _relations is null)
        {
            return;
        }

        foreach (string tag in new[] { "MYS", "PNG", "TLS" })
        {
            int other = _world.Nations.IndexOf(tag);
            if (other >= 0 && other != indonesia)
            {
                _relations.Set(indonesia, other, Relation.War);
            }
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

        for (int i = 0; i < _world.Provinces.Count && _nextArmyId < 400; i++)
        {
            if (!_world.Provinces.IsCity[i])
            {
                continue;
            }

            var army = new Army { Id = _nextArmyId++, Nation = _world.Provinces.Owner[i], Province = i };
            army.Add(UnitCatalogue.MotorizedInfantry);
            army.Add(UnitCatalogue.MechanizedInfantry);
            _armies[army.Id] = army;
        }

        Pathfinder.StepCost cost = (_, to, bySea) =>
            MovementCost.HoursFor(_world.Provinces[to].Terrain, bySea);

        GD.Print($"Spawned {_armies.Count} stacks.");
    }

    private int FindEnemyProvince(ushort nation)
    {
        if (_world is null || _relations is null)
        {
            return -1;
        }

        for (int i = 0; i < _world.Provinces.Count; i++)
        {
            ushort owner = _world.Provinces.Controller[i];
            if (owner != ProvinceStore.NoOwner && _relations.AtWar(nation, owner))
            {
                return i;
            }
        }

        return -1;
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

    /* Nations think on a stagger: spreading 247 brains across a week of game
       time keeps any single tick cheap and stops the whole world reacting to
       the same event in lockstep. */
    private void ThinkForNations(long tick)
    {
        if (_brain is null || _world is null)
        {
            return;
        }

        for (int nation = 0; nation < _world.Nations.Count; nation++)
        {
            if ((tick + nation) % 168 != 0)
            {
                continue;
            }

            _brain.Think(nation, tick);

            foreach (Decision decision in _brain.LastDecisions)
            {
                if (decision.Score < Momentum.EntryThresholdFor(DecisionKind.DeclareWar))
                {
                    continue;
                }

                string attacker = _world.Nations.Tag[nation];
                string target = _world.Nations.Tag[decision.Subject];
                LastDecisionExplanation =
                    $"{attacker} -> {target}: {decision.Explain()}\n" +
                    $"decisive factor: {decision.Decisive.Name}";
            }
        }
    }

    /* Idle stacks look for something worth taking, staggered so the whole
       world does not repath on the same tick. Armies already marching are left
       alone: changing target mid-advance is how an AI ends up walking in
       circles. */
    private void IssueMarchOrders(long tick)
    {
        if (_planner is null || _pathfinder is null || _movement is null || _world is null)
        {
            return;
        }

        if (tick % 12 != 0)
        {
            return;
        }

        Pathfinder.StepCost cost = (_, to, bySea) =>
            MovementCost.HoursFor(_world.Provinces[to].Terrain, bySea);

        foreach (Army army in _armies.Values)
        {
            if (army.IsDestroyed || _movement.IsMoving(army.Id))
            {
                continue;
            }

            TargetChoice? target = _planner.ChooseTarget(army, _armies);
            if (target is null || target.Value.Province == army.Province)
            {
                continue;
            }

            var path = _pathfinder.FindPath(army.Province, target.Value.Province, cost);
            if (path.Count >= 2)
            {
                _movement.Order(army, path);
            }
        }
    }

    public string LastDecisionExplanation { get; private set; } = string.Empty;

    public void SetSpeed(GameSpeed speed) => Speed = speed;

    public void FasterSpeed() => Speed = GameSpeedInfo.Faster(Speed);

    public void SlowerSpeed() => Speed = GameSpeedInfo.Slower(Speed);

    public void TogglePause() =>
        Speed = Speed == GameSpeed.Paused ? GameSpeed.Normal : GameSpeed.Paused;

    private const string SavePath = "user://save-1.nrsv";

    public bool SaveGame()
    {
        if (_world is null || _stockpile is null || _relations is null)
        {
            return false;
        }

        using var file = GodotFile.Open(SavePath, GodotFile.ModeFlags.Write);
        if (file is null)
        {
            GD.PushError($"Cannot write {SavePath}: {GodotFile.GetOpenError()}");
            return false;
        }

        using var buffer = new MemoryStream();
        int player = _world.Nations.IndexOf("IDN");
        SaveFile.Write(buffer, SaveState.Capture(_world, _stockpile, _relations, _armies, (ushort)player));
        file.StoreBuffer(buffer.ToArray());

        GD.Print($"Saved at {_world.Clock.Date} ({buffer.Length} bytes).");
        return true;
    }

    public bool LoadGame()
    {
        if (_world is null || _stockpile is null || _relations is null)
        {
            return false;
        }

        using var file = GodotFile.Open(SavePath, GodotFile.ModeFlags.Read);
        if (file is null)
        {
            GD.Print("No save to load.");
            return false;
        }

        using var buffer = new MemoryStream(file.GetBuffer((long)file.GetLength()));

        try
        {
            SaveFile.Read(buffer).RestoreInto(_world, _stockpile, _relations, _armies);
        }
        catch (SaveFileException error)
        {
            GD.PushError($"Save rejected: {error.Message}");
            return false;
        }

        _movement = new MovementSystem(_world);
        GD.Print($"Loaded, resuming at {_world.Clock.Date}.");
        return true;
    }

    public override void _UnhandledInput(InputEvent @event)
    {
        if (@event is not InputEventKey { Pressed: true } key)
        {
            return;
        }

        switch (key.Keycode)
        {
            case Key.Space: TogglePause(); break;
            case Key.Equal or Key.Plus: FasterSpeed(); break;
            case Key.Minus: SlowerSpeed(); break;
            case Key.F5: SaveGame(); break;
            case Key.F9: LoadGame(); break;
        }
    }

    /* Nations spend what they have on the cheapest thing that helps. Crude
       compared to the war planner, but it stops the world hoarding resources
       forever, and it exercises the same code path the player uses. */
    private void RunNationDevelopment(long tick)
    {
        if (_world is null || _buildings is null || _research is null || _stockpile is null)
        {
            return;
        }

        if (tick % 24 != 0)
        {
            return;
        }

        for (int province = 0; province < _world.Provinces.Count; province++)
        {
            if (!_world.Provinces.IsCity[province] || _buildings.IsBuilding(province))
            {
                continue;
            }

            foreach (BuildingType type in new[]
            {
                BuildingType.ArmsIndustry, BuildingType.RecruitingOffice, BuildingType.ArmyBase,
            })
            {
                try
                {
                    _buildings.Begin(province, type);
                    break;
                }
                catch (ConstructionRejected)
                {
                    /* Not affordable or no slot: try the next building. */
                }
            }
        }

        for (int nation = 0; nation < _world.Nations.Count; nation++)
        {
            if (_research.ActiveCount(nation) >= ResearchQueue.Slots)
            {
                continue;
            }

            ResearchNode? next = _research.AvailableTo(nation).FirstOrDefault();
            if (next is not null)
            {
                _research.Start(nation, next);
            }
        }

        RaiseTroops();
    }

    /* Nations at war replace losses; nations at peace do not, which keeps the
       world from filling up with armies nobody intends to use. */
    private void RaiseTroops()
    {
        if (_world is null || _mobilisation is null || _relations is null)
        {
            return;
        }

        for (int province = 0; province < _world.Provinces.Count; province++)
        {
            if (!_world.Provinces.IsCity[province] || _mobilisation.IsMobilising(province))
            {
                continue;
            }

            ushort nation = _world.Provinces.Controller[province];
            if (nation == ProvinceStore.NoOwner || !_relations.EnemiesOf(nation).Any())
            {
                continue;
            }

            foreach (UnitRecipe recipe in UnitRecipes.All)
            {
                if (_mobilisation.CanMobilise(province, recipe, out _))
                {
                    _mobilisation.Begin(province, recipe);
                    break;
                }
            }
        }
    }

    public MobilisationLevel MobilisationOf(int nation) =>
        _manpower?.LevelOf(nation) ?? MobilisationLevel.Peace;

    public void SetMobilisation(int nation, MobilisationLevel level) =>
        _manpower?.SetLevel(nation, level);

    /* Nations sell what they have too much of and buy what they lack. Crude,
       but it keeps prices moving and means a nation short of technology has a
       way out other than conquest. */
    private void TradeForNations()
    {
        if (_world is null || _market is null || _stockpile is null)
        {
            return;
        }

        foreach (GameResource resource in new[]
        {
            GameResource.Food, GameResource.Fuel, GameResource.Materials,
            GameResource.Technology, GameResource.RareResources,
        })
        {
            for (int nation = 0; nation < _world.Nations.Count; nation++)
            {
                long held = _stockpile.Get(nation, resource);

                if (held > SurplusThreshold && _market.CanSell(nation, resource, TradeLot, out _))
                {
                    _market.Sell(nation, resource, TradeLot);
                }
                else if (held < ShortageThreshold && _market.CanBuy(nation, resource, TradeLot, out _))
                {
                    _market.Buy(nation, resource, TradeLot);
                }
            }
        }
    }

    private const long SurplusThreshold = 40_000;
    private const long ShortageThreshold = 2_000;
    private const long TradeLot = 500;

    public long PriceOf(GameResource resource) => _market?.PriceOf(resource) ?? 0;

    public int VictoryThreshold => _victory?.Threshold ?? 0;

    /* Names live in the renderer's geometry file, never in the simulation
       binary, so the bridge is where the two meet. */
    public void AttachProvinceNames(IReadOnlyList<string> names)
    {
        if (_world is not null && _data is not null)
        {
            _query = new ProvinceQuery(_world, _data, names);
        }
    }

    public ProvinceSummary Describe(int province) =>
        _query?.Summarise(province)
        ?? throw new InvalidOperationException("Province names not attached yet.");

    public string NameOfProvince(int province) => _query?.NameOf(province) ?? string.Empty;

    public int VictoryProgressOf(int nation) => _victory?.ProgressPercentOf(nation) ?? 0;

    public float AverageMoraleOf(int nation)
    {
        if (_world is null)
        {
            return 0f;
        }

        float total = 0f;
        int count = 0;

        for (int i = 0; i < _world.Provinces.Count; i++)
        {
            if (_world.Provinces.Controller[i] != nation)
            {
                continue;
            }

            total += _world.Provinces.Morale[i];
            count++;
        }

        return count > 0 ? total / count : 0f;
    }

    public int UnitsInField(int nation) =>
        _armies.Values.Where(a => a.Nation == nation && !a.IsDestroyed).Sum(a => a.Count);

    public int BuildingsUnderway
    {
        get
        {
            if (_world is null || _buildings is null)
            {
                return 0;
            }

            int count = 0;
            for (int i = 0; i < _world.Provinces.Count; i++)
            {
                if (_buildings.IsBuilding(i))
                {
                    count++;
                }
            }

            return count;
        }
    }

    public int ResearchCompleted(int nation) => _research?.CompletedFor(nation).Count ?? 0;

    public int BuildingLevelsIn(int nation)
    {
        if (_world is null || _buildings is null)
        {
            return 0;
        }

        int total = 0;
        for (int i = 0; i < _world.Provinces.Count; i++)
        {
            if (_world.Provinces.Controller[i] != nation)
            {
                continue;
            }

            foreach (BuildingType type in Enum.GetValues<BuildingType>())
            {
                total += _buildings.LevelOf(i, type);
            }
        }

        return total;
    }

    public Archetype ArchetypeOf(int nation) =>
        _brain?.ArchetypeOf(nation) ?? Archetype.Defender;

    public int ActiveWars
    {
        get
        {
            if (_relations is null || _world is null)
            {
                return 0;
            }

            int count = 0;
            for (int a = 0; a < _world.Nations.Count; a++)
            {
                for (int b = a + 1; b < _world.Nations.Count; b++)
                {
                    if (_relations.AtWar(a, b))
                    {
                        count++;
                    }
                }
            }

            return count;
        }
    }

    public Relations Relations =>
        _relations ?? throw new InvalidOperationException("World not loaded.");

    public int BattlesThisTick => _war?.LastReports.Count ?? 0;

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

        map.ApplyOwners(_world.Provinces.Owner, _world.Provinces.Terrain, _world.Provinces.IsCity, highlightNation);
        GD.Print($"Map painted, highlighting nation {highlightNation}.");
    }

    public override void _Process(double delta)
    {
        if (_world is null || Paused)
        {
            return;
        }

        /* Export overrides the ladder when set, so a debug scene can run far
           faster than any speed a player can choose. */
        double secondsPerTick = MinutesPerGameDay > 0.0 && MinutesPerGameDay < 1.0
            ? MinutesPerGameDay * 60.0 / GameDate.HoursPerDay
            : GameSpeedInfo.SecondsPerTick(Speed);

        if (double.IsInfinity(secondsPerTick))
        {
            return;
        }

        _accumulator += delta;

        while (_accumulator >= secondsPerTick)
        {
            _accumulator -= secondsPerTick;
            int dayBefore = _world.Clock.Date.Day;
            ThinkForNations(_world.Clock.Tick);
            IssueMarchOrders(_world.Clock.Tick);
            _movement?.Tick(_armies);
            _war?.Tick(_armies);
            _buildings?.Tick();
            _research?.Tick();
            _victory?.Tick();

            if (_mobilisation is not null)
            {
                _mobilisation.Tick(_armies, ref _nextArmyId);
            }

            RunNationDevelopment(_world.Clock.Tick);
            _world.Clock.Advance();

            if (_world.Clock.Date.Day != dayBefore)
            {
                _economy?.RunDay();
                if (_manpower is not null && _stockpile is not null)
                {
                    _manpower.RunDay(_stockpile);
                    _morale?.RunDay(_stockpile);
                    _market?.RunDay();
                    TradeForNations();
                }

                EmitSignal(SignalName.DayChanged, _world.Clock.Date.Day);
            }
        }
    }
}
