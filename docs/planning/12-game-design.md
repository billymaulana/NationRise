# Nation Rise: Game Design Document v0.3

> Konsolidasi 18 laporan riset (sesi 1 sampai 5, 2026-09-03 sampai 05) menjadi satu dokumen kerja. Angka bertanda **[V]** terverifikasi dari sumber, **[D]** diturunkan dari data terverifikasi, **[A]** asumsi desain. Enam keputusan masih menunggu Billy, ditandai **[?]**. Rujukan `NN-...md` menunjuk dokumen riset di folder ini.

> **Koreksi gelombang riset kedua (dokumen 38).** Lima angka di dokumen ini terbantah data dan sudah diperbarui. **Jumlah provinsi naik dari 2.000 ke 2.400**, karena Conflict of Nations World War III ternyata punya **3.358 provinsi**, sehingga rencana lama lebih kasar daripada referensi utamanya sendiri. **Indonesia naik dari 44 ke 54**, karena Conflict of Nations memberi Indonesia 53. **Maluku naik dari 1 ke 4 provinsi**, karena Halmahera, Seram, dan Buru masing-masing lebih besar daripada Bali. **Zona laut naik dari 210 ke 240**, dengan kelas ketiga bernama Strait. Dan **ambang kemenangan turun dari 25 ke sekitar 33 persen**, karena total poin kemenangan dunia Conflict of Nations ternyata sekitar 5.190, bukan 7.400. Lihat `38-research-map-design.md`.

## 1. Identitas

**Nation Rise** adalah game strategi negara single-player offline untuk pemakaian pribadi. Pemain memilih satu negara nyata dan mengelolanya: ekonomi, riset, militer, diplomasi, dan perang, di peta dunia berisi sekitar 2.400 provinsi. Basisnya Conflict of Nations, tetapi **bukan clone penuh** (D02, direvisi sesi 4): mekanik perang sengaja berbeda karena memindahkan unit satu per satu terasa lambat dan membosankan.

**Lima pilar.** (1) Terbaca dalam dua detik: semua state penting ada di HUD, tanpa spreadsheet. (2) Ruang keputusan sempit, konsekuensi panjang. (3) Dunia yang hidup: 195 negara AI mengambil keputusan yang dilaporkan koran dan events. (4) Realistis general: negara, bendera, provinsi, resource, organisasi, doktrin dari data nyata, tanpa simulasi mikro. (5) Ringan: 60 fps di MacBook Air M1 8 GB.

**Yang sengaja tidak ada.** Gold premium, gacha perwira, multiplayer, chat, pops, pemilu, production methods, editor peta, terrain 3D.

## 2. Waktu dan tempo (D23, `06-` dan `25-`)

Tick = **1 jam game**, 24 tick per hari game, di semua era. Tangga kecepatan dalam menit nyata per hari game: **Ambient 60, Santai 15, Normal 5, Cepat 2,5, Kilat 1,25**, ditambah Pause. Default Normal atau Cepat.

Pada Normal, satu jam game = 12,5 detik nyata, sehingga konstruksi terlama Conflict of Nations (Arms Industry level 5, 48 jam game **[V]**) menjadi **tepat 10 menit nyata**, memenuhi batas yang Billy tetapkan tanpa mengubah satu pun durasi asli. Syaratnya **tidak ada item melebihi 48 jam game**; SR-71 yang 52 jam dipangkas.

Usulan awal 1 hari game = 1 jam nyata ditolak secara aritmetika: Army Base level 5 menjadi 90 menit (sembilan kali di atas batas), kapal angkut harus bergerak 2.000 km per jam, dan kampanye 30 hari menjadi 30 jam nyata. Sebagai perbandingan, Conflict of Nations 1x memberi 3.600 detik nyata per jam game, sedangkan setelan paling lambat Hearts of Iron IV memberi 2,0 detik **[V]**. Rencana Normal kita di 12,5 detik masih enam kali lebih lambat dari HoI4 paling lambat, dan baru menyamainya pada 8x.

**Mulai dalam pause** dengan briefing Hari 1; kecepatan terakhir disimpan di save; setelah auto-pause kritis, kecepatan dibatasi maksimal 2x sampai engagement selesai.

**Auto-pause bertingkat.** Popup: deklarasi perang terhadap kita, unit musuh masuk wilayah kita, engagement baru melibatkan unit atau kota kita, kota jatuh, unit hancur, WMD terdeteksi, tawaran koalisi atau damai, dan pergantian hari (briefing harian, satu klik untuk mematikan). Feed tanpa pause: riset, mobilisasi, konstruksi selesai, unit tiba, shortage, morale turun. Log: tick pertempuran, harga pasar, gerak sekutu. Teknis: abaikan input unpause 0,5 detik setelah auto-pause; gabungkan notifikasi dari tick yang sama.

Nielsen: ambang perhatian putus di **10 detik**, dan di atas itu wajib ada indikator persen serta cara membatalkan **[V]**. Karena itu **tombol "fast forward sampai tiba" wajib**, bukan opsional; itulah yang mengubah tunggu empat menit pasif menjadi sepuluh detik aktif. Peringatan industri: wait time panjang di Conflict of Nations dan Clash of Clans adalah mekanisme monetisasi, bukan desain, dan Supercell sendiri menghapus seluruh troop training time pada Maret 2025 **[V]**.

## 3. Peta dan data (`04-`, `21-`, `22-`)

**Geometri.** Natural Earth 10m Admin-1 (4.500+ unit, public domain) di-dissolve ke **~2.400 provinsi**, dengan 57 negara utama menyumbang 1.472 dan sisa dunia 528. Kelas negara: Mayor 40 sampai 82 provinsi dan 8 sampai 12 kota, Menengah 12 sampai 40 dan 4 sampai 8 kota, Kecil 3 sampai 12, Mikro 1 sampai 2. Contoh target: USA 82, Rusia 72, China 68, India 60, Brasil 48, **Indonesia 54**, Jerman 44, Britania Raya 36, Filipina 36, Jepang 40.

**Tujuh invarian merge yang tidak boleh dilanggar.** Satu provinsi maksimal satu kota besar; unit pantai tidak pernah menjadi landlocked; tidak merge lintas batas negara; **tidak merge lintas garis hot-zone historis**; unit perbatasan dipertahankan; kekompakan Polsby-Popper minimal 0,18; koefisien variasi luas per negara di bawah 0,9 (1,5 untuk Rusia, Kanada, Australia). Hasil disimpan sebagai **CSV yang bisa diedit tangan**, karena sekitar 150 keputusan pasti perlu koreksi manual.

**Kepulauan.** Adjacency antar pulau **harus lewat zona laut**, tidak pernah darat. Inilah yang membuat angkatan laut punya arti. Indonesia 54 = Jawa 10, Sumatra 10, Kalimantan 8, Sulawesi 6, Papua 6, Nusa Tenggara dan Bali 3, Maluku 1. Alaska dan Hawaii non-adjacent ke daratan Amerika agar skenario Pearl Harbor berfungsi.

**Peringatan data.** Natural Earth mencampur tingkat administratif ("Many countries, like France, include top level regions and departments, both as admin-1 ranking" **[V]**) dan berstatus beta tanpa Admin-1 untuk Antartika, sebagian wilayah sengketa, negara pulau kecil, dan kepangeranan. Empat negara akan mengecewakan: Vietnam (NE 63 versus 34 sejak 1 Juli 2025), Aljazair (48 versus 69 sejak 16 November 2025), DR Kongo (mungkin 11 versus 26), Norwegia (11 versus 15). **Langkah pertama fase 1 adalah menjalankan `ogrinfo` count per `adm0_a3`**, yang lebih otoritatif daripada sumber sekunder mana pun.

**Batas sengketa (D26).** `owner` diambil dari layer de facto Natural Earth tanpa varian point of view. Override manual untuk 47 kasus yang sudah ditabelkan. `core_of[]` tetap disimpan sebagai mekanik klaim: punya core memberi casus belli otomatis dan merebut provinsi yang jadi core sendiri tidak menambah infamy. Entitas de facto tanpa pengakuan luas menjadi negara terpisah dengan field `recognition` berisi jumlah anggota PBB yang mengakui: Palestina 157, Kosovo 110, SADR 46, Taiwan 11, Abkhazia 4, Ossetia Selatan 4, Siprus Utara 1, Somaliland 1 (Israel, 26 Desember 2025), Transnistria 0 **[V]**. Artsakh tidak dimasukkan karena bubar 1 Januari 2024 **[V]**. Garis depan Ukraina disimpan sebagai `front_line_2026.geojson` terpisah dengan field `as_of`, karena counteroffensive masih berlangsung per Agustus 2026 **[V]**.

**Kota.** Ibu kota selalu terpilih; populasi metro di atas 2 juta selalu terpilih; separasi minimum 250 km untuk negara mayor; kuota geografis minimal satu kota per makro-region. **Rumus poin kemenangan: `clamp(round(1,72 × log10(pop_max) − 6,0), 1, 10)` ditambah 1 bila ibu kota** — ini mereproduksi total VP Indonesia Conflict of Nations **persis 34** dengan deviasi satu poin hanya pada dua kota **[D]**. Sediakan kolom `vp_override` untuk sekitar 50 kota.

**Zona laut.** Model Hearts of Iron IV, sekitar **210 zona**: 115 Coastal Waters, 70 High Seas, dan 25 sampai 26 Strait bernama termasuk Dardanelles (tanpanya Gallipoli hilang). Dibuat hybrid: chokepoint digitize manual di QGIS, Coastal Waters via Voronoi dari seed sepanjang pantai, High Seas via seed H3 resolusi 1. **Adjacency hanya sah bila panjang batas bersama di atas 25 km**, tanpa itu armada menembus daratan secara diagonal.

**Terrain.** Stack 1 km sekitar 6 GB, bukan WorldCover 10 m yang 117 GB, karena provinsi rata-rata 68.000 km2 sudah memberi 68.000 sampel. Sumber: GHS-SMOD, Köppen-Geiger Beck (CC BY 4.0), GMTED2010, Copernicus GLC. **CRS kerja EPSG:6933 wajib**; menghitung fraksi luas di EPSG:4326 salah lebih dari 40 persen di lintang tinggi. Klasifikasi first-match-wins dengan **prioritas Urban di atas Mountains** yang disengaja, karena La Paz dan Kabul secara gameplay harus Urban. Agregasi dengan exactextract, sekitar 2 sampai 5 menit untuk 2.000 poligon.

## 4. Ekonomi (`09-`, `24-`)

**Struktur.** Money dan Manpower selalu ada, ditambah maksimal lima goods per era pack dengan slot HUD tetap. Modern 2026 memakai tujuh resource Conflict of Nations: Supplies, Components, Fuel, Electronics, Rare Materials, Manpower, Money. Perang Dunia 2 memakai lima goods ala Call of War; Perang Dunia 1 lima goods ala Supremacy 1914 dengan **upkeep substitutable per kategori** (unit butuh satu Energy yang bisa dipenuhi coal atau oil), trik yang membuat lima barang terasa seperti tiga.

**Formula produksi (rekonstruksi penuh, 8 dari 8 data point cocok tanpa sisa) [D]:**
```
output_harian = floor( 3000 × (morale × 0,8 + 0,25) × resourceFactor × popFactor )
popFactor(p) = p × 0,2                    untuk p ≤ 5
popFactor(p) = 1,0 + 0,1025 × (p − 5)     untuk p > 5   (linear, dipilih agar megakota tidak dominan)
```
Dua koreksi terhadap formula wiki: **Electronics resourceFactor 0,25** bukan 0,375, dan **popFactor(6) 1,1025** bukan 1,05. resourceFactor final: Electronics 0,25 memberi 607; Rare 0,30 memberi 729; Money 0,375 memberi 911; Components 0,45 memberi 1.093; Fuel dan Supplies 0,525 memberi 1.275. Beda sekitar 0,075 antar tingkat, dan **berbanding terbalik dengan kelangkaan strategis**.

**Manpower** `floor(160 × moraleFactor × popFactor × doctrineMult)`, memberi 129 pada populasi 5 morale 70 persen. Harus dipengaruhi morale karena itu satu-satunya rem terhadap over-expansion: kota aneksasi bermorale 60 persen hanya memberi 90 persen manpower dari kota homeland setara.

**Morale [V].** Awal 70 persen; produksi = morale × 0,8 + 0,25; waktu konstruksi 100 persen di atas 90 persen morale dan 133 persen di bawah 25 persen; target homeland 90, aneksasi dan okupasi 60, provinsi 100; **ambang pemberontakan 25 persen memberi peluang 50 persen**; modifier kehilangan HQ −20, jarak ke HQ −5 per satuan, perang −2 per negara maksimal −25, bunker +5 sampai +50.

**Shortage** berbentuk ramp Victoria 3 (mulai −5 persen, −3 persen per hari, dengan cap) agar pemain punya lima sampai sepuluh hari bereaksi: Supplies menurunkan morale dan menghentikan regenerasi HP; Fuel memotong kecepatan dan serangan unit bermesin setengah; Money menjeda antrean; Materials menghentikan produksi baru; Rare menghentikan riset.

**Pasar dunia (`28-`).** Harga dunia memakai formula Victoria 3 terverifikasi `base × [1 + 0,75 × clamp((BUY − SELL)/min(BUY,SELL), ±1)]` dengan band 25 sampai 175 persen, dihaluskan EMA α = 0,30 dan **dibatasi ±12 persen per hari** (30 persen terbukti membuat perencanaan produksi mustahil). **Harga lokal = MAPI_base × akses × harga dunia + sisanya × harga autarki, dengan MAPI_base 0,75**, bukan 1,0, sehingga produksi domestik selalu bernilai. Peserta virtual **Rest of World** elastis terhadap harga, terlihat di layar sebagai peserta bernama agar pemain tidak menyimpulkan pasar curang. Dampak harga per lot β = 0,5; fee 5 persen per sisi sebagai money sink; kuota beli harian `min(25% total_sell, 3 × konsumsi, sisa gudang)`; pengiriman T+1.

**Blokade memotong volume, bukan harga.** Akses turun ke 0,25, sehingga harga naik hanya 10,6 persen tetapi kapasitas impor turun 75 persen. Antarmuka harus menyorot batas volume. Empat pencegah pasar mati: endowment struktural per provinsi (paling kuat karena bekerja tanpa AI harus pintar), konsumsi wajib, elastisitas produksi AI yang menutup produksi bila harga di bawah 0,60 kali base selama tujuh hari, dan Rest of World.

## 5. Militer dan pertempuran (`08-`, `24-`, `25-`)

**Resolusi pertempuran** per tick satu jam di peta, tanpa layar battle terpisah.
```
rawStrength = Σ rating(unit, armorClass lawan) × (0,25 + 0,75 × hp/maxHp)
stackMod    = clamp(1 − 0,56 × ln(n/10), 0,35, 1,0)
protectMod  = entrench (kota 0,75) × bunker (level 1 sampai 5: 0,67 turun ke 0,27)
damage      = rawStrength × stackMod × terrainMod × protectMod × k × rng
k = 0,35 ; rng = 1 ± 15% dari PRNG ber-seed deterministik
```
**k hanya menskala waktu, bukan hasil** (HP defender tersisa 63 sampai 65 persen untuk k dari 0,30 sampai 0,70), sehingga aman di-tune untuk pacing. Semua keputusan balance ada di rating dan terrain modifier. **Stacking penalty adalah rem eksplisit terhadap hukum Lanchester square**; tanpanya satu-satunya strategi optimal adalah doomstack.

**Angka acuan.** Sepuluh infanteri menyerang sepuluh infanteri entrenched di kota: **penyerang musnah di tick 12, bertahan kehilangan 35 persen HP dan nol unit**. Rasio pemenang sekitar 1,8 banding 1, dan menambah dari 18 ke 24 unit mempersingkat waktu tetapi stacking penalty membuat marginal return menurun tajam. Lima tank ditambah lima mekanis melawan sepuluh infanteri di open ground menang dalam 6 tick dengan rugi 9 persen, tetapi di kota butuh 16 tick dengan rugi 28 persen. **Rasio efisiensi armor 1,75 di open ground menjadi 0,56 di urban, faktor 3,1 kali** — itu ukuran kuantitatif rock-paper-scissors yang terbaca.

**Unit udara tidak bisa diseimbangkan lewat rating.** Pertahanan infanteri terhadap pesawat hanya 0,3 **[V]**, menghasilkan rasio pertukaran 10,86. Balance harus dari luar rumus: sortie maksimal tiga tick lalu kembali ke pangkalan, cooldown empat jam, dan AA envelope. Kalibrasi: dua Mobile SAM dengan serangan terhadap pesawat 14 memberi 29,4 HP kerugian per sortie atau 32,7 persen. **Mobile AA saja tidak cukup, Mobile SAM wajib.**

**Sistem pendukung.** Supply tiga status: Supplied, Low (jarak di atas R, serangan 0,9 dan tidak bisa entrench), Cut Off (grace 48 tick lalu serangan 0,8, pertahanan 0,7, HP −1 persen per hari); R per era: PD1 3, PD2 4, Modern 6. Morale stack per pasukan: damage × (0,55 + 0,45 × morale/100), rout di bawah 25, surrender bila rout tanpa jalur retreat. Intel empat tingkat: 0 tidak tahu, 1 ada pasukan, 2 estimasi ±50 persen, 3 pasti ±10 persen; **AI memakai estimasi yang sama** sehingga tipuan berhasil secara adil.

**Kecepatan unit (D23).** `kecepatan = base_km_per_jam_game (120) × speed unit × terrain × infrastruktur`. Speed: infanteri jalan 0,60; motorized 1,00 sampai 1,50; armor 0,90 sampai 1,50; **transport laut 2,00 sampai 2,50**; kapal perang 2,50 sampai 3,00; kapal selam 1,80 sampai 2,20; helikopter 8; pesawat transport 12; jet 16 sampai 20. Terrain persis Conflict of Nations: open dan desert 1,00; forest dan tundra 0,66; urban 0,50; mountain dan jungle 0,33; **laut 1,67**. Infrastruktur: jalan +50 persen, rel +100 persen, Military Logistics +150 persen, tidak bertumpuk penuh melainkan `max(bonus)` ditambah 25 persen sisanya. Strategic redeployment rel dan udara kali 3 dengan readiness 40 persen selama enam jam game. **UI menampilkan ETA dalam jam game, bukan km per jam** — Conflict of Nations sengaja tidak mengekspos satuan fisik agar bebas menyetel tempo.

**[?] Target waktu tempuh.** Riset mengusulkan berjenjang: intra pulau dan antar pulau inti di bawah dua menit, lintas nusantara tiga sampai lima menit pada 1x dan di bawah 40 detik pada 8x. Jakarta ke Jayapura berjarak 3.777 km, hampir sama dengan New York ke Los Angeles, sehingga menuntutnya di bawah dua menit berarti kapal bergerak 2.000 km per jam.

## 6. Kontrol perang berlapis (D20, `18-`, `26-`)

Prinsip: **pemain menulis niat, simulasi mengeksekusi, override selalu semurah satu klik dan tidak dihukum.** Otomasi eksekusi diterima luas di semua game; otomasi keputusan dikeluhkan, kecuali game jujur berhenti menjadi game strategi (Ages of Conflict) atau memindahkan strateginya ke sistem lain (Rebel Inc).

**Default L2 Front dan Theater.** Pemain menggambar front, menaruh army group dengan komandan, dan memberi satu dari enam objective: Bertahan, Maju ke X, Jepit region Z, Tahan Garis, Mundur ke L, Tipuan ke W. Angkatan laut diberi misi per zona: Patroli, Blokade pelabuhan, Kawal, Serang konvoi, Invasi pantai. AI menempatkan stack dan memilih stance turunan.

**L3 kartu operasi** untuk momen besar, sebelas kartu berprasyarat yang bisa dirantai dengan trigger: Blokade, Pengepungan Kota, Bombardemen, Pendaratan Amfibi, Pincer, Tipuan, Breakthrough, Tahan Chokepoint, Zona Penyergapan, Mundur Strategis, Raid Jalur Suplai. Rantai Konstantinopel 1453 memakai empat kartu dan sekitar dua belas klik; rantai Hattin memakai tiga kartu dan sembilan klik.

**L1 override manual** selalu tersedia dan kembali otomatis ke kendali front setelah perintah selesai, mengikuti pola Hearts of Iron IV yang terverifikasi. **L4 delegasi per front** untuk front sekunder, tidak pernah default.

**Insentif, bukan setting screen.** Koordinasi front +2 persen per hari game hingga maksimum 25 persen, meluruh 1 persen per hari di bawah AI dan 3 persen setelah override manual. Angka ini disalin dari sistem HoI4 yang terbukti, dikalibrasi turun dari 30 karena kartu operasi juga memberi bonus.

**Preset default: Panglima [?]**, tidak ditanyakan di layar setup karena itu pilihan di bawah ketidaktahuan. Toggle Gaya Komando tersedia di HUD kapan saja. Promosi adaptif: bila override melebihi dua belas kali dalam tujuh hari game selama dua periode berturut, tawarkan beralih ke Komandan Lapangan. **Tutorial mengajarkan L2 lebih dulu**, karena urutan tutorial adalah pernyataan desain yang lebih kuat daripada setting default.

Target: **di bawah 30 perintah per perang sepuluh hari**, dibanding sekitar 125 di Conflict of Nations.

## 7. Riset, bangunan, unit (`02-`, `24-`)

**Riset** dua slot paralel, digate per hari game, biaya Supplies ditambah Rare ditambah Money. Untuk era historis dipakai **epoch gating**: node punya epoch bukan hari mentah, sehingga satu berkas riset tetap valid bila panjang kampanye diubah. Ahead of time satu epoch dengan durasi tiga kali. Baseline hari unlock (European): Infanteri 0, 6, 16; Armor 2, 9, 20; Artileri 3, 10, 21; Anti-Air 3, 11, 22; Rotary 4, 12, 24; Fixed Wing 5, 14, 26; Naval 4, 13, 25; Submarine 7, 16, 28; Missile 9, 18, 30.

**Bangunan** dengan biaya dan durasi Conflict of Nations apa adanya: Army Base, Air Base, Naval Base, Arms Industry, Recruiting Office, Military Hospital, Underground Bunkers, Secret Weapons Lab, plus bangunan provinsi Combat Outpost, Airfield, Field Hospital, Local Industry, Military Logistics. Level bangunan menjadi gate unit.

**Roster Modern sekitar 31 unit** dengan kelas biaya C1 sampai C5 (100, 180, 320, 560, 1.000 CP; rasio 1,75) dan waktu mobilisasi 4, 7, 12, 20, 34 jam. Anchor terverifikasi dipertahankan: Motorized HP 15 dengan Soft 3,0 dan 3,8; MBT HP 45 dengan Soft dan Hard 9,0 dan 8,0, nol terhadap udara dan laut; Ballistic Missile Conventional 25 terhadap Soft dan 80 terhadap Hard, Chemical 125 dan 20, Nuclear 250 dan 250, splash 10.

**Pengali tier** berbeda per kelas karena Conflict of Nations memang begitu **[V]**: infanteri naik 2,10 kali di tier 3 sementara armor hanya 1,45 kali, agar unit murah tetap relevan di late game dan unit mahal tidak menjadi tak tersentuh.

**Empat doktrin.** Western HP 1,10 dan biaya 1,15 dengan bonus udara dan laut; Eastern HP 0,90 dan biaya 0,85 dengan bonus artileri dan misil; European seimbang dengan bonus mekanis dan SAM; Non-aligned biaya 0,80 tetapi riset 1,20 lebih lambat dan Fixed Wing serta Naval terbatas tier 2. Penetapan doktrin per negara dari heuristik data: NATO Eropa menjadi European, sekutu perjanjian Amerika menjadi Western, CSTO dan klien senjata Rusia atau China menjadi Eastern, sisanya Non-aligned. **Indonesia jatuh ke Non-aligned condong Eropa** karena pemasok 2021 sampai 2025 adalah Italia 40 persen, Amerika 16, Prancis 14 **[V]**.

## 8. Diplomasi, AI, kesulitan (`03-`, `23-`)

**Relasi** Conflict of Nations: War, Ceasefire, Peace, Right of Way, Shared Intelligence, plus Shared Map otomatis koalisi. Koalisi dengan ambang VP berskala. Ditambah dari Victoria 3 dan Ages of Conflict: **infamy** dengan tingkat Reputable, Infamous, Notorious, Pariah dan containment; **crisis tiga fase** sebelum perang; **attitude label** AI; **alliance unity**; **puppet** tiga tipe dengan loyalty dan autonomy; **lost territories** yang mengingat pemilik sah.

**AI nation** memakai archetype dan agenda yang terlihat pemain, dengan bobot dari data: `aggression = clamp(0,15 + 0,35 × konflik + 0,03 × milex_gdp + 0,20 × expansionist − 0,10 × demokrasi)` dan tiga bobot lain serupa. Persona ditentukan aturan urut: Expansionist bila punya klaim dan kekuatan relatif tinggi; Militarist bila belanja militer di atas 4 persen PDB dan ada konflik; Naval bila rasio pantai tinggi dan armada besar; Economic bila PDB per kapita tinggi dan belanja rendah; Defensive sebagai default. **Indonesia menjadi Naval dengan agenda penjaga selat.**

**AI dan pemain memakai planner yang sama**, sehingga AI tidak punya taktik yang tidak tersedia bagi pemain, dan delegasi L4 adalah planner yang sama dijalankan untuk pemain.

**Kesulitan** empat preset dengan pengali kecil 15 sampai 30 persen (bukan dua kali lipat ala Civ Deity), scaling bonus AI sampai hari N, aggressiveness terpisah, override per negara, dan toggle dunia. **Label kesulitan per negara** dihitung dari VP awal, ancaman tetangga, geografi, kelengkapan resource, dan ekonomi; Indonesia jatuh di **Hard** terutama karena faktor geografi kepulauan 0,80.

## 9. Scenario dan era (`10-`)

**Modern 2026, Perang Dunia 1 1914, Perang Dunia 2 1939, dan custom** dengan empat arti: modding folder, editor scenario in-game, preset alt-history sebagai era pack, dan sandbox acak.

**Provinsi tetap unit di semua era; hanya kepemilikan yang berubah.** Satu file geometri immutable plus satu file kepemilikan per era. Pipeline: polygon historis (CShapes 2.0 untuk 1914, 1939, 1962; historical-basemaps untuk pra-1886) diiriskan dengan provinsi Natural Earth memakai **luas terbesar bukan centroid**, hasil di bawah 0,7 confidence masuk review manual, dan `overrides.json` menang atas hasil otomatis.

**28 grup sub-split hot-zone, +30 provinsi** untuk garis 1914 dan 1939: Alsace-Moselle, Nordslesvig, Prusia Barat, Silesia, Danzig, Trieste, Thrace Barat, Bukovina, Budjak, Karelia, Petsamo, Kresy, lima wilayah Sudetenland, tiga strip Hungaria, Mengjiang, Rehe, Kamerun Britania, Rif. Separuh daftar awal ternyata **tidak perlu geometri baru, hanya constraint jangan merge**: South Tyrol, Istria, Memel, Vilnius, Galicia, Zakarpattia, Transylvania, Vojvodina, Bessarabia, Togoland, Namibia, Tanganyika, Timur Tengah Ottoman, India. **Princely states India memakai flag, bukan geometri** — 565 negara pangeran mustahil dipetakan.

**Model dua lapis owner dan sovereign** dengan `subject_type` yang harus dirancang sekarang untuk memuat koloni, protektorat, dominion, mandat Liga Bangsa-Bangsa, dan condominium, karena era historis jauh lebih membutuhkannya.

**Kalender naratif per era**, tick tetap satu jam: Modern satu banding satu; PD2 satu hari game sekitar 30 sampai 36 hari sejarah; PD1 sekitar 30 hari. Ini memberi musim sebagai bonus (atrisi Rusia November sampai Maret) dan memungkinkan event dipicu tanggal naratif.

**Event deklaratif** dengan trigger dan efek dari sekitar 15 verba, bobot `ai_weight` historical dan free, toggle **Historical AI default menyala (D27)**, dan **divergensi dicatat bukan dipaksa**: event yang prasyaratnya gugur ditandai diverged dan Chronicle mencatat alasannya.

## 10. Identitas pemain, Chronicle, dan mode lanjutan (D28, D31, `26-`)

**Identitas negara pemain** dapat berubah: nama, bendera lewat builder preset, warna, motto, bentuk pemerintahan, ibu kota dengan biaya dan cooldown, national focus, doktrin. **AI identitas tetap** kecuali lewat event terdesain. **Chronicle** mencatat semua peristiwa penting dan dirender sebagai timeline dan peta bertahap.

**Permainan tidak berhenti saat menang.** Tiga tahap: hegemoni tercapai memunculkan **layar Warisan non-modal** dengan tombol Lanjutkan bukan Keluar; Era Pascahegemoni membuka dua belas Proyek Akhir dan meteran Tekanan Dunia; tidak ada akhir kecuali pemain menekan Tutup Kronik. Mengikuti Stellaris, **selama krisis aktif layar Warisan ditunda** agar kemenangan tidak datang di momen antiklimaks.

**[?] Dua belas Proyek Akhir** (60 sampai 300 hari game, 12 sampai 90 ribu Poin Industri): Program Antariksa empat tahap, Reaktor Fusi, Rudal Hipersonik, Kapal Induk Kelas Baru, Kubah Pertahanan Rudal, Megapolis, Rekayasa Bumi yang mengubah terrain permanen, Superkomputer yang meng-upgrade AI delegasi, Armada Drone, Triad Nuklir, Monumen Nasional, Misi Antarplanet. Dua catatan desain: Superkomputer menyambungkan endgame ke sistem kontrol karena pemain yang sudah menang akhirnya punya alasan mempercayai delegasi; dan **Monumen Nasional satu-satunya yang menurunkan Tekanan Dunia**, menciptakan pilihan nyata antara membangun senjata dan membangun warisan.

**Tekanan Dunia** 0 sampai 100, terlihat pemain karena transparansi lebih baik daripada kejutan di game deterministik. Ambang 40 koalisi diplomatik, 60 koalisi militer, 75 pemberontakan interior, 85 krisis eksistensial dari deck lima kartu termasuk **Kudeta Militer** yang menyerang sistem kontrol alih-alih peta. Scaling 1,75 kali per krisis, pengecekan tiap 90 hari game, dengan stream PRNG terpisah sehingga fork menghasilkan krisis identik dan **fork menjadi fitur endgame, bukan sekadar utilitas save**.

**[?] Ironman.** Riset merekomendasikan tidak membuatnya sama sekali, karena ironman di semua game ada untuk verifikasi anti-cheat achievement online yang kita tidak punya, sementara wiki resmi HoI4 dan EU4 sama-sama mencatat korupsi save sebagai cara run ironman mati **[V]**. Gantinya **Segel Kanon**: save bebas, flag integritas per cabang (kanon, terkoreksi, eksperimen), dan Chronicle mencatat empat angka termasuk **hari game yang diulang** yang jauh lebih jujur daripada jumlah reload. Autosave `max(1 hari game, 5 menit nyata)` plus berbasis peristiwa, ring buffer 20 slot rotasi plus 5 slot tonggak, dan **tidak pernah file save tunggal**.

## 11. Visual dan antarmuka (`01-`, `27-`)

**Gaya** mengikuti Conflict of Nations: peta satelit desaturasi, batas provinsi garis putih tipis, garis pantai negara sendiri berglow, kota sebagai sketsa jaringan jalan dengan label "Nama(VP)", glyph terrain. Unit sebagai model 3D low-poly instanced ditambah counter 2D berisi bendera, ikon tipe, dan jumlah. Panel biru baja gelap dengan header uppercase, tab trapesium, ikon dalam bingkai diamond, dan warna semantik hijau untuk positif, merah untuk negatif, oranye untuk jual, emas untuk VP.

**Warna pemilik tiga lapis.** `identityColor` dari bendera untuk panel dan ikon; `paletteSlot` dari greedy graph coloring pada **graph jarak dua** karena teorema empat warna tidak berlaku untuk peta dengan eksklave **[V]**; `mapColor` sebagai anchor slot yang digeser maksimal 12 derajat hue ke arah identitas. Delapan keluarga hue kali tiga tingkat kecerahan memberi 24 slot, dengan blok dan koalisi sebagai keluarga hue sehingga peta bisa dibaca strategis dalam satu kilasan.

**Gate warna otomatis menggagalkan build**: ΔE2000 minimal 25 untuk tetangga, 15 untuk jarak dua, dan 18 setelah simulasi Machado. **Matriks simulasi buta warna harus dijalankan di linear RGB**, karena menerapkannya pada sRGB membuat gate memberi rasa aman palsu **[V]**. Mode buta warna adalah palet alternatif hasil build (5 hue kali 5 kecerahan), bukan filter layar, karena filter mensimulasikan kondisi tanpa mengompensasi. Deuteranomaly sendiri 5 persen pria, lebih besar dari semua tipe lain digabung.

**Layar wajib.** Peta dengan HUD resource bar, panel provinsi dan kota, konstruksi dan mobilisasi, riset, panel unit dan army group, Front dan Theater, kartu operasi dan War Room, pasar dunia, diplomasi, koalisi, intelijen, koran dan events, briefing harian, Nation dan Customize Nation, Chronicle, Codex, dan setup scenario.

**Glosarium Indonesia** sudah ditetapkan: Suplai, Komponen, Bahan Bakar, Elektronik, Material Langka, Personel, Dana, Moral, Pasukan, Grup Tempur, Front, Teater, Kartu Operasi, Terpasok, Menipis, Terputus, Poin Kemenangan, Reputasi Agresi, Kronik.

## 12. Aturan konten dan sensitivitas (`28-`)

**[?] Tiga keputusan menunggu.** Senjata kimia sebagai kemampuan pemain hanya di Perang Dunia 1, tidak di Modern 2026. Tokoh nyata dihindari sepenuhnya, diganti jabatan generik dan doktrin bernama. Bendera tidak pernah dirender rusak, terbakar, terbalik, atau setengah tiang untuk negara mana pun, dan negara yang kalah ditandai perubahan warna wilayah.

**Aturan yang sudah pasti.** Event Modern struktural bukan naratif, tanpa nama negara atau organisasi nyata dan tanpa tanggal yang cocok peristiwa nyata. Separatisme sebagai modifier provinsi bernama generik, tanpa aset visual gerakan mana pun di dunia, dan tanpa mekanik yang bisa dibaca sebagai penindasan etnis. Nuklir tetap ada dengan biaya permanen dan tanpa jalur menang tanpa konsekuensi, dibingkai seperti DEFCON. Legends default mati dengan **Codex dua kolom** yang kolom faktanya berbobot visual sama atau lebih besar, dan entri Gunung Padang wajib menyebut retraksi Wiley Maret 2024. Istilah genosida, pembersihan etnis, dan kamp tidak pernah menjadi nama mekanik.

**Disclaimer** dalam Bahasa Indonesia dan English sudah ditulis lengkap di `28-`, dengan tiga syarat efektif: membuat klaim yang bisa diuji, muncul di titik keputusan bukan splash screen, dan didukung mekanik.

## 13. Arsitektur ringkas (D13, D22, `05-`, `13-`)

Vue 3.5 dengan Vite 8 dan TypeScript; three.js WebGLRenderer untuk peta province ID map dan unit instanced; Vue dengan UnoCSS untuk semua panel; simulasi di Web Worker dengan bitecs; idb dan fflate untuk save; PWA dulu lalu Tauri v2; macOS lebih dulu.

**Syarat siap-Rust (D22) yang tidak boleh ditunda:** simulasi adalah modul murni tanpa DOM dengan state SoA typed arrays dan protokol pesan eksplisit; determinisme dari hari pertama dengan PRNG seeded dan tanpa `Math.random`; snapshot diff transferable dengan UI dithrottle 5 sampai 10 Hz; rendering province ID dengan lookup texture; uji di WKWebView sejak minggu pertama; era pack JSON dengan skema zod. **Gerbang pengukuran:** bila tick melebihi 500 ms atau frame melebihi 16 ms setelah optimasi wajar, inti simulasi dipindah ke Rust atau WASM tanpa membuang UI.

**Modding v1 data saja** dengan DSL trigger dan efek berkosakata enum tertutup, tiga mode merge define, replace, dan patch, versioning per tipe entity dengan migrasi in-memory, dan Ajv precompiled. Lima lubang yang tetap ditutup meski tanpa scripting: prototype pollution, path traversal, script di dalam SVG, v-html pada teks terjemahan, dan batas ukuran arsip.

## 14. Kalibrasi kemenangan (`24-`)

Total VP dunia Conflict of Nations World War III berhasil direkonstruksi **[D]** di **7.400**, karena kelima ambangnya menjadi persentase bulat 25, 40, 57,5, 72,5, dan 80 persen, dan terkonfirmasi silang oleh rata-rata 74 VP per negara. Untuk peta kita dengan 2.400 provinsi dan 600 kota, total menjadi **3.643** dengan rata-rata 1,82 VP per provinsi.

**[?] Ambang yang diusulkan:** solo 911, koalisi dua 1.457, tiga 2.095, empat 2.641, lima 2.914. Ditambah kenaikan bertahap `threshold(day) = base × (1 + 0,004 × max(0, day − 30))` agar AI yang stagnan tidak menang karena bosan. Victory alternatif: Regional Hegemon menguasai 60 persen VP satu benua dan 8 persen VP dunia; Superpower peringkat satu ekonomi dan militer selama sepuluh hari berturut dengan lantai 15 persen VP dunia.

**Panjang kampanye target median 40 hari game**, membutuhkan 12 provinsi per hari atau empat sampai lima grup tentara aktif, angka yang masuk akal untuk pemain tunggal. Balancing lewat sim AI melawan AI 100 seed dengan target median 35 sampai 50 hari, P10 minimal 25, P90 maksimal 65, dan tanpa pemenang di bawah 5 persen.

## 15. Metode balancing (`24-`)

Simulator wajib murni tanpa I/O dan tanpa `Math.random`. **Matriks duel 31 kali 31** kali sepuluh terrain kali tiga tier kali lima seed, menyamakan **anggaran CP bukan jumlah unit** (membandingkan sepuluh tank dengan sepuluh infanteri tidak bermakna karena tank 3,2 kali lebih mahal), total 144.150 pertempuran yang selesai dalam beberapa detik di Node.

Lima metrik dengan target: cost-efficiency maksimum tidak melebihi 1,3 kali median, diambil **median bukan mean** karena mean dirusak outlier; position-win rate antara 40 dan 60 persen; time-to-victory 8 sampai 20 tick; **terrain spread minimal 2,0 untuk setiap unit darat** (unit di bawah 1,5 tidak punya identitas); dan counter coverage seratus persen. **Matriks duel murni bukan satu-satunya gerbang**: unit yang efisiensinya berubah lebih dari tiga kali antara duel telanjang dan duel dengan counter wajib punya constraint non-combat terdokumentasi.

**`anchors.spec.ts` adalah pertahanan utama** yang mengunci rasa game ke angka konkret: duel referensi selesai tepat 12 tick, delapan belas infanteri adalah minimum untuk mengalahkan sepuluh yang entrenched, dan delapan data point ekonomi Indonesia direproduksi persis. **Jangan pernah menyetel k untuk memperbaiki balance**; k hanya menggeser skala waktu.

---

*Dokumen ini menggantikan GDD v0.2 (disimpan sebagai `12-game-design.v0.2.bak`). Enam tanda `[?]` menunggu keputusan Billy, tercatat di `17-open-questions.md`.*
