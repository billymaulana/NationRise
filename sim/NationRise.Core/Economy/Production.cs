using NationRise.Core.World;

namespace NationRise.Core.Economy;

public static class Production
{
    public const float BaseOutput = 3000f;

    /* Population scales output on two different curves: below five it is
       simply linear, above it grows quadratically, which is why a size-six
       city out-produces two size-three cities. */
    public static float PopulationFactor(float population)
    {
        if (population < 5f)
        {
            return population * 0.2f;
        }

        float growth = 1f + 0.05f * (population - 5f);
        return growth * growth;
    }

    public static float MoraleFactor(float morale) => morale * 0.8f + 0.25f;

    public static int DailyOutput(float population, float morale, Resource resource)
    {
        float raw = BaseOutput
            * MoraleFactor(morale)
            * ResourceInfo.FactorOf(resource)
            * PopulationFactor(population);

        return (int)MathF.Floor(raw);
    }

    public static int DailyOutput(ProvinceRef province, Resource resource) =>
        DailyOutput(province.Population, province.Morale, resource);
}
