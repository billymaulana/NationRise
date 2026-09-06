# Riset Peta sebagai Sistem Gameplay

> Sesi 5 (2026-09-05), dijalankan lewat subagen sesuai aturan 9. Penanda: **[V]** terverifikasi dengan URL, **[D]** turunan hitungan dari data terverifikasi, **[UNV]** tidak terverifikasi, **[USULAN]** rancangan.

## 1. Lima temuan yang mengoreksi keputusan kita sendiri

| Temuan | Dampak |
|---|---|
| **Conflict of Nations World War III punya 3.358 provinsi**, bukan sekitar 2.000 [V/D] | Target kita **lebih kasar daripada referensi utamanya sendiri** |
| **Indonesia di Conflict of Nations 53 provinsi**, bukan 44 [V] | Angka kita **17 persen di bawah paritas** |
| **Total poin kemenangan dunia awal sekitar 5.190, bukan 7.400** [D] | Angka 7.400 di dokumen 24 **tidak didukung data** |
| **Hearts of Iron IV punya 304 strategic region dan 3.133 sea province** [V] | Asumsi sekitar 150 di dokumen 22 salah jauh |
| **Conflict of Nations membedakan kecepatan High Seas 2,51 dan Coastal Waters 1,30** [V] | D23 memakai satu nilai laut 1,67; perlu tiga nilai |

---

## 2. Struktur peta Conflict of Nations [V]

### 2.1 Penaklukan lewat center-point

Untuk merebut provinsi, unit harus menduduki **center-point**, yaitu titik tempat jalan biasanya bertemu. Untuk kota, kotanya sendiri yang menjadi center-point. Unit di center-point otomatis berparit dan menerima **25 persen kerusakan lebih sedikit**, yang hilang begitu ia bergerak. Rudal balistik dan antarbenua **hanya bisa menargetkan center-point**, sementara rudal jelajah bisa menargetkan unit.

**Hak merebut wilayah sangat terbatas.** Yang bisa: Motorized, Mechanized, Naval, dan Airborne Infantry, National Guard, dan Mercenaries. Yang **tidak bisa**, secara eksplisit: **Special Forces**, Amphibious Combat Vehicle, seluruh artileri, seluruh unit laut, dan berdasarkan absennya kemampuan itu juga tank dan seluruh unit udara.

**Konsekuensi desainnya penting:** infanteri adalah satu-satunya mata uang teritorial. Lapis baja, artileri, kapal, dan pesawat semuanya pemungkin, bukan perebut. **Inilah alasan struktural mengapa tumpukan tank besar di Conflict of Nations tidak bisa memenangkan peta sendirian.**

### 2.2 Jumlah provinsi, hasil scraping 149 halaman negara

| Metrik | Nilai |
|---|---|
| **Total provinsi World War III** | **3.358** |
| Rata-rata provinsi per negara yang bisa dimainkan | **45,95** |
| Rentang negara yang bisa dimainkan | **12 sampai 82**, maksimum Rusia |
| Rata-rata provinsi per negara AI | 5,99 |
| Total kota negara yang bisa dimainkan | 374, rata-rata 5,84 per negara |
| Rata-rata poin kemenangan per negara yang bisa dimainkan | 68,72 |

### 2.3 Koreksi total poin kemenangan dunia [D]

Hitungannya: 64 negara pemain dikali 68,72, ditambah 85 negara AI dikali 9,31, menghasilkan **5.190 poin kemenangan awal**. Ambang menang 1.850 berarti **35,6 persen dari total awal**, bukan 25 persen dari 7.400 seperti yang tercatat di dokumen 24.

Kemungkinan penjelasan selisihnya: poin kemenangan kota sama dengan populasi, dan populasi tumbuh sepanjang permainan, sehingga total dunia naik sekitar 43 persen dari awal ke akhir.

**Rekomendasi: turunkan ambang kemenangan Nation Rise dari 25 persen menjadi sekitar 33 persen poin kemenangan awal**, karena inflasi populasi kita tidak seagresif Conflict of Nations.

### 2.4 Model poin kemenangan kita terkonfirmasi tanpa sisa [D]

Indonesia di Conflict of Nations punya 53 provinsi, 7 kota, dan 80 poin kemenangan awal. Provinsi non-kota berarti 53 dikurangi 7 sama dengan 46, menyumbang 46 poin. Sisanya 80 dikurangi 46 sama dengan 34. Dan jumlah populasi ketujuh kotanya, yaitu 6 ditambah 4 ditambah 4 ditambah 5 ditambah 5 ditambah 5 ditambah 5, **persis 34**.

Jadi model kita bahwa **poin kemenangan sama dengan jumlah provinsi non-kota ditambah total populasi kota terkonfirmasi tanpa sisa sedikit pun**.

### 2.5 Distribusi terrain sebagai benchmark kalibrasi [V/D]

Dari 3.358 provinsi di 149 negara:

| Terrain | Jumlah | Persentase |
|---|---|---|
| Open Ground | 855 | 25,5 |
| Mountains | 745 | 22,2 |
| Forest | 531 | 15,8 |
| Urban | 439 | 13,1 |
| Jungle | 306 | 9,1 |
| Desert | 273 | 8,1 |
| Suburban | 166 | 4,9 |
| Tundra | 43 | 1,3 |

**Ini benchmark kalibrasi terbaik yang kita punya untuk pipeline klasifikasi terrain di fase 1.** Bila keluaran kita menghasilkan Urban tiga persen atau Mountains empat puluh persen, ambang klasifikasinya salah.

Perhatikan bahwa Urban ditambah Suburban mencapai 18 persen, yang terasa tinggi secara geografis nyata. Artinya **Conflict of Nations sengaja menaikkan bobot Urban demi permainan**, dan kita harus melakukan hal yang sama. Ini membenarkan aturan prioritas Urban di atas Mountains yang sudah kita putuskan.

### 2.6 Celah desain terbesar Conflict of Nations [V]

**Tidak ada mekanik selat, tidak ada jembatan, dan tidak ada land bridge.** Istilah adjacency bahkan tidak muncul di ketiga wiki. Yang ada hanya aturan bahwa sungai menjadi penghalang bagi unit non-amfibi.

Untuk peta kepulauan, itu berarti **Selat Malaka secara mekanis identik dengan sepetak laut kosong di tengah Pasifik**. Inilah pembenaran paling kuat untuk keputusan blokade selat kita.

---

## 3. Pembanding lintas game [V]

| Game | Unit gerak | Jumlah | Unit ekonomi | Jumlah |
|---|---|---|---|---|
| Age of History 3 | provinsi | **13.892** | sama | — |
| Hearts of Iron IV | province | **10.122 darat** ditambah **3.133 laut** | state | **1.081** |
| **Conflict of Nations World War III** | provinsi | **3.358** | sama | — |
| Europa Universalis IV | provinsi | **3.272** | sama | — |
| Civilization VI standar | petak | 4.536 | sama | — |
| **Nation Rise, rencana lama** | provinsi | **2.000** | sama | — |
| Victoria 3 | state | dinamis | state region | **675** |
| Terra Invicta | region | 363 | sama | — |

**Kesimpulannya telak: rencana 2.000 provinsi menempatkan Nation Rise di bawah setiap pembanding modern kecuali Victoria 3 dan Total War, padahal keduanya bukan game gerakan per provinsi.**

Hearts of Iron IV juga memberi pelajaran arsitektural: **state mengurus slot bangunan, populasi, sumber daya, dan kepemilikan, sementara province mengurus gerakan dan pertempuran.** Rasionya 9,4 province per state.

Europa Universalis memberi definisi selat yang paling berguna: selat adalah koneksi antara dua provinsi yang tidak berbagi batas darat tetapi bisa diakses lewat badan air, dan **dihitung sebagai batas darat untuk sebagian besar keperluan**. Unit darat menyeberang tanpa invasi laut dan tanpa supremasi laut.

Victoria 3 memberi model selat yang terbaik: selat adalah koneksi antar simpul laut yang **dikendalikan provinsi darat tetangganya**, dan pengendalinya bisa mengatur lintas militer, mengatur lalu lintas dagang, dan **memungut tol**.

Total War memberi dua konsep yang langsung relevan: **titik pantai** sebagai satu-satunya tempat masuk dan keluar laut, dan **jalur laut** yang mempercepat lintas peta tanpa atrisi.

---

## 4. Indonesia di lima game [V]

| Game | Unit peta di wilayah Indonesia | Mekanik selat |
|---|---|---|
| **Conflict of Nations** | **53 provinsi**: 6 Urban, 4 Suburban, 5 Open Ground, **26 Jungle**, 12 Mountains, dengan 7 kota | **Tidak ada** |
| Hearts of Iron IV | **9 state**, tetapi Sumatra dan Kalimantan masing-masing **28 province** | Tidak ada objek selat |
| Europa Universalis IV | **97 provinsi**: Sumatra 27, Kalimantan 23, Jawa 18, Sulawesi 13, Nusa Tenggara 9, Maluku 7 | Pasangan selat ada di area Malaka dan Singapura |
| Victoria 3 | **14 state region** | Selat bisa memungut tol |
| Civilization V | Indonesia sebagai peradaban dengan pemimpin Gajah Mada, bukan wilayah berprovinsi | tidak berlaku |

**Bacaan desainnya.** Europa Universalis memberi Nusantara 97 provinsi karena rempah adalah inti ekonominya. Hearts of Iron IV secara **gerakan** justru jauh lebih halus daripada Conflict of Nations. Victoria 3 paling kasar, dan itu terasa: Hindia Belanda di sana adalah objek ekonomi, bukan teater perang.

Dan yang paling penting: **Conflict of Nations memberi Indonesia 53 provinsi dari rata-rata 45,95**, artinya **15 persen di atas rata-rata**, padahal Indonesia bukan negara besar secara ekonomi. Alasan mekanisnya jelas: **fragmentasi menuntut provinsi**.

---

## 5. Kerangka ALKI, temuan paling berguna untuk Indonesia [V]

Alur Laut Kepulauan Indonesia adalah kerangka resmi pemerintah Indonesia sendiri untuk jalur laut wajib.

| Jalur | Rute | Selat kunci |
|---|---|---|
| **ALKI I** | Laut Cina Selatan ke Samudra Hindia | Natuna, **Karimata**, Laut Jawa, **Sunda** |
| **ALKI II** | Laut Sulawesi ke Samudra Hindia | Laut Sulawesi, **Makassar**, Laut Flores, **Lombok** |
| **ALKI III** | Pasifik ke Hindia | lima sub-jalur |

**Selat Malaka bukan ALKI**, melainkan selat internasional bersama Malaysia dan Singapura.

**Untuk game yang pemain utamanya Indonesia, kerangka ini jauh lebih bermakna secara naratif daripada meniru daftar chokepoint yang berorientasi minyak global.**

Data fisik chokepoint utama yang terverifikasi:

| Selat | Lebar tersempit | Kedalaman | Catatan |
|---|---|---|---|
| **Malaka** | **2,8 km** di Phillip Channel | **25 m** | Sekitar 80 persen impor minyak Tiongkok |
| **Sunda** | 24 km | 20 m | ALKI I |
| **Lombok** | 18 sampai 40 km | 250 m | ALKI II, alternatif kapal tanker raksasa |
| **Makassar** | tidak ditemukan | utara sekitar 2.500 m | ALKI II |
| Hormuz | 39 km | — | Sekitar 20 persen gas alam cair dunia |
| Bosporus | **700 m** | 13 sampai 18 m | Konvensi Montreux 1936 |
| Dardanelles | 1,2 km | rata-rata 55 m | |
| Dover | 33,2 km | 20 m | **Lebih dari 400 kapal per hari** |

Peringatan data: pelacakan Hormuz dinyatakan sangat tidak reliabel sejak akhir Februari 2026, sehingga angka 2026 hampir pasti artefak. **Untuk desain, pakai baseline 2025.**

---

## 6. Masalah pulau kecil [V]

Jumlah pulau Indonesia berbeda-beda antar sumber. Kandidat terkuat adalah **17.024 pulau bernama menurut Badan Informasi Geospasial tahun 2023**. Angka lain yang beredar: 18.307 dari LAPAN 2002, dan 17.508 dari CIA World Factbook.

Yang menjadi masalah desain adalah ekor distribusinya. Sementara itu, pulau-pulau berikut **lebih besar daripada Bali** dan rencana lama kita hanya memberi mereka satu provinsi bersama:

| Pulau | Luas | Bandingkan |
|---|---|---|
| Halmahera | 18.110 km² | lebih dari tiga kali Bali |
| Seram | 17.511 km² | lebih dari tiga kali Bali |
| Buru | 8.585 km² | lebih besar dari Bali |
| Bali | 5.413 km² | acuan |

**Memberi Maluku satu provinsi tidak bisa dibenarkan.**

---

## 7. Usulan granularitas final [USULAN]

### 7.1 Naikkan target ke 2.400 provinsi

Alasannya bukan estetika, melainkan tiga hal mekanis.

**Provinsi adalah satuan waktu.** Dengan basis 120 km per jam game, provinsi rata-rata 68.000 kilometer persegi memakan sekitar 2,2 jam game di medan terbuka. Provinsi lebih kecil berarti keputusan lebih sering, sehingga perang punya tempo. Provinsi raksasa mengubah perang menjadi dua keputusan per hari.

**Provinsi adalah satuan front.** Keputusan kontrol berlapis menjanjikan pemain menggambar front. Front yang hanya tiga provinsi lebarnya bukan front, melainkan garis.

**Provinsi adalah satuan pengepungan.** Uji terima Hattin dan Konstantinopel di fase 4 dan 5 menuntut ruang untuk memutus pasokan, dan itu mustahil bila negara sasaran hanya punya enam provinsi.

**Mitigasi risiko performa:** jadikan jumlah provinsi target sebagai **parameter pipeline, bukan konstanta**. Rilis versi pertama pada 2.000, ukur sesuai gerbang D22, lalu naikkan ke 2.400 dengan **membatalkan sebagian penggabungan**, bukan membangun ulang. Biaya tambahannya hanya sekitar 20 persen pada shader batas dan pencarian jalur, dan **nol pada province ID map** karena biayanya konstan per piksel.

### 7.2 Aturan tiga provinsi per teater pulau

> **Setiap pulau yang dimaksudkan menjadi teater perang wajib punya minimal tiga provinsi: satu pantai pendaratan, satu interior atau kota, dan satu pantai seberang.**

Alasannya: invasi amfibi hanya punya struktur naratif bila ada **kepala pantai, lalu terobosan, lalu penaklukan**. Pulau berprovinsi tunggal mengubah invasi menjadi satu pertempuran, menang atau kalah, tanpa kampanye.

**Konsekuensinya: granularitas ditentukan fragmentasi, bukan luas.** Indonesia berhak atas lebih banyak provinsi per kilometer persegi daripada India, karena Indonesia adalah enam teater terpisah ditambah tiga selat, sementara India adalah satu massa daratan.

### 7.3 Indonesia menjadi 54 provinsi

| Wilayah | Usulan | Rencana lama | Alasan |
|---|---|---|---|
| Sumatra | **11** | 10 | Aceh terpisah, Kepulauan Riau terpisah karena chokepoint Malaka |
| Jawa | **11** | 10 | 157 juta jiwa; Madura sendiri karena ada jembatan |
| Kalimantan | 8 | 8 | tetap |
| Sulawesi | **7** | 6 | Bentuk huruf K memaksa empat lengan dan satu leher |
| Papua | **8** | 6 | 412.000 km² dan enam provinsi administratif |
| Nusa Tenggara dan Bali | **5** | 3 | Lima pulau di atas 4.500 km² |
| **Maluku** | **4** | **1** | Halmahera, Seram, dan Buru masing-masing lebih besar dari Bali |
| **Total** | **54** | 44 | Paritas dengan Conflict of Nations yang 53 |

Negara besar lain: Rusia 84 mengikuti maksimum Conflict of Nations yang 82, Amerika Serikat tetap 82 karena sudah paritas, Tiongkok 74, India 62, Jepang 42, dan Filipina 40 karena aturan tiga provinsi per teater juga berlaku di sana.

---

## 8. Terrain dan zona laut [USULAN]

### 8.1 Tiga kecepatan laut, mengoreksi D23

Conflict of Nations membedakan High Seas dan Coastal Waters, sementara D23 memakai satu nilai. Usulan tiga tingkat:

| Terrain laut | Kecepatan | Kapal besar | Korvet dan kapal cepat | Kapal selam konvensional | Kapal selam nuklir |
|---|---|---|---|---|---|
| **High Seas** | **1,67** | +25 | −25 | −20 | **+25** |
| **Coastal Waters** | **1,30** | −25 | **+25** | **+15** | **−25** |
| **Strait**, kelas baru | **1,00** | **−40** | **+25** | **+25** | **−40** |

**Terrain Strait sebagai kelas ketiga adalah usulan kuncinya.** Kapal besar dihukum berat, kapal kecil diuntungkan. Ini memberi armada Indonesia yang nyatanya terdiri dari 26 korvet dan 25 kapal serang cepat sebuah medan tempur di mana ia menang melawan gugus kapal induk.

### 8.2 Satu mekanik dari Hearts of Iron IV yang tidak dimiliki Conflict of Nations

**Terrain memengaruhi superioritas udara musuh.** Urban mengurangi 50 persen dan Jungle 25 persen. Ini membuat kota berarti tiga kali: pertahanan darat, poin kemenangan, dan **perlindungan dari udara**.

Usulan untuk kita: Urban minus 50 persen, Jungle minus 30 persen, Suburban minus 25 persen, Forest minus 15 persen, Mountains minus 15 persen.

### 8.3 Zona laut menjadi 240

Koreksi benchmark: dokumen 22 menulis Hearts of Iron IV punya sekitar 150 sea region. Angka sebenarnya **304 strategic region dan 3.133 sea province**.

| Kelas zona | Jumlah | Fungsi |
|---|---|---|
| Coastal Waters | **130** | Invasi amfibi, blokade pelabuhan, bombardemen, penyembuhan kapal |
| High Seas | **80** | Transit cepat, perang kapal selam |
| **Strait bernama** | **30** | Chokepoint, tol, penutupan |

Tiga puluh selat bernama, dengan empat tambahan dari riset ini: **Singapura dan Karimata**, tanpa keduanya ALKI I tidak bisa dimodelkan, serta **Denmark Strait dan celah GIUK**, yang bukan selat niaga tetapi keduanya gerbang kapal selam.

**Batas keras adjacency:** provinsi darat **tidak pernah** bertetangga langsung dengan High Seas. Semua akses samudra harus lewat Coastal Waters. Inilah yang mencegah pendaratan langsung dari laut terbuka.

---

## 9. Aturan chokepoint [USULAN]

Selat dimodelkan mengikuti Victoria 3, yaitu **bukan objek laut melainkan sepasang provinsi darat yang mengapit sepetak laut**. Model ini lebih baik daripada Europa Universalis karena membuat selat **bisa direbut tentara, bukan hanya armada**.

### 9.1 Tiga tingkat kendali

| Tingkat | Syarat | Hak |
|---|---|---|
| Terbuka | tidak ada yang memenuhi syarat | Semua lewat gratis |
| **Diawasi** | menguasai **satu** sisi, atau punya dua kapal permukaan di zona | Memungut tol, menolak lintas pihak yang sedang diperangi, dan melihat semua yang lewat |
| **Tertutup** | menguasai **kedua** sisi dan punya tiga kapal permukaan atau dua kapal selam, tanpa kapal perang musuh di dalamnya | Menolak lintas **siapa pun**, termasuk negara netral |

### 9.2 Efek mekanis

Tol transit dibayar per unit yang lewat, dengan Malaka dan Hormuz 400, Suez dan Panama 350, Sunda dan Lombok 200, Makassar 150, sisanya 100. Penolakan lintas memaksa pencari jalur mencari rute lain, dan bila tidak ada, **perintah gerak ditolak dengan alasan tertulis, bukan gagal diam-diam**. Negara pihak ketiga yang jalur dagangnya lewat selat tertutup kehilangan 40 persen akses pasar. Menutup selat terhadap negara netral menambah delapan infamy dan lima Tekanan Dunia.

**Pembatas kedalaman:** kapal induk dan penjelajah tidak bisa melewati selat berkedalaman di bawah 25 meter tanpa riset khusus. Ini membuat **Malaka yang hanya 25 meter benar-benar sempit**.

### 9.3 Aturan khusus Indonesia, Penjaga ALKI

Sebagai Indonesia, ketiga jalur ALKI **berstatus Diawasi secara bawaan sejak hari pertama** tanpa perlu menempatkan armada, karena semua sisinya adalah wilayah Indonesia. Pendapatan tol berjalan otomatis. Menaikkan status ke Tertutup tetap menuntut armada, dan menutup ALKI terhadap pihak netral **menaikkan Tekanan Dunia dua kali lipat**, karena hukum laut internasional mewajibkan lintas alur laut kepulauan.

Ini memberi Indonesia identitas ekonomi bawaan yang tidak dimiliki negara lain, sekaligus **memberi seluruh dunia alasan untuk menyerangnya**, yang menjelaskan mengapa label kesulitannya Sulit.

---

## 10. Aturan pulau berjenjang [USULAN]

Dievaluasi berurutan, berhenti di kecocokan pertama.

| Urutan | Kondisi | Hasil |
|---|---|---|
| 1 | Luas 100.000 km² ke atas | Pecah menjadi enam provinsi atau lebih |
| 2 | Luas 25.000 km² ke atas | Pecah menjadi **tiga sampai lima** provinsi, mengikuti aturan tiga provinsi per teater |
| 3 | Luas 2.000 km² ke atas | **Tepat satu** provinsi sendiri |
| 4 | Di bawah 2.000 km² **tetapi** punya kota terpilih, sisi selat, pangkalan bersejarah, atau populasi 250.000 ke atas | Satu provinsi sendiri bertanda **pulau strategis**, seperti Singapura, Batam, Malta, Gibraltar, Guam, Okinawa, dan Ambon |
| 5 | Sisanya | Digabung menjadi **satu provinsi kepulauan** bersama pulau lain dalam radius 150 km, dengan populasi dan sumber daya dijumlahkan |
| 6 | Tidak ada pulau lain dalam 150 km dan luas di bawah 2.000 km² | **Dihapus dari peta**, populasinya diserap provinsi terdekat |

**Inilah yang menjawab masalah 17.024 pulau.** Aturan lima dan enam memampatkan ekor distribusi secara agresif, sementara aturan empat menyelamatkan pulau kecil yang punya arti strategis.

**Invarian yang tidak boleh dilanggar:** provinsi kepulauan **tidak boleh membentang lebih dari 400 km ujung ke ujung**. Bila melanggar, pecah menjadi dua. Tanpa batas ini, satu provinsi bisa mencakup separuh Maluku dan pertahanannya menjadi tidak masuk akal.

---

## 11. Land bridge berbasis data [USULAN]

> **Land bridge berlaku bila selat tersempit 5 km ke bawah, atau ada tautan tetap nyata berupa jembatan, terowongan, atau jalan lintas.**

| Selat | Lebar | Land bridge | Catatan |
|---|---|---|---|
| Bosporus | 700 m | **Ya** | Tiga jembatan nyata |
| Dardanelles | 1,2 km | **Ya** | Jembatan Canakkale |
| **Selat Bali** | sekitar 2,4 km | **Ya** | Jawa ke Bali |
| **Selat Madura** | sekitar 3 km | **Ya** | Jembatan Suramadu |
| Oresund dan Messina | 3 sampai 4 km | **Ya** | |
| Johor ke Singapura | sekitar 1 km | **Ya** | Causeway |
| Gibraltar, Sunda, Bab el-Mandeb, Lombok, Hormuz, Dover | 14 sampai 39 km | Tidak | **Terowongan Channel sengaja tidak dihitung**, karena memberi Britania land bridge menghancurkan skenario 1940 |

Unit darat menyeberang land bridge tanpa embarkasi, tetapi dengan **serangan dan pertahanan minus 50 persen serta kecepatan minus 50 persen**. Land bridge **bisa diputus** oleh pihak yang menguasai salah satu sisi lewat pembongkaran berbiaya 500 komponen dan enam jam, yang menonaktifkannya sampai diperbaiki dua belas jam. Ini memberi Selat Bali dan Suramadu makna taktis nyata dalam kampanye Jawa.

---

## 12. Aturan amfibi [USULAN dengan jangkar terverifikasi]

| Aturan | Isi | Asal |
|---|---|---|
| Unit non-amfibi | Embarkasi hanya lewat pelabuhan bawaan kota pesisir atau pontoon | Conflict of Nations [V] |
| Naval Infantry | Embarkasi di **pesisir mana pun** tanpa pelabuhan | Conflict of Nations [V] |
| **HP saat transit** | Unit darat di laut berjalan pada **27 persen HP**, karena tank turun dari 45 ke 12 | Conflict of Nations [V] |
| Stealth | **Hilang saat embarkasi**, sehingga konvoi invasi selalu terlihat | Conflict of Nations [V] |
| Penalti pendaratan | Minus 50 persen pada tick pertama, minus 25 persen pada tick kedua, normal setelahnya. Naval Infantry hanya kena minus 25 lalu nol | Gabungan Hearts of Iron IV dan Victoria 3 [V] |
| **Kapasitas pantai** | Satu sampai tiga tumpukan serentak per provinsi pesisir | Total War [V] |
| Syarat supremasi | **Cukup tidak ada kapal perang musuh di zona pesisir tujuan** saat pendaratan | Berbeda dari Hearts of Iron IV yang menuntut lebih dari 50 persen supremasi di semua zona, karena syarat itu **mustahil dipenuhi di peta kepulauan dengan 130 zona pantai** dan akan mengunci pemain Indonesia dari operasi amfibi sama sekali |

Aturan HP transit 27 persen inilah yang **membuat blokade dan pencegatan konvoi mematikan tanpa perlu aturan tambahan**.
