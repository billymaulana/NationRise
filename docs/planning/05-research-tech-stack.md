# Riset Lanjutan: Tech Stack

> **STATUS: HISTORIS.** Riset ini membandingkan stack web (Vue, three.js, PixiJS, Tauri). **Keputusan akhir sesi 5 adalah Godot 4** (D121), sehingga dokumen ini disimpan sebagai catatan proses, bukan panduan. Lihat `51-analisis-techstack-unity.md` dan `KUNCI.md`.


> Sumber: plan riset Nation Rise, sesi 2026-09-03 sampai 2026-09-04, bagian 9. Dokumen ini bagian dari `docs/planning/`; indeks dan aturan kerja ada di `README.md`. Nomor "bagian N" yang dirujuk di dalam teks mengacu ke penomoran plan asli; petanya ada di README.

## 9. Riset Lanjutan: Tech Stack (hasil; rekomendasi, belum diputuskan Billy)

Semua versi diverifikasi dari registry npm / rilis resmi pada 2026-09-04.

### 9.1 Teknologi CoN sendiri
CoN kini di-rebrand **"Supremacy: World War 3"** (Bytro dan Dorado bergabung). Klien klasik = **HTML5 + WebGL custom Bytro** ("custom web-based technology foundation", Head of Product Dorado, PocketGamer 2025); model 3D unit low-poly di atas peta 2D dalam satu konteks WebGL, counter dan UI panel adalah DOM. Requirement Steam: RAM 4 GB, GPU Intel HD, storage 512 MB. Supremacy 1914 sedang dibangun ulang dengan Unity (mobile, beta Juli 2025). Kesimpulan: arsitektur yang ditiru = **satu canvas WebGL untuk peta + unit, DOM untuk semua UI**.

### 9.2 Perbandingan renderer
| Engine | Versi | Lisensi | Bundle gzip | WebGPU | Catatan |
|---|---|---|---|---|---|
| **three.js** | r185 (Jul 2026) | MIT | 182 KB | WebGPURenderer experimental, fallback WebGL2 | InstancedMesh, CSS2DRenderer; ShaderMaterial GLSL hanya di WebGLRenderer |
| PixiJS | 8.20.1 | MIT | 258 KB | ya | 3D native belum rilis; pixi3d hanya v5 sampai v7 |
| Babylon.js | 9.25.0 | Apache-2.0 | 1.74 MB | WGSL native | Thin instances; terlalu besar untuk kebutuhan |
| PlayCanvas | 2.21.4 | MIT | 591 KB | maturing | Komunitas peta strategi kecil |
| Godot 4.7 | | MIT | wasm 5 sampai 35 MB | web tanpa WebGPU | UI padat harus dibangun ulang di Control nodes |

Platform: Safari 26 mengirim WebGPU di macOS 26; WebGL2 di Safari sejak 15; `MAX_TEXTURE_SIZE` M1 = 16384. WKWebView (Tauri) hanya punya WebGPU jika WebKit mengaktifkan default (macOS 26; belum terverifikasi), di macOS ≤ 15 tidak → **WebGL2 sebagai target utama**.

Evaluasi: (a) **three.js WebGLRenderer** = pilihan utama: peta satu PlaneGeometry + ShaderMaterial (province-ID texture + lookup), unit satu InstancedMesh per tipe (~10 sampai 15 draw call untuk ratusan stack), counter/label overlay Vue; risiko rilis bulanan breaking (r185 mengubah updateWorldMatrix) → pin versi. (b) PixiJS + three berbagi context: resmi didukung tapi dua state machine GPU, tidak direkomendasikan. (c) **PixiJS murni + sprite pre-render 8 arah** = cadangan terbaik jika three terlalu berat. (d) Babylon, (e) PlayCanvas, (f) Godot: tidak.

### 9.3 Teknik peta
- Referensi kode: nickb.dev "Simulating the EU4 map in the browser with WebGL" (redraw 0.1 ms, bottleneck init texture); SirCypkowskyy/clausewitz-style-web-map-projection (ID = (r<<16)|(g<<8)|b, Uint32Array lookup); Vercix/godot-grand-strategy-map.
- Rencana: rasterisasi TopoJSON ke texture ID **RG8** (65.536 ID) saat build; lookup `DataTexture` untuk warna owner, texture kedua untuk morale/highlight/layer; hover/klik baca ID dari salinan Uint16Array via UV raycast ke plane (tanpa render-to-texture picking); border provinsi via edge-detection shader, garis negara dan pantai via `LineSegments` dari arcs TopoJSON (tajam semua zoom).
- Tekstur satelit: 16384² RGBA = 1 GB, 8192² = 268 MB → terlalu berat untuk unified memory 8 GB. Pakai **KTX2/Basis Universal** (transcode ASTC di Apple GPU, 4 sampai 8× lebih kecil) dan **ubin per zoom** (base 4096×2048, ubin 2048² lazily).
- Label kota: DOM overlay tervirtualisasi; glyph terrain: InstancedMesh plane kecil; LOD tiga tier zoom (dunia: counter agregat; regional: InstancedMesh + counter; kota: model penuh + label).

### 9.4 Simulasi
- Web Worker + fixed timestep (1 tick = 1 jam game) dengan accumulator; main thread render + interpolasi; determinisme diuji replay.
- Ukuran state < 1 MB (3.000 provinsi × 16 field × 4 byte ≈ 200 KB; 195 negara ≈ 50 KB; 2.000 stack ≈ 128 KB) → `postMessage` transferable ArrayBuffer 2 sampai 10 Hz cukup; **SharedArrayBuffer tidak wajib** (butuh COOP/COEP; Tauri `app.security.headers` produksi saja).
- ECS: **bitecs 0.4.0** (MPL-2.0, ~5 KB, SoA TypedArray, benchmark 335k ops/s vs miniplex 109k vs becsy 103k) untuk worker; miniplex object-based lebih lambat; becsy 0.x tidak stabil.
- RPC: Comlink 4.4.2 untuk command UI → worker; state balik lewat postMessage biner.
- Save: **idb 8.0.3** + **fflate 0.8.3** → IndexedDB; ekspor/impor file wajib karena **Safari ITP menghapus storage setelah 7 hari tanpa interaksi** (web app di Dock punya counter sendiri); kuota Chrome/Safari hingga 60% disk; OPFS opsional.

### 9.5 Pembungkus desktop
- **Tauri v2** (core 2.11.5): butuh Rust; WKWebView; cap 60 fps dihapus di macOS 26; klaim RAM lebih rendah dari Electron **tidak universal** (issue #5889: web app berat 421 sampai 581 MB vs Electron 240 sampai 337 MB) → ukur sendiri.
- **Electron 44** (Chromium 152): WebGPU pasti, tapi ~150 MB app dan proses Chromium ganda di RAM 8 GB → hindari.
- **PWA**: Safari 17+ Add to Dock, Chrome install; offline via service worker; nol Rust.
- Rekomendasi: **PWA dulu**, lalu Tauri v2 bila butuh `.app` dan akses file native (tanpa menulis Rust, hanya config + plugin fs/dialog).

### 9.6 Aset 3D unit gratis
CC0: Kenney Watercraft Kit (45 kapal), Quaternius Animated Tanks (4 tank, FBX/OBJ), Quaternius Ships (6), Quaternius Toon Shooter / Universal Base Characters / Modular Men (glTF, infantri), Poly Pizza Tank by Quaternius. CC-BY 4.0: Modern Jet Fighter Low Poly (3Dima, 11.9k tris GLB), Low Poly T-72 (1.5k tris), FREE Fighter Jet Collection (241k tris total, perlu decimasi). Target ≤ 1.500 tris per unit, atlas 1024² per kategori, GLB Meshopt via gltf-transform. Jangan mengekstrak aset CoN.

### 9.7 Stack Vue (versi terverifikasi)
Vue 3.5.42; Vite 8.2.2 (Rolldown; Node ^20.19 || ≥22.12, Node 24 aman); Pinia 4.0.3; vue-i18n 11.4.10; UnoCSS 66.9.2; Vitest 5.0.0. Aturan canvas di Vue: objek engine di variabel modul atau `shallowRef` + `markRaw`, **jangan** di `ref()`/`reactive()`/Pinia; Pinia hanya state game; `onMounted` create, `onUnmounted` dispose + cancelAnimationFrame; `ResizeObserver` pada container; `setPixelRatio(Math.min(devicePixelRatio, 1.5))` dengan penurunan dinamis; overlay counter sebagai komponen Vue absolute dengan `translate3d`, dibatasi ke viewport; OffscreenCanvas di worker tidak untuk tahap awal.

### 9.8 Rekomendasi final riset
| Lapisan | Pilihan |
|---|---|
| App/UI | Vue 3.5 + Vite 8 + TypeScript + Pinia 4 + vue-i18n 11 + UnoCSS + Vitest 5 |
| Renderer | three.js r185 `WebGLRenderer` (bukan WebGPU) |
| Peta | Plane + texture ID RG8 4096×2048 (upgrade 8192×4096) + DataTexture lookup; border shader + LineSegments arcs; satelit KTX2 ubin |
| Unit | 1 InstancedMesh per tipe (≤ ~15 draw call), LOD per zoom; counter bendera/angka overlay Vue tervirtualisasi |
| Simulasi | Web Worker + fixed timestep + bitecs 0.4 + Comlink; snapshot biner transferable 2 sampai 10 Hz |
| Save | idb + fflate → IndexedDB + ekspor/impor file |
| Wrapper | PWA dulu, Tauri v2 bila perlu; hindari Electron |
| Aset | Quaternius/Kenney CC0 + Sketchfab CC-BY, ≤ 1.5k tris, GLB Meshopt |

Kebijakan performa wajib: DPR cap 1.5 dinamis; render-on-demand; KTX2 untuk texture besar; tanpa post-processing; target < 50 draw call di zoom regional; profil `renderer.info.render.calls`. Cadangan: PixiJS 8.20 murni + sprite 8 arah. Risiko: three rilis breaking (pin), WebGPU WKWebView per versi macOS, memori texture, eviksi storage Safari, klaim RAM Tauri, aset CoN proprietary.

Belum terverifikasi: library render spesifik klien Bytro, Steam client CoN sebagai webview, tanggal merger Bytro-Dorado, jumlah pasti fitur NE 10m admin-1, WebGPU di WKWebView macOS 26.
