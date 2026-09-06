# Data Statistik Unit dari Panel Informasi dalam Game

> Sesi 5 (2026-09-05). Diekstrak dari 672 tangkapan layar Conflict of Nations milik Billy. **Ini satu-satunya sumber untuk angka yang tidak pernah diterbitkan di wiki mana pun.** Dokumen bertambah seiring hasil agen masuk.

## 1. Kenapa dokumen ini penting

Tiga gelombang riset wiki menyimpulkan hal yang sama: statistik unit udara, unit laut, dan seluruh kategori Support **tidak pernah diterbitkan Bytro dalam bentuk teks**. Halaman Strength Base Rating di wiki resmi bahkan mengarahkan pembaca untuk membuka panel informasi unit **di dalam game**.

Billy melakukan persis itu. Tangkapan layarnya memuat panel yang berisi tabel serang dan tahan per tipe sasaran, ditambah tabel medan lengkap.

## 2. Struktur panel informasi unit

| Bagian | Isi |
|---|---|
| Judul | Nama alutsista, kelas unit dalam kurung, dan lambang doktrin |
| Daily Upkeep | Tiga sampai lima angka dengan ikon, **jumlahnya tidak konsisten antar unit** |
| Deskripsi | Teks naratif |
| Features | Deretan ikon kemampuan |
| **Combat Properties** | Tabel sepuluh kolom, baris ATK Rating, DEF Rating, ATK Range, dan Radar Range |
| **Terrain Information** | Tabel sepuluh kolom untuk unit darat, dua kolom untuk unit laut, baris Attack Mod, Defense Mod, Speed Val, Hit Points, dan Sight Range |

## 3. Temuan struktural: sepuluh kolom, bukan sembilan

Ini koreksi terhadap D56. Riset wiki menyimpulkan ada **tujuh kelas armor** ditambah dua kategori kerusakan struktural, totalnya sembilan kolom. Panel dalam game menunjukkan **sepuluh kolom**.

| Kolom | Ikon | Pembacaan |
|---|---|---|
| 1 | Helm tempur | Infanteri, yaitu sasaran lunak |
| 2 | Siluet tank | Lapis baja, yaitu sasaran keras |
| 3 | Pesawat sayap tetap | Fixed Wing |
| 4 | Helikopter | Rotary Wing |
| 5 | **Kendaraan beroda berantena** | **Kemungkinan kelas terpisah, yaitu kendaraan tanpa lapis baja atau unit pendukung** |
| 6 | Roket menanjak | Misil |
| 7 | Kapal permukaan | Naval |
| 8 | Kapal selam | Submarine |
| 9 | Gedung | **Terkonfirmasi lewat tooltip**: kerusakan terhadap bangunan seperti Army Base dan Air Base |
| 10 | Siluet tiga orang | Populasi |

**Kolom kelima adalah temuan baru.** Bila benar sebuah kelas terpisah, maka Conflict of Nations punya **delapan kelas armor**, bukan tujuh, dan model data kita perlu satu kolom tambahan. Ini menunggu konfirmasi dari agen lain.

Peringatan keandalan: **hanya kolom kesembilan yang punya label tertulis** lewat tooltip. Sembilan lainnya adalah pembacaan ikon. Untuk data yang menjadi satu-satunya sumber, ini layak diverifikasi ulang dengan menangkap tooltip tiap kolom.

Urutan kolom medan yang terbaca: dataran, bukit, pegunungan, perkotaan, pedesaan, rimba, arktik, gurun, perairan dangkal, dan laut dalam.

## 4. Data terkumpul

### 4.1 Elite Armored Fighting Vehicle, Patria AMV 6x6, European

| Baris | Nilai per kolom |
|---|---|
| ATK | 13, 6, —, —, —, —, —, —, 1, 1 |
| DEF | 7,4 / 3,4 / 1,7 / 1,7 / 1,7 / —, —, —, —, — |
| Upkeep harian | 50 komponen, 30 personel, 40 bahan bakar, 150 dana |

Medan, urutan sepuluh kolom: modifier serang kosong, minus 25 persen, kosong, plus 25 persen, plus 25 persen, plus 25 persen, lalu kosong. Modifier tahan hanya di dua kolom terakhir, yaitu minus 50 dan plus 25 persen. Kecepatan 1,3 lalu 0,43 lalu 0,65 tiga kali lalu 0,43 lalu 0,65 lalu 1,3 lalu 2,51 lalu 3. **Daya tahan 32 di seluruh medan darat dan turun ke 15 di air.** Jarak pandang 30 di darat dan 35 di air.

### 4.2 Elite Cruiser, European

| Baris | Nilai |
|---|---|
| ATK | 5,5 / 5,5 / —, —, —, —, **11**, —, 3, 2,5 |
| DEF | —, —, 0,5 / 0,5 / —, 0,5 / **11**, —, —, — |
| **ATK Range** | **75** pada kolom 1, 2, 7, 8, 9, dan 10 |
| **Radar Range** | **75** pada kolom 1, 2, 3, 5, 6, dan 7 |
| Upkeep | 140 komponen, 60 personel, 70 bahan bakar, 200 dana |
| Medan laut | Kecepatan 4 dangkal dan 2 dalam, daya tahan 60, jarak pandang 40 |

Ini **satu-satunya unit sejauh ini yang mengisi baris ATK Range dan Radar Range**, sehingga menjadi contoh format untuk seluruh unit berjangkauan.

### 4.3 Elite Drone Operator, European

ATK 0,5 pada dua kolom pertama, DEF 0,7 pada dua kolom pertama, sisanya kosong. Upkeep **lima angka**: 50, 10, 10, 50, dan 100. Medan: modifier tahan plus 25 persen di perkotaan dan pedesaan, daya tahan 7 di darat dan 12 di air, **jarak pandang 40** di darat.

### 4.4 Elite Drone Mothership, Rouge Gale, European

ATK hanya 0,5 pada kolom kapal permukaan. DEF 2 pada kolom kelima dan 0,5 pada kolom kapal. Daya tahan 20, jarak pandang 25, kecepatan 1 dangkal dan 2 dalam.

Catatan anomali yang layak diperiksa ulang: **pertahanannya terhadap kolom kelima bernilai 2, lebih tinggi daripada terhadap kapal yang hanya 0,5.** Pola ini menyimpang dari unit lain.

### 4.5 Elite Satellite, European

Panelnya **tidak punya bagian Combat Properties sama sekali**. Upkeep hanya **tiga angka**: 100, 100, dan 250. Medannya hanya dua kolom yang berbeda dari unit laut, yaitu pesawat menyilang dan pesawat di landasan, dengan kecepatan 4 dan 0,01, daya tahan 5 dan 15, serta **jarak pandang 175 dan 25**.

Biaya mobilisasinya 1.000, 1.500, 1.000, 1.000, dan 3.500, dengan waktu 1 hari 8 jam 43 menit. Prasyaratnya Air Base level 4, Secret Weapons Lab level 1, dan Arms Industry level 1.

## 5. Catatan teknis untuk pemrosesan lanjutan

Nama berkas memakai **narrow no-break space** sebelum penanda PM, bukan spasi biasa. Ini akan memecahkan skrip yang mencocokkan spasi ASCII atau membelah pada spasi.

Rasio panel informasi unit terhadap total tangkapan layar pada bagian kedua hanya **tiga belas dari seratus enam puluh delapan**, karena sisanya adalah layar pohon riset. Layar pohon riset **tidak memuat** statistik unit sama sekali; isinya hanya nama teknologi, hari terbuka, durasi, tiga angka biaya riset, dan kartu deskripsi.

Namun layar pohon riset tetap berharga untuk hal lain, yaitu **memetakan seluruh struktur pohon per kategori beserta hari terbukanya**, yang melengkapi dokumen 39.

## 6. Yang masih ditunggu

Tiga agen lain sedang membaca bagian pertama, ketiga, dan keempat. Yang paling diharapkan adalah **unit reguler non-Elite**, terutama kategori Support yang sampai sekarang nol angka di semua sumber, serta doktrin **Western dan Eastern** yang sepenuhnya kosong di wiki.

---

## 7. Data pohon riset doktrin European, 130 node [V]

Bagian keempat tangkapan layar **tidak memuat satu pun panel informasi unit**, tetapi memberi hal yang sama berharganya: **biaya dan durasi riset nyata** untuk empat tab terakhir. Sebelumnya seluruh biaya riset di dokumen 39 adalah rancangan; kini ada angka.

### 7.1 Urutan dua belas tab terkonfirmasi

Kiri ke kanan: **Infantry, Armor, Artillery, Helicopter, Fighter, Support Air, Naval Surface, Submarine, Missile, Officers, Elite, Items.**

Ini sedikit berbeda dari asumsi kita di dokumen 39, yang memakai Support sebagai satu tab. Ternyata Conflict of Nations memisahkan **Artillery** dan **Support Air** sebagai dua tab berbeda.

### 7.2 Format panel riset

Tiap node menampilkan nama, hari terbuka, durasi, deskripsi, **tiga angka biaya riset**, dan kartu Unlocks.

Catatan penting: **ikon biaya pertama tidak selalu sama**. Umumnya peti pasokan, tetapi pada jalur Elite Armored Fighting Vehicle ikonnya komponen. Jadi ketiga kolom biaya **tidak boleh diasumsikan selalu pasokan, material langka, dan dana**.

### 7.3 Tab Missile

| Node | Hari | Durasi | Biaya |
|---|---|---|---|
| Cruise Missile RBS-15 | 3 | 1h 8j | 2.000 / 2.250 / 6.000 |
| Cruise Booster Upgrade | 6 | 1h 10j | 2.200 / 2.475 / 6.600 |
| **Ballistic Booster Upgrade** | **9** | 1h 8j | 2.700 / 3.000 / 8.400 |
| Cruise Fuel Improvement | 11 | 1h 12j | 2.400 / 2.700 / 7.200 |
| Ballistic SSBS S3 | 13 | 1h 13j | 2.925 / 3.250 / 9.100 |
| Cruise KEPD 350 | 15 | 1h 17j | 2.600 / 2.925 / 7.800 |
| Ballistic Warhead Shielding | 16 | 1h 16j | 3.150 / 3.500 / 9.800 |
| Cruise Warhead Shielding | 18 | 1h 20j | 2.800 / 3.150 / 8.400 |
| Ballistic J-600T | 23 | 1h 21j | 3.375 / 3.750 / 10.500 |
| Cruise Storm Shadow | 24 | **2h 1j** | 3.000 / 3.375 / 9.000 |

Pola yang terbaca: **rudal balistik konsisten lebih mahal daripada rudal jelajah** pada hari yang berdekatan, sekitar 30 sampai 35 persen lebih tinggi di kolom ketiga.

### 7.4 Tab Officers, sembilan perwira kali tujuh tingkat

Sembilan perwira bernama dengan nama panggilan: Chupacabra, Skyguard, Skull, Iron Tide, Kraken, Harris, Grom, Jaguar, dan Krait.

Biayanya mengikuti **empat arketipe**, bukan satu formula.

| Arketipe | Perwira | Pola biaya tujuh tingkat |
|---|---|---|
| **A, termurah** | Chupacabra, Skyguard | 200 naik ke 500, **ketiga kolom sama** |
| **B** | Skull, Iron Tide, Kraken, Harris | 300/300/500 naik ke 1.000/850/1.300 |
| **C** | Grom, Jaguar | 450/500/750 naik ke 1.000/1.050/1.300 |
| **D, unik** | Krait | 150/150/**1.000** naik ke 700/700/**2.750** |

Arketipe D menonjol karena **kolom ketiganya jauh lebih mahal** relatif terhadap dua kolom lain, dengan rasio sekitar tujuh kali lipat di tingkat pertama.

Durasinya juga bertingkat: arketipe A mulai dari **tiga puluh menit**, sementara arketipe C mulai dari enam jam dan berakhir di tujuh belas jam.

Dua anomali tercatat apa adanya. Iron Tide memakai penomoran satu, dua, Advanced, empat, lima, **tanpa tingkat tiga**. Dan Jaguar tingkat tertinggi berjudul Advanced padahal deskripsinya menyebut Modern, kemungkinan salah teks di game.

### 7.5 Tab Items, empat jalur kali tiga tingkat

| Jalur | Basic | Advanced | Modern |
|---|---|---|---|
| Medical Care | Hari 1, 6 jam, 500/350/2.000 | Hari 9, 12 jam, 600/450/3.000 | Hari 17, 1 hari, 700/550/4.000 |
| Engineering Teams | Hari 2, 8 jam, 500/350/2.000 | Hari 10, 14 jam, 600/450/3.000 | Hari 18, 1h 2j, 700/550/4.000 |
| Crew Training | Hari 3, 10 jam, 800/550/2.000 | Hari 12, 16 jam, 1.000/750/3.000 | Hari 20, 1h 4j, 1.200/850/4.000 |
| Heavy Loadouts | Hari 3, 10 jam, 800/550/2.000 | Hari 12, 16 jam, 1.000/750/3.000 | Hari 20, 1h 4j, 1.200/850/4.000 |

**Crew Training dan Heavy Loadouts identik persis** pada hari, durasi, dan ketiga biaya. Yang membedakan hanya isinya: Crew Training memberi munisi laut, penyembuhan laut 4 lalu 6 lalu 8 HP, dan serangan laut naik 10 lalu 15 lalu 25 persen. Heavy Loadouts memberi munisi udara dan serangan udara naik dengan persentase yang sama.

**Ini menjawab pertanyaan lama tentang isi tab Items**, yang sebelumnya hanya tercatat sebagai empat nama tanpa efek.

### 7.6 Tab Elite, lima belas jalur kali tiga tingkat

| Kelas | Alutsista | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|---|
| Main Battle Tank | Black Night MK2, MK4 | Hari 3, 1.350/1.500/2.175 | Hari 16, 2.150/2.150/3.475 | Hari 25, 3.250/3.300/5.850 |
| Attack Helicopter | S-97 Raider | Hari 2, 1.200/1.325/2.625 | Hari 12, 1.925/2.125/4.200 | Hari 22, 3.000/3.325/5.850 |
| AIP Submarine | Scorpene CA-2000 sampai 4000 | Hari 2, 1.450/1.950/3.900 | Hari 13, 1.800/2.550/5.075 | Hari 23, 2.450/3.200/6.350 |
| Railgun | Lance MK1 sampai MK3 | Hari 3, 1.200/1.600/2.300 | Hari 16, 2.100/2.500/4.500 | Hari 28, 3.000/3.500/5.600 |
| Bomber | Avro Vulcan | Hari 4, 1.350/1.475/3.000 | Hari 14, 2.000/2.150/4.425 | Hari 25, 3.250/3.225/7.200 |
| UGV | TheMIS MK1 sampai MK3 | Hari 2, 1.300/1.350/1.800 | Hari 11, 1.650/1.700/2.250 | Hari 22, 1.900/2.000/2.600 |
| Loitering Munitions | MQM-1A sampai 1C RAPAZ | Hari 1, 950/950/1.800 | Hari 12, 1.150/1.150/2.250 | Hari 21, 1.450/1.450/2.800 |
| Attack Aircraft | EMB 314 Super Toucan | Hari 2, 1.400/1.800/3.500 | Hari 15, 2.125/2.340/4.550 | Hari 21, 3.000/2.700/5.250 |
| Frigate | Aquitaine | Hari 3, 1.250/1.800/4.000 | Hari 14, 1.850/2.400/5.500 | Hari 27, 2.450/2.900/6.500 |
| **Special Forces** | Commando | Hari 6, 1.500/1.500/**15.000** | Hari 17, 1.750/1.750/**20.000** | Hari 30, 2.000/2.000/**25.000** |
| Satellite | Basic sampai Modern | Hari 3, 2.500/2.500/3.500 | Hari 15, 3.000/3.000/5.000 | Hari 24, 4.000/4.000/8.000 |
| Drone Operator | Basic sampai Modern | Hari 1, 1.200/1.200/3.250 | Hari 12, 1.500/1.500/4.000 | Hari 21, 2.000/2.000/5.250 |
| Armored Fighting Vehicle | Patria AMV 6x6 | Hari 3, 1.800/1.700/2.300 | Hari 11, 2.000/1.900/2.850 | Hari 21, 2.200/2.100/3.300 |
| Drone Mothership | Rouge Gale | Hari 3, 1.600/1.900/4.000 | Hari 15, 2.000/2.400/5.000 | Hari 24, 2.500/3.000/6.250 |
| Cruiser | Elite Cruiser | Hari 4, 1.800/1.800/4.500 | Hari 16, 2.100/2.000/5.500 | Hari 27, 2.400/2.200/6.500 |

**Elite Special Forces adalah pencilan besar**, dengan biaya kolom ketiga lima belas sampai dua puluh lima ribu, sementara seluruh jalur Elite lain berkisar dua sampai tujuh ribu. Itu tujuh kali lipat lebih mahal.

Elite Cruiser satu-satunya jalur yang ketiga tingkatnya bernama sama, dan pembedanya ada di **radius ledak yang naik dari 10 ke 15 lalu 20**.

Dua anomali durasi tercatat: **Modern Drone Operator justru lebih pendek daripada Advanced**, satu-satunya jalur yang durasinya turun di tingkat tertinggi. Dan **Modern Satellite dengan dua hari tujuh jam adalah durasi riset terpanjang** di seluruh data ini.

### 7.7 Struktur drone yang baru diketahui

Drone Operator membuka tiga jenis: **Recon Drone, Explosive Drone, dan Sabotage Drone**. Drone Mothership membuka empat jenis laut: **Sea Drone, Naval Recon, Naval Explosive, dan Naval Sabotage Drone**.

Deskripsi Sea Drone berubah per tingkat, dari kamikaze ringan dan cepat, lalu menghindari radar dengan sasis plastik, sampai kelas berat berkerangka diperkuat dengan muatan besar.

**Ini seluruhnya sistem yang belum pernah tercatat di dokumen mana pun**, dan relevan langsung dengan keputusan Loadout di D44.

---

## 8. Data riset laut, kapal selam, dan misil doktrin European [V]

Bagian ketiga juga nol panel unit, tetapi memberi tiga puluh tujuh node riset dengan biaya lengkap, plus **nama alutsista European yang selama ini kosong di wiki**.

### 8.1 Nama alutsista European yang baru diketahui

| Kelas | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| **Attack Submarine** | **Swiftsure Class** | **Rubis Class** | **Astute Class** |
| **Ballistic Missile Submarine** | **Resolution Class** | **Vanguard Class** | **Triomphant Class** |
| **Rudal balistik** | **PGM-17 Thor** | **M51.1** | **M51.2** |

Riset wiki sebelumnya hanya menemukan nama kelas per doktrin untuk **satu** unit laut, yaitu Elite AIP Submarine. Kini tiga kelas penuh terisi untuk doktrin European.

### 8.2 Dua koreksi terhadap angka radius ledak

Ini temuan yang mengoreksi dokumen 32.

| Sumber | Rudal jelajah | Rudal balistik | ICBM |
|---|---|---|---|
| Wiki | 5 | 10 | **50** |
| **Panel dalam game** | — | **5 konvensional, 10 kimia dan nuklir** | **25 tier awal, 45 pada M51.2** |

**Dua hal berubah.** Pertama, **radius ledak bergantung pada hulu ledak, bukan hanya tipe misil**: rudal balistik berhulu ledak konvensional hanya beradius 5, sementara berhulu ledak kimia atau nuklir beradius 10. Kedua, **radius ICBM naik bertingkat mengikuti riset**, dari 25 di tier awal menjadi 45 pada tier akhir, bukan tetap 50.

Tercatat juga bahwa **ICBM nuklir punya jangkauan serang 5.000**.

### 8.3 Jalur senjata pemusnah massal jauh lebih awal dari dugaan

| Node | Hari terbuka | Durasi | Biaya |
|---|---|---|---|
| **Guided Missile Program** | **Hari 1** | 1h 10j | 2.500 / 3.000 / **10.000** |
| PGM-17 Thor | Hari 2 | 1h 4j | 2.250 / 2.500 / 7.000 |
| **Chemical Weapons Program** | **Hari 3** | 1h 12j | 3.750 / 4.000 / **12.500** |
| **Nuclear Weapons Program** | **Hari 5** | 1h 14j | **5.000 / 5.000 / 15.000** |
| M51.1 | Hari 6 | 1h 12j | 2.750 / 3.000 / 8.000 |
| Warhead Shielding | Hari 17 | 1h 19j | 3.300 / 3.600 / 9.600 |
| M51.2 | Hari 25 | 2h 0j | 3.575 / 3.900 / 10.400 |

**Ini mengejutkan.** Rancangan kita di dokumen 32 menempatkan program kimia di hari 16 dan program nuklir di hari 24 sampai 27. Kenyataannya **program nuklir sudah bisa diriset sejak hari kelima**.

Yang menahannya bukan hari riset, melainkan **gerbang bangunan**: Secret Weapons Lab level 2 untuk hulu ledak kimia dan level 4 untuk hulu ledak nuklir, ditambah Arms Industry level 2. Membangun Secret Weapons Lab sampai level 4 memakan waktu dan biaya besar.

**Pelajaran desainnya penting.** Conflict of Nations membuat jalur nuklir **terbuka sangat awal tetapi sangat mahal**, alih-alih menguncinya di belakang hari. Biayanya pun paling tinggi di seluruh pohon: 15.000 di kolom ketiga, sementara node lain berkisar 1.000 sampai 10.000. Ini pendekatan yang lebih baik daripada rancangan kita, karena **pemain melihat jalurnya sejak awal dan bisa memilih mengejarnya dengan mengorbankan hal lain**, bukan sekadar menunggu.

### 8.4 Struktur biaya kapal selam European

| Node | Hari | Durasi | Biaya |
|---|---|---|---|
| Swiftsure Class | 1 | 1h 3j | 1.250 / 1.775 / 3.250 |
| Survivability Refit | 4 | 1h 4j | 1.375 / 1.955 / 3.575 |
| Nuclear Reactor Refit | 9 | 1h 5j | 1.500 / 2.130 / 3.900 |
| Rubis Class | 11 | 1h 10j | 1.625 / 2.310 / 4.225 |
| Expanded Missile Magazine | 20 | 1h 13j | 1.750 / 2.485 / 4.550 |
| Astute Class | 22 | 1h 18j | 1.875 / 2.665 / 4.875 |

Polanya sangat teratur: **biaya naik dengan selisih tetap 125, 178, dan 325** di ketiga kolom untuk tiap langkah. Ini deret aritmetika, bukan geometrik, dan layak ditiru karena membuat perencanaan pemain bisa diprediksi.

Kapal selam rudal balistik memakai deret serupa dengan selisih 150, 180, dan 350.

Node veteran jauh lebih murah, mulai dari 390 dan berakhir di 2.100 pada kolom ketiga, dengan durasi hanya delapan sampai enam belas jam. **Veteran adalah jalur pendek dan murah**, berbeda tajam dari jalur unit.

### 8.5 Ikon biaya tidak berlabel

Ketiga kolom biaya ditampilkan sebagai ikon tanpa teks. Agen mencatat peti hijau, drum oranye, dan uang, tetapi **tidak menebak namanya**. Ini konsisten dengan temuan sebelumnya bahwa ikon biaya pertama tidak selalu sama antar jalur.

Untuk implementasi, ini berarti **pemetaan ikon ke sumber daya harus diverifikasi terpisah**, misalnya dengan menangkap tooltip.
