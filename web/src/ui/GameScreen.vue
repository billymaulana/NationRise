<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { SimulationClient } from '~/bridge/SimulationClient'
import type { WorldReadout } from '~/bridge/protocol'
import ChromePanel from '~/ui/foundation/ChromePanel.vue'
import SideDrawerTab from '~/ui/foundation/SideDrawerTab.vue'
import MapCanvas from '~/ui/map/MapCanvas.vue'
import ResourceBar from '~/ui/hud/ResourceBar.vue'
import { readingsFrom, type ResourceReading } from '~/ui/hud/resources'

/*
 * Tata letak Conflict of Nations: peta memenuhi layar, dan setiap panel
 * mengapung di atasnya. Tidak ada bilah samping yang memakan lebar — pada peta
 * dunia setiap piksel yang diambil chrome adalah wilayah yang tidak terlihat.
 *
 * Panel pemain duduk di bawah resource bar, bukan sejajar dengannya. Keduanya
 * di tepi atas berarti bertabrakan pada layar sempit, dan resource bar yang
 * menang membuat bendera serta nama negara tertutup separuh.
 */
const readings = ref<ResourceReading[]>([])
const world = ref<WorldReadout | null>(null)
const status = ref('Starting simulation')

let client: SimulationClient | null = null

function apply(readout: WorldReadout): void {
  world.value = readout
  readings.value = readingsFrom(readout.player.resources)
}

onMounted(async () => {
  try {
    client = new SimulationClient()
    apply(await client.load('IDN'))
    status.value = ''

    /* Satu hari dijalankan sekali saat memuat supaya angka yang tampil adalah
       pemasukan yang benar-benar dibayar, bukan cadangan kosong hari nol. */
    apply(await client.advance(24))
  } catch (error) {
    status.value = `Simulation failed: ${(error as Error).message}`
  }
})

onBeforeUnmount(() => client?.dispose())

const clock = (): string => {
  const w = world.value
  return w === null ? '--:--' : `${String(w.hour).padStart(2, '0')}:00`
}
</script>

<template>
  <div class="relative h-full w-full overflow-hidden">
    <MapCanvas class="absolute inset-0" />

    <div class="pointer-events-none absolute inset-0">
      <div class="pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2">
        <ResourceBar :readings="readings" />
      </div>

      <ChromePanel class="pointer-events-auto absolute left-3 top-[68px] w-[344px] p-3">
        <div class="flex items-center gap-3">
          <div class="h-8 w-12 bg-gradient-to-b from-[#c8102e] to-white" />
          <div>
            <div class="text-[15px] font-600 tracking-wide">BILLBRAVO</div>
            <div class="text-[13px] text-white/80">{{ world?.player.tag ?? 'INDONESIA' }}</div>
          </div>
        </div>

        <div class="mt-3 flex gap-4 border-t border-slate-400/30 pt-2 text-[12px]">
          <div><span class="text-white/60">DAY</span> <span class="ml-2">{{ world?.day ?? 1 }}</span></div>
          <div><span class="text-white/60">TIME</span> <span class="ml-2">{{ clock() }}</span></div>
          <div class="ml-auto text-victory">{{ world?.player.victoryPoints ?? 0 }} / 1850 VP</div>
        </div>

        <div v-if="status" class="mt-2 text-[11px] text-danger">{{ status }}</div>
      </ChromePanel>

      <div class="pointer-events-auto absolute left-0 top-1/2 -translate-y-1/2">
        <SideDrawerTab label="INTEL" />
      </div>

      <div class="pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2">
        <SideDrawerTab label="CITIES" side="right" />
      </div>
    </div>
  </div>
</template>
