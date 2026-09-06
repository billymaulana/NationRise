namespace NationRise.Core.Time;

public sealed class GameClock
{
    public long Tick { get; private set; }

    public GameDate Date => GameDate.FromTick(Tick);

    public bool IsDayBoundary => Tick % GameDate.HoursPerDay == 0;

    public void Advance() => Tick++;

    public void AdvanceTo(long tick)
    {
        if (tick < Tick)
        {
            throw new ArgumentOutOfRangeException(
                nameof(tick), $"Cannot rewind clock from {Tick} to {tick}.");
        }

        Tick = tick;
    }
}
