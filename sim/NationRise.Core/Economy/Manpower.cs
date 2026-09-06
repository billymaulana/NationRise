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
    public static float FractionFor(MobilisationLevel level) => level switch
    {
        MobilisationLevel.Peace => 0.015f,
        MobilisationLevel.Partial => 0.05f,
        _ => 0.10f,
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

    public void RunDay(Stockpile stockpile)
    {
        for (int nation = 0; nation < world.Nations.Count; nation++)
        {
            float capacity = CapacityOf(nation);
            long held = stockpile.Get(nation, Resource.Manpower);
            long missing = (long)capacity - held;

            if (missing > 0)
            {
                stockpile.Add(nation, Resource.Manpower, (long)(missing * 0.02f) + 1);
            }
        }
    }
}
