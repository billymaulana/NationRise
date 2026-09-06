import { describe, expect, it } from 'vitest'
import { addF32, f32, mulF32 } from '~/sim/determinism/float32'

describe('aritmetika float32', () => {
  it('membulatkan ke presisi 32 bit', () => {
    expect(f32(0.1)).not.toBe(0.1)
    expect(f32(0.5)).toBe(0.5)
  })

  /*
   * Kasus yang memaksa modul ini ada, dan bentuk kegagalannya yang sebenarnya.
   *
   * Morale disimpan di Float32Array, jadi membacanya memberi 0.699999988079071,
   * bukan 0.7. Nilai itu sendiri sudah benar. Yang salah adalah melanjutkannya
   * dengan aritmetika double: hasilnya 728,9999914 dan Math.floor menjadikannya
   * 728, sementara implementasi rujukan memberi 729.
   *
   * Jadi bukan penyimpanannya yang perlu diperbaiki, melainkan setiap operasi
   * sesudahnya harus dibulatkan ke 32 bit juga.
   */
  it('nilai float32 yang dilanjutkan dengan aritmetika double meleset satu', () => {
    const morale = f32(0.7)
    expect(morale).not.toBe(0.7)

    const viaDouble = 3000 * (morale * 0.8 + 0.25) * 0.3 * 1
    expect(Math.floor(viaDouble)).toBe(728)

    const moraleFactor = addF32(mulF32(morale, f32(0.8)), f32(0.25))
    const viaFloat32 = mulF32(mulF32(mulF32(f32(3000), moraleFactor), f32(0.3)), f32(1))
    expect(Math.floor(viaFloat32)).toBe(729)
  })
})
