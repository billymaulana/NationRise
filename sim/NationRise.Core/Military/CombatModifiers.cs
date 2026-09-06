namespace NationRise.Core.Military;

/*
   Everything outside the two stacks that changes how hard they hit: supply,
   posture, entrenchment, a beachhead. Combat multiplies them and knows nothing
   about where they came from, which is what lets a new modifier be added
   without touching the damage code.
*/
public readonly record struct CombatModifiers(
    float AttackerAttack,
    float AttackerDamageTaken,
    float DefenderAttack,
    float DefenderDamageTaken)
{
    public static readonly CombatModifiers None = new(1f, 1f, 1f, 1f);

    public CombatModifiers WithAttackerAttack(float factor) =>
        this with { AttackerAttack = AttackerAttack * factor };

    public CombatModifiers WithAttackerDamageTaken(float factor) =>
        this with { AttackerDamageTaken = AttackerDamageTaken * factor };

    public CombatModifiers WithDefenderAttack(float factor) =>
        this with { DefenderAttack = DefenderAttack * factor };

    public CombatModifiers WithDefenderDamageTaken(float factor) =>
        this with { DefenderDamageTaken = DefenderDamageTaken * factor };
}
