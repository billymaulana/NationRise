using NationRise.Core.Diplomacy;
using NationRise.Core.Economy;
using NationRise.Core.Military;
using NationRise.Core.Persistence;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Persistence;

public class SaveFileTests
{
    private static (WorldState State, Stockpile Stock, Relations Relations, Dictionary<int, Army> Armies) Fresh()
    {
        var state = WorldFixture.Load().ToWorldState(20260906);
        return (state, new Stockpile(state.Nations.Count), new Relations(state.Nations.Count), []);
    }

    private static SaveState RoundTrip(SaveState original)
    {
        using var stream = new MemoryStream();
        SaveFile.Write(stream, original);
        stream.Position = 0;
        return SaveFile.Read(stream);
    }

    [Fact]
    public void EmptyGameSurvivesRoundTrip()
    {
        var (state, stock, relations, armies) = Fresh();
        var saved = SaveState.Capture(state, stock, relations, armies, 0);
        SaveState loaded = RoundTrip(saved);

        Assert.Equal(saved.Seed, loaded.Seed);
        Assert.Equal(saved.Tick, loaded.Tick);
        Assert.Equal(saved.Controller.Length, loaded.Controller.Length);
    }

    [Fact]
    public void OwnershipAndMoraleSurvive()
    {
        var (state, stock, relations, armies) = Fresh();
        state.Provinces.Controller[5] = 42;
        state.Provinces.Morale[5] = 0.31f;

        SaveState loaded = RoundTrip(SaveState.Capture(state, stock, relations, armies, 0));

        Assert.Equal(42, loaded.Controller[5]);
        Assert.Equal(0.31f, loaded.Morale[5], 3);
    }

    [Fact]
    public void StockpilesSurvive()
    {
        var (state, stock, relations, armies) = Fresh();
        stock.Add(7, Resource.Food, 4321);
        stock.Add(7, Resource.Technology, 99);

        SaveState loaded = RoundTrip(SaveState.Capture(state, stock, relations, armies, 7));

        var restored = new Stockpile(state.Nations.Count);
        loaded.RestoreInto(state, restored, relations, armies);

        Assert.Equal(4321, restored.Get(7, Resource.Food));
        Assert.Equal(99, restored.Get(7, Resource.Technology));
    }

    [Fact]
    public void WarsSurvive()
    {
        var (state, stock, relations, armies) = Fresh();
        relations.Set(3, 9, Relation.War);
        relations.Set(11, 40, Relation.War);

        SaveState loaded = RoundTrip(SaveState.Capture(state, stock, relations, armies, 0));

        var restored = new Relations(state.Nations.Count);
        loaded.RestoreInto(state, new Stockpile(state.Nations.Count), restored, armies);

        Assert.True(restored.AtWar(3, 9));
        Assert.True(restored.AtWar(11, 40));
        Assert.False(restored.AtWar(3, 11));
    }

    [Fact]
    public void ArmiesSurviveWithDamage()
    {
        var (state, stock, relations, armies) = Fresh();
        var army = new Army { Id = 3, Nation = 5, Province = 77 };
        army.Add(UnitCatalogue.MainBattleTank);
        army.Add(UnitCatalogue.MotorizedInfantry);
        army.Units[0].ApplyDamage(12f);
        armies[3] = army;

        SaveState loaded = RoundTrip(SaveState.Capture(state, stock, relations, armies, 0));

        var restored = new Dictionary<int, Army>();
        loaded.RestoreInto(state, new Stockpile(state.Nations.Count), new Relations(state.Nations.Count), restored);

        Assert.Single(restored);
        Army back = restored[3];
        Assert.Equal(5, back.Nation);
        Assert.Equal(77, back.Province);
        Assert.Equal(2, back.Count);
        Assert.Equal(33f, back.Units[0].HitPoints, 2);
    }

    /* The point of a deterministic simulation is that a save resumes exactly
       where it left off. If this drifts, replay and debugging both stop
       working, so it is worth an explicit test. */
    [Fact]
    public void SaveResumesToAnIdenticalWorld()
    {
        var (state, stock, relations, armies) = Fresh();
        var economy = new EconomyTick(state, stock);
        for (int i = 0; i < state.Provinces.Count; i++)
        {
            economy.AssignResource(i, Resource.Food);
        }

        for (int day = 0; day < 5; day++)
        {
            economy.RunDay();
            for (int hour = 0; hour < 24; hour++)
            {
                state.Clock.Advance();
            }
        }

        long moneyBefore = stock.Get(0, Resource.Money);
        SaveState loaded = RoundTrip(SaveState.Capture(state, stock, relations, armies, 0));

        var (fresh, freshStock, freshRelations, freshArmies) = Fresh();
        loaded.RestoreInto(fresh, freshStock, freshRelations, freshArmies);

        Assert.Equal(state.Clock.Tick, fresh.Clock.Tick);
        Assert.Equal(moneyBefore, freshStock.Get(0, Resource.Money));
        Assert.Equal(state.VictoryPointsOf(0), fresh.VictoryPointsOf(0));
    }

    [Fact]
    public void WrongMagicIsRejected()
    {
        using var stream = new MemoryStream(new byte[64]);
        Assert.Throws<SaveFileException>(() => SaveFile.Read(stream));
    }

    [Fact]
    public void MapSizeMismatchIsRejected()
    {
        var (state, stock, relations, armies) = Fresh();
        var saved = SaveState.Capture(state, stock, relations, armies, 0);

        var wrongSize = new SaveState
        {
            Seed = saved.Seed,
            Tick = saved.Tick,
            PlayerNation = saved.PlayerNation,
            Controller = new ushort[10],
            Morale = new float[10],
            NationCount = saved.NationCount,
            Stockpiles = saved.Stockpiles,
            Wars = saved.Wars,
            Armies = saved.Armies,
        };

        Assert.Throws<SaveFileException>(() =>
            wrongSize.RestoreInto(state, stock, relations, armies));
    }
}
