using NationRise.Core.Diplomacy;

namespace NationRise.Core.Tests.Diplomacy;

public class RelationsTests
{
    [Fact]
    public void EveryoneStartsAtPeace()
    {
        var relations = new Relations(10);
        Assert.Equal(Relation.Peace, relations.Between(3, 7));
        Assert.False(relations.AtWar(3, 7));
    }

    [Fact]
    public void RelationsAreSymmetric()
    {
        var relations = new Relations(10);
        relations.Set(2, 8, Relation.War);

        Assert.True(relations.AtWar(2, 8));
        Assert.True(relations.AtWar(8, 2));
        Assert.Equal(relations.Between(2, 8), relations.Between(8, 2));
    }

    [Fact]
    public void NationIsAtPeaceWithItself()
    {
        var relations = new Relations(5);
        Assert.Equal(Relation.Peace, relations.Between(3, 3));
        Assert.Throws<ArgumentException>(() => relations.Set(3, 3, Relation.War));
    }

    [Fact]
    public void EnteringTerritoryNeedsWarOrRightOfWay()
    {
        var relations = new Relations(5);

        Assert.False(relations.MayEnter(1, 2));

        relations.Set(1, 2, Relation.RightOfWay);
        Assert.True(relations.MayEnter(1, 2));

        relations.Set(1, 2, Relation.War);
        Assert.True(relations.MayEnter(1, 2));
    }

    [Fact]
    public void EnemyListMatchesTheMatrix()
    {
        var relations = new Relations(6);
        relations.Set(0, 2, Relation.War);
        relations.Set(0, 5, Relation.War);
        relations.Set(1, 3, Relation.War);

        Assert.Equal([2, 5], relations.EnemiesOf(0).ToArray());
        Assert.Equal([3], relations.EnemiesOf(1).ToArray());
    }

    [Fact]
    public void MatrixStaysSmallForAFullWorld()
    {
        var relations = new Relations(247);
        relations.Set(0, 246, Relation.War);
        Assert.True(relations.AtWar(246, 0));
    }
}
