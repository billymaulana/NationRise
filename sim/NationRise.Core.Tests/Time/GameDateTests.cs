using NationRise.Core.Time;

namespace NationRise.Core.Tests.Time;

public class GameDateTests
{
    [Theory]
    [InlineData(0, 1, 0)]
    [InlineData(23, 1, 23)]
    [InlineData(24, 2, 0)]
    [InlineData(1080, 46, 0)]
    public void TickMapsToCalendarDay(long tick, int day, int hour)
    {
        var date = GameDate.FromTick(tick);

        Assert.Equal(day, date.Day);
        Assert.Equal(hour, date.Hour);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(37)]
    [InlineData(1079)]
    public void TickRoundTripsThroughDate(long tick)
    {
        Assert.Equal(tick, GameDate.FromTick(tick).ToTick());
    }

    [Fact]
    public void StandardCampaignIsFortyFiveDays()
    {
        var end = GameDate.FromTick(45 * GameDate.HoursPerDay);

        Assert.Equal(46, end.Day);
    }
}
