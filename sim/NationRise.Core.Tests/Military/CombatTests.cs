using NationRise.Core.Determinism;
using NationRise.Core.Military;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Military;

public class CombatTests
{
    private static Army Stack(int id, params UnitClass[] units)
    {
        var army = new Army { Id = id, Nation = 0, Province = 0 };
        foreach (UnitClass unit in units)
        {
            army.Add(unit);
        }

        return army;
    }

    [Fact]
    public void StackingBeyondTenIsPenalised()
    {
        Assert.Equal(1f, Combat.StackPenalty(10), 3);
        Assert.True(Combat.StackPenalty(20) < 1f);
        Assert.True(Combat.StackPenalty(40) < Combat.StackPenalty(20));
        Assert.True(Combat.StackPenalty(1000) >= 0.30f);
    }

    [Fact]
    public void BothSidesTakeDamage()
    {
        var combat = new Combat(new DeterministicRandom(1));
        var attacker = Stack(1, UnitCatalogue.MainBattleTank, UnitCatalogue.MainBattleTank);
        var defender = Stack(2, UnitCatalogue.MotorizedInfantry, UnitCatalogue.MotorizedInfantry);

        CombatResult result = combat.ResolveHour(attacker, defender, Terrain.OpenGround);

        Assert.True(result.DamageToAttacker > 0f);
        Assert.True(result.DamageToDefender > 0f);
    }

    [Fact]
    public void DefensiveTerrainHelpsTheDefender()
    {
        float openGround = Damage(Terrain.OpenGround);
        float mountains = Damage(Terrain.Mountains);

        Assert.True(mountains < openGround);

        static float Damage(Terrain terrain)
        {
            var combat = new Combat(new DeterministicRandom(42));
            var attacker = Stack(1, UnitCatalogue.MainBattleTank);
            var defender = Stack(2, UnitCatalogue.MotorizedInfantry);
            return combat.ResolveHour(attacker, defender, terrain).DamageToDefender;
        }
    }

    [Fact]
    public void FrontLineUnitsAbsorbMoreThanArtillery()
    {
        var combat = new Combat(new DeterministicRandom(7));
        var attacker = Stack(1, UnitCatalogue.MainBattleTank, UnitCatalogue.MainBattleTank);
        var defender = Stack(2, UnitCatalogue.MotorizedInfantry, UnitCatalogue.TowedArtillery);

        combat.ResolveHour(attacker, defender, Terrain.OpenGround);

        UnitInstance infantry = defender.Units.First(u => u.Class == UnitCatalogue.MotorizedInfantry);
        UnitInstance artillery = defender.Units.First(u => u.Class == UnitCatalogue.TowedArtillery);

        float infantryLost = infantry.Class.MaxHitPoints - infantry.HitPoints;
        float artilleryLost = artillery.Class.MaxHitPoints - artillery.HitPoints;

        Assert.True(infantryLost > artilleryLost);
    }

    [Fact]
    public void SameSeedGivesSameBattle()
    {
        Assert.Equal(Fight(99), Fight(99));
        Assert.NotEqual(Fight(1), Fight(2));

        static float Fight(ulong seed)
        {
            var combat = new Combat(new DeterministicRandom(seed));
            var attacker = Stack(1, UnitCatalogue.MainBattleTank);
            var defender = Stack(2, UnitCatalogue.MotorizedInfantry);
            return combat.ResolveHour(attacker, defender, Terrain.OpenGround).DamageToDefender;
        }
    }

    [Fact]
    public void OverwhelmingForceWinsWithinReasonableTime()
    {
        var combat = new Combat(new DeterministicRandom(5));
        var attacker = Stack(1, UnitCatalogue.MainBattleTank, UnitCatalogue.MainBattleTank, UnitCatalogue.MainBattleTank);
        var defender = Stack(2, UnitCatalogue.MotorizedInfantry);

        int hours = 0;
        while (!defender.IsDestroyed && hours < 100)
        {
            combat.ResolveHour(attacker, defender, Terrain.OpenGround);
            hours++;
        }

        Assert.True(defender.IsDestroyed);
        Assert.InRange(hours, 1, 30);
    }
}
