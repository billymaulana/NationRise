using NationRise.Core.Data;

namespace NationRise.Core.Tests.Data;

/* Loaded once: the file is small but every test that needs a real map would
   otherwise re-parse it. */
public static class WorldFixture
{
    private static WorldData? _cached;

    public static WorldData Load()
    {
        if (_cached is not null)
        {
            return _cached;
        }

        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "game", "data", "world.bin")))
        {
            dir = dir.Parent;
        }

        if (dir is null)
        {
            throw new FileNotFoundException("world.bin not found; run the map pipeline first.");
        }

        using var stream = File.OpenRead(Path.Combine(dir.FullName, "game", "data", "world.bin"));
        _cached = WorldFile.Read(stream);
        return _cached;
    }
}
