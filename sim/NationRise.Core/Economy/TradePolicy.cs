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
public sealed class TradePolicy(
    NationRise.Core.World.WorldState world,
    Stockpile stockpile,
    WorldMarket market,
    UpkeepSystem upkeep)
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
        long target = Math.Max(
            Math.Max(consumption, dailyProduction) * BufferDays,
            CapitalFloorOf(nation, resource));

        long held = stockpile.Get(nation, resource);

        return dailyProduction - consumption - ((target - held) / BufferDays);
    }

    /*
       Building materials a nation does not make itself.

       Sized against production and upkeep alone, a country that mines no
       materials wants none: its target is nothing, so it never bids, and it
       never puts up an army base. Measured over sixty days that left the whole
       world unable to build, while two and a half million tonnes of the stuff
       sat in the hands of the few nations that happened to produce it.

       The floor is roughly what one barracks costs, per city, so a nation is
       always trying to hold enough to break ground somewhere.
    */
    public const int CapitalPerCity = 900;

    private long CapitalFloorOf(int nation, Resource resource)
    {
        if (resource is not (Resource.Materials or Resource.Technology or Resource.RareResources))
        {
            return 0;
        }

        int cities = 0;
        var provinces = world.Provinces;

        for (int i = 0; i < provinces.Count; i++)
        {
            if (provinces.Controller[i] == nation && provinces.IsCity[i])
            {
                cities++;
            }
        }

        return (long)cities * CapitalPerCity;
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
