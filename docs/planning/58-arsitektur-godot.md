# Arsitektur Nation Rise v1.0 (Godot)

> Sesi 5 (2026-09-06). Menggantikan `13-architecture.md` yang ditulis untuk stack web. Instruksi "kerjakan" sudah diberikan, sehingga dokumen ini menjadi kontrak implementasi, bukan usulan.
>
> Prinsip yang ditetapkan Billy: **Simulation Core → Data Layer → Renderer → UI**, dan **simulasi tidak boleh bergantung pada rendering**.

## 1. Prinsip yang ditegakkan secara struktural

Aturan "simulasi tidak bergantung rendering" biasanya ditulis sebagai konvensi, lalu perlahan dilanggar. Di sini ia ditegakkan oleh **struktur proyek**, sehingga pelanggaran menjadi kegagalan kompilasi.

**`NationRise.Core` adalah proyek .NET terpisah yang tidak memiliki referensi ke Godot sama sekali.** Menulis `using Godot;` di dalamnya membuat build gagal. Bukan peringatan, bukan catatan ulasan kode — gagal.

Konsekuensi yang membuktikan aturannya bekerja: **seluruh simulasi dapat diuji dengan `dotnet test` tanpa Godot terpasang.** Bila suatu hari pengujian membutuhkan Godot, itu tanda aturannya sudah dilanggar.

---

## 2. Empat lapis dan arah ketergantungan

```
┌─────────────────────────────────────────────┐
│  UI            GDScript, scene Godot        │  ← boleh tahu semua di bawahnya
├─────────────────────────────────────────────┤
│  Renderer      C# + Godot, peta 3D, unit    │  ← membaca snapshot saja
├─────────────────────────────────────────────┤
│  Bridge        C# tipis, adaptor            │  ← satu-satunya yang tahu keduanya
├─────────────────────────────────────────────┤
│  Simulation    C# murni, NOL Godot          │  ← tidak tahu apa pun di atasnya
│  Data Layer    berkas hasil pipeline        │
└─────────────────────────────────────────────┘
```

**Ketergantungan hanya mengalir ke bawah.** Simulation tidak pernah memanggil Renderer, tidak pernah tahu ada layar, dan tidak punya konsep piksel, warna, atau bingkai.

| Lapis | Bahasa | Boleh tahu | Diuji dengan |
|---|---|---|---|
| **Simulation Core** | C# murni | tidak ada di atasnya | `dotnet test`, tanpa Godot |
| **Data Layer** | berkas JSON dan biner | — | validasi skema |
| **Bridge** | C# dengan Godot | Core dan Renderer | uji integrasi |
| **Renderer** | C# dengan Godot | snapshot | visual |
| **UI** | GDScript | semua | manual dan visual |

---

## 3. Struktur repositori

```
NationRise/
├── docs/planning/              59 dokumen perencanaan
├── tools/                      balance-bench.html, perf-probe.mjs
│
├── pipeline/                   Node.js — dijalankan saat build, bukan saat main
│   ├── src/
│   │   ├── 01-fetch.mjs            unduh Natural Earth dan dataset lain
│   │   ├── 02-dissolve.mjs         4.500 provinsi menjadi 3.400
│   │   ├── 03-adjacency.mjs        graf ketetanggaan darat dan laut
│   │   ├── 04-terrain.mjs          point-in-polygon raster medan
│   │   ├── 05-resources.mjs        USGS, GEM, EIA menjadi sumber daya provinsi
│   │   ├── 06-nations.mjs          negara, bendera, ibu kota, doktrin
│   │   ├── 07-disputed.mjs         core_of ganda untuk wilayah sengketa
│   │   └── 08-export.mjs           keluaran biner untuk Core
│   ├── raw/                    unduhan mentah, tidak masuk git
│   └── out/                    hasil, masuk git
│
├── sim/
│   ├── NationRise.Core/        C# MURNI — TIDAK BOLEH mereferensikan Godot
│   │   ├── World/              ProvinceStore, NationStore, WorldState
│   │   ├── Economy/            produksi, moral, bangunan, pasar
│   │   ├── Military/           unit, gerak, pasokan, pertempuran
│   │   ├── Ai/                 arketipe, utilitas, momentum
│   │   ├── Time/               tick, kalender, kecepatan
│   │   ├── Commands/           perintah terketik dari UI
│   │   └── Persistence/        simpanan berversi
│   └── NationRise.Core.Tests/  xUnit
│
└── game/                       proyek Godot
    ├── project.godot
    ├── bridge/                 C# tipis: Core ke Godot dan sebaliknya
    ├── render/                 peta 3D, unit, efek
    ├── ui/                     GDScript, seluruh panel
    ├── themes/                 tema dirancang sekali di awal
    └── assets/
```

**`game/` mereferensikan `sim/`. Tidak pernah sebaliknya.**

---

## 4. Data Layer: bentuk provinsi

Billy menuliskan bentuk konseptualnya:

```
Province
├── owner
├── population
├── resources
├── infrastructure
├── terrain
└── development
```

Secara konseptual benar. Secara implementasi, menyimpan 3.400 objek `Province` menghasilkan pola akses memori yang buruk, karena tiap tick ekonomi hanya membaca dua atau tiga medan dari seluruh provinsi.

**Penyimpanannya berupa struktur array, tetapi antarmukanya tetap berbentuk objek.**

```csharp
public sealed class ProvinceStore
{
    public readonly int Count;

    public readonly ushort[] Owner;          // indeks negara pemilik sah
    public readonly ushort[] Controller;     // yang menguasai; berbeda saat diduduki
    public readonly byte[]   Terrain;
    public readonly float[]  Population;
    public readonly byte[]   ResourceType;
    public readonly ushort[] ResourceAmount;
    public readonly byte[]   Infrastructure;
    public readonly float[]  Development;
    public readonly float[]  Morale;
    public readonly ushort[] CoreOfOffset;   // indeks ke tabel klaim
    public readonly ushort[] CoreOfData;     // klaim ganda, wilayah sengketa

    public ProvinceRef this[int id] => new(this, id);
}

public readonly struct ProvinceRef
{
    private readonly ProvinceStore _s;
    private readonly int _i;

    public ushort Owner        => _s.Owner[_i];
    public float  Population   => _s.Population[_i];
    public Terrain Terrain     => (Terrain)_s.Terrain[_i];
    public ReadOnlySpan<ushort> CoreOf => _s.CoreOfSpan(_i);
}
```

Pemanggilnya menulis `world.Provinces[id].Population` seperti objek biasa, sementara mesin membaca satu array rapat.

**Tidak ada satu pun medan yang berhubungan dengan tampilan.** Tidak ada warna, tidak ada posisi layar, tidak ada mesh. Provinsi tidak tahu ia digambar.

---

## 5. Kontrak antar lapis

Dua arah, keduanya terketik dan eksplisit.

### 5.1 UI ke Simulation: perintah

```csharp
public interface ICommand { }

public readonly record struct QueueBuilding(int ProvinceId, BuildingType Type);
public readonly record struct MoveArmy(int ArmyId, int[] Path);
public readonly record struct SetRelation(int NationA, int NationB, Relation R);
```

UI tidak pernah menyentuh state. Ia mengirim perintah, simulasi memutuskan sah atau tidak.

### 5.2 Simulation ke Renderer: snapshot

```csharp
public sealed class WorldSnapshot
{
    public readonly int Tick;
    public readonly GameDate Date;
    public readonly ReadOnlyMemory<ushort> ProvinceController;
    public readonly ReadOnlyMemory<float>  ProvinceMorale;
    public readonly ReadOnlyMemory<ArmyView> Armies;
}
```

**Snapshot bersifat baca-saja dan dihasilkan pada laju UI, bukan laju simulasi.** Simulasi berjalan pada satu tick per jam game; snapshot dikirim 5 sampai 10 kali per detik. Pada kecepatan 8x itu berarti beberapa tick digabung menjadi satu snapshot, dan renderer tidak perlu tahu.

---

## 6. Determinisme sejak hari pertama

Empat aturan yang lebih murah ditegakkan sekarang daripada diperbaiki nanti.

| Aturan | Alasan |
|---|---|
| **PRNG berseed**, tidak pernah `Random.Shared` | Seed harus bisa mengulang dunia yang sama (D133) |
| **Ekonomi memakai bilangan bulat atau titik tetap** | Titik mengambang menghasilkan hasil berbeda antar arsitektur |
| **Urutan iterasi selalu tetap** | Iterasi kamus tidak berurutan; pakai indeks |
| **Tick murni fungsi dari state dan seed** | Memungkinkan simpanan berupa seed ditambah log perintah |

Konsekuensi praktisnya: **simpanan bisa diverifikasi**. Memuat lalu memutar ulang harus menghasilkan state yang identik bit demi bit.

---

## 7. Bagaimana perubahan grafis tidak menyentuh logika

Ini yang Billy sebut sebagai tujuan utamanya, dan struktur di atas memenuhinya dengan cara berikut.

| Perubahan | Menyentuh |
|---|---|
| Mengganti tekstur peta | `game/render/` saja |
| Menambah efek cuaca | `game/render/` saja |
| Mengganti model unit | `game/assets/` dan `game/render/` |
| Mengubah seluruh gaya visual | `game/render/` dan `game/themes/` |
| Mengganti Godot dengan engine lain | `game/` seluruhnya; **`sim/` tidak tersentuh** |

Baris terakhir adalah ujian sesungguhnya. **Bila engine berganti lagi, Simulation Core ikut pindah tanpa satu baris pun diubah.** Itu bukan janji melainkan konsekuensi dari tidak adanya referensi Godot di sana.

---

## 8. Disiplin yang ditegakkan otomatis

| Aturan | Cara ditegakkan |
|---|---|
| Core tanpa Godot | Berkas proyek tidak mereferensikan GodotSharp; `using Godot;` gagal kompilasi |
| Core teruji tanpa Godot | `dotnet test` berjalan di lingkungan tanpa Godot |
| Tidak ada mutasi state dari UI | State hanya dapat berubah lewat `Execute(ICommand)` |
| Determinisme | Uji putar ulang membandingkan hash state |
| Tema tidak disalin-tempel | Tema didefinisikan sekali sebagai Theme Type Variation |

---

## 9. Yang berbeda dari arsitektur web lama

| Lapisan | Web (dibatalkan) | Godot |
|---|---|---|
| Simulasi | TypeScript di Web Worker | **C# murni**, proyek terpisah |
| Pemisahan | konvensi | **kegagalan kompilasi** |
| Pesan | `postMessage` dengan buffer transferable | pemanggilan langsung ditambah snapshot |
| Wadah entitas | bitecs | **struktur array sendiri** |
| Penyimpanan | IndexedDB dan fflate | **berkas biner berversi** |
| Uji | Vitest | **xUnit** |

Konsep yang tidak berubah: struktur array, snapshot, langkah waktu tetap satu jam game, PRNG berseed, dan pemisahan simulasi dari tampilan.
