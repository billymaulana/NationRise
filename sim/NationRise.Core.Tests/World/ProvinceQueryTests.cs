using System.Text.Json;
using NationRise.Core.Data;
using NationRise.Core.Economy;
using NationRise.Core.Tests.Data;
using NationRise.Core.World;

namespace NationRise.Core.Tests.World;

public class ProvinceQueryTests
{
    private static string[]? _names;

    /* Province names are not in the simulation binary, which holds no strings
       beyond nation tags, so they come from the geometry file the map pipeline
       writes for the renderer. Its feature ids are the province ids. */
    private static string[] Names(int provinceCount)
    {
        if (_names is not null)
        {
            return _names;
        }

        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "game", "data", "provinces.geojson")))
        {
            dir = dir.Parent;
        }

        if (dir is null)
        {
            throw new FileNotFoundException("provinces.geojson not found; run the map pipeline first.");
        }

        var names = new string[provinceCount];
        Array.Fill(names, string.Empty);

        using var stream = File.OpenRead(Path.Combine(dir.FullName, "game", "data", "provinces.geojson"));
        using var document = JsonDocument.Parse(stream);

        foreach (JsonElement feature in document.RootElement.GetProperty("features").EnumerateArray())
        {
            JsonElement properties = feature.GetProperty("properties");
            int id = properties.GetProperty("id").GetInt32();

            if (id >= 0 && id < names.Length)
            {
                names[id] = properties.GetProperty("name").GetString() ?? string.Empty;
            }
        }

        _names = names;
        return names;
    }

    private static (WorldData Data, WorldState State, ProvinceQuery Query, int Indonesia) Setup()
    {
        var data = WorldFixture.Load();
        var state = data.ToWorldState(1);
        var query = new ProvinceQuery(state, data, Names(data.ProvinceCount));
        return (data, state, query, state.Nations.IndexOf("IDN"));
    }

    private static (WorldState State, WorldData Data) DisputedWorld()
    {
        ushort[][] claimsPerProvince = [[0], [0, 1], [1]];
        var owner = new ushort[] { 0, 0, 1 };
        var claimOffsets = new int[claimsPerProvince.Length + 1];
        var claims = new List<ushort>();

        for (int i = 0; i < claimsPerProvince.Length; i++)
        {
            claimOffsets[i] = claims.Count;
            claims.AddRange(claimsPerProvince[i]);
        }

        claimOffsets[claimsPerProvince.Length] = claims.Count;

        var unlinked = new ProvinceGraph(new int[claimsPerProvince.Length + 1], []);
        var data = new WorldData(
            ["AAA", "BBB"], owner, new byte[3], new float[3], new byte[3], new byte[3],
            claimOffsets, claims.ToArray(), unlinked, unlinked);

        return (data.ToWorldState(1), data);
    }

    [Fact]
    public void SummaryMatchesTheProvinceItDescribes()
    {
        var (data, state, query, idn) = Setup();
        int jakarta = query.FindCity("Jakarta");

        var summary = query.Summarise(jakarta);

        Assert.Equal(jakarta, summary.Id);
        Assert.Equal("IDN", summary.OwnerName);
        Assert.Equal("IDN", summary.ControllerName);
        Assert.Equal(idn, state.Provinces.Owner[jakarta]);
        Assert.True(summary.IsCity);
        Assert.Equal(state.Provinces.Population[jakarta], summary.Population);
        Assert.Equal((Terrain)state.Provinces.Terrain[jakarta], summary.Terrain);
        Assert.Equal(state.Provinces.Morale[jakarta], summary.Morale);
        Assert.Equal(data.ResourceOf(jakarta), summary.Resource);
        Assert.True(ResourceInfo.IsCityGood(summary.Resource));
        Assert.False(summary.IsOccupied);
        Assert.False(summary.IsContested);
        Assert.Equal(data.Land.NeighboursOf(jakarta).Length, summary.LandNeighbours);
        Assert.Equal(data.Sea.NeighboursOf(jakarta).Length, summary.SeaNeighbours);
    }

    [Fact]
    public void IndonesianCityIsFoundByNameWhateverTheCasing()
    {
        var (_, state, query, idn) = Setup();

        int jakarta = query.FindCity("Jakarta");

        Assert.True(jakarta >= 0);
        Assert.Equal(jakarta, query.FindCity("jakarta"));
        Assert.Equal(jakarta, query.FindCity("  JAKARTA  "));
        Assert.Equal("Jakarta", query.NameOf(jakarta));
        Assert.Equal(idn, state.Provinces.Owner[jakarta]);
        Assert.True(state.Provinces.IsCity[jakarta]);
    }

    [Fact]
    public void OnlyCitiesAnswerToACityLookup()
    {
        var (_, _, query, _) = Setup();

        Assert.Equal(-1, query.FindCity("Atlantis"));
        Assert.Equal(-1, query.FindCity(string.Empty));
        Assert.Equal(-1, query.FindCity("Papua"));
    }

    [Fact]
    public void OccupationShowsUpAsADifferentController()
    {
        var (_, state, query, idn) = Setup();
        int jakarta = query.FindCity("Jakarta");
        ushort invader = (ushort)(idn == 0 ? 1 : 0);

        state.Provinces.Controller[jakarta] = invader;
        var summary = query.Summarise(jakarta);

        Assert.True(summary.IsOccupied);
        Assert.Equal("IDN", summary.OwnerName);
        Assert.Equal(state.Nations.Name[invader], summary.ControllerName);
        Assert.NotEqual(summary.OwnerName, summary.ControllerName);
    }

    [Fact]
    public void NeighboursAreReportedSeparatelyByDomain()
    {
        var (data, state, query, idn) = Setup();
        int amphibious = -1;

        for (int i = 0; i < state.Provinces.Count && amphibious < 0; i++)
        {
            if (state.Provinces.Owner[i] == idn
                && data.Land.NeighboursOf(i).Length > 0
                && data.Sea.NeighboursOf(i).Length > 0)
            {
                amphibious = i;
            }
        }

        Assert.True(amphibious >= 0, "An archipelago must have a province with both land and sea links.");

        var (land, sea) = query.NeighboursOf(amphibious);

        Assert.Equal(data.Land.NeighboursOf(amphibious).ToArray().Select(n => (int)n), land);
        Assert.Equal(data.Sea.NeighboursOf(amphibious).ToArray().Select(n => (int)n), sea);
        Assert.Equal(land.Count, query.Summarise(amphibious).LandNeighbours);
        Assert.Equal(sea.Count, query.Summarise(amphibious).SeaNeighbours);
    }

    [Fact]
    public void ProvinceWithTwoClaimantsIsContested()
    {
        var (state, data) = DisputedWorld();
        var query = new ProvinceQuery(state, data);

        Assert.False(query.Summarise(0).IsContested);
        Assert.True(query.Summarise(1).IsContested);
        Assert.False(query.Summarise(2).IsContested);
    }

    [Fact]
    public void QueryWithoutNamesStillSummarises()
    {
        var (state, data) = DisputedWorld();
        var query = new ProvinceQuery(state, data);

        Assert.Equal(string.Empty, query.NameOf(0));
        Assert.Equal(-1, query.FindCity("Jakarta"));
        Assert.Equal("AAA", query.Summarise(0).OwnerName);
        Assert.Equal(3, query.Count);
    }

    [Fact]
    public void ProvinceOutsideTheMapIsRejected()
    {
        var (_, _, query, _) = Setup();

        Assert.Throws<ArgumentOutOfRangeException>(() => query.Summarise(-1));
        Assert.Throws<ArgumentOutOfRangeException>(() => query.Summarise(query.Count));
        Assert.Throws<ArgumentOutOfRangeException>(() => query.NeighboursOf(query.Count));
    }
}
