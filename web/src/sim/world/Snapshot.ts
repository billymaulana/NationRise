import type { WorldState } from '~/sim/world/WorldState'

export interface ArmyView {
  readonly id: number
  readonly nation: number
  readonly province: number
  readonly unitCount: number
  readonly health: number
}

/*
 * Apa yang boleh dilihat penggambar. Baca-saja sejak dibentuk, dan dihasilkan
 * pada laju penyegaran antarmuka alih-alih laju simulasi, sehingga penggambar
 * boleh tertinggal atau melewatkan tick tanpa disadari simulasinya.
 */
export interface WorldSnapshot {
  readonly tick: number
  readonly day: number
  readonly hour: number
  readonly controller: Readonly<Uint16Array>
  readonly morale: Readonly<Float32Array>
  readonly armies: readonly ArmyView[]
}

/*
 * Larik provinsi diteruskan sebagai pandangan, bukan salinan: keduanya dibaca
 * ratusan kali per bingkai sementara simulasi hanya menulisnya di antara tick,
 * dan menyalin dua larik sepanjang jumlah provinsi tiap penyegaran akan
 * membayar mahal untuk jaminan yang sudah diberikan tipenya. Daftar pasukan
 * memang disalin, karena pemanggilnya membangunnya ulang tiap penyegaran.
 */
export function snapshotOf(world: WorldState, armies: Iterable<ArmyView>): WorldSnapshot {
  const date = world.clock.date

  return {
    tick: world.clock.tick,
    day: date.day,
    hour: date.hour,
    controller: world.provinces.controller,
    morale: world.provinces.morale,
    armies: [...armies],
  }
}
