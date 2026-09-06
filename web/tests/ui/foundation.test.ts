import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DiamondBadge from '~/ui/foundation/DiamondBadge.vue'
import ProgressBar from '~/ui/foundation/ProgressBar.vue'
import StatRow from '~/ui/foundation/StatRow.vue'
import TrapezoidTab from '~/ui/foundation/TrapezoidTab.vue'
import { diamondFills } from '~/ui/foundation/shapes'

/*
 * Angka di sini disalin dari docs/03-bahasa-visual.md, yang diturunkan dari
 * piksel tangkapan layar. Mengubahnya berarti mengubah klaim ketepatan, jadi
 * uji ini yang menahan perubahan diam-diam.
 */
describe('tab trapesium', () => {
  it('memakai tinggi dan lebar terukur', () => {
    const tab = mount(TrapezoidTab)
    expect(tab.classes()).toContain('h-[28px]')
    expect(tab.classes()).toContain('w-[67px]')
  })

  it('melebar ke bawah, bukan ke atas', () => {
    const clip = mount(TrapezoidTab).find('span').attributes('style') ?? ''
    /* Titik atas menjorok ke dalam, titik bawah menyentuh tepi. */
    expect(clip).toContain('polygon(4px 0')
    expect(clip).toContain('100% 100%, 0 100%')
  })

  it('menggambar garis tepi di induk supaya tidak terpotong clip-path', () => {
    const tab = mount(TrapezoidTab)
    expect(tab.attributes('style')).toContain('drop-shadow')
    expect(tab.attributes('style')).not.toContain('clip-path')
    expect(tab.find('span').attributes('style')).toContain('clip-path')
  })

  it('menandai keadaan terpilih untuk pembaca layar', () => {
    expect(mount(TrapezoidTab, { props: { active: true } }).attributes('aria-pressed')).toBe('true')
  })
})

describe('belah ketupat', () => {
  it('memakai abu netral murni untuk keadaan unavailable', () => {
    /* Netral penuh yang membuatnya terbaca mati; rona biru akan tampak aktif. */
    expect(diamondFills.unavailable).toBe('#757575')
  })

  it('hanya menggambar garis luar saat kosong', () => {
    const empty = mount(DiamondBadge, { props: { state: 'empty' } })
    expect(empty.html()).toContain('transparent')
  })

  it('menghormati ukuran yang diminta', () => {
    const badge = mount(DiamondBadge, { props: { size: 44 } })
    expect(badge.attributes('style')).toContain('width: 44px')
  })
})

describe('baris statistik', () => {
  it('berselang-seling dengan beda lightness yang halus', () => {
    const even = mount(StatRow, { props: { label: 'a', value: 'b', even: true } })
    const odd = mount(StatRow, { props: { label: 'a', value: 'b', even: false } })
    expect(even.classes()).toContain('bg-slate-700')
    expect(odd.classes()).toContain('bg-slate-500')
  })
})

describe('bar morale', () => {
  it('membulatkan persentase seperti tampilan aslinya', () => {
    expect(mount(ProgressBar, { props: { value: 70 } }).text()).toContain('70%')
    expect(mount(ProgressBar, { props: { value: 33, max: 66 } }).text()).toContain('50%')
  })
})
