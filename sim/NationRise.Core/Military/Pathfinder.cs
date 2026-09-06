using NationRise.Core.Data;

namespace NationRise.Core.Military;

/*
   A* over the province graph. Cost is in game hours, so a path can be reported
   to the player as an arrival time rather than an abstract number, and the
   same routine serves land, sea and mixed movement by swapping the cost
   function instead of the algorithm.
*/
public sealed class Pathfinder(ProvinceGraph land, ProvinceGraph sea, int provinceCount)
{
    private readonly float[] _cost = new float[provinceCount];
    private readonly int[] _cameFrom = new int[provinceCount];
    private readonly bool[] _closed = new bool[provinceCount];

    public delegate float StepCost(int from, int to, bool bySea);

    public IReadOnlyList<int> FindPath(int start, int goal, StepCost stepCost, bool allowSea = true)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(start);
        ArgumentOutOfRangeException.ThrowIfNegative(goal);

        if (start == goal)
        {
            return [start];
        }

        Array.Fill(_cost, float.PositiveInfinity);
        Array.Fill(_cameFrom, -1);
        Array.Clear(_closed);

        var open = new PriorityQueue<int, float>();
        _cost[start] = 0f;
        open.Enqueue(start, 0f);

        while (open.TryDequeue(out int current, out _))
        {
            if (current == goal)
            {
                return Reconstruct(goal);
            }

            if (_closed[current])
            {
                continue;
            }

            _closed[current] = true;

            Relax(current, land.NeighboursOf(current), false, stepCost, open);
            if (allowSea)
            {
                Relax(current, sea.NeighboursOf(current), true, stepCost, open);
            }
        }

        return [];
    }

    private void Relax(
        int current,
        ReadOnlySpan<ushort> neighbours,
        bool bySea,
        StepCost stepCost,
        PriorityQueue<int, float> open)
    {
        foreach (ushort next in neighbours)
        {
            if (_closed[next])
            {
                continue;
            }

            float candidate = _cost[current] + stepCost(current, next, bySea);
            if (candidate >= _cost[next])
            {
                continue;
            }

            _cost[next] = candidate;
            _cameFrom[next] = current;
            open.Enqueue(next, candidate);
        }
    }

    public float CostTo(int province) => _cost[province];

    private List<int> Reconstruct(int goal)
    {
        var path = new List<int>();
        for (int node = goal; node != -1; node = _cameFrom[node])
        {
            path.Add(node);
        }

        path.Reverse();
        return path;
    }
}
