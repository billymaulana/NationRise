import { f32, mulF32 } from '~/sim/determinism/float32'
import { roundHalfToEven } from '~/sim/determinism/rounding'
import { MAX_BUILDING_LEVEL, type BuildingType } from '~/sim/buildings/BuildingType'
import { Resource } from '~/sim/economy/Resource'

export interface ResourceCost {
  readonly resource: Resource
  readonly amount: number
}

interface CostBasis {
  readonly food: number
  readonly materials: number
  readonly fuel: number
  readonly technology: number
  readonly rare: number
  readonly money: number
  readonly hours: number
}

/*
 * Biaya dan durasi diambil dari tangkapan layar Conflict of Nations, dipetakan
 * ulang ke tujuh sumber daya permainan ini. Tingkat lebih tinggi lebih mahal
 * dan lebih lama, sehingga kota yang memecah perhatiannya tidak menyelesaikan
 * apa pun.
 *
 * Biayanya tersebar di barang yang memang dihasilkan dunia. Dari lima ratus
 * tiga puluh kota, dua puluh tujuh menghasilkan Technology dan seratus dua
 * puluh enam menghasilkan Rare Resources. Menagih setiap bangunan dalam
 * Technology berarti tidak ada negara yang mampu membangun pangkalan darat;
 * tanpa pangkalan ia tidak bisa meneliti unit, tanpa penelitian ia tidak bisa
 * memobilisasi, dan sepanjang enam puluh hari yang diukur tidak satu unit pun
 * dibangun di seluruh dunia sementara dunia yang sama menumpuk seratus juta
 * uang.
 */
const LEVEL_ONE: readonly CostBasis[] = [
  { food: 450, materials: 250, fuel: 500, technology: 0, rare: 150, money: 2000, hours: 28 },
  { food: 600, materials: 350, fuel: 350, technology: 80, rare: 300, money: 1250, hours: 10 },
  { food: 900, materials: 900, fuel: 1000, technology: 220, rare: 200, money: 2750, hours: 24 },
  { food: 700, materials: 700, fuel: 750, technology: 160, rare: 200, money: 2000, hours: 10 },
  { food: 450, materials: 250, fuel: 250, technology: 0, rare: 150, money: 1350, hours: 1 },
  { food: 700, materials: 450, fuel: 250, technology: 60, rare: 150, money: 1350, hours: 25 },
  { food: 600, materials: 750, fuel: 750, technology: 0, rare: 0, money: 2000, hours: 9 },
  { food: 750, materials: 400, fuel: 250, technology: 620, rare: 500, money: 3500, hours: 25 },
]

export function costsFor(type: BuildingType, level: number): readonly ResourceCost[] {
  const basis = basisFor(type, level)
  const scale = scaleFor(level)

  const costs: ResourceCost[] = []
  add(costs, Resource.Food, basis.food, scale)
  add(costs, Resource.Materials, basis.materials, scale)
  add(costs, Resource.Fuel, basis.fuel, scale)
  add(costs, Resource.Technology, basis.technology, scale)
  add(costs, Resource.RareResources, basis.rare, scale)
  add(costs, Resource.Money, basis.money, scale)

  return costs
}

export function hoursFor(type: BuildingType, level: number): number {
  return scaled(basisFor(type, level).hours, scaleFor(level))
}

/* Setiap tingkat berbiaya kira-kira 1,4 kali tingkat sebelumnya, sehingga
   bangunan tingkat lima setara sekitar lima bangunan tingkat satu dan tidak
   bisa dicapai secara tidak sengaja. */
function scaleFor(level: number): number {
  /* MathF.Pow menghitung dalam double lalu memotong sekali ke float, bukan
     memangkatkan dalam float32. */
  return f32(Math.pow(f32(1.4), level - 1))
}

function basisFor(type: BuildingType, level: number): CostBasis {
  if (level < 1 || level > MAX_BUILDING_LEVEL) {
    throw new RangeError(`tingkat bangunan ${level} di luar 1..${MAX_BUILDING_LEVEL}`)
  }

  return LEVEL_ONE[type]!
}

function scaled(amount: number, scale: number): number {
  return Math.trunc(roundHalfToEven(mulF32(amount, scale)))
}

function add(costs: ResourceCost[], resource: Resource, amount: number, scale: number): void {
  if (amount > 0) {
    costs.push({ resource, amount: scaled(amount, scale) })
  }
}
