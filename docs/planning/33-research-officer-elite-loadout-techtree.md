# Riset Officer, Seasons dan Elite, Loadout, serta Struktur Pohon Teknologi

> Sesi 5 (2026-09-05), dijalankan lewat subagen sesuai aturan 9. Penanda: **[V]** terverifikasi dengan URL, **[UNV]** tidak terverifikasi, **[ANALISIS]** penilaian desain.

## 0. Keterbatasan sumber yang membentuk laporan ini

Wiki Conflict of Nations **sangat tertinggal**. Halaman Seasons berhenti di Season 11 (Desember 2023). Halaman Officers masih memakai skema lama. Halaman Research, Deployable, Combat, dan Security Council adalah stub. Seluruh halaman officer per tipe mengembalikan 404, sehingga **tidak ada satu pun angka bonus officer yang bisa diverifikasi**. Semua Fandom mengembalikan 402.

Konsekuensinya: **sistem Officer berrarity, rename ke Veteran, tombol Loadout, consumables, dan tab riset keduabelas tidak terdokumentasi di sumber publik mana pun.** Semuanya bersandar pada observasi dalam game yang tercatat di dokumen kita. Kalau Billy punya tangkapan layar dengan angka bonus officer atau efek node riset Items, itu satu-satunya sumber yang ada dan sebaiknya dicatat sendiri, karena wiki tidak akan mengejar.

---

## 1. Officer di Conflict of Nations

### 1.1 Yang terverifikasi

| Pertanyaan | Jawaban | Status |
|---|---|---|
| Unit terpisah atau modifier? | **Keduanya sekaligus.** Officer adalah unit khusus yang memberi bonus kepada unit lain **dalam tumpukan yang sama, termasuk dirinya sendiri**. Jadi ia entitas fisik yang berfungsi sebagai aura | [V] |
| Berapa aktif sekaligus? | **Maksimum satu officer aktif per tipe.** Tujuh tipe, sehingga maksimum tujuh aktif secara global | [V] |
| Kalau gugur? | Boleh **dikerahkan ulang** | [V] |
| Menumpuk? | Bonus **akumulatif** bila dua atau lebih officer di tumpukan yang sama, tetapi tiap officer hanya memengaruhi kelas unitnya sendiri | [V] |
| Progresi | Officer punya tier dan peningkatan seperti unit lain, statistik dan bonusnya naik tiap peningkatan riset | [V] |
| Kemampuan baru | Airborne Officer bisa memperoleh **Stealth** dan bertransisi menjadi unit pasukan khusus | [V] |
| Gerbang doktrin | Doktrin pemain menentukan officer mana yang tersedia dan kapan bisa diriset | [V] |
| Angka bonus persis | **Wiki tidak memuat satu pun tabel angka** | [V, dinyatakan tidak ada] |
| Syarat pangkat pemain | **Wiki tidak menyebut sama sekali** | [V, dinyatakan tidak ada] |
| Biaya dan waktu mobilisasi | **Wiki tidak menyebut** | [V, dinyatakan tidak ada] |
| Rarity | **Tidak ada di wiki** | [V, dinyatakan tidak ada] |

### 1.2 Tujuh tipe dan koreksi nama

Nama resmi wiki berbeda dari catatan kita pada dua entri.

| Nama di wiki [V] | Nama di catatan kita | Gerbang Recruiting Office [V] |
|---|---|---|
| Infantry Officer, alias **Seasoned Veteran** | Infantry | Level 1 |
| Rotary Wing Officer | Rotary | Level 1 |
| Naval Officer | Naval | Level 1 |
| Airborne Officer | Airborne | Level 2 |
| **Tank Commander**, bukan Tank Officer | Tank | Level 2 |
| Fixed Wing Officer | Fixed Wing | Level 2 |
| **Submarine Commander**, bukan Submarine Officer | Submarine | Level 2 |

Prasyarat Infantry Officer adalah Army Base level 1 dan Recruiting Office level 1.

**Kontradiksi internal wiki:** halaman yang sama juga menyatakan Recruiting Office level 5 diperlukan untuk memobilisasi setiap unit infanteri selain Motorized, **setiap officer**, dan Elite Main Battle Tank. Ini bertentangan dengan tabel level 1 dan 2 di halaman yang sama. Dugaan paling masuk akal: level 1 dan 2 adalah gerbang riset, level 5 adalah syarat mobilisasi tier tinggi. Tidak terverifikasi.

### 1.3 Recruiting Office lengkap [V]

| Level | Waktu bangun | HP | Personel | Kecepatan mobilisasi | Upkeep harian |
|---|---|---|---|---|---|
| 1 | 30 menit | 10 | +5% | +10% | 100 dana |
| 2 | 26 jam | 15 | +10% | +25% | 110 dana |
| 3 | 28 jam | 20 | +15% | +45% | 120 dana |
| 4 | 30 jam | 25 | +20% | +70% | 130 dana |
| 5 | 32 jam | 30 | +25% | +100% | 140 dana |

Biaya level 1 adalah 250 pasokan, 250 komponen, 250 bahan bakar, 250 elektronik, dan 1.350 dana. Level 5 menjadi 2.500 / 1.500 / 1.250 / 1.250 dan 6.750 dana.

### 1.4 Officer versus Veteran setelah penggantian nama [UNV]

Wiki belum tahu penggantian nama ini terjadi. Rekonstruksi paling masuk akal, disandarkan pada spanduk dalam game dan pada fakta bahwa halaman Infantry Officer sudah menyebut nama alternatif Seasoned Veteran:

| Aspek | Veteran, sistem lama yang diganti namanya | Officer, sistem baru berrarity |
|---|---|---|
| Bentuk | **Unit fisik** yang dimobilisasi, punya HP, bisa gugur | **Kartu atau profil** yang ditugaskan, kemungkinan bukan entitas di peta |
| Lokasi antarmuka | Dipindah ke tab tipe masing-masing | Tab Officers tersendiri |
| Rarity | Tidak ada | Uncommon, Rare, Epic, Legendary |
| Penamaan | Generik per tipe | Bernama lengkap dengan nama panggilan |
| Granularitas | Tujuh tipe kasar | Lebih halus |

Poin terakhir penting. Nama-nama yang tercatat di dokumen kita memetakan ke **kategori yang lebih sempit dari tujuh tipe lama**. Airstrike, Cruiser, dan Anti-Air bukan salah satu dari tujuh tipe officer lama. Ini indikasi kuat bahwa sistem baru **memecah tujuh slot menjadi sekitar belasan slot per peran**, dan rarity dipakai sebagai sumbu monetisasi.

### 1.5 Kurva pangkat pemain [V]

Tabel pangkat mencakup 220 level dari Recruit di 0 XP sampai Commander-in-Chief di 981.250 XP. Bentuk kurvanya **super-linear tetapi tidak eksponensial**. Selisih antar tingkat naik dari 50, ke 150, ke 400, ke 650, ke 1.500, sampai 110.000.

Ini kurva grind seumur hidup khas layanan langsung. **Untuk game luring, kurva ini terlalu panjang dan tidak relevan.**

---

## 2. Seasons dan Elite

### 2.1 Struktur akses dua kunci [V]

Kutipan langsung: untuk mempertahankan kemampuan memobilisasi unit setelah musim berakhir, pemain harus mengumpulkan Season Points yang cukup **dan** memiliki keanggotaan Security Council yang aktif.

Artinya: **selama musim berjalan, siapa pun boleh memobilisasi unit musim tanpa perlu membuka kunci maupun Security Council.** Setelah musim berakhir, butuh keduanya. Ini desain uji coba gratis lalu tembok bayar yang klasik. Season Points bukan mata uang beli, melainkan **syarat kelayakan**, dan tembok bayar sebenarnya ada di Security Council.

### 2.2 Cara memperoleh Season Points [V]

Poin diperoleh dari **menghancurkan unit AI maupun unit pemain lain di permainan mana pun, termasuk permainan yang dimulai sebelum musim itu**. Unit elite dan officer memberi lebih banyak poin. **Tiap pembunuhan tidak selalu memberi hanya satu poin.**

Tiga hal pasti: sumbernya pembunuhan bukan sasaran objektif, berlaku lintas pertandingan, dan nilai per pembunuhan bervariasi.

Klaim tiga poin per pembunuhan pemberontak di catatan kita **tidak terverifikasi**. Wiki tidak memuat satu pun tabel nilai poin per unit.

### 2.3 Sebelas musim terdokumentasi [V]

| Musim | Periode | Unit baru | Biaya poin | Unit lama yang dikembalikan |
|---|---|---|---|---|
| 1 | 13 Agustus – 1 November 2019 | Elite Main Battle Tank | — | — |
| 2 | berakhir 28 Januari 2020 | Elite Attack Helicopter | — | — |
| 3 | mulai 5 Februari 2020 | Elite AIP Submarine | 2.000 | Elite MBT seharga 1.000 |
| 4 | — | Elite Railgun | 2.000 | Elite Attack Helicopter seharga 1.000 |
| 5 | — | Elite Bomber | 2.000 | Elite AIP Submarine seharga 1.000 |
| 6 | — | Elite UGV | 2.000 | Elite Railgun seharga 1.000 |
| 7 | — | Elite Loitering Munitions | 2.000 | Elite Bomber seharga 1.000 |
| 8 | — | Elite Attack Aircraft | 2.000 | Elite UGV seharga 1.000 |
| 9 | berakhir 18 April 2023 | Elite Frigate | 1.500 | Loitering Munitions 500, Elite MBT 2.500 |
| 10 | berakhir 14 Agustus 2023 | **tidak ada** | — | Attack Helicopter 500, AIP Submarine 1.500, Railgun 2.500 |
| 11 | berakhir 4 Desember 2023 | **tidak ada** | — | Bomber 1.000, Attack Aircraft 2.500 |

Pemenang tertinggi: Musim 1 mencapai 63.422 poin, Musim 2 mencapai 51.194 poin. Hadiahnya tiga bulan Security Council.

**Dua pola desain yang terbaca jelas.** Pertama, **pengulangan berjenjang**: unit yang pertama kali muncul dijual 2.000 poin, dikembalikan setahun kemudian seharga 1.000, lalu naik ke 2.500 di musim 9 sampai 11. Harga naik untuk unit lama adalah tekanan ketakutan ketinggalan yang dibalik. Kedua, **musim 10 dan 11 tidak punya unit baru sama sekali**, sehingga musim berubah menjadi toko unit lama. Ini gejala kelelahan model layanan langsung di game aslinya.

### 2.4 Daftar Elite: wiki versus observasi

Wiki mendokumentasikan **sembilan** unit elite: Main Battle Tank Black Night MK2, Attack Helicopter S-97 Raider, AIP Submarine Scorpene CA-2000, Railgun Lance MK1, Bomber Avro Vulcan, UGV, Loitering Munitions MQM-1A RAPAZ, Attack Aircraft EMB 314, dan Frigate Aquitaine.

Catatan kita mengamati sekitar **lima belas**, termasuk Elite Satellite, Drone Operator, Elite AFV Patria AMV, Elite Drone Mothership Rouge Gale, Elite Cruiser, dan Elite Special Forces. Enam yang terakhir berasal dari musim 12 dan seterusnya yang tidak pernah tercatat di wiki.

**Tidak ada satu pun blok statistik unit elite di wiki.** Halaman Elite Railgun adalah stub tanpa angka, hanya menyebut bahwa ia menembus unit berlapis baja apa pun dan mencapai kecepatan proyektil hingga tujuh kali kecepatan suara.

### 2.5 Security Council [V sebagian]

Halaman utamanya praktis kosong, berisi teks pengisi. Yang bisa dipanen dari halaman lain: dulu 4,79 euro per bulan, kini 9,95 dolar untuk tiga bulan; biaya dipotong sekitar sepertiga pada 13 Agustus 2019; **diperlukan untuk membuat aliansi**; dan diperlukan untuk mempertahankan unit musim setelah musim berakhir. Daftar manfaat lain tidak terdokumentasi.

**Kesimpulan untuk Nation Rise:** Security Council adalah langganan premium, dan Season Points adalah gerbang grind yang menempel padanya. Keduanya tidak punya alasan eksistensi di game luring tanpa monetisasi. **Mengadopsi Season Points tanpa Security Council berarti mengambil grindnya tanpa mengambil alasan grind itu ada.**

---

## 3. Loadout dan deployables

### 3.1 Yang terverifikasi, sangat sedikit

Halaman Deployable adalah stub dengan satu kalimat definisi: deployables adalah unit yang dikerahkan oleh unit berkemampuan kerah menggunakan **Deployable Gear**. Contoh yang disebut adalah Elite Loitering Munitions dan Elite UGV. Halaman eksplisit membedakannya dari pengerahan lewat pesawat angkut.

**Itu seluruh dokumentasi loadout yang ada.** Tidak ada kapasitas, tidak ada waktu isi ulang, tidak ada daftar barang konsumsi.

### 3.2 Yang hanya dari observasi [UNV]

Tombol Loadout pada unit yang membuka panel pemuatan; Deployable Gear dalam tiga tingkat 20, 30, dan 40; Pharmaceuticals 20; Ground, Sea, dan Air Munition masing-masing 20; bar stockpile kedua di HUD; waktu isi ulang enam sampai delapan jam; SUAV sebagai deployable; dan tab riset keduabelas berisi Medical Care, Engineering Teams, Crew Training, dan Heavy Loadouts.

Satu dukungan tidak langsung yang ditemukan: wiki hanya mencantumkan **sebelas kategori unit** (Infantry, Armored, Support, Helicopters, Fighters, Heavies, Ships, Submarines, Missiles, Officers, Seasons), persis konsisten dengan klaim bahwa **Items adalah tab keduabelas yang baru ditambahkan**.

### 3.3 Variabel yang menjadi sasaran item [V]

Penyembuhan: unit darat di kota tanpa rumah sakit pulih 1 HP per hari; unit darat di provinsi dengan rumah sakit lapangan 1 HP per hari; **unit laut di perairan pesisir 2 HP per hari**; Military Hospital menambah 1 HP per hari per level sehingga level 5 memberi 5 HP per hari. Medical Care dan Pharmaceuticals hampir pasti menyerang variabel ini.

Riset: maksimum dua paralel; biaya berupa pasokan, material langka, dan dana; bisa dipercepat dengan gold maksimum dua belas jam sekali klik; dan **peningkatan bersifat retroaktif** karena semua unit baru dan yang sudah ada dari tipe yang sama ditingkatkan otomatis.

Poin terakhir sangat penting untuk Nation Rise: **Conflict of Nations tidak punya masalah unit lama menjadi usang.** Satu aturan menghilangkan seluruh kelas frustrasi armada ketinggalan zaman.

Damage Distribution Weight didefinisikan sebagai konstanta yang diterapkan ke tiap tipe unit dalam pasukan untuk memodifikasi kerusakan yang diterima. Tabel nilainya tidak ada di wiki. Ini variabel yang jelas menjadi sasaran Engineering Teams.

---

## 4. Pembanding sistem komandan lintas game

### 4.1 Tabel induk

| Game | Aktif sekaligus | Atribut | Cara naik | Bisa gugur | Rem anti-dominasi |
|---|---|---|---|---|---|
| Hearts of Iron IV | Jenderal satu per pasukan, efektif hingga **24 divisi**; Field Marshal lima pasukan | Serang, tahan, perencanaan, logistik | XP tempur menuju ambang trait | **Tidak**, kecuali peristiwa khusus | Soft cap, tenaga komando naik, XP trait menyusut |
| Europa Universalis IV | Bergantung batas kekuatan, satu gratis | Api, guncangan, manuver, pengepungan, skala 0 sampai 6 | Rekrut 50 poin penguasa, pip **acak** | **Ya**, acak bulanan | Pip dibatasi 6, upkeep, mortalitas |
| Crusader Kings III ksatria | Count 5 sampai Emperor 8 | Prowess | Karakter di wilayah | **Ya**, 5 persen gugur, 10 persen ditawan | Batas keras per pangkat, risiko kematian permanen |
| Crusader Kings III komandan | Satu per pasukan | Martial menuju Advantage | Menunjuk karakter | **Ya**, luka, cacat, gugur, ditawan | Satu per pasukan, 5 persen kerusakan per Advantage |
| Stellaris | Batas tiga per kelas | Skill 1 sampai 10 plus trait | Rekrut dengan Unity, lalu XP | **Ya**, umur dasar 80 tahun | Batas, upkeep proporsional, XP dikali 0,85 pangkat n |
| Total War Three Kingdoms | **Tiga di medan dan tiga cadangan** | Kelas dengan bonus pasif dan aktif | Rekrut | **Ya**, duel sampai gugur atau kabur | Slot tiga tambah tiga, risiko duel |
| XCOM | Regu satu sampai enam | Pangkat dan pilihan perk | Promosi per misi | **Ya, kematian permanen** | Kematian permanen dan waktu pemulihan luka |
| Wargame Red Dragon | Unit komando, jumlah dari dek | **Tidak ada pahlawan bernama** | Menyusun dek sebelum pertandingan | Ya, kehilangan semua unit komando berarti tidak bisa memperkuat | Poin pengerahan dan kontrol zona |
| Steel Division | Kelompok tempur tanpa pahlawan | — | Memilih unit sebelum pertandingan | — | **Sistem tiga fase** |

### 4.2 Angka penting

**Hearts of Iron IV [V].** Serang, tahan, dan logistik masing-masing memberi **2,5 persen per level**; perencanaan memberi 5 persen kecepatan perencanaan dan 2 persen perencanaan maksimum. Di atas 24 divisi, bonus dan perolehan XP **berkurang secara proporsional**, jadi soft cap bukan tembok. Mode garnisun mengalikan batas tiga kali menjadi 72 divisi. Field Marshal memberi pasukan bawahan dengan penalti 50 persen. Jenderal baru punya peluang 95 persen mulai di skill 1 dan 5 persen di skill 2. Trait medan memberi **10 persen serang, 10 persen tahan, dan 5 persen gerak** di medannya seharga 700 XP. Rentang ambang seluruh trait adalah 100 sampai 2.000 XP. Biaya rekrut adalah 5 tenaga komando per jenderal yang sudah dimiliki, maksimum 80.

**Rem terpenting, dikutip langsung:** untuk setiap trait yang sudah diperoleh seorang jenderal, laju perolehan semua trait lain berkurang. Setengah kecepatan dengan satu trait selesai, sepertiga dengan dua trait, dan seterusnya.

**Europa Universalis IV [V].** Pip berskala 0 sampai 6. Rekrut 50 poin penguasa, dengan diskon 50 persen pada profesionalisme pasukan penuh. Manuver memberi 5 persen gerak per pip hingga maksimum 30 persen. Pengepungan memberi satu lemparan tambahan per pip. Kelebihan pemimpin memakan satu poin penguasa per bulan.

Mortalitasnya elegan. Peluang harian menghasilkan sekitar **2 persen per tahun kalau menganggur, 3,9 persen kalau ditugaskan, dan 13,1 persen kalau bertempur**, dengan rata-rata masa pakai 20,4 tahun. **Risiko kehilangan berkorelasi dengan seberapa agresif pemakaiannya.** Jenderal sempurna tidak dilarang, tetapi memakainya di garis depan mengalikan peluang kehilangan sekitar 6,5 kali.

**Crusader Kings III [V].** Batas ksatria dari Count 5 sampai Emperor 8. Tiap poin Prowess memberi 50 kerusakan dan 10 ketangguhan, sehingga satu ksatria dengan prowess 10 memberi kerusakan setara **lima puluh prajurit wajib**. Kalah perang membuat tiap ksatria berpeluang 10 persen ditawan dan 5 persen gugur; kalah di fase awal menaikkannya menjadi 55,3 dan 27,6 persen.

**Stellaris [V].** Skill 1 sampai 10 dengan batas tiga per kelas. Di atas batas, upkeep naik proporsional dan XP dikali **0,85 pangkat jumlah kelebihan**. Biaya rekrut Unity level satu sampai sepuluh adalah 100, 170, 350, 625, 1.000, 1.475, 2.050, 2.725, 3.500, dan 4.500, sehingga naik sekitar 45 kali. Bonus komandan adalah 5 persen kerusakan senjata kapal, 5 persen laju tembak, dan 5 persen peluang melepaskan diri.

**Wargame dan Steel Division [V].** Keduanya **menolak sistem pahlawan sepenuhnya**. Wargame memakai unit komando fungsional; Steel Division memakai tiga fase di mana unit kuat baru muncul setelah titik tertentu. Ini bukti bahwa kedalaman taktis tidak memerlukan komandan bernama sama sekali.

### 4.3 Lima keluarga rem anti-penentu-tunggal

| Mekanisme | Contoh terverifikasi | Cocok untuk Nation Rise |
|---|---|---|
| **Soft cap kapasitas** dengan bonus diskalakan turun | Hearts of Iron IV di atas 24 divisi | **Ya, paling cocok.** Tidak terasa menghukum tetapi menghentikan tumpukan maut |
| **Batas keras slot** | Ksatria Crusader Kings 5 sampai 8, Total War tiga tambah tiga, pip Europa Universalis dibatasi 6 | Ya, untuk jumlah komandan aktif |
| **Biaya marjinal naik** | Hearts of Iron 5 tenaga komando per jenderal, Stellaris 100 sampai 4.500 Unity | Ya, tetapi jangan super-linear ekstrem di permainan pendek |
| **Hasil menyusut pada progresi** | Hearts of Iron setengah lalu sepertiga, Stellaris 0,85 pangkat n | **Ya, wajib.** Ini yang mencegah satu komandan menjadi dewa |
| **Mortalitas berkorelasi penggunaan** | Europa Universalis 2 lalu 3,9 lalu 13,1 persen per tahun | Hati-hati. Di permainan luring tanpa penalti sosial, kehilangan permanen hanya memancing muat ulang |

**Dua kutub desain.** Hearts of Iron, Europa Universalis, dan Stellaris mengizinkan komandan kuat lalu mengerem di kapasitas, biaya, dan laju pertumbuhan. Crusader Kings dan XCOM mengerem di risiko kehilangan permanen. **Untuk permainan luring pemain tunggal, kutub pertama jauh lebih sehat**, karena kematian permanen tanpa lawan manusia hanya menghasilkan muat ulang.

---

## 5. Struktur pohon teknologi lintas game

### 5.1 Cabang dan jumlah node [V]

| Game | Cabang | Node |
|---|---|---|
| Hearts of Iron IV | **Sepuluh folder** | tidak dinyatakan |
| Hearts of Iron IV doktrin darat | **Empat Grand Doctrine** dan empat jalur | **32 subdoktrin**, tiap subdoktrin lima level penguasaan pada 100 sampai 500 kumulatif |
| Europa Universalis IV teknologi | **Tiga**, administratif, diplomatik, militer | Level 0 sampai 32 per kategori |
| Europa Universalis IV idea groups | **25 grup**, tujuh administratif, tujuh diplomatik, sebelas militer | Tujuh ide per grup; pemain memakai **maksimum delapan grup** |
| Victoria 3 | **Tiga**, produksi, militer, masyarakat | **177 teknologi**, plus satu eksklusif |
| Stellaris | **Tiga**, fisika, masyarakat, teknik | **Enam tier** |
| Conflict of Nations | Riset **per unit**, dibagi tiga doktrin | Per unit tiga tier, tiap tier satu node pembuka dan satu sampai dua peningkatan bernama |

### 5.2 Mekanisme gating [V]

**Hearts of Iron IV** memakai tahun ditambah prasyarat ditambah slot. Biaya dasar 110 hari dengan deret 55, 82, 110, 137, 165, 192, 220, 275, 330, dan 550 hari. **Setiap tahun mendahului waktu menambah penalti 200 persen**, sehingga tepat satu tahun lebih awal membuat kecepatan menjadi sepertiga. Lantai kecepatan riset 10 persen. Slot dua secara bawaan, tiga untuk kebanyakan Eropa, maksimum enam.

**Europa Universalis IV** memakai tahun, poin penguasa, dan institusi. Biaya dasar 600 poin. Mendahului waktu menambah 10 persen per tahun. Kenaikan berbasis tanggal bergerak dari nol persen pada 1444 ke 30 persen pada 1821. Institusi yang belum dianut menambah 15, 30, atau 50 persen, dan bisa mencapai 400 persen pada 1821.

**Victoria 3** memakai era dan prasyarat. Biaya per era adalah 7.500, 10.000, 12.500, 15.000, dan 17.500. Rumusnya menambahkan jumlah teknologi yang belum diriset dikali selisih era dikali 0,25 dikali biaya era. **Tidak ada penalti tahun**, tetapi ada penalti melompat era sambil meninggalkan teknologi lama.

**Stellaris** memakai kartu acak, tier, dan bobot. Tiga alternatif riset per area. Enam tier, dan membuka tier berikutnya butuh enam teknologi dari tier sebelumnya. Teknologi yang pernah muncul mendapat bobot dibagi dua pada undian berikutnya. Teknologi langka berbobot sekitar seperdelapan.

**Conflict of Nations** memakai **hari kalender dalam game** ditambah level bangunan. Contoh terverifikasi: Motorized Infantry Eastern membuka tier 1 di hari 1, peningkatan mesin di hari 4, rudal panggul di hari 6, tier 3 di hari 20, dan pelindung pribadi di hari 24. Versi Eropa bergeser ke hari 1, 4, 7, tier 2 di hari 12, peningkatan mesin kedua di hari 16, tier 3 di hari 22, dan pelindung pribadi di hari 26. Special Forces membuka tier 1 di hari 5, pertahanan udara panggul di hari 8, tier 2 di hari 15, pelatihan amfibi di hari 20, dan tier 3 di hari 27.

### 5.3 Eksklusivitas pilihan [V]

Teknologi biasa Hearts of Iron IV **tidak eksklusif**; yang eksklusif adalah cabang fokus nasional. **Doktrin darat sangat eksklusif**: hanya satu Grand Doctrine bisa aktif, dan berganti Grand Doctrine **menghapus seluruh penguasaan di folder darat**. Hanya satu subdoktrin bisa aktif per jalur.

Teknologi Europa Universalis tidak eksklusif. **Idea groups eksklusif dengan pintu keluar mahal**: maksimum delapan dari 25, dan meninggalkan satu grup hanya mengembalikan 10 persen poin penguasa.

Teknologi Victoria 3 tidak eksklusif, tetapi **metode produksi eksklusif dan bisa dibalik**, karena tiap grup selalu punya satu metode aktif per bangunan.

Stellaris tidak eksklusif tetapi **stokastik**, karena teknologi akan muncul lagi lewat probabilitas setelah cukup banyak undian baru.

Conflict of Nations **eksklusif lewat doktrin** yang dipilih di awal dan permanen. Buktinya adalah pergeseran hari unlock tier 3 Motorized, hari 20 untuk Eastern versus hari 22 untuk Eropa.

### 5.4 Penilaian tiga sumbu [ANALISIS]

| Game | Rasa berkembang | Pilihan bermakna | Risiko bosan | Alasan |
|---|---|---|---|---|
| Hearts of Iron teknologi | 4 | 2 | 3 | Penalti 200 persen per tahun membuat mendahului waktu menjadi keputusan ekonomi nyata, tetapi tanpa eksklusivitas keputusannya hanya urutan, bukan pengorbanan |
| **Hearts of Iron doktrin darat** | **5** | **5** | **1** | Struktur paling tajam di seluruh sampel. Empat doktrin eksklusif, dan berganti menghapus semua penguasaan. Biaya penyesalan tinggi berarti pilihan berbobot |
| Europa Universalis teknologi | 2 | 1 | **5** | Tiga kolom kali 33 level tanpa percabangan. Yang berubah hanya kapan diklik. Sengaja hambar |
| **Europa Universalis idea groups** | 4 | **5** | 2 | Delapan dari 25, slot dibuka bertahap sepanjang kampanye sehingga keputusan tersebar, bukan menumpuk di awal. **Templat terkuat untuk pilihan bermakna** |
| Victoria 3 teknologi | 3 | 2 | 3 | 177 teknologi terasa masif tetapi tanpa eksklusivitas menjadi daftar centang. Formula selisih era 0,25 cerdas karena menghukum lompatan tanpa melarangnya |
| **Victoria 3 metode produksi** | 4 | 4 | 2 | Inovasi terpenting: teknologi bukan hadiah langsung melainkan **membuka opsi** yang dipilih per bangunan, dan bisa dibalik sehingga pemain bereksperimen |
| Stellaris | 4 | 3 | 2 | Kartu acak memberi narasi tak terduga, tetapi pilihan bermaknanya sebagian palsu karena yang memilih adalah keacakan |
| Conflict of Nations | 3 | 3 | 3 | Gating hari kalender memberi progres merata dan tidak bisa dipacu, tetapi datar karena pemain tahu persis kapan tier 3 datang |

**Lima pola yang bisa dipindahkan.** Pertama, **pisahkan tangga dari percabangan**; Europa Universalis dan Hearts of Iron sama-sama melakukannya, dan menggabung keduanya menghasilkan pohon yang tidak tegas. Kedua, tiga jenis gating terbukti bekerja, dan gating hari kalender **menghapus keputusan tempo**. Ketiga, **reversibilitas menentukan berat pilihan**, dengan skala dari metode produksi Victoria yang gratis, ke idea group yang mengembalikan 10 persen, ke Grand Doctrine yang menghanguskan semuanya. Keempat, randomisasi menaikkan replayability tetapi menurunkan agensi. Kelima, **riset yang membuka opsi lebih baik daripada riset yang memberi bonus**.

---

## 6. Usulan untuk Nation Rise [ANALISIS]

### 6.1 Sistem Commander non-premium

Rarity dibuang sepenuhnya. Rarity adalah artefak monetisasi gacha; di permainan luring ia hanya menghasilkan keacakan tanpa taruhan.

| Parameter | Usulan | Alasan |
|---|---|---|
| Jumlah aktif | **Empat slot**: Darat, Udara, Laut, Dukungan | Tujuh slot Conflict of Nations terlalu banyak; Total War memakai tiga tambah tiga, Stellaris membatasi tiga per kelas |
| Bentuk | **Modifier yang ditempelkan ke tumpukan**, bukan unit fisik | Unit fisik menambah mikromanajemen tanpa keputusan |
| Kapasitas | Efektif hingga **dua belas unit**; di atas itu bonus **diskalakan turun linear** | Soft cap Hearts of Iron mencegah tumpukan maut tanpa tembok keras |
| Atribut | **Serang, Tahan, Logistik, Inisiatif** dengan nilai 2,5 / 2,5 / 2,5 / 5 persen per poin | Salin angka Hearts of Iron yang sudah teruji satu dekade |
| Level | **Satu sampai lima**, bukan satu sampai sepuluh | Permainan luring pendek |
| Cara memperoleh | Bangun **Staff College**, jalankan proyek rekrutmen, dapat komandan acak dari kolam arketipe. **Tanpa gacha dan tanpa mata uang premium** | Menggantikan rarity dengan biaya sumber daya nyata |
| Biaya marjinal | Komandan kedua 1,5 kali, ketiga 2,25 kali, keempat 3,4 kali | Prinsip Hearts of Iron dan Stellaris, tetapi jauh lebih landai |
| Trait | Dari XP tempur pada ambang 400, 1.100, dan 2.200 XP, maksimum **tiga trait** | Ambang Hearts of Iron 100 sampai 2.000 XP |
| **Rem utama** | **XP trait menyusut**: setelah satu trait laju dikali 0,5, setelah dua dikali 0,33, setelah tiga dikali 0,25 | Salin persis mekanisme Hearts of Iron, rem paling efektif yang terverifikasi |
| Kematian | **Tanpa kematian permanen.** Bila tumpukannya musnah, komandan **ditawan**, nonaktif 48 jam, kehilangan 25 persen XP | Kematian permanen di pemain tunggal luring memancing muat ulang; penalti sementara memberi taruhan tanpa itu |
| Kemampuan aktif | **Satu per komandan**, cooldown 20 jam, durasi 3 jam, **dengan biaya susulan**. Contoh: Perintah Terobosan memberi 25 persen serang selama 3 jam lalu minus 10 moral selama 12 jam | Ini yang hilang dari Conflict of Nations, karena officer di sana seratus persen pasif. Kemampuan aktif berbiaya susulan mengubah komandan dari bonus pasif menjadi **keputusan waktu** |

Empat arketipe menggantikan rarity: **Darat** dengan serang plus satu dan Perintah Terobosan; **Udara** dengan inisiatif plus satu dan Sortie Maksimum; **Laut** dengan tahan plus satu dan Jelajah Senyap; **Dukungan** dengan logistik plus satu dan Pasokan Darurat. Trait medan memakai templat Hearts of Iron yang terverifikasi, yaitu 10 persen serang, 10 persen tahan, dan 5 persen gerak.

### 6.2 Veteran diganti pengalaman tumpukan

**Rekomendasi: hapus Veteran sebagai unit terpisah.** Conflict of Nations sendiri sudah setengah membuangnya, karena officer lama diganti nama menjadi Veteran lalu dipindah ke tab tipe masing-masing, gejala sistem yang tidak lagi punya tempat sendiri. Unit sebagai modifier juga menciptakan mikromanajemen tanpa keputusan, karena pemain selalu ingin Veteran di tumpukan terbesar.

| Tingkat | Cara naik | Bonus | Cara turun |
|---|---|---|---|
| Hijau | bawaan | — | — |
| Reguler | tiga pertempuran menang | 5 persen serang dan tahan | — |
| Veteran | delapan pertempuran | 10 persen serang dan tahan, 5 persen penyembuhan | Turun satu tingkat bila kehilangan lebih dari 50 persen HP |
| Elite | lima belas pertempuran dengan komandan tertempel saat naik | 15 persen serang dan tahan, 10 persen penyembuhan, satu jarak pandang | Sama |

Kuncinya: **penambahan bala bantuan mengencerkan pengalaman.** Menambah unit baru ke tumpukan veteran menurunkan pengalaman rata-rata secara proporsional. Ini menciptakan keputusan nyata antara mempertahankan tumpukan elit kecil atau mengencerkannya menjadi tumpukan besar biasa saja, persis jenis pertukaran yang tidak dimiliki sistem Veteran Conflict of Nations.

### 6.3 Seasons ditolak, Elite diadopsi lewat Proyek Akhir

**Seasons ditolak sepenuhnya**, dengan alasan struktural bukan selera. Season Points diperoleh lintas pertandingan secara akumulatif, sehingga butuh akun persisten dan banyak pertandingan, mustahil di permainan luring. Mempertahankan unit musim butuh langganan aktif, sehingga seluruh alasan eksistensi Season Points adalah mengarahkan orang ke langganan. Dan musim 10 serta 11 tidak punya unit baru sama sekali, sehingga modelnya sudah kelelahan bahkan di game aslinya.

**Elite diadopsi lewat Proyek Akhir**, sesuai arah yang sudah tercatat di dokumen kita.

| Parameter | Usulan |
|---|---|
| Gerbang | Epoch akhir, Advanced Research Complex level 3, dan satu Proyek Akhir selesai |
| **Kelangkaan** | Maksimum **dua program Elite aktif per pertandingan**. Memilih satu **menutup** dua lainnya sampai program pertama selesai |
| Biaya | Sangat tinggi, setara sekitar 15 persen total ekonomi akhir permainan satu negara |
| Waktu | Tiga sampai lima hari dalam game per program, tidak bisa dipercepat |
| Batas produksi | Tiap program hanya memungkinkan tiga sampai lima unit dengan upkeep sangat tinggi |
| Karakter mekanik | **Spesialisasi ekstrem, bukan serba bisa**, mengikuti pola Elite Railgun yang menembus unit berlapis baja apa pun tetapi rapuh terhadap kelas lain |

Lima program yang diusulkan: **Panzer Renaissance** memberi Elite MBT dan Elite AFV; **Deep Strike** memberi Elite Bomber dan Elite Attack Aircraft; **Silent Deep** memberi Elite AIP Submarine dan Elite Frigate; **Autonomous Warfare** memberi Elite UGV, Elite Loitering Munitions, dan Drone Mothership; **Directed Energy** memberi Elite Railgun.

Lima program, pilih dua. Ini struktur idea group Europa Universalis yang diperkecil ke skala satu pertandingan, dan menghasilkan hal yang sama yang dicapai Grand Doctrine Hearts of Iron lewat eksklusivitas: **Elite menjadi pernyataan strategis, bukan daftar centang.**

### 6.4 Loadout disederhanakan

Conflict of Nations punya enam jenis barang konsumsi. Itu terlalu banyak, karena tiga jenis amunisi terpisah per domain tidak menghasilkan keputusan; pemain selalu ingin amunisi yang cocok dengan unitnya.

| Slot | Isi | Keputusan yang dihasilkan |
|---|---|---|
| **Persenjataan** | Amunisi Standar atau Amunisi Berat | Berat memberi 30 persen kerusakan lebih tetapi hanya dua penggunaan dan menambah 50 persen beban logistik |
| **Pemeliharaan** | Kotak Medis atau Kotak Perbaikan Lapangan | Menyembuhkan personel versus memperbaiki kendaraan, tidak bisa keduanya |
| **Deployable**, hanya unit berkemampuan kerah | SUAV, Munisi Berkeliaran, atau UGV | Pengintaian versus serangan versus perisai |

Kapasitas slot dua secara bawaan dan naik ke tiga dengan riset Heavy Loadouts. Waktu isi ulang enam jam untuk SUAV dan delapan jam untuk dua lainnya, konsisten dengan observasi. Resupply otomatis di kota berdepot, dan di lapangan butuh unit truk pasokan.

**Kuncinya adalah satu bar stockpile nasional bersama untuk semua barang**, diisi dari produksi komponen. Kalau setiap barang punya bar sendiri seperti di Conflict of Nations, tidak ada kelangkaan, sehingga tidak ada keputusan.

Empat node tab Items: **Medical Care** menambah 2 HP per hari penyembuhan darat, melipatgandakan basis 1 HP yang terverifikasi; **Engineering Teams** mengurangi 15 persen kerusakan diterima saat bertahan berparit; **Crew Training** memberi satu tingkat pengalaman awal untuk unit yang baru dimobilisasi; dan **Heavy Loadouts** menaikkan kapasitas slot dari dua ke tiga.

### 6.5 Struktur pohon teknologi Nation Rise

**Prinsip utama: pisahkan tangga dari percabangan**, pelajaran paling kuat dari Europa Universalis dan Hearts of Iron.

**Lapisan pertama, tangga, delapan cabang dan 104 node.** Infanteri 14 node tier 1 sampai 5; Lapis Baja 14; Artileri dan Dukungan 14; Sayap Putar 10 tier 1 sampai 4; Sayap Tetap 16; Laut Permukaan 14; Bawah Laut dan Rudal 12 tier 1 sampai 4; Items dan Logistik 10 tier 1 sampai 4. Node tidak eksklusif dan semuanya akhirnya bisa diriset. Ini tangga netral yang sengaja hambar, seperti teknologi Europa Universalis.

**Lapisan kedua, percabangan, eksklusif dan menjadi tempat identitas.** Tiga Grand Doctrine yaitu Eastern, European, dan Western, dikali empat slot subdoktrin dengan satu aktif per slot. Slot Manuver memilih antara Blitz, Atrisi, atau Pertahanan Elastis. Slot Daya Tembak memilih antara Artileri Massal, Serangan Presisi, atau Senjata Gabungan. Slot Logistik memilih antara Depot Depan, Prioritas Rel, atau Jembatan Udara. Slot Komando memilih antara Terpusat, Komando Misi, atau Perwira Politik.

**Mengganti Grand Doctrine menghapus semua progres subdoktrin**, menyalin aturan Hearts of Iron. Inilah yang membuat pilihan berbobot.

**Gating epoch** memakai empat epoch: Awal di hari 1 sampai 7 membuka tier 1 dan 2; Tengah di hari 8 sampai 18 membuka sampai tier 3; Modern di hari 19 sampai 32 membuka sampai tier 4; Akhir di hari 33 ke atas membuka tier 5 dan Proyek Akhir.

**Cara doktrin menggeser hari unlock** adalah mekanisme paling penting, dan Conflict of Nations sudah membuktikannya bekerja lewat pergeseran hari 20 versus hari 22.

| Doktrin | Pergeseran hari | HP unit | Biaya riset dan bangun |
|---|---|---|---|
| Eastern | **Minus dua hari** pada Infanteri, Lapis Baja, dan Artileri; **plus tiga hari** pada Sayap Tetap dan Laut | Terendah | Terendah |
| European | Nol, baseline semua cabang | Menengah | Menengah |
| Western | **Plus dua hari** pada Infanteri dan Lapis Baja; **minus tiga hari** pada Sayap Tetap, Laut, dan Items | Tertinggi | Tertinggi |

Sifat HP versus biaya diambil langsung dari doktrin Conflict of Nations yang terverifikasi.

**Lima aturan tambahan**, semuanya dari sistem terverifikasi. Maksimum dua riset paralel, mempertahankan tempo Conflict of Nations. Peningkatan retroaktif ke semua unit sejenis, menghilangkan frustrasi armada usang. Riset lebih awal dari epoch dikenai biaya dua kali lipat per epoch, mengadaptasi penalti Hearts of Iron. Penalti tertinggal menambah biaya teknologi tier tinggi untuk tiap teknologi tier rendah yang belum diriset, mengadaptasi formula Victoria 3 dan mendorong pohon yang lebar. Dan **tanpa keacakan kartu**, karena Stellaris menaikkan replayability tetapi menurunkan agensi, sementara permainan luring butuh agensi.

Simbol peningkatan mempertahankan bahasa visual Conflict of Nations: chevron untuk tingkat tier, petir untuk kerusakan, plus medis untuk HP, mata untuk jarak pandang, gunung untuk modifier medan, panah untuk jangkauan, sonar untuk deteksi bawah laut, dan lencana pangkat untuk node doktrin.

### 6.6 Contoh skema data

Satu node riset:

```json
{
  "id": "arm.mbt.t3",
  "branch": "armor",
  "tier": 3,
  "epoch": "modern",
  "unlock_day_base": 20,
  "doctrine_day_offset": { "eastern": -2, "european": 0, "western": 2 },
  "requires": {
    "research": ["arm.mbt.t2"],
    "buildings": [{ "id": "army_base", "level": 3 }],
    "epoch_min": "modern"
  },
  "cost": { "supplies": 3200, "components": 2100, "electronics": 900, "money": 14500 },
  "duration_hours": 8,
  "slot_cost": 1,
  "early_research_penalty": { "multiplier_per_epoch_ahead": 2.0 },
  "lagging_tech_penalty": { "per_unresearched_lower_tier": 0.08 },
  "effects": [
    { "type": "unit_tier", "unit": "main_battle_tank", "tier": 3 },
    { "type": "stat_delta", "unit": "main_battle_tank", "stat": "hp", "value": 10 },
    { "type": "stat_delta", "unit": "main_battle_tank", "stat": "dmg_vs_armored", "value": 4 }
  ],
  "retroactive": true,
  "icon_badges": ["chevron_3", "bolt", "medic_plus", "eye"]
}
```

Satu commander:

```json
{
  "id": "cmd.ground.01",
  "archetype": "ground",
  "slot": "ground",
  "one_active_per_slot": true,
  "acquired_by": {
    "source": "recruitment_project",
    "building": { "id": "staff_college", "level": 1 },
    "cost": { "manpower": 4000, "money": 20000 },
    "marginal_cost_multiplier": 1.5
  },
  "level": 1,
  "max_level": 5,
  "xp_to_next": [400, 1100, 2200, 4000],
  "stats": { "attack": 1, "defense": 0, "logistics": 0, "initiative": 1 },
  "stat_value_per_point": { "attack": 0.025, "defense": 0.025, "logistics": 0.025, "initiative": 0.05 },
  "command_capacity_units": 12,
  "over_capacity_rule": { "type": "linear_falloff" },
  "trait_slots": 3,
  "trait_xp_gain_multiplier_by_owned": [1.0, 0.5, 0.33, 0.25],
  "traits": [
    { "id": "trt.steppe_runner", "xp_required": 400,
      "effect": { "terrain": "open_ground", "attack_pct": 10, "defense_pct": 10, "speed_pct": 5 } }
  ],
  "active_ability": {
    "id": "abl.breakthrough_order",
    "cooldown_hours": 20,
    "duration_hours": 3,
    "effect": { "attack_pct": 25 },
    "after_cost": { "morale_delta": -10, "duration_hours": 12 }
  },
  "casualty_rule": { "on_stack_wipe": "captured", "inactive_hours": 48, "xp_loss_pct": 25, "permadeath": false }
}
```

---

## 7. Ringkasan keputusan

| Sistem Conflict of Nations | Keputusan Nation Rise | Alasan singkat |
|---|---|---|
| Tujuh Officer berrarity, unit fisik, pasif | **Empat Commander tanpa rarity, berupa modifier, punya kemampuan aktif** | Rarity adalah artefak monetisasi; kemampuan aktif menjadi keputusan waktu |
| Veteran sebagai unit terpisah | **Dibuang, diganti pengalaman tumpukan empat tingkat dengan pengenceran bala bantuan** | Menghasilkan pertukaran nyata antara tumpukan elit kecil dan tumpukan besar biasa |
| Seasons, Season Points, Security Council | **Ditolak sepenuhnya** | Seluruh alasan eksistensinya adalah mengarahkan orang ke langganan |
| Elite lewat poin musim | **Diadopsi lewat Proyek Akhir, maksimum dua dari lima program per pertandingan** | Eksklusivitas menghasilkan pernyataan strategis |
| Enam barang konsumsi dengan bar terpisah | **Tiga slot, empat barang, satu bar stockpile bersama** | Bar bersama menciptakan kelangkaan, dan kelangkaan menciptakan keputusan |
| Riset per unit dengan gating hari | **Delapan cabang dan 104 node sebagai tangga, ditambah tiga kali empat doktrin eksklusif sebagai percabangan** | Memisahkan tangga dari percabangan, pelajaran Europa Universalis dan Hearts of Iron |

**Yang paling perlu diverifikasi sendiri sebelum implementasi:** seluruh sistem Officer berrarity, tab riset Items, dan mekanik Loadout tidak terdokumentasi di sumber publik mana pun. Tangkapan layar dalam game adalah satu-satunya sumber yang ada, dan sebaiknya dicatat sendiri.
