import {
  DataTexture,
  Mesh,
  NearestFilter,
  NoColorSpace,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three'
import { DEEP_OCEAN } from '~/render/mapPalette'
import { LUT_HEIGHT, LUT_WIDTH, type ProvinceLut } from '~/render/provinceLut'
import { NO_PROVINCE, type ProvinceIdMap } from '~/render/provinceIds'

const VERTEX = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/*
 * Id provinsi didekode dari kanal merah dan hijau, lalu dipakai mengindeks
 * tabel pencarian. Sampler tekstur id memakai penyaringan nearest: interpolasi
 * apa pun akan mencampur dua id menjadi id ketiga yang tidak ada, dan
 * hasilnya provinsi hantu di setiap batas.
 *
 * Wilayah yang belum dimiliki sengaja digelapkan sampai hampir menyatu dengan
 * laut. Itu bukan efek samping: di peta rujukan hanya wilayah yang dimiliki
 * yang menyala, sehingga peta terbaca sekali lihat.
 */
const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D idMap;
  uniform sampler2D lut;
  uniform vec3 deepOcean;
  uniform float lutWidth;
  uniform float hovered;
  uniform vec2 texel;

  varying vec2 vUv;

  float idAt(vec2 uv) {
    vec4 t = texture2D(idMap, uv);
    if (t.b < 0.5) return -1.0;
    return floor(t.r * 255.0 + 0.5) + floor(t.g * 255.0 + 0.5) * 256.0;
  }

  vec4 ownerAt(float id) {
    if (id < 0.0) return vec4(0.0);
    return texture2D(lut, vec2((id + 0.5) / lutWidth, 0.75));
  }

  void main() {
    float id = idAt(vUv);

    if (id < 0.0) {
      gl_FragColor = vec4(deepOcean, 1.0);
      return;
    }

    vec3 ground = texture2D(lut, vec2((id + 0.5) / lutWidth, 0.25)).rgb;
    vec4 owner = ownerAt(id);

    /* Kebangsaan dilukis sebagai rona tipis, bukan isian. Peta politik yang
       setiap provinsinya pastel sembarang terbaca sebagai diagram; mempertahankan
       medannya di bawah membuat pemain melihat sekaligus siapa pemiliknya dan
       seberapa mahal melintasinya. */
    vec3 colour = mix(ground, owner.rgb, owner.a * 0.14);

    /*
     * Batas dideteksi dari tekstur id itu sendiri, bukan digambar sebagai
     * geometri terpisah. Dua ribu provinsi berarti dua ribu jalur garis yang
     * harus dibangun ulang setiap kali kepemilikan berubah; membandingkan id
     * tetangga di shader memberi hasil yang sama tanpa geometri sama sekali.
     *
     * Batas negara digambar lebih tebal dan lebih terang daripada batas
     * provinsi karena itulah yang dibaca pemain lebih dulu.
     */
    float right = idAt(vUv + vec2(texel.x, 0.0));
    float up = idAt(vUv + vec2(0.0, texel.y));

    bool provinceEdge = abs(right - id) > 0.5 || abs(up - id) > 0.5;

    vec3 mine = owner.rgb;
    bool nationEdge =
      distance(ownerAt(right).rgb, mine) > 0.02 || distance(ownerAt(up).rgb, mine) > 0.02;

    if (provinceEdge) {
      colour = mix(colour, vec3(0.86, 0.90, 0.90), nationEdge ? 0.75 : 0.28);
    }

    if (hovered >= 0.0 && abs(id - hovered) < 0.5) {
      colour = mix(colour, vec3(1.0), 0.22);
    }

    gl_FragColor = vec4(colour, 1.0);
  }
`

export interface MapViewOptions {
  readonly canvas: HTMLCanvasElement
  readonly idMap: ProvinceIdMap
  readonly lut: ProvinceLut
}

/*
 * Bidang datar tunggal yang dimiringkan, bukan tiga dimensi penuh. Itulah yang
 * sebenarnya dipakai peta rujukan: kamera ortografis-miring di atas satu
 * bidang, bukan bola atau medan.
 */
export class MapView {
  readonly #renderer: WebGLRenderer
  readonly #scene = new Scene()
  readonly #camera: OrthographicCamera
  readonly #material: ShaderMaterial
  readonly #lutTexture: DataTexture
  readonly #idMap: ProvinceIdMap

  /* Dalam satuan bidang: lebar penuh dunia adalah 2, tinggi 1. */
  #centre = new Vector2(0, 0)
  #zoom = 1
  #frame = 0

  onHover: ((province: number) => void) | null = null
  onPick: ((province: number) => void) | null = null

  constructor(options: MapViewOptions) {
    this.#idMap = options.idMap

    this.#renderer = new WebGLRenderer({ canvas: options.canvas, antialias: false })
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    this.#camera = new OrthographicCamera(-1, 1, 0.5, -0.5, 0.1, 10)
    this.#camera.position.set(0, 0, 1)

    this.#lutTexture = new DataTexture(options.lut.data, LUT_WIDTH, LUT_HEIGHT, RGBAFormat)
    this.#lutTexture.magFilter = NearestFilter
    this.#lutTexture.minFilter = NearestFilter
    this.#lutTexture.generateMipmaps = false
    this.#lutTexture.colorSpace = NoColorSpace
    this.#lutTexture.needsUpdate = true

    this.#material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        idMap: { value: null as Texture | null },
        lut: { value: this.#lutTexture },
        deepOcean: { value: [DEEP_OCEAN.r, DEEP_OCEAN.g, DEEP_OCEAN.b] },
        lutWidth: { value: LUT_WIDTH },
        hovered: { value: -1 },
        texel: { value: [1 / 4096, 1 / 2048] },
      },
    })

    this.#scene.add(new Mesh(new PlaneGeometry(2, 1), this.#material))
  }

  async loadIdTexture(url: string): Promise<void> {
    const texture = await new TextureLoader().loadAsync(url)
    texture.magFilter = NearestFilter
    texture.minFilter = NearestFilter
    texture.generateMipmaps = false
    texture.colorSpace = NoColorSpace
    texture.needsUpdate = true

    this.#material.uniforms.idMap!.value = texture
  }

  refreshLut(): void {
    this.#lutTexture.needsUpdate = true
  }

  resize(width: number, height: number): void {
    this.#renderer.setSize(width, height, false)
    this.#applyCamera(width / height)
  }

  #applyCamera(aspect: number): void {
    const halfHeight = 0.5 / this.#zoom
    const halfWidth = halfHeight * aspect

    this.#camera.left = this.#centre.x - halfWidth
    this.#camera.right = this.#centre.x + halfWidth
    this.#camera.top = this.#centre.y + halfHeight
    this.#camera.bottom = this.#centre.y - halfHeight
    this.#camera.updateProjectionMatrix()
  }

  panBy(dxPixels: number, dyPixels: number, viewportHeight: number): void {
    const perPixel = 1 / this.#zoom / viewportHeight
    this.#centre.x -= dxPixels * perPixel
    this.#centre.y += dyPixels * perPixel
    this.#clampCentre()
  }

  zoomBy(factor: number, aspect: number): void {
    this.#zoom = Math.min(64, Math.max(1, this.#zoom * factor))
    this.#clampCentre()
    this.#applyCamera(aspect)
  }

  get zoom(): number {
    return this.#zoom
  }

  /* Sudut peta tidak boleh lepas dari layar: kamera dijepit sehingga bidangnya
     selalu menutupi viewport, dan pada zoom paling luar ia terkunci di tengah. */
  #clampCentre(): void {
    const halfHeight = 0.5 / this.#zoom
    const halfWidth = halfHeight * this.#aspect
    this.#centre.x = Math.min(1 - halfWidth, Math.max(-1 + halfWidth, this.#centre.x))
    this.#centre.y = Math.min(0.5 - halfHeight, Math.max(-0.5 + halfHeight, this.#centre.y))
  }

  #aspect = 2

  /* Piksel layar ke koordinat geografis, lewat bidang. Pemilihan membaca
     salinan id di CPU alih-alih menarik piksel kembali dari GPU: pembacaan
     balik memaksa sinkronisasi dan menahan frame berikutnya. */
  provinceAt(xPixels: number, yPixels: number, width: number, height: number): number {
    const halfHeight = 0.5 / this.#zoom
    const halfWidth = halfHeight * (width / height)

    const planeX = this.#centre.x - halfWidth + (xPixels / width) * halfWidth * 2
    const planeY = this.#centre.y + halfHeight - (yPixels / height) * halfHeight * 2

    const lon = (planeX / 2) * 360
    const lat = planeY * 180

    return this.#idMap.idAt(lon, lat)
  }

  highlight(province: number): void {
    this.#material.uniforms.hovered!.value = province === NO_PROVINCE ? -1 : province
  }

  render(width: number, height: number): void {
    this.#aspect = width / height
    this.#applyCamera(this.#aspect)
    this.#renderer.render(this.#scene, this.#camera)
  }

  start(sizeOf: () => { width: number; height: number }): void {
    const loop = (): void => {
      const { width, height } = sizeOf()
      this.render(width, height)
      this.#frame = requestAnimationFrame(loop)
    }

    this.#frame = requestAnimationFrame(loop)
  }

  dispose(): void {
    cancelAnimationFrame(this.#frame)
    this.#lutTexture.dispose()
    this.#material.dispose()
    this.#renderer.dispose()
  }
}
