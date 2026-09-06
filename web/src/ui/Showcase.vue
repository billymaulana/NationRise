<script setup lang="ts">
import { ref } from 'vue'
import ChromePanel from '~/ui/foundation/ChromePanel.vue'
import CornerBrackets from '~/ui/foundation/CornerBrackets.vue'
import CostChip from '~/ui/foundation/CostChip.vue'
import DiamondBadge from '~/ui/foundation/DiamondBadge.vue'
import type { DiamondState } from '~/ui/foundation/shapes'
import ProgressBar from '~/ui/foundation/ProgressBar.vue'
import QueueSlot from '~/ui/foundation/QueueSlot.vue'
import SideDrawerTab from '~/ui/foundation/SideDrawerTab.vue'
import StatRow from '~/ui/foundation/StatRow.vue'
import TrapezoidTab from '~/ui/foundation/TrapezoidTab.vue'

const activeTab = ref(4)
const tabs = ['Kota', 'Infanteri', 'Lapis Baja', 'Dukungan', 'Helikopter', 'Pemburu', 'Angkut']
const states: DiamondState[] = ['available', 'locked', 'unavailable', 'done', 'empty']

const stats: ReadonlyArray<readonly [label: string, value: string]> = [
  ['Population', '10.562.000'],
  ['Victory Points', '6'],
  ['Healing Value', '1 HP/day'],
  ['Defense Bonus', '0,00%'],
]
</script>

<template>
  <div class="min-h-full bg-map-seaDeep p-6">
    <h1 class="mb-1 text-[15px] font-600 tracking-[0.14em] text-white">PONDASI VISUAL</h1>
    <p class="mb-6 text-[12px] text-white/55">
      Bentuk dan warna diturunkan dari piksel tangkapan layar Conflict of Nations.
    </p>

    <div class="grid grid-cols-2 gap-6">
      <ChromePanel class="p-4">
        <h2 class="mb-3 text-[12px] tracking-[0.12em] text-white/60">TAB TRAPESIUM</h2>
        <div class="flex bg-paper">
          <TrapezoidTab
            v-for="(tab, index) in tabs"
            :key="tab"
            :active="index === activeTab"
            @select="activeTab = index"
          >
            <span class="text-[10px]">{{ tab.slice(0, 4) }}</span>
          </TrapezoidTab>
        </div>
        <p class="mt-3 text-[11px] text-white/45">
          Melebar ke bawah: tinggi 28px, sisi miring 4px, jarak 67px, di atas bidang terang.
        </p>
      </ChromePanel>

      <ChromePanel class="p-4">
        <h2 class="mb-3 text-[12px] tracking-[0.12em] text-white/60">BELAH KETUPAT</h2>
        <div class="flex items-center gap-2">
          <DiamondBadge v-for="state in states" :key="state" :state="state" :size="52" />
        </div>
        <p class="mt-3 text-[11px] text-white/45">
          available, locked, unavailable, done, empty
        </p>
      </ChromePanel>

      <ChromePanel class="p-4">
        <h2 class="mb-3 text-[12px] tracking-[0.12em] text-white/60">ANTREAN</h2>
        <QueueSlot :slots="4" :filled="1" />
      </ChromePanel>

      <ChromePanel class="p-4">
        <h2 class="mb-3 text-[12px] tracking-[0.12em] text-white/60">MORALE</h2>
        <ProgressBar :value="70" />
      </ChromePanel>

      <ChromePanel class="p-4">
        <h2 class="mb-3 text-[12px] tracking-[0.12em] text-white/60">BIAYA</h2>
        <div class="flex gap-3">
          <CostChip icon="/icons/materials.png" :amount="1500" />
          <CostChip icon="/icons/technology.png" :amount="1800" affordable />
          <CostChip icon="/icons/money.png" :amount="3500" />
        </div>
      </ChromePanel>

      <ChromePanel class="p-4">
        <h2 class="mb-3 text-[12px] tracking-[0.12em] text-white/60">BARIS STATISTIK</h2>
        <div>
          <StatRow
            v-for="([label, value], index) in stats"
            :key="label"
            :label="label"
            :value="value"
            :even="index % 2 === 0"
          />
        </div>
      </ChromePanel>

      <ChromePanel class="p-4">
        <h2 class="mb-3 text-[12px] tracking-[0.12em] text-white/60">KURUNG SUDUT</h2>
        <CornerBrackets class="px-6 py-4">
          <p class="text-center text-[12px] tracking-[0.1em] text-white/70">RESEARCH COSTS</p>
        </CornerBrackets>
      </ChromePanel>

      <ChromePanel class="p-4">
        <h2 class="mb-3 text-[12px] tracking-[0.12em] text-white/60">TAB TEPI</h2>
        <div class="flex gap-4">
          <SideDrawerTab label="INTEL" />
          <SideDrawerTab label="CITIES" side="right" />
        </div>
      </ChromePanel>
    </div>
  </div>
</template>
