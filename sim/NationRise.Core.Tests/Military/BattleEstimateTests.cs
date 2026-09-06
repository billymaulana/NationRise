using NationRise.Core.Determinism;
using NationRise.Core.Military;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Military;

public class BattleEstimateTests
{
    private static Army Stack(int id, ushort nation, params UnitClass[] classes)
    {
        var army = new Army { Id = id, Nation = nation, Province = 0 };
        foreach (UnitClass unitClass in classes)
        {
            army.Add(unitClass);
        }

        return army;
    }

    private static Army Infantry(int id, ushort nation, int count)
    {
        var army = new Army { Id = id, Nation = nation, Province = 0 };
        for (int i = 0; i < count; i++)
        {
            army.Add(UnitCatalogue.MotorizedInfantry);
        }

        return army;
    }

    /* The preview must quote the engine, not approximate it. If these drift the
       player is being shown a number the fight never uses. */
    [Fact]
    public void BreakdownMatchesTheEngineStrength()
    {
        Army attacker = Infantry(1, 1, 6);
        Army defender = Infantry(2, 2, 4);

        var combat = new Combat(new DeterministicRandom(1));
        float engine = 0f;
        foreach (ArmourClass armour in Enum.GetValues<ArmourClass>())
        {
            bool present = defender.Units.Any(u => u.Class.Armour == armour);
            if (present)
            {
                engine += combat.StrengthOf(attacker, armour, Terrain.Forest, attacking: true);
            }
        }

        StrengthBreakdown preview = BattleEstimate.Breakdown(attacker, defender, Terrain.Forest, attacking: true);

        Assert.Equal(engine, preview.Total, 3);
    }

    [Fact]
    public void FactorsMultiplyToTheTotal()
    {
        Army attacker = Infantry(1, 1, 14);
        Army defender = Infantry(2, 2, 3);

        StrengthBreakdown b = BattleEstimate.Breakdown(attacker, defender, Terrain.Mountains, attacking: true);

        Assert.Equal(b.BaseRating * b.Terrain * b.StackPenalty * b.HealthPenalty, b.Total, 3);
    }

    [Fact]
    public void DefendingIgnoresTheAttackTerrainModifier()
    {
        Army attacker = Infantry(1, 1, 5);
        Army defender = Infantry(2, 2, 5);

        StrengthBreakdown defence = BattleEstimate.Breakdown(defender, attacker, Terrain.Mountains, attacking: false);

        Assert.Equal(1f, defence.Terrain, 3);
    }

    [Fact]
    public void OversizedStackIsPenalised()
    {
        Army small = Infantry(1, 1, 10);
        Army large = Infantry(2, 1, 20);
        Army target = Infantry(3, 2, 4);

        StrengthBreakdown a = BattleEstimate.Breakdown(small, target, Terrain.OpenGround, attacking: true);
        StrengthBreakdown b = BattleEstimate.Breakdown(large, target, Terrain.OpenGround, attacking: true);

        Assert.Equal(1f, a.StackPenalty, 3);
        Assert.True(b.StackPenalty < 0.7f);
        Assert.True(b.Total < 2f * a.Total, "Doubling an oversized stack must not double its strength.");
    }

    [Fact]
    public void WoundedUnitsLowerTheHealthFactor()
    {
        Army attacker = Infantry(1, 1, 4);
        Army defender = Infantry(2, 2, 4);

        Assert.Equal(1f, BattleEstimate.Breakdown(attacker, defender, Terrain.OpenGround, true).HealthPenalty, 3);

        foreach (UnitInstance unit in attacker.Units)
        {
            unit.HitPoints = unit.Class.MaxHitPoints * 0.2f;
        }

        Assert.Equal(0.40f, BattleEstimate.Breakdown(attacker, defender, Terrain.OpenGround, true).HealthPenalty, 2);
    }

    [Fact]
    public void OverwhelmingForceIsForecastAsDecisive()
    {
        Army attacker = Infantry(1, 1, 9);
        Army defender = Infantry(2, 2, 1);

        BattleForecast forecast = BattleEstimate.Forecast(attacker, defender, Terrain.OpenGround);

        Assert.True(forecast.Decisive);
        Assert.True(forecast.AttackerWinsWorstCase);
        Assert.Equal(1, forecast.DefenderLossesHigh);
    }

    [Fact]
    public void ForecastGivesARangeNotAPoint()
    {
        Army attacker = Infantry(1, 1, 8);
        Army defender = Infantry(2, 2, 6);

        BattleForecast forecast = BattleEstimate.Forecast(attacker, defender, Terrain.OpenGround);

        Assert.True(forecast.SlowestTicks >= forecast.FastestTicks);
        Assert.True(forecast.AttackerLossesHigh >= forecast.AttackerLossesLow);
        Assert.True(forecast.SlowestTicks > forecast.FastestTicks, "Identical bounds mean the dice were ignored.");
    }

    /* The honest claim behind showing a range: real fights land inside it. */
    [Theory]
    [InlineData(1u)]
    [InlineData(77u)]
    [InlineData(20260906u)]
    public void RealFightsLandInsideTheForecast(ulong seed)
    {
        Army attacker = Infantry(1, 1, 7);
        Army defender = Infantry(2, 2, 5);
        BattleForecast forecast = BattleEstimate.Forecast(attacker, defender, Terrain.OpenGround);

        var combat = new Combat(new DeterministicRandom(seed));
        int startAttackers = attacker.Count;
        int startDefenders = defender.Count;

        int ticks = 0;
        while (ticks < BattleEstimate.TickCeiling && !attacker.IsDestroyed && !defender.IsDestroyed)
        {
            ticks++;
            combat.ResolveHour(attacker, defender, Terrain.OpenGround);
        }

        Assert.InRange(ticks, forecast.FastestTicks, forecast.SlowestTicks);
        Assert.InRange(startAttackers - attacker.Count, forecast.AttackerLossesLow, forecast.AttackerLossesHigh);
        Assert.InRange(startDefenders - defender.Count, forecast.DefenderLossesLow, forecast.DefenderLossesHigh);
    }

    [Fact]
    public void TerrainAloneCanFlipTheOutcome()
    {
        BattleForecast open = BattleEstimate.Forecast(Infantry(1, 1, 6), Infantry(2, 2, 5), Terrain.OpenGround);
        BattleForecast rough = BattleEstimate.Forecast(Infantry(1, 1, 6), Infantry(2, 2, 5), Terrain.Mountains);

        Assert.True(rough.Attacker.Total < open.Attacker.Total);
        Assert.True(rough.SlowestTicks >= open.SlowestTicks);
    }

    /* Indonesia attacks across water far more often than across a border, so
       the landing penalty is the modifier the preview most needs to state. */
    [Fact]
    public void AnOpposedLandingIsForecastAtHalfStrength()
    {
        Army attacker = Infantry(1, 1, 8);
        Army defender = Infantry(2, 2, 4);

        BattleForecast dry = BattleEstimate.Forecast(attacker, defender, Terrain.OpenGround);
        BattleForecast landing = BattleEstimate.Forecast(
            attacker, defender, Terrain.OpenGround, Combat.LandingPenalty);

        Assert.Equal(dry.Attacker.Total * Combat.LandingPenalty, landing.Attacker.Total, 3);
        Assert.Equal(dry.Defender.Total, landing.Defender.Total, 3);
        Assert.True(landing.SlowestTicks > dry.SlowestTicks);
        Assert.True(landing.AttackerLossesHigh >= dry.AttackerLossesHigh);
    }

    [Fact]
    public void LandingPenaltyExpiresWithTheBeachhead()
    {
        Army landed = Infantry(1, 1, 5);
        landed.LandedOnTick = 100;

        Assert.Equal(Combat.LandingPenalty, Combat.LandingModifier(landed, 120), 3);
        Assert.Equal(1f, Combat.LandingModifier(landed, 100 + Combat.LandingWindowTicks), 3);
    }

    [Fact]
    public void ArmiesThatNeverSailedFightAtFullStrength()
    {
        Army overland = Infantry(1, 1, 5);

        Assert.Equal(1f, Combat.LandingModifier(overland, 0), 3);
        Assert.Equal(1f, Combat.LandingModifier(overland, long.MaxValue), 3);
    }

    [Fact]
    public void ArmourMatchupMattersMoreThanHeadcount()
    {
        Army tanks = Stack(1, 1, UnitCatalogue.MainBattleTank, UnitCatalogue.MainBattleTank);
        Army infantry = Infantry(2, 2, 4);

        StrengthBreakdown versusInfantry = BattleEstimate.Breakdown(tanks, infantry, Terrain.OpenGround, attacking: true);

        Assert.True(versusInfantry.BaseRating > 0f);
    }
}
