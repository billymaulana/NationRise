<script setup lang="ts">
import type { BuildingOptionReadout } from '~/bridge/protocol'
import {
  MORALE_PENALTY,
  START_GREEN,
  formatAmount,
  formatDelay,
  formatDuration,
  glyphOf,
} from '~/ui/city/buildings'
import { iconOf, labelOf } from '~/ui/hud/resources'

/*
 * Biaya di modal konstruksi bukan badge seperti di layar riset: ikonnya berdiri
 * sendiri dengan angka di bawahnya, tanpa pelat berwarna. CostChip tetap milik
 * layar riset, tempat bentuk itu memang diukur.
 */
const props = defineProps<{ option: BuildingOptionReadout; even: boolean }>()

defineEmits<{ start: [type: number] }>()

const delay = (): number => Math.max(0, props.option.hours - props.option.baseHours)
</script>

<template>
  <div
    class="h-[92px] flex items-center gap-8 px-4"
    :class="even ? 'bg-slate-700' : 'bg-slate-500'"
  >
    <div class="h-[72px] w-24 grid shrink-0 place-items-center bg-slate-900">
      <svg viewBox="0 0 24 24" class="h-9 w-9 fill-white/70" aria-hidden="true">
        <path :d="glyphOf(option.type)" />
      </svg>
    </div>

    <div class="w-[300px] shrink-0">
      <div class="text-[15px] font-600 text-white">
        {{ option.name }} Lvl. {{ option.targetLevel }}
      </div>

      <div class="mt-2 flex items-end gap-4">
        <div
          v-for="cost in option.costs"
          :key="cost.resource"
          class="w-9 text-center"
          :title="labelOf(cost.resource)"
        >
          <img :src="`/icons/${iconOf(cost.resource)}.png`" alt="" class="mx-auto h-7 w-7" />
          <div
            class="mt-1 text-[12px] font-600 leading-none"
            :class="cost.affordable ? 'text-white' : 'text-cost'"
          >
            {{ formatAmount(cost.amount) }}
          </div>
        </div>
      </div>
    </div>

    <div class="ml-auto text-right leading-tight">
      <div class="text-[13px] text-white/75">{{ formatDuration(option.baseHours) }}</div>
      <div
        v-if="delay() > 0"
        class="text-[13px] font-700"
        :style="{ color: MORALE_PENALTY }"
      >
        Morale: + {{ formatDelay(delay()) }}
      </div>
    </div>

    <button
      type="button"
      class="h-4 w-4 shrink-0 rounded-full border border-white/50 text-[10px] font-700 leading-none text-white/80 hover:text-white"
      :title="option.blockedReason || option.name"
      aria-label="Details"
    >
      i
    </button>

    <button
      type="button"
      class="h-8 w-8 shrink-0 border border-white/45 bg-action text-[14px] leading-none text-white"
      aria-label="Rush"
      disabled
    >
      &#8987;
    </button>

    <button
      type="button"
      class="h-8 w-20 shrink-0 border border-white/45 text-[14px] font-600 text-white disabled:opacity-45"
      :style="{ backgroundColor: START_GREEN }"
      :disabled="option.blockedReason !== ''"
      :title="option.blockedReason"
      @click="$emit('start', option.type)"
    >
      Start
    </button>
  </div>
</template>
