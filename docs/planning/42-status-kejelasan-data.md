# Status Kejelasan Data Nation Rise

> Sesi 5 (2026-09-05). Ringkasan menyeluruh: apa yang sudah punya data konkret, apa yang masih asumsi, dan apa yang menunggu keputusan. Disusun setelah delapan gelombang riset dan ekstraksi 672 tangkapan layar.

## 1. Perubahan besar dari chart doktrin

Chart perbandingan doktrin resmi Bytro kini terbaca penuh. Riset sebelumnya menyebutnya berupa gambar yang tidak bisa diekstrak, dan itulah yang selama ini memblokir data doktrin.

**Konsekuensinya besar: doktrin Western dan Eastern sekarang bisa diturunkan, bukan ditebak.** Kita punya **angka absolut European** dari panel dalam game, dan **modifier relatif Western dan Eastern** dari chart ini. Keduanya digabung menghasilkan angka penuh.

Contoh: Main Battle Tank European punya daya tahan 45. Western mendapat daya tahan plus 10 persen, sehingga menjadi 49,5. Eastern mendapat serang lapis baja plus 5 persen dan kecepatan plus 10 persen, sehingga serangnya menjadi 8,4 dan kecepatannya 1,1.

### 1.1 Seluruh bonus doktrin, terbaca lengkap

| Unit | Western | European | Eastern |
|---|---|---|---|
| Mechanized Infantry | — | **serang infanteri +25%, kecepatan +10%** | — |
| Naval Infantry | **daya tahan +15%, kecepatan +10%** | — | — |
| Special Forces | — | — | serang infanteri +10% |
| Armored Combat Vehicle | daya tahan +3 | — | — |
| Main Battle Tank | **daya tahan +10%** | serang infanteri +10% | serang lapis baja +5%, kecepatan +10% |
| Tank Destroyer | — | serang lapis baja +5%, daya tahan +3 | — |
| Towed Artillery | — | — | **serang lapis baja +20%** |
| Mobile Artillery | — | serang infanteri +5%, **daya tahan +20%** | — |
| Mobile Anti-Air | — | **serang helikopter +20%** | — |
| SAM | — | — | **serang pesawat +20%** |
| Attack Helicopter | **serang lapis baja +20%** | — | — |
| Air Superiority Fighter | serang pesawat +10%, serang helikopter +10% | — | — |
| Strike Fighter | — | **daya tahan +20%** | — |
| Heavy Bomber | **serang infanteri +20%, daya tahan +3** | — | — |

**European memegang bonus terbanyak dan terbesar**, yaitu enam unit termasuk satu bonus 25 persen. Western memegang tujuh unit tetapi bonusnya lebih kecil. **Eastern hanya memegang tiga unit**, dan kompensasinya adalah percepatan riset.

### 1.2 Pergeseran hari riset, terbaca lengkap

Sudah tercatat di dokumen 39. Pergeseran terbesar adalah **Armored Combat Vehicle Western yang enam hari lebih awal** dan **Attack Helicopter Western empat hari lebih awal**.

Yang baru terlihat dari chart ini: **enam officer Western dan Eastern juga punya pergeseran hari**, termasuk Tank Commander Western yang tiga hari lebih awal di tingkat akhir.

---

## 2. Yang sudah jelas, dengan data konkret

| Bidang | Status | Sumber |
|---|---|---|
| **Ekonomi produksi** | **Terpecahkan.** Formula lengkap, konstanta 3.000, delapan dari delapan titik data Indonesia cocok persis | Tangkapan layar dan wiki |
| **Poin kemenangan** | **Terpecahkan tanpa sisa.** Provinsi non-kota ditambah total populasi kota, diverifikasi pada Indonesia | Scraping 149 negara |
| **Skala waktu dan kecepatan** | Tangga kecepatan diputuskan, kecepatan unit dikalibrasi dari kilometer per jam nyata, tiga kecepatan laut | Riset dan panel dalam game |
| **Peta dan granularitas** | 2.400 provinsi, Indonesia 54, distribusi terrain sebagai kriteria terima, aturan pulau berjenjang | Scraping 149 negara |
| **Bangunan** | **Lengkap per level**: biaya, waktu, daya tahan, efek, gerbang unit, plus sebelas bangunan yang sebelumnya tidak diketahui | Wiki dan tangkapan layar |
| **Moral dan pemberontakan** | Formula, modifier lengkap, ambang, dan mekanik penghitung waktu per tipe kota | Wiki |
| **Statistik unit European** | **Lengkap 77 kelas**: serang dan tahan per sepuluh kolom, jangkauan, daya tahan dan pandang per medan, upkeep | Panel dalam game |
| **Statistik Western dan Eastern** | **Bisa diturunkan** dari angka European ditambah modifier chart | Chart doktrin |
| **Pohon riset** | Struktur dua belas tab, hari terbuka, dan **biaya serta durasi nyata untuk lebih dari 160 node** | Tangkapan layar |
| **Doktrin** | Bonus lengkap, pergeseran hari lengkap, kelas penangkal, dan pemetaan negara termasuk Indonesia European | Chart dan modul data |
| **Rumus tempur** | Penalti kesehatan, penalti penumpukan, efisiensi, penyembuhan, tick satu jam | Wiki |
| **Sistem Echelon** | Tiga tingkat, pemetaan lengkap unit darat dan udara | Wiki resmi |
| **Anti-udara** | Cooldown selubung sepuluh menit, pertahanan titik tanpa cooldown, model deterministik | Wiki dan panel |
| **Arsitektur** | Enam lapisan, protokol Worker, format save, era pack, pipeline render dan warna | Riset teknis |
| **Sensitivitas konten** | 26 preseden, teks disclaimer, 22 aturan, checklist pra-rilis | Riset |

---

## 3. Yang belum jelas, dan seberapa menghambat

### 3.1 Menghambat implementasi, harus diselesaikan

| Celah | Kenapa menghambat | Jalan keluar |
|---|---|---|
| ~~Rumus konversi kekuatan ke daya tahan~~ | **TERTUTUP.** Diturunkan sendiri dan diuji terhadap empat skenario dengan angka unit asli | Lihat `43-combat-damage-formula.md`. Konstanta 0,35 terbukti tepat |
| **Perilaku kecerdasan buatan** | Baru ada kerangka arketipe dan penilaian utilitas, belum ada bobot angka maupun pohon keputusan | Riset khusus, belum dijalankan |
| **Daftar konten Modern** | Sekitar tiga puluh peristiwa, sepuluh sampai lima belas agenda, dan dua puluh sampai tiga puluh sifat komandan | Penulisan konten, bukan riset |

### 3.2 Penting tetapi bisa menyusul

| Celah | Catatan |
|---|---|
| Formula pertumbuhan populasi | Tidak didokumentasikan di mana pun; harus dirancang sendiri |
| Persentase rampasan saat merebut kota | Tidak terdokumentasi; usulan memakai model Call of War |
| Sistem intelijen dan spionase rinci | Empat misi baru tercatat garis besarnya |
| Sistem peristiwa dan diplomasi lanjutan | Kerangka ada, isi belum |
| Rencana pengujian performa konkret | Gerbang D22 sudah ditetapkan, prosedurnya belum |

### 3.3 Kecil dan tidak menghambat

Nilai bonus garnisun melawan pemberontak, waktu bangun Combat Outpost tingkat tiga, biaya Pontoon, dan pemetaan ikon biaya ke sumber daya. Semuanya bisa ditetapkan sendiri tanpa risiko.

### 3.4 Sudah tidak lagi menjadi celah

Empat hal yang sebelumnya tercatat kosong kini **tertutup** oleh tangkapan layar: seluruh statistik unit udara, seluruh statistik unit laut, seluruh kategori Support, dan modifier medan untuk artileri serta udara.

---

## 4. Yang menunggu keputusan Billy

| # | Pertanyaan | Rekomendasi |
|---|---|---|
| 1 | Bangku uji angka dikerjakan sekarang | Ya, karena angkanya kini asli bukan tebakan |
| 2 | Target waktu tempuh berjenjang | Intra-pulau dan antar-pulau inti di bawah dua menit, lintas nusantara tiga sampai lima menit |
| 3 | Target moral kota anteksasi | 75 persen, mengikuti wiki resmi |
| 4 | Ironman atau Segel Kanon | Segel Kanon, karena riset menyarankan tidak membangun ironman |
| 5 | Daftar dua belas Proyek Akhir | Menunggu |
| 6 | Senjata kimia di era Modern | Hanya Perang Dunia 1, tidak bisa dipakai pemain di Modern |
| 7 | Tokoh nyata | Dihindari, pakai jabatan generik |
| 8 | Aturan bendera | Tidak pernah dirusak, dibakar, dibalik, atau setengah tiang |
| 9 | Doktrin keempat era historis | Perang terbuka Amerika untuk 1914, bila era historis dikerjakan |

Nomor enam sampai delapan berisiko rendah dan rekomendasinya jelas, sehingga bisa diambil tanpa jawaban bila Billy diam.

---

## 5. Penilaian kesiapan per fase

| Fase | Kesiapan data | Catatan |
|---|---|---|
| **1. Pipeline data dan peta** | **Siap penuh** | Sumber, lisensi, pipeline, kriteria terima, dan benchmark terrain semuanya ada |
| **2. Waktu dan ekonomi** | **Siap penuh** | Formula terpecahkan dan bisa memvalidasi diri terhadap delapan titik data |
| **3. Unit, mobilisasi, riset** | **Siap penuh** | 77 kelas unit dengan angka asli, pohon riset dengan biaya nyata |
| **4. Tempur operasional** | **Siap penuh** | Rumus kerusakan ditetapkan dan diuji terhadap empat skenario; tersisa penyetelan halus di bangku uji angka |
| **5. Kecerdasan buatan dan diplomasi** | **Belum siap** | Butuh riset perilaku AI konkret |
| **6. Geopolitik dan konsekuensi** | Siap sebagian | Kerangka lengkap, isi peristiwa belum |
| **7. Identitas dan Kronik** | Siap | Rancangan lengkap |
| **8. Polish** | Siap | Spesifikasi layar dan aturan visual lengkap |

**Kesimpulannya: fase satu sampai tiga bisa dikerjakan sekarang tanpa menunggu apa pun.** Fase empat butuh satu keputusan desain yang paling tepat diambil di bangku uji angka. Fase lima butuh satu riset tambahan.
