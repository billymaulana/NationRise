<script setup lang="ts">
/*
 * Sisi melebar ke bawah, bukan ke atas: tab menyatu dengan daftar isinya yang
 * ada di bawahnya.
 *
 * Baris tab harus berlatar terang. Celah miring antar tab di CoN memperlihatkan
 * latar modal, bukan latar gelap; menaruhnya di atas panel gelap mengubah
 * pemisah tipis menjadi baji hitam, dan itu perbedaan yang paling terlihat.
 *
 * Garis tepi digambar dengan drop-shadow empat arah, dan filter itu harus
 * berada di elemen induk: clip-path dijalankan setelah filter, sehingga
 * meletakkan keduanya pada elemen yang sama memotong bayangannya sampai habis.
 */
withDefaults(defineProps<{ active?: boolean; slant?: number }>(), {
  active: false,
  slant: 4,
})

defineEmits<{ select: [] }>()

const edge = '#c3cdd1'
const outline = [
  `drop-shadow(1px 0 0 ${edge})`,
  `drop-shadow(-1px 0 0 ${edge})`,
  `drop-shadow(0 1px 0 ${edge})`,
  `drop-shadow(0 -1px 0 ${edge})`,
].join(' ')
</script>

<template>
  <button
    type="button"
    class="h-[28px] w-[67px] block"
    :style="{ filter: outline }"
    :aria-pressed="active"
    @click="$emit('select')"
  >
    <span
      class="h-full w-full flex items-center justify-center transition-colors"
      :class="active ? 'bg-slate-850 text-white' : 'bg-white text-slate-850 hover:bg-paper'"
      :style="{ clipPath: `polygon(${slant}px 0, calc(100% - ${slant}px) 0, 100% 100%, 0 100%)` }"
    >
      <slot />
    </span>
  </button>
</template>
