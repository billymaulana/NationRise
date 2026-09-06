using NationRise.Core.Time;

namespace NationRise.Core.Tests.Time;

public class GameClockTests
{
    [Fact]
    public void ClockStartsAtDayOne()
    {
        var clock = new GameClock();

        Assert.Equal(0, clock.Tick);
        Assert.Equal(1, clock.Date.Day);
        Assert.True(clock.IsDayBoundary);
    }

    [Fact]
    public void DayBoundaryFallsEveryTwentyFourTicks()
    {
        var clock = new GameClock();
        int boundaries = 0;

        for (int i = 0; i < 72; i++)
        {
            clock.Advance();
            if (clock.IsDayBoundary)
            {
                boundaries++;
            }
        }

        Assert.Equal(3, boundaries);
    }

    [Fact]
    public void ClockRefusesToRewind()
    {
        var clock = new GameClock();
        clock.AdvanceTo(100);

        Assert.Throws<ArgumentOutOfRangeException>(() => clock.AdvanceTo(99));
    }
}
