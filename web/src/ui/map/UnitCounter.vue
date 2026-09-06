<script setup lang="ts">
/*
 * Konter tumpukan, bukan gambar unit. Peta rujukan menaruh satu simbol per
 * tumpukan dengan jumlah dan bar kekuatan, dan itu yang dibaca pemain dari
 * jarak zoom mana pun; gambar unitnya baru muncul di panel.
 *
 * Warna memisahkan milik sendiri dari milik orang lain sebelum angka apa pun
 * dibaca — pada peta yang penuh, itu satu-satunya hal yang sempat terbaca.
 */
defineProps<{ count: number; health: number; mine: boolean }>()
</script>

<template>
  <div
    class="flex h-[22px] w-[34px] flex-col justify-between border px-[3px] py-[2px]"
    :class="mine ? 'border-white/70 bg-[#c85a24]' : 'border-white/40 bg-[#2f4a68]'"
  >
    <span class="text-[10px] font-600 leading-none text-white">{{ count }}</span>

    <span class="h-[3px] w-full bg-black/45">
      <span
        class="block h-full"
        :class="health > 0.5 ? 'bg-income' : 'bg-cost'"
        :style="{ width: `${Math.max(4, Math.round(health * 100))}%` }"
      />
    </span>
  </div>
</template>
