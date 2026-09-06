# Bahasa Visual — Diturunkan dari Piksel

> Seluruh angka di dokumen ini diukur dari tangkapan layar Conflict of Nations
> milik Billy, bukan diperkirakan. Alatnya `../tools/measure.py`. Prosedur
> pengukurannya ada di §7 supaya bisa diulang dan dibantah.
>
> Satuan: **piksel CSS**. Tangkapan layar 2880 × 1568 fisik pada DPR 2, jadi
> kanvas rujukannya **1440 × 784 CSS** (W11).

## 1. Temuan utama

Conflict of Nations memakai **satu hue untuk seluruh chrome-nya**. Sebelas
tingkat abu yang dipakai antarmuka semuanya jatuh di hue 199–214°, saturasi
7–22%. Tidak ada abu netral murni, dan tidak ada hue kedua.

Empat warna saja yang keluar dari rentang itu, dan masing-masing punya satu
tugas: hijau untuk pemasukan, merah untuk biaya dan bahaya, emas untuk
kemenangan, biru terang untuk garis waktu sekarang.

Konsekuensi praktisnya: **menambah hue baru berarti menyimpang.** Kalau sebuah
elemen terasa perlu warna sendiri, hampir selalu jawabannya adalah tingkat
lightness lain dari hue yang sama.

## 2. Skala abu-batu (chrome)

Diukur dari panel HUD, tab samping, baris daftar, dan kolom layar riset.

| Token | Hex | H | S | L | Dipakai di |
|---|---|---|---|---|---|
| `slate-900` | `#25323a` | 203 | 22% | 19% | Header modal riset |
| `slate-850` | `#2c3941` | 203 | 19% | 21% | Panel HUD, tab trapesium aktif |
| `slate-800` | `#334048` | 203 | 17% | 24% | Tab samping INTEL/CITIES |
| `slate-700` | `#40484c` | 200 | 9% | 27% | Baris daftar gelap (modal mobilisasi) |
| `slate-650` | `#43525a` | 201 | 15% | 31% | Kolom hari yang sudah lewat (riset) |
| `slate-600` | `#455259` | 201 | 13% | 31% | Baris riset genap |
| `slate-550` | `#47545c` | 203 | 13% | 32% | Sel resource bar (genap) |
| `slate-500` | `#484f53` | 202 | 7% | 30% | Baris daftar terang (modal) |
| `slate-400` | `#54636a` | 199 | 12% | 37% | Baris riset ganjil |
| `slate-350` | `#57666d` | 199 | 11% | 38% | Sel resource bar (ganjil), kolom hari depan |
| `slate-300` | `#596d7a` | 204 | 16% | 41% | Panel kanan riset |
| `paper` | `#ecedee` | 210 | 6% | 93% | Latar modal terang |
| `ink` | `#ffffff` | — | 0% | 100% | Teks di atas chrome gelap |

Pasangan yang selalu muncul berdampingan, dan bedanya kecil dengan sengaja:

- Sel resource bar berganti-ganti `#47545c` / `#58666c` — beda 6% lightness.
- Baris daftar berganti-ganti `#40484c` / `#484f53` — beda 3% lightness.
- Baris riset berganti-ganti `#455259` / `#54636a` — beda 6% lightness.

Zebra striping di CoN sangat halus. Menaikkan kontrasnya adalah kesalahan yang
langsung terlihat.

## 3. Aksen

| Token | Hex | H | S | L | Tugas |
|---|---|---|---|---|---|
| `income` | `#91ea39` | 90 | 81% | 57% | Angka `+X /h` di resource bar |
| `cost` | `#a33435` | 359 | 52% | 42% | Badge biaya riset |
| `danger` | `#a1565a` | 357 | 30% | 48% | Tombol tutup (X) |
| `victory` | `#a8841f` | 44 | 69% | 39% | Badge laurel kemenangan |
| `action` | `#4b647b` | 209 | 24% | 39% | Tombol aksi HUD |
| `now` | `#4e6781` | 211 | 25% | 41% | Garis hari ini di grid riset |

`income` adalah satu-satunya warna berkesan cerah di seluruh antarmuka.
Saturasi 81% membuatnya melompat; itu disengaja, karena pemasukan adalah angka
yang paling sering dibaca. Tidak ada elemen lain yang boleh sesaturasi itu.

## 4. Palet peta

| Token | Hex | L | Catatan |
|---|---|---|---|
| `sea-deep` | `#2d3841` | 22% | Laut dalam |
| `sea-shelf` | `#5a6068` | 38% | Paparan dangkal, terlihat jelas di sekitar Nusantara |
| `land-own` | `#476a36` | 31% | Wilayah dimiliki, hue 100° |
| `land-neutral` | `#2f3a43` | 22% | Wilayah belum dimiliki |

**`land-neutral` dan `sea-deep` praktis sama gelapnya** (22% vs 22%, hue 207
keduanya). Daratan yang bukan milik siapa-siapa sengaja dibuat menyatu dengan
laut, sehingga satu-satunya hal yang menyala di peta adalah wilayah yang
dimiliki pemain. Ini bukan kebetulan rendering; ini keputusan yang membuat peta
CoN terbaca sekali lihat.

Peta CoN adalah **citra satelit**, bukan isian vektor rata. Hijau `#476a36`
adalah rata-rata, bukan warna tunggal — teksturnya bervariasi. Konsekuensinya
dibahas di `07-render-peta.md`.

## 5. Tipografi

Font asli Conflict of Nations **belum teridentifikasi** dan tidak boleh ditebak
dari bentuk piksel. Yang bisa dipastikan dari tangkapan layar:

- Judul layar (`RESEARCH | EUROPEAN`, `CURRENTLY CONSTRUCTING`) memakai
  **huruf kapital semua** dengan spasi antar huruf longgar.
- Angka resource memakai pemisah ribuan koma (`19,995`), rata kanan terhadap
  ikon.
- Nama kota di peta memakai teks putih dengan garis luar gelap, format
  `Jakarta(6)` — tanpa spasi sebelum kurung.
- Label tab samping (`INTEL`, `CITIES`, `CHAT`) diputar 90°.

Kandidat pengganti bebas-lisensi yang perlu dibandingkan berdampingan sebelum
dipilih: **Roboto Condensed**, **Barlow Semi Condensed**, **Saira Condensed**,
**IBM Plex Sans Condensed**. Keputusan ditunda sampai ada perbandingan visual
(lihat `01-kunci-web.md` §5).

## 6. Geometri

Terukur dari HUD utama:

| Elemen | Nilai |
|---|---|
| Kanvas rujukan | 1440 × 784 CSS |
| Sel resource bar | **104 px** lebar, konsisten di delapan sel |
| Sel pertama (toggle stockpile) | ~140 px, lebih lebar karena memuat panah |
| Panel pemain kiri-atas | 344 px lebar |
| Resource bar | menempel tepi atas, terpusat horizontal |

Bentuk khas yang berulang di seluruh antarmuka, dan wajib ditiru:

- **Belah ketupat** untuk ikon status, node riset, dan slot antrean.
- **Trapesium** untuk tab kategori — sisi miring, bukan persegi.
- **Sudut ter-notch** pada bingkai panel, bukan sudut membulat. Tidak ada
  `border-radius` besar di mana pun.
- **Chevron ganda** (`»`) untuk tab samping yang bisa dibuka.

## 7. Komponen pondasi: angka terukur

Ditambahkan setelah komponen dibangun dan disandingkan dengan aslinya.

### Tab trapesium

| Ukuran | Nilai |
|---|---|
| Tinggi | 28 px |
| Jarak antar tab | 67 px |
| Sisi miring | 4 px per sisi |
| Warna garis tepi | `#c3cdd1` (hue 197, tetap sekeluarga) |

Sisi **melebar ke bawah**, bukan ke atas: tab menyatu dengan daftar isinya yang
berada di bawahnya, bukan dengan header di atasnya.

Yang paling menentukan bukan kemiringannya, melainkan **latar barisnya harus
terang**. Celah miring antar tab memperlihatkan latar modal `#ecedee`. Menaruh
baris tab di atas panel gelap mengubah pemisah tipis menjadi baji hitam, dan
perbedaan itu terlihat seketika meski geometrinya sudah tepat.

### Keadaan belah ketupat

| Keadaan | Hex | Catatan |
|---|---|---|
| `available` | `#6a8c70` | Bisa diriset |
| `locked` | `#a76a79` | Terkunci |
| `unavailable` | `#757575` | **Abu netral murni** |
| `done` | `#596d7a` | Sudah selesai |
| `empty` | transparan | Hanya garis luar |

`unavailable` adalah satu-satunya tempat CoN keluar dari disiplin satu-hue di
§1. Justru netral penuh itulah yang membuatnya terbaca mati; memberinya rona
biru seperti sisa antarmuka akan membuatnya tampak masih aktif.

### Badge biaya

| Keadaan | Hex |
|---|---|
| Tidak terjangkau | `#a33435` |
| Terjangkau | `#758a9b` |

### Warna yang ditemukan belakangan

Diukur saat membangun panel kota dan modal konstruksi, tidak ada di §3 karena
tidak muncul di layar peta:

| Token | Hex | Dipakai di |
|---|---|---|
| `start` | `#60805d` | Tombol Start hijau |
| `morale-penalty` | `#e37969` | Teks penalti morale, salmon |
| `level-badge` | `#738f39` | Lencana tingkat bangunan |

### Zebra modal konstruksi menyimpang dari §2

Baris di modal konstruksi terukur `#3d4b53` dan `#47565d`, bukan `#40484c` dan
`#484f53` yang tercatat di skala abu-batu. Selisihnya tiga sampai lima per
kanal — cukup kecil untuk tidak terlihat berdampingan, tetapi cukup nyata untuk
dicatat. Skala di §2 diukur dari modal mobilisasi; keduanya tampaknya memakai
nilai yang sedikit berbeda, dan belum jelas mana yang kanonis.

### Kurung sudut

Motif yang mudah terlewat: bagian seperti `RESEARCH COSTS` dibingkai hanya oleh
**empat sudutnya**, sisi-sisinya dibiarkan terbuka. Bukan kotak penuh, bukan
garis bawah.

### Jebakan implementasi

`clip-path` dijalankan **setelah** `filter`. Meletakkan keduanya pada elemen
yang sama memotong habis bayangan yang seharusnya menjadi garis tepi, tanpa
galat apa pun — hasilnya hanya terlihat "kurang rapi". Garis tepi pada bentuk
ter-clip harus digambar dengan `filter` di elemen induk dan `clip-path` di
anaknya.

## 8. Cara mengukur ulang

Angka di atas bisa diverifikasi dan dibantah:

```sh
python3 tools/measure.py regions "<gambar>" nama X Y W H [nama X Y W H ...]
python3 tools/measure.py bounds  "<gambar>" '#2c3941' 10
python3 tools/measure.py strip   "<gambar>" row 46 400 2400
```

`regions` melaporkan tiga warna paling sering di sebuah kotak; karena teks
selalu minoritas piksel, warna modus adalah latarnya. `strip` melaporkan deret
perubahan warna sepanjang satu baris, dipakai untuk menemukan tepi panel dan
lebar sel.

Nama berkas tangkapan layar macOS memakai U+202F (spasi sempit tanpa jeda)
sebelum `PM`/`AM`. Selalu kutip path-nya atau pakai glob; mengetik spasi biasa
akan menghasilkan "file not found" yang menyesatkan.

## 9. Aturan yang diambil

1. **Satu hue untuk chrome.** Warna baru diambil dengan menggeser lightness,
   bukan hue.
2. **Zebra striping halus.** Beda 3–6% lightness, tidak lebih.
3. **Satu warna cerah saja.** `income` memegang saturasi tertinggi; elemen lain
   tidak boleh menyainginya.
4. **Sudut tajam.** Belah ketupat, trapesium, notch. Tidak ada sudut membulat.
5. **Ukur, jangan nilai.** Setelah sebuah layar dibangun, kumpulkan nilai
   spacing unik dari DOM dan periksa terhadap grid (W12). Opini "sudah rapi"
   tidak bisa diuji; daftar angka bisa.
