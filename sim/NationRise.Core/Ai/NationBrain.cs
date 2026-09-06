using NationRise.Core.Determinism;
using NationRise.Core.Diplomacy;
using NationRise.Core.World;

namespace NationRise.Core.Ai;

/*
   One nation's strategic reasoning. Runs on a stagger so 247 nations never
   think on the same tick, and every conclusion carries the considerations
   that produced it so the player can open any of them.
*/
public sealed class NationBrain(
    WorldState world,
    Relations relations,
    Momentum momentum,
    DeterministicRandom random)
{
    private readonly Archetype[] _archetype = new Archetype[world.Nations.Count];
    private readonly int[] _provinceCount = new int[world.Nations.Count];
    private readonly List<Decision> _lastDecisions = [];

    public IReadOnlyList<Decision> LastDecisions => _lastDecisions;

    public Archetype ArchetypeOf(int nation) => _archetype[nation];

    /* Sixty per cent of personality comes from the nation's own shape, forty
       per cent from the seed, so Russia is usually but not always aggressive
       and no two campaigns line up exactly. */
    public void AssignArchetypes()
    {
        CountProvinces();

        for (int nation = 0; nation < world.Nations.Count; nation++)
        {
            _archetype[nation] = random.NextDouble() < 0.40
                ? (Archetype)random.NextInt(5)
                : FromShape(nation);
        }
    }

    private Archetype FromShape(int nation)
    {
        int provinces = _provinceCount[nation];

        if (provinces >= 40)
        {
            return Archetype.Expansionist;
        }

        if (provinces <= 4)
        {
            return Archetype.Defender;
        }

        return provinces >= 15 ? Archetype.Opportunist : Archetype.Trader;
    }

    private void CountProvinces()
    {
        Array.Clear(_provinceCount);

        for (int i = 0; i < world.Provinces.Count; i++)
        {
            ushort owner = world.Provinces.Controller[i];
            if (owner != ProvinceStore.NoOwner && owner < _provinceCount.Length)
            {
                _provinceCount[owner]++;
            }
        }
    }

    public void Think(int nation, long tick)
    {
        _lastDecisions.Clear();

        if (momentum.IsLocked(nation, DecisionKind.DeclareWar, tick))
        {
            return;
        }

        CountProvinces();

        Decision? best = null;
        float bestScore = float.NegativeInfinity;

        foreach (int other in Neighbours(nation))
        {
            if (other == nation || relations.AtWar(nation, other))
            {
                continue;
            }

            Decision decision = ScoreWar(nation, other);
            float score = momentum.AdjustedScore(nation, DecisionKind.DeclareWar, decision);

            if (score > bestScore)
            {
                bestScore = score;
                best = decision;
            }
        }

        if (best is null)
        {
            return;
        }

        _lastDecisions.Add(best);

        if (bestScore >= Momentum.EntryThresholdFor(DecisionKind.DeclareWar))
        {
            relations.Set(nation, best.Subject, Relation.War);
            momentum.Commit(nation, DecisionKind.DeclareWar, best.Subject, tick);
        }
    }

    private Decision ScoreWar(int nation, int target)
    {
        ArchetypeWeights weights = ArchetypeWeights.For(_archetype[nation]);

        float mine = _provinceCount[nation];
        float theirs = MathF.Max(_provinceCount[target], 1f);
        float ratio = mine / theirs;

        /* Strength ratio dominates: attacking someone stronger has to be a
           deliberate act of desperation, not an accident of weighting. */
        float strength = Math.Clamp((ratio - 1f) * 40f, -60f, 60f);
        float size = Math.Clamp(theirs * 1.5f, 0f, 30f);
        float claims = ClaimPressure(nation, target) * 25f;
        float busy = relations.EnemiesOf(target).Any() ? 20f : 0f;

        return new Decision
        {
            Kind = DecisionKind.DeclareWar,
            Subject = target,
            Considerations =
            [
                new("relative strength", strength, weights.RiskTolerance),
                new("territory on offer", size, weights.WarAppetite),
                new("unfulfilled claims", claims, weights.WarAppetite),
                new("target already at war", busy, weights.OpportunismOnWeakness),
                new("cost of war", -25f, weights.EconomicFocus),
            ],
        };
    }

    private float ClaimPressure(int nation, int target)
    {
        int claimed = 0;

        for (int i = 0; i < world.Provinces.Count; i++)
        {
            if (world.Provinces.Controller[i] != target)
            {
                continue;
            }

            if (world.Provinces.ClaimsOf(i).Contains((ushort)nation))
            {
                claimed++;
            }
        }

        return MathF.Min(claimed, 4f);
    }

    /* Collected into a list rather than yielded: a span cannot cross a yield
       boundary, and the neighbour set is small enough that it does not matter. */
    private List<int> Neighbours(int nation)
    {
        var found = new List<int>();
        var seen = new HashSet<int>();

        if (Graph is null)
        {
            return found;
        }

        for (int i = 0; i < world.Provinces.Count; i++)
        {
            if (world.Provinces.Controller[i] != nation)
            {
                continue;
            }

            foreach (ushort next in Graph.NeighboursOf(i))
            {
                ushort owner = world.Provinces.Controller[next];
                if (owner != ProvinceStore.NoOwner && owner != nation && seen.Add(owner))
                {
                    found.Add(owner);
                }
            }
        }

        return found;
    }

    public Data.ProvinceGraph? Graph { get; set; }
}
