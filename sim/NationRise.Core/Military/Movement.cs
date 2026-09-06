using NationRise.Core.Data;
using NationRise.Core.Economy;
using NationRise.Core.World;

namespace NationRise.Core.Military;

public sealed class MovementOrder
{
    public required int ArmyId { get; init; }
    public required IReadOnlyList<int> Path { get; init; }

    public int Step { get; private set; }
    public float HoursIntoStep { get; private set; }

    public bool IsComplete => Step >= Path.Count - 1;
    public int NextProvince => Path[Math.Min(Step + 1, Path.Count - 1)];

    public void Advance(float hours) => HoursIntoStep += hours;

    public void CompleteStep()
    {
        Step++;
        HoursIntoStep = 0f;
    }

    public float HoursRemainingInStep(float stepHours) => MathF.Max(0f, stepHours - HoursIntoStep);
}

/*
   Moves armies one game hour at a time. Movement is resolved in the simulation
   tick, never in a frame callback, so a save reloaded mid-march resumes at the
   same point regardless of frame rate.
*/
public sealed class MovementSystem(WorldState world, ProvinceGraph? land = null)
{
    private readonly Dictionary<int, MovementOrder> _orders = [];

    /* Optional so movement stays testable on its own; attached, it is what
       makes a fuel shortage strand an armoured column halfway to the front. */
    public ShortageSystem? Shortage { get; set; }

    public int PendingOrders => _orders.Count;

    public void Order(Army army, IReadOnlyList<int> path)
    {
        ArgumentNullException.ThrowIfNull(army);
        ArgumentNullException.ThrowIfNull(path);

        if (path.Count < 2)
        {
            _orders.Remove(army.Id);
            return;
        }

        if (path[0] != army.Province)
        {
            throw new ArgumentException(
                $"Path starts at {path[0]} but army {army.Id} is in {army.Province}.", nameof(path));
        }

        _orders[army.Id] = new MovementOrder { ArmyId = army.Id, Path = path };
    }

    public void Cancel(int armyId) => _orders.Remove(armyId);

    public bool IsMoving(int armyId) => _orders.ContainsKey(armyId);

    public void Tick(IReadOnlyDictionary<int, Army> armies, float hours = 1f)
    {
        var finished = new List<int>();

        foreach ((int armyId, MovementOrder order) in _orders)
        {
            if (!armies.TryGetValue(armyId, out Army? army) || army.IsDestroyed)
            {
                finished.Add(armyId);
                continue;
            }

            float budget = hours;
            while (budget > 0f && !order.IsComplete)
            {
                float stepHours = StepHours(army, order.NextProvince);
                float remaining = order.HoursRemainingInStep(stepHours);

                if (budget < remaining)
                {
                    order.Advance(budget);
                    budget = 0f;
                    continue;
                }

                budget -= remaining;
                int from = army.Province;
                order.CompleteStep();
                army.Province = order.Path[order.Step];

                if (CrossedWater(from, army.Province))
                {
                    army.LandedOnTick = world.Clock.Tick;
                }
            }

            if (order.IsComplete)
            {
                finished.Add(armyId);
            }
        }

        foreach (int armyId in finished)
        {
            _orders.Remove(armyId);
        }
    }

    private float StepHours(Army army, int destination)
    {
        Terrain terrain = world.Provinces[destination].Terrain;
        float speed = MathF.Max(army.Speed * (Shortage?.SpeedMultiplierFor(army) ?? 1f), 0.1f);
        bool bySea = terrain.IsWater() || CrossedWater(army.Province, destination);
        return MovementCost.HoursFor(terrain, bySea) / speed;
    }

    /* Two provinces joined only through the sea graph require embarking. Without
       the land graph to compare against, every step is treated as overland,
       which is the safe reading rather than a silent free landing. */
    private bool CrossedWater(int from, int to)
    {
        if (land is null || from == to)
        {
            return false;
        }

        foreach (ushort neighbour in land.NeighboursOf(from))
        {
            if (neighbour == to)
            {
                return false;
            }
        }

        return true;
    }
}
