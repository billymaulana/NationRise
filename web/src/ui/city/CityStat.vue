<script setup lang="ts">
import DiamondBadge from '~/ui/foundation/DiamondBadge.vue'
import { glyphOf } from '~/ui/city/statGlyphs'

/*
 * Baris INFORMATION di panel kota tidak berbentuk label-kiri nilai-kanan
 * seperti StatRow. Keduanya rata kanan dan bertumpuk: label di atas latar
 * terang, nilainya di atas bilah #758a9b, dengan belah ketupat menembus
 * keduanya di tepi kiri.
 */
defineProps<{ stat: string; label: string; value: string }>()
</script>

<template>
  <div class="relative h-8 pl-6">
    <div class="absolute left-0 top-1/2 z-1 -translate-y-1/2">
      <DiamondBadge :size="28" state="empty" class="bg-white">
        <svg viewBox="0 0 24 24" class="h-4 w-4 fill-slate-900" aria-hidden="true">
          <path :d="glyphOf(stat)" />
        </svg>
      </DiamondBadge>
    </div>

    <div class="h-4 flex items-end justify-end pr-2 text-[13px] font-700 leading-none text-slate-900">
      {{ label }}
    </div>
    <div
      class="h-4 flex items-center justify-end bg-[#758a9b] pr-2 text-[13px] font-700 leading-none text-white"
    >
      {{ value }}
    </div>
  </div>
</template>
