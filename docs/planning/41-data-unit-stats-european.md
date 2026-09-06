# Statistik Unit Lengkap, Doktrin European

> Sesi 5 (2026-09-05). Diekstrak dari panel informasi unit dalam game. **Ini menutup seluruh lubang data yang tiga gelombang riset wiki nyatakan mustahil ditutup.** Tujuh puluh tujuh kelas unit, seluruhnya doktrin European.

## 0. Cara membaca

Urutan sepuluh kolom Combat Properties, terkonfirmasi lewat tooltip pada kolom 8, 9, dan 10:

**1 Infanteri, 2 Lapis baja, 3 Sayap tetap, 4 Helikopter, 5 Kendaraan tak berlapis baja, 6 Misil, 7 Kapal permukaan, 8 Kapal selam, 9 Bangunan, 10 Populasi.**

Urutan sepuluh kolom Terrain untuk unit darat: **Plains, Hills, Mountains, Urban, Town, Jungle, Arctic, Desert, laut dangkal, laut dalam.** Unit laut hanya punya dua kolom terakhir. Unit udara punya dua kolom berbeda, yaitu di udara dan di landasan.

Tanda hubung berarti unit tidak bisa terlibat terhadap kelas itu.

---

## 1. Temuan yang mengoreksi rancangan kita

### 1.1 Theater Defense System adalah spesialis anti-misil, bukan anti-pesawat

| Unit | Serang sayap tetap | **Serang misil** |
|---|---|---|
| **Bloodhound, Theater Defense System** | **2** | **12** |
| Ozelot, Mobile SAM | 8 | 1 |
| Gepard, Mobile Anti-Air | 3 | 0,6 |

Rancangan kita di dokumen 31 memberi Theater Defense System serangan 20 terhadap sayap tetap. **Itu salah arah sepenuhnya.** Dalam game, ia hampir tidak berguna melawan pesawat dan justru menjadi tulang punggung pertahanan rudal.

Sebaliknya **Mobile SAM adalah pembunuh pesawat**, dan **Mobile Anti-Air justru lemah menyerang tetapi kuat bertahan**.

### 1.2 Unit anti-udara bertahan jauh lebih kuat daripada menyerang

Gepard menyerang sayap tetap dengan 3 tetapi bertahan dengan **4,9**. Terhadap helikopter menyerang 4 tetapi bertahan **6,6**.

Ini pola yang tidak kita duga dan **menjelaskan cara kerja selubung anti-udara**: unit anti-udara dirancang melindungi tumpukan, bukan memburu pesawat.

### 1.3 Jangkar udara terkonfirmasi

Stealth Strike Fighter F-117 European punya serang infanteri 11 dan lapis baja 11, **persis sama dengan data Su-57 Eastern yang ditemukan di wiki**. Jadi jangkar skala udara kita benar, dan rancangan lama yang memberi 5,5 memang kurang dari separuh.

Tetapi pencilan terbesarnya adalah **Stealth Air Superiority Fighter MBB Firefly**, yang menyerang sayap tetap dengan **21** dan kendaraan tak berlapis baja dengan **25**.

### 1.4 Kolom kelima benar-benar dipakai

Kolom kendaraan tak berlapis baja bukan hiasan. Air Superiority Fighter menyerangnya dengan 10, Stealth ASF dengan 25, dan Mobile Anti-Air bertahan terhadapnya dengan 6,6. **Jadi Conflict of Nations memang punya delapan kelas armor, bukan tujuh**, dan model data kita perlu kolom tambahan.

### 1.5 Jangkauan serang udara jauh lebih besar dari dugaan

| Kelas | Jangkauan serang |
|---|---|
| Helikopter | 350 sampai 500 |
| Pesawat tempur | **650** |
| Pesawat siluman | **800** |
| Pengebom dan patroli maritim | **1.500** |
| Elite Bomber | **2.000** |
| **Stealth Bomber SR71** | **5.000** |

Rancangan kita memakai angka puluhan. **Skalanya berbeda dua orde besaran.**

---

## 2. Unit laut

| Kelas | Alutsista | ATK per kolom | DEF per kolom | Jangkauan | HP | Kecepatan dangkal dan dalam |
|---|---|---|---|---|---|---|
| Patrol Boat | Iliria | 7:2 | 7:2 | 35 | 10 | 0,44 dan 2,63 |
| Corvette | Descubierta | 1,5 / 1 / — / — / — / — / **5,5** / 4 / 0,5 / 2 | 3:1 / 4:1,5 / 5:2,5 / 7:5,5 / 8:4 | 50, radar 75 | 24 | 1,5 dan 3 |
| **Frigate** | Duke | 2 / 1,5 / **6** / 1 / — / **2,5** / 6 / 3 / 1 / 2 | sama pada kolom 3,4,6,7,8 | 50 dan **75 untuk udara** | 28 | 3,5 dan 1,75 |
| Destroyer | Hamburg | 2,7 / 2,7 / — / — / — / — / **8** / **7,2** / 1 / 2 | 3:2 / 4:2 / 6:1 / 7:8 / 8:7,2 | 50, radar 75 | 40 | 4 dan 2 |
| Cruiser | Tiger | 3 / 2 / 2,5 / 3,8 / — / 1,3 / **10** / 2 / 1,5 / 3 | sama | 75 dan 50 | 50 | 4,5 dan 2,25 |
| Helicopter Carrier | Jeanne d'Arc | 7:2 / 8:2, kapasitas **4** | 3:2 / 4:2 / 6:1,5 / 7:2 / 8:2 | — | 30 | 3 dan 1,5 |
| **Aircraft Carrier** | Giuseppe Garibaldi | 3:2 / 4:4 / 6:3 / 7:1 / 8:2, kapasitas **5** | sama | 26, **radar 150** | **100** | 3 dan 1,5 |
| Naval Veteran | Basic | 2 / 1 / 4 / 3 / 4 / 2 / **10** / 8 / 1 / 3 | sama pada kolom 3 sampai 8 | 75 dan 100 | 45 | 4 dan 2 |

**Kapasitas pesawat akhirnya diketahui**: Helicopter Carrier membawa **empat**, Aircraft Carrier membawa **lima**. Angka ini tidak pernah ada di wiki mana pun.

### 2.1 Kapal selam

| Kelas | Alutsista | ATK kapal dan selam | Modifier medan | HP dangkal dan dalam |
|---|---|---|---|---|
| Attack Submarine | Swiftsure | 8 dan 5 | **serang plus 25 persen dangkal, minus 25 persen dalam** | 20 dan **10** |
| Ballistic Missile Submarine | Resolution | 4 dan 4 | **minus 50 persen di laut dalam, serang dan tahan** | 30 dan **15** |
| Submarine Veteran | Basic | 8 dan 8 | serang plus 25 persen dangkal | 30 dan 21 |
| **Elite AIP Submarine** | Scorpene CA-2000 | 9 dan 7 | **minus 50 persen dangkal**, netral dalam | **7,5 dan 15** |

**Ini mengoreksi asumsi kita di D48.** Kami merancang kapal selam bertenaga udara independen justru **kuat di perairan pesisir**. Dalam game, Elite AIP Submarine malah **dihukum minus 50 persen di perairan dangkal** dan hanya punya HP 7,5 di sana.

Yang benar-benar diuntungkan di perairan dangkal adalah **Attack Submarine biasa**, dengan plus 25 persen.

---

## 3. Pesawat sayap tetap

| Kelas | Alutsista | Serang inti | Jangkauan | HP udara dan darat | Kecepatan |
|---|---|---|---|---|---|
| Air Superiority Fighter | J 35A Draken | 3:6 / 4:7,5 / **5:10** | 650, radar 60 | 23 dan 15 | 12 |
| Naval ASF | Etendard IVM | 3:**10** / 4:8 / 5:10 | 650 | 22 dan 15 | 12 |
| **Stealth ASF** | MBB Firefly | 3:**21** / 4:15 / **5:25** | **800** | 28 dan 15 | **16** |
| Strike Fighter | Mirage Delta 2000 | 1:4 / 2:4 / 5:6 | 650 | 24 dan 15 | 12 |
| Naval Strike Fighter | Harrier | 1:5 / 2:5 / 5:8 / 7:5 | 650 | 22 dan 15 | 12 |
| **Stealth Strike Fighter** | F-117 Nighthawk | 1:**11** / 2:**11** / 5:15 | 800 | 28 dan 15 | 12 |
| UAV | Super Heron | **tanpa Combat Properties** | — | 2 dan 15 | 5, **pandang 50** |
| Fixed Wing Veteran | Basic | 3:10 / 4:8 | 650 | 25 dan 15 | 12 |
| Naval Patrol Aircraft | Nimrod | 7:7 / 8:5 | **1.500** | 20 dan 15 | 7,5 |
| **AWACS** | EC-121 Warning Star | **tanpa serang sama sekali** | 1.500, **radar 175** | 10 dan 15 | 9 |
| **Naval AWACS** | Bombardier Globaleye | tanpa serang | 1.000, **radar 250** | 15 dan 15 | 9 |
| Heavy Bomber | Valiant | 1:5,5 / 2:2,5 / 7:2,5 / **9:5 / 10:5** | 1.500 | 25 dan 15 | 10 |
| **Stealth Bomber** | SR71 Blackbird | 1:**11** / 2:6 / 7:5 / **9:10** / 10:7 | **5.000** | 40 dan 15 | 11 |

**AWACS benar-benar tanpa serangan apa pun**, dan **Naval AWACS punya radar 250, tertinggi di seluruh roster.** Ini mengonfirmasi desain bahwa AWACS adalah mata, bukan senjata.

**Seluruh pesawat punya HP 15 saat berada di landasan**, apa pun kelasnya. Ini aturan seragam yang layak ditiru: pesawat di darat sama rapuhnya.

---

## 4. Helikopter

| Kelas | Alutsista | Serang inti | Jangkauan | HP | Kecepatan |
|---|---|---|---|---|---|
| Helicopter Gunship | Gazelle | 1:**8,4** / 2:2 / 4:2 / 5:2 | 350 | 18 | 7 |
| Attack Helicopter | A129 Mangusta | 1:3,3 / 2:**7** / 4:4 | 350, radar 60 | 20 | 7 |
| ASW Helicopter | AB 212ASW | 7:3,5 / **8:6,5** | 400, radar 75 | 17 | 7,5 |
| Rotary Wing Veteran | Basic | 1:6 / 2:6 / 4:6 | 500 | 25 | 8 |
| Elite Attack Helicopter | S-97 Raider | 1:4 / 2:**10** / 4:4 | 450 | 25 | 8 |

Pembagian perannya jelas dan layak ditiru: **Gunship membunuh infanteri dengan 8,4, Attack Helicopter membunuh lapis baja dengan 7, dan ASW Helicopter membunuh kapal selam dengan 6,5.**

---

## 5. Infanteri

| Kelas | Alutsista | Serang infanteri dan lapis baja | Tahan | HP | Jarak pandang |
|---|---|---|---|---|---|
| Motorized Infantry | Basic Infantry | 3 dan 2 | 3,8 / 2,5 / 0,3 / 0,6 | 16 | 40 |
| National Guard | Basic | 1,5 dan 0,5 | 2,5 / 0,8 / 0,3 / 0,5 | 15 | 25, **35 di bukit** |
| **Mountain Infantry** | Basic | 3 dan 2 | sama dengan Motorized | **15, naik 18 di bukit dan arktik** | 25, **40 di bukit** |
| Naval Infantry | Basic Marines | **5 dan 4,5** | 3 / 2,7 / 1 / 1,2 | 18 | 40 |
| Mechanized Infantry | Basic Mechanized | 3 dan **5** | 3,8 / **6,3** / 1,4 / 2,1 / 0,6 | **25** | 40 |
| Airmobile Infantry | Basic Airborne | 5 dan 3 | 3,3 / 2 / 0,3 / 0,7 | 15 | 40 |
| **Special Forces** | Basic SAS | **6,5** dan 3,5 | 4,3 / 2,3 / 0,7 / 1,3 | 15 | 40, **50 di bukit** |
| Infantry Veteran | Basic | 5 dan 3,5 | **6,7** / 4,7 / 1 / 1,5 | 25 | 25 |
| Airborne Veteran | Basic | **8** dan 4 | 5,3 / 2,7 / 1 / 1,3 | **30** | 40 |

**Mountain Infantry akhirnya punya angka**, dan mekaniknya elegan: statistik tempurnya identik dengan Motorized, tetapi **HP-nya naik dari 15 ke 18 khusus di bukit dan arktik**, ditambah serang plus 25 persen dan tahan plus 50 persen di bukit. Jadi keunggulannya sepenuhnya lewat medan, bukan lewat rating.

Modifier medan Naval Infantry terkonfirmasi terbalik dari dugaan lama: **serang plus 50 persen di perkotaan dan pedesaan**, tetapi minus 50 persen di pegunungan dan arktik.

---

## 6. Lapis baja

| Kelas | Alutsista | Serang infanteri dan lapis baja | HP | Modifier medan menonjol |
|---|---|---|---|---|
| Combat Recon Vehicle | Fox FV721 | 5 dan 1,5 | 17 | tidak ada modifier sama sekali, **pandang 50 di bukit** |
| Armored Fighting Vehicle | Scorpion | 7 dan 5 | 27 | serang **plus 50 persen di gurun**, plus 25 di arktik |
| Amphibious Combat Vehicle | Fuchs | 7 dan 5 | 25 | serang **plus 50 persen di rimba** |
| **Main Battle Tank** | Leopard 2 | **9 dan 8** | **45** | serang plus 50 di dataran, minus 50 di bukit dan rimba |
| **Tank Destroyer** | Kanonenjagdpanzer | 3 dan **12,6** | 25 | tahan **plus 50 persen di perkotaan dan pedesaan** |
| Tank Veteran | Basic | 10 dan 12 | 50 | plus 25 persen dataran dan gurun |
| Elite Main Battle Tank | Black Night MK2 | 12 dan 10 | **55** | pandang 50 |

**Tank Destroyer akhirnya punya angka**, dan spesialisasinya ekstrem: serang lapis baja **12,6** berbanding infanteri hanya 3. Rasionya lebih dari empat banding satu, jauh lebih tajam daripada rancangan kita.

---

## 7. Artileri, anti-udara, dan pendukung

Ini kategori yang **nol angka di seluruh sumber wiki**, dan kini lengkap.

| Kelas | Alutsista | Serang | Tahan | Jangkauan | HP | Kecepatan |
|---|---|---|---|---|---|---|
| Towed Artillery | FH70 | 1:3 / 2:1,5 / 7:1 / 9:1 / 10:3 | 1 dan 0,5 | **50** | 10 | 1 |
| Mobile Artillery | GCT 155mm | 1:1,5 / 2:**4,5** / 7:1,5 / 10:3 | 1 dan 3 | **65** | 29 | 1,3 |
| Multiple Rocket Launcher | Teruel | 1:4 / 2:4 / 7:3 / 9:1,5 / **10:4** | 1,3 | **75** | 15 | 1 |
| **Mobile Anti-Air** | Gepard | 3:3 / 4:4 / 5:4 / 6:0,6 | **3:4,9 / 4:6,6 / 5:6,6** | 26 | 25 | 1,3 |
| **Mobile SAM** | Ozelot | **3:8** / 6:1 | sama | **75**, radar 75 | 15 | 1,3 |
| **Theater Defense System** | Bloodhound | 3:2 / **6:12** | sama | **100**, radar 100 | 14 | **0,5** |
| Mobile Radar | UNIMOG SCB | 0,5 saja | 0,5 | — | **radar 125** | 15 | 1,3 |
| Elite Railgun | Lance MK1 | 1:4 / 2:8 / **7:8** / 9:3 | 3 dan 6 | 50 | 15 | 1,3 |

Tiga pola yang layak ditiru. **Jangkauan naik seiring kelas**: artileri tarik 50, artileri gerak 65, peluncur roket 75, dan pertahanan teater 100. **Theater Defense System sangat lambat** dengan kecepatan 0,5, separuh unit lain, sebagai imbalan jangkauan terjauh. Dan **artileri hampir tidak bisa bertahan**, dengan pertahanan hanya 1 sampai 3.

Semua artileri berbagi modifier medan yang sama: serang plus 25 persen di bukit, minus 25 persen di pegunungan dan rimba.

---

## 8. Peluncur rudal, hulu ledak, dan konsumabel

Ketiga peluncur rudal punya serang hanya **0,5** di beberapa kolom. Mereka bukan unit tempur, melainkan platform.

**Hulu ledak konvensional, kimia, dan nuklir semuanya punya pola identik**: tanpa upkeep, tanpa Combat Properties, kecepatan nol, HP satu, dan jarak pandang lima. Jadi hulu ledak **diperlakukan sebagai barang, bukan unit**, persis seperti temuan wiki bahwa ia berfungsi sebagai mata uang.

Konsumabel memakai pola yang sama persis. Biayanya: Deployable Gear dua puluh butir seharga 500, 20, 250, dan 2.000; tiga puluh butir seharga 660, 25, 325, dan 3.900; empat puluh butir seharga 750, 30, 375, dan 6.400. Pharmaceuticals dua puluh butir seharga 250, 250, 100, dan 500. Sea Munitions seharga 100, 400, 200, dan 1.000. Air Munitions seharga 200, 300, dan 1.000.

---

## 9. Officer, dengan angka

Enam officer terekam lengkap, dan **semuanya jauh lebih kuat daripada unit reguler sekelasnya**.

| Officer | Kelas | Perbandingan |
|---|---|---|
| Chupacabra, Infantry | Uncommon | Serang 3,5 berbanding Motorized 3; HP 20 berbanding 16 |
| Skyguard, Anti-Air | Uncommon | Tahan sayap tetap 5,3 berbanding Gepard 4,9; HP 28 berbanding 25 |
| Skull, Airstrike | Epic | Serang 6 dan 6, jangkauan **900** |
| Iron Tide, Cruiser | Rare | Serang kapal **13** berbanding Tiger 10; HP **65** berbanding 50 |
| Kraken, Submarine | Rare | **Serang plus 35 persen di perairan dangkal**, HP 45 berbanding 20 |
| Grom, Armored | Legendary | Serang 10 dan 12, HP **55**, kecepatan seragam 1,5 di semua medan |
| Jaguar, Rotary | Legendary | Serang 7 dan 7, jangkauan 500 |

**Grom bergerak dengan kecepatan 1,5 di seluruh medan darat**, tanpa penalti pegunungan maupun rimba. Itu keunggulan yang sangat besar dan menjelaskan mengapa officer legendaris terasa istimewa.

---

## 10. Yang masih kosong

Seluruh data ini **hanya doktrin European**. Western dan Eastern tetap kosong, karena Billy bermain sebagai Indonesia yang memang berdoktrin European.

Dua peluncur rudal, yaitu M51.1 dan PGM-17 Thor, **tidak punya tangkapan layar bagian medan**, sehingga baris medannya hilang.

Beberapa sel tertutup kursor atau tooltip dan ditandai ragu, yaitu radar Jeanne d'Arc kolom kapal, serta kolom 8 sampai 10 pada M51.1.
