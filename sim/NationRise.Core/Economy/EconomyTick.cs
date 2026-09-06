using NationRise.Core.World;

namespace NationRise.Core.Economy;

public sealed class EconomyTick(WorldState world, Stockpile stockpile)
{
    /* Provinces carry a single resource each, so the daily pass is one linear
       sweep. Cities produce on the population curve; plain provinces produce a
       flat share at half ceiling, which is why holding empty ground helps but
       never replaces holding cities. */
    private readonly Resource[] _provinceResource = new Resource[world.Provinces.Count];
    private readonly ProvinceStatus[] _status = new ProvinceStatus[world.Provinces.Count];

    public void AssignResource(int province, Resource resource) =>
        _provinceResource[province] = resource;

    public Resource ResourceOf(int province) => _provinceResource[province];

    public void SetStatus(int province, ProvinceStatus status) => _status[province] = status;

    public ProvinceStatus StatusOf(int province) => _status[province];

    /*
       What RunDay would add for one nation, without adding it. The heads-up
       display needs the rate more than the balance: a stockpile of 8,000 says
       nothing until you know whether it is climbing or draining.
    */
    public long DailyIncomeOf(int nation, Resource resource)
    {
        var provinces = world.Provinces;
        long total = 0;

        for (int i = 0; i < provinces.Count; i++)
        {
            if (provinces.Controller[i] != nation)
            {
                continue;
            }

            float population = provinces.Population[i];
            float morale = provinces.Morale[i];

            ProvinceStatus status = provinces.IsCity[i] ? _status[i] : ProvinceStatus.PlainProvince;
            float ceiling = ProvinceStatusInfo.CeilingOf(status);

            if (resource == Resource.Money)
            {
                total += (long)(Production.DailyOutput(population, morale, Resource.Money) * ceiling);
                continue;
            }

            if (provinces.IsCity[i] && _provinceResource[i] == resource && ResourceInfo.IsCityGood(resource))
            {
                total += (long)(Production.DailyOutput(population, morale, resource) * ceiling);
            }
        }

        return total;
    }

    public void RunDay()
    {
        var provinces = world.Provinces;

        for (int i = 0; i < provinces.Count; i++)
        {
            ushort nation = provinces.Controller[i];
            if (nation == ProvinceStore.NoOwner || nation >= stockpile.NationCount)
            {
                continue;
            }

            float population = provinces.Population[i];
            float morale = provinces.Morale[i];

            ProvinceStatus status = provinces.IsCity[i] ? _status[i] : ProvinceStatus.PlainProvince;
            float ceiling = ProvinceStatusInfo.CeilingOf(status);

            stockpile.Add(nation, Resource.Money,
                (long)(Production.DailyOutput(population, morale, Resource.Money) * ceiling));

            if (!provinces.IsCity[i])
            {
                continue;
            }

            /* Every province already pays money above. Money and manpower are
               therefore not valid city goods: treating them as one would pay
               the same output twice. */
            Resource produced = _provinceResource[i];
            if (ResourceInfo.IsCityGood(produced))
            {
                stockpile.Add(nation, produced,
                    (long)(Production.DailyOutput(population, morale, produced) * ceiling));
            }
        }
    }
}
