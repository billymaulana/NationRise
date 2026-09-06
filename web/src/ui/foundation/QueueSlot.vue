<script setup lang="ts">
import DiamondBadge from '~/ui/foundation/DiamondBadge.vue'

/*
 * Antrean CoN: slot pertama lebih besar dari sisanya, dan konektornya panah
 * yang menunjuk mundur ke slot aktif, bukan maju. Arah itu yang memberi tahu
 * pemain ke mana antrean mengalir.
 */
defineProps<{ slots: number; filled?: number; leadSize?: number; slotSize?: number }>()
</script>

<template>
  <div class="flex items-center">
    <template v-for="index in slots" :key="index">
      <span
        v-if="index > 1"
        class="h-[14px] w-[26px] bg-[#7ba3c4]"
        :style="{ clipPath: 'polygon(100% 0, 40% 50%, 100% 100%, 60% 100%, 0 50%, 60% 0)' }"
        aria-hidden="true"
      />
      <DiamondBadge
        :size="index === 1 ? (leadSize ?? 64) : (slotSize ?? 44)"
        :state="index <= (filled ?? 0) ? 'done' : 'empty'"
      />
    </template>
  </div>
</template>
