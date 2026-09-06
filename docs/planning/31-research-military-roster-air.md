# Riset Roster Militer Udara: Helicopter, Fighter, Heavies

> Sesi 5 (2026-09-05), dijalankan lewat subagen sesuai aturan 9. Penanda: **[V]** terverifikasi, **[UNV]** tidak terverifikasi, **[USULAN]** angka desain Nation Rise.

> **Pembaruan gelombang riset kedua (dokumen 35).** Empat celah tertutup. Pertama, **nama alutsista lengkap tiga tier kali tiga doktrin untuk enam unit udara** kini tersedia dari aset resmi Bytro. Kedua, **hari unlock riset lengkap untuk lima belas unit udara**. Ketiga, **cooldown AA Envelope adalah sepuluh menit** sementara Point Defense tanpa cooldown, dan modelnya deterministik bukan probabilistik. Keempat, **Stealth Strike Fighter Eastern punya blok statistik resmi lengkap** yang menjadi jangkar skala; rating lunak dan kerasnya masing-masing 11, hampir dua kali lipat rancangan di dokumen ini, sehingga **seluruh skala rancangan udara perlu dikalibrasi ulang** (D60). Lihat `35-research-con-data-audit.md`.

> **KOREKSI BESAR dari data dalam game (dokumen 41).** Tiga rancangan di dokumen ini terbantah. Pertama, **Theater Defense System adalah spesialis anti-misil**, dengan serang misil 12 berbanding sayap tetap hanya 2; rancangan di sini memberinya 20 terhadap sayap tetap dan itu salah arah sepenuhnya. Kedua, **jangkauan serang udara berbeda dua orde besaran**, yaitu 650 untuk pesawat tempur sampai 5.000 untuk Stealth Bomber, bukan puluhan. Ketiga, **unit anti-udara bertahan jauh lebih kuat daripada menyerang**. Statistik lengkap seluruh unit udara kini tersedia.

## 0. Temuan yang mengubah rencana

**Wiki Conflict of Nations tidak memuat satu pun angka numerik untuk unit udara.** Ketujuh belas halaman unit udara diperiksa dua kali, termasuk dengan permintaan eksplisit untuk mereproduksi setiap tabel numerik, dan hasilnya nihil. Halaman-halaman itu adalah stub kualitatif.

Konsekuensinya tegas: **angka HP, serang, dan tahan per tipe armor untuk unit udara harus kita desain sendiri.** Tidak ada sumber publik yang memilikinya. Setiap sumber yang mengklaim punya angka ini tanpa bukti harus dicurigai. Ini kebalikan dari kategori darat, di mana lima halaman infanteri punya tabel penuh.

Dua koreksi tambahan. Halaman `Rotary_Wing_Veteran` dan `Fixed_Wing_Veteran` **tidak ada**, mengembalikan 404. Yang ada adalah **Rotary Wing Officer** dan **Fixed Wing Officer**. Istilah Veteran tampaknya nama lama. Halaman `Officer` sendiri juga 404, sehingga bonus officer tetap tidak terverifikasi.

Sumber yang berhasil: halaman Air Base, Airfield, Stealth, Field of View, Air Assault, Units, Doctrine, Research, dan Combat di wiki Conflict of Nations, plus empat halaman udara Hearts of Iron IV, plus sebelas halaman Wikipedia. Yang gagal: seluruh Fandom (402), Supremacy 1914 (403), Call of War (DNS mati), dan wiki.gg versi Call of War serta Supremacy 1914 (401, masih privat).

---

## 1. Gerbang Air Base, terverifikasi penuh [V]

| Level | Waktu | Biaya | HP | Ambang operasional | Produksi | Unit yang dibuka |
|---|---|---|---|---|---|---|
| 1 | 1 hari | 750 pasokan, 1.000 komponen, 1.000 bahan bakar, 500 elektronik, 2.750 dana | 10 | 4 HP | +5% | Helicopter Gunship, UAV, Air Superiority Fighter, Rotary Wing Officer |
| 2 | 1h 2j | 1.000 / 1.250 / 1.500 / 750 / 4.750 | 15 | 6 HP | +10% | Airmobile Infantry, Attack Helicopter, ASW Helicopter, Naval ASF, Strike Fighter, Fixed Wing Officer, Airborne Officer |
| 3 | 1h 4j | 1.250 / 1.500 / 2.000 / 1.000 / 6.750 | 20 | 8 HP | +15% | Naval Strike Fighter, Naval Patrol Aircraft, Heavy Bomber, Elite Attack Helicopter |
| 4 | 1h 6j | 1.500 / 2.000 / 500 langka / 2.500 / 1.250 / 8.750 | 25 | 10 HP | +20% | AWACS, Naval AWACS |
| 5 | 1h 8j | 1.750 / 2.500 / 750 langka / 3.000 / 1.500 / 11.000 | 30 | 12 HP | +25% | Stealth ASF, Stealth SF, Stealth Bomber |

Cocok seratus persen dengan catatan kita, plus tambahan Officer dan Elite Attack Helicopter. **Gerbang ini adalah tulang punggung progres udara dan dipakai apa adanya.**

**Airfield** sebagai alternatif di provinsi non-kota [V]: waktu 21 jam, biaya 700 pasokan, 900 komponen, 800 bahan bakar, 2.500 dana, upkeep 100 dana per hari, HP 10, operasional pada 40 persen HP, **hancur otomatis saat provinsi ditaklukkan**, tanpa level.

Waktu servis udara [V]: naik 30 menit, turun 1 jam, isi bahan bakar 15 menit. **Waktu turun dan isi bahan bakar berskala terbalik dengan kesehatan**, sehingga pada 40 persen HP menjadi 2,5 jam dan 37,5 menit. Pangkalan yang dibom menjadi lambat, bukan sekadar mati. Mekanik ini layak diadopsi.

---

## 2. Roster udara Conflict of Nations, kualitatif [V]

Daftar kanonik: tiga helikopter (Gunship, Attack, ASW), tujuh pesawat tempur (Air Superiority Fighter, Naval ASF, Stealth ASF, Strike Fighter, Naval Strike Fighter, Stealth Strike Fighter, UAV), dan lima heavies (Naval Patrol Aircraft, AWACS, Naval AWACS, Heavy Bomber, Stealth Bomber).

### 2.1 Helikopter

| Unit | Deskripsi dan fitur | Prasyarat | Alutsista per doktrin |
|---|---|---|---|
| Helicopter Gunship | Sasaran lunak atau berlapis ringan. **Menghindari deteksi rudal anti-udara dengan terbang NOE.** Ranged Combat, Reveal Stealth, Carrier Launch, Radar | Air Base 1, Arms Industry 1 | tidak terdata |
| Attack Helicopter | Sasaran keras dan berlapis berat. Meriam otomatis dan rudal anti-tank terpandu. Mendeteksi unit stealth | Air Base 2, Arms Industry 1 | **Western AH-64 Apache, Eastern Ka-50, Eropa A129 Mangusta**; tier lain menyebut Raider, Mi-28 Havoc, Eurocopter Tiger |
| ASW Helicopter | Mendeteksi dan menyerang kapal selam serta kapal permukaan. **Sonar** | Air Base 2, Arms Industry 1 | tidak terdata |

**Temuan mekanik paling penting di kategori udara:** ketiga helikopter punya sifat **Nap-of-the-Earth** yang membuat mereka lolos dari deteksi rudal anti-udara. Dikonfirmasi silang oleh halaman Mobile SAM yang menyatakan tidak menyerang helikopter terbang rendah, dan oleh halaman Mobile Anti-Air Vehicle yang menyebut helikopter takut pada penyerang darat terbang rendah.

Artinya **Mobile SAM bukan penangkal helikopter. Penangkalnya adalah Mobile Anti-Air Vehicle.** Ini asimetri desain yang elegan dan wajib direplikasi, karena menciptakan dua ekosistem penangkal yang terpisah.

### 2.2 Pesawat tempur

| Unit | Deskripsi dan fitur | Prasyarat | Catatan |
|---|---|---|---|
| Air Superiority Fighter | Menegakkan dominasi udara total. **Signature radar tinggi.** Rentan terhadap Mobile AA dan Mobile SAM | Air Base 1 | Biaya riset **1.900 pasokan, 1.900 material langka, 4.000 dana** [V] |
| Naval ASF | Versi kapal induk, plus pengintaian | Air Base 2 | Carrier Launch |
| Stealth ASF | **Tidak terlihat oleh sebagian besar unit berradar** | Air Base 5, Secret Weapons Lab 1, Arms Industry 1 | F-22 Raptor disebut eksplisit |
| Strike Fighter | Unit pengebom utama dengan kerusakan udara rendah. **Pengurangan penampang radar mencegah deteksi oleh unit radar lemah.** Menyerang sasaran darat otomatis saat patroli | Air Base 2 | Launch Cruise Missile satu buah |
| Naval Strike Fighter | Kekuatan pada penyerangan kapal. Satu rudal per 12 jam | Air Base 3 | **Western F/A-18 Super Hornet, Eastern Su-34K, Eropa Harrier II Plus** |
| Stealth Strike Fighter | Kekuatan mengalahkan tank dan sasaran lunak. **Tidak terlihat saat tidak bertempur** | Air Base 5 | Terbuka hari 16 |
| UAV | **Sumber utama intelijen termobilisasi.** Signature rendah | Air Base 1, Arms Industry 1 | Eropa tier 1 **Super Heron**; mobilisasi **13 jam** |

Aturan radar yang terverifikasi: ada empat tipe signature (unit darat, sayap tetap, sayap putar, unit laut) dan dua ukuran (tinggi dan rendah). **Radar yang mendeteksi signature rendah otomatis mendeteksi signature tinggi pada tipe yang sama.** Hasil deteksi radar hanya berupa titik posisi, berbeda dari jarak pandang yang memberi detail.

### 2.3 Heavies

| Unit | Deskripsi dan fitur | Prasyarat | Keterbatasan |
|---|---|---|---|
| Naval Patrol Aircraft | Mendeteksi dan menyerang kapal selam serta kapal permukaan. Sonar, Reveal Stealth laut, radar besar | Air Base 3 | Lemah terhadap udara |
| AWACS | Pengawasan radar jarak jauh segala cuaca. Mendeteksi pesawat, helikopter, dan **unit darat berlapis baja** dari jarak jauh | Air Base 4, Arms Industry 1 | **Tanpa senjata dan tanpa kemampuan balas sama sekali** |
| Naval AWACS | Versi kapal induk, analog E-2 Hawkeye | Air Base 4 | Sama |
| Heavy Bomber | Menembus jauh ke wilayah udara musuh. Efektif terhadap bangunan, sumber daya, fortifikasi, dan unit termasuk laut. Tier lanjut **melewati bonus bunker** | Air Base 3, Arms Industry 1 | **Tiga rudal jelajah per 12 jam** [V]; signature tinggi, lambat |
| Stealth Bomber | Tidak terlihat oleh sebagian besar unit berradar. Tiga rudal per 12 jam | Air Base 5 | **Tidak bisa menyerang unit laut** [V]; **tidak mendeklarasikan perang saat menembus wilayah udara asing** [V] |

Dua sifat Stealth Bomber itu sangat penting. Tidak memicu deklarasi perang menjadikannya alat pengintaian dan serangan pertama. Tidak bisa menyerang kapal mencegah dominasi total.

### 2.4 Damage Distribution Weight udara

| Bobot | Unit |
|---|---|
| 10 | Air Superiority Fighter |
| 9 | Naval ASF |
| 8 | Helicopter Gunship |
| 7 | Attack Helicopter |
| 5 | Stealth ASF, Strike Fighter, Naval Strike Fighter, ASW Helicopter |
| 4 | Heavy Bomber |
| 3 | Stealth Strike Fighter, Naval Patrol Aircraft |
| 2 | UAV |
| 1 | Stealth Bomber, AWACS |

Bobot ini adalah pengganti armor untuk pesawat. AWACS dan Stealth Bomber praktis kebal dalam tumpukan besar. Air Superiority Fighter dengan bobot 10 adalah pengawal yang menyerap sekitar 21 persen kerusakan dalam formasi campuran penuh. Ini kompensasi desain yang jujur, karena AWACS memang tidak punya senjata.

---

## 3. Mekanik udara Conflict of Nations

### 3.1 Patroli [V]

Perintah patroli menandai **lingkaran biru**; unit musuh yang masuk area itu diserang otomatis. Strike Fighter yang berpatroli otomatis menyerang sasaran darat yang berpapasan dengannya. Taktik komunitas yang terdokumentasi di wiki: mengirim satu pesawat tempur berpatroli untuk membuka sasaran musuh dengan radarnya. **Patroli adalah alat pengintaian murah, bukan hanya alat serang.**

### 3.2 Pesawat tidak jatuh saat pangkalan hancur [V]

Ini temuan yang membalik asumsi umum.

| Situasi | Perilaku |
|---|---|
| Pangkalan hancur saat pesawat sedang terbang | Pesawat **terbang kembali ke pangkalan terdekat** dan mengisi bahan bakar |
| Pangkalan hancur saat pesawat sedang parkir | Pesawat **berubah menjadi truk pengangkut** dan harus mencapai pangkalan lain |
| Tidak ada pangkalan di dekatnya | Pesawat bergerak lewat truk pengangkut ke bandara terdekat |

Hukuman ini lebih baik daripada kehancuran. Investasi pemain tidak dihapus, tetapi tempo dihukum berat karena pesawat menjadi lambat dan sangat rentan. **Rekomendasi kuat untuk diadopsi.**

Timer bahan bakar eksplisit tidak terdokumentasi; halaman Fuel dan Patrol mengembalikan 404.

### 3.3 Air Assault lima tahap [V]

| Tahap | Durasi | Isi |
|---|---|---|
| 1 Naik | 90 detik | Naik helikopter di pangkalan terdekat |
| 2 Angkut | — | Unit menjadi **helikopter angkut yang rentan tembakan anti-udara** dan **tidak bisa dialihkan di tengah jalan** |
| 3 Serbu helikopter | fase pertama tempur | **Bertempur sebagai helikopter pada fase pertama**, tidak menduduki wilayah |
| 4 Penurunan | **1 jam** | Wajib, ada atau tidak ada landasan |
| 5 Tempur reguler | — | Bertempur sebagai unit darat normal |

Aturan tambahan: serbuan udara **tidak bisa dirantai**, harus lewat pangkalan antara; unit tidak bisa menyerbu udara saat sedang bertempur; unit lintas udara mempertahankan jangkauan naik dari landasan asalnya walau sudah dipindah; dan **kapal induk serta Elite Frigate tidak memperpanjang jangkauan serbuan udara**.

Tahap ketiga adalah yang paling elegan. Unit bertempur sebagai helikopter dulu, baru menjadi infanteri. **Salin utuh.**

### 3.4 Struktur anti-udara [V struktur, angka tidak tersedia]

Halaman Combat mengonfirmasi tiga kategori: **Offensive** ketika unit anti-udara menyerang pesawat lebih dulu, **Envelope** ketika pesawat yang masuk radius diserang otomatis, dan **Point Defense** untuk pertahanan diri terhadap serangan langsung dan rudal. Isi ketiga bagian itu kosong di wiki, sehingga cooldown dan angka tidak tersedia.

Mobile Anti-Air Vehicle dideskripsikan punya kedua mode sekaligus, envelope dan pertahanan titik. Mobile SAM membuka anti-udara jarak jauh di hari 3 dan tidak menyerang helikopter rendah.

### 3.5 Cara stealth diungkap [V]

Unit stealth sepenuhnya tak terlihat dalam jarak pandang dan **bisa menyusup wilayah tanpa mendeklarasikan perang**. Stealth beroperasi terpisah dari radar; keduanya adalah metode pengintaian yang berbeda.

**Celah besar yang terverifikasi:** unit stealth **tidak stealth saat menjadi kapal angkut atau pesawat angkut**. Helikopter angkut tetap stealth.

Tiga cara mengungkap: unit **Reveal Stealth** yang domainnya cocok (darat, udara, atau laut) mengungkap otomatis semua musuh dalam jarak pandang; **masuk pertempuran**; dan **sonar** khusus kapal selam, yang dimiliki kapal permukaan, kapal selam, Naval Patrol Aircraft, dan ASW Helicopter.

---

## 4. Roster Perang Dunia 1 dan 2 [UNV]

Semua wiki resmi tidak dapat diakses. Yang disajikan hanya kerangka.

**Supremacy 1914:** Balloon sebagai pengamat statis dengan radius pandang besar, Airplane untuk pengintaian dan serangan ringan dengan pola terbang lalu kembali, Bomber dengan kerusakan lebih besar tetapi lebih lambat dan berjangkauan lebih pendek, dan Zeppelin sebagai pengebom jarak jauh yang sangat rentan. Pola desainnya: udara Perang Dunia 1 harus terasa **rapuh, jarang, dan bergantung pangkalan**, dengan dampak psikologis besar tetapi bukan tulang punggung tempur.

**Call of War:** Interceptor untuk superioritas udara, Tactical Bomber multiperan, Attack Bomber untuk dukungan dekat dan anti-lapis baja, Naval Bomber spesialis torpedo, Strategic Bomber untuk merusak ekonomi, dan Rocket Fighter sebagai pencegat akhir permainan.

**Rocket Fighter adalah contoh cemerlang penyeimbangan lewat jangkauan.** Pesawat terkuat dibatasi radius tempur yang sangat kecil, bukan oleh rating. Ini persis solusi yang kita butuhkan untuk masalah pertahanan infanteri 0,3.

---

## 5. Pembanding Hearts of Iron IV [V]

### 5.1 Model airframe dan payload

| Airframe | Kelincahan | Pertahanan udara | Kecepatan | Jangkauan | Peran |
|---|---|---|---|---|---|
| Kecil | 35–65 | 7–25 | 400–900 km/j | — | Fighter, dukungan dekat, pengebom laut, pengintai |
| Sedang | 25–45 | 15–24 | 200–500 km/j | — | Heavy Fighter, pengebom taktis, pengintai |
| Besar | 20–40 | 20–54 | 200–400 km/j | 1.000–3.600 km | Pengebom strategis, pengebom patroli |

**Peran ditentukan oleh senjata utama, bukan oleh rangka.** Senapan mesin atau meriam menjadikannya Fighter; bom atau anti-tank menjadikannya dukungan udara dekat; torpedo atau rudal anti-kapal menjadikannya pengebom laut; ruang bom sedang menjadikannya pengebom taktis; ruang bom besar menjadikannya pengebom strategis; kamera pengintai menjadikannya pesawat pengintai.

Ini **model yang sangat kuat untuk Nation Rise** karena mengurangi jumlah unit yang perlu ditulis satu per satu. Satu rangka ditambah muatan menghasilkan peran.

### 5.2 Empat belas misi udara

Pilot Exercises, Air Superiority, Close Air Support, Interception, Strategic Bombing, Naval Strike, Kamikaze Strike, Port Strike, Logistics Strike, Air Supply, Naval Minelaying, Naval Minesweeping, Air Recon, dan Naval Patrol. Prioritas dieksekusi dari kiri ke kanan, mengambil misi valid pertama. Pilot Exercises dan Air Superiority selalu berjalan; sisanya butuh sasaran terdeteksi.

### 5.3 Formula superioritas udara

Kekuatan udara satu sayap adalah jumlah pesawat dikali daya superioritas dikali efisiensi misi. Daya superioritas: Heavy Fighter 1,25; Fighter, Carrier Fighter, Jet Fighter, dukungan dekat, pengebom laut, dan pengebom taktis semuanya 1,00; **Strategic Bomber hanya 0,01**.

Rasio di bawah 40 persen berarti musuh unggul, 40 sampai 60 persen berarti diperebutkan, di atas 60 persen berarti kita unggul. Setiap satu poin keunggulan mengurangi pertahanan dan terobosan musuh 0,7 persen, maksimum 35 persen pada superioritas penuh. Penalti kecepatan gerak maksimum 30 persen.

Bangunan anti-udara memberi minus 5 daya udara per level, maksimum minus 25. Unit anti-udara mengurangi penalti udara ke lawan sampai minimum 0,25 kali.

Batas dukungan udara dekat adalah tiga kali lebar tempur musuh. Bonus serangan dasar 25 persen, diskalakan linear terhadap kapasitas. Reduksi kerusakan anti-udara maksimum 75 persen tercapai pada rata-rata serangan anti-udara 4,3, dengan peluang 7 persen menembak jatuh pesawat.

Kapasitas pangkalan udara 200 pesawat per level, maksimum level 10. Kepadatan berlebih memberi minus 2 persen per 1 persen kelebihan, dan misi gagal total pada 50 persen di atas kapasitas.

### 5.4 Doktrin udara

| Doktrin | Bonus awal | Filosofi |
|---|---|---|
| Strategic Destruction | Pengeboman strategis +20 persen, efisiensi pengawalan +25 persen | Pengeboman massal pabrik, kilang, dan infrastruktur transportasi jauh di belakang garis |
| Battlefield Support | Deteksi pesawat tempur +15 persen, efisiensi misi dukungan +20 persen | Kerja sama erat darat dan udara, serangan udara sebagai artileri terbang |
| Operational Integrity | Deteksi pencegatan +20 persen, efisiensi misi dukungan +10 persen | Meraih dan mempertahankan superioritas udara lewat pengebom sedang |

Jerman dan Uni Soviet memulai dengan Battlefield Support; Inggris, Prancis, Jepang, dan Italia dengan Operational Integrity; mayoritas lainnya dengan Strategic Destruction.

### 5.5 Pembanding lain

Command Modern Operations memakai basis data DB3000 dan punya edisi profesional yang diadopsi organisasi pertahanan. Ini standar emas realisme udara dan laut, berguna sebagai acuan taksonomi sensor dan senjata, bukan untuk penyeimbangan.

DCS World mendukung patroli udara tempur, pertempuran udara, serangan udara, dukungan dekat, **penekanan pertahanan udara musuh**, dan angkutan udara. Ini mengonfirmasi bahwa **penekanan pertahanan udara adalah misi kelas satu** yang layak menjadi unit atau misi terpisah, sesuatu yang tidak dimiliki Conflict of Nations dan bisa menjadi pembeda Nation Rise.

Wargame Red Dragon membatasi udara lewat **ketersediaan kartu terbatas per dek** dan **amunisi habis sehingga harus kembali ke pangkalan**, bukan lewat rating. Prinsip yang sama dengan yang kita butuhkan.

---

## 6. Taksonomi dunia nyata

### 6.1 Helikopter

| Subkelas | Contoh | Kekuatan | Kelemahan | Representasi |
|---|---|---|---|---|
| Serang | AH-64E Apache, Ka-52, Mi-28N, Tiger, Z-10 | Serang keras sangat tinggi, NOE menghindari radar rudal, kemampuan melayang dan berlindung | Rentan rudal panggul dan meriam anti-udara, lambat | Serang keras tinggi, tahan sayap tetap rendah, imun Mobile SAM, sangat rentan Mobile AA |
| Serbaguna dan angkut | UH-60, Mi-17, NH90 | Fleksibel, murah, banyak | Nyaris tanpa senjata | Bukan unit tempur, jadikan fase angkut pada serbuan udara |
| Angkat berat | CH-47, Mi-26 | Kapasitas besar | Sangat besar dan lambat | Pemungkin angkutan udara untuk unit berat |
| Anti-kapal selam | MH-60R, AW101 Merlin, Ka-27 | Sonar celup dan torpedo, bisa dari kapal induk | Tak berdaya melawan udara | ASW Helicopter dengan sonar dan Reveal Stealth laut |
| Pengintai | OH-58D Kiowa Warrior | Murah, jarak pandang besar | Sangat rapuh | Gunship tier 1 atau unit pengintai murah |

Catatan historis yang berguna sebagai pembenaran naratif: helikopter bersenjata awal terbukti **tidak efektif** karena kurangnya perlindungan lapis baja dan kecepatan di lingkungan ancaman tinggi.

### 6.2 Pesawat tempur

Generasi 4 mencakup F-16C, F-15C, Su-27, MiG-29, Mirage 2000 dengan kendali fly-by-wire dan radar pulse-doppler. Generasi 4,5 mencakup F-15EX, F-16V, F/A-18E/F, Rafale, Typhoon, Gripen E, Su-35, Su-30SM, J-10C, J-16, MiG-35 dengan radar AESA, fusi sensor parsial, pengurangan penampang radar, dan tautan data. Generasi 5 mencakup F-22 sejak Desember 2005, F-35 sejak Juli 2015, J-20 sejak Maret 2017, Su-57 sejak Desember 2020, J-35 sejak September 2025, dan KF-21, dengan stealth, senjata di dalam badan, radar probabilitas intersepsi rendah, supercruise, dan fusi data berjejaring. Generasi 6 mencakup NGAD, GCAP, dan FCAS dengan pasangan berawak dan tak berawak.

**Prinsip representasi yang penting:** kenaikan generasi di dunia nyata bukan kenaikan kerusakan linear, melainkan **penurunan kemungkinan terdeteksi dan tertembak**. Di game ini harus diterjemahkan sebagai penurunan bobot kerusakan ditambah signature rendah dan stealth, bukan serangan yang membengkak. Conflict of Nations sudah melakukan ini dengan benar: Stealth ASF berbobot 5 versus ASF berbobot 10.

### 6.3 Pengebom

| Pesawat | Muatan | Ciri |
|---|---|---|
| B-52H | 32.000 kg | Desain terakhir dibuat 1962, kini platform rudal jelajah dan munisi presisi |
| B-1B Lancer | 34.000 kg | Stealth parsial |
| **B-2 Spirit** | **18.000 kg** | Stealth penuh, muatan **lebih kecil** dari B-52 dan B-1 |
| B-21 Raider | dalam pengembangan | Generasi berikutnya |
| Tu-95 | 25.000 kg | Turboprop, terus diperbarui |
| Tu-160 | 40.000 kg | Supersonik |
| Tu-22M | 21.000 kg | Jarak menengah |
| H-6K | 12.000 kg | Turunan lisensi Tu-16 |

Dua hal yang harus tercermin di desain. Pertama, pengebom modern **mengirim rudal jelajah dari jarak aman**, bukan mengandalkan pengeboman langsung, sehingga mekanik tiga rudal per dua belas jam di Conflict of Nations benar secara doktrinal dan harus dipertahankan. Kedua, **stealth mengurangi muatan**, terbukti dari B-2 yang membawa 18 ton versus B-52 yang membawa 32 ton. Karena itu Stealth Bomber Nation Rise sebaiknya membawa **dua rudal, bukan tiga**, sebagai imbal balik yang jujur.

### 6.4 Pendukung

E-3 Sentry adalah peringatan dini pertama yang memakai radar pulse-doppler dan mampu melacak sasaran yang biasanya hilang di kekacauan pantulan tanah. E-7 Wedgetail menjadi pengganti modern yang diadopsi NATO. E-2D Advanced Hawkeye adalah versi kapal induk dengan radar AN/APY-9. P-8 Poseidon adalah turunan Boeing 737 yang menggantikan P-3 sejak 2013.

Jangkauan AWACS terverifikasi: mendeteksi pesawat hingga **400 km**, jauh di luar jangkauan sebagian besar rudal darat ke udara. Satu pesawat di ketinggian 9.000 meter menutup sekitar 312.000 kilometer persegi, dan **tiga pesawat cukup untuk seluruh Eropa Tengah**.

Sensor pesawat patroli maritim: radar untuk mendeteksi snorkel dan periskop, sonobuoy, detektor anomali magnetik yang mendeteksi besi lambung kapal selam, dan kamera inframerah. Kelemahan strukturalnya menuntut daya tahan panjang dan kecepatan jelajah rendah, itulah sebabnya pengebom jet gagal di peran ini.

Kerentanan AWACS juga terverifikasi: sistem peringatan dini bisa dideteksi dan dijadikan sasaran, dan mobilitas adalah satu-satunya perlindungan. Ini membenarkan desain Conflict of Nations yang memberi AWACS nol senjata tetapi bobot kerusakan 1.

### 6.5 Pesawat nirawak dan munisi berkeliaran

Kelas ketinggian tinggi daya tahan panjang mencakup MQ-9 Reaper, MQ-4C Triton, Wing Loong, dan TAI Aksungur. Kelas menengah taktis mencakup MQ-1 Predator, Bayraktar TB2, Bayraktar Akinci, CH-5, dan Orion. Kelas generasi berikutnya mencakup Bayraktar Kizilelma yang bermesin jet dan mampu beroperasi dari kapal induk, TAI Anka-3 bersayap terbang, Hongdu GJ-11, S-70 Okhotnik-B, dan BAE Taranis.

Munisi berkeliaran mencakup Switchblade yang dibawa dalam ransel, ZALA Lancet dengan sayap X ganda, Shahed-136 untuk jarak jauh, dan IAI Harop yang otonom untuk penekanan pertahanan udara. Semuanya adalah **senjata sekali pakai yang dirancang untuk menabrak sasaran**.

**Implikasi desain:** munisi berkeliaran **bukan unit udara**, melainkan **munisi**. Conflict of Nations sudah benar menempatkannya sebagai barang terpisah. Di Nation Rise jadikan konsumabel sekali pakai dengan bobot kerusakan nol, bukan pesawat ber-HP.

Kelemahan pesawat nirawak yang terverifikasi: **ketergantungan pada GPS dan tautan komunikasi yang rentan pengacauan**, kerentanan terhadap sistem penangkal, dan jeda kendali.

---

## 7. Usulan pohon riset udara Nation Rise [USULAN]

Tiga cabang paralel dengan gerbang ganda, yaitu level Air Base dan hari kalender, plus satu cabang dukungan silang yang tidak ada di Conflict of Nations.

### 7.1 Cabang rotary wing

Rotor Composite di Air Base 1 hari 1 membuka Gunship dasar. **NOE Flight Profile** di hari 2 memberi imunitas terhadap Mobile SAM dan menambah jarak pandang. Tandem ATGM di Air Base 2 hari 2 membuka Attack Helicopter. Mast-Mounted Sight di hari 5 memberi Reveal Stealth darat. Dipping Sonar di hari 3 membuka ASW Helicopter dengan sonar. Air-to-Air Missile di Air Base 3 hari 9 menambah pertahanan terhadap sayap putar. Rotorcraft Datalink di hari 14 menambah satu tick sortie dan membagi radar ke seluruh tumpukan.

### 7.2 Cabang fixed wing

Turbofan Gen-4 di Air Base 1 hari 1 membuka Air Superiority Fighter dan UAV. Pulse-Doppler Radar di hari 2 menambah jangkauan radar dan mendeteksi signature tinggi. Precision Munition di Air Base 2 hari 3 membuka Strike Fighter. AESA dan Sensor Fusion di hari 7 memungkinkan deteksi signature rendah. Carrier Integration di Air Base 3 hari 8 membuka Naval ASF dan Naval Strike Fighter. **RCS Reduction** di Air Base 4 hari 12 menurunkan signature dari tinggi ke rendah dan mengurangi bobot kerusakan dua poin. Low-Observable Airframe di **Air Base 5 dan Secret Weapons Lab 1** hari 16 membuka Stealth ASF dan Stealth Strike Fighter dengan bobot kerusakan turun lima poin.

### 7.3 Cabang heavies

Long-Range Airframe di Air Base 3 hari 4 membuka Heavy Bomber. Maritime Sensor Suite di hari 5 membuka Naval Patrol Aircraft dengan sonar dan detektor anomali magnetik. Standoff Cruise Missile di hari 7 memberi tiga rudal per dua belas jam. Rotodome AEW di Air Base 4 hari 9 membuka AWACS dengan radar empat kali lipat, bobot kerusakan 1, dan tanpa senjata. Naval AEW di hari 11 membuka Naval AWACS. Penetrator Warhead di hari 14 memungkinkan melewati bonus bunker. Flying Wing LO di Air Base 5 hari 18 membuka Stealth Bomber dengan dua rudal per dua belas jam, tidak bisa menyerang kapal, dan tidak mendeklarasikan perang saat melintas.

### 7.4 Cabang dukungan silang, baru

**SEAD Package** memberi Strike Fighter misi penekanan pertahanan udara dengan serangan dua setengah kali lipat terhadap unit anti-udara, dan **mematikan selubung anti-udara sasaran selama dua tick**. **Aerial Refueling** menambah dua tick sortie untuk semua sayap tetap. **ECM Pod** mengurangi kerusakan selubung anti-udara terhadap tumpukan ini sebesar 30 persen. **Loyal Wingman** membuat satu pesawat nirawak per skuadron menyerap kerusakan seolah berbobot 10, berfungsi sebagai umpan.

Penekanan pertahanan udara adalah **misi terpenting yang tidak dimiliki Conflict of Nations**. Dengan misi ini pemain punya jawaban terhadap selubung anti-udara selain menerbangkan lebih banyak pesawat, sehingga sistem anti-udara yang keras tetap terasa adil, bukan tembok mati.

---

## 8. Usulan roster final Nation Rise Modern [USULAN]

### 8.1 Kalibrasi skala

Satu-satunya jangkar numerik unit Conflict of Nations yang tersedia adalah Airmobile Infantry: HP 15 sampai 20, serang lunak 5 sampai 9, kecepatan berjalan 0,10 sampai 0,20. Semua angka usulan dijaga dalam pita skala yang sama agar kompatibel dengan formula yang sudah kita kunci.

Turunan dari catatan kita: rasio pertukaran 10,86 dengan pertahanan infanteri terhadap sayap tetap sebesar 0,3 berarti serangan udara efektif terhadap sasaran lunak sekitar **3,26**. Angka ini dipakai konsisten di seluruh perhitungan.

### 8.2 Helikopter

| Kelas | Tier | Alutsista Western / Eastern / Eropa | HP | Lunak | Keras | Laut | Selam | Tahan sayap tetap | Tahan sayap putar | Pandang | Radar | Jarak | Bobot | Gerbang |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Helicopter Gunship | 1 | AH-1Z / Mi-24 / Gazelle | 16 | 4,0 | 1,5 | 1,0 | 0 | 0,8 | 1,5 | 30 | 40 | 25 | 8 | AB1 |
| | 2 | AH-1Z Viper / Mi-35M / Tiger HAP | 19 | 5,5 | 2,5 | 1,5 | 0 | 1,0 | 2,0 | 35 | 50 | 30 | 8 | AB1 |
| | 3 | AH-1Z Blk III / Mi-35P / Tiger HAD | 22 | 7,0 | 3,5 | 2,0 | 0 | 1,2 | 2,5 | 40 | 60 | 35 | 8 | AB1 |
| Attack Helicopter | 1 | AH-64D / Mi-28N / A129 Mangusta | 18 | 3,0 | 5,5 | 1,5 | 0 | 0,9 | 1,8 | 30 | 45 | 30 | 7 | AB2 |
| | 2 | AH-64E / Ka-52 / Tiger HAD | 21 | 4,0 | 7,5 | 2,5 | 0 | 1,1 | 2,4 | 35 | 55 | 35 | 7 | AB2 |
| | 3 | AH-64E v6 / Ka-52M / Tiger Mk3 | 24 | 5,0 | 9,5 | 3,5 | 0 | 1,4 | 3,0 | 40 | 65 | 40 | 7 | AB2 |
| ASW Helicopter | 1 | SH-60B / Ka-27 / Lynx HMA8 | 15 | 1,0 | 1,0 | 4,0 | **5,0** | 0,7 | 1,2 | 30 | 45 | 30 | 5 | AB2 |
| | 2 | MH-60R / Ka-27M / AW159 Wildcat | 17 | 1,5 | 1,5 | 5,5 | **7,0** | 0,9 | 1,5 | 35 | 55 | 35 | 5 | AB2 |
| | 3 | MH-60R Blk2 / Ka-31SV / AW101 Merlin HM2 | 20 | 2,0 | 2,0 | 7,0 | **9,0** | 1,1 | 1,9 | 40 | 70 | 40 | 5 | AB2 |

Fitur wajib semua rotary: **NOE** yang memberi imunitas terhadap selubung Mobile SAM tetapi ekspos penuh terhadap Mobile Anti-Air Vehicle, radar untuk sayap putar dan darat, Carrier Launch mulai tier 2, Reveal Stealth pada Attack Helicopter tier 2 ke atas, dan sonar khusus ASW.

### 8.3 Pesawat tempur

| Kelas | Tier | Alutsista Western / Eastern / Eropa | HP | Lunak | Keras | Sayap tetap | Sayap putar | Laut | Bangunan | Tahan sayap tetap | Pandang | Radar | Jarak | Signature | Bobot | Gerbang |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Air Superiority Fighter | 1 | F-15C / MiG-29 / Mirage 2000 | 22 | 1,0 | 0,8 | **7,0** | **6,0** | 0,5 | 0,5 | 2,5 | 45 | 70 | 45 | Tinggi | 10 | AB1 |
| | 2 | F-15EX / Su-35S / Typhoon T3 | 26 | 1,5 | 1,0 | **9,5** | **8,0** | 0,8 | 0,8 | 3,2 | 50 | 85 | 55 | Tinggi | 10 | AB1 |
| | 3 | F-16V Blk70 / Su-35SM / Rafale F4 | 30 | 2,0 | 1,2 | **12,0** | **10,0** | 1,0 | 1,0 | 4,0 | 55 | 100 | 65 | Tinggi | 10 | AB1 |
| Naval ASF | 1–3 | F/A-18E / MiG-29K / Rafale M | 21→28 | 1,0→1,8 | 0,8→1,1 | 6,5→11,0 | 5,5→9,0 | 1,5→3,0 | 0,5→1,0 | 2,3→3,7 | 45→55 | 70→95 | 45→60 | Tinggi | 9 | AB2 |
| Stealth ASF | 1–3 | F-22A / Su-57 / GCAP | 26→32 | 2,0→3,0 | 1,5→2,5 | **13→17** | 10→13 | 1,5→2,5 | 1,0→1,5 | 3,5→5,0 | 60→70 | 110→130 | 70→85 | **Stealth** | 5 | **AB5 + SWL1** |
| Strike Fighter | 1 | F-16C / Su-24M / Tornado IDS | 20 | **3,26** | **3,0** | 1,5 | 2,0 | 2,5 | **5,0** | 1,5 | 40 | 55 | 40 | Tinggi | 5 | AB2 |
| | 2 | F-15E / Su-34 / Rafale F3R | 24 | **4,5** | **4,5** | 2,2 | 2,8 | 3,5 | **7,0** | 2,0 | 45 | 65 | 50 | Rendah | 5 | AB2 |
| | 3 | F-15EX Strike / Su-34M / Typhoon T4 | 28 | **6,0** | **6,0** | 3,0 | 3,5 | 4,5 | **9,0** | 2,5 | 50 | 75 | 60 | Rendah | 5 | AB2 |
| Naval Strike Fighter | 1–3 | **F/A-18E Super Hornet / Su-34K / Harrier II Plus [V]** | 20→27 | 3,0→5,5 | 2,8→5,5 | 1,4→2,8 | 1,8→3,2 | **5,0→9,5** | 4,5→8,0 | 1,4→2,3 | 40→50 | 55→75 | 40→58 | Tinggi→Rendah | 5 | AB3 |
| Stealth Strike Fighter | 1–3 | F-35A / Su-75 / F-35B | 24→30 | **5,5→8,0** | **6,0→9,0** | 3,0→5,0 | 3,5→5,5 | 3,0→5,0 | 7,0→11,0 | 2,8→4,2 | 55→65 | 100→120 | 65→80 | **Stealth** | 3 | AB5, hari 16 |
| UAV | 1 | MQ-1C / Orion / **Super Heron [V]** | 10 | 1,0 | 0,8 | 0 | 0 | 0,3 | 0,5 | 0,4 | **60** | **80** | 20 | **Rendah** | 2 | AB1, hari 1 |
| | 2 | MQ-9A / Sirius / Akinci | 12 | 2,0 | 1,8 | 0 | 0,3 | 0,8 | 1,2 | 0,5 | **70** | **95** | 28 | Rendah | 2 | AB1 |
| | 3 | MQ-9B / S-70 Okhotnik / Anka-3 | 14 | 3,0 | 3,0 | 0,5 | 0,8 | 1,5 | 2,0 | 0,7 | **80** | **115** | 35 | Rendah atau stealth | 2 | AB1 |

Mobilisasi UAV tetap **13 jam** sesuai Conflict of Nations.

### 8.4 Heavies

| Kelas | Tier | Alutsista Western / Eastern / Eropa | HP | Lunak | Keras | Laut | Selam | Bangunan | Populasi | Pandang | Radar | Signature | Bobot | Gerbang | Fitur khas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Naval Patrol Aircraft | 1–3 | P-3C → P-8A / Il-38 → Il-38N / ATL2 → Kawasaki P-1 | 20→26 | 1,0→2,0 | 1,0→2,0 | **6,0→11,0** | **7,0→12,0** | 1,0→2,0 | 0 | 55→70 | **110→150** | Tinggi | 3 | AB3 | Sonar, detektor anomali magnetik, Reveal Stealth laut |
| AWACS | 1–3 | E-3G / A-50U / E-7A Wedgetail | 22→30 | **0** | **0** | **0** | 0 | 0 | 0 | **90→120** | **200→280** | Tinggi | **1** | AB4 | **Tanpa senjata**; radar seluruh tumpukan naik 25 persen; Reveal Stealth udara di tier 3 |
| Naval AWACS | 1–3 | **E-2D Advanced Hawkeye** / Ka-31 / E-2D | 20→27 | 0 | 0 | 0 | 0 | 0 | 0 | 80→105 | **170→240** | Tinggi | 1 | AB4 | Carrier Launch |
| Heavy Bomber | 1 | B-52H / Tu-95MS / — | 28 | 5,0 | 4,0 | 3,0 | 0 | **12,0** | **4,0** | 40 | 60 | Tinggi | 4 | AB3 | **Tiga rudal jelajah per 12 jam [V]** |
| | 2 | B-1B / Tu-22M3 / — | 32 | 7,0 | 6,0 | 5,0 | 0 | **16,0** | **6,0** | 45 | 70 | Tinggi | 4 | AB3 | Tiga rudal per 12 jam |
| | 3 | B-1B Blk / Tu-160M2 / — | 36 | 9,0 | 8,0 | 7,0 | 0 | **21,0** | **8,0** | 50 | 80 | Tinggi | 4 | AB3 | Tiga rudal; **melewati bunker** |
| Stealth Bomber | 1–3 | B-2A / PAK DA / B-21 Raider | 30→38 | 7→11 | 6→10 | **0** | 0 | **18→28** | **7→11** | 55→70 | 95→130 | **Stealth** | **1** | AB5 | **Dua rudal per 12 jam**; **tidak bisa menyerang kapal [V]**; **tidak mendeklarasikan perang saat melintas [V]** |

Heavy Bomber Eropa sengaja dikosongkan karena **tidak ada pengebom strategis Eropa** di dunia nyata. Doktrin Eropa mengompensasinya lewat peluncur rudal jelajah darat dan laut. Ini keputusan desain yang jujur, bukan kelalaian data.

---

## 9. Sistem penyeimbang udara [USULAN, inti]

Masalahnya sudah terbukti: pertahanan infanteri terhadap sayap tetap sebesar 0,3 menghasilkan rasio pertukaran 10,86. Angka itu tidak bisa diperbaiki dengan menaikkan pertahanan, karena infanteri memang tidak bisa melawan jet. **Solusinya bukan rating, melainkan waktu dan ruang.**

### 9.1 Jam sortie

Satu tick sama dengan satu jam.

| Kelas | Jam sortie | Isi bahan bakar | Siklus penuh | Waktu aktif efektif |
|---|---|---|---|---|
| Rotary wing | **2 tick** | 0,25 tick | 3,5 tick | 57 persen |
| Fighter | **3 tick** | 0,25 tick | 6 tick | 50 persen |
| Stealth fighter | **3 tick** | 0,25 tick | 6 tick | 50 persen |
| UAV | **8 tick** | 0,25 tick | 10 tick | 80 persen |
| Heavies pengebom | **5 tick** | 0,25 tick | 9 tick | 56 persen |
| AWACS dan patroli maritim | **6 tick** | 0,25 tick | 10 tick | 60 persen |
| Dengan riset pengisian bahan bakar udara | **+2 tick** | — | — | +15 sampai 20 persen |

Saat jam sortie habis, unit **wajib kembali ke pangkalan otomatis**. Bila tidak ada pangkalan dalam jangkauan, unit **berubah menjadi truk pengangkut**, persis mekanik Conflict of Nations yang terverifikasi. Tidak jatuh, tetapi lumpuh dan sangat rentan.

### 9.2 Token sortie per pangkalan

| Level Air Base | Token per 12 jam |
|---|---|
| 1 | 3 |
| 2 | 4 |
| 3 | 5 |
| 4 | 6 |
| 5 | 7 |
| Airfield | 2 |

Satu lepas landas memakai satu token. Token habis berarti tidak ada pesawat yang bisa lepas landas dari pangkalan itu. **Ini menjadikan Air Base sasaran strategis nomor satu** dan memberi arti pada pembangunan banyak pangkalan.

### 9.3 Selubung anti-udara tiga lapis

| Lapis | Radius | Sasaran | Cooldown | Kerusakan |
|---|---|---|---|---|
| Selubung penolakan area | 60 sampai 100 km, melingkar dan permanen | Pesawat yang **melintas**, walau tidak menyerang | 60 menit | **0,5 kali serangan** |
| Anti-udara ofensif | dalam jarak serang | Pesawat yang menyerang tumpukan ini | tiap tick | **1,0 kali serangan** |
| Pertahanan titik | unit sendiri | **Rudal dan serangan udara langsung** | 30 menit | intersepsi, bukan kerusakan |

Nilai serangan unit anti-udara yang diusulkan:

| Unit | Serang sayap tetap | Serang sayap putar | Serang rudal | Selubung | Catatan |
|---|---|---|---|---|---|
| Mobile Anti-Air Vehicle | 6 | **9** | 3 | 40 km | **Penangkal helikopter**, bisa menyerang NOE |
| Mobile SAM Launcher | **14** | **0** | 8 | **80 km** | **Tidak menyerang helikopter NOE [V]** |
| Theater Defense System | 20 | 0 | **18** | **150 km** | Strategis, lambat |
| Anti-udara laut | 10 | 5 | 12 | 70 km | Melindungi kapal induk |

### 9.4 Verifikasi matematis

Skenario baku: sepuluh pesawat dengan serangan lunak 3,26 menyerang sepuluh infanteri dengan pertahanan sayap tetap 0,3.

| Pertahanan | Kerusakan ke darat per tick | Kerusakan ke udara per tick | Rasio pertukaran |
|---|---|---|---|
| Tanpa anti-udara | 32,6 | 3,0 | **10,87** |
| Satu Mobile Anti-Air | 32,6 | 9,0 | 3,62 |
| Satu Mobile SAM | 32,6 | 17,0 | 1,92 |
| **Satu Mobile SAM dan satu Mobile Anti-Air** | 32,6 | 23,0 | **1,42** |
| Dua Mobile SAM | 32,6 | 31,0 | 1,05 |
| Dua Mobile SAM dan satu Theater Defense | 32,6 | 51,0 | 0,64 |

Ditambah jam sortie. Skuadron sepuluh pesawat dengan HP 26 memiliki kolam 260 HP; satu sortie berlangsung tiga tick.

| Pertahanan | Kerugian udara per sortie | Persentase skuadron hilang | Sortie sampai habis |
|---|---|---|---|
| Tanpa anti-udara | 9,0 | 3,5 persen | 29 |
| Satu SAM dan satu Mobile AA | 69,0 | **26,5 persen** | **3,8** |
| Dua SAM | 93,0 | 35,8 persen | 2,8 |
| Dua SAM dan satu Theater Defense | 153,0 | 58,8 persen | 1,7 |

Ditambah selubung pra-serangan: melintasi selubung dua Mobile SAM sekali jalan memberi 14 kerusakan sebelum pertempuran dimulai, dan sekali lagi saat pulang, sehingga **28 HP hilang hanya untuk transit**.

**Kesimpulan:** kombinasi jam sortie tiga tick, token sortie per pangkalan, dan Mobile SAM dengan serangan sayap tetap 14 beserta selubung 80 km menurunkan rasio pertukaran dari **10,86 menjadi 1,4** pada pertahanan yang wajar, **tanpa menyentuh pertahanan infanteri sama sekali**. Realisme terjaga: infanteri tetap tidak berdaya melawan jet, dan yang melawan jet adalah sistem pertahanan udara, persis seperti dunia nyata.

Rem pengaman terakhir adalah riset penekanan pertahanan udara, yang memberi penyerang jalan keluar. Tanpa itu, pertahanan udara yang keras akan terasa seperti tembok mati, bukan teka-teki taktis.

---

## 10. Ringkasan tujuh temuan utama

1. **Wiki Conflict of Nations tidak punya angka unit udara.** Semua tujuh belas halaman kosong dari tabel numerik. Angka harus didesain sendiri.
2. **Gerbang Air Base level 1 sampai 5 terverifikasi penuh** lengkap dengan biaya dan waktu. Pakai apa adanya.
3. **Pesawat tidak jatuh saat pangkalan hancur**, melainkan berubah menjadi truk pengangkut. Hukuman ini lebih baik daripada kehancuran.
4. **Asimetri NOE adalah kunci.** Mobile SAM tidak bisa menembak helikopter terbang rendah; hanya Mobile Anti-Air Vehicle bisa. Dua ekosistem penangkal yang terpisah.
5. **Air Assault punya lima tahap** dengan fase bertempur sebagai helikopter lebih dulu. Salin utuh.
6. **Hearts of Iron IV memberi model struktur terbaik**: rangka ditambah muatan menghasilkan peran, empat belas misi, daya superioritas dengan pengebom strategis hanya 0,01, dan tiga doktrin dengan bonus konkret.
7. **Penyeimbangan udara harus lewat waktu dan ruang, bukan rating.** Jam sortie, token sortie, dan selubung anti-udara menurunkan rasio pertukaran dari 10,86 menjadi 1,4 tanpa merusak realisme.
