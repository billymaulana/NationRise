<script setup lang="ts">
import { computed } from 'vue'
import type { CityReadout } from '~/bridge/protocol'
import BuildingIcon from '~/ui/city/BuildingIcon.vue'
import {
  DEFENCE_BONUS,
  HEALING_PER_DAY,
  formatAmount,
  formatPopulation,
} from '~/ui/city/buildings'
import ChromePanel from '~/ui/foundation/ChromePanel.vue'
import ProgressBar from '~/ui/foundation/ProgressBar.vue'
import StatRow from '~/ui/foundation/StatRow.vue'
import { iconOf, labelOf } from '~/ui/hud/resources'

/*
 * Panel kota adalah bottom sheet: ia menempel tepi bawah dan membiarkan peta
 * memenuhi sisa layar. Nama kota datang terpisah dari bacaan simulasi karena
 * berkas dunia tidak menyimpan teks selain tag negara.
 */
const props = defineProps<{ city: CityReadout; name: string }>()

defineEmits<{ construction: []; mobilization: []; close: [] }>()

const kind = computed(() => (props.city.occupied ? 'Occupied City' : 'Homeland City'))

/* Slot kosong ikut digambar: tekanan slot itulah yang membuat kota jadi
   rangkaian keputusan, dan ia tidak terbaca kalau yang tampil hanya yang sudah
   berdiri. */
const emptySlots = computed(() => Math.max(0, props.city.slots - props.city.usedSlots))

const information = computed<ReadonlyArray<readonly [string, string]>>(() => [
  ['Population', formatPopulation(props.city.population)],
  ['Victory Points', formatAmount(props.city.victoryPoints)],
  ['Healing Value', `${HEALING_PER_DAY} HP/day`],
  ['Defense Bonus', `${DEFENCE_BONUS.toFixed(2)}%`],
])
</script>

<template>
  <ChromePanel class="w-[720px]">
    <header class="flex items-stretch bg-slate-900">
      <div class="min-w-[228px] flex flex-1 items-center gap-3 px-4 py-3">
        <BuildingIcon :type="0" :level="1" :size="40" />
        <div class="leading-tight">
          <div class="text-[15px] font-600 text-white">
            {{ name }} <span class="text-white/60">({{ city.nationName }})</span>
          </div>
          <div class="text-[12px] text-white/55">{{ kind }}</div>
        </div>
      </div>

      <div class="border-l border-slate-400/25 px-4 py-3">
        <h3 class="mb-2 text-[11px] tracking-[0.14em] text-white/55">PRODUCTION PER DAY</h3>
        <div class="flex items-center gap-4">
          <div
            v-for="entry in city.production"
            :key="entry.resource"
            class="flex items-center gap-2"
            :title="labelOf(entry.resource)"
          >
            <img :src="`/icons/${iconOf(entry.resource)}.png`" alt="" class="h-6 w-6" />
            <span class="text-[13px] font-600 text-income">+{{ formatAmount(entry.amount) }}</span>
          </div>
        </div>
      </div>

      <div class="border-l border-slate-400/25 px-4 py-3">
        <h3 class="mb-2 text-[11px] tracking-[0.14em] text-white/55">MORALE</h3>
        <ProgressBar :value="Math.round(city.morale * 100)" />
      </div>

      <button
        type="button"
        class="w-8 bg-danger text-[13px] font-600 text-white hover:bg-danger/80"
        aria-label="Close"
        @click="$emit('close')"
      >
        &#10005;
      </button>
    </header>

    <div class="flex items-stretch">
      <section class="w-[288px] px-4 py-3">
        <h3 class="mb-2 text-[11px] tracking-[0.14em] text-white/55">INFORMATION</h3>
        <StatRow
          v-for="([label, value], index) in information"
          :key="label"
          :label="label"
          :value="value"
          :even="index % 2 === 0"
        />
      </section>

      <section class="flex-1 border-l border-slate-400/25 px-4 py-3">
        <h3 class="mb-2 text-[11px] tracking-[0.14em] text-white/55">BUILDINGS</h3>
        <div class="flex flex-wrap items-center gap-2">
          <BuildingIcon
            v-for="building in city.buildings"
            :key="building.type"
            :type="building.type"
            :level="building.level"
            :title="building.name"
          />
          <div
            v-for="slot in emptySlots"
            :key="`empty-${slot}`"
            class="h-[44px] w-[44px] rotate-45 scale-70 border border-slate-400/45"
          />
        </div>
      </section>

      <section class="w-[188px] flex flex-col justify-center gap-2 border-l border-slate-400/25 px-4 py-3">
        <button
          type="button"
          class="h-8 flex items-center justify-between bg-action px-3 text-[12px] tracking-[0.1em] font-600 text-white hover:brightness-115"
          @click="$emit('construction')"
        >
          <span>CONSTRUCTION</span>
          <span class="text-[15px] leading-none">+</span>
        </button>
        <button
          type="button"
          class="h-8 flex items-center justify-between bg-action px-3 text-[12px] tracking-[0.1em] font-600 text-white hover:brightness-115"
          @click="$emit('mobilization')"
        >
          <span>MOBILIZATION</span>
          <span class="text-[15px] leading-none">+</span>
        </button>
      </section>
    </div>
  </ChromePanel>
</template>
