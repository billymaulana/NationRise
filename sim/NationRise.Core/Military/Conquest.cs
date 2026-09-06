using NationRise.Core.Economy;
using NationRise.Core.World;

namespace NationRise.Core.Military;

public readonly record struct ConquestEvent(int Province, ushort From, ushort To, bool WasCity);

/*
   Taking ground, as opposed to winning a fight. Only infantry can hold a
   province: armour that outruns its infantry gains nothing on the map, which
   is what stops tank columns from flipping a country in a day.
*/
public sealed class Conquest(WorldState world)
{
    private readonly List<ConquestEvent> _events = [];

    public IReadOnlyList<ConquestEvent> RecentEvents => _events;

    public void ClearEvents() => _events.Clear();

    public static bool CanHoldGround(Army army)
    {
        foreach (UnitInstance unit in army.Units)
        {
            if (unit.Class.Armour == ArmourClass.Infantry)
            {
                return true;
            }
        }

        return false;
    }

    public bool TryCapture(Army army, IEnumerable<Army> defenders)
    {
        ArgumentNullException.ThrowIfNull(army);

        if (army.IsDestroyed || !CanHoldGround(army))
        {
            return false;
        }

        int province = army.Province;
        ushort current = world.Provinces.Controller[province];

        if (current == army.Nation)
        {
            return false;
        }

        foreach (Army defender in defenders)
        {
            if (defender.Province == province && defender.Nation == current && !defender.IsDestroyed)
            {
                return false;
            }
        }

        world.Provinces.Controller[province] = army.Nation;

        /* Morale collapses on capture and recovers slowly, which is why a fast
           advance produces territory that produces almost nothing. */
        world.Provinces.Morale[province] = 0.25f;

        _events.Add(new ConquestEvent(province, current, army.Nation, world.Provinces.IsCity[province]));
        return true;
    }

    public static ProvinceStatus StatusAfterCapture(bool isOriginalOwner) =>
        isOriginalOwner ? ProvinceStatus.Homeland : ProvinceStatus.Occupied;
}
