# Riset E: Sesi Brainstorming ChatGPT dan GDD v0.1

> Sumber: plan riset Nation Rise, sesi 2026-09-03 sampai 2026-09-04, bagian 15. Dokumen ini bagian dari `docs/planning/`; indeks dan aturan kerja ada di `README.md`. Nomor "bagian N" yang dirujuk di dalam teks mengacu ke penomoran plan asli; petanya ada di README.

## 15. Riset E: Sesi Brainstorming ChatGPT dan GDD v0.1 (bahan dari Billy, sesi 3)

### 15.1 Sumber
Transkrip lima putaran tanya-jawab Billy dengan ChatGPT dan file GDD v0.1 (48 bagian). Bahan ini dibuat **sebelum** Billy memutuskan "full clone gameplay CoN", jadi beberapa asumsinya (3 resource, turn per tahun, 100 sampai 200 region) sudah dilampaui oleh keputusan di bagian 2. Yang diambil adalah **ide produk dan fantasi**, bukan angka mekaniknya.

### 15.2 Ide inti yang dibawa ChatGPT/GDD
1. **Identitas produk:** "Choose your era. Choose your nation. Build its power. Master the art of war. Conquer territory. Transform your nation. Rewrite history." Lima pilar: Warfare (10/10), Expansion (10/10), Military Building (10/10), Nation Development (8), Technology (8); Politics 3, Diplomacy 4, Lore 4.
2. **Fantasi awal Billy:** Indonesia menjadi superpower; segala hal Indonesia maju; sejarah tersembunyi ternyata kekuatan mengerikan. Diselesaikan menjadi: **semua negara bisa dipilih**, Indonesia/Nusantara adalah faksi dengan jalur fantasi paling unik, bukan protagonis tunggal.
3. **Strategi perang ala sejarah** (Al-Fatih 1453, Salahuddin di Hattin): posisi, medan, timing, pengepungan, manuver, logistik, deception. 6 sampai 8 taktik: Frontal Assault, Flanking, Encirclement, Ambush, Siege, Naval Invasion, Blockade, Strategic Retreat. Terrain berdampak (Plains, Mountain, Forest, Jungle, Desert, Coast, Strait, Island). **Supply** dan **Morale** stack: musuh bisa retreat/rout/surrender sebelum habis. **Fog of war**: kekuatan musuh tampil sebagai rentang (~70 sampai 100) sampai di-scout. **Commander** per army dengan trait (+15% Defense, +20% Mountain) dan doktrin komandan (Aggressive / Defensive / Strategist / Naval).
4. **Navy sebagai signature:** fleet mission (Patrol, Escort, Raid, Blockade, Naval Battle, Invasion); naval invasion dengan diversion sebagai momen puncak; cocok untuk Nusantara.
5. **Scenario/era system:** Modern 2026, WWII 1939, WWI 1914, Majapahit 1350, Age of Sail 1600, Napoleonic 1803, Ancient ~500 BCE. Setiap era mengubah cara main (roster, riset, tekanan historis, politik mengikuti era). Historical mode (baseline sejarah, boleh menyimpang) vs Sandbox mode. Urutan build: Modern → WWII → Majapahit → WWI → Age of Sail → sisanya.
6. **Alternate history + Chronicle:** "History is the record of what the player did." Chronicle mencatat event penting per tahun; victory screen "Your History" (years survived, territories, wars won, naval battles, capital, government, rank, motto).
7. **Player Nation Evolution (khusus pemain):** ganti nama, bendera (flag builder: pattern, warna, simbol), warna, lambang, motto, pemerintahan (Kingdom / Empire / Republic / Federation / Union dengan modifier ringan), pindah ibu kota (biaya, stabilitas turun, cooldown ~20 tahun, ibu kota punya fungsi administrasi/ekonomi/riset/komando), national focus (Military / Maritime / Industrial / Scientific / Imperial), doktrin, leader dengan trait. **AI identitas tetap**, hanya berubah lewat event terdesain.
8. **City level & specialization:** Settlement → Town → City → Major City → Metropolis; tipe Capital / Industrial / Port / Fortress / Resource; visual peta berubah saat kota naik level.
9. **Politik sebagai event** (Election, Coup, Protest, Reform, Succession, Scandal, Military pressure), diplomasi sangat sederhana (Friendly / Neutral / Hostile / Alliance / War; Trade, Alliance, Threaten, Declare War).
10. **AI personality:** Militarist, Defensive, Naval Power, Economic Power, Expansionist.
11. **World Threat:** koalisi global terbentuk saat pemain terlalu dominan.
12. **Victory conditions:** Domination (default), Military, Economic, Technology, Civilization (jalur rahasia).
13. **Fantasi peradaban kuno** sebagai late-game reward: Ancient Discovery → Ancient Engineering → Lost Maritime Knowledge → Unknown Energy → Ancient Weapon → ???; tiap faksi punya secret path sendiri (Nusantara Awakening, Han First Dynasty Archive, Albion Lost Fleet, dst).
14. **Yang dilarang dibangun awal:** pajak detail, individual citizens, parlemen, 20+ resource, supply chain detail, ratusan unit, pabrik individual, traffic, pasar ekonomi dalam, logistik realistis skala operasional, fisika naval, diplomasi kompleks.
15. **Pertanyaan terbuka GDD** yang relevan: real-time/turn/hybrid; UI battle dan tingkat kontrol taktis; jumlah region; visual style; nama final.

### 15.3 Pemetaan ke arah clone CoN
| Ide ChatGPT/GDD | Status di arah CoN | Rekonsiliasi yang direkomendasikan |
|---|---|---|
| Map first, 80% waktu di peta | Sama persis dengan CoN | Dipertahankan |
| Expansion dopamine loop, VP per kota | CoN sudah punya VP dan penaklukan provinsi | Dipertahankan; tambah ringkasan "hasil penaklukan" (populasi, resource, VP) |
| Warfare bukan sekadar power score | CoN sudah: armor class, terrain, stack efficiency, entrenchment | Diperkuat dengan **supply** dan **morale stack** (S1914 punya morale provinsi; supply diambil versi ringan) |
| 6 sampai 8 taktik sebagai pilihan eksplisit | CoN tidak punya layar battle; taktik muncul dari manuver peta | **Rekomendasi:** taktik **emergent**, bukan tombol: Encirclement = memutus semua provinsi tetangga milik musuh (supply 0), Flanking = serangan dari 2+ provinsi ke stack yang sama (bonus), Siege = serangan ke kota berbunker (durasi, bombardment), Blockade = fleet di zona laut pelabuhan (produksi dan supply turun), Naval Invasion = pendaratan amfibi dari kapal transport, Ambush = bonus defender di Forest/Jungle/Mountain terhadap penyerang tanpa recon, Strategic Retreat = mundur dengan penalti morale kecil. Tidak ada layar battle terpisah (ringan, konsisten CoN) |
| Terrain 8 tipe | CoN punya terrain modifier per unit | Sama; tambahkan **Strait** sebagai chokepoint laut dan **Island** yang butuh akses laut (sudah natural dari graph provinsi) |
| Fog of war rentang kekuatan | CoN punya intel/recon/radar dan stealth | Sama; tampilkan kekuatan musuh sebagai rentang sampai di-recon (versi ringan) |
| Commander per army | CoN punya Officers berrarity (premium) | Ubah menjadi **commander non-premium**: sedikit, dengan 2 sampai 3 trait terbaca, diperoleh lewat riset atau event; AI juga punya |
| Navy signature, fleet mission | CoN punya naval unit dan perintah, tanpa "mission" | Tambahkan **fleet stance**: Patrol, Escort, Blockade, Raid, Invade sebagai perintah tingkat stack |
| 3 resource (Treasury, Population, Resources) | Billy memilih full clone CoN: 7 resource | **7 resource dipertahankan untuk Modern.** Definisi resource dibuat data-driven per era pack sehingga era pra-industri bisa memakai set lebih kecil (mis. Food, Materials, Gold, Manpower) |
| Turn = 1 tahun (historis) / 1 bulan (WWI/II) | Billy memilih real-time dipercepat + pause | **Tegangan besar:** kampanye CoN berskala hari sampai bulan, kampanye Majapahit → 2026 berskala abad. Rekomendasi: **tick abstrak per scenario** (Modern: 1 tick = 1 jam game; era historis: 1 tick = 1 hari atau 1 minggu game) dengan durasi produksi/riset didefinisikan dalam tick. Diputuskan per era pack; Modern dulu |
| MVP 10 sampai 20 negara, 100 sampai 200 region | Billy memilih seluruh dunia dengan provinsi | Dunia penuh tetap tujuan v1; untuk **playtest awal** boleh flag "subset region" (mis. Asia Tenggara) tanpa mengubah data |
| Scenario/era system | Tidak ada di CoN | **Diadopsi sebagai kerangka produk.** Semua konten (peta politik, roster, riset, resource, events) dikemas sebagai **era pack** data-driven sejak fase 1; hanya Modern 2026 diisi di v1 |
| Player Nation Evolution | Tidak ada di CoN | **Diadopsi** (fase 7): nama, bendera builder, motto, pemerintahan, ibu kota berbiaya, national focus, doktrin; khusus pemain |
| Chronicle & "Your History" | CoN punya newspaper | Newspaper CoN tetap (harian); **Chronicle** sebagai ringkasan milestone kampanye (fase 7) |
| City level & specialization | CoN: kota punya VP, populasi, bangunan berlevel | Spesialisasi sudah emergent dari bangunan (Naval Base = port, Bunker = fortress, Arms Industry = industrial). Tambah **visual kota naik level** di peta sebagai polish |
| Government form + national focus | Tidak ada di CoN; mirip 3 slider ideologi (RP) | Government form ringan masuk fase 7; national focus menggantikan "policy slots" v2 |
| Politik sebagai event | Sama dengan rekomendasi RP3 ringan | v2 (~100 event) |
| Diplomasi 5 state sederhana | CoN lebih kaya (Right of Way, Shared Map/Intel, koalisi) | CoN dipertahankan; tambah Threaten sebagai pembuka crisis |
| AI personality 5 tipe | Riset D merekomendasikan archetype + agenda + utility | Sama; nama archetype mengikuti GDD |
| World Threat coalition | Sama dengan infamy + containment (Vic3) | Sama (fase 6) |
| Multiple victory | CoN hanya VP | VP tetap default; victory tambahan v2 |
| Fantasi peradaban kuno | Tidak ada; bertegangan dengan "realistis general" | **Late-game opsional**, dimatikan secara default dalam Historical mode, aktif sebagai toggle "Legends" (v2). Menjaga janji realisme tanpa membuang fantasi Billy |
| Faksi fiksional (Nusantara, Yamato, Albion) | Billy: negara nyata, bendera nyata | **Negara nyata dipakai.** Deskripsi negara dan bonus faksi ditulis dari data nyata (Indonesia: navy + resources + populasi, kelemahan logistik kepulauan) |

### 15.4 Tegangan yang perlu keputusan Billy (pertanyaan 9 sampai 12) — status: riset lanjutan berjalan
1. **Model combat:** taktik emergent dari manuver peta tanpa layar battle vs layar battle terpisah dengan pilihan taktik eksplisit vs hybrid stance. → Billy: riset dulu. Hasil di bagian 16.
2. **Resource:** 7 resource CoN vs 5 vs 3 vs variabel per era. → Billy: rinci opsinya. Hasil di bagian 17.
3. **Era dan waktu:** Billy ingin **Modern, PD1, PD2, dan custom**. Yang perlu dirinci: data batas historis, roster per era, model kalender per era, arti "custom". Hasil di bagian 18.
4. **Fantasi peradaban kuno:** toggle opsional vs inti vs dibuang, masing-masing dengan rencana lengkap. → Billy: riset dulu, rencana jelas. Hasil di bagian 19.

### 15.5 Dampak ke desain
- Bagian 11.3 mendapat sistem baru: **Supply**, **Morale stack**, **Commander**, **Fleet stance**, **Player Identity**, **Chronicle**, **Scenario/Era pack**.
- Bagian 12 arsitektur: content data dipisah per **era pack** (`content/eras/modern-2026/…`); core sim tidak tahu era, hanya membaca definisi.
- Roadmap (bagian 13) direvisi: fase 7 identitas dan Chronicle, fase 9 sampai 11 era pack dan fantasi. **Catatan aturan 2.1 nomor 6:** fase 9 sampai 11 harus diisi rencana konkret (data, sistem, UI, AI) setelah bagian 18 dan 19 masuk, bukan sekadar judul.

---
