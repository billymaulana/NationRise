using NationRise.Core.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Data;

public class WorldFileTests
{
    private static string WorldPath()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "game", "data", "world.bin")))
        {
            dir = dir.Parent;
        }

        return dir is null
            ? throw new FileNotFoundException("world.bin not found; run the map pipeline first.")
            : Path.Combine(dir.FullName, "game", "data", "world.bin");
    }

    private static WorldData Load()
    {
        using var stream = File.OpenRead(WorldPath());
        return WorldFile.Read(stream);
    }

    [Fact]
    public void RealWorldFileLoads()
    {
        var world = Load();

        Assert.True(world.ProvinceCount > 1500);
        Assert.True(world.NationTags.Length > 150);
    }

    [Fact]
    public void IndonesiaHasTheProvincesTheMapResearchFixed()
    {
        var world = Load();
        var state = world.ToWorldState(1);
        int idn = state.Nations.IndexOf("IDN");

        Assert.True(idn >= 0);

        int provinces = 0;
        int cities = 0;
        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Owner[i] != idn)
            {
                continue;
            }

            provinces++;
            if (state.Provinces.IsCity[i])
            {
                cities++;
            }
        }

        Assert.Equal(54, provinces);
        Assert.Equal(12, cities);
    }

    [Fact]
    public void EveryProvinceHasAnOwnerAndTerrain()
    {
        var state = Load().ToWorldState(1);

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            Assert.NotEqual(ProvinceStore.NoOwner, state.Provinces.Owner[i]);
            Assert.InRange((int)state.Provinces[i].Terrain, 0, 12);
        }
    }

    [Fact]
    public void AdjacencyIsSymmetric()
    {
        var world = Load();

        for (int a = 0; a < world.ProvinceCount; a++)
        {
            foreach (ushort b in world.Land.NeighboursOf(a))
            {
                Assert.Contains(a, world.Land.NeighboursOf(b).ToArray().Select(x => (int)x));
            }
        }
    }

    [Fact]
    public void IndonesiaIsFullyConnected()
    {
        var world = Load();
        var state = world.ToWorldState(1);
        int idn = state.Nations.IndexOf("IDN");

        for (int i = 0; i < state.Provinces.Count; i++)
        {
            if (state.Provinces.Owner[i] != idn)
            {
                continue;
            }

            int links = world.Land.NeighboursOf(i).Length + world.Sea.NeighboursOf(i).Length;
            Assert.True(links > 0, $"Province {i} is unreachable.");
        }
    }

    [Fact]
    public void VictoryPointsMatchTheDesignFigure()
    {
        var state = Load().ToWorldState(1);
        int idn = state.Nations.IndexOf("IDN");

        Assert.InRange(state.VictoryPointsOf((ushort)idn), 90, 105);
    }

    [Fact]
    public void WrongMagicIsRejected()
    {
        using var stream = new MemoryStream(new byte[64]);
        Assert.Throws<WorldFileException>(() => WorldFile.Read(stream));
    }
}
