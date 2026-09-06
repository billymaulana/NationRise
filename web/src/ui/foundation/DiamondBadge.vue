<script setup lang="ts">
import { diamondFills, type DiamondState } from '~/ui/foundation/shapes'

/*
 * Belah ketupat adalah bentuk paling berulang di antarmuka CoN: node riset,
 * slot antrean, ikon status.
 */
withDefaults(defineProps<{ size?: number; state?: DiamondState }>(), {
  size: 56,
  state: 'empty',
})
</script>

<template>
  <div
    class="relative inline-grid place-items-center"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <div
      class="absolute inset-[14%] rotate-45 border-2"
      :style="{ backgroundColor: diamondFills[state] }"
      :class="state === 'empty' ? 'border-slate-400/70' : 'border-white/45'"
    />
    <div class="relative z-1 grid place-items-center">
      <slot />
    </div>
  </div>
</template>
