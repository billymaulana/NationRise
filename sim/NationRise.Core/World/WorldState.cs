using NationRise.Core.Determinism;
using NationRise.Core.Time;

namespace NationRise.Core.World;

public sealed class WorldState
{
    public ProvinceStore Provinces { get; }
    public NationStore Nations { get; }
    public GameClock Clock { get; }
    public DeterministicRandom Random { get; }

    public WorldState(
        ProvinceStore provinces,
        NationStore nations,
        GameClock clock,
        DeterministicRandom random)
    {
        Provinces = provinces ?? throw new ArgumentNullException(nameof(provinces));
        Nations = nations ?? throw new ArgumentNullException(nameof(nations));
        Clock = clock ?? throw new ArgumentNullException(nameof(clock));
        Random = random ?? throw new ArgumentNullException(nameof(random));
    }

    public int VictoryPointsOf(ushort nation)
    {
        int points = 0;

        for (int i = 0; i < Provinces.Count; i++)
        {
            if (Provinces.Controller[i] != nation)
            {
                continue;
            }

            points += Provinces.IsCity[i]
                ? (int)MathF.Round(Provinces.Population[i])
                : 1;
        }

        return points;
    }
}
