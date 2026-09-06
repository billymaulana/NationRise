<script setup lang="ts">
import DiamondBadge from '~/ui/foundation/DiamondBadge.vue'
import { glyphOf } from '~/ui/city/buildings'

withDefaults(defineProps<{ type: number; level?: number; size?: number }>(), {
  level: 0,
  size: 44,
})
</script>

<template>
  <div class="relative" :style="{ width: `${size}px`, height: `${size}px` }">
    <DiamondBadge :size="size" :state="level > 0 ? 'done' : 'empty'">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        :style="{ width: `${Math.round(size * 0.5)}px`, height: `${Math.round(size * 0.5)}px` }"
        :class="level > 0 ? 'fill-white' : 'fill-white/25'"
      >
        <path :d="glyphOf(type)" />
      </svg>
    </DiamondBadge>

    <span
      v-if="level > 0"
      class="absolute bottom-0 right-0 min-w-4 bg-slate-900 px-1 text-center text-[11px] leading-4 font-600 text-white"
    >
      {{ level }}
    </span>
  </div>
</template>
