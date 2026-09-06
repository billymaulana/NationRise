# Ide Desain dan Klarifikasi (dari asisten, sesi 5)

> Ditulis 2026-09-04 atas permintaan Billy: "lakukan riset yang belum dan hal-hal yang perlu diperjelas agar planning lebih detail dan siap, termasuk ide-ide dari Anda." Semua ide di sini adalah **usulan**, bukan keputusan; sesuai aturan kerja nomor 5 dan 8, pertanyaan di bagian 3 diajukan lewat chat dan jawabannya dicatat di `15-brainstorm-log.md`. Bagian dari `docs/planning/`; indeks di `README.md`.

## 1. Ide yang melengkapi rencana (murah relatif terhadap nilai)

| # | Ide | Mengapa cocok untuk Nation Rise | Biaya relatif | Fase usulan |
|---|---|---|---|---|
| I1 | **Briefing Harian sebagai ritual utama.** Satu layar saat pergantian hari: tiga kolom (Ekonomi, Militer, Diplomasi), daftar "keputusan yang menunggu" (riset selesai, kartu operasi siap, tawaran damai), ringkasan Chronicle hari itu, tombol Lanjut. | Mengganti ritual login harian CoN; membuat game bisa dimainkan sesi 10 menit; menjawab keluhan "malas" dengan memusatkan keputusan di satu tempat | Rendah (UI Vue + data yang sudah ada) | 2 (waktu) dan 5 |
| I2 | **Tiga penasihat adaptif** (Ekonomi, Militer, Diplomasi) menggantikan tutorial linear. Tiap penasihat memberi maksimal satu kalimat berbasis state ("Fuel habis dalam 2 hari; Palembang bisa dinaikkan Local Industry") dan menawarkan aksi satu klik. CoN sudah punya potret penasihat, jadi visualnya konsisten. | Onboarding tanpa layar tutorial terpisah; pola King of Dragon Pass; mudah dimatikan | Rendah sampai sedang (aturan heuristik, tanpa dialog panjang) | 5, diperluas 8 |
| I3 | **War Room / Peta Rencana.** Mode peta di mana kartu operasi digambar sebagai panah dan lingkaran ala peta staf, disimpan sebagai "Rencana" bernama, dieksekusi berurutan, dan diputar ulang setelah perang. | Menjadikan L3 terasa seperti Al-Fatih merencanakan pengepungan, bukan menu; bahan Chronicle | Sedang (overlay three.js + state kartu yang sudah ada) | 5 |
| I4 | **Chronicle sebagai timelapse.** Peta kepemilikan per hari diputar sebagai animasi dengan marker event; ekspor PNG/GIF dari canvas. | Payoff emosional "sejarah yang saya buat"; murah karena snapshot harian sudah ada untuk autosave | Rendah | 7 |
| I5 | **Fork "bagaimana jika" dari save.** Karena simulasi deterministik (D22), pemain bisa mem-fork save di hari N dan mencoba jalur lain; Chronicle mencatat cabang. | Alternate history literal; hampir gratis dengan determinisme; mendorong eksperimen strategi | Rendah | 7 |
| I6 | **Preset gaya kontrol saat mulai:** "Panglima" (front order default, sesuai D20) atau "Komandan Lapangan" (manual berbantuan). Hanya mengubah default lapisan; semua lapisan tetap tersedia. | Menjelaskan D20 ke pemain baru dalam satu pilihan | Sangat rendah | 4 |
| I7 | **Preset sandbox "Indonesia Superpower".** Scenario Modern dengan override per negara (income bonus, tier militer awal, doktrin pilihan) untuk Indonesia, dilabeli jelas sebagai power fantasy; memakai mekanik override yang sudah direncanakan untuk difficulty custom (riset D). | Memenuhi fantasi awal Billy tanpa menyentuh Historical mode; hampir gratis | Sangat rendah | 5 |
| I8 | **Meter "Tekanan Dunia" di HUD** yang menggabungkan infamy, jumlah negara bermusuhan, dan progres koalisi anti-pemain; berubah warna mendekati ambang Pariah. | Membuat konsekuensi diplomatik (fase 6) terbaca dalam 2 detik, sesuai pilar 1 | Rendah | 6 |
| I9 | **Ironman opsional** (tanpa muat ulang manual, hanya autosave) untuk pemain yang ingin taruhan; default OFF. | Standar genre; murah | Sangat rendah | 7 |
| I10 | **Pencapaian lokal** (tanpa online): "Hattin" (menang dengan rasio kekuatan < 0.8), "1453" (menang siege lewat blokade + bombardemen), "Palapa" (menguasai semua provinsi kepulauan Nusantara). | Mengajarkan taktik lewat tujuan; acceptance test desain sekaligus konten | Rendah | 8 |
| I11 | **Palet pemilik aman buta warna.** ~195 pemilik di 2.000 provinsi: hue diturunkan dari warna dominan bendera lalu dinormalisasi ke palet dengan kontras terjaga; koalisi memakai pola (garis miring) bukan warna baru; mode deuteranopia. | Keterbacaan peta adalah inti pilar "terbaca 2 detik"; Retina tidak menolong warna yang mirip | Rendah sampai sedang | 1 |
| I12 | **Nama lokal bilingual.** Label provinsi dan kota memakai endonim (Natural Earth `name` dan `name_local`) dengan terjemahan i18n untuk nama yang lazim (Jakarta, Tokyo tetap; Köln/Cologne, Wien/Vienna sesuai bahasa UI). | Realisme general yang diminta Billy; murah karena field sudah ada | Rendah | 1 |
| I13 | **Overlay dev "F3"**: ms per tick, draw calls, RSS, jumlah entitas. | Wajib untuk gerbang D22 | Rendah | 1 |
| I14 | **Glosarium istilah Indonesia** ditetapkan sebelum UI pertama (bagian 4). | Menghindari inkonsistensi terjemahan di ratusan string | Sangat rendah | 1 |
| I15 | **Audio minimal**: ambient per tingkat zoom, SFX tick pertempuran, notifikasi; sumber CC0 (Kenney audio, freesound CC0). | Rasa "hidup" dengan biaya kecil | Rendah | 8 |
| I16 | **Estetika War Room sebagai satu risiko desain yang disengaja** (catatan vault UI Billy: hindari default generik). HUD dan panel tetap bergaya CoN; War Room memakai bahasa visual peta staf (panah grease-pencil, overlay kertas kalkir, stempel tanggal). | Memberi identitas visual yang hanya masuk akal untuk game ini | Sedang | 8 |
| I17 | **Template era pack + validator CLI** (`pnpm era:new`, `pnpm era:validate`) agar Billy sendiri bisa menambah scenario custom tanpa menyentuh kode. | Mewujudkan arti custom (d) modding dengan ergonomis | Rendah | 10 |

## 2. Celah rencana yang perlu diisi (bukan pertanyaan, tetapi pekerjaan desain yang belum ada)

| Celah | Isi yang dibutuhkan | Kapan |
|---|---|---|
| Spesifikasi layar baru | Wireframe teks untuk: panel Front/Theater, kartu operasi dan War Room, Briefing Harian, panel Nation dan Customize Nation, Chronicle, Codex Legends, layar setup scenario (era, negara, difficulty, toggle dunia, Historical/Free AI, Legends) | Sebelum fase 4 dan 5 |
| Daftar konten Modern | ~30 event krisis generik (sengketa selat, kudeta, embargo, pemilu mengejutkan, bencana), 10 sampai 15 agenda AI, 20 sampai 30 trait komandan dengan nama | Fase 5 dan 6 |
| Skenario uji desain otomatis | Sim headless: Hattin (menang rasio < 0.8 dengan Feint + Raid + Ambush), Konstantinopel (blokade + siege + bombardemen), pendaratan amfibi vs pantai dijaga, pocket 3 stack; metrik position-win rate | Fase 4 dan 5 |
| Skema save | Format biner + JSON header (versi skema, era pack id + hash, seed, day, checksum), kompresi fflate, migrasi versi | Fase 2 |
| Skema pesan Worker | Daftar command dan snapshot (nama, payload, frekuensi) | Fase 2 |
| Rencana uji performa | Skrip yang memuat 2.000 provinsi + 300 stack + 195 AI dan mencatat metrik D22 di WKWebView dan Chrome | Fase 1 sampai 3 |
| Aksesibilitas | Skala font, kontras, reduced motion, palet buta warna (I11) | Fase 1 dan 8 |
| Distribusi | Build Tauri macOS (unsigned untuk pribadi), PWA fallback, Windows hanya jika ada mesin/CI | Fase 8 |

## 3. Pertanyaan klarifikasi (diajukan di chat, rekomendasi asisten disertakan)

Nomor melanjutkan `17-open-questions.md`. Rekomendasi bukan patokan.

| # | Pertanyaan | Rekomendasi asisten |
|---|---|---|
| P26 | Bahasa UI saat pertama dibuka | Indonesia, dengan pengalih ke English di layar pertama |
| P27 | Preset gaya kontrol default (I6) | "Panglima" (front order) sebagai default |
| P28 | Preset sandbox "Indonesia Superpower" (I7) masuk v1? | Ya, dilabeli jelas sebagai power fantasy; tidak menyentuh Historical |
| P29 | Fork "bagaimana jika" dari save (I5) | Ya, fase 7, karena determinisme sudah wajib |
| P30 | Ironman (I9) | Opsional, default OFF |
| P31 | Nuklir di Modern 2026 | Aktif untuk 9 negara nuklir nyata dengan konsekuensi berat (infamy langsung Pariah, koalisi dunia, kontaminasi); toggle "tanpa nuklir" di setup |
| P32 | Nama provinsi dan kota | Endonim + terjemahan i18n untuk nama lazim (I12) |
| P33 | Warna pemilik di peta | Hue dari bendera dinormalisasi ke palet aman buta warna; pola untuk koalisi (I11) |
| P34 | Onboarding | Penasihat adaptif (I2) + preset "Kampanye Pertama: Indonesia" dengan tips, tanpa layar tutorial terpisah |
| P35 | Audio v1 | Minimal SFX dan ambient di fase 8, tanpa musik orisinal |
| P36 | Target platform build | macOS Tauri dulu; Windows hanya jika ada mesin atau CI |
| P37 | Cakupan modding | Konten dan parameter angka (JSON), bukan kode; aturan combat inti tidak dimodifikasi mod di v1 |
| P38 | Skala kampanye Modern default dan ambang VP | Menunggu riset kalibrasi VP (`24-research-unit-stats-vp.md`) |
| P39 | Sensitivitas konten | Disclaimer fiksi di splash; tanpa tokoh nyata; event Modern generik; Papua bukan sengketa antarnegara di data; Legends dengan Codex jujur |
| P40 | Nama final game | Nation Rise dipertahankan sampai gameplay terbukti; keputusan nama ditunda sengaja |

## 4. Glosarium istilah UI Indonesia (usulan awal)

Prinsip: kategori dan konsep diterjemahkan; nama alutsista tetap asli; angka dan singkatan mengikuti standar Indonesia.

| English | Indonesia (UI) | Catatan |
|---|---|---|
| Supplies | Suplai | bukan "Persediaan" (terlalu panjang di HUD) |
| Components | Komponen | |
| Fuel | Bahan Bakar | HUD ikon saja bila sempit |
| Electronics | Elektronik | |
| Rare Materials | Material Langka | |
| Manpower | Personel | bukan "Tenaga Kerja" |
| Money | Dana | bukan "Uang" agar terasa negara |
| Province / City | Provinsi / Kota | |
| Homeland / Occupied / Annexed | Wilayah Asal / Diduduki / Dianeksasi | |
| Morale | Moral | |
| Stack / Army Group | Pasukan / Grup Tempur | |
| Front / Theater | Front / Teater | |
| Objective: Defend / Advance / Pincer / Hold / Fall back / Feint | Bertahan / Maju / Jepit / Tahan Garis / Mundur ke / Tipuan | |
| Stance: Assault / Hold / Ambush / Siege / Screen / Raid | Serbu / Bertahan / Sergap / Kepung / Tabir / Serang Cepat | |
| Operation card | Kartu Operasi | |
| Blockade / Siege / Encirclement | Blokade / Pengepungan / Kepungan | |
| Supply status: Supplied / Low / Cut Off | Terpasok / Menipis / Terputus | |
| Research / Doctrine | Riset / Doktrin | |
| Victory Points | Poin Kemenangan (PK) | singkatan di HUD |
| Coalition / Alliance | Koalisi / Aliansi | |
| Infamy | Reputasi Agresi | terjemahan bebas agar terbaca |
| Crisis (diplomatic play) | Krisis | |
| Legends mode | Mode Legenda | |
| Chronicle | Kronik | |
| Day / Tick | Hari / Jam | tick ditampilkan sebagai jam game |
