import { buildProvinceLut, type ProvinceLut } from '~/render/provinceLut'
import { loadProvinceIds, NO_PROVINCE, type ProvinceIdMap } from '~/render/provinceIds'
import { readWorld, type WorldData } from '~/sim/data/WorldFile'

export interface MapLabel {
  readonly province: number
  readonly name: string
  readonly lon: number
  readonly lat: number
}

export interface LoadedMap {
  readonly world: WorldData
  readonly idMap: ProvinceIdMap
  readonly lut: ProvinceLut
  readonly cities: readonly MapLabel[]
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
  const [worldBytes, idMap, geo, centres] = await Promise.all([
    fetch('/data/world.bin').then((r) => r.arrayBuffer()),
    loadProvinceIds('/data/province-ids.png'),
    fetch('/data/provinces.geojson').then((r) => r.json() as Promise<GeoJson>),
    fetch('/data/province-centres.json').then((r) => r.json() as Promise<Centres>),
  ])

  const world = readWorld(worldBytes)
  const lut = buildProvinceLut(world, (province) => centres.lat[province] ?? 0)

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

  const cities: MapLabel[] = []
  for (let province = 0; province < world.provinceCount; province++) {
    if (!world.isCity(province)) continue

    cities.push({
      province,
      name: names[province] ?? '',
      lon: centres.lon[province] ?? 0,
      lat: centres.lat[province] ?? 0,
    })
  }

  return {
    world,
    idMap,
    lut,
    cities,
    nameOf: (province) => names[province] ?? '',
    nationOf: (province) => nations[province] ?? '',
  }
}

interface GeoJson {
  features: { properties: { id: number; name?: string; nation?: string } }[]
}

/* Dihitung saat build dari piksel yang benar-benar dimiliki tiap provinsi.
   Menghitungnya di sini berarti menyapu delapan juta piksel di utas utama dan
   membekukan antarmuka beberapa detik sebelum peta muncul. */
interface Centres {
  lon: number[]
  lat: number[]
}
