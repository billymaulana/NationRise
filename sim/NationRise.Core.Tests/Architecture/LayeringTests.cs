using System.Reflection;
using NationRise.Core.World;

namespace NationRise.Core.Tests.Architecture;

public class LayeringTests
{
    /* The build already fails if GodotSharp is referenced, but that guard
       lives in the project file and can be edited away. This asserts the
       same rule from inside the test suite, where removing it is visible. */
    [Fact]
    public void CoreDoesNotDependOnAnyGameEngine()
    {
        var referenced = typeof(WorldState).Assembly
            .GetReferencedAssemblies()
            .Select(a => a.Name ?? string.Empty)
            .ToArray();

        Assert.DoesNotContain("GodotSharp", referenced);
        Assert.DoesNotContain("GodotSharpEditor", referenced);
    }

    [Fact]
    public void CoreTypesCarryNoRenderingConcepts()
    {
        var suspect = typeof(WorldState).Assembly
            .GetTypes()
            .SelectMany(t => t.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            .Where(p => p.Name.Contains("Color", StringComparison.OrdinalIgnoreCase)
                     || p.Name.Contains("Mesh", StringComparison.OrdinalIgnoreCase)
                     || p.Name.Contains("Texture", StringComparison.OrdinalIgnoreCase)
                     || p.Name.Contains("Screen", StringComparison.OrdinalIgnoreCase))
            .Select(p => $"{p.DeclaringType?.Name}.{p.Name}")
            .ToArray();

        Assert.Empty(suspect);
    }
}
