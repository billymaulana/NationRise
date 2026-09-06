<script setup lang="ts">
/*
 * Badge biaya berbentuk jajar genjang dengan sisi kiri miring, dan gambar
 * sumber daya menumpuk di atasnya. Merah berarti tidak terjangkau, biru-abu
 * berarti terjangkau; keduanya diukur dari panel riset.
 */
defineProps<{ icon: string; amount: number; affordable?: boolean }>()

const grouped = new Intl.NumberFormat('en-US')
</script>

<template>
  <div class="flex items-center">
    <img :src="icon" alt="" class="relative z-1 h-8 w-8 -mr-2" />
    <span
      class="pl-4 pr-2 py-0.5 text-[13px] font-600 text-white"
      :class="affordable ? 'bg-[#758a9b]' : 'bg-cost'"
      :style="{ clipPath: 'polygon(6px 0, 100% 0, 100% 100%, 0 100%)' }"
    >
      {{ grouped.format(amount) }}
    </span>
  </div>
</template>
