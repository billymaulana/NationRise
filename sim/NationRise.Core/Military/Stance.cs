using NationRise.Core.Time;
using NationRise.Core.World;

namespace NationRise.Core.Military;

public enum StanceKind : byte
{
    Assault = 0,
    Hold = 1,
    Ambush = 2,
    Siege = 3,
    Screen = 4,
    Raid = 5,
}

/*
   Entrenchment is stored as hours actually spent digging rather than as a
   fraction that grows every tick. Deriving the level from a whole number keeps
   a doubled digging rate and a capped stance from drifting apart over the
   hundreds of ticks a dug-in line survives.
*/
public sealed class StanceState
{
    internal StanceState(Army army, StanceKind kind, Terrain terrain, long tick)
    {
        Army = army;
        Kind = kind;
        Terrain = terrain;
        ChangedAtTick = tick;
    }

    public Army Army { get; internal set; }
    public StanceKind Kind { get; internal set; }
    public Terrain Terrain { get; internal set; }
    public long ChangedAtTick { get; internal set; }
    public int DugHours { get; internal set; }

    public int ArmyId => Army.Id;

    public float Entrenchment => StanceSystem.EntrenchmentOf(Kind, DugHours);
}

/*
   Six postures a stack can adopt, and the cost of changing its mind. A stance
   only takes hold after a reorganisation window, so posture is a commitment
   made ahead of a fight rather than a lever pulled once the shooting starts;
   for those six ticks the stack fights with none of the stance's advantages
   and none of its drawbacks.

   Entrenchment is deliberately outside that rule. Trenches are ground that has
   been dug, not an intention, so they keep protecting the stack while it
   reorganises and vanish only when it leaves them behind.
*/
public sealed class StanceSystem
{
    public const int ReorganisationTicks = 6;

    public const float AssaultAttack = 1.15f;
    public const float AssaultDamageTaken = 1.10f;
    public const float AssaultRoughTerrainAttack = 0.85f;

    public const float ScreenAttack = 0.70f;
    public const float ScreenDamageTaken = 0.80f;
    public const float ScreenWithdrawalHealth = 0.60f;

    public const float RaidAttack = 0.80f;
    public const float RaidSpeed = 1.20f;
    public const float RaidSupplyPenalty = 0.50f;
    public const int RaidSupplyTicks = 72;

    public const float DailyEntrenchment = 0.10f;
    public const float AmbushEntrenchmentCap = 0.50f;
    public const float EntrenchedCityDamageTaken = 0.75f;
    public const float EntrenchedFieldDamageTaken = 0.90f;

    public const float CityAssaultPenalty = 0.75f;
    public const float AssaultCityPenalty = 0.85f;

    /* Recon that resolves a province to an estimate or better sees through an
       ambush; anything vaguer than that does not. */
    public const int HiddenIntelThreshold = 2;

    private readonly WorldState _world;
    private readonly SupplySystem _supply;

    private readonly Dictionary<int, StanceState> _states = [];
    private readonly List<StanceState> _ordered = [];
    private readonly Dictionary<int, long> _raidedUntil = [];

    private long _lastTick;

    public StanceSystem(WorldState world, SupplySystem supply)
    {
        ArgumentNullException.ThrowIfNull(world);
        ArgumentNullException.ThrowIfNull(supply);

        _world = world;
        _supply = supply;
        _lastTick = world.Clock.Tick;
    }

    public int TrackedArmies => _ordered.Count;

    public static float AttackMultiplier(StanceKind kind) => kind switch
    {
        StanceKind.Assault => AssaultAttack,
        StanceKind.Screen => ScreenAttack,
        StanceKind.Raid => RaidAttack,
        _ => 1f,
    };

    public static float DamageTakenMultiplier(StanceKind kind) => kind switch
    {
        StanceKind.Assault => AssaultDamageTaken,
        StanceKind.Screen => ScreenDamageTaken,
        _ => 1f,
    };

    public static float SpeedMultiplier(StanceKind kind) =>
        kind == StanceKind.Raid ? RaidSpeed : 1f;

    /* Storming a mountain pass or a built-up block with an assault stance
       spends the bonus and more: the extra weight has nowhere to deploy. */
    public static float TerrainAttackModifier(StanceKind kind, Terrain terrain) =>
        kind == StanceKind.Assault && terrain is Terrain.Mountains or Terrain.Urban
            ? AssaultRoughTerrainAttack
            : 1f;

    public static float CityAssaultMultiplier(StanceKind kind) =>
        kind == StanceKind.Assault ? AssaultCityPenalty : CityAssaultPenalty;

    public static float EntrenchmentCap(StanceKind kind) => kind switch
    {
        StanceKind.Hold => 1f,
        StanceKind.Ambush => AmbushEntrenchmentCap,
        _ => 0f,
    };

    public static int MaxDugHours(StanceKind kind) =>
        (int)MathF.Round(EntrenchmentCap(kind) / DailyEntrenchment * GameDate.HoursPerDay);

    public static float EntrenchmentOf(StanceKind kind, int dugHours) => MathF.Min(
        EntrenchmentCap(kind),
        dugHours * DailyEntrenchment / GameDate.HoursPerDay);

    public static float EntrenchmentDamageTaken(float entrenchment, bool inCity)
    {
        if (entrenchment <= 0f)
        {
            return 1f;
        }

        float floor = inCity ? EntrenchedCityDamageTaken : EntrenchedFieldDamageTaken;
        return 1f - entrenchment * (1f - floor);
    }

    public static bool Entrenches(StanceKind kind) =>
        kind is StanceKind.Hold or StanceKind.Ambush;

    public static bool CanCapture(StanceKind kind) => kind != StanceKind.Raid;

    /* Immobility is a permission, not a speed of zero: a dug-in stack that is
       routed or ordered out still has to travel at a usable rate. */
    public static bool CanMove(StanceKind kind) =>
        kind is not (StanceKind.Hold or StanceKind.Ambush);

    public static bool EngagesEnemyArmies(StanceKind kind) => kind != StanceKind.Siege;

    public static bool AdvancesSiege(StanceKind kind) => kind == StanceKind.Siege;

    /* Digging is quicker where the ground already offers a start: a wood line
       or a row of houses is half a position before anyone lifts a shovel. */
    public static int DiggingRateIn(Terrain terrain) =>
        terrain is Terrain.Forest or Terrain.Hills or Terrain.Urban ? 2 : 1;

    public StanceState? StateOf(int armyId) =>
        _states.TryGetValue(armyId, out StanceState? state) ? state : null;

    public StanceKind? StanceOf(int armyId) => StateOf(armyId)?.Kind;

    public StanceKind? EffectiveStanceOf(int armyId)
    {
        StanceState? state = StateOf(armyId);
        return state is null || IsReorganising(state) ? null : state.Kind;
    }

    public bool IsReorganising(int armyId)
    {
        StanceState? state = StateOf(armyId);
        return state is not null && IsReorganising(state);
    }

    public float AttackMultiplierFor(int armyId)
    {
        StanceKind? kind = EffectiveStanceOf(armyId);
        return kind is null ? 1f : AttackMultiplier(kind.Value);
    }

    public float AttackMultiplierFor(int armyId, Terrain terrain)
    {
        StanceKind? kind = EffectiveStanceOf(armyId);
        return kind is null
            ? 1f
            : AttackMultiplier(kind.Value) * TerrainAttackModifier(kind.Value, terrain);
    }

    public float DamageTakenMultiplierFor(int armyId)
    {
        StanceState? state = StateOf(armyId);
        if (state is null)
        {
            return 1f;
        }

        float stance = IsReorganising(state) ? 1f : DamageTakenMultiplier(state.Kind);
        return stance * EntrenchmentDamageTakenFor(state);
    }

    public float SpeedMultiplierFor(int armyId)
    {
        StanceKind? kind = EffectiveStanceOf(armyId);
        return kind is null ? 1f : SpeedMultiplier(kind.Value);
    }

    public float CityAssaultMultiplierFor(int armyId)
    {
        StanceKind? kind = EffectiveStanceOf(armyId);
        return kind is null ? CityAssaultPenalty : CityAssaultMultiplier(kind.Value);
    }

    public float EntrenchmentOf(int armyId) => StateOf(armyId)?.Entrenchment ?? 0f;

    public bool CanCapture(int armyId)
    {
        StanceKind? kind = EffectiveStanceOf(armyId);
        return kind is null || CanCapture(kind.Value);
    }

    public bool CanMove(int armyId)
    {
        StanceKind? kind = EffectiveStanceOf(armyId);
        return kind is null || CanMove(kind.Value);
    }

    public bool EngagesEnemyArmies(int armyId)
    {
        StanceKind? kind = EffectiveStanceOf(armyId);
        return kind is null || EngagesEnemyArmies(kind.Value);
    }

    public bool AdvancesSiege(int armyId) => EffectiveStanceOf(armyId) == StanceKind.Siege;

    public bool RetreatsWithoutPenalty(int armyId) => EffectiveStanceOf(armyId) == StanceKind.Screen;

    public bool ShouldWithdraw(int armyId)
    {
        StanceState? state = StateOf(armyId);
        return state is not null
            && !IsReorganising(state)
            && state.Kind == StanceKind.Screen
            && state.Army.Health < ScreenWithdrawalHealth;
    }

    public bool IsHiddenFrom(int armyId, int enemyIntelLevel)
    {
        StanceState? state = StateOf(armyId);
        return state is not null
            && !IsReorganising(state)
            && state.Kind == StanceKind.Ambush
            && enemyIntelLevel < HiddenIntelThreshold;
    }

    public bool IsRaided(int province) =>
        _raidedUntil.TryGetValue(province, out long until) && until > _world.Clock.Tick;

    public float RaidedSupplyMultiplierOf(int province) =>
        IsRaided(province) ? RaidSupplyPenalty : 1f;

    public bool Set(Army army, StanceKind kind, Terrain terrain, out string reason)
    {
        ArgumentNullException.ThrowIfNull(army);

        if (!IsPermitted(army, kind, terrain, out reason))
        {
            return false;
        }

        long now = _world.Clock.Tick;

        if (_states.TryGetValue(army.Id, out StanceState? state))
        {
            state.Army = army;
            state.Terrain = terrain;

            /* Re-issuing the standing order is not a change of mind, so it
               must not restart the reorganisation or the digging. */
            if (state.Kind == kind)
            {
                return true;
            }

            state.Kind = kind;
            state.ChangedAtTick = now;
            state.DugHours = Math.Min(state.DugHours, MaxDugHours(kind));
            return true;
        }

        var created = new StanceState(army, kind, terrain, now);
        _states[army.Id] = created;
        _ordered.Add(created);
        return true;
    }

    public void OnArmyMoved(int armyId)
    {
        if (_states.TryGetValue(armyId, out StanceState? state))
        {
            state.DugHours = 0;
        }
    }

    public void Forget(int armyId)
    {
        if (_states.Remove(armyId, out StanceState? state))
        {
            _ordered.Remove(state);
        }
    }

    /* Nothing happens twice in the same game hour: the clock, not the number of
       calls, decides how much digging a stack has done. */
    public void Tick()
    {
        long now = _world.Clock.Tick;

        if (now <= _lastTick)
        {
            _lastTick = now;
            return;
        }

        int hours = (int)Math.Min(now - _lastTick, int.MaxValue);
        _lastTick = now;

        DropDestroyed();
        ExpireRaids(now);

        foreach (StanceState state in _ordered)
        {
            if (IsReorganising(state))
            {
                continue;
            }

            Dig(state, hours);
            Raid(state, now);
        }
    }

    private bool IsReorganising(StanceState state) =>
        _world.Clock.Tick - state.ChangedAtTick < ReorganisationTicks;

    private float EntrenchmentDamageTakenFor(StanceState state) => EntrenchmentDamageTaken(
        state.Entrenchment,
        _world.Provinces.IsCity[state.Army.Province]);

    private void Dig(StanceState state, int hours)
    {
        if (!Entrenches(state.Kind) || !_supply.CanEntrench(state.Army.Province))
        {
            return;
        }

        int cap = MaxDugHours(state.Kind);
        if (state.DugHours >= cap)
        {
            return;
        }

        state.DugHours = Math.Min(cap, state.DugHours + hours * DiggingRateIn(state.Terrain));
    }

    private void Raid(StanceState state, long now)
    {
        if (state.Kind != StanceKind.Raid)
        {
            return;
        }

        int province = state.Army.Province;
        if (_world.Provinces.Controller[province] == state.Army.Nation)
        {
            return;
        }

        _raidedUntil[province] = now + RaidSupplyTicks;
    }

    private void ExpireRaids(long now)
    {
        if (_raidedUntil.Count == 0)
        {
            return;
        }

        List<int> expired = [];
        foreach ((int province, long until) in _raidedUntil)
        {
            if (until <= now)
            {
                expired.Add(province);
            }
        }

        foreach (int province in expired)
        {
            _raidedUntil.Remove(province);
        }
    }

    private void DropDestroyed()
    {
        for (int i = _ordered.Count - 1; i >= 0; i--)
        {
            StanceState state = _ordered[i];
            if (!state.Army.IsDestroyed)
            {
                continue;
            }

            _ordered.RemoveAt(i);
            _states.Remove(state.ArmyId);
        }
    }

    private bool IsPermitted(Army army, StanceKind kind, Terrain terrain, out string reason)
    {
        reason = string.Empty;

        if (army.IsDestroyed)
        {
            reason = $"Army {army.Id} has been destroyed.";
            return false;
        }

        if (kind == StanceKind.Assault
            && _supply.EffectiveStatusOf(army.Province) == SupplyStatus.CutOff)
        {
            reason = $"Army {army.Id} is cut off and cannot mount an assault.";
            return false;
        }

        /* The cover an ambush needs is the same ground that already favours a
           defender, so the rule is read from one place instead of being spelled
           out twice and drifting. */
        if (kind == StanceKind.Ambush && !terrain.FavoursDefence())
        {
            reason = $"Ambush needs rough terrain; {terrain} leaves the stack in the open.";
            return false;
        }

        if (kind == StanceKind.Ambush && !IsSupplied(army.Province))
        {
            reason = $"Ambush needs a supplied position; army {army.Id} has none.";
            return false;
        }

        if (kind == StanceKind.Siege && !IsSupplied(army.Province))
        {
            reason = $"A siege cannot be maintained on broken supply by army {army.Id}.";
            return false;
        }

        return true;
    }

    private bool IsSupplied(int province) =>
        _supply.EffectiveStatusOf(province) == SupplyStatus.Supplied;
}
