using NationRise.Core.World;

namespace NationRise.Core.Military;

/*
   The multiplication chain exactly as Combat applies it. Splitting the factors
   apart is the whole point: a player who sees 0.66 next to "forest" learns the
   terrain rule in one battle instead of ten.
*/
public readonly record struct StrengthBreakdown(
    float BaseRating,
    float Terrain,
    float StackPenalty,
    float HealthPenalty,
    float Total);

public readonly record struct BattleForecast(
    StrengthBreakdown Attacker,
    StrengthBreakdown Defender,
    int FastestTicks,
    int SlowestTicks,
    int AttackerLossesLow,
    int AttackerLossesHigh,
    int DefenderLossesLow,
    int DefenderLossesHigh,
    bool AttackerWinsBestCase,
    bool AttackerWinsWorstCase)
{
    public bool Decisive => AttackerWinsBestCase == AttackerWinsWorstCase;
}

/*
   Predicts a fight without rolling for it. The forecast is a range rather than
   a win percentage because the damage roll really is a range: quoting "80%" and
   then losing reads as a lie, quoting "12 to 18 tick" does not.
*/
public static class BattleEstimate
{
    public const int TickCeiling = 96;

    public static StrengthBreakdown Breakdown(Army army, Army opponent, Terrain terrain, bool attacking)
    {
        ArgumentNullException.ThrowIfNull(army);
        ArgumentNullException.ThrowIfNull(opponent);

        float rated = 0f;
        float weighted = 0f;

        foreach (ArmourClass armour in Enum.GetValues<ArmourClass>())
        {
            if (!Contains(opponent, armour))
            {
                continue;
            }

            foreach (UnitInstance unit in army.Units)
            {
                float rating = attacking
                    ? unit.Class.AttackAgainst(armour)
                    : unit.Class.DefenceAgainst(armour);

                rated += rating;
                weighted += rating * unit.HealthPenalty;
            }
        }

        float health = rated <= 0f ? 1f : weighted / rated;
        float terrainModifier = attacking ? Combat.TerrainAttackModifier(terrain) : 1f;
        float stack = Combat.StackPenalty(army.Count);

        return new StrengthBreakdown(
            rated,
            terrainModifier,
            stack,
            health,
            rated * terrainModifier * stack * health);
    }

    public static BattleForecast Forecast(Army attacker, Army defender, Terrain terrain)
    {
        StrengthBreakdown attack = Breakdown(attacker, defender, terrain, attacking: true);
        StrengthBreakdown defence = Breakdown(defender, attacker, terrain, attacking: false);

        Outcome best = Simulate(attacker, defender, terrain, attackerLuck: 1f + Combat.RandomSpread);
        Outcome worst = Simulate(attacker, defender, terrain, attackerLuck: 1f - Combat.RandomSpread);

        return new BattleForecast(
            attack,
            defence,
            Math.Min(best.Ticks, worst.Ticks),
            Math.Max(best.Ticks, worst.Ticks),
            Math.Min(best.AttackerLosses, worst.AttackerLosses),
            Math.Max(best.AttackerLosses, worst.AttackerLosses),
            Math.Min(best.DefenderLosses, worst.DefenderLosses),
            Math.Max(best.DefenderLosses, worst.DefenderLosses),
            best.AttackerWins,
            worst.AttackerWins);
    }

    private readonly record struct Outcome(int Ticks, int AttackerLosses, int DefenderLosses, bool AttackerWins);

    /*
       Runs the fight with the dice frozen at one end of their range. Strength is
       recomputed each tick from the surviving units, so the forecast captures the
       spiral where a losing side keeps losing faster.
    */
    private static Outcome Simulate(Army attacker, Army defender, Terrain terrain, float attackerLuck)
    {
        float defenderLuck = 2f - attackerLuck;

        Shadow[] attackers = Copy(attacker);
        Shadow[] defenders = Copy(defender);

        float attackTerrain = Combat.TerrainAttackModifier(terrain);

        int tick = 0;
        int aliveAttackers = attackers.Length;
        int aliveDefenders = defenders.Length;

        while (tick < TickCeiling && aliveAttackers > 0 && aliveDefenders > 0)
        {
            tick++;

            float toDefender = EffectiveStrength(attackers, defender, attacking: true)
                * attackTerrain * Combat.DamageScale * attackerLuck;
            float toAttacker = EffectiveStrength(defenders, attacker, attacking: false)
                * Combat.DamageScale * defenderLuck;

            Apply(defenders, toDefender);
            Apply(attackers, toAttacker);

            aliveAttackers = CountAlive(attackers);
            aliveDefenders = CountAlive(defenders);
        }

        return new Outcome(
            tick,
            attackers.Length - aliveAttackers,
            defenders.Length - aliveDefenders,
            aliveDefenders == 0 && aliveAttackers > 0);
    }

    private readonly record struct Shadow(UnitClass Class)
    {
        public float HitPoints { get; init; }
        public float HealthPenalty => 0.25f + 0.75f * (HitPoints / Class.MaxHitPoints);
    }

    private static Shadow[] Copy(Army army)
    {
        var copy = new Shadow[army.Count];
        for (int i = 0; i < army.Count; i++)
        {
            copy[i] = new Shadow(army.Units[i].Class) { HitPoints = army.Units[i].HitPoints };
        }

        return copy;
    }

    private static float EffectiveStrength(Shadow[] units, Army opponent, bool attacking)
    {
        float total = 0f;

        foreach (ArmourClass armour in Enum.GetValues<ArmourClass>())
        {
            if (!Contains(opponent, armour))
            {
                continue;
            }

            foreach (Shadow unit in units)
            {
                if (unit.HitPoints <= 0f)
                {
                    continue;
                }

                float rating = attacking
                    ? unit.Class.AttackAgainst(armour)
                    : unit.Class.DefenceAgainst(armour);

                total += rating * unit.HealthPenalty;
            }
        }

        return total * Combat.StackPenalty(CountAlive(units));
    }

    private static void Apply(Shadow[] units, float damage)
    {
        float totalWeight = 0f;
        foreach (Shadow unit in units)
        {
            if (unit.HitPoints > 0f)
            {
                totalWeight += UnitClass.EchelonWeight(unit.Class.Echelon);
            }
        }

        if (totalWeight <= 0f)
        {
            return;
        }

        for (int i = 0; i < units.Length; i++)
        {
            if (units[i].HitPoints <= 0f)
            {
                continue;
            }

            float share = UnitClass.EchelonWeight(units[i].Class.Echelon) / totalWeight;
            units[i] = units[i] with { HitPoints = MathF.Max(0f, units[i].HitPoints - damage * share) };
        }
    }

    private static int CountAlive(Shadow[] units)
    {
        int alive = 0;
        foreach (Shadow unit in units)
        {
            if (unit.HitPoints > 0f)
            {
                alive++;
            }
        }

        return alive;
    }

    private static bool Contains(Army army, ArmourClass armour)
    {
        foreach (UnitInstance unit in army.Units)
        {
            if (unit.Class.Armour == armour)
            {
                return true;
            }
        }

        return false;
    }
}
