# Arsitektur Jalur Web

> Menggantikan `../../docs/planning/58-arsitektur-godot.md` **hanya untuk jalur
> ini**. Dokumen itu tetap berlaku untuk `../../game`.

## Batas lapisan

Ketergantungan hanya mengalir ke bawah, sama disiplinnya dengan jalur Godot:

```
UI (Vue SFC + Pinia)
  ↓
Penyaji (three.js, canvas 2D)
  ↓
Jembatan (Comlink di atas Web Worker)
  ↓
Inti simulasi (TypeScript murni)
```

Aturan yang dipaksakan, bukan diimbau:

- **`src/sim/**` tidak boleh mengimpor apa pun dari Vue, three.js, atau DOM.**
  Diuji oleh berkas uji pelapisan, sama seperti `LayeringTests` di jalur C#.
- **Uji simulasi harus lolos di Node murni**, tanpa jsdom dan tanpa peramban.
  Bila suatu uji butuh DOM, lapisannya sudah bocor.
- **`src/ui/**` tidak boleh mengimpor `src/sim/**` secara langsung.** Semua
  lewat jembatan, supaya simulasi bisa dipindah ke Worker tanpa mengubah UI.
- Tipe di `src/sim` tidak boleh punya properti bertampilan (`color`, `mesh`,
  `texture`, `sprite`). Ada uji yang memindainya.

## Kenapa Worker

Simulasi CoN berjalan real-time dan bisa dipercepat (K09). Pada kecepatan
tinggi satu tick bisa memakan puluhan milidetik; menjalankannya di utas utama
membuat peta tersendat saat digeser.

Worker memberi dua hal sekaligus: peta tetap 60 fps saat simulasi sibuk, dan
batas lapisan jadi fisik, bukan sekadar konvensi. Kode yang tidak bisa
mengakses DOM tidak akan menyentuh DOM.

Biayanya: semua yang menyeberang harus bisa diserialkan. Ini justru selaras
dengan determinisme — state yang bisa diserialkan adalah state yang bisa
disimpan dan diputar ulang.

## Aliran data

```
pipeline/out/game/*          (dibaca saat build, disalin ke public/data)
        │
        ▼
  Worker: muat → bangun WorldState → tick(seed, dt) → Snapshot
        │
        │  postMessage: Snapshot (struktur datar, transferable)
        ▼
  Utas utama: Pinia store → komponen Vue + three.js
        │
        │  postMessage: Command (bergerak, membangun, meneliti)
        ▼
  Worker: antre perintah, terapkan di batas tick berikutnya
```

Perintah **tidak pernah** diterapkan di tengah tick. Ia diantrekan dan diproses
di awal tick berikutnya, sehingga satu tick tetap fungsi murni dari state dan
seed.

## Determinisme

Aturan jalur Godot diwarisi utuh, dengan penyesuaian bahasa:

- PRNG selalu `DeterministicRandom` berseed. **Dilarang `Math.random()`.**
- Ekonomi memakai bilangan bulat atau titik tetap. `number` di JavaScript
  adalah double IEEE 754; selama nilainya bilangan bulat di bawah 2^53,
  aritmetikanya persis. Pembagian selalu eksplisit dibulatkan.
- Urutan iterasi harus tetap. **Dilarang mengiterasi `Object.keys` atau `Set`
  untuk logika**; pakai array terurut. `Map` di JavaScript mempertahankan
  urutan sisip, tetapi urutan sisip bukan urutan yang stabil lintas muat-ulang
  — jadi tetap pakai array.
- Satu tick adalah fungsi murni dari state dan seed.

## Struktur direktori

```
web/
  src/
    sim/            TypeScript murni, tanpa DOM
      world/        WorldState, ProvinceStore, NationStore, Snapshot
      economy/      Stockpile, Production, Upkeep, Market, Morale
      military/     Combat, Movement, Pathfinder, Supply, War
      research/     ResearchTree, ResearchQueue
      buildings/    BuildingType, CityBuildings
      ai/           NationBrain, WarPlanner
      time/         GameClock, GameDate, GameSpeed
      determinism/  DeterministicRandom
      persistence/  SaveFile
    bridge/         Comlink, definisi Command dan Snapshot
    render/         three.js: peta, penanda, label
    ui/             komponen Vue, store Pinia
    styles/         token UnoCSS
  public/data/      salinan keluaran pipeline
  tools/            alat ukur referensi
  docs/             dokumen ini
```

## Ketergantungan

Sengaja sedikit. Setiap tambahan harus dibenarkan tertulis.

| Paket | Untuk apa | Kenapa bukan buatan sendiri |
|---|---|---|
| `vue` | Antarmuka reaktif | Stack harian Billy |
| `vite` | Build dan HMR | Standar Vue |
| `three` | Peta 2,5D | Menulis WebGL sendiri tidak sepadan |
| `pinia` | State antarmuka | Store bersama antar layar |
| `unocss` | Gaya | Utility atomik, token terpusat |
| `comlink` | RPC ke Worker | `postMessage` mentah cepat jadi berantakan |
| `vitest` | Uji | Berbagi konfigurasi dengan Vite |

Tidak dipakai: pustaka peta (Leaflet, Mapbox) — semuanya berorientasi ubin
geografis dan slippy map, sementara peta CoN adalah bidang miring tunggal
dengan pemilihan per-provinsi. Menyesuaikannya lebih mahal daripada menulis
langsung di three.js.
