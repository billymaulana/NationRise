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

## Temuan dari implementasi

Ditulis setelah lapisan id, pewarnaan, dan pemilihan berdiri.

### Setiap provinsi dijamin satu piksel

Pada 4096 x 2048, **75 dari 2.017 provinsi hilang sama sekali**: mereka lebih
kecil dari satu piksel dan tidak menutup satu pun pusat piksel, sehingga
pengisian scanline melewatinya. Monaco, San Marino, Liechtenstein, Sint Maarten,
Kepulauan Paracel.

Menaikkan resolusi tidak menyelesaikannya, hanya menggeser ambangnya, sambil
melipatempatkan anggaran memori yang justru ketat di mesin target. Jadi setiap
provinsi yang hilang dicap satu piksel di titik wakilnya.

Pencapan buta ternyata belum cukup: sembilan mikronegara **berbagi piksel yang
sama** dan saling menghapus. St. Martin dan Sint Maarten duduk di satu pulau.
Pencapan sekarang mencari melingkar keluar sampai radius empat, dan hanya boleh
merebut piksel yang penghuninya masih punya piksel lain. Skripnya keluar dengan
galat kalau ada provinsi yang tetap tidak terwakili, sehingga kegagalan itu
tidak bisa lolos diam-diam.

### Batas digambar dari tekstur id, bukan sebagai geometri

Dua ribu provinsi berarti dua ribu jalur garis yang harus dibangun ulang setiap
kali kepemilikan berubah. Membandingkan id tetangga di shader memberi hasil yang
sama tanpa geometri sama sekali: kalau id di sebelah berbeda, piksel itu batas
provinsi; kalau warna pemiliknya juga berbeda, ia batas negara dan digambar
lebih tebal.

### Kebangsaan adalah rona, bukan isian

Versi pertama mengisi tiap provinsi dengan warna negaranya pada kekuatan 0,38.
Hasilnya terbaca sebagai diagram politik, persis yang sudah diperingatkan jalur
Godot: *peta politik yang setiap provinsinya pastel sembarang terbaca sebagai
diagram*. Sekarang ronanya 0,14 di atas warna medan, dan kepemilikan terutama
dibaca dari batasnya.

### Dua jebakan yang gagal dalam diam

**Penanda daratan disimpan sebagai byte 1.** Shader membaca kanal sebagai float
ternormalisasi, sehingga 1 menjadi 0,0039 dan setiap uji ambang menganggapnya
laut. Seluruh dunia terbaca sebagai samudra, tanpa satu pun galat. Nilainya
sekarang 255.

**Konversi ruang warna harus dimatikan eksplisit.** Piksel di tekstur id adalah
bilangan, bukan warna. Kalau peramban memetakannya sebagai sRGB, id-nya rusak
dan setiap pemilihan menunjuk tempat yang salah. `createImageBitmap` dipanggil
dengan `colorSpaceConversion: 'none'`, dan teksturnya diberi `NoColorSpace`
serta penyaringan `NearestFilter` — interpolasi apa pun akan mencampur dua id
menjadi id ketiga yang tidak ada.

### Satu loop frame, bukan dua

Label kota awalnya ditempatkan lewat rantai `requestAnimationFrame` sendiri,
terpisah dari loop yang menggambar peta. Rantai itu berhenti diam-diam setelah
frame pertama, dan bentuk kegagalannya sulit dikenali: **canvas menahan frame
terakhirnya**, sehingga peta tetap terlihat benar meski loopnya sudah mati.
Tidak ada galat, tidak ada layar kosong — hanya sebagian antarmuka yang berhenti
diperbarui, dan setiap pengukuran membaca angka yang membeku alih-alih angka
yang salah.

Sekarang `MapView` memanggil satu callback `onFrame` per frame yang digambar,
dan lapisan di atasnya menumpang di situ. Satu loop berarti tidak ada rantai
yang bisa berhenti sendirian.

### Pusat provinsi dihitung saat build

Versi pertama menghitungnya di peramban dengan menyapu delapan juta piksel di
utas utama. Antarmukanya membeku beberapa detik sebelum peta muncul, cukup lama
untuk membuat pendengar peristiwa terpasang setelah pemain sempat mencoba
berinteraksi. Datanya statis, jadi tempatnya di build: keluarannya 32 KB JSON.

### Anggaran

| | |
|---|---|
| Tekstur id | 4096 x 2048, **183 KB** sebagai PNG |
| Salinan CPU untuk pemilihan | 8,4 juta entri Uint16, 16,8 MB |
| Tabel pencarian | 2048 x 2 RGBA, 16 KB |
| Pusat provinsi | 32 KB JSON, dihitung saat build |

PNG-nya kecil karena isinya bidang datar. Salinan CPU dipakai untuk pemilihan
supaya tidak perlu menarik piksel kembali dari GPU; pembacaan balik memaksa
sinkronisasi dan menahan frame berikutnya.

## Risiko

1. **Citra dasar tidak setara CoN.** Risiko terbesar terhadap janji "percis".
   Bila sumber bebas terbaik pun terlihat jelas berbeda, ini harus dilaporkan,
   bukan ditutupi dengan filter.
2. **Anggaran tekstur di 8 GB RAM.** Perlu probe lebih awal, bukan di akhir.
3. ~~**Ketepatan pemilihan di tepi provinsi.**~~ **Terjawab.** Setiap provinsi
   dijamin punya sedikitnya satu piksel; lihat bagian temuan di atas. Yang
   tersisa adalah soal kegunaan, bukan kebenaran: Monaco satu piksel tetap sulit
   diklik pada zoom luar.
