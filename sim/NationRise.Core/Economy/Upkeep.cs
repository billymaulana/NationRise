using NationRise.Core.Buildings;
using NationRise.Core.Military;
using NationRise.Core.World;

namespace NationRise.Core.Economy;

/*
   What a standing army and a built-up country cost every day just to exist.

   Without this the economy has no sink at all: production is the only term, so
   stockpiles climb without limit, the market has nothing to arbitrate, the
   shortage rules can never fire, and the rate shown to the player can never be
   anything but positive. Every one of those was true before this existed.
*/
public static class UnitUpkeep
{
    /* Derived from the unit rather than tabulated per unit. A per-unit table
       is a second place to forget a number when a unit is added; a rule that
       reads Domain and armour cannot silently return zero for a new one. */
    public static int DailyCost(UnitClass unit, Resource resource)
    {
        ArgumentNullException.ThrowIfNull(unit);

        /* Bigger machines cost more to run, scaled off hit points because that
           is the one figure every class already declares honestly. */
        float bulk = unit.MaxHitPoints / 20f;

        return resource switch
        {
            Resource.Money => unit.Domain switch
            {
                Domain.Land => Round(70f * bulk),
                Domain.Sea => Round(140f * bulk),
                Domain.Air => Round(180f * bulk),
                _ => 0,
            },
            Resource.Food => unit.Domain == Domain.Land ? Round(50f * bulk) : Round(25f * bulk),
            Resource.Fuel => unit.Armour == ArmourClass.Infantry && unit.Domain == Domain.Land
                ? Round(20f * bulk)
                : Round(70f * bulk),
            Resource.Materials => unit.Domain == Domain.Land && unit.Armour == ArmourClass.Infantry
                ? 0
                : Round(12f * bulk),
            _ => 0,
        };
    }

    /* A building crew is paid whatever the building is, and the bill rises with
       the level rather than with what the level unlocks. */
    public static int DailyCost(BuildingType type, int level, Resource resource) =>
        resource == Resource.Money ? 100 * level : 0;

    private static int Round(float amount) => (int)MathF.Round(amount);
}

/*
   Charges the daily bill and reports what could not be paid. Shortfall is
   surfaced rather than absorbed: a nation that cannot feed its army should feel
   it, and the caller is the right place to decide how.
*/
public sealed class UpkeepSystem(WorldState world, Stockpile stockpile, CityBuildings buildings)
{
    private readonly long[] _shortfall = new long[world.Nations.Count * ResourceInfo.Count];
    private readonly long[] _bill = new long[world.Nations.Count * ResourceInfo.Count];

    /* The ramp that turns an unpaid bill into pressure, advanced from here
       because this is the only place that knows what went unpaid and it runs
       exactly once a day. Advancing it from two callers would double every
       shortage; advancing it from none is the state this replaced. */
    public ShortageSystem? Shortage { get; set; }

    public long ShortfallOf(int nation, Resource resource) =>
        _shortfall[nation * ResourceInfo.Count + (int)resource];

    /* What the last charged day actually cost. Recomputing it means walking
       every army and every city again, and the market needs it once per nation
       per good to size a buying quota against real use rather than against how
       much money happens to be lying around. */
    public long BillOf(int nation, Resource resource) =>
        _bill[nation * ResourceInfo.Count + (int)resource];

    public bool IsStarved(int nation) =>
        ShortfallOf(nation, Resource.Food) > 0 || ShortfallOf(nation, Resource.Money) > 0;

    public long DailyCostOf(int nation, Resource resource, IReadOnlyDictionary<int, Army> armies)
    {
        ArgumentNullException.ThrowIfNull(armies);

        long total = 0;

        foreach (Army army in armies.Values)
        {
            if (army.Nation != nation || army.IsDestroyed)
            {
                continue;
            }

            foreach (UnitInstance unit in army.Units)
            {
                total += UnitUpkeep.DailyCost(unit.Class, resource);
            }
        }

        ProvinceStore provinces = world.Provinces;
        for (int province = 0; province < provinces.Count; province++)
        {
            if (provinces.Controller[province] != nation || !provinces.IsCity[province])
            {
                continue;
            }

            foreach (BuildingType type in Enum.GetValues<BuildingType>())
            {
                int level = buildings.LevelOf(province, type);
                if (level > 0)
                {
                    total += UnitUpkeep.DailyCost(type, level, resource);
                }
            }
        }

        return total;
    }

    public void RunDay(IReadOnlyDictionary<int, Army> armies)
    {
        Array.Clear(_shortfall);
        Array.Clear(_bill);

        for (int nation = 0; nation < world.Nations.Count; nation++)
        {
            foreach (Resource resource in Enum.GetValues<Resource>())
            {
                long bill = DailyCostOf(nation, resource, armies);
                _bill[nation * ResourceInfo.Count + (int)resource] = bill;

                if (bill <= 0)
                {
                    continue;
                }

                if (stockpile.TrySpend(nation, resource, bill))
                {
                    continue;
                }

                /* Whatever is there is taken; the remainder is recorded as debt
                   for the day rather than pushing the stockpile negative, which
                   would make every later reading meaningless. */
                long held = stockpile.Get(nation, resource);
                if (held > 0)
                {
                    stockpile.TrySpend(nation, resource, held);
                }

                _shortfall[nation * ResourceInfo.Count + (int)resource] = bill - held;
            }
        }

        Shortage?.RunDay(stockpile, this);
    }
}
