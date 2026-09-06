import { addF32, mulF32 } from '~/sim/determinism/float32'

export enum DecisionKind {
  DeclareWar = 0,
  ChooseTarget = 1,
  FrontPosture = 2,
  AcceptPeace = 3,
}

export interface Consideration {
  readonly name: string
  readonly score: number
  readonly weight: number
}

export function contributionOf(consideration: Consideration): number {
  return mulF32(consideration.score, consideration.weight)
}

/*
 * Keputusan berskor yang bisa dibuka pemain. Menyimpan pertimbangannya, bukan
 * hanya totalnya, adalah yang memungkinkan antarmuka menjawab "kenapa mereka
 * menyatakan perang padaku" — dan riset menemukan itu lebih menentukan rasa
 * adil daripada perubahan keseimbangan mana pun.
 */
export interface Decision {
  readonly kind: DecisionKind
  readonly subject: number
  readonly considerations: readonly Consideration[]
}

export function scoreOf(decision: Decision): number {
  let total = 0
  for (const consideration of decision.considerations) {
    total = addF32(total, contributionOf(consideration))
  }

  return total
}

export function decisiveOf(decision: Decision): Consideration | null {
  let best: Consideration | null = null
  let bestValue = Number.NEGATIVE_INFINITY

  for (const consideration of decision.considerations) {
    const magnitude = Math.abs(contributionOf(consideration))
    if (magnitude > bestValue) {
      bestValue = magnitude
      best = consideration
    }
  }

  return best
}

/* Format tandanya selalu eksplisit, meniru `+0.0;-0.0` di implementasi
   rujukan: pembaca harus bisa melihat pertimbangan mana yang menarik ke arah
   berlawanan tanpa membandingkan angka satu per satu. */
export function explain(decision: Decision): string {
  return decision.considerations
    .map((consideration) => {
      const value = contributionOf(consideration)
      const sign = value >= 0 ? '+' : '-'
      return `${consideration.name} ${sign}${Math.abs(value).toFixed(1)}`
    })
    .join(', ')
}
