namespace NationRise.Core.World;

public sealed class ProvinceStore
{
    public const ushort NoOwner = ushort.MaxValue;

    public int Count { get; }

    public ushort[] Owner { get; }
    public ushort[] Controller { get; }
    public byte[] Terrain { get; }
    public float[] Population { get; }
    public byte[] ResourceType { get; }
    public ushort[] ResourceAmount { get; }
    public byte[] Infrastructure { get; }
    public float[] Development { get; }
    public float[] Morale { get; }
    public bool[] IsCity { get; }

    /* Claims are ragged: most provinces have one, disputed ones have several.
       Stored as a flat array plus offsets so the hot path stays a single
       contiguous read instead of chasing per-province arrays. */
    private readonly int[] _claimOffsets;
    private readonly ushort[] _claims;

    public ProvinceStore(int count, int[] claimOffsets, ushort[] claims)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(count);
        ArgumentNullException.ThrowIfNull(claimOffsets);
        ArgumentNullException.ThrowIfNull(claims);

        if (claimOffsets.Length != count + 1)
        {
            throw new ArgumentException(
                $"claimOffsets must have {count + 1} entries for {count} provinces.",
                nameof(claimOffsets));
        }

        Count = count;
        Owner = new ushort[count];
        Controller = new ushort[count];
        Terrain = new byte[count];
        Population = new float[count];
        ResourceType = new byte[count];
        ResourceAmount = new ushort[count];
        Infrastructure = new byte[count];
        Development = new float[count];
        Morale = new float[count];
        IsCity = new bool[count];

        _claimOffsets = claimOffsets;
        _claims = claims;

        Array.Fill(Owner, NoOwner);
        Array.Fill(Controller, NoOwner);
    }

    public ProvinceRef this[int id] => new(this, id);

    public ReadOnlySpan<ushort> ClaimsOf(int id)
    {
        int start = _claimOffsets[id];
        return _claims.AsSpan(start, _claimOffsets[id + 1] - start);
    }

    public bool IsOccupied(int id) => Controller[id] != Owner[id];

    public bool IsContested(int id) => ClaimsOf(id).Length > 1;
}
