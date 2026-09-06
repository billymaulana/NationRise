using NationRise.Core.Diplomacy;
using NationRise.Core.World;

namespace NationRise.Core.Military;

/*
   How large a standing army a nation intends to keep.

   The rule this replaces raised troops only for nations that already had an
   enemy, so the great majority of the world fielded nothing at all: 247 nations
   between them held 400 stacks, and the daily upkeep those forces owed was an
   eighth of what the same nations produced. An economy with no army to pay for
   has no scarcity in it, and without scarcity the market, the shortage ramp and
   the blockade are all machinery with nothing to act on.

   Peacetime forces are therefore the default rather than the exception, sized
   off the ground a nation holds, and a war raises the intent rather than
   creating it.
*/
public sealed class ArmyPolicy(WorldState world, Relations relations)
{
    /* Even a one-city state keeps something. */
    public const int Standing = 2;

    /* Conflict of Nations gives a mid-sized nation on the order of two dozen
       units across seven or eight cities early in a campaign, which is where
       these come from rather than from taste. */
    public const int PerCity = 3;
    public const int PerTenProvinces = 2;

    public const float WarAppetite = 1.7f;
    public const int Ceiling = 60;

    public int TargetFor(int nation)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(nation);

        int cities = 0;
        int provinces = 0;

        ProvinceStore store = world.Provinces;
        for (int i = 0; i < store.Count; i++)
        {
            if (store.Controller[i] != nation)
            {
                continue;
            }

            provinces++;
            if (store.IsCity[i])
            {
                cities++;
            }
        }

        if (provinces == 0)
        {
            return 0;
        }

        int target = Standing + cities * PerCity + provinces * PerTenProvinces / 10;

        if (relations.EnemiesOf(nation).Any())
        {
            target = (int)(target * WarAppetite);
        }

        return Math.Min(target, Ceiling);
    }

    /* Counted in units rather than stacks: a stack is a grouping the player
       chooses, and paying upkeep by the stack would reward splitting. */
    public bool WantsMore(int nation, int unitsHeld) => unitsHeld < TargetFor(nation);
}
