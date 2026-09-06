using Godot;
using NationRise.Core.Diplomacy;
using NationRise.Core.Military;
using NationRise.Core.Time;
using NationRise.Core.World;
using GameResource = NationRise.Core.Economy.Resource;

namespace NationRise.Game.Dev;

/*
   Plays a scripted session through the path a person uses: clicks are synthesised
   at the screen point that resolves back to the wanted province, keys reach the
   same unhandled-input handler a keyboard reaches, and every verdict is read from
   state the game arrived at on its own. Where a click cannot be aimed the fallback
   is the public method that click would have called, and the log records which of
   the two ran so the transcript never overstates the fidelity.
*/
public sealed partial class Playtest : Node
{
    private const string EventTag = "[PT]";
    private const string AnomalyTag = "[PT-ANOMALY]";
    private const string NoteTag = "[PT-NOTE]";
    private const string SummaryTag = "[PT-SUMMARY]";

    private const int LinesPerCode = 6;
    private const int SessionDays = 26;
    private const int ClickWindowFrames = 12;
    private const int KeyWindowFrames = 10;
    private const long MarchDeadlineTicks = 120;
    private const long ContactDeadlineTicks = 220;
    private const long BattleDeadlineTicks = 220;
    private const long IdleWatchTicks = 36;
    private const long DriftTicks = 40;

    private static readonly GameResource[] Resources = Enum.GetValues<GameResource>();

    private enum Stage
    {
        Waiting,
        Probe,
        ChooseMarch,
        SelectStack,
        PlanMarch,
        ConfirmMarch,
        AwaitArrival,
        InspectProvince,
        WatchIdleStack,
        ChooseAttack,
        SelectAttacker,
        PlanAttack,
        ConfirmAttack,
        AwaitContact,
        WatchBattle,
        PauseCheck,
        SpeedLadder,
        SaveCheck,
        DriftAfterSave,
        LoadCheck,
        Settle,
        Done,
    }

    private enum ClickOutcome
    {
        Waiting,
        ThroughInput,
        ThroughCall,
        Rejected,
    }

    private readonly record struct StateDigest(
        long Tick,
        int VictoryPoints,
        long ControllerHash,
        long MoraleHash,
        int LiveStacks,
        long ArmyHash,
        long PlayerMoney,
        long PlayerMaterials);

    private Bridge.SimulationHost? _host;
    private Render.ProvincePicker? _picker;
    private Render.ProvinceMap? _map;
    private Camera3D? _camera;
    private Ui.ArmyCommand? _command;
    private bool _listening;

    private Stage _stage = Stage.Waiting;
    private int _frame;
    private int _stageFrame;
    private long _stageTick;

    private long _lastTick = -1;
    private int _lastDay = -1;
    private int _daysObserved;
    private int _firstDay = -1;

    private int _targetedCount;
    private int _targetedProvince = -1;
    private int _pickedCount;
    private int _pickedProvince = -1;

    private int _clickTarget = -1;
    private MouseButton _clickButton = MouseButton.Left;
    private int _clickFrame;
    private int _clickExpected;
    private bool _clickPending;
    private bool _clickAimed;

    private int _clicksThroughInput;
    private int _clicksThroughCall;
    private int _keysInjected;

    private ushort[] _previousController = [];
    private int _previousPoints = -1;

    private readonly Dictionary<string, int> _anomalyCounts = [];
    private readonly List<(string Name, string Verdict, string Detail)> _checks = [];

    private int _marchArmy = -1;
    private int _marchFrom = -1;
    private int _marchTarget = -1;
    private bool _marchAmphibious;
    private long _marchOrderedTick;
    private long _marchArrivedTick = -1;
    private int _idleWatchProvince = -1;

    private int _attackArmy = -1;
    private int _attackFrom = -1;
    private int _attackTarget = -1;
    private bool _haveForecast;
    private BattleForecast _forecast;
    private int _forecastAttacker;
    private int _forecastDefender;
    private bool _forecastAmphibious;
    private long _contactTick = -1;
    private int _defenderArmy = -1;
    private int _attackerAtContact;
    private int _defenderAtContact;
    private int _battleRounds;
    private int _bystanderStacks;
    private int _attackAttempts;
    private readonly HashSet<int> _triedTargets = [];

    private int _daysSwept;
    private int _armySightings;
    private int _provinceSweeps;
    private int _stockpileReads;
    private int _blockadeSightings;
    private int _planShapeChecks;
    private int _ticksSampled;
    private int _ticksWithBattles;
    private int _battlePairings;
    private int _assaultsPlanned;
    private int _hopelessForecasts;

    private GameSpeed _speedBeforePause;
    private long _pauseTick;
    private int _ladderStep;
    private GameSpeed _ladderExpected;
    private bool _ladderFailed;

    private StateDigest _digestBeforeSave;
    private int _buildingsBeforeSave;
    private int _researchBeforeSave;
    private long _priceBeforeSave;
    private bool _saveWritten;

    private int Day => _host is null ? 0 : _host.World.Clock.Date.Day;

    private long Tick => _host is null ? 0 : _host.World.Clock.Tick;

    public override void _Process(double delta)
    {
        _frame++;

        if (_stage == Stage.Done || !Resolve())
        {
            return;
        }

        TrackClock();
        _stageFrame++;

        switch (_stage)
        {
            case Stage.Waiting: RunWaiting(); break;
            case Stage.Probe: RunProbe(); break;
            case Stage.ChooseMarch: RunChooseMarch(); break;
            case Stage.SelectStack: RunSelectStack(); break;
            case Stage.PlanMarch: RunPlanMarch(); break;
            case Stage.ConfirmMarch: RunConfirmMarch(); break;
            case Stage.AwaitArrival: RunAwaitArrival(); break;
            case Stage.InspectProvince: RunInspectProvince(); break;
            case Stage.WatchIdleStack: RunWatchIdleStack(); break;
            case Stage.ChooseAttack: RunChooseAttack(); break;
            case Stage.SelectAttacker: RunSelectAttacker(); break;
            case Stage.PlanAttack: RunPlanAttack(); break;
            case Stage.ConfirmAttack: RunConfirmAttack(); break;
            case Stage.AwaitContact: RunAwaitContact(); break;
            case Stage.WatchBattle: RunWatchBattle(); break;
            case Stage.PauseCheck: RunPauseCheck(); break;
            case Stage.SpeedLadder: RunSpeedLadder(); break;
            case Stage.SaveCheck: RunSaveCheck(); break;
            case Stage.DriftAfterSave: RunDrift(); break;
            case Stage.LoadCheck: RunLoadCheck(); break;
            case Stage.Settle: RunSettle(); break;
        }
    }

    private bool Resolve()
    {
        _host ??= GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");
        _picker ??= GetNodeOrNull<Render.ProvincePicker>("/root/Main/ProvincePicker");
        _map ??= GetNodeOrNull<Render.ProvinceMap>("/root/Main/ProvinceMap");
        _camera ??= GetNodeOrNull<Camera3D>("/root/Main/Camera");
        _command ??= GetNodeOrNull<Ui.ArmyCommand>("/root/Main/ArmyCommand");

        if (_host is null || _picker is null || _map is null || _camera is null || _command is null)
        {
            return false;
        }

        if (_map.ProvinceCentres.Length == 0)
        {
            return false;
        }

        if (!_listening)
        {
            _picker.ProvinceTargeted += OnTargeted;
            _picker.ProvincePicked += OnPicked;
            _listening = true;
        }

        return true;
    }

    private void OnTargeted(int province)
    {
        _targetedCount++;
        _targetedProvince = province;
    }

    private void OnPicked(int province)
    {
        _pickedCount++;
        _pickedProvince = province;
    }

    private void Enter(Stage stage)
    {
        _stage = stage;
        _stageFrame = 0;
        _stageTick = Tick;
        _clickPending = false;
        Log("STAGE", $"stage={stage}");
    }

    private void Log(string name, string detail) =>
        GD.Print($"{EventTag} day={Day:000} tick={Tick:00000} frame={_frame:00000} {name} {detail}");

    private void Note(string code, string detail) =>
        GD.Print($"{NoteTag} day={Day:000} tick={Tick:00000} frame={_frame:00000} {code} {detail}");

    private void Anomaly(string code, int province, string detail)
    {
        int seen = _anomalyCounts.GetValueOrDefault(code) + 1;
        _anomalyCounts[code] = seen;

        if (seen > LinesPerCode)
        {
            return;
        }

        GD.Print(
            $"{AnomalyTag} day={Day:000} tick={Tick:00000} frame={_frame:00000} " +
            $"province={province} code={code} detail=\"{detail}\"" +
            (seen == LinesPerCode ? " (further reports of this code are counted only)" : string.Empty));
    }

    private void Record(string name, string verdict, string detail)
    {
        _checks.Add((name, verdict, detail));
        Log("CHECK", $"name={name} verdict={verdict} detail=\"{detail}\"");
    }

    private void TrackClock()
    {
        long tick = Tick;
        if (tick == _lastTick)
        {
            return;
        }

        if (tick < _lastTick)
        {
            Note("CLOCK_REWOUND", $"tick fell from {_lastTick} to {tick}; daily checks re-baselined");
            _previousController = [];
            _previousPoints = -1;
        }

        _lastTick = tick;
        _ticksSampled++;

        int pairings = _host!.BattlesThisTick;
        if (pairings > 0)
        {
            _ticksWithBattles++;
            _battlePairings += pairings;
        }

        if (_stage == Stage.WatchBattle || _stage == Stage.AwaitContact)
        {
            ObserveBattleRound();
        }

        int day = _host.World.Clock.Date.Day;
        if (day == _lastDay)
        {
            return;
        }

        _lastDay = day;
        if (_firstDay < 0)
        {
            _firstDay = day;
        }

        _daysObserved++;
        SweepInvariants();
    }

    private void SweepInvariants()
    {
        WorldState world = _host!.World;
        ProvinceStore provinces = world.Provinces;
        int nations = world.Nations.Count;
        ushort player = _host.PlayerNation;

        WorldSnapshot snapshot = _host.Snapshot();
        int live = 0;

        _daysSwept++;
        _armySightings += snapshot.Armies.Count;
        _provinceSweeps += provinces.Count;
        _stockpileReads += nations * Resources.Length;

        foreach (ArmyView army in snapshot.Armies)
        {
            if (army.Province < 0 || army.Province >= provinces.Count)
            {
                Anomaly(
                    "ARMY_PROVINCE_OUT_OF_RANGE", army.Province,
                    $"stack {army.Id} of nation {army.Nation} sits at index {army.Province} of {provinces.Count}");
                continue;
            }

            if (army.UnitCount <= 0)
            {
                Anomaly(
                    "EMPTY_STACK_IN_TABLE", army.Province,
                    $"stack {army.Id} of nation {NationTag(army.Nation)} is still listed with {army.UnitCount} units");
                continue;
            }

            live++;

            if (provinces.Controller[army.Province] == ProvinceStore.NoOwner)
            {
                Anomaly(
                    "ARMY_IN_UNCONTROLLED_PROVINCE", army.Province,
                    $"stack {army.Id} of nation {NationTag(army.Nation)} stands in {ProvinceName(army.Province)} which no nation controls");
            }
        }

        int changes = 0;
        bool baselined = _previousController.Length == provinces.Count;

        for (int province = 0; province < provinces.Count; province++)
        {
            ushort controller = provinces.Controller[province];

            if (controller != ProvinceStore.NoOwner && controller >= nations)
            {
                Anomaly(
                    "CONTROLLER_NOT_A_NATION", province,
                    $"controller index {controller} lies outside the {nations} nation table");
            }
            else if (controller != ProvinceStore.NoOwner && world.Nations.Tag[controller].Length == 0)
            {
                Anomaly(
                    "CONTROLLER_HAS_NO_NATION_RECORD", province,
                    $"controller {controller} holds no tag in the nation table");
            }

            if (_host.IsBlockaded(province))
            {
                _blockadeSightings++;
            }

            if (_host.IsBlockaded(province) && _host.Data.Sea.NeighboursOf(province).Length == 0)
            {
                Anomaly(
                    "BLOCKADE_WITHOUT_SEA_LINK", province,
                    $"{ProvinceName(province)} is blockaded yet has no sea neighbour");
            }

            if (!baselined)
            {
                continue;
            }

            if (_previousController[province] == controller)
            {
                continue;
            }

            changes++;

            if (controller == ProvinceStore.NoOwner)
            {
                Anomaly(
                    "CONTROL_LOST_TO_NOBODY", province,
                    $"{ProvinceName(province)} passed from {NationTag(_previousController[province])} to nobody");
            }
        }

        for (int nation = 0; nation < nations; nation++)
        {
            foreach (GameResource resource in Resources)
            {
                long held = _host.StockOf(nation, resource);
                if (held < 0)
                {
                    Anomaly(
                        "NEGATIVE_STOCKPILE", -1,
                        $"nation {NationTag((ushort)nation)} holds {held} {resource}");
                }
            }
        }

        int points = world.VictoryPointsOf(player);
        if (baselined && points != _previousPoints && changes == 0)
        {
            Anomaly(
                "VICTORY_POINTS_MOVED_WITHOUT_CONQUEST", -1,
                $"Indonesia moved from {_previousPoints} to {points} points while no province changed hands");
        }

        SamplePlans(snapshot, player);

        _previousController = (ushort[])provinces.Controller.Clone();
        _previousPoints = points;

        Log(
            "DAY",
            $"points={points} controlChanges={changes} liveStacks={live} " +
            $"tableStacks={snapshot.Armies.Count} wars={_host.ActiveWars} " +
            $"blockaded={_host.BlockadedCountOf(player)} cutOff={_host.CutOffProvincesOf(player)} " +
            $"speed={GameSpeedInfo.Label(_host.Speed)}");
    }

    /* A march order is rejected outright when its path does not start under the
       stack, so the property is checked on plans nobody committed to as well as
       on the two the session actually issues. */
    private void SamplePlans(WorldSnapshot snapshot, ushort player)
    {
        int sampled = 0;

        foreach (ArmyView army in snapshot.Armies)
        {
            if (sampled >= 4 || army.Nation != player || army.UnitCount == 0)
            {
                continue;
            }

            if (army.Province < 0 || army.Province >= _host!.World.Provinces.Count)
            {
                continue;
            }

            ReadOnlySpan<ushort> neighbours = _host.Data.Land.NeighboursOf(army.Province);
            if (neighbours.Length == 0)
            {
                continue;
            }

            int destination = neighbours[0];
            if (destination == army.Province)
            {
                continue;
            }

            sampled++;
            Bridge.MovePlan? plan = _host.PlanMove(army.Id, destination);

            if (plan is null)
            {
                Anomaly(
                    "NO_PATH_TO_LAND_NEIGHBOUR", destination,
                    $"stack {army.Id} in {ProvinceName(army.Province)} cannot plan a march to its own land neighbour {ProvinceName(destination)}");
                continue;
            }

            CheckPlanShape(plan, army.Id, army.Province, destination);
        }
    }

    private void CheckPlanShape(Bridge.MovePlan plan, int armyId, int from, int destination)
    {
        _planShapeChecks++;

        if (plan.Path.Count == 0)
        {
            Anomaly("EMPTY_MARCH_PATH", destination, $"plan for stack {armyId} carries no path");
            return;
        }

        if (plan.Path[0] != from)
        {
            Anomaly(
                "MARCH_PATH_DOES_NOT_START_UNDER_STACK", from,
                $"plan for stack {armyId} starts at {ProvinceName(plan.Path[0])} while the stack stands in {ProvinceName(from)}");
        }

        if (plan.Path[^1] != destination)
        {
            Anomaly(
                "MARCH_PATH_DOES_NOT_REACH_TARGET", destination,
                $"plan for stack {armyId} ends at {ProvinceName(plan.Path[^1])} instead of {ProvinceName(destination)}");
        }
    }

    private string NationTag(ushort nation) =>
        _host is null || nation >= _host.World.Nations.Count
            ? $"#{nation}"
            : _host.World.Nations.Tag[nation];

    private string ProvinceName(int province)
    {
        if (_host is null || province < 0 || province >= _host.World.Provinces.Count)
        {
            return $"province {province}";
        }

        string name = _host.NameOfProvince(province);
        return name.Length == 0 ? $"province {province}" : $"{name} ({province})";
    }

    private bool InjectClick(int province, MouseButton button)
    {
        if (!Aim(province, out Vector2 at))
        {
            return false;
        }

        Input.ParseInputEvent(new InputEventMouseButton
        {
            ButtonIndex = button, Pressed = true, Position = at, GlobalPosition = at,
        });

        Input.ParseInputEvent(new InputEventMouseButton
        {
            ButtonIndex = button, Pressed = false, Position = at, GlobalPosition = at,
        });

        return true;
    }

    /* The picker resolves a click to the nearest province centre, so aiming at
       the unprojected centre is the one screen point guaranteed to come back as
       the province that was wanted. */
    private bool Aim(int province, out Vector2 at)
    {
        at = Vector2.Zero;

        if (_camera is null || _map is null || province < 0 || province >= _map.ProvinceCentres.Length)
        {
            return false;
        }

        Vector3 centre = _map.ProvinceCentres[province];
        if (_camera.IsPositionBehind(centre))
        {
            return false;
        }

        at = _camera.UnprojectPosition(centre);
        return GetViewport().GetVisibleRect().HasPoint(at) && !HudCovers(at);
    }

    private bool CanAim(int province) => Aim(province, out _);

    private bool HudCovers(Vector2 point)
    {
        var hud = GetNodeOrNull<CanvasLayer>("/root/Main/Hud");
        if (hud is null)
        {
            return false;
        }

        foreach (Node child in hud.GetChildren())
        {
            if (child is Control control
                && control.IsVisibleInTree()
                && control.MouseFilter != Control.MouseFilterEnum.Ignore
                && control.GetGlobalRect().HasPoint(point))
            {
                return true;
            }
        }

        return false;
    }

    private void BeginClick(int province, MouseButton button)
    {
        _clickTarget = province;
        _clickButton = button;
        _clickPending = true;
        _clickFrame = _frame;
        _clickExpected = (button == MouseButton.Right ? _pickedCount : _targetedCount) + 1;
        _clickAimed = InjectClick(province, button);

        Log(
            "CLICK",
            $"button={button} province={ProvinceName(province)} aimed={_clickAimed}");
    }

    private ClickOutcome PollClick()
    {
        if (!_clickPending)
        {
            return ClickOutcome.Rejected;
        }

        int seen = _clickButton == MouseButton.Right ? _pickedCount : _targetedCount;
        int resolved = _clickButton == MouseButton.Right ? _pickedProvince : _targetedProvince;

        if (_clickAimed && seen >= _clickExpected)
        {
            _clickPending = false;

            if (resolved != _clickTarget)
            {
                Anomaly(
                    "CLICK_RESOLVED_WRONG_PROVINCE", resolved,
                    $"a click aimed at {ProvinceName(_clickTarget)} was resolved as {ProvinceName(resolved)}");
                return ClickOutcome.Rejected;
            }

            _clicksThroughInput++;
            return ClickOutcome.ThroughInput;
        }

        if (_frame - _clickFrame < ClickWindowFrames)
        {
            return ClickOutcome.Waiting;
        }

        _clickPending = false;
        _clicksThroughCall++;

        Note(
            "INPUT_FALLBACK",
            _clickAimed
                ? $"a click injected at {ProvinceName(_clickTarget)} never reached the picker; calling the handler directly"
                : $"no screen point resolves to {ProvinceName(_clickTarget)}; calling the handler directly");

        DispatchDirectly(_clickTarget, _clickButton);
        return ClickOutcome.ThroughCall;
    }

    private void DispatchDirectly(int province, MouseButton button)
    {
        if (button == MouseButton.Right)
        {
            GetNodeOrNull<Ui.ProvincePanel>("/root/Main/Hud/ProvincePanel")?.Show(province);
            GetNodeOrNull<Ui.BattlePreviewPanel>("/root/Main/Hud/BattlePreviewPanel")?.ShowFor(province);
            return;
        }

        _command?.OnTargeted(province);
    }

    private void InjectKey(Key keycode)
    {
        _keysInjected++;
        Input.ParseInputEvent(new InputEventKey { Keycode = keycode, PhysicalKeycode = keycode, Pressed = true });
        Input.ParseInputEvent(new InputEventKey { Keycode = keycode, PhysicalKeycode = keycode, Pressed = false });
        Log("KEY", $"key={keycode}");
    }

    private ArmyView? StackOf(int armyId)
    {
        foreach (ArmyView army in _host!.Snapshot().Armies)
        {
            if (army.Id == armyId)
            {
                return army;
            }
        }

        return null;
    }

    private void RunWaiting()
    {
        try
        {
            _ = _host!.Describe(0);
        }
        catch (InvalidOperationException)
        {
            return;
        }

        if (_stageFrame < 45)
        {
            return;
        }

        Log(
            "SESSION_START",
            $"provinces={_host.World.Provinces.Count} nations={_host.World.Nations.Count} " +
            $"player={NationTag(_host.PlayerNation)} points={_host.World.VictoryPointsOf(_host.PlayerNation)} " +
            $"threshold={_host.VictoryThreshold} front=\"{_host.FrontDiagnostic()}\"");

        Enter(Stage.Probe);
    }

    /* Reading supply for an index off either end of the province table must fail
       loudly: a silent answer would be a supply report for ground that is not on
       the map. */
    private void RunProbe()
    {
        int count = _host!.World.Provinces.Count;
        bool guarded = true;
        string detail;

        try
        {
            SupplyStatus low = _host.SupplyAt(-1);
            guarded = false;
            Anomaly("SUPPLY_REPORTED_OUT_OF_RANGE", -1, $"supply for index -1 answered {low}");
        }
        catch (Exception error) when (error is IndexOutOfRangeException or ArgumentOutOfRangeException)
        {
            /* Refusing the read is the wanted behaviour. */
        }

        try
        {
            SupplyStatus high = _host.SupplyAt(count);
            guarded = false;
            Anomaly("SUPPLY_REPORTED_OUT_OF_RANGE", count, $"supply for index {count} answered {high}");
        }
        catch (Exception error) when (error is IndexOutOfRangeException or ArgumentOutOfRangeException)
        {
            /* Refusing the read is the wanted behaviour. */
        }

        detail = guarded
            ? $"supply refused both index -1 and index {count}"
            : "supply answered for an index that is not on the map";

        Record("supply-index-guarded", guarded ? "PASS" : "FAIL", detail);

        int outOfRange = 0;
        for (int province = 0; province < count; province++)
        {
            SupplyStatus status = _host.SupplyAt(province);
            if (status is not (SupplyStatus.Supplied or SupplyStatus.Low or SupplyStatus.CutOff))
            {
                outOfRange++;
                Anomaly("SUPPLY_STATUS_NOT_A_VALUE", province, $"supply answered {(int)status}");
            }
        }

        Record(
            "supply-status-values",
            outOfRange == 0 ? "PASS" : "FAIL",
            $"{count} provinces read, {outOfRange} answered with something outside the enum");

        Enter(Stage.ChooseMarch);
    }

    private void RunChooseMarch()
    {
        if (ChooseMarch())
        {
            Log(
                "MARCH_CHOSEN",
                $"stack={_marchArmy} from={ProvinceName(_marchFrom)} to={ProvinceName(_marchTarget)} " +
                $"amphibious={_marchAmphibious}");

            Enter(Stage.SelectStack);
            return;
        }

        if (_stageFrame < 600)
        {
            return;
        }

        Record(
            "march-and-arrive", "NOT-EXERCISED",
            "no Indonesian stack had a clickable friendly land neighbour to march to");

        Enter(Stage.ChooseAttack);
    }

    private bool ChooseMarch()
    {
        ushort player = _host!.PlayerNation;
        ProvinceStore provinces = _host.World.Provinces;

        foreach (ArmyView army in _host.Snapshot().Armies)
        {
            if (army.Nation != player || army.UnitCount == 0)
            {
                continue;
            }

            if (army.Province < 0 || army.Province >= provinces.Count)
            {
                continue;
            }

            /* The panel commands whichever stack is strongest where the click
               lands, so only that stack can be driven from the map at all. */
            if (_host.PlayerArmyAt(army.Province) != army.Id || !CanAim(army.Province))
            {
                continue;
            }

            foreach (ushort neighbour in _host.Data.Land.NeighboursOf(army.Province))
            {
                if (neighbour == army.Province
                    || provinces.Controller[neighbour] != player
                    || !CanAim(neighbour))
                {
                    continue;
                }

                Bridge.MovePlan? plan = _host.PlanMove(army.Id, neighbour);
                if (plan is null)
                {
                    continue;
                }

                CheckPlanShape(plan, army.Id, army.Province, neighbour);

                _marchArmy = army.Id;
                _marchFrom = army.Province;
                _marchTarget = neighbour;
                _marchAmphibious = plan.AmphibiousArrival;
                return true;
            }
        }

        return false;
    }

    private void RunSelectStack()
    {
        if (!_clickPending && _stageFrame == 1)
        {
            BeginClick(_marchFrom, MouseButton.Left);
            return;
        }

        ClickOutcome outcome = PollClick();
        if (outcome == ClickOutcome.Waiting)
        {
            return;
        }

        if (outcome == ClickOutcome.Rejected)
        {
            Enter(Stage.ChooseMarch);
            return;
        }

        Enter(Stage.PlanMarch);
    }

    private void RunPlanMarch()
    {
        if (!_clickPending && _stageFrame == 1)
        {
            BeginClick(_marchTarget, MouseButton.Left);
            return;
        }

        ClickOutcome outcome = PollClick();
        if (outcome == ClickOutcome.Waiting)
        {
            return;
        }

        if (outcome == ClickOutcome.Rejected)
        {
            Enter(Stage.ChooseMarch);
            return;
        }

        var panel = GetNodeOrNull<Ui.BattlePreviewPanel>("/root/Main/Hud/BattlePreviewPanel");
        Record(
            "march-preview-shown",
            panel is not null && panel.Visible ? "PASS" : "FAIL",
            panel is null
                ? "the battle preview panel is missing from the scene"
                : $"panel visible={panel.Visible} after planning a march to {ProvinceName(_marchTarget)}");

        Enter(Stage.ConfirmMarch);
    }

    private void RunConfirmMarch()
    {
        if (!_clickPending && _stageFrame == 1)
        {
            BeginClick(_marchTarget, MouseButton.Left);
            return;
        }

        ClickOutcome outcome = PollClick();
        if (outcome == ClickOutcome.Waiting)
        {
            return;
        }

        if (outcome == ClickOutcome.Rejected)
        {
            Enter(Stage.ChooseMarch);
            return;
        }

        _marchOrderedTick = Tick;
        _marchArrivedTick = -1;
        Log("MARCH_ORDERED", $"stack={_marchArmy} to={ProvinceName(_marchTarget)}");
        Enter(Stage.AwaitArrival);
    }

    private void RunAwaitArrival()
    {
        ArmyView? stack = StackOf(_marchArmy);

        if (stack is null || stack.Value.UnitCount == 0)
        {
            Record(
                "march-and-arrive", "NOT-EXERCISED",
                $"stack {_marchArmy} was destroyed before it reached {ProvinceName(_marchTarget)}");

            Enter(Stage.ChooseAttack);
            return;
        }

        if (stack.Value.Province == _marchTarget)
        {
            _marchArrivedTick = Tick;
            Record(
                "march-and-arrive", "PASS",
                $"stack {_marchArmy} left {ProvinceName(_marchFrom)} and stands in {ProvinceName(_marchTarget)} " +
                $"after {_marchArrivedTick - _marchOrderedTick} ticks");

            _idleWatchProvince = _marchTarget;
            Enter(Stage.InspectProvince);
            return;
        }

        if (Tick - _marchOrderedTick < MarchDeadlineTicks)
        {
            return;
        }

        Record(
            "march-and-arrive", "FAIL",
            $"stack {_marchArmy} was ordered to {ProvinceName(_marchTarget)} at tick {_marchOrderedTick} " +
            $"and is still in {ProvinceName(stack.Value.Province)} {MarchDeadlineTicks} ticks later");

        Anomaly(
            "ORDERED_MARCH_NEVER_COMPLETED", _marchTarget,
            $"stack {_marchArmy} never reached {ProvinceName(_marchTarget)}");

        Enter(Stage.ChooseAttack);
    }

    private void RunInspectProvince()
    {
        if (!_clickPending && _stageFrame == 1)
        {
            BeginClick(_marchTarget, MouseButton.Right);
            return;
        }

        ClickOutcome outcome = PollClick();
        if (outcome == ClickOutcome.Waiting)
        {
            return;
        }

        ProvinceSummary summary = _host!.Describe(_marchTarget);
        bool sane = summary.Id == _marchTarget
            && summary.ControllerName.Length > 0
            && summary.Morale is >= 0f and <= 1f
            && summary.LandNeighbours >= 0
            && summary.SeaNeighbours >= 0;

        Record(
            "province-inspection",
            sane ? "PASS" : "FAIL",
            $"{ProvinceName(_marchTarget)} owner={summary.OwnerName} controller={summary.ControllerName} " +
            $"city={summary.IsCity} terrain={summary.Terrain} morale={summary.Morale:0.00} " +
            $"supply={_host.SupplyAt(_marchTarget)} land={summary.LandNeighbours} sea={summary.SeaNeighbours} " +
            $"through={(outcome == ClickOutcome.ThroughInput ? "right-click" : "direct call")}");

        Enter(Stage.WatchIdleStack);
    }

    /* A stack that has finished the order it was given should stay where the
       player left it until the player says otherwise. */
    private void RunWatchIdleStack()
    {
        ArmyView? stack = StackOf(_marchArmy);

        if (stack is null || stack.Value.UnitCount == 0)
        {
            Record(
                "player-stack-obeys-only-the-player", "NOT-EXERCISED",
                $"stack {_marchArmy} was destroyed while being watched");

            Enter(Stage.ChooseAttack);
            return;
        }

        if (stack.Value.Province != _idleWatchProvince)
        {
            Anomaly(
                "PLAYER_STACK_MOVED_WITHOUT_ORDER", stack.Value.Province,
                $"stack {_marchArmy} was left in {ProvinceName(_idleWatchProvince)} with no further order " +
                $"and has walked to {ProvinceName(stack.Value.Province)}");

            Record(
                "player-stack-obeys-only-the-player", "FAIL",
                $"stack {_marchArmy} moved from {ProvinceName(_idleWatchProvince)} to " +
                $"{ProvinceName(stack.Value.Province)} {Tick - _stageTick} ticks after its order finished");

            Enter(Stage.ChooseAttack);
            return;
        }

        if (Tick - _stageTick < IdleWatchTicks)
        {
            return;
        }

        Record(
            "player-stack-obeys-only-the-player", "PASS",
            $"stack {_marchArmy} held {ProvinceName(_idleWatchProvince)} for {IdleWatchTicks} ticks after its order finished");

        Enter(Stage.ChooseAttack);
    }

    private void RunChooseAttack()
    {
        if (ChooseAttack())
        {
            Log(
                "ATTACK_CHOSEN",
                $"stack={_attackArmy} from={ProvinceName(_attackFrom)} target={ProvinceName(_attackTarget)}");

            Enter(Stage.SelectAttacker);
            return;
        }

        if (_stageFrame < 300)
        {
            return;
        }

        Record(
            "attack-forecast-matches-battle", "NOT-EXERCISED",
            $"no province held an enemy stack next to a clickable Indonesian stack after {_attackAttempts} attempt(s), " +
            "so no attack could be planned");

        Enter(Stage.PauseCheck);
    }

    /* A stack that walks away mid-fight tells nothing about the forecast, and on
       this map it happens often enough that one attempt is not a measurement. */
    private void AbandonAttack(string reason)
    {
        _attackAttempts++;

        if (_attackAttempts < 12)
        {
            Note("ATTACK_RETRY", $"attempt {_attackAttempts} ended: {reason}");
            _contactTick = -1;
            _defenderArmy = -1;
            Enter(Stage.ChooseAttack);
            return;
        }

        Record(
            "attack-forecast-matches-battle", "NOT-EXERCISED",
            $"{reason}; no attempt of {_attackAttempts} reached a decided fight");

        Enter(Stage.PauseCheck);
    }

    private bool ChooseAttack()
    {
        ushort player = _host!.PlayerNation;
        ProvinceStore provinces = _host.World.Provinces;
        WorldSnapshot snapshot = _host.Snapshot();

        var defended = new HashSet<int>();
        var garrisoned = new HashSet<int>();

        foreach (ArmyView army in snapshot.Armies)
        {
            if (army.UnitCount == 0 || army.Nation == player)
            {
                continue;
            }

            if (army.Province < 0 || army.Province >= provinces.Count)
            {
                continue;
            }

            if (_host.Relations.Between(player, army.Nation) != Relation.War)
            {
                continue;
            }

            defended.Add(army.Province);

            /* A stack on ground its own nation controls is defending something,
               and is the likeliest to still be there a step later; a stack on
               foreign ground is passing through. */
            if (provinces.Controller[army.Province] == army.Nation)
            {
                garrisoned.Add(army.Province);
            }
        }

        if (defended.Count == 0)
        {
            return false;
        }

        if (Seek(snapshot, provinces, player, garrisoned) || Seek(snapshot, provinces, player, defended))
        {
            return true;
        }

        /* Every front worth attacking has already been tried once. On a map where
           the enemy never stands still, trying one of them again is a better use
           of the remaining attempts than giving up. */
        if (_triedTargets.Count == 0)
        {
            return false;
        }

        _triedTargets.Clear();
        return Seek(snapshot, provinces, player, garrisoned) || Seek(snapshot, provinces, player, defended);
    }

    private bool Seek(WorldSnapshot snapshot, ProvinceStore provinces, ushort player, HashSet<int> wanted)
    {
        foreach (ArmyView army in snapshot.Armies)
        {
            if (army.Nation != player || army.UnitCount == 0)
            {
                continue;
            }

            if (army.Province < 0 || army.Province >= provinces.Count)
            {
                continue;
            }

            if (_host!.PlayerArmyAt(army.Province) != army.Id || !CanAim(army.Province))
            {
                continue;
            }

            foreach (int target in Adjacent(army.Province))
            {
                if (!wanted.Contains(target) || _triedTargets.Contains(target) || !CanAim(target))
                {
                    continue;
                }

                Bridge.MovePlan? plan = _host.PlanMove(army.Id, target);

                /* Anything longer than one step gives the defender time to march
                   off before the assault lands, and then nothing was measured. */
                if (plan?.Battle is null || plan.Path.Count != 2)
                {
                    continue;
                }

                CheckPlanShape(plan, army.Id, army.Province, target);

                _attackArmy = army.Id;
                _attackFrom = army.Province;
                _attackTarget = target;
                _triedTargets.Add(target);
                RememberForecast(plan.Battle, plan.AmphibiousArrival);
                return true;
            }
        }

        return false;
    }

    private List<int> Adjacent(int province)
    {
        var neighbours = new List<int>();

        foreach (ushort land in _host!.Data.Land.NeighboursOf(province))
        {
            neighbours.Add(land);
        }

        foreach (ushort sea in _host.Data.Sea.NeighboursOf(province))
        {
            neighbours.Add(sea);
        }

        return neighbours;
    }

    private void RememberForecast(Bridge.AttackPreview preview, bool amphibious)
    {
        _haveForecast = true;
        _forecast = preview.Forecast;
        _forecastAttacker = preview.AttackerUnits;
        _forecastDefender = preview.DefenderUnits;
        _forecastAmphibious = amphibious;
    }

    private void RunSelectAttacker()
    {
        if (!_clickPending && _stageFrame == 1)
        {
            BeginClick(_attackFrom, MouseButton.Left);
            return;
        }

        ClickOutcome outcome = PollClick();
        if (outcome == ClickOutcome.Waiting)
        {
            return;
        }

        if (outcome == ClickOutcome.Rejected)
        {
            Enter(Stage.ChooseAttack);
            return;
        }

        Enter(Stage.PlanAttack);
    }

    private void RunPlanAttack()
    {
        if (!_clickPending && _stageFrame == 1)
        {
            BeginClick(_attackTarget, MouseButton.Left);
            return;
        }

        ClickOutcome outcome = PollClick();
        if (outcome == ClickOutcome.Waiting)
        {
            return;
        }

        if (outcome == ClickOutcome.Rejected)
        {
            Enter(Stage.ChooseAttack);
            return;
        }

        Bridge.MovePlan? plan = _host!.PlanMove(_attackArmy, _attackTarget);
        if (plan?.Battle is not null)
        {
            RememberForecast(plan.Battle, plan.AmphibiousArrival);
        }

        Log(
            "ATTACK_FORECAST",
            $"attacker={_forecastAttacker} defender={_forecastDefender} amphibious={_forecastAmphibious} " +
            $"ticks={_forecast.FastestTicks}..{_forecast.SlowestTicks} " +
            $"attackerLosses={_forecast.AttackerLossesLow}..{_forecast.AttackerLossesHigh} " +
            $"defenderLosses={_forecast.DefenderLossesLow}..{_forecast.DefenderLossesHigh} " +
            $"decisive={_forecast.Decisive} winsBest={_forecast.AttackerWinsBestCase} winsWorst={_forecast.AttackerWinsWorstCase}");

        _assaultsPlanned++;

        Note(
            "FORECAST_SCOPE",
            "the preview weighs terrain, stack size, unit health and the landing penalty; supply, stance and the " +
            "city-assault modifier reach the real fight but never the forecast");

        if (_forecast.AttackerLossesLow >= _forecastAttacker && _forecast.DefenderLossesHigh == 0)
        {
            _hopelessForecasts++;
            Note(
                "FORECAST_HOPELESS",
                $"the preview for {ProvinceName(_attackTarget)} spends all {_forecastAttacker} attacking units " +
                $"for no enemy loss at all, in every case it simulates");
        }

        Enter(Stage.ConfirmAttack);
    }

    private void RunConfirmAttack()
    {
        if (!_clickPending && _stageFrame == 1)
        {
            BeginClick(_attackTarget, MouseButton.Left);
            return;
        }

        ClickOutcome outcome = PollClick();
        if (outcome == ClickOutcome.Waiting)
        {
            return;
        }

        if (outcome == ClickOutcome.Rejected)
        {
            Enter(Stage.ChooseAttack);
            return;
        }

        _contactTick = -1;
        _battleRounds = 0;
        _bystanderStacks = 0;
        Log("ATTACK_ORDERED", $"stack={_attackArmy} target={ProvinceName(_attackTarget)}");
        Enter(Stage.AwaitContact);
    }

    private void RunAwaitContact()
    {
        ArmyView? stack = StackOf(_attackArmy);

        if (stack is null || stack.Value.UnitCount == 0)
        {
            AbandonAttack($"stack {_attackArmy} was destroyed before it reached {ProvinceName(_attackTarget)}");
            return;
        }

        if (stack.Value.Province == _attackTarget)
        {
            BeginBattle(stack.Value);
            return;
        }

        /* The freshest legal forecast is the one taken from the province next
           door, one step before the stack steps in. */
        if (_stageFrame % 15 == 0)
        {
            Bridge.MovePlan? plan = _host!.PlanMove(_attackArmy, _attackTarget);
            if (plan is not null && plan.Path.Count == 2 && plan.Battle is not null)
            {
                RememberForecast(plan.Battle, plan.AmphibiousArrival);
            }
        }

        if (Tick - _stageTick < ContactDeadlineTicks)
        {
            return;
        }

        Record(
            "attack-forecast-matches-battle", "FAIL",
            $"stack {_attackArmy} never reached {ProvinceName(_attackTarget)}; it stands in {ProvinceName(stack.Value.Province)}");

        Anomaly(
            "ORDERED_MARCH_NEVER_COMPLETED", _attackTarget,
            $"stack {_attackArmy} was ordered to attack {ProvinceName(_attackTarget)} and never arrived");

        Enter(Stage.PauseCheck);
    }

    private void BeginBattle(ArmyView attacker)
    {
        _defenderArmy = -1;
        int strongest = 0;
        ushort player = _host!.PlayerNation;

        foreach (ArmyView army in _host.Snapshot().Armies)
        {
            if (army.Province != _attackTarget || army.Nation == player || army.UnitCount == 0)
            {
                continue;
            }

            if (_host.Relations.Between(player, army.Nation) != Relation.War)
            {
                continue;
            }

            if (army.UnitCount > strongest)
            {
                strongest = army.UnitCount;
                _defenderArmy = army.Id;
            }
        }

        if (_defenderArmy < 0)
        {
            AbandonAttack($"the defender had left {ProvinceName(_attackTarget)} before stack {_attackArmy} arrived");
            return;
        }

        _contactTick = Tick;
        _attackerAtContact = attacker.UnitCount;
        _defenderAtContact = strongest;
        _battleRounds = 0;

        Log(
            "CONTACT",
            $"province={ProvinceName(_attackTarget)} attacker={_attackArmy} units={_attackerAtContact} " +
            $"defender={_defenderArmy} units={_defenderAtContact} " +
            $"supplyAttacker={_host.SupplyAt(_attackTarget)}");

        Enter(Stage.WatchBattle);
    }

    private void ObserveBattleRound()
    {
        if (_contactTick < 0 || _defenderArmy < 0)
        {
            return;
        }

        ArmyView? attacker = StackOf(_attackArmy);
        ArmyView? defender = StackOf(_defenderArmy);

        if (attacker is null || defender is null)
        {
            return;
        }

        if (attacker.Value.UnitCount > 0 && defender.Value.UnitCount > 0
            && attacker.Value.Province == _attackTarget && defender.Value.Province == _attackTarget)
        {
            _battleRounds++;
        }
    }

    private void RunWatchBattle()
    {
        ArmyView? attacker = StackOf(_attackArmy);
        ArmyView? defender = StackOf(_defenderArmy);

        if (attacker is null || defender is null)
        {
            AbandonAttack("one of the two stacks left the army table");
            return;
        }

        int others = 0;
        foreach (ArmyView army in _host!.Snapshot().Armies)
        {
            if (army.Province == _attackTarget && army.UnitCount > 0
                && army.Id != _attackArmy && army.Id != _defenderArmy)
            {
                others++;
            }
        }

        _bystanderStacks = Math.Max(_bystanderStacks, others);

        bool finished = attacker.Value.UnitCount == 0 || defender.Value.UnitCount == 0;
        bool separated = attacker.Value.Province != _attackTarget || defender.Value.Province != _attackTarget;
        bool expired = Tick - _contactTick >= BattleDeadlineTicks;

        if (!finished && !separated && !expired)
        {
            return;
        }

        int attackerLosses = _attackerAtContact - attacker.Value.UnitCount;
        int defenderLosses = _defenderAtContact - defender.Value.UnitCount;

        if (separated && !finished)
        {
            if (_battleRounds < 2)
            {
                AbandonAttack(
                    $"the stacks separated after {_battleRounds} round(s): attacker {_attackArmy} is in " +
                    $"{ProvinceName(attacker.Value.Province)}, defender {_defenderArmy} is in " +
                    $"{ProvinceName(defender.Value.Province)}, target was {ProvinceName(_attackTarget)}");

                return;
            }

            bool withinBounds = _battleRounds <= _forecast.SlowestTicks + 1
                && attackerLosses <= _forecast.AttackerLossesHigh
                && defenderLosses <= _forecast.DefenderLossesHigh;

            Record(
                "attack-forecast-matches-battle",
                withinBounds ? "PARTIAL" : "FAIL",
                $"the fight broke off after {_battleRounds} of a forecast {_forecast.FastestTicks}..{_forecast.SlowestTicks} " +
                $"ticks because one stack marched out; losses so far {attackerLosses} attacker " +
                $"(forecast up to {_forecast.AttackerLossesHigh}) and {defenderLosses} defender " +
                $"(forecast up to {_forecast.DefenderLossesHigh})");

            if (!withinBounds)
            {
                Anomaly(
                    "BATTLE_OUTSIDE_FORECAST", _attackTarget,
                    $"an unfinished fight already exceeded the forecast: {_battleRounds} ticks, " +
                    $"{attackerLosses} and {defenderLosses} losses against a ceiling of " +
                    $"{_forecast.SlowestTicks} ticks, {_forecast.AttackerLossesHigh} and {_forecast.DefenderLossesHigh}");
            }

            Anomaly(
                "BATTLE_BROKEN_OFF_BY_MARCH_ORDER", _attackTarget,
                $"stack {_defenderArmy} walked out of a fight in {ProvinceName(_attackTarget)} after {_battleRounds} rounds; " +
                "nothing pins an engaged stack in place, so the forecast's assumption that a fight runs to a result does not hold");

            Enter(Stage.PauseCheck);
            return;
        }

        if (expired && !finished)
        {
            Record(
                "attack-forecast-matches-battle", "FAIL",
                $"neither stack was destroyed within {BattleDeadlineTicks} ticks; " +
                $"forecast said {_forecast.FastestTicks}..{_forecast.SlowestTicks} ticks");

            Enter(Stage.PauseCheck);
            return;
        }

        bool ticksInside = _battleRounds >= _forecast.FastestTicks - 1 && _battleRounds <= _forecast.SlowestTicks + 1;
        bool attackerInside = attackerLosses >= _forecast.AttackerLossesLow && attackerLosses <= _forecast.AttackerLossesHigh;
        bool defenderInside = defenderLosses >= _forecast.DefenderLossesLow && defenderLosses <= _forecast.DefenderLossesHigh;
        bool winnerAsForecast = _forecast.Decisive
            ? _forecast.AttackerWinsBestCase == (defender.Value.UnitCount == 0 && attacker.Value.UnitCount > 0)
            : true;

        Log(
            "BATTLE_RESULT",
            $"province={ProvinceName(_attackTarget)} rounds={_battleRounds} " +
            $"attackerLosses={attackerLosses} defenderLosses={defenderLosses} " +
            $"attackerLeft={attacker.Value.UnitCount} defenderLeft={defender.Value.UnitCount} " +
            $"bystanders={_bystanderStacks} controller={NationTag(_host.World.Provinces.Controller[_attackTarget])}");

        string verdict = ticksInside && attackerInside && defenderInside && winnerAsForecast ? "PASS" : "FAIL";

        Record(
            "attack-forecast-matches-battle", verdict,
            $"forecast ticks {_forecast.FastestTicks}..{_forecast.SlowestTicks} against {_battleRounds} observed; " +
            $"attacker losses {_forecast.AttackerLossesLow}..{_forecast.AttackerLossesHigh} against {attackerLosses}; " +
            $"defender losses {_forecast.DefenderLossesLow}..{_forecast.DefenderLossesHigh} against {defenderLosses}; " +
            $"amphibious={_forecastAmphibious} bystanders={_bystanderStacks}");

        if (verdict == "FAIL")
        {
            Anomaly(
                "BATTLE_OUTSIDE_FORECAST", _attackTarget,
                $"the preview quoted {_forecast.FastestTicks}..{_forecast.SlowestTicks} ticks, " +
                $"{_forecast.AttackerLossesLow}..{_forecast.AttackerLossesHigh} attacker losses and " +
                $"{_forecast.DefenderLossesLow}..{_forecast.DefenderLossesHigh} defender losses; the fight ran " +
                $"{_battleRounds} ticks for {attackerLosses} and {defenderLosses}");
        }

        Enter(Stage.PauseCheck);
    }

    private void RunPauseCheck()
    {
        if (_stageFrame == 1)
        {
            _speedBeforePause = _host!.Speed;
            _pauseTick = Tick;
            InjectKey(Key.Space);
            return;
        }

        if (_stageFrame < KeyWindowFrames)
        {
            return;
        }

        if (_stageFrame == KeyWindowFrames)
        {
            Record(
                "pause-key-changes-speed",
                _host!.Speed == GameSpeed.Paused ? "PASS" : "FAIL",
                $"space moved the speed from {GameSpeedInfo.Label(_speedBeforePause)} to {GameSpeedInfo.Label(_host.Speed)}");

            _pauseTick = Tick;
            return;
        }

        if (_stageFrame < KeyWindowFrames + 90)
        {
            return;
        }

        long moved = Tick - _pauseTick;
        bool halted = moved == 0;

        Record(
            "pause-stops-the-clock",
            halted ? "PASS" : "FAIL",
            halted
                ? "the clock did not advance while paused"
                : $"the clock advanced {moved} ticks over 90 frames while the speed read {GameSpeedInfo.Label(_host!.Speed)}");

        if (!halted)
        {
            Anomaly(
                "PAUSE_DOES_NOT_STOP_CLOCK", -1,
                $"speed reads {GameSpeedInfo.Label(_host!.Speed)} yet the clock ran on {moved} ticks");
        }

        InjectKey(Key.Space);
        Enter(Stage.SpeedLadder);
    }

    private void RunSpeedLadder()
    {
        if (_stageFrame % KeyWindowFrames != 0)
        {
            return;
        }

        if (_ladderStep > 0 && _host!.Speed != _ladderExpected)
        {
            _ladderFailed = true;
            Anomaly(
                "SPEED_STEP_NOT_APPLIED", -1,
                $"step {_ladderStep} expected {GameSpeedInfo.Label(_ladderExpected)} but the speed reads {GameSpeedInfo.Label(_host.Speed)}");
        }

        if (_ladderStep >= 9)
        {
            Record(
                "speed-ladder",
                _ladderFailed ? "FAIL" : "PASS",
                $"three steps down to {GameSpeedInfo.Label(GameSpeed.Paused)} and five up to " +
                $"{GameSpeedInfo.Label(GameSpeed.Blitz)} each landed on the expected rung; " +
                $"final speed {GameSpeedInfo.Label(_host!.Speed)}");

            Enter(Stage.SaveCheck);
            return;
        }

        _ladderStep++;
        Key key = _ladderStep <= 3 ? Key.Minus : Key.Equal;
        _ladderExpected = key == Key.Minus
            ? GameSpeedInfo.Slower(_host!.Speed)
            : GameSpeedInfo.Faster(_host!.Speed);

        InjectKey(key);
        Log("SPEED_STEP", $"step={_ladderStep} key={key} expecting={GameSpeedInfo.Label(_ladderExpected)}");
    }

    /*
       The key press and the frame that services it are separated by the input
       buffer, so the simulation is held still across both. Without that, ticks
       run between the digest and the file, and a load that restored perfectly
       would still read as a mismatch.
    */
    private void RunSaveCheck()
    {
        if (_stageFrame == 1)
        {
            _host!.Paused = true;
            Note("CLOCK_HELD", "the simulation is held still across the save so the digest and the file describe one tick");
            return;
        }

        if (_stageFrame == 2)
        {
            _digestBeforeSave = CaptureDigest();
            _buildingsBeforeSave = _host!.BuildingsUnderway;
            _researchBeforeSave = _host.ResearchCompleted(_host.PlayerNation);
            _priceBeforeSave = _host.PriceOf(GameResource.Food);
            InjectKey(Key.F5);
            return;
        }

        if (_stageFrame < KeyWindowFrames)
        {
            return;
        }

        _saveWritten = Godot.FileAccess.FileExists("user://save-1.nrsv");

        Record(
            "save-key-writes-a-file",
            _saveWritten ? "PASS" : "FAIL",
            _saveWritten
                ? $"F5 left a save on disk at tick {_digestBeforeSave.Tick}"
                : "F5 produced no save file");

        _host!.Paused = false;
        Enter(Stage.DriftAfterSave);
    }

    private void RunDrift()
    {
        if (Tick - _stageTick < DriftTicks)
        {
            return;
        }

        StateDigest now = CaptureDigest();
        Log(
            "DRIFT",
            $"ticks={now.Tick - _digestBeforeSave.Tick} points={_digestBeforeSave.VictoryPoints}->{now.VictoryPoints} " +
            $"stacks={_digestBeforeSave.LiveStacks}->{now.LiveStacks}");

        if (now == _digestBeforeSave)
        {
            Note(
                "NO_DRIFT_BEFORE_LOAD",
                "the world did not change between save and load, so the load check cannot tell a restore from a no-op");
        }

        Enter(Stage.LoadCheck);
    }

    private void RunLoadCheck()
    {
        if (_stageFrame == 1)
        {
            _host!.Paused = true;
            return;
        }

        if (_stageFrame == 2)
        {
            InjectKey(Key.F9);
            return;
        }

        if (_stageFrame < KeyWindowFrames)
        {
            return;
        }

        StateDigest after = CaptureDigest();
        bool same = after == _digestBeforeSave;

        Record(
            "load-restores-the-saved-state",
            same ? "PASS" : "FAIL",
            same
                ? $"tick, ownership, morale, stockpiles and the {after.LiveStacks} live stacks came back exactly as saved"
                : $"saved tick={_digestBeforeSave.Tick} points={_digestBeforeSave.VictoryPoints} " +
                  $"controllers={_digestBeforeSave.ControllerHash} morale={_digestBeforeSave.MoraleHash} " +
                  $"stacks={_digestBeforeSave.LiveStacks} armies={_digestBeforeSave.ArmyHash} " +
                  $"money={_digestBeforeSave.PlayerMoney}; restored tick={after.Tick} points={after.VictoryPoints} " +
                  $"controllers={after.ControllerHash} morale={after.MoraleHash} stacks={after.LiveStacks} " +
                  $"armies={after.ArmyHash} money={after.PlayerMoney}");

        if (!same)
        {
            Anomaly(
                "LOAD_DID_NOT_RESTORE_SAVED_STATE", -1,
                $"the state after F9 differs from the state at F5 (tick {after.Tick} against {_digestBeforeSave.Tick})");
        }

        int buildings = _host!.BuildingsUnderway;
        int research = _host.ResearchCompleted(_host.PlayerNation);
        long price = _host.PriceOf(GameResource.Food);
        bool carried = buildings == _buildingsBeforeSave && research == _researchBeforeSave && price == _priceBeforeSave;

        Record(
            "load-restores-subsystems-outside-the-save",
            carried ? "PASS" : "FAIL",
            $"construction {_buildingsBeforeSave}->{buildings}, research {_researchBeforeSave}->{research}, " +
            $"food price {_priceBeforeSave}->{price} across the save and load");

        if (!carried)
        {
            Anomaly(
                "LOAD_LEAVES_SUBSYSTEMS_AHEAD_OF_THE_SAVE", -1,
                $"construction, research and market state kept running past the restored tick " +
                $"(construction {_buildingsBeforeSave}->{buildings}, research {_researchBeforeSave}->{research}, " +
                $"food price {_priceBeforeSave}->{price})");
        }

        _host.Paused = false;
        Enter(Stage.Settle);
    }

    private StateDigest CaptureDigest()
    {
        WorldState world = _host!.World;
        ProvinceStore provinces = world.Provinces;
        ushort player = _host.PlayerNation;

        long controllerHash = 0;
        long moraleHash = 0;

        unchecked
        {
            for (int province = 0; province < provinces.Count; province++)
            {
                controllerHash = (controllerHash * 1000003) + provinces.Controller[province];
                moraleHash = (moraleHash * 1000003) + (long)MathF.Round(provinces.Morale[province] * 1000f);
            }
        }

        long armyHash = 0;
        int live = 0;

        foreach (ArmyView army in _host.Snapshot().Armies)
        {
            if (army.UnitCount == 0)
            {
                continue;
            }

            live++;
            unchecked
            {
                armyHash += (army.Id * 8191L) + (army.Province * 31L) + army.UnitCount
                    + (long)MathF.Round(army.Health * 10000f);
            }
        }

        return new StateDigest(
            world.Clock.Tick,
            world.VictoryPointsOf(player),
            controllerHash,
            moraleHash,
            live,
            armyHash,
            _host.StockOf(player, GameResource.Money),
            _host.StockOf(player, GameResource.Materials));
    }

    private void RunSettle()
    {
        if (Day - _firstDay + 1 < SessionDays)
        {
            return;
        }

        PrintSummary();
        Enter(Stage.Done);
    }

    /* A silent pass is worthless unless the log also says how hard the rule was
       looked for, so every invariant reports its coverage alongside its verdict. */
    private void ReportInvariant(string name, string code, string coverage)
    {
        int seen = _anomalyCounts.GetValueOrDefault(code);
        Record(
            name,
            seen == 0 ? "PASS" : "FAIL",
            seen == 0 ? $"never observed; {coverage}" : $"observed {seen} time(s); {coverage}");
    }

    private void ReportInvariants()
    {
        string armyCoverage = $"{_armySightings} stack sightings over {_daysSwept} daily sweeps";
        string provinceCoverage = $"{_provinceSweeps} province readings over {_daysSwept} daily sweeps";

        ReportInvariant("no-army-where-nobody-controls", "ARMY_IN_UNCONTROLLED_PROVINCE", armyCoverage);
        ReportInvariant("no-army-outside-the-province-table", "ARMY_PROVINCE_OUT_OF_RANGE", armyCoverage);
        ReportInvariant("no-empty-stack-in-the-army-table", "EMPTY_STACK_IN_TABLE", armyCoverage);
        ReportInvariant("no-controller-outside-the-nation-table", "CONTROLLER_NOT_A_NATION", provinceCoverage);
        ReportInvariant("no-controller-without-a-nation-record", "CONTROLLER_HAS_NO_NATION_RECORD", provinceCoverage);
        ReportInvariant("no-province-lost-to-nobody", "CONTROL_LOST_TO_NOBODY", provinceCoverage);
        ReportInvariant("no-negative-stockpile", "NEGATIVE_STOCKPILE", $"{_stockpileReads} stockpile readings");
        ReportInvariant(
            "no-victory-points-without-conquest", "VICTORY_POINTS_MOVED_WITHOUT_CONQUEST",
            $"{_daysSwept} daily comparisons of Indonesia's points against the provinces that changed hands");
        ReportInvariant(
            "march-path-starts-under-the-stack", "MARCH_PATH_DOES_NOT_START_UNDER_STACK",
            $"{_planShapeChecks} march plans inspected");
        ReportInvariant(
            "march-path-reaches-its-target", "MARCH_PATH_DOES_NOT_REACH_TARGET",
            $"{_planShapeChecks} march plans inspected");
        ReportInvariant(
            "ordered-marches-complete", "ORDERED_MARCH_NEVER_COMPLETED",
            "every march this session issued was followed to its destination or to the stack's death");

        int blockadeAnomalies = _anomalyCounts.GetValueOrDefault("BLOCKADE_WITHOUT_SEA_LINK");
        Record(
            "no-blockade-without-a-sea-link",
            blockadeAnomalies > 0 ? "FAIL" : _blockadeSightings == 0 ? "NOT-EXERCISED" : "PASS",
            _blockadeSightings == 0
                ? $"no province was blockaded at any point in the session, so the rule met no case to break; " +
                  $"{provinceCoverage}"
                : $"{_blockadeSightings} blockade sightings, {blockadeAnomalies} of them on landlocked ground");

        Note(
            "LIVENESS_NOT_TRACKED",
            "NationStore.IsAlive is filled with true and never written again, so \"controlled by a nation that no " +
            "longer exists\" was checked as an out-of-range or blank-tag controller rather than against a liveness flag");
    }

    private void PrintSummary()
    {
        ReportInvariants();
        GD.Print($"{SummaryTag} ==================== playtest summary ====================");
        GD.Print(
            $"{SummaryTag} session: reached day {Day} from day {_firstDay}, {_daysObserved} day boundaries crossed " +
            $"(the save reload replays a few), clock at tick {Tick}, {_frame} frames rendered");
        GD.Print(
            $"{SummaryTag} input: {_clicksThroughInput} clicks travelled the picker's input path, " +
            $"{_clicksThroughCall} fell back to a direct call, {_keysInjected} key presses injected");

        foreach ((string name, string verdict, string detail) in _checks)
        {
            GD.Print($"{SummaryTag} check {verdict,-13} {name}: {detail}");
        }

        if (_anomalyCounts.Count == 0)
        {
            GD.Print($"{SummaryTag} anomalies: none. No forbidden state was observed during the session.");
        }
        else
        {
            GD.Print($"{SummaryTag} anomalies: {_anomalyCounts.Count} distinct kinds.");
            foreach ((string code, int count) in _anomalyCounts)
            {
                GD.Print($"{SummaryTag} anomaly {code} seen {count} time(s)");
            }
        }

        int passed = 0;
        int failed = 0;
        int partial = 0;
        int skipped = 0;

        foreach ((string _, string verdict, string _) in _checks)
        {
            switch (verdict)
            {
                case "PASS": passed++; break;
                case "FAIL": failed++; break;
                case "PARTIAL": partial++; break;
                default: skipped++; break;
            }
        }

        GD.Print(
            $"{SummaryTag} combat: {_ticksWithBattles} of {_ticksSampled} sampled ticks carried a battle report, " +
            $"{_battlePairings} attacker-defender pairings resolved in total");
        GD.Print(
            $"{SummaryTag} assaults: {_assaultsPlanned} previewed, {_hopelessForecasts} of them forecast the loss of " +
            $"every attacking unit for no enemy casualty");
        GD.Print(
            $"{SummaryTag} verdict: {passed} passed, {failed} failed, {partial} partly exercised, " +
            $"{skipped} could not be exercised.");
        GD.Print($"{SummaryTag} ==========================================================");
    }
}
