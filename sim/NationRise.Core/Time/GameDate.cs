namespace NationRise.Core.Time;

public readonly record struct GameDate(int Day, int Hour)
{
    public const int HoursPerDay = 24;

    public static GameDate FromTick(long tick)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(tick);
        return new GameDate((int)(tick / HoursPerDay) + 1, (int)(tick % HoursPerDay));
    }

    public long ToTick() => ((long)Day - 1) * HoursPerDay + Hour;

    public override string ToString() => $"Day {Day}, {Hour:00}:00";
}
