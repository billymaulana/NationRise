namespace NationRise.Core.Ai;

public enum DecisionKind : byte
{
    DeclareWar = 0,
    ChooseTarget = 1,
    FrontPosture = 2,
    AcceptPeace = 3,
}

public readonly record struct Consideration(string Name, float Score, float Weight)
{
    public float Contribution => Score * Weight;
}

/*
   A scored decision the player can open up. Keeping the considerations rather
   than just the total is what lets the interface answer "why did they declare
   war on me", which the research found matters more to perceived fairness
   than any balance change.
*/
public sealed class Decision
{
    public required DecisionKind Kind { get; init; }
    public required int Subject { get; init; }
    public required IReadOnlyList<Consideration> Considerations { get; init; }

    public float Score
    {
        get
        {
            float total = 0f;
            foreach (Consideration c in Considerations)
            {
                total += c.Contribution;
            }

            return total;
        }
    }

    public Consideration Decisive
    {
        get
        {
            Consideration best = default;
            float bestValue = float.NegativeInfinity;

            foreach (Consideration c in Considerations)
            {
                float magnitude = MathF.Abs(c.Contribution);
                if (magnitude > bestValue)
                {
                    bestValue = magnitude;
                    best = c;
                }
            }

            return best;
        }
    }

    public string Explain() =>
        string.Join(", ", Considerations.Select(c => $"{c.Name} {c.Contribution:+0.0;-0.0}"));
}
