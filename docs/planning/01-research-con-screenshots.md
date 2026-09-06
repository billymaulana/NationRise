# Riset A: Analisis 80 Screenshot Conflict of Nations

> Sumber: plan riset Nation Rise, sesi 2026-09-03 sampai 2026-09-04, bagian 4. Dokumen ini bagian dari `docs/planning/`; indeks dan aturan kerja ada di `README.md`. Nomor "bagian N" yang dirujuk di dalam teks mengacu ke penomoran plan asli; petanya ada di README.

## 4. Hasil Riset A: Analisis 80 Screenshot CoN

Sumber: `~/Downloads/conflictofnations` (74 screenshot CoN sesi Billy sebagai Indonesia Day 1 doktrin European, plus 6 screenshot Steam Victoria 3 dan Realpolitiks 3 sebagai pembanding).

### 4.1 Inventaris layar (yang harus di-clone)

| Layar | Layout dan isi |
|---|---|
| **Nation Selection** (pre-game) | Thumbnail peta dunia berwarna kiri-atas; list negara scrollable dengan bendera kanan-atas; banner "SELECTED NATION"; Nation Description (ukuran negara, geografi, saran strategi, mis. Indonesia "must rely heavily on its navy and marines. ADVICE: Best suited for experienced players"); Military Doctrine; footer BACK / SELECT RANDOM NATION / OK |
| **Main Map HUD** | Peta fullscreen. Atas-tengah: resource bar (toggle stockpile + 7 resource + gold, tiap slot angka stok dan `+X /h`), baris kedua 8 slot stockpile item, tab "SHOW MARKET". Kiri-atas: panel player (bendera, nama, negara, DAY n / TIME hh:mm, VICTORY PROGRESS x / 1900 VP, 5 tombol berbadge: newspaper, research, diplomacy, coalition, events). Tepi kiri: tab vertikal INTEL dan CHAT. Tepi kanan: tab CITIES, potret penasihat, toolbar layer vertikal (~12 toggle: sound, map mode, terrain/resource layer, 3D unit, air units, province ownership, ground units, jalur gerak, terrain, refresh, dll), fullscreen, +, -, layers, search, settings. Kanan-bawah: minimap. Toast notifikasi di kiri-tengah |
| **Resource Tooltip** | In Stock; Production per Day; Consumption (Units, Agents Salaries); Total. Angka `/h` di HUD = (Production - Consumption) / 24, terverifikasi dari angka screenshot |
| **Market** | Tab TOP OFFERS / ALL OFFERS / MY TRADES; chip filter resource; kolom Buy X (`+amount @ price`, tombol keranjang) dan Sell X; ADD BUY OFFER / ADD SELL OFFER; MY TRADES: Current Orders (Amount, Unit Price, Total Price, Abort) dan Executed Orders |
| **Intelligence** (slide-out kiri) | AGENTS n dan biaya/hari; Money dan income/hari; 4 kategori: COUNTER-OPS, INTELLIGENCE, CORRUPTION, SABOTAGE; Reports per hari |
| **Administration / City List** (slide-out kanan) | Tab CITY LIST / BUILD QUEUE; tabel: VP, populasi, resource utama + jumlah, money, manpower, nama kota, bangunan (ikon diamond + badge level), 3 tombol aksi |
| **Newspaper** | Header koran ("Day n", "Issue for Game"), thumbnail peta, tab INDEX OF NATIONS (VPS) / INDEX OF ALLIANCES / STATS / GAME INFO; ranking VP; filter ALL / MYSELF / FRIENDS & ENEMIES / POLITICS / ECONOMICS; feed artikel + log sistem bertimestamp |
| **Research** | Header "RESEARCH \| <Doctrine>"; 12 tab trapesium (Infantry, Armor, Support, Helicopter, Fighters, Fixed-Wing, Naval, Submarine, Missile, Officers, Elite, Items); grid: baris = unit, kolom = DAY n (gating hari), garis biru = hari sekarang, node diamond (hijau = bisa diriset, abu = belum, redup = tidak tersedia, merah = terkunci), panah linier antar level; panel kanan: CURRENTLY RESEARCHING (2 slot), SELECTED RESEARCH (nama, gembok Day, jam durasi, deskripsi), RESEARCH COSTS (3 resource), START RESEARCH, UNLOCKS (kartu unit + deskripsi + "Doctrine's benefits") |
| **Panel Kota** (bottom sheet) | Nama kota (Negara), tipe "Homeland City"; PRODUCTION PER DAY (3 angka); MORALE % (bar + smiley); INFORMATION: Population, Victory Points, Healing Value (HP/day), Defense Bonus %; BUILDINGS (ikon + level); tombol CONSTRUCTION +, MOBILIZATION +, n Agents, Rally Point |
| **Modal Konstruksi / Mobilisasi** | Header kota + produksi + morale; 3 kolom status: CURRENTLY CONSTRUCTING, CURRENTLY MOBILIZING, NEXT IN QUEUE (4 slot); tab kategori; baris: gambar, nama (kelas), ikon biaya, durasi, penalti morale ("Morale: + 45min" merah), tombol i, hourglass (percepat), Start; tooltip prasyarat ("Research and Upgrades Required: Army Base Lvl. 2 / Arms Industry Lvl. 1 / Research: X Lvl. 1") |
| **Panel Unit / Army** (bottom sheet) | Header: bendera, nama army ("3rd Recon Division (Indonesia) G 3"); gambar + HP bar ("15.0 / 15 HP"); stat: Army Boost, Est. Strength ATK / DEF, Army Speed, Efficiency %; UNITS (ikon per tipe + rank chevron + jumlah); ACTIVITY: Current Position, Destination, Est. Travel Time; bar perintah kontekstual |
| **Perintah unit** | Darat: Move, Attack, Loadout, Split, Waypoint, Rush, Delay, Cancel Orders. Udara: Ferry, Attack, Patrol, Loadout |
| **Diplomacy > Information** | Tabel: Nation, Team, Leader Name, Cities, VPs, Their Relation, Your Relation (dropdown), Player Type (human/AI), Info, Mail; search |
| **Diplomacy > Messages & Trades** | Daftar percakapan kiri, thread chat kanan dengan pembatas tanggal-hari; NEW TRADE, SEND MESSAGE |
| **Coalition List** | Tabel: Coalition (emblem), Leader, Provinces, Members, Score `x/y`, Details; Create a new Coalition. Target VP koalisi naik dengan anggota: 1 = 1900, 2 = 3250, 3 = 4150 |
| **Events** | Feed kartu bertimestamp `Day n HH:MM:SS` |

Tidak terlihat di screenshot: layar pertempuran, panel provinsi non-kota, settings, tutorial, hasil perang, insurgents.

### 4.2 Mekanik yang terlihat (angka persis)

**Resources (7 + gold):** Supplies, Components, Fuel, Electronics, Rare Materials, Manpower, Money, Gold (premium; di clone offline dihapus atau diganti). **Stockpile items** (bar kedua): Conventional / Chemical / Nuclear Warhead, Deployable Gear, Pharmaceuticals, Ground / Sea / Air Munitions, diproduksi batch (x2, x3, x4, x20, x30, x40).

**Ekonomi Indonesia Day 1 (7 kota):** Jakarta VP 6 Components +1,205 Money +1,004 Manpower +144; Banjarmasin VP 4 Supplies +1,020; Makassar VP 4 Components +874; Medan VP 5 Electronics +607; Padang VP 5 Supplies +1,275; Palembang VP 5 Fuel +1,275; Surabaya VP 5 Rare Materials +729. Nasional: Supplies 2,296/hari, Components 2,190, Fuel 1,276, Electronics 608, Rare 729, Manpower 1,464, Money 10,299. Jumlah resource kota = produksi nasional, sehingga **provinsi non-kota hanya menyumbang Money dan Manpower**. Konsumsi unit per hari: Supplies 660, Fuel 285, Electronics 35, Manpower 295, Money 1,090. VP awal 80 (jumlah VP kota + provinsi).

**Market:** order book per resource, harga dalam Money (Supplies 7.4 sampai 8.7, Components 7.4 sampai 9.8, Rare Materials 13.4 sampai 17.9) atau Gold.

**Morale kota:** Jakarta 70%. Efek: penalti durasi konstruksi dan mobilisasi proporsional (mis. durasi dasar 9h45m mendapat "+45min"; 1d4h10m mendapat "+2h10min", sekitar +7.7%). Kota punya Healing Value 1 HP/day dan Defense Bonus 0.00%.

**Bangunan dan biaya (Supplies / Components / Fuel / Electronics / Rare / Money, durasi):**
| Bangunan | Biaya | Durasi |
|---|---|---|
| Army Base Lvl 1 | 250 / 250 / 500 / 250 / - / 2,000 | 1 min 38 sec (tutorial boost) |
| Air Base Lvl 2 | 1,000 / 1,250 / 1,500 / 750 / - / 4,750 | 1d 4h 10m |
| Naval Base Lvl 2 | 500 / 750 / 750 / 500 / - / 2,000 | 9h 45m |
| Recruiting Office Lvl 1 | 250 / 250 / 250 / 250 / - / 1,350 | 32m 30s |
| Arms Industry Lvl 1 | 400 / 350 / 350 / 250 / 225 / 1,250 | 9h 45m |
| Secret Weapons Lab Lvl 1 | 750 / 400 / 250 / 750 / 500 / 3,500 | 1d 3h 5m |
| Military Hospital Lvl 1 | 500 / 500 / 250 / 250 / - / 1,350 | 1d 3h 5m |
| Underground Bunkers Lvl 1 | 500 / 500 / 750 / - / - / 2,000 | 9h 45m |

Level bangunan menjadi gate unit: Teruel MRL butuh Army Base 4; Ozelot SAM butuh Army Base 3; MBB Firefly stealth butuh Air Base 5 + Secret Weapons Lab 1; EC-121 AWACS butuh Air Base 4; Tiger Cruiser butuh Naval Base 4; M51.1 ICBM butuh Secret Weapons Lab 5; PGM-17 Thor butuh Secret Weapons Lab 3; Elite MBT butuh Secret Weapons Lab 2 + Arms Industry 5. Hampir semua unit butuh Arms Industry 1.

**Mobilisasi unit (doktrin European), biaya Supplies / Components / Manpower / Electronics / Rare / Money, durasi:**
| Unit (kelas) | Biaya | Durasi |
|---|---|---|
| Basic Infantry (Motorized Infantry) | 650 / 350 / 850 / - / - / 1,000 | 19h 30m |
| Basic Marines (Naval Infantry) | 400 / 800 / 850 / - / - / 1,500 | 23h 50m |
| Basic Mechanized (Mechanized Infantry) | 500 / 950 / 1,000 / - / - / 1,750 | 21h 40m |
| Basic Airborne (Airmobile Infantry) | - / 1,000 / 1,000 / 400 / - / 1,250 | 21h 40m |
| Basic SAS (Special Forces) | - / 1,100 / 1,000 / 500 / - / 1,750 | 1d 2h |
| Basic National Guard | 400 / 250 / 550 / - / - / 750 | 8h 40m |
| Fox FV721 (Combat Recon Vehicle) | 950 / 850 / 400 / - / - / 1,000 | 22h 45m |
| Scorpion (Armored Fighting Vehicle) | - / 1,600 / 600 / 600 / - / 1,700 | 1d 55m |
| Fuchs (Amphibious Combat Vehicle) | - / 1,600 / 600 / 600 / - / 1,600 | 23h 50m |
| Leopard 2 (Main Battle Tank) | - / 1,800 / 700 / 700 / - / 1,700 | 1d 4h 10m |
| Kanonenjagdpanzer (Tank Destroyer) | - / 1,250 / 500 / 450 / - / 1,500 | 17h 20m |
| FH70 (Towed Artillery) | 1,000 / 950 / 400 / - / - / 1,200 | 19h 30m |
| GCT 155mm (Mobile Artillery) | - / 1,300 / 400 / 450 / - / 1,500 | 21h 40m |
| Teruel (Multiple Rocket Launcher) | 1,500 / - / 500 / 800 / - / 1,750 | 1d 2h |
| Gepard (Mobile Anti-Air) | 900 / 1,150 / 400 / - / - / 1,000 | 17h 20m |
| Ozelot (Mobile SAM) | 1,250 / - / 350 / 500 / - / 1,500 | 18h 25m |
| Bloodhound (Theater Defense System) | 1,500 / - / 500 / 900 / - / 2,000 | 19h 30m |
| UNIMOG SCB (Mobile Radar) | 600 / - / 350 / 450 / - / 1,000 | 19h 30m |
| Gazelle (Helicopter Gunship) | 850 / - / 350 / 700 / - / 2,750 | 20h 2m |
| A129 Mangusta (Attack Helicopter) | - / 900 / 400 / 750 / - / 3,000 | 1d 55m |
| AB 212ASW (ASW Helicopter) | 750 / - / 350 / 600 / - / 2,500 | 19h 30m |
| J 35A Draken (Air Superiority Fighter) | - / 1,000 / 425 / 950 / - / 3,500 | 1d 55m |
| Mirage Delta 2000 (Strike Fighter) | - / 950 / 450 / 900 / - / 3,000 | 1d 2h |
| Harrier (Naval Strike Fighter) | - / 1,000 / 450 / 1,050 / - / 3,500 | 1d 2h |
| F-117 Nighthawk (Stealth Strike Fighter) | - / 1,500 / 800 / 1,450 / 400 / 6,000 | 1d 19h 20m |
| Super Heron (UAV) | 450 / - / 250 / 350 / - / 1,500 | - |
| Nimrod (Naval Patrol Aircraft) | - / 850 / 350 / 800 / - / 2,500 | 19h 30m |
| EC-121 Warning Star (AWACS) | - / 750 / 400 / 700 / - / 2,500 | 21h 40m |
| Valiant (Heavy Bomber) | - / 1,250 / 550 / 900 / - / 3,500 | 1d 2h |
| SR71 Blackbird (Stealth Bomber) | - / 1,750 / 900 / 1,700 / 575 / 7,500 | 2d 4h |
| Iliria-class (Patrol Boat) | 450 / 450 / 200 / - / - / 800 | 10h 50m |
| Descubierta (Corvette) | 1,500 / - / 400 / 600 / - / 1,250 | 23h 50m |
| Duke Class (Frigate) | - / 2,000 / 750 / 1,100 / - / 1,750 | 1d 2h |
| Hamburg Class (Destroyer) | - / 2,500 / 650 / 900 / - / 1,950 | 1d 2h |
| Tiger Class (Cruiser) | - / 3,250 / 775 / 1,100 / - / 2,325 | 1d 8h 30m |
| Jeanne d'Arc (Helicopter Carrier) | - / 2,000 / 650 / 1,200 / 250 / 2,500 | 1d 4h 10m |
| Giuseppe Garibaldi (Aircraft Carrier) | - / 3,250 / 1,000 / 1,250 / 750 / 3,500 | 1d 19h 20m |
| Swiftsure (Attack Submarine) | - / 650 / 400 / 1,150 / 250 / 1,600 | 1d 2h |
| Resolution (Ballistic Missile Submarine) | - / 750 / 500 / 1,500 / 350 / 1,900 | 1d 4h 10m |
| Conventional Warhead x4 | 1,350 / - / - / 900 / 250 / 2,225 (+500 Fuel) | 1d 2h |
| Chemical Warhead x3 | 850 / - / - / 625 / 350 / 2,750 (+625 Fuel) | 1d 2h |
| Nuclear Warhead x2 | 1,500 / - / - / 1,000 / 750 / 3,750 (+750 Fuel) | 1d 2h |
| PGM-17 Thor (Ballistic Missile Launcher) | 500 / - / 600 / 715 / 400 / 1,150 | 1d 4h 10m |
| RBS-15 (Cruise Missile Launcher) | 250 / - / 400 / 475 / 250 / 765 | 1d 2h |
| M51.1 (ICBM Launcher) | 750 / - / 750 / 1,075 / 550 / 1,725 | 1d 6h 20m |

Veteran (Infantry, Tank, Rotary, Fixed Wing, Navy, Submarine) dan Officers berrarity (Uncommon / Rare / Epic / Legendary) serta unit Elite adalah lapisan premium; untuk clone offline diperlakukan sebagai konten late-game opsional atau dihapus.

**Research:** 2 slot paralel. Basic Infantry: Day 1, 1h30m, Supplies 1,075 / Rare 1,325 / Money 1,500. Gating hari per tab (mis. Infantry: Day 1, 2, 4, 5, 6, 7, 8, 10, 11; Submarine sampai Day 17; Items sampai Day 20). Hampir semua baris linier; hanya Missile berantai vertikal: Guided Missile Program → Chemical Weapons Program → Nuclear Weapons Program → ICBM. Simbol upgrade: chevron (level), petir (damage), plus medis (HP), mata (view range), gunung (terrain), range, sonar. Tab Items: Medical Care, Engineering Teams, Crew Training, Heavy Loadouts.

**Doktrin:** Eastern "favoring Tanks, Mobile Artillery, and Helicopter Gunships"; European "favoring Anti-Tank Vehicles, Mechanized Infantry and Strike Fighter Aircraft"; Western (dari wiki: HP tertinggi, biaya tertinggi, riset awal Armored Combat Vehicle). Nama unit mengikuti doktrin (European: Leopard 2, Gepard, Draken, Mirage).

**Unit di peta:** stack = satu counter (bendera negara + ikon tipe + angka jumlah), Est. Strength ATK/DEF gabungan (mis. recon 1 + motorized 2 = ATK 7.5 DEF 11.6), HP per unit (fighter 15/15), Army Speed, Efficiency %. Jalur gerak garis putus-putus biru-putih dengan panah.

**Diplomasi:** relasi dua arah (ikon merpati = peace), dropdown ubah relasi, pesan langsung, trade, koalisi dengan emblem dan skor gabungan. AI nation ditandai ikon monitor, human ikon orang.

**Intelligence:** Agents dengan gaji per hari; 4 misi: Counter-Ops, Intelligence, Corruption, Sabotage; laporan harian.

**Kontrol:** drag kiri = geser peta / unit; Ctrl + klik = multi-select; drag kanan = lasso.

### 4.3 Pola visual yang harus ditiru

- **Peta:** tekstur satelit desaturasi (hijau tua tropis, cokelat gurun, laut biru-abu dengan streak awan). Wilayah sendiri lebih terang. Batas provinsi garis putih tipis, garis pantai negara sendiri outline putih tebal (glow). Label negara huruf kapital 3D putih berbayangan; label kota kecil "Nama(VP)" plus ikon resource produksi dan jangkar (pelabuhan). Area urban digambar sebagai sketsa jaringan jalan putih tipis. Glyph terrain repetitif: pohon palem (hutan), segitiga abu transparan (gunung).
- **Unit:** model 3D low-poly kecil (dekorasi) + counter persegi warna bendera dengan ikon tipe dan angka. Untuk clone ringan: counter + ikon 2D sudah menangkap esensinya.
- **Panel:** header putih-abu semitransparan dengan judul uppercase, body biru-baja gelap (`#3a4a55`-ish), sudut tajam, bracket tipis di judul seksi, tab trapesium, ikon dalam bingkai diamond. Warna semantik: hijau positif/available/Start/Move, merah negatif/terkunci/Attack/Cancel, oranye jual, ungu Loadout, emas premium/VP, biru netral. Badge merah kotak kecil. Font sans condensed uppercase untuk header (mirip Exo / Titillium), angka dengan pemisah ribuan.

### 4.4 Kenapa CoN terasa sederhana tapi strategis (prinsip desain yang dijaga)

1. Ruang keputusan sempit, konsekuensi panjang: 7 resource, ~8 bangunan, 2 slot riset, 1 antrean konstruksi + 1 antrean mobilisasi per kota; durasi jam sampai hari membuat pilihan mahal dibatalkan.
2. Gating berlapis yang transparan: unit dikunci oleh level bangunan + riset + hari game, dan tooltip menyebut persis apa yang kurang.
3. Morale sebagai variabel silang satu angka yang memengaruhi durasi produksi.
4. Unit sebagai stack, bukan mikro: satu counter, ATK/DEF gabungan, 8 tombol perintah.
5. VP sebagai satu metrik menang, tertera langsung di label kota.
6. Informasi selalu di layar: resource bar dengan `/h`, badge, toast.
7. Asimetri lewat doktrin dan geografi; pemilihan negara sudah keputusan strategis pertama.

---
