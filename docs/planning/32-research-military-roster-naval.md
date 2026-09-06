# Riset Roster Militer Laut: Naval, Submarine, Missile

> Sesi 5 (2026-09-05), dijalankan lewat subagen sesuai aturan 9. Penanda: **[V]** terverifikasi dari URL yang benar-benar diambil, **[UNV]** tidak terverifikasi atau halaman tidak memuat data, **[USULAN]** rancangan Nation Rise bukan data game mana pun.
>
> Halaman Conflict of Nations yang mencurigakan diverifikasi ulang dengan `?action=raw` untuk membaca wikitext mentah, agar tidak salah menyimpulkan kosong karena ringkasan.

> **Pembaruan gelombang riset kedua (dokumen 35).** Tiga pertanyaan terjawab. **Helicopter Carrier benar-benar ada** sebagai unit resmi dengan mekanik tidak bisa satu tumpukan dengan Aircraft Carrier. **Transport Ship bukan unit**, melainkan status hasil embarkasi, sehingga halaman 404 memang seharusnya begitu. **Patrol Boat ada** dalam roster resmi dan bisa dimobilisasi tanpa peningkatan Naval Base. Ditambah **Coastal Battery** sebagai pertahanan pantai tanpa riset yang sangat relevan untuk peta kepulauan (D59). Nama kelas per doktrin ditemukan untuk satu unit saja, yaitu Elite AIP Submarine berupa Scorpene CA-2000, 677 Lada, dan Northrop Type 212A. Lihat `35-research-con-data-audit.md`.

> **KOREKSI dari data dalam game (dokumen 40).** Dua angka di dokumen ini terbantah. Pertama, **radius ledak bergantung pada hulu ledak, bukan hanya tipe misil**: rudal balistik berhulu ledak konvensional beradius 5, sementara berhulu ledak kimia atau nuklir beradius 10. Kedua, **radius ICBM naik bertingkat mengikuti riset**, dari 25 di tier awal menjadi 45 di tier akhir, bukan tetap 50. Selain itu, **jalur senjata pemusnah massal terbuka jauh lebih awal daripada rancangan kita**: Guided Missile Program di hari 1, Chemical di hari 3, dan Nuclear di hari 5, bukan hari 16 dan 24. Yang menahannya adalah gerbang bangunan dan biaya, bukan hari.

> **KOREKSI dari data dalam game (dokumen 41).** Rancangan D48 di dokumen ini terbalik: **kapal selam bertenaga udara independen justru dihukum minus 50 persen di perairan dangkal** dengan HP hanya 7,5, sementara yang diuntungkan di sana adalah Attack Submarine biasa dengan plus 25 persen. Selain itu **kapasitas pesawat kapal induk akhirnya diketahui**, yaitu empat untuk Helicopter Carrier dan lima untuk Aircraft Carrier. Statistik lengkap seluruh unit laut kini tersedia.

## 1. Temuan utama: wiki laut sama kosongnya dengan wiki udara

Audit atas **26 halaman** laut, kapal selam, dan misil:

| Kategori | Jumlah | Halaman |
|---|---|---|
| **Punya tabel angka lengkap** | **nol** | — |
| Punya satu tabel kerusakan parsial | satu | Ballistic Missile, hanya PGM-17 Thor tier 1 doktrin Eropa |
| Ada tetapi **tanpa satu pun angka statistik** | sembilan belas | Corvette, Frigate, Destroyer, Cruiser, Aircraft Carrier, Attack Submarine, Ballistic Missile Submarine, Cruise Missile, ICBM, ketiga Warhead, Ballistic Missile Launcher, Theater Defense System, Mobile SAM, Naval Patrol Aircraft, ASW Helicopter, Naval Strike Fighter, Naval AWACS |
| **Tidak ada sama sekali, 404** | enam | **Helicopter Carrier**, **Transport Ship**, **Cruise Missile Launcher**, **Naval Officer**, **Submarine Commander**, **Elite AIP Submarine** |

Verifikasi wikitext mentah: Corvette hanya lima baris diawali templat stub; Frigate berisi deskripsi dan empat baris fitur tanpa satu pun tanda tabel; halaman **Damage Distribution Weight hanya berisi satu kalimat definisi tanpa tabel**; halaman Combat berisi judul kosong untuk Melee, Ranged, dan Anti-Air.

**Konsekuensi tegas.** HP per level, rating per tipe armor, kecepatan di High Seas dan Coastal Waters, jarak pandang dan radar dan sonar, signature radar, biaya, waktu mobilisasi, **dan nama kelas kapal per doktrin per tier semuanya tidak ada di sumber publik mana pun untuk unit laut.** Nilai bobot kerusakan yang tercatat di dokumen kita berstatus tidak terverifikasi terhadap wiki dan hampir pasti berasal dari data klien.

**Tiga koreksi terhadap catatan kita.** Pertama, nama **Navy Veteran** dan **Submarine Veteran** tidak eksis; yang benar adalah **Naval Officer** dan **Submarine Commander**, dikonfirmasi lewat Special:AllPages dan Category:Units. Kedua, **Nuclear Warhead menuntut Arms Industry level 2**, bukan level 1, dan itu satu-satunya hulu ledak yang begitu. Ketiga, **Helicopter Carrier dan Transport Ship bukan unit yang dibangun**; Transport Ship adalah hasil konversi otomatis saat embarkasi.

---

## 2. Gerbang bangunan

### 2.1 Naval Base [V]

| Level | Waktu | Biaya | Membuka | Waktu embark | Produksi | HP |
|---|---|---|---|---|---|---|
| 1 | 24 jam | — | — | minus 5 persen | — | — |
| 2 | 9 jam | 500 pasokan, 750 komponen, 750 bahan bakar, 500 elektronik, 2.000 dana | **Naval Infantry, Corvette, Frigate, Naval Officer, Elite AIP Submarine** | minus 10 persen | plus 5 persen | 10 |
| 3 | 30 jam | 750 / 1.000 / 1.250 / 750 / 3.500 | **Destroyer, Attack Submarine, Submarine Commander** | minus 20 persen | plus 10 persen | 15 |
| 4 | 32 jam | 1.000 / 1.500 / 1.750 / 1.000 / 5.500 | **Cruiser, Ballistic Missile Submarine** | minus 40 persen | plus 15 persen | 20 |
| 5 | 34 jam | 1.500 / 2.000 / **350 langka** / 2.250 / 1.250 / 7.500 | **Aircraft Carrier** | minus 50 persen | plus 20 persen | 25 |

Operasional pada 40 persen HP.

### 2.2 Secret Weapons Lab [V]

| Level | Waktu | Biaya | Membuka | HP | Upkeep |
|---|---|---|---|---|---|
| 1 | 25 jam | 750 / 400 / 500 langka / 250 / 750 / 3.500 | Stealth ASF, Stealth Strike Fighter, Stealth Bomber, **Ballistic Missile Submarine**, **Conventional Warhead**, Elite AIP Submarine | 10 | 100 |
| 2 | 26 jam | 1.000 / 800 / 1.000 / 500 / 1.000 / 5.500 | **Chemical Warhead** | 15 | 110 |
| 3 | 28 jam | 1.500 / 1.200 / 1.500 / 750 / 1.500 / 7.500 | **Cruise Missile Launcher** | 20 | 120 |
| 4 | 31 jam | 2.500 / 1.600 / 2.000 / 1.000 / 2.000 / 10.000 | **Nuclear Warhead dan Ballistic Missile Launcher** | 25 | 130 |
| 5 | 36 jam | 3.500 / 2.000 / 2.500 / 1.250 / 2.500 / 12.500 | **ICBM Launcher** | 30 | 140 |

Sifat kunci: bangunan rahasia, tidak ditampilkan di peta, dan **meledakkan diri saat wilayahnya ditaklukkan musuh**. Lab tidak bisa dirampas, hanya musnah.

---

## 3. Roster laut, kapal selam, dan misil Conflict of Nations

### 3.1 Kapal permukaan [V, kualitatif]

| Unit | Prasyarat | Fitur dan hari unlock | Kekuatan dan kelemahan |
|---|---|---|---|
| **Corvette** | Naval Base 2 | tidak ada daftar fitur | Kapal perang kelas terkecil untuk pertempuran pesisir. **HP separuh di High Seas.** Wiki menyatakan setelah minggu pertama korvet tidak direkomendasikan |
| **Frigate** | Naval Base 2 | Hari 2 Ranged Combat, Radar, dan Ranged Anti-Air; **hari 24 Reveal Stealth** | **Jangkauan anti-udara 150.** Terkuat melawan sayap tetap dan rudal jelajah; lemah melawan kapal lain, kapal selam, dan helikopter |
| **Destroyer** | **Naval Base 3 dan Arms Industry 1** | Hari 2 Ranged, Reveal Stealth, Radar, dan **Sonar**; hari 13 **rudal jelajah dua per dua belas jam** | Kuat melawan armada permukaan dan kapal selam, cepat; lemah melawan udara terutama pesawat patroli maritim |
| **Cruiser** | **Riset Destroyer, Naval Base 4, Arms Industry 1** | Ranged Combat, Radar, **rudal jelajah tiga per dua belas jam** pada riset tinggi | Kapal permukaan terkuat selain kapal induk; **bombardemen laut ke darat terbaik**; kapasitas rudal terbesar; lemah melawan kapal selam |
| **Aircraft Carrier** | **Naval Base 5 dan Arms Industry 1** | Pangkalan udara terapung, radar, sistem anti-udara dan anti-misil | Kapal tempur terbesar. **Catatan penting: kapal induk tidak memperpanjang jangkauan Airmobile Infantry maupun unit serbu udara lain.** Kapasitas pesawat tidak disebutkan di wiki |

### 3.2 Kapal selam [V]

**Attack Submarine** dengan prasyarat Naval Base 3 dan Arms Industry 1: pertempuran jarak jauh 100, sonar 100, kapasitas rudal jelajah dua dengan isi ulang dua belas jam, signature radar rendah, **stealth sehingga tidak terlihat saat tidak bertempur**, bisa menyerang kapal permukaan dan kapal selam tetapi **tidak bisa menyerang rudal jelajah**, **serangan naik 25 persen di High Seas** dan **serangan serta pertahanan turun 25 persen di Coastal Waters**, serta tidak bisa menaklukkan wilayah.

**Ballistic Missile Submarine** dengan prasyarat Naval Base 4, Secret Weapons Lab 1, dan Arms Industry 1: platform penangkal nuklir terkuat yang dirancang untuk bertahan dan membalas, tetapi **rentan di perairan pesisir dangkal dengan kerusakan berkurang dan HP separuh**.

### 3.3 Misil dan hulu ledak [V]

| Item | Prasyarat | Data terverifikasi |
|---|---|---|
| **Conventional Warhead** | Secret Weapons Lab 1 | Bahan peledak tinggi untuk sasaran militer dan bangunan. **Diproduksi di kota seperti unit biasa** dan berfungsi sebagai mata uang yang dipotong otomatis saat peluncuran |
| **Chemical Warhead** | Riset Conventional ditambah Chemical Weapons Program; **SWL 2 dan Arms Industry 1** | Kerusakan area ke semua unit dalam radius. **Unit dengan statistik pertahanan NBC menahan kerusakan seiring waktu.** Populasi sipil dilindungi Underground Bunkers. **Menyerang kawan sendiri juga** |
| **Nuclear Warhead** | Riset **Conventional dan Chemical**; **SWL 4 dan Arms Industry 2** | Segala sesuatu dalam radius kemungkinan besar musnah, termasuk unit kawan |
| **Cruise Missile** | Hulu ledak, **SWL 3**, Arms Industry 1 | **Radius ledak 5**, **jangkauan terpendek dari semua tipe misil**, dan **melacak sasaran** sehingga bisa mengikuti unit yang berpindah. Bisa menargetkan titik peta atau tumpukan unit |
| **Ballistic Missile** | — | **Radius ledak 10.** Diluncurkan dari kapal selam rudal balistik dan dari peluncur darat |
| **ICBM** | Semua program hulu ledak, **SWL 5**, Arms Industry 1 | **Radius ledak 50**, **hanya bisa menargetkan pusat provinsi dan kota, bukan unit individual**, merusak unit sendiri, dan **tidak dimobilisasi seperti unit standar** |
| **Ballistic Missile Launcher** | SWL 4 | Hari 2 stealth dan peluncuran; hari 23 Airlift dengan catatan tidak berdaya saat di udara. Menyerang kota dan provinsi, **tidak akurat melawan unit darat individual**. Hulu ledak pemusnah massal **menyebabkan kontaminasi** |

**Satu-satunya tabel kerusakan di seluruh wiki laut dan misil**, yaitu Ballistic Missile PGM-17 Thor tier 1 doktrin Eropa:

| Sasaran | Konvensional | Kimia | Nuklir |
|---|---|---|---|
| Lunak | 25 | **125** | 250 |
| Keras | **80** | 20 | 250 |
| Sayap tetap | 75 | 40 | — |

**Pola penyeimbangan yang terbaca dan layak ditiru.** Konvensional adalah **spesialis anti-keras** dengan 80 berbanding 25. Kimia adalah **spesialis anti-lunak** dengan 125, yaitu lima kali lipat konvensional terhadap sasaran lunak tetapi empat kali lebih lemah terhadap sasaran keras. Nuklir **datar 250** ke semua kelas.

### 3.4 Naval Infantry, satu-satunya unit laut dengan tabel lengkap [V]

Ini kalibrator skala angka untuk seluruh roster laut.

| Tier dan level | Unlock | HP | Lunak serang/tahan | Keras serang/tahan | Tahan sayap tetap | Tahan sayap putar |
|---|---|---|---|---|---|---|
| T1 level 1–2 | hari 2 | 19 / 20 | 6,0 / 3,4 | 3,0 / 1,7 | 0,5 | 0,6 |
| T1 level 3 | hari 9 | 21 | 7,0 / 4,0 | 3,0 / 1,7 | 1,0 | 1,1 |
| T2 level 4–5 | hari 13 | 24 / 25 | 8,0 / 4,6 | 4,0 / 2,3 | 1,5 | 1,2 |
| T3 level 6 | hari 23 | 28 | 11,0 / 6,0 | 5,0 / 2,9 | 1,5 | 1,2 |

**Kecepatan High Seas 2,51 dan Coastal Waters 1,30.** Ini **satu-satunya angka kecepatan laut yang terverifikasi di seluruh wiki.**

---

## 4. Mekanik laut dan misil

### 4.1 Blokade pelabuhan tidak ada sebagai mekanik bernama [V]

Tidak ada halaman Blockade maupun Naval Blockade di seluruh wiki, dikonfirmasi lewat Special:AllPages rentang A sampai Z penuh. **Blokade di Conflict of Nations adalah taktik yang muncul sendiri**, yaitu memarkir armada di perairan pesisir kota pelabuhan musuh untuk mencegat transport dan membombardir. **Tidak ada modifier ekonomi otomatis.**

Ini celah desain yang bisa kita isi. Supremacy 1914 juga tidak punya mekanik blokade formal.

### 4.2 Embarkasi dan pelabuhan [V]

| Konsep | Aturan |
|---|---|
| Embarkasi | Tindakan mengubah unit darat menjadi kapal angkut; disembarkasi adalah kebalikannya |
| Boarding | Tindakan mengubah unit darat menjadi pesawat atau helikopter angkut, **entitas berbeda dari embarkasi** |
| Batasan silang | Tidak bisa boarding dan embarkasi pada saat bersamaan |
| Unit non-amfibi | Hanya bisa embarkasi dan disembarkasi di pantai **memakai pelabuhan** |
| **Pontoon** | Memungkinkan unit non-amfibi menyeberangi sungai **tanpa pelabuhan**; dibangun di provinsi pesisir; **satu per provinsi**; jembatan sungai butuh pontoon **di kedua tepi** |
| **Stealth hilang saat embarkasi** | Unit stealth **tidak stealth saat menjadi kapal angkut atau pesawat angkut**, sehingga **konvoi invasi selalu terlihat**. Helikopter angkut tetap stealth |

**Kapasitas transport tidak ada angkanya.** Conflict of Nations memakai model **konversi satu banding satu**, yaitu tiap unit darat berubah menjadi satu kapal angkut sendiri, bukan dimuat ke kapal berkapasitas tertentu.

### 4.3 Invasi amfibi [V]

Mekanik intinya ada pada Naval Infantry yang bisa embarkasi dan disembarkasi di perairan pesisir **tanpa akses pelabuhan**, punya pengerahan amfibi, dan bisa menaklukkan wilayah. Tier 2 mencatat kelemahan eksplisit berupa unit laut bila invasi ketahuan.

Rantai invasi lengkap Conflict of Nations adalah **Naval Infantry sebagai perebut wilayah, Amphibious Combat Vehicle sebagai dukungan tembakan yang tidak bisa merebut, Cruiser sebagai bombardemen darat terbaik, dan Frigate sebagai payung anti-udara berjangkauan 150.**

### 4.4 Deteksi kapal selam [V]

Tiga sistem yang **saling independen**.

**Jarak pandang** mengangkat kabut perang. Unit di luar teritori sendiri muncul sebagai tanda tanya, **kecuali unit laut yang selalu teridentifikasi**.

**Radar** terpisah total dari jarak pandang, dengan empat signature (darat, sayap tetap, sayap putar, laut) dan dua ukuran. Radar yang mendeteksi signature rendah otomatis mendeteksi yang tinggi pada tipe sama.

**Sonar** dianggap salah satu teknologi pengungkap stealth karena mengungkap kapal selam. Pembawanya adalah **kapal permukaan, kapal selam, Naval Patrol Aircraft, dan ASW Helicopter**.

Tiga cara mengungkap stealth: unit dengan Reveal Stealth untuk kategori yang sesuai, sonar, atau masuk pertempuran.

**Rantai anti-kapal-selam lengkap:** Destroyer dengan sonar dan Reveal Stealth di hari 2, ASW Helicopter dengan sonar dan peluncuran kapal induk di hari 3, Naval Patrol Aircraft dengan Reveal Stealth laut dan radar besar, lalu Frigate dengan Reveal Stealth di hari 24. Kapal selam hanya aman bila **tidak satu pun** dari keempatnya berada dalam jarak pandang.

### 4.5 Anti-misil dan radius ledak [V]

| Platform | Kemampuan anti-misil | Celah |
|---|---|---|
| Frigate | Unit laut terkuat melawan sayap tetap **dan rudal jelajah**; selubung anti-udara 150 | Lemah melawan kapal, kapal selam, helikopter |
| Mobile SAM | Mendeteksi dalam radarnya dan menyerang pesawat **dan misil** | **Tidak menyerang helikopter terbang rendah** |
| Theater Defense System | Anti-udara jarak jauh; Reveal Stealth di hari 28 | **Helikopter rendah menghindari deteksi** |

Radius ledak: rudal jelajah 5, rudal balistik 10, **ICBM 50**. Ketiganya merusak unit sendiri.

**Tidak ada angka peluang intersepsi yang dipublikasikan, dan yang paling penting, tidak ada penangkal ICBM yang disebutkan di mana pun.** ICBM hanya bisa dimitigasi lewat Underground Bunkers, bukan dicegat.

### 4.6 Kontaminasi dan status Decontaminate [V dan UNV]

Kontaminasi kimia adalah **kerusakan berkelanjutan yang bisa ditahan statistik NBC**, bukan zona terlarang permanen. Kontaminasi eksplisit disebut di halaman Ballistic Missile Launcher.

**Mekanik Decontaminate tidak ada halamannya dan tidak disebut di halaman mana pun yang berhasil diambil.** Statusnya tidak terverifikasi, kemungkinan mekanik khusus klien atau memang tidak ada. **Bila dipakai di Nation Rise, itu desain baru, bukan peniruan.**

Underground Bunkers [V]:

| Level | Waktu | HP | Populasi terlindungi | Bangunan terlindungi | Reduksi kerusakan | Moral |
|---|---|---|---|---|---|---|
| 1 | 9 jam | 20 | 2 | — | — | plus 5 |
| 2 | 12 jam | 40 | 4 | Army Base | minus 43 persen | plus 10 |
| 3 | 15 jam | 75 | 6 | ditambah **Secret Weapons Lab** | minus 56 persen | plus 20 |
| 4 | 17 jam | 100 | 8 | ditambah Military Hospital dan **Naval Base** | minus 68 persen | plus 35 |
| 5 | 20 jam | 125 | 10 | ditambah Air Base | minus 73 persen | plus 50 |

Catatan strategis: **Secret Weapons Lab baru terlindungi di bunker level 3, dan Naval Base di level 4.**

### 4.7 Moral nasional sebagai pengait sistemik senjata pemusnah massal [V]

Moral awal 70 persen. Produksi sumber daya adalah **moral dikali 0,8 ditambah 0,25**, sehingga moral 25 persen menghasilkan 45 persen produksi dan moral 100 persen menghasilkan 105 persen. Kota di bawah 33 persen bisa memberontak, dan pada tepat 25 persen peluangnya 50 persen.

Modifier utama: kekurangan sumber daya minus 50, **korban sipil minus 30**, tanpa markas minus 20, tetangga bermoral rendah minus 7 per kota dan minus 4 per provinsi, jarak ke markas minus 5 per satuan, tetangga musuh minus 5 per provinsi, dan sedang berperang minus 2 per negara sampai maksimum minus 25.

**Inilah pengait sistemik untuk senjata pemusnah massal.** Korban sipil memberi minus 30 moral maksimum; moral rendah memotong produksi sampai 45 persen; dan kota bermoral rendah menyebarkan minus 7 ke tiap kota tetangga. **Serangan nuklir yang memusnahkan populasi memicu rantai penurunan moral berantai**, sehingga nuklir mahal secara sistemik, bukan hanya secara sumber daya.

Catatan jujur: halaman Moral tidak menyebut efek langsung serangan nuklir terhadap moral. Kaitannya berjalan lewat modifier korban sipil yang memang ada, tetapi hubungan kausalnya adalah inferensi.

### 4.8 Mekanik pendukung lain [V]

Terrain laut hanya dua, yaitu **High Seas** dan **Coastal Waters**, dan modifier numerik per kelas unit tidak dipublikasikan. Kapal pulih **2 HP per hari di Coastal Waters**, dan tidak ada penyembuhan yang disebut untuk High Seas.

**Atrisi dihapus pada 26 Mei 2018** karena dianggap tidak realistis. Yang tersisa adalah bahwa **Corvette, Attack Submarine, dan Ballistic Missile Submarine mengalami pengurangan HP di jenis perairan tertentu, tetapi tidak kehilangan HP secara bertahap, dan HP-nya kembali normal setelah meninggalkan perairan itu.** Jadi ini **penalti kondisional yang reversibel, bukan kerusakan permanen.**

Rumus kekuatan yang eksplisit di wiki: kekuatan sama dengan rating dasar dikali modifier, di mana modifier adalah terrain dikali penguat pasukan dikali penguat doktrin dikali penalti penumpukan dikali penalti kesehatan, dan **penalti kesehatan adalah 0,25 ditambah 0,75 dikali HP sekarang dibagi HP maksimum**.

**Pengisian bahan bakar hanya berlaku untuk unit udara. Tidak ada mekanik bahan bakar untuk kapal.**

---

## 5. Roster Perang Dunia 1 dan 2

### 5.1 Supremacy 1914, tiga koreksi struktural [V]

Diambil lewat API MediaWiki karena akses HTML langsung diblokir.

| Asumsi awal | Status |
|---|---|
| Punya Destroyer | **Tidak ada.** Halaman Warships menyebut tiga kapal yang ada |
| Punya Cruiser | **Tidak ada dengan nama itu.** Yang ada adalah Light Cruiser |
| Punya Troop Transport | **Tidak ada sebagai unit.** Unit darat dan udara berubah menjadi kapal angkut saat bergerak lewat laut |

**Unit laut Supremacy 1914 hanya tiga:**

| Statistik | Battleship | Light Cruiser | Submarine |
|---|---|---|---|
| **Kekuatan** | **6** | **2** | **4** |
| Jangkauan serang | 75 km di peta sepuluh pemain, 200 km di peta 31 pemain | 40 km | jarak dekat |
| Kecepatan air | 30 km per jam | 40 km per jam | 30 km per jam |
| Waktu produksi | **12 hari dibagi level pabrik** | 3 hari | 3 hari |
| Biaya | 50.000 | 15.000 | 20.000 |
| Level pabrik | 3 | 1 | 2 |

Skala dikonfirmasi teks: kapal tempur berkekuatan tiga kali lipat Light Cruiser dan dua satuan lebih besar dari kapal selam. **Supremacy 1914 tidak memakai HP maupun kelas armor, hanya satu nilai kekuatan.**

Mekanik yang menarik: embarkasi netral tiga jam atau satu setengah jam dengan pelabuhan; embarkasi di **pantai musuh** empat setengah jam; unit darat di kapal angkut **kekuatannya turun ke 0,5**; upkeep 20 ton gandum dan 5 ton minyak per unit per hari; dan **Railgun berfungsi sebagai pertahanan pantai** karena bergerak hanya di rel atau laut, dengan kapal tempur digambarkan nyaris kebal kecuali terhadap kapal selam dan Railgun.

### 5.2 Call of War, wiki sengaja tanpa angka [V]

Koreksi sumber: Fandom Call of War **bukan** wiki resmi dan berisi halaman game lain. Wiki resmi adalah wiki.callofwar.com dengan 39 halaman.

Wiki resmi **sengaja tidak memuat angka**, dan menyatakan bahwa tombol info di menu bangun membuka detail unit yang berisi biaya, waktu, dan nilai tempur persis. **Statistik numerik hanya ada di dalam klien.** Yang dipublikasikan adalah tingkat kualitatif.

| Unit | Kelas armor | Sasaran utama | HP | Kecepatan | Jangkauan | Khusus |
|---|---|---|---|---|---|---|
| Destroyer | Kapal | **Kapal selam** | Tinggi | Cepat | jarak dekat | **Mengungkap kapal selam** |
| Submarine | **Kapal selam** | Kapal | Sedang | Sedang | jarak dekat | **Stealth** |
| Cruiser | Kapal | **Pesawat** | Tinggi | Cepat | Sedang | Serangan jarak jauh |
| Battleship | Kapal | **Kapal** | **Sangat tinggi** | Sedang | **Tinggi** | Serangan jarak jauh |
| Aircraft Carrier | Kapal | Kapal | **Sangat tinggi** | Sedang | — | **Landasan bergerak** |
| Transport Ship | Kapal | — | **Sangat rendah** | Sedang | — | Konversi otomatis |

**Convoy bukan unit Call of War**; angkutan laut adalah Transport Ship.

Senjata rahasia yang butuh Secret Lab memakai nama dalam game yang berbeda dari dugaan kita: **Flying Bomb** menyerupai V1, **Rocket** menyerupai V2 dan **tidak bisa ditembak jatuh saat terbang**, **Nuclear Bomber** dengan radius ledak besar yang **mengabaikan bonus pertahanan musuh**, dan **Nuclear Rocket** yang serangannya **tidak bisa dibatalkan**. Semuanya merusak kawan dan lawan.

Mekanik Call of War yang terverifikasi angkanya: tick pertempuran **30 menit**, jangkauan pertempuran dekat 5, kerusakan acak antara minus dan plus 20 persen per ronde, efisiensi kerusakan turun linear ke 20 persen mendekati nol HP, **penalti ukuran pasukan mulai di atas sepuluh unit** di mana hanya sepuluh kerusakan terkuat per kelas armor dihitung, **pertahanan kandang plus 15 persen kerusakan dan plus 15 persen reduksi**, radius ledak 5 dengan kerusakan dibagi, unit hancur saat total HP tipe unit di bawah 50 persen, **bertahan menembak lebih dulu melawan pesawat**, dan penaklukan membuat moral langsung 25 persen dengan risiko pemberontakan 14 persen yang **turun ke nol bila kekuatan garnisun mencapai sepuluh**.

---

## 6. Taksonomi dunia nyata

### 6.1 Kapal permukaan

| Kelas | Perpindahan air | Persenjataan kunci | Catatan | Representasi |
|---|---|---|---|---|
| **Visby** Swedia | 640 ton | 57 mm, delapan RBS15, lambung komposit yang **mengurangi penampang radar 99 persen** | 43 kru, jangkauan 2.500 mil laut | **Corvette tier 3 siluman** |
| **Type 056 dan 056A** Tiongkok | 1.500 ton | 76 mm, YJ-83, HHQ-10; versi A menambah sonar tarik | **22 ditambah 50 unit**, volume ekstrem dan murah | **Model korvet murah tetapi banyak untuk negara kepulauan** |
| **FREMM** Prancis dan Italia | 6.000 sampai 6.700 ton | Sylver A43 dan A50, **16 sel A70 berisi 16 rudal jelajah darat**, delapan Exocet | 670 juta euro per kapal | Frigate tier 2 dengan slot rudal jelajah |
| **Type 26** Britania dan sekutu | 8.000 ton | 48 Sea Ceptor, **24 sel Mk41**, sonar tarik 2087 | Jangkauan di atas 7.000 mil laut, daya tahan 60 hari | **Frigate tier 3, sonar tertinggi** |
| **Type 31** Britania, **Indonesia**, Polandia | 7.000 ton | Rencana 32 sel Mk41, Sea Ceptor | **268 juta pound**, cukup baik dan murah; **empat unit Indonesia dibangun PT PAL** | **Frigate tier 2 Asia-Pasifik** |
| **Constellation** Amerika | 7.291 ton | 32 Mk41, SPY-6 | **Program dibatalkan November 2025**, 1,28 miliar dolar per kapal | Pelajaran: frigate semahal destroyer berarti gagal |
| **Admiral Gorshkov** Rusia | 4.550 ton | 16 sampai 32 sel berisi **Kalibr, Oniks, atau Zircon** | Tiga aktif dari sepuluh dipesan | Frigate tier 3 Eastern pembawa hipersonik |
| **Type 054A** Tiongkok | 3.963 ton | 32 sel, YJ-83, sonar tarik | **Sekitar 46 unit aktif**, frigate volume tertinggi dunia | Frigate tier 1 volume |
| **Arleigh Burke** Amerika | 8.300 sampai 9.700 ton | **90 sampai 96 sel Mk41**, SPY-6 di Flight III | **77 kapal**, destroyer terbanyak diproduksi | **Destroyer tier 1 dan 2 Western** |
| **Type 055** Tiongkok | 11.000 sampai 13.000 ton | **112 sel** berisi HQ-9, YJ-18, CJ-10 | Penjelajah de facto, sel terbanyak di kelas destroyer | **Cruiser tier 1 Asia-Pasifik** |
| **Type 052D** Tiongkok | 7.500 ton | 64 sel, termasuk **YJ-20 hipersonik** | **35 kapal per Maret 2026**, kuda beban armada | Destroyer tier 1 Asia-Pasifik |
| **Zumwalt** Amerika | 15.656 ton | 80 sel Mk57; meriam utamanya **tidak berfungsi**; **dikonversi menjadi platform hipersonik sejak 2023** | Penampang radar menyerupai kapal nelayan; **tiga kapal seharga 7,5 miliar dolar** | **Destroyer tier 3 Western** |
| **Sejong the Great** Korea | 7.650 sampai 8.200 ton | **128 sel**, SM-2, rudal jelajah Hyunmoo III | **Sel terbanyak di dunia untuk destroyer** | Destroyer tier 3 Asia-Pasifik |
| **Type 45 Daring** Britania | 7.350 sampai 8.500 ton | 48 sel Sylver A50, ditambah 24 Sea Ceptor mulai 2026; **radar SAMPSON melacak ratusan sasaran hingga 400 km** | Pertahanan udara murni terbaik; enam kapal | **Destroyer tier 2 European, payung anti-udara** |
| **Ticonderoga** Amerika | sekitar 9.600 ton | **Dua peluncur 61 sel, total 122 rudal** | **27 dibangun, tujuh tersisa**, pensiun 2030 | Cruiser tier 1 Western |
| **Slava** Rusia | 9.380 sampai 11.490 ton | **16 P-1000 Vulkan di peluncur eksternal**, 64 S-300F | Peluncur eksternal rapuh; **Moskva tenggelam 13 April 2022** | **Cruiser tier 1 Eastern, serangan tinggi tetapi rapuh** |
| **Kirov** Rusia | 24.300 sampai 28.000 ton | Bertenaga nuklir; Admiral Nakhimov diperbarui menjadi **174 sel** | Kapal permukaan non-induk terbesar; 710 kru; satu aktif | Cruiser tier 2 Eastern |

Kapal induk dan amfibi: **Nimitz** membawa 85 sampai 90 pesawat dengan empat katapel uap; **Ford** membawa 75 sampai 90 dengan katapel elektromagnetik yang menghasilkan **160 sortie per hari berkelanjutan dan 270 saat lonjakan**, dibandingkan 120 dan 240 pada Nimitz, dengan 700 kru lebih sedikit tetapi harga 12,998 miliar dolar; **Queen Elizabeth** membawa 12 sampai 36 pesawat lewat ski-jump tanpa katapel; **Charles de Gaulle** hanya 42.500 ton tetapi tetap memakai katapel; **Fujian** membawa lebih dari 50 pesawat dengan **tiga katapel elektromagnetik** dan mulai bertugas 5 November 2025.

Kapal serbu amfibi: **Wasp** membawa enam F-35B secara normal tetapi **dua puluh dalam mode kendali laut**, dengan 1.894 marinir; **Izumo** Jepang direklasifikasi dari perusak helikopter menjadi kapal induk multiguna pada 2025; **Juan Carlos I** Spanyol mengangkut **913 prajurit dan 46 tank Leopard**; dan **Makassar** Indonesia berjumlah lima kapal sekitar 11.394 ton yang **diekspor ke Filipina dan Peru**.

### 6.2 Kapal selam

| Kelas | Tipe | Catatan kunci | Representasi |
|---|---|---|---|
| **Virginia Block V** | SSN | Naik ke 10.200 ton dengan **40 Tomahawk**; 26 selesai | **Kapal selam rudal jelajah tier 1 dengan kapasitas 8** |
| **Astute** Britania | SSN | 38 senjata; 1,65 miliar pound per kapal | SSN tier 1 European |
| **Suffren** Prancis | SSN | Hanya **60 kru**, 5.300 ton | SSN tier 2 European, kecil dan efisien |
| **Yasen-M** Rusia | SSGN | **32 Tsirkon atau Oniks, atau 40 Kalibr**; kedalaman uji 600 meter; 64 kru | SSGN tier 2 Eastern |
| **Type 212CD** Jerman | SSK-AIP | **Sel bahan bakar memungkinkan 41 hari menyelam**; hanya 27 sampai 30 kru | **Kapal selam konvensional tier 3, stealth tertinggi** |
| **Type 212A** | SSK-AIP | Tiga minggu tanpa snorkel; **rudal IDAS empat per tabung torpedo** | SSK-AIP tier 1 European |
| **Scorpene** Prancis | SSK | Daya tahan 40 sampai 71 hari; **Indonesia berkontrak dua Scorpene Evolved** | **SSK tier 2 Asia-Pasifik** |
| **Type 209/1400** | SSK | **Indonesia mengoperasikan Cakra sejak 1981 dan tiga Nagapasa 2017 sampai 2021** | **SSK tier 1 Asia-Pasifik** |
| **Taigei** Jepang | SSK | **Baterai litium-ion, bukan AIP**; 70 kru | SSK tier 3 Asia-Pasifik |
| **Kilo 636.3** Rusia | SSK | Daya tahan 45 hari, hanya 52 kru, 200 sampai 250 juta dolar | **SSK tier 1 Eastern, murah dan tersebar luas** |
| **Gotland** Swedia | SSK-AIP | **Pada 2005 memotret USS Ronald Reagan dalam latihan perang** | **Justifikasi mekanik bahwa kapal selam konvensional di perairan dangkal mengalahkan kapal selam nuklir** |
| **Ohio** Amerika | SSBN dan SSGN | SSBN membawa 20 Trident II; **versi SSGN membawa 154 Tomahawk** | SSBN tier 1 dan model konversi |
| **Borei-A** Rusia | SSBN | 16 Bulava; delapan aktif | SSBN tier 2 Eastern |
| **Type 094** Tiongkok | SSBN | 12 tabung JL-2 berjangkauan 7.200 km atau **JL-3 di atas 10.000 km** | SSBN tier 1 Asia-Pasifik |

### 6.3 Misil

Anti-kapal: **Harpoon** berjangkauan 124 sampai 310 km dengan pencari radar aktif yang mudah diganggu; **NSM** berjangkauan di atas 200 km dengan **pencari sepenuhnya pasif sehingga tidak memicu peringatan radar musuh**, tetapi hulu ledaknya hanya 120 kg; **LRASM** berjangkauan 370 km, otonom penuh tanpa tautan data, seharga 3,24 juta dolar; **Exocet** dipakai lebih dari 30 negara termasuk Indonesia; **YJ-18** memakai **profil subsonik lalu sprint terminal Mach 2,5 sampai 3** sehingga sangat sulit dicegat; **BrahMos** berkecepatan Mach 3 dengan Filipina sebagai pelanggan ekspor pertama pada April 2024; dan **P-800 Oniks** yang **dioperasikan Indonesia di kelas Ahmad Yani**.

Serangan darat: **Tomahawk** berjangkauan 1.600 km seharga 2,5 juta dolar per unit; **Storm Shadow** berjangkauan sekitar 550 km dengan hulu ledak penetrator bertahap; dan **Kalibr** berjangkauan 1.500 sampai 2.500 km untuk versi domestik tetapi hanya 300 km untuk ekspor.

Balistik dan hipersonik: **ATACMS** 70 sampai 300 km dengan akurasi 9 meter; **Iskander-M** 400 sampai 500 km dengan akurasi 5 sampai 7 meter; **DF-26** di atas 5.000 km yang dijuluki pembunuh Guam; **DF-17** sebagai **kendaraan luncur hipersonik taktis operasional pertama di dunia** sejak 2019; **Zircon** berkecepatan Mach 6,8 berkelanjutan; **Kinzhal** yang diklaim Mach 10 tetapi **terukur sekitar Mach 3,6** saat dicegat Patriot; **Avangard** di atas Mach 20 tanpa propulsi sendiri; **Minuteman III** 14.000 km dengan 400 dikerahkan; **Sarmat** 18.000 km membawa sepuluh hulu ledak 750 kiloton; **Trident II D5** 7.600 sampai 11.520 km dengan akurasi di bawah 90 meter; dan **JL-3** di atas 10.000 km sejak 2022.

Nirawak: **Sea Hunter** seberat 135 ton berjangkauan 10.000 mil laut dan bertahan 30 sampai 90 hari untuk membuntuti kapal selam, dengan biaya **15 sampai 20 ribu dolar per hari dibandingkan 700 ribu dolar untuk destroyer**. Rantai pembunuhan rudal balistik anti-kapal menuntut **rantai sensor khusus untuk mendeteksi dan mengidentifikasi sasaran**, sehingga **rudal balistik anti-kapal harus mensyaratkan unit sensor kawan dalam jarak pandang sasaran, bukan tembak dan lupakan.**

### 6.4 Postur nyata Tentara Nasional Indonesia Angkatan Laut [V]

Empat kapal selam, **sepuluh frigate, 26 korvet, 25 kapal serang cepat**, 13 kapal pendarat tank, sepuluh pendarat menengah, **lima kapal dok pendarat**, 205 kapal patroli, dan sepuluh penyapu ranjau. Akuisisi berjalan mencakup dua Scorpene Evolved yang dibangun PT PAL, dua Balaputradewa berbasis Type 31, dua Istif sejak Juli 2025, dan dua kapal patroli lepas pantai Thaon di Revel.

**Polanya jelas: banyak unit kecil, sedikit unit besar.** Ini harus tercermin di desain.

---

## 7. Usulan pohon riset laut dan misil [USULAN]

Rantai senjata pemusnah massal Conflict of Nations yang terverifikasi menjadi kerangkanya:

```
Conventional Warhead (SWL1, AI1)
  ├─→ Cruise Missile (SWL3, AI1)                 radius 5, jangkauan terpendek, melacak sasaran
  ├─→ Ballistic Missile (Launcher SWL4 | Sub SWL1+NB4)   radius 10
  └─→ Chemical Weapons Program → Chemical Warhead (SWL2, AI1)
            └─→ Nuclear Warhead (SWL4, AI2)      butuh Conventional DAN Chemical
                      └─→ ICBM (semua warhead, SWL5)   radius 50, hanya kota dan provinsi
```

### 7.1 Jalur lambung dan platform

Hari 1 Littoral Combat Hull di Naval Base 1 membuka Corvette tier 1. Hari 3 Coastal Air Defence di level 2 membuka Frigate tier 1 dengan selubung anti-udara 150. Hari 4 Amphibious Doctrine membuka Naval Infantry dan kapal pendarat. Hari 6 Hull Modularity membuka Corvette tier 2. Hari 8 Fleet Escort Hull di level 3 membuka Destroyer tier 1. Hari 10 **Towed Array Sonar** menambah jangkauan sonar 50 persen. Hari 12 VLS Standardisation menambah kapasitas rudal. Hari 14 **Low-Observable Superstructure** membuka Corvette tier 3 siluman dengan signature radar turun ke rendah. Hari 16 Amphibious Assault Ship di level 4 membuka kapal dok pendarat. Hari 18 Large Surface Combatant membuka Cruiser. Hari 19 Integrated Mast menambah radar 30 persen dan membuka Frigate tier 3 yang mampu melawan hipersonik. Hari 22 Fleet Carrier di level 5 membuka kapal induk ski-jump berkapasitas delapan pesawat. Hari 26 **Catapult Systems** membuka kapal induk katapel berkapasitas dua belas pesawat dengan **sortie plus 50 persen**. Hari 28 Autonomous Surface Vessel membuka kapal nirawak anti-kapal-selam.

### 7.2 Jalur bawah permukaan

Hari 3 Diesel-Electric Boat membuka kapal selam konvensional tier 1. Hari 7 **Air-Independent Propulsion** membuka tier 2 dengan **stealth dan bonus di perairan pesisir**, membalik penalti Conflict of Nations. Hari 11 Nuclear Propulsion di Naval Base 3 dan Arms Industry 2 membuka kapal selam nuklir tanpa penalti High Seas. Hari 13 Lithium-Ion Battery membuka tier 3 dengan kecepatan menyelam plus 25 persen. Hari 15 rudal jelajah luncur kapal selam menaikkan kapasitas dari dua ke empat. Hari 18 **Vertical Payload Module** membuka kapal selam rudal jelajah berkapasitas delapan. Hari 21 **Acoustic Quieting** mengurangi peluang terdeteksi sonar 25 persen. Hari 24 Strategic Missile Boat di Naval Base 4 dan Secret Weapons Lab 1 membuka kapal selam rudal balistik. Hari 30 peluncuran hipersonik dari kapal selam.

### 7.3 Jalur misil dan senjata pemusnah massal, jalur pencapaian

Hari 4 Guided Munitions membuka rudal anti-kapal tier 1 dan Conventional Warhead. Hari 7 Sea-Skimming Seeker memberi peluang 30 persen menembus selubung anti-udara. Hari 10 Land-Attack Cruise Missile di Secret Weapons Lab 3 membuka peluncur rudal jelajah. Hari 13 **Passive Seeker** membuka rudal anti-kapal tier 3 yang **tidak memicu radar musuh**. Hari 14 rudal balistik jarak pendek. Hari 16 **Chemical Weapons Program** membuka hulu ledak kimia dengan serangan lunak lima kali lipat tetapi serangan keras seperempat. Hari 19 **rudal balistik anti-kapal** yang **mensyaratkan unit sensor kawan dalam jarak pandang sasaran**. Hari 23 **Hypersonic Glide Vehicle** yang **tidak bisa dicegat Mobile SAM maupun Theater Defense System**, hanya oleh Frigate tier 3. Hari 24 **Program Nuklir Fase Satu berupa pengayaan yang sengaja tidak membuka apa pun**. Hari 27 Fase Dua membuka Nuclear Warhead. Hari 30 Thermonuclear Design menaikkan serangan dari 250 ke 400 dan radius dari 10 ke 14. Hari 33 Intercontinental Delivery di Secret Weapons Lab 5 membuka ICBM.

### 7.4 Delapan alasan nuklir terasa sebagai pencapaian

1. **Rantai wajib empat program berurutan** dari konvensional ke kimia ke fase satu ke fase dua, tidak bisa dilompati. Ini bukan karangan, karena di Conflict of Nations pun Nuclear Warhead mensyaratkan riset Conventional **dan** Chemical.
2. **Gerbang ganda yang mahal.** Secret Weapons Lab level 1 sampai 4 secara kumulatif memakan 5.750 pasokan, 4.000 komponen, 5.000 material langka, 2.500 bahan bakar, 5.250 elektronik, dan 26.500 dana, ditambah **Arms Industry level 2** yang hanya dituntut oleh hulu ledak nuklir.
3. **Lab tidak bisa dirampas** karena meledakkan diri saat wilayahnya ditaklukkan. Kehilangan wilayah berarti kehilangan program, bukan menghadiahkannya kepada musuh.
4. **Fase satu sengaja tidak membuka apa pun.** Tiga hari riset kosong yang secara naratif adalah pengayaan uranium. Jeda inilah yang menciptakan rasa menanti.
5. **Hulu ledak adalah unit yang diproduksi di kota** dan dikonsumsi otomatis, sehingga arsenal nuklir adalah investasi produksi berkelanjutan, bukan angka statis.
6. **Biaya politik nyata** lewat korban sipil minus 30 moral dan penyebaran minus 7 per kota tetangga, sehingga produksi sendiri ikut anjlok lewat rumus moral.
7. **Nuklir bisa gagal**, karena bunker musuh melindungi dua sampai sepuluh populasi dan memberi reduksi kerusakan sampai 73 persen. Musuh yang siap membuat hulu ledak termahal terbuang.
8. **Titik masuk paling awal tetap ada**, karena kapal selam rudal balistik hanya butuh Secret Weapons Lab level 1. Jalur penangkalan terbuka sejak dini, tetapi hulu ledak nuklirnya baru datang sekitar hari 27.

---

## 8. Usulan roster final [USULAN]

> Semua angka dikalibrasi ke satu-satunya jangkar terverifikasi, yaitu Naval Infantry dengan HP 19 sampai 28, serang lunak 6,0 sampai 11,0, dan **kecepatan High Seas 2,51 serta Coastal Waters 1,30**.

### 8.1 Kapal permukaan

| Unit | Tier | HP | Serang laut/selam/lunak/keras/udara | Tahan laut/selam/udara/misil | Kecepatan HS / CW | Pandang / radar / sonar | Jangkauan | Bobot | Prasyarat |
|---|---|---|---|---|---|---|---|---|---|
| **Corvette** | 1 | 24, **12 di High Seas** | 8 / 4 / 3 / 2 / — | 6 / 3 / 2 / 1 | 2,6 / **3,4** | 30 / 60 / 40 | 60 | 5 | NB2, hari 1 |
| | 2 | 30, 15 HS | 11 / 6 / 4 / 3 / — | 8 / 4 / 3 / 2 | 2,8 / 3,6 | 35 / 70 / 60 | 70 | 5 | NB2, hari 6 |
| | 3 siluman | 34, 17 HS | 14 / 7 / 5 / 3 / — | 10 / 5 / 4 / 3 | 3,0 / 3,8 | 40 / 80 / 70 | 80 | **4** | NB2, hari 14, signature rendah |
| **Frigate** | 1 | 34 | 7 / 5 / 4 / 3 / **9** | 9 / 5 / **12** / **10** | 3,0 / 3,0 | 45 / 120 / 60 | 90, anti-udara **150** | 4 | NB2, hari 3 |
| | 2 | 42 | 9 / 8 / 5 / 4 / 12 | 12 / 8 / 16 / 14 | 3,2 / 3,2 | 50 / 140 / **110** | 100, anti-udara 160 | 4 | NB2, hari 10 |
| | 3 | 50 | 11 / 10 / 6 / 5 / 16 | 15 / 10 / **22** / **20** | 3,4 / 3,4 | 55 / **170** / 130 | 110, anti-udara 180 | 4 | NB3, hari 19, **Reveal Stealth dan anti-hipersonik** |
| **Destroyer** | 1 | 44 | 14 / 12 / 6 / 5 / 6 | 12 / 10 / 8 / 7 | 3,6 / 3,2 | 50 / 130 / **110** | 110 | **8** | NB3 dan AI1, hari 8, **sonar dan Reveal Stealth** |
| | 2 | 54 | 18 / 15 / 8 / 7 / 8 | 15 / 13 / 10 / 9 | 3,8 / 3,4 | 55 / 150 / 130 | 120 | 8 | NB3, hari 12, **dua rudal jelajah per 12 jam** |
| | 3 | 64 | 23 / 19 / 10 / 9 / 10 | 19 / 16 / 13 / 12 | 4,0 / 3,6 | 60 / **180** / 150 | 130 | 8 | NB3, hari 19, tiga rudal, mampu hipersonik |
| **Cruiser** | 1 | 78 | 28 / 12 / **16** / **14** / 10 | 24 / 12 / 16 / 14 | 3,4 / 3,0 | 60 / 170 / 100 | 140 | 5 | NB4, AI1, riset Destroyer, hari 18, **bombardemen darat terbaik** |
| | 2 | 94 | 35 / 15 / **20** / **18** / 13 | 30 / 15 / 20 / 18 | 3,6 / 3,2 | 65 / 190 / 120 | 150 | 5 | NB4, hari 24, empat rudal jelajah |
| **Kapal dok pendarat** | 1 | 70 | 3 / — / 2 / 1 / 4 | 14 / 6 / 10 / 8 | 3,0 / 3,0 | 45 / 100 / 40 | — | 3 | NB4, hari 16, **mengangkut enam unit darat dan empat helikopter, disembarkasi tanpa pelabuhan** |
| | 2 | 86 | 4 / — / 3 / 2 / 6 | 18 / 8 / 14 / 11 | 3,2 / 3,2 | 50 / 120 / 50 | — | 3 | NB4, hari 20, ditambah dua pesawat lepas landas pendek |
| **Aircraft Carrier** | 1 ski-jump | 120 | 5 / — / 3 / 2 / 8 | 26 / 10 / 22 / 18 | 3,4 / 3,0 | 70 / **200** / 80 | — | **2** | NB5 dan AI1, hari 22, **kapasitas delapan pesawat** |
| | 2 katapel | 150 | 6 / — / 4 / 3 / 11 | 34 / 13 / 28 / 24 | 3,6 / 3,2 | 75 / 220 / 90 | — | 2 | NB5, hari 26, **kapasitas dua belas dan sortie plus 50 persen** |
| **Kapal nirawak ASW** | 1 | 14 | 3 / **9** / — / — / — | 4 / 6 / 2 / 1 | 3,0 / 3,0 | 40 / 60 / **150** | 50 | **1** | NB3, hari 28, **tanpa personel dan upkeep minimal** |
| **Kapal cepat rudal** | 1 | 18 | **12** / 2 / 3 / 2 / — | 4 / 2 / 3 / 2 | 2,4 / **3,8** | 30 / 50 / — | **100** | 3 | NB2, hari 5, dua rudal anti-kapal, **hanya perairan pesisir** |

### 8.2 Kapal selam

| Unit | Tier | HP | Serang laut / selam | Tahan laut / selam | Kecepatan HS / CW | Sonar | Bobot | Prasyarat dan sifat |
|---|---|---|---|---|---|---|---|---|
| **Konvensional** | 1 | 26 | 14 / 8 | 8 / 7 | 2,4 / **2,8** | 90 | 4 | NB2, hari 3, stealth, **pesisir plus 15 persen, High Seas minus 20 persen** |
| **Konvensional AIP** | 2 | 32 | 18 / 11 | 10 / 9 | 2,6 / 3,0 | 110 | 4 | NB2, hari 7, **pesisir plus 25 persen**, tidak terdeteksi sonar tier 1 |
| **Konvensional litium** | 3 | 36 | 22 / 13 | 12 / 11 | 3,0 / 3,4 | 130 | 4 | NB2, hari 13 |
| **Nuklir penyerang** | 1 | 40 | 22 / 16 | 13 / 12 | **4,2** / 2,8 | 100 | 4 | NB3 dan AI1, hari 11, **High Seas plus 25 persen, pesisir minus 25 persen** persis Conflict of Nations |
| | 2 | 50 | 28 / 20 | 16 / 15 | 4,4 / 3,0 | 130 | 4 | NB3, hari 18, empat rudal jelajah |
| **Nuklir rudal jelajah** | 1 | 58 | 30 / 22 | 18 / 17 | 4,4 / 3,0 | 140 | 3 | NB4, hari 18, **delapan rudal jelajah**, pengganti penjelajah bagi negara kepulauan |
| **Rudal balistik** | 1 | 66, **33 di pesisir** | 8 / 6 | 14 / 12 | 4,0 / 2,4 | 120 | **1** | NB4, SWL1, AI1, hari 24, dua rudal balistik per 24 jam, **HP separuh di pesisir** persis Conflict of Nations |
| | 2 | 80, 40 pesisir | 10 / 8 | 18 / 16 | 4,2 / 2,6 | 150 | 1 | NB5, hari 28, tiga rudal, jangkauan antarbenua |

### 8.3 Misil dan hulu ledak

| Unit | Varian | Radius | Serang lunak / keras / laut / udara | Kapasitas dan isi ulang | Prasyarat |
|---|---|---|---|---|---|
| **Rudal anti-kapal** | tier 1 | 3 | 10 / 20 / **55** / — | dua per 12 jam | SWL1, hari 4 |
| | tier 2 | 3 | 12 / 25 / **75** / — | dua per 10 jam | SWL1, hari 7 |
| | tier 3 pasif | 4 | 15 / 30 / **100** / — | dua per 8 jam | SWL2, hari 13, **tidak memicu radar** |
| **Rudal jelajah** | konvensional | **5** | 30 / 70 / 45 / 60 | Destroyer dua sampai tiga, Cruiser empat, kapal selam dua sampai delapan | **SWL3 dan AI1**, hari 10 |
| | kimia | 5 | **150** / 18 / 30 / 35 | sama | SWL2, hari 16 |
| | nuklir | **8** | **250** / 250 / 250 / — | sama | SWL4, hari 27 |
| **Rudal balistik pendek** | konvensional | **8** | 25 / **80** / 60 / 75 | satu per 8 jam | SWL2, hari 14 |
| | kimia | 8 | **125** / 20 / 30 / 40 | satu per 8 jam | SWL2, hari 16 |
| | nuklir | **12** | 250 / 250 / 250 / — | satu per 8 jam | SWL4, hari 27 |
| **Rudal balistik anti-kapal** | konvensional | 10 | 40 / 110 / **140** / — | satu per 12 jam | SWL3 dan AI2, hari 19, **wajib ada unit sensor kawan dalam jarak pandang sasaran** |
| **Luncur hipersonik** | — | 8 | 60 / **160** / **180** / — | satu per 16 jam | SWL4, hari 23, **tidak bisa dicegat Mobile SAM maupun Theater Defense System** |
| **Rudal balistik kapal selam** | konvensional | 10 | 30 / 90 / 70 / — | dua sampai tiga per 24 jam | SWL1 dan NB4, hari 24 |
| | nuklir | **14** | **400** / 400 / 400 / — | sama | Thermonuclear, hari 30 |
| **ICBM** | nuklir | **50** | 400 / 400 / — / — | tidak dimobilisasi | **SWL5**, hari 33, **hanya pusat provinsi dan kota, merusak unit sendiri** |
| **Munisi berkeliaran laut** | tier 1 | 2 | 8 / 12 / 30 / — | satu per 8 jam | SWL1, hari 9, murah dan banyak |

### 8.4 Nama kelas kapal per doktrin

> **Catatan keputusan (D53):** usulan doktrin keempat bernama Asia-Pasifik **dibatalkan** karena tidak sesuai realitas saat ini. Modern 2026 tetap memakai tiga doktrin. Kolom keempat di tabel di bawah **dipertahankan hanya sebagai bahan riset** untuk era historis atau untuk pemetaan negara Asia ke salah satu dari tiga doktrin yang ada, bukan sebagai doktrin tersendiri.

| Unit dan tier | Western | European | Eastern | **Asia-Pasifik** |
|---|---|---|---|---|
| Corvette 1 / 2 / 3 | Cyclone / Freedom / Independence | Braunschweig / Gowind 2500 / **Visby** | Tarantul / Steregushchiy / Karakurt | **KCR-60M** / **Type 056A** / Tuo Chiang |
| Frigate 1 / 2 / 3 | Oliver Hazard Perry / Constellation / — | Sigma 10514 / **FREMM** / **Type 26** | Krivak / Grigorovich / **Admiral Gorshkov** | **Type 054A** / **Martadinata** / **Merah Putih** |
| Destroyer 1 / 2 / 3 | Burke Flight IIA / **Burke Flight III** / **Zumwalt** | Horizon / **Type 45 Daring** / Type 83 | Sovremenny / Udaloy / Lider | **Type 052D** / **Maya** / **Sejong the Great** |
| Cruiser 1 / 2 | **Ticonderoga** / kombatan besar | — | **Slava** / **Kirov** | **Type 055** / Type 055A |
| Kapal dok pendarat 1 / 2 | **Wasp** / **America** | **Juan Carlos I** / **Trieste** | Ivan Rogov | **Makassar** / **Izumo** |
| Kapal induk 1 / 2 | **Nimitz** / **Gerald R. Ford** | **Charles de Gaulle** / **Queen Elizabeth** | **Kuznetsov** / Shtorm | **Shandong** / **Fujian** |
| Kapal selam konvensional 1 / 2 / 3 | bergantung mitra | **Type 212A** / **Type 214** / **Type 212CD** | **Kilo 636.3** / Lada / Amur | **Nagapasa** / **Scorpene Evolved** / **Taigei** |
| Kapal selam nuklir 1 / 2 | Los Angeles / **Virginia Block V** | **Astute** / **Suffren** | Akula / **Yasen-M** | **Type 093** / **Type 093B** |
| Kapal selam balistik 1 / 2 | **Ohio** / **Columbia** | **Vanguard** / **Triomphant** | Delta IV / **Borei-A** | **Type 094** / Type 096 |
| Rudal anti-kapal 1 / 2 / 3 | Harpoon / **NSM** / **LRASM** | Exocet / NSM / rudal masa depan | Kh-35 / **Kalibr** / **Zircon** | **YJ-83** / **YJ-18** / **BrahMos** |
| Rudal jelajah darat | **Tomahawk** | **Storm Shadow** | **Kalibr** | **CJ-10** |
| Hipersonik | **Dark Eagle** | — | **Kinzhal dan Avangard** | **DF-17** |
| ICBM dan rudal kapal selam | **Minuteman III** dan **Trident II** | M51 | **Sarmat** dan **Bulava** | **DF-41** dan **JL-3** |

### 8.5 Tiga aturan yang membuat Indonesia terasa seperti negara kepulauan

1. **Perairan pesisir bukan hukuman, melainkan medan taktis.** Kapal selam bertenaga udara independen mendapat **plus 25 persen serangan di perairan pesisir** dan tidak terdeteksi sonar tier 1, kebalikan langsung dari kapal selam nuklir yang **minus 25 persen di sana** sesuai aturan Conflict of Nations yang terverifikasi. Adikuasa yang masuk perairan Indonesia berada dalam kondisi lemah, sementara tuan rumah dengan kapal selam murah justru kuat. Justifikasi nyatanya adalah **Gotland yang memotret USS Ronald Reagan dalam latihan perang 2005**.
2. **Rasio pengawal armada.** Setiap penjelajah atau kapal induk butuh **tiga pengawal** untuk efisiensi penuh, dan di bawah itu bobot kerusakan kapal besar naik tajam. Seperti Hearts of Iron IV, **efisiensi pengawalan dihitung dari kuantitas, bukan kualitas**, sehingga korvet tier 1 yang sangat murah menyumbang sama besar dengan destroyer tier 3. Ini yang membuat kapal kecil tetap dibangun sampai akhir permainan, sesuai postur nyata dengan 26 korvet dan 25 kapal serang cepat berbanding sepuluh frigate.
3. **Blokade selat sebagai mekanik bernama**, yang **tidak dimiliki Conflict of Nations maupun Supremacy 1914**. Armada yang bertahan di perairan pesisir kota pelabuhan musuh memotong **25 persen produksi sumber daya kota itu per hari** dan memblokir embarkasi. Untuk peta kepulauan, Malaka, Sunda, dan Lombok berubah dari jalur lewat menjadi objektif strategis.

---

## 9. Rule the Waves 3

Sumber: manual resmi Matrix Games dan halaman produknya.

| Sistem | Detail |
|---|---|
| Skala | Giliran strategis **bulanan** ditambah pertempuran taktis waktu nyata; kampanye mulai 1890, 1900, 1920, atau 1935, berakhir 1970 |
| Negara | Sepuluh bisa dimainkan, delapan dikendalikan AI |
| **Anggaran** | Sumber daya nasional dikali persentase alokasi angkatan laut. Basis tumbuh **3 sampai 5 persen per tahun**, naik saat menang perang dan turun saat kalah. Defisit menurunkan prestise dan moral armada. **Surplus yang menganggur dirampas menteri keuangan** |
| Koloni | Punya nilai yang **menurun seiring waktu**, sehingga tidak menguntungkan di era 1970-an |
| **Riset** | Alokasi maksimum **12 persen** anggaran dengan **hasil menyusut di atas 10 persen**. **Tidak bisa memilih teknologi spesifik**, hanya prioritas tinggi, sedang, atau rendah per bidang; poin di bidang yang sudah habis dialokasikan ulang otomatis |
| Variasi teknologi | Tidak ada, sedikit dengan selisih satu sampai dua tahun, atau besar dengan kemunduran sampai enam tahun |

### 9.1 Desain kapal sebagai anggaran perpindahan air

Lapisan pelindung diukur dalam inci untuk sabuk, sabuk atas, sabuk ujung, geladak, geladak ujung, kubah, barbet, baterai sekunder, dan menara komando. Sabuk maksimum **20 inci** dengan hasil menyusut di atas 12 inci; kubah maksimum 26 inci. Pelindung dua inci ke atas kebal serpihan. Sabuk miring menambah 10 persen biaya dan 5 persen berat tetapi memberi **10 persen perlindungan lebih**. Perlindungan kotak memangkas sepertiga berat. Bangunan atas aluminium menghemat **10 persen berat lambung** tetapi rentan kebakaran. Pengisi otomatis menaikkan laju tembak 10 persen, atau 30 persen untuk tembakan cepat, dengan tambahan berat **25 persen**. Meriam dwiguna menambah berat 25 persen.

Pertukaran berat yang tersedia: sabuk sempit, lambung timbul rendah dengan penalti cuaca di atas 20 knot, **akomodasi sempit yang menimbulkan risiko pemberontakan**, dan persenjataan seluruhnya di haluan.

**Dua kuota yang bersaing.** Selain berat ada **ruang atas geladak**, kuota terpisah yang ditentukan perpindahan air dan membatasi anti-udara ringan, radar, dan torpedo. Radar semua kapal dibatasi level dua kecuali dirancang eksplisit.

### 9.2 Kelas kapal adalah hasil statistik, bukan pilihan

| Tipe | Perpindahan air | Kecepatan | Meriam | Pelindung |
|---|---|---|---|---|
| Destroyer | di bawah 2.000 ton, akhir era sampai 3.800 | di atas 19 knot | — | wajib torpedo, tanpa pelindung |
| Light Cruiser | 2.000 sampai 8.000 | di atas 16 knot | maksimum 6 inci | wajib berpelindung |
| Heavy Cruiser | di atas 4.000 | di atas 19 knot | 6 sampai 11 inci | sabuk 2 sampai 12 inci |
| Pre-dreadnought | minimal 5.000 | di bawah 20 knot | di atas 6 inci, maksimum dua kubah | sabuk minimal 6 inci |
| Battlecruiser | — | di atas 23 knot, naik per era | di atas 10 inci | — |
| Battleship | di atas 8.000 | — | di atas 10 inci, minimal tiga kubah | sabuk di atas 6 inci |
| Carrier dan Light Carrier | Light Carrier maksimum 16.000 ton | — | — | Carrier di atas 34 pesawat, Light Carrier 4 sampai 34 |

Pemain mengisi angka, lalu sistem mengklasifikasi dan menolak desain ilegal. Diskon perbaikan berlaku selama perpindahan air naik maksimum 10 persen atau 1.000 ton, meriam di atas 6 inci tidak diganti, kecepatan bergeser maksimum satu knot, dan pelindung vertikal bergeser satu inci atau horizontal setengah inci. Studi desain memakan satu sampai empat bulan. Kapasitas galangan adalah kelipatan ukuran dok, dan total tonase yang sedang dibangun tidak boleh melampauinya.

### 9.3 Tiga pengukur politik

| Pengukur | Perilaku |
|---|---|
| **Ketegangan** | Per pasangan negara. **Terusan Suez dan Panama diblokir bila ketegangan mencapai tujuh** |
| **Prestise** | Naik dari peristiwa agresif dan kemenangan. Kerugian **proporsional**, sehingga prestise tinggi kehilangan lebih banyak. **Turun ke enam belas berarti dipecat dan kalah permainan** |
| **Keresahan** | Naik dari belanja militer tinggi, perang panjang, blokade, akomodasi sempit, dan kekalahan. Turun dari pecahnya perang, program sosial, dan kemenangan. Terlalu tinggi memicu **revolusi dan kekalahan perang** |

Perjanjian membatasi perpindahan air dan kaliber utama kapal baru serta total tonase semua negara. Kapal yang sedang dibangun dan melanggar akan dibesituakan, sementara kapal yang sudah ada boleh dipertahankan dan diperbaiki. **Demokrasi liberal wajib patuh ketat, negara lain boleh curang sampai 10 persen perpindahan air, tetapi kaliber tidak boleh dicurangi.**

Blokade membutuhkan **110 persen kekuatan angkatan laut musuh** di area pembangunannya, dengan Britania dikali 1,2 dan Rusia dikali 0,7 karena geografi. Perlindungan perdagangan memakai **kolam global**, sehingga lokasi tidak penting dan kuota proporsional terhadap armada, ekonomi, dan kekuatan kapal selam musuh. Serangan mendadak berpeluang dasar 80 persen, turun tajam pada perang berikutnya melawan negara yang sama.

---

## 10. Cold Waters

Sumber: API Steam aplikasi 541210 dan tiga panduan komunitas Steam.

| Mekanik | Angka |
|---|---|
| Sonar pasif | **Di atas 15 knot praktis tidak berguna** karena derau aliran |
| **Ambang deteksi ganda** | **Sepuluh desibel ke atas untuk mengidentifikasi**, di atas nol desibel untuk melacak setelah teridentifikasi |
| Sonar aktif | Sekali memancarkan berarti posisi terbongkar |
| **Lapisan termal** | Sekitar 50 kaki di bawah lapisan memberi **minus 18 desibel aktif dan minus 31 pasif**; sekitar 100 kaki memberi minus 11 dan minus 24; 300 kaki ke atas memberi minus 5 dan minus 18 |
| Pita kedalaman | Kedalaman periskop dan kedalaman besar memberi pendengaran terbaik tetapi paling terdengar; tepat di bawah lapisan memberi perlindungan terbaik terhadap kapal permukaan |
| Kabel torpedo | **Kabel putus membuat torpedo netral dan bisa menyerang kapal sendiri**; manuver mengelak sendiri bisa memutusnya |
| Setelan torpedo | Tiga kenop yaitu pengarah aktif atau pasif, pola ular atau belok kiri atau belok kanan, dan kedalaman; titik jalan aktivasi bisa diubah setelah diluncurkan |
| Penangkal | Pembuat derau ditambah **buhul** dari pergantian kemudi keras; efektif saat torpedo berjarak satu sampai tiga panjang kapal di belakang |
| Umpan | Tiruan kapal selam yang tidak bisa mengganti kedalaman dan tidak dipandu kabel |
| Rudal | Harpoon **tidak bisa diluncurkan di bawah 200 kaki**, sangat berisik, dan bisa dicegat; rudal darat butuh kedalaman di bawah 80 kaki; jarak persenjataan 8.000 yard |
| Ekonomi kampanye | Kampanye 1968 hanya menyediakan **23 sampai 24 torpedo**, sementara satu kapal butuh dua sampai tiga |

Analisis gerak sasaran secara eksplisit tidak ditemukan referensinya.

---

## 11. Command: Modern Operations

Sumber: API Steam aplikasi 1076160 dan manual resmi berformat PDF.

| Mekanik | Detail |
|---|---|
| **Kendali emisi** | Tiga kategori pemancar terpisah yaitu radar, sonar aktif, dan penanggulangan elektronik, masing-masing dua keadaan. Bawaannya diwariskan berlapis dari **pihak ke misi ke kelompok ke unit induk**. **Kendali emisi terputus-putus** menyalakan dan mematikan pada interval acak atau tetap. Ada **lima tingkat siaga se-pihak** dengan konfigurasi emisi sendiri |
| Aturan pelibatan | Senjata **ketat, bebas, atau tahan**, diatur terpisah per domain udara, permukaan, bawah permukaan, dan darat |
| Ambiguitas | Melibatkan sasaran ambigu bisa diabaikan, **optimis** bila area ketidakpastian kurang dari tiga kali toleransi senjata, atau **pesimis** bila kurang dari satu kali |
| **Salvo dan penjenuhan** | Alokasi senjata diatur per pasangan senjata dan tipe sasaran, berbasis **nilai pertahanan rudal** dalam satuan **setara Harpoon**: kapal kecil atau sipil bernilai **dua**, kapal penjelajah besar bernilai **96**. Dengan banyak penyerang, tiap unit menghitung salvo lalu mengirim **proposal tembakan**; pihak mengelompokkan per sasaran dan memilih yang paling menjanjikan, sehingga **mencegah tembakan berlebihan** |
| Zona tanpa lolos | Opsi menembak hanya bila sasaran tidak bisa lolos dengan berbalik arah |
| **Zona konvergensi** | Butuh ruang bebas **minimal 600 kaki** di bawah sasaran; interval **40 mil laut di kutub sampai 20 mil laut di khatulistiwa**; ketebalan cincin 5 mil laut; jalur langsung maksimum sekitar 9,5 mil laut; **mustahil di perairan dangkal**; punggungan bawah laut memblokir jalur |
| Inferensi kontak | **Datum torpedo** dan **datum api** menghasilkan kontak kapal selam walau kapal selamnya tidak pernah terdeteksi |
| Medan | Hutan, lahan pertanian, dan perkotaan mengganggu deteksi radar |

---

## 12. Victoria 3

> Perlu dicatat: halaman Navy versi langsung menggambarkan sistem hasil perombakan yang lebih baru, dengan pelaut dari Naval Administration, kategori Capital, Cruiser, Torpedo Craft, dan Supply Ship, tujuh tipe misi, serta pertempuran berbasis rasio deteksi berbanding visibilitas. Tabel di bawah adalah **versi 1.9** dari arsip. Keduanya terverifikasi tetapi **berbeda versi**; versi 1.9 punya angka, sementara model deteksi berbanding visibilitas lebih berguna secara konseptual.

| Kelas | Tipe | Serang | Tahan | Blokade | Kehilangan moral | Modifier khas |
|---|---|---|---|---|---|---|
| Frigate | Ringan | 10 | 15 | 10 | 10 | — |
| Monitor | Ringan | 20 | 30 | 20 | 8 | Pengawalan +20 persen, kecepatan +20 persen |
| Destroyer | Ringan | 30 | 40 | 30 | 6 | Pengawalan +35 persen, kecepatan +20 persen |
| Torpedo Boat | Ringan | 40 | 30 | 30 | 8 | **Perampokan konvoi +25 persen**, kecepatan +20 persen |
| Scout Cruiser | Ringan | 50 | 50 | 40 | 6 | Pengawalan +50 persen, kecepatan +20 persen |
| Man-o-War | Utama | 25 | 25 | 100 | 10 | Perampokan minus 50 persen |
| Ironclad | Utama | 50 | 50 | 200 | 8 | Perampokan minus 50 persen, kecepatan minus 20 persen |
| Dreadnought | Utama | 80 | 80 | 400 | 6 | Sama |
| Battleship | Utama | 100 | 100 | 500 | 4 | Sama |
| **Submarine** | Dukungan | 60 | 20 | 10 | 8 | **Perampokan konvoi +100 persen**, kecepatan +20 persen |
| Carrier | Dukungan | 120 | 60 | 500 | 6 | Pengawalan +25 persen, kecepatan minus 20 persen |

Satu level pangkalan laut memberi satu flotila berisi seribu orang. Armada wajib berisi **minimal 50 persen kapal ringan** atau terkena penalti organisasi. Modifier persentase **diskalakan menurut proporsi komposisi**, sehingga armada berisi 75 persen kapal torpedo dan 25 persen kapal tempur menghasilkan kecepatan plus 10 persen dan perampokan plus 6,25 persen. Laksamana dan flotila tidak perlu dimobilisasi.

Pengalaman naik satu per minggu dan **lima saat bertempur**, sementara korban menurunkannya proporsional. Jenjangnya dari Rekrut di nol, Reguler di 100, Berpengalaman di 300, Veteran di 700 dengan kerusakan moral plus 25 persen, sampai **Elite di 1.500 dengan serang, tahan, pengawalan, perampokan, dan blokade masing-masing plus 25 persen serta kerusakan moral plus 50 persen**.

Perintah yang tersedia mencakup Pencegatan dengan peluang plus dua, Pencegatan Agresif dengan peluang plus lima tetapi serangan minus 10 persen dan butuh laksamana bersifat nekat atau berani, Serangan Kapal Induk dengan peluang plus empat dan serangan plus 15 persen tetapi pasokan plus 50 persen, **Rampok Konvoi dengan efisiensi perampokan plus 30 persen**, Kawanan Serigala dengan perampokan plus 10 persen dan korban plus 15 persen, Kawal Konvoi dengan perlindungan plus 20 persen tetapi serangan minus 10 persen, dan Blokade.

Dalam pertempuran, penyerang memakai nilai serang dan bertahan memakai nilai tahan, dan pertempuran berlanjut sampai satu sisi kehabisan moral. Jumlah flotila per pelibatan dibatasi **batas komando laksamana**, di mana laksamana dengan batas lebih kecil bisa membawa hingga dua kali lipat sementara yang lebih besar hanya separuh. Kondisi pertempuran diundi ulang tiap sepuluh hari.

Untuk invasi, sebuah simpul menjadi diperebutkan bila armada musuh mencapai 25 persen proyeksi kekuatan penyerang. **Kalah satu pertempuran laut berarti invasi gagal**, dan kalah tiga pertempuran pendaratan juga gagal. Ada jeda dua minggu sebelum pertempuran dimulai, dan pendaratan sulit memberi minus 25 persen sebelum teknologi kapal pendarat.

Untuk pasokan, perampokan memutus jaringan pasokan. **Pasokan 98 persen menghasilkan pemulihan moral 98 persen**, dan **pasokan di bawah 95 persen memberi penalti organisasi setara**, sehingga pasokan 80 persen menurunkan organisasi maksimum 20 persen. Perampokan bahkan bisa memutus akses pasar. Atrisi dasar 10 persen dengan korban 4 sampai 12 persen per minggu, dan berkurang separuh di markas dalam negeri.

---

## 13. Sepuluh mekanik yang layak dipinjam Nation Rise

1. **Anggaran tunggal ditambah tiga pengukur politik dari Rule the Waves.** Prestise yang jatuh ke ambang tertentu berarti kalah permainan, sehingga sekaligus menjadi syarat kemenangan dan rem agresi. **Ketegangan per pasangan negara yang memblokir selat pada ambang tertentu sangat cocok untuk peta kepulauan Indonesia**, karena Malaka, Sunda, dan Lombok bisa tertutup secara diplomatik, bukan hanya militer.
2. **Kelas kapal sebagai hasil validasi statistik, bukan pilihan.** Pemain mengisi angka, sistem mengklasifikasi dan menolak desain ilegal. Ini menghilangkan kebutuhan pohon unit sekaligus memberi AI pegangan kategori.
3. **Riset yang tidak bisa ditargetkan**, hanya prioritas relatif dengan batas 12 persen dan hasil menyusut di atas 10 persen. Ini **mencegah pemain menembak lurus ke nuklir**, relevan langsung dengan keputusan bahwa nuklir harus terasa sebagai pencapaian.
4. **Perjanjian dengan kepatuhan asimetris menurut tipe pemerintahan.** Batasan global yang tetap terasa politis.
5. **Ruang atas geladak sebagai kuota kedua.** Dua anggaran yang bersaing jauh lebih menarik daripada satu penggeser tonase.
6. **Alokasi senjata berbasis nilai pertahanan dalam satuan senjata standar, ditambah proposal tembakan terpusat.** Ini cara paling elegan memodelkan penjenuhan dan mencegah tembakan berlebihan tanpa mensimulasikan tiap rudal. Disarankan menggantikan model kapasitas rudal dikali waktu isi ulang yang sederhana.
7. **Kendali emisi dua keadaan per kategori dengan pewarisan berlapis dan lima tingkat siaga.** Ini setara postur nasional satu klik yang tetap bisa ditimpa per unit.
8. **Deteksi dua ambang, yaitu sepuluh desibel untuk mengidentifikasi dan di atas nol untuk melacak.** Kabut perang bertingkat yang murah dihitung dan mudah dijelaskan, melengkapi mekanik Conflict of Nations yang hanya biner.
9. **Lapisan termal.** Padanan langsung untuk menjadikan kedalaman sebagai dimensi ketiga, yang membuat kapal selam bertenaga udara independen di perairan pesisir benar-benar sulit dicari.
10. **Komposisi armada minimum dengan modifier diskalakan menurut proporsi.** Ini memaksa armada seimbang lewat insentif, bukan aturan keras, dan merupakan versi lebih halus dari rasio penyaringan Hearts of Iron IV.

---

## 14. Yang masih belum terverifikasi

Analisis gerak sasaran secara eksplisit di Cold Waters, jumlah entri basis data Command Modern Operations, halaman proyeksi kekuatan dan militer Victoria 3 karena arsip juga terkena tantangan bot, rumus supremasi per kapal dan efisiensi pengawalan Hearts of Iron IV, statistik modul peledak kedalaman dan penebar ranjau, serta berkas definisi angkatan laut.
