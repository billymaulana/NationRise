using NationRise.Core.World;

namespace NationRise.Core.Data;

public sealed class WorldFileException(string message) : Exception(message);

/*
   Reads the binary the map pipeline produces. The format carries no geometry:
   the simulation never needs coordinates, and leaving them out makes it
   impossible for rendering concerns to leak in through the data layer.
*/
public static class WorldFile
{
    private const uint Magic = 0x4e525744;
    private const ushort SupportedVersion = 2;

    public static WorldData Read(Stream stream)
    {
        ArgumentNullException.ThrowIfNull(stream);
        using var reader = new BinaryReader(stream, System.Text.Encoding.ASCII, leaveOpen: true);

        uint magic = reader.ReadUInt32();
        if (magic != Magic)
        {
            throw new WorldFileException($"Not a world file: magic 0x{magic:x8}.");
        }

        ushort version = reader.ReadUInt16();
        if (version != SupportedVersion)
        {
            throw new WorldFileException(
                $"World file version {version} is not supported (expected {SupportedVersion}).");
        }

        ushort nationCount = reader.ReadUInt16();
        int provinceCount = checked((int)reader.ReadUInt32());
        _ = reader.ReadUInt32();

        var tags = new string[nationCount];
        for (int i = 0; i < nationCount; i++)
        {
            tags[i] = System.Text.Encoding.ASCII.GetString(reader.ReadBytes(3)).Trim();
        }

        var owner = ReadArray<ushort>(reader, provinceCount, sizeof(ushort), BitConverter.ToUInt16);
        var terrain = reader.ReadBytes(provinceCount);
        var population = ReadArray<float>(reader, provinceCount, sizeof(float), BitConverter.ToSingle);
        var isCity = reader.ReadBytes(provinceCount);
        var resource = reader.ReadBytes(provinceCount);
        var claimOffsets = ReadArray<int>(reader, provinceCount + 1, sizeof(int), BitConverter.ToInt32);
        var claims = ReadArray<ushort>(reader, claimOffsets[provinceCount], sizeof(ushort), BitConverter.ToUInt16);

        var land = ReadGraph(reader, provinceCount);
        var sea = ReadGraph(reader, provinceCount);

        return new WorldData(tags, owner, terrain, population, isCity, resource, claimOffsets, claims, land, sea);
    }

    private static ProvinceGraph ReadGraph(BinaryReader reader, int provinceCount)
    {
        int edgeCount = checked((int)reader.ReadUInt32());
        var offsets = ReadArray<int>(reader, provinceCount + 1, sizeof(int), BitConverter.ToInt32);
        var neighbours = ReadArray<ushort>(reader, edgeCount, sizeof(ushort), BitConverter.ToUInt16);
        return new ProvinceGraph(offsets, neighbours);
    }

    private static T[] ReadArray<T>(BinaryReader reader, int count, int size, Func<byte[], int, T> convert)
    {
        byte[] bytes = reader.ReadBytes(count * size);
        if (bytes.Length != count * size)
        {
            throw new WorldFileException($"Truncated file: expected {count * size} bytes, read {bytes.Length}.");
        }

        var result = new T[count];
        for (int i = 0; i < count; i++)
        {
            result[i] = convert(bytes, i * size);
        }

        return result;
    }
}

public sealed class ProvinceGraph(int[] offsets, ushort[] neighbours)
{
    public ReadOnlySpan<ushort> NeighboursOf(int province)
    {
        int start = offsets[province];
        return neighbours.AsSpan(start, offsets[province + 1] - start);
    }

    public int EdgeCount => neighbours.Length / 2;
}

public sealed class WorldData(
    string[] nationTags,
    ushort[] owner,
    byte[] terrain,
    float[] population,
    byte[] isCity,
    byte[] resource,
    int[] claimOffsets,
    ushort[] claims,
    ProvinceGraph land,
    ProvinceGraph sea)
{
    public string[] NationTags { get; } = nationTags;
    public int ProvinceCount { get; } = owner.Length;
    public ProvinceGraph Land { get; } = land;
    public ProvinceGraph Sea { get; } = sea;

    public Economy.Resource ResourceOf(int province) => (Economy.Resource)resource[province];

    public WorldState ToWorldState(ulong seed)
    {
        var provinces = new ProvinceStore(ProvinceCount, claimOffsets, claims);
        var nations = new NationStore(NationTags.Length);

        for (int i = 0; i < NationTags.Length; i++)
        {
            nations.Tag[i] = NationTags[i];
            nations.Name[i] = NationTags[i];
        }

        for (int i = 0; i < ProvinceCount; i++)
        {
            provinces.Owner[i] = owner[i];
            provinces.Controller[i] = owner[i];
            provinces.Terrain[i] = terrain[i];
            provinces.Population[i] = population[i];
            provinces.IsCity[i] = isCity[i] != 0;
            provinces.Morale[i] = 0.70f;
        }

        return new WorldState(
            provinces,
            nations,
            new Time.GameClock(),
            new Determinism.DeterministicRandom(seed));
    }
}
