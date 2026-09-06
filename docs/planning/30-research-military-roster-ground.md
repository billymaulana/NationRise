# Riset Roster Militer Darat: Infantry, Armored, Support

> Sesi 5 (2026-09-05), dijalankan lewat subagen sesuai aturan 9. Sumber utama `conflictofnations.wiki.gg` dan `hoi4.paradoxwikis.com`. Penanda: **[V]** terverifikasi dari halaman yang berhasil diambil, **[V?]** dari halaman terverifikasi tetapi ekstraksi tabel menunjukkan pergeseran kolom, **[UNV]** tidak terverifikasi, **[USULAN]** angka desain Nation Rise.

> **Pembaruan gelombang riset kedua (dokumen 35).** Sebagian celah di dokumen ini sudah tertutup. Nama alutsista Main Battle Tank per doktrin kini diketahui, yaitu M1A1 Abrams, T-80, dan Leopard 2. Tabel Main Battle Tank European level 1 sampai 7 kini lengkap dengan modifier medan per level. Combat Recon Vehicle, Amphibious Combat Vehicle Eastern, dan National Guard Eastern kini punya angka. Unit **Coastal Battery** yang sebelumnya tidak kita ketahui ditemukan dengan tabel lengkap. Keberadaan Mercenaries dan Mountain Infantry terkonfirmasi, sementara Infantry Veteran dan Tank Veteran dipastikan tidak ada. Bobot kerusakan numerik digantikan **sistem Echelon tiga tingkat**. Seluruh kategori Support tetap kosong di ketiga sumber. Lihat `35-research-con-data-audit.md`.

> **PEMBARUAN dari data dalam game (dokumen 41).** Seluruh kategori Support yang dokumen ini nyatakan nol angka di semua sumber **kini lengkap**, mencakup Towed Artillery, Mobile Artillery, Multiple Rocket Launcher, Mobile Anti-Air, Mobile SAM, Theater Defense System, dan Mobile Radar. Armored Fighting Vehicle dan Tank Destroyer juga terisi, dengan Tank Destroyer ternyata sangat ekstrem yaitu serang lapis baja 12,6 berbanding infanteri hanya 3. Mountain Infantry juga terisi.

## 0. Status akses sumber dan koreksi asumsi

| Sumber | Status | Kualitas |
|---|---|---|
| `conflictofnations.wiki.gg` | 200 | Lima halaman infanteri penuh tabel; mayoritas Armored dan Support berupa stub |
| `hoi4.paradoxwikis.com/Land_units` dan `/Land_doctrine` | 200 | Tabel lengkap, ada pergeseran kolom pada ekstraksi |
| `wiki.supremacy1914.com` | 403 Forbidden | Tidak dapat diakses |
| `s1914.paradoxwikis.com` | DNS tidak ada | Domain tidak eksis |
| `wiki.callofwar.com` | Timeout | Tidak dapat diakses |
| Seluruh `*.fandom.com` | 402 Payment Required | Tidak dapat diakses |
| Steam Community Guides | Rate limited | Tidak dapat diakses |

**Konsekuensi:** data Perang Dunia 1 dan 2 tidak dapat diverifikasi sama sekali. Bagian roster PD1 dan PD2 di dokumen ini adalah **struktur kategori**, bukan angka. Verifikasi ulang perlu dilakukan dari koneksi rumah, karena 403 dan timeout kemungkinan besar adalah blokir alamat pusat data, bukan blokir konten.

### 0.1 Koreksi terhadap asumsi yang tercatat sebelumnya

Empat unit yang tercatat di daftar Damage Distribution Weight kita **tidak ada** sebagai halaman di wiki CoN dan tidak muncul di `Category:Units`: **Mercenaries**, **Infantry Veteran**, **Tank Veteran**, **Mountain Infantry**. Semuanya mengembalikan 404. Yang benar-benar ada di kategori adalah **Insurgents**, **Enforcers**, **New Caliphate**, **The Chosen**, dan **Undead** (unit event atau skenario khusus). Angka DDW Mercenaries 10 di catatan kita kemungkinan berasal dari berkas game atau spreadsheet komunitas, bukan wiki. Perlu dilacak asalnya sebelum dipakai.

Doktrin resmi CoN hanya **tiga**: Western, Eastern, European. Tidak ada Pan-Asian.

### 0.2 Validasi silang yang menguatkan dataset kita

Setiap angka CoN yang tercatat di dokumen kita dan bisa diperiksa terhadap wiki **cocok persis seratus persen**: Motorized T1 lengkap, Mechanized T1, Special Forces T1, MBT level 1 dan level 7, dan rentang HP Naval Infantry. Ini berarti dataset kita kemungkinan besar berasal dari sumber yang sama atau dari game langsung, sehingga angka yang belum bisa diverifikasi juga layak dipercaya.

---

## 1. Karakter doktrin [V]

> "Units in the Western doctrine have the highest hitpoints, but have high research and building costs."
> "Units in the Eastern doctrine have the least hitpoints, but have low research and building costs."
> "Units in the European doctrine have intermediate hitpoint values and costs."

> **DIBATALKAN oleh D79.** Tabel pengali di bawah **terbantah data**. Uji field demi field pada Motorized, Mechanized, dan Naval Infantry membuktikan **biaya dan waktu mobilisasi identik antar doktrin**, dan HP nyaris seluruhnya identik. Doktrin bekerja lewat **hari unlock riset dan bonus per unit**, bukan pengali global. Lihat `37-research-doctrine-historical-basis.md` bab 11.

Tabel lama, disimpan sebagai catatan sejarah:

| Doktrin | HP | Biaya mobilisasi | Biaya riset | Kecepatan | Ciri unlock |
|---|---|---|---|---|---|
| Western | 1,10 | 1,15 | 1,15 | 1,00 | Airlift dan armor lebih awal |
| European | 1,00 | 1,00 | 1,00 | 1,05 | Baseline; Mechanized speed 1,10 versus 1,00 [V] |
| Eastern | 0,95 | 0,85 | 0,85 | 1,00 | Support dan artileri lebih awal [V] |

---

## 2. Roster Infantry Conflict of Nations

### 2.1 Motorized Infantry [V, Eastern dan European lengkap]

Alutsista per doktrin: Western tier 3 **Joint Light Tactical Vehicle**; Eastern **truk standar → Tigr IMV → BMP-97**; European **Mercedes-Benz Zetros → Force Protection Ocelot → EU LGS Fennek**.

| Parameter | T1 (L1–L3) | T2 (L4–L5) | T3 (L6–L7) |
|---|---|---|---|
| HP | 15 (L1–2), 17 (L3) | 20 | 22 (L6), 24 Eastern / 25 European (L7) |
| HP di gurun dan pesisir | — | 12 | 12 |
| Serang lunak | 3,0 → 4,0 dengan Engine Upgrade | 5,0 | 6,0 → 6,5 |
| Tahan lunak | 3,8 → 5,0 | 6,3 | 7,5 → 8,1 |
| Serang keras | 2,0 | 3,0 → 3,5 | 4,5 |
| Tahan keras | 2,5 | 3,8 → 4,4 | 5,6 |
| Tahan sayap tetap | 0,3 → 1,0 dengan MANPAD | 1,3 | 1,6 |
| Tahan sayap putar | 0,6 → 1,3 dengan MANPAD | 1,3 → 1,9 | 1,9 |
| Serang bangunan | 0,1 | 0,2 | 0,2 |
| Serang populasi | 2,0 | 2,0 | 2,0 |
| Jarak serang | 0 | 0 | **20** |
| Jarak pandang | 25 terbuka, **35** gunung, hutan, rimba, tundra | sama | sama |
| Signature radar | Rendah, unit darat | Rendah | Rendah |
| Biaya mobilisasi | 650 pasokan, 350 komponen, 850 personel, 1.000 dana | 750 / 550 / 1.000 / 1.250 | 950 / 700 / 1.250 / 1.500 |
| Upkeep harian | 50 / 25 / 25 bahan bakar / 70 dana | 55 / 30 / 35 / 75 | Eastern 80/45/60/90, Eropa 70/40/50/85 |
| Waktu mobilisasi | 18j / 19j / 20j | 21j / 22j | 23j / 1h |
| Prasyarat | Army Base level 1 | sama | sama |

Kecepatan per medan:

| Medan | L1 | L2–L3 | L4 | L5–L7 |
|---|---|---|---|---|
| Terbuka | 1,00 | 1,30 | 1,30 | 1,50 |
| Gunung | 0,33 | 0,43 | 0,43 | 0,49 |
| Hutan | 0,66 | 0,86 | 0,86 | 0,99 |
| Kota | 0,50 | 0,65 | 0,65 | 0,75 |
| Pinggiran kota | 0,33 | 0,43 | 0,43 | 0,49 |
| Rimba | 0,66 | 0,86 | 0,86 | 0,99 |
| Tundra | 1,00 | 1,30 | 1,30 | 1,50 |
| Gurun | 2,51 | 2,51 | 2,51 | 2,51 |
| Perairan pesisir | 1,30 | 1,30 | 1,30 | 1,30 |

Modifier medan: serangan turun 25 persen di gunung dan hutan, **pertahanan naik 25 persen di kota**, pertahanan turun 25 persen di gurun.

Hari riset: Eastern hari 1, 4, **6**, 12, 16, **20**, 24. European hari 1, 4, **7**, 12, 16, **22**, 26.

Kemampuan: Conquer Territory di semua tier, Airlift (An-12 dan C-160 → Il-76 dan C-390 → An-124 dan A400M), Elite Loitering Munitions mulai tier 2 dengan kapasitas 1 dan waktu isi ulang 8 jam turun ke 6 jam.

### 2.2 Mechanized Infantry [V]

| Parameter | Eastern T1 | Eastern T2 | Eastern T3 | Eropa T1 | Eropa T2 | Eropa T3 |
|---|---|---|---|---|---|---|
| HP | 22 | 27 / 30 | **35** | 22 | 27 / 30 | **35** |
| Serang lunak | 3,0 | 4,5 | 6,0 | **4,0** | **6,0** | **8,0** |
| Tahan lunak | 3,8 | 5,6 | 7,5 | **5,0** | **7,5** | **11,0** |
| Serang keras | 5 → 6 | 7 → 8 | 9,0 | 5 → 6 | 7 → 8 | 9,0 |
| Tahan keras | 6,3 → 7,5 | 8,8 → 10,0 | 11,3 | sama | sama | sama |
| Tahan sayap tetap | 1,3 | 1,9 | 3,1 | sama | sama | sama |
| Tahan sayap putar | 1,9 | 2,5 → 3,1 | 3,7 | sama | sama | sama |
| Prasyarat | Army Base 2 dan Recruiting Office 1 | sama | sama | sama | sama | sama |

Kecepatan terbuka: Eastern 1,00 → 1,30, Eropa **1,10 → 1,40**.

Modifier medan Mechanized berbeda tajam dari Motorized: serangan **naik 50 persen di medan terbuka**, turun 50 persen di gunung, turun 25 persen di hutan, turun 50 persen di kota, naik 25 persen di pinggiran kota. Pertahanan naik 25 persen di medan terbuka, turun 25 persen di gunung dan hutan.

Hari riset: Eastern hari 2 dan 13. European hari **1**, **11**, **22**.

### 2.3 Naval Infantry [V]

Alutsista terdata: Eastern tier 1 **BRDM-2**, Eropa tier 3 **ATF Dingo**.

| Parameter | T1 (L1–L3) | T2 (L4–L5) | T3 (L6) |
|---|---|---|---|
| HP | 19 / 20 / 21 | 24 / 25 | **28** |
| HP di gunung | 12 | 12 | 12 |
| Serang lunak | 6,0 → **7,0** | **8,0** | **11,0** |
| Tahan lunak | 3,4 → 4,0 | 4,6 | 6,0 |
| Serang keras | 3,0 | 4,0 | 5,0 |
| Tahan keras | 1,7 | 2,3 | 2,9 |
| Tahan sayap tetap | 0,5 → 1,0 | 1,5 | 1,5 |
| Tahan sayap putar | 0,6 → 1,1 | 1,2 | 1,2 |
| Prasyarat | Army Base 2, Naval Base 2, Recruiting Office 1 | sama | sama |

Modifier medan Naval Infantry **terbalik** dari infanteri lain: serangan **turun 50 persen di medan terbuka**, **naik 50 persen di gunung**, turun 25 persen di hutan, turun 50 persen di perkotaan. Pertahanan naik 25 persen di gunung. Marinir Conflict of Nations adalah unit medan kasar, bukan unit dataran.

Kemampuan: Amphibious, Conquer Territory, signature radar rendah, Airlift, UGV dan Elite Loitering Munitions, perlindungan NBC mulai level 5.

Hari riset Eropa: 2, 6, 9, 13, 18, 23.

### 2.4 Airmobile Infantry [V, Eropa]

| Parameter | T1 (L1–L3) | T2 (L4–L6) | T3 |
|---|---|---|---|
| HP | 15 | 17 / 18 | **20** |
| Serang lunak | 5,0 → 6,0 | 7,0 → 8,0 | **9,0** |
| Tahan lunak | 3,3 → 4,0 | 4,7 → 5,3 | 6,0 |
| Serang keras | 3,0 → 3,5 | 4,0 → 4,5 | 5,0 |
| Tahan keras | 2,0 → 2,3 | 2,7 → 3,0 | 3,3 |
| Tahan sayap tetap | 0,3 | 0,7 | 1,0 |
| Tahan sayap putar | 0,7 | 0,7 | 0,7 |
| Prasyarat | Army Base 1, Air Base 2, Recruiting Office 1 | sama | sama |

Ekstraksi tabel kecepatan Airmobile jelas rusak (medan terbuka terbaca 0,10). Angka kecepatan **[UNV]**, perlu diperiksa ulang.

Kemampuan: **Air Assault**, Conquer Territory, Airlift, signature radar rendah.

Hari riset: 1, 5, 11, 14, 17, 21, 25.

Modifier medan tier 1: serangan turun 25 persen di terbuka, gunung, hutan, kota, dan rimba; pertahanan **naik 25 persen di gunung dan rimba**, turun 25 persen di pinggiran kota dan tundra.

### 2.5 Special Forces [V, Eropa lengkap]

Alutsista: Western **Rangers**, Eastern **Spetsnaz**, Eropa **SAS**.

| Parameter | T1 (L1–L2) | T2 (L3–L4) | T3 (L5) |
|---|---|---|---|
| HP | **15** di medan terbuka, 12 di medan lain | 20 / 12 | 20 / 12 |
| Serang lunak | **7,0** | 10 → **12** | **13** |
| Tahan lunak | **4,7** | 6,7 → 8,0 | 9,0 |
| Serang keras | 4,0 | 6,0 | 8,0 |
| Tahan keras | 2,7 | 4,0 | 5,3 |
| Tahan sayap tetap | 0,7 → 1,3 | 1,7 | 2,3 |
| Tahan sayap putar | 1,3 → 2,0 | 2,7 | 3,3 |
| Jarak pandang | **40** terbuka, hutan, pinggiran, tundra, gurun; **50 gunung**; 25 kota | sama | sama |
| Signature radar | **Stealth, tidak terdeteksi** | sama | sama |
| Prasyarat | **Army Base 3**, Air Base 1, Recruiting Office 1 | sama | sama |

Kemampuan terkaya di seluruh game: **tidak bisa menaklukkan wilayah**, Stealth, Reveal Stealth terhadap unit darat, Storm Position, perlindungan NBC, Scout, Air Assault, Airlift, Amphibious mulai level 4, UGV, dan Elite Loitering Munitions.

Hari riset Eropa: 5, 8, 15, 20, 27.

### 2.6 National Guard dan Insurgents [V, kualitatif]

National Guard hanya butuh **Recruiting Office**, tanpa Army Base. **HP-nya berskala dengan moral kota** yang memobilisasi, mekanik unik di seluruh roster. Kemampuan: Conquer Territory, Airlift, perlindungan WMD. Deskripsi resmi menyebut waktu tempuh panjang dan properti tempur di bawah rata-rata, dirancang untuk pertahanan tanah air dengan penumpukan. Angka stat tidak tersedia.

Insurgents muncul saat moral kota turun di bawah sekitar 34 persen, dengan risiko melonjak di bawah 25 persen. Tidak bisa ditingkatkan, lemah, tidak menaklukkan provinsi, bernilai tiga poin musim, dan bisa menyeberang perbatasan ke negara yang belum berperang dengannya.

---

## 3. Roster Armored Conflict of Nations

Kategori ini paling buruk terdokumentasi. Empat dari lima halaman adalah stub; hanya Main Battle Tank yang punya tabel angka.

### 3.1 Main Battle Tank [V, Eropa level 1 sampai 7]

| Level | HP | Serang/tahan lunak | Serang/tahan keras | Tahan sayap putar | Serang bangunan | Serang populasi |
|---|---|---|---|---|---|---|
| 1 | 45 | 9,0 / 9,0 | 8,0 / 8,0 | 1,0 | 0,3 | 3,0 |
| 2 | 47 | 9,0 / 9,0 | 9,0 / 9,0 | 1,0 | 0,3 | 3,0 |
| 3 | 47 | 9,0 / 9,0 | 9,0 / 9,0 | 1,0 | 0,3 | 3,0 |
| 4 | 50 | 11 / 11 | 10,0 / 10,0 | 1,5 | 0,3 | 3,0 |
| 5 | 52 | 11 / 11 | 10,0 / 10,0 | 1,5 | 0,3 | 3,0 |
| 6 | 55 | 13 / 13 | 12 / 12 | 2,0 | 0,4 | 3,0 |
| 7 | 55 | 13 / 13 | 13 / 13 | 2,0 | 0,4 | 3,0 |

Serang dan tahan terhadap sayap tetap, laut, kapal selam, dan misil: **nihil**. Jarak pandang tetap 25 di semua medan dan semua level. Kecepatan 0,43 di gunung dan rimba hingga 2,51 di air. Prasyarat Army Base 2 dan Arms Industry 1. Hari 17 membuka perlindungan WMD terbatas sebesar 50 persen, hari 23 membuka Airlift.

Nama alutsista per doktrin tidak ada di halaman. Usulan **[UNV]** berdasarkan pola penamaan CoN: Western M60 Patton → M1 Abrams → M1A2 SEPv3; Eastern T-72 → T-80 atau T-90 → T-90M atau T-14 Armata; Eropa Leopard 1 → Leopard 2A4 → Leopard 2A7 atau Leclerc.

### 3.2 Armored Fighting Vehicle [V, parsial]

Alutsista per doktrin adalah satu-satunya data konkret yang tersedia: **Western M551 Sheridan, Eastern BMP-2, Eropa FV101 Scorpion**. Hari 2 membuka Airlift, hari 18 membuka perlindungan WMD terbatas, keduanya lebih awal untuk Western. Halaman terakhir disunting Maret 2022 sehingga kemungkinan usang. Seluruh stat numerik tidak tersedia.

### 3.3 Amphibious Combat Vehicle, Tank Destroyer, Combat Recon Vehicle [V, kualitatif]

Amphibious Combat Vehicle punya **signature radar tinggi**, berbeda dari infanteri yang rendah, **tidak bisa menaklukkan wilayah**, punya Scout dan Airlift dengan C-5M Galaxy jangkauan feri 10.000, dan perlindungan NBC ringan. Prasyarat Army Base 2 dan Arms Industry 1.

Tank Destroyer punya signature radar tinggi, tidak bisa menaklukkan wilayah, punya Airlift dan Air Assault dengan jangkauan operasi 500 lewat landasan kawan. Bertempur hanya melawan sasaran lunak dan keras, nihil terhadap pesawat, misil, kapal, dan kapal selam. Prasyarat sama.

Combat Recon Vehicle adalah stub total. Satu-satunya kalimat substantif: unit darat berlapis baja yang termasuk dalam **pasukan awal** yang diterima sebuah negara, dan punya Reveal Stealth.

---

## 4. Roster Support Conflict of Nations

Sebagian besar stub, tetapi nama alutsista per doktrin dan hari riset relatif lengkap. Ini temuan paling berharga dari kategori ini karena memberi tangga penamaan tier 1 sampai 3 yang otentik.

### 4.1 Alutsista Support per doktrin [V]

| Unit | Western | Eastern | Eropa |
|---|---|---|---|
| Mobile Artillery | M110 Howitzer → **M1203 NLOS** | 2S3 Akatsiya → **2S35 Koalitsiya-SV** | GCT 155mm → **Panzerhaubitze 2000** |
| Multiple Rocket Launcher | **M270 MLRS** | **BM-21 Grad** | **Teruel** |
| Mobile SAM Launcher | **MIM-23 Hawk** | **9K35 Strela-10** | **Ozelot** |
| Theater Defense System | MIM-14 Nike → **THAAD** | S-125 Neva → **S-400 Triumf** | Bloodhound → **SAMP/T** |

### 4.2 Prasyarat dan hari riset Support [V]

| Unit | Prasyarat | Fitur dan hari riset |
|---|---|---|
| Towed Artillery | Army Base **2** dan Arms Industry 1 | Ranged Combat dengan **jarak serang 75**, Airlift feri 10.000, Air Assault feri 500, tidak bisa menaklukkan |
| Mobile Artillery | Army Base **3** dan Arms Industry 1 | Hari 3 Ranged Combat, hari 19 perlindungan WMD terbatas, hari 24 Airlift; Eastern lebih awal di semua node |
| Multiple Rocket Launcher | Army Base **4** dan Arms Industry 1 | Hari 5 Ranged Combat, hari 27 Airlift |
| Mobile Anti-Air Vehicle | Army Base **1** dan Arms Industry 1 | Hari 1 Ranged Anti Air, hari 11 Airlift, hari 17 Air Assault |
| Mobile SAM Launcher | tidak terdata | Hari 3 Radar dan Ranged Anti Air, hari 16 Airlift, hari 20 Air Assault |
| Theater Defense System | tidak terdata | Hari 5 Radar dan Ranged Anti Air, hari 28 Airlift dan **Reveal Stealth** |
| Mobile Radar | Army Base **2** dan Arms Industry 1 | Hari 3 Radar, hari 14 Airlift, hari 25 Reveal Stealth |

Dua deskripsi dalam game yang penting untuk keseimbangan udara: Mobile SAM **tidak menyerang helikopter terbang rendah**, dan **helikopter terbang rendah menghindari deteksi Theater Defense System**. Mobile Anti-Air memakai meriam gatling 25 mm dan rudal Stinger, serta kesulitan di hutan, rimba, dan tundra.

**Tangga prasyarat Army Base ini layak ditiru persis.** Mobile AA level 1, lalu Towed Artillery dan Radar level 2, lalu Mobile Artillery level 3, lalu MRL level 4. Ini gating berbasis investasi infrastruktur, bukan sekadar menunggu hari.

### 4.3 Damage Distribution Weight dan implikasinya

| Bobot | Unit |
|---|---|
| 10 | Mercenaries (asal data perlu dilacak) |
| 9 | Main Battle Tank |
| 8 | Tank Destroyer |
| 7 | Mechanized, Armored Fighting Vehicle |
| 6 | Amphibious Combat Vehicle, Mobile Artillery, MRL |
| 5 | Airborne, Marines |
| 4 | National Guard, Mobile AA |
| 3 | Motorized, Mobile SAM |
| 2 | Combat Recon Vehicle, Towed Artillery |
| 1 | Special Forces, Theater Defense System, Mobile Radar |

Bobot ini adalah tulang punggung meta penumpukan Conflict of Nations. Unit pendukung bernilai tinggi sengaja diberi bobot rendah agar bertahan lama dalam tumpukan campuran, sementara tank berfungsi sebagai perisai. **Wajib direplikasi.** Tanpa bobot ini semua unit mati merata dan tidak ada alasan taktis untuk menyusun komposisi.

Penalti penumpukan `1 − 0,56 × ln(n/10)` menghasilkan 0,612 pada dua puluh unit dan 0,385 pada tiga puluh unit. Kurva logaritmik menghukum tumpukan maut tanpa melarangnya.

---

## 5. Roster Perang Dunia 1 dan 2 [UNV secara menyeluruh]

Seluruh jalur sumber tertutup. Yang disajikan hanya struktur kategori dari pengetahuan umum, tanpa satu angka pun.

### 5.1 Supremacy 1914

Infantry, Cavalry, Armoured Car, Tank, Heavy Tank, Artillery, Heavy Artillery, Railgun, Balloon, Fortress. Sistem berbasis hari dengan riset yang terbuka per hari, paralel langsung dengan Conflict of Nations. Unit punya moral yang memengaruhi pertempuran. Produksi terikat provinsi dan bangunan. Tidak ada sistem tipe armor berlapis, sehingga matriks kerusakan jauh lebih sederhana.

### 5.2 Call of War 1939

Militia, Infantry, Motorized, Mechanized, Paratroopers, Commandos, Armored Car, Light Tank, Medium Tank, Heavy Tank, Tank Destroyer, Artillery, Anti-Tank, Anti-Air, SP Anti-Air, Rocket Artillery, SP Artillery, Railroad Gun.

Dua mekanik Call of War adalah cikal bakal langsung Conflict of Nations. Pertama, **empat kategori kerusakan** (tanpa lapis baja, lapis baja ringan, lapis baja berat, udara) menjadi sistem tipe armor CoN. Kedua, **jalur doktrin** Axis, Allies, Comintern, dan Pan-Asian menjadi Western, Eastern, European.

---

## 6. Pembanding Hearts of Iron IV [V?]

Wiki Hearts of Iron IV sendiri memberi peringatan bahwa tabelnya tidak sepenuhnya akurat dan disusun dari perlengkapan generasi pertama. Ekstraksi juga menunjukkan pergeseran kolom. Gunakan untuk memahami **rasio antar unit**, bukan sebagai angka mutlak.

Batalion infanteri: Infantry organisasi 100, serang lunak 4,0, pertahanan 2,0, lebar 2. Mountaineers dan Marines organisasi 140 dan 150 dengan pertahanan 2,6. Paratroopers organisasi 130. Motorized serang lunak 12,0, pertahanan 7,0, HP 1200. Mechanized serang keras 2,5, serang udara 46,0, pertahanan 8,0, terobosan 10.

Batalion lapis baja: Light Tank serang lunak 13, keras 4, kekerasan 80 persen. Medium Tank 19 dan 14, kekerasan 90 persen. Heavy Tank 15 dan 12, kekerasan 95 persen. Modern Tank 40 dan 32, kekerasan 98 persen. Tank Destroyer bergerak dari serang keras 10 di kelas ringan sampai 42 di kelas modern. Self-propelled artillery bergerak dari serang lunak 39,1 sampai 92,0. Self-propelled anti-air bergerak dari serang udara 17,2 sampai 57,5.

### 6.1 Pelajaran yang layak diadopsi

| Konsep | Nilai untuk Nation Rise |
|---|---|
| Serang lunak versus serang keras | Sudah ada di Conflict of Nations. Pertahankan. |
| **Armor versus Piercing** | Tidak ada di CoN. Menambahkannya menciptakan counterplay tank destroyer menembus main battle tank, jauh lebih kaya daripada sekadar serang keras tinggi. **Sangat direkomendasikan.** |
| **Hardness** | Menentukan berapa persen kerusakan dihitung sebagai lunak versus keras. Infantry nol persen, Motorized 30, Mechanized 80, tank 90 sampai 98. **Rekomendasi kuat**, karena membuat lunak dan keras menjadi gradasi, bukan biner. |
| Organisation | HP kedua yang pulih cepat; pertempuran berakhir saat organisasi habis. Membuat perang atrisi dan perang manuver terasa berbeda. Menambah kompleksitas antarmuka, pertimbangkan hati-hati. |
| Breakthrough versus Defense | Penyerang memakai terobosan, bertahan memakai pertahanan. Memisahkan peran tanpa unit terpisah. |
| Combat Width | Membatasi berapa unit bisa bertempur bersamaan. **Jangan dipakai bersama penalti penumpukan CoN.** Pilih satu. |

Doktrin darat Hearts of Iron IV: Mobile Warfare menaikkan kecepatan divisi 10 persen dan kecepatan perencanaan 20 persen; Superior Firepower menaikkan serang lunak artileri lini 10 persen; Grand Battleplan menaikkan perencanaan maksimum 10 persen dan tenaga komando harian 0,25; Mass Assault mengurangi penalti kehabisan pasokan 10 persen dan menambah masa tenggang pasokan 48 jam.

**Wawasan struktural:** Hearts of Iron IV memisahkan pohon teknologi, yaitu apa yang bisa dibangun, dari pohon doktrin, yaitu bagaimana cara bertempur. Conflict of Nations menggabungkan keduanya menjadi satu pilihan doktrin di awal permainan. Untuk Nation Rise yang luring dan pemain tunggal, **model dua lapis lebih baik**, karena pemain luring punya waktu untuk mengeksplorasi variasi susunan.

---

## 7. Taksonomi dunia nyata

### 7.1 Infanteri [V klasifikasi kualitatif dari Wikipedia]

| Tipe | Peran | Kekuatan | Kelemahan | Representasi game |
|---|---|---|---|---|
| Ringan | Medan sulit, operasi mandiri | Fleksibel, murah, jejak logistik kecil | Mobilitas strategis rendah, rapuh terhadap lapis baja | HP rendah, serang lunak sedang, tahan keras sangat rendah |
| Motorized | Menduduki dan mempertahankan sasaran | Mobilitas operasional, murah | Kendaraan tanpa perlindungan | HP 15, serang lunak 3,0, unit garnisun |
| Mechanized | Manuver bersama tank | Serang keras tinggi, terlindungi | Mahal, boros bahan bakar | Serang keras 5 sampai 9, HP 22 sampai 35 |
| Airborne | Merebut sasaran di belakang garis | Jangkauan strategis ekstrem | Tanpa kendaraan berat, rapuh setelah mendarat | Air Assault, HP terendah |
| Marine | Serangan dari laut ke darat | Amfibi, unsur kejutan | Rentan saat mendarat | Amphibious, serang lunak tertinggi di tier 3 |
| Mountain | Operasi ketinggian | Bonus medan gunung besar | Lambat, spesialis sempit | Organisasi 140 versus 100 di HoI4 |
| Special Forces | Pengintaian dan aksi langsung | Stealth, jarak pandang besar | Tidak bisa merebut wilayah, mahal | Stealth tak terdeteksi, pandang 40 sampai 50, bobot kerusakan 1 |

### 7.2 Lapis baja

Generasi main battle tank: generasi satu tahun 1945 sampai 1960-an memakai meriam rifled dan baja homogen tanpa stabilisasi, contohnya M48 Patton, T-54, Centurion. Generasi dua tahun 1960 sampai 1970-an menambah pengukur jarak laser, perlindungan NBC, dan penglihatan malam generasi pertama, contohnya M60, T-62, Leopard 1, AMX-30. Generasi tiga tahun 1980 sampai 2000-an menambah **armor komposit**, sistem kendali tembakan terkomputerisasi, pencitraan termal, dan meriam smoothbore 120 atau 125 mm, contohnya M1 Abrams, Leopard 2, T-72, T-80, Challenger, Merkava. Generasi tiga plus menambah armor modular, sistem proteksi aktif, dan sistem manajemen medan perang, contohnya M1A2 SEPv3, Leopard 2A7, T-90M, Type 99A, K2 Black Panther, Merkava Mk.4, Challenger 3, Altay. Generasi empat memakai kubah tanpa awak dan kru dalam kapsul, contohnya T-14 Armata dan Type 100 Tiongkok yang masuk dinas 2025.

Kendaraan tempur infanteri: Bradley, CV90, Puma, BMP-3, K21. Pengangkut personel beroda: Stryker, Boxer, BTR-82A. Pengintai: Fennek, Fox, VBL. Penghancur tank modern beroda: Centauro B1, 2S25 Sprut-SD, AMX-10RC.

### 7.3 Pendukung

Howitzer tarik M777 dan FH70. Meriam swagerak PzH 2000, K9 Thunder, CAESAR, Archer, M109A7, 2S35 Koalitsiya. Peluncur roket ganda HIMARS, M270, PULS, Pinaka, BM-30 Smerch. Pertahanan udara jarak pendek Gepard, Pantsir-S1, Tunguska, Avenger. Rudal darat ke udara menengah NASAMS, IRIS-T SLM, Buk, HQ-16. Rudal jarak jauh S-400 dengan jangkauan 400 km, Patriot PAC-3, THAAD, HQ-9, S-300 dengan jangkauan sekitar 150 km. Radar kontra-baterai AN/TPQ-53, COBRA, Zoopark.

**Pola representasi yang konsisten di semua game:** makin tinggi nilai strategis sebuah aset pendukung, makin rendah bobot kerusakannya dan makin tinggi biayanya. Ini lingkaran desain yang bagus. Pemain diberi aset kuat tetapi harus melindunginya dengan unit lain, sehingga komposisi tumpukan menjadi keputusan nyata.

---

## 8. Struktur pohon teknologi Conflict of Nations [V]

Maksimum dua riset paralel. Biaya berupa pasokan, material langka, dan dana. Saat sebuah peningkatan diteliti untuk satu tipe unit, **semua unit baru dan yang sudah ada dari tipe itu otomatis ditingkatkan**.

Tujuh level dibagi tiga tier: tier 1 mencakup level 1 sampai 3 berupa unit dasar plus dua peningkatan minor, tier 2 mencakup level 4 dan 5 berupa unit baru plus satu peningkatan, tier 3 mencakup level 6 dan 7 berupa unit modern plus peningkatan akhir.

Simbol peningkatan yang berhasil dipetakan: chevron menaikkan tier; petir menaikkan serangan dan pertahanan seperti Engine Upgrade yang menaikkan serang lunak dari 3,0 ke 4,0; plus medis menaikkan HP seperti Personal Armor di hari 24; gunung memberi bonus medan seperti Jungle Warfare Training di hari 5 dan Woodland Warfare Training di hari 17; simbol jangkauan menambah jarak serang seperti Motorized tier 3 yang mendapat jarak 20; perisai anti-udara menaikkan pertahanan terhadap pesawat seperti Man Portable Air Defense di hari 6 atau 7 yang menaikkan tahan sayap tetap dari 0,3 ke 1,0; simbol NBC memberi perlindungan senjata pemusnah massal; simbol pesawat membuka Airlift dari hari 2 sampai hari 28.

### 8.1 Sebaran hari unlock terverifikasi

| Hari | Node |
|---|---|
| 1 | Motorized dasar, Mechanized dasar Eropa, Airborne dasar, Mobile AA Ranged Anti Air |
| 2 | Mechanized dasar Eastern, Marines dasar, **AFV Airlift** |
| 3 | **Mobile Artillery Ranged Combat**, Mobile SAM Radar dan Ranged AA, **Mobile Radar** |
| 4 | Motorized Engine Upgrade I |
| 5 | **MRL Ranged Combat**, **TDS Radar dan Ranged AA**, Special Forces dasar, Airborne Jungle Warfare |
| 6–9 | Motorized MANPAD Eastern, Marines Engine Upgrade, Motorized MANPAD Eropa, SF Portable Air Defense, Marines Portable Air Defense |
| 11–15 | Mechanized lanjut Eropa, Airborne Rapid Deployment, Mobile AA Airlift, Motorized lanjut, Mechanized lanjut Eastern, Marines lanjut, Airborne lanjut, Mobile Radar Airlift, SF lanjut |
| 16–19 | Motorized Engine Upgrade II, Mobile SAM Airlift, **MBT perlindungan WMD terbatas**, Mobile AA Air Assault, Airborne Woodland Warfare, Marines NBC, **AFV perlindungan WMD**, **Mobile Artillery perlindungan WMD** |
| 20–24 | Motorized modern Eastern, SF Amphibious Warfare, Mobile SAM Air Assault, Airborne Advanced Ballistic Armour, Mechanized modern Eropa, Motorized modern Eropa, **MBT Airlift**, Marines modern, Motorized Personal Armor Eastern, **Mobile Artillery Airlift** |
| 25–28 | Airborne modern, **Mobile Radar Reveal Stealth**, Motorized Personal Armor Eropa, SF modern, **MRL Airlift**, **TDS Airlift dan Reveal Stealth** |

**Ritme yang terlihat:** unlock tersebar merata sepanjang 28 hari dengan tiga gelombang jelas. Hari 1 sampai 5 membuka unit dasar semua kategori. Hari 11 sampai 15 membuka tier 2. Hari 20 sampai 28 membuka tier 3 dan utilitas akhir. Doktrin Eastern konsisten mendapat unlock pendukung lebih awal, Western mendapat lapis baja dan Airlift lebih awal, Eropa seimbang.

---

## 9. Usulan pohon riset darat Nation Rise Modern [USULAN]

Empat epoch menggantikan hari mentah, agar pohon tetap valid bila panjang kampanye berubah. Sebaran node yang dipertahankan: 20 persen di epoch 1, 25 persen di epoch 2, 30 persen di epoch 3, 25 persen di epoch 4.

| Epoch | Setara hari CoN | Tema |
|---|---|---|
| E1 Mobilisasi | 1–6 | Unit dasar, garnisun, pengintaian |
| E2 Konsolidasi | 7–14 | Dukungan tembakan, pertahanan udara, infanteri tier 2 |
| E3 Eskalasi | 15–22 | Lapis baja berat, rudal darat ke udara, infanteri tier 3 |
| E4 Perang Total | 23–28 dan seterusnya | Serangan dalam, pertahanan rudal balistik, perang jaringan |

### 9.1 Cabang Infanteri

Small Arms Standardization di E1 tanpa prasyarat membuka Motorized tier 1. Motorized Transport membuka level 2 dengan kecepatan naik dari 1,00 ke 1,30. MANPADS Integration menaikkan tahan sayap tetap dari 0,3 ke 1,0 dan sayap putar dari 0,6 ke 1,3. Recruiting Doctrine membuka National Guard. Amphibious Training dengan Naval Base 2 membuka Naval Infantry. Airborne Training dengan Air Base 2 membuka Airmobile. Special Operations di akhir E1 dengan Army Base 3 membuka Special Forces beserta Stealth, Reveal Stealth, dan Scout. IFV Program dengan Army Base 2 membuka Mechanized dengan serang keras 5,0. Jungle Warfare menaikkan pertahanan rimba 25 persen untuk semua infanteri.

E2 membuka Advanced Infantry Kit menjadi Motorized tier 2, Engine Upgrade II menaikkan kecepatan ke 1,50, Advanced IFV menjadi Mechanized tier 2 dengan serang keras 7 sampai 8, Advanced Marines dengan serang lunak 8,0, Rapid Deployment menambah jangkauan Air Assault 100, dan Advanced Special Forces dengan serang lunak 10 sampai 12.

E3 membuka Woodland Warfare, Mountain Warfare yang memperkenalkan unit Mountain Infantry baru, NBC Protection dengan pengurangan kerusakan 50 persen, Modern Infantry yang memberi Motorized tier 3 dan jarak serang 20, Modern IFV dengan HP 35 dan serang keras 9,0, serta Modern Marines dengan serang lunak 11 dan HP 28.

E4 membuka Personal Armor menambah 2 HP, Modern Airborne, dan Modern Special Forces dengan serang lunak 13 dan jarak pandang 50. Loitering Munitions dan UGV Program berjenjang dari E2 sampai E4 dengan waktu isi ulang menurun.

### 9.2 Cabang Lapis Baja

E1 dimulai dari Reconnaissance Doctrine yang memberi Combat Recon Vehicle sebagai unit awal, lalu Light Armor dengan Arms Industry 1 membuka Armored Fighting Vehicle, lalu Strategic Airlift memberi AFV kemampuan Airlift dengan C-5M dan feri 10.000.

E2 membuka Amphibious Armor dengan Naval Base 2, Main Battle Tank Program dengan Army Base 2 memberi HP 45 dan rating 9,0 serta 8,0, Composite Armor menaikkan serang keras dari 8 ke 9 dan menambah rating Armor, serta Anti-Tank Guided Munitions membuka Tank Destroyer dengan Piercing tinggi.

E3 membuka Advanced Fire Control System memberi MBT tier 2 dengan serang lunak 11 dan HP 50 sampai 52, Advanced AFV, WMD Protection 50 persen untuk semua lapis baja, dan Advanced Tank Destroyer.

E4 membuka Modern MBT dengan HP 55 dan rating 13 serta serang bangunan 0,4, Armor Airlift, Active Protection System yang mengurangi kerusakan rudal dan peluru kendali anti-tank 25 persen, dan Modern Tank Destroyer.

### 9.3 Cabang Pendukung

E1 membuka Point Air Defense dengan Army Base 1 memberi Mobile AA, Battlefield Radar dengan Army Base 2 memberi Mobile Radar, Ranged Combat dengan Army Base 2 memberi Towed Artillery jarak 75, dan Medium SAM memberi Mobile SAM yang tidak menyerang helikopter rendah.

E2 membuka Self-Propelled Artillery dengan Army Base 3, Theater Air Defense memberi Theater Defense System, Rocket Artillery dengan Army Base 4 memberi MRL, dan Support Airlift tahap pertama.

E3 membuka Air Assault untuk unit anti-udara, **Counter-Battery Radar** sebagai node baru yang mengungkap artileri musuh dalam radius dan menaikkan serangan artileri sendiri terhadap artileri 25 persen, Artillery NBC, dan Precision Munitions yang menambah 2 rating dan mengurangi kerusakan populasi 25 persen.

E4 membuka Modern Self-Propelled Gun, Long-Range Rockets menambah 25 jarak serang, **Reveal Stealth Network** yang memberi radar dan Theater Defense System kemampuan mengungkap stealth, **Ballistic Missile Defense** yang memungkinkan Theater Defense System menyerang rudal balistik, dan Support Airlift tahap kedua.

---

## 10. Usulan roster final Nation Rise Modern [USULAN dengan basis V]

Angka bertanda **[V]** cocok persis dengan Conflict of Nations dan tidak boleh diubah tanpa alasan.

### 10.1 Infanteri

| Kelas | Tier | HP | Lunak serang/tahan | Keras serang/tahan | Tahan sayap tetap | Tahan sayap putar | Jarak | Pandang | Bobot | Prasyarat |
|---|---|---|---|---|---|---|---|---|---|---|
| Motorized | 1 | 15→17 **[V]** | 3,0/3,8 **[V]** | 2,0/2,5 **[V]** | 0,3→1,0 **[V]** | 0,6→1,3 **[V]** | 0 | 25/35 | **3** | Army Base 1 |
| | 2 | 20 **[V]** | 5,0/6,3 **[V]** | 3,0→3,5 / 3,8→4,4 | 1,3 | 1,3→1,9 | 0 | 25/35 | 3 | Army Base 1 |
| | 3 | 22→25 **[V]** | 6,0→6,5 / 7,5→8,1 | 4,5/5,6 | 1,6 | 1,9 | **20** | 25/35 | 3 | Army Base 1 |
| Mechanized | 1 | 22 | 4,0/5,0 **[V EU]** | 5,0→6,0 / 6,3→7,5 **[V]** | 1,3 | 1,9 | 0 | 25 | **7** | AB2, RO1 |
| | 2 | 27→30 **[V]** | 6,0/7,5 **[V]** | 7,0→8,0 / 8,8→10,0 **[V]** | 1,9 | 2,5→3,1 | 0 | 25 | 7 | AB2, RO1 |
| | 3 | **35 [V]** | 8,0/11,0 **[V]** | 9,0/11,3 **[V]** | 3,1 | 3,7 | 0 | 25 | 7 | AB2, RO1 |
| National Guard | 1 | 12–18 berskala moral **[V mekanik]** | 2,5/4,5 | 1,5/2,0 | 0,3 | 0,6 | 0 | 20 | **4** | **Recruiting Office 1 [V]** |
| | 2 | 16–24 | 3,5/6,0 | 2,0/2,8 | 0,8 | 1,0 | 0 | 20 | 4 | RO1 |
| Naval Infantry | 1 | 19→21 **[V]** | 6,0→7,0 / 3,4→4,0 **[V]** | 3,0/1,7 **[V]** | 0,5→1,0 **[V]** | 0,6→1,1 **[V]** | 0 | 25/35 | **5** | AB2, NB2, RO1 **[V]** |
| | 2 | 24→25 **[V]** | 8,0/4,6 **[V]** | 4,0/2,3 **[V]** | 1,5 | 1,2 | 0 | 25/35 | 5 | sama |
| | 3 | **28 [V]** | **11,0**/6,0 **[V]** | 5,0/2,9 **[V]** | 1,5 | 1,2 | 0 | 25/35 | 5 | sama |
| Airmobile | 1 | 15 **[V]** | 5,0→6,0 / 3,3→4,0 **[V]** | 3,0→3,5 / 2,0→2,3 **[V]** | 0,3 **[V]** | 0,7 **[V]** | 0 | 25/35 | **5** | AB1, AirB2, RO1 **[V]** |
| | 2 | 17→18 **[V]** | 7,0→8,0 / 4,7→5,3 **[V]** | 4,0→4,5 / 2,7→3,0 **[V]** | 0,7 **[V]** | 0,7 **[V]** | 0 | 25/35 | 5 | sama |
| | 3 | **20 [V]** | 9,0/6,0 **[V]** | 5,0/3,3 **[V]** | 1,0 **[V]** | 0,7 **[V]** | 0 | 25/35 | 5 | sama |
| Special Forces | 1 | **15**/12 **[V]** | **7,0/4,7 [V]** | 4,0/2,7 **[V]** | 0,7→1,3 **[V]** | 1,3→2,0 **[V]** | 0 | **40 / 50 gunung [V]** | **1** | **AB3**, AirB1, RO1 **[V]** |
| | 2 | 20/12 **[V]** | 10→12 / 6,7→8,0 **[V]** | 6,0/4,0 **[V]** | 1,7 **[V]** | 2,7 **[V]** | 0 | 40/50 | 1 | sama |
| | 3 | 20/12 **[V]** | **13,0**/9,0 **[V]** | 8,0/5,3 **[V]** | 2,3 **[V]** | 3,3 **[V]** | 0 | 40/50 | 1 | sama |
| Mountain Infantry (baru) | 1 | 18→20 | 5,5/6,5 | 3,0/3,5 | 0,5 | 1,0 | 0 | 30/45 gunung | 3 | AB2, RO1 |
| | 2 | 22→25 | 7,5/9,0 | 4,5/5,0 | 1,2 | 1,6 | 0 | 30/45 | 3 | AB2, RO1 |

Modifier medan Mountain Infantry usulan: serangan naik 75 persen dan pertahanan naik 50 persen di gunung, serangan turun 40 persen di medan terbuka, netral di hutan.

### 10.2 Lapis baja

| Kelas | Tier | HP | Lunak | Keras | Sayap putar | Bangunan | Pandang | Kecepatan terbuka | Bobot | Prasyarat |
|---|---|---|---|---|---|---|---|---|---|---|
| Combat Recon Vehicle | 1 | 14→16 | 3,0/2,5 | 2,5/2,0 | 0,8 | 0,1 | **45** | 1,80 | **2** | unit awal **[V]** |
| Armored Fighting Vehicle | 1 | 26→28 | 6,0/5,0 | 6,0/6,0 | 1,0 | 0,2 | 30 | 1,50 | **7** | AB2, AI1 |
| | 2 | 30→34 | 8,0/6,5 | 8,0/8,0 | 1,5 | 0,2 | 30 | 1,60 | 7 | AB2, AI1 |
| | 3 | 36→38 | 10/8,0 | 10/10 | 2,0 | 0,3 | 30 | 1,70 | 7 | AB2, AI1 |
| Amphibious Combat Vehicle | 1 | 24→26 | 5,5/4,5 | 5,0/5,0 | 1,0 | 0,2 | 30 | 1,40 air 2,0 | **6** | AB2, AI1, NB2 |
| | 2 | 28→32 | 7,5/6,0 | 7,0/7,0 | 1,5 | 0,2 | 30 | 1,50 | 6 | sama |
| | 3 | 34→36 | 9,5/7,5 | 9,0/9,0 | 2,0 | 0,3 | 30 | 1,60 | 6 | sama |
| Main Battle Tank | 1 | **45→47 [V]** | **9,0/9,0 [V]** | **8,0→9,0 [V]** | **1,0 [V]** | **0,3 [V]** | **25 [V]** | 1,40 | **9** | **AB2, AI1 [V]** |
| | 2 | 50→52 **[V]** | **11/11 [V]** | **10,0/10,0 [V]** | **1,5 [V]** | 0,3 **[V]** | 25 **[V]** | 1,50 | 9 | AB2, AI1 |
| | 3 | **55 [V]** | **13/13 [V]** | **12→13 [V]** | **2,0 [V]** | **0,4 [V]** | 25 **[V]** | 1,55 | 9 | AB2, AI1 |
| Tank Destroyer | 1 | 28→30 | 4,0/3,0 | 11,0/6,0 | — **[V]** | 0,2 | 30 | 1,50 | **8** | **AB2, AI1 [V]** |
| | 2 | 32→36 | 5,0/4,0 | 14,0/7,5 | — | 0,3 | 30 | 1,60 | 8 | AB2, AI1 |
| | 3 | 38→40 | 6,0/5,0 | **18,0**/9,0 | — | 0,3 | 30 | 1,65 | 8 | AB2, AI1 |

Nama alutsista, dengan AFV terverifikasi dan sisanya usulan:

| Kelas | Western | Eastern | Eropa |
|---|---|---|---|
| Combat Recon Vehicle | M1117 Guardian | BRDM-2 | Fennek |
| **Armored Fighting Vehicle** | **M551 Sheridan [V]** → Stryker MGS → Booker | **BMP-2 [V]** → BMP-3 → Kurganets-25 | **FV101 Scorpion [V]** → CV90 → Boxer RCT30 |
| Amphibious Combat Vehicle | AAV-7 → ACV 1.1 | BTR-82A → BMD-4M | AMX-10P → VBCI |
| Main Battle Tank | M60 → M1A1 → M1A2 SEPv3 | T-72 → T-90 → T-90M atau T-14 | Leopard 1 → Leopard 2A4 → Leopard 2A7 |
| Tank Destroyer | M1128 MGS → Booker | 2S25 Sprut-SD → Khrizantema-S | Centauro B1 → Centauro II |

### 10.3 Pendukung

| Kelas | Tier | HP | Lunak | Keras | Sayap tetap serang | Sayap putar serang | Misil serang | Jarak | Pandang | Bobot | Prasyarat |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Towed Artillery | 1 | 12 | 9,0/1,5 | 4,0/1,0 | — **[V]** | — **[V]** | — | **75 [V]** | 20 | **2** | **AB2, AI1 [V]** |
| | 2 | 14 | 12,0/2,0 | 5,5/1,3 | — | — | — | 80 | 20 | 2 | sama |
| | 3 | 16 | 15,0/2,5 | 7,0/1,6 | — | — | — | 85 | 20 | 2 | sama |
| Mobile Artillery | 1 | 20 | 11,0/3,0 | 5,0/2,0 | — | — | — | 90 | 22 | **6** | **AB3, AI1 [V]** |
| | 2 | 24 | 14,0/4,0 | 6,5/2,5 | — | — | — | 100 | 22 | 6 | sama |
| | 3 | 28 | 18,0/5,0 | 8,0/3,0 | — | — | — | 110 | 22 | 6 | sama |
| Multiple Rocket Launcher | 1 | 18 | 16,0/2,0 | 6,0/1,5 | — | — | — | 110 | 22 | **6** | **AB4, AI1 [V]** |
| | 2 | 21 | 21,0/2,5 | 8,0/1,8 | — | — | — | 130 | 22 | 6 | sama |
| | 3 | 24 | 27,0/3,0 | 10,0/2,2 | — | — | — | 150 | 22 | 6 | sama |
| Mobile Anti-Air | 1 | 18 | 3,0/2,5 | 1,5/1,5 | **6,0** | **9,0** | — | 35 | 30 | **4** | **AB1, AI1 [V]** |
| | 2 | 21 | 4,0/3,0 | 2,0/1,8 | **8,5** | **12,0** | — | 40 | 32 | 4 | sama |
| | 3 | 24 | 5,0/3,5 | 2,5/2,0 | **11,0** | **15,0** | 2,0 | 45 | 35 | 4 | sama |
| Mobile SAM | 1 | 14 | 1,0/1,0 | 0,5/0,8 | **14,0** | **— [V heli rendah lolos]** | 3,0 | 90 | 60 radar | **3** | AB2, AI1 |
| | 2 | 16 | 1,2/1,2 | 0,6/1,0 | **18,0** | — | 5,0 | 110 | 70 | 3 | sama |
| | 3 | 18 | 1,5/1,5 | 0,8/1,2 | **23,0** | — | 7,0 | 130 | 80 | 3 | sama |
| Theater Defense System | 1 | 12 | 0,5/0,8 | — | **20,0** | **— [V]** | **10,0** | 180 | 120 radar | **1** | AB3, AI2 |
| | 2 | 14 | 0,5/1,0 | — | **26,0** | — | **15,0** | 220 | 150 | 1 | sama |
| | 3 | 16 | 0,5/1,2 | — | **33,0** | — | **21,0** | 260 | 180 | 1 | sama |
| Mobile Radar | 1 | 12 | — | — | — | — | — | 0 | **100 radar** | **1** | **AB2, AI1 [V]** |
| | 2 | 14 | — | — | — | — | — | 0 | **140** | 1 | sama |
| | 3 | 16 | — | — | — | — | — | 0 | **180** dan Reveal Stealth **[V]** | 1 | sama |

Nama alutsista pendukung, empat baris pertama seluruhnya terverifikasi:

| Kelas | Western | Eastern | Eropa |
|---|---|---|---|
| **Mobile Artillery** | **M110 Howitzer → M1203 NLOS** | **2S3 Akatsiya → 2S35 Koalitsiya-SV** | **GCT 155mm → Panzerhaubitze 2000** |
| **Multiple Rocket Launcher** | **M270 MLRS** | **BM-21 Grad** | **Teruel** |
| **Mobile SAM** | **MIM-23 Hawk** | **9K35 Strela-10** | **Ozelot** |
| **Theater Defense System** | **MIM-14 Nike → THAAD** | **S-125 Neva → S-400 Triumf** | **Bloodhound → SAMP/T** |
| Towed Artillery | M777 → M777A2 ER | D-30 → 2A65 Msta-B | FH70 → TRF1 |
| Mobile Anti-Air | M6 Linebacker → Avenger | Tunguska → Pantsir-S1 | Gepard → Skyranger 30 |
| Mobile Radar | AN/TPQ-53 | Zoopark-1 | COBRA |

---

## 11. Rekomendasi mekanik

1. **Adopsi Hardness dari Hearts of Iron IV.** Ganti biner lunak dan keras dengan persentase: National Guard nol, Motorized 15, artileri 30, Mechanized 60, Armored Fighting Vehicle 70, Tank Destroyer 80, Main Battle Tank 90. Kerusakan masuk dihitung sebagai `kerusakan_lunak × (1 − hardness) + kerusakan_keras × hardness`. Ini membuat lawan tandingan terasa bergradasi, bukan hidup atau mati.
2. **Adopsi Armor versus Piercing.** Main Battle Tank tier 3 mendapat Armor 13, Tank Destroyer tier 3 mendapat Piercing 18 sehingga menembus. Armored Fighting Vehicle tier 1 dengan Piercing 6 tidak menembus dan kerusakannya dipotong separuh. Ini memberi Tank Destroyer alasan eksistensi yang jelas.
3. **Pertahankan Damage Distribution Weight apa adanya.** Angkanya sudah teruji bertahun-tahun.
4. **Pertahankan penalti penumpukan** `1 − 0,56 × ln(n/10)` dan **jangan** menambahkan Combat Width Hearts of Iron IV di atasnya. Dua sistem pembatas tumpukan sekaligus akan membingungkan.
5. **Pertahankan tangga prasyarat Army Base persis seperti Conflict of Nations**: Mobile AA level 1, Towed Artillery dan Radar level 2, Mobile Artillery level 3, MRL level 4.

---

## 12. Celah yang tersisa dan cara menutupnya

| Celah | Kepentingan | Cara verifikasi |
|---|---|---|
| Stat numerik doktrin Western untuk semua unit | Tinggi | Buka wiki dari peramban biasa; bagian Western kosong pada ekstraksi, kemungkinan dirender lewat template |
| Stat numerik AFV, ACV, Tank Destroyer, CRV, dan seluruh Support | Tinggi | Halaman wiki memang stub; sumber terbaik adalah panel info unit dalam game atau spreadsheet komunitas |
| Nama alutsista Main Battle Tank per doktrin | Sedang | Dalam game, atau halaman wiki versi lebih baru |
| Seluruh data Supremacy 1914 dan Call of War | Tinggi | Dari alamat rumah, bukan pusat data |
| Verifikasi tabel Hearts of Iron IV | Sedang | Ambil ulang dan baca tabel secara manual |
| Asal angka Damage Distribution Weight Mercenaries | Sedang | Empat unit tidak ada di wiki; lacak sumber aslinya |
