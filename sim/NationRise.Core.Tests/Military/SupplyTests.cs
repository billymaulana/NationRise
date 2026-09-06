using NationRise.Core.Data;
using NationRise.Core.Military;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Military;

public class SupplyTests
{
    private readonly record struct Pocket(ushort Nation, int Link, int Isolated);

    private static (WorldState State, WorldData Data) Build()
    {
        var data = WorldFixture.Load();
        return (data.ToWorldState(1), data);
    }

    private static ushort Indonesia(WorldState state) => (ushort)state.Nations.IndexOf("IDN");

    private static List<int> ProvincesOf(WorldState state, ushort nation)
    {
        var owned = new List<int>();

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Controller[i] == nation)
            {
                owned.Add(i);
            }
        }

        return owned;
    }

    private static List<int> NeighboursOf(WorldData data, int province)
    {
        var neighbours = new List<int>();

        foreach (ushort neighbour in data.Land.NeighboursOf(province))
        {
            neighbours.Add(neighbour);
        }

        foreach (ushort neighbour in data.Sea.NeighboursOf(province))
        {
            neighbours.Add(neighbour);
        }

        return neighbours;
    }

    private static ushort InvaderWithoutAFootholdNear(WorldState state, WorldData data, int province)
    {
        var neighbours = NeighboursOf(data, province);
        ushort defender = state.Provinces.Controller[province];

        for (int nation = 0; nation < state.Nations.Count; nation++)
        {
            if (nation == defender || !HoldsACity(state, nation))
            {
                continue;
            }

            if (neighbours.Any(n => state.Provinces.Controller[n] == nation))
            {
                continue;
            }

            return (ushort)nation;
        }

        throw new InvalidOperationException($"Every nation with a city borders province {province}.");
    }

    private static bool HoldsACity(WorldState state, int nation)
    {
        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.IsCity[i] && state.Provinces.Controller[i] == nation)
            {
                return true;
            }
        }

        return false;
    }

    /* A province whose only same-nation neighbour is a single ordinary
       province is an encirclement waiting to happen: the graph alone says
       taking that one link must strand it, so the assertion does not depend on
       the supply code agreeing with itself. */
    private static Pocket FindLeafPocket(WorldState state, WorldData data, SupplySystem supply)
    {
        for (int isolated = 0; isolated < state.Provinces.Count; isolated++)
        {
            if (state.Provinces.IsCity[isolated] || supply.StatusOf(isolated) != SupplyStatus.Supplied)
            {
                continue;
            }

            ushort nation = state.Provinces.Controller[isolated];
            int link = SoleNeighbourWithin(state, data, isolated, nation);

            if (link < 0 || state.Provinces.IsCity[link] || supply.CutOffProvincesOf(nation).Any())
            {
                continue;
            }

            return new Pocket(nation, link, isolated);
        }

        throw new InvalidOperationException("No province hangs off a single neighbour.");
    }

    private static int SoleNeighbourWithin(WorldState state, WorldData data, int province, ushort nation)
    {
        int only = -1;

        foreach (int neighbour in NeighboursOf(data, province))
        {
            if (state.Provinces.Controller[neighbour] != nation || neighbour == only)
            {
                continue;
            }

            if (only >= 0)
            {
                return -1;
            }

            only = neighbour;
        }

        return only;
    }

    [Fact]
    public void ProvincesHoldingACityAreAlwaysSupplied()
    {
        var (state, data) = Build();
        ushort idn = Indonesia(state);
        var supply = new SupplySystem(state, data.Land, data.Sea);

        var cities = ProvincesOf(state, idn).Where(p => state.Provinces.IsCity[p]).ToList();
        Assert.NotEmpty(cities);

        foreach (int city in cities)
        {
            Assert.Equal(SupplyStatus.Supplied, supply.StatusOf(city));
            Assert.Equal(0, supply.DistanceToSupplyOf(city));
        }
    }

    [Fact]
    public void EveryIndonesianProvinceIsSuppliedAtGameStart()
    {
        var (state, data) = Build();
        ushort idn = Indonesia(state);
        var supply = new SupplySystem(state, data.Land, data.Sea);
        var provinces = ProvincesOf(state, idn);

        Assert.Equal(54, provinces.Count);
        Assert.Empty(supply.CutOffProvincesOf(idn));

        foreach (int province in provinces)
        {
            Assert.Equal(SupplyStatus.Supplied, supply.StatusOf(province));
            Assert.Equal(1f, supply.AttackMultiplierFor(province));
            Assert.Equal(1f, supply.DefenceMultiplierFor(province));
            Assert.True(supply.CanEntrench(province));
            Assert.True(supply.AcceptsReinforcements(province));
        }
    }

    [Fact]
    public void StatusAlwaysAgreesWithGraphDistance()
    {
        var (state, data) = Build();
        var supply = new SupplySystem(state, data.Land, data.Sea);

        for (int province = 0; province < state.Provinces.Count; province++)
        {
            int hops = supply.DistanceToSupplyOf(province);

            switch (supply.StatusOf(province))
            {
                case SupplyStatus.Supplied:
                    Assert.InRange(hops, 0, supply.Range);
                    break;
                case SupplyStatus.Low:
                    Assert.True(hops > supply.Range, $"Province {province} is Low at {hops} hops.");
                    break;
                default:
                    Assert.Equal(SupplySystem.Unreachable, hops);
                    break;
            }
        }
    }

    [Fact]
    public void ProvinceSeveredFromEveryCityIsCutOff()
    {
        var (state, data) = Build();
        ushort idn = Indonesia(state);
        var supply = new SupplySystem(state, data.Land, data.Sea);

        int target = ProvincesOf(state, idn).First(p => !state.Provinces.IsCity[p]);
        ushort invader = InvaderWithoutAFootholdNear(state, data, target);

        state.Provinces.Controller[target] = invader;
        supply.OnControlChanged(idn, invader);

        Assert.Equal(SupplyStatus.CutOff, supply.StatusOf(target));
        Assert.Equal(SupplySystem.Unreachable, supply.DistanceToSupplyOf(target));
        Assert.Contains(target, supply.CutOffProvincesOf(invader));
        Assert.DoesNotContain(target, supply.CutOffProvincesOf(idn));
    }

    [Fact]
    public void FarFromACityButStillConnectedIsLow()
    {
        var (state, data) = Build();
        ushort idn = Indonesia(state);
        var supply = new SupplySystem(state, data.Land, data.Sea);

        var provinces = ProvincesOf(state, idn);
        var cities = provinces.Where(p => state.Provinces.IsCity[p]).ToList();

        /* Twelve sources put every Indonesian province within two hops, so the
           range only becomes visible once one city feeds the whole archipelago. */
        foreach (int source in cities)
        {
            foreach (int city in cities)
            {
                state.Provinces.IsCity[city] = city == source;
            }

            supply.Recompute(idn);

            var low = provinces.Where(p => supply.StatusOf(p) == SupplyStatus.Low).ToList();
            if (low.Count == 0)
            {
                continue;
            }

            Assert.DoesNotContain(provinces, p => supply.StatusOf(p) == SupplyStatus.CutOff);

            foreach (int province in low)
            {
                Assert.True(supply.DistanceToSupplyOf(province) > supply.Range);
                Assert.Equal(SupplySystem.LowAttack, supply.AttackMultiplierFor(province));
                Assert.Equal(1f, supply.DefenceMultiplierFor(province));
                Assert.False(supply.CanEntrench(province));
                Assert.True(supply.AcceptsReinforcements(province));
            }

            return;
        }

        Assert.Fail("No Indonesian province sits beyond supply range of a single city.");
    }

    [Fact]
    public void CutOffProvinceLosesAttackAndDefenceOnceGraceExpires()
    {
        var (state, data) = Build();
        ushort idn = Indonesia(state);
        var supply = new SupplySystem(state, data.Land, data.Sea);

        int target = ProvincesOf(state, idn).First(p => !state.Provinces.IsCity[p]);
        ushort invader = InvaderWithoutAFootholdNear(state, data, target);

        state.Provinces.Controller[target] = invader;
        supply.OnControlChanged(idn, invader);
        state.Clock.AdvanceTo(SupplySystem.GraceTicks);

        Assert.Equal(SupplySystem.CutOffAttack, supply.AttackMultiplierFor(target));
        Assert.Equal(SupplySystem.CutOffDefence, supply.DefenceMultiplierFor(target));
        Assert.False(supply.CanEntrench(target));
        Assert.False(supply.AcceptsReinforcements(target));
        Assert.Equal(SupplySystem.CutOffDailyAttrition, supply.DailyAttritionFor(target));
    }

    [Fact]
    public void NewlyCutOffProvinceKeepsItsStrengthUntilGraceExpires()
    {
        var (state, data) = Build();
        ushort idn = Indonesia(state);
        var supply = new SupplySystem(state, data.Land, data.Sea);

        int target = ProvincesOf(state, idn).First(p => !state.Provinces.IsCity[p]);
        ushort invader = InvaderWithoutAFootholdNear(state, data, target);

        state.Provinces.Controller[target] = invader;
        supply.OnControlChanged(idn, invader);

        Assert.Equal(SupplyStatus.CutOff, supply.StatusOf(target));
        Assert.Equal(SupplySystem.GraceTicks, supply.GraceRemainingOf(target));
        Assert.Equal(1f, supply.AttackMultiplierFor(target));
        Assert.Equal(1f, supply.DefenceMultiplierFor(target));
        Assert.True(supply.AcceptsReinforcements(target));

        state.Clock.AdvanceTo(SupplySystem.GraceTicks - 1);

        Assert.Equal(1, supply.GraceRemainingOf(target));
        Assert.Equal(1f, supply.AttackMultiplierFor(target));
        Assert.Equal(1f, supply.DefenceMultiplierFor(target));

        state.Clock.AdvanceTo(SupplySystem.GraceTicks);

        Assert.Equal(0, supply.GraceRemainingOf(target));
        Assert.Equal(SupplySystem.CutOffAttack, supply.AttackMultiplierFor(target));
    }

    [Fact]
    public void CutOffStackBleedsOnlyAfterItsOwnSuppliesRunOut()
    {
        var (state, data) = Build();
        ushort idn = Indonesia(state);
        var supply = new SupplySystem(state, data.Land, data.Sea);

        int target = ProvincesOf(state, idn).First(p => !state.Provinces.IsCity[p]);
        ushort invader = InvaderWithoutAFootholdNear(state, data, target);

        state.Provinces.Controller[target] = invader;
        supply.OnControlChanged(idn, invader);

        var army = new Army { Id = 1, Nation = invader, Province = target };
        army.Add(UnitCatalogue.MotorizedInfantry);
        float full = army.HitPoints;

        supply.ApplyDailyAttrition(army);
        Assert.Equal(full, army.HitPoints);

        state.Clock.AdvanceTo(SupplySystem.GraceTicks);
        supply.ApplyDailyAttrition(army);

        Assert.Equal(full * (1f - SupplySystem.CutOffDailyAttrition), army.HitPoints, 3);
    }

    [Fact]
    public void CutOffProvincesOfListsExactlyThePocket()
    {
        var (state, data) = Build();
        var supply = new SupplySystem(state, data.Land, data.Sea);
        Pocket pocket = FindLeafPocket(state, data, supply);

        ushort invader = InvaderWithoutAFootholdNear(state, data, pocket.Link);
        state.Provinces.Controller[pocket.Link] = invader;
        supply.OnControlChanged(pocket.Nation, invader);

        Assert.Equal([pocket.Isolated], supply.CutOffProvincesOf(pocket.Nation).ToArray());
    }

    [Fact]
    public void CapturingTheOnlyLinkCutsSupplyBeyondIt()
    {
        var (state, data) = Build();
        var supply = new SupplySystem(state, data.Land, data.Sea);
        Pocket pocket = FindLeafPocket(state, data, supply);

        Assert.Equal(SupplyStatus.Supplied, supply.StatusOf(pocket.Isolated));
        Assert.Equal(SupplyStatus.Supplied, supply.StatusOf(pocket.Link));

        ushort invader = InvaderWithoutAFootholdNear(state, data, pocket.Link);
        state.Provinces.Controller[pocket.Link] = invader;
        supply.OnControlChanged(pocket.Nation, invader);

        Assert.Equal(SupplyStatus.CutOff, supply.StatusOf(pocket.Isolated));
        Assert.Equal(SupplySystem.Unreachable, supply.DistanceToSupplyOf(pocket.Isolated));

        state.Provinces.Controller[pocket.Link] = pocket.Nation;
        supply.OnControlChanged(invader, pocket.Nation);

        Assert.Equal(SupplyStatus.Supplied, supply.StatusOf(pocket.Isolated));
    }

    [Fact]
    public void TheFloodRunsOnTheIntervalRatherThanEveryTick()
    {
        var (state, data) = Build();
        var supply = new SupplySystem(state, data.Land, data.Sea);

        for (int tick = 1; tick < SupplySystem.RecomputeInterval; tick++)
        {
            state.Clock.Advance();
            supply.Tick();

            Assert.False(supply.IsDue);
            Assert.Equal(0, supply.LastComputedTick);
        }

        state.Clock.Advance();
        Assert.True(supply.IsDue);

        supply.Tick();
        Assert.Equal(SupplySystem.RecomputeInterval, supply.LastComputedTick);
    }

    /* A nation with no city can never mobilise, never build, and holds nothing
       but permanently starved ground. Twenty-seven nations began that way
       before the pipeline learned to promote a capital. */
    [Fact]
    public void EveryNationHoldingGroundHasSomewhereToSupplyFrom()
    {
        var data = WorldFixture.Load();
        var state = data.ToWorldState(1);

        var provinces = new Dictionary<ushort, int>();
        var cities = new Dictionary<ushort, int>();

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            ushort nation = state.Provinces.Controller[i];
            if (nation == ProvinceStore.NoOwner)
            {
                continue;
            }

            provinces[nation] = provinces.GetValueOrDefault(nation) + 1;
            if (state.Provinces.IsCity[i])
            {
                cities[nation] = cities.GetValueOrDefault(nation) + 1;
            }
        }

        var starved = provinces.Keys.Where(n => cities.GetValueOrDefault(n) == 0).ToArray();
        Assert.Empty(starved);
    }

    [Fact]
    public void FarFewerProvincesStartCutOff()
    {
        var data = WorldFixture.Load();
        var state = data.ToWorldState(1);
        var supply = new SupplySystem(state, data.Land, data.Sea);
        supply.RecomputeAll();

        int cutOff = 0;
        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (supply.StatusOf(i) == SupplyStatus.CutOff)
            {
                cutOff++;
            }
        }

        /* Genuine exclaves remain, but a map where four per cent of the world
           starts starving is a data fault, not a design. */
        Assert.True(cutOff < state.Provinces.Count / 40, $"{cutOff} provinces start cut off.");
    }
}
