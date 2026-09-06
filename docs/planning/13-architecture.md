# Arsitektur Nation Rise v0.2

> **STATUS: PERLU DITULIS ULANG.** Arsitektur di bawah ditulis untuk stack web (Web Worker, Comlink, bitecs, idb). **Engine berpindah ke Godot 4** (D121). Konsepnya tetap berlaku: struktur array, snapshot, fixed timestep satu jam game, PRNG seeded, determinisme, pemisahan simulasi dari tampilan. Yang berganti hanya implementasinya.


> Ditulis sesi 5 (2026-09-05), mengonsolidasikan D13, D22, dan riset `05-`, `22-`, `24-`, `25-`, `27-`. Menggantikan kerangka v0.1 (disimpan sebagai `13-architecture.v0.1.bak`). Dokumen ini adalah kontrak teknis untuk fase 1 sampai 3.

## 1. Stack

| Lapisan | Pilihan | Versi acuan |
|---|---|---|
| UI dan panel | Vue 3.5 + UnoCSS + vue-i18n | 3.5.42, 66.9.2, 11.4.10 |
| Build | Vite 8 + TypeScript | 8.2.2 |
| Renderer peta dan unit | three.js `WebGLRenderer` (bukan WebGPU) | r185, **di-pin** |
| Simulasi | Web Worker + bitecs + Comlink | 0.4.0 MPL-2.0, 4.4.2 |
| Save | idb + fflate | 8.0.3, 0.8.3 |
| Validasi konten | Ajv precompiled (`ajv/standalone`) | draft 2020-12 |
| Distribusi | PWA dulu, Tauri v2 opsional; macOS dulu | 2.11.x |
| Test | Vitest | 5.0.0 |

**Alasan menolak WebGPU:** WKWebView hanya punya WebGPU bila WebKit mengaktifkannya default, dan itu tergantung versi macOS; WebGL2 jalan di semua versi. `ShaderMaterial` GLSL yang kita butuhkan untuk province ID map juga tidak didukung `WebGPURenderer`.

**Alasan mem-pin three.js:** rilis bulanan kadang breaking, misalnya r185 mengubah `updateWorldMatrix`. Upgrade dijadwalkan, bukan otomatis.

## 2. Enam lapisan dan kontraknya

```
[1] Data pipeline (build time, Node)   → menghasilkan aset statis, tidak pernah jalan di runtime
[2] Content (JSON + validator)          → dibaca lapisan 3 dan 4, tidak pernah mengimpor kode game
[3] Core simulation (Worker)            → murni, deterministik, tanpa DOM, tanpa three.js
[4] Renderer (three.js)                 → hanya membaca snapshot, tidak pernah memutasi state
[5] UI (Vue)                            → hanya membaca snapshot dan mengirim command
[6] Persistence (IndexedDB + file)      → menyimpan seed, command log, dan snapshot
```

**Aturan yang tidak boleh dilanggar.**
1. Lapisan 3 tidak mengimpor apa pun dari lapisan 4, 5, atau 6. Tidak ada `document`, `window`, `Date.now()`, `Math.random()`, `performance.now()`.
2. Lapisan 4 dan 5 tidak pernah memanggil fungsi mutasi lapisan 3. Satu-satunya jalur adalah `command`.
3. Lapisan 2 tidak mengimpor kode; ia hanya data yang divalidasi skema.
4. Objek three.js dan objek engine lain **tidak pernah** masuk `ref()`, `reactive()`, atau Pinia. Pakai variabel modul atau `shallowRef` dengan `markRaw`, karena proxy reaktif Vue akan menelusuri scene graph dan menghancurkan performa.

## 3. Protokol pesan Worker

Satu arah masuk (`command`), dua arah keluar (`snapshot` dan `event`). Semua pesan bertipe, dan payload besar dikirim sebagai `ArrayBuffer` transferable.

**UI ke Worker:**
```ts
type Command =
  | { t: 'init'; seed: number; scenarioId: string; nationTag: string; settings: Settings }
  | { t: 'setSpeed'; speed: 0 | 1 | 2 | 3 | 4 }          // 0 = pause
  | { t: 'fastForwardUntil'; until: { kind: 'arrival'|'day'|'event'; id?: number } }
  | { t: 'queueBuilding'; provinceId: number; buildingId: string; level: number }
  | { t: 'queueUnit'; provinceId: number; unitId: string; count: number }
  | { t: 'startResearch'; slot: 0 | 1; nodeId: string }
  | { t: 'createFront'; provinceIds: Uint16Array; name: string }
  | { t: 'assignArmyGroup'; frontId: number; groupId: number; commanderId?: number }
  | { t: 'setObjective'; frontId: number; objective: Objective; targetProvinceId?: number }
  | { t: 'setNavalMission'; zoneId: number; fleetId: number; mission: NavalMission }
  | { t: 'playOperationCard'; cardId: string; targets: number[]; trigger?: Trigger }
  | { t: 'moveStack'; stackId: number; path: Uint16Array; rush: boolean }   // override L1
  | { t: 'setStance'; stackId: number; stance: Stance }
  | { t: 'setRelation'; targetTag: string; relation: Relation }
  | { t: 'market'; goodId: string; side: 'buy'|'sell'; lots: number }
  | { t: 'save'; slotId: string }
  | { t: 'load'; slotId: string }
```

**Worker ke UI:**
```ts
type Outbound =
  | { t: 'snapshot'; tick: number; buffers: SnapshotBuffers }   // transferable
  | { t: 'event'; tick: number; kind: EventKind; payload: unknown }  // untuk feed, auto-pause, Chronicle
  | { t: 'ack'; commandId: number; ok: boolean; reason?: string }
  | { t: 'perf'; msPerTick: number; entities: number; heapMB: number }
```

**Frekuensi.** Snapshot dikirim maksimal **10 Hz**, bukan setiap tick, dan hanya berisi **delta** untuk provinsi dan stack yang berubah. Total state di bawah 1 MB (2.000 provinsi kali 16 field kali 4 byte sekitar 200 KB, 195 negara sekitar 50 KB, 2.000 stack sekitar 128 KB), sehingga `postMessage` dengan transferable jauh lebih dari cukup dan `SharedArrayBuffer` tidak diperlukan. SAB juga menuntut header COOP dan COEP yang hanya berlaku di build produksi Tauri, jadi disimpan sebagai optimasi tahap dua.

**Struktur snapshot** memakai SoA typed arrays agar bisa langsung dibaca renderer tanpa konversi:
```ts
interface SnapshotBuffers {
  provinceOwner: Uint16Array      // index = provinceId, value = nationId
  provinceMorale: Uint8Array      // 0..100
  provinceSupply: Uint8Array      // 0 supplied, 1 low, 2 cut off
  provinceFlags: Uint8Array       // bit: occupied, sieged, contested, blockaded
  stackPos: Float32Array          // x, y interleaved
  stackMeta: Uint32Array          // packed: ownerId, typeId, count, hp%
  nationResources: Float32Array   // nationId × goodCount
  dirtyProvinces: Uint16Array     // daftar id yang berubah sejak snapshot terakhir
}
```

## 4. Determinisme

Prasyarat mutlak, karena tiga fitur bergantung padanya: fork bagaimana jika (D31), Segel Kanon (`26-`), dan snapshot test balance (`24-`).

**Aturan.**
1. Satu-satunya sumber acak adalah `mulberry32(hash(seed, streamId, tick, entityId))`. **Stream terpisah** untuk combat, event, krisis endgame, dan spawn insurgent, agar menambah satu roll di satu sistem tidak menggeser seluruh dunia.
2. Ekonomi memakai **integer atau fixed-point**, bukan float, agar penjumlahan tidak bergantung urutan.
3. Iterasi selalu atas array berindeks, tidak pernah atas `Object.keys` atau `Set`.
4. `Math.*` transcendental (`log`, `exp`) boleh dipakai karena satu mesin, tetapi hasilnya dibulatkan ke presisi tetap sebelum disimpan ke state.
5. Uji determinisme: jalankan seed yang sama dua kali dan bandingkan hash state per 500 tick. Ini test CI, bukan test opsional.

## 5. Format save

Save adalah **snapshot berkala plus command log**, bukan dump state penuh. Satu implementasi memberi tiga hal: fork murah (potong log di tick T), replay untuk debugging desync, dan penghitungan hari game yang diulang secara gratis.

```
save.nrs (fflate gzip)
├── header.json      versi skema, era pack id + hash, contentChecksum, seed,
│                    tick, tanggal nyata, integritas cabang, parentBranchId
├── snapshots/       state penuh tiap 500 tick, biner SoA
├── commands.bin     seluruh command sejak tick 0, dengan tick stamp
└── chronicle.json   log peristiwa untuk layar Warisan
```

**Ring buffer 20 slot rotasi plus 5 slot tonggak yang tidak pernah ditimpa.** Autosave dipicu `(hari game >= 1) ATAU (menit nyata >= 5)`, plus berbasis peristiwa. **Tidak pernah file save tunggal**; itu penyebab run ironman mati di EU4 dan HoI4 dan tidak ada alasannya di game offline.

**Aturan muat.** Mod hilang menawarkan muat tanpa mod dengan entity diganti placeholder; versi berbeda dengan migrasi tersedia dijalankan dan ditandai; checksum berbeda memberi peringatan tetapi tetap dimuat. **Jangan pernah memblokir load secara keras**, karena blokir keras hanya masuk akal untuk multiplayer dan achievement yang kita tidak punya.

## 6. Konten dan era pack

```
content/
  shared/                       dibaca semua era
    provinces.topojson          geometri ~2.000, immutable
    province-id-map.png         raster ID, RG8
    adjacency.json              graph darat dan laut
    terrain.json                tipe per provinsi
    cities.json                 koordinat dan kunci
    sea-zones.json              ~210 zona
    unit-categories.json        8 kategori, tetap
  eras/
    modern-2026/
      era.json                  meta, calendar, epochs, disabled_categories, doctrines
      political.json            owner, sovereign, subject_type, core_of, status
      nations.json              tag, nama, bendera, identityColor, doktrin, persona, tier
      resources.json            daftar goods dan yield per terrain
      units.json                roster dan stat
      research.json             node dan epoch
      buildings.json
      events.json               trigger dan effect deklaratif
      rules.json                supply range, morale, musim, WMD
      aliases.json              nama era untuk kota dan provinsi
      overrides.json            koreksi manual pipeline
      palette.json              named_colors dan ramp OKLCH
      assets/flags/
    ww2-1939/  ww1-1914/  coldwar-1962/
  scenarios/                    overlay editor dan sandbox
mods/eras/                      drop-in, skema identik
```

**Yang dibagi lintas era:** geometri, adjacency, terrain, sea zones, kunci kota, delapan kategori unit, engine combat, formula ekonomi, mesin event dan verba, Chronicle, skema AI. **Yang per era:** kepemilikan dan core, alias, roster dan kategori yang dinonaktifkan, daftar goods dan yield, konten event dan kalender dan epoch, bobot historis, aliansi awal, palet.

**Validasi dua belas langkah** dijalankan saat build dan saat memuat mod: discover, manifest, resolve, order topologis, parse dengan pelacakan posisi dan reviver anti prototype-pollution, validate Ajv `allErrors`, migrate in-memory, xref integritas referensial, conflict, merge, invariants (pohon riset asiklik, tanpa orphan, **gate warna ΔE lolos**), report ke `mods/.report.json` dan panel in-game.

**Pesan error wajib memuat tiga hal**: baris dan kolom (butuh `jsonc-parser`, `JSON.parse` biasa tidak bisa), nama skema beserta versinya, dan hint berbasis jarak Levenshtein untuk error enum dan referensi.

## 7. Pipeline rendering

**Peta** adalah satu `PlaneGeometry` dengan `ShaderMaterial`:
```
provinceIdMap  RG8, 4096×2048 (upgrade 8192×4096)   → 65.536 ID tanpa binary search
lutColor       RGBA8 DataTexture, 64×32 = 2048      → RGB warna pemilik + A flag
lutScalar      RG8, 2048                             → R skalar map mode, G pattern id
rampTex        RGBA8, 256×N                          → N ramp sequential dan diverging
satellite      KTX2 Basis, ubin per zoom             → transcode ASTC di Apple GPU
```
Isi peta menjadi **satu draw call**. Ganti map mode adalah satu uniform plus menulis 2 KB. Aneksasi adalah menulis 4 byte dan `needsUpdate = true`. Hover dan klik membaca ID dari salinan `Uint16Array` di CPU lewat UV raycast, tanpa render-to-texture picking.

**Border** digambar screen-space dari `provinceIdMap`: ID berbeda menjadi garis provinsi tipis, owner berbeda menjadi garis negara tebal. Garis negara dan pantai yang tajam di semua zoom memakai `LineSegments` dari arcs TopoJSON, karena arcs bersama hanya disimpan sekali.

**Unit** memakai satu `InstancedMesh` per tipe, sekitar 10 sampai 15 draw call untuk ratusan stack. Counter bendera dan angka adalah overlay Vue `position:absolute` dengan `translate3d`, dibatasi ke unit yang terlihat di viewport.

**Tiga tier LOD**: zoom dunia memakai counter agregat per negara tanpa model 3D; zoom regional memakai InstancedMesh dan counter; zoom kota memakai model penuh dan label.

**Anggaran performa:** DPR di-cap 1,5 dengan penurunan dinamis bila frame time melewati 16 ms; render-on-demand, tidak `requestAnimationFrame` terus-menerus saat tidak ada perubahan; tanpa post-processing; target di bawah 50 draw call di zoom regional; memori tekstur di bawah 100 MB (16384 kuadrat RGBA adalah 1 GB dan tidak boleh disentuh di unified memory 8 GB).

## 8. Pipeline warna (build time)

```
1. adjacency provinsi → collapse by owner → ~195 node
2. kuadratkan graph (jarak ≤ 2)
3. urutan smallest-last (waktu linear)
4. greedy coloring dengan kandidat diurutkan per blok, dua slot direservasi
5. materialisasi: anchor slot OKLCH + nudge ≤12° hue dan ≤0,02 chroma ke identityColor
6. GATE: ΔE2000 ≥ 25 tetangga, ≥ 15 jarak dua, ≥ 18 setelah Machado di linear RGB
```
Runtime tidak menjalankan ulang graph coloring. Saat kepemilikan berubah dan dua tetangga menjadi sewarna, jalankan **repair lokal** pada negara dengan luas lebih kecil, animasikan transisi 400 ms, dan batasi satu sampai dua negara per peristiwa.

## 9. Struktur repositori (rencana)

```
nation-rise/
  docs/planning/            dokumen ini
  tools/                    skrip build data (Node), tidak masuk bundle
    fetch-natural-earth.ts
    dissolve-provinces.ts
    build-sea-zones.ts
    classify-terrain.ts
    select-cities.ts
    build-province-id-map.ts
    build-palette.ts
    validate-content.ts
  content/                  lihat bagian 6
  src/
    sim/                    lapisan 3, murni, tanpa DOM
      engine/{tick,economy,combat,supply,movement,ai,market,events}.ts
      data/                 loader konten tervalidasi
      rng.ts                mulberry32 + stream
      protocol.ts           tipe Command dan Outbound
      worker.ts             entry Worker
    render/                 lapisan 4
      map/{idmap,borders,labels,terrain}.ts
      units/instanced.ts
      camera.ts
    ui/                     lapisan 5, Vue
      panels/…  screens/…  composables/…
      stores/               Pinia, hanya state game dan UI
    persist/                lapisan 6
      save.ts  chronicle.ts
  tests/
    balance/{duel-matrix,anchors,campaign}.spec.ts
    economy/production.spec.ts
    determinism/replay.spec.ts
    colors/gate.spec.ts
```

## 10. Arsitektur pengujian

| Test | Isi | Kecepatan |
|---|---|---|
| `economy/production` | Delapan data point Indonesia direproduksi persis | instan |
| `determinism/replay` | Seed sama dua kali, hash state per 500 tick identik | detik |
| `colors/gate` | ΔE2000 tetangga dan jarak dua, termasuk tiga tipe CVD | detik |
| `balance/duel-matrix` | 31 kali 31 kali 10 terrain kali 3 tier kali 5 seed, anggaran CP disamakan; snapshot dikomit | ~10 detik |
| `balance/anchors` | Duel referensi 12 tick, 18 infanteri minimum, sortie udara rugi minimal 30 persen | instan |
| `balance/campaign` | 100 seed sampai victory atau day 90; median 35 sampai 50 | ~5 menit, nightly |
| `perf/map` | 2.000 provinsi, 300 stack, 195 AI: ms per tick, frame time WKWebView, RSS | manual dan CI |

`anchors.spec.ts` adalah pertahanan utama: ia mengunci rasa game ke angka konkret sehingga setiap perubahan rating yang menggeser duel referensi akan gagal dan memaksa keputusan sadar, bukan drift diam-diam.

## 11. Gerbang keputusan D22

Setelah peta 2.000 provinsi, 300 stack, dan simulasi 195 AI berjalan di Tauri, ukur tiga hal: ms per tick di Worker, frame time di WKWebView pada DPR 2, dan RSS memori. **Bila tick melebihi 500 ms atau frame melebihi 16 ms secara konsisten setelah optimasi wajar**, inti simulasi dipindah ke Rust atau WASM tanpa menyentuh UI. Itulah alasan lapisan 3 wajib murni dan berkomunikasi hanya lewat protokol pesan sejak hari pertama.

Anggaran yang mendasarinya: pada kecepatan Kilat satu tick punya sekitar 3,1 detik nyata, dan estimasi beban adalah 50 sampai 300 ms (supply BFS di bawah 1 ms, A* 10 sampai 100 ms worst case, utility planner 195 negara 5 sampai 30 ms, combat di bawah 5 ms). Headroom lima sampai tiga puluh kali.
