import { defineConfig, presetIcons, presetWind4, transformerDirectives } from 'unocss'

/*
 * Pemindaian ditulis eksplisit. Utility yang tidak terpindai tidak menimbulkan
 * galat apa pun — build tetap hijau, halaman tetap render, hanya jaraknya yang
 * hilang diam-diam. Kegagalan itu pernah terjadi dan memakan satu sesi penuh.
 */
export default defineConfig({
  content: {
    pipeline: {
      include: [/\.(vue|ts)($|\?)/, 'src/**/*.{vue,ts}'],
    },
  },
  presets: [presetWind4(), presetIcons()],
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      /* Skala abu-batu, diukur dari tangkapan layar CoN. Seluruhnya hue 199-214. */
      slate: {
        900: '#25323a',
        850: '#2c3941',
        800: '#334048',
        700: '#40484c',
        650: '#43525a',
        600: '#455259',
        550: '#47545c',
        500: '#484f53',
        400: '#54636a',
        350: '#57666d',
        300: '#596d7a',
      },
      paper: '#ecedee',
      income: '#91ea39',
      cost: '#a33435',
      danger: '#a1565a',
      victory: '#a8841f',
      action: '#4b647b',
      now: '#4e6781',
      map: {
        seaDeep: '#2d3841',
        seaShelf: '#5a6068',
        landOwn: '#476a36',
        landNeutral: '#2f3a43',
      },
    },
    /* Kanvas rujukan 1440x784 CSS pada DPR 2 (W11). */
    width: { canvas: '1440px' },
    height: { canvas: '784px' },
  },
  shortcuts: {
    /* Sel resource bar: 104px terukur, konsisten di delapan sel. */
    'resource-cell': 'w-[104px] h-full flex items-center justify-center gap-2',
  },
})
