<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { loadMap } from '~/render/loadMap'
import { MapView } from '~/render/MapView'
import { NO_PROVINCE } from '~/render/provinceIds'

const host = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const view = shallowRef<MapView | null>(null)

const status = ref('Loading world')
const hovered = ref('')
const selected = ref('')

let dragging = false
let lastX = 0
let lastY = 0

function size(): { width: number; height: number } {
  const element = host.value
  return element === null
    ? { width: 1, height: 1 }
    : { width: element.clientWidth, height: element.clientHeight }
}

onMounted(async () => {
  if (canvas.value === null) return

  try {
    const map = await loadMap('IDN')
    const created = new MapView({ canvas: canvas.value, idMap: map.idMap, lut: map.lut })
    await created.loadIdTexture('/data/province-ids.png')

    const { width, height } = size()
    created.resize(width, height)
    created.start(size)

    view.value = created
    status.value = `${map.world.provinceCount} provinces, ${map.world.nationTags.length} nations`

    const describe = (province: number): string =>
      province === NO_PROVINCE ? '' : `${map.nameOf(province)} (${map.nationOf(province)})`

    canvas.value.addEventListener('pointermove', (event) => {
      const rect = canvas.value!.getBoundingClientRect()

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
    })

    canvas.value.addEventListener('pointerdown', (event) => {
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      canvas.value!.setPointerCapture(event.pointerId)
    })

    canvas.value.addEventListener('pointerup', (event) => {
      dragging = false
      canvas.value!.releasePointerCapture(event.pointerId)

      const rect = canvas.value!.getBoundingClientRect()
      const province = created.provinceAt(
        event.clientX - rect.left,
        event.clientY - rect.top,
        rect.width,
        rect.height,
      )
      if (province !== NO_PROVINCE) selected.value = describe(province)
    })

    canvas.value.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault()
        const rect = canvas.value!.getBoundingClientRect()
        created.zoomBy(event.deltaY < 0 ? 1.15 : 1 / 1.15, rect.width / rect.height)
      },
      { passive: false },
    )

    window.addEventListener('resize', () => {
      const next = size()
      created.resize(next.width, next.height)
    })
  } catch (error) {
    status.value = `Failed: ${(error as Error).message}`
  }
})

onBeforeUnmount(() => view.value?.dispose())
</script>

<template>
  <div ref="host" class="relative h-full w-full">
    <canvas ref="canvas" class="block h-full w-full cursor-crosshair" />

    <div class="pointer-events-none absolute left-3 top-3 bg-slate-850/85 px-3 py-2 text-[12px]">
      <div class="text-white/60">{{ status }}</div>
      <div v-if="hovered" class="mt-1 text-white">{{ hovered }}</div>
      <div v-if="selected" class="text-income">Selected: {{ selected }}</div>
    </div>
  </div>
</template>
