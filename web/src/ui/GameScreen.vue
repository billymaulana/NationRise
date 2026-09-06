<script setup lang="ts">
import ChromePanel from '~/ui/foundation/ChromePanel.vue'
import SideDrawerTab from '~/ui/foundation/SideDrawerTab.vue'
import MapCanvas from '~/ui/map/MapCanvas.vue'
import ResourceBar from '~/ui/hud/ResourceBar.vue'
import type { ResourceReading } from '~/ui/hud/resources'

/*
 * Tata letak Conflict of Nations: peta memenuhi layar, dan setiap panel
 * mengapung di atasnya. Tidak ada bilah samping yang memakan lebar — pada peta
 * dunia setiap piksel yang diambil chrome adalah wilayah yang tidak terlihat.
 *
 * Panel pemain duduk di bawah resource bar, bukan sejajar dengannya. Keduanya
 * di tepi atas berarti bertabrakan pada layar sempit, dan resource bar yang
 * menang membuat bendera serta nama negara tertutup separuh.
 */
const readings: ResourceReading[] = [
  { id: 'materials', label: 'Materials', stock: 15_757, rate: 88 },
  { id: 'technology', label: 'Technology', stock: 11_818, rate: 59 },
  { id: 'fuel', label: 'Fuel', stock: 5_909, rate: 32 },
  { id: 'food', label: 'Food', stock: 4_334, rate: 37 },
  { id: 'rare-resources', label: 'Rare Resources', stock: 4_334, rate: 30 },
  { id: 'manpower', label: 'Manpower', stock: 5_910, rate: 46 },
  { id: 'money', label: 'Money', stock: 59_098, rate: 359 },
]
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
            <div class="text-[13px] text-white/80">INDONESIA</div>
          </div>
        </div>

        <div class="mt-3 flex gap-4 border-t border-slate-400/30 pt-2 text-[12px]">
          <div><span class="text-white/60">DAY</span> <span class="ml-2">1</span></div>
          <div><span class="text-white/60">TIME</span> <span class="ml-2">17:11</span></div>
          <div class="ml-auto text-victory">77 / 1850 VP</div>
        </div>
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
