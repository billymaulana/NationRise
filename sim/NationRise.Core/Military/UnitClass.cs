namespace NationRise.Core.Military;

public enum Domain : byte
{
    Land = 0,
    Air = 1,
    Sea = 2,
}

/*
   A unit type as the player sees it on a card. Ratings are stored per armour
   class in two flat arrays so combat can index them without branching.
*/
public sealed class UnitClass
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required Domain Domain { get; init; }
    public required ArmourClass Armour { get; init; }
    public required float MaxHitPoints { get; init; }
    public required float Speed { get; init; }

    /* Echelon decides how much incoming damage a unit soaks: front-line units
       take three times what rear units do, which is what stops artillery from
       dying first in a mixed stack. */
    public required int Echelon { get; init; }

    public required float[] Attack { get; init; }
    public required float[] Defence { get; init; }

    public float AttackAgainst(ArmourClass target) => Attack[(int)target];

    public float DefenceAgainst(ArmourClass attacker) => Defence[(int)attacker];

    public static float EchelonWeight(int echelon) => echelon switch
    {
        1 => 3f,
        2 => 2f,
        _ => 1f,
    };
}
