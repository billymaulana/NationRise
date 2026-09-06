using NationRise.Core.Determinism;
using NationRise.Core.World;

namespace NationRise.Core.Military;

public readonly record struct CombatResult(
    float DamageToAttacker,
    float DamageToDefender,
    bool AttackerDestroyed,
    bool DefenderDestroyed);

/*
   One hour of fighting. Both sides deal damage simultaneously: the attacker
   uses its attack ratings, the defender its defence ratings, which is why a
   dug-in infantry line beats the same numbers attacking across open ground.
*/
public sealed class Combat(DeterministicRandom random)
{
    public const float DamageScale = 0.35f;
    public const float RandomSpread = 0.15f;

    /* Land stacks fight without penalty up to ten units; beyond that the
       logarithmic term makes doom-stacking actively worse than splitting. */
    public const int MaxStackWithoutPenalty = 10;

    /* An opposed landing fights at half strength until the beachhead is two days
       old. This is what stops an archipelago from being crossed as freely as a
       plain, and it is why sea control is worth paying for. */
    public const float LandingPenalty = 0.5f;
    public const int LandingWindowTicks = 48;

    /* The unset sentinel is checked before subtracting: long.MaxValue minus
       long.MinValue wraps negative and would penalise every army that never
       went near a boat. */
    public static float LandingModifier(Army army, long tick) =>
        army.LandedOnTick != long.MinValue && tick - army.LandedOnTick < LandingWindowTicks
            ? LandingPenalty
            : 1f;

    public static float StackPenalty(int size) => size <= MaxStackWithoutPenalty
        ? 1f
        : MathF.Max(0.30f, 1f - 0.56f * MathF.Log(size / (float)MaxStackWithoutPenalty));

    public static float TerrainAttackModifier(Terrain terrain) =>
        terrain.FavoursDefence() ? 0.75f : 1f;

    public float StrengthOf(Army army, ArmourClass target, Terrain terrain, bool attacking)
    {
        float total = 0f;

        foreach (UnitInstance unit in army.Units)
        {
            float rating = attacking
                ? unit.Class.AttackAgainst(target)
                : unit.Class.DefenceAgainst(target);

            total += rating * unit.HealthPenalty;
        }

        float terrainModifier = attacking ? TerrainAttackModifier(terrain) : 1f;
        return total * terrainModifier * StackPenalty(army.Count);
    }

    public CombatResult ResolveHour(Army attacker, Army defender, Terrain terrain, long tick = long.MaxValue)
    {
        ArgumentNullException.ThrowIfNull(attacker);
        ArgumentNullException.ThrowIfNull(defender);

        float toDefender = 0f;
        float toAttacker = 0f;

        foreach (ArmourClass armour in Enum.GetValues<ArmourClass>())
        {
            if (!PresentIn(defender, armour))
            {
                continue;
            }

            toDefender += StrengthOf(attacker, armour, terrain, attacking: true);
        }

        foreach (ArmourClass armour in Enum.GetValues<ArmourClass>())
        {
            if (!PresentIn(attacker, armour))
            {
                continue;
            }

            toAttacker += StrengthOf(defender, armour, terrain, attacking: false);
        }

        toDefender = Roll(toDefender * LandingModifier(attacker, tick));
        toAttacker = Roll(toAttacker);

        Distribute(defender, toDefender);
        Distribute(attacker, toAttacker);

        attacker.RemoveDestroyed();
        defender.RemoveDestroyed();

        return new CombatResult(toAttacker, toDefender, attacker.IsDestroyed, defender.IsDestroyed);
    }

    private static bool PresentIn(Army army, ArmourClass armour)
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

    private float Roll(float strength)
    {
        float variation = 1f + (float)((random.NextDouble() * 2.0 - 1.0) * RandomSpread);
        return strength * DamageScale * variation;
    }

    /* Damage lands on echelons by weight, so front-line units absorb it before
       artillery in the rear does. */
    private static void Distribute(Army army, float damage)
    {
        if (army.Count == 0 || damage <= 0f)
        {
            return;
        }

        float totalWeight = 0f;
        foreach (UnitInstance unit in army.Units)
        {
            totalWeight += UnitClass.EchelonWeight(unit.Class.Echelon);
        }

        if (totalWeight <= 0f)
        {
            return;
        }

        foreach (UnitInstance unit in army.Units)
        {
            float share = UnitClass.EchelonWeight(unit.Class.Echelon) / totalWeight;
            unit.ApplyDamage(damage * share);
        }
    }
}
