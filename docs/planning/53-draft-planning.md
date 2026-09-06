# Draft Planning Nation Rise

> Sesi 5 (2026-09-06). Review menyeluruh dan rencana kerja setelah engine berpindah ke Godot dan cakupan dipersempit ke era Modern lebih dulu.
>
> Ini **draft**, bukan keputusan. Yang sudah dikunci ada di `KUNCI.md`.

## 1. Di mana kita sekarang

| Ukuran | Nilai |
|---|---|
| Dokumen perencanaan | **55 berkas** |
| Keputusan tercatat | **124** |
| Pertanyaan terbuka | 69 |
| Butir terkunci Billy | 37 |
| Baris kode | **nol** |

Dua alat sudah berjalan dan tetap berguna apa pun engine-nya: **`tools/balance-bench.html`** yang memvalidasi rumus ekonomi delapan dari delapan terhadap data Indonesia asli, dan **`tools/perf-probe.mjs`** yang membuktikan beban simulasi muat dalam anggaran.

### Yang sudah kuat

Rumus ekonomi terverifikasi; rantai pertempuran lengkap dengan rumus kerusakan turunan; 77 kelas unit dengan angka asli dari tangkapan layar; sistem doktrin berdasar sejarah nyata; rancangan peta 3.358 provinsi; tujuh belas layar dengan kerangka teks; bobot kecerdasan buatan dengan jangkar dari kode sumber Firaxis dan Hearts of Iron IV.

### Yang masih tipis

~~Sifat komandan, agenda yang terlihat pemain, keragaman antar kampanye, audio, dan aksesibilitas.~~ **Kelimanya sudah dirinci sampai angka di `56-sistem-pelengkap.md` (D131 sampai D135).**

---

## 2. Angka kampanye

### 2.1 Model dunia

| Golongan | Negara | Provinsi | Kota |
|---|---|---|---|
| Besar | 20 | 1.560 | 220 |
| Menengah | 50 | 1.100 | 250 |
| Kecil | 125 | 750 | 125 |
| **Total** | **195** | **3.410** | **595** |

**Total poin kemenangan dunia: 5.290** dari 2.815 provinsi non-kota ditambah 2.475 populasi kota. Lihat `54-jumlah-provinsi-final.md`.

Ini mengoreksi angka lama 600 kota dan 7.400 poin yang tercatat di dokumen awal.

### 2.2 Ambang kemenangan

Dikalibrasi dari Conflict of Nations, yang memberi ambang 1.850 sementara Indonesia mulai dari 80, yaitu **23 kali lipat**.

| Preset | Hari game | Bagian dunia | Ambang | Kelipatan | Jam nyata |
|---|---|---|---|---|---|
| Singkat | 30 | 25 persen | **1.322** | 13,5 kali | 2,5 jam |
| **Standar** | **45** | **30 persen** | **1.587** | **16,2 kali** | **3,8 jam** |
| Panjang | 60 | 35 persen | 1.851 | 18,9 kali | 5,0 jam |

Indonesia memulai dengan **98 poin** dari 42 provinsi non-kota ditambah 56 populasi dua belas kota.

Laju yang dibutuhkan pada preset Standar adalah **33 poin per hari game**, lebih longgar daripada Conflict of Nations yang menuntut 35. Itu disengaja, karena di sini tidak ada koalisi manusia yang mempercepat penaklukan.

Karena permainan tidak berhenti saat menang, ambang ini adalah **tujuan, bukan akhir**.

---

## 3. Cakupan: apa yang masuk dan apa yang ditunda

Tiga belas fase lama terlalu banyak. Pemangkasannya memakai satu pertanyaan: **tanpa ini, apakah permainan masih bisa dimainkan dan menyenangkan?**

### Masuk v1 Modern

| Sistem | Alasan |
|---|---|
| Peta provinsi, kota, kepemilikan | Fondasi |
| Waktu, kecepatan, jeda, simpan | Tanpa ini tidak ada permainan |
| Tujuh sumber daya, produksi, morale | Inti ekonomi |
| Bangunan berlevel | Gerbang unit |
| Unit, mobilisasi, gerak, pathfinding | Inti militer |
| Pertempuran tick per jam | Inti |
| Riset dengan gerbang hari | Inti |
| Kecerdasan buatan dengan lima arketipe | Tanpa ini dunia mati |
| Diplomasi dasar: perang, damai, hak lintas | Minimum agar perang punya arti |
| Pasar dunia satu layar | Wajib, karena Indonesia harus berdagang untuk mendapat Technology |
| Kendali front dan teater | Keputusan D20; mengurangi mikromanajemen |
| Briefing harian | Ritual yang membuat pergantian hari terasa |
| Empat tingkat kesulitan | Terkunci K07 |
| Kemenangan poin | Terkunci |
| Pratinjau pertempuran | Terkunci K28 |

### Ditunda setelah v1

| Sistem | Kenapa bisa ditunda |
|---|---|
| Era Perang Dunia I, Perang Dunia II, custom | K17 mengunci prioritas Modern lebih dulu |
| Mode Legends dan Situs Warisan | Lapisan opsional, bawaan mati |
| Identitas negara: ganti nama, bendera, ibu kota | Menyenangkan tetapi tidak mengubah permainan |
| Kronik dan layar Your History | Sama |
| Intelijen dan agen | Permainan tetap utuh tanpanya |
| Infamy, sanksi, krisis tiga fase | Pendalaman diplomasi |
| Negara boneka dan vassal | Pendalaman |
| Kartu operasi lapis ketiga | Lapis kedua sudah cukup untuk mengurangi mikromanajemen |
| Editor skenario dan sandbox acak | Butuh skema era pack stabil lebih dulu |
| Audio penuh dan aksesibilitas lanjutan | Polish |

**Yang ditunda tetap punya rencana**, sesuai K34. Tidak ada yang dihapus, hanya diurutkan.

---

## 4. Tiga tonggak

Menggantikan delapan fase datar dengan tiga tonggak yang masing-masing menghasilkan sesuatu yang bisa dinilai.

### Tonggak 1 — Bisa dimainkan

**Pertanyaan yang dijawab: apakah membangun negara dan berperang itu menyenangkan?**

| Isi | Hasil yang bisa dicek |
|---|---|
| Pipeline data: provinsi, negara, kota, sumber daya | Peta dunia tampil, provinsi bisa diklik |
| Peta 3D dengan pewarnaan kepemilikan | Enam puluh bingkai per detik di M1 |
| Waktu, kecepatan, jeda, simpan, muat | Bisa maju dan mundur waktu |
| Ekonomi tujuh sumber daya, morale, bangunan | Bisa bermain ekonomi tanpa unit |
| Unit, mobilisasi, gerak, pathfinding | Unit bergerak di peta |
| Riset dengan dua slot | Riset membuka unit |
| Pertempuran, pasokan, pengepungan | Perang melawan kecerdasan buatan pasif bisa dimenangkan |

**Gerbang keluar: ukur ulang anggaran tick di Godot.** Angka 6,9 milidetik berlaku untuk JavaScript dan harus dibuktikan lagi.

### Tonggak 2 — Dunia hidup

**Pertanyaan yang dijawab: apakah dunia terasa bereaksi, dan apakah kecerdasan buatan terasa adil?**

| Isi | Hasil yang bisa dicek |
|---|---|
| Kecerdasan buatan dengan lima arketipe dan penilaian utilitas | Negara lain berperang satu sama lain tanpa pemain |
| Momentum, kunci, dan zona mati anti-osilasi | Pembalikan keputusan di bawah dua per negara per tiga puluh hari |
| Diplomasi: perang, damai, hak lintas, aliansi | Aliansi terbentuk dan pecah sendiri |
| Pasar dunia dengan permintaan bergeser | Harga bergerak; Indonesia bisa menjual komoditas untuk membeli Technology |
| Empat tingkat kesulitan dengan tingkat Setara | Tingkat Setara benar-benar seratus berbanding seratus |
| Transparansi keputusan kecerdasan buatan | Pemain bisa membuka alasan setiap deklarasi perang |

**Gerbang keluar: seratus simulasi tanpa pemain.** Metrik yang harus lolos ada di dokumen 49: tiga sampai delapan perang per kampanye, enam puluh persen negara bertahan, empat puluh persen perang berakhir damai.

### Tonggak 3 — Terasa jadi

**Pertanyaan yang dijawab: apakah nyaman dimainkan berjam-jam?**

| Isi | Hasil yang bisa dicek |
|---|---|
| Kendali front dan teater | Pemain menggambar front, bukan menggeser unit satu per satu |
| Briefing harian | Pergantian hari terasa sebagai ritual |
| Pratinjau pertempuran | Pemain paham kenapa kalah atau menang |
| Polish visual: tekstur, glyph medan, unit 3D | Mendekati tangkapan layar acuan |
| Audio dasar dan i18n lengkap | Dua bahasa berfungsi penuh |
| Penyeimbangan dengan bangku uji | Kampanye Standar selesai dalam 3,8 jam |

---

## 5. Urutan dalam Tonggak 1

Ini bagian yang paling perlu urutan konkret, karena semuanya saling bergantung.

| Langkah | Isi | Bergantung pada |
|---|---|---|
| 1 | Pipeline data provinsi dan negara menjadi berkas statis | — |
| 2 | Peta 3D dengan tekstur ID provinsi dan lookup warna | 1 |
| 3 | Pemilihan provinsi, kamera, zoom, lapisan peta | 2 |
| 4 | Tick, kecepatan, jeda, simpan berversi | — |
| 5 | Ekonomi: produksi, morale, konsumsi | 1, 4 |
| 6 | Bangunan berlevel dan antrean konstruksi | 5 |
| 7 | Antarmuka kota dan Templat Kota | 6 |
| 8 | Unit, mobilisasi, tumpukan | 6 |
| 9 | Pathfinding dan gerak di graf provinsi | 8 |
| 10 | Pasokan dengan penelusuran, tiga status | 9 |
| 11 | Pertempuran tick per jam dengan rumus lengkap | 10 |
| 12 | Riset dua slot dengan gerbang hari | 5 |

Langkah 1 sampai 4 bisa dikerjakan paralel dengan 5 sampai 7, karena tidak saling bergantung.

---

## 6. Gerbang keputusan

Tiga titik di mana pekerjaan berhenti untuk diukur, bukan diteruskan dengan harapan.

**Gerbang performa, setelah langkah 11.** Ukur milidetik per tick untuk tiga ribu empat ratus provinsi dengan tiga ratus tumpukan dan 195 kecerdasan buatan. Ambang 500 milidetik. Bila lewat, pindahkan lapisan simulasi sepenuhnya ke C# sebelum melanjutkan.

**Gerbang FPS terbatas, sedini mungkin.** Isu terbuka Godot menyebut lonjakan waktu proses saat FPS dibatasi di macOS Metal. Karena kita berencana membatasi FPS demi baterai, ini diuji di langkah 3, bukan di akhir.

**Gerbang perilaku, akhir Tonggak 2.** Seratus simulasi tanpa pemain dengan metrik dari dokumen 49.

---

## 7. Risiko yang perlu diawasi

| Risiko | Besarnya | Penanganan |
|---|---|---|
| **Delapan gigabita RAM adalah angka rekomendasi, bukan lapang** | Sedang | Jaga jumlah node antarmuka rendah; pakai Tree dan ItemList alih-alih ratusan Control |
| **Sistem tema Godot tanpa padanan CSS** | Sedang | Rancang tema sekali di awal Tonggak 1 sebagai Theme Type Variation, jangan ditunda |
| **Alat inspeksi Godot melemah di atas tiga ribu node** | Rendah | Konsekuensi dari penanganan risiko pertama |
| **Angka penyeimbangan belum diuji dengan pemain sungguhan** | Tinggi | Bangku uji sudah ada; mainkan lebih awal, jangan menunggu polish |
| **Cakupan melebar kembali** | Tinggi | Daftar tunda di bagian 3 adalah kontrak; menambah sesuatu berarti mengeluarkan sesuatu |

---

## 8. Yang perlu diputuskan sebelum mulai

| Hal | Catatan |
|---|---|
| Preset kampanye bawaan | Rekomendasi **Standar 45 hari, ambang 1.191** |
| ~~Bentuk pratinjau pertempuran~~ | **TERJAWAB D136.** Lapis 1 masuk Tonggak 1, Lapis 3 di Tonggak 3 |
| ~~Kebijakan batas sengketa~~ | **TERJAWAB D129 dan D130.** Lihat `55-kebijakan-batas-sengketa.md` |
| ~~Jumlah provinsi final~~ | **TERJAWAB D128: 3.400 provinsi.** Lihat `54-jumlah-provinsi-final.md` |
