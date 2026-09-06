namespace NationRise.Game.Bridge;

/*
   A declaration of war as a player should read it. The full consideration
   vector behind the decision stays available in `Reasoning`, but it is
   diagnostics: putting it on the map means showing someone the machinery
   instead of the event.
*/
public sealed record WarReport(
    string Attacker,
    string Defender,
    string Reason,
    string Reasoning,
    int Day);
