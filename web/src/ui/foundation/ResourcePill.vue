<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  stock: number
  rate: number
}>()

const grouped = new Intl.NumberFormat('en-US')
</script>

<template>
  <div class="resource-cell border-r border-slate-850/60 last:border-r-0" :title="label">
    <img :src="icon" :alt="label" class="h-6 w-6" />
    <div class="leading-tight">
      <div class="text-[13px] text-white">{{ grouped.format(stock) }}</div>
      <div class="text-[12px] font-600 text-income">
        {{ rate >= 0 ? '+' : '' }}{{ grouped.format(rate) }} /h
      </div>
    </div>
  </div>
</template>
