namespace NationRise.Game.Bridge;

public sealed record MovePlan(
    int ArmyId,
    IReadOnlyList<int> Path,
    float Hours,
    bool AmphibiousArrival,
    AttackPreview? Battle);
