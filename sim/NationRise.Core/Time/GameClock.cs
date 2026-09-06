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

    /* Loading a save is the one legitimate way time goes backwards. It is a
       separate method from AdvanceTo so an accidental rewind during play still
       throws instead of silently corrupting the timeline. */
    public void RestoreTo(long tick)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(tick);
        Tick = tick;
    }
}
