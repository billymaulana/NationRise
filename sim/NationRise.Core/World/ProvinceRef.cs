namespace NationRise.Core.World;

public readonly struct ProvinceRef
{
    private readonly ProvinceStore _store;

    public int Id { get; }

    internal ProvinceRef(ProvinceStore store, int id)
    {
        _store = store;
        Id = id;
    }

    public ushort Owner => _store.Owner[Id];
    public ushort Controller => _store.Controller[Id];
    public Terrain Terrain => (Terrain)_store.Terrain[Id];
    public float Population => _store.Population[Id];
    public byte Infrastructure => _store.Infrastructure[Id];
    public float Development => _store.Development[Id];
    public float Morale => _store.Morale[Id];
    public bool IsCity => _store.IsCity[Id];

    public ReadOnlySpan<ushort> Claims => _store.ClaimsOf(Id);
    public bool IsOccupied => _store.IsOccupied(Id);
    public bool IsContested => _store.IsContested(Id);

    public bool IsClaimedBy(ushort nation) => Claims.Contains(nation);
}
