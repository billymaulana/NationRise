using NationRise.Core.Ai;
using NationRise.Core.Determinism;
using NationRise.Core.Diplomacy;
using NationRise.Core.Tests.Data;

namespace NationRise.Core.Tests.Ai;

public class AiTests
{
    [Fact]
    public void ArchetypesDifferInWhatTheyValue()
    {
        var expansionist = ArchetypeWeights.For(Archetype.Expansionist);
        var defender = ArchetypeWeights.For(Archetype.Defender);
        var trader = ArchetypeWeights.For(Archetype.Trader);

        Assert.True(expansionist.WarAppetite > defender.WarAppetite);
        Assert.True(trader.EconomicFocus > expansionist.EconomicFocus);
        Assert.True(defender.Loyalty > expansionist.Loyalty);
    }

    [Fact]
    public void MomentumFavoursTheChoiceAlreadyRunning()
    {
        var momentum = new Momentum();
        var decision = new Decision
        {
            Kind = DecisionKind.DeclareWar,
            Subject = 5,
            Considerations = [new("test", 10f, 1f)],
        };

        Assert.Equal(10f, momentum.AdjustedScore(0, DecisionKind.DeclareWar, decision), 2);

        momentum.Commit(0, DecisionKind.DeclareWar, 5, 0);
        Assert.Equal(45f, momentum.AdjustedScore(0, DecisionKind.DeclareWar, decision), 2);
    }

    [Fact]
    public void CommitmentLocksForTheExpectedTime()
    {
        var momentum = new Momentum();
        momentum.Commit(1, DecisionKind.DeclareWar, 2, 0);

        Assert.True(momentum.IsLocked(1, DecisionKind.DeclareWar, 100));
        Assert.True(momentum.IsLocked(1, DecisionKind.DeclareWar, 719));
        Assert.False(momentum.IsLocked(1, DecisionKind.DeclareWar, 720));
    }

    /* Entering a war must be much harder than staying in one, or nations
       oscillate between declaring and cancelling. */
    [Fact]
    public void ExitThresholdIsLooserThanEntry()
    {
        Assert.True(
            Momentum.EntryThresholdFor(DecisionKind.DeclareWar) >
            Momentum.ExitThresholdFor(DecisionKind.DeclareWar));

        float ratio =
            Momentum.EntryThresholdFor(DecisionKind.DeclareWar) /
            Momentum.ExitThresholdFor(DecisionKind.DeclareWar);

        Assert.True(ratio >= 2.5f);
    }

    [Fact]
    public void DecisionsExplainThemselves()
    {
        var decision = new Decision
        {
            Kind = DecisionKind.DeclareWar,
            Subject = 3,
            Considerations =
            [
                new("relative strength", 40f, 1.2f),
                new("cost of war", -25f, 1.0f),
            ],
        };

        Assert.Equal(23f, decision.Score, 1);
        Assert.Equal("relative strength", decision.Decisive.Name);
        Assert.Contains("relative strength", decision.Explain());
    }

    [Fact]
    public void ArchetypeAssignmentIsDeterministic()
    {
        Archetype[] First() => Assign(20260906);
        Archetype[] Second() => Assign(20260906);

        Assert.Equal(First(), Second());
        Assert.NotEqual(First(), Assign(1));

        static Archetype[] Assign(ulong seed)
        {
            var state = WorldFixture.Load().ToWorldState(seed);
            var brain = new NationBrain(
                state, new Relations(state.Nations.Count), new Momentum(), new DeterministicRandom(seed));

            brain.AssignArchetypes();
            return Enumerable.Range(0, 40).Select(brain.ArchetypeOf).ToArray();
        }
    }

    [Fact]
    public void BigNationsLeanExpansionist()
    {
        var state = WorldFixture.Load().ToWorldState(1);
        var brain = new NationBrain(
            state, new Relations(state.Nations.Count), new Momentum(), new DeterministicRandom(1));

        brain.AssignArchetypes();

        var counts = new Dictionary<Archetype, int>();
        for (int i = 0; i < state.Nations.Count; i++)
        {
            Archetype a = brain.ArchetypeOf(i);
            counts[a] = counts.GetValueOrDefault(a) + 1;
        }

        Assert.True(counts.Count >= 4);
        Assert.All(counts.Values, n => Assert.True(n > 0));
    }
}
