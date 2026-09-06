# Audit Tiga Sumber Conflict of Nations dan Data yang Baru Ditemukan

> Sesi 5 (2026-09-05), gelombang riset kedua atas dua domain yang diberikan Billy. Menggantikan sebagian kesimpulan dokumen 30 sampai 32. Penanda: **[V]** terverifikasi dengan URL, **[UNV]** tidak ditemukan.

## 1. Tiga sumber, tiga sifat berbeda

| Sumber | Sifat | Nilai |
|---|---|---|
| `conflictofnations.wiki.gg` | Wiki komunitas, dipakai gelombang pertama | Sebagian angka darat |
| **`wiki.conflictnations.com`** | **Mirror HTML statis** wiki resmi Bytro, bukan MediaWiki hidup | **Nol angka statistik**, tetapi **otoritatif** untuk nama alutsista, hari unlock, dan Echelon |
| **`conflictnations.fandom.com`** | MediaWiki 1.43.9 hidup, 1.589 halaman, API terbuka | **Satu-satunya sumber angka**, tetapi tidak merata |

### 1.1 Cara mengakses wiki resmi Bytro

Ini pelajaran metodologis yang mahal. Percobaan pertama menyimpulkan situs mati total, karena setiap URL mengembalikan HTML identik sebesar 17.032 byte. **Kesimpulan itu salah.** Penyebabnya skema URL.

| Skema | Hasil |
|---|---|
| `/wiki/<Judul>` | Selalu Main Page, 17.032 byte |
| `/index.php/<Judul>` | Selalu Main Page |
| `api.php` dan `?action=raw` | Mati, karena bukan MediaWiki hidup |
| **`/<Judul>` atau `/<Judul>.html`** | **Berhasil** |

Aset dirujuk sebagai `load.php@debug=false` dengan karakter `@` menggantikan `?`, ciri khas hasil mirror wget atau HTTrack. Ukuran 17.032 byte adalah penanda halaman tidak ditemukan.

Peringatan ejaan: wiki resmi memakai ejaan Britania dan kadang huruf kecil, misalnya `Motorised_Infantry`, `Theatre_Defense_System`, dan `Mobile_Anti-air_vehicle`.

### 1.2 Cara mengakses Fandom

Fandom memblokir HTML ke bot dengan 403, **tetapi `api.php` terbuka penuh**. Seluruh wiki hanya 691 KB wikitext dan bisa diunduh dalam sekitar empat puluh permintaan, lalu di-grep secara lokal sehingga cakupannya seratus persen.

```
api.php?action=query&list=allpages&aplimit=500&apnamespace=0&format=json
api.php?action=query&prop=revisions&rvprop=content&rvslots=main&titles=<sampai 50 judul>
```

Pencarian teks penuh Fandom **tidak mengindeks isi**, sehingga penemuan halaman harus lewat enumerasi, bukan pencarian.

### 1.3 Kenapa halaman unit begitu banyak yang kosong

Jawabannya kini diketahui. Di wiki resmi Bytro, bagian "Tiers" pada **enam belas halaman unit udara** memuat **nol elemen tabel**; isinya hanya **satu gambar** berisi grid doktrin dikali tier. Bytro memang tidak pernah menerbitkan angka dalam bentuk teks, hanya sebagai seni. Mayoritas halaman unit udara terakhir disunting **Maret sampai April 2018**.

**Kesimpulannya bukan bahwa kita gagal mencari, melainkan bahwa angkanya memang tidak pernah diterbitkan.** Untuk kategori udara dan laut, angka harus dirancang sendiri. Itu kesimpulan yang sekarang berdiri di atas bukti, bukan dugaan.

---

## 2. Sistem Echelon, pengganti Damage Distribution Weight [V]

Tabel bobot kerusakan numerik **tidak ada di sumber mana pun**. Halaman Damage Distribution Weight hanya memuat satu kalimat definisi. Namun wiki resmi memuat **klasifikasi Echelon lengkap**, yaitu mekanik yang persis mengatur unit mana menyerap kerusakan lebih banyak.

| Echelon | Unit darat | Unit udara |
|---|---|---|
| **Pertama**, garis depan, menyerap paling banyak | Mercenaries, **Main Battle Tank**, **Tank Destroyer**, Elite MBT, **Mechanized Infantry**, **Armored Fighting Vehicle**, Elite Railgun | Air Superiority Fighter, Naval ASF, **Helicopter Gunship**, **Attack Helicopter**, Elite Attack Aircraft |
| **Kedua**, menengah | **Amphibious Combat Vehicle**, **Mobile Artillery**, **MRL**, Tank Officer, **Naval Infantry**, **Airmobile**, **National Guard**, **Mobile Anti-Air** | Elite Attack Helicopter, **ASW Helicopter**, **Strike Fighter**, **Naval Strike Fighter**, **Stealth ASF**, **Heavy Bomber** |
| **Ketiga**, belakang, menyerap paling sedikit | **Motorized Infantry**, **Mobile SAM**, **Towed Artillery**, Infantry Officer, **Combat Recon Vehicle**, UGV, **Mobile Radar**, **Theater Defense System**, **Special Forces**, Airborne Officer | Rotary Officer, **Naval Patrol Aircraft**, **Stealth Strike Fighter**, Elite Heavy Bomber, Fixed Wing Officer, drone, **Stealth Bomber**, **AWACS**, **Naval AWACS** |

**Ini lebih baik daripada bobot numerik untuk Nation Rise.** Tiga tingkat lebih mudah dipahami pemain daripada skala satu sampai sepuluh, mudah ditampilkan di antarmuka, dan cocok dengan bahasa militer nyata. Nilai bobot yang tercatat di dokumen kita bisa dipetakan ke tiga echelon ini: bobot tujuh ke atas menjadi echelon pertama, empat sampai enam menjadi kedua, dan tiga ke bawah menjadi ketiga.

---

## 3. Kelas armor resmi dan koreksi penting [V]

Kelas armor resmi hanya **tujuh**: Soft, Hard, Fixed Wing, Rotary Wing, Naval, Submarine, dan Missile.

**Koreksi:** Buildings dan Population **bukan kelas armor**. Keduanya adalah **kategori kerusakan terpisah**, terlihat jelas di blok statistik Stealth Strike Fighter. Ini menyederhanakan model data kita: matriks rating berukuran tujuh kolom, ditambah dua kolom kerusakan struktural yang dihitung terpisah.

---

## 4. Mekanik anti-udara, akhirnya lengkap [V]

Angka yang gelombang pertama tidak berhasil temukan kini ada.

| Kasus | Aturan |
|---|---|
| **Point Defense**, ketika misil atau pesawat menyerang tumpukan yang **berisi** unit anti-udara | Unit anti-udara membela **setiap kali, tanpa cooldown sama sekali**. Dua misil berjeda satu detik maupun satu jam, keduanya dicegat |
| **AA Envelope**, ketika sasaran berada dalam jangkauan tetapi **beda tumpukan** | Unit anti-udara masuk **cooldown sepuluh menit** setelah satu intersepsi |

Kutipan langsung: kemampuan Anti-Air memungkinkan unit menyerang pesawat dalam jangkauan **setiap sepuluh menit** walaupun pesawat itu tidak menyerangnya secara langsung, dan penghitung waktunya independen dari jangkauan serang.

Contoh resmi dari wiki: tiga misil ditembakkan berurutan. Misil pertama ke infanteri dicegat. Misil kedua ke infanteri **lolos** karena selubung sedang cooldown. Misil ketiga langsung ke unit anti-udara dicegat, karena dihitung sebagai pertahanan titik.

**Tidak ada satu pun angka probabilitas intersepsi di sumber mana pun.** Modelnya **deterministik dan digerbangi cooldown**, bukan probabilistik. Ini keputusan desain yang layak ditiru karena membuat perhitungan pemain bisa diandalkan.

Pengisian bahan bakar standar **lima belas menit**, dan terdegradasi mengikuti rumus **satu dibagi persentase HP dikali lima belas menit**, sehingga pangkalan pada 40 persen HP membutuhkan 37,5 menit.

---

## 5. Nama alutsista per doktrin, dari sumber resmi [V]

Ini panen terbesar dari wiki resmi Bytro.

### 5.1 Darat

| Unit | Western | Eastern | European |
|---|---|---|---|
| **Main Battle Tank** | **M1A1 Abrams** | **T-80** | **Leopard 2** |
| Combat Recon Vehicle | M113 | BDRM-1 | Fox FV721 |
| Amphibious Combat Vehicle | M113 | BTR-80 | Fuchs |
| Tank Destroyer | M1134 Stryker ATGM | BMPT-72 Terminator II | Centauro |
| Armored Fighting Vehicle | M551 Sheridan | BMP-2 | FV101 Scorpion |
| Mobile Artillery tier 1 dan 3 | M110 Howitzer, lalu M1203 NLOS | 2S3 Akatsiya, lalu 2S35 Koalitsiya-SV | GCT 155mm, lalu Panzerhaubitze 2000 |
| Multiple Rocket Launcher | M270 MLRS | BM-21 Grad | Teruel |
| Mobile Anti-Air Vehicle | M163 VADS | 9K35 Strela-10 | Gepard |
| Mobile SAM Launcher | MIM-23 Hawk | 9K35 Strela-10 | Ozelot |
| Theater Defense System tier 1 dan 3 | MIM-14 Nike, lalu THAAD | S-125 Neva, lalu S-400 Triumf | Bloodhound, lalu SAMP/T |
| Motorized Infantry | JLTV | BPM-97 dan KrAZ-255, lalu Tigr | Unimog, lalu Mowag Eagle, lalu LGS Fennek |
| Special Forces | US Army Rangers | Spetsnaz | SAS |
| National Guard | — | UAZ-469 | — |

### 5.2 Udara, lengkap tiga tier tiga doktrin

Dibaca dari aset gambar resmi. Enam unit punya grid lengkap.

| Unit | Doktrin | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|---|
| **Attack Helicopter** | Western | AH-6M Little Bird | AH-1Z Viper | AH-64D Apache Longbow |
| | Eastern | Ka-50 Black Shark | Mi-24 Hind | Mi-28 Havoc |
| | European | A129 Mangusta | Super Puma | Tiger |
| **Helicopter Gunship** | Western | AH-6M Little Bird | MD 500 Defender | UH-1Y Venom |
| | Eastern | Mi-8 TVK | Mi-24 Hind | Mi-35M |
| | European | Gazelle | Super Puma | NH-90 |
| **Air Superiority Fighter** | Western | F-5 Tiger | F-16A Fighting Falcon | F-16V Viper |
| | Eastern | MiG-23 Flogger | MiG-29 Fulcrum | MiG-35 Super Fulcrum |
| | European | J 35A Draken | Mirage F1 | Typhoon |
| **Naval ASF** | Western | F-4 Phantom II | F-14A Tomcat | F-14D Super Tomcat |
| | Eastern | Yak-141 | Su-33 Flanker D | MiG-29K |
| | European | Etendard IVM | Jaguar M | Rafale M |
| **Naval Strike Fighter** | Western | A-6 Intruder | A-7 Corsair II | *(aset salah label; teks menyebut F/A-18 Super Hornet)* |
| | Eastern | Yak-38 | Su-27K | Su-34K |
| | European | Harrier | Super Etendard | Harrier II Plus |
| **UAV** | Western | MQ-1 Predator | RQ-4 Global Hawk | X-47B |
| | Eastern | Zond II | United 40 B5 | MiG Skat |
| | European | Super Heron | MQ-9 Reaper | nEUROn |

Nama parsial dari prosa untuk unit tanpa grid: Strike Fighter Western adalah F-15; Stealth ASF Western adalah F-22 Raptor; Stealth Strike Fighter Western adalah F-35 Lightning II dan Eastern adalah Su-57; Naval AWACS Western adalah E-2 Hawkeye.

Sembilan unit udara sisanya tidak punya nama per tier: ASW Helicopter, Strike Fighter, Stealth ASF, Stealth Strike Fighter, Naval Patrol Aircraft, AWACS, Naval AWACS, Heavy Bomber, dan Stealth Bomber.

**Peringatan kualitas sumber.** Aset resmi memuat kesalahan, yaitu sel Naval Strike Fighter tier 3 Western berlabel kendaraan darat. Teks Fandom juga bertentangan dengan aset pada UAV tier 2 dan 3. Untuk nama, aset gambar lebih kredibel, tetapi tetap perlu diperiksa kewajarannya.

---

## 6. Hari unlock riset udara, lengkap lima belas unit [V]

| Unit | Fitur inti | Fitur lanjutan |
|---|---|---|
| Air Superiority Fighter | **Hari 1** | — |
| Helicopter Gunship | **Hari 2** | — |
| Attack Helicopter | **Hari 2** | — |
| Strike Fighter | **Hari 2** | Hari 11 peluncuran rudal jelajah |
| ASW Helicopter | **Hari 3** | — |
| Naval ASF | **Hari 4** | — |
| UAV | **Hari 4** | Hari 5 stealth dan pengungkap stealth; hari 28 peluncuran dari kapal induk |
| Naval Patrol Aircraft | **Hari 4** | Hari 19 peluncuran rudal jelajah |
| Heavy Bomber | **Hari 4** | **Hari 31 mengabaikan bunker musuh** |
| Aircraft Carrier | **Hari 4** | — |
| AWACS | **Hari 6** | Hari 25 pengungkap stealth |
| Stealth ASF | **Hari 16** | — |
| Stealth Strike Fighter | **Hari 16** | — |
| Stealth Bomber | **Hari 16** | — |
| Naval AWACS | **Hari 18** | — |

---

## 7. Blok statistik baru yang ditemukan

### 7.1 Stealth Strike Fighter Eastern, satu-satunya unit udara berblok lengkap [V]

**Ini jangkar skala untuk seluruh roster udara.**

| Atribut | Nilai |
|---|---|
| Serang lunak dan keras | 11 dan 11 |
| Sayap tetap | 7 serang dan tahan |
| Sayap putar | 8,5 serang dan tahan |
| Laut | 5 serang |
| Bangunan dan populasi | 1,5 dan 4,0 |
| Jangkauan terbang dan tempur | 800 dan 800 |
| Jangkauan feri | 10.000 |
| **Waktu terbang** | **240 menit** |
| Waktu isi bahan bakar | 15 menit |
| Signature radar | Stealth, tidak terdeteksi |
| Biaya mobilisasi | 1.500 pasokan, 800 personel, 400 material langka, 1.450 elektronik, 6.000 dana |
| Upkeep harian | 70 personel, 75 bahan bakar, 75 elektronik, 265 dana |
| Waktu mobilisasi | 1 hari 16 jam |
| Prasyarat | Air Base 5, Secret Weapons Lab 1, Arms Industry 1 |
| Rudal | Satu rudal jelajah, isi ulang 12 jam |
| Echelon | Ketiga, belakang |

Bandingkan dengan rancangan kita di dokumen 31 yang memberi Stealth Strike Fighter tier 1 nilai serang lunak 5,5 dan keras 6,0. **Angka resminya hampir dua kali lipat**, yaitu 11 dan 11. Ini berarti seluruh skala rancangan udara kita perlu dinaikkan, dan kini ada jangkar untuk melakukannya.

### 7.2 Main Battle Tank European level 1 sampai 7, dengan terrain per level [V]

| Level | Lunak | Keras | Tahan sayap putar | Bangunan | HP |
|---|---|---|---|---|---|
| 1 | 9,0 / 9,0 | 8,0 / 8,0 | 1,0 | 0,3 | 45 |
| 2 | 9,0 / 9,0 | 9,0 / 9,0 | 1,0 | 0,3 | 47 |
| 3 | 9,0 / 9,0 | 9,0 / 9,0 | 1,0 | 0,3 | 47 |
| 4 | 11 / 11 | 10,0 / 10,0 | 1,5 | 0,3 | 50 |
| 5 | 11 / 11 | 10,0 / 10,0 | 1,5 | 0,3 | 52 |
| 6 | 13 / 13 | 12 / 12 | 2,0 | 0,4 | 55 |
| 7 | 13 / 13 | 13 / 13 | 2,0 | 0,4 | 55 |

Modifier medan per level, format serang persen dan tahan persen: medan terbuka plus 50 dan plus 25; gunung dan rimba minus 50 dan minus 25; gurun plus 25 dan plus 25; hutan dan tundra netral; **perkotaan dan pinggiran minus 25 dan minus 25 pada level rendah, tetapi penaltinya HILANG di level 7**.

Detail terakhir itu penting. **Riset tier akhir menghapus kelemahan medan**, bukan sekadar menaikkan angka. Ini pola desain yang layak ditiru karena membuat tier akhir terasa mengubah cara bermain, bukan hanya memperbesar bilangan.

Kecepatan naik di level 3, dari 1,30 ke 1,50.

### 7.3 Combat Recon Vehicle level 1 [V]

HP 15, kecepatan 1,0 di semua medan, **jarak pandang 50**, mendeteksi stealth unit darat, kerusakan 2,0 terhadap infanteri dan 1,5 terhadap lapis baja. Tersedia di semua doktrin, Army Base level 1, terbuka hari 1. Air Assault terbuka di level 3 pada hari 8.

### 7.4 Amphibious Combat Vehicle Eastern tier 1 [V]

| Atribut | Level 1 | Level 2 |
|---|---|---|
| Lunak | 7 / 7 | 7 / 7 |
| Keras | 5 / 5 | 5 / 5 |
| Tahan sayap tetap dan putar | 1 dan 1 | 2 dan 2 |
| Bangunan dan populasi | 0,3 dan 3 | 0,3 dan 3 |
| HP darat dan air | 25 dan 12 | 26 dan 12 |
| Mobilisasi | 22 jam | 23 jam |
| Biaya | 1.600 komponen, 600 personel, 650 elektronik, 1.625 dana | 1.675 / 675 / 700 / 1.775 |

Modifier medan: serang minus 25 di gunung, **plus 25 di hutan**, **plus 50 di rimba**, plus 25 di tundra; tahan plus 25 di kota. Signature radar tinggi, tidak bisa menaklukkan wilayah.

**Bonus rimba plus 50 persen sangat relevan untuk Indonesia.**

### 7.5 National Guard Eastern [V]

| Level | Lunak | Keras | HP | Kecepatan | Mobilisasi | Biaya |
|---|---|---|---|---|---|---|
| 1 | 1,5 / 2,3 | 0,5 / 0,7 | 15 | 1,00 | 8 jam | 400 pasokan, 250 komponen, 550 personel, 750 dana |
| 2 | 2 / 3 | 0,5 / 0,7 | 17 | 1,00 | 8 jam 30 | sama |
| 3 | 2 / 3 | 0,5 / 0,8 | 17 | 1,30 | 9 jam | sama |
| tier 3 | 3,5 / 5,3 | 2,0 / 3,0 | — | — | 11 jam | 600 / 450 / 850 / 1.100 |

Bonus pertahanan: medan terbuka plus 25, hutan plus 25, dan **kota serta pinggiran plus 50**. HP bergantung moral kota. Hanya butuh Recruiting Office level 1, tanpa Army Base.

### 7.6 Coastal Battery, unit yang belum kita ketahui [V]

Satu-satunya unit pendukung dengan tabel lengkap.

| Level | Lunak serang/tahan | Keras serang/tahan | **Serang permukaan** | Tahan sayap putar | Tahan misil | Jangkauan |
|---|---|---|---|---|---|---|
| 1 | 0,5 / 0,2 | 0,5 / 0,2 | **3,0** | — | — | 55 |
| 2 | 1,0 / 0,3 | 1,0 / 0,3 | **6,0** | 2,4 | 0,9 | 100 |
| 3 | 1,5 / 0,5 | 1,5 / 0,5 | **8,0** | 3,6 | 2,7 | 100 |

Tidak bergerak, echelon belakang, **dibangun lewat Combat Outpost tanpa riset apa pun**, dan naik level otomatis saat riset Towed Artillery mencapai level 3 dan 6. Modifier medan: serang plus 25 di terbuka, tundra, dan gurun; minus 25 di hutan dan rimba.

**Unit ini sangat relevan untuk peta kepulauan.** Pertahanan pantai murah yang tidak butuh riset adalah jawaban alami bagi negara dengan garis pantai panjang.

### 7.7 UAV parsial [V]

Signature radar rendah tipe sayap tetap, kecepatan 5,00, punya Scout dan Reveal Stealth, waktu riset satu hari, mobilisasi tiga belas jam. HP Western tier 1 sampai 3 adalah 2, 3, dan 5. Kerusakan tier 2 adalah 4 terhadap lapis baja dan 2 terhadap infanteri; tier 3 menjadi 6,5 dan 4. Jangkauan serang tier 2 adalah 3.000 dan jangkauan feri 10.000.

Air Superiority Fighter punya signature **tinggi** dan **radius tempur 650** di level 1.

---

## 8. Keberadaan unit, terkonfirmasi dan terbantah

| Unit | Status |
|---|---|
| **Mercenaries** | **ADA** di kedua wiki. Unik karena produksi dan upkeepnya **hanya personel dan dana**, dan dimobilisasi **di provinsi, bukan kota**. Tanpa angka |
| **Mountain Infantry** | **ADA** di Fandom. Dibuka lewat riset Motorized Infantry level 1, 4, dan 6. Tanpa angka |
| **Helicopter Carrier** | **ADA** sebagai unit resmi. Mekanik konkret: **tidak bisa satu tumpukan dengan Aircraft Carrier**. Halamannya tidak ada, tanpa angka |
| **Patrol Boat** | **ADA** dalam roster resmi, bisa dimobilisasi **tanpa peningkatan Naval Base**, signature rendah, cepat di sungai dan pesisir, penalti berat di laut lepas. Tanpa angka |
| **Coastal Battery** | **ADA** dengan tabel lengkap |
| **Infantry Veteran** | **TIDAK ADA** di ketiga sumber |
| **Tank Veteran** | **TIDAK ADA** di ketiga sumber |
| **Transport Ship** | **BUKAN UNIT.** Ia adalah **status** hasil embarkasi. Halaman 404 memang seharusnya begitu |
| Aircraft Carrier | **Unit Signature**, tidak bisa ditumpuk dengan unit lain |

---

## 9. Rumus yang kini terverifikasi lengkap [V]

Kekuatan sama dengan rating dasar dikali pengali. Pengalinya adalah medan dikali penguat pasukan dikali penguat doktrin dikali penalti penumpukan dikali penalti kesehatan.

Penalti kesehatan adalah **0,25 ditambah 0,75 dikali HP sekarang dibagi HP maksimum**.

Penalti efektivitas tempur adalah **satu dikurangi 0,56 dikali logaritma natural dari ukuran tumpukan dibagi batas tanpa penalti**. Batasnya **sepuluh untuk darat, lima untuk udara, dan lima untuk laut**.

Efisiensi adalah rata-rata efektivitas tempur dan kecepatan gerak.

Penyembuhan: kota memberi satu HP per hari, ditambah satu sampai lima per level Military Hospital; provinsi memberi nol, ditambah satu sampai tiga per level Field Hospital; kapal memulihkan dua HP per hari di perairan pesisir.

Tick tempur dihitung tiap **satu jam**. Pada pertempuran perjumpaan kedua pihak saling menyerang dan bertahan; pada pertempuran menyerang benteng, hanya penyerang yang menyerang.

Atrisi **sudah dihapus** pada 26 Mei 2018.

---

## 10. Yang tetap kosong setelah tiga sumber diaudit

| Celah | Catatan |
|---|---|
| **Statistik doktrin Western untuk seluruh unit darat** | Bukan masalah domain, melainkan lubang nyata di komunitas. Tidak ada satu unit darat pun dengan angka Western |
| **Seluruh tujuh unit kategori Support** | Semuanya stub di ketiga sumber. Hanya Coastal Battery yang lengkap |
| **Armored Fighting Vehicle dan Tank Destroyer** | Nol angka di ketiga sumber |
| **Empat belas dari lima belas unit udara** | Hanya Stealth Strike Fighter Eastern yang punya blok lengkap |
| **Seluruh unit laut** | Nol tabel lengkap |
| **Tabel bobot kerusakan numerik** | Digantikan sistem Echelon tiga tingkat |
| **Rumus konversi kekuatan ke HP** | Halaman rujukannya 404 |
| **Angka bonus Officer** | Halaman Rotary Wing Officer dan Fixed Wing Officer tidak ada di ketiga sumber |
| **Kapasitas pesawat Aircraft Carrier** | Tidak pernah disebut angkanya |
| **Peluang intersepsi anti-udara** | Tidak ada, karena modelnya deterministik bukan probabilistik |

**Sumber wiki sudah habis.** Yang tersisa secara realistis adalah berkas atau API klien game, kumpulan data komunitas, atau ekstraksi langsung dari tooltip dalam permainan.

Satu peringatan arah: dua halaman laut terbaru di Fandom yang disunting Juli 2026 ditulis dalam **gaya prosa tanpa satu pun angka**. Arah editorial wiki itu sedang menjauh dari tabel statistik, bukan menuju. Menunggu wiki terisi kemungkinan besar tidak akan membuahkan hasil.

---

## 11. Catatan kualitas data

Fandom adalah wiki komunitas dengan salah ketik dan ketidakkonsistenan. Contoh konkret: HP Motorized Infantry level 7 tercatat **24** di halaman Eastern tetapi **25** di halaman European, padahal seluruh parameter lain identik. Angka yang dikutip di dokumen ini adalah kutipan apa adanya dan **belum divalidasi silang terhadap permainan**.

Temuan yang meredam asumsi lama: untuk Motorized Infantry, **Eastern dan European ternyata identik di seluruh statistik tempur**. Yang berbeda hanya upkeep tier tiga dan HP di level tujuh. Bila pola ini berlaku umum, maka klaim bahwa ketiga doktrin berbeda HP dan biaya **dampaknya jauh lebih kecil daripada yang selama ini diduga**, dan itu layak diuji ke unit lain sebelum kita menyalin model doktrin apa adanya.

---

## 12. Sensus lengkap dan koreksi metodologis

Gelombang kedua diselesaikan dengan **sensus seratus persen**, bukan sampel. Seluruh 1.589 halaman Fandom diunduh dalam 32 permintaan lalu digrep secara lokal. Berkas lengkapnya 691.168 byte.

### 12.1 Berapa banyak halaman yang benar-benar punya angka

Dari 1.589 halaman di seluruh wiki, **hanya tiga belas** memuat tabel statistik.

| Halaman darat | Tabel | Status |
|---|---|---|
| Motorized Infantry | 6 | Lengkap, Eastern dan European |
| Mechanized Infantry | 6 | Lengkap, Eastern dan European |
| Naval Infantry | 4 | Lengkap European, Eastern hanya tier 1 |
| Airmobile Infantry | 3 | European saja |
| Special Forces | 2 | European saja |
| National Guard | 1 | Eastern, tier 1 dan 3 |
| Main Battle Tank | 2 | **European level 1 sampai 7 lengkap** |
| Coastal Battery | 2 | **Lengkap level 1 sampai 3** |
| Amphibious Combat Vehicle | 1 | Eastern tier 1 saja |
| Combat Recon Vehicle | 2 | Ringkas, level 1 saja |
| Towed Artillery | 1 | Kualitatif, bukan angka |

**Seluruh unit darat lain tidak punya angka sama sekali.**

### 12.2 Statistik doktrin Western dipastikan kosong

Ini bukan kesimpulan dari sampel, melainkan dari sensus. Untuk Motorized Infantry, Mechanized Infantry, dan Naval Infantry, **header bagian Western Doctrine ada tetapi isinya nol byte**. Tidak ada satu unit darat pun yang punya angka Western di sumber mana pun.

Konsekuensinya untuk kita: **pengali doktrin Western harus diturunkan sendiri** dari prinsip HP tertinggi dan biaya tertinggi, bukan disalin.

### 12.3 Koreksi keberadaan unit

**Mercenaries ada, dan sebelumnya gagal ditemukan karena bentuk kata.** Halamannya berjudul **`Mercenary`** dalam bentuk tunggal di Fandom, dan `Mercenaries` dalam bentuk jamak di wiki resmi. Pencarian sebelumnya memakai bentuk yang salah di sumber yang salah. Unit ini dimobilisasi **di provinsi, bukan kota**, hanya menuntut dana dan personel, dan **tidak bisa menaklukkan wilayah**.

**Mountain Infantry ada** di Fandom sebagai varian Motorized Infantry, dan **levelnya terbuka bersamaan dengan level Motorized Infantry di 1, 4, dan 6**. Lebih baik di gunung dan tundra, lebih buruk di medan biasa. Tanpa angka.

**Infantry Veteran dan Tank Veteran dipastikan tidak ada**, kali ini lewat sensus lengkap.

Halaman yang juga tidak pernah dibuat: Land Units, Western Doctrine, Eastern Doctrine, European Doctrine, Entrenchment, Stacking, Hitpoints, Armored, Damage Calculation, dan Strength Calculation Example.

### 12.4 Kecepatan Motorized Infantry per medan per level [V]

Tabel ini sebelumnya belum lengkap.

| Medan | Level 1 | Level 2 dan 4 | Level 5 sampai 7 |
|---|---|---|---|
| Terbuka dan gurun | 1,00 | 1,30 | 1,50 |
| Gunung dan rimba | 0,33 | 0,43 | 0,49 |
| Hutan dan tundra | 0,66 | 0,86 | 0,99 |
| Kota dan pinggiran | 0,50 | 0,65 | 0,75 |
| Laut lepas | 2,51 | 2,51 | 2,51 |
| Perairan pesisir | 1,30 | 1,30 | 1,30 |

Modifier medan Motorized yang kini lengkap: serangan turun 25 persen di gunung, rimba, dan tundra; pertahanan naik 25 persen di kota, pinggiran kota, dan **rimba**, serta turun 25 persen di tundra.

Kecepatan Mechanized European lebih tinggi di semua medan: 1,10 naik ke 1,40 di medan terbuka, 0,36 naik ke 0,46 di gunung dan rimba, 0,73 naik ke 0,92 di hutan dan tundra, dan 0,55 naik ke 0,70 di kota.

### 12.5 Penalti gerak armada laut per jenis perairan [V]

| Ukuran tumpukan | Laut lepas | Perairan dangkal |
|---|---|---|
| 5 sampai 10 unit | 100 persen | **75 persen** |
| 11 unit | 85 persen | **50 persen** |

Ini melengkapi rumus penalti penumpukan. Perairan dangkal menghukum armada besar jauh lebih keras, dan itu **memperkuat argumen desain untuk peta kepulauan**: armada besar tidak nyaman beroperasi di perairan Indonesia, sementara armada kecil justru efisien.

### 12.6 Elite Main Battle Tank per doktrin [V]

Unit musiman pertama, dibuka 13 Agustus 2019: **Black Eagle** untuk Eastern, **Merkava Mark IV** untuk Western, dan **Black Night** untuk European.

### 12.7 Towed Artillery, matriks kualitatif [V]

Halamannya tidak punya angka, tetapi punya matriks arah yang tetap berguna sebagai panduan rancangan.

| | Lunak dan keras darat | Sayap tetap, sayap putar, misil | Permukaan, bangunan, populasi | Kapal selam |
|---|---|---|---|---|
| Serang | positif | negatif | positif | negatif |
| Tahan | positif | negatif | negatif | negatif |
| HP | positif | negatif | positif | positif |

Jangkauan serang 75, jangkauan feri angkut udara 10.000, dan jangkauan serbu udara 500.

### 12.8 Catatan untuk riset lanjutan

Seluruh wikitext tersimpan sebagai satu berkas JSON di direktori scratchpad sesi ini, sehingga bisa digrep ulang tanpa permintaan jaringan baru.

**Untuk mengisi kekosongan kategori Armored, seluruh kategori Support, dan seluruh doktrin Western, tidak ada wiki yang bisa membantu.** Halaman Strength Base Rating sendiri mengarahkan pembaca untuk membaca **panel informasi unit di dalam game**, lewat menu riset lalu memilih unit lalu menekan tombol informasi. Itulah satu-satunya sumber yang tersisa.

---

## 13. Bukti kuantitatif: ini lubang kontributor, bukan batas platform

Sensus atas korpus yang sama menghasilkan angka yang menutup perdebatan.

| Kategori | Jumlah halaman | Tabel | Total digit |
|---|---|---|---|
| **Darat** | 15 | **27** | **4.467** |
| **Udara** | 15 | **0** | 309 |
| **Laut** | 7 | **0** | 49 |

Rincian per halaman udara menunjukkan **nol tabel di kelima belasnya, tanpa kecuali**, padahal panjang halamannya bervariasi dari 633 sampai 3.128 karakter. Bandingkan dengan Motorized Infantry yang punya enam tabel dan 988 digit, atau Main Battle Tank dengan dua tabel dan 775 digit.

**Wiki yang sama sanggup memuat tabel per level lengkap. Kontributornya hanya pernah mengerjakan sisi darat.** Ini kesimpulan yang sekarang berdiri di atas hitungan, bukan kesan.

### 13.1 Koreksi metodologis kedua

Uji MD5 ternyata **tes yang salah** untuk wiki resmi Bytro, karena halaman menyisipkan token Cloudflare per permintaan sehingga hash berubah tiap kali walau isinya sama. **Penanda yang benar adalah ukuran byte**: 17.032 berarti halaman tidak ditemukan. Halaman asli punya ukuran khas dan judul sendiri, misalnya Attack Helicopter 11.377 byte dan Combat 38.973 byte.

Pelajaran umum untuk riset berikutnya: ketika menguji apakah sebuah situs mengembalikan konten nyata, **bandingkan ukuran dan judul, bukan hash**.

---

## 14. Skema kolom baku yang harus ditiru [V]

Ini temuan paling langsung berguna untuk implementasi. Halaman darat memakai satu format tabel yang konsisten, dan format itulah yang sebaiknya menjadi bentuk `units.json` kita.

```
Level | Soft Target | Hard Target | Fixed Wing | Rotary Wing
      | Missile | Surface Vessel | Submarine | Building | Population
```

Tiga aturan pembacaan selnya:

| Isi sel | Arti |
|---|---|
| `9.0/9.0` | Serang 9,0 dan tahan 9,0 |
| `-` | **Tidak bisa terlibat sama sekali** terhadap kelas itu |
| `-/1.0` | **Tidak bisa menyerang, tetapi bisa bertahan** dengan nilai 1,0 |

Satu tabel per doktrin. **Building dan Population adalah kolom terpisah, bukan kelas armor**, konsisten dengan D56.

Aturan `-/1.0` itu penting dan sebelumnya tidak kita miliki. Ia menjelaskan mengapa Main Battle Tank punya entri pertahanan terhadap sayap putar tetapi tidak punya serangan: **tank bisa bertahan dari helikopter, tetapi tidak bisa membalas**. Model kita harus memisahkan kedua arah itu, bukan memakai satu angka.

---

## 15. Dua jangkar skala tambahan

### 15.1 Elite Loitering Munitions, tabel lengkap tiga generasi [V]

Satu-satunya halaman kategori pesawat yang punya tabel angka.

| Generasi | Riset | Terhadap lunak | Terhadap keras | Terhadap helikopter | Terhadap kapal | Biaya perlengkapan | Radius serang |
|---|---|---|---|---|---|---|---|
| 1 | Hari 1 | **20,0** | 15,0 | 4,0 | 15,0 | 8 | 35 |
| 2 | Hari 12 | **25,0** | 17,0 | 9,0 | 25,0 | 12 | 40 |
| 3 | Hari 21 | **30,0** | 20,0 | 13,0 | **45,0** | 15 | 50 |

**Waktu patroli maksimum 24 jam** untuk unit ini, dan itu **satu-satunya angka durasi patroli eksplisit di seluruh korpus**.

Angka ini mengejutkan besarnya. Munisi berkeliaran generasi satu memberi 20 terhadap sasaran lunak, sementara Main Battle Tank level 1 hanya memberi 9. Artinya munisi sekali pakai memang dirancang **jauh lebih mematikan per tembakan** daripada unit permanen, dan itu masuk akal karena ia habis setelah dipakai. Ini pola yang layak ditiru: konsumabel bernilai tinggi, unit permanen bernilai sedang.

### 15.2 Elite Attack Helicopter per doktrin [V]

Ditemukan di halaman Seasons, bukan di halaman unitnya: **RAH-66 Comanche** untuk Western, **S-97 Raider** untuk European, dan **Flying Lightning** untuk Eastern.

### 15.3 Catatan ketidakkonsistenan sumber

Prosa Bytro untuk Attack Helicopter Western menyebut Raider, padahal halaman Seasons menetapkan S-97 Raider sebagai Elite Attack Helicopter **European**, dan grid tier menyebut Western tier 3 adalah AH-64D Apache. **Prosa Bytro tidak sinkron dengan gridnya sendiri.** Ketika dua bagian sumber resmi bertabrakan, grid gambar lebih dapat dipercaya karena lebih terstruktur.

Sweep regex atas seluruh korpus untuk lebih dari enam puluh designasi pesawat nyata memastikan **tidak ada nama tersembunyi lain** di halaman non-unit selain Seasons.
