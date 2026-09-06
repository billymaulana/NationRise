using NationRise.Core.World;

namespace NationRise.Core.Victory;

public enum CampaignLength : byte
{
    Short = 0,
    Standard = 1,
    Long = 2,
}

public readonly record struct CampaignPreset(CampaignLength Length, int Days, int WorldSharePercent)
{
    public static CampaignPreset Of(CampaignLength length) => length switch
    {
        CampaignLength.Short => new CampaignPreset(CampaignLength.Short, 30, 25),
        CampaignLength.Standard => new CampaignPreset(CampaignLength.Standard, 45, 30),
        CampaignLength.Long => new CampaignPreset(CampaignLength.Long, 60, 35),
        _ => throw new ArgumentOutOfRangeException(nameof(length)),
    };
}

/*
   Keeps score and nothing else. Reaching the threshold is recorded, never
   enforced: the campaign is allowed to run past its own victory condition, so
   no member here returns a verdict a caller is meant to halt on.
*/
public sealed class VictoryTracker
{
    private readonly WorldState _world;
    private readonly int[] _points;
    private readonly int[] _provinces;
    private readonly int[] _wonOnDay;

    public CampaignPreset Preset { get; }
    public int Player { get; }
    public int WorldPoints { get; }
    public int Threshold { get; }

    public VictoryTracker(WorldState world, int player, CampaignPreset preset)
    {
        ArgumentNullException.ThrowIfNull(world);
        ArgumentOutOfRangeException.ThrowIfNegative(player);
        ArgumentOutOfRangeException.ThrowIfGreaterThanOrEqual(player, world.Nations.Count);

        _world = world;
        _points = new int[world.Nations.Count];
        _provinces = new int[world.Nations.Count];
        _wonOnDay = new int[world.Nations.Count];

        Player = player;
        Preset = preset;

        /* Fixed the moment the game is created. Conquest moves points between
           nations without changing how many exist, so a threshold taken from
           the total cannot drift underneath the player mid-campaign, and the
           province count stays a pipeline parameter rather than a balance
           constant baked into the rules. */
        WorldPoints = TotalPointsOf(world);
        Threshold = WorldPoints * preset.WorldSharePercent / 100;

        Tally();
    }

    public static int TotalPointsOf(WorldState world)
    {
        ArgumentNullException.ThrowIfNull(world);

        ProvinceStore provinces = world.Provinces;
        int total = 0;

        for (int i = 0; i < provinces.Count; i++)
        {
            total += provinces.IsCity[i] ? (int)MathF.Round(provinces.Population[i]) : 1;
        }

        return total;
    }

    public int PointsOf(int nation)
    {
        Tally();
        return _points[Checked(nation)];
    }

    public int PlayerPoints => PointsOf(Player);

    /* Uncapped on purpose: a player who keeps conquering after the threshold
       should see the number keep climbing rather than sit at a finished bar. */
    public int ProgressPercentOf(int nation) =>
        Threshold <= 0 ? 0 : PointsOf(nation) * 100 / Threshold;

    public int PlayerProgressPercent => ProgressPercentOf(Player);

    public bool HasReachedThreshold(int nation) => Threshold > 0 && PointsOf(nation) >= Threshold;

    public int ProvinceCountOf(int nation)
    {
        Tally();
        return _provinces[Checked(nation)];
    }

    public bool IsEliminated(int nation) => ProvinceCountOf(nation) == 0;

    public bool HasLost => IsEliminated(Player);

    public int? WonDayOf(int nation)
    {
        int day = _wonOnDay[Checked(nation)];
        return day == 0 ? null : day;
    }

    public int? WonOnDay => WonDayOf(Player);

    public bool HasWon => WonOnDay is not null;

    public (int Nation, int Points) Leader
    {
        get
        {
            Tally();

            int best = -1;
            for (int nation = 0; nation < _points.Length; nation++)
            {
                if (best < 0 || _points[nation] > _points[best])
                {
                    best = nation;
                }
            }

            return best < 0 ? (-1, 0) : (best, _points[best]);
        }
    }

    public IReadOnlyList<(int Nation, int Points)> Leaderboard(int top)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(top);
        Tally();

        var ranked = new List<(int Nation, int Points)>(_points.Length);
        for (int nation = 0; nation < _points.Length; nation++)
        {
            if (_points[nation] > 0)
            {
                ranked.Add((nation, _points[nation]));
            }
        }

        /* Ties break on the nation index so two runs of the same save produce
           the same board. */
        ranked.Sort(static (a, b) => a.Points == b.Points ? a.Nation - b.Nation : b.Points - a.Points);

        return ranked.Count <= top ? ranked : ranked.GetRange(0, top);
    }

    public IReadOnlyList<int> EliminatedNations()
    {
        Tally();

        var gone = new List<int>();
        for (int nation = 0; nation < _provinces.Length; nation++)
        {
            if (_provinces[nation] == 0)
            {
                gone.Add(nation);
            }
        }

        return gone;
    }

    public void Tick()
    {
        Tally();

        if (Threshold <= 0)
        {
            return;
        }

        int day = _world.Clock.Date.Day;

        for (int nation = 0; nation < _points.Length; nation++)
        {
            if (_wonOnDay[nation] == 0 && _points[nation] >= Threshold)
            {
                _wonOnDay[nation] = day;
            }
        }
    }

    private int Checked(int nation)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(nation);
        ArgumentOutOfRangeException.ThrowIfGreaterThanOrEqual(nation, _points.Length);
        return nation;
    }

    private void Tally()
    {
        Array.Clear(_points);
        Array.Clear(_provinces);

        ProvinceStore provinces = _world.Provinces;

        for (int i = 0; i < provinces.Count; i++)
        {
            ushort controller = provinces.Controller[i];

            /* NoOwner sits past the end of the nation table, so a single bound
               check covers both an unclaimed province and a corrupt index. */
            if (controller >= _points.Length)
            {
                continue;
            }

            _points[controller] += provinces.IsCity[i] ? (int)MathF.Round(provinces.Population[i]) : 1;
            _provinces[controller]++;
        }
    }
}
