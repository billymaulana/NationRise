# Roadmap Nation Rise

> Direvisi sesi 5 (2026-09-05) dengan kriteria terima konkret dari 18 laporan riset. Setiap fase mendapat plan tersendiri saat instruksi "kerjakan" diberikan. Rujukan `NN-...md` menunjuk dokumen riset di folder ini.

## Prinsip urutan
Modern 2026 dulu, buktikan bahwa menyerang dan menaklukkan itu menyenangkan, sebelum menambah era, identitas, dan lapisan legenda. Setiap fase punya **kriteria terima yang bisa diukur**, bukan sekadar "selesai".

## Fase 0: Dokumentasi dan keputusan (SELESAI)
30 dokumen di `docs/planning/`, 18 laporan riset, keputusan D01 sampai D34, 42 pertanyaan bertatus. **Kriteria terima:** GDD v0.3 memuat angka konkret untuk ekonomi, combat, VP, kecepatan, dan warna; tidak ada fitur yang hanya berupa kata "nanti".

## Fase 1: Data pipeline dan peta statis
**Langkah pertama sebelum apa pun:** jalankan `ogrinfo -dialect SQLite -sql "SELECT adm0_a3, COUNT(*) FROM ne_10m_admin_1_states_provinces GROUP BY adm0_a3 ORDER BY 2 DESC"`. Ini menjawab Britania Raya, Prancis, Italia, Spanyol, DR Kongo, Norwegia, Aljazair, dan Vietnam sekaligus, dan lebih otoritatif daripada sumber sekunder mana pun (`22-`).

Isi: unduh Natural Earth Admin-0 dan Admin-1 dan Populated Places; dissolve ke ~2.000 provinsi dengan tujuh invarian merge dan mapping CSV yang bisa diedit tangan; bangun adjacency darat; buat ~210 zona laut hybrid dengan 25 chokepoint manual dan aturan batas bersama di atas 25 km; klasifikasi terrain dari stack 1 km di EPSG:6933 dengan exactextract; pilih ~600 kota dan hitung VP dengan rumus logaritmik; rasterisasi province ID map; bangun palet warna dengan graph coloring jarak dua; render peta di three.js dengan lookup texture; hover, klik, zoom, dan layer owner; overlay dev F3.

**Kriteria terima:** 60 fps di M1 pada DPR 1,5 dengan 2.000 provinsi; kurang dari 50 draw call di zoom regional; gate warna ΔE2000 lolos termasuk setelah simulasi Machado di linear RGB; total VP Indonesia sama dengan 34; peta terbaca di WKWebView, bukan hanya Chrome.

**Keputusan yang dibutuhkan sebelum mulai:** tidak ada lagi. D26 sudah menetapkan de facto, dan sub-split hot-zone sudah dirinci di `22-` bagian 3.

## Fase 2: Waktu, ekonomi, dan save
Tick 1 jam game di Web Worker dengan fixed timestep dan bitecs; tangga kecepatan lima tingkat dengan auto-pause bertingkat; briefing harian; resource tujuh jenis dengan formula produksi terverifikasi (base 3.000, Electronics 0,25, popFactor linear di atas 5); morale dengan target per tipe provinsi; bangunan dengan biaya dan durasi Conflict of Nations; pasar dunia satu layar dengan MAPI 0,75, cap harian 12 persen, dan Rest of World yang terlihat; HUD resource bar dan panel kota; save dengan snapshot per 500 tick plus command log, ring buffer 20 plus 5, dan ekspor file.

**Kriteria terima:** delapan data point ekonomi Indonesia direproduksi persis di unit test; konstruksi terlama tepat 10 menit pada Normal; pasar tidak menyentuh clamp keras lebih dari 10 persen waktu dalam sim 100 hari; save dan load menghasilkan state identik bit demi bit (uji determinisme).

## Fase 3: Unit, mobilisasi, gerak, riset, dan QoL
Roster 31 unit dengan empat doktrin; antrean mobilisasi per kota; pathfinding A* di graph provinsi dan zona laut; kecepatan unit dengan base 120 km per jam game dan pengali terrain Conflict of Nations; grid riset dua slot dengan epoch gating; **QoL wajib**: lasso dan multi-select, attack-move, rally point, auto-embark, strategic redeployment rel dan udara, misi laut per zona, dan **fast forward sampai tiba dengan auto-pause**.

**Kriteria terima:** Jakarta ke Surabaya di bawah dua menit pada Normal; Jakarta ke Jayapura di bawah 40 detik pada 8x; perang sepuluh hari selesai dengan kurang dari 55 perintah pada mode manual berbantuan.

## Fase 4: Combat operasional dan Front (L2)
Tick pertempuran dengan k = 0,35, armor class, stacking penalty, health penalty, entrenchment, dan bunker; supply tiga status dengan BFS; morale stack dengan rout dan surrender; intel empat tingkat dengan estimasi rentang; enam stance; komandan per army group; **L2 Front dan Theater** dengan enam objective, misi laut per zona, objective solver, override yang kembali otomatis, dan transparansi "sedang mengelilingi X, menunggu supply dua hari"; combat breakdown tooltip; penaklukan provinsi dan VP.

**Kriteria terima:** duel referensi selesai tepat 12 tick dengan defender sisa 97,2 HP; delapan belas infanteri adalah minimum untuk mengalahkan sepuluh entrenched; efisiensi armor 1,75 di open ground dan 0,56 di urban; **acceptance test Hattin**: menang dengan rasio kekuatan di bawah 0,8 memakai tipuan, raid suplai, dan penyergapan; perang sepuluh hari di bawah 30 perintah.

## Fase 5: AI, kartu operasi (L3), delegasi (L4), difficulty, diplomasi
Utility AI strategis dengan archetype dan agenda dari heuristik data; **planner yang sama dipakai AI musuh, delegasi L4, dan saran kartu**; sebelas kartu operasi berprasyarat dengan trigger dan peluang berupa rentang; relasi Conflict of Nations, koalisi, trade, embargo; empat preset difficulty dengan scaling dan toggle dunia; penasihat adaptif tiga bidang; promosi adaptif gaya kontrol.

**Kriteria terima:** rantai Konstantinopel (blokade, pengepungan, bombardemen, assault) dan rantai Hattin bisa dimainkan; sim 100 seed memberi median hari kemenangan 35 sampai 50 dengan P10 minimal 25 dan P90 maksimal 65; tidak ada tipe unit melebihi 25 persen CP tentara pemenang; win rate tiap doktrin 25 persen plus minus 8.

## Fase 6: Geopolitik dan konsekuensi
Infamy dengan empat tingkat dan containment; crisis tiga fase sebelum perang; attitude label; alliance unity; puppet tiga tipe; lost territories; intelijen empat misi; **meteran Tekanan Dunia** dengan empat ambang dan deck lima krisis eksistensial berskala 1,75 kali.

**Kriteria terima:** pemain dominan menghadapi koalisi dunia yang terbentuk secara wajar, bukan tiba-tiba; Tekanan Dunia terbaca dan bisa direncanakan.

## Fase 7: Identitas pemain, Chronicle, dan mode lanjutan
Ganti nama, bendera builder, warna, motto, pemerintahan, pindah ibu kota berbiaya, national focus, doktrin; **Chronicle** dengan timelapse peta dan empat angka integritas; **Segel Kanon** dengan flag per cabang; fork bagaimana jika; layar Warisan non-modal; dua belas Proyek Akhir.

**Kriteria terima:** kampanye menghasilkan cerita yang bisa dibaca ulang; fork dari tick yang sama menghasilkan krisis identik sehingga dua strategi bisa diuji melawan kondisi yang sama.

## Fase 8: Polish
Unit 3D low-poly instanced dengan counter 2D; tekstur satelit KTX2 berjenjang; glyph terrain; koran dan events; audio minimal ambient dan SFX dari sumber CC0; i18n lengkap dengan default Indonesia; balancing; onboarding preset Kampanye Pertama Indonesia; mode buta warna; aksesibilitas skala font dan reduced motion.

**Kriteria terima:** checklist sensitivitas 13 butir lolos; tampilan mendekati screenshot referensi; playtest satu partai dengan Legends menyala dan satu mati tanpa kebocoran teks.

## Fase 9: Era pack Perang Dunia 2 1939
Pipeline political dengan CShapes 1939 dan overrides; model owner dan sovereign dengan subject_type untuk koloni, dominion, dan puppet; 77 negara; roster sekitar 20 unit dengan Helicopter nonaktif; empat doktrin Call of War; lima goods; epoch 1939 sampai 1945; sekitar 40 event backbone dengan bobot historical dan free; kalender satu hari game sekitar 30 sampai 36 hari sejarah; musim.

## Fase 10: Era pack Perang Dunia 1 1914 dan fondasi modding
Daur ulang pipeline dengan CShapes 1914 dan sekitar 150 sampai 300 override; roster 16 unit dengan Helicopter dan Missile nonaktif; tiga doktrin; lima goods dengan upkeep substitutable; trench sebagai stance Hold dengan entrench; sekitar 40 event; **skema era pack dipublikasi dengan validator Ajv precompiled dan loader `mods/eras/*`**, tiga mode merge, dan pesan error dengan baris, kolom, dan hint Levenshtein.

## Fase 11: Custom lengkap
Editor scenario in-game dengan brush owner, kekuatan awal, aliansi, dan undo; sandbox acak dengan seed dan generator nama per kultur terkurasi; era pack Cold War 1962.

## Fase 12: Legends
Fondasi alt-history realistis dengan national focus dan Heritage Sites dari Wikidata; lalu mode Legends toggle default mati dengan Archaeological Institute, Expedition, pohon Legacy, dua belas capstone, counterplay, dan **Codex dua kolom yang kolom faktanya berbobot visual sama atau lebih besar**. Playtest 200 seed dengan uplift win rate maksimal 12 persen.

## Fase 13: v2 lanjutan
Napoleonic, Age of Sail, Majapahit, Ancient; tiga slider ideologi, faksi, policy slots; multiple victory conditions; opsional panel Major Battle; scripting mod v2 dengan JSONLogic lalu v3 dengan QuickJS.

## Enam keputusan yang menunggu (tidak memblokir fase 1)
Target waktu tempuh berjenjang; ironman versus Segel Kanon; daftar dua belas Proyek Akhir; senjata kimia di Modern; tokoh nyata; aturan bendera. Semuanya baru mengikat mulai fase 3, 7, dan 8.
