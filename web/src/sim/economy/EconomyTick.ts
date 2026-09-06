import { mulF32 } from '~/sim/determinism/float32'
import { dailyOutput } from '~/sim/economy/Production'
import { ceilingOf, ProvinceStatus } from '~/sim/economy/ProvinceStatus'
import { isCityGood, Resource, RESOURCE_COUNT } from '~/sim/economy/Resource'
import type { Stockpile } from '~/sim/economy/Stockpile'
import { NO_OWNER } from '~/sim/world/ProvinceStore'
import type { WorldState } from '~/sim/world/WorldState'

/*
 * `int * float` di C# dihitung sebagai float 32-bit lalu dipotong ke arah nol
 * oleh cast ke long. Melewatkan pembulatan itu membuat hasil harian meleset
 * satu untuk sebagian provinsi.
 */
function yield32(output: number, ceiling: number): number {
  return Math.trunc(mulF32(output, ceiling))
}

export class EconomyTick {
  /* Setiap provinsi membawa satu sumber daya, sehingga sapuan hariannya linear.
     Kota berproduksi mengikuti kurva populasi; provinsi biasa menghasilkan
     bagian datar pada separuh batas — itulah sebabnya menguasai tanah kosong
     membantu tetapi tidak pernah menggantikan menguasai kota. */
  readonly #provinceResource: Uint8Array
  readonly #status: Uint8Array

  constructor(
    private readonly world: WorldState,
    private readonly stockpile: Stockpile,
  ) {
    this.#provinceResource = new Uint8Array(world.provinces.count)
    this.#status = new Uint8Array(world.provinces.count)
  }

  assignResource(province: number, resource: Resource): void {
    this.#provinceResource[province] = resource
  }

  resourceOf(province: number): Resource {
    return this.#provinceResource[province]! as Resource
  }

  setStatus(province: number, status: ProvinceStatus): void {
    this.#status[province] = status
  }

  statusOf(province: number): ProvinceStatus {
    return this.#status[province]! as ProvinceStatus
  }

  #ceilingAt(province: number): number {
    const status =
      this.world.provinces.isCity[province] !== 0
        ? (this.#status[province]! as ProvinceStatus)
        : ProvinceStatus.PlainProvince

    return ceilingOf(status)
  }

  /*
   * Yang akan ditambahkan runDay untuk satu negara, tanpa menambahkannya.
   * Tampilan lebih membutuhkan lajunya daripada saldonya: cadangan 8.000 tidak
   * berarti apa-apa sampai diketahui ia sedang naik atau terkuras.
   */
  dailyIncomeOf(nation: number, resource: Resource): number {
    const provinces = this.world.provinces
    let total = 0

    for (let i = 0; i < provinces.count; i++) {
      if (provinces.controller[i] !== nation) continue

      const population = provinces.population[i]!
      const morale = provinces.morale[i]!
      const ceiling = this.#ceilingAt(i)

      if (resource === Resource.Money) {
        total += yield32(dailyOutput(population, morale, Resource.Money), ceiling)
        continue
      }

      if (
        provinces.isCity[i] !== 0 &&
        this.#provinceResource[i] === resource &&
        isCityGood(resource)
      ) {
        total += yield32(dailyOutput(population, morale, resource), ceiling)
      }
    }

    return total
  }

  /*
   * Seluruh pemasukan setiap negara dalam satu sapuan. dailyIncomeOf menjawab
   * untuk satu negara dan menyusuri peta untuk itu; menanyakannya bagi semua
   * negara dan semua barang adalah kuadratik yang jauh terlalu berat untuk peta
   * dunia, sementara pasar membutuhkan angka itu setiap hari.
   */
  dailyIncomeInto(into: Float64Array): void {
    into.fill(0)

    const provinces = this.world.provinces

    for (let i = 0; i < provinces.count; i++) {
      const nation = provinces.controller[i]!
      if (nation === NO_OWNER || nation >= this.stockpile.nationCount) continue

      const population = provinces.population[i]!
      const morale = provinces.morale[i]!
      const ceiling = this.#ceilingAt(i)

      const moneySlot = nation * RESOURCE_COUNT + Resource.Money
      into[moneySlot] =
        into[moneySlot]! + yield32(dailyOutput(population, morale, Resource.Money), ceiling)

      if (provinces.isCity[i] === 0) continue

      const produced = this.#provinceResource[i]! as Resource
      if (isCityGood(produced)) {
        const slot = nation * RESOURCE_COUNT + produced
        into[slot] = into[slot]! + yield32(dailyOutput(population, morale, produced), ceiling)
      }
    }
  }

  runDay(): void {
    const provinces = this.world.provinces

    for (let i = 0; i < provinces.count; i++) {
      const nation = provinces.controller[i]!
      if (nation === NO_OWNER || nation >= this.stockpile.nationCount) continue

      const population = provinces.population[i]!
      const morale = provinces.morale[i]!
      const ceiling = this.#ceilingAt(i)

      this.stockpile.add(
        nation,
        Resource.Money,
        yield32(dailyOutput(population, morale, Resource.Money), ceiling),
      )

      if (provinces.isCity[i] === 0) continue

      /* Setiap provinsi sudah membayar uang di atas. Money dan manpower karena
         itu bukan barang kota yang sah: memperlakukannya begitu akan membayar
         keluaran yang sama dua kali. */
      const produced = this.#provinceResource[i]! as Resource
      if (isCityGood(produced)) {
        this.stockpile.add(
          nation,
          produced,
          yield32(dailyOutput(population, morale, produced), ceiling),
        )
      }
    }
  }
}
