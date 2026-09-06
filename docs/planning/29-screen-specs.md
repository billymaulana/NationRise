# Spesifikasi Layar Nation Rise

> Ditulis sesi 5 (2026-09-05). Wireframe teks untuk tujuh belas layar, diturunkan dari analisis 80 screenshot Conflict of Nations (`01-`), keputusan kontrol berlapis (D20), dan glosarium Indonesia (`20-`). Setiap layar menyebut: layout, data yang ditampilkan, aksi yang tersedia, dan sumber datanya dari snapshot. Dipakai mulai fase 2.

## Prinsip lintas layar
1. **Terbaca dalam dua detik.** Setiap layar punya satu angka utama yang paling besar. Sisanya mendukung.
2. **Peta adalah layar utama.** Semua panel adalah overlay atau bottom sheet, bukan layar penuh, kecuali Setup, Chronicle, dan Codex.
3. **Tidak ada angka tanpa satuan dan tanpa tren.** Setiap nilai numerik menampilkan perubahan per hari atau panah arah.
4. **Setiap aksi menampilkan biaya dan durasi sebelum dikonfirmasi**, termasuk fee pasar dan penalti morale.
5. **Setiap kegagalan menjelaskan sebabnya.** Tombol yang tidak bisa ditekan menampilkan prasyarat yang kurang, bukan sekadar abu-abu.
6. Semua teks lewat vue-i18n, default Indonesia. Nama tempat English kecuali wilayah Indonesia (D30).

---

## 1. Setup Scenario
Layar penuh, empat langkah horizontal dengan indikator progres.

```
LANGKAH 1  Scenario          LANGKAH 2  Negara         LANGKAH 3  Aturan      LANGKAH 4  Mulai
┌────────────────────────────────────────────────────────────────────────────────┐
│  [Modern 2026]  [Perang Dunia 1]  [Perang Dunia 2]  [Custom]                   │
│                                                                                 │
│  Modern 2026                                                                    │
│  Dunia hari ini. 195 negara, 2.000 provinsi, tujuh sumber daya.                │
│  Kampanye 30 sampai 60 hari game. Riset tanpa tekanan historis.                │
└────────────────────────────────────────────────────────────────────────────────┘
```
**Langkah 2** menampilkan thumbnail peta dunia berwarna di kiri dan daftar negara scrollable di kanan dengan bendera, nama, VP awal, dan **label kesulitan** (Mudah, Normal, Sulit, Sangat Sulit). Memilih negara memunculkan panel bawah berisi deskripsi dua sampai tiga kalimat, doktrin, kekuatan, kelemahan, dan saran strategi (dari `nations.json`). Tombol **Negara Acak** dan **Kampanye Pertama: Indonesia** (preset onboarding, D32).

**Langkah 3 Aturan** memuat: tangga kecepatan awal (Ambient, Santai, Normal, Cepat, Kilat), tingkat kesulitan empat preset, **Historical AI** menyala default (D27), **Legends** mati default, nuklir menyala, toggle dunia (revolts, pembentukan aliansi, penaklukan ibu kota sama dengan aneksasi), dan seed yang bisa diisi manual. **Tidak ada pertanyaan gaya kontrol di sini** (`26-`): itu pilihan di bawah ketidaktahuan, jadi dipilihkan Panglima dan bisa diganti kapan saja di HUD.

**Langkah 4** menampilkan ringkasan dan disclaimer utama (`28-`), lalu tombol Mulai.

---

## 2. Peta dan HUD
Layar utama. Peta memenuhi seluruh viewport; semua elemen lain adalah overlay.

```
┌─ KIRI ATAS ────────────────┐        ┌─ ATAS TENGAH: RESOURCE BAR ──────────────────┐
│ [bendera] BILLY            │        │ Suplai 19.995 +68/j │ Komponen 15.031 +91/j │
│ INDONESIA        [i] [⌂]   │        │ Bahan Bakar 7.556 +41/j │ Elektronik 3.645  │
│ HARI 12 · 13 Mar 2026      │        │ Material Langka 5.463 │ Personel 7.518      │
│ ██████░░░░ 412 / 911 PK    │        │ Dana 74.643 +384/j                          │
│ [koran³][riset][diplo²]    │        │ ▼ Stockpile   [BUKA PASAR]                  │
│ [koalisi][peringatan⁶]     │        └──────────────────────────────────────────────┘
└────────────────────────────┘
                                                          ┌─ KANAN: TAB VERTIKAL ─┐
┌─ KIRI: TAB VERTIKAL ─┐                                  │ KOTA                  │
│ INTEL │ OBROLAN      │          [ P E T A ]             │ FRONT                 │
└──────────────────────┘                                  │ OPERASI               │
                                                          └───────────────────────┘
┌─ BAWAH TENGAH: KONTROL WAKTU ───────────┐      ┌─ KANAN BAWAH ──────────┐
│ [⏸] [1x] [2x] [4x] [8x]  Normal 5 mnt/hr│      │ [minimap]              │
│ [→ Event berikutnya] [→ Hari berikutnya]│      │ [⛶][+][−] [layer][⚙]  │
└─────────────────────────────────────────┘      └────────────────────────┘
```
**Resource bar** menampilkan stok, laju per jam (produksi dikurangi konsumsi dibagi 24), dan warna merah bila stok akan habis dalam tiga hari. Hover memunculkan tooltip empat baris: Stok, Produksi per Hari, Konsumsi per Hari dengan rincian unit dan agen, Total.

**Bar Poin Kemenangan** adalah angka terbesar kedua setelah peta, dengan tooltip yang menampilkan ambang solo dan koalisi serta kenaikan ambang seiring hari.

**Toolbar layer** kanan bawah: sound, map mode, terrain, unit 3D, unit udara, kepemilikan, unit darat, jalur gerak, supply, morale, front, dan **Tekanan Dunia** setelah hegemoni.

**Toggle Gaya Komando** ada di HUD sebagai satu tombol tiga nilai: Panglima, Komandan Lapangan, Delegasi Penuh. Berlaku instan tanpa restart.

**Overlay dev F3**: ms per tick, draw calls, RSS, jumlah entitas, seed, tick.

---

## 3. Panel Provinsi dan Kota
Bottom sheet, muncul saat provinsi diklik. Tinggi sekitar sepertiga layar.

```
┌────────────────────────────────────────────────────────────────────────┐
│ JAKARTA (Indonesia)          Wilayah Asal        Terrain: Urban    [×] │
├──────────────┬─────────────────────────┬───────────────┬───────────────┤
│ [foto kota]  │ PRODUKSI PER HARI       │ INFORMASI     │ BANGUNAN      │
│              │ Komponen  +1.205        │ Populasi  6.0 │ [✈ 1] [⚓ 1]  │
│ MORAL   70%  │ Dana      +1.004        │ PK        6   │               │
│ ▓▓▓▓▓▓▓░░░   │ Personel  +144          │ Sembuh 1 HP/h │ [+ BANGUN]    │
│ target 90%   │                         │ Pertahanan 0% │ [+ MOBILISASI]│
│              │ Suplai: Terpasok        │ Agen: 0       │ [Titik Kumpul]│
└──────────────┴─────────────────────────┴───────────────┴───────────────┘
```
Untuk provinsi non-kota, kolom produksi diganti resource provinsi dan tombol Local Industry. Status suplai memakai tiga warna: Terpasok hijau, Menipis kuning, Terputus merah dengan hitungan mundur grace.

---

## 4. Konstruksi dan Mobilisasi
Modal, dibuka dari panel kota. Header mengulang nama kota, produksi, dan moral.

```
┌ JAKARTA (6)   Komponen +1.205  Dana +1.004  Personel +144   Moral 70% ──[×]┐
│ SEDANG DIBANGUN: —      SEDANG MOBILISASI: —      ANTREAN: ◇ ◇ ◇ ◇        │
├───────────────────────────────────────────────────────────────────────────┤
│ [Bangunan][Infanteri][Armor][Support][Heli][Pesawat][Laut][Kapal Selam]…  │
├───────────────────────────────────────────────────────────────────────────┤
│ ▣ Army Base Lv.1   250🜲 250⚙ 500⛽ 250💡 2.000💰   1 mnt 38 dtk           │
│                                              Moral: +8 dtk   [i][⏩][MULAI]│
│ ▣ Arms Industry Lv.1  400🜲 350⚙ 225◈ 350⛽ 250💡 1.250💰  9 jam 45 mnt    │
│                                              Moral: +45 mnt  [i][⏩][MULAI]│
│ ▢ Air Base Lv.2 — terkunci                                                │
│   Prasyarat: Air Base Lv.1 ✓ · Arms Industry Lv.1 ✗                       │
└───────────────────────────────────────────────────────────────────────────┘
```
Baris terkunci menampilkan **prasyarat mana yang kurang**, bukan sekadar abu-abu. Kolom "Moral" menampilkan penalti durasi akibat moral di bawah 90 persen. Durasi juga ditampilkan dalam **menit nyata pada kecepatan sekarang**, karena itu yang benar-benar dirasakan pemain.

---

## 5. Riset
Modal lebar. Header menampilkan doktrin negara.

```
┌ RISET │ NON-BLOK (condong Eropa)                                     [×] │
│ [Inf][Armor][Support][Heli][Fighter][Bomber][Laut][Selam][Misil][Item]   │
├──────────────────────────────────┬──────────────────────────────────────┤
│ HARI INI: 12                     │ SEDANG DIRISET                       │
│         D1  D2  D4  D5  D6  D8   │ ◇ Slot 1: Mechanized Lv.2  4j 12m   │
│ Motorized ◆──◆──◇──◇──◇──◇       │ ◇ Slot 2: kosong                     │
│ Mechanized ◆──◆──◇──◇            │                                      │
│ Naval Inf  ◇──◇                  │ TERPILIH: Mechanized Lv.3            │
│ Special F. ▢  ▢                  │ 🔒 Hari 13   ⏱ 8 jam   ≈ 40 mnt nyata│
│              ▲ hari ini          │ BIAYA 1.075🜲 1.325◈ 1.500💰          │
│                                  │ [MULAI RISET]                        │
│                                  │ MEMBUKA: Mechanized Lv.3             │
│                                  │ "+15% HP, +10% serangan vs Hard"     │
└──────────────────────────────────┴──────────────────────────────────────┘
```
Node hijau bisa diriset sekarang, abu belum tersedia, redup terkunci prasyarat. Garis vertikal menandai hari sekarang. Untuk era historis, kolom menampilkan **epoch** (1939, 1940, …) bukan hari mentah, dan node yang bisa diriset satu epoch lebih awal ditandai dengan durasi tiga kali lipat.

---

## 6. Panel Unit dan Grup Tempur
Bottom sheet saat stack diklik.

```
┌ GRUP TEMPUR KE-3 (Indonesia)  G3                    Komandan: Kol. A  [×]│
├────────────┬────────────────────┬─────────────────┬──────────────────────┤
│ [ikon]     │ Kekuatan  ATK 7.5  │ PASUKAN         │ AKTIVITAS            │
│ 42/45 HP   │           DEF 11.6 │ ◆ Recon    ×1   │ Posisi: Jakarta      │
│ ▓▓▓▓▓▓▓▓░  │ Kecepatan 1.20     │ ◆ Motorized ×2  │ Tujuan: Tasikmalaya  │
│ Moral 82   │ Efisiensi 100%     │                 │ Tiba: 6 jam (30 dtk) │
│ Terpasok   │ Sikap: BERTAHAN ▾  │                 │ [→ MAJU CEPAT KE SANA]│
├────────────┴────────────────────┴─────────────────┴──────────────────────┤
│ [Gerak][Serang][Muatan] │ [Pecah] │ [Titik Jalan][Paksa][Tunda][Batal]   │
└──────────────────────────────────────────────────────────────────────────┘
```
**Sikap** adalah dropdown enam nilai: Serbu, Bertahan, Sergap, Kepung, Tabir, Serang Cepat. **Tombol "Maju cepat ke sana"** menjalankan fast forward sampai tiba dengan auto-pause, dan ini wajib ada (`25-` bagian 8). Waktu tiba selalu ditampilkan dalam jam game **dan** menit nyata.

Saat stack sedang bertempur, panel menambah **rincian damage**: `100 × terrain 0,9 × terkepung 1,1 × terputus 0,8 × sikap 1,15`. Ini yang mencegah pemain merasa hasilnya acak.

---

## 7. Front dan Teater (kontrol utama, D20)
Tab kanan, mode peta khusus.

```
┌ FRONT & TEATER ───────────────────────────────────────────[×]┐
│ TEATER: Sumatra Utara                     Koordinasi +18%    │
│ ├ Front Selat Malaka          [Tahan Garis ▾]  2 grup        │
│ │   └ G1 (Kol. A) · G4 (—)          Suplai: Terpasok         │
│ └ Front Perbatasan Timur      [Maju ke Kuching ▾]  1 grup    │
│     └ G2 (Kol. B)                   Suplai: Menipis ⚠        │
│                                                              │
│ [+ GAMBAR FRONT BARU]   [Delegasikan teater ini ke AI]       │
├──────────────────────────────────────────────────────────────┤
│ MISI LAUT                                                    │
│ Zona Malaka      [Blokade pelabuhan ▾]  Armada Alfa          │
│ Zona Jawa        [Patroli ▾]            Armada Beta          │
└──────────────────────────────────────────────────────────────┘
```
Enam objective: Bertahan, Maju ke X, Jepit region Z, Tahan Garis, Mundur ke L, Tipuan ke W. **Koordinasi** naik 2 persen per hari game hingga 25 persen, meluruh 1 persen per hari di bawah AI dan 3 persen setelah override manual, dan angkanya selalu terlihat agar pemain paham biaya micro.

**Transparansi eksekusi wajib**: setiap grup menampilkan apa yang sedang dilakukannya dalam kalimat manusia, misalnya "mengelilingi Kuching, menunggu suplai dua hari". Ini pelajaran dari keluhan pemain terhadap battle plan Hearts of Iron IV dan front Victoria 3.

---

## 8. Kartu Operasi dan Ruang Perang
Mode peta dengan overlay bergaya peta staf.

```
┌ KARTU OPERASI ────────────────────────────────────────────[×]┐
│ TERSEDIA                                                      │
│ ▣ Blokade Pelabuhan   syarat: rasio laut ≥1,5 ✓              │
│   2 hari · Bahan Bakar ×1,5/hari · peluang 70-85%            │
│ ▣ Pengepungan Kota    syarat: ≥75% tetangga dikuasai ✓        │
│ ▢ Pendaratan Amfibi   syarat: kendali laut ≥50% ✗ (kini 31%) │
│ ▣ Tipuan              syarat: 1 grup terpisah ✓               │
│                                                               │
│ RENCANA "Operasi Selat"                                       │
│ 1. Blokade Pelabuhan Kuching        [selesai]                │
│ 2. Pengepungan Kuching              [berjalan 40%]           │
│ 3. Bombardemen    ← pemicu: tiap hari                        │
│ 4. Serbu          ← pemicu: fortifikasi <30%                 │
│ [SIMPAN RENCANA]  [JALANKAN]  [PUTAR ULANG SETELAH PERANG]   │
└───────────────────────────────────────────────────────────────┘
```
Kartu yang syaratnya tidak terpenuhi menampilkan **angka sekarang versus angka yang dibutuhkan**. Peluang ditampilkan sebagai **rentang**, bukan angka pasti, agar kabut perang tetap berarti. Rencana bisa disimpan bernama dan diputar ulang setelah perang sebagai bahan Chronicle.

---

## 9. Pasar Dunia
Modal, satu layar.

```
┌ PASAR DUNIA ─────────────────────────────────────── Hari 12 ──[×]┐
│ Barang    Harga Dunia    Harga Anda   Akses  Tersedia  Kuota     │
│ Suplai      7,4 ▲2%      7,9          100%   1.240     310       │
│ Bahan Bakar 41,0 ▲12%⚠   54,9         25% ⚠  480       24        │
│ Material Lk 13,4 ▼1%     14,1         100%   210       52        │
│                                                                   │
│ ⚠ Bahan Bakar naik 12%: pasokan dunia turun 49%,                 │
│   pelabuhan Aljazair diblokade.                                  │
│ ⚠ Akses Anda 25%: pelabuhan Surabaya diblokade sejak Hari 10.    │
│                                                                   │
│ [grafik EMA 30 hari]        Pasar Dunia Lainnya: sisa 140 lot     │
│ BELI Bahan Bakar  [──────●───] 24 lot                            │
│ Harga rata-rata 54,91 · Barang 1.318 · Fee 5% 66 · Total 1.384   │
│ Tiba: besok (T+1)                            [BATAL] [KONFIRMASI] │
└───────────────────────────────────────────────────────────────────┘
```
Tiga hal wajib. **Alasan pergerakan harga ditulis dalam kalimat** setiap kali bergerak lebih dari 5 persen, karena pasar yang tidak bisa dibaca terasa seperti angka acak. **Rest of World terlihat sebagai peserta bernama** dengan sisa volume, agar pemain tidak menyimpulkan pasar curang. **Kolom Kuota dan Tersedia lebih menonjol daripada kolom harga**, karena blokade menyakitkan lewat volume, bukan harga.

---

## 10. Diplomasi
Modal dua tab.

```
┌ DIPLOMASI │ [INFORMASI] [PESAN & DAGANG] ────────────── cari: ___ [×]┐
│ Negara      Blok   Kota  PK   Sikap Mrk  Sikap Anda   Tipe   Info    │
│ Malaysia    ASEAN   6    79   Waspada    [Damai ▾]     AI     [i][✉] │
│ Australia   —       9    88   Bersahabat [Damai ▾]     AI     [i][✉] │
│ Singapura   —       1    12   Netral     [Damai ▾]     AI     [i][✉] │
│                                                                       │
│ Reputasi Agresi: 18 (Terhormat)  ▓▓░░░░░░░░  Pariah di 100          │
└───────────────────────────────────────────────────────────────────────┘
```
**Sikap AI ditampilkan sebagai label**, bukan angka: Melindungi, Ramah, Kooperatif, Hati-hati, Waspada, Antagonistis, Agresif, Mendominasi. Reputasi Agresi punya bar sendiri dengan ambang terlihat. Mengubah relasi ke War membuka **panel Krisis tiga fase**, bukan langsung perang.

---

## 11. Briefing Harian
Modal, muncul pada pergantian hari bila diaktifkan. Ini ritual utama pengganti login harian Conflict of Nations.

```
┌ HARI 13 · 14 Maret 2026 ─────────────────────────────────────[×]┐
│ EKONOMI              │ MILITER            │ DIPLOMASI            │
│ Bahan Bakar habis    │ Front Timur maju   │ Malaysia menawarkan  │
│ dalam 2 hari ⚠       │ 2 provinsi         │ gencatan senjata     │
│ [Beli 40 lot]        │ [Lihat front]      │ [Tinjau]             │
│ Riset selesai:       │ G2 suplai menipis  │ Reputasi Agresi +3   │
│ Mechanized Lv.2      │ [Kirim konvoi]     │                      │
├──────────────────────┴────────────────────┴──────────────────────┤
│ KRONIK HARI INI                                                   │
│ · Kuching jatuh setelah pengepungan 6 hari                        │
│ · Aljazair memblokade pelabuhan Surabaya                          │
│                                        [LANJUTKAN]  [Jangan tampilkan]│
└───────────────────────────────────────────────────────────────────┘
```
Tiga kolom, maksimal tiga baris per kolom, setiap baris punya satu tombol aksi. Ini yang membuat game bisa dimainkan dalam sesi sepuluh menit.

---

## 12. Negara dan Ubah Identitas
Layar penuh, dibuka dari tombol rumah di HUD.

```
┌ [bendera]  REPUBLIK INDONESIA ───────────────────────────────[×]┐
│ Ibu Kota      Jakarta            Populasi   280 jt              │
│ Pemerintahan  Republik           Ekonomi    ▓▓▓▓▓▓▓░░░          │
│ Doktrin       Non-Blok           Militer    ▓▓▓▓▓░░░░░          │
│ Fokus         Kekuatan Maritim   Teknologi  ▓▓▓▓▓▓░░░░          │
│ "Bhinneka Tunggal Ika"                                           │
│                                          [UBAH IDENTITAS NEGARA] │
└──────────────────────────────────────────────────────────────────┘
```
**Ubah Identitas** membuka tiga kelompok: Identitas (nama, pemerintahan, motto), Simbol (bendera builder, warna, lambang), dan Negara (ibu kota, fokus nasional, doktrin). Setiap perubahan berdampak gameplay menampilkan biaya dan cooldown sebelum konfirmasi, misalnya pindah ibu kota memakan dana, menurunkan stabilitas, dan punya cooldown.

---

## 13. Kronik dan Warisan
Layar penuh. Muncul non-modal saat hegemoni tercapai, dan bisa dibuka kapan saja.

```
┌ WARISAN ANDA ────────────────────────────────────────────────[×]┐
│ REPUBLIK INDONESIA                                               │
│ 47 hari · 284 provinsi · 12 perang · 31 pertempuran laut         │
│ Segel Kanon: PERUNGGU (3 muat ulang, 4 hari game diulang)        │
│                                                                   │
│ [linimasa peta bertahap, hari 1 sampai 47]                       │
│                                                                   │
│ Hari 6   Perang dengan Malaysia dimulai                          │
│ Hari 12  Kuching jatuh                                           │
│ Hari 23  Koalisi ASEAN terbentuk melawan Anda                    │
│ Hari 47  Ambang kemenangan tercapai: 911 PK                      │
│                                                                   │
│ [LANJUTKAN BERMAIN]   [Ekspor gambar]   [Tutup Kronik]           │
└───────────────────────────────────────────────────────────────────┘
```
Tombol utamanya **Lanjutkan Bermain**, bukan Keluar (D28). Tutup Kronik adalah tindakan sadar yang menyegel cabang. Selama krisis endgame aktif, layar ini ditunda agar kemenangan tidak datang di momen antiklimaks.

---

## 14. Codex
Layar penuh, dua kolom, wajib untuk mode Legends (`28-`).

```
┌ CODEX │ Gunung Padang ───────────────────────────────────────[×]┐
│ DALAM PERMAINAN            │ DI DUNIA NYATA                     │
│ (fiksi)                    │ (fakta, per 2026)                  │
│                            │                                    │
│ Dalam Legends, Ekspedisi   │ Situs megalitik punden berundak di │
│ Nusantara Purba dimulai    │ Cianjur, Jawa Barat. Konsensus     │
│ dari terasering ini…       │ arkeologi menempatkannya pada abad │
│                            │ ke-2 sampai ke-8 Masehi.           │
│                            │ Klaim "piramida 27.000 tahun"      │
│                            │ terbit di Archaeological           │
│                            │ Prospection Oktober 2023 dan       │
│                            │ **ditarik penerbit Wiley pada      │
│                            │ Maret 2024**, karena penanggalan   │
│                            │ dilakukan pada sampel tanah yang   │
│                            │ tidak berasosiasi dengan artefak   │
│                            │ atau fitur buatan manusia.         │
└──────────────────────────────────────────────────────────────────┘
```
**Kolom kanan wajib berbobot visual sama atau lebih besar.** Bila kolom fiksi lebih menonjol, Codex justru melegitimasi klaim yang sudah ditarik.

---

## 15 sampai 17: layar pendukung
**Koalisi** berisi tabel emblem, pemimpin, provinsi, anggota, skor per ambang, dan tombol buat koalisi. **Intelijen** berisi jumlah agen, gaji per hari, empat kategori misi (Kontra-Operasi, Intelijen, Korupsi, Sabotase), dan laporan harian. **Koran dan Peristiwa** berisi feed per hari game dengan filter, peringkat negara berdasarkan poin kemenangan, dan log sistem bertimestamp.

---

## Aksesibilitas (berlaku semua layar)
Skala font tiga tingkat; kontras minimal 3 banding 1 untuk semua elemen grafis mengikuti WCAG 1.4.11; mode buta warna empat preset yang mengganti palet, bukan memfilter layar; reduced motion mematikan animasi transisi warna dan denyut pertempuran; setiap warna selalu didampingi kanal kedua berupa pola, ketebalan garis, ikon, atau label.
