using NationRise.Core.Diplomacy;
using NationRise.Core.Military;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Military;

/*
   The world used to field 400 stacks between 247 nations because only nations
   already at war raised any. These tests hold the replacement to the property
   that mattered: everybody who holds ground keeps an army.
*/
public class ArmyPolicyTests
{
    private static (WorldState State, Relations Relations, ArmyPolicy Policy) Setup()
    {
        WorldState state = WorldFixture.Load().ToWorldState(1);
        var relations = new Relations(state.Nations.Count);
        return (state, relations, new ArmyPolicy(state, relations));
    }

    [Fact]
    public void ANationAtPeaceStillKeepsAnArmy()
    {
        var (state, _, policy) = Setup();
        int idn = state.Nations.IndexOf("IDN");

        Assert.True(policy.TargetFor(idn) > 0);
        Assert.True(policy.WantsMore(idn, 0));
    }

    [Fact]
    public void EveryNationHoldingGroundWantsSomething()
    {
        var (state, _, policy) = Setup();

        var landed = new HashSet<int>();
        for (int i = 0; i < state.Provinces.Count; i++)
        {
            ushort controller = state.Provinces.Controller[i];
            if (controller < state.Nations.Count)
            {
                landed.Add(controller);
            }
        }

        Assert.True(landed.Count > 100, "Fixture should have most of the world owned.");
        Assert.All(landed, nation => Assert.True(policy.TargetFor(nation) >= ArmyPolicy.Standing));
    }

    [Fact]
    public void ANationWithNoGroundWantsNothing()
    {
        var (state, relations, policy) = Setup();
        int idn = state.Nations.IndexOf("IDN");
        ushort conqueror = (ushort)state.Nations.IndexOf("AUS");

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Controller[i] == idn)
            {
                state.Provinces.Controller[i] = conqueror;
            }
        }

        Assert.Equal(0, policy.TargetFor(idn));
        Assert.False(policy.WantsMore(idn, 0));
        Assert.True(relations is not null);
    }

    [Fact]
    public void MoreCitiesMeansAExpectedLargerArmy()
    {
        var (state, _, policy) = Setup();
        int idn = state.Nations.IndexOf("IDN");

        int before = policy.TargetFor(idn);

        int added = 0;
        for (int i = 0; i < state.Provinces.Count && added < 3; i++)
        {
            if (state.Provinces.Controller[i] == idn && !state.Provinces.IsCity[i])
            {
                state.Provinces.IsCity[i] = true;
                added++;
            }
        }

        Assert.Equal(3, added);
        Assert.Equal(before + 3 * ArmyPolicy.PerCity, policy.TargetFor(idn));
    }

    [Fact]
    public void WarRaisesTheIntentRatherThanCreatingIt()
    {
        var (state, relations, policy) = Setup();
        ushort idn = (ushort)state.Nations.IndexOf("IDN");
        ushort aus = (ushort)state.Nations.IndexOf("AUS");

        int peace = policy.TargetFor(idn);
        relations.Set(idn, aus, Relation.War);
        int war = policy.TargetFor(idn);

        Assert.True(peace > 0);
        Assert.True(war > peace, $"War target {war} should exceed peacetime {peace}.");
    }

    /* Without a ceiling the largest empires would price the whole world out of
       the market on their own. */
    [Fact]
    public void TheLargestNationsAreCapped()
    {
        var (state, _, policy) = Setup();

        for (int nation = 0; nation < state.Nations.Count; nation++)
        {
            Assert.InRange(policy.TargetFor(nation), 0, ArmyPolicy.Ceiling);
        }
    }
}
