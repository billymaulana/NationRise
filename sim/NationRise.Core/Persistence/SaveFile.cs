using NationRise.Core.Diplomacy;
using NationRise.Core.Economy;
using NationRise.Core.Military;
using NationRise.Core.World;

namespace NationRise.Core.Persistence;

public sealed class SaveFileException(string message) : Exception(message);

/*
   Versioned binary save. The world file holds everything static, so a save
   only needs what changed: ownership, morale, stockpiles, relations, armies
   and the clock. That keeps saves small and makes them survive a map rebuild
   as long as province count matches.
*/
public static class SaveFile
{
    private const uint Magic = 0x4e525356;
    public const ushort CurrentVersion = 1;

    public static void Write(Stream stream, SaveState state)
    {
        ArgumentNullException.ThrowIfNull(stream);
        ArgumentNullException.ThrowIfNull(state);

        using var writer = new BinaryWriter(stream, System.Text.Encoding.UTF8, leaveOpen: true);

        writer.Write(Magic);
        writer.Write(CurrentVersion);
        writer.Write(state.Seed);
        writer.Write(state.Tick);
        writer.Write(state.PlayerNation);

        writer.Write(state.Controller.Length);
        foreach (ushort value in state.Controller)
        {
            writer.Write(value);
        }

        foreach (float value in state.Morale)
        {
            writer.Write(value);
        }

        writer.Write(state.NationCount);
        foreach (long amount in state.Stockpiles)
        {
            writer.Write(amount);
        }

        writer.Write(state.Wars.Count);
        foreach ((int a, int b) in state.Wars)
        {
            writer.Write(a);
            writer.Write(b);
        }

        writer.Write(state.Armies.Count);
        foreach (SavedArmy army in state.Armies)
        {
            writer.Write(army.Id);
            writer.Write(army.Nation);
            writer.Write(army.Province);
            writer.Write(army.Units.Count);

            foreach (SavedUnit unit in army.Units)
            {
                writer.Write(unit.ClassId);
                writer.Write(unit.HitPoints);
            }
        }
    }

    public static SaveState Read(Stream stream)
    {
        ArgumentNullException.ThrowIfNull(stream);
        using var reader = new BinaryReader(stream, System.Text.Encoding.UTF8, leaveOpen: true);

        uint magic = reader.ReadUInt32();
        if (magic != Magic)
        {
            throw new SaveFileException($"Not a save file: magic 0x{magic:x8}.");
        }

        ushort version = reader.ReadUInt16();
        if (version != CurrentVersion)
        {
            throw new SaveFileException(
                $"Save version {version} is not supported (expected {CurrentVersion}).");
        }

        ulong seed = reader.ReadUInt64();
        long tick = reader.ReadInt64();
        ushort player = reader.ReadUInt16();

        int provinceCount = reader.ReadInt32();
        var controller = new ushort[provinceCount];
        for (int i = 0; i < provinceCount; i++)
        {
            controller[i] = reader.ReadUInt16();
        }

        var morale = new float[provinceCount];
        for (int i = 0; i < provinceCount; i++)
        {
            morale[i] = reader.ReadSingle();
        }

        int nationCount = reader.ReadInt32();
        var stockpiles = new long[nationCount * ResourceInfo.Count];
        for (int i = 0; i < stockpiles.Length; i++)
        {
            stockpiles[i] = reader.ReadInt64();
        }

        int warCount = reader.ReadInt32();
        var wars = new List<(int, int)>(warCount);
        for (int i = 0; i < warCount; i++)
        {
            wars.Add((reader.ReadInt32(), reader.ReadInt32()));
        }

        int armyCount = reader.ReadInt32();
        var armies = new List<SavedArmy>(armyCount);
        for (int i = 0; i < armyCount; i++)
        {
            int id = reader.ReadInt32();
            ushort nation = reader.ReadUInt16();
            int provinceId = reader.ReadInt32();
            int unitCount = reader.ReadInt32();

            var units = new List<SavedUnit>(unitCount);
            for (int u = 0; u < unitCount; u++)
            {
                units.Add(new SavedUnit(reader.ReadString(), reader.ReadSingle()));
            }

            armies.Add(new SavedArmy(id, nation, provinceId, units));
        }

        return new SaveState
        {
            Seed = seed,
            Tick = tick,
            PlayerNation = player,
            Controller = controller,
            Morale = morale,
            NationCount = nationCount,
            Stockpiles = stockpiles,
            Wars = wars,
            Armies = armies,
        };
    }
}

public readonly record struct SavedUnit(string ClassId, float HitPoints);

public sealed record SavedArmy(int Id, ushort Nation, int Province, IReadOnlyList<SavedUnit> Units);

public sealed class SaveState
{
    public required ulong Seed { get; init; }
    public required long Tick { get; init; }
    public required ushort PlayerNation { get; init; }
    public required ushort[] Controller { get; init; }
    public required float[] Morale { get; init; }
    public required int NationCount { get; init; }
    public required long[] Stockpiles { get; init; }
    public required IReadOnlyList<(int A, int B)> Wars { get; init; }
    public required IReadOnlyList<SavedArmy> Armies { get; init; }

    public static SaveState Capture(
        WorldState world,
        Stockpile stockpile,
        Relations relations,
        IReadOnlyDictionary<int, Army> armies,
        ushort playerNation)
    {
        var wars = new List<(int, int)>();
        for (int a = 0; a < relations.NationCount; a++)
        {
            for (int b = a + 1; b < relations.NationCount; b++)
            {
                if (relations.AtWar(a, b))
                {
                    wars.Add((a, b));
                }
            }
        }

        var saved = new List<SavedArmy>();
        foreach (Army army in armies.Values)
        {
            if (army.IsDestroyed)
            {
                continue;
            }

            var units = army.Units
                .Select(u => new SavedUnit(u.Class.Id, u.HitPoints))
                .ToList();

            saved.Add(new SavedArmy(army.Id, army.Nation, army.Province, units));
        }

        var stockpiles = new long[world.Nations.Count * ResourceInfo.Count];
        for (int nation = 0; nation < world.Nations.Count; nation++)
        {
            foreach (Resource resource in Enum.GetValues<Resource>())
            {
                stockpiles[nation * ResourceInfo.Count + (int)resource] =
                    stockpile.Get(nation, resource);
            }
        }

        return new SaveState
        {
            Seed = world.Random.Seed,
            Tick = world.Clock.Tick,
            PlayerNation = playerNation,
            Controller = (ushort[])world.Provinces.Controller.Clone(),
            Morale = (float[])world.Provinces.Morale.Clone(),
            NationCount = world.Nations.Count,
            Stockpiles = stockpiles,
            Wars = wars,
            Armies = saved,
        };
    }

    public void RestoreInto(
        WorldState world,
        Stockpile stockpile,
        Relations relations,
        Dictionary<int, Army> armies)
    {
        if (Controller.Length != world.Provinces.Count)
        {
            throw new SaveFileException(
                $"Save holds {Controller.Length} provinces but the map has {world.Provinces.Count}.");
        }

        Array.Copy(Controller, world.Provinces.Controller, Controller.Length);
        Array.Copy(Morale, world.Provinces.Morale, Morale.Length);
        world.Clock.RestoreTo(Tick);

        for (int nation = 0; nation < NationCount && nation < world.Nations.Count; nation++)
        {
            foreach (Resource resource in Enum.GetValues<Resource>())
            {
                long target = Stockpiles[nation * ResourceInfo.Count + (int)resource];
                long current = stockpile.Get(nation, resource);
                stockpile.Add(nation, resource, target - current);
            }
        }

        for (int a = 0; a < relations.NationCount; a++)
        {
            for (int b = a + 1; b < relations.NationCount; b++)
            {
                relations.Set(a, b, Relation.Peace);
            }
        }

        foreach ((int a, int b) in Wars)
        {
            relations.Set(a, b, Relation.War);
        }

        armies.Clear();
        foreach (SavedArmy saved in Armies)
        {
            var army = new Army { Id = saved.Id, Nation = saved.Nation, Province = saved.Province };
            foreach (SavedUnit unit in saved.Units)
            {
                army.Add(UnitCatalogue.ById(unit.ClassId));
            }

            for (int i = 0; i < army.Units.Count; i++)
            {
                army.Units[i].HitPoints = saved.Units[i].HitPoints;
            }

            armies[army.Id] = army;
        }
    }
}
