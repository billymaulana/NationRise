namespace NationRise.Core.Economy;

public sealed class TradeRejected(string reason) : Exception(reason);

public readonly record struct Trade(Resource Resource, long Units, long Gross, long Fee, long Net);

/*
   One market for the whole world instead of nation-to-nation deals: every
   order clears against the same book, so there is a single price per good for
   the simulation, the AI and the player to reason about.

   Prices are fixed point in thousandths of a money unit. Stockpiles hold whole
   numbers and a day has to replay identically from the same orders, which
   rules out carrying a floating point price across ticks.
*/
public sealed class WorldMarket(Stockpile stockpile)
{
    public const long PriceScale = 1_000;

    /* Supply and demand are always measured against this participant, never
       against zero. It keeps the smaller side of the ratio positive, and it is
       what stops the market dying when every nation banks a surplus of the
       same good and no one is left to sell to. */
    public const long RestOfWorldDailyVolume = 20_000;

    public const long SupplyWeightPercent = 75;
    public const long FloorPercent = 25;
    public const long CeilingPercent = 175;
    /* Ten thirds, so alpha is 0.30: a two-day half-life settles fast enough to
       react to a war without letting one day's trading define the price. */
    public const long SmoothingDivisor = 3;

    public const long FeePercent = 5;
    public const long DailyBuyQuotaPercent = 25;

    /* Both numbers come from the market sensitivity study rather than being
       chosen for feel. A 30 per mille daily cap let a price run from 40 to 70
       inside three days, which makes production planning impossible, and full
       price impact meant one buyer could move the market a quarter on its own. */
    public const long MaxDailyShiftPermille = 120;
    public const long PriceImpactPercent = 50;

    /* Access, not price, is what a blockade takes away. A cut-off nation still
       sees the world price but can only move a quarter of the volume, which is
       why holding the straits matters more than holding the treasury. */
    public const long BaseAccessPercent = 75;
    public const long BlockadedAccessPercent = 25;

    private readonly long[] _price = OpeningPrices();
    private readonly long[] _dayOpenPrice = OpeningPrices();
    private readonly long[] _boughtToday = new long[ResourceInfo.Count];
    private readonly long[] _soldToday = new long[ResourceInfo.Count];
    private readonly long[] _shiftPermille = new long[ResourceInfo.Count];
    private readonly long[] _nationBoughtToday = new long[stockpile.NationCount * ResourceInfo.Count];

    /* A zero base price is what marks a resource untradeable: money is the
       medium of exchange rather than a good, and manpower cannot be shipped. */
    public static long BasePriceOf(Resource resource) => resource switch
    {
        Resource.Food => 8 * PriceScale,
        Resource.Fuel => 8 * PriceScale,
        Resource.Materials => 9 * PriceScale,
        Resource.Technology => 20 * PriceScale,
        Resource.RareResources => 15 * PriceScale,
        _ => 0,
    };

    public static bool IsTraded(Resource resource) => BasePriceOf(resource) > 0;

    /* The band is a pair of standing quotes, not an arbitrary limit: nothing
       can trade below what the rest of the world will pay, or above the price
       at which it sells out of its own stock. */
    public static long RestOfWorldBuyPrice(Resource resource) =>
        BasePriceOf(resource) * FloorPercent / 100;

    public static long RestOfWorldSellPrice(Resource resource) =>
        BasePriceOf(resource) * CeilingPercent / 100;

    public long PriceOf(Resource resource) => _price[(int)resource];

    /* Rest of World volume is deliberately fixed rather than elastic to price.
       Making it scale was tried and reverted: the daily cap of 120 per mille
       already keeps the hard band out of reach, so elasticity bought almost no
       stability while making market depth move under the player's feet, which
       is the opposite of what the pricing work set out to achieve. */
    public long SupplyOf(Resource resource) =>
        IsTraded(resource) ? RestOfWorldDailyVolume + _soldToday[(int)resource] : 0;

    public long DemandOf(Resource resource) =>
        IsTraded(resource) ? RestOfWorldDailyVolume + _boughtToday[(int)resource] : 0;

    public long AccessPercentFor(bool blockaded) =>
        blockaded ? BlockadedAccessPercent : BaseAccessPercent;

    /* How much a nation can actually move today given its trade access. A
       blockade does not change what things cost, only how much of it reaches
       the docks. */
    public long TradeableVolumeFor(Resource resource, bool blockaded) =>
        AvailableOf(resource) * AccessPercentFor(blockaded) / 100;

    public long AvailableOf(Resource resource) =>
        Math.Max(0, SupplyOf(resource) - _boughtToday[(int)resource]);

    public long AbsorbableOf(Resource resource) =>
        Math.Max(0, DemandOf(resource) - _soldToday[(int)resource]);

    /*
       What each nation actually burns in a day. Attached, it is what ties the
       buying quota to use instead of to wealth: without it the share quota
       alone lets four rich nations empty the board before anyone else is
       asked, which is exactly what a thin market looks like when it is
       working badly rather than working as designed.
    */
    public UpkeepSystem? Upkeep { get; set; }

    /* No nation may corner a good: a quarter of the day's supply is the most
       one buyer can take, so a rich neighbour cannot leave everyone else with
       an empty board. */
    public long QuotaLeftFor(int nation, Resource resource) => Upkeep is null
        ? ShareQuotaLeftFor(nation, resource)
        : QuotaLeftFor(nation, resource, Upkeep.BillOf(nation, resource));

    /* The share quota alone still lets a nation stockpile years of supply in a
       quiet week. Capping against actual consumption keeps buying tied to use
       rather than to how much money happens to be lying around. */
    public long QuotaLeftFor(int nation, Resource resource, long dailyConsumption)
    {
        /* What the nation already took today comes off both limits. Charging
           it only against the share left the consumption cap sizing single
           orders and bounding nothing: a nation could place the same modest
           order again and again until the share ran out. */
        long byUse = Math.Max(dailyConsumption * 3, RestOfWorldDailyVolume / 40)
            - _nationBoughtToday[Index(nation, resource)];

        return Math.Max(0, Math.Min(ShareQuotaLeftFor(nation, resource), byUse));
    }

    private long ShareQuotaLeftFor(int nation, Resource resource) => Math.Max(
        0,
        SupplyOf(resource) * DailyBuyQuotaPercent / 100 - _nationBoughtToday[Index(nation, resource)]);

    /* An order walks the book: it fills at the average of the price before and
       after its own impact. Filling at the pre-trade price would let a nation
       buy, push the price up and sell the same stock back at a profit inside
       one day, which the transaction fee alone is too small to prevent. */
    public long ExecutionPriceOf(Resource resource, long units, bool buying)
    {
        if (!IsTraded(resource) || units <= 0)
        {
            return PriceOf(resource);
        }

        return (_price[(int)resource] + Impact(resource, units, buying).Price) / 2;
    }

    public long CostOf(Resource resource, long units)
    {
        long gross = RoundUp(ExecutionPriceOf(resource, units, buying: true) * units, PriceScale);
        return gross + RoundUp(gross * FeePercent, 100);
    }

    public long ProceedsOf(Resource resource, long units)
    {
        long gross = ExecutionPriceOf(resource, units, buying: false) * units / PriceScale;
        return gross - RoundUp(gross * FeePercent, 100);
    }

    public bool CanBuy(int nation, Resource resource, long units, out string reason)
    {
        reason = string.Empty;

        if (units <= 0)
        {
            reason = "An order must be at least one unit.";
            return false;
        }

        if (!IsTraded(resource))
        {
            reason = $"{resource} is not traded on the world market.";
            return false;
        }

        if (units > QuotaLeftFor(nation, resource))
        {
            reason = $"The daily buying quota for {resource} is used up.";
            return false;
        }

        if (units > AvailableOf(resource))
        {
            reason = $"The market has no more {resource} to sell today.";
            return false;
        }

        if (stockpile.Get(nation, Resource.Money) < CostOf(resource, units))
        {
            reason = "Not enough money.";
            return false;
        }

        return true;
    }

    public bool CanSell(int nation, Resource resource, long units, out string reason)
    {
        reason = string.Empty;

        if (units <= 0)
        {
            reason = "An order must be at least one unit.";
            return false;
        }

        if (!IsTraded(resource))
        {
            reason = $"{resource} is not traded on the world market.";
            return false;
        }

        if (stockpile.Get(nation, resource) < units)
        {
            reason = $"Not enough {resource} to sell.";
            return false;
        }

        if (units > AbsorbableOf(resource))
        {
            reason = $"The market will not take any more {resource} today.";
            return false;
        }

        return true;
    }

    public Trade Buy(int nation, Resource resource, long units)
    {
        if (!CanBuy(nation, resource, units, out string reason))
        {
            throw new TradeRejected(reason);
        }

        int i = (int)resource;
        (long shift, long shiftedPrice) = Impact(resource, units, buying: true);
        long execution = (_price[i] + shiftedPrice) / 2;

        long gross = RoundUp(execution * units, PriceScale);
        long fee = RoundUp(gross * FeePercent, 100);

        stockpile.TrySpend(nation, Resource.Money, gross + fee);
        stockpile.Add(nation, resource, units);

        _boughtToday[i] += units;
        _nationBoughtToday[Index(nation, resource)] += units;
        _shiftPermille[i] = shift;
        _price[i] = shiftedPrice;

        return new Trade(resource, units, gross, fee, -(gross + fee));
    }

    public Trade Sell(int nation, Resource resource, long units)
    {
        if (!CanSell(nation, resource, units, out string reason))
        {
            throw new TradeRejected(reason);
        }

        int i = (int)resource;
        (long shift, long shiftedPrice) = Impact(resource, units, buying: false);
        long execution = (_price[i] + shiftedPrice) / 2;

        long gross = execution * units / PriceScale;
        long fee = RoundUp(gross * FeePercent, 100);

        stockpile.TrySpend(nation, resource, units);
        stockpile.Add(nation, Resource.Money, gross - fee);

        _soldToday[i] += units;
        _shiftPermille[i] = shift;
        _price[i] = shiftedPrice;

        return new Trade(resource, units, gross, fee, gross - fee);
    }

    /* Where supply and demand alone would put the price today. Deliberately not
       the price itself: a single unusual day of orders would otherwise whipsaw
       every production plan in the world. */
    public long TargetPriceOf(Resource resource)
    {
        if (!IsTraded(resource))
        {
            return 0;
        }

        long buy = DemandOf(resource);
        long sell = SupplyOf(resource);
        long balance = Math.Clamp((buy - sell) * 1000 / Math.Min(buy, sell), -1000, 1000);
        long baseline = BasePriceOf(resource);

        return Bound(resource, baseline + baseline * SupplyWeightPercent * balance / 100_000);
    }

    public void RunDay()
    {
        for (int i = 0; i < ResourceInfo.Count; i++)
        {
            var resource = (Resource)i;

            if (IsTraded(resource))
            {
                _price[i] = Smooth(_price[i], TargetPriceOf(resource));
            }

            _boughtToday[i] = 0;
            _soldToday[i] = 0;
            _shiftPermille[i] = 0;
            _dayOpenPrice[i] = _price[i];
        }

        Array.Clear(_nationBoughtToday);
    }

    private (long Shift, long Price) Impact(Resource resource, long units, bool buying)
    {
        int i = (int)resource;
        long direction = buying ? 1 : -1;
        long moved = direction * units * 1000 * PriceImpactPercent / (SupplyOf(resource) * 100);
        long shift = Math.Clamp(_shiftPermille[i] + moved, -MaxDailyShiftPermille, MaxDailyShiftPermille);

        return (shift, Bound(resource, _dayOpenPrice[i] + _dayOpenPrice[i] * shift / 1000));
    }

    /* Integer division stalls within a few thousandths of the target and the
       price would creep forever without arriving; closing the last step keeps
       a settled market genuinely settled. */
    private static long Smooth(long price, long target)
    {
        long step = (target - price) / SmoothingDivisor;
        return step == 0 ? target : price + step;
    }

    private static long Bound(Resource resource, long price) =>
        Math.Clamp(price, RestOfWorldBuyPrice(resource), RestOfWorldSellPrice(resource));

    private static long RoundUp(long value, long divisor) => (value + divisor - 1) / divisor;

    private static long[] OpeningPrices()
    {
        var prices = new long[ResourceInfo.Count];

        for (int i = 0; i < prices.Length; i++)
        {
            prices[i] = BasePriceOf((Resource)i);
        }

        return prices;
    }

    private int Index(int nation, Resource resource)
    {
        if ((uint)nation >= (uint)stockpile.NationCount)
        {
            throw new ArgumentOutOfRangeException(nameof(nation));
        }

        return nation * ResourceInfo.Count + (int)resource;
    }
}
