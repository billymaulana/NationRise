<script setup lang="ts">
/*
 * Sudut ter-notch, bukan membulat. Diukur dari panel HUD Conflict of Nations:
 * tidak ada border-radius di mana pun antarmukanya.
 */
withDefaults(defineProps<{ notch?: number; tone?: 'panel' | 'raised' }>(), {
  notch: 8,
  tone: 'panel',
})
</script>

<template>
  <div
    class="relative border border-slate-400/40"
    :class="tone === 'panel' ? 'bg-slate-850' : 'bg-slate-800'"
    :style="{
      clipPath: `polygon(${notch}px 0, 100% 0, 100% calc(100% - ${notch}px), calc(100% - ${notch}px) 100%, 0 100%, 0 ${notch}px)`,
    }"
  >
    <slot />
  </div>
</template>
