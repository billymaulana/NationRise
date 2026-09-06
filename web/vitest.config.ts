import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

/*
 * Dua proyek dengan lingkungan berbeda. Rangkaian 'sim' berjalan di node tanpa
 * DOM, sehingga kebocoran lapisan gagal sebagai galat runtime, bukan lolos
 * diam-diam.
 */
export default defineConfig({
  resolve: {
    alias: { '~': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    projects: [
      {
        test: {
          name: 'sim',
          environment: 'node',
          include: ['tests/sim/**/*.test.ts', 'tests/layering/**/*.test.ts'],
        },
      },
      {
        plugins: [vue()],
        test: {
          name: 'ui',
          environment: 'jsdom',
          include: ['tests/ui/**/*.test.ts'],
        },
      },
    ],
  },
})
