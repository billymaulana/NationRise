<script setup lang="ts">
import { ref } from 'vue'
import ChromePanel from '~/ui/foundation/ChromePanel.vue'
import ResourceBar from '~/ui/hud/ResourceBar.vue'
import type { ResourceReading } from '~/ui/hud/resources'
import Showcase from '~/ui/Showcase.vue'

/*
 * Angka contoh diambil dari tangkapan layar Indonesia Day 1 supaya perbandingan
 * berdampingan dengan aslinya memakai isi yang sama, bukan sekadar bentuk yang
 * sama. Sumbernya docs/planning/01-research-con-screenshots.md §4.2.
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

const view = ref<'hud' | 'showcase'>(
  new URLSearchParams(location.search).get('view') === 'hud' ? 'hud' : 'showcase',
)
</script>

<template>
  <main class="h-full w-full overflow-auto bg-map-seaDeep">
    <nav class="flex gap-2 px-6 pt-4 text-[11px]">
      <button
        v-for="option in (['showcase', 'hud'] as const)"
        :key="option"
        type="button"
        class="px-3 py-1 tracking-[0.1em] uppercase"
        :class="view === option ? 'bg-slate-800 text-white' : 'bg-slate-850 text-white/50'"
        @click="view = option"
      >
        {{ option }}
      </button>
    </nav>

    <Showcase v-if="view === 'showcase'" />

    <div v-else class="p-4">
      <ResourceBar :readings="readings" />

      <ChromePanel class="mt-6 w-[344px] p-3">
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
    </div>
  </main>
</template>
