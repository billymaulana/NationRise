namespace NationRise.Core.Ai;

/*
   Stops the AI changing its mind every time the numbers wobble. Three separate
   mechanisms, each anchored to a shipped game: a bonus for the choice already
   running (Civilization V uses 50 on a 0-100 scale), a minimum commitment
   before reconsidering, and an exit threshold looser than the entry one, the
   way BGP damping and Kubernetes autoscaling both do it.
*/
public sealed class Momentum
{
    private readonly Dictionary<(int Nation, DecisionKind Kind), Commitment> _committed = [];

    private readonly record struct Commitment(int Subject, long UntilTick);

    public static float BonusFor(DecisionKind kind) => kind switch
    {
        DecisionKind.DeclareWar => 35f,
        DecisionKind.ChooseTarget => 30f,
        DecisionKind.AcceptPeace => 25f,
        _ => 15f,
    };

    public static long LockTicksFor(DecisionKind kind) => kind switch
    {
        DecisionKind.DeclareWar => 720,
        DecisionKind.ChooseTarget => 720,
        DecisionKind.AcceptPeace => 168,
        _ => 72,
    };

    public static float EntryThresholdFor(DecisionKind kind) => kind switch
    {
        DecisionKind.DeclareWar => 65f,
        _ => 50f,
    };

    /* The exit threshold sits far below the entry one: a war entered at 65 is
       only abandoned below 5, which is what stops a nation declaring and
       cancelling in the same week. */
    public static float ExitThresholdFor(DecisionKind kind) => kind switch
    {
        DecisionKind.DeclareWar => 5f,
        _ => 20f,
    };

    public bool IsLocked(int nation, DecisionKind kind, long tick) =>
        _committed.TryGetValue((nation, kind), out Commitment c) && tick < c.UntilTick;

    public int CommittedSubject(int nation, DecisionKind kind) =>
        _committed.TryGetValue((nation, kind), out Commitment c) ? c.Subject : -1;

    public void Commit(int nation, DecisionKind kind, int subject, long tick) =>
        _committed[(nation, kind)] = new Commitment(subject, tick + LockTicksFor(kind));

    public void Release(int nation, DecisionKind kind) => _committed.Remove((nation, kind));

    public float AdjustedScore(int nation, DecisionKind kind, Decision decision)
    {
        int committed = CommittedSubject(nation, kind);
        return committed == decision.Subject
            ? decision.Score + BonusFor(kind)
            : decision.Score;
    }
}
