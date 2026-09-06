<script setup lang="ts">
import ResourcePill from '~/ui/foundation/ResourcePill.vue'
import type { ResourceReading } from '~/ui/hud/resources'

defineProps<{ readings: ResourceReading[] }>()
</script>

<template>
  <div class="flex justify-center">
    <div class="flex h-[54px] border border-slate-400/40 bg-slate-550">
      <button
        type="button"
        class="flex w-[140px] items-center justify-center border-r border-slate-850/60 bg-slate-350"
        aria-label="Buka stockpile"
      >
        <img src="/icons/materials.png" alt="" class="h-7 w-7" />
        <span class="ml-2 text-[10px] text-white/70">&#9660;</span>
      </button>

      <ResourcePill
        v-for="(reading, index) in readings"
        :key="reading.id"
        :icon="`/icons/${reading.id}.png`"
        :label="reading.label"
        :stock="reading.stock"
        :rate="reading.rate"
        :class="index % 2 === 0 ? 'bg-slate-550' : 'bg-slate-350'"
      />
    </div>
  </div>
</template>
