using NationRise.Core.Ai;
using NationRise.Core.Diplomacy;
using NationRise.Core.Military;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Ai;

public class WarPlannerTests
{
    private static (WorldState State, Relations Relations, WarPlanner Planner, ushort Player, ushort Enemy) Setup()
    {
        var data = WorldFixture.Load();
        var state = data.ToWorldState(1);
        var relations = new Relations(state.Nations.Count);

        ushort player = (ushort)state.Nations.IndexOf("IDN");
        ushort enemy = (ushort)state.Nations.IndexOf("MYS");
        relations.Set(player, enemy, Relation.War);

        return (state, relations, new WarPlanner(state, relations, data.Land), player, enemy);
    }

    private static Army Stack(ushort nation, int province)
    {
        var army = new Army { Id = 1, Nation = nation, Province = province };
        army.Add(UnitCatalogue.MotorizedInfantry);
        return army;
    }

    private static int FirstProvinceOf(WorldState state, ushort nation)
    {
        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Controller[i] == nation)
            {
                return i;
            }
        }

        throw new InvalidOperationException("Nation holds no province.");
    }

    [Fact]
    public void NoTargetWithoutAWar()
    {
        var (state, _, planner, player, _) = Setup();
        var peaceful = new Relations(state.Nations.Count);
        var quiet = new WarPlanner(state, peaceful, WorldFixture.Load().Land);

        Assert.Null(quiet.ChooseTarget(Stack(player, FirstProvinceOf(state, player)), new Dictionary<int, Army>()));
    }

    [Fact]
    public void TargetBelongsToAnEnemy()
    {
        var (state, relations, planner, player, _) = Setup();
        var choice = planner.ChooseTarget(Stack(player, FirstProvinceOf(state, player)), new Dictionary<int, Army>());

        Assert.NotNull(choice);
        Assert.True(relations.AtWar(player, state.Provinces.Controller[choice!.Value.Province]));
    }

    [Fact]
    public void CitiesOutrankEmptyGround()
    {
        var (state, _, planner, player, enemy) = Setup();
        var choice = planner.ChooseTarget(Stack(player, FirstProvinceOf(state, player)), new Dictionary<int, Army>());

        Assert.NotNull(choice);
        Assert.Contains(choice!.Value.Reason, new[] { "enemy city", "undefended" });
    }

    [Fact]
    public void DefendedProvincesAreWorthLess()
    {
        var (state, _, planner, player, enemy) = Setup();
        int start = FirstProvinceOf(state, player);

        var undefended = planner.ChooseTarget(Stack(player, start), new Dictionary<int, Army>());
        Assert.NotNull(undefended);

        var garrison = new Army { Id = 99, Nation = enemy, Province = undefended!.Value.Province };
        for (int i = 0; i < 8; i++)
        {
            garrison.Add(UnitCatalogue.MainBattleTank);
        }

        var defended = planner.ChooseTarget(
            Stack(player, start),
            new Dictionary<int, Army> { [99] = garrison });

        Assert.NotNull(defended);
        Assert.NotEqual(undefended.Value.Province, defended!.Value.Province);
    }

    [Fact]
    public void ChoiceExplainsItself()
    {
        var (state, _, planner, player, _) = Setup();
        var choice = planner.ChooseTarget(Stack(player, FirstProvinceOf(state, player)), new Dictionary<int, Army>());

        Assert.NotNull(choice);
        Assert.False(string.IsNullOrWhiteSpace(choice!.Value.Reason));
    }
}
