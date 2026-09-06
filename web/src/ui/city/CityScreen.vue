<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { SimulationClient } from '~/bridge/SimulationClient'
import type { CityReadout } from '~/bridge/protocol'
import { loadProvinceNames } from '~/render/loadMap'
import CityPanel from '~/ui/city/CityPanel.vue'
import ConstructionModal from '~/ui/city/ConstructionModal.vue'

/*
 * Halaman peraga dua layar kota. Ia memuat simulasi yang sama seperti layar
 * permainan, bukan angka contoh: satu-satunya cara mengetahui panel ini benar
 * adalah melihatnya menampilkan biaya dan durasi yang memang ditagih.
 */
const cities = ref<number[]>([])
const names = ref(new Map<number, string>())
const selected = ref(-1)
const city = ref<CityReadout | null>(null)
const modalOpen = ref(false)
const status = ref('Starting simulation')

let client: SimulationClient | null = null

const cityName = computed(() => names.value.get(selected.value) ?? '')

async function select(province: number): Promise<void> {
  if (client === null) return

  selected.value = province
  city.value = await client.city(province)
}

async function start(type: number): Promise<void> {
  if (client === null) return

  try {
    city.value = await client.startConstruction(selected.value, type)
  } catch (error) {
    status.value = (error as Error).message
  }
}

async function cancel(): Promise<void> {
  if (client === null) return
  city.value = await client.cancelConstruction(selected.value)
}

/* Waktu dimajukan dari halaman ini supaya pekerjaan yang dimulai benar-benar
   terlihat selesai, bukan hanya terlihat terantre. */
async function advance(hours: number): Promise<void> {
  if (client === null) return

  await client.advance(hours)
  if (selected.value >= 0) city.value = await client.city(selected.value)
}

onMounted(async () => {
  try {
    client = new SimulationClient()
    await client.load('IDN')
    await client.advance(24)

    const [owned, geo] = await Promise.all([client.cities(), loadProvinceNames()])
    cities.value = owned
    names.value = new Map(owned.map((province) => [province, geo.nameOf(province)]))

    status.value = ''
    if (owned.length > 0) await select(owned[0]!)
  } catch (error) {
    status.value = `Simulation failed: ${(error as Error).message}`
  }
})

onBeforeUnmount(() => client?.dispose())
</script>

<template>
  <div class="min-h-full bg-map-seaDeep p-6">
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <button
        v-for="province in cities"
        :key="province"
        type="button"
        class="h-7 px-3 text-[12px] tracking-[0.08em]"
        :class="province === selected ? 'bg-slate-800 text-white' : 'bg-slate-850 text-white/50'"
        @click="select(province)"
      >
        {{ names.get(province) }}
      </button>

      <button
        type="button"
        class="ml-auto h-7 bg-action px-3 text-[12px] tracking-[0.08em] font-600 text-white"
        @click="advance(24)"
      >
        ADVANCE 1 DAY
      </button>
    </div>

    <p v-if="status" class="mb-4 text-[12px] text-white/60">{{ status }}</p>

    <div v-if="city" class="flex flex-col items-start gap-6">
      <ConstructionModal
        v-if="modalOpen"
        :city="city"
        :name="cityName"
        @start="start"
        @cancel="cancel"
        @close="modalOpen = false"
      />

      <CityPanel
        :city="city"
        :name="cityName"
        @construction="modalOpen = true"
        @mobilization="modalOpen = true"
        @close="modalOpen = false"
      />
    </div>
  </div>
</template>
