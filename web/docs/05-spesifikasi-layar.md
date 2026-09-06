# Spesifikasi Layar

> Isi tiap layar sudah dibedah di `../../docs/planning/01-research-con-screenshots.md`
> §4.1 dan `../../docs/planning/29-screen-specs.md`. Dokumen ini **tidak
> mengulanginya**. Yang ditambahkan di sini adalah pemecahan ke komponen Vue,
> dan urutan pengerjaannya.

## Prinsip pemecahan

Satu layar CoN memuat sangat banyak elemen. Supaya bisa dikerjakan dan diuji
per bagian, tiap layar dipecah sampai setiap komponen menjawab tiga pertanyaan:
apa tugasnya, bagaimana memakainya, dan pada apa ia bergantung.

Aturan yang dipegang:

- **Komponen bawah tidak tahu tentang simulasi.** Ia menerima props dan
  memancarkan event. Yang membaca store hanya komponen tingkat layar.
- **Tidak ada komponen yang menyentuh `src/sim` langsung** (`02-arsitektur.md`).
- Komponen yang tumbuh melewati sekitar 200 baris hampir selalu sedang
  mengerjakan dua hal. Pecah.

## Pondasi bersama

Dibangun lebih dulu, karena setiap layar memakainya. Bentuk-bentuk ini yang
membuat antarmuka terbaca sebagai CoN, bukan sebagai dasbor web biasa
(`03-bahasa-visual.md` §6).

| Komponen | Tugas |
|---|---|
| `ChromePanel` | Panel gelap bersudut ter-notch, bukan membulat |
| `DiamondBadge` | Belah ketupat untuk ikon status dan node riset |
| `TrapezoidTab` | Tab kategori bersisi miring |
| `SideDrawerTab` | Tab tepi berlabel vertikal dengan chevron ganda |
| `ResourcePill` | Ikon + jumlah + laju `+X /h` |
| `StatRow` | Baris label-nilai dengan zebra halus |
| `CostRow` | Deret ikon biaya dengan angka |
| `ProgressBar` | Bar morale dan HP |
| `QueueSlot` | Slot antrean belah ketupat dengan konektor |

## Urutan layar

Diurutkan supaya tiap tahap menghasilkan sesuatu yang bisa dimainkan atau
dilihat, bukan sekadar bertambah lengkap.

### Tahap 1 — peta bisa dilihat

| Layar | Bergantung pada |
|---|---|
| HUD peta utama | Pondasi, penyaji peta |
| Panel provinsi | Pemilihan provinsi |
| Panel kota | Ekonomi |

HUD utama dikerjakan pertama karena ia yang paling sering dilihat, dan karena
resource bar-nya adalah uji paling ketat untuk pondasi: delapan sel 104 px,
zebra 6% lightness, angka hijau `#91ea39`. Kalau bagian itu meyakinkan
disandingkan dengan aslinya, pondasinya benar.

### Tahap 2 — bisa membangun

| Layar | Bergantung pada |
|---|---|
| Modal konstruksi | Buildings, antrean |
| Modal mobilisasi | Military, antrean |
| Research | ResearchTree, gating hari |

Layar Research adalah yang paling padat di seluruh permainan: kisi hari × unit,
node belah ketupat empat status, panah antar tingkat, garis hari ini, dan panel
kanan. Ia juga paling lengkap referensinya — 672 tangkapan layar di batch
09-05.

### Tahap 3 — bisa berperang

| Layar | Bergantung pada |
|---|---|
| Panel unit / army | Military |
| Perintah unit | Movement, Combat |
| Pratinjau pertempuran | BattleEstimate |

Catatan: K28 di jalur Godot mengunci pratinjau pertempuran sebagai pratinjau
saja. Di jalur web, W01 mengikat pada apa yang sebenarnya dilakukan CoN.
Korpus referensi **tidak memuat** layar pertempuran, jadi bentuknya perlu
diriset dari sumber lain sebelum dikerjakan.

### Tahap 4 — dunia yang hidup

| Layar | Bergantung pada |
|---|---|
| Market | WorldMarket |
| Diplomacy | Relation |
| Newspaper | Victory, kejadian |
| Events | Kejadian |
| Intelligence | Agen |

### Tahap 5 — bingkai

| Layar | Catatan |
|---|---|
| Nation Selection | Referensi ada, tetapi butuh data 195 negara |
| Pengaturan | Tidak ada referensi; dirancang mengikuti bahasa visual |

## Verifikasi tiap layar

Sebuah layar dianggap selesai bila:

1. Disandingkan dengan tangkapan layar rujukannya pada 1440 × 784, perbedaannya
   harus dicari.
2. Nilai spacing unik di DOM dikumpulkan dan diperiksa terhadap grid; hasilnya
   dicatat (W12).
3. Warna diperiksa dengan `getComputedStyle`, bukan dibaca dari kode — utility
   CSS yang tidak ter-generate tidak menimbulkan galat apa pun dan hanya
   terlihat sebagai "kurang bagus".
