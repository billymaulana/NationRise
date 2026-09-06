using NationRise.Core.World;

namespace NationRise.Core.Economy;

public enum MobilisationLevel : byte
{
    Peace = 0,
    Partial = 1,
    Total = 2,
}

/*
   Manpower is drawn from population rather than produced by a resource slot,
   and how hard a nation draws on it is a standing choice with a cost. Total
   mobilisation fields armies a peacetime economy cannot, and pays for it in
   money and morale every day it stays switched on.
*/
public static class ManpowerInfo
{
    /*
       The share of a nation's people it can have under arms.

       These were an order of magnitude too small. A unit costs 850 manpower to
       raise, and at the old peacetime share Indonesia's ceiling came to 1,440 —
       not quite two formations, for a country of ninety-six population. No
       nation in the world could keep a standing army, and across a measured
       ninety-day run not one unit was mobilised anywhere.

       Conflict of Nations pays Indonesia about 1,464 manpower a day at the same
       size, so a ceiling near that figure was really a day's income mistaken
       for a lifetime's. At these shares a peacetime Indonesia can hold about
       seventeen formations and a fully mobilised one about forty-five, which is
       the scale the reference fields.
    */
    public static float FractionFor(MobilisationLevel level) => level switch
    {
        MobilisationLevel.Peace => 0.15f,
        MobilisationLevel.Partial => 0.25f,
        _ => 0.40f,
    };

    public static float MoneyPenalty(MobilisationLevel level) => level switch
    {
        MobilisationLevel.Peace => 0f,
        MobilisationLevel.Partial => 0.05f,
        _ => 0.15f,
    };

    public static float MoralePenalty(MobilisationLevel level) => level switch
    {
        MobilisationLevel.Peace => 0f,
        MobilisationLevel.Partial => 0.05f,
        _ => 0.10f,
    };

    public static string Label(MobilisationLevel level) => level switch
    {
        MobilisationLevel.Peace => "Peacetime",
        MobilisationLevel.Partial => "Partial mobilisation",
        _ => "Total mobilisation",
    };
}

public sealed class ManpowerPool(WorldState world)
{
    private readonly MobilisationLevel[] _level = new MobilisationLevel[world.Nations.Count];

    public MobilisationLevel LevelOf(int nation) => _level[nation];

    public void SetLevel(int nation, MobilisationLevel level) => _level[nation] = level;

    /* The ceiling a nation could reach, not what it holds: the pool refills
       towards this every day, so losses take time to replace even when the
       population is there. */
    public float CapacityOf(int nation)
    {
        float population = 0f;

        for (int i = 0; i < world.Provinces.Count; i++)
        {
            if (world.Provinces.Controller[i] != nation)
            {
                continue;
            }

            float share = world.Provinces.Owner[i] == nation ? 1.0f : 0.25f;
            population += world.Provinces.Population[i] * share;
        }

        return population * 1000f * ManpowerInfo.FractionFor(_level[nation]);
    }

    public const float DailyRefillFraction = 0.02f;

    /* What RunDay would add, without adding it. Manpower does not come from the
       economy tick like every other resource, so a display that asks the
       economy for it reports a flat zero and quietly tells the player their
       reserves are static. */
    public long DailyRegenOf(int nation, Stockpile stockpile)
    {
        ArgumentNullException.ThrowIfNull(stockpile);

        long missing = (long)CapacityOf(nation) - stockpile.Get(nation, Resource.Manpower);
        return missing > 0 ? (long)(missing * DailyRefillFraction) + 1 : 0;
    }

    public void RunDay(Stockpile stockpile)
    {
        for (int nation = 0; nation < world.Nations.Count; nation++)
        {
            long gain = DailyRegenOf(nation, stockpile);
            if (gain > 0)
            {
                stockpile.Add(nation, Resource.Manpower, gain);
            }
        }
    }
}
