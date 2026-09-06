using NationRise.Core.World;

namespace NationRise.Core.Tests.World;

public class ProvinceStoreTests
{
    private static ProvinceStore Build(params ushort[][] claimsPerProvince)
    {
        int count = claimsPerProvince.Length;
        var offsets = new int[count + 1];
        var flat = new List<ushort>();

        for (int i = 0; i < count; i++)
        {
            offsets[i] = flat.Count;
            flat.AddRange(claimsPerProvince[i]);
        }

        offsets[count] = flat.Count;
        return new ProvinceStore(count, offsets, flat.ToArray());
    }

    [Fact]
    public void NewStoreHasNoOwners()
    {
        var store = Build([1], [2]);

        Assert.Equal(ProvinceStore.NoOwner, store[0].Owner);
        Assert.Equal(ProvinceStore.NoOwner, store[1].Owner);
    }

    [Fact]
    public void RaggedClaimsMapToCorrectProvince()
    {
        var store = Build([7], [3, 4, 5], [9]);

        Assert.Equal([7], store.ClaimsOf(0).ToArray());
        Assert.Equal([3, 4, 5], store.ClaimsOf(1).ToArray());
        Assert.Equal([9], store.ClaimsOf(2).ToArray());
    }

    [Fact]
    public void ProvinceWithSeveralClaimsIsContested()
    {
        var store = Build([7], [3, 4, 5]);

        Assert.False(store[0].IsContested);
        Assert.True(store[1].IsContested);
    }

    [Fact]
    public void OccupationIsControllerDifferingFromOwner()
    {
        var store = Build([1], [1]);
        store.Owner[0] = 1;
        store.Controller[0] = 1;
        store.Owner[1] = 1;
        store.Controller[1] = 2;

        Assert.False(store[0].IsOccupied);
        Assert.True(store[1].IsOccupied);
    }

    [Fact]
    public void ClaimLookupFindsClaimant()
    {
        var store = Build([3, 4, 5]);

        Assert.True(store[0].IsClaimedBy(4));
        Assert.False(store[0].IsClaimedBy(6));
    }

    [Fact]
    public void MismatchedOffsetLengthIsRejected()
    {
        Assert.Throws<ArgumentException>(
            () => new ProvinceStore(2, new int[2], []));
    }
}
