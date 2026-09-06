const MASK64 = (1n << 64n) - 1n
const MASK32 = 0xffffffffn

/*
 * xoshiro256** dan bukan Math.random: algoritmanya dipaku oleh berkas ini,
 * sehingga simpanan yang diputar ulang di mesin atau versi peramban lain tetap
 * menghasilkan deret yang identik. Math.random tidak menjanjikan apa pun soal
 * itu, dan bahkan tidak bisa diberi seed.
 *
 * Aritmetikanya memakai BigInt karena number hanya eksak sampai 2^53, sementara
 * generator ini butuh 64 bit penuh. Biayanya nyata; ada tolok ukur di
 * tests/sim/determinism yang menjaga agar tetap dalam anggaran.
 */
export class DeterministicRandom {
  readonly seed: bigint

  #s0: bigint
  #s1: bigint
  #s2: bigint
  #s3: bigint

  constructor(seed: bigint | number) {
    this.seed = BigInt(seed) & MASK64

    let z = this.seed
    ;[this.#s0, z] = splitMix64(z)
    ;[this.#s1, z] = splitMix64(z)
    ;[this.#s2, z] = splitMix64(z)
    ;[this.#s3, z] = splitMix64(z)
  }

  nextUInt64(): bigint {
    const result = (rotl((this.#s1 * 5n) & MASK64, 7n) * 9n) & MASK64
    const t = (this.#s1 << 17n) & MASK64

    this.#s2 ^= this.#s0
    this.#s3 ^= this.#s1
    this.#s1 ^= this.#s2
    this.#s0 ^= this.#s3
    this.#s2 ^= t
    this.#s3 = rotl(this.#s3, 45n)

    return result
  }

  /* Modulo tanpa penolakan, sama seperti implementasi C# yang jadi rujukan.
     Biasnya di bawah 2^-53 untuk batas yang dipakai permainan, dan mengubahnya
     akan memutus kesamaan deret dengan simpanan yang sudah ada. */
  nextInt(maxExclusive: number): number
  nextInt(minInclusive: number, maxExclusive: number): number
  nextInt(a: number, b?: number): number {
    const min = b === undefined ? 0 : a
    const max = b === undefined ? a : b

    if (max <= min) {
      throw new RangeError(`rentang kosong: [${min}, ${max})`)
    }

    return min + Number(this.nextUInt64() % BigInt(max - min))
  }

  nextDouble(): number {
    return Number(this.nextUInt64() >> 11n) * (1 / 2 ** 53)
  }
}

function rotl(x: bigint, k: bigint): bigint {
  return ((x << k) | (x >> (64n - k))) & MASK64
}

function splitMix64(z: bigint): [draw: bigint, state: bigint] {
  const next = (z + 0x9e3779b97f4a7c15n) & MASK64

  let r = next
  r = ((r ^ (r >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK64
  r = ((r ^ (r >> 27n)) * 0x94d049bb133111ebn) & MASK64

  return [r ^ (r >> 31n), next]
}

export function toUint32Pair(v: bigint): [hi: number, lo: number] {
  return [Number((v >> 32n) & MASK32), Number(v & MASK32)]
}
