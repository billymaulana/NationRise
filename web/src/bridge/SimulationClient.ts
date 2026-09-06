import * as Comlink from 'comlink'
import type { Command, WorldReadout } from '~/bridge/protocol'
import type { SimulationApi } from '~/bridge/simulation.worker'

/*
 * Sisi utas utama dari jembatan. Ia tidak menyimpan salinan state apa pun:
 * satu-satunya kebenaran ada di Worker, dan yang menyeberang hanya bacaan.
 * Menyimpan bayangan di sini berarti dua sumber kebenaran yang bisa berpisah.
 */
export class SimulationClient {
  readonly #worker: Worker
  readonly #api: Comlink.Remote<SimulationApi>

  constructor() {
    this.#worker = new Worker(new URL('./simulation.worker.ts', import.meta.url), {
      type: 'module',
    })
    this.#api = Comlink.wrap<SimulationApi>(this.#worker)
  }

  async load(playerTag: string): Promise<WorldReadout> {
    const bytes = await fetch('/data/world.bin').then((r) => r.arrayBuffer())

    /* Buffer dipindahkan, bukan disalin: setelah ini ia tidak lagi bisa dibaca
       di utas utama, yang justru diinginkan — data dunia milik simulasi. */
    return this.#api.load(Comlink.transfer(bytes, [bytes]), playerTag)
  }

  send(command: Command): Promise<void> {
    return this.#api.send(command)
  }

  advance(hours: number): Promise<WorldReadout> {
    return this.#api.advance(hours)
  }

  dispose(): void {
    this.#worker.terminate()
  }
}
