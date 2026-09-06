using NationRise.Core.Data;
using NationRise.Core.Determinism;
using NationRise.Core.Diplomacy;
using NationRise.Core.Military;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Military;

/*
   Supply and stance were both fully built and fully unreachable: nothing passed
   their multipliers to Combat, so a cut-off army fought exactly as well as a
   supplied one. These tests exist so that cannot silently return.
*/
public class CombatModifierTests
{
    private static Army Stack(int id, ushort nation, int province, int count)
    {
        var army = new Army { Id = id, Nation = nation, Province = province };
        for (int i = 0; i < count; i++)
        {
            army.Add(UnitCatalogue.MotorizedInfantry);
        }

        return army;
    }

    private static float DamageToDefender(CombatModifiers mods)
    {
        Army attacker = Stack(1, 1, 0, 6);
        Army defender = Stack(2, 2, 0, 6);

        CombatResult result = new Combat(new DeterministicRandom(9))
            .ResolveHour(attacker, defender, Terrain.OpenGround, 0, mods);

        return result.DamageToDefender;
    }

    private static float DamageToAttacker(CombatModifiers mods)
    {
        Army attacker = Stack(1, 1, 0, 6);
        Army defender = Stack(2, 2, 0, 6);

        CombatResult result = new Combat(new DeterministicRandom(9))
            .ResolveHour(attacker, defender, Terrain.OpenGround, 0, mods);

        return result.DamageToAttacker;
    }

    [Fact]
    public void NoModifiersMatchTheUnmodifiedFight()
    {
        Army attacker = Stack(1, 1, 0, 6);
        Army defender = Stack(2, 2, 0, 6);

        CombatResult plain = new Combat(new DeterministicRandom(9))
            .ResolveHour(attacker, defender, Terrain.OpenGround, 0);

        Assert.Equal(plain.DamageToDefender, DamageToDefender(CombatModifiers.None), 4);
        Assert.Equal(plain.DamageToAttacker, DamageToAttacker(CombatModifiers.None), 4);
    }

    [Fact]
    public void AWeakenedAttackerHitsLessHard()
    {
        float full = DamageToDefender(CombatModifiers.None);
        float starved = DamageToDefender(CombatModifiers.None.WithAttackerAttack(0.8f));

        Assert.Equal(full * 0.8f, starved, 4);
    }

    [Fact]
    public void AnEntrenchedDefenderTakesLess()
    {
        float exposed = DamageToDefender(CombatModifiers.None);
        float dugIn = DamageToDefender(CombatModifiers.None.WithDefenderDamageTaken(0.75f));

        Assert.Equal(exposed * 0.75f, dugIn, 4);
    }

    [Fact]
    public void FactorsCompoundRatherThanReplaceEachOther()
    {
        CombatModifiers stacked = CombatModifiers.None
            .WithAttackerAttack(0.8f)
            .WithAttackerAttack(0.5f);

        Assert.Equal(0.40f, stacked.AttackerAttack, 4);
    }

    [Fact]
    public void ReturnFireIsScaledByTheDefendersOwnFactors()
    {
        float full = DamageToAttacker(CombatModifiers.None);
        float cutOff = DamageToAttacker(CombatModifiers.None.WithDefenderAttack(0.7f));

        Assert.Equal(full * 0.7f, cutOff, 4);
    }

    /* The wiring test: a real WarSystem with a real SupplySystem must produce a
       different battle from one without. */
    [Fact]
    public void WarSystemAppliesSupplyToRealBattles()
    {
        static (float Attacker, float Defender) Fight(bool withSupply)
        {
            WorldData data = WorldFixture.Load();
            WorldState state = data.ToWorldState(1);
            var relations = new Relations(state.Nations.Count);

            ushort idn = (ushort)state.Nations.IndexOf("IDN");
            int province = -1;
            for (int i = 0; i < state.Provinces.Count && province < 0; i++)
            {
                if (state.Provinces.Controller[i] == idn)
                {
                    province = i;
                }
            }

            ushort invader = (ushort)state.Nations.IndexOf("AUS");
            relations.Set(idn, invader, Relation.War);

            var war = new WarSystem(state, relations, new DeterministicRandom(5));

            if (withSupply)
            {
                var supply = new SupplySystem(state, data.Land, data.Sea);
                supply.RecomputeAll();
                war.Supply = supply;
            }

            var armies = new Dictionary<int, Army>
            {
                [1] = Stack(1, invader, province, 5),
                [2] = Stack(2, idn, province, 5),
            };

            war.Tick(armies);

            BattleReport report = Assert.Single(war.LastReports);
            return (report.DamageToAttacker, report.DamageToDefender);
        }

        (float attackerPlain, float defenderPlain) = Fight(withSupply: false);
        (float attackerSupplied, float defenderSupplied) = Fight(withSupply: true);

        /* An invader with no line home attacks at a discount; the home garrison
           does not. */
        Assert.True(defenderSupplied < defenderPlain,
            $"Supply changed nothing: {defenderSupplied} vs {defenderPlain}.");
        Assert.Equal(attackerPlain, attackerSupplied, 4);
    }

    [Fact]
    public void WarSystemAppliesStanceToRealBattles()
    {
        static float Fight(StanceKind? stance)
        {
            WorldData data = WorldFixture.Load();
            WorldState state = data.ToWorldState(1);
            var relations = new Relations(state.Nations.Count);

            ushort idn = (ushort)state.Nations.IndexOf("IDN");
            int province = -1;
            for (int i = 0; i < state.Provinces.Count && province < 0; i++)
            {
                if (state.Provinces.Controller[i] == idn && !state.Provinces.IsCity[i])
                {
                    province = i;
                }
            }

            ushort invader = (ushort)state.Nations.IndexOf("AUS");
            relations.Set(idn, invader, Relation.War);

            var supply = new SupplySystem(state, data.Land, data.Sea);
            supply.RecomputeAll();

            var stances = new StanceSystem(state, supply);
            var war = new WarSystem(state, relations, new DeterministicRandom(5)) { Stances = stances };

            Army attacker = Stack(1, invader, province, 5);
            Army defender = Stack(2, idn, province, 5);

            if (stance is not null)
            {
                /* Past the reorganisation window, or the stance has not taken
                   hold and the test would prove nothing. */
                stances.Set(attacker, stance.Value, Terrain.OpenGround, out _);
                state.Clock.AdvanceTo(StanceSystem.ReorganisationTicks + 1);
            }

            war.Tick(new Dictionary<int, Army> { [1] = attacker, [2] = defender });

            return Assert.Single(war.LastReports).DamageToDefender;
        }

        float neutral = Fight(null);
        float assaulting = Fight(StanceKind.Assault);

        Assert.True(assaulting > neutral, $"Assault changed nothing: {assaulting} vs {neutral}.");
    }
}
