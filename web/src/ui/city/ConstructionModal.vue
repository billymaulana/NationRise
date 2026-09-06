<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BuildingOptionReadout, CityReadout } from '~/bridge/protocol'
import BuildingIcon from '~/ui/city/BuildingIcon.vue'
import ConstructionRow from '~/ui/city/ConstructionRow.vue'
import ProductionStrip from '~/ui/city/ProductionStrip.vue'
import { BUILDING_CATEGORIES, formatDuration } from '~/ui/city/buildings'
import CornerBrackets from '~/ui/foundation/CornerBrackets.vue'
import DiamondBadge from '~/ui/foundation/DiamondBadge.vue'
import ProgressBar from '~/ui/foundation/ProgressBar.vue'
import QueueSlot from '~/ui/foundation/QueueSlot.vue'
import TrapezoidTab from '~/ui/foundation/TrapezoidTab.vue'

/*
 * Kepala dan pita status modal ini berlatar terang, badan daftarnya gelap.
 * Bukan pilihan gaya: celah miring antar tab trapesium memperlihatkan latar di
 * belakangnya, dan di atas panel gelap pemisah tipis itu berubah jadi baji
 * hitam meski geometri tabnya sudah tepat.
 */
const props = defineProps<{ city: CityReadout; name: string }>()

defineEmits<{ start: [type: number]; cancel: []; close: [] }>()

const category = ref(0)

const visible = computed<readonly BuildingOptionReadout[]>(() => {
  const wanted = BUILDING_CATEGORIES[category.value]?.types ?? []
  return props.city.options.filter((option) => wanted.includes(option.type))
})
</script>

<template>
  <div class="w-[900px] border border-slate-400/50 bg-paper">
    <header class="h-[52px] flex items-center">
      <div class="h-full w-16 shrink-0 bg-gradient-to-b from-[#c8102e] from-50% to-white to-50%" />

      <h2 class="px-4 text-[19px] font-700 text-slate-900 uppercase">
        {{ name }} <span class="font-600">({{ city.victoryPoints }})</span>
      </h2>

      <div class="ml-auto flex h-full items-center gap-6 pl-4">
        <ProductionStrip :entries="city.production" />
        <div class="flex items-center">
          <ProgressBar :value="Math.round(city.morale * 100)" />
          <span
            class="ml-2 h-8 w-8 grid shrink-0 place-items-center border border-white/45 bg-victory text-[17px] leading-none text-white"
            aria-hidden="true"
          >&#9786;</span>
        </div>
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

    <div class="h-[108px] flex items-stretch px-4">
      <CornerBrackets class="w-[276px] shrink-0 px-2 py-1" :arm="12">
        <h3 class="text-center text-[13px] font-700 tracking-[0.04em] text-slate-900">
          CURRENTLY CONSTRUCTING
        </h3>
        <div class="mt-1 flex items-center gap-2">
          <BuildingIcon
            v-if="city.constructing"
            :type="city.options.find((o) => o.name === city.constructing?.name)?.type ?? 0"
            :level="city.constructing.targetLevel"
            :size="60"
          />
          <DiamondBadge v-else :size="60" state="empty" />

          <div v-if="city.constructing" class="leading-tight">
            <div class="text-[13px] font-600 text-slate-900">
              {{ city.constructing.name }} Lvl. {{ city.constructing.targetLevel }}
            </div>
            <div class="text-[12px] text-slate-900/70">
              {{ formatDuration(city.constructing.hoursRemaining) }} left
            </div>
            <button
              type="button"
              class="mt-1 h-6 bg-cost px-2 text-[11px] tracking-[0.08em] font-600 text-white"
              @click="$emit('cancel')"
            >
              CANCEL
            </button>
          </div>
          <span v-else class="text-[14px] text-slate-900">Nothing being built</span>
        </div>
      </CornerBrackets>

      <CornerBrackets class="w-[276px] shrink-0 px-2 py-1" :arm="12">
        <h3 class="text-center text-[13px] font-700 tracking-[0.04em] text-slate-900">
          CURRENTLY MOBILIZING
        </h3>
        <div class="mt-1 flex items-center gap-2">
          <DiamondBadge :size="60" :state="city.mobilising ? 'done' : 'empty'" />
          <span v-if="city.mobilising" class="text-[14px] font-600 text-slate-900">
            {{ city.mobilising.name }}
          </span>
          <span v-else class="text-[14px] text-slate-900">Nothing being mobilized</span>
        </div>
      </CornerBrackets>

      <CornerBrackets class="flex-1 px-2 py-1" :arm="12">
        <h3 class="text-center text-[13px] font-700 tracking-[0.04em] text-slate-900">
          NEXT IN QUEUE
        </h3>
        <div class="mt-1 flex justify-center">
          <QueueSlot :slots="4" :filled="0" :lead-size="60" :slot-size="40" />
        </div>
      </CornerBrackets>
    </div>

    <div class="flex px-8">
      <TrapezoidTab
        v-for="(entry, index) in BUILDING_CATEGORIES"
        :key="entry.id"
        :active="index === category"
        @select="category = index"
      >
        <span class="text-[10px] tracking-[0.08em]">{{ entry.label.toUpperCase() }}</span>
      </TrapezoidTab>
    </div>

    <div class="max-h-[536px] overflow-y-auto">
      <ConstructionRow
        v-for="(option, index) in visible"
        :key="option.type"
        :option="option"
        :even="index % 2 === 0"
        @start="$emit('start', $event)"
      />
    </div>
  </div>
</template>
