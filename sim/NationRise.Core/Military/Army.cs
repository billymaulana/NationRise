namespace NationRise.Core.Military;

public sealed class Army
{
    private readonly List<UnitInstance> _units = [];

    public required int Id { get; init; }
    public required ushort Nation { get; init; }
    public int Province { get; set; }

    /* Set when the stack steps ashore across a sea link. A beachhead has no
       depth to fall back on, which is what makes an opposed landing a gamble
       rather than a free flanking move. */
    public long LandedOnTick { get; set; } = long.MinValue;

    public IReadOnlyList<UnitInstance> Units => _units;
    public int Count => _units.Count;
    public bool IsDestroyed => _units.Count == 0;

    /* A stack moves at the pace of its slowest member, so bringing artillery
       along is a real decision rather than a free upgrade. */
    public float Speed => _units.Count == 0 ? 0f : _units.Min(u => u.Class.Speed);

    public float HitPoints => _units.Sum(u => u.HitPoints);

    public float MaxHitPoints => _units.Sum(u => u.Class.MaxHitPoints);

    public float Health => MaxHitPoints <= 0f ? 0f : HitPoints / MaxHitPoints;

    public void Add(UnitClass unitClass) => _units.Add(new UnitInstance(unitClass));

    public void RemoveDestroyed() => _units.RemoveAll(u => u.HitPoints <= 0f);
}

public sealed class UnitInstance(UnitClass unitClass)
{
    public UnitClass Class { get; } = unitClass;
    public float HitPoints { get; set; } = unitClass.MaxHitPoints;

    /* Damage output falls as a unit is worn down, but never below a quarter:
       a nearly dead formation still fights, it just stops winning. */
    public float HealthPenalty => 0.25f + 0.75f * (HitPoints / Class.MaxHitPoints);

    public void ApplyDamage(float amount) => HitPoints = MathF.Max(0f, HitPoints - amount);
}
