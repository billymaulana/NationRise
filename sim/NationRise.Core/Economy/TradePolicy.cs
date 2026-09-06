namespace NationRise.Core.Economy;

/*
   How a nation decides what to put on the world market each day.

   The rule is the one the resource research settled on: production less
   consumption, less whatever it takes to walk the store back towards a week of
   upkeep. A nation that is merely low buys a little every day rather than
   nothing until the day it is empty, which is what turns the market into the
   answer to a shortage instead of a screen the player visits after the damage
   is done.
*/
public sealed class TradePolicy(Stockpile stockpile, WorldMarket market, UpkeepSystem upkeep)
{
    /* Seven days of cover, from the research. Short enough that a nation is
       still exposed to a blockade, long enough that one bad day does not
       start a panic. */
    public const int BufferDays = 7;

    public static readonly IReadOnlyList<Resource> Goods =
    [
        Resource.Food,
        Resource.Fuel,
        Resource.Materials,
        Resource.Technology,
        Resource.RareResources,
    ];

    /*
       Positive is a seller, negative is a buyer. The buffer term is spread over
       the week rather than demanded at once, so restocking does not look like a
       sudden famine to everyone else on the book.

       The reserve is sized against output as well as against upkeep. Upkeep
       alone is what the research specifies, and it is not enough here: nothing
       charges daily upkeep in technology or rare earths, so a week of upkeep is
       a reserve of nothing and a producer sells the whole stock its own yards
       and laboratories are queued to spend. The first run of this policy
       emptied the world of technology by day eighty and left no nation able to
       build a tank.
    */
    public long DesiredNetOf(int nation, Resource resource, long dailyProduction)
    {
        long consumption = upkeep.BillOf(nation, resource);
        long target = Math.Max(consumption, dailyProduction) * BufferDays;
        long held = stockpile.Get(nation, resource);

        return dailyProduction - consumption - ((target - held) / BufferDays);
    }

    /*
       Nations are served starting from a different index every day. Walking
       0 upwards always would hand the whole day's supply to whichever nations
       happen to sit at the front of the list, and on a thin market the same
       countries would starve every day for no reason anyone could see.
    */
    public void RunDay(long day, IReadOnlyList<long> dailyProduction)
    {
        ArgumentNullException.ThrowIfNull(dailyProduction);

        int nations = stockpile.NationCount;
        if (nations == 0)
        {
            return;
        }

        int offset = (int)(((day % nations) + nations) % nations);

        for (int i = 0; i < Goods.Count; i++)
        {
            Resource resource = Goods[i];

            for (int step = 0; step < nations; step++)
            {
                int nation = (offset + step) % nations;
                long produced = dailyProduction[(nation * ResourceInfo.Count) + (int)resource];
                long net = DesiredNetOf(nation, resource, produced);

                if (net > 0)
                {
                    Place(nation, resource, net, buying: false);
                }
                else if (net < 0)
                {
                    Place(nation, resource, -net, buying: true);
                }
            }
        }
    }

    /* An order that does not fit is trimmed to what does rather than dropped.
       Refusing the whole thing is what makes a thin market look broken: the
       nation that needs a hundred units and can have sixty should get sixty. */
    private void Place(int nation, Resource resource, long units, bool buying)
    {
        long allowed = buying
            ? Math.Min(units, Math.Min(market.QuotaLeftFor(nation, resource), market.AvailableOf(resource)))
            : Math.Min(units, Math.Min(stockpile.Get(nation, resource), market.AbsorbableOf(resource)));

        if (buying)
        {
            allowed = AffordableUnits(nation, resource, allowed);
        }

        if (allowed <= 0)
        {
            return;
        }

        if (buying)
        {
            market.Buy(nation, resource, allowed);
        }
        else
        {
            market.Sell(nation, resource, allowed);
        }
    }

    /* Binary search rather than a division: the execution price rises with the
       size of the order, so the largest affordable order is not the budget
       divided by today's price. */
    private long AffordableUnits(int nation, Resource resource, long units)
    {
        if (units <= 0)
        {
            return 0;
        }

        long budget = stockpile.Get(nation, Resource.Money);
        if (market.CostOf(resource, units) <= budget)
        {
            return units;
        }

        long low = 0;
        long high = units;

        while (low < high)
        {
            long mid = low + ((high - low + 1) / 2);
            if (market.CostOf(resource, mid) <= budget)
            {
                low = mid;
            }
            else
            {
                high = mid - 1;
            }
        }

        return low;
    }
}
