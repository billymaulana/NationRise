using NationRise.Core.Military;
using NationRise.Core.World;

namespace NationRise.Game.Bridge;

public sealed record AttackPreview(
    int AttackerUnits,
    int DefenderUnits,
    string DefenderName,
    Terrain Terrain,
    bool Amphibious,
    BattleForecast Forecast);
