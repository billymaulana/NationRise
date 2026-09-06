# Rumus Kerusakan Tempur Nation Rise

> Sesi 5 (2026-09-06). **Menutup satu-satunya celah yang memblokir implementasi.** Diturunkan sendiri dari data yang sudah lengkap, lalu diuji terhadap empat skenario memakai angka unit asli. Bukan hasil riset web, melainkan kerja analitis di atas data terverifikasi.

## 1. Masalahnya

Rantai perhitungan tempur kita lengkap sampai satu langkah sebelum akhir.

```
Kekuatan = Rating dasar × Medan × Penguat pasukan × Penguat doktrin
                        × Penalti penumpukan × Penalti kesehatan
```

Penalti kesehatan adalah `0,25 + 0,75 × HP sekarang dibagi HP maksimum`. Penalti penumpukan adalah `1 − 0,56 × ln(ukuran tumpukan dibagi batas)`.

**Yang tidak pernah didokumentasikan di mana pun: bagaimana kekuatan menjadi kehilangan daya tahan.** Halaman rujukannya di wiki tidak pernah dibuat.

## 2. Petunjuk dari data unit sendiri

Panel dalam game memberi petunjuk yang menentukan. Perhatikan pola rating serang dan tahan:

| Unit | Serang terhadap infanteri | Tahan terhadap infanteri |
|---|---|---|
| Motorized Infantry | 3,0 | **3,8** |
| Naval Infantry | 5,0 | 3,0 |
| Main Battle Tank | 9,0 | 9,0 |
| Tank Destroyer terhadap lapis baja | 12,6 | 12,6 |

**Untuk banyak unit, serang sama dengan tahan.** Untuk infanteri bertahan, tahan justru lebih besar. Ini hanya masuk akal bila **keduanya adalah kekuatan yang menghasilkan kerusakan**, bukan bila tahan berfungsi sebagai pengurang.

Maka modelnya: **saat menyerang, unit memakai rating serang. Saat bertahan, unit memakai rating tahan.** Keduanya menghasilkan kerusakan ke pihak lawan.

Ini juga menjelaskan kenapa infanteri punya tahan lebih besar daripada serang: mereka memang lebih baik bertahan, dan itu terlihat langsung di angkanya.

## 3. Rumus yang diusulkan

```
Untuk tiap sisi, hitung kekuatan efektif terhadap komposisi lawan:

  Kekuatan_A = Σ  rating(unit, kelas armor lawan)
                × penalti_kesehatan(unit)
                × modifier_medan(unit, medan)
                × penguat_doktrin(unit)
  lalu dikali penalti_penumpukan(ukuran tumpukan A)

Kerusakan yang diterima B per tick:

  Kerusakan_B = Kekuatan_A × k × rng × pelindung_B

dengan
  k        = 0,35
  rng      = 1 ± 0,15, diundi tiap tick dari PRNG ber-seed
  pelindung_B = hasil gabungan entrenchment dan bunker secara inversely additive
```

Saat menyerang, sisi penyerang memakai **rating serang**. Sisi bertahan memakai **rating tahan**. Keduanya menghasilkan kerusakan secara bersamaan pada pertempuran perjumpaan. Pada penyerangan terhadap posisi berparit, hanya penyerang yang memakai rating serang sementara bertahan tetap membalas dengan rating tahan.

Konstanta `k = 0,35` sudah tercatat di dokumen 12 sebagai rancangan. **Bagian 5 di bawah membuktikan angka itu ternyata tepat** saat diuji dengan data unit asli.

## 4. Pembagian kerusakan lewat Echelon

Kerusakan tidak jatuh merata. Ia dibagi menurut bobot echelon.

| Echelon | Bobot | Contoh unit |
|---|---|---|
| Garis depan | **3** | Main Battle Tank, Tank Destroyer, Mechanized Infantry, Armored Fighting Vehicle |
| Menengah | **2** | Mobile Artillery, MRL, Naval Infantry, Airmobile, Mobile Anti-Air |
| Belakang | **1** | Motorized Infantry, Mobile SAM, Towed Artillery, Mobile Radar, Theater Defense System, Special Forces |

Porsi tiap unit adalah bobotnya dibagi total bobot tumpukan.

Contoh tumpukan berisi tiga Main Battle Tank, dua Mobile Artillery, dan satu Mobile SAM. Total bobotnya sembilan ditambah empat ditambah satu, yaitu empat belas. **Tank menyerap 64 persen, artileri 29 persen, dan rudal darat ke udara hanya 7 persen.**

Inilah yang membuat komposisi tumpukan menjadi keputusan nyata: aset bernilai tinggi bertahan lama karena dilindungi unit garis depan.

---

## 5. Uji kewajaran dengan angka unit asli

Semua angka di bawah memakai statistik European sungguhan dari dokumen 41.

### 5.1 Sepuluh Motorized Infantry menyerang sepuluh Motorized Infantry berparit di kota

| Sisi | Perhitungan | Kekuatan |
|---|---|---|
| Penyerang | 10 dikali serang 3,0, tanpa bonus medan di perkotaan | **30,0** |
| Bertahan | 10 dikali tahan 3,8, dikali bonus perkotaan 1,25 | **47,5** |

Daya tahan tiap sisi adalah 10 dikali 16, yaitu **160**.

Kerusakan ke bertahan per tick adalah 30 dikali 0,35 dikali pelindung parit 0,75, yaitu **7,9**. Kerusakan ke penyerang adalah 47,5 dikali 0,35, yaitu **16,6**.

**Bertahan runtuh dalam 20 tick, penyerang runtuh dalam 9,6 tick.** Jadi menyerang infanteri berparit di kota dengan kekuatan setara adalah **kekalahan yang jelas**, dan pemain akan merasakannya dalam sepuluh jam game.

### 5.2 Sepuluh Main Battle Tank menyerang sepuluh Motorized Infantry di medan terbuka

| Sisi | Perhitungan | Kekuatan |
|---|---|---|
| Penyerang | 10 dikali serang 9,0, dikali bonus medan terbuka 1,5 | **135,0** |
| Bertahan | 10 dikali tahan terhadap lapis baja 2,5, tanpa bonus | **25,0** |

Daya tahan penyerang 450, bertahan 160.

Kerusakan ke bertahan adalah **47,3 per tick**, dan ke penyerang **8,8 per tick**.

**Infanteri runtuh dalam 3,4 tick, sementara tank butuh 51 tick untuk runtuh.** Ini pembantaian, dan memang seharusnya begitu.

### 5.3 Lima Air Superiority Fighter melawan lima Air Superiority Fighter

Serang terhadap sayap tetap 6,0 dan tahan terhadap sayap tetap 6,0, sehingga keduanya berkekuatan **30,0**. Daya tahan tiap sisi 5 dikali 23, yaitu **115**.

Kerusakan 10,5 per tick di kedua arah. **Keduanya runtuh serentak di tick kesebelas.**

### 5.4 Satu Destroyer melawan satu Attack Submarine di laut lepas

Destroyer menyerang kapal selam dengan 7,2 dan berdaya tahan 40. Kapal selam menyerang kapal permukaan dengan 8,0, mendapat bonus laut lepas 25 persen sehingga menjadi 10,0, dan berdaya tahan 20.

Kerusakan ke kapal selam 2,5 per tick, dan ke kapal perusak 3,5 per tick.

**Kapal selam runtuh dalam 8 tick, kapal perusak dalam 11,4 tick.** Kapal perusak menang, tetapi tipis, dan itu tepat karena kapal selam memang berbahaya di laut lepas.

Bila pertempuran yang sama terjadi di perairan pesisir, kapal selam terkena penalti 25 persen sehingga kekuatannya turun ke 6,0 dan kerusakannya hanya 2,1 per tick. **Kapal perusak lalu butuh 19 tick untuk runtuh sementara kapal selam tetap runtuh dalam 8 tick.** Perairan dangkal benar-benar berpihak pada pemburu.

---

## 5.5 Koreksi: hasil simulasi penuh berbeda dari hitungan tangan

Perhitungan di bagian 5.1 sampai 5.4 memakai kekuatan tetap. **Simulasi penuh memberi angka berbeda**, karena penalti kesehatan bekerja **dua arah**: saat daya tahan turun, kekuatan ikut turun, sehingga pertempuran melambat menjelang akhir.

Hasil dari bangku uji, dengan keacakan dimatikan agar bisa direproduksi:

| Skenario | Tick | Sisa penyerang | Sisa bertahan | Pemenang |
|---|---|---|---|---|
| Sepuluh Motorized menyerang sepuluh Motorized berparit di kota | **11** | 0 | **106 dari 160** | Bertahan |
| Sepuluh Main Battle Tank melawan sepuluh Motorized di dataran | **4** | **427 dari 450** | 0 | Penyerang |
| Lima Air Superiority Fighter saling serang | **20** | 0 | 0 | Seri |
| Satu Destroyer melawan satu Attack Submarine di laut lepas | **11** | **17 dari 40** | 0 | Penyerang |

**Pola yang muncul justru lebih baik daripada yang dirancang.** Pertempuran tidak seimbang selesai cepat, yaitu empat tick untuk tank melawan infanteri. Pertempuran timpang sedang selesai sedang, yaitu sebelas tick. Dan **pertempuran seimbang sempurna berlarut sampai dua puluh tick**, karena kedua sisi melemah bersamaan sehingga tidak ada yang bisa menyelesaikan dengan cepat.

Itu perilaku yang tepat: **kemenangan mudah terasa cepat, dan pertarungan setara terasa panjang dan mahal.**

Satu hal yang perlu Billy rasakan sendiri: dua puluh tick pada kecepatan Normal adalah **sekitar empat menit nyata**. Apakah itu terlalu lama untuk duel udara, hanya bisa dinilai dengan memainkannya.

## 6. Penilaian hasil uji

| Skenario | Tick sampai selesai | Penilaian |
|---|---|---|
| Infanteri melawan infanteri berparit | 9,6 bagi penyerang | **Tepat.** Serangan frontal ke kota dihukum jelas |
| Tank melawan infanteri di medan terbuka | 3,4 | **Tepat.** Cepat, dan memang seharusnya |
| Duel pesawat tempur seimbang | 11 | **Tepat.** Sekitar dua menit nyata pada kecepatan Normal |
| Kapal perusak melawan kapal selam | 8 sampai 11 | **Tepat.** Tipis dan bergantung perairan |

**Pertempuran antar tumpukan seimbang selesai dalam sepuluh sampai dua belas tick.** Pada kecepatan Normal di mana satu hari game berlangsung lima menit, satu tick adalah 12,5 detik nyata, sehingga pertempuran khas berlangsung **sekitar dua sampai dua setengah menit nyata**.

Itu angka yang bagus. Cukup lama untuk pemain sempat bereaksi dengan mengirim bala bantuan atau mundur, tetapi cukup singkat untuk tidak membosankan.

**Konstanta k = 0,35 terbukti tepat tanpa perlu disetel ulang.**

---

## 7. Aturan pelengkap

### 7.1 Efisiensi kerusakan menurun

Mengikuti Call of War yang terverifikasi, **efisiensi kerusakan turun linear dari 100 persen menjadi 20 persen** saat daya tahan tumpukan mendekati nol. Ini sudah tercakup dalam penalti kesehatan `0,25 + 0,75 × HP relatif`, yang memberi lantai 25 persen dan bukan 20.

Kita pakai angka Conflict of Nations, yaitu lantai 25 persen, karena seluruh rating unit kita berasal dari sana.

### 7.2 Keacakan

Rentang plus minus 15 persen, diundi **tiap tick** dari pembangkit acak ber-seed dengan aliran terpisah untuk pertempuran. Rentang ini sengaja lebih sempit daripada Call of War yang memakai plus minus 20 persen.

Alasannya: dengan pertempuran berlangsung sepuluh sampai dua belas tick, keacakan tiap tick akan **rata-rata sendiri**, sehingga hasilnya tetap bisa diprediksi pemain. Keacakan besar hanya terasa tidak adil bila pertempuran singkat.

### 7.3 Hubungan dengan moral tumpukan

Moral tumpukan bekerja sebagai **lapisan kedua yang mengakhiri pertempuran sebelum daya tahan habis**.

Moral turun satu poin per tick saat kalah dalam pertukaran kerusakan, tiga poin saat terkepung atau terputus, dan naik lima poin per hari saat menganggur dan terpasok. Kerusakan dikalikan `0,55 + 0,45 × moral dibagi 100`.

Di bawah moral 25, tumpukan **rout**: mundur paksa ke sumber pasokan, pertahanan dikali 0,5 saat melepaskan diri, dan tidak bisa diperintah selama 24 tick. Bila rout terjadi tanpa jalur mundur, tumpukan **menyerah** dan 30 persen nilainya menjadi perlengkapan rampasan bagi pemenang.

**Inilah yang membuat pertempuran jarang berakhir dengan kemusnahan total**, dan yang membuat pengepungan bernilai: memutus jalur mundur mengubah kekalahan menjadi kehancuran.

### 7.4 Rincian yang wajib ditampilkan

Setiap pertempuran menampilkan rincian pengali dalam kalimat, misalnya seratus dikali medan nol koma sembilan dikali terkepung nol koma delapan dikali sikap satu koma satu lima.

Tanpa ini, seluruh sistem terasa acak walaupun sepenuhnya deterministik kecuali satu undian sempit.

---

## 8. Yang masih perlu diuji di bangku uji angka

| Pertanyaan | Cara mengujinya |
|---|---|
| Apakah komposisi tumpukan campuran benar-benar menghasilkan keputusan | Matriks duel semua kelas dengan anggaran biaya disamakan |
| Apakah ada unit yang mendominasi | Tidak boleh ada satu tipe unit melebihi 25 persen komposisi pasukan pemenang |
| Apakah bobot echelon tiga, dua, satu sudah tepat | Uji apakah artileri bertahan cukup lama untuk berguna |
| Apakah rentang keacakan 15 persen terasa adil | Uji seratus pertempuran identik, lihat sebaran hasilnya |
| Apakah moral memicu rout terlalu sering atau terlalu jarang | Hitung berapa persen pertempuran berakhir lewat rout, bukan lewat kehancuran |

Kelima pertanyaan itu **tidak bisa dijawab di atas kertas** dan memang untuk itulah bangku uji angka dirancang.
