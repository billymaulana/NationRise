namespace NationRise.Core.Diplomacy;

public enum Relation : byte
{
    Peace = 0,
    RightOfWay = 1,
    SharedIntelligence = 2,
    Ceasefire = 3,
    War = 4,
}

/*
   Relations are symmetric and stored in the lower triangle of a matrix, which
   keeps a 247-nation world at 30 KB instead of 60 and makes it impossible for
   two nations to disagree about whether they are at war.
*/
public sealed class Relations
{
    private readonly Relation[] _matrix;

    public int NationCount { get; }

    public Relations(int nationCount)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(nationCount);
        NationCount = nationCount;
        _matrix = new Relation[nationCount * (nationCount - 1) / 2];
    }

    public Relation Between(int a, int b)
    {
        if (a == b)
        {
            return Relation.Peace;
        }

        return _matrix[IndexOf(a, b)];
    }

    public void Set(int a, int b, Relation relation)
    {
        if (a == b)
        {
            throw new ArgumentException("A nation cannot have a relation with itself.");
        }

        _matrix[IndexOf(a, b)] = relation;
    }

    public bool AtWar(int a, int b) => Between(a, b) == Relation.War;

    public bool MayEnter(int mover, int owner) =>
        mover == owner || Between(mover, owner) is Relation.War or Relation.RightOfWay;

    public IEnumerable<int> EnemiesOf(int nation)
    {
        for (int other = 0; other < NationCount; other++)
        {
            if (other != nation && AtWar(nation, other))
            {
                yield return other;
            }
        }
    }

    private int IndexOf(int a, int b)
    {
        if ((uint)a >= (uint)NationCount || (uint)b >= (uint)NationCount)
        {
            throw new ArgumentOutOfRangeException(nameof(a));
        }

        (int high, int low) = a > b ? (a, b) : (b, a);
        return high * (high - 1) / 2 + low;
    }
}
