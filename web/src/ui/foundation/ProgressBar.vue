<script setup lang="ts">
/*
 * Bar morale: badan miring dengan penutup belah ketupat di kiri dan angka di
 * kotak gelap di ujung kanan.
 */
withDefaults(defineProps<{ value: number; max?: number }>(), { max: 100 })
</script>

<template>
  <div class="flex items-center">
    <div class="h-[18px] w-[18px] rotate-45 border border-slate-400/60 bg-slate-350" />
    <div
      class="relative h-[18px] w-[150px] -ml-2 bg-white/85"
      :style="{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }"
    >
      <div
        class="h-full bg-[#8ab4d8]"
        :style="{ width: `${Math.round((value / max) * 100)}%` }"
      />
    </div>
    <span class="-ml-2 bg-slate-900 px-2 py-0.5 text-[12px] font-600 text-white">
      {{ Math.round((value / max) * 100) }}%
    </span>
  </div>
</template>
