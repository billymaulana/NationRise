using NationRise.Core.Data;
using NationRise.Core.Military;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Military;

public class MovementTests
{
    private static (WorldState State, Pathfinder Finder, WorldData Data) Build()
    {
        var data = WorldFixture.Load();
        var state = data.ToWorldState(1);
        return (state, new Pathfinder(data.Land, data.Sea, state.Provinces.Count), data);
    }

    private static List<int> IndonesianProvinces(WorldState state)
    {
        int idn = state.Nations.IndexOf("IDN");
        var owned = new List<int>();
        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Owner[i] == idn)
            {
                owned.Add(i);
            }
        }

        return owned;
    }

    [Fact]
    public void ArmyTakesTheSpeedOfItsSlowestUnit()
    {
        var army = new Army { Id = 1, Nation = 0, Province = 0 };
        army.Add(UnitCatalogue.MainBattleTank);
        army.Add(UnitCatalogue.TowedArtillery);

        Assert.Equal(UnitCatalogue.TowedArtillery.Speed, army.Speed, 3);
    }

    [Fact]
    public void ArmyArrivesAfterEnoughHours()
    {
        var (state, finder, _) = Build();
        var owned = IndonesianProvinces(state);

        var army = new Army { Id = 1, Nation = 0, Province = owned[0] };
        army.Add(UnitCatalogue.MotorizedInfantry);

        var path = finder.FindPath(owned[0], owned[5],
            (_, to, sea) => MovementCost.HoursFor(state.Provinces[to].Terrain, sea));
        Assert.True(path.Count >= 2);

        var movement = new MovementSystem(state);
        var armies = new Dictionary<int, Army> { [army.Id] = army };
        movement.Order(army, path);

        for (int hour = 0; hour < 500 && movement.IsMoving(army.Id); hour++)
        {
            movement.Tick(armies);
        }

        Assert.Equal(path[^1], army.Province);
        Assert.False(movement.IsMoving(army.Id));
    }

    [Fact]
    public void ArmyPassesThroughEveryProvinceOnItsPath()
    {
        var (state, finder, _) = Build();
        var owned = IndonesianProvinces(state);

        var army = new Army { Id = 7, Nation = 0, Province = owned[0] };
        army.Add(UnitCatalogue.MotorizedInfantry);

        var path = finder.FindPath(owned[0], owned[4],
            (_, to, sea) => MovementCost.HoursFor(state.Provinces[to].Terrain, sea));

        var movement = new MovementSystem(state);
        var armies = new Dictionary<int, Army> { [army.Id] = army };
        movement.Order(army, path);

        var visited = new List<int> { army.Province };
        for (int hour = 0; hour < 500 && movement.IsMoving(army.Id); hour++)
        {
            movement.Tick(armies);
            if (visited[^1] != army.Province)
            {
                visited.Add(army.Province);
            }
        }

        Assert.Equal(path.ToArray(), visited.ToArray());
    }

    [Fact]
    public void OrderMustStartWhereTheArmyIs()
    {
        var (state, _, _) = Build();
        var army = new Army { Id = 2, Nation = 0, Province = 10 };
        army.Add(UnitCatalogue.MotorizedInfantry);

        var movement = new MovementSystem(state);
        Assert.Throws<ArgumentException>(() => movement.Order(army, new[] { 11, 12 }));
    }

    [Fact]
    public void SlowerStacksTakeLonger()
    {
        var (state, finder, _) = Build();
        var owned = IndonesianProvinces(state);
        var path = finder.FindPath(owned[0], owned[5],
            (_, to, sea) => MovementCost.HoursFor(state.Provinces[to].Terrain, sea));

        int HoursFor(UnitClass unit)
        {
            var army = new Army { Id = 1, Nation = 0, Province = owned[0] };
            army.Add(unit);
            var movement = new MovementSystem(state);
            var armies = new Dictionary<int, Army> { [army.Id] = army };
            movement.Order(army, path);

            int hours = 0;
            while (movement.IsMoving(army.Id) && hours < 1000)
            {
                movement.Tick(armies);
                hours++;
            }

            return hours;
        }

        Assert.True(HoursFor(UnitCatalogue.TowedArtillery) > HoursFor(UnitCatalogue.MainBattleTank));
    }

    [Fact]
    public void DamagedUnitsStillFightButLessWell()
    {
        var unit = new UnitInstance(UnitCatalogue.MainBattleTank);
        Assert.Equal(1.0f, unit.HealthPenalty, 3);

        unit.ApplyDamage(unit.Class.MaxHitPoints);
        Assert.Equal(0.25f, unit.HealthPenalty, 3);
        Assert.Equal(0f, unit.HitPoints);
    }
}
