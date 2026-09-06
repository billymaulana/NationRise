# Penyajian Peta

## Temuan yang mengubah pendekatan

Peta Conflict of Nations **bukan isian vektor berwarna per provinsi**. Ia citra
satelit, dengan tekstur daratan yang bervariasi, kontur batimetri yang terlihat
di laut, dan garis pantai yang tidak rata. Warna hijau `#476a36` yang terukur di
`03-bahasa-visual.md` adalah rata-rata, bukan warna tunggal.

Ini penting karena pendekatan yang wajar — mewarnai poligon GeoJSON per pemilik
— akan menghasilkan sesuatu yang jelas bukan CoN, betapapun tepat paletnya.
Yang membuat peta CoN terasa "asli" adalah tekstur fotografisnya.

Konsekuensi kedua, dari `03-bahasa-visual.md` §4: wilayah yang belum dimiliki
digelapkan sampai menyatu dengan laut. Jadi kepemilikan **bukan** isian warna di
atas peta kosong, melainkan **penyingkapan**: citra aslinya digelapkan, lalu
provinsi yang dimiliki dikembalikan terangnya dan diberi rona pemilik.

## Susunan lapisan

Dari bawah ke atas:

| # | Lapisan | Isi | Sumber |
|---|---|---|---|
| 1 | Citra dasar | Satelit/relief dunia | Aset publik, lihat §Sumber citra |
| 2 | Batimetri | Gradasi kedalaman laut | `bathymetry.bin` dari pipeline |
| 3 | Tekstur ID provinsi | Satu warna unik per provinsi | Dibangkitkan dari `provinces.geojson` |
| 4 | Rona kepemilikan | Shader: lookup ID → pemilik → warna | Runtime |
| 5 | Garis batas | Batas provinsi tipis, batas negara tebal | Geometri garis |
| 6 | Label | Nama kota, nama negara | Sprite yang stabil di layar |
| 7 | Penanda unit | Konter pasukan | Instanced |

Lapisan 3 dan 4 adalah tekniknya. Alih-alih menggambar ulang ribuan poligon
setiap kali kepemilikan berubah, sebuah tekstur menyimpan ID provinsi sebagai
warna, dan shader menerjemahkannya lewat tabel pencarian kecil yang berisi
pemilik. Ganti kepemilikan berarti mengubah satu texel di tabel pencarian, bukan
membangun ulang geometri.

Tekstur yang sama dipakai untuk **memilih provinsi**: baca satu piksel di posisi
kursor, warnanya adalah ID provinsi. Tidak perlu uji titik-dalam-poligon di CPU
untuk sekitar dua ribu provinsi.

## Kamera 2,5D

W07 mengunci bidang miring, bukan 3D penuh. Alasannya CoN memang begitu:
kamera ortografis-miring di atas satu bidang, bukan bola atau medan.

- Satu `PlaneGeometry` dengan tekstur bertumpuk, dimiringkan pada sumbu X.
- Zoom mengubah jarak kamera; kemiringan berkurang saat menjauh, sehingga pada
  zoom paling luar peta hampir tegak lurus.
- Label dan penanda unit selalu menghadap kamera dan berukuran tetap di layar,
  tidak ikut mengecil oleh perspektif.

Jalur Godot sudah menyelesaikan masalah ini di `../../game/render/` —
`MapCamera.cs`, `NationLabels.cs`, dan `ArmyMarkers.cs` berisi perilaku yang
sudah disetel dan layak dibaca sebagai rujukan perilaku, bukan disalin kodenya.

## Sumber citra

Belum diputuskan (lihat `01-kunci-web.md` §5). Kandidat bebas-lisensi:

| Sumber | Lisensi | Catatan |
|---|---|---|
| NASA Blue Marble Next Generation | Domain publik | Paling dekat dengan tampilan CoN; tersedia sampai 500 m/piksel |
| Natural Earth II with Shaded Relief | Domain publik | Lebih bergaya peta, kurang fotografis |
| GEBCO | Bebas dengan atribusi | Untuk batimetri, melengkapi `bathymetry.bin` |

[BELUM DIVERIFIKASI] Ukuran tekstur yang sanggup ditangani MacBook Air M1 8 GB
tanpa tersendat. Perlu probe sebelum memilih resolusi — jalur Godot punya
preseden di `../../docs/planning/45-perf-probe-result.md` yang perlu dibaca
dulu, lalu diulang untuk WebGL.

Anggaran sementara: satu tekstur dunia terkompresi, dipecah menjadi ubin per
wilayah supaya hanya yang terlihat yang dimuat. Angka pastinya menunggu probe.

## Data yang dipakai

Semua sudah ada, dihasilkan pipeline yang tidak perlu diubah:

| Berkas | Ukuran | Isi |
|---|---|---|
| `provinces.geojson` | 1,3 MB | Geometri provinsi |
| `world.bin` | 96 KB | Ketetanggaan, medan, kota, sumber daya |
| `nations.json` | 20 KB | Negara, bendera, doktrin |
| `bathymetry.bin` | 2,2 MB | Kedalaman laut |

Disalin ke `public/data/` saat build. Pipeline tetap satu-satunya penghasilnya;
jalur ini tidak pernah menulis ke `../../pipeline`.

## Risiko

1. **Citra dasar tidak setara CoN.** Risiko terbesar terhadap janji "percis".
   Bila sumber bebas terbaik pun terlihat jelas berbeda, ini harus dilaporkan,
   bukan ditutupi dengan filter.
2. **Anggaran tekstur di 8 GB RAM.** Perlu probe lebih awal, bukan di akhir.
3. **Ketepatan pemilihan di tepi provinsi.** Tekstur ID pada zoom rendah bisa
   membuat provinsi kecil hilang kurang dari satu piksel. Perlu resolusi minimum
   atau jalur cadangan berbasis geometri untuk provinsi kecil.
