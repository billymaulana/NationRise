export enum Archetype {
  Expansionist = 0,
  Defender = 1,
  Trader = 2,
  Diplomat = 3,
  Opportunist = 4,
}

export interface ArchetypeWeights {
  readonly warAppetite: number
  readonly riskTolerance: number
  readonly economicFocus: number
  readonly loyalty: number
  readonly opportunismOnWeakness: number
}

/*
 * Kepribadian adalah sekumpulan bobot, bukan naskah. Setiap negara menjalankan
 * kode penilaian yang sama; yang berbeda hanya seberapa besar tiap
 * pertimbangan dihitung — itulah sebabnya Expansionist dan Defender bisa
 * memandang perbatasan yang identik dan sampai pada kesimpulan berlawanan.
 */
const WEIGHTS: Readonly<Record<Archetype, ArchetypeWeights>> = {
  [Archetype.Expansionist]: {
    warAppetite: 1.35,
    riskTolerance: 1.2,
    economicFocus: 0.75,
    loyalty: 0.8,
    opportunismOnWeakness: 1.1,
  },
  [Archetype.Defender]: {
    warAppetite: 0.45,
    riskTolerance: 0.6,
    economicFocus: 1.1,
    loyalty: 1.3,
    opportunismOnWeakness: 0.5,
  },
  [Archetype.Trader]: {
    warAppetite: 0.55,
    riskTolerance: 0.7,
    economicFocus: 1.45,
    loyalty: 1.05,
    opportunismOnWeakness: 0.7,
  },
  [Archetype.Diplomat]: {
    warAppetite: 0.65,
    riskTolerance: 0.85,
    economicFocus: 1.15,
    loyalty: 1.4,
    opportunismOnWeakness: 0.6,
  },
  [Archetype.Opportunist]: {
    warAppetite: 1.05,
    riskTolerance: 1.1,
    economicFocus: 0.95,
    loyalty: 0.55,
    opportunismOnWeakness: 1.5,
  },
}

export const ALL_ARCHETYPES: readonly Archetype[] = [
  Archetype.Expansionist,
  Archetype.Defender,
  Archetype.Trader,
  Archetype.Diplomat,
  Archetype.Opportunist,
]

export function weightsFor(archetype: Archetype): ArchetypeWeights {
  return WEIGHTS[archetype] ?? WEIGHTS[Archetype.Opportunist]
}
