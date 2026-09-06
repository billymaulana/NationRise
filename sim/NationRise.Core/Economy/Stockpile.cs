namespace NationRise.Core.Economy;

/*
   National reserves as one flat array indexed by nation and resource. Daily
   production lands here; everything that costs anything draws from it.
*/
public sealed class Stockpile
{
    private readonly long[] _amounts;

    public int NationCount { get; }

    public Stockpile(int nationCount)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(nationCount);
        NationCount = nationCount;
        _amounts = new long[nationCount * ResourceInfo.Count];
    }

    public long Get(int nation, Resource resource) => _amounts[Index(nation, resource)];

    public void Add(int nation, Resource resource, long amount) =>
        _amounts[Index(nation, resource)] += amount;

    public bool TrySpend(int nation, Resource resource, long amount)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(amount);
        int i = Index(nation, resource);

        if (_amounts[i] < amount)
        {
            return false;
        }

        _amounts[i] -= amount;
        return true;
    }

    /* Shortages are reported rather than silently clamped: running out is a
       state the rest of the simulation reacts to, not an error to hide. */
    public bool IsShort(int nation, Resource resource) => Get(nation, resource) <= 0;

    private int Index(int nation, Resource resource)
    {
        if ((uint)nation >= (uint)NationCount)
        {
            throw new ArgumentOutOfRangeException(nameof(nation));
        }

        return nation * ResourceInfo.Count + (int)resource;
    }
}
