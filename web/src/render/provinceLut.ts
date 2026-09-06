import { groundFor, nationColour, weatheredBy, type Rgb } from '~/render/mapPalette'
import type { WorldData } from '~/sim/data/WorldFile'
import { isWater, type Terrain } from '~/sim/world/Terrain'

export const LUT_WIDTH = 2048
export const LUT_HEIGHT = 2

/*
 * Tabel pencarian per provinsi, dua baris.
 *
 * Baris nol menyimpan warna tanah dan penanda daratan; ia dihitung sekali
 * karena hanya bergantung pada medan dan lintang, keduanya tidak berubah.
 * Baris satu menyimpan warna pemilik. Mengganti kepemilikan berarti menulis
 * ulang satu texel di baris itu, bukan menyentuh geometri apa pun.
 */
export interface ProvinceLut {
  readonly data: Uint8Array
  setOwner(province: number, nation: number, isPlayer: boolean): void
  clearOwner(province: number): void
}

function write(data: Uint8Array, offset: number, colour: Rgb, alpha: number): void {
  data[offset] = Math.round(colour.r * 255)
  data[offset + 1] = Math.round(colour.g * 255)
  data[offset + 2] = Math.round(colour.b * 255)
  data[offset + 3] = alpha
}

/* Lintang wakil sebuah provinsi diambil dari barisnya di tekstur id, bukan dari
   geometri: tekstur itu yang menentukan piksel mana miliknya, sehingga
   lintangnya konsisten dengan apa yang benar-benar tergambar. */
export function buildProvinceLut(
  world: WorldData,
  latitudeOf: (province: number) => number,
): ProvinceLut {
  const data = new Uint8Array(LUT_WIDTH * LUT_HEIGHT * 4)

  for (let province = 0; province < world.provinceCount; province++) {
    const terrain = world.terrainOf(province) as Terrain
    const latitude = latitudeOf(province)
    const ground = weatheredBy(groundFor(terrain, latitude), latitude)

    write(data, province * 4, ground, isWater(terrain) ? 0 : 255)
  }

  const ownerRow = LUT_WIDTH * 4

  return {
    data,
    setOwner(province: number, nation: number, isPlayer: boolean): void {
      write(data, ownerRow + province * 4, nationColour(nation, isPlayer), 255)
    },
    clearOwner(province: number): void {
      write(data, ownerRow + province * 4, { r: 0, g: 0, b: 0 }, 0)
    },
  }
}
