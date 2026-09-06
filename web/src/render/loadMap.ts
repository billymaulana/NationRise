import { buildProvinceLut, type ProvinceLut } from '~/render/provinceLut'
import { loadProvinceIds, NO_PROVINCE, type ProvinceIdMap } from '~/render/provinceIds'
import { readWorld, type WorldData } from '~/sim/data/WorldFile'

export interface LoadedMap {
  readonly world: WorldData
  readonly idMap: ProvinceIdMap
  readonly lut: ProvinceLut
  readonly nameOf: (province: number) => string
  readonly nationOf: (province: number) => string
}

/*
 * Merakit apa yang dibutuhkan penyaji dari berkas yang dihasilkan pipeline.
 *
 * Ada di lapisan render, bukan di antarmuka: antarmuka tidak boleh menyentuh
 * simulasi langsung, dan pemuatan berkas dunia adalah urusan penyaji terhadap
 * data, bukan urusan panel terhadap simulasi.
 */
export async function loadMap(playerTag: string): Promise<LoadedMap> {
  const [worldBytes, idMap, geo] = await Promise.all([
    fetch('/data/world.bin').then((r) => r.arrayBuffer()),
    loadProvinceIds('/data/province-ids.png'),
    fetch('/data/provinces.geojson').then((r) => r.json() as Promise<GeoJson>),
  ])

  const world = readWorld(worldBytes)
  const lut = buildProvinceLut(world, latitudesFrom(idMap, world.provinceCount))

  const player = world.nationTags.indexOf(playerTag)
  for (let province = 0; province < world.provinceCount; province++) {
    const owner = world.ownerOf(province)
    if (owner >= world.nationTags.length) {
      lut.clearOwner(province)
      continue
    }

    lut.setOwner(province, owner, owner === player)
  }

  const names = new Array<string>(world.provinceCount).fill('')
  const nations = new Array<string>(world.provinceCount).fill('')
  for (const feature of geo.features) {
    const { id, name, nation } = feature.properties
    if (id >= 0 && id < world.provinceCount) {
      names[id] = name ?? ''
      nations[id] = nation ?? ''
    }
  }

  return {
    world,
    idMap,
    lut,
    nameOf: (province) => names[province] ?? '',
    nationOf: (province) => nations[province] ?? '',
  }
}

interface GeoJson {
  features: { properties: { id: number; name?: string; nation?: string } }[]
}

/*
 * Lintang wakil tiap provinsi dihitung dari piksel yang benar-benar miliknya,
 * bukan dari geometrinya. Kalau diambil dari geometri, provinsi yang tercap
 * satu piksel di tempat lain akan diwarnai menurut lintang yang tidak sesuai
 * dengan tempatnya tergambar.
 */
function latitudesFrom(idMap: ProvinceIdMap, provinceCount: number): (province: number) => number {
  const sum = new Float64Array(provinceCount)
  const count = new Uint32Array(provinceCount)

  for (let y = 0; y < idMap.height; y++) {
    const latitude = 90 - ((y + 0.5) / idMap.height) * 180
    const row = y * idMap.width

    for (let x = 0; x < idMap.width; x++) {
      const id = idMap.ids[row + x]!
      if (id === NO_PROVINCE || id >= provinceCount) continue

      sum[id] = sum[id]! + latitude
      count[id] = count[id]! + 1
    }
  }

  return (province) => (count[province]! > 0 ? sum[province]! / count[province]! : 0)
}
