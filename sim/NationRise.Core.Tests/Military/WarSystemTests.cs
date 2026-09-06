using NationRise.Core.Determinism;
using NationRise.Core.Diplomacy;
using NationRise.Core.Military;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Military;

public class WarSystemTests
{
    private static (WorldState State, Relations Relations, int Province) Setup()
    {
        var state = WorldFixture.Load().ToWorldState(1);
        var relations = new Relations(state.Nations.Count);
        int idn = state.Nations.IndexOf("IDN");

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Owner[i] == idn)
            {
                return (state, relations, i);
            }
        }

        throw new InvalidOperationException("No Indonesian province found.");
    }

    private static Army Stack(int id, ushort nation, int province, params UnitClass[] units)
    {
        var army = new Army { Id = id, Nation = nation, Province = province };
        foreach (UnitClass unit in units)
        {
            army.Add(unit);
        }

        return army;
    }

    [Fact]
    public void NationsAtPeaceDoNotFight()
    {
        var (state, relations, province) = Setup();
        ushort owner = state.Provinces.Controller[province];
        ushort other = (ushort)(owner + 1);

        var war = new WarSystem(state, relations, new DeterministicRandom(1));
        var armies = new Dictionary<int, Army>
        {
            [1] = Stack(1, owner, province, UnitCatalogue.MotorizedInfantry),
            [2] = Stack(2, other, province, UnitCatalogue.MotorizedInfantry),
        };

        war.Tick(armies);

        Assert.Empty(war.LastReports);
        Assert.Equal(owner, state.Provinces.Controller[province]);
    }

    [Fact]
    public void HostileStacksInOneProvinceFight()
    {
        var (state, relations, province) = Setup();
        ushort owner = state.Provinces.Controller[province];
        ushort invader = (ushort)(owner + 1);
        relations.Set(owner, invader, Relation.War);

        var war = new WarSystem(state, relations, new DeterministicRandom(1));
        var armies = new Dictionary<int, Army>
        {
            [1] = Stack(1, owner, province, UnitCatalogue.MotorizedInfantry),
            [2] = Stack(2, invader, province, UnitCatalogue.MainBattleTank),
        };

        war.Tick(armies);

        Assert.Single(war.LastReports);
        Assert.True(war.LastReports[0].DamageToDefender > 0f);
    }

    [Fact]
    public void GarrisonDefendsSoTheAttackerIsTheOneWithoutControl()
    {
        var (state, relations, province) = Setup();
        ushort owner = state.Provinces.Controller[province];
        ushort invader = (ushort)(owner + 1);
        relations.Set(owner, invader, Relation.War);

        var war = new WarSystem(state, relations, new DeterministicRandom(1));
        var armies = new Dictionary<int, Army>
        {
            [1] = Stack(1, invader, province, UnitCatalogue.MotorizedInfantry),
            [2] = Stack(2, owner, province, UnitCatalogue.MotorizedInfantry),
        };

        war.Tick(armies);

        Assert.Single(war.LastReports);
        Assert.Equal(invader, war.LastReports[0].Attacker);
        Assert.Equal(owner, war.LastReports[0].Defender);
    }

    [Fact]
    public void UnopposedInvaderTakesTheProvince()
    {
        var (state, relations, province) = Setup();
        ushort owner = state.Provinces.Controller[province];
        ushort invader = (ushort)(owner + 1);
        relations.Set(owner, invader, Relation.War);

        var war = new WarSystem(state, relations, new DeterministicRandom(1));
        var armies = new Dictionary<int, Army>
        {
            [1] = Stack(1, invader, province, UnitCatalogue.MotorizedInfantry),
        };

        war.Tick(armies);

        Assert.Single(war.LastConquests);
        Assert.Equal(invader, state.Provinces.Controller[province]);
    }

    [Fact]
    public void ArmourAloneCannotTakeGround()
    {
        var (state, relations, province) = Setup();
        ushort owner = state.Provinces.Controller[province];
        ushort invader = (ushort)(owner + 1);
        relations.Set(owner, invader, Relation.War);

        var war = new WarSystem(state, relations, new DeterministicRandom(1));
        var armies = new Dictionary<int, Army>
        {
            [1] = Stack(1, invader, province, UnitCatalogue.MainBattleTank),
        };

        war.Tick(armies);

        Assert.Empty(war.LastConquests);
        Assert.Equal(owner, state.Provinces.Controller[province]);
    }

    [Fact]
    public void AttackerEventuallyBreaksThroughAndTakesTheGround()
    {
        var (state, relations, province) = Setup();
        ushort owner = state.Provinces.Controller[province];
        ushort invader = (ushort)(owner + 1);
        relations.Set(owner, invader, Relation.War);

        var war = new WarSystem(state, relations, new DeterministicRandom(3));
        var attacker = Stack(1, invader, province,
            UnitCatalogue.MotorizedInfantry, UnitCatalogue.MainBattleTank, UnitCatalogue.MainBattleTank);
        var defender = Stack(2, owner, province, UnitCatalogue.MotorizedInfantry);

        var armies = new Dictionary<int, Army> { [1] = attacker, [2] = defender };

        for (int hour = 0; hour < 200 && !defender.IsDestroyed; hour++)
        {
            war.Tick(armies);
        }

        Assert.True(defender.IsDestroyed);

        war.Tick(armies);
        Assert.Equal(invader, state.Provinces.Controller[province]);
    }
}
