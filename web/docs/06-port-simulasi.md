# Port Simulasi C# ke TypeScript

> Sumber: `../../sim/NationRise.Core` — 6.148 baris di 53 berkas, dengan
> 6.431 baris uji di 37 berkas. **323 uji, semuanya hijau** per 2026-09-06.

## Kenapa port, bukan pakai ulang

Tiga pilihan dipertimbangkan. Yang dipilih adalah menulis ulang.

**Kompilasi C# ke WASM** menambah runtime .NET 2–8 MB, memaksa marshalling
lintas batas tiap tick, dan menyerahkan manajemen memori ke GC yang tidak bisa
diatur dari luar. Di target MacBook Air M1 8 GB (K14) itu melawan tujuan.

**Menjalankan simulasi C# sebagai proses terpisah** yang diajak bicara lewat
localhost melanggar semangat K02 — luring penuh, tanpa server — dan menambah
satu proses yang harus dikelola siklus hidupnya.

**Port ke TypeScript** memang menulis ulang 6.148 baris, tetapi biayanya jauh
lebih rendah dari kelihatannya: implementasi C#-nya ada baris per baris sebagai
rujukan, formulanya sudah terdokumentasi, dan **323 uji itu adalah spesifikasi
yang bisa dieksekusi**. Yang diport bukan hanya kode, tetapi juga alat untuk
membuktikan portnya benar.

Riset Billy sendiri di `../../docs/planning/19-research-engine-stack.md` §4
sudah menghitung beban terburuk TypeScript: sekitar 50–300 ms per tick untuk
supply BFS, A*, utility planner 195 negara, dan resolusi tempur — dengan
headroom 5–30×. Cukup, dan itu sebelum dipindah ke Worker.

## Urutan port

Diurutkan menurut ketergantungan: yang tidak bergantung pada apa pun lebih
dulu, sehingga setiap tahap bisa diuji sebelum tahap berikutnya dimulai.

| # | Subsistem | Berkas | Baris | Bergantung pada |
|---|---|---|---|---|
| 1 | `Determinism` | 1 | 71 | — |
| 2 | `Time` | 3 | 92 | — |
| 3 | `World` | 7 | 382 | Determinism |
| 4 | `Data` | 1 | 142 | World |
| 5 | `Economy` | 11 | 1.368 | World, Time |
| 6 | `Buildings` | 3 | 268 | Economy |
| 7 | `Research` | 2 | 239 | Economy, Time |
| 8 | `Military` | 17 | 2.475 | World, Economy, Determinism |
| 9 | `Diplomacy` | 1 | 76 | World |
| 10 | `Victory` | 1 | 222 | World, Military |
| 11 | `Ai` | 5 | 527 | semuanya |
| 12 | `Persistence` | 1 | 286 | semuanya |

`Military` adalah yang terbesar dan paling berisiko: 17 berkas, termasuk
`Pathfinder`, `Combat`, `SupplySystem`, dan `WarSystem`. Ia diport paling akhir
di antara subsistem inti karena paling banyak bergantung pada yang lain.

## Metode: uji dulu (W16)

Untuk setiap subsistem, urutannya tetap:

1. **Port berkas ujinya lebih dulu** dari `NationRise.Core.Tests` ke Vitest.
   Nilai harapannya disalin apa adanya — angka di uji C# adalah kebenaran yang
   sudah diverifikasi, bukan sesuatu yang boleh disesuaikan supaya lulus.
2. **Jalankan, pastikan merah.** Uji yang hijau sebelum implementasinya ada
   berarti ujinya tidak menguji apa pun.
3. **Port implementasinya** sampai hijau.
4. **Jangan mengubah angka harapan.** Bila hasil TypeScript berbeda dari C#,
   yang salah adalah portnya, bukan ujinya. Selisih pembulatan adalah gejala
   pelanggaran aturan bilangan bulat di `02-arsitektur.md`.

Kontrak ini yang membuat port bisa dipercaya. Tanpa uji yang diport,
"kelihatannya jalan" adalah satu-satunya jaminan yang tersedia.

## Perangkap penerjemahan bahasa

Hal-hal yang berbeda antara C# dan TypeScript dan bisa merusak determinisme
tanpa menimbulkan galat:

| C# | TypeScript | Risiko |
|---|---|---|
| `int` (32-bit, overflow membungkus) | `number` (double 53-bit) | Overflow yang disengaja tidak terjadi; luapan diam-diam jadi nilai besar |
| `int / int` → pembagian bulat | `/` → pecahan | **Perangkap paling sering.** Setiap pembagian bulat wajib jadi `Math.floor` atau `Math.trunc` eksplisit — keduanya berbeda untuk nilai negatif |
| `decimal` | tidak ada | Pakai bilangan bulat berskala (mis. per seperseribu) |
| `Dictionary` urutan tak terjamin | `Map` urut sisip | Jangan andalkan keduanya; pakai array terurut |
| `struct` disalin nilai | objek disalin rujukan | Mutasi tak sengaja merambat; bekukan atau salin eksplisit |
| `List<T>.Sort` stabil sejak .NET 5 | `Array.sort` stabil sejak ES2019 | Aman, tetapi pembanding harus total — jangan pernah kembalikan 0 untuk elemen berbeda |
| `MathF.Round` / `Math.Round` membulatkan setengah **ke genap** | `Math.round` membulatkan setengah **menjauhi nol** | 2,5 menjadi 2 di C# dan 3 di JavaScript. Pakai `roundHalfToEven` dari `src/sim/determinism/rounding.ts` |

Pembulatan titik tengah adalah perangkap yang paling sunyi. `MathF.Round(2.5)`
mengembalikan `2` di .NET, sedangkan `Math.round(2.5)` mengembalikan `3`.
Selisih satu unit per pembulatan cukup memisahkan dua simulasi yang seharusnya
identik, dan tidak ada galat apa pun yang menandainya. Perilaku .NET-nya sudah
diverifikasi dengan menjalankannya, bukan disimpulkan dari dokumentasi:

```
MathF.Round(2.5) = 2      MathF.Round(0.5)  = 0
MathF.Round(3.5) = 4      MathF.Round(1.5)  = 2
MathF.Round(2.6) = 3      MathF.Round(-2.5) = -2
```

Setiap pembulatan di port wajib lewat `roundHalfToEven`, dan setiap pembagian
bilangan bulat lewat `intDiv`; keduanya ada di
`src/sim/determinism/rounding.ts`.

`Math.trunc` versus `Math.floor` layak disebut dua kali. C# membulatkan
pembagian bilangan bulat ke arah nol; `Math.floor` membulatkan ke bawah.
Untuk nilai negatif keduanya berbeda satu. Setiap tempat yang bisa negatif —
selisih neraca, modifikator tempur — harus memakai `Math.trunc`.

## Uji pelapisan

Jalur C# memaksa batasnya lewat berkas proyek dan `LayeringTests`. Padanannya
di sini:

- Uji yang memindai `src/sim/**` untuk impor terlarang (`vue`, `three`,
  `pinia`, apa pun yang menyentuh DOM).
- Uji yang memindai tipe di `src/sim/**` untuk properti bertampilan.
- Konfigurasi Vitest yang menjalankan rangkaian uji simulasi di lingkungan
  `node`, bukan `jsdom`, sehingga `document` memang tidak ada.

## Kemajuan

| Subsistem | Status | Uji |
|---|---|---|
| Determinism | Selesai, bit-exact dengan C# | 7 |
| Pembulatan bersama | Selesai, diverifikasi terhadap .NET | 10 |
| Time | Selesai | 19 |
| World (struktur inti) | Selesai | 13 |
| Data (`WorldFile`) | Selesai, byte-compatible pada `world.bin` sungguhan | 11 |
| Economy (`Resource`) | Selesai | 10 |
| World (`ProvinceQuery`) | Selesai | 9 |
| Sisanya | Belum | — |
| **Jumlah** | | **79** dari 323 |

Uji `Data` menjalankan pembacanya terhadap `world.bin` sungguhan dan memeriksa
angka yang sudah dikunci riset peta: 54 provinsi Indonesia, 12 kota, poin
kemenangan 90 sampai 105, tepat satu kota teknologi, dan sedikitnya sepuluh
provinsi sengketa. Itu bukti kuat bahwa pembaca biner TypeScript menghasilkan
struktur yang sama persis dengan pembaca C#, bukan sekadar bisa mengurai.

### Perbedaan sengaja dari versi C#

`WorldFile.Read` di C# menerima `Stream`. Port-nya menerima `ArrayBuffer`, dan
I/O ditinggalkan ke pemanggil, karena simulasi harus berjalan di Worker
peramban tempat berkas tidak ada. Uji pelapisan sekarang menolak modul bawaan
node di `src/sim` supaya batas itu tidak bisa dilanggar diam-diam.

Larik dibaca elemen per elemen lewat `DataView`, bukan dengan membuat pandangan
typed array di atas buffer. Offset di dalam berkas tidak dijamin selaras: blok
tag panjangnya tiga bita per negara, sehingga larik sesudahnya bisa mulai di
alamat ganjil, dan `new Uint16Array(buffer, offset)` melempar untuk offset yang
bukan kelipatan dua.

## Verifikasi selesai

Port dianggap selesai bila jumlah uji yang hijau di Vitest **sama dengan 323**,
dengan nilai harapan yang identik, dan rangkaian uji simulasi lolos di
lingkungan `node` tanpa DOM.
