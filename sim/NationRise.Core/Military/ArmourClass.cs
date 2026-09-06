namespace NationRise.Core.Military;

/* Every unit has an attack and a defence rating against each of these, which
   is what makes composition matter: a tank column that meets anti-tank guns
   loses to the same numbers that would crush infantry. */
public enum ArmourClass : byte
{
    Infantry = 0,
    Armour = 1,
    UnarmouredVehicle = 2,
    Helicopter = 3,
    FixedWing = 4,
    Missile = 5,
    SurfaceShip = 6,
    Submarine = 7,
    Building = 8,
    Population = 9,
}

public static class ArmourClassInfo
{
    public const int Count = 10;
}
