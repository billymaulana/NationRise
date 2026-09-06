import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  Mesh,
  NearestFilter,
  NoColorSpace,
  OrthographicCamera,
  PlaneGeometry,
  RedFormat,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three'
import { DEEP_OCEAN, SHELF_WATER } from '~/render/mapPalette'
import { LUT_HEIGHT, LUT_WIDTH, type ProvinceLut } from '~/render/provinceLut'
import type { DepthField } from '~/render/bathymetry'
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
  uniform sampler2D depthMap;
  uniform vec3 deepOcean;
  uniform vec3 shelfWater;
  uniform float lutWidth;
  uniform float hovered;
  uniform vec2 texel;

  varying vec2 vUv;

  const float NO_PROVINCE = 65535.0;

  float idFrom(vec4 t) {
    return floor(t.r * 255.0 + 0.5) + floor(t.g * 255.0 + 0.5) * 256.0;
  }

  float idAt(vec2 uv) {
    return idFrom(texture2D(idMap, uv));
  }

  vec4 ownerAt(float id) {
    if (id >= NO_PROVINCE) return vec4(0.0);
    return texture2D(lut, vec2((id + 0.5) / lutWidth, 0.75));
  }

  /* Derau nilai murah untuk memecah bidang rata. Peta rujukan adalah foto, dan
     yang paling menelanjangi tiruan berbasis poligon adalah permukaan yang
     benar-benar seragam — mata langsung membacanya sebagai diagram. */
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float grain(vec2 p) {
    return noise(p * 320.0) * 0.55 + noise(p * 900.0) * 0.30 + noise(p * 2400.0) * 0.15;
  }

  /*
   * Bayangan relief semu: gradien derau disinari dari barat laut, konvensi
   * kartografi yang sama dengan peta cetak.
   *
   * Ini bukan ketinggian sungguhan — pipeline tidak menghasilkannya. Yang
   * dikerjakannya adalah memecah bidang datar per provinsi menjadi permukaan
   * yang terbaca sebagai daratan. Tanpa itu, peta berbasis poligon langsung
   * terbaca sebagai diagram betapapun tepat paletnya, karena tidak ada
   * bentang alam sungguhan yang seragam.
   */
  float relief(vec2 p) {
    float e = 0.0012;
    float here = grain(p);
    float east = grain(p + vec2(e, 0.0));
    float north = grain(p + vec2(0.0, e));

    vec3 normal = normalize(vec3(here - east, here - north, 0.06));
    vec3 sun = normalize(vec3(-0.6, 0.6, 0.52));

    return clamp(dot(normal, sun), -1.0, 1.0);
  }

  void main() {
    vec4 texel0 = texture2D(idMap, vUv);
    float id = idFrom(texel0);
    float coast = texel0.b;

    if (id >= NO_PROVINCE) {
      /*
       * Laut dibangun dari tiga lapis: kedalaman batimetri, pita paparan yang
       * mengikuti jarak ke pantai, dan halo pucat tepat di garis pantainya.
       *
       * Halo itu hal paling mencolok di peta rujukan dan mengerjakan sesuatu
       * yang nyata: ia memisahkan darat dari laut jauh lebih tegas daripada
       * perbedaan warna saja, terutama di kepulauan tempat garis pantainya
       * berbelit.
       */
      float depth = texture2D(depthMap, vUv).r;
      vec3 water = mix(shelfWater, deepOcean, smoothstep(0.0, 0.32, depth));

      float shelf = 1.0 - smoothstep(0.02, 0.16, coast);
      water = mix(water, shelfWater * 1.25, shelf * 0.55);

      float foam = 1.0 - smoothstep(0.0, 0.035, coast);
      water = mix(water, vec3(0.82, 0.88, 0.90), foam * 0.75);

      /* Laut mendapat relief yang jauh lebih lemah: permukaannya memang rata,
         dan yang ditiru di sini hanya riak pencahayaan citra satelit. */
      water *= 0.95 + grain(vUv) * 0.10;
      water *= 1.0 + relief(vUv) * 0.09;

      gl_FragColor = vec4(water, 1.0);
      return;
    }

    vec3 ground = texture2D(lut, vec2((id + 0.5) / lutWidth, 0.25)).rgb;
    vec4 owner = ownerAt(id);

    /*
     * Wilayah pemain menyala, wilayah asing digelapkan. Itu bukan hiasan: di
     * peta rujukan hanya tanah yang dimiliki yang terang, dan itulah yang
     * membuat perbatasan terbaca sekali lihat tanpa membaca satu label pun.
     */
    float mine = step(0.75, owner.a);
    float held = step(0.25, owner.a);

    /* Diukur dari peta rujukan, bukan dipilih dengan mata: tanah asing di sana
       adalah 67 persen kecerahan dan 27 persen saturasi dari tanah milik
       sendiri. Menggelapkannya lebih jauh membuat dunia terbaca kosong; kurang
       dari itu membuat perbatasan hilang. */
    vec3 foreign = mix(vec3(dot(ground, vec3(0.33))), ground, 0.27) * 0.67;
    vec3 unclaimed = mix(deepOcean, ground, 0.34);
    vec3 colour = mix(mix(unclaimed, foreign, held), ground, mine);

    colour = mix(colour, owner.rgb, owner.a * 0.10);
    colour *= 0.90 + grain(vUv) * 0.20;
    colour *= 1.0 + relief(vUv) * 0.34;

    /* Pantai dari sisi darat juga dipucatkan sedikit, seperti pasir yang
       terbakar matahari di citra satelit. */
    colour = mix(colour, colour * 1.35 + 0.05, (1.0 - smoothstep(0.0, 0.03, coast)) * 0.5);

    float right = idAt(vUv + vec2(texel.x, 0.0));
    float up = idAt(vUv + vec2(0.0, texel.y));

    bool provinceEdge = abs(right - id) > 0.5 || abs(up - id) > 0.5;
    bool nationEdge =
      distance(ownerAt(right).rgb, owner.rgb) > 0.02 ||
      distance(ownerAt(up).rgb, owner.rgb) > 0.02;

    if (provinceEdge) {
      colour = mix(colour, vec3(0.86, 0.90, 0.90), nationEdge ? 0.78 : 0.16);
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

  /* Dipanggil sekali per frame yang digambar. Lapisan di atas memakai ini
     alih-alih menjalankan requestAnimationFrame sendiri: dua rantai frame yang
     terpisah berarti salah satunya bisa mati diam-diam tanpa menghentikan yang
     lain, dan yang tampak di layar hanyalah sebagian antarmuka berhenti
     diperbarui tanpa galat apa pun. */
  onFrame: ((width: number, height: number) => void) | null = null

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
        depthMap: { value: null as Texture | null },
        deepOcean: { value: [DEEP_OCEAN.r, DEEP_OCEAN.g, DEEP_OCEAN.b] },
        shelfWater: { value: [SHELF_WATER.r, SHELF_WATER.g, SHELF_WATER.b] },
        lutWidth: { value: LUT_WIDTH },
        hovered: { value: -1 },
        texel: { value: [1 / 4096, 1 / 2048] },
      },
    })

    this.#scene.add(new Mesh(new PlaneGeometry(2, 1), this.#material))
  }

  setDepthField(field: DepthField): void {
    const texture = new DataTexture(field.depth, field.width, field.height, RedFormat)
    texture.magFilter = LinearFilter
    texture.minFilter = LinearFilter
    texture.generateMipmaps = false
    texture.colorSpace = NoColorSpace
    texture.wrapS = ClampToEdgeWrapping
    texture.wrapT = ClampToEdgeWrapping
    texture.needsUpdate = true

    /* Batimetri dibaca dengan penyaringan linear, kebalikan dari tekstur id:
       di sini interpolasi justru diinginkan supaya batas antar lembar
       kedalaman tidak terlihat sebagai tangga. */
    this.#material.uniforms.depthMap!.value = texture
  }

  async loadIdTexture(url: string): Promise<void> {
    const texture = await new TextureLoader().loadAsync(url)
    texture.magFilter = NearestFilter
    texture.minFilter = NearestFilter
    texture.generateMipmaps = false
    texture.colorSpace = NoColorSpace

    /* Dijepit secara eksplisit, tidak diandalkan pada bawaan: pengulangan di
       tepi akan menempelkan Asia Timur ke Amerika dan tidak ada yang menandai
       kesalahannya selain mata. */
    texture.wrapS = ClampToEdgeWrapping
    texture.wrapT = ClampToEdgeWrapping
    texture.needsUpdate = true

    this.#material.uniforms.idMap!.value = texture
  }

  refreshLut(): void {
    this.#lutTexture.needsUpdate = true
  }

  resize(width: number, height: number): void {
    this.#renderer.setSize(width, height, false)
    this.#aspect = width / height
    this.#clampCentre()
    this.#applyCamera(this.#aspect)
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

  /* Zoom menuju kursor, bukan menuju pusat layar. Zoom ke pusat memaksa pemain
     menggeser setelah setiap langkah zoom, dan pada peta dunia itu berarti
     kehilangan tempat yang sedang dilihat. */
  /* Zoom paling luar tidak boleh lebih kecil dari yang menutupi viewport.
     Bidangnya dua kali selebar tingginya, jadi layar yang lebih lebar dari itu
     akan menyisakan pita kosong di kiri dan kanan — dan pita itu terbaca
     sebagai peta yang terpotong, bukan sebagai batas dunia. */
  #minZoom(aspect: number): number {
    return Math.max(1, aspect / 2)
  }

  zoomAt(factor: number, xPixels: number, yPixels: number, width: number, height: number): void {
    const before = this.#planeAt(xPixels, yPixels, width, height)

    this.#aspect = width / height
    this.#zoom = Math.min(64, Math.max(this.#minZoom(this.#aspect), this.#zoom * factor))

    const after = this.#planeAt(xPixels, yPixels, width, height)
    this.#centre.x += before.x - after.x
    this.#centre.y += before.y - after.y

    this.#clampCentre()
    this.#applyCamera(this.#aspect)
  }

  #planeAt(xPixels: number, yPixels: number, width: number, height: number): Vector2 {
    const halfHeight = 0.5 / this.#zoom
    const halfWidth = halfHeight * (width / height)

    return new Vector2(
      this.#centre.x - halfWidth + (xPixels / width) * halfWidth * 2,
      this.#centre.y + halfHeight - (yPixels / height) * halfHeight * 2,
    )
  }

  get zoom(): number {
    return this.#zoom
  }

  /* Sudut peta tidak boleh lepas dari layar: kamera dijepit sehingga bidangnya
     selalu menutupi viewport, dan pada zoom paling luar ia terkunci di tengah. */
  #clampCentre(): void {
    this.#zoom = Math.max(this.#minZoom(this.#aspect), this.#zoom)

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
    const plane = this.#planeAt(xPixels, yPixels, width, height)
    return this.#idMap.idAt((plane.x / 2) * 360, plane.y * 180)
  }

  /* Bujur dan lintang ke piksel layar, memakai kotak kamera yang sama dengan
     yang dipakai menggambar. Label diletakkan lewat jalur ini, bukan lewat
     sprite di dalam scene, supaya ukurannya tetap di layar dan teksnya tetap
     tajam pada zoom berapa pun. */
  project(
    lon: number,
    lat: number,
    width: number,
    height: number,
  ): { x: number; y: number; visible: boolean } {
    const halfHeight = 0.5 / this.#zoom
    const halfWidth = halfHeight * (width / height)

    const planeX = (lon / 360) * 2
    const planeY = lat / 180

    const x = ((planeX - (this.#centre.x - halfWidth)) / (halfWidth * 2)) * width
    const y = (((this.#centre.y + halfHeight) - planeY) / (halfHeight * 2)) * height

    /* Ambang atas dibuat ketat: label yang pusatnya sedikit di atas viewport
       tetap tergambar separuh dan menabrak bilah navigasi di atas peta. */
    return { x, y, visible: x >= -80 && x <= width + 80 && y >= 8 && y <= height - 4 }
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
      this.onFrame?.(width, height)
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
