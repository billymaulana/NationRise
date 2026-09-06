# Riset: Preset Kontrol, Ironman, dan Mode Lanjutan Setelah Menang

> Riset sesi 5 (2026-09-05) untuk P27, P30, dan detail D28. Verifikasi lewat wiki Paradox dan Wikipedia. WebSearch tidak tersedia; **data kuantitatif "berapa persen pemain mengubah default" tidak berhasil diverifikasi** dan tidak boleh dipakai sebagai basis angka. Halaman yang gagal: civilization.fandom.com (402), ck3.paradoxwikis.com/Ironman (404), Wikipedia Age of History 3 (404), Steam store.

## 1. P27 Preset gaya kontrol default

**Temuan terpenting: HoI4 tidak memilihkan lewat setting screen, ia memilihkan lewat insentif ekonomi** dan angkanya terverifikasi:
- **Planning bonus** +2% per hari saat divisi diam di posisi awal offensive plan, **maksimum 30%**, memberi +1% attack dan breakthrough per 1% planning.
- Peluruhan **1% per hari di bawah kendali AI** versus **3% per hari setelah diberi perintah manual**. Override dihukum tiga kali lebih berat tetapi tidak pernah dilarang.
- "Divisions that belong to a battle plan and receive a manual order will **revert back to AI control** after implementing the order." Ini persis pola L1 override di atas L2 yang Nation Rise inginkan, dan **sudah terbukti shippable di game berumur sepuluh tahun**.

Preseden lain: **Stellaris** memakai default per konteks bukan satu preset global (science ship Evasive, transport Passive). **Vic3** tidak menawarkan pilihan gaya kontrol dan Player Objectives bersifat opsional. **Civ VI** lead designer Ed Beach: "a major foundation of the development of Civilization VI was to prevent players from following routines"; penghapusan worker automation [UNVERIFIED]. Total War, Old World, Age of History 3 [UNVERIFIED].

**Argumen struktural (bukan angka):** pilihan di layar setup adalah **pilihan di bawah ketidaktahuan**. Saat pemain pertama membuat kampanye ia belum tahu arti "front order" versus "manual berbantuan" di game ini. Menaruh keputusan arsitektural di titik nol informasi menghasilkan pilihan acak yang lalu terasa mengikat: keputusan buruk yang terasa komitmen.

**Rekomendasi: default Panglima (L2 Front/Theater)**, karena asimetri arah belajar. Bila default L1, pemain membangun kebiasaan micro dalam lima jam pertama sehingga L2 kemudian terasa sebagai **pelepasan kendali**, dan fitur inti mati sebelum dicoba. Bila default L2, L1 selalu satu klik dan terasa sebagai **kekuasaan tambahan**; arah L2 turun ke L1 secara emosional menambah, arah sebaliknya mengurangi.

**Spesifikasi:**
1. **Layar setup tidak menanyakan gaya kontrol sama sekali.** Yang ada hanya negara, skenario, tangga waktu, seed, dan flag integritas.
2. **Toggle permanen di HUD** bernama "Gaya Komando" dengan tiga nilai (Panglima / Komandan Lapangan / Delegasi Penuh), hotkey tunggal, berlaku instan, tanpa restart dan tanpa penalti langsung.
3. **Insentif ala HoI4 dikalibrasi turun:** koordinasi front +2% per hari game hingga **maksimum 25%** (bukan 30, karena Nation Rise punya lapis L3 kartu operasi yang juga memberi bonus dan total stack sebaiknya tidak melewati 40%). Peluruhan **1% per hari** di bawah eksekusi AI, **3% per hari** setelah override manual.
4. **Override L1 tidak pernah diblokir dan tidak pernah membatalkan front**; unit kembali ke kendali front setelah perintah selesai.
5. **Promosi adaptif, bukan interogasi awal:** catat jumlah override per 7 hari game; bila melewati **12 override dalam 7 hari game selama dua periode berturut-turut**, munculkan toast satu baris "Anda banyak memegang kendali langsung. Beralih ke Komandan Lapangan?" dengan Ya / Tidak / Jangan tanya lagi. Ini memindahkan pertanyaan dari titik nol informasi ke titik pemain sudah punya bukti perilakunya sendiri.
6. **Tutorial mengajarkan L2 lebih dulu, L1 kedua.** Urutan tutorial adalah pernyataan desain yang lebih kuat daripada setting default. Misi 1 gambar front dan beri objective lalu lihat AI jalan; Misi 2 satu situasi yang sengaja gagal di bawah AI untuk mengajarkan override; Misi 3 kartu operasi.
7. Bila kelak ada skenario yang hanya masuk akal di satu layer, **preset ditempel ke skenario, bukan ke profil pemain**.

## 2. P30 Ironman

| Game | Bentuk | Detail terverifikasi |
|---|---|---|
| **HoI4** | Opsional, wajib untuk achievement | Autosave saat hampir setiap keputusan; **satu file save**; terenkripsi; mod mematikan ironman; "it is thus impossible to load an earlier save if something goes wrong (**unfortunately, this includes save game corruption**)" |
| **EU4** | Opsional, wajib untuk achievement | Autosave tiap 3 bulan game; **satu save plus satu backup**; biner; console mati; **dilarang melanjutkan setelah layar endgame**; "bugs can ruin an Ironman game, especially ... save game corruption" |
| **XCOM 2** | Opsional | Save ditimpa setiap aksi |
| **RimWorld** | **Dua mode eksplisit** | Commitment mode permadeath tanpa manual save; reload anytime bebas |
| **Stellaris, Vic3** | Game rule | |
| CK3, Darkest Dungeon, FTL | | [UNVERIFIED] |

**Analisis.** Setiap ironman terverifikasi punya dua fungsi yang menempel: pemaksaan konsekuensi **dan verifikasi anti-cheat untuk achievement online**. Fungsi kedua adalah alasan sebenarnya save-nya terenkripsi, biner, single-file, dan checksum-terkunci. **Nation Rise tidak punya fungsi kedua** (offline, pribadi, tanpa achievement), jadi seluruh biaya rekayasa dan risikonya dibayar tanpa manfaat. Risikonya terdokumentasi resmi: wiki EU4 dan HoI4 sama-sama menyebut korupsi save sebagai cara run ironman mati. Lebih jauh, ironman **bertentangan langsung dengan D31** (fork bagaimana jika).

**Rekomendasi: jangan buat ironman. Buat "Segel Kanon" plus Chronicle jujur.** Kuncinya: determinisme wajib (PRNG seeded) membuat kejujuran **bisa diukur**, bukan sekadar dipaksakan. Bila state = f(seed, command log), setiap reload dan divergensi bisa dideteksi dengan presisi. Ini kesempatan yang tidak dimiliki game mana pun di tabel.
1. **Tidak ada mode yang memblokir load.** Save dan load selalu bebas; kerasnya dipindahkan ke pencatatan, bukan pelarangan.
2. **Flag `integritas` per cabang**: `kanon` (nol reload), `terkoreksi` (ada reload, tercatat), `eksperimen` (cabang fork D31, **tidak pernah mempengaruhi status cabang induk**).
3. **Fork adalah operasi berkelas satu, bukan pelanggaran.** Tombol "Cabangkan dari sini" membuat sibling branch berlabel; induknya tetap kanon.
4. **Chronicle mencatat empat angka**: `muat_ulang`, **`hari_game_diulang`** (total tick yang dibuang; metrik jauh lebih jujur daripada jumlah reload karena reload 1 hari tidak sama dengan reload 90 hari), `cabang_dibuat`, `hari_terpanjang_tanpa_muat_ulang`.
5. **Segel Kanon kosmetik dan permanen-lunak**: medali berubah emas ke perunggu saat reload pertama dan mencantumkan angka. Tidak pernah mengunci konten. Hukuman satu-satunya adalah catatan sejarah, yang justru cocok untuk game bertema kronik negara.
6. **Autosave sadar tangga waktu.** Rentang Nation Rise ekstrem: Ambient 60 menit per hari game versus Kilat 1,25 menit, rasio **48 banding 1**. Aturan: `autosave bila (hari_game >= 1) ATAU (menit_nyata >= 5)`, plus autosave berbasis peristiwa (deklarasi perang, front runtuh, proyek akhir selesai, krisis terpicu, pergantian era). **Ring buffer 20 slot rotasi plus 5 slot tonggak yang tidak pernah ditimpa.** Pola EU4 satu save plus satu backup adalah persis kesalahan yang tidak boleh ditiru.
7. **Jangan pernah pakai file save tunggal.**
8. **Simpan `seed` plus command log di samping snapshot** (snapshot tiap 500 tick plus delta). Satu implementasi memberi tiga hal: fork murah (potong log di tick T), replay dan deteksi desync untuk debugging determinisme, dan penghitungan `hari_game_diulang` gratis.

## 3. D28 Mode lanjutan setelah menang

| Game | Perlakuan | Detail terverifikasi |
|---|---|---|
| **Stellaris** | **Victory Year bisa dimatikan; kemenangan tidak menghentikan game** | "Players may continue playing normally after an empire declares victory"; skor +10 per sistem, +50 koloni, +2 pop, subject 50%, federasi 10% |
| **Stellaris** | **Krisis menunda akhir game** | "Having a crisis active in the galaxy will **stop the game from ending**, even if the Victory Year has been reached" |
| **Stellaris** | Skala krisis berjenjang | 4 krisis; pengecekan spawn **tiap 5 tahun**; tiap krisis berikutnya **2 kali lebih kuat**; mengalahkan krisis dengan cepat menghadapi scaling lebih besar |
| **EU4** | Kebalikan | Di ironman "continuing after the endgame screen is prohibited" |
| **Civ** | "One more turn" adalah identitas seri | Mekanismenya: gameplay terus menyodorkan tujuan dan hadiah yang akan datang |
| **RimWorld** | Difficulty adaptif | AI Storyteller membaca keadaan pemain untuk memilih event; tiga profil kurva tensi |
| **Terra Invicta** | Win condition asimetris per faksi | 7 faksi dengan kondisi menang berbeda |

**Pola yang menahan pemain**: bukan konten baru yang mahal, melainkan **progress bar yang masih bergerak** (Stellaris skor yang terus naik, Civ antrean hadiah yang belum selesai) ditambah **ancaman yang tidak habis**.

**Struktur tiga tahap untuk Nation Rise:**
1. **Hegemoni tercapai** (ambang VP atau kontrol persentase populasi dunia): **layar Warisan non-modal** dengan statistik kampanye, medali Segel Kanon, dan kurva sejarah. Tombolnya "Lanjutkan", bukan "Keluar". Tanpa kredit, tanpa penguncian.
2. **Era Pascahegemoni** terbuka: Proyek Akhir tersedia, meteran Tekanan Dunia aktif.
3. **Tidak ada akhir** kecuali pemain menekan "Tutup Kronik" secara sadar.
**Adopsi dari Stellaris:** selama krisis endgame aktif, **layar Warisan ditunda**, agar kemenangan tidak datang di momen antiklimaks.

**Dua belas Proyek Akhir** (durasi hari game, biaya Poin Industri; rentang 60 sampai 300 hari dipilih karena di Kilat menjadi 75 menit sampai 6,25 jam nyata dan di Ambient menjadi 60 sampai 300 jam, sehingga satu set angka melayani kedua ujung):
| # | Proyek | Hari | IP | Efek | Tekanan |
|---|---|---|---|---|---|
| 1 | **Program Antariksa** 4 tahap (Satelit LEO, Stasiun Orbit, Pangkalan Bulan, Lift Antariksa) | 40/60/70/90 | 8k/18k/30k/60k | Tahap 1 fog of war global hilang; 2 riset −15%; 3 tambah slot proyek paralel; 4 biaya proyek berikutnya −30% | +3 per tahap |
| 2 | Reaktor Fusi Nasional | 120 | 35k | Output energi +40%; membuka 3, 5, 9 | +2 |
| 3 | Rudal Hipersonik Glide | 70 | 22k | Tidak bisa dicegat SAM di bawah tier 4; respons kartu operasi −20% | +6 |
| 4 | Kapal Induk Kelas Baru | 150 | 48k | Radius proyeksi udara laut +600 km; front laut tanpa pangkalan darat | +5 |
| 5 | Kubah Pertahanan Rudal | 180 | 65k | Intercept 60% rudal balistik | **+12** |
| 6 | Megapolis Terencana | 200 | 55k | 4 provinsi menjadi 1 metropol, populasi +60%, riset +25%; menjadi target prioritas AI | +2 |
| 7 | Proyek Rekayasa Bumi (kanal, irigasi gurun, jembatan selat) | 90 sampai 140 | 20k sampai 38k | **Mengubah atribut terrain permanen**, kecepatan front berubah, jalur laut baru | +1 |
| 8 | Superkomputer Strategis | 100 | 30k | **Meng-upgrade AI L4**: front terdelegasi memakai heuristik lanjutan | +2 |
| 9 | Armada Drone Otonom | 80 | 26k | Front bisa ditahan dengan manpower −40% | +7, membuka event Kegagalan Kendali |
| 10 | Triad Nuklir Lanjutan | 130 | 58k | Deterrence: AI menolak menyerang inti kecuali Tekanan di atas 75 | **+15** |
| 11 | Monumen Nasional / Arsip Peradaban | 60 | 12k | Stabilitas +10 permanen, bab khusus Chronicle | **−5** (satu-satunya yang menurunkan) |
| 12 | Misi Antarplanet Berawak | 300 | 90k | Bab penutup Chronicle, **tanpa keunggulan militer** | +4 |
Opsional tambahan: Jaringan Rel Maglev Kontinental, 110 hari, 28k IP, logistik dan pergerakan front +25%, +1 tekanan.
Dua catatan desain: **proyek 8 meng-upgrade sistem kontrol itu sendiri**, menyambungkan endgame ke P27 karena pemain yang sudah menang mendapat alasan mekanis untuk akhirnya mempercayai Delegasi Penuh. **Proyek 11 satu-satunya yang menurunkan Tekanan**, menciptakan pilihan nyata antara membangun senjata (dunia melawan) dan membangun warisan (dunia tenang), dengan proyek 12 sebagai jalur menang secara moral.

**Mekanik Tekanan Dunia** (meteran 0 sampai 100, **terlihat pemain**, karena transparansi lebih baik daripada kejutan di game deterministik):
```
Tekanan = share_populasi_dunia × 35 + share_industri_dunia × 30
        + provinsi_taklukan_belum_terintegrasi × 0,4 + Σ tekanan_proyek
        − (stabilitas_rata2 − 60) × 0,3
```
| Tekanan | Peristiwa | Implementasi |
|---|---|---|
| 40 | Koalisi Diplomatik: embargo, impor −20%, pendapatan dagang −15% | Modifier ekonomi + sikap AI |
| 60 | Koalisi Militer: 3 sampai 6 AI bersatu, front baru di dua arah | Spawn army group + objective, memakai sistem L2 yang ada |
| 75 | Pemberontakan Interior: partisan di provinsi taklukan, suplai −25% | Spawn unit irregular + modifier |
| 85 | Krisis Eksistensial: satu kartu ditarik | Deck 5 kartu, tiap kartu script pendek |
**Deck Krisis Eksistensial:** Pertukaran Nuklir Terbatas; Wabah Global; Keruntuhan Ekonomi Dunia (termasuk milik pemain); **Kudeta Militer** (front terdelegasi L4 berhenti mematuhi selama N hari, satu-satunya krisis yang menyerang **sistem kontrol** alih-alih peta, dan hanya mungkin ada di game berarsitektur berlapis); **Pemberontakan Otonom** (hanya terbuka bila proyek 9 dibangun).
**Scaling:** pengganda **1,75 kali** per krisis berikutnya (lebih landai dari 2 kali Stellaris karena Nation Rise punya satu peta Bumi tanpa ruang mundur), pengecekan spawn **tiap 90 hari game**, krisis yang dikalahkan dalam kurang dari 45 hari memberi bonus scaling +25% untuk berikutnya.
**Determinisme:** seluruh pemilihan krisis dari PRNG ber-seed dengan stream terpisah `crisis_stream`, sehingga fork D31 dari tick yang sama menghasilkan krisis identik dan pemain bisa mencoba dua strategi melawan krisis yang sama. Ini menjadikan fork sebagai **fitur endgame**, bukan sekadar utilitas save.

## Sumber
hoi4.paradoxwikis.com (Battle_plan, Ironman, Hearts_of_Iron_IV) · eu4.paradoxwikis.com/Ironman · stellaris.paradoxwikis.com (Crisis, Victory, Fleet) · vic3.paradoxwikis.com · Wikipedia (Civilization_VI, Civilization_series, XCOM_2, RimWorld, Darkest_Dungeon, Terra_Invicta, Old_World, Total_War_series)
