export enum Doctrine {
  Western = 0,
  Eastern = 1,
  European = 2,
}

export class NationStore {
  readonly count: number

  readonly tag: string[]
  readonly name: string[]
  readonly doctrine: Uint8Array
  readonly capitalProvince: Int32Array
  readonly isAlive: Uint8Array

  constructor(count: number) {
    if (count < 0) {
      throw new RangeError(`jumlah negara tidak boleh negatif: ${count}`)
    }

    this.count = count
    this.tag = new Array<string>(count).fill('')
    this.name = new Array<string>(count).fill('')
    this.doctrine = new Uint8Array(count)
    this.capitalProvince = new Int32Array(count).fill(-1)
    this.isAlive = new Uint8Array(count).fill(1)
  }

  indexOf(tag: string): number {
    return this.tag.indexOf(tag)
  }
}
