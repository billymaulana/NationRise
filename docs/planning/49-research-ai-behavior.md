# Riset Kecerdasan Buatan

> Sesi 5 (2026-09-06). Item ketiga dari urutan yang disetujui Billy. Semua angka bertanda [V] terverifikasi dari sumber yang disebut; [USULAN] adalah rancangan kita sendiri.

## 1. Temuan yang mengubah arah

### 1.1 Kompetensi mengalahkan bonus dengan selisih yang tidak dekat [V]

StarNet adalah mod kecerdasan buatan Stellaris yang penulisnya menyatakan tegas: *"starnet does not add any bonuses to AIs, everything on this list is achieved in a fair fashion."*

Hasil terukurnya, pada **Ensign yang merupakan tingkat dengan bonus nol**:

| Ukuran | StarNet berbanding AI bawaan |
|---|---|
| Skor ekonomi | **3 kali** |
| Skor sains | **4 kali** |
| Armada | **8 sampai 15 kali** |

Bandingkan dengan bonus penuh Grand Admiral, yaitu tingkat tersulit Stellaris: efisiensi kerja **+100%** dan kapasitas armada **+60%**.

**Kompetensi murni menghasilkan delapan sampai lima belas kali, sementara bonus terbesar yang berani diberikan game AAA hanya sekitar dua kali.** Ini argumen terkuat untuk arah Nation Rise, dan kita berada di sisi yang tepat tanpa pengorbanan apa pun: gerbang performa memberi anggaran 500 milidetik dan kita baru memakai 6,9.

Yang diubah StarNet seluruhnya berupa keputusan, bukan angka bonus: ekonomi yang tidak jatuh ke krisis, pemulihan yang benar-benar terjadi, teknologi yang dipilih menurut kegunaan (*"Default AI picks techs more or less at random"*), spesialisasi planet, dan komposisi armada yang koheren.

### 1.2 Masalah "kecerdasan buatan curang" adalah masalah keterbacaan, bukan keseimbangan [V]

Ini pergeseran pendirian yang penting, dan sumbernya Soren Johnson, pemrogram kecerdasan buatan Civilization III sekaligus perancang utama Civilization IV.

Firaxis menjamin bahwa kecerdasan buatan Civilization III memperlakukan lawan manusia dan komputer secara identik dalam diplomasi. **Mereka tetap dituduh curang.** Sebabnya: kecerdasan buatan meniru taktik berdagang manusia, hasilnya semua negara komputer berada di tingkat teknologi mirip, dan pemain menyimpulkan ada persekutuan rahasia antar-komputer.

Tanggapan mereka untuk Civilization IV, dikutip persis: *"we intentionally crippled the AI's ability to trade with one another."* **Mereka melumpuhkan kecerdasan buatan demi persepsi, bukan demi keseimbangan.**

Data agenda Civilization VI menunjukkan hal yang sama dari arah berbeda:

| Yang diingat pemain | Nilai sebenarnya | Selisih |
|---|---|---|
| "different government −20" | **−6** | pemain mengingat **3,3 kali lebih besar** |

Penyebabnya bukan besarnya angka, melainkan **frekuensi pemberitahuan** dan **kedekatan dengan ambang perubahan sikap**: satu modifier −6 menutup sekitar 40 persen jarak dari Netral ke Tidak Bersahabat.

Uji akhir Johnson, yang saya usulkan menjadi kriteria penerimaan kita: *"The question is not whether the AI is playing fairly but what is the game experience for the player? If questions of fairness keep creeping into the player's mind, the game needs to be changed."* — **"When the question is one of fairness, the player is always right."**

### 1.3 Tetesan diterima, bongkahan ditolak [V]

Johnson memisahkan dengan tajam apa yang diterima komunitas Civilization dan apa yang tidak, meskipun nilai totalnya sama:

| | Contoh | Alasan |
|---|---|---|
| **Diterima** | diskon biaya unit dan bangunan bertingkat | *"Because of their incremental nature, these cheats have never earned much ire"* |
| **Ditolak** | unit gratis di bawah kabut perang | *"clearly showed how the computer was playing by different rules"* |
| **Ditolak keras** | Wonder instan gratis | *"While an AI beating the human to a Wonder using the slow drip of steady bonuses was acceptable, granting it the Wonder instantly felt entirely different."* |

---

## 2. Titik simetris yang harus punya nama [V]

Civilization IV tingkat Noble adalah titik simetris sempurna:

| Parameter | Noble |
|---|---|
| `iAIGrowthPercent`, `iAITrainPercent`, `iAIConstructPercent`, `iAIUnitCostPercent` | **100** |
| `iResearchPercent` (manusia) | **100** |

Naik tingkat bekerja **dua arah**: kecerdasan buatan mendapat diskon sampai 60 persen di Deity, dan manusia mendapat penalti riset sampai 130 persen. Civilization VI membuang simetri ini; tingkat Prince yang dianggap bawaan **sudah memberi kecerdasan buatan +20 persen produksi dan emas**.

GalCiv II memakai pola serupa dengan nama berbeda: separuh bawah tangganya adalah kecerdasan buatan yang **dilemahkan** (ekonomi 10 sampai 100 persen, algoritma tingkat tinggi dimatikan), dan tingkat *Intelligent* adalah **kecerdasan buatan utuh dengan nol bonus**. Baru di atas itu bonus dimulai.

**Pelajarannya: harus ada satu tingkat yang benar-benar seratus berbanding seratus di setiap kolom, dan tingkat itu harus punya nama** agar pemain tahu kapan ia bermain adil.

---

## 3. Tangga kesulitan yang diusulkan [USULAN]

| Tingkat | Bonus kecerdasan buatan | Kompetensi | Handicap pemain |
|---|---|---|---|
| **Damai** | tidak ada | **dicabut sebagian**: perencanaan satu langkah, tanpa koalisi, tanpa invasi laut | +30% produksi, +15% riset |
| **Standar** | tidak ada | perilaku penuh tanpa lookahead | tidak ada |
| **Setara** | **nol, semua kolom seratus persen** | **penuh**: lookahead dua langkah, koalisi aktif, intel berbagi dalam blok | **nol, semua kolom seratus persen** |
| **Berat** | nol | + koordinasi front lintas sekutu, + pemilihan waktu serangan menurut siklus produksi pemain | −15% produksi, −20% riset |
| **Ekstrem** | **+15% keluaran industri, ditampilkan di layar negara** | penuh | −25% produksi, −30% riset |

Empat prinsip yang menopangnya:

**Tingkat Setara diberi nama.** Inilah Noble-nya Civilization IV. Tanpa titik bernama, pemain tidak pernah bisa yakin sedang bermain adil.

**Kesulitan naik lewat handicap pemain, bukan bonus lawan.** Mengikuti Hearts of Iron IV, yang bahkan pada tingkat Elite hanya memberi kecerdasan buatan pengurangan konsumsi bahan bakar 50 persen; sisanya seluruhnya penalti pemain. Pemain tidak bisa menuduh curang kalau lawannya tidak menerima apa pun.

**Kesulitan rendah berarti kompetensi dicabut**, mengikuti AI War dan GalCiv II, bukan sekadar bonus untuk pemain.

**Bonus di Ekstrem harus menetes, bukan bongkahan**: +15 persen mengalir tiap tick, **tidak pernah** berupa hadiah sekali jalan seperti pabrik gratis atau teknologi gratis.

### 3.1 Dua larangan keras

**Jangan pernah memberi kecerdasan buatan diskon pada sistem konsekuensi.** Europa Universalis IV memberi pengurangan 33 persen dampak ekspansi agresif pada tingkat sulit. Itu bukan bonus produktivitas, melainkan **menghapus rem yang tetap terpasang di pemain**. Nation Rise tidak boleh menyentuh akumulator agresi, ambang koalisi, atau peluruhan opini.

**Jangan pernah memberi penyelamatan tak terlihat.** Wiki Stellaris menyatakan: *"On higher difficulties, AI players will be allowed to buy resources completely for free."* Ini kebalikan sempurna dari transparansi. Kalau kecerdasan buatan kita tidak bisa mengelola ekonominya, perbaiki perencanaannya, jangan beri barang gratis.

---

## 4. Aturan terbuka sebagai pengganti kepintaran tersembunyi [V]

Stellaris menerbitkan ambang keputusan kecerdasan buatannya secara terbuka, dan justru itu yang membuatnya terasa adil:

| Aturan | Ambang |
|---|---|
| Menyerang sistem | kekuatan armada **20 persen** lebih besar |
| Mundur dari pertempuran | setelah kehilangan **50 persen** armada |
| Menyatakan perang | memakai ≥**50 persen** kapasitas armada **dan** punya ≥**6** pasukan serbu |
| Kolonisasi | kelayakan huni ≥**35 persen** |
| Klaim sistem | maksimal **4** lompatan dari wilayah sendiri |

Pemain bisa mempelajari, memprediksi, bahkan mengeksploitasinya, dan itulah yang membuatnya adil. Bandingkan dengan pembelian gratis di pasar, yang tidak bisa dipelajari sama sekali.

---

## 5. Momentum dan penghindaran osilasi

### 5.1 Jangkar yang benar [V]

Rancangan awal kami memakai momentum +12 sampai +18. **Itu terlalu kecil.** Tiga sumber independen bermuara ke angka yang jauh lebih besar:

| Sumber | Nilai | Bentuk |
|---|---|---|
| Civilization V, kode sumber Firaxis | `AI_GRAND_STRATEGY_CURRENT_STRATEGY_WEIGHT` = **50** pada skala 0 sampai 100, kunci 10 giliran | aditif |
| Hearts of Iron IV | `FOCUS_TREE_CONTINUE_FACTOR` = **1,5** | pengali |
| Hearts of Iron IV | `REASSIGN_TO_ANOTHER_FRONT_FACTOR` = **0,5** | pengali terbalik, setara dua kali untuk bertahan |

**Penantang harus unggul sekitar lima puluh persen untuk merebut keputusan yang sedang berjalan.**

Catatan: angka "1,1 sampai 1,5 kali" yang sering beredar untuk momentum utility AI **tidak ditemukan di sumber mana pun** setelah penelusuran Dave Mark, seluruh seri Game AI Pro, dan empat pustaka utility AI sumber terbuka. Jangan dipakai sebagai jangkar.

### 5.2 Kunci sebanding dengan biaya pembalikan [V]

Civilization V memberi tiap strategi `MinimumNumTurnsExecuted` sendiri, dengan komentar kode *"don't want the AI starting then stopping Strategies every turn"*:

| Strategi | Kunci minimum | Interval cek |
|---|---|---|
| `NEW_CONTINENT_FEEDER` | **100** giliran | 50 |
| `LAKEBOUND` | 75 | 1 |
| `ENOUGH_SETTLERS` | 20 | 5 |
| `FOUND_CITY` | 10 | 3 |
| `EARLY_EXPANSION` | **1** | 1 |

Dua pelajaran: **kunci sebanding biaya pembalikan**, dan **kunci terpisah dari interval cek ulang**.

### 5.3 Tabel keputusan Nation Rise [USULAN, direvisi]

| Keputusan | Biaya pembalikan | Momentum | Kunci | Interval cek | Zona mati |
|---|---|---|---|---|---|
| Menyatakan perang | sangat tinggi | **+35** | 720 tick (30 hari) | 168 tick | **60** (masuk 65, batal 5) |
| Memilih sasaran | sangat tinggi | +30 | 720 tick | 168 tick | 40 |
| Postur front | rendah sedang | +15 | 72 tick | 24 tick | 18 |
| Ekonomi vs militer | tinggi | ×1,5 pada rasio berjalan | — | 168 tick | batas ±5 poin per 168 tick |
| Menerima damai | terminal | +25 | 168 tick | 168 tick | 25 |
| Membentuk aliansi | tinggi | +30 | 2.880 sampai 5.760 tick bila ditolak | 24 tick | **60** |
| Bergabung koalisi | tinggi | +25 | 1.440 tick | 168 tick, offset `id mod 168` | 30 |
| Alokasi tumpukan | sedang | **×2 untuk bertahan** | sampai redeploy selesai | 6 tick | 20 |

### 5.4 Dua kurva respons [V, Guild Wars 2]

| Kurva | Rumus | Kegunaan |
|---|---|---|
| **Runtime** | `y = 1 − x⁶` | tetap tinggi lalu **jatuh tajam** saat aksi berjalan terlalu lama; untuk postur serang yang tidak menghasilkan dan perang berlarut |
| **Cooldown** | `y = x⁵` | nyaris nol lalu **melonjak** di akhir; *"useful for avoiding strobing between two otherwise competing decisions"* |

### 5.5 Kalibrasi silang dari luar dunia game [V]

Sanity check bahwa angka kita berada di pita wajar:

| Sistem | Parameter | Nilai |
|---|---|---|
| BGP route flap damping | suppress berbanding reuse | 2.000 berbanding 750, rasio **2,7 kali** |
| HAProxy health check | fall berbanding rise | **3 berbanding 2** |
| Kubernetes HPA | jendela stabilisasi turun berbanding naik | **300 detik berbanding 0** |
| Kubernetes HPA | toleransi | **10 persen** |
| DQN | frame skip | **4** |

Polanya seragam: **ambang keluar selalu lebih longgar daripada ambang masuk, dengan lebar sekitar dua sampai tiga kali.**

### 5.6 Tidak ada yang sudah menyelesaikan ini [V]

Penelusuran empat pustaka utility AI populer untuk kata kunci osilasi:

| Pustaka | Bintang | Hasil |
|---|---|---|
| `zkat/big-brain` (Bevy) | 1.302 | hanya **TODO** |
| `igiagkiozis/CrystalAI` | 472 | nol |
| `DreamersIncStudios/ECS-IAUS-sytstem` | 168 | nol |
| `ProjectBorealis/IAUS` | 78 | nol |

Komentar di `big-brain/src/thinker.rs` baris 511: *"TODO: we do need some kind of oscillation protection so we're not just bouncing back and forth between the same couple of actions."*

**Pustaka utility AI terpopuler untuk Bevy mengakui belum punya proteksi osilasi.** Artinya rancangan kita sudah lebih matang daripada yang tersedia siap pakai, tetapi juga tidak ada implementasi rujukan untuk ditiru. Metrik uji menjadi satu-satunya cara mengetahui apakah berhasil.

---

## 6. Agenda: yang menentukan rasa bukan angkanya

Data Civilization VI: **50 dari 101 modifier agenda bernilai tepat plus atau minus enam**. `AGENDA_DIFFERENT_GOVERNMENT` bernilai −6. Qin bernilai +8 dan −12.

Namun pemain mengingatnya tiga koma tiga kali lebih besar. Penyebabnya frekuensi pemberitahuan dan kerapatan ambang sikap, bukan magnitudo.

**Dua batasan yang harus ditegakkan:** maksimum **satu pemberitahuan agenda per negara per tiga puluh hari game**, dan satu pemicuan agenda **tidak boleh menutup lebih dari dua puluh lima persen** jarak antar ambang sikap.

---

## 7. Metrik uji yang bisa diperiksa [USULAN]

| # | Metrik | Sasaran |
|---|---|---|
| 1 | Perang per kampanye | 3 sampai 8 |
| 2 | Negara bertahan sampai akhir | ≥60 persen |
| 3 | Perang berakhir damai, bukan penaklukan total | ≥40 persen |
| 4 | Pengepungan per perang besar | 1 sampai 3 |
| 5 | Penyergapan terpicu | ≤30 persen pertempuran |
| 6 | Sebaran postur | tidak ada postur melebihi 60 persen |
| 7 | Pembalikan keputusan per negara per 30 hari | ≤2 |
| 8 | **Selisih persepsi agenda** | ≤1,5 kali (Civilization VI mencapai 3,3) |
| 9 | Pemberitahuan agenda per negara per 30 hari | ≤1 |
| 10 | Jarak antar ambang yang ditutup satu pemicuan | ≤25 persen |

Dan satu uji kualitatif sebagai kriteria penerimaan tertinggi: **catat setiap kali penguji menyebut kata curang atau tidak adil tanpa diminta.** Bila frekuensinya tidak nol pada tingkat Setara, tempat kecerdasan buatan benar-benar tidak menerima apa pun, maka masalahnya keterbacaan dan menyetel bobot tidak akan memperbaikinya.

---

## 8. Konsekuensi paling murah dari seluruh riset ini

Setiap keputusan besar kecerdasan buatan, yaitu deklarasi perang, bergabung koalisi, dan penolakan damai, harus **bisa dibuka isinya oleh pemain**: pertimbangan apa saja yang masuk, berapa skor masing-masing, dan mana yang menentukan.

Kita sudah menghitung angka itu untuk mengambil keputusan. **Menampilkannya nyaris gratis, dan itu satu-satunya cara yang terbukti menghentikan pertanyaan keadilan sebelum ia terbentuk.**
