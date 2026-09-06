<script setup lang="ts">
/*
 * Zebra beda 3 sampai 6 persen lightness saja. Menaikkan kontrasnya langsung
 * terbaca salah dibanding aslinya.
 */
defineProps<{ label: string; value: string; even?: boolean }>()
</script>

<template>
  <div
    class="flex items-center justify-between px-3 py-1.5 text-[12px]"
    :class="even ? 'bg-slate-700' : 'bg-slate-500'"
  >
    <span class="text-white/70">{{ label }}</span>
    <span class="font-600 text-white">{{ value }}</span>
  </div>
</template>
