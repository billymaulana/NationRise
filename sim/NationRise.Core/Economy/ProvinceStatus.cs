namespace NationRise.Core.Economy;

public enum ProvinceStatus : byte
{
    Homeland = 0,
    Annexed = 1,
    Occupied = 2,
    PlainProvince = 3,
}

public static class ProvinceStatusInfo
{
    /* Output ceilings by status. Plain provinces are capped at half, which is
       what stops a nation from funding a war on empty ground alone; occupied
       territory yields a quarter until it is annexed. */
    private static readonly float[] Ceilings = [1.00f, 0.50f, 0.25f, 0.50f];

    public static float CeilingOf(ProvinceStatus status) => Ceilings[(int)status];

    public static bool CanMobilise(ProvinceStatus status) =>
        status is ProvinceStatus.Homeland or ProvinceStatus.Annexed;
}
