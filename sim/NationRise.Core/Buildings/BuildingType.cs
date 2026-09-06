namespace NationRise.Core.Buildings;

public enum BuildingType : byte
{
    ArmyBase = 0,
    ArmsIndustry = 1,
    AirBase = 2,
    NavalBase = 3,
    RecruitingOffice = 4,
    MilitaryHospital = 5,
    UndergroundBunkers = 6,
    SecretWeaponsLab = 7,
}

public static class BuildingInfo
{
    public const int Count = 8;
    public const int MaxLevel = 5;

    /* Slot pressure is what makes a city a set of decisions rather than a
       checklist: nine buildings exist, a city fits at most seven, so
       specialising is forced rather than encouraged. */
    public static int SlotsFor(float population) =>
        Math.Clamp(2 + (int)(population / 2f), 2, 7);

    public static string NameOf(BuildingType type) => type switch
    {
        BuildingType.ArmyBase => "Army Base",
        BuildingType.ArmsIndustry => "Arms Industry",
        BuildingType.AirBase => "Air Base",
        BuildingType.NavalBase => "Naval Base",
        BuildingType.RecruitingOffice => "Recruiting Office",
        BuildingType.MilitaryHospital => "Military Hospital",
        BuildingType.UndergroundBunkers => "Underground Bunkers",
        _ => "Secret Weapons Lab",
    };

    public static bool RequiresCoast(BuildingType type) => type == BuildingType.NavalBase;

    /* Output bonus from Arms Industry, matching the Conflict of Nations
       progression the economy research recorded. */
    public static float ProductionBonus(BuildingType type, int level) =>
        type == BuildingType.ArmsIndustry ? level * 0.10f : 0f;

    public static float ManpowerBonus(BuildingType type, int level) =>
        type == BuildingType.RecruitingOffice ? level * 0.05f : 0f;

    public static float MoraleBonus(BuildingType type, int level) => type switch
    {
        BuildingType.UndergroundBunkers => level switch
        {
            1 => 0.05f, 2 => 0.10f, 3 => 0.20f, 4 => 0.35f, _ => 0.50f,
        },
        _ => 0f,
    };
}
