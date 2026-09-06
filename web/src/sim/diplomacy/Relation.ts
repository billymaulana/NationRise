export enum Relation {
  Peace = 0,
  RightOfWay = 1,
  SharedIntelligence = 2,
  Ceasefire = 3,
  War = 4,
}

/*
 * Hubungan bersifat simetris dan disimpan di segitiga bawah sebuah matriks,
 * yang menjaga dunia 247 negara tetap 30 KB alih-alih 60 dan membuat dua negara
 * mustahil berbeda pendapat soal apakah mereka sedang berperang.
 */
export class Relations {
  readonly nationCount: number

  readonly #matrix: Uint8Array

  constructor(nationCount: number) {
    if (nationCount < 0) {
      throw new RangeError(`jumlah negara tidak boleh negatif: ${nationCount}`)
    }

    this.nationCount = nationCount
    this.#matrix = new Uint8Array((nationCount * (nationCount - 1)) / 2)
  }

  between(a: number, b: number): Relation {
    if (a === b) return Relation.Peace

    return this.#matrix[this.#indexOf(a, b)]! as Relation
  }

  set(a: number, b: number, relation: Relation): void {
    if (a === b) {
      throw new RangeError('sebuah negara tidak bisa berhubungan dengan dirinya sendiri')
    }

    this.#matrix[this.#indexOf(a, b)] = relation
  }

  atWar(a: number, b: number): boolean {
    return this.between(a, b) === Relation.War
  }

  mayEnter(mover: number, owner: number): boolean {
    if (mover === owner) return true

    const relation = this.between(mover, owner)
    return relation === Relation.War || relation === Relation.RightOfWay
  }

  /* Larik, bukan generator: urutannya adalah urutan indeks negara dan pemanggil
     di simulasi mengulanginya lebih dari sekali per hari. */
  enemiesOf(nation: number): number[] {
    const enemies: number[] = []

    for (let other = 0; other < this.nationCount; other++) {
      if (other !== nation && this.atWar(nation, other)) enemies.push(other)
    }

    return enemies
  }

  #indexOf(a: number, b: number): number {
    if (a < 0 || a >= this.nationCount || b < 0 || b >= this.nationCount) {
      throw new RangeError(`negara ${a} atau ${b} di luar 0..${this.nationCount - 1}`)
    }

    const high = a > b ? a : b
    const low = a > b ? b : a

    return (high * (high - 1)) / 2 + low
  }
}
