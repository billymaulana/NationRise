# Riset Sistem Bangunan, Antrean Konstruksi, dan Manajemen Kota

> Sesi 5 (2026-09-05), dijalankan lewat subagen sesuai aturan 9. Penanda: **[V]** terverifikasi dengan URL, **[UNV]** tidak terverifikasi, **[USULAN]** rancangan Nation Rise.

## 1. Bangunan Conflict of Nations, lengkap per level [V]

### 1.1 Bangunan kota

**Army Base**, membuka unit darat. Biaya level 1 adalah 250 pasokan, 250 komponen, 500 bahan bakar, 250 elektronik, dan 2.000 dana, dengan waktu 90 detik. Level 2 sampai 5 memakan 28, 32, 34, dan 36 jam. HP naik dari 10 ke 30.

**Tangga gerbang yang selama ini kita pakai terkonfirmasi persis:** Mobile Anti-Air di level 1, Towed Artillery dan Mobile Radar di level 2, Mobile Artillery di level 3, Multiple Rocket Launcher di level 4, dan Theater Defense System di level 5.

**Arms Industry**, satu-satunya bangunan yang menuntut material langka di semua level. Produksi naik 10, 20, 30, 40, lalu 50 persen, ditambah bonus dana tetap 100, 135, 165, 185, dan 200. Waktunya 9, 24, 30, 36, dan 48 jam. **Prasyarat mobilisasi semua unit kecuali infanteri, Combat Recon Vehicle, dan officer.**

**Recruiting Office**, tercepat dibangun dengan level 1 hanya 30 menit. Personel naik 5 sampai 25 persen ditambah tambahan tetap 200 per level. **Kecepatan mobilisasi naik 10, 25, 45, 70, lalu 100 persen**, dan perlu dicatat bahwa itu kecepatan, bukan pengurangan waktu; plus 100 persen berarti dua kali lebih cepat.

**Air Base** dan **Naval Base** sudah tercatat lengkap di dokumen 31 dan 32.

**Military Hospital** memberi penyembuhan tambahan 1 sampai 5 HP per hari di atas basal 1, sehingga level 5 menghasilkan 6 HP per hari. **Pertumbuhan populasi naik 20 persen di level 1**, sementara level 2 sampai 5 kosong di wiki.

**Underground Bunkers**, bangunan rahasia dan **satu-satunya yang tidak menuntut elektronik**. HP-nya jauh lebih besar dari bangunan lain, yaitu 20, 40, 75, 100, dan 125. Moral naik 5, 10, 20, 35, dan 50. Populasi terlindungi dua kali level, dan **populasi terlindungi tidak menerima kerusakan sama sekali sampai bunker hancur**.

**Secret Weapons Lab**, rahasia dan **meledakkan diri saat direbut**. Sudah tercatat di dokumen 32.

**Annex City** memakan 18 jam dan biaya sangat besar: 4.250 pasokan, 3.750 komponen, 1.500 material langka, 2.500 bahan bakar, 1.750 elektronik, **1.250 personel**, dan 10.000 dana. Efeknya menaikkan batas produksi dari 25 ke 50 persen dan membuka mobilisasi. **Kota kehilangan status anteksasi bila direbut kembali**, sehingga harus dibeli ulang.

**Relocate HQ** memakan **2.500 personel dan 15.000 dana** selama 36 jam, tanpa sumber daya lain. **Tidak muncul di daftar konstruksi kota** seperti bangunan lain.

### 1.2 Formula reduksi kerusakan bersifat inversely additive [V]

Ini koreksi penting. **Reduksi kerusakan tidak dijumlahkan langsung.** Caranya: konversi tiap sumber menjadi penambah HP efektif dengan rumus `1 dibagi (1 dikurangi r) dikurangi 1`, jumlahkan, lalu balikkan.

Contoh resmi dari wiki: bunker level 1 memberi minus 33 persen yang setara plus 50 persen HP, ditambah entrenchment minus 25 persen yang setara plus 33 persen HP. Totalnya plus 78 persen HP, sehingga pengali kerusakan menjadi 1 dibagi 1,78 yaitu 0,55, atau **minus 45 persen**, bukan minus 58 persen kalau dijumlahkan langsung.

| Level bunker | Sendiri | Dengan entrenchment |
|---|---|---|
| 1 | −33% | **−45%** |
| 2 | −43% | **−52%** |
| 3 | −56% | **−61%** |
| 4 | −68% | **−71%** |
| 5 | −73% | **−75%** |

### 1.3 Bangunan provinsi [V]

| Bangunan | Level | Waktu | Efek |
|---|---|---|---|
| Combat Outpost | 3 | 1j, 4,5j, dan tidak terdata | Kerusakan penyerang **−33, −50, −65 persen**; moral +10, +13, +15 |
| Airfield | 1 | 21 jam | Operasi pesawat, operasional pada 40 persen HP |
| Field Hospital | 3 | 9j, 18j, 27j | Penyembuhan +1, +2, +3; moral +10, +13, +15 |
| Local Industry | 3 | 9j, 18j, 27j | Sumber daya **+100, +150, +200 persen**, tetapi bukan dana dan personel |
| Military Logistics | 1 | 3 jam | Kecepatan darat **+150 persen** di provinsi |
| Pontoon | 1 | tidak terdata | Embarkasi tanpa pelabuhan, maksimum satu per provinsi |

**Tidak ada satu pun bangunan yang bisa dibangun di kota maupun provinsi.** Ini berbeda dari Call of War yang punya kategori ketiga berisi Infrastructure, Propaganda Office, dan Recruiting Station.

Nasihat desain yang menarik dari wiki: Combat Outpost dianjurkan untuk mencegat musuh **sebelum** masuk kota, karena pertempuran di dalam kota menurunkan moral sekaligus populasi.

### 1.4 Koreksi dan anomali

**Mercenary Outpost tidak ada di Conflict of Nations.** Tidak ada halamannya, tidak ada di kategori bangunan, dan tidak ada di daftar mana pun. Kemungkinan tercampur dengan game lain.

**Dua anomali yang kemungkinan besar salah ketik wiki, jangan disalin mentah.** Army Base level 5 tercatat 2.000 dana, turun dari 7.500 di level 4, dengan upkeep 100 turun dari 130. Air Base level 1 tercatat upkeep 10 dana, sementara semua bangunan lain 100. Progresi semua bangunan lain naik monoton.

### 1.5 Sebelas bangunan yang belum kita ketahui [V]

| Bangunan | Mode | Efek |
|---|---|---|
| **Domed Complex** | Rising Tides | **+50 VP** saat kubah penuh, melindungi populasi dan bangunan, konstruksi **+20 persen** saat aktif; kubah mati saat direbut dan mengisi ulang 24 jam |
| **Mining Facility, Oil Refinery, Wind Farm, Seed Vault, Fusion Reactor, Marine Research Facility** | Victory Site | **+500 VP** dan **+1.000 sumber daya tetap** masing-masing; **tidak bisa dibangun dan tidak bisa dihancurkan** |
| **Suez Canal Gate** | Blood and Oil, dihapus | +101 VP dan 16.000 dana |
| **Hive** | mode zombie | Kerusakan unit −33 persen; zombie muncul 66 persen tiap pergantian hari |
| **Homeland City** | dihapus Februari 2019 | Mengubah kota menjadi tanah air, maksimum lima |
| **Insurgent Outpost** | dihapus | Bonus bertahan untuk pemberontak |

**Pelajaran desain yang paling berharga:** Conflict of Nations memakai **situs strategis sebagai bangunan yang sudah ada di peta, tidak bisa dibangun, dan tidak bisa dihancurkan**, yang memberi poin kemenangan besar dan sumber daya tetap besar. Ini menciptakan **titik konflik geografis permanen tanpa perlu sistem baru sama sekali**. Sangat murah diimplementasi, sangat besar dampaknya pada peta.

---

## 2. Antrean konstruksi

### 2.1 Temuan yang menentukan [V]

**Antrean adalah fitur berbayar di ketiga game Bytro.** Conflict of Nations memberi empat slot untuk anggota Security Council, Call of War menjadikan build queue eksklusif akun premium, dan Supremacy 1914 menaruhnya di High Command. Non-premium hanya punya satu item aktif tanpa antrean.

**Untuk Nation Rise yang luring tanpa monetisasi, ini berarti antrean harus gratis dan penuh sejak awal.** Hambatan itu murni artefak monetisasi, bukan desain permainan.

Yang juga terverifikasi: konstruksi dan mobilisasi **berbagi antrean yang sama** di Conflict of Nations, dan City Panel memungkinkan **memilih banyak kota lalu mengantrekan bangunan atau unit yang sama sekaligus**.

Call of War lebih maju: memilih banyak provinsi lewat kontrol klik di peta atau kotak centang di daftar provinsi, lalu menu bangun terbuka untuk semuanya, dengan **jumlah item yang akan dibangun ditampilkan**, dan tersedia pembatalan serta percepatan massal.

### 2.2 Efek moral ke waktu, dengan contoh yang bisa dijadikan uji [V]

Di atas 90 persen waktunya 100 persen. Antara 25 dan 90 persen memakai rumus `1 dibagi (0,75 ditambah 0,25 dikali (m dikurangi 25) dibagi 65)`. Di bawah 25 persen menjadi 133,33 persen.

Contoh resmi yang bisa langsung menjadi kasus uji: pada moral 70 persen pengalinya 108,33 persen, sehingga Army Base level 1 yang 90 detik menjadi **97,5 detik**, Recruiting Office level 1 yang 30 menit menjadi **32 menit 30 detik**, dan Motorized Infantry level 1 yang 18 jam menjadi **19 jam 30 menit**.

---

## 3. Manajemen kota Conflict of Nations

### 3.1 Populasi dan poin kemenangan [V]

Kota berkisar 1,0 sampai 10,0 dan provinsi non-kota tetap 1,0. Pertumbuhan bergantung moral, **tetapi formulanya tidak pernah didokumentasikan**.

**Faktor populasi kita terkonfirmasi benar.** Bentuk piecewise-nya persis: naik linear dari 20 ke 100 persen saat populasi 1,0 sampai 5,0, lalu linear dari 100 ke 125 persen saat 5,0 sampai 10,0. Titik sambungnya kontinu di populasi 5.

**Temuan baru: poin kemenangan kota juga dipengaruhi bangunan, bukan hanya populasi.** Domed Complex menambah 50, Victory Site menambah 500, dan Suez Canal Gate menambah 101. Dokumen kita sebelumnya menyebut situs strategis menambah poin tetap tanpa angka; kini angkanya ada.

### 3.2 Tiga status kota, dengan satu konflik sumber [V]

| Status | Batas produksi | Target moral | Mobilisasi | Moral awal |
|---|---|---|---|---|
| Tanah air | 100 persen | 90 persen | ya | 70 persen |
| **Anteksasi** | 50 persen | **60 atau 75 persen, sumber berkonflik** | ya | mewarisi |
| Pendudukan | 25 persen | 60 persen | tidak | **25 persen** |
| Provinsi non-kota | 50 persen | 100 persen | tidak | 70 persen |

**Konflik sumber yang perlu diputuskan.** Wiki komunitas menulis target moral anteksasi 60 persen, sementara **wiki resmi Bytro menulis 75 persen lengkap dengan contoh perhitungan**. Angka kita saat ini mengikuti yang pertama.

**Rekomendasi: pakai 75 persen untuk anteksasi dan 60 persen untuk pendudukan.** Alasannya bukan sekadar mengikuti sumber resmi, melainkan karena itu memberi imbalan nyata atas biaya aneksasi yang sangat mahal.

**Batas diterapkan setelah semua bonus bangunan.** Konsekuensinya tajam: Arms Industry level 5 di kota pendudukan hampir sia-sia, karena bonus 50 persen dipotong balik oleh batas 25 persen. Inilah yang memberi Annex City nilai strategis.

### 3.3 Insurgency, dengan satu mekanik yang tidak kita ketahui [V]

Risiko mulai pada moral 33 persen ke bawah dan naik tajam di bawah 25 persen, di mana peluangnya 50 persen. **Provinsi non-kota tidak pernah memberontak.**

**Mekanik yang baru diketahui: undian dilakukan sekali per hari game pada jam acak, dan setiap tipe kota punya penghitung waktunya sendiri yang berlaku untuk semua kota bertipe sama.** Contoh resminya, semua kota tanah air memberontak pada jam 14.00 di hari pertama lalu 18.00 di hari kedua, sementara semua kota pendudukan pada 19.00 lalu 12.00. Ini berarti pemberontakan datang **bergelombang per tipe**, bukan tersebar acak per kota.

Kota tanpa garnisun **langsung direbut**. Kota bergarnisun bertempur dengan bonus garnisun yang nilainya tidak terdokumentasi.

**Ada kontradiksi di dalam wiki itu sendiri** tentang apakah pemberontak menyebar ke kota lain. Wiki resmi mendukung versi tidak menyebar. **Rekomendasi: pemberontak tidak menyebar ke luar kota**, sehingga insurgency menjadi masalah yang bisa dikurung, bukan bola salju yang menghancurkan permainan.

### 3.4 Markas besar [V]

Memberi moral plus 25 persen di sekitarnya, dengan penalti jarak minus 5 per satuan. Kehilangannya menurunkan moral **semua** kota dan provinsi **20 poin seketika**, ditambah penalti 20 permanen pada target moral selama tanpa markas. Tanpa markas, provinsi non-kota jatuh ke sekitar 70 persen, kota tanah air ke 60 persen, dan kota lain ke 40 persen. **Markas tidak kembali otomatis** saat kota dibebaskan.

### 3.5 Penyembuhan, dengan satu implikasi diplomasi yang sering terlewat [V]

Kota memberi 1 HP per hari ditambah level rumah sakit sehingga level 5 memberi 6. Provinsi memberi 0 ditambah level rumah sakit lapangan. Kapal memberi 2 HP per hari di perairan pesisir.

Pembaruan terjadi **tiap jam**, bukan harian, sehingga rumah sakit level 5 memberi 0,25 HP tiap jam. Unit **tidak perlu berparit di titik pusat** untuk sembuh, cukup berada dalam batas provinsi.

**Implikasi yang sering terlewat: unit bisa sembuh di kota milik koalisi, mitra berbagi intelijen, atau pemberi hak lintas.** Ini menjadikan diplomasi punya nilai logistik konkret, bukan sekadar tidak saling menyerang.

### 3.6 Kekurangan sumber daya punya syarat ganda [V]

**Kekurangan hanya aktif bila stok habis DAN laju produksi bersih negatif.** Stok nol dengan produksi positif **tidak** memicu penalti. Ini krusial untuk implementasi dan sebelumnya tidak kita catat.

Yang memicu penalti moral hanya **pasokan dan dana**. Komponen, bahan bakar, elektronik, dan material langka tidak punya efek khusus selain masuk hitungan agregat. Personel tidak disebut sama sekali.

---

## 4. Pembanding lintas game

### 4.1 Hearts of Iron IV, pelajaran slot bersama [V]

Slot bangunan ditentukan kategori wilayah, dari 12 untuk megalopolis sampai **nol untuk enklave dan tanah tandus**.

Yang paling berharga adalah pemisahan **slot bersama** dan **slot khusus**. Pabrik sipil, pabrik militer, dan galangan berebut slot yang sama, sehingga **setiap keputusan ekonomi adalah keputusan militer**. Sementara infrastruktur, pangkalan udara, anti-udara, dan radar punya slot sendiri, sehingga tidak ada dilema palsu.

Infrastruktur berfungsi sebagai **pengali kecepatan konstruksi dari 1,0 kali sampai 2,0 kali**, yang menjadikan membangun infrastruktur lebih dulu sebagai keputusan investasi nyata.

Ada juga **batas lima belas pabrik per satu proyek**, yang memaksa antrean paralel karena kelebihan kapasitas tidak bisa ditumpuk ke satu proyek. Ini pembatas laju yang elegan tanpa timer buatan.

### 4.2 Europa Universalis IV, formula slot terbersih [V]

`Jumlah slot sama dengan 2 ditambah modifier ditambah pembulatan ke bawah dari development dibagi 10`, dengan maksimum 12.

Empat pola yang layak diambil. Pertama, **peningkatan menggantikan bangunan di slot yang sama**, sehingga tidak ada penalti menyia-nyiakan slot saat naik tier. Kedua, **beberapa bangunan justru memberi slot**, yang menciptakan keputusan meta berupa mengorbankan satu slot untuk mendapat satu slot ditambah efek. Ketiga, **bonusnya multiplikatif terhadap development**, sehingga bangunan bernilai persis sebanding dengan provinsi tempatnya, dan itu otomatis mendorong membangun di kota terbaik dulu tanpa aturan tambahan. Keempat, **upkeep permanen** membuat pembangunan berlebihan menghukum diri sendiri.

### 4.3 Civilization VI, tekanan yang bertumpuk [V]

Batas distrik adalah `1 ditambah pembulatan ke bawah dari (populasi dikurangi 1) dibagi 3`. Beberapa distrik seperti akuaduk dan permukiman **tidak dihitung ke batas**.

Biaya distrik **naik sepuluh kali lipat sepanjang permainan**, mengikuti kemajuan pohon teknologi atau kebudayaan. Ini menciptakan tekanan waktu tanpa timer: kota yang didirikan di era modern menghadapi biaya yang jauh lebih berat.

Ada juga **diskon otomatis 40 persen untuk distrik yang paling jarang dibangun**, yang mendorong keragaman lewat sistem, bukan lewat aturan.

Analisis dari wikinya sendiri menyebut bahwa batasan distrik **memaksa pemain merencanakan urutan** karena semuanya diizinkan tetapi tidak semuanya muat.

### 4.4 Victoria 3, cara mengelola ratusan bangunan [V]

Lima pola yang membuatnya tidak melelahkan. **Konstruksi swasta otomatis** membuat pemain tidak menyentuh sebagian besar bangunan sama sekali. **Kapasitas mengalir antar antrean**, sehingga kapasitas menganggur di satu antrean otomatis dipakai antrean lain. Antrean pemerintah bisa **diurutkan ulang, diprioritaskan, dijeda, dan dilanjutkan**, dengan progres dipertahankan selama masih di antrean. **Biaya per level konstan**, sehingga keputusannya selalu berbentuk sama. Dan **metode produksi berlaku per bangunan, bukan per level**, sehingga satu penggantian mengubah tiga puluh level sekaligus.

### 4.5 Call of War, model moral yang lebih baik dari Conflict of Nations [V]

Ini temuan penting. Call of War mendokumentasikan sistem moral jauh lebih lengkap.

`Target moral sama dengan 102 dikurangi semua pengaruh negatif ditambah semua pengaruh positif`, dan **moral bergeser tiap pergantian hari sebesar 15 persen dari selisih antara nilai sekarang dan target**.

Tiga elemen yang tidak dimiliki Conflict of Nations dan layak diambil:

1. **Penalti ekspansi.** Makin banyak provinsi yang dimiliki, makin sulit menjaga moral. Ini rem alami terhadap efek bola salju.
2. **Formula pergeseran 15 persen** yang eksplisit dan bisa diuji, sementara angka Conflict of Nations masih dugaan.
3. **Bonus penaklukan ulang.** Merebut kembali wilayah sendiri mengembalikan moral hampir penuh, sehingga perang bolak-balik tidak menghukum secara permanen.

Model insurgency-nya juga lebih baik karena punya angka konkret: provinsi baru ditaklukkan selalu bermoral 25 persen dengan **peluang pemberontakan 14 persen**, dan **kekuatan garnisun sepuluh menurunkan peluang itu ke nol**. Akibatnya juga berjenjang, dari provinsi berpindah tangan sampai bangunan rusak, bukan biner jatuh atau tidak.

### 4.6 Tropico dan Anno, pola presentasi [V]

Tropico memakai **satu penggeser lima posisi per bangunan** yang mengubah biaya dan hasil secara monoton, dengan **posisi tengah sebagai bawaan yang sudah benar**. Pemain hanya menyentuhnya untuk bangunan penting, sehingga sembilan puluh persen bangunan tidak pernah disentuh.

Anno memisahkan kebutuhan menjadi dua kelas: **kebutuhan dasar menaikkan jumlah penghuni**, sementara **kebutuhan mewah menaikkan kebahagiaan dan pajak**. Ini memberi pemain dua tuas berbeda, sehingga mengabaikan sebagian adalah pilihan sah, bukan kegagalan.

---

## 5. Usulan untuk Nation Rise [USULAN]

### 5.1 Slot bangunan berbasis populasi

> **`slot = 2 + pembulatan ke bawah dari populasi dibagi 2`**

| Populasi | Slot |
|---|---|
| 1,0 sampai 1,9 | **2**, harus spesialis murni |
| 4,0 sampai 5,9 | 4 |
| 8,0 sampai 9,9 | 6 |
| 10,0 | **7** |

**Kuncinya: tujuh slot lebih sedikit daripada sembilan bangunan berslot.** Bahkan kota berpopulasi maksimum tidak bisa punya semuanya, sehingga **spesialisasi tidak pernah lenyap di akhir permainan**.

**Yang tidak memakan slot**, mengikuti prinsip slot khusus Hearts of Iron IV: Underground Bunkers, Annex City, Relocate HQ, pelabuhan bawaan, dan situs strategis. Alasannya tegas: **bangunan bertahan hidup tidak boleh berebut slot dengan ekonomi**, karena kalau berebut, pemain rasional selalu memilih ekonomi dan seluruh sistem pertahanan mati.

Efek sampingnya bagus: karena slot terikat populasi, **Military Hospital menjadi investasi menuju kota serba bisa**, bukan sekadar bangunan penyembuh. Ini menjawab kritik bahwa rumah sakit di Conflict of Nations terasa lemah.

### 5.2 Spesialisasi kota bersifat emergen, bukan dipilih

**Jangan memberi pemain menu untuk memilih peran kota.** Alasannya: kalau memilih peran membuka satu bangunan dan mengunci lainnya, keputusan diambil sekali di menu lalu tidak pernah lagi. Yang menciptakan permainan berulang adalah **kelangkaan**, bukan label.

Conflict of Nations sudah punya empat sumber spesialisasi alami, yaitu tipe sumber daya kota, pesisir versus pedalaman, jarak ke garis depan, dan batas tipe kota. **Yang hilang hanya batas jumlah bangunan.**

Sebagai gantinya, **label peran dihitung dari bangunan yang ada** dan bersifat kosmetik serta untuk pencarian. Industri bila Arms Industry mencapai level 3, Benteng bila Underground Bunkers mencapai level 3, dan seterusnya. Manfaatnya nyata dan murah: bisa difilter, muncul di peta, dan menjadi cara pemain menamai rencananya sendiri tanpa satu pun aturan gameplay baru.

### 5.3 Model antrean

| Parameter | Usulan | Alasan |
|---|---|---|
| Slot aktif per kota | **Dua, yaitu satu konstruksi dan satu mobilisasi, berjalan paralel** | Conflict of Nations menggabung keduanya sehingga memaksa memilih antara ekonomi dan tentara di tingkat antarmuka, dan itu dilema palsu |
| Panjang antrean | **Lima item per jalur** | Bytro membatasi empat sebagai fitur berbayar; tanpa monetisasi tidak ada alasan membatasi |
| Antrean nasional | **Bukan antrean terpisah, melainkan tampilan agregat lintas kota dengan urutan prioritas** | Antrean nasional murni menghapus identitas kota; antrean murni per kota membuat pemain buta terhadap keseluruhan |
| Alokasi saat sumber daya kurang | **Dari atas ke bawah menurut prioritas nasional**, item teratas dibiayai penuh dulu | Menghilangkan kelas masalah berupa semua kota macet setengah jalan |
| Item terhalang | Tetap di antrean dengan status yang menyebut **kekurangan persisnya** dan perkiraan waktu | Jangan pernah membatalkan diam-diam |
| Pembatalan | Belum mulai mengembalikan **seratus persen**; sedang berjalan mengembalikan **biaya dikali sisa progres** | Proporsional, bisa dijelaskan satu kalimat, dan tidak bisa dieksploitasi |
| **Pembongkaran** | Boleh membongkar dengan pengembalian 25 persen dan waktu 25 persen, membebaskan slot | **Batas slot tidak boleh menciptakan kesalahan permanen**; tanpa jalan keluar pemain akan berhenti bereksperimen |
| Percepatan berbayar | **Tidak ada** | Menghapus seluruh vektor monetisasi |

Satu-satunya otomatisasi yang boleh melangkahi urutan pemain adalah **menaikkan prioritas item pertahanan di kota bermoral di bawah 40 persen**, dan itu hanya menaikkan, tidak pernah membatalkan.

### 5.4 Manajemen kota tanpa kelelahan, tiga lapis

**Lapis pertama, wajib, menyelesaikan delapan puluh persen masalah.**

**Daftar Kota sebagai layar utama, bukan peta.** Tabel yang bisa diurut dan difilter, dengan kolom nama, tipe, populasi, moral beserta trennya, produksi, bangunan, slot terpakai, antrean, titik kumpul, dan lencana perlu perhatian. Filter yang wajib ada meniru Call of War: punya bangunan tertentu di bawah level tertentu, moral di bawah ambang, slot kosong, antrean kosong, dan sedang diserang.

**Aksi massal atas seleksi**, dengan panel yang menampilkan **berapa kota dari yang terpilih akan terkena** dan **total biayanya** sebelum konfirmasi. Call of War menampilkan jumlahnya; menambahkan total biaya adalah perbaikan nyata.

**Templat Kota, dan ini yang paling penting.** Templat adalah **daftar bangunan berurut, bukan potret**. Menerapkannya akan mengantrekan hanya yang kurang, dalam urutan, melewati yang mustahil seperti pangkalan laut di kota pedalaman, dan berhenti saat antrean penuh lalu melanjutkan sendiri saat ada slot.

**Kenapa templat, bukan gubernur otomatis:** templat bersifat **deklaratif dan bisa diperiksa**, sehingga pemain melihat persis apa yang akan terjadi sebelum mengonfirmasi. Gubernur bersifat imperatif dan menyembunyikan keputusan. **Templat menghapus klik sebanyak gubernur tanpa menghilangkan pemahaman.**

**Lapis kedua.** Papan antrean nasional yang menampilkan semua item lintas kota beserta kekurangan sumber daya yang menghambat. Titik kumpul per kota. Dan lencana perlu perhatian dengan aturan eksplisit dan sedikit, dengan **batas keras maksimum lima jenis lencana**, karena lebih dari itu pemain akan mengabaikan semuanya.

**Lapis ketiga, opsional dan mati secara bawaan.** Gubernur otomatis yang **hanya mengisi slot antrean yang kosong**, tidak pernah menimpa perintah manual, punya plafon anggaran, dan **berhenti sendiri saat kota diserang atau moral jatuh**. Alasannya opt-in: Victoria 3 dikritik karena konstruksi swasta membangun hal yang tidak diinginkan. **Delegasi harus diberikan pemain, bukan diambil sistem.**

**Yang sengaja ditolak.** Antrean berulang untuk bangunan, karena bangunan punya level terbatas sehingga mengulang tidak punya arti. Penggeser anggaran per bangunan ala Tropico, karena dua puluh sampai lima puluh kota dikali delapan bangunan menghasilkan sampai empat ratus penggeser sementara Tropico hanya punya satu pulau. Dan delegasi penuh ala Victoria 3, karena di game ini keputusan ekonomi adalah keputusan militer, sehingga menyerahkannya menghapus permainannya.

### 5.5 Anggaran klik yang bisa diuji

| Skenario | Tanpa alat | Dengan usulan |
|---|---|---|
| Meningkatkan Arms Industry di dua puluh kota | sekitar 80 klik | **4 klik** |
| Menyiapkan enam kota yang baru direbut | sekitar 90 klik | **5 klik** |
| Pemeriksaan harian | memindai lima puluh kota di peta | **satu pandangan** ke lencana |

### 5.6 Tiga bangunan tambahan dari Call of War

**Propaganda Office** dengan tiga level yang menaikkan target moral 8, 14, dan 20. Alasannya: Conflict of Nations tidak punya cara aktif menaikkan moral kota selain bunker yang sangat mahal.

**Situs strategis** diadopsi dari Victory Site, tetapi dengan angka yang diturunkan menjadi **plus 150 poin kemenangan dan plus 500 sumber daya per hari**, karena angka Conflict of Nations sebesar 500 dan 1.000 terlalu ekstrem untuk peta yang lebih kecil.

---

## 6. Celah data yang tersisa

| Yang dicari | Rencana |
|---|---|
| Persentase rampasan saat merebut kota | Pakai model Call of War: rampasan hanya dari ibu kota, hanya berupa dana, dengan usulan 25 persen stok |
| Formula pertumbuhan populasi | Tidak didokumentasikan di mana pun; rancang sendiri |
| Pertumbuhan populasi rumah sakit level 2 sampai 5 | Usulan 20, 25, 30, 35, dan 40 persen |
| Waktu bangun Combat Outpost level 3 | Usulan 9 jam mengikuti pola 1 lalu 4,5 |
| Biaya Pontoon | Usulan 400 pasokan, 600 komponen, dan 1.500 dana selama 6 jam |
| Nilai bonus garnisun melawan pemberontak | Pakai model Call of War: kekuatan garnisun sepuluh menurunkan peluang ke nol |
