using NationRise.Core.Buildings;
using NationRise.Core.Data;
using NationRise.Core.Diplomacy;
using NationRise.Core.Economy;
using NationRise.Core.Military;
using NationRise.Core.Research;
using NationRise.Core.World;

namespace NationRise.Bench;

/*
   Runs the economy forward with no engine attached and prints where the
   stockpiles actually go. Reasoning about upkeep from the constants alone is
   how an economy ends up either trivially rich or bankrupt on day three; this
   is the cheapest way to find out which one was built.
*/
public static class Program
{
    private const ulong Seed = 20260906;
    private const int MaxStacks = 400;

    private static readonly Resource[] Reported =
    [
        Resource.Money, Resource.Food, Resource.Fuel,
        Resource.Materials, Resource.Technology, Resource.RareResources,
    ];

    public static int Main(string[] args)
    {
        int days = args.Length > 0 && int.TryParse(args[0], out int parsed) ? parsed : 120;
        string tag = args.Length > 1 ? args[1] : "IDN";
        bool trading = args.Length <= 2 || args[2] != "notrade";
        int perCity = args.Length > 3 && int.TryParse(args[3], out int size) ? size : 2;

        var run = new Run(days, tag, trading, perCity);
        run.Execute();
        return 0;
    }

    private sealed class Run(int days, string tag, bool trading, int perCity)
    {
        private readonly WorldData _data = LoadWorld();

        private WorldState _world = null!;
        private Stockpile _stock = null!;
        private EconomyTick _economy = null!;
        private CityBuildings _buildings = null!;
        private ResearchQueue _research = null!;
        private Mobilisation _mobilisation = null!;
        private Relations _relations = null!;
        private MoraleSystem _morale = null!;
        private WorldMarket _market = null!;
        private UpkeepSystem _upkeep = null!;
        private ShortageSystem _shortage = null!;
        private TradePolicy _trade = null!;
        private long[] _income = null!;
        private readonly Dictionary<int, Army> _armies = [];
        private int _nextArmyId;

        public void Execute()
        {
            Build();

            int player = _world.Nations.IndexOf(tag);
            Console.WriteLine(
                $"world {_world.Provinces.Count} provinces, {_world.Nations.Count} nations, "
                + $"{_armies.Count} stacks, trading={trading}");
            Console.WriteLine($"player {tag} = nation {player}");
            Console.WriteLine();

            Header();

            for (int day = 1; day <= days; day++)
            {
                RunDay(day);

                if (day % 10 == 0 || day == 1 || day == days)
                {
                    Row(day, player);
                }
            }

            Console.WriteLine();
            Summary(player);
        }

        private void Build()
        {
            _world = _data.ToWorldState(Seed);
            _stock = new Stockpile(_world.Nations.Count);
            _economy = new EconomyTick(_world, _stock);

            for (int i = 0; i < _world.Provinces.Count; i++)
            {
                _economy.AssignResource(i, _data.ResourceOf(i));
            }

            _buildings = new CityBuildings(_world, _stock);
            _research = new ResearchQueue(_world, _stock, _buildings);
            _mobilisation = new Mobilisation(_world, _stock, _buildings, _research);
            _relations = new Relations(_world.Nations.Count);
            _morale = new MoraleSystem(_world, _relations, _buildings);
            _market = new WorldMarket(_stock);
            _upkeep = new UpkeepSystem(_world, _stock, _buildings);
            _shortage = new ShortageSystem(_world.Nations.Count);
            _trade = new TradePolicy(_stock, _market, _upkeep);
            _income = new long[_world.Nations.Count * ResourceInfo.Count];

            _upkeep.Shortage = _shortage;
            _morale.Shortage = _shortage;
            _buildings.Shortage = _shortage;
            _mobilisation.Shortage = _shortage;
            _market.Upkeep = _upkeep;

            int player = _world.Nations.IndexOf(tag);
            foreach (string enemy in new[] { "MYS", "PNG", "TLS" })
            {
                int other = _world.Nations.IndexOf(enemy);
                if (other >= 0 && other != player)
                {
                    _relations.Set(player, other, Relation.War);
                }
            }

            for (int i = 0; i < _world.Provinces.Count && _nextArmyId < MaxStacks; i++)
            {
                if (!_world.Provinces.IsCity[i])
                {
                    continue;
                }

                var army = new Army
                {
                    Id = _nextArmyId++,
                    Nation = _world.Provinces.Owner[i],
                    Province = i,
                };
                for (int unit = 0; unit < perCity; unit++)
                {
                    army.Add(unit % 2 == 0
                        ? UnitCatalogue.MotorizedInfantry
                        : UnitCatalogue.MechanizedInfantry);
                }

                _armies[army.Id] = army;
            }
        }

        private void RunDay(int day)
        {
            for (int hour = 0; hour < 24; hour++)
            {
                _buildings.Tick();
                _research.Tick();
                _mobilisation.Tick(_armies, ref _nextArmyId);

                if (_world.Clock.Tick % 24 == 0)
                {
                    Develop();
                }

                _world.Clock.Advance();
            }

            _economy.RunDay();
            _upkeep.RunDay(_armies);
            _morale.RunDay(_stock);
            _market.RunDay();

            if (trading)
            {
                _economy.DailyIncomeInto(_income);
                _trade.RunDay(day, _income);
            }
        }

        private void Develop()
        {
            for (int province = 0; province < _world.Provinces.Count; province++)
            {
                if (!_world.Provinces.IsCity[province] || _buildings.IsBuilding(province))
                {
                    continue;
                }

                foreach (BuildingType type in new[]
                {
                    BuildingType.ArmsIndustry, BuildingType.RecruitingOffice, BuildingType.ArmyBase,
                })
                {
                    try
                    {
                        _buildings.Begin(province, type);
                        break;
                    }
                    catch (ConstructionRejected)
                    {
                        /* Not affordable, no slot, or the country is short. */
                    }
                }
            }

            for (int nation = 0; nation < _world.Nations.Count; nation++)
            {
                if (_research.ActiveCount(nation) >= ResearchQueue.Slots)
                {
                    continue;
                }

                ResearchNode? next = _research.AvailableTo(nation).FirstOrDefault();
                if (next is not null)
                {
                    _research.Start(nation, next);
                }
            }

            for (int province = 0; province < _world.Provinces.Count; province++)
            {
                if (!_world.Provinces.IsCity[province] || _mobilisation.IsMobilising(province))
                {
                    continue;
                }

                ushort nation = _world.Provinces.Controller[province];
                if (nation == ProvinceStore.NoOwner || !_relations.EnemiesOf(nation).Any())
                {
                    continue;
                }

                foreach (UnitRecipe recipe in UnitRecipes.All)
                {
                    if (_mobilisation.CanMobilise(province, recipe, out _))
                    {
                        _mobilisation.Begin(province, recipe);
                        break;
                    }
                }
            }
        }

        private static void Header()
        {
            Console.WriteLine(
                "day |      money |       food |       fuel |  materials |       tech |       rare "
                + "| bill$ | short | starving | mrl");
        }

        private void Row(int day, int player)
        {
            Console.Write($"{day,3} |");
            foreach (Resource resource in Reported)
            {
                Console.Write($" {_stock.Get(player, resource),10:N0} |");
            }

            long moneyBill = _upkeep.BillOf(player, Resource.Money);
            int shortGoods = 0;
            foreach (Resource resource in Reported)
            {
                if (_shortage.IsShort(player, resource))
                {
                    shortGoods++;
                }
            }

            int starving = 0;
            for (int nation = 0; nation < _world.Nations.Count; nation++)
            {
                if (_upkeep.IsStarved(nation))
                {
                    starving++;
                }
            }

            Console.WriteLine(
                $" {moneyBill,5:N0} | {shortGoods,5} | {starving,8} | {MeanMoraleOf(player):F2}");
        }

        private void Summary(int player)
        {
            Console.WriteLine("prices:");
            foreach (Resource good in TradePolicy.Goods)
            {
                long price = _market.PriceOf(good);
                long basePrice = WorldMarket.BasePriceOf(good);
                Console.WriteLine(
                    $"  {good,-14} {price / 1000.0,7:F2}  base {basePrice / 1000.0,6:F2}  "
                    + $"{100.0 * price / basePrice,6:F1}% of base");
            }

            Console.WriteLine();
            Console.WriteLine($"player daily bill and income after {days} days:");
            foreach (Resource resource in Reported)
            {
                Console.WriteLine(
                    $"  {resource,-14} income {_economy.DailyIncomeOf(player, resource),10:N0}  "
                    + $"upkeep {_upkeep.BillOf(player, resource),10:N0}  "
                    + $"held {_stock.Get(player, resource),12:N0}  "
                    + $"daysShort {_shortage.DaysShortOf(player, resource),3}");
            }

            var starvedDays = 0;
            for (int nation = 0; nation < _world.Nations.Count; nation++)
            {
                if (_upkeep.IsStarved(nation))
                {
                    starvedDays++;
                }
            }

            Console.WriteLine();
            Console.WriteLine("world totals per day (production against upkeep):");
            _economy.DailyIncomeInto(_income);
            foreach (Resource resource in Reported)
            {
                long produced = 0;
                long billed = 0;
                for (int nation = 0; nation < _world.Nations.Count; nation++)
                {
                    produced += _income[(nation * ResourceInfo.Count) + (int)resource];
                    billed += _upkeep.BillOf(nation, resource);
                }

                double ratio = billed == 0 ? double.PositiveInfinity : (double)produced / billed;
                Console.WriteLine(
                    $"  {resource,-14} produced {produced,12:N0}  upkeep {billed,12:N0}  "
                    + $"produced/upkeep {ratio,8:F1}  held {TotalOf(resource),14:N0}");
            }

            Console.WriteLine();
            Console.WriteLine("shortage ramps on the last day:");
            foreach (Resource resource in Reported)
            {
                int shortNations = 0;
                int atFloor = 0;
                for (int nation = 0; nation < _world.Nations.Count; nation++)
                {
                    if (_shortage.IsShort(nation, resource))
                    {
                        shortNations++;
                    }

                    if (_shortage.RampPermilleOf(nation, resource) >= ShortageSystem.CapPermille)
                    {
                        atFloor++;
                    }
                }

                Console.WriteLine($"  {resource,-14} short {shortNations,4}  at the floor {atFloor,4}");
            }

            float shortMorale = 0f;
            float wellMorale = 0f;
            int shortCount = 0;
            int wellCount = 0;
            for (int nation = 0; nation < _world.Nations.Count; nation++)
            {
                float mean = MeanMoraleOf(nation);
                if (mean <= 0f)
                {
                    continue;
                }

                if (_shortage.MoralePenaltyOf(nation) > 0f)
                {
                    shortMorale += mean;
                    shortCount++;
                }
                else
                {
                    wellMorale += mean;
                    wellCount++;
                }
            }

            Console.WriteLine(
                $"mean morale: short nations {(shortCount == 0 ? 0f : shortMorale / shortCount):F3} "
                + $"({shortCount}), the rest {(wellCount == 0 ? 0f : wellMorale / wellCount):F3} ({wellCount})");

            Console.WriteLine();
            Console.WriteLine("still short of food on the last day:");
            int listed = 0;
            for (int nation = 0; nation < _world.Nations.Count && listed < 12; nation++)
            {
                if (!_shortage.IsShort(nation, Resource.Food))
                {
                    continue;
                }

                listed++;
                Console.WriteLine(
                    $"  {_world.Nations.Tag[nation],-4} money {_stock.Get(nation, Resource.Money),12:N0}  "
                    + $"foodIncome {_income[(nation * ResourceInfo.Count) + (int)Resource.Food],8:N0}  "
                    + $"foodBill {_upkeep.BillOf(nation, Resource.Food),8:N0}  "
                    + $"quota {_market.QuotaLeftFor(nation, Resource.Food),8:N0}  "
                    + $"available {_market.AvailableOf(Resource.Food),8:N0}  "
                    + $"canBuy1 {_market.CanBuy(nation, Resource.Food, 1, out string why)} {why}");
            }

            Console.WriteLine();
            Console.WriteLine($"nations starving on the last day: {starvedDays}/{_world.Nations.Count}");
            Console.WriteLine($"live stacks: {_armies.Values.Count(a => !a.IsDestroyed)}");
            Console.WriteLine($"world money total: {TotalOf(Resource.Money):N0}");
            Console.WriteLine($"world food total:  {TotalOf(Resource.Food):N0}");
        }

        private long TotalOf(Resource resource)
        {
            long total = 0;
            for (int nation = 0; nation < _world.Nations.Count; nation++)
            {
                total += _stock.Get(nation, resource);
            }

            return total;
        }

        private float MeanMoraleOf(int nation)
        {
            float sum = 0f;
            int count = 0;

            for (int i = 0; i < _world.Provinces.Count; i++)
            {
                if (_world.Provinces.Controller[i] == nation)
                {
                    sum += _world.Provinces.Morale[i];
                    count++;
                }
            }

            return count == 0 ? 0f : sum / count;
        }

        private static WorldData LoadWorld()
        {
            var dir = new DirectoryInfo(AppContext.BaseDirectory);
            while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "game", "data", "world.bin")))
            {
                dir = dir.Parent;
            }

            if (dir is null)
            {
                throw new FileNotFoundException("world.bin not found; run the map pipeline first.");
            }

            using FileStream stream = File.OpenRead(Path.Combine(dir.FullName, "game", "data", "world.bin"));
            return WorldFile.Read(stream);
        }
    }
}
