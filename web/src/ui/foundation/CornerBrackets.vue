<script setup lang="ts">
/*
 * Kurung sudut yang membingkai bagian tanpa kotak penuh. Motif ini muncul di
 * hampir setiap panel CoN dan mudah terlewat: yang digambar hanya empat
 * sudutnya, sisi-sisinya dibiarkan terbuka.
 */
withDefaults(defineProps<{ arm?: number }>(), { arm: 12 })
</script>

<template>
  <div class="relative">
    <span
      v-for="corner in ['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0']"
      :key="corner"
      class="pointer-events-none absolute border-white/35"
      :class="[
        corner,
        corner.includes('top') ? 'border-t' : 'border-b',
        corner.includes('left') ? 'border-l' : 'border-r',
      ]"
      :style="{ width: `${arm}px`, height: `${arm}px` }"
    />
    <slot />
  </div>
</template>
