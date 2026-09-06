namespace NationRise.Core.Time;

public enum GameSpeed : byte
{
    Paused = 0,
    Ambient = 1,
    Relaxed = 2,
    Normal = 3,
    Fast = 4,
    Blitz = 5,
}

/*
   Speed is expressed in real minutes per game day rather than a multiplier, so
   the pace stays legible: "five minutes a day" is something a player can plan
   an evening around, "4x" is not.
*/
public static class GameSpeedInfo
{
    private static readonly double[] MinutesPerDay = [0.0, 60.0, 15.0, 5.0, 2.5, 1.25];

    public static double MinutesPerGameDay(GameSpeed speed) => MinutesPerDay[(int)speed];

    public static double SecondsPerTick(GameSpeed speed) =>
        speed == GameSpeed.Paused
            ? double.PositiveInfinity
            : MinutesPerGameDay(speed) * 60.0 / GameDate.HoursPerDay;

    public static string Label(GameSpeed speed) => speed switch
    {
        GameSpeed.Paused => "Paused",
        GameSpeed.Ambient => "Ambient",
        GameSpeed.Relaxed => "Relaxed",
        GameSpeed.Normal => "Normal",
        GameSpeed.Fast => "Fast",
        _ => "Blitz",
    };

    public static GameSpeed Faster(GameSpeed speed) =>
        speed >= GameSpeed.Blitz ? GameSpeed.Blitz : speed + 1;

    public static GameSpeed Slower(GameSpeed speed) =>
        speed <= GameSpeed.Paused ? GameSpeed.Paused : speed - 1;
}
