namespace NationRise.Core.Military;

/*
   Starting roster with values taken from the unit research. Kept in code for
   now because the numbers are still moving; once they settle this becomes a
   data file the pipeline emits like everything else.
*/
public static class UnitCatalogue
{
    private static float[] Ratings(
        float infantry = 0, float armour = 0, float vehicle = 0, float helicopter = 0,
        float fixedWing = 0, float missile = 0, float ship = 0, float submarine = 0,
        float building = 0, float population = 0)
        => [infantry, armour, vehicle, helicopter, fixedWing, missile, ship, submarine, building, population];

    public static readonly UnitClass MotorizedInfantry = new()
    {
        Id = "motorized_infantry",
        Name = "Motorized Infantry",
        Domain = Domain.Land,
        Armour = ArmourClass.Infantry,
        MaxHitPoints = 15f,
        Speed = 0.90f,
        Echelon = 1,
        Attack = Ratings(infantry: 3.0f, armour: 2.0f, vehicle: 3.0f, building: 0.1f, population: 2.0f),
        Defence = Ratings(infantry: 3.8f, armour: 2.5f, vehicle: 3.8f, helicopter: 0.6f, fixedWing: 0.3f),
    };

    public static readonly UnitClass MechanizedInfantry = new()
    {
        Id = "mechanized_infantry",
        Name = "Mechanized Infantry",
        Domain = Domain.Land,
        Armour = ArmourClass.Armour,
        MaxHitPoints = 25f,
        Speed = 1.10f,
        Echelon = 1,
        Attack = Ratings(infantry: 3.0f, armour: 5.0f, vehicle: 5.0f, building: 0.2f, population: 1.5f),
        Defence = Ratings(infantry: 3.8f, armour: 6.3f, vehicle: 6.3f, helicopter: 0.9f, fixedWing: 0.4f),
    };

    public static readonly UnitClass MainBattleTank = new()
    {
        Id = "main_battle_tank",
        Name = "Main Battle Tank",
        Domain = Domain.Land,
        Armour = ArmourClass.Armour,
        MaxHitPoints = 45f,
        Speed = 1.20f,
        Echelon = 1,
        Attack = Ratings(infantry: 9.0f, armour: 8.0f, vehicle: 9.0f, building: 0.5f, population: 1.0f),
        Defence = Ratings(infantry: 9.0f, armour: 8.0f, vehicle: 9.0f, helicopter: 1.0f, fixedWing: 0.5f),
    };

    public static readonly UnitClass TowedArtillery = new()
    {
        Id = "towed_artillery",
        Name = "Towed Artillery",
        Domain = Domain.Land,
        Armour = ArmourClass.UnarmouredVehicle,
        MaxHitPoints = 12f,
        Speed = 0.60f,
        Echelon = 3,
        Attack = Ratings(infantry: 7.0f, armour: 4.0f, vehicle: 7.0f, building: 3.0f, population: 4.0f),
        Defence = Ratings(infantry: 1.5f, armour: 1.0f, vehicle: 1.5f),
    };

    public static readonly UnitClass NavalInfantry = new()
    {
        Id = "naval_infantry",
        Name = "Naval Infantry",
        Domain = Domain.Land,
        Armour = ArmourClass.Infantry,
        MaxHitPoints = 19f,
        Speed = 0.95f,
        Echelon = 1,
        Attack = Ratings(infantry: 6.0f, armour: 3.0f, vehicle: 6.0f, building: 0.2f, population: 2.0f),
        Defence = Ratings(infantry: 5.0f, armour: 3.0f, vehicle: 5.0f, helicopter: 0.8f, fixedWing: 0.4f),
    };

    public static readonly UnitClass Corvette = new()
    {
        Id = "corvette",
        Name = "Corvette",
        Domain = Domain.Sea,
        Armour = ArmourClass.SurfaceShip,
        MaxHitPoints = 30f,
        Speed = 2.20f,
        Echelon = 1,
        Attack = Ratings(ship: 6.0f, submarine: 4.0f, infantry: 2.0f, building: 1.0f),
        Defence = Ratings(ship: 6.0f, submarine: 3.0f, fixedWing: 2.5f, missile: 1.5f),
    };

    public static readonly UnitClass Destroyer = new()
    {
        Id = "destroyer",
        Name = "Destroyer",
        Domain = Domain.Sea,
        Armour = ArmourClass.SurfaceShip,
        MaxHitPoints = 45f,
        Speed = 2.60f,
        Echelon = 1,
        Attack = Ratings(ship: 9.0f, submarine: 7.0f, infantry: 3.0f, building: 2.0f),
        Defence = Ratings(ship: 9.0f, submarine: 6.0f, fixedWing: 4.0f, missile: 3.0f),
    };

    public static readonly IReadOnlyList<UnitClass> All =
    [
        MotorizedInfantry, MechanizedInfantry, MainBattleTank, TowedArtillery, NavalInfantry,
        Corvette, Destroyer,
    ];

    public static UnitClass ById(string id) =>
        All.FirstOrDefault(u => u.Id == id)
        ?? throw new KeyNotFoundException($"Unknown unit class '{id}'.");
}
