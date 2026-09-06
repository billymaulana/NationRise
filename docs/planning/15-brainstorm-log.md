# Log Sesi Brainstorming

> Sumber: plan riset Nation Rise, sesi 2026-09-03 sampai 2026-09-04, bagian 8. Dokumen ini bagian dari `docs/planning/`; indeks dan aturan kerja ada di `README.md`. Nomor "bagian N" yang dirujuk di dalam teks mengacu ke penomoran plan asli; petanya ada di README.

## 8. Log Sesi Brainstorming (dicatat kronologis)

### Sesi 1, 2026-09-03 malam
**Permintaan awal Billy:** game simulasi negara, pilih negara nyata, ekspansi, perang, diplomasi, riset teknologi dan militer, geopolitik; medium (tidak terlalu kompleks, mudah, tidak ribet) tapi strategi kuat; full clone gameplay CoN; adopsi ide Realpolitiks 3, Ages of Conflict, Victoria 3; offline; level kesulitan; data negara realistis (lokasi, bendera, resources, organisasi, doktrin militer, general saja); plan dan catat dulu, jangan langsung mengerjakan; bantu riset dan petakan; referensi wiki CoN dan 80 screenshot.

**Tambahan Billy:** riset game lain bebas; ringan di laptop, tidak lag; penyimpanan lokal dulu; grafis sebisa mungkin seperti screenshot; desktop atau web boleh.

**Pertanyaan 1 (model waktu):** ditawarkan real-time dipercepat + pause (rekomendasi) / turn-based / real-time lambat ala CoN. **Jawaban:** "realtime bisa dipercepat dan pause atau saved".

**Pertanyaan 2 (cakupan peta):** seluruh dunia dengan provinsi (rekomendasi) / satu region dulu / dunia tanpa provinsi. **Jawaban:** "seluruh dunia dengan provinsi dan kota besar".

**Pertanyaan 3 (bahasa UI):** **Jawaban:** Indonesia + English, i18n dari awal.

**Pertanyaan 4 (distribusi):** **Jawaban:** hanya untuk dimainkan sendiri.

### Sesi 2, 2026-09-04 dini hari
**Pertanyaan 5 (tech stack):** ditawarkan Vue 3 + Vite + PixiJS v8 (rekomendasi) / sama + Tauri v2 / Godot 4. **Jawaban:** "riset lagi" → riset lanjutan dijalankan (bagian 9).

**Pertanyaan 6 (visual unit):** ditawarkan counter 2D + ikon flat (rekomendasi) / sprite isometrik pre-render / model 3D three.js. **Jawaban:** "mix 2d dan 3d, tapi tidak berat" → menjadi kebutuhan desain: unit 3D low-poly ringan (instanced) + counter 2D, peta 2D.

**Pertanyaan 7 (skala waktu 1x):** ditawarkan 1 hari = 2 menit (rekomendasi) / 5 menit / 1 menit. **Jawaban:** "riset kembali" → riset lanjutan dijalankan (bagian 10).

**Pertanyaan 8 (scope v1):** ditawarkan CoN + paket adopsi penuh (rekomendasi) / semua / minimal. **Jawaban:** "mulai planning dulu jangan mengerjakan, selalu catat plan dan sesi brainstorming. nanti akan ada instruksi ketika akan mengerjakan" → scope v1 belum diputuskan; plan akan memuat rekomendasi berfase dengan alternatif. **Aturan kerja tetap:** tidak ada implementasi sampai instruksi eksplisit; semua plan dan sesi brainstorming dicatat.

### Sesi 3, 2026-09-04
**Billy menetapkan aturan proyek:** selalu update draft plan dengan jawaban Claude, keinginan Billy, dan bahan lain (dicatat di 2.1).

**Billy menyerahkan bahan riset:** transkrip sesi brainstorming dengan ChatGPT (lima putaran: nama game → planning awal → fokus ekspansi, armada, fantasi Indonesia superpower → strategi perang ala Al-Fatih dan Salahuddin → planning ulang → negara lain juga bisa dipilih → scenario/era termasuk Majapahit → kustomisasi identitas negara pemain saja) dan file `~/Downloads/exportcsvbbb/Nation Rise_Game_Design_Document.md` (GDD v0.1, 48 bagian + 3 appendix). Diringkas dan direkonsiliasi di bagian 15.

**Pertanyaan 9 (model combat):** ditawarkan taktik emergent dari manuver peta (rekomendasi) / layar battle terpisah / hybrid stance. **Jawaban:** "riset dulu, dan setiap anda bertanya dan menanyakan preferensi simpan pertanyaan anda dan jawaban saya namun jangan dijadikan patokan agar brainstorming lebih luas" → aturan 2.1 nomor 5; riset lanjutan model combat dijalankan (bagian 16).

**Pertanyaan 10 (resource):** ditawarkan 7 CoN (rekomendasi) / 3 / 5. **Jawaban:** "coba anda riset dan detailing dulu opsi opsinya" → riset lanjutan model resource dijalankan (bagian 17).

**Pertanyaan 11 (era dan waktu):** ditawarkan v1 Modern saja dengan era pack sebagai data (rekomendasi) / Modern + WWII / kampanye lintas abad. **Jawaban:** "saya ingin ada pilihan modern, masa perang dunia 1 dan 2, dan masa masa custom silahkan riset dan baca kembali full brainstorming saya dan chat gpt" → **keinginan tercatat: scenario Modern, PD1 1914, PD2 1939, dan scenario custom.** Riset lanjutan sistem era, data historis, dan custom dijalankan (bagian 18). Interpretasi "masa custom" (preset alt-history seperti Majapahit 1350, editor scenario, sandbox acak, modding) akan dirinci sebagai opsi, belum diputuskan.

**Pertanyaan 12 (fantasi peradaban kuno):** ditawarkan toggle opsional late-game (rekomendasi) / inti sejak v1 / dibuang. **Jawaban:** "saya ingin planning yang jelas tidak ada kata nanti saja di fase 2. hal ini coba anda riset dulu dan simpan pertanyaannya agar anda tidak langsung mengerjakan tapi memahami dulu hingga plan dirasa sudah lengkap dan instruksi pengerjaan nanti ketika saya instruksikan" → aturan 2.1 nomor 6 dan 7; riset lanjutan lapisan fantasi dijalankan (bagian 19).

**Hasil riset yang masuk pada sesi 3:** mekanik wiki CoN (bagian 5), tech stack (bagian 9), skala waktu (bagian 10), lalu model combat (16), model resource (17), sistem era (18), lapisan fantasi (19).

**Pertanyaan 19 (perlakuan rekomendasi riset 5, 7, 9, 10):** ditawarkan terima semua sementara / sebagian / tetap terbuka. **Jawaban:** "Terima semua sebagai keputusan sementara" → tech stack three.js + Vue + Web Worker; 1 hari game = 5 menit pada 1x; combat A + C; resource Money + Manpower + ≤5 goods per era (Modern = 7 CoN). Semua bisa diubah.

**Pertanyaan 20 (arti "masa custom", multi):** **Jawaban:** keempatnya masuk rencana: modding folder era pack, editor scenario in-game, preset alt-history era pack (Cold War 1962, Napoleonic 1803, Age of Sail 1600, Majapahit 1350, Ancient), sandbox acak.

**Pertanyaan 21 (Legends):** **Jawaban:** "B dulu, lalu A sebagai toggle" → alt-history realistis (national focus, Heritage Sites) sebagai fondasi, lalu mode Legends yang bisa dinyalakan; Historical mode tetap murni; C tidak dikerjakan kecuali A lolos playtest.

**Pertanyaan 22 (dokumen):** **Jawaban:** "Tulis ke docs/planning/ sekarang" (hanya dokumen markdown, tanpa kode, tanpa scaffolding, tanpa git init).

### Sesi 4, 2026-09-04 siang (setelah dokumen ditulis)
**Masukan Billy:** "Tidak harus clone penuh, mekanik war perlu riset kembali apakah auto saja cukup strategi atau bagaimananya. Di CoN saya sangat malas memindahkan kapal dan prajurit karena lama."

**Yang berubah:** keputusan D02 direvisi (CoN = basis, bukan kewajiban clone penuh). Keputusan sementara D15 (combat A + C) berstatus **ditinjau ulang** sampai riset tingkat otomasi perang selesai. Dua masalah dipisahkan: (i) waktu tempuh unit terasa lama, (ii) jumlah perintah manual yang harus diberikan.

**Pertanyaan 23 (tingkat kontrol perang):** riset dijalankan untuk empat tingkat: L1 manual berbantuan (QoL kuat), L2 perintah front dan theater ala Hearts of Iron dan Victoria 3, L3 Operation planner (operasi berprasyarat seperti Blokade, Pendaratan, Pincer, Feint yang dieksekusi sim), L4 otomatis penuh ala Ages of Conflict dan Supreme Ruler. Hasil dicatat di `18-research-war-automation.md`; jawaban Billy akan dicatat di sini.

**Pertanyaan 23 (model kontrol perang):** ditawarkan berlapis (front order default + kartu operasi + override + delegasi per front) / kartu operasi murni / otomatis penuh / manual berbantuan. **Jawaban:** "Berlapis: front order default + kartu operasi + override + delegasi" → keputusan sementara D20.

**Pertanyaan 24 (mitigasi waktu tempuh, multi):** ditawarkan fast forward sampai tiba + auto-pause / strategic redeployment rel-udara / redeployment antar pangkalan laut berbiaya / tidak perlu. **Jawaban:** fast forward sampai tiba + auto-pause saat tiba atau kontak, dan strategic redeployment via rel atau udara. Redeployment laut berbiaya **tidak dipilih** → keputusan sementara D21.

**Masukan Billy (sesi 4, lanjutan):** "tolong riset stack game, saya merasa jika typescript mungkin kurang ideal. rekomendasikan yang terbaik." → keputusan sementara D13 (three.js + Vue + TypeScript) berstatus **ditinjau ulang**. Riset netral lintas bahasa dan engine dijalankan (Godot C#/GDScript, Tauri + inti Rust, Bevy, Unity 6, web TS, dan lainnya) dengan kriteria RAM 8 GB, performa simulasi 2.000 provinsi × 195 AI, produktivitas UI panel padat, determinisme, modding, kurva belajar dari latar Vue/TS. Hasil dicatat di `19-research-engine-stack.md`.

**Pertanyaan 25 (stack engine dan bahasa):** ditawarkan web TypeScript arsitektur siap-Rust (rekomendasi produktivitas) / Godot 4.7 + C# (kualitas jangka panjang) / Tauri + inti Rust sejak awal / Godot GDScript saja. **Jawaban:** "Web TypeScript, arsitektur siap-Rust" → D13 dikonfirmasi ulang dengan syarat arsitektur siap-D dan gerbang keputusan terukur (D22).

### Sesi 5, 2026-09-04
**Masukan Billy:** "Yang masih terbuka dan perlu jawaban sebelum fase 1: P14 dan P17. Sisanya kalibrasi saat fasenya tiba. Lakukan riset yang belum dan hal-hal yang perlu diperjelas terkait game agar planning lebih detail dan siap, termasuk ide-ide dari Anda. Jangan menyodorkan opsi lewat widget; tulis di chat saja agar jawaban saya dan opsi Anda tercatat. Buat rules ini di project."

**Aturan baru nomor 8** ditambahkan (pertanyaan dan opsi di chat). **Riset yang dijalankan:** kebijakan batas sengketa 2026 (P14); granularitas provinsi, sub-split hot-zone PD1/PD2 (P17), aturan pemilihan kota, zona laut, sumber data terrain; dataset negara untuk doktrin, persona AI, label kesulitan, tier militer awal; baseline stat unit Modern dan kalibrasi VP. **Dokumen ide dan klarifikasi** dari asisten ditulis di `20-design-ideas-clarifications.md`. Pertanyaan untuk Billy ditulis di chat dan disalin ke log ini setelah riset masuk.

**Masukan Billy (sesi 5, lanjutan) — target waktu nyata:** "Waktu selama membangun paling lama: 10 menit. Dan waktu perjalanan (jika dari Indonesia sebisa mungkin di bawah 2 menit untuk antar pulau Indonesia). Dan 1 hari di game adalah 1 jam di dunia nyata (24x), bagaimana menurutmu, tolong kritis dan beri saran dan riset."

**Analisis asisten (P41):** ketiga angka saling bertabrakan secara aritmetika. Pada 1 hari game = 1 jam nyata, 1 jam game = 2.5 menit nyata, sehingga Army Base L2 (28 jam game) = 70 menit dan Arms Industry L5 (48 jam game) = 120 menit — tujuh sampai dua belas kali di atas batas 10 menit yang Billy tetapkan sendiri. Sebaliknya pada rencana yang sudah ada (1 hari = 5 menit, 1 jam game = 12.5 detik), Arms Industry L5 = tepat 10.0 menit dan mobilisasi infanteri = 4.1 menit, jadi **target 10 menit sudah terpenuhi tanpa mengubah durasi CoN**, asalkan tidak ada item melebihi 48 jam game. Target perjalanan di bawah 2 menit adalah masalah terpisah: itu variabel **kecepatan unit**, bukan skala waktu, dan CoN sengaja memperlambat unit karena rondenya berminggu-minggu. Riset kecepatan gerak unit dijalankan (`25-research-movement-speed.md`). Usulan resolusi: pertahankan 1 hari = 5 menit sebagai acuan, tambahkan "Ambient 60 menit per hari" sebagai kecepatan paling lambat (angka Billy) untuk main sambil ditinggal, kalibrasi kecepatan unit dari km per jam nyata, dan andalkan kecepatan 2x sampai 4x sebagai mode main normal. Jawaban Billy akan dicatat di sini.

**Masukan Billy (sesi 5, lanjutan):** "saya ingin riset senjata militer dan pohon tree teknologi lengkap seperti di CoN dan lain lain, dan di game lain dan di dunia nyata untuk militer dari infantry, armored, support, helicopter, fighter, heavies, naval, submarine, missile, officer, seasons seperti di CoN, loadout. selengkap lengkapnya." Ditambah aturan: **"rules delegate agent jika memang perlu untuk riset"** (aturan 9).

**Riset yang dijalankan (empat agen paralel):** (A) darat — Infantry, Armored, Support; (B) udara — Helicopter, Fighter, Heavies; (C) laut dan misil — Naval, Submarine, Missile; (D) Officer, Seasons dan Elite, Loadout dan deployables, plus struktur pohon teknologi lintas game. Hasil ditulis ke `30-` sampai `33-research-military-roster-*.md`.

**Hasil empat riset militer (sesi 5, 2026-09-05).** Ditulis ke `30-` sampai `33-`. Temuan lintas agen yang paling menentukan: **wiki Conflict of Nations punya tabel angka lengkap hanya untuk lima halaman infanteri dan Main Battle Tank; seluruh unit udara (17 halaman) dan seluruh unit laut (26 halaman) kosong dari angka.** Artinya angka untuk kedua kategori itu harus dirancang sendiri, dan dokumen `31-` serta `32-` sudah memuat rancangan lengkapnya, dikalibrasi ke jangkar Airmobile Infantry dan Naval Infantry. Koreksi terhadap catatan lama: empat unit darat yang tercatat di daftar bobot kerusakan tidak ada di wiki; nama officer yang benar adalah Tank Commander, Submarine Commander, dan Naval Officer; dan Nuclear Warhead menuntut Arms Industry level 2, bukan 1. Dua belas keputusan baru dicatat sebagai D35 sampai D46, ditambah enam keputusan laut sebagai D47 sampai D52.

**Masukan Billy (sesi 5, lanjutan kedua):** "tidak ada doktrin ke empat, sesuai realitas saat ini. jika ada doktrin ke 4 harus berdasarkan riset, dan data. mungkin berlaku di periode dulu. coba lengkapi data CoN check lagi disini: https://wiki.conflictnations.com/ https://conflictnations.fandom.com/wiki/Home_Page" Menjadi **D53**. Dua URL yang diberikan adalah **domain yang belum pernah dicoba**: riset sebelumnya memakai `conflictofnations.wiki.gg` dan mencoba `conflictofnations.fandom.com` (402), sedangkan yang diberikan Billy adalah wiki resmi Bytro `wiki.conflictnations.com` dan `conflictnations.fandom.com` tanpa kata "of". Empat agen dijalankan ulang untuk melengkapi angka yang hilang.
