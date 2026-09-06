using NationRise.Core.Diplomacy;
using NationRise.Core.Military;
using NationRise.Core.World;

namespace NationRise.Core.Ai;

public readonly record struct TargetChoice(int Province, float Value, string Reason);

/*
   Decides where an army should go once war is under way. Deciding to fight and
   deciding where to fight are separate problems: the first is diplomacy, this
   is operations, and conflating them produces armies that march at whatever
   enemy province happens to be first in the array.
*/
public sealed class WarPlanner(WorldState world, Relations relations, Data.ProvinceGraph land)
{
    public const float CityWeight = 40f;
    public const float UndefendedWeight = 25f;
    public const float DistancePenalty = 3f;
    public const float FrontlineWeight = 15f;

    public TargetChoice? ChooseTarget(Army army, IReadOnlyDictionary<int, Army> allArmies)
    {
        ArgumentNullException.ThrowIfNull(army);

        var garrisons = new Dictionary<int, int>();
        foreach (Army other in allArmies.Values)
        {
            if (other.IsDestroyed || other.Nation == army.Nation)
            {
                continue;
            }

            garrisons[other.Province] = garrisons.GetValueOrDefault(other.Province) + other.Count;
        }

        TargetChoice? best = null;
        float bestValue = float.NegativeInfinity;

        for (int province = 0; province < world.Provinces.Count; province++)
        {
            ushort owner = world.Provinces.Controller[province];
            if (owner == ProvinceStore.NoOwner || !relations.AtWar(army.Nation, owner))
            {
                continue;
            }

            float value = ValueOf(province, army.Province, garrisons, out string reason);
            if (value > bestValue)
            {
                bestValue = value;
                best = new TargetChoice(province, value, reason);
            }
        }

        return best;
    }

    private float ValueOf(int province, int from, Dictionary<int, int> garrisons, out string reason)
    {
        float value = 10f;
        reason = "enemy ground";

        if (world.Provinces.IsCity[province])
        {
            value += CityWeight + world.Provinces.Population[province] * 4f;
            reason = "enemy city";
        }

        int defenders = garrisons.GetValueOrDefault(province);
        if (defenders == 0)
        {
            value += UndefendedWeight;
            if (reason == "enemy ground")
            {
                reason = "undefended";
            }
        }
        else
        {
            value -= defenders * 6f;
        }

        /* Provinces bordering ground we already hold are worth more than a
           prize deep inside enemy territory: a front that advances together
           can be supplied, a lone spearhead cannot. */
        if (BordersOwnTerritory(province, world.Provinces.Controller[from]))
        {
            value += FrontlineWeight;
        }

        value -= ApproximateDistance(from, province) * DistancePenalty;
        return value;
    }

    private bool BordersOwnTerritory(int province, ushort nation)
    {
        foreach (ushort neighbour in land.NeighboursOf(province))
        {
            if (world.Provinces.Controller[neighbour] == nation)
            {
                return true;
            }
        }

        return false;
    }

    /* Breadth-first hop count, capped: a full path search for every candidate
       province would cost more than the decision is worth. */
    private int ApproximateDistance(int from, int to)
    {
        const int Cap = 8;

        var seen = new HashSet<int> { from };
        var frontier = new Queue<(int Province, int Depth)>();
        frontier.Enqueue((from, 0));

        while (frontier.Count > 0)
        {
            (int province, int depth) = frontier.Dequeue();
            if (province == to)
            {
                return depth;
            }

            if (depth >= Cap)
            {
                continue;
            }

            foreach (ushort neighbour in land.NeighboursOf(province))
            {
                if (seen.Add(neighbour))
                {
                    frontier.Enqueue((neighbour, depth + 1));
                }
            }
        }

        return Cap;
    }
}
