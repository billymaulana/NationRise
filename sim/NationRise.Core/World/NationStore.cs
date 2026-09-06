namespace NationRise.Core.World;

public enum Doctrine : byte
{
    Western = 0,
    Eastern = 1,
    European = 2,
}

public sealed class NationStore
{
    public int Count { get; }

    public string[] Tag { get; }
    public string[] Name { get; }
    public Doctrine[] Doctrine { get; }
    public int[] CapitalProvince { get; }
    public bool[] IsAlive { get; }

    public NationStore(int count)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(count);

        Count = count;
        Tag = new string[count];
        Name = new string[count];
        Doctrine = new Doctrine[count];
        CapitalProvince = new int[count];
        IsAlive = new bool[count];

        Array.Fill(Tag, string.Empty);
        Array.Fill(Name, string.Empty);
        Array.Fill(CapitalProvince, -1);
        Array.Fill(IsAlive, true);
    }

    public int IndexOf(string tag)
    {
        for (int i = 0; i < Count; i++)
        {
            if (Tag[i] == tag)
            {
                return i;
            }
        }

        return -1;
    }
}
