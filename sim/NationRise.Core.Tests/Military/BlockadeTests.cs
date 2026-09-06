using NationRise.Core.Data;
using NationRise.Core.Diplomacy;
using NationRise.Core.Military;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Military;

public class BlockadeTests
{
    private sealed record Harness(
        WorldState State,
        WorldData Data,
        Relations Relations,
        Blockade Blockade,
        ushort Player,
        ushort Enemy);

    private static Harness Setup()
    {
        var data = WorldFixture.Load();
        var state = data.ToWorldState(1);
        var relations = new Relations(state.Nations.Count);

        ushort player = (ushort)state.Nations.IndexOf("IDN");
        ushort enemy = (ushort)state.Nations.IndexOf("AUS");
        relations.Set(player, enemy, Relation.War);

        return new Harness(state, data, relations, new Blockade(state, relations, data.Sea), player, enemy);
    }

    private static int CoastalProvinceOf(Harness h, ushort nation)
    {
        for (int i = 0; i < h.State.Provinces.Count; i++)
        {
            if (h.State.Provinces.Controller[i] == nation && h.Blockade.IsCoastal(i))
            {
                return i;
            }
        }

        throw new InvalidOperationException("No coastal province.");
    }

    private static Army Fleet(int id, ushort nation, int province, int ships)
    {
        var army = new Army { Id = id, Nation = nation, Province = province };
        for (int i = 0; i < ships; i++)
        {
            army.Add(UnitCatalogue.Destroyer);
        }

        return army;
    }

    [Fact]
    public void NothingIsBlockadedWithoutFleets()
    {
        var h = Setup();
        h.Blockade.Recompute(new Dictionary<int, Army>());

        Assert.Empty(h.Blockade.Reports);
        Assert.Equal(0, h.Blockade.BlockadedCountOf(h.Player));
    }

    [Fact]
    public void EnemyFleetOnACrossingBlockadesTheCoast()
    {
        var h = Setup();
        int coast = CoastalProvinceOf(h, h.Player);
        int crossing = h.Data.Sea.NeighboursOf(coast)[0];

        var armies = new Dictionary<int, Army> { [1] = Fleet(1, h.Enemy, crossing, 3) };
        h.Blockade.Recompute(armies);

        Assert.True(h.Blockade.IsBlockaded(coast));
        Assert.Equal(h.Enemy, h.Blockade.BlockaderOf(coast));
    }

    [Fact]
    public void NationsAtPeaceDoNotBlockadeEachOther()
    {
        var h = Setup();
        var peaceful = new Relations(h.State.Nations.Count);
        var blockade = new Blockade(h.State, peaceful, h.Data.Sea);

        int coast = CoastalProvinceOf(h, h.Player);
        int crossing = h.Data.Sea.NeighboursOf(coast)[0];

        blockade.Recompute(new Dictionary<int, Army> { [1] = Fleet(1, h.Enemy, crossing, 5) });

        Assert.False(blockade.IsBlockaded(coast));
    }

    /* A patrol boat must not be able to strangle a coastline; the attacker has
       to actually command the water. */
    [Fact]
    public void ADefendedCrossingHoldsOut()
    {
        var h = Setup();
        int coast = CoastalProvinceOf(h, h.Player);
        int crossing = h.Data.Sea.NeighboursOf(coast)[0];

        var armies = new Dictionary<int, Army>
        {
            [1] = Fleet(1, h.Enemy, crossing, 2),
            [2] = Fleet(2, h.Player, crossing, 2),
        };

        h.Blockade.Recompute(armies);
        Assert.False(h.Blockade.IsBlockaded(coast));
    }

    [Fact]
    public void OverwhelmingFleetBreaksThroughTheDefence()
    {
        var h = Setup();
        int coast = CoastalProvinceOf(h, h.Player);
        int crossing = h.Data.Sea.NeighboursOf(coast)[0];

        var armies = new Dictionary<int, Army>
        {
            [1] = Fleet(1, h.Enemy, crossing, 6),
            [2] = Fleet(2, h.Player, crossing, 2),
        };

        h.Blockade.Recompute(armies);
        Assert.True(h.Blockade.IsBlockaded(coast));
    }

    [Fact]
    public void LandArmiesCannotBlockade()
    {
        var h = Setup();
        int coast = CoastalProvinceOf(h, h.Player);
        int crossing = h.Data.Sea.NeighboursOf(coast)[0];

        var infantry = new Army { Id = 1, Nation = h.Enemy, Province = crossing };
        infantry.Add(UnitCatalogue.MotorizedInfantry);
        infantry.Add(UnitCatalogue.MainBattleTank);

        h.Blockade.Recompute(new Dictionary<int, Army> { [1] = infantry });
        Assert.False(h.Blockade.IsBlockaded(coast));
    }

    [Fact]
    public void BlockadeHalvesProduction()
    {
        var h = Setup();
        int coast = CoastalProvinceOf(h, h.Player);
        int crossing = h.Data.Sea.NeighboursOf(coast)[0];

        Assert.Equal(1.0f, h.Blockade.ProductionMultiplierFor(coast), 3);

        h.Blockade.Recompute(new Dictionary<int, Army> { [1] = Fleet(1, h.Enemy, crossing, 4) });

        Assert.Equal(0.5f, h.Blockade.ProductionMultiplierFor(coast), 3);
    }

    [Fact]
    public void BlockadeGrindsMoraleDown()
    {
        var h = Setup();
        int coast = CoastalProvinceOf(h, h.Player);
        int crossing = h.Data.Sea.NeighboursOf(coast)[0];

        h.State.Provinces.Morale[coast] = 0.90f;
        h.Blockade.Recompute(new Dictionary<int, Army> { [1] = Fleet(1, h.Enemy, crossing, 4) });

        for (int day = 0; day < 10; day++)
        {
            h.Blockade.ApplyDailyEffects();
        }

        Assert.True(h.State.Provinces.Morale[coast] < 0.65f);
    }

    /* The whole point on an archipelago: a nation with no coast cannot be
       strangled by fleets, so inland ground stays worth holding. */
    [Fact]
    public void InlandProvincesCannotBeBlockaded()
    {
        var h = Setup();

        int inland = -1;
        for (int i = 0; i < h.State.Provinces.Count && inland < 0; i++)
        {
            if (!h.Blockade.IsCoastal(i))
            {
                inland = i;
            }
        }

        Assert.True(inland >= 0, "Map has no inland province at all.");
        Assert.False(h.Blockade.IsBlockaded(inland));
    }

    [Fact]
    public void IndonesiaIsMostlyCoastalSoBlockadeMatters()
    {
        var h = Setup();

        int coastal = 0;
        int total = 0;

        for (int i = 0; i < h.State.Provinces.Count; i++)
        {
            if (h.State.Provinces.Controller[i] != h.Player)
            {
                continue;
            }

            total++;
            if (h.Blockade.IsCoastal(i))
            {
                coastal++;
            }
        }

        Assert.True(coastal > total / 2, $"Only {coastal} of {total} Indonesian provinces are coastal.");
    }

    [Fact]
    public void FleetRecipesExistForBothWarships()
    {
        Assert.NotNull(UnitRecipes.For("corvette"));
        Assert.NotNull(UnitRecipes.For("destroyer"));
        Assert.Equal(Domain.Sea, UnitCatalogue.Corvette.Domain);
        Assert.Equal(Domain.Sea, UnitCatalogue.Destroyer.Domain);
    }
}
