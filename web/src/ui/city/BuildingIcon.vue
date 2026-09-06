<script setup lang="ts">
import DiamondBadge from '~/ui/foundation/DiamondBadge.vue'
import { LEVEL_BADGE, glyphOf } from '~/ui/city/buildings'

withDefaults(defineProps<{ type: number; level?: number; size?: number }>(), {
  level: 0,
  size: 44,
})
</script>

<template>
  <div class="relative shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
    <DiamondBadge :size="size" :state="level > 0 ? 'done' : 'empty'">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        :style="{ width: `${Math.round(size * 0.46)}px`, height: `${Math.round(size * 0.46)}px` }"
        :class="level > 0 ? 'fill-white' : 'fill-white/25'"
      >
        <path :d="glyphOf(type)" />
      </svg>
    </DiamondBadge>

    <span
      v-if="level > 0"
      class="absolute bottom-0 right-0 h-4 w-4 grid place-items-center rounded-full border border-white/70 text-[11px] font-700 leading-none text-white"
      :style="{ backgroundColor: LEVEL_BADGE }"
    >
      {{ level }}
    </span>
  </div>
</template>
