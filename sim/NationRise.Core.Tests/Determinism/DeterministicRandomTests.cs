using NationRise.Core.Determinism;

namespace NationRise.Core.Tests.Determinism;

public class DeterministicRandomTests
{
    [Fact]
    public void SameSeedProducesSameSequence()
    {
        var a = new DeterministicRandom(20260906);
        var b = new DeterministicRandom(20260906);

        for (int i = 0; i < 1000; i++)
        {
            Assert.Equal(a.NextUInt64(), b.NextUInt64());
        }
    }

    [Fact]
    public void DifferentSeedsDiverge()
    {
        var a = new DeterministicRandom(1);
        var b = new DeterministicRandom(2);

        bool diverged = false;
        for (int i = 0; i < 100 && !diverged; i++)
        {
            diverged = a.NextUInt64() != b.NextUInt64();
        }

        Assert.True(diverged);
    }

    [Fact]
    public void BoundedDrawsStayInRange()
    {
        var rng = new DeterministicRandom(42);

        for (int i = 0; i < 10_000; i++)
        {
            int v = rng.NextInt(10, 20);
            Assert.InRange(v, 10, 19);
        }
    }

    [Fact]
    public void DoubleDrawsStayInUnitInterval()
    {
        var rng = new DeterministicRandom(7);

        for (int i = 0; i < 10_000; i++)
        {
            double v = rng.NextDouble();
            Assert.InRange(v, 0.0, 1.0);
        }
    }

    /* Pins the algorithm itself. SameSeedProducesSameSequence only proves two
       instances agree; this proves they agree with the values a save file was
       written against, so swapping the generator breaks the build not the save. */
    [Fact]
    public void KnownSeedProducesKnownDraws()
    {
        var rng = new DeterministicRandom(20260906);

        Assert.Equal(ExpectedFirstDraws[0], rng.NextUInt64());
        Assert.Equal(ExpectedFirstDraws[1], rng.NextUInt64());
        Assert.Equal(ExpectedFirstDraws[2], rng.NextUInt64());
    }

    private static readonly ulong[] ExpectedFirstDraws =
    [
        16976369440443965981UL,
        14008061297598852737UL,
        7531599346850374646UL,
    ];
}
