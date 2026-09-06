# Riset: Kecepatan Gerak Unit dan Skala Waktu

> Riset sesi 5 (2026-09-05) atas target Billy: konstruksi maksimal 10 menit nyata, perjalanan antar pulau Indonesia di bawah 2 menit, usulan 1 hari game = 1 jam nyata. Verifikasi lewat conflictofnations.wiki.gg, wiki Paradox, Wikipedia, Nielsen Norman Group, Game Developer. WebSearch tidak tersedia. [UNV] = belum terverifikasi.

## 0. Tiga temuan yang mengubah keputusan
1. **CoN tidak memakai km per jam.** Nilai speed adalah **pengali tak berdimensi per terrain** (open ground 1.00 sampai 1.50, mountains 0.33 sampai 0.49). Tidak ada satuan fisik yang dipublikasikan. Ini keputusan desain Bytro agar bebas menyetel tempo tanpa dituntut realisme.
2. **CoN berjalan 1 banding 1 dengan waktu nyata.** FAQ resmi: "If moving troops takes 12 hours on a 1x map, it will take only 3 hours" di peta 4x. Artinya **CoN 1x = 3.600 detik nyata per jam game**. Target Billy (bangun maksimal 10 menit) berarti kompresi **216 kali** dari CoN 1x. Menyalin durasi CoN mentah ke game offline adalah kesalahan kategori.
3. **Target di bawah 2 menit tidak bisa seragam.** Jakarta ke Jayapura 3.777 km, hampir sama dengan New York ke Los Angeles (3.936 km) dan 2,3 kali Berlin ke Moskow. Menuntut di bawah 2 menit ke Papua berarti menghapus jarak sebagai dimensi strategis.

## 1. Kecepatan unit di CoN
Motorized Infantry (terverifikasi): open ground dan desert T1 1.00 sampai 1.30, T3 1.50; forest 0.66 sampai 0.99; city 0.50 sampai 0.75; mountain 0.33 sampai 0.49; coastal waters 1.30. MBT L7 doktrin Eropa: open 1.50, mountains 0.49, forest 0.99, urban 0.75, jungle 0.49, tundra 0.99, **high seas dan coastal waters 2.51**. Mechanized: doktrin Eropa memberi sekitar +10% kecepatan meski halaman Doctrine tidak menyebutnya.

**Rasio internal CoN** (normalisasi open ground = 1.00): Open dan Desert 1.00; Forest dan Tundra 0.66; Urban dan Suburban 0.50; Mountains dan Jungle 0.33; **High seas dan Coastal waters 1.67**. Transit laut 1,67 kali lebih cepat dari kecepatan darat maksimum, penting untuk game kepulauan.

**Military Logistics**: +150% kecepatan unit darat di satu provinsi, hanya level 1, biaya 250 supplies dan components dan fuel plus 500 money, hancur sendiri bila provinsi direbut.

**Konversi ke km per jam adalah derivasi, bukan fakta [UNV]:** dari dua jangkar (MBT high seas 2.51 setara destroyer ~56 km/jam, dan contoh FAQ 12 jam untuk satu perpindahan dengan provinsi ~250 km) diperoleh estimasi **1.00 ≈ 25 km per jam game**, ketidakpastian ±40%. Konsekuensi: unit darat tercepat ≈ 37,5 km/jam, satu provinsi 250 km ≈ 6,7 jam game; menyeberangi negara menengah (Jerman ~800 km) ≈ 21 sampai 25 jam game ≈ **1 hari game penuh**, yang pada peta 1x berarti 1 hari nyata.

**Durasi konstruksi CoN terverifikasi:** Recruiting Office L1 sampai L5 = 0,5 / 26 / 28 / 30 / 32 jam game; Army Base = 90 detik / 28 / 32 / 34 / 36; Naval Base = 24 / 9 / 30 / 32 / 34; Airfield 21; Combat Outpost 1 dan 4,5. Mobilisasi Motorized T1 18 sampai 20 jam, T3 23 jam sampai 1 hari.

## 2. Kecepatan game lain
**HoI4 adalah satu-satunya yang eksplisit km per jam:** infanteri, mountaineer, marine, paratrooper, artileri semua 4,0; kavaleri 6,4; mechanized 8,0; armored car 9,0; light tank 10 sampai 14; medium tank 8 sampai 10; heavy tank 5 sampai 6; **motorized 12,0**. Divisi bergerak sekecepatan batalion terlambat termasuk support company. Udara: small airframe 400 sampai 500 km/jam (supersonic 900), transport 400 sampai 480. Naval: halaman tidak memuat angka [UNV].
**Supremacy 1914:** manual resmi **tidak memuat km per jam sama sekali**; hanya Forced March "+50% movement speed, −5% morale per hour". **Call of War** [UNV] wiki memblokir. **EU4** hari per provinsi tanpa formula dasar [UNV]. **Vic3** memakai poin konstruksi per minggu, bukan kecepatan. Dari lima game strategi besar, **hanya HoI4 yang mengekspos km per jam**; semua game Bytro memakai abstraksi.

## 3. Kecepatan dunia nyata (verifikasi Wikipedia)
Infanteri berjalan 4 sampai 5 km/jam (konsisten HoI4). **Destroyer Arleigh Burke lebih dari 30 knot = 56 km/jam**, jangkauan 8.100 km pada 20 knot. **Kapal induk Nimitz 30+ knot = 56 km/jam**. **Kapal selam Virginia 25 knot = 46 km/jam** menyelam. **Helikopter Mi-171A2 jelajah 260 km/jam**, jangkauan 800 km. **C-130J jelajah 644 km/jam** (bukan 550), jangkauan 3.300 km. **C-17 jelajah 830 km/jam**, jangkauan 4.400 sampai 5.200 km bermuatan. Jet tempur 900 sampai 2.000 km/jam.

## 4. Jarak nyata (haversine, R = 6.371 km)
| Rute | Garis lurus | Rute praktis |
|---|---|---|
| Jakarta ke Palembang | 426 km | ~600 km via Selat Sunda |
| **Jakarta ke Surabaya** | **663 km** | ~800 km darat Jawa |
| Jakarta ke Banjarmasin | 917 km | ~1.000 km laut |
| Jakarta ke Singapura | 905 km | ~950 km |
| **Jakarta ke Makassar** | **1.398 km** | ~1.600 km laut |
| Jakarta ke Medan | 1.418 km | ~2.000 km darat Sumatra |
| Jakarta ke Darwin | 2.722 km | ~2.900 km |
| **Jakarta ke Jayapura** | **3.777 km** | ~4.300 km laut |
| **Sabang ke Merauke** | **5.248 km** | ~5.800 km |
| Berlin ke Moskow | 1.609 km | |
| Paris ke Berlin | 877 km | |
| New York ke Los Angeles | 3.936 km | |

Kalibrasi mental: Jakarta ke Jayapura sekitar 96% New York ke Los Angeles; Sabang ke Merauke 3,3 kali Berlin ke Moskow. **Indonesia bukan negara kecil.** Lebar selat [UNV]: Sunda tersempit ~24 km, Malaka ~38 km, Lombok ~18 sampai 40 km.

## 5. Waktu tempuh: model x skala waktu
| Rute | Model | Jam game | 1 hari = 60 mnt | 1 hari = 5 mnt | 1 hari = 2,5 mnt |
|---|---|---|---|---|---|
| Jakarta ke Surabaya 800 km | Realistis (motor 50 km/j) | 16,0 | 40,0 mnt | 3,3 mnt | **1,7 mnt** |
| | CoN (37,5 km/j) | 21,3 | 53,3 mnt | 4,4 mnt | 2,2 mnt |
| | **Usulan (190 km/j)** | 4,2 | 10,5 mnt | **0,9 mnt** | 0,4 mnt |
| Jakarta ke Makassar 1.600 km | Realistis (28 km/j) | 57,1 | 142,9 mnt | 11,9 mnt | 6,0 mnt |
| | CoN (63 km/j) | 25,4 | 63,5 mnt | 5,3 mnt | 2,6 mnt |
| | **Usulan (210 km/j)** | 7,6 | 19,0 mnt | **1,6 mnt** | 0,8 mnt |
| Jakarta ke Jayapura 4.300 km | Realistis | 153,6 | 383,9 mnt | 32,0 mnt | 16,0 mnt |
| | CoN | 68,3 | 170,6 mnt | 14,2 mnt | 7,1 mnt |
| | **Usulan** | 20,5 | 51,2 mnt | 4,3 mnt | **2,1 mnt** |

**Hanya model usulan pada 1 hari = 5 menit** yang memenuhi target Billy untuk Jawa dan Sulawesi. Jayapura tetap 4,3 menit pada 1x, dan itu benar secara desain. Model realistis gagal total di semua skala; model CoN juga gagal.

## 6. Rekomendasi kecepatan unit
**Keputusan arsitektur 1: jangan tampilkan km per jam di UI.** Tampilkan ETA dalam jam game. Simpan `speed` sebagai pengali tak berdimensi seperti CoN. Ini memberi kebebasan tuning tanpa dituntut realisme.
**Keputusan arsitektur 2:** internal `kecepatan_efektif = base_km_per_jam_game x speed_unit x pengali_terrain x pengali_infrastruktur`, dengan **`base_km_per_jam_game = 120`** (sekitar 4 kali realistis untuk darat, 7 kali untuk laut). Inilah bentuk konkret dari "kalibrasi dari km per jam nyata": angka nyata dipakai sebagai basis lalu dikalikan faktor abstraksi, bukan ditampilkan mentah.

| Kategori | `speed` | km/jam game efektif | Rasio vs realistis |
|---|---|---|---|
| Infanteri jalan kaki, milisi | 0,60 | 72 | abstraksi |
| Infanteri motorized | 1,00 sampai 1,50 | 120 sampai 180 | ~3x |
| Mechanized | 0,95 sampai 1,40 | 114 sampai 168 | ~15x HoI4 |
| Armor MBT | 0,90 sampai 1,50 | 108 sampai 180 | ~15x |
| Artileri towed | 0,70 sampai 0,90 | 84 sampai 108 | |
| Artileri SPG dan MLRS | 1,00 sampai 1,30 | 120 sampai 156 | |
| **Transport laut dan unit darat di laut** | **2,00 sampai 2,50** | 240 sampai 300 | ~9x konvoi |
| Kapal perang permukaan | 2,50 sampai 3,00 | 300 sampai 360 | ~5,5x |
| Corvette dan kapal cepat | 3,00 sampai 3,50 | 360 sampai 420 | |
| Kapal selam | 1,80 sampai 2,20 | 216 sampai 264 | ~5x |
| Helikopter | 8,00 | 960 | ~3,7x |
| Pesawat transport | 12,00 | 1.440 | ~1,7x |
| Jet tempur | 16,00 sampai 20,00 | 1.920 sampai 2.400 | ~1,5x |

Rasio darat banding laut = 1,50 banding 2,50 = **1,67**, identik dengan CoN. **Pengali terrain diadopsi persis dari CoN**: 1,00 open dan desert; 0,66 forest dan tundra; 0,50 urban dan suburban; 0,33 mountains dan jungle; 1,67 laut.
**Infrastruktur:** jalan raya +50%, rel +100%, Military Logistics +150% (angka CoN, level 1, hancur bila provinsi jatuh). Tidak bertumpuk aditif penuh: pakai `max(bonus)` ditambah 25% sisanya agar koridor Jawa tidak jadi teleport.
**Strategic redeployment:** rel kali 3,0 antar provinsi bersahabat tersambung rel, unit tidak bisa bertempur 6 jam game setelah tiba (readiness 40%); airlift kali 3,0 butuh Airfield di kedua ujung. Jakarta ke Surabaya via rel = 2,7 jam game = **0,55 menit nyata** pada skala 5 menit, reward yang benar untuk investasi infrastruktur.
**Fast forward sampai tiba wajib ada**, dengan interupsi otomatis pada kontak musuh, konstruksi selesai, atau event diplomatik.

## 7. Analisis kritis skala waktu
Misal S = menit nyata per hari game. Syarat konstruksi maksimal 10 menit: durasi terlama B harus memenuhi **B ≤ 240/S jam game**. Syarat tempuh maksimal 2 menit: **T ≤ 48/S jam game**.

| S | Batas durasi bangunan | Batas tempuh | Kecepatan minimum Jakarta ke Makassar |
|---|---|---|---|
| **60 mnt (usulan awal Billy)** | **≤ 4 jam game** | **≤ 0,8 jam game** | **2.000 km/jam, kecepatan jet** |
| **5 mnt (rencana)** | ≤ 48 jam game | ≤ 9,6 jam game | 167 km/jam, bisa |
| 2,5 mnt | ≤ 96 jam game | ≤ 19,2 jam game | 83 km/jam, nyaman |

Pada 1 hari = 1 jam nyata: Army Base L5 (36 jam game) menjadi **90 menit nyata**, sembilan kali melewati target; kapal angkut harus bergerak 2.000 km/jam, **71 kali lebih cepat dari konvoi nyata**; kampanye 30 sampai 60 hari game menjadi **30 sampai 60 jam nyata**. **Usulan 1 jam per hari gagal di ketiga sumbu sekaligus.**

**Detik nyata per jam game:** CoN 1x = 3.600; CoN 4x = 900; usulan 1 jam per hari = 150; **rencana 5 menit per hari = 12,5**; 2,5 menit = 6,25; rencana pada 8x = 1,56; **HoI4 speed 1 (paling lambat) = 2,0**; HoI4 speed 4 = 0,1. Temuan menohok: rencana 5 menit per hari **masih 6 kali lebih lambat dari setelan paling lambat HoI4**; baru pada 8x ia menyamai HoI4 speed 1.

**Waktu tunggu satu bangunan:** CoN 1x Army Base L5 = 36 jam nyata; CoN 4x = 9 jam; HoI4 speed 4 proyek 100 hari game = ~4 menit; Civ VI = 0 menit (turn-based); **Nation Rise pada 5 menit per hari = 7,5 menit**; pada 60 menit per hari = 90 menit. Pola: game offline single-player memberi tunggu 0 sampai 5 menit, game MMO asinkron berjam-jam. Nation Rise harus di kelompok pertama.

**Resolusi (tiga tuas, bukan satu):** pertahankan 1 hari = 5 menit pada 1x dengan maksimum 8x; percepat unit 3 sampai 7 kali dari realistis (tabel bagian 6); pertahankan durasi konstruksi CoN apa adanya (0,5 sampai 36 jam game); ubah target tempuh menjadi **berjenjang**:
| Kelas rute | Contoh | Target pada 1x | Pada 8x |
|---|---|---|---|
| Intra-pulau | Jakarta ke Surabaya, Palembang | di bawah 2 mnt | 15 dtk |
| Antar-pulau inti | Jakarta ke Makassar, Banjarmasin, Medan | di bawah 2 mnt | 15 dtk |
| Lintas nusantara | Jakarta ke Jayapura, Sabang ke Merauke | 3 sampai 5 mnt | **34 dtk** |
| Interkontinental | Jakarta ke Darwin, Tokyo | 3 sampai 8 mnt | 23 sampai 60 dtk |
Kampanye 30 sampai 60 hari game = 2,5 sampai 5 jam nyata pada 1x, atau 19 sampai 37 menit pada 8x.

## 8. Toleransi menunggu pemain
**Nielsen tiga batas response time:** 0,1 detik terasa instan; 1,0 detik alur pikir tidak terputus; **10 detik batas mempertahankan perhatian**, di atas itu wajib ada progress indicator persen dan cara membatalkan. Nielsen Powers of 10: "10 seconds: the average attention span is maxed out". **Doherty threshold 400 ms** (Doherty dan Thadani, IBM Systems Journal 1982).
Implikasi: menunggu 4,5 menit ke Jayapura melanggar ambang 10 detik sebanyak 27 kali, **kecuali menunggu itu tidak pasif**. Karena itu fast forward wajib bukan opsional; ETA numerik dan progress bar wajib untuk setiap konvoi dan konstruksi; kegiatan paralel (riset, diplomasi, antrean produksi) harus tersedia; antrean konstruksi 3 sampai 5 perintah agar pemain tidak kembali tiap 90 detik.
**Peringatan industri:** Ramin Shokrizade menyebut **soft gate** sebagai mekanisme monetisasi: "Clash of Clans uses this type in making building times ever longer and allowing the user to spend to complete them." Wait time panjang di CoN dan Clash of Clans adalah **mekanisme monetisasi, bukan mekanisme desain**. Bukti terkuat: **Supercell sendiri membuangnya**, update Juli 2022 menggratiskan pelatihan troop dan update Maret 2025 menghapus seluruh troop training time. Menyalin wait time ke game offline tanpa toko berarti menyalin rasa sakitnya tanpa alasannya.

## 9. Rekomendasi final (enam angka)
1. **1 hari game = 5 menit nyata pada 1x** (12,5 detik per jam game). Usulan 1 jam ditolak secara aritmetika, tetapi tetap tersedia sebagai kecepatan Ambient paling lambat sesuai keputusan D23.
2. **Kecepatan maksimum 8x** (1 hari = 37,5 detik) sebagai mode menunggu default.
3. **`base_km_per_jam_game = 120`** dengan tabel speed bagian 6.
4. **Pengali terrain persis CoN**: 1,00 / 0,66 / 0,50 / 0,33, laut 1,67.
5. **Durasi konstruksi CoN dipertahankan** (0,5 sampai 36 jam game = 0,1 sampai 7,5 menit nyata). Target 10 menit terpenuhi dengan margin 25%.
6. **Target tempuh berjenjang**: intra-pulau dan antar-pulau inti di bawah 2 menit; lintas nusantara 3 sampai 5 menit; pada 8x semuanya di bawah 40 detik.

Ketidakpastian yang harus diketahui: konversi CoN speed ke km per jam adalah derivasi dengan ketidakpastian ±40%, tetapi tidak memengaruhi rekomendasi karena rekomendasinya justru tidak memakai km per jam di UI.

## Sumber
conflictofnations.wiki.gg (Motorized_Infantry, Main_Battle_Tank, Mechanized_Infantry, Military_Logistics, Army_Base, Recruiting_Office, Naval_Base, Airfield) · bytro.helpshift.com FAQ 323 · hoi4.paradoxwikis.com (Land_units, Air_units, Naval_units, Defines) · vic3.paradoxwikis.com/Construction · steamcommunity.com manual Supremacy 1914 · Wikipedia (Arleigh_Burke-class_destroyer, Nimitz-class_aircraft_carrier, Virginia-class_submarine, Mil_Mi-17, Lockheed_Martin_C-130J_Super_Hercules, Boeing_C-17_Globemaster_III, Clash_of_Clans, Incremental_game) · nngroup.com (response-times-3-important-limits, powers-of-10-time-scales-in-ux) · lawsofux.com/doherty-threshold · gamedeveloper.com The Top F2P Monetization Tricks · gdcvault.com/play/1022065
