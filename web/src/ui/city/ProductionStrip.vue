<script setup lang="ts">
import type { ResourceAmount } from '~/bridge/protocol'
import { formatAmount } from '~/ui/city/buildings'
import { iconOf, labelOf } from '~/ui/hud/resources'

/*
 * Tiga angka produksi muncul identik di panel kota dan di kepala modal
 * konstruksi: ikon belah ketupat menindih pelat gelap berisi angka putih.
 * Hijau `income` tidak dipakai di sini — di layar rujukan angka hijau hanya
 * milik laju per jam di resource bar.
 */
defineProps<{ entries: readonly ResourceAmount[] }>()
</script>

<template>
  <div class="flex items-center">
    <div
      v-for="entry in entries"
      :key="entry.resource"
      class="flex items-center"
      :title="labelOf(entry.resource)"
    >
      <div
        class="relative z-1 h-6 w-6 grid place-items-center border border-white/45 bg-slate-350 rotate-45 -mr-2"
      >
        <img
          :src="`/icons/${iconOf(entry.resource)}.png`"
          alt=""
          class="h-4 w-4 -rotate-45"
        />
      </div>
      <span class="h-5 flex items-center bg-slate-900 pl-3 pr-1 text-[12px] font-700 text-white">
        +{{ formatAmount(entry.amount) }}
      </span>
    </div>
  </div>
</template>
