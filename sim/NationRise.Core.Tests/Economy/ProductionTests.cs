using NationRise.Core.Economy;

namespace NationRise.Core.Tests.Economy;

public class ProductionTests
{
    /* Real Conflict of Nations values for Indonesia on day one at 70% morale.
       These pinned the formula in the first place; if any drifts, the economy
       has silently changed. */
    [Theory]
    [InlineData(6f, Resource.Materials, 1205)]
    [InlineData(5f, Resource.Food, 1275)]
    [InlineData(5f, Resource.Fuel, 1275)]
    [InlineData(5f, Resource.Technology, 607)]
    [InlineData(5f, Resource.RareResources, 729)]
    [InlineData(4f, Resource.Food, 1020)]
    [InlineData(4f, Resource.Materials, 874)]
    [InlineData(6f, Resource.Money, 1004)]
    public void MatchesRealGameValues(float population, Resource resource, int expected)
    {
        Assert.Equal(expected, Production.DailyOutput(population, 0.70f, resource));
    }

    [Fact]
    public void PopulationFactorSwitchesCurveAtFive()
    {
        Assert.Equal(0.8f, Production.PopulationFactor(4f), 3);
        Assert.Equal(1.0f, Production.PopulationFactor(5f), 3);
        Assert.Equal(1.1025f, Production.PopulationFactor(6f), 3);
    }

    [Fact]
    public void HigherMoraleProducesMore()
    {
        int low = Production.DailyOutput(5f, 0.25f, Resource.Food);
        int high = Production.DailyOutput(5f, 1.00f, Resource.Food);

        Assert.True(high > low);
        Assert.Equal(1.05f, Production.MoraleFactor(1.00f), 3);
    }

    [Fact]
    public void ManpowerIsNotProducedByAResourceSlot()
    {
        Assert.Equal(0, Production.DailyOutput(6f, 1.0f, Resource.Manpower));
        Assert.False(ResourceInfo.IsTradeable(Resource.Manpower));
    }
}
