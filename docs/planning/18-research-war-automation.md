# Riset Lanjutan: Tingkat Kontrol dan Otomasi Perang

> Sumber: riset sesi 4 (2026-09-04) atas masukan Billy: "Tidak harus clone penuh, mekanik war perlu riset kembali apakah auto saja cukup strategi atau bagaimananya. Di CoN saya sangat malas memindahkan kapal dan prajurit karena lama." Verifikasi lewat wiki Paradox, Wikipedia, Steam. Klaim dari ingatan ditandai [UNVERIFIED]. Dokumen ini bagian dari `docs/planning/`; indeks di `README.md`.

## 0. Jawaban singkat

Perang yang **otomatis penuh tidak cukup strategis** untuk tujuan Billy. Yang harus diotomasi adalah **eksekusi** (jalur, embark, penempatan sepanjang front, siapa menembak siapa), bukan **keputusan** (di mana, kapan, dengan apa menyerang). Game yang mengotomasi eksekusi tetap terasa strategis (HoI4 battle plan, EU4 auto-transport, Stellaris reinforce); game yang mengotomasi keputusan cepat terasa seperti menonton (Vic3 "fiddly", Realpolitiks 3 Mostly Negative 39%), kecuali jika jujur berhenti menjadi game strategi (Ages of Conflict: "This is not a Strategy Game") atau memindahkan strateginya ke sistem lain yang kaya (Rebel Inc).

## 1. Survei spektrum kontrol perang

| Game | Unit yang dipindah manual | Otomasi tersedia | Input per perang | Resepsi |
|---|---|---|---|---|
| **Conflict of Nations** | Setiap stack darat/laut/udara, klik unit lalu klik tujuan | Praktis tidak ada; patrol udara, fire control, split/merge [UNVERIFIED]; 1 hari game = 1 hari nyata | Sangat tinggi: puluhan sampai ratusan klik per perang plus menunggu jam nyata | Keluhan Billy: lama dan membosankan |
| **Hearts of Iron IV** | Divisi bisa manual, tetapi cara normal: Front line + Offensive line + Fallback line + Spearhead, AI menjalankan; divisi yang diperintah manual "revert back to AI control" setelah selesai; planning bonus +1% per 1% planning maks 30% (~15 hari), decay 1%/hari AI vs 3%/hari manual; mode careful/balanced/aggressive | Strategic redeployment via rel (org turun 90%, tanpa fuel/atrisi); naval 9 misi per region (Patrol, Strike Force, Convoy Raiding, Escort, Minelaying, Minesweeping, Invasion Support, Hold, Exercise); udara 14 misi per region; naval invasion butuh >50% supremacy + 40% intel, prep 7 hari per divisi | Sedang: gambar 2 sampai 3 garis, klik "go", lalu override | Steam 90% positif (124.824), Metacritic 83; sentimen "battle plan AI bodoh, micro selalu lebih baik" [UNVERIFIED], konsisten dengan decay 3× saat manual (desain memaksa memilih satu mode) |
| **Victoria 3** | Tidak ada. Front dibuat otomatis di setiap perbatasan saat diplomatic play; general diberi Advance/Defend (varian Reckless Advance, Cautious Advance, Heavy Barrage, Pillage); "Players cannot directly control which units fight" | Naval: Project Power, Interception, Protect/Raid Supply Lines, Blockade, Port Bombardment; naval invasion = army + fleet + state target; patch 1.2 menambah Strategic Objectives, patch 1.9 menggabung front dan bulk formation controls | Rendah | Steam 70% (20.684). Desainer: sistem "designed with the intent to tone down the role of warfare"; IGN: "armed conflicts can be very fiddly"; dua patch berjudul "Military Improvements" menunjukkan warfare paling banyak direvisi |
| **EU4** | Semua manual | 1.30 automatic transports, attach to army; 1.31 carpet siege otomatis, Autonomous Rebel Suppression, Draft transports; army templates | Tinggi, tetapi otomasi memotong pekerjaan paling membosankan | Diterima sebagai QoL, bukan pengganti kontrol [UNVERIFIED] |
| **CK3** | Army manual; embark otomatis saat menyeberang laut (biaya emas, +25% maintenance, supply 30 hari) | Rally points (maks 10); "Armies can be automated in the Military tab" | Sedang sampai rendah | Warfare sekunder terhadap drama karakter [UNVERIFIED] |
| **Stellaris** | Fleet manual | Science ship automation; stance Evasive/Passive/Aggressive; Reinforce dibangun di starbase terdekat dan berangkat sendiri; auto-merge; home base | Sedang | Pola stance + rally + reinforce = standar QoL |
| **Supreme Ruler 2020/Ultimate** | Batalion individual atau grup | Minister-priorities + "unit initiative" (AI mengendalikan unit pemain) | Nol sampai tinggi, pilihan pemain | Metacritic 65; delegasi ke menteri dianggap AI lemah [UNVERIFIED] |
| **Ages of Conflict** | Tidak ada default; bisa "controlling nations directly" | Semua. Situs resmi: "NOTE: This is not a Strategy Game" | ~0 | Steam 97% (6.055) sebagai simulator/tontonan, bukan game strategi |
| **Rebel Inc.** | Tidak ada unit di-micro; pemain "finance military initiatives" dengan anggaran bulanan | Penuh via prioritas dan inisiatif | Rendah | 9/10 "depth, involvement, great pacing": strategi lewat alokasi memuaskan jika sistem ekonomi-politik kaya |
| **Terra Invicta** | Army antar region + fleet [UNVERIFIED detail] | Autoresolve luar angkasa [UNVERIFIED] | Tinggi | "barrier to entry is high", "densest game", "obtuse mechanics" |
| **Realpolitiks 3** | Sistem Frontlines | Frontline otomatis | Rendah | **Mostly Negative 39% (253)**: front system saja tidak menjamin sukses |
| **Age of History 3** | Army digerakkan di peta; unit front-line "engage" otomatis tiap hari; komposisi front/second line penting | Combat otomatis, general pengubah | Sedang | Very Positive 80% (4.003) |
| **Dummynation** | Alokasi pasukan ke perbatasan [UNVERIFIED] | Hampir semua | Rendah | "do not spread too thin"; strategi di level makro |
| **Hegemony III** | Manual dengan selection, stance, positioning; fokus supply chain | Sedikit | Tinggi | "unique focus (supply lines)": supply sebagai sumber taktik emergent |
| **Total War** | Kampanye manual; battle real-time atau autoresolve | Autoresolve | Sedang | Autoresolve = opsi pemain sibuk, hasil lebih boros korban [UNVERIFIED] |
| **RTS klasik** | Semua | Attack-move, control group, rally point | Sangat tinggi | Kritik "click-fests ... faster with the mouse generally won", "button babysitting": persis keluhan Billy |
| **Shadow Empire** | Counter hex manual, logistik kompleks | Sedikit | Sangat tinggi | "Ambitious in the extreme" tapi "opaque complexity ... black box" |

**Pelajaran:** (1) otomasi eksekusi diterima luas; (2) otomasi keputusan dikeluhkan kecuali game berhenti jadi game strategi atau strateginya dipindah ke sistem lain; (3) HoI4 menemukan titik tengah: pemain menggambar intent, AI mengeksekusi, override kapan saja, kelemahannya AI eksekusi kadang buruk dan bonus planning memaksa memilih satu mode; (4) Vic3 perlahan bergerak balik ke arah kontrol (Strategic Objectives 1.2, penggabungan front 1.9), artinya "front tanpa objective" terbukti kurang.

## 2. Empat tingkat kontrol untuk Nation Rise

Konteks: peta ~2.000 provinsi, 1 hari game = 5 menit nyata pada 1x sampai 8x, auto-pause, rencana A + C (supply BFS, 6 stance, komandan dengan trait dan 1 kemampuan aktif) sebagai mesin resolusi pertempuran.

### L1 Manual berbantuan (CoN + QoL kuat)
Unit tetap stack yang dipindah pemain, ditambah: lasso dan multi-select, control group 1 sampai 9; **attack-move**; **rally point ke front** untuk unit baru; **auto-embark** (klik tujuan seberang laut, sistem memesan transport, pola EU4 1.30 dan CK3); **strategic redeployment** via rel/udara 3× kecepatan dengan org turun 90%, hanya di wilayah sendiri; saved routes dan tombol "Kirim ke garis depan"; **fleet mission per zona laut** (Patrol, Blockade, Escort, Raid, Hold); **"Fast forward sampai tiba"** dan auto-pause saat kontak. AI hanya pathfinding; AI musuh memakai planner sendiri.
Pemetaan 9 taktik: Encirclement = pemain memindahkan 2 sampai 3 stack menutup semua edge supply (overlay "pocket terbentuk"); Flanking = attack-move dari 2 provinsi; Ambush = stance Ambush di terrain rough; Siege = stack di tetangga dengan stance Siege; Blockade = fleet mission di zona depan pelabuhan; Naval Invasion = klik pantai musuh, auto-embark; Diversion = gerakkan stack terlihat ke arah palsu; Retreat = klik mundur + bumi hangus; Chokepoint = Hold di provinsi cut-vertex.

### L2 Perintah Front dan Theater (hibrida HoI4/Vic3)
- Pemain membuat **Theater** dan **Front** (gambar garis di perbatasan atau pilih region; auto-suggest ala Vic3 boleh, tetapi pemain yang mengaktifkan).
- **Army Group** (beberapa stack + 1 komandan) ditaruh ke front dengan **Objective** 6 pilihan: Defend line, Advance to X, Pincer on region Z (butuh 2 army group atau 2 axis), Hold line L, Fall back to L, Feint toward W (komitmen 20%).
- Stance rencana C menjadi **default stance army group**; AI eksekusi memilih stance per stack sesuai objective (Pincer → Assault di sayap dan Screen di tengah; Defend → Hold; Besiege → Siege).
- **Navy** mission per zona laut/pelabuhan: Patrol, Blockade port, Escort, Raid, Invade coast Y (bersama army group), Strike force.
- **Override manual** kapan saja; stack kembali ke kontrol front setelah perintah selesai (HoI4). **Tanpa penalti planning-decay ganda** ala HoI4; hanya bonus kecil "staged" untuk unit diam ≥2 hari sebelum Advance.
- **Komandan** memberi trait pada eksekusi front (mis. Pengepung: siege tick +25%) dan 1 kemampuan aktif yang dipicu pemain (mis. Serangan Malam: 24 jam ambush di seluruh front).
- AI: pathfinding + penempatan sepanjang front + memilih stance + mengejar objective; **AI musuh memakai planner yang sama**.
Pemetaan 9 taktik: Encirclement = objective Pincer on Z untuk 2 army group; Flanking = Advance to X dengan pilihan axis; Ambush = Hold line + stance Ambush + kemampuan komandan; Siege = Besiege city X; Blockade = naval mission Blockade port; Naval Invasion = mission Invade coast Y + army group; Diversion = Feint toward W; Retreat = Fall back to L (unit belakang Screen); Chokepoint = Hold line di 1 sampai 2 provinsi cut-vertex (UI menyorot kandidat).

### L3 Operation Planner (baru)
Perang dijalankan lewat **kartu Operasi** berprasyarat yang disusun jadi rantai. Setiap kartu = paket objective L2 + stance + timing + syarat; berdiri **di atas** L2 (satu kartu menerjemahkan diri menjadi 1 sampai 3 objective front dan 0 sampai 2 naval mission). Pemain menyusun rantai seperti Al-Fatih: Blokade Selat → Bombardemen → Assault. Desain lengkap di bagian 3.

### L4 Otomatis penuh (delegasi)
Pemain menetapkan war goal, alokasi kekuatan per front (%), posture per front (Agresif / Seimbang / Defensif / Tipuan), doktrin nasional (Siege-first, Manuver, Attrisi, Naval-first), prioritas riset dan produksi. Planner AI (sama dengan musuh) memilih dan mengeksekusi kartu L3. Taktik posisional masih muncul, tetapi **di-author AI, bukan pemain**; yang hilang adalah rasa "saya yang melihat celah itu". Strategi tetap kuat hanya jika keputusan makro bergigi (doktrin mengubah kartu yang tersedia; alokasi salah membuat front jebol; aliansi dan timing menentukan supremasi laut). Model Rebel Inc dan Dummynation.

## 3. Desain L3 Operation Planner (konkret)

**Struktur kartu:** Prasyarat (dicek live; kartu abu-abu jika gagal, tooltip menjelaskan yang kurang), Durasi (hari game), Biaya (supply/hari, fuel, political capital), Peluang (dari rasio kekuatan, terrain, fog, trait komandan; ditampilkan sebagai **rentang** agar fog berarti), Hasil sukses, Hasil gagal, Terjemahan ke L2. Pemain memilih Target (klik provinsi/zona), Army group/Fleet (drag), lalu Antre dengan **trigger**: mulai saat operasi sebelumnya selesai / saat kondisi X (mis. fortifikasi <30%) / pada hari D.

| # | Operasi | Prasyarat | Durasi | Biaya | Sukses / Gagal | Terjemahan L2 | Era |
|---|---|---|---|---|---|---|---|
| 1 | **Blokade Pelabuhan/Selat** | Fleet di zona tetangga; rasio laut lokal ≥1.5× (2× untuk Blokade Ketat); tidak ada fort pantai musuh >lvl 2 tanpa capital ship | Berlanjut, efek penuh setelah 2 hari | Fuel + supply fleet ×1.5/hari | Supply pelabuhan 0%, siege tick +50%, ekspor musuh turun / musuh sortie, battle laut | Naval mission Blockade | Semua (PD1: kapal selam menaikkan risiko) |
| 2 | **Pengepungan Kota** | Kota musuh; ≥1 army group tetangga; ≥75% edge darat dikontrol/diblok (100% untuk Pengepungan Penuh) | Sampai supply garnisun habis | Supply pengepung/hari | Kota menyerah tanpa assault atau Breach membuka Assault dengan fort 50% / relief force memutus ring | Besiege X, stance Siege, AI menutup edge | Semua |
| 3 | **Bombardemen** | Siege aktif atau air superiority ≥60%; artileri/kapal/pesawat dalam jangkauan | 1 sampai 5 hari | Ammo/supply ×2 | Fortifikasi −10 sampai −20%/hari, morale garnisun turun / counter-battery | Sub-objective Siege | PD1+ artileri, Modern air |
| 4 | **Pendaratan Amfibi** | Transport ≥ berat stack; sea control ≥50% di semua zona jalur; prep 3 hari + 1 hari/unit | Prep + 1 sampai 3 hari layar | Transport, fuel | Beachhead 1 sampai 2 provinsi, org 60% / intersepsi laut atau pantai dijaga ≥1:1 → unit kembali | Invade + Advance | Semua; PD2/Modern kuat |
| 5 | **Pincer / Pengepungan Operasional** | 2 army group di 2 axis dengan path ke 1 provinsi penutup; rasio lokal ≥1.2× di kedua axis | 3 sampai 8 hari | Supply ×1.3 | Pocket terbentuk (BFS memutus), unit dalam pocket atrisi 10%/hari / satu axis macet | 2× Advance ke titik temu + Screen | Semua |
| 6 | **Feint (Tipuan)** | 1 stack terpisah; fog aktif (musuh tanpa recon penuh di sektor) | 2 sampai 4 hari | Supply kecil | Estimasi ancaman AI musuh naik → musuh memindahkan ≥1 stack; kartu berikutnya di sektor lain +peluang / musuh punya recon, tipuan terbaca | Feint komitmen 20% | Semua |
| 7 | **Breakthrough** | Rasio lokal ≥2× di 1 provinsi; unit armor/artileri/kavaleri berat; staged ≥2 hari | 1 sampai 3 hari | Supply ×2, org drop | Menembus 2 sampai 3 provinsi, membuka Pincer / tertahan, korban tinggi | Advance sempit (spearhead) | PD2/Modern kuat, PD1 lemah |
| 8 | **Tahan Chokepoint** | Provinsi cut-vertex atau gunung/sungai; stance Hold; supply terhubung | Berlanjut | Normal | Entrench +5%/hari (maks +40%), musuh butuh rasio ≥3× / musuh memutar via laut/udara | Hold line | Semua, PD1 terkuat |
| 9 | **Zona Penyergapan** | Terrain hutan/gunung/urban; stance Ambush; musuh belum mendeteksi | Sampai terpicu | Normal | First strike 1 ronde tanpa balasan + morale shock / recon musuh membuka | Hold + Ambush | Semua |
| 10 | **Mundur Strategis + Bumi Hangus** | Garis fallback di wilayah sendiri | 1 sampai 3 hari | Infrastruktur sendiri rusak | Mundur berurutan (belakang Screen), korban minimal, musuh −30% kecepatan supply / dikejar saat org rendah | Fall back to L | Semua |
| 11 | **Raid Jalur Suplai** | Kapal selam/raider (laut) atau kavaleri/pasukan ringan (darat); jalur suplai musuh terlihat | 3 sampai 7 hari | Fuel | Supply front musuh −20 sampai −40% / escort menangkap | Raid mission / stance Raid | Semua; PD1 sampai 2 kapal selam |

**Rantai contoh:** Konstantinopel 1453 = Blokade Selat → Pengepungan Kota → Bombardemen (trigger harian) → Assault saat fortifikasi <30%: empat kartu, ~12 klik, 10 sampai 15 hari game. Hattin 1187 = Feint ke kota X → Raid Jalur Suplai (musuh kehausan) → Zona Penyergapan di jalur mundur: tiga kartu, ~9 klik.

**Mengapa L3 bukan "menonton":** kartu tidak mengambil keputusan di mana dan kapan; pemain memilih target, urutan, trigger. Kartu hanya menghilangkan "klik 6 stack ke 6 provinsi". Kegagalan selalu bersebab yang terbaca (prasyarat berubah, musuh recon).

## 4. Perbandingan 8 kriteria (1 sampai 5, 5 terbaik)

| Kriteria | L1 Manual berbantuan | L2 Front/Theater | L3 Operation planner | L4 Otomatis penuh |
|---|---|---|---|---|
| (a) Klik per perang 10 hari (6 stack, 2 fleet, 1 pendaratan) | ~60 sampai 80 (CoN murni ~120 sampai 150) | ~25 sampai 35 | ~15 sampai 25 | ~5 sampai 10 |
| (b) Menang lewat posisi meski lebih lemah | **5** | **4** | **4** (prasyarat memaksa berpikir posisi) | 2 (hanya via doktrin/alokasi) |
| (c) Rasa komandan vs penonton | Komandan lapangan, tapi lelah | **Komandan theater (target Billy)** | Panglima penyusun kampanye | Kepala negara/penonton |
| (d) Kompleksitas AI (AI memakai sistem sama) | Tinggi (AI butuh planner yang tidak dipakai pemain) | Sedang (planner dipakai pemain dan musuh) | Sedang (kartu = abstraksi cocok utility-AI) | Sama dengan L3 |
| (e) Kecocokan era | Semua, PD1 melelahkan | Semua | Semua, kartu difilter per era | Semua |
| (f) Risiko frustrasi AI eksekusi | Rendah | **Sedang sampai tinggi** (keluhan HoI4, Vic3) → butuh override murah dan alasan terbaca | Sedang (gagal bersebab) | Tinggi ("bukan salah saya") |
| (g) Effort relatif | 1.0 | 1.8 | 2.3 | 2.5 (sebagian besar sudah dibutuhkan AI musuh) |
| (h) Kompatibilitas A + C | Penuh | Penuh | Penuh (komandan bisa membuka kartu) | Sebagian |

Bacaan cepat: L2 dan L3 memberi hampir semua nilai posisional L1 dengan seperempat klik. L4 menjatuhkan (b) dan (c) sekaligus; cocok sebagai toggle per front, bukan default.

## 5. Mitigasi keluhan "memindahkan kapal dan prajurit lama"

### (i) Waktu tempuh terasa lama
Di CoN 1 hari game = 1 hari nyata. Di Nation Rise skala waktu 288× lebih cepat (5 menit/hari). Asumsi infanteri 2 provinsi/hari, fleet 4 zona/hari, rel 3×:

| Kasus | Jarak | 1x (5 mnt/hari) | 8x (37.5 s/hari) | Strategic redeployment 3× di 8x | Teleport antar pelabuhan sendiri |
|---|---|---|---|---|---|
| Infanteri ke front, 10 provinsi | 5 hari | 25 menit | 3.1 menit | 1.0 menit | |
| Fleet Atlantik, 20 zona | 5 hari | 25 menit | 3.1 menit | | 0 menit + readiness 2 hari (1.25 menit di 8x), fuel ×3, hanya antar pelabuhan sendiri tidak diblokade |
| Pendaratan prep 3 hari + 2 hari layar | 5 hari | 25 menit | 3.1 menit | | |
| PD1 mobilisasi lintas benua, 40 provinsi | 20 hari | 100 menit | 12.5 menit | 4.2 menit | |

Tambahan: tombol **"Fast forward sampai tiba"** di setiap perintah gerak (game ke 8x, auto-pause pada kedatangan atau kontak); auto-pause berbasis event (unit tiba, kontak, prasyarat operasi terpenuhi, pocket tertutup); **teleport berbiaya** sebagai redeployment antar pangkalan (masuk akal untuk Modern, diskutabel untuk PD1: batasi ke Modern/custom atau beri durasi 1 hari); **prep time yang terlihat** (bar 3 hari) terasa lebih "berjalan" daripada kapal bergerak pelan.

### (ii) Jumlah perintah
Perang 10 hari, 6 stack darat, 2 fleet, 1 pendaratan:

| Mode | Gerak | Laut | Embark | Stance/komandan | Total |
|---|---|---|---|---|---|
| CoN murni | ~90 | ~10 | ~15 | ~10 | **~125** |
| L1 QoL | ~40 | ~4 | ~2 | ~10 | **~55** |
| L2 | ~15 | 2 | 0 | ~5 | **~25** |
| L3 | ~15 | 0 | 0 | ~3 | **~18** |
| L4 | 5 | 0 | 0 | 0 | **~6** |

Target: **≤30 perintah per perang 10 hari** pada mode default, lonjakan ke ~50 hanya saat pemain memilih micro untuk momen genting.

## 6. Rekomendasi riset: desain berlapis yang bisa diskalakan

**Prinsip:** pemain menulis intent; sim mengeksekusi; override selalu semurah satu klik dan tidak dihukum.

1. **Default = L2 Front/Theater.** Front dibuat pemain (auto-suggest boleh, diaktifkan pemain). Army group + komandan di-drag ke front; 6 objective; naval mission per zona. Stance C = default stance army group, AI eksekusi memilih stance turunan.
2. **Lapisan L3 Operation cards** untuk momen besar (11 kartu). Komandan dengan trait tertentu membuka atau memperkuat kartu (Pengepung → Bombardemen −1 hari; Penipu → Feint +20%). Kemampuan aktif komandan tetap tombol terpisah.
3. **Override L1 selalu ada**: klik stack, klik tujuan; setelah selesai kembali ke front. Lasso, attack-move, auto-embark, strategic redeployment, "fast forward sampai tiba".
4. **Toggle L4 per front "Delegasikan ke AI"** dengan posture dan alokasi % dari pemain; untuk front sekunder. Tidak boleh default-on.
5. **Satu planner untuk semua**: AI musuh, delegasi L4, dan saran kartu berbagi kode; menurunkan effort dan menjamin AI tidak punya taktik yang tidak tersedia bagi pemain.
6. **Transparansi eksekusi**: tiap army group menampilkan "sedang: mengelilingi X, menunggu supply 2 hari" dan alasan kegagalan kartu (pelajaran Vic3 1.2 dan 1.9).

**Rencana A + C tetap dipakai:** supply BFS = mesin Pengepungan, Pincer, Raid, Blokade dengan overlay pocket; 6 stance dipetakan dari objective, dipaksa kartu, di-override per stack; komandan 1 per army group dengan trait yang membuka kartu dan kemampuan aktif sebagai satu-satunya "klik taktis" heroik; fog = prasyarat Feint dan Ambush.

**Urutan bangun:** (1) fondasi sim (graph, supply BFS, stance, combat, fog, komandan); (2) L1 QoL (pathfinding multi-stack, lasso, attack-move, rally, auto-embark, redeployment, 8x + auto-pause event, fast forward); (3) L2 Front/Theater + naval mission per zona, objective solver, override reversion, AI musuh memakainya sejak awal; (4) komandan terikat ke front + kemampuan aktif; (5) L3 kartu (mulai 6: Blokade, Pengepungan, Pendaratan, Pincer, Feint, Mundur; tambah 5 sisanya); (6) planner utility-AI untuk musuh dan delegasi L4; (7) filter era.

**Risiko yang dijaga:** jangan tiru penalti ganda HoI4 (planning decay 3× saat manual); jangan biarkan front dibuat otomatis tanpa objective (Vic3 pra-1.2); jangan jadikan delegasi L4 default (Supreme Ruler, Ages of Conflict); acceptance test desain: **skenario Hattin harus bisa dimenangkan dengan Feint + Raid + Ambush melawan musuh 1.5× lebih besar**.

## Sumber
HoI4: Battle_plan, Land_warfare, Naval_warfare, Naval_missions, Naval_invasion, Air_warfare, Air_missions (hoi4.paradoxwikis.com); Steam 394360; Wikipedia Hearts_of_Iron_IV. Vic3: Land_warfare, Naval_warfare, Developer_diaries, Patch_1.2, Patch_1.9 (vic3.paradoxwikis.com); Wikipedia Victoria_3; Steam 529340. EU4: Army, Land_warfare, Patch_1.30, Patch_1.31. CK3: Army; Wikipedia Crusader_Kings_III. Stellaris: Fleet, Ship. Wikipedia: Supreme_Ruler_2020, Rebel_Inc._(video_game), Terra_Invicta, Hegemony_III, Total_War_(video_game_series), Real-time_strategy, Shadow_Empire. Steam: 2186320 (Ages of Conflict), 2298690 (Realpolitiks 3), 2772750 (Age of History 3). dummynation.ahfgames.com. conflictofnations.wiki.gg/wiki/Units. Tidak dapat diakses: IGN, PC Gamer, RPS, Polygon, Eurogamer, forum Paradox, Total War fandom, wiki resmi CoN (403).
