using NationRise.Core.Data;
using NationRise.Core.Determinism;
using NationRise.Core.Military;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Military;

public class StanceTests
{
    private sealed class Fixture
    {
        internal Fixture()
        {
            Data = WorldFixture.Load();
            State = Data.ToWorldState(1);
            Supply = new SupplySystem(State, Data.Land, Data.Sea);
            Stances = new StanceSystem(State, Supply);
            Nation = (ushort)State.Nations.IndexOf("IDN");
        }

        internal WorldData Data { get; }
        internal WorldState State { get; }
        internal SupplySystem Supply { get; }
        internal StanceSystem Stances { get; }
        internal ushort Nation { get; }

        internal int Field => ProvinceOf(city: false);
        internal int City => ProvinceOf(city: true);

        internal void Advance(int hours)
        {
            for (int i = 0; i < hours; i++)
            {
                State.Clock.Advance();
                Stances.Tick();
            }
        }

        internal Army Stack(int id, int province, params UnitClass[] units)
            => Stack(id, Nation, province, units);

        internal static Army Stack(int id, ushort nation, int province, params UnitClass[] units)
        {
            var army = new Army { Id = id, Nation = nation, Province = province };
            foreach (UnitClass unit in units)
            {
                army.Add(unit);
            }

            return army;
        }

        internal Army Rifles(int id, int province, int count = 1)
        {
            var units = new UnitClass[count];
            Array.Fill(units, UnitCatalogue.MotorizedInfantry);
            return Stack(id, province, units);
        }

        private int ProvinceOf(bool city)
        {
            for (int i = 0; i < State.Provinces.Count; i++)
            {
                if (State.Provinces.Controller[i] == Nation
                    && State.Provinces.IsCity[i] == city
                    && Supply.StatusOf(i) == SupplyStatus.Supplied)
                {
                    return i;
                }
            }

            throw new InvalidOperationException($"No supplied Indonesian province with IsCity={city}.");
        }

        /* Handing a province to a nation that owns no ground anywhere near it
           severs it from every city that nation holds, which is the only way to
           reach a genuinely unsupplied position on a map that starts whole. */
        internal (int Province, ushort Invader) Sever()
        {
            int target = Field;
            ushort invader = InvaderFarFrom(target);

            State.Provinces.Controller[target] = invader;
            Supply.OnControlChanged(Nation, invader);

            return (target, invader);
        }

        private ushort InvaderFarFrom(int province)
        {
            var neighbours = new List<int>();
            foreach (ushort neighbour in Data.Land.NeighboursOf(province))
            {
                neighbours.Add(neighbour);
            }

            foreach (ushort neighbour in Data.Sea.NeighboursOf(province))
            {
                neighbours.Add(neighbour);
            }

            for (int nation = 0; nation < State.Nations.Count; nation++)
            {
                if (nation == Nation || !HoldsACity((ushort)nation))
                {
                    continue;
                }

                if (neighbours.Any(n => State.Provinces.Controller[n] == nation))
                {
                    continue;
                }

                return (ushort)nation;
            }

            throw new InvalidOperationException($"Every nation with a city borders province {province}.");
        }

        private bool HoldsACity(ushort nation)
        {
            for (int i = 0; i < State.Provinces.Count; i++)
            {
                if (State.Provinces.IsCity[i] && State.Provinces.Controller[i] == nation)
                {
                    return true;
                }
            }

            return false;
        }
    }

    private static readonly StanceKind[] AllStances = Enum.GetValues<StanceKind>();

    [Fact]
    public void EachStanceCarriesTheMultipliersTheResearchFixed()
    {
        Assert.Equal(6, AllStances.Length);

        Assert.Equal(1.15f, StanceSystem.AttackMultiplier(StanceKind.Assault), 4);
        Assert.Equal(1.10f, StanceSystem.DamageTakenMultiplier(StanceKind.Assault), 4);

        Assert.Equal(1f, StanceSystem.AttackMultiplier(StanceKind.Hold), 4);
        Assert.Equal(1f, StanceSystem.DamageTakenMultiplier(StanceKind.Hold), 4);
        Assert.Equal(1f, StanceSystem.EntrenchmentCap(StanceKind.Hold), 4);

        Assert.Equal(0.50f, StanceSystem.EntrenchmentCap(StanceKind.Ambush), 4);

        Assert.Equal(0.70f, StanceSystem.AttackMultiplier(StanceKind.Screen), 4);
        Assert.Equal(0.80f, StanceSystem.DamageTakenMultiplier(StanceKind.Screen), 4);

        Assert.Equal(0.80f, StanceSystem.AttackMultiplier(StanceKind.Raid), 4);
        Assert.Equal(1.20f, StanceSystem.SpeedMultiplier(StanceKind.Raid), 4);

        foreach (StanceKind kind in AllStances)
        {
            if (kind != StanceKind.Raid)
            {
                Assert.Equal(1f, StanceSystem.SpeedMultiplier(kind), 4);
            }
        }
    }

    [Fact]
    public void EveryStanceReachesTheArmyThatAdoptedIt()
    {
        var f = new Fixture();
        int province = f.Field;

        var armies = new Dictionary<StanceKind, Army>();
        int id = 1;

        foreach (StanceKind kind in AllStances)
        {
            Army army = f.Rifles(id++, province);
            Terrain terrain = kind == StanceKind.Ambush ? Terrain.Forest : Terrain.OpenGround;

            Assert.True(f.Stances.Set(army, kind, terrain, out string reason), reason);
            armies[kind] = army;
        }

        f.Advance(StanceSystem.ReorganisationTicks);

        foreach (StanceKind kind in AllStances)
        {
            int armyId = armies[kind].Id;
            float dugIn = f.Stances.EntrenchmentOf(armyId);

            Assert.False(f.Stances.IsReorganising(armyId));
            Assert.Equal(StanceSystem.AttackMultiplier(kind), f.Stances.AttackMultiplierFor(armyId), 4);
            Assert.Equal(StanceSystem.SpeedMultiplier(kind), f.Stances.SpeedMultiplierFor(armyId), 4);

            /* Digging starts on the tick the reorganisation ends, so the two
               stances that dig already own a sliver of a trench here. */
            Assert.Equal(StanceSystem.Entrenches(kind), dugIn > 0f);
            Assert.Equal(
                StanceSystem.DamageTakenMultiplier(kind)
                    * StanceSystem.EntrenchmentDamageTaken(dugIn, inCity: false),
                f.Stances.DamageTakenMultiplierFor(armyId),
                4);
        }
    }

    [Fact]
    public void AStanceIsNeutralForSixTicksBeforeItBites()
    {
        var f = new Fixture();
        Army army = f.Rifles(1, f.Field);

        Assert.True(f.Stances.Set(army, StanceKind.Assault, Terrain.OpenGround, out _));

        for (int tick = 1; tick < StanceSystem.ReorganisationTicks; tick++)
        {
            f.Advance(1);

            Assert.True(f.Stances.IsReorganising(army.Id));
            Assert.Equal(StanceKind.Assault, f.Stances.StanceOf(army.Id));
            Assert.Null(f.Stances.EffectiveStanceOf(army.Id));
            Assert.Equal(1f, f.Stances.AttackMultiplierFor(army.Id), 4);
            Assert.Equal(1f, f.Stances.DamageTakenMultiplierFor(army.Id), 4);
        }

        f.Advance(1);

        Assert.False(f.Stances.IsReorganising(army.Id));
        Assert.Equal(StanceKind.Assault, f.Stances.EffectiveStanceOf(army.Id));
        Assert.Equal(1.15f, f.Stances.AttackMultiplierFor(army.Id), 4);
        Assert.Equal(1.10f, f.Stances.DamageTakenMultiplierFor(army.Id), 4);
    }

    [Fact]
    public void SwitchingStanceCostsAnotherSixTicks()
    {
        var f = new Fixture();
        Army army = f.Rifles(1, f.Field);

        Assert.True(f.Stances.Set(army, StanceKind.Assault, Terrain.OpenGround, out _));
        f.Advance(StanceSystem.ReorganisationTicks);
        Assert.Equal(1.15f, f.Stances.AttackMultiplierFor(army.Id), 4);

        Assert.True(f.Stances.Set(army, StanceKind.Screen, Terrain.OpenGround, out _));

        f.Advance(StanceSystem.ReorganisationTicks - 1);
        Assert.True(f.Stances.IsReorganising(army.Id));
        Assert.Equal(1f, f.Stances.AttackMultiplierFor(army.Id), 4);

        f.Advance(1);
        Assert.Equal(0.70f, f.Stances.AttackMultiplierFor(army.Id), 4);
    }

    [Fact]
    public void RepeatingTheStandingOrderChangesNothing()
    {
        var f = new Fixture();
        Army army = f.Rifles(1, f.Field);

        Assert.True(f.Stances.Set(army, StanceKind.Hold, Terrain.OpenGround, out _));
        f.Advance(StanceSystem.ReorganisationTicks + 24);

        float dugIn = f.Stances.EntrenchmentOf(army.Id);
        Assert.True(dugIn > 0f);

        Assert.True(f.Stances.Set(army, StanceKind.Hold, Terrain.OpenGround, out _));

        Assert.False(f.Stances.IsReorganising(army.Id));
        Assert.Equal(dugIn, f.Stances.EntrenchmentOf(army.Id), 4);
    }

    [Fact]
    public void HoldDigsTenPercentADayAndStopsAtFull()
    {
        var f = new Fixture();
        Army army = f.Rifles(1, f.Field);

        Assert.True(f.Stances.Set(army, StanceKind.Hold, Terrain.OpenGround, out _));
        f.Advance(StanceSystem.ReorganisationTicks);

        float start = f.Stances.EntrenchmentOf(army.Id);
        f.Advance(24);
        Assert.Equal(StanceSystem.DailyEntrenchment, f.Stances.EntrenchmentOf(army.Id) - start, 4);

        f.Advance(StanceSystem.MaxDugHours(StanceKind.Hold));
        Assert.Equal(1f, f.Stances.EntrenchmentOf(army.Id), 4);

        f.Advance(240);
        Assert.Equal(1f, f.Stances.EntrenchmentOf(army.Id), 4);
    }

    [Fact]
    public void AmbushDigsOnlyHalfAsDeepAsHold()
    {
        var f = new Fixture();
        Army army = f.Rifles(1, f.Field);

        Assert.True(f.Stances.Set(army, StanceKind.Ambush, Terrain.Jungle, out _));
        f.Advance(StanceSystem.ReorganisationTicks + StanceSystem.MaxDugHours(StanceKind.Hold) + 240);

        Assert.Equal(0.50f, f.Stances.EntrenchmentOf(army.Id), 4);
    }

    [Fact]
    public void AmbushIsRefusedInTheOpenWithAReason()
    {
        var f = new Fixture();
        Army army = f.Rifles(1, f.Field);

        foreach (Terrain terrain in new[] { Terrain.OpenGround, Terrain.Desert, Terrain.Tundra, Terrain.Marsh })
        {
            Assert.False(f.Stances.Set(army, StanceKind.Ambush, terrain, out string reason));
            Assert.Contains("rough terrain", reason, StringComparison.Ordinal);
            Assert.Contains(terrain.ToString(), reason, StringComparison.Ordinal);
        }

        Assert.Null(f.Stances.StanceOf(army.Id));
        Assert.Equal(0, f.Stances.TrackedArmies);
    }

    [Fact]
    public void AmbushIsAllowedWhereverTheGroundGivesCover()
    {
        var f = new Fixture();
        int province = f.Field;
        int id = 1;

        foreach (Terrain terrain in new[]
        {
            Terrain.Forest, Terrain.Jungle, Terrain.Hills, Terrain.Mountains, Terrain.Urban,
        })
        {
            Army army = f.Rifles(id++, province);
            Assert.True(f.Stances.Set(army, StanceKind.Ambush, terrain, out string reason), reason);
        }
    }

    [Fact]
    public void MovingCostsTheTrenchesImmediately()
    {
        var f = new Fixture();
        Army army = f.Rifles(1, f.Field);

        Assert.True(f.Stances.Set(army, StanceKind.Hold, Terrain.OpenGround, out _));
        f.Advance(StanceSystem.ReorganisationTicks + 120);
        Assert.True(f.Stances.EntrenchmentOf(army.Id) > 0f);

        f.Stances.OnArmyMoved(army.Id);

        Assert.Equal(0f, f.Stances.EntrenchmentOf(army.Id), 4);
        Assert.Equal(1f, f.Stances.DamageTakenMultiplierFor(army.Id), 4);
        Assert.Equal(StanceKind.Hold, f.Stances.StanceOf(army.Id));
    }

    [Fact]
    public void DiggingIsTwiceAsFastWhereTheGroundHelps()
    {
        var f = new Fixture();
        int province = f.Field;

        Army open = f.Rifles(1, province);
        Army forest = f.Rifles(2, province);

        Assert.True(f.Stances.Set(open, StanceKind.Hold, Terrain.OpenGround, out _));
        Assert.True(f.Stances.Set(forest, StanceKind.Hold, Terrain.Forest, out _));

        f.Advance(StanceSystem.ReorganisationTicks + 24);

        Assert.Equal(
            2f * f.Stances.EntrenchmentOf(open.Id),
            f.Stances.EntrenchmentOf(forest.Id),
            4);
    }

    [Fact]
    public void BrokenSupplyStopsTheDigging()
    {
        var f = new Fixture();
        (int province, ushort invader) = f.Sever();

        Assert.Equal(SupplyStatus.CutOff, f.Supply.StatusOf(province));

        Army army = Fixture.Stack(1, invader, province, UnitCatalogue.MotorizedInfantry);
        Assert.True(f.Stances.Set(army, StanceKind.Hold, Terrain.OpenGround, out _));

        /* Rations carried forward keep the position workable for the grace
           window, so the digging only has to stop once that runs out. */
        f.Advance(SupplySystem.GraceTicks);

        Assert.False(f.Supply.CanEntrench(province));
        float dugIn = f.Stances.EntrenchmentOf(army.Id);
        Assert.True(dugIn > 0f);

        f.Advance(SupplySystem.GraceTicks);
        Assert.Equal(dugIn, f.Stances.EntrenchmentOf(army.Id), 4);
    }

    [Fact]
    public void ACutOffArmyIsRefusedTheAssaultStance()
    {
        var f = new Fixture();
        (int province, ushort invader) = f.Sever();
        f.Advance(SupplySystem.GraceTicks);

        Army army = Fixture.Stack(1, invader, province, UnitCatalogue.MotorizedInfantry);

        Assert.False(f.Stances.Set(army, StanceKind.Assault, Terrain.OpenGround, out string reason));
        Assert.Contains("cut off", reason, StringComparison.Ordinal);

        Assert.False(f.Stances.Set(army, StanceKind.Ambush, Terrain.Forest, out string ambush));
        Assert.Contains("supplied", ambush, StringComparison.Ordinal);

        Assert.True(f.Stances.Set(army, StanceKind.Hold, Terrain.OpenGround, out _));
    }

    [Fact]
    public void RaidTakesNoGroundAndEveryOtherStanceDoes()
    {
        var f = new Fixture();
        int province = f.Field;
        int id = 1;

        foreach (StanceKind kind in AllStances)
        {
            Army army = f.Rifles(id++, province);
            Terrain terrain = kind == StanceKind.Ambush ? Terrain.Forest : Terrain.OpenGround;
            Assert.True(f.Stances.Set(army, kind, terrain, out string reason), reason);
        }

        f.Advance(StanceSystem.ReorganisationTicks);

        id = 1;
        foreach (StanceKind kind in AllStances)
        {
            Assert.Equal(kind != StanceKind.Raid, f.Stances.CanCapture(id));
            Assert.Equal(kind is not (StanceKind.Hold or StanceKind.Ambush), f.Stances.CanMove(id));
            Assert.Equal(kind != StanceKind.Siege, f.Stances.EngagesEnemyArmies(id));
            Assert.Equal(kind == StanceKind.Siege, f.Stances.AdvancesSiege(id));
            id++;
        }
    }

    [Fact]
    public void RaidingHalvesSupplyInTheProvinceForThreeDays()
    {
        var f = new Fixture();
        int province = f.Field;
        ushort raider = (ushort)(f.Nation == 0 ? 1 : 0);

        Army army = Fixture.Stack(1, raider, province, UnitCatalogue.MotorizedInfantry);
        Assert.True(f.Stances.Set(army, StanceKind.Raid, Terrain.OpenGround, out _));

        f.Advance(StanceSystem.ReorganisationTicks - 1);
        Assert.False(f.Stances.IsRaided(province));

        f.Advance(1);
        Assert.True(f.Stances.IsRaided(province));
        Assert.Equal(0.50f, f.Stances.RaidedSupplyMultiplierOf(province), 4);

        f.Stances.Forget(army.Id);

        f.Advance(StanceSystem.RaidSupplyTicks - 1);
        Assert.True(f.Stances.IsRaided(province));

        f.Advance(1);
        Assert.False(f.Stances.IsRaided(province));
        Assert.Equal(1f, f.Stances.RaidedSupplyMultiplierOf(province), 4);
    }

    [Fact]
    public void RaidingOwnGroundCutsNothing()
    {
        var f = new Fixture();
        int province = f.Field;

        Army army = f.Rifles(1, province);
        Assert.True(f.Stances.Set(army, StanceKind.Raid, Terrain.OpenGround, out _));
        f.Advance(StanceSystem.ReorganisationTicks + 24);

        Assert.False(f.Stances.IsRaided(province));
    }

    [Fact]
    public void ScreenPullsOutOnceItHasLostFortyPercent()
    {
        var f = new Fixture();
        int province = f.Field;

        Army screening = f.Rifles(1, province, 2);
        Army holding = f.Rifles(2, province, 2);

        Assert.True(f.Stances.Set(screening, StanceKind.Screen, Terrain.OpenGround, out _));
        Assert.True(f.Stances.Set(holding, StanceKind.Hold, Terrain.OpenGround, out _));
        f.Advance(StanceSystem.ReorganisationTicks);

        Assert.False(f.Stances.ShouldWithdraw(screening.Id));

        float toJustAbove = screening.MaxHitPoints * (StanceSystem.ScreenWithdrawalHealth + 0.01f);
        Damage(screening, screening.MaxHitPoints - toJustAbove);
        Damage(holding, holding.MaxHitPoints - toJustAbove);

        Assert.True(screening.Health > StanceSystem.ScreenWithdrawalHealth);
        Assert.False(f.Stances.ShouldWithdraw(screening.Id));

        Damage(screening, screening.MaxHitPoints * 0.02f);
        Damage(holding, holding.MaxHitPoints * 0.02f);

        Assert.True(screening.Health < StanceSystem.ScreenWithdrawalHealth);
        Assert.True(f.Stances.ShouldWithdraw(screening.Id));
        Assert.True(f.Stances.RetreatsWithoutPenalty(screening.Id));

        Assert.False(f.Stances.ShouldWithdraw(holding.Id));
        Assert.False(f.Stances.RetreatsWithoutPenalty(holding.Id));
    }

    [Fact]
    public void AmbushHidesUntilTheEnemyHasARealEstimate()
    {
        var f = new Fixture();
        int province = f.Field;

        Army hidden = f.Rifles(1, province);
        Army holding = f.Rifles(2, province);

        Assert.True(f.Stances.Set(hidden, StanceKind.Ambush, Terrain.Forest, out _));
        Assert.True(f.Stances.Set(holding, StanceKind.Hold, Terrain.Forest, out _));

        Assert.False(f.Stances.IsHiddenFrom(hidden.Id, 0));

        f.Advance(StanceSystem.ReorganisationTicks);

        Assert.True(f.Stances.IsHiddenFrom(hidden.Id, 0));
        Assert.True(f.Stances.IsHiddenFrom(hidden.Id, 1));
        Assert.False(f.Stances.IsHiddenFrom(hidden.Id, 2));
        Assert.False(f.Stances.IsHiddenFrom(hidden.Id, 3));
        Assert.False(f.Stances.IsHiddenFrom(holding.Id, 0));
    }

    [Fact]
    public void AssaultBuysItsWayIntoCitiesButNotIntoMountains()
    {
        var f = new Fixture();
        int province = f.Field;

        Army assaulting = f.Rifles(1, province);
        Army holding = f.Rifles(2, province);

        Assert.True(f.Stances.Set(assaulting, StanceKind.Assault, Terrain.OpenGround, out _));
        Assert.True(f.Stances.Set(holding, StanceKind.Hold, Terrain.OpenGround, out _));
        f.Advance(StanceSystem.ReorganisationTicks);

        Assert.Equal(0.85f, f.Stances.CityAssaultMultiplierFor(assaulting.Id), 4);
        Assert.Equal(0.75f, f.Stances.CityAssaultMultiplierFor(holding.Id), 4);

        Assert.Equal(1.15f, f.Stances.AttackMultiplierFor(assaulting.Id, Terrain.OpenGround), 4);
        Assert.Equal(
            StanceSystem.AssaultAttack * StanceSystem.AssaultRoughTerrainAttack,
            f.Stances.AttackMultiplierFor(assaulting.Id, Terrain.Mountains),
            4);
        Assert.Equal(
            StanceSystem.AssaultAttack * StanceSystem.AssaultRoughTerrainAttack,
            f.Stances.AttackMultiplierFor(assaulting.Id, Terrain.Urban),
            4);
        Assert.Equal(1f, f.Stances.AttackMultiplierFor(holding.Id, Terrain.Mountains), 4);
    }

    [Fact]
    public void SwitchingFromHoldToAmbushCapsTheTrenchesAtHalf()
    {
        var f = new Fixture();
        Army army = f.Rifles(1, f.Field);

        Assert.True(f.Stances.Set(army, StanceKind.Hold, Terrain.Forest, out _));
        f.Advance(StanceSystem.ReorganisationTicks + StanceSystem.MaxDugHours(StanceKind.Hold));
        Assert.Equal(1f, f.Stances.EntrenchmentOf(army.Id), 4);

        Assert.True(f.Stances.Set(army, StanceKind.Ambush, Terrain.Forest, out _));

        Assert.Equal(0.50f, f.Stances.EntrenchmentOf(army.Id), 4);
        Assert.True(f.Stances.IsReorganising(army.Id));
    }

    [Fact]
    public void TrenchesKeepProtectingWhileTheStackReorganises()
    {
        var f = new Fixture();
        Army army = f.Rifles(1, f.City);

        Assert.True(f.Stances.Set(army, StanceKind.Hold, Terrain.Urban, out _));
        f.Advance(StanceSystem.ReorganisationTicks + StanceSystem.MaxDugHours(StanceKind.Hold));
        Assert.Equal(0.75f, f.Stances.DamageTakenMultiplierFor(army.Id), 4);

        Assert.True(f.Stances.Set(army, StanceKind.Ambush, Terrain.Urban, out _));

        /* Half the trenches, none of the stance: the multiplier is entrenchment
           alone while the stack is reorganising. */
        Assert.Equal(0.875f, f.Stances.DamageTakenMultiplierFor(army.Id), 4);
    }

    [Fact]
    public void EntrenchmentIsWorthMoreInACityThanInTheField()
    {
        var f = new Fixture();

        Army urban = f.Rifles(1, f.City);
        Army field = f.Rifles(2, f.Field);

        Assert.True(f.Stances.Set(urban, StanceKind.Hold, Terrain.OpenGround, out _));
        Assert.True(f.Stances.Set(field, StanceKind.Hold, Terrain.OpenGround, out _));
        f.Advance(StanceSystem.ReorganisationTicks + StanceSystem.MaxDugHours(StanceKind.Hold));

        Assert.Equal(0.75f, f.Stances.DamageTakenMultiplierFor(urban.Id), 4);
        Assert.Equal(0.90f, f.Stances.DamageTakenMultiplierFor(field.Id), 4);
    }

    [Fact]
    public void AnArmyWithoutOrdersIsNeutralInEveryRespect()
    {
        var f = new Fixture();

        Assert.Null(f.Stances.StanceOf(99));
        Assert.False(f.Stances.IsReorganising(99));
        Assert.Equal(1f, f.Stances.AttackMultiplierFor(99), 4);
        Assert.Equal(1f, f.Stances.DamageTakenMultiplierFor(99), 4);
        Assert.Equal(1f, f.Stances.SpeedMultiplierFor(99), 4);
        Assert.Equal(0f, f.Stances.EntrenchmentOf(99), 4);
        Assert.True(f.Stances.CanCapture(99));
        Assert.True(f.Stances.CanMove(99));
        Assert.False(f.Stances.ShouldWithdraw(99));
        Assert.False(f.Stances.IsHiddenFrom(99, 0));
    }

    [Fact]
    public void DestroyedArmiesStopBeingTracked()
    {
        var f = new Fixture();
        Army army = f.Rifles(1, f.Field);

        Assert.True(f.Stances.Set(army, StanceKind.Hold, Terrain.OpenGround, out _));
        Assert.Equal(1, f.Stances.TrackedArmies);

        Damage(army, army.MaxHitPoints);
        army.RemoveDestroyed();
        f.Advance(1);

        Assert.Equal(0, f.Stances.TrackedArmies);
        Assert.Null(f.Stances.StanceOf(army.Id));
    }

    [Fact]
    public void TickingTwiceInOneHourDigsOnce()
    {
        var f = new Fixture();
        Army army = f.Rifles(1, f.Field);

        Assert.True(f.Stances.Set(army, StanceKind.Hold, Terrain.OpenGround, out _));
        f.Advance(StanceSystem.ReorganisationTicks + 24);

        float dugIn = f.Stances.EntrenchmentOf(army.Id);

        f.Stances.Tick();
        f.Stances.Tick();

        Assert.Equal(dugIn, f.Stances.EntrenchmentOf(army.Id), 4);
    }

    [Fact]
    public void FullyEntrenchedDefendersTakeFarLessOfARealBattle()
    {
        var f = new Fixture();
        int province = f.City;

        Army dugIn = f.Rifles(1, province, 8);
        Assert.True(f.Stances.Set(dugIn, StanceKind.Hold, Terrain.Urban, out _));
        f.Advance(StanceSystem.ReorganisationTicks + StanceSystem.MaxDugHours(StanceKind.Hold));

        Assert.Equal(1f, f.Stances.EntrenchmentOf(dugIn.Id), 4);
        float shielded = f.Stances.DamageTakenMultiplierFor(dugIn.Id);
        Assert.Equal(0.75f, shielded, 4);

        var combat = new Combat(new DeterministicRandom(11));
        Army attacker = Fixture.Stack(
            3, 1, province,
            UnitCatalogue.MainBattleTank,
            UnitCatalogue.MainBattleTank,
            UnitCatalogue.MainBattleTank,
            UnitCatalogue.MainBattleTank);
        Army defender = f.Rifles(4, province, 8);

        float pool = defender.MaxHitPoints;
        float raw = 0f;

        for (int hour = 0; hour < 48 && !defender.IsDestroyed; hour++)
        {
            raw += combat.ResolveHour(attacker, defender, Terrain.Urban).DamageToDefender;
        }

        Assert.True(defender.IsDestroyed);

        float entrenched = raw * shielded;

        Assert.True(
            raw - entrenched > UnitCatalogue.MotorizedInfantry.MaxHitPoints,
            $"Entrenchment only saved {raw - entrenched:0.0} damage out of {raw:0.0}.");

        /* The same battle that wipes an exposed stack leaves a dug-in one
           standing, which is the whole point of paying six ticks for Hold. */
        Assert.True(raw >= pool);
        Assert.True(entrenched < pool, $"Entrenched stack still took {entrenched:0.0} of {pool:0.0}.");
    }

    private static void Damage(Army army, float amount)
    {
        if (army.Count == 0)
        {
            return;
        }

        float share = amount / army.Count;
        foreach (UnitInstance unit in army.Units)
        {
            unit.ApplyDamage(share);
        }
    }
}
