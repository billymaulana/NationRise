using NationRise.Core.Time;

namespace NationRise.Core.Tests.Time;

public class GameSpeedTests
{
    [Fact]
    public void PausedNeverTicks()
    {
        Assert.Equal(double.PositiveInfinity, GameSpeedInfo.SecondsPerTick(GameSpeed.Paused));
        Assert.Equal(0.0, GameSpeedInfo.MinutesPerGameDay(GameSpeed.Paused));
    }

    [Fact]
    public void NormalIsFiveMinutesPerDay()
    {
        Assert.Equal(5.0, GameSpeedInfo.MinutesPerGameDay(GameSpeed.Normal), 2);
        Assert.Equal(12.5, GameSpeedInfo.SecondsPerTick(GameSpeed.Normal), 2);
    }

    [Fact]
    public void FasterSpeedsTakeLessRealTime()
    {
        double previous = double.PositiveInfinity;

        foreach (GameSpeed speed in new[]
        {
            GameSpeed.Ambient, GameSpeed.Relaxed, GameSpeed.Normal, GameSpeed.Fast, GameSpeed.Blitz,
        })
        {
            double seconds = GameSpeedInfo.SecondsPerTick(speed);
            Assert.True(seconds < previous);
            previous = seconds;
        }
    }

    [Fact]
    public void SpeedStepsStayInRange()
    {
        Assert.Equal(GameSpeed.Paused, GameSpeedInfo.Slower(GameSpeed.Paused));
        Assert.Equal(GameSpeed.Blitz, GameSpeedInfo.Faster(GameSpeed.Blitz));
        Assert.Equal(GameSpeed.Fast, GameSpeedInfo.Faster(GameSpeed.Normal));
        Assert.Equal(GameSpeed.Relaxed, GameSpeedInfo.Slower(GameSpeed.Normal));
    }

    /* A 45-day campaign at Normal should fit an evening; the whole speed
       ladder exists so a player can choose how long that evening is. */
    [Fact]
    public void StandardCampaignFitsAnEvening()
    {
        double hours = 45 * GameSpeedInfo.MinutesPerGameDay(GameSpeed.Normal) / 60.0;
        Assert.InRange(hours, 3.0, 4.5);

        double blitz = 45 * GameSpeedInfo.MinutesPerGameDay(GameSpeed.Blitz) / 60.0;
        Assert.InRange(blitz, 0.7, 1.2);
    }
}
