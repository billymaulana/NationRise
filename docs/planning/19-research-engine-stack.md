# Riset Netral: Engine dan Bahasa untuk Nation Rise

> Sumber: riset sesi 4 (2026-09-04) atas masukan Billy: "tolong riset stack game, saya merasa jika typescript mungkin kurang ideal. rekomendasikan yang terbaik." Verifikasi lewat dokumentasi resmi, GitHub releases, Wikipedia, Steam (WebSearch tidak tersedia). Klaim dari ingatan ditandai [UNVERIFIED]; angka RAM dan ms per tick adalah estimasi, bukan pengukuran. Dokumen ini bagian dari `docs/planning/`; indeks di `README.md`.

## 0. Jawaban singkat

Untuk skala yang ditetapkan (2.000 provinsi, 195 AI, tick 1 jam game, 8x = 0.64 tick per detik → **anggaran ~1.560 ms per tick**), **TypeScript bukan hambatan**: estimasi beban simulasi di V8 dengan typed arrays adalah 50 sampai 300 ms per tick (headroom 5 sampai 30×). Kekhawatiran Billy wajar secara umum (TS 2 sampai 5× lebih lambat dari C#, 2 sampai 19× dari Rust), tetapi tidak didukung angka untuk proyek ini. Dua skenario sah: **A** (web TS, arsitektur "siap-Rust") mengoptimalkan kecepatan Billy produktif; **B** (Godot 4.7 + C#) mengoptimalkan kualitas jangka panjang dengan biaya ~3 bulan kurva belajar. Unity, Bevy, dan lainnya tidak direkomendasikan untuk satu orang, hobi, M1 8 GB.

## 1. Tabel ringkas

| Kriteria | A. Vue + three.js + Worker (+ Tauri) | B. Godot 4.7 + C# | C. Godot 4.7 GDScript | D. Tauri v2 + inti Rust + Vue | E. Bevy 0.19 (Rust) | F. Unity 6.3 LTS (C#) |
|---|---|---|---|---|---|---|
| Versi / lisensi | Vue 3.5.42 (3.6 RC Vapor), Vite 8.2, three.js r185, bitECS 0.4.0 MPL-2.0, Tauri 2.11 MIT/Apache, Node 24 LTS | Godot 4.7.2 (18 Agu 2026) MIT; .NET 8+ SDK terpisah | Sama, MIT, tanpa .NET | Tauri 2.11; wasm-bindgen 0.2.118 (rustwasm org disunset Jul 2025, lanjut di org baru) | Bevy 0.19 (Jun 2026) MIT/Apache; bevy_egui 0.42 | Personal gratis < US$200k; Pro US$210/bulan; Runtime Fee dibatalkan 12 Sep 2024 |
| Apple Silicon / macOS | WKWebView; WebGL2 penuh, WebGPU parsial (Safari 26) | Universal 2; backend Metal sejak 4.4 (macOS 13+) | Sama | Seperti A + Rust arm64 | Native arm64 | Editor butuh Ventura 13+, M1+, **Rosetta 2 wajib** |
| RAM runtime [UNVERIFIED] | Kosong 60 sampai 120 MB; game 300 sampai 600 MB | Editor 400 sampai 800 MB; game 300 sampai 600 MB | Sedikit di bawah B | Seperti A + puluhan MB | Game 150 sampai 400 MB; **build cargo + rust-analyzer 3 sampai 6 GB** | Editor 2 sampai 4 GB; player 200 sampai 500 MB |
| Ukuran build [UNVERIFIED] | 5 sampai 15 MB + aset | ~80 sampai 100 MB + runtime .NET | ~80 sampai 100 MB | Seperti A | 30 sampai 60 MB | 60 sampai 150 MB |
| Performa simulasi | V8 JIT baseline; ~2 sampai 5× lebih lambat dari .NET, 1.6 sampai 19× dari Rust (Benchmarks Game) | .NET JIT, GC generasional; 2 sampai 5× lebih cepat dari Node | Interpreter; static typing +40%; perkiraan 5 sampai 20× lebih lambat dari C# [UNVERIFIED] | Rust native atau WASM (WASM ~1.5 sampai 3× lebih lambat dari native) [UNVERIFIED] | Rust native, tanpa GC | .NET/IL2CPP, GC; setara B |
| Rendering peta 2D + unit 3D | InstancedMesh, province ID texture, shader lookup; DPR manual | MultiMeshInstance3D/2D, shader; 2D-in-3D; allow_hidpi default | Sama | Sama seperti A | Instancing otomatis (many_cubes 2.6× lebih cepat di 0.19) | GPU Resident Drawer, URP |
| Produktivitas UI padat | **Tertinggi**: reaktif, CSS grid, virtual scroll, HMR | Sedang: Control/Container/Theme, tanpa reactive binding; fitur 1 hari Vue ≈ 2 sampai 3 hari [UNVERIFIED] | Sama | Sama seperti A | Rendah: bevy_ui/feathers untuk editor; egui immediate-mode | Sedang-tinggi: UXML/USS mirip CSS, UI Builder, data binding |
| i18n bawaan | vue-i18n (matang) | tr(), tr_n(), auto-translate, TranslationServer, live preview 4.5 | Sama | vue-i18n | Manual / crate fluent [UNVERIFIED] | Localization 1.5 |
| Determinisme / save | Double IEEE 754, PRNG seeded, CompressionStream, Tauri fs | Double, PRNG seeded, System.Text.Json + GZipStream | Sama | Rust deterministik, serde + zstd | serde + zstd | Sama dengan B |
| Modding JSON + hot reload | JSON native, zod/ajv, Vite HMR, fs watch | JSON, DirAccess, validasi manual; C# perlu rebuild | GDScript hot-reload | serde_json + jsonschema | Asset hot reload bawaan | Domain reload lambat |
| Tooling | VS Code, Chrome DevTools, Vue DevTools, Vitest | Editor terpadu, debugger, profiler, Rider/VS Code | Sama | Dua toolchain | Tanpa editor; Tracy/puffin | Editor berat, Profiler |
| Kurva belajar dari Vue/TS | 0 minggu bahasa; 2 sampai 4 minggu three.js/Worker/Tauri | C# 2 sampai 3 + paradigma Godot 3 sampai 4 + Control UI 2 sampai 3 ≈ **8 sampai 10 minggu** | 5 sampai 6 minggu | Rust 6 sampai 10 + jembatan 1 sampai 2 minggu | 4 sampai 6 bulan | ~3 bulan |
| Preseden strategi peta | CoN / Supremacy 1914 browser [UNVERIFIED teknologi] | Slay the Spire 2 (UI 2D padat, bukan grand strategy); grand strategy belum terverifikasi | Sama | Tidak ada | Tiny Glade (ECS Bevy + renderer kustom) | Old World, Humankind, Terra Invicta (terverifikasi) |
| Risiko utama | WKWebView terikat OS, disiplin GC, tanpa editor | .NET SDK terpisah, marshalling interop, tanpa web export C# | Batas performa sim | Dua bahasa, dua toolchain | UI belum matang, editor belum rilis, compile di 8 GB | Rosetta 2 + RAM editor, riwayat lisensi |

## 2. Evaluasi per kandidat

### A. Web TypeScript (Vue 3 + Vite + three.js + Web Worker + Tauri v2 / PWA)
- Versi: Vue 3.5.42 (3.6 RC Vapor opt-in), Vite 8.2.2, three.js r185, bitECS 0.4.0, Tauri 2.11 (aplikasi "as little as 600KB" karena webview OS), Node 24 LTS. Prasyarat Tauri: Xcode CLT + Rust toolchain (Billy tetap harus memasang Rust walau tidak menulis Rust).
- macOS: WKWebView terikat versi Safari sistem; WebGL2 penuh, WebGPU parsial → pakai `WebGLRenderer` sebagai jalur utama (sesuai keputusan sementara).
- Performa: Benchmarks Game C# vs Node 2 sampai 5× (fannkuch 9.0 vs 43.8 s; n-body 3.2 vs 8.6 s), memori Node ~2×; Rust vs Node 1.6 sampai 19× (median ~4×), memori 10 sampai 20× lebih kecil. Untuk simulasi berbasis typed arrays gap ke C# biasanya 1.5 sampai 3× [UNVERIFIED]. GC minor di Worker tidak menghentikan render.
- Rendering: province ID render target + lookup texture (satu draw call isi peta), garis batas shader, satelit KTX2 (4096×2048 ≈ 8 sampai 16 MB GPU vs 33 MB mentah [UNVERIFIED]), `InstancedMesh` untuk unit, SDF text untuk label terlihat; `setPixelRatio(min(dpr, 1.5))` sebagai opsi.
- UI: kekuatan absolut (research grid, city list virtual scroll, market, diplomacy table, kartu operasi); vue-i18n.
- Determinisme: PRNG seeded (xoshiro128**/mulberry32), integer/fixed-point untuk ekonomi, tanpa `Math.random`; save via `CompressionStream('gzip')` + Tauri fs.
- Modding: JSON native, zod/ajv, folder `mods/`, HMR.
- Tooling: VS Code, DevTools profiler, Vitest untuk sim deterministik. Tanpa scene editor (nilai kecil untuk game peta data-driven).
- Risiko: uji di Safari/WKWebView sejak awal; kirim diff/ArrayBuffer transferable, bukan JSON per tick; SoA typed arrays.

### B. Godot 4.7 + C# (simulasi dan UI)
- Versi: 4.7 stable 18 Jun 2026, 4.7.2 18 Agu 2026, MIT; build .NET terpisah, minimum .NET 8 sejak 4.4. C#: desktop penuh, mobile eksperimental, **web export tidak tersedia**.
- macOS: Universal 2 export; backend Metal sejak 4.4 ("at least as fast as Vulkan and in many cases much faster on Apple hardware"); syarat editor min RAM 4 GB, rekomendasi 8 GB; export macOS 13+.
- Performa: .NET 8+ JIT (2 sampai 5× dari Node). Peringatan dokumentasi: akses properti objek Godot dari C# = native interop, marshalling "comparatively pricey" → **simulasi harus hidup di struct/array .NET murni**, hasil di-push ke MultiMesh per frame. Threading .NET tersedia; scene tree hanya dari main thread kecuali API thread-safe.
- Rendering: MultiMesh "up to millions of objects in one go"; `MultiMeshInstance2D`; peta sebaiknya satu `ArrayMesh` dengan atribut ID + shader lookup (bukan 2.000 Polygon2D); unit di `MultiMeshInstance3D` dengan kamera ortografis; `allow_hidpi`, `content_scale_factor`.
- UI: Control + Container + Theme + RichTextLabel; 4.6 tema Modern, 4.7 offset transform dan pencarian PopupMenu. Tanpa reactive binding: tabel 195 baris via `Tree`/`ItemList`, virtualisasi ditulis sendiri.
- i18n: `tr()`, `tr_n()`, auto-translate, `TranslationServer`, RTL, pseudolocalization, parser terjemahan C# saat export (4.6). Terkuat di daftar.
- Save: System.Text.Json/MemoryPack + GZipStream ke `user://`. Modding: `JSON`, `FileAccess`, `DirAccess`; validator skema via NuGet [UNVERIFIED]; C# perlu rebuild (bukan hot reload).
- Tooling: editor terpadu, debugger, profiler; Rider (dukungan Godot sejak 2024.2) atau VS Code.
- Kurva: ~8 sampai 10 minggu sampai produktif, ~4 bulan sampai nyaman. Risiko: dua bahasa jika GDScript ikut; GDExtension/godot-rust (gdext, MPL-2.0) opsional.
- Preseden: Slay the Spire 2 (Godot, EA 5 Mar 2026; MegaCrit pindah dari Unity setelah Runtime Fee 2023); showcase resmi tanpa grand strategy peta.

### C. Godot 4.7 GDScript saja
Semua poin engine B berlaku. GDScript interpreter bytecode; static typing >40% lebih cepat di release; JIT/AOT "planned". Perkiraan 5 sampai 20× lebih lambat dari C# di hot loop [UNVERIFIED] → sim Nation Rise 0.5 sampai 3 s per tick worst case [UNVERIFIED], **kemungkinan masih muat** tetapi headroom tipis, "lompat sebulan" berat, threading canggung. Kurva terpendek (5 sampai 6 minggu). Cocok hanya sebagai "GDScript untuk UI, C# untuk sim" (= B).

### D. Tauri v2 + inti simulasi Rust (WASM atau native) + UI Vue/three.js
- Ekosistem: Tauri 2.11; buku rustwasm "no longer maintained", org disunset Jul 2025, tetapi wasm-bindgen aktif (0.2.118).
- Dua arsitektur: (i) native: sim sebagai Tauri command/State, IPC JSON per tick (~1 MB pada 0.64 tick/s, sepele); (ii) **WASM di Web Worker**: state di linear memory, JS membaca `Float64Array` view tanpa serialisasi; portable ke PWA.
- Kekuatan: seluruh keahlian Vue tetap dipakai; determinisme Rust sangat baik (tanpa GC, PRNG eksplisit Xoshiro); serde + jsonschema untuk era pack; bincode/postcard + zstd.
- Kelemahan: dua bahasa, dua toolchain, dua debugger; borrow checker menyakitkan bagi pemula pada graph/entitas (solusi pola indeks/arena = SoA). 6 sampai 10 minggu + 1 sampai 2 minggu jembatan. **Nilai D baru terwujud jika sim TS terbukti terlalu lambat**; tetapi D adalah jalur eskalasi alami dari A tanpa membuang UI, sehingga arsitektur A harus "siap-D" sejak awal.

### E. Bevy 0.19 (Rust, ECS-first)
- 0.19 (19 Jun 2026): `EditableText`, widget Feathers (text input, dropdown, list view, scrollbar), BSN via `bsn!`; **editor belum dirilis**; Feathers ditujukan untuk tooling editor, bukan UI game. UI panel padat realistis hanya via egui (immediate-mode; styling, tema, i18n manual).
- Performa: instancing otomatis, `contiguous_iter` SIMD (~3× bulk), tanpa GC; pipeline province ID map ditulis sendiri di wgpu/WGSL.
- Compile di M1 8 GB: `dynamic_linking` percepatan terbesar; build bersih 3 sampai 8 menit, incremental 5 sampai 20 s, RAM cargo + rust-analyzer 3 sampai 6 GB [UNVERIFIED]; breaking changes tiap rilis minor (>600 PR).
- Kurva 4 sampai 6 bulan. Preseden: Tiny Glade (ECS Bevy + renderer kustom, macOS Mei 2026), Toroban; tidak ada strategi peta.

### F. Unity 6.3 LTS (C#)
- Lisensi: Personal gratis < US$200k; Runtime Fee dibatalkan 12 Sep 2024; splash opsional. Risiko yang tersisa reputasional (perubahan syarat sepihak 2023).
- Versi: 6.3 LTS (dukungan sampai Des 2027); 6000.4.0f1 (18 Mar 2026).
- macOS: editor Ventura 13+, M1+, RAM "minimum 8 GB", **Rosetta 2 wajib** → kandidat terberat untuk mesin 8 GB (editor 2 sampai 4 GB + IDE + browser → swap) [UNVERIFIED angka].
- Sim: .NET/IL2CPP, Burst + Jobs untuk hot loop; GC historis lebih kasar (incremental GC ada) [UNVERIFIED].
- UI: UI Toolkit (UXML + USS mirip CSS, UI Builder, data binding), Localization 1.5. Kurva ~3 bulan; domain reload lambat.
- Preseden terkuat (terverifikasi): Old World (2021), Humankind (2021), Terra Invicta (1.0 Jan 2026), semua tim penuh waktu.

## 3. Kandidat yang tidak direkomendasikan (singkat)
Unreal (C++, editor puluhan GB, 8 GB tidak realistis); MonoGame/FNA 3.8.5.1 (tanpa editor/UI, kalah dari Godot C#); libGDX 1.14.2 (Java; preseden Slay the Spire 1, Mindustry, Unciv, Songs of Syx; bahasa baru tanpa editor; MegaCrit mengeluh Java "frequently broken by OS updates"); Haxe/Heaps (Northgard, Dead Cells; komunitas kecil, dokumentasi tipis); Defold (Lua interpretasi, 3D lemah); Love2D 11.5 (Lua, bukan untuk panel padat + 3D); Python (interpreter paling lambat, distribusi canggung); Swift/SpriteKit (terkunci macOS); Flutter Flame (2D kasual); **AssemblyScript** (TS → WASM tanpa closure, union, iterator, async, JSON, RegExp; "bahasa mirip TS dengan lebih sedikit pustaka daripada Rust": jika perlu WASM, langsung Rust).

## 4. Apakah TypeScript kurang ideal untuk proyek ini?

**Anggaran:** 8x → 1 hari game = 37.5 s = 24 tick → 0.64 tick/detik → **~1.560 ms per tick**. Estimasi beban per tick di V8 dengan typed arrays:
| Beban | Estimasi |
|---|---|
| Supply BFS 2.000 node / ~8.000 edge tiap 6 tick | < 1 ms |
| A* 2.000 node dengan binary heap, ratusan re-path worst case | 10 sampai 100 ms (jauh lebih kecil dengan cache) |
| Utility planner 195 negara × ~300 aksi × ~30 fitur ≈ 1.75 juta evaluasi | 5 sampai 30 ms |
| Combat per tick ratusan front | < 5 ms |
| **Total worst case** | **~50 sampai 300 ms** (headroom 5 sampai 30×; "lompat sebulan" 3 sampai 10 tick/detik) |
Data 2.000 provinsi × 50 field × 8 byte = 800 KB. Paradox menangani belasan ribu provinsi dan puluhan ribu unit dalam C++ single-thread selama bertahun-tahun; skala ini "kecil" untuk CPU modern.

**Di mana TS cukup:** seluruh simulasi (Worker + SoA typed arrays), seluruh UI, i18n, modding JSON, save/load, peta 2D dan ratusan unit instanced di M1.

**Di mana TS kalah dan apakah nyata:** (1) throughput 2 sampai 5× di bawah C#, 2 sampai 19× di bawah Rust: nyata, **tidak relevan** pada headroom 5 sampai 30×; (2) GC dan tanpa value type: nyata, mitigasi standar (typed arrays, pool, snapshot transferable, sim di Worker) mengubahnya jadi disiplin; (3) tanpa scene editor/asset pipeline: nyata untuk game 3D level-based, hampir tidak relevan untuk grand strategy data-driven; (4) webview bukan engine native: WebGL2 penuh cukup, risiko sebenarnya perbedaan Safari vs Chrome; (5) Retina DPR 2: kontrol manual, scene 2D-dominan aman.

**Kesimpulan:** TS menjadi kurang ideal hanya jika ruang lingkup tumbuh 10× (20.000 provinsi, ribuan unit re-path tiap tick pada kecepatan tanpa batas) atau jika belajar bahasa sistem adalah tujuan tersendiri. Untuk spesifikasi saat ini, mengganti bahasa menukar 0 minggu kurva belajar dengan 8 sampai 24 minggu demi headroom yang tidak dibutuhkan.

## 5. Rekomendasi

### Skenario 1: mengoptimalkan kecepatan Billy produktif → **A dengan arsitektur "siap-D"**
Tetap Vue 3 + Vite + three.js WebGLRenderer + Web Worker + Tauri v2, dengan enam keputusan teknis yang tidak boleh ditunda: (1) **sim modul murni tanpa DOM**, state SoA typed arrays (bitECS atau tulisan tangan), berjalan di Worker, protokol pesan eksplisit (`tick`, `command`, `snapshot`, `query`) → dapat diuji Vitest dan **dapat diganti inti Rust/WASM tanpa menyentuh UI**; (2) **determinisme dari hari pertama**: PRNG seeded, integer/fixed-point untuk ekonomi, tanpa `Math.random`, tanpa iterasi objek berurutan tak terjamin; (3) **snapshot diff transferable**, UI `shallowRef`, throttle 5 sampai 10 Hz; (4) rendering province ID render target + lookup, garis batas shader, KTX2, InstancedMesh, SDF text, `setPixelRatio(min(dpr, 1.5))`; (5) **uji di WKWebView sejak minggu pertama**, PWA fallback; (6) era pack JSON dengan zod, folder `mods/`, HMR. Kurva 3 sampai 4 minggu (three.js/Worker/Tauri); UI produktif hari pertama. Risiko: WKWebView, disiplin GC, tanpa preseden grand strategy TS terverifikasi.

### Skenario 2: mengoptimalkan kualitas jangka panjang → **B, Godot 4.7 + C#** (C# untuk sim dan UI; GDScript hanya bila perlu)
Alasan di atas F dan E: MIT tanpa risiko lisensi; editor realistis di 8 GB (min 4 GB vs Unity 8 GB + Rosetta 2); Metal native; Universal 2; i18n bawaan terbaik; C# lompatan terkecil dari TS; sim 2 sampai 5× lebih cepat dengan threading alami; MultiMesh; preseden Slay the Spire 2 untuk UI 2D padat. Diterima: produktivitas UI panel padat turun signifikan; .NET SDK terpisah; tanpa web export C#; belum ada preseden grand strategy Godot terverifikasi.
Rencana (8 sampai 12 jam/minggu): minggu 1 sampai 3 C# dasar + porting sim murni sebagai library .NET dengan unit test (tidak bergantung Godot); minggu 4 sampai 7 paradigma Godot, peta ArrayMesh + shader, MultiMeshInstance3D, kamera ortografis, hiDPI; minggu 8 sampai 11 Control UI + Theme, `tr()`, `Tree`, helper binding; minggu 12+ save/load, mods `user://`, export. Total ~3 bulan sebelum menyamai produktivitas fitur A hari pertama. Risiko terbesar: kehilangan momentum di bulan 1 sampai 2 (proyek hobi).

### Jalur konkret yang disarankan
Mulai **Skenario 1 (A)** sekarang dengan **gerbang keputusan terukur**: setelah peta 2.000 provinsi + 300 stack + sim 195 AI berjalan di Tauri, ukur (a) ms per tick di Worker, (b) frame time di WKWebView pada DPR 2, (c) RSS memori. Jika (a) > 500 ms atau (b) > 16 ms konsisten setelah optimasi wajar → eskalasi ke **D** (inti Rust/WASM) tanpa membuang UI. Pindah ke **B** hanya jika Billy *ingin* engine dengan editor dan siap membayar 3 bulan, bukan karena performa. Hindari E dan F untuk konteks satu orang, hobi, M1 8 GB.

## 6. Tidak terverifikasi
Semua angka RAM runtime dan ukuran build; rasio GDScript vs C# (5 sampai 20×) dan WASM vs native (1.5 sampai 3×); estimasi ms per tick; tanggal rilis Godot 4.5/4.6; tahun rilis three.js r185, Tauri 2.11.5, Vue 3.6 RC, Vite 8.x (disimpulkan 2026); Age of History libGDX; Rebel Inc. dan Realpolitiks Unity; CoN/Supremacy 1914 HTML5; Balatro LÖVE; validator JSON Schema .NET; crate fluent; batching 2D Godot 4; GC incremental Unity; File System Access API di WKWebView. Halaman gagal: docs C# platforms Godot, GDExtension stable, Wikipedia Bevy/Age of History/Realpolitiks/CoN, Steam Slay the Spire 2, npm bitecs, Safari 26 release notes, Benchmarks Game C# vs Rust.

## Sumber
Vue https://github.com/vuejs/core/releases · Vite https://github.com/vitejs/vite/releases · three.js https://threejs.org/ · bitECS https://github.com/NateTheGreatt/bitECS · Tauri https://v2.tauri.app/ , /start/prerequisites/ , /reference/webview-versions/ · caniuse WebGPU https://caniuse.com/webgpu · Node https://nodejs.org/en/about/previous-releases · Benchmarks Game node-csharpcore dan node-rust · Godot https://godotengine.org/blog/ , /download/macos/ , /releases/4.4/ , /releases/4.7/ , /releases/4.3/ , /showcase/ ; docs c_sharp/index, c_sharp_basics, performance/using_multimesh, classes/class_multimeshinstance2d, performance/using_multiple_threads, rendering/multiple_resolutions, ui/index, i18n/internationalizing_games, export/exporting_for_macos, about/system_requirements, gdscript/static_typing · godot-benchmarks https://github.com/godotengine/godot-benchmarks · godot-rust https://github.com/godot-rust/gdext · Wikipedia Godot, Slay_the_Spire_2, Unity, Old_World, Humankind, Terra_Invicta, Tiny_Glade · Bevy https://bevy.org/news/ , /news/bevy-0-19/ , /learn/quick-start/getting-started/setup/ · bevy_egui https://github.com/vladbat00/bevy_egui · wasm-bindgen https://github.com/wasm-bindgen/wasm-bindgen · rustwasm book https://rustwasm.github.io/docs/book/ · Unity https://unity.com/pricing , /blog/unity-is-canceling-the-runtime-fee , /releases/unity-6 , docs system-requirements 6000.4, Manual/UIElements, Localization 1.5 · MonoGame https://monogame.net/ · libGDX https://libgdx.com/showcase/ · Songs of Syx Steam 1162750 · Heaps https://heaps.io/ · Defold https://defold.com/ · Love2D https://github.com/love2d/love/releases · AssemblyScript https://www.assemblyscript.org/status.html
