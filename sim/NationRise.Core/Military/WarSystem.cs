using NationRise.Core.Determinism;
using NationRise.Core.Diplomacy;
using NationRise.Core.Economy;
using NationRise.Core.World;

namespace NationRise.Core.Military;

public readonly record struct BattleReport(
    int Province,
    ushort Attacker,
    ushort Defender,
    float DamageToAttacker,
    float DamageToDefender,
    bool AttackerWiped,
    bool DefenderWiped);

/*
   Finds fights and resolves them. Armies do not choose to attack: two hostile
   stacks in the same province are fighting by definition, which is what makes
   the map itself the tactical layer rather than a menu.
*/
public sealed class WarSystem(WorldState world, Relations relations, DeterministicRandom random)
{
    private readonly Combat _combat = new(random);
    private readonly Conquest _conquest = new(world);
    private readonly List<BattleReport> _reports = [];

    /* Optional so the war system can be constructed and tested on its own, but
       once attached these decide as much of a battle as the unit ratings do. */
    public SupplySystem? Supply { get; set; }
    public StanceSystem? Stances { get; set; }

    /* A nation that cannot buy fuel fights with whatever its engines have
       left. It arrives as a modifier rather than as another branch inside the
       damage code, which is the whole reason CombatModifiers exists. */
    public ShortageSystem? Shortage { get; set; }

    public IReadOnlyList<BattleReport> LastReports => _reports;
    public IReadOnlyList<ConquestEvent> LastConquests => _conquest.RecentEvents;

    public void Tick(IReadOnlyDictionary<int, Army> armies)
    {
        _reports.Clear();
        _conquest.ClearEvents();

        var byProvince = new Dictionary<int, List<Army>>();
        foreach (Army army in armies.Values)
        {
            if (army.IsDestroyed)
            {
                continue;
            }

            if (!byProvince.TryGetValue(army.Province, out List<Army>? here))
            {
                here = [];
                byProvince[army.Province] = here;
            }

            here.Add(army);
        }

        foreach ((int province, List<Army> present) in byProvince)
        {
            ResolveProvince(province, present);
        }
    }

    private void ResolveProvince(int province, List<Army> present)
    {
        Terrain terrain = world.Provinces[province].Terrain;

        for (int i = 0; i < present.Count; i++)
        {
            for (int j = i + 1; j < present.Count; j++)
            {
                Army a = present[i];
                Army b = present[j];

                if (a.IsDestroyed || b.IsDestroyed || a.Nation == b.Nation)
                {
                    continue;
                }

                if (!relations.AtWar(a.Nation, b.Nation))
                {
                    continue;
                }

                /* Whoever does not control the ground is the attacker, so a
                   garrison keeps the defensive ratings it deserves. */
                ushort controller = world.Provinces.Controller[province];
                (Army attacker, Army defender) = b.Nation == controller ? (a, b) : (b, a);

                CombatResult result = _combat.ResolveHour(
                    attacker, defender, terrain, world.Clock.Tick,
                    ModifiersFor(attacker, defender, province, terrain));

                _reports.Add(new BattleReport(
                    province, attacker.Nation, defender.Nation,
                    result.DamageToAttacker, result.DamageToDefender,
                    result.AttackerDestroyed, result.DefenderDestroyed));
            }
        }

        foreach (Army army in present)
        {
            if (army.IsDestroyed)
            {
                continue;
            }

            ushort controller = world.Provinces.Controller[province];
            if (army.Nation == controller || !relations.AtWar(army.Nation, controller))
            {
                continue;
            }

            _conquest.TryCapture(army, present);
        }
    }

    private CombatModifiers ModifiersFor(Army attacker, Army defender, int province, Terrain terrain)
    {
        CombatModifiers mods = CombatModifiers.None;

        /* Each side's output is driven by the ratings it is actually using, so
           the attacker's supply scales its attack and the defender's scales its
           defence. Feeding the attack multiplier to both would punish a cut-off
           garrison twice. */
        if (Supply is not null)
        {
            mods = mods
                .WithAttackerAttack(Supply.AttackMultiplierForStackIn(attacker.Nation, attacker.Province))
                .WithDefenderAttack(Supply.DefenceMultiplierForStackIn(defender.Nation, defender.Province));
        }

        /* Both sides are weighed by their own composition: a shortage only
           reaches the part of a stack that runs on an engine, so an infantry
           garrison defending on empty tanks it does not have loses nothing. */
        if (Shortage is not null)
        {
            mods = mods
                .WithAttackerAttack(Shortage.AttackMultiplierFor(attacker))
                .WithDefenderAttack(Shortage.AttackMultiplierFor(defender));
        }

        if (Stances is not null)
        {
            bool inCity = world.Provinces.IsCity[province];

            mods = mods
                .WithAttackerAttack(Stances.AttackMultiplierFor(attacker.Id, terrain))
                .WithAttackerDamageTaken(Stances.DamageTakenMultiplierFor(attacker.Id))
                .WithDefenderAttack(Stances.AttackMultiplierFor(defender.Id, terrain))
                .WithDefenderDamageTaken(Stances.DamageTakenMultiplierFor(defender.Id));

            if (inCity)
            {
                mods = mods.WithAttackerAttack(Stances.CityAssaultMultiplierFor(attacker.Id));
            }
        }

        return mods;
    }
}
