<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { loadMap, type MapLabel } from '~/render/loadMap'
import { MapView } from '~/render/MapView'
import { NO_PROVINCE } from '~/render/provinceIds'

const host = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const view = shallowRef<MapView | null>(null)

const status = ref('Loading world')
const hovered = ref('')
const selected = ref('')

interface PlacedLabel {
  readonly key: number
  readonly name: string
  readonly x: number
  readonly y: number
}

/*
 * Label ditempatkan lewat DOM, bukan sebagai sprite di dalam scene. Teksnya
 * tetap tajam pada zoom berapa pun, ukurannya tidak ikut mengecil oleh kamera,
 * dan hanya yang benar-benar di layar yang dibuat — lima ratus tiga puluh kota
 * sekaligus akan membanjiri layar jauh sebelum membebani peramban.
 */
const LABEL_ZOOM = 3

const labels = ref<PlacedLabel[]>([])
const zoomLabel = ref('1.0')
let cities: readonly MapLabel[] = []

let dragging = false
let lastX = 0
let lastY = 0

let detach: (() => void) | null = null

function size(): { width: number; height: number } {
  const element = host.value
  return element === null
    ? { width: 1, height: 1 }
    : { width: element.clientWidth, height: element.clientHeight }
}

onMounted(async () => {
  const element = canvas.value
  if (element === null) return

  /*
   * Elemen ditangkap sekali di sini, dan handler memakai variabel itu, bukan
   * ref-nya. Ref menjadi null saat komponen di-unmount, sementara pendengar
   * yang sudah terpasang tetap hidup pada elemen yang dipakai ulang; hasilnya
   * setiap handler melempar dan seluruh interaksi peta mati tanpa jejak di
   * layar. Semua pendengar dilepas bersama lewat satu sinyal batal.
   */
  const listeners = new AbortController()
  const signal = listeners.signal
  detach = () => listeners.abort()

  try {
    const map = await loadMap('IDN')
    const created = new MapView({ canvas: element, idMap: map.idMap, lut: map.lut })
    created.setDepthField(map.depth)
    await created.loadIdTexture('/data/province-ids.png')

    const { width, height } = size()
    created.resize(width, height)
    created.start(size)

    view.value = created
    cities = map.cities
    status.value =
      `${map.world.provinceCount} provinces, ${map.world.nationTags.length} nations, ` +
      `${map.cities.length} cities`

    /*
     * Label ditempatkan di dalam loop render peta, bukan di rantai frame
     * sendiri. Satu loop berarti tidak ada rantai kedua yang bisa berhenti
     * tanpa jejak sementara peta terus berjalan.
     *
     * Nama baru muncul setelah dizoom cukup dekat: pada zoom paling luar kelima
     * ratusnya saling menimpa dan tidak satu pun terbaca.
     */
    created.onFrame = (width, height) => {
      zoomLabel.value = created.zoom.toFixed(1)

      if (created.zoom < LABEL_ZOOM) {
        if (labels.value.length > 0) labels.value = []
        return
      }

      const placed: PlacedLabel[] = []
      const taken = new Set<string>()

      for (const city of cities) {
        const point = created.project(city.lon, city.lat, width, height)
        if (!point.visible) continue

        /* Satu label per sel kisi. Tanpa ini nama-nama saling menimpa sampai
           tidak satu pun terbaca, dan yang paling parah justru di kepulauan
           tempat kota paling rapat. */
        const cell = `${Math.round(point.x / 96)}:${Math.round(point.y / 22)}`
        if (taken.has(cell)) continue

        taken.add(cell)
        placed.push({ key: city.province, name: city.name, x: point.x, y: point.y })
      }

      labels.value = placed
    }

    const describe = (province: number): string =>
      province === NO_PROVINCE ? '' : `${map.nameOf(province)} (${map.nationOf(province)})`

    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect()

      if (dragging) {
        created.panBy(event.clientX - lastX, event.clientY - lastY, rect.height)
        lastX = event.clientX
        lastY = event.clientY
        return
      }

      const province = created.provinceAt(
        event.clientX - rect.left,
        event.clientY - rect.top,
        rect.width,
        rect.height,
      )
      created.highlight(province)
      hovered.value = describe(province)
    }, { signal })

    element.addEventListener('pointerdown', (event) => {
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      element.setPointerCapture(event.pointerId)
    }, { signal })

    element.addEventListener('pointerup', (event) => {
      dragging = false
      element.releasePointerCapture(event.pointerId)

      const rect = element.getBoundingClientRect()
      const province = created.provinceAt(
        event.clientX - rect.left,
        event.clientY - rect.top,
        rect.width,
        rect.height,
      )
      if (province !== NO_PROVINCE) selected.value = describe(province)
    }, { signal })

    element.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault()
        const rect = element.getBoundingClientRect()
        created.zoomAt(
          event.deltaY < 0 ? 1.15 : 1 / 1.15,
          event.clientX - rect.left,
          event.clientY - rect.top,
          rect.width,
          rect.height,
        )
      },
      { passive: false, signal },
    )

    window.addEventListener(
      'resize',
      () => {
        const next = size()
        created.resize(next.width, next.height)
      },
      { signal },
    )
  } catch (error) {
    status.value = `Failed: ${(error as Error).message}`
  }
})

onBeforeUnmount(() => {
  detach?.()
  view.value?.dispose()
})
</script>

<template>
  <div ref="host" class="relative h-full w-full overflow-hidden">
    <canvas ref="canvas" class="block h-full w-full cursor-crosshair" />

    <div
      v-for="label in labels"
      :key="label.key"
      class="map-label pointer-events-none absolute text-[11px] font-600 text-white"
      :style="{ left: `${label.x}px`, top: `${label.y}px` }"
    >
      {{ label.name }}
    </div>

    <div class="pointer-events-none absolute bottom-3 left-3 bg-slate-850/85 px-3 py-2 text-[12px]">
      <div class="text-white/40">{{ status }} &middot; zoom {{ zoomLabel }}</div>
      <div v-if="hovered" class="mt-1 text-white">{{ hovered }}</div>
      <div v-if="selected" class="text-income">Selected: {{ selected }}</div>
    </div>
  </div>
</template>

<style scoped>
/*
 * Garis luar gelap, bukan bayangan jatuh: nama kota harus terbaca di atas
 * daratan terang maupun laut gelap, dan bayangan berarah hanya bekerja pada
 * salah satunya.
 */
.map-label {
  transform: translate(-50%, -50%);
  text-shadow:
    0 0 3px rgba(12, 18, 24, 0.95),
    0 0 6px rgba(12, 18, 24, 0.7);
  white-space: nowrap;
}
</style>
