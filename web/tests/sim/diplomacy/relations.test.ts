import { describe, expect, it } from 'vitest'
import { Relation, Relations } from '~/sim/diplomacy/Relation'

/* Diport dari NationRise.Core.Tests/Diplomacy/RelationsTests.cs. */

describe('hubungan antarnegara', () => {
  it('semua orang mulai dalam damai', () => {
    const relations = new Relations(10)

    expect(relations.between(3, 7)).toBe(Relation.Peace)
    expect(relations.atWar(3, 7)).toBe(false)
  })

  it('hubungan bersifat simetris', () => {
    const relations = new Relations(10)
    relations.set(2, 8, Relation.War)

    expect(relations.atWar(2, 8)).toBe(true)
    expect(relations.atWar(8, 2)).toBe(true)
    expect(relations.between(2, 8)).toBe(relations.between(8, 2))
  })

  it('sebuah negara berdamai dengan dirinya sendiri', () => {
    const relations = new Relations(5)

    expect(relations.between(3, 3)).toBe(Relation.Peace)
    expect(() => relations.set(3, 3, Relation.War)).toThrow(RangeError)
  })

  it('memasuki wilayah butuh perang atau hak lintas', () => {
    const relations = new Relations(5)

    expect(relations.mayEnter(1, 2)).toBe(false)

    relations.set(1, 2, Relation.RightOfWay)
    expect(relations.mayEnter(1, 2)).toBe(true)

    relations.set(1, 2, Relation.War)
    expect(relations.mayEnter(1, 2)).toBe(true)
  })

  it('daftar musuh cocok dengan matriksnya', () => {
    const relations = new Relations(6)
    relations.set(0, 2, Relation.War)
    relations.set(0, 5, Relation.War)
    relations.set(1, 3, Relation.War)

    expect(relations.enemiesOf(0)).toEqual([2, 5])
    expect(relations.enemiesOf(1)).toEqual([3])
  })

  it('matriks tetap kecil untuk dunia penuh', () => {
    const relations = new Relations(247)
    relations.set(0, 246, Relation.War)

    expect(relations.atWar(246, 0)).toBe(true)
  })
})
