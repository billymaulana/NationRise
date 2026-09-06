using NationRise.Core.Military;

namespace NationRise.Core.Economy;

/*
   What happens once a bill goes unpaid.

   Upkeep records a shortfall; until this existed nothing read it, so a nation
   could fail to feed its army every day for a month and suffer nothing. The
   pressure is a ramp rather than a cliff: the first missed day costs little
   and the cost builds, which gives a player days to see it coming and trade
   out of it. A cliff makes the same failure either invisible or instantly
   fatal, and neither of those is a decision.
*/
public sealed class ShortageSystem
{
    /* The shape settled in the resource research: five per cent on the first
       day short, three more for every day after, stopping at fifty. Sixteen
       days from the first missed payment to the floor is what leaves the five
       to ten days of warning the design asks for. */
    public const int StartPermille = 50;
    public const int StepPermille = 30;
    public const int CapPermille = 500;

    public const int DaysToFloor = 1 + ((CapPermille - StartPermille) / StepPermille);

    private readonly int[] _daysShort;

    public ShortageSystem(int nationCount)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(nationCount);
        NationCount = nationCount;
        _daysShort = new int[nationCount * ResourceInfo.Count];
    }

    public int NationCount { get; }

    /*
       A shortage is a bill that went unpaid, not a store that happens to read
       zero. The difference matters: a country with no army and no granary owes
       nothing for food and is in no trouble, and an earlier rule that read the
       store alone put fifteen such countries at the morale floor for the whole
       game over food none of them ever needed.

       The treasury is the one exception. Every province pays money every day,
       so a balance of nothing means the state spent everything it had, which
       is a crisis whatever it owed the army this morning.
    */
    public static bool ReadsEmptyStore(Resource resource) => resource == Resource.Money;

    /* The same line upkeep draws when it decides who burns fuel by the tank
       and who burns it by the jerrycan. Foot troops are safe by design. */
    public static bool BurnsFuel(UnitClass unit)
    {
        ArgumentNullException.ThrowIfNull(unit);
        return unit.Domain != Domain.Land || unit.Armour != ArmourClass.Infantry;
    }

    public int DaysShortOf(int nation, Resource resource) => _daysShort[Index(nation, resource)];

    public int RampPermilleOf(int nation, Resource resource)
    {
        int days = _daysShort[Index(nation, resource)];
        return days <= 0 ? 0 : Math.Min(StartPermille + (StepPermille * (days - 1)), CapPermille);
    }

    public float RampOf(int nation, Resource resource) => RampPermilleOf(nation, resource) / 1000f;

    public bool IsShort(int nation, Resource resource) => _daysShort[Index(nation, resource)] > 0;

    /* One penalty, not two added together: the cap in the research is fifty
       morale for going short, not fifty per good. A nation that is both broke
       and starving is already at the floor. */
    public float MoralePenaltyOf(int nation) => Math.Max(
        RampOf(nation, Resource.Food),
        RampOf(nation, Resource.Money));

    /* Running out of the goods a factory eats stops new work rather than
       weakening the army in the field: a shortage of steel is felt at the
       yards, not at the front, and the research is explicit that this one
       carries no combat penalty at all. */
    public bool IsProductionHalted(int nation) => IsProductionHalted(nation, out _);

    public bool IsProductionHalted(int nation, out Resource missing)
    {
        if (IsShort(nation, Resource.Materials))
        {
            missing = Resource.Materials;
            return true;
        }

        if (IsShort(nation, Resource.Technology))
        {
            missing = Resource.Technology;
            return true;
        }

        missing = Resource.Money;
        return false;
    }

    /*
       How much of a stack's punch the fuel shortage takes away. Only the part
       of it that runs on an engine is weakened, weighed by bulk because that
       is the same figure upkeep bills against, so a rifle battalion attached to
       an armoured division does not suddenly fight at half strength.
    */
    public float AttackMultiplierFor(Army army)
    {
        ArgumentNullException.ThrowIfNull(army);

        float ramp = RampOf(army.Nation, Resource.Fuel);
        if (ramp <= 0f || army.Count == 0)
        {
            return 1f;
        }

        float total = 0f;
        float mechanised = 0f;

        foreach (UnitInstance unit in army.Units)
        {
            float bulk = unit.Class.MaxHitPoints;
            total += bulk;

            if (BurnsFuel(unit.Class))
            {
                mechanised += bulk;
            }
        }

        return total <= 0f ? 1f : 1f - (ramp * mechanised / total);
    }

    /*
       A stack already moves at the pace of its slowest member, so a fuel
       shortage is applied to each unit's own speed before that minimum is
       taken. Dry tanks therefore drag a mixed column down instead of being
       averaged away by the infantry marching beside them.
    */
    public float SpeedMultiplierFor(Army army)
    {
        ArgumentNullException.ThrowIfNull(army);

        float ramp = RampOf(army.Nation, Resource.Fuel);
        if (ramp <= 0f || army.Count == 0)
        {
            return 1f;
        }

        float raw = float.MaxValue;
        float slowed = float.MaxValue;

        foreach (UnitInstance unit in army.Units)
        {
            float speed = unit.Class.Speed;
            raw = MathF.Min(raw, speed);
            slowed = MathF.Min(slowed, BurnsFuel(unit.Class) ? speed * (1f - ramp) : speed);
        }

        return raw <= 0f ? 1f : slowed / raw;
    }

    public void RunDay(Stockpile stockpile, UpkeepSystem? upkeep = null)
    {
        ArgumentNullException.ThrowIfNull(stockpile);

        for (int nation = 0; nation < NationCount; nation++)
        {
            for (int i = 0; i < ResourceInfo.Count; i++)
            {
                var resource = (Resource)i;
                bool isShort = (upkeep?.ShortfallOf(nation, resource) ?? 0) > 0
                    || (ReadsEmptyStore(resource) && stockpile.IsShort(nation, resource));

                int index = Index(nation, resource);

                /* Recovery walks back down the same ramp it climbed: the day
                   a nation starts paying again it is not instantly whole, but
                   it is visibly getting better, which is what makes buying
                   your way out of a shortage feel like it worked. */
                _daysShort[index] = isShort
                    ? Math.Min(_daysShort[index] + 1, DaysToFloor)
                    : Math.Max(_daysShort[index] - 1, 0);
            }
        }
    }

    private int Index(int nation, Resource resource)
    {
        if ((uint)nation >= (uint)NationCount)
        {
            throw new ArgumentOutOfRangeException(nameof(nation));
        }

        return (nation * ResourceInfo.Count) + (int)resource;
    }
}
