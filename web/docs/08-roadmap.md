# Roadmap Jalur Web

> Urutan pengerjaan. Tiap fase menghasilkan sesuatu yang bisa dijalankan dan
> diperiksa, bukan sekadar bertambah lengkap.

## Fase 0 — pondasi terpasang

- Scaffold Vite + Vue 3 + TypeScript.
- UnoCSS dengan `content.pipeline.include` **eksplisit sejak commit pertama**.
  Ini bukan detail konfigurasi: utility yang tidak terpindai tidak menghasilkan
  galat apa pun, build tetap hijau, dan hasilnya hanya terlihat "kurang bagus".
- Token dari `03-bahasa-visual.md` dimasukkan sebagai tema UnoCSS.
- Vitest dengan dua proyek: `sim` di lingkungan `node`, `ui` di `jsdom`.
- Uji pelapisan sudah ada dan merah bila dilanggar.
- Data pipeline disalin ke `public/data/`.

**Selesai bila:** halaman kosong tampil dengan token terpasang, `pnpm test`
hijau, dan uji pelapisan gagal bila `src/sim` diberi impor `vue`.

## Fase 1 — pondasi visual — SELESAI

- Sembilan komponen pondasi di `05-spesifikasi-layar.md`, plus `CornerBrackets`
  yang ditemukan saat membedah referensi.
- Halaman peraga yang menampilkan semuanya berdampingan.
- Angka terukurnya dikunci oleh uji komponen, bukan hanya dinilai mata.

Bentuk tab diperbaiki dua kali setelah disandingkan dengan aslinya: kemiringan
dikurangi dari 8px ke 4px, dan barisnya dipindah ke latar terang. Rinciannya di
`03-bahasa-visual.md` §7.

## Fase 2 — simulasi berjalan

Port menurut urutan di `06-port-simulasi.md`: Determinism, Time, World, Data,
Economy, Buildings, Research, Military, Diplomacy, Victory, Ai, Persistence.
Uji dulu, selalu (W16).

Subsistem yang tidak saling bergantung boleh dikerjakan paralel — Economy dan
Research tidak menyentuh Military.

**Selesai bila:** 323 uji hijau di Vitest dengan nilai harapan identik, di
lingkungan `node` tanpa DOM.

Kemajuan per subsistem ada di `06-port-simulasi.md` §Kemajuan.

## Fase 3 — peta terlihat

- Probe anggaran tekstur di M1 8 GB **lebih dulu**, sebelum memilih resolusi
  citra. Baca `../../docs/planning/45-perf-probe-result.md` sebagai preseden.
- Pilih sumber citra dasar.
- Bidang miring three.js, tekstur ID provinsi, rona kepemilikan lewat shader.
- Pemilihan provinsi dengan pembacaan piksel.
- Label kota dan negara yang stabil di layar.

**Selesai bila:** peta dunia bisa digeser dan di-zoom pada 60 fps di M1,
provinsi bisa diklik, dan wilayah yang dimiliki menyala sementara sisanya
menyatu dengan laut.

## Fase 4 — HUD dan permainan pertama

- HUD peta utama, panel provinsi, panel kota.
- Jembatan Worker hidup: perintah masuk antrean, snapshot keluar.
- Jam permainan bisa dijeda dan dipercepat.

**Selesai bila:** satu skenario Modern bisa dimuat, waktu berjalan, ekonomi
bergerak, dan angka di resource bar cocok dengan yang dihitung simulasi.

## Fase 5 sampai 8 — layar selanjutnya

Mengikuti tahap 2 sampai 5 di `05-spesifikasi-layar.md`: membangun, berperang,
dunia yang hidup, lalu bingkai.

## Yang harus diriset sebelum fasenya tiba

Ditulis di sini supaya tidak ditemukan terlambat:

| Perlu diputuskan | Sebelum fase | Catatan |
|---|---|---|
| Font | 1 | Empat kandidat di `03-bahasa-visual.md` §5, perlu perbandingan visual |
| Sumber citra peta | 3 | Kandidat di `07-render-peta.md`; butuh probe kinerja |
| Nasib Gold | 4 | K26 menghapusnya, W01 menyiratkan ada |
| Bentuk layar pertempuran | 6 | Tidak ada di korpus referensi |
| Data 195 negara untuk Nation Selection | 8 | `nations.json` punya 20 KB; kelengkapannya belum diperiksa |

## Risiko terbesar

1. **Citra dasar tidak setara CoN** (`07-render-peta.md` §Risiko). Ini yang
   paling mungkin membuat janji "percis" gagal, dan paling mahal diperbaiki
   belakangan. Karena itu probe-nya di fase 3, bukan di akhir.
2. **Port simulasi lebih lama dari perkiraan.** 6.148 baris dengan 323 uji.
   Mitigasinya: subsistem independen dikerjakan paralel, dan uji diport lebih
   dulu sehingga kemajuannya terukur, bukan dikira-kira.
3. **Kepadatan layar Research.** Layar paling rumit di permainan. Referensinya
   paling lengkap, jadi risikonya waktu, bukan ketidaktahuan.
