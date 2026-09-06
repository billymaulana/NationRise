using NationRise.Core.Data;
using NationRise.Core.World;

namespace NationRise.Core.Military;

public enum SupplyStatus : byte
{
    Supplied = 0,
    Low = 1,
    CutOff = 2,
}

/*
   Supply is nothing but reachability on the province graph: ground is fed when
   a chain of provinces the same nation controls links it to one of that
   nation's cities. Encirclement is therefore never a scripted event; it is the
   shape the map takes after a capture, and the same flood produces it for the
   player and for every AI.

   The sea graph is walked alongside the land graph. This map holds no water
   provinces at all: its sea layer is adjacency between coastal land provinces,
   so flooding by land alone would strand every island for the whole game and
   leave an archipelago unplayable. Severing an island from its cities
   therefore demands the sea link itself, not merely a neighbouring beach.
*/
public sealed class SupplySystem
{
    public const int ModernRange = 6;
    public const int RecomputeInterval = 6;
    public const int GraceTicks = 48;

    public const float LowAttack = 0.90f;
    public const float CutOffAttack = 0.80f;
    public const float CutOffDefence = 0.70f;
    public const float CutOffDailyAttrition = 0.01f;

    public const int Unreachable = -1;

    private const int AllNations = -1;

    private readonly WorldState _world;
    private readonly ProvinceGraph _land;
    private readonly ProvinceGraph _sea;

    private readonly SupplyStatus[] _status;
    private readonly SupplyStatus[] _statusBeforeCutOff;
    private readonly long[] _cutOffSince;
    private readonly int[] _hops;

    private readonly int[] _distance;
    private readonly Queue<int> _frontier;

    public SupplySystem(WorldState world, ProvinceGraph land, ProvinceGraph sea, int range = ModernRange)
    {
        ArgumentNullException.ThrowIfNull(world);
        ArgumentNullException.ThrowIfNull(land);
        ArgumentNullException.ThrowIfNull(sea);
        ArgumentOutOfRangeException.ThrowIfNegative(range);

        _world = world;
        _land = land;
        _sea = sea;
        Range = range;

        int count = world.Provinces.Count;
        _status = new SupplyStatus[count];
        _statusBeforeCutOff = new SupplyStatus[count];
        _cutOffSince = new long[count];
        _hops = new int[count];
        _distance = new int[count];
        _frontier = new Queue<int>(count);

        RecomputeAll();
    }

    public int Range { get; }

    public long LastComputedTick { get; private set; }

    public bool IsDue => _world.Clock.Tick - LastComputedTick >= RecomputeInterval;

    public SupplyStatus StatusOf(int province) => _status[province];

    public int DistanceToSupplyOf(int province) => _hops[province];

    /*
       A stack carries its own rations, so losing the line does not bite until
       what it carries runs out. During that window it keeps the standing it
       already had rather than the full one: a column that was already on short
       supply does not recover by being surrounded.
    */
    public SupplyStatus EffectiveStatusOf(int province)
    {
        SupplyStatus status = _status[province];
        if (status != SupplyStatus.CutOff)
        {
            return status;
        }

        return _world.Clock.Tick - _cutOffSince[province] >= GraceTicks
            ? SupplyStatus.CutOff
            : _statusBeforeCutOff[province];
    }

    /*
       Supply for a stack standing on ground its nation does not control. The
       province's own status answers the defender's question, not the invader's:
       an Australian brigade in Java is not fed by Indonesian cities. The line
       runs back through whatever neighbouring province its own nation holds,
       which is why an advance that outruns its captures goes hungry.
    */
    public SupplyStatus StatusForStackIn(ushort nation, int province)
    {
        if (_world.Provinces.Controller[province] == nation)
        {
            return EffectiveStatusOf(province);
        }

        int best = Unreachable;
        best = NearestFriendlyHop(_land.NeighboursOf(province), nation, best);
        best = NearestFriendlyHop(_sea.NeighboursOf(province), nation, best);

        if (best == Unreachable)
        {
            return SupplyStatus.CutOff;
        }

        return best + 1 <= Range ? SupplyStatus.Supplied : SupplyStatus.Low;
    }

    public float AttackMultiplierForStackIn(ushort nation, int province) =>
        StatusForStackIn(nation, province) switch
        {
            SupplyStatus.Low => LowAttack,
            SupplyStatus.CutOff => CutOffAttack,
            _ => 1f,
        };

    public float DefenceMultiplierForStackIn(ushort nation, int province) =>
        StatusForStackIn(nation, province) == SupplyStatus.CutOff ? CutOffDefence : 1f;

    private int NearestFriendlyHop(ReadOnlySpan<ushort> neighbours, ushort nation, int best)
    {
        foreach (ushort neighbour in neighbours)
        {
            if (_world.Provinces.Controller[neighbour] != nation)
            {
                continue;
            }

            int hops = _hops[neighbour];
            if (hops != Unreachable && (best == Unreachable || hops < best))
            {
                best = hops;
            }
        }

        return best;
    }

    public long GraceRemainingOf(int province)
    {
        if (_status[province] != SupplyStatus.CutOff)
        {
            return 0;
        }

        long elapsed = _world.Clock.Tick - _cutOffSince[province];
        return elapsed >= GraceTicks ? 0 : GraceTicks - elapsed;
    }

    public float AttackMultiplierFor(int province) => EffectiveStatusOf(province) switch
    {
        SupplyStatus.Low => LowAttack,
        SupplyStatus.CutOff => CutOffAttack,
        _ => 1f,
    };

    public float DefenceMultiplierFor(int province) =>
        EffectiveStatusOf(province) == SupplyStatus.CutOff ? CutOffDefence : 1f;

    public bool CanEntrench(int province) => EffectiveStatusOf(province) == SupplyStatus.Supplied;

    public bool AcceptsReinforcements(int province) =>
        EffectiveStatusOf(province) != SupplyStatus.CutOff;

    public float DailyAttritionFor(int province) =>
        EffectiveStatusOf(province) == SupplyStatus.CutOff ? CutOffDailyAttrition : 0f;

    public void ApplyDailyAttrition(Army army)
    {
        ArgumentNullException.ThrowIfNull(army);

        float rate = DailyAttritionFor(army.Province);
        if (rate <= 0f)
        {
            return;
        }

        foreach (UnitInstance unit in army.Units)
        {
            unit.ApplyDamage(unit.Class.MaxHitPoints * rate);
        }

        army.RemoveDestroyed();
    }

    public IEnumerable<int> CutOffProvincesOf(int nation)
    {
        for (int i = 0; i < _world.Provinces.Count; i++)
        {
            if (_world.Provinces.Controller[i] == nation && _status[i] == SupplyStatus.CutOff)
            {
                yield return i;
            }
        }
    }

    /* The flood is O(V+E) and the front does not move fast enough to change its
       answer hour by hour, so running it on the interval and on capture costs a
       fraction of what running it every tick would. */
    public void Tick()
    {
        if (IsDue)
        {
            RecomputeAll();
        }
    }

    public void RecomputeAll()
    {
        Flood(AllNations);
        Commit(AllNations);
        LastComputedTick = _world.Clock.Tick;
    }

    public void Recompute(int nation)
    {
        if (nation < 0 || nation >= _world.Nations.Count)
        {
            return;
        }

        Flood(nation);
        Commit(nation);
    }

    /* Supply only travels through ground one nation controls, so a province
       changing hands can only alter the two nations involved: no third party
       ever had a line running through it. */
    public void OnControlChanged(ushort previousController, ushort newController)
    {
        Recompute(previousController);

        if (newController != previousController)
        {
            Recompute(newController);
        }
    }

    private void Flood(int nation)
    {
        Array.Fill(_distance, Unreachable);
        _frontier.Clear();

        ProvinceStore provinces = _world.Provinces;
        int nations = _world.Nations.Count;

        for (int i = 0; i < provinces.Count; i++)
        {
            if (!provinces.IsCity[i])
            {
                continue;
            }

            ushort controller = provinces.Controller[i];
            if (controller >= nations || (nation != AllNations && controller != nation))
            {
                continue;
            }

            _distance[i] = 0;
            _frontier.Enqueue(i);
        }

        while (_frontier.Count > 0)
        {
            int current = _frontier.Dequeue();
            ushort controller = provinces.Controller[current];
            int next = _distance[current] + 1;

            Expand(_land.NeighboursOf(current), controller, next);
            Expand(_sea.NeighboursOf(current), controller, next);
        }
    }

    /* Seeding every nation's cities into one queue stays correct because a
       province belongs to exactly one controller: the filter below splits the
       graph into disjoint per-nation components, so no flood can leak across a
       border and shorten a rival's distance. */
    private void Expand(ReadOnlySpan<ushort> neighbours, ushort controller, int distance)
    {
        foreach (ushort neighbour in neighbours)
        {
            if (_distance[neighbour] != Unreachable
                || _world.Provinces.Controller[neighbour] != controller)
            {
                continue;
            }

            _distance[neighbour] = distance;
            _frontier.Enqueue(neighbour);
        }
    }

    private void Commit(int nation)
    {
        ProvinceStore provinces = _world.Provinces;

        for (int i = 0; i < provinces.Count; i++)
        {
            if (nation != AllNations && provinces.Controller[i] != nation)
            {
                continue;
            }

            int hops = _distance[i];
            _hops[i] = hops;

            Apply(i, hops switch
            {
                Unreachable => SupplyStatus.CutOff,
                _ => hops <= Range ? SupplyStatus.Supplied : SupplyStatus.Low,
            });
        }
    }

    private void Apply(int province, SupplyStatus status)
    {
        if (status == SupplyStatus.CutOff && _status[province] != SupplyStatus.CutOff)
        {
            _cutOffSince[province] = _world.Clock.Tick;
            _statusBeforeCutOff[province] = _status[province];
        }

        _status[province] = status;
    }
}
