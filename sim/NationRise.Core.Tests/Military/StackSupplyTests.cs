using NationRise.Core.Data;
using NationRise.Core.Military;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Military;

/*
   Province supply answers "can its owner hold this ground". A stack standing on
   someone else's ground asks a different question, and answering it with the
   province's status gave invaders the defender's logistics for free.
*/
public class StackSupplyTests
{
    private sealed record Harness(WorldState State, WorldData Data, SupplySystem Supply, ushort Owner);

    private static Harness Setup()
    {
        WorldData data = WorldFixture.Load();
        WorldState state = data.ToWorldState(1);
        var supply = new SupplySystem(state, data.Land, data.Sea);
        supply.RecomputeAll();

        return new Harness(state, data, supply, (ushort)state.Nations.IndexOf("IDN"));
    }

    private static int HomeProvinceOf(Harness h, ushort nation)
    {
        for (int i = 0; i < h.State.Provinces.Count; i++)
        {
            if (h.State.Provinces.Controller[i] == nation
                && h.Supply.StatusOf(i) == SupplyStatus.Supplied)
            {
                return i;
            }
        }

        throw new InvalidOperationException("No supplied province.");
    }

    [Fact]
    public void OnItsOwnGroundAStackUsesTheProvinceStatus()
    {
        Harness h = Setup();
        int home = HomeProvinceOf(h, h.Owner);

        Assert.Equal(h.Supply.EffectiveStatusOf(home), h.Supply.StatusForStackIn(h.Owner, home));
    }

    [Fact]
    public void AnInvaderDoesNotInheritTheDefendersSupply()
    {
        Harness h = Setup();
        int home = HomeProvinceOf(h, h.Owner);
        ushort stranger = (ushort)h.State.Nations.IndexOf("BRA");

        Assert.Equal(SupplyStatus.Supplied, h.Supply.StatusOf(home));
        Assert.Equal(SupplyStatus.CutOff, h.Supply.StatusForStackIn(stranger, home));
    }

    /* One province over the border is still fed: the penalty is for outrunning
       your own ground, not for crossing it. */
    [Fact]
    public void AStackJustAcrossTheBorderIsStillFed()
    {
        Harness h = Setup();

        int home = -1;
        int abroad = -1;

        for (int i = 0; i < h.State.Provinces.Count && abroad < 0; i++)
        {
            if (h.State.Provinces.Controller[i] != h.Owner
                || h.Supply.StatusOf(i) != SupplyStatus.Supplied)
            {
                continue;
            }

            foreach (ushort neighbour in h.Data.Land.NeighboursOf(i))
            {
                if (h.State.Provinces.Controller[neighbour] != h.Owner)
                {
                    home = i;
                    abroad = neighbour;
                    break;
                }
            }
        }

        Assert.True(abroad >= 0, "Indonesia has no foreign land neighbour in the fixture.");
        Assert.NotEqual(SupplyStatus.CutOff, h.Supply.StatusForStackIn(h.Owner, abroad));
        Assert.Equal(SupplyStatus.Supplied, h.Supply.StatusOf(home));
    }

    [Fact]
    public void SupplyMultipliersFollowTheStackNotTheGround()
    {
        Harness h = Setup();
        int home = HomeProvinceOf(h, h.Owner);
        ushort stranger = (ushort)h.State.Nations.IndexOf("BRA");

        Assert.Equal(1f, h.Supply.AttackMultiplierForStackIn(h.Owner, home), 3);
        Assert.Equal(SupplySystem.CutOffAttack, h.Supply.AttackMultiplierForStackIn(stranger, home), 3);
        Assert.Equal(SupplySystem.CutOffDefence, h.Supply.DefenceMultiplierForStackIn(stranger, home), 3);
    }
}
