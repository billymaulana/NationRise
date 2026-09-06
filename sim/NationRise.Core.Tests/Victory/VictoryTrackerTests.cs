using NationRise.Core.Data;
using NationRise.Core.Tests.Data;
using NationRise.Core.Victory;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Victory;

public class VictoryTrackerTests
{
    private static WorldState RealWorld() => WorldFixture.Load().ToWorldState(1);

    private static int Indonesia(WorldState state) => state.Nations.IndexOf("IDN");

    /* Arithmetic small enough to check by hand: with the defaults, ninety
       plain provinces plus ten cities of population five is 140 points. */
    private static WorldState SmallWorld(int provinces = 100)
    {
        var owner = new ushort[provinces];
        var terrain = new byte[provinces];
        var population = new float[provinces];
        var isCity = new byte[provinces];
        var resource = new byte[provinces];
        var claimOffsets = new int[provinces + 1];
        var claims = new List<ushort>();

        for (int i = 0; i < provinces; i++)
        {
            owner[i] = (ushort)(i < provinces * 6 / 10 ? 0 : 1);
            isCity[i] = (byte)(i % 10 == 0 ? 1 : 0);
            population[i] = isCity[i] != 0 ? 5f : 1f;
            claimOffsets[i] = claims.Count;
            claims.Add(owner[i]);
        }

        claimOffsets[provinces] = claims.Count;

        var unlinked = new ProvinceGraph(new int[provinces + 1], []);
        return new WorldData(
            ["AAA", "BBB"], owner, terrain, population, isCity, resource,
            claimOffsets, claims.ToArray(), unlinked, unlinked).ToWorldState(1);
    }

    private static void RunTo(WorldState state, int day)
    {
        while (state.Clock.Date.Day < day)
        {
            state.Clock.Advance();
        }
    }

    [Fact]
    public void ThresholdIsAShareOfTheWorldTotalNotAConstant()
    {
        var standard = CampaignPreset.Of(CampaignLength.Standard);
        var hundred = new VictoryTracker(SmallWorld(), 0, standard);
        var twoHundred = new VictoryTracker(SmallWorld(200), 0, standard);

        Assert.Equal(140, hundred.WorldPoints);
        Assert.Equal(42, hundred.Threshold);

        Assert.Equal(280, twoHundred.WorldPoints);
        Assert.Equal(84, twoHundred.Threshold);
    }

    [Fact]
    public void WorldTotalIsPlainProvincesPlusCityPopulation()
    {
        var state = RealWorld();
        int plain = 0;
        int cityPopulation = 0;

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.IsCity[i])
            {
                cityPopulation += (int)MathF.Round(state.Provinces.Population[i]);
            }
            else
            {
                plain++;
            }
        }

        var tracker = new VictoryTracker(state, Indonesia(state), CampaignPreset.Of(CampaignLength.Standard));

        Assert.Equal(plain + cityPopulation, tracker.WorldPoints);
        Assert.Equal(tracker.WorldPoints * 30 / 100, tracker.Threshold);
    }

    [Fact]
    public void EachPresetSetsItsOwnLengthAndThreshold()
    {
        var world = SmallWorld();
        var shortRun = new VictoryTracker(world, 0, CampaignPreset.Of(CampaignLength.Short));
        var standard = new VictoryTracker(world, 0, CampaignPreset.Of(CampaignLength.Standard));
        var longRun = new VictoryTracker(world, 0, CampaignPreset.Of(CampaignLength.Long));

        Assert.Equal((30, 25, 35), (shortRun.Preset.Days, shortRun.Preset.WorldSharePercent, shortRun.Threshold));
        Assert.Equal((45, 30, 42), (standard.Preset.Days, standard.Preset.WorldSharePercent, standard.Threshold));
        Assert.Equal((60, 35, 49), (longRun.Preset.Days, longRun.Preset.WorldSharePercent, longRun.Threshold));
    }

    [Fact]
    public void IndonesiaStartsFarBelowTheThreshold()
    {
        var state = RealWorld();
        var tracker = new VictoryTracker(state, Indonesia(state), CampaignPreset.Of(CampaignLength.Standard));

        Assert.True(tracker.PlayerPoints > 0);
        Assert.True(tracker.PlayerPoints * 5 < tracker.Threshold,
            $"Indonesia holds {tracker.PlayerPoints} of the {tracker.Threshold} needed.");
        Assert.InRange(tracker.PlayerProgressPercent, 1, 20);
        Assert.False(tracker.HasReachedThreshold(tracker.Player));
    }

    [Fact]
    public void TakingGroundRaisesPointsAndProgress()
    {
        var state = RealWorld();
        int idn = Indonesia(state);
        var tracker = new VictoryTracker(state, idn, CampaignPreset.Of(CampaignLength.Standard));

        int pointsBefore = tracker.PlayerPoints;
        int percentBefore = tracker.PlayerProgressPercent;
        int thresholdBefore = tracker.Threshold;
        int taken = 0;

        for (int i = 0; i < state.Provinces.Count && taken < 400; i++)
        {
            if (state.Provinces.Controller[i] != idn)
            {
                state.Provinces.Controller[i] = (ushort)idn;
                taken++;
            }
        }

        Assert.Equal(400, taken);
        Assert.True(tracker.PlayerPoints > pointsBefore);
        Assert.True(tracker.PlayerProgressPercent > percentBefore);
        Assert.Equal(thresholdBefore, tracker.Threshold);
    }

    [Fact]
    public void NationWithoutProvincesIsEliminated()
    {
        var state = RealWorld();
        int idn = Indonesia(state);
        var tracker = new VictoryTracker(state, idn, CampaignPreset.Of(CampaignLength.Standard));

        Assert.Empty(tracker.EliminatedNations());

        int victim = tracker.Leader.Nation;
        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Controller[i] == victim)
            {
                state.Provinces.Controller[i] = (ushort)idn;
            }
        }

        Assert.True(tracker.IsEliminated(victim));
        Assert.Equal(0, tracker.PointsOf(victim));
        Assert.Contains(victim, tracker.EliminatedNations());
        Assert.False(tracker.IsEliminated(idn));
        Assert.False(tracker.HasLost);
    }

    [Fact]
    public void PlayerLosingEveryProvinceIsDefeat()
    {
        var state = RealWorld();
        int idn = Indonesia(state);
        var tracker = new VictoryTracker(state, idn, CampaignPreset.Of(CampaignLength.Standard));
        ushort conqueror = (ushort)(idn == 0 ? 1 : 0);

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Controller[i] == idn)
            {
                state.Provinces.Controller[i] = conqueror;
            }
        }

        Assert.True(tracker.HasLost);
        Assert.Equal(0, tracker.PlayerPoints);
        Assert.Equal(0, tracker.PlayerProgressPercent);
    }

    [Fact]
    public void LeaderboardIsDescendingAndRespectsTop()
    {
        var state = RealWorld();
        var tracker = new VictoryTracker(state, Indonesia(state), CampaignPreset.Of(CampaignLength.Standard));

        var board = tracker.Leaderboard(5);

        Assert.Equal(5, board.Count);
        for (int i = 1; i < board.Count; i++)
        {
            Assert.True(board[i - 1].Points >= board[i].Points);
        }

        Assert.Equal(tracker.Leader, board[0]);
        Assert.Equal(tracker.PointsOf(board[0].Nation), board[0].Points);
        Assert.Empty(tracker.Leaderboard(0));
        Assert.Single(tracker.Leaderboard(1));
    }

    [Fact]
    public void LeaderHoldsMorePointsThanTheStartingPlayer()
    {
        var state = RealWorld();
        var tracker = new VictoryTracker(state, Indonesia(state), CampaignPreset.Of(CampaignLength.Standard));

        Assert.True(tracker.Leader.Points > tracker.PlayerPoints);
        Assert.NotEqual(tracker.Player, tracker.Leader.Nation);
    }

    [Fact]
    public void VictoryIsRecordedWithoutStoppingPlay()
    {
        var state = RealWorld();
        int idn = Indonesia(state);
        var tracker = new VictoryTracker(state, idn, CampaignPreset.Of(CampaignLength.Standard));

        RunTo(state, 5);
        for (int i = 0; i < state.Provinces.Count; i++)
        {
            state.Provinces.Controller[i] = (ushort)idn;
        }

        tracker.Tick();

        Assert.True(tracker.HasWon);
        Assert.Equal(5, tracker.WonOnDay);
        Assert.True(tracker.PlayerProgressPercent > 100);

        ushort rival = (ushort)(idn == 0 ? 1 : 0);
        RunTo(state, 12);
        for (int i = 0; i < 200; i++)
        {
            state.Provinces.Controller[i] = rival;
        }

        tracker.Tick();

        Assert.Equal(12, state.Clock.Date.Day);
        Assert.True(tracker.HasWon);
        Assert.Equal(5, tracker.WonOnDay);
        Assert.Null(tracker.WonDayOf(rival));
        Assert.True(tracker.PointsOf(rival) > 0);
        Assert.True(tracker.PlayerPoints < tracker.WorldPoints);
        Assert.False(tracker.IsEliminated(idn));
        Assert.Equal(2, tracker.Leaderboard(5).Count);
    }

    [Fact]
    public void UnknownNationIsRejected()
    {
        var world = SmallWorld();
        var preset = CampaignPreset.Of(CampaignLength.Standard);

        Assert.Throws<ArgumentOutOfRangeException>(() => new VictoryTracker(world, 7, preset));
        Assert.Throws<ArgumentOutOfRangeException>(() => new VictoryTracker(world, 0, preset).PointsOf(-1));
    }
}
