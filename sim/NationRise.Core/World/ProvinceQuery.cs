using NationRise.Core.Data;
using NationRise.Core.Economy;

namespace NationRise.Core.World;

public readonly record struct ProvinceSummary(
    int Id,
    string OwnerName,
    string ControllerName,
    bool IsCity,
    float Population,
    Terrain Terrain,
    float Morale,
    Resource Resource,
    bool IsOccupied,
    bool IsContested,
    int LandNeighbours,
    int SeaNeighbours);

/*
   Everything the interface may ask about a single province, gathered in one
   place so panels never reach into the province arrays themselves.

   Names arrive from outside: the simulation binary carries no strings at all,
   and adding them to it would put text the renderer owns inside the file that
   deliberately holds no presentation data.
*/
public sealed class ProvinceQuery
{
    private readonly WorldState _world;
    private readonly WorldData _data;
    private readonly string[] _names;

    public ProvinceQuery(WorldState world, WorldData data, IReadOnlyList<string>? provinceNames = null)
    {
        ArgumentNullException.ThrowIfNull(world);
        ArgumentNullException.ThrowIfNull(data);

        if (data.ProvinceCount != world.Provinces.Count)
        {
            throw new ArgumentException(
                $"World data holds {data.ProvinceCount} provinces but the state holds {world.Provinces.Count}.",
                nameof(data));
        }

        _world = world;
        _data = data;
        _names = new string[world.Provinces.Count];
        Array.Fill(_names, string.Empty);

        if (provinceNames is not null)
        {
            int shared = Math.Min(provinceNames.Count, _names.Length);
            for (int i = 0; i < shared; i++)
            {
                _names[i] = provinceNames[i] ?? string.Empty;
            }
        }
    }

    public int Count => _world.Provinces.Count;

    public string NameOf(int province) => _names[Checked(province)];

    public ProvinceSummary Summarise(int province)
    {
        ProvinceRef p = _world.Provinces[Checked(province)];

        return new ProvinceSummary(
            province,
            NationName(p.Owner),
            NationName(p.Controller),
            p.IsCity,
            p.Population,
            p.Terrain,
            p.Morale,
            _data.ResourceOf(province),
            p.IsOccupied,
            p.IsContested,
            _data.Land.NeighboursOf(province).Length,
            _data.Sea.NeighboursOf(province).Length);
    }

    public (IReadOnlyList<int> Land, IReadOnlyList<int> Sea) NeighboursOf(int province)
    {
        Checked(province);
        return (Ids(_data.Land.NeighboursOf(province)), Ids(_data.Sea.NeighboursOf(province)));
    }

    public int FindCity(string name)
    {
        ArgumentNullException.ThrowIfNull(name);

        string wanted = name.Trim();
        if (wanted.Length == 0)
        {
            return -1;
        }

        for (int i = 0; i < _names.Length; i++)
        {
            if (_world.Provinces.IsCity[i]
                && string.Equals(_names[i], wanted, StringComparison.OrdinalIgnoreCase))
            {
                return i;
            }
        }

        return -1;
    }

    private static int[] Ids(ReadOnlySpan<ushort> neighbours)
    {
        var ids = new int[neighbours.Length];
        for (int i = 0; i < neighbours.Length; i++)
        {
            ids[i] = neighbours[i];
        }

        return ids;
    }

    private string NationName(ushort nation) =>
        nation < _world.Nations.Count ? _world.Nations.Name[nation] : string.Empty;

    private int Checked(int province)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(province);
        ArgumentOutOfRangeException.ThrowIfGreaterThanOrEqual(province, _world.Provinces.Count);
        return province;
    }
}
