import { Archetype, weightsFor } from '~/sim/ai/Archetype'
import { DecisionKind, type Decision } from '~/sim/ai/Decision'
import { Momentum } from '~/sim/ai/Momentum'
import type { ProvinceGraph } from '~/sim/data/WorldFile'
import { divF32, f32, mulF32, subF32 } from '~/sim/determinism/float32'
import { Relation, type Relations } from '~/sim/diplomacy/Relation'
import type { DeterministicRandom } from '~/sim/determinism/DeterministicRandom'
import { NO_OWNER } from '~/sim/world/ProvinceStore'
import type { WorldState } from '~/sim/world/WorldState'

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value))
}

/*
 * Penalaran strategis satu negara. Berjalan bergiliran sehingga 247 negara
 * tidak pernah berpikir pada tick yang sama, dan setiap kesimpulan membawa
 * pertimbangan yang menghasilkannya supaya pemain bisa membuka mana pun.
 */
export class NationBrain {
  readonly #archetype: Uint8Array
  readonly #provinceCount: Int32Array
  readonly #lastDecisions: Decision[] = []

  graph: ProvinceGraph | null = null

  constructor(
    private readonly world: WorldState,
    private readonly relations: Relations,
    private readonly momentum: Momentum,
    private readonly random: DeterministicRandom,
  ) {
    this.#archetype = new Uint8Array(world.nations.count)
    this.#provinceCount = new Int32Array(world.nations.count)
  }

  get lastDecisions(): readonly Decision[] {
    return this.#lastDecisions
  }

  archetypeOf(nation: number): Archetype {
    return this.#archetype[nation]! as Archetype
  }

  /* Enam puluh persen kepribadian datang dari bentuk negaranya sendiri, empat
     puluh persen dari seed — sehingga Rusia biasanya tetapi tidak selalu
     agresif, dan tidak ada dua kampanye yang persis sejajar. */
  assignArchetypes(): void {
    this.#countProvinces()

    for (let nation = 0; nation < this.world.nations.count; nation++) {
      this.#archetype[nation] =
        this.random.nextDouble() < 0.4 ? this.random.nextInt(5) : this.#fromShape(nation)
    }
  }

  #fromShape(nation: number): Archetype {
    const provinces = this.#provinceCount[nation]!

    if (provinces >= 40) return Archetype.Expansionist
    if (provinces <= 4) return Archetype.Defender

    return provinces >= 15 ? Archetype.Opportunist : Archetype.Trader
  }

  #countProvinces(): void {
    this.#provinceCount.fill(0)

    for (let i = 0; i < this.world.provinces.count; i++) {
      const owner = this.world.provinces.controller[i]!
      if (owner !== NO_OWNER && owner < this.#provinceCount.length) {
        this.#provinceCount[owner] = this.#provinceCount[owner]! + 1
      }
    }
  }

  think(nation: number, tick: number): void {
    this.#lastDecisions.length = 0

    if (this.momentum.isLocked(nation, DecisionKind.DeclareWar, tick)) return

    this.#countProvinces()

    let best: Decision | null = null
    let bestScore = Number.NEGATIVE_INFINITY

    for (const other of this.#neighbours(nation)) {
      if (other === nation || this.relations.atWar(nation, other)) continue

      const decision = this.#scoreWar(nation, other)
      const score = this.momentum.adjustedScore(nation, DecisionKind.DeclareWar, decision)

      if (score > bestScore) {
        bestScore = score
        best = decision
      }
    }

    if (best === null) return

    this.#lastDecisions.push(best)

    if (bestScore >= Momentum.entryThresholdFor(DecisionKind.DeclareWar)) {
      this.relations.set(nation, best.subject, Relation.War)
      this.momentum.commit(nation, DecisionKind.DeclareWar, best.subject, tick)
    }
  }

  #scoreWar(nation: number, target: number): Decision {
    const weights = weightsFor(this.archetypeOf(nation))

    const mine = f32(this.#provinceCount[nation]!)
    const theirs = Math.max(f32(this.#provinceCount[target]!), f32(1))
    const ratio = divF32(mine, theirs)

    /* Rasio kekuatan mendominasi: menyerang yang lebih kuat harus jadi tindakan
       putus asa yang disengaja, bukan kecelakaan pembobotan. */
    const strength = clamp(mulF32(subF32(ratio, f32(1)), f32(40)), -60, 60)
    const size = clamp(mulF32(theirs, f32(1.5)), 0, 30)
    const claims = mulF32(this.#claimPressure(nation, target), f32(25))
    const busy = this.relations.enemiesOf(target).length > 0 ? f32(20) : 0

    return {
      kind: DecisionKind.DeclareWar,
      subject: target,
      considerations: [
        { name: 'relative strength', score: strength, weight: weights.riskTolerance },
        { name: 'territory on offer', score: size, weight: weights.warAppetite },
        { name: 'unfulfilled claims', score: claims, weight: weights.warAppetite },
        { name: 'target already at war', score: busy, weight: weights.opportunismOnWeakness },
        { name: 'cost of war', score: f32(-25), weight: weights.economicFocus },
      ],
    }
  }

  #claimPressure(nation: number, target: number): number {
    let claimed = 0

    for (let i = 0; i < this.world.provinces.count; i++) {
      if (this.world.provinces.controller[i] !== target) continue
      if (this.world.provinces.claimsOf(i).includes(nation)) claimed++
    }

    return Math.min(claimed, 4)
  }

  /* Dikumpulkan ke larik, dan urutannya urutan pemindaian provinsi. Itu bukan
     kebetulan: skor perang sering seri, dan yang diperiksa lebih dulu yang
     menang, sehingga urutan ini bagian dari determinisme. */
  #neighbours(nation: number): number[] {
    const found: number[] = []
    const seen = new Set<number>()

    if (this.graph === null) return found

    for (let i = 0; i < this.world.provinces.count; i++) {
      if (this.world.provinces.controller[i] !== nation) continue

      for (const next of this.graph.neighboursOf(i)) {
        const owner = this.world.provinces.controller[next]!
        if (owner !== NO_OWNER && owner !== nation && !seen.has(owner)) {
          seen.add(owner)
          found.push(owner)
        }
      }
    }

    return found
  }
}
