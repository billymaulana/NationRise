<script setup lang="ts">
/*
 * Tab tepi layar: label diputar 90 derajat, chevron ganda di atas dan bawah,
 * sudut atas dipotong miring. Sisi kanan memakai geometri cermin.
 */
withDefaults(defineProps<{ label: string; side?: 'left' | 'right' }>(), {
  side: 'left',
})

defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    type="button"
    class="h-[170px] w-[26px] flex flex-col items-center justify-between bg-slate-800 py-2 text-white/80 hover:text-white"
    :style="{
      clipPath:
        side === 'left'
          ? 'polygon(0 10px, 100% 0, 100% 100%, 0 calc(100% - 10px))'
          : 'polygon(0 0, 100% 10px, 100% calc(100% - 10px), 0 100%)',
    }"
    :aria-label="label"
    @click="$emit('toggle')"
  >
    <span class="text-[13px] leading-none">&#187;</span>
    <span
      class="text-[11px] font-600 tracking-[0.12em]"
      :style="{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }"
    >
      {{ label }}
    </span>
    <span class="text-[13px] leading-none">&#187;</span>
  </button>
</template>
