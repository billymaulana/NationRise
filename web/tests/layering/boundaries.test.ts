import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { glob } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('../..', import.meta.url))

async function filesUnder(dir: string): Promise<string[]> {
  const found: string[] = []
  for await (const entry of glob(`${dir}/**/*.ts`, { cwd: root })) {
    found.push(entry)
  }
  return found
}

function importsOf(relative: string): string[] {
  const source = readFileSync(new URL(relative, new URL('../../', import.meta.url)), 'utf8')
  return [...source.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)].map((m) => m[1]!)
}

/*
 * Padanan LayeringTests di jalur C#. Batas arsitektur yang hanya diimbau akan
 * dilanggar; yang gagal sebagai uji merah tidak.
 */
describe('batas lapisan', () => {
  const enginePackages = ['vue', 'three', 'pinia', 'comlink', 'vue-i18n', '@vueuse']

  it('src/sim tidak mengimpor engine, framework, atau DOM', async () => {
    const offenders: string[] = []

    for (const file of await filesUnder('src/sim')) {
      for (const specifier of importsOf(file)) {
        const bare = specifier.startsWith('.') || specifier.startsWith('~')
        if (bare) continue
        if (enginePackages.some((p) => specifier === p || specifier.startsWith(`${p}/`))) {
          offenders.push(`${file} -> ${specifier}`)
        }
      }
    }

    expect(offenders).toEqual([])
  })

  it('src/sim tidak mengimpor lapisan di atasnya', async () => {
    const offenders: string[] = []
    const above = ['~/ui', '~/render', '~/bridge']

    for (const file of await filesUnder('src/sim')) {
      for (const specifier of importsOf(file)) {
        if (above.some((p) => specifier.startsWith(p))) {
          offenders.push(`${file} -> ${specifier}`)
        }
      }
    }

    expect(offenders).toEqual([])
  })

  it('src/ui tidak menyentuh simulasi langsung', async () => {
    const offenders: string[] = []

    for (const file of await filesUnder('src/ui')) {
      for (const specifier of importsOf(file)) {
        if (specifier.startsWith('~/sim')) {
          offenders.push(`${file} -> ${specifier}`)
        }
      }
    }

    expect(offenders).toEqual([])
  })

  /*
   * Tipe simulasi yang punya properti bertampilan berarti keputusan penyajian
   * sudah bocor ke bawah, dan simulasi tidak lagi bisa diuji tanpa menyepakati
   * bagaimana ia digambar.
   */
  it('tipe di src/sim tidak punya properti bertampilan', async () => {
    const banned = /\b(colour|color|mesh|texture|sprite|screen|pixel|icon)s?\s*\??\s*:/i
    const offenders: string[] = []

    for (const file of await filesUnder('src/sim')) {
      const source = readFileSync(new URL(file, new URL('../../', import.meta.url)), 'utf8')
      for (const line of source.split('\n')) {
        /* Impor menyebut nama tanpa mendeklarasikan properti. */
        if (/^\s*import\b/.test(line)) continue
        if (banned.test(line)) offenders.push(`${file}: ${line.trim()}`)
      }
    }

    expect(offenders).toEqual([])
  })

  it('simulasi berjalan tanpa DOM', () => {
    expect(globalThis.document).toBeUndefined()
    expect(globalThis.window).toBeUndefined()
  })
})
