import { addF32 } from '~/sim/determinism/float32'
import { DecisionKind, scoreOf, type Decision } from '~/sim/ai/Decision'

interface Commitment {
  readonly subject: number
  readonly untilTick: number
}

/*
 * Mencegah AI berubah pikiran setiap kali angkanya bergoyang. Tiga mekanisme
 * terpisah, masing-masing berjangkar pada gim yang sudah rilis: bonus untuk
 * pilihan yang sedang berjalan (Civilization V memakai 50 pada skala 0-100),
 * komitmen minimum sebelum boleh ditinjau ulang, dan ambang keluar yang jauh
 * lebih longgar daripada ambang masuk — cara yang sama dipakai damping BGP dan
 * autoscaling Kubernetes.
 */
export class Momentum {
  /* Map, bukan objek: kuncinya pasangan negara dan jenis keputusan, dan
     pembacaannya selalu lewat kunci sehingga penghapusan tidak memengaruhi
     hasil apa pun. */
  readonly #committed = new Map<string, Commitment>()

  static bonusFor(kind: DecisionKind): number {
    switch (kind) {
      case DecisionKind.DeclareWar:
        return 35
      case DecisionKind.ChooseTarget:
        return 30
      case DecisionKind.AcceptPeace:
        return 25
      default:
        return 15
    }
  }

  static lockTicksFor(kind: DecisionKind): number {
    switch (kind) {
      case DecisionKind.DeclareWar:
      case DecisionKind.ChooseTarget:
        return 720
      case DecisionKind.AcceptPeace:
        return 168
      default:
        return 72
    }
  }

  static entryThresholdFor(kind: DecisionKind): number {
    return kind === DecisionKind.DeclareWar ? 65 : 50
  }

  /* Ambang keluar duduk jauh di bawah ambang masuk: perang yang dimasuki pada
     65 baru ditinggalkan di bawah 5, dan itulah yang mencegah sebuah negara
     menyatakan lalu membatalkan perang dalam minggu yang sama. */
  static exitThresholdFor(kind: DecisionKind): number {
    return kind === DecisionKind.DeclareWar ? 5 : 20
  }

  isLocked(nation: number, kind: DecisionKind, tick: number): boolean {
    const commitment = this.#committed.get(key(nation, kind))
    return commitment !== undefined && tick < commitment.untilTick
  }

  committedSubject(nation: number, kind: DecisionKind): number {
    return this.#committed.get(key(nation, kind))?.subject ?? -1
  }

  commit(nation: number, kind: DecisionKind, subject: number, tick: number): void {
    this.#committed.set(key(nation, kind), {
      subject,
      untilTick: tick + Momentum.lockTicksFor(kind),
    })
  }

  release(nation: number, kind: DecisionKind): void {
    this.#committed.delete(key(nation, kind))
  }

  adjustedScore(nation: number, kind: DecisionKind, decision: Decision): number {
    return this.committedSubject(nation, kind) === decision.subject
      ? addF32(scoreOf(decision), Momentum.bonusFor(kind))
      : scoreOf(decision)
  }
}

function key(nation: number, kind: DecisionKind): string {
  return `${nation}:${kind}`
}
