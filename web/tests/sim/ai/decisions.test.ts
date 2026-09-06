import { describe, expect, it } from 'vitest'
import { Archetype, weightsFor } from '~/sim/ai/Archetype'
import { DecisionKind, decisiveOf, explain, scoreOf, type Decision } from '~/sim/ai/Decision'
import { Momentum } from '~/sim/ai/Momentum'

/* Diport dari NationRise.Core.Tests/Ai/AiTests.cs. */

describe('Archetype', () => {
  it('setiap kepribadian menghargai hal yang berbeda', () => {
    const expansionist = weightsFor(Archetype.Expansionist)
    const defender = weightsFor(Archetype.Defender)
    const trader = weightsFor(Archetype.Trader)

    expect(expansionist.warAppetite).toBeGreaterThan(defender.warAppetite)
    expect(trader.economicFocus).toBeGreaterThan(expansionist.economicFocus)
    expect(defender.loyalty).toBeGreaterThan(expansionist.loyalty)
  })
})

describe('Momentum', () => {
  const declaringWar: Decision = {
    kind: DecisionKind.DeclareWar,
    subject: 5,
    considerations: [{ name: 'test', score: 10, weight: 1 }],
  }

  it('memihak pilihan yang sudah berjalan', () => {
    const momentum = new Momentum()

    expect(momentum.adjustedScore(0, DecisionKind.DeclareWar, declaringWar)).toBeCloseTo(10, 2)

    momentum.commit(0, DecisionKind.DeclareWar, 5, 0)
    expect(momentum.adjustedScore(0, DecisionKind.DeclareWar, declaringWar)).toBeCloseTo(45, 2)
  })

  it('komitmen mengunci selama waktu yang diharapkan', () => {
    const momentum = new Momentum()
    momentum.commit(1, DecisionKind.DeclareWar, 2, 0)

    expect(momentum.isLocked(1, DecisionKind.DeclareWar, 100)).toBe(true)
    expect(momentum.isLocked(1, DecisionKind.DeclareWar, 719)).toBe(true)
    expect(momentum.isLocked(1, DecisionKind.DeclareWar, 720)).toBe(false)
  })

  it('melepas komitmen mengembalikan skor apa adanya', () => {
    const momentum = new Momentum()
    momentum.commit(0, DecisionKind.DeclareWar, 5, 0)
    momentum.release(0, DecisionKind.DeclareWar)

    expect(momentum.committedSubject(0, DecisionKind.DeclareWar)).toBe(-1)
    expect(momentum.adjustedScore(0, DecisionKind.DeclareWar, declaringWar)).toBeCloseTo(10, 2)
  })

  /* Memasuki perang harus jauh lebih sulit daripada bertahan di dalamnya, atau
     negara akan berayun antara menyatakan dan membatalkan. */
  it('ambang keluar lebih longgar daripada ambang masuk', () => {
    const entry = Momentum.entryThresholdFor(DecisionKind.DeclareWar)
    const exit = Momentum.exitThresholdFor(DecisionKind.DeclareWar)

    expect(entry).toBeGreaterThan(exit)
    expect(entry / exit).toBeGreaterThanOrEqual(2.5)
  })
})

describe('Decision', () => {
  const decision: Decision = {
    kind: DecisionKind.DeclareWar,
    subject: 3,
    considerations: [
      { name: 'relative strength', score: 40, weight: 1.2 },
      { name: 'cost of war', score: -25, weight: 1 },
    ],
  }

  it('keputusan menjelaskan dirinya sendiri', () => {
    expect(scoreOf(decision)).toBeCloseTo(23, 1)
    expect(decisiveOf(decision)?.name).toBe('relative strength')
    expect(explain(decision)).toContain('relative strength')
  })

  it('penjelasannya membawa tanda yang eksplisit', () => {
    expect(explain(decision)).toBe('relative strength +48.0, cost of war -25.0')
  })

  it('keputusan tanpa pertimbangan tidak punya yang menentukan', () => {
    const empty: Decision = { kind: DecisionKind.AcceptPeace, subject: 0, considerations: [] }

    expect(scoreOf(empty)).toBe(0)
    expect(decisiveOf(empty)).toBeNull()
    expect(explain(empty)).toBe('')
  })
})
