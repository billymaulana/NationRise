using NationRise.Core.Buildings;
using NationRise.Core.Diplomacy;
using NationRise.Core.World;

namespace NationRise.Core.Economy;

/*
   Morale moves towards a target rather than being set directly, so every
   change has a delay the player can feel. Conquered ground recovers slowly,
   which is what makes a fast advance produce territory that produces nothing.
*/
public sealed class MoraleSystem(WorldState world, Relations relations, CityBuildings buildings)
{
    public const float HomelandTarget = 0.90f;
    public const float AnnexedTarget = 0.75f;
    public const float OccupiedTarget = 0.60f;
    public const float PlainProvinceTarget = 1.00f;

    /* An eighth of the gap per day: about a week to feel settled, a month to
       finish. Fast enough to reward holding ground, slow enough that conquest
       is not immediately profitable. */
    public const float ApproachRate = 0.125f;

    public const float WarPenaltyPerEnemy = 0.02f;
    public const float MaxWarPenalty = 0.25f;

    /*
       The shared shortage ramp. Attached, morale, combat, movement and
       production all read the same days-short figure, so a player shown one
       number is not contradicted by the next. Left unset there is no shortage
       penalty at all, the same way an unattached supply system leaves combat
       without supply modifiers.
    */
    public ShortageSystem? Shortage { get; set; }

    public void RunDay(Stockpile stockpile)
    {
        ArgumentNullException.ThrowIfNull(stockpile);

        var warPenalty = new float[world.Nations.Count];
        var shortagePenalty = new float[world.Nations.Count];

        for (int nation = 0; nation < world.Nations.Count; nation++)
        {
            int enemies = relations.EnemiesOf(nation).Count();
            warPenalty[nation] = MathF.Min(enemies * WarPenaltyPerEnemy, MaxWarPenalty);

            /* Running out of food or money hits morale everywhere at once,
               which is what turns a supply failure into a political problem
               rather than a rounding error. It arrives on a ramp so the
               problem is visible for days before it is decisive. */
            shortagePenalty[nation] = Shortage?.MoralePenaltyOf(nation) ?? 0f;
        }

        for (int province = 0; province < world.Provinces.Count; province++)
        {
            ushort nation = world.Provinces.Controller[province];
            if (nation == ProvinceStore.NoOwner || nation >= world.Nations.Count)
            {
                continue;
            }

            float target = TargetFor(province, nation);
            target -= warPenalty[nation];

            target -= shortagePenalty[nation];

            target += buildings.LevelOf(province, BuildingType.UndergroundBunkers) * 0.02f;
            target = Math.Clamp(target, 0.05f, 1.05f);

            float current = world.Provinces.Morale[province];
            world.Provinces.Morale[province] = current + (target - current) * ApproachRate;
        }
    }

    public float TargetFor(int province, ushort nation)
    {
        if (!world.Provinces.IsCity[province])
        {
            return PlainProvinceTarget;
        }

        if (world.Provinces.Owner[province] == nation)
        {
            return HomelandTarget;
        }

        return OccupiedTarget;
    }
}
