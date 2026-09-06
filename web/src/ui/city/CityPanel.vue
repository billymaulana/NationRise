<script setup lang="ts">
import { computed } from 'vue'
import type { CityReadout } from '~/bridge/protocol'
import BuildingIcon from '~/ui/city/BuildingIcon.vue'
import CityStat from '~/ui/city/CityStat.vue'
import ProductionStrip from '~/ui/city/ProductionStrip.vue'
import { DEFENCE_BONUS, HEALING_PER_DAY, formatPopulation, glyphOf } from '~/ui/city/buildings'
import ChromePanel from '~/ui/foundation/ChromePanel.vue'
import CornerBrackets from '~/ui/foundation/CornerBrackets.vue'
import ProgressBar from '~/ui/foundation/ProgressBar.vue'

/*
 * Panel kota adalah bottom sheet dengan kepala terang dan badan gelap. Kepala
 * terang itu bukan hiasan: di layar rujukan seluruh baris identitas kota
 * berlatar `paper`, dan menggelapkannya membuat panel terbaca sebagai HUD peta
 * alih-alih sebagai lembar kota.
 *
 * Nama kota datang terpisah dari bacaan simulasi karena berkas dunia tidak
 * menyimpan teks selain tag negara.
 */
const props = defineProps<{ city: CityReadout; name: string }>()

defineEmits<{ construction: []; mobilization: []; close: [] }>()

const kind = computed(() => (props.city.occupied ? 'Occupied City' : 'Homeland City'))

/* Slot kosong ikut digambar sebagai tanda silang tipis. Tekanan slot itulah
   yang membuat kota jadi rangkaian keputusan, dan ia tidak terbaca kalau yang
   tampil hanya yang sudah berdiri. */
const emptySlots = computed(() => Math.max(0, props.city.slots - props.city.usedSlots))

const information = computed<ReadonlyArray<readonly [string, string, string]>>(() => [
  ['population', 'Population', formatPopulation(props.city.population)],
  ['victory', 'Victory Points', String(props.city.victoryPoints)],
  ['healing', 'Healing Value', `${HEALING_PER_DAY} HP/day`],
  ['defence', 'Defense Bonus', `${DEFENCE_BONUS.toFixed(2)}%`],
])
</script>

<template>
  <ChromePanel class="w-[932px]">
    <header class="h-10 flex items-center bg-paper">
      <div class="h-full w-16 shrink-0 bg-gradient-to-b from-[#c8102e] from-50% to-white to-50%" />

      <h2 class="px-4 text-[17px] font-700 tracking-[0.02em] text-slate-900 uppercase">
        {{ name }}
        <span class="font-400 text-slate-900/65">({{ city.nationTag }})</span>
      </h2>

      <div class="ml-auto flex h-full items-center gap-3 pl-4">
        <span class="text-[15px] text-slate-900">{{ kind }}</span>
        <BuildingIcon :type="1" :level="1" :size="32" />
        <button
          type="button"
          class="h-full w-7 bg-danger text-[13px] font-700 text-white hover:brightness-115"
          aria-label="Close"
          @click="$emit('close')"
        >
          &#10005;
        </button>
      </div>
    </header>

    <div class="h-40 flex items-stretch">
      <section class="w-[240px] flex shrink-0 flex-col justify-end bg-slate-800">
        <h3
          class="h-6 flex items-center bg-paper px-1 text-[11px] font-700 tracking-[0.04em] text-slate-900"
        >
          PRODUCTION PER DAY
        </h3>
        <div class="h-14 flex items-center px-1">
          <ProductionStrip :entries="city.production" />
        </div>

        <h3
          class="h-6 flex items-center bg-paper px-1 text-[11px] font-700 tracking-[0.04em] text-slate-900"
        >
          MORALE
        </h3>
        <div class="h-14 flex items-center px-1">
          <ProgressBar :value="Math.round(city.morale * 100)" />
          <span
            class="ml-1 h-7 w-7 grid shrink-0 place-items-center border border-white/45 bg-victory text-[15px] leading-none text-white"
            aria-hidden="true"
          >&#9786;</span>
        </div>
      </section>

      <section class="w-[148px] shrink-0 bg-paper px-2 py-2">
        <h3 class="mb-1 text-center text-[13px] font-700 tracking-[0.04em] text-slate-900">
          INFORMATION
        </h3>
        <CityStat
          v-for="([stat, label, value]) in information"
          :key="stat"
          :stat="stat"
          :label="label"
          :value="value"
        />
      </section>

      <section class="flex-1 bg-slate-400 px-3 py-2">
        <CornerBrackets class="h-full px-3 py-1" :arm="14">
          <h3 class="mb-1 text-center text-[12px] font-700 tracking-[0.06em] text-white">
            BUILDINGS
          </h3>
          <div class="flex items-center gap-3">
            <BuildingIcon
              v-for="building in city.buildings"
              :key="building.type"
              :type="building.type"
              :level="building.level"
              :size="52"
              :title="building.name"
            />
            <span
              v-for="slot in emptySlots"
              :key="`empty-${slot}`"
              class="mx-2 h-4 w-4 shrink-0 text-[15px] leading-4 text-white/45"
              aria-hidden="true"
            >
              &#43;
            </span>
          </div>
        </CornerBrackets>
      </section>

      <section class="w-[260px] shrink-0 flex items-start justify-center gap-12 bg-slate-400 py-2">
        <div
          v-for="action in ([
            { id: 'construction', label: 'CONSTRUCTION', glyph: 1 },
            { id: 'mobilization', label: 'MOBILIZATION', glyph: 0 },
          ] as const)"
          :key="action.id"
          class="flex flex-col items-center gap-2"
        >
          <h3 class="text-[12px] font-700 tracking-[0.04em] text-white">{{ action.label }}</h3>
          <svg viewBox="0 0 24 24" class="h-8 w-8 fill-white" aria-hidden="true">
            <path :d="glyphOf(action.glyph)" />
          </svg>
          <button
            type="button"
            class="h-8 w-8 border border-white/45 bg-action text-[17px] leading-none text-white hover:brightness-115"
            :aria-label="action.label"
            @click="action.id === 'construction' ? $emit('construction') : $emit('mobilization')"
          >
            &#43;
          </button>
        </div>
      </section>
    </div>
  </ChromePanel>
</template>
