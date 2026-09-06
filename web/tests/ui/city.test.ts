import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { CityReadout } from '~/bridge/protocol'
import BuildingIcon from '~/ui/city/BuildingIcon.vue'
import CityPanel from '~/ui/city/CityPanel.vue'
import CityStat from '~/ui/city/CityStat.vue'
import ConstructionModal from '~/ui/city/ConstructionModal.vue'
import ConstructionRow from '~/ui/city/ConstructionRow.vue'
import ProductionStrip from '~/ui/city/ProductionStrip.vue'
import {
  BUILDING_CATEGORIES,
  LEVEL_BADGE,
  MORALE_PENALTY,
  START_GREEN,
  formatDelay,
  formatDuration,
  formatPopulation,
} from '~/ui/city/buildings'

/* Peramban memuntahkan warna inline sebagai rgb(), bukan sebagai heks yang
   ditulis di kode. */
function rgbOf(hex: string): string {
  const value = Number.parseInt(hex.slice(1), 16)
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`
}

/*
 * Angka geometri di sini diukur dari piksel tangkapan layar Conflict of Nations
 * dan dicatat di docs/03-bahasa-visual.md. Uji ini yang menahannya berubah
 * diam-diam: utility UnoCSS yang tidak ter-generate tidak menimbulkan galat apa
 * pun, hanya terlihat kurang rapi.
 */
const CITY: CityReadout = {
  province: 12,
  nationTag: 'IDN',
  nationName: 'IDN',
  population: 6,
  victoryPoints: 6,
  morale: 0.7,
  occupied: false,
  slots: 5,
  usedSlots: 2,
  production: [
    { resource: 4, amount: 1205 },
    { resource: 0, amount: 1004 },
    { resource: 1, amount: 144 },
  ],
  buildings: [
    { type: 0, name: 'Army Base', level: 1 },
    { type: 3, name: 'Naval Base', level: 2 },
  ],
  constructing: null,
  mobilising: null,
  options: [
    {
      type: 0,
      name: 'Army Base',
      level: 0,
      targetLevel: 1,
      costs: [
        { resource: 2, amount: 450, affordable: true },
        { resource: 0, amount: 2000, affordable: false },
      ],
      baseHours: 28,
      hours: 30,
      blockedReason: '',
    },
    {
      type: 1,
      name: 'Arms Industry',
      level: 1,
      targetLevel: 2,
      costs: [{ resource: 0, amount: 1750, affordable: true }],
      baseHours: 14,
      hours: 15,
      blockedReason: 'That city is already building something.',
    },
  ],
}

describe('format angka kota', () => {
  it('menulis populasi dalam juta dengan satu desimal, seperti layar rujukan', () => {
    /* Jakarta terbaca 6.0 di tangkapan layar, bukan 6.000.000. */
    expect(formatPopulation(6)).toBe('6.0')
    expect(formatPopulation(4)).toBe('4.0')
  })

  it('menulis durasi dalam bentuk panjang', () => {
    expect(formatDuration(28)).toBe('1 day, 4 hours')
    expect(formatDuration(9.75)).toBe('9 hours, 45 min')
    expect(formatDuration(1)).toBe('1 hour')
  })

  it('menulis penalti morale dalam satuan pendek', () => {
    expect(formatDelay(2)).toBe('2h')
    expect(formatDelay(0.75)).toBe('45min')
    expect(formatDelay(2 + 10 / 60)).toBe('2h 10min')
  })

  it('kategori pertama memuat seluruh delapan bangunan', () => {
    expect(BUILDING_CATEGORIES[0]!.types).toHaveLength(8)

    const grouped = BUILDING_CATEGORIES.slice(1).flatMap((entry) => entry.types)
    expect([...grouped].sort((a, b) => a - b)).toEqual(BUILDING_CATEGORIES[0]!.types)
  })
})

describe('panel kota', () => {
  it('memakai lebar dan tinggi terukur', () => {
    const panel = mount(CityPanel, { props: { city: CITY, name: 'Jakarta' } })

    expect(panel.find('.w-\\[932px\\]').exists()).toBe(true)
    expect(panel.find('header').classes()).toContain('h-10')
    expect(panel.find('.h-40').exists()).toBe(true)
  })

  it('memberi kepala latar terang, bukan chrome gelap', () => {
    /* Seluruh baris identitas kota berlatar `paper` di layar rujukan. */
    expect(mount(CityPanel, { props: { city: CITY, name: 'Jakarta' } }).find('header').classes()).toContain(
      'bg-paper',
    )
  })

  it('menampilkan empat baris informasi dalam urutan layar rujukan', () => {
    const stats = mount(CityPanel, { props: { city: CITY, name: 'Jakarta' } }).findAllComponents(
      CityStat,
    )

    expect(stats.map((row) => row.props('label'))).toEqual([
      'Population',
      'Victory Points',
      'Healing Value',
      'Defense Bonus',
    ])
    expect(stats[0]!.props('value')).toBe('6.0')
    expect(stats[3]!.props('value')).toBe('0.00%')
  })

  it('menggambar slot kosong sebanyak sisa kapasitas kota', () => {
    const panel = mount(CityPanel, { props: { city: CITY, name: 'Jakarta' } })

    /* Dua bangunan berdiri, ditambah lencana kota di kepala panel. */
    const built = panel
      .findAllComponents(BuildingIcon)
      .filter((icon) => (icon.props('level') ?? 0) > 0)

    expect(built).toHaveLength(3)
    expect(panel.findAll('[aria-hidden="true"]').filter((el) => el.text() === '+')).toHaveLength(3)
  })

  it('memancarkan perintah alih-alih memanggil simulasi sendiri', async () => {
    const panel = mount(CityPanel, { props: { city: CITY, name: 'Jakarta' } })
    await panel.get('[aria-label="CONSTRUCTION"]').trigger('click')
    await panel.get('[aria-label="MOBILIZATION"]').trigger('click')

    expect(panel.emitted('construction')).toHaveLength(1)
    expect(panel.emitted('mobilization')).toHaveLength(1)
  })

  it('menamai kota yang direbut berbeda dari kota asal', () => {
    const occupied = mount(CityPanel, {
      props: { city: { ...CITY, occupied: true }, name: 'Jakarta' },
    })

    expect(occupied.text()).toContain('Occupied City')
    expect(mount(CityPanel, { props: { city: CITY, name: 'Jakarta' } }).text()).toContain(
      'Homeland City',
    )
  })
})

describe('produksi per hari', () => {
  it('menulis tiga angka tanpa hijau income', () => {
    /* Hijau `income` hanya milik laju per jam di resource bar; angka kota putih
       di atas pelat gelap. */
    const strip = mount(ProductionStrip, { props: { entries: CITY.production } })

    expect(strip.text()).toContain('+1,205')
    expect(strip.text()).toContain('+144')
    expect(strip.html()).not.toContain('text-income')
  })
})

describe('modal konstruksi', () => {
  it('memakai latar terang supaya celah tab tidak jadi baji hitam', () => {
    const modal = mount(ConstructionModal, { props: { city: CITY, name: 'Jakarta' } })

    expect(modal.classes()).toContain('bg-paper')
    expect(modal.classes()).toContain('w-[900px]')
  })

  it('memuat tiga kolom status dengan judul layar rujukan', () => {
    const text = mount(ConstructionModal, { props: { city: CITY, name: 'Jakarta' } }).text()

    expect(text).toContain('CURRENTLY CONSTRUCTING')
    expect(text).toContain('CURRENTLY MOBILIZING')
    expect(text).toContain('NEXT IN QUEUE')
    expect(text).toContain('Nothing being built')
  })

  it('menyaring baris menurut tab kategori', async () => {
    const modal = mount(ConstructionModal, { props: { city: CITY, name: 'Jakarta' } })
    expect(modal.findAllComponents(ConstructionRow)).toHaveLength(2)

    /* Tab kedua adalah Bases, yang tidak memuat Arms Industry. */
    await modal.findAll('[aria-pressed]')[1]!.trigger('click')
    const remaining = modal.findAllComponents(ConstructionRow)

    expect(remaining).toHaveLength(1)
    expect(remaining[0]!.props('option').name).toBe('Army Base')
  })

  it('menampilkan sisa waktu pekerjaan yang sedang berjalan', () => {
    const busy = mount(ConstructionModal, {
      props: {
        city: {
          ...CITY,
          constructing: { name: 'Army Base', targetLevel: 1, hoursRemaining: 30 },
        },
        name: 'Jakarta',
      },
    })

    expect(busy.text()).toContain('Army Base Lvl. 1')
    expect(busy.text()).toContain('1 day, 6 hours left')
  })
})

describe('baris bangunan', () => {
  it('menulis nama dengan tingkat tujuan, seperti layar rujukan', () => {
    const row = mount(ConstructionRow, { props: { option: CITY.options[0]!, even: true } })
    expect(row.text()).toContain('Army Base Lvl. 1')
  })

  it('menandai selisih morale dalam merah terukur', () => {
    const row = mount(ConstructionRow, { props: { option: CITY.options[0]!, even: true } })

    expect(row.text()).toContain('1 day, 4 hours')
    expect(row.text()).toContain('Morale: + 2h')
    expect(row.html()).toContain(rgbOf(MORALE_PENALTY))
  })

  it('memakai zebra beda tiga persen lightness', () => {
    expect(mount(ConstructionRow, { props: { option: CITY.options[0]!, even: true } }).classes()).toContain(
      'bg-slate-700',
    )
    expect(
      mount(ConstructionRow, { props: { option: CITY.options[0]!, even: false } }).classes(),
    ).toContain('bg-slate-500')
  })

  it('menandai biaya yang tidak terjangkau tanpa mematikan tombol', () => {
    const row = mount(ConstructionRow, { props: { option: CITY.options[0]!, even: true } })
    const amounts = row.findAll('.text-cost')

    expect(amounts).toHaveLength(1)
    expect(amounts[0]!.text()).toBe('2,000')
    expect(row.get('button[title=""]').attributes('disabled')).toBeUndefined()
  })

  it('mematikan Start ketika simulasi menolak pekerjaannya', async () => {
    const row = mount(ConstructionRow, { props: { option: CITY.options[1]!, even: false } })
    const start = row.findAll('button').at(-1)!

    expect(start.attributes('disabled')).toBeDefined()
    expect(start.attributes('title')).toBe('That city is already building something.')
    expect(row.html()).toContain(rgbOf(START_GREEN))
  })

  it('meneruskan tipe bangunan saat Start ditekan', async () => {
    const row = mount(ConstructionRow, { props: { option: CITY.options[0]!, even: true } })
    await row.findAll('button').at(-1)!.trigger('click')

    expect(row.emitted('start')).toEqual([[0]])
  })
})

describe('lencana tingkat bangunan', () => {
  it('memakai hijau terukur dan menyembunyikan lencana pada slot kosong', () => {
    expect(mount(BuildingIcon, { props: { type: 0, level: 3 } }).html()).toContain(rgbOf(LEVEL_BADGE))
    expect(mount(BuildingIcon, { props: { type: 0, level: 0 } }).html()).not.toContain(rgbOf(LEVEL_BADGE))
  })
})
