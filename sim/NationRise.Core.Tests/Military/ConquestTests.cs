using NationRise.Core.Military;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Military;

public class ConquestTests
{
    private static (WorldState State, int Province) Setup()
    {
        var state = WorldFixture.Load().ToWorldState(1);
        int idn = state.Nations.IndexOf("IDN");

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Owner[i] == idn)
            {
                return (state, i);
            }
        }

        throw new InvalidOperationException("No Indonesian province found.");
    }

    private static Army Stack(ushort nation, int province, params UnitClass[] units)
    {
        var army = new Army { Id = 1, Nation = nation, Province = province };
        foreach (UnitClass unit in units)
        {
            army.Add(unit);
        }

        return army;
    }

    [Fact]
    public void InfantryCanHoldGroundButArmourAloneCannot()
    {
        Assert.True(Conquest.CanHoldGround(Stack(0, 0, UnitCatalogue.MotorizedInfantry)));
        Assert.True(Conquest.CanHoldGround(Stack(0, 0, UnitCatalogue.NavalInfantry)));
        Assert.False(Conquest.CanHoldGround(Stack(0, 0, UnitCatalogue.MainBattleTank)));
        Assert.False(Conquest.CanHoldGround(Stack(0, 0, UnitCatalogue.TowedArtillery)));
    }

    [Fact]
    public void UndefendedProvinceChangesHands()
    {
        var (state, province) = Setup();
        ushort defender = state.Provinces.Controller[province];
        ushort invader = (ushort)(defender + 1);

        var conquest = new Conquest(state);
        var army = Stack(invader, province, UnitCatalogue.MotorizedInfantry);

        Assert.True(conquest.TryCapture(army, []));
        Assert.Equal(invader, state.Provinces.Controller[province]);
        Assert.Equal(defender, state.Provinces.Owner[province]);
        Assert.True(state.Provinces.IsOccupied(province));
    }

    [Fact]
    public void DefendedProvinceHoldsOut()
    {
        var (state, province) = Setup();
        ushort owner = state.Provinces.Controller[province];
        ushort invader = (ushort)(owner + 1);

        var conquest = new Conquest(state);
        var attacker = Stack(invader, province, UnitCatalogue.MotorizedInfantry);
        var garrison = new Army { Id = 2, Nation = owner, Province = province };
        garrison.Add(UnitCatalogue.MotorizedInfantry);

        Assert.False(conquest.TryCapture(attacker, [garrison]));
        Assert.Equal(owner, state.Provinces.Controller[province]);
    }

    [Fact]
    public void CaptureCollapsesMorale()
    {
        var (state, province) = Setup();
        ushort invader = (ushort)(state.Provinces.Controller[province] + 1);

        state.Provinces.Morale[province] = 0.90f;
        new Conquest(state).TryCapture(Stack(invader, province, UnitCatalogue.MotorizedInfantry), []);

        Assert.Equal(0.25f, state.Provinces.Morale[province], 3);
    }

    [Fact]
    public void CaptureMovesVictoryPoints()
    {
        var (state, province) = Setup();
        ushort owner = state.Provinces.Controller[province];
        ushort invader = (ushort)(owner + 1);

        int before = state.VictoryPointsOf(owner);
        new Conquest(state).TryCapture(Stack(invader, province, UnitCatalogue.MotorizedInfantry), []);
        int after = state.VictoryPointsOf(owner);

        Assert.True(after < before);
        Assert.True(state.VictoryPointsOf(invader) > 0);
    }

    [Fact]
    public void SnapshotExposesOnlyReadableState()
    {
        var (state, _) = Setup();
        var snapshot = WorldSnapshot.From(state, [new ArmyView(1, 0, 5, 3, 1.0f)]);

        Assert.Equal(1, snapshot.Day);
        Assert.Equal(state.Provinces.Count, snapshot.Controller.Length);
        Assert.Single(snapshot.Armies);
        Assert.Equal(3, snapshot.Armies[0].UnitCount);
    }
}
