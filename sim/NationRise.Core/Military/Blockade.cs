using NationRise.Core.Data;
using NationRise.Core.Diplomacy;
using NationRise.Core.World;

namespace NationRise.Core.Military;

public readonly record struct BlockadeReport(int Province, ushort Blockader, ushort Victim, int FleetStrength);

/*
   Fleets sitting on a coastal province's sea links cut it off from the world.
   On an archipelago this is the only encirclement that exists: the sea graph
   is dense enough that no single land province is a chokepoint, so a siege of
   Indonesia has to be fought at sea or not at all.
*/
public sealed class Blockade(WorldState world, Relations relations, ProvinceGraph sea)
{
    /* A blockading fleet must outweigh whatever defends the crossing, or a
       single patrol boat could strangle a coastline. */
    public const float StrengthRatio = 2.0f;

    public const float ProductionPenalty = 0.50f;
    public const float MoralePenaltyPerDay = 0.03f;
    public const int SiegeProgressPerDay = 3;

    private readonly bool[] _blockaded = new bool[world.Provinces.Count];
    private readonly ushort[] _blockader = new ushort[world.Provinces.Count];
    private readonly List<BlockadeReport> _reports = [];

    public IReadOnlyList<BlockadeReport> Reports => _reports;

    public bool IsBlockaded(int province) => _blockaded[province];

    public ushort BlockaderOf(int province) => _blockader[province];

    public float ProductionMultiplierFor(int province) =>
        _blockaded[province] ? 1f - ProductionPenalty : 1f;

    /* Coastal means it has a sea crossing at all. An inland province cannot be
       blockaded no matter how strong the fleet, which is why holding the
       interior is worth something on an archipelago. */
    public bool IsCoastal(int province) => sea.NeighboursOf(province).Length > 0;

    public void Recompute(IReadOnlyDictionary<int, Army> armies)
    {
        Array.Clear(_blockaded);
        Array.Fill(_blockader, ProvinceStore.NoOwner);
        _reports.Clear();

        var fleetsByProvince = new Dictionary<int, Dictionary<ushort, float>>();

        foreach (Army army in armies.Values)
        {
            if (army.IsDestroyed || !CarriesFleet(army))
            {
                continue;
            }

            if (!fleetsByProvince.TryGetValue(army.Province, out Dictionary<ushort, float>? byNation))
            {
                byNation = [];
                fleetsByProvince[army.Province] = byNation;
            }

            byNation[army.Nation] = byNation.GetValueOrDefault(army.Nation) + army.HitPoints;
        }

        for (int province = 0; province < world.Provinces.Count; province++)
        {
            if (!IsCoastal(province))
            {
                continue;
            }

            ushort owner = world.Provinces.Controller[province];
            if (owner == ProvinceStore.NoOwner)
            {
                continue;
            }

            EvaluateCrossings(province, owner, fleetsByProvince);
        }
    }

    private void EvaluateCrossings(
        int province,
        ushort owner,
        Dictionary<int, Dictionary<ushort, float>> fleetsByProvince)
    {
        var hostile = new Dictionary<ushort, float>();
        float friendly = 0f;

        foreach (ushort crossing in sea.NeighboursOf(province))
        {
            if (!fleetsByProvince.TryGetValue(crossing, out Dictionary<ushort, float>? byNation))
            {
                continue;
            }

            foreach ((ushort nation, float strength) in byNation)
            {
                if (nation == owner)
                {
                    friendly += strength;
                }
                else if (relations.AtWar(nation, owner))
                {
                    hostile[nation] = hostile.GetValueOrDefault(nation) + strength;
                }
            }
        }

        if (hostile.Count == 0)
        {
            return;
        }

        ushort strongest = 0;
        float best = 0f;
        foreach ((ushort nation, float strength) in hostile)
        {
            if (strength > best)
            {
                best = strength;
                strongest = nation;
            }
        }

        if (best < MathF.Max(friendly, 1f) * StrengthRatio)
        {
            return;
        }

        _blockaded[province] = true;
        _blockader[province] = strongest;
        _reports.Add(new BlockadeReport(province, strongest, owner, (int)best));
    }

    private static bool CarriesFleet(Army army)
    {
        foreach (UnitInstance unit in army.Units)
        {
            if (unit.Class.Domain == Domain.Sea)
            {
                return true;
            }
        }

        return false;
    }

    public void ApplyDailyEffects()
    {
        for (int province = 0; province < world.Provinces.Count; province++)
        {
            if (_blockaded[province])
            {
                world.Provinces.Morale[province] =
                    MathF.Max(0.05f, world.Provinces.Morale[province] - MoralePenaltyPerDay);
            }
        }
    }

    public int BlockadedCountOf(ushort nation)
    {
        int count = 0;
        for (int province = 0; province < world.Provinces.Count; province++)
        {
            if (_blockaded[province] && world.Provinces.Controller[province] == nation)
            {
                count++;
            }
        }

        return count;
    }
}
