namespace NationRise.Core.Ai;

public enum Archetype : byte
{
    Expansionist = 0,
    Defender = 1,
    Trader = 2,
    Diplomat = 3,
    Opportunist = 4,
}

/*
   Personality is a set of weights, not a script. Every nation runs the same
   scoring code; what differs is how much each consideration counts, which is
   why an Expansionist and a Defender can look at identical borders and reach
   opposite conclusions.
*/
public sealed class ArchetypeWeights
{
    public required float WarAppetite { get; init; }
    public required float RiskTolerance { get; init; }
    public required float EconomicFocus { get; init; }
    public required float Loyalty { get; init; }
    public required float OpportunismOnWeakness { get; init; }

    public static ArchetypeWeights For(Archetype archetype) => archetype switch
    {
        Archetype.Expansionist => new()
        {
            WarAppetite = 1.35f, RiskTolerance = 1.20f, EconomicFocus = 0.75f,
            Loyalty = 0.80f, OpportunismOnWeakness = 1.10f,
        },
        Archetype.Defender => new()
        {
            WarAppetite = 0.45f, RiskTolerance = 0.60f, EconomicFocus = 1.10f,
            Loyalty = 1.30f, OpportunismOnWeakness = 0.50f,
        },
        Archetype.Trader => new()
        {
            WarAppetite = 0.55f, RiskTolerance = 0.70f, EconomicFocus = 1.45f,
            Loyalty = 1.05f, OpportunismOnWeakness = 0.70f,
        },
        Archetype.Diplomat => new()
        {
            WarAppetite = 0.65f, RiskTolerance = 0.85f, EconomicFocus = 1.15f,
            Loyalty = 1.40f, OpportunismOnWeakness = 0.60f,
        },
        _ => new()
        {
            WarAppetite = 1.05f, RiskTolerance = 1.10f, EconomicFocus = 0.95f,
            Loyalty = 0.55f, OpportunismOnWeakness = 1.50f,
        },
    };
}
