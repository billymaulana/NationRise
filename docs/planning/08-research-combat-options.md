# Riset Lanjutan: Opsi Model Combat

> Sumber: plan riset Nation Rise, sesi 2026-09-03 sampai 2026-09-04, bagian 16. Dokumen ini bagian dari `docs/planning/`; indeks dan aturan kerja ada di `README.md`. Nomor "bagian N" yang dirujuk di dalam teks mengacu ke penomoran plan asli; petanya ada di README.

## 16. Riset Lanjutan: Opsi Model Combat (hasil; tiga opsi dirinci, rekomendasi belum diputuskan Billy)

Terverifikasi: HoI4 wiki (Land battle, Combat tactics, Supply, Commander, Battle plan, Naval invasion, Terrain, Defines), EU4 (Land warfare/Sieges, Military leader), CK3 (Warfare, Commander traits, Terrain), Vic3 (Land warfare), Stellaris, CoN wiki.gg, manual S1914, PDF RP2 Strategic Guide (layar battle), Wikipedia 1453 dan Hattin. [UV] = dari ingatan.

Basis rumus semua opsi: `Damage = Rating(vs armor) × Terrain × StackPenalty × HealthPenalty × modifier situasional`.

### 16.1 Opsi A — Taktik emergent dari manuver peta (tanpa layar battle)
Prinsip: semua taktik turunan dari **graph provinsi + state supply + fog**, dihitung per tick 1 jam. Pola sumber: HoI4 `ENCIRCLED_PENALTY = −0.3` (semua tetangga darat musuh), `MULTIPLE_COMBATS_PENALTY = −0.5`, tiap arah serang tambahan +50% combat width dan membatalkan 1 level fort (fort −15%/level); CoN morale tetangga musuh −5/provinsi; AoC Major Battles.

| Taktik | Aturan per tick (angka contoh) | UI peta | AI deteksi dan counter |
|---|---|---|---|
| **Encirclement** | BFS dari supply source pemilik lewat provinsi yang dikuasai tiap 6 tick; stack tak terhubung = **Cut Off**; grace 48 tick; lalu attack ×0.8, defense ×0.7, morale stack −3/hari, HP −1%/hari; hari 5+ roll surrender 10%/hari bila kalah kekuatan | Garis putus merah mengelilingi pocket; ikon rantai putus; tooltip "Cut off, 36 jam tersisa" | `exits` per stack; exits ≤1 dan ≥2 stack musuh dekat → mundur. Ofensif: provinsi artikulasi graph musuh bernilai ×2 |
| **Flanking** | Tiap arah serangan tambahan ke provinsi sama: defender damage-received ×1.10 (maks 3 arah), fort/entrench −1 level per arah; tiap arah stack sendiri (total 20 sampai 30 unit tanpa penalti stack) | Panah dari tiap provinsi; badge "FLANKED ×2" | Defensif: stack kecil menutup sudut; ofensif: pecah army 2 rute bila cost <1.5× |
| **Ambush** | Stance Hold, entrench ≥50%, terrain forest/hills/jungle/mountain/urban, **intel musuh terhadap provinsi <2**; 3 tick pertama damage ×1.5, korban ×0.75, korban tidak bisa retreat 3 tick | Ikon mata tersilang (pemilik saja); flash "AMBUSH!" | Hidden-threat map; recon dulu bila probabilitas >30%; AI juga menaruh 2 sampai 3 unit Hold di chokepoint berhutan |
| **Siege** | Kota terkepung (semua tetangga darat + port ter-blokade) masuk mode siege; siege progress 0 sampai 100/hari (16.5); surrender di 100 tanpa assault; assault boleh dengan penalti kota −25% | Progress ring + fase teks | Relief column bila `relief ≥ 0.7 × besieger`; sortie bila garnisun > besieger × 0.7; AI hindari assault bunker bila progress >40% |
| **Blockade** | Stack laut di zona laut berbatasan port musuh dengan kekuatan ≥2× musuh → port **Blockaded**: bukan supply source, morale provinsi −5/hari, siege progress +3/hari, impor via port 0 | Jangkar tersilang; ring ombak merah | Port dependency per kota; ibukota pesisir ter-blokade >2 hari → prioritas armada; AI ofensif blokade pulau/semenanjung dulu |
| **Naval Invasion** | Dari port sendiri, sea control ≥50% zona transit, persiapan 6 tick/unit; 48 tick pertama attack ×0.5; harus rebut port/kota dalam 72 tick atau Cut Off; shore bombardment entrench defender −10%/hari; marinir memangkas penalti | Busur putus-putus + timer; ikon "landing −50%" | Coastal threat map = transport musuh × sea control × nilai; garrison top-N pantai; intersep bila rasio ≥1.2 |
| **Diversion / Deception** | Tanpa tombol; bekerja karena **AI hanya melihat estimasi fog**; stack yang masuk wilayah musuh menaikkan *alarm* = estimasi × 1.5 selama 24 tick; AI relokasi cadangan proporsional; artileri menembak menaikkan visibilitas; opsional unit decoy per era (+50% estimasi) | Tidak ada UI baru | Alarm tanpa konfirmasi recon 12 tick → ×0.5; AI difficulty tinggi mengabaikan alarm intel <2 |
| **Strategic Retreat** | Disengage defense ×0.5, morale −5; hanya ke provinsi friendly tak dikontestasi, kalau tidak ada → roll surrender; *Scorched Earth*: supply provinsi ×0 5 hari; atrisi terrain tanpa supply: desert +15%, mountain +30%, marsh +35% HP/hari (pola Hattin) | Panah mundur abu; ikon api | Mundur bila rasio <0.6; scorched earth = cost rute +50% |
| **Chokepoint** | Provinsi ber-flag (pass gunung, jembatan, selat, tanah genting): **cap stack penyerang tanpa penalti dibelah 2** (10 → 5); river crossing attack ×0.7; defender entrench 2× cepat | Ikon segitiga; tooltip "maks 5 unit penyerang" | Pathfinder menambah cost chokepoint dijaga; default garis pertahanan AI = 3 sampai 5 unit + bunker di chokepoint |

Komputasi: BFS supply O(V+E) tiap 6 tick, trivial; flank/chokepoint hanya membaca tetangga saat resolve.

### 16.2 Opsi B — Layar battle terpisah dengan pilihan taktik eksplisit
- **Referensi:** RP2 (Balance of Power bar 0 sampai 100, Order of Battle, Reserves maks 7 unit di medan, grid terrain, general dan cuaca, order Attack/Defend/Move, auto-pause saat buka Military Staff); HoI4 Combat tactics (dipilih jenderal, re-roll 12 jam, recon +5 skill, initiative +35% bobot per poin; matriks counter: Assault ↔ Counter-Attack, Shock ↔ Ambush, Breakthrough ↔ Backhand Blow, Blitz ↔ Elastic Defense, Encirclement ↔ Tactical Withdrawal); Total War autoresolve dan rout; Solium Infernum (giliran simultan, hidden info); King of Dragon Pass (pilihan naratif + penasihat); Terminal Conflict.
- **Desain jika dipilih:** layar hanya untuk **Major Battle** (gabungan ≥12 unit atau melibatkan kota/ibukota); isi: Balance of Power, Order of Battle, terrain dan cuaca, **kartu taktik per fase 6 tick** (Frontal Assault / Flank / Feint / Hold / Ambush / Withdraw / Bombard) dengan matriks counter ±15 sampai 25%; **hidden simultaneous pick**; telegraphing lewat intel ≥2 ("Hold 60% / Counter 30%"); komandan memberi saran ala KoDP; AI memilih dari trait komandan × counter terhadap taktik pemain yang *diperkirakan* × histori 3 pilihan terakhir; AI vs AI wajib autoresolve.
- **Risiko:** popup fatigue pada 8x (5 sampai 10 layar per 5 menit) → batasi 1 layar aktif atau panel non-modal; UI state dan konsistensi (pemain micro-optimasi yang AI tidak bisa); menambah layar besar + matriks yang harus dipelajari, terasa "game lain".

### 16.3 Opsi C — Hybrid: stance per stack + komandan, tanpa layar battle
- **Referensi:** HoI4 battle plan (planning +2%/hari sampai 30%, decay 1 sampai 3%/hari; Careful/Balanced/Rush; skill +2.5%/level), HoI4 commander traits (terrain +10% atk/def, Trickster +25% recon, Engineer, Fortress Buster +15%, Commando −25% out-of-supply, Ambusher, Logistics Wizard −15% supply, Defensive/Offensive Doctrine), CK3 (Aggressive Attacker, Defender, Forder, Logistician +40% supply, Organizer, Military Engineer −10% siege; trait via peluang per kemenangan `2 + Martial/10`; 10% tertangkap saat kalah; advantage strait +30, river +10 sampai +20, out of supply −25; terrain defender advantage mountains +12, jungle +6, hills +5, forest +3), **Vic3 orders** (Reckless Advance +15% off/+10% morale loss, Cautious Advance, Adamant Defense +15% def, Counter Charge +25% kill, Last Stand +30% def/+30% casualties, Delaying Tactics +200% camouflaged), Stellaris stance (Aggressive/Evasive/Passive), EU4 leader pips 0 sampai 6, UoC2 HQ abilities.

**Set stance yang diusulkan (ganti butuh 6 tick reorganisasi):**
| Stance | Modifier inti | Terrain | Supply | Era |
|---|---|---|---|---|
| **Assault** | Damage ×1.15, received ×1.10; penalti kota −25% menjadi −15% | Mountain/urban ×0.85 tambahan | Tidak boleh saat Cut Off | Semua; WW1 "over the top" mahal |
| **Hold** | Entrench +10%/hari sampai 100% (received ×0.75 di center-point, ×0.9 di luar kota); tidak bergerak | Entrench 2× di hills/forest/urban dan chokepoint | Berhenti saat Low | WW1 inti (trench) |
| **Ambush** | Seperti Hold, entrench maks 50%, **tersembunyi** bila intel musuh <2 di terrain rough; pemicu aturan 16.1 | Hanya rough terrain | Butuh Supplied | WW2 partisan, Modern SOF |
| **Siege** | Tidak menembak defender; siege progress aktif; ranged bombardir (entrench defender −10%/hari) | Target kota/fort | Penyerang harus Supplied | 1453, WW1, Leningrad |
| **Screen** (delay) | Damage ×0.7, received ×0.8, **auto-retreat** saat HP <60% tanpa penalti; pengejar kehilangan 1 tick | Retreat gratis di forest/hills | Ke arah supply source | Semua; kavaleri Salahuddin |
| **Raid** | Move ×1.2, damage ×0.8, tidak merebut; **supply provinsi musuh ×0.5 selama 3 hari** dan morale −10 | Bonus plains/desert | Bawa supply 72 tick | WW2 deep ops, Modern |

**Komandan** (1 per *army group* = stack dalam radius 2 provinsi; 3 sampai 6 per negara): skill 1 sampai 5 (+2.5%/level), 2 sampai 4 trait dari pool ~14 (6 terrain, Engineer +15% vs fort, Logistician +1 supply range/grace 72 tick, Trickster +1 intel level, Cautious morale loss ×0.7, Reckless damage ×1.1 morale loss ×1.3, Defender entrench ×1.5, Raider, Admiral-only Blockader rasio 1.5), diperoleh `(2 + level)%` per kemenangan relevan (trait ke-2+ separuh), plus **1 kemampuan aktif cooldown 72 tick** (Forced March, Emergency Supply, Feint, Concentrated Barrage). Komandan di stack yang surrender → 10% tertangkap. AI memakai pool dan matriks yang sama; trait komandan AI terbaca lewat intel 3 → telegraphing jujur.

### 16.4 Perbandingan 7 kriteria (1 sampai 5, 5 terbaik)
| Kriteria | A emergent | B layar battle | C stance + komandan |
|---|---|---|---|
| Menang lewat posisi meski lebih lemah | **5** | 3 | **5** |
| Jumlah layar/UI baru | **5** (0 layar) | 1 (layar besar + panel) | 4 (1 dropdown + kartu komandan) |
| Kompleksitas AI | 3 (BFS, threat map, hidden-threat, coastal map) | 2 (semua A + pemilih taktik yang tidak terasa curang/bodoh) | 3 (A + pemilih stance berbobot) |
| Beban performa | **5** | 3 (UI battle + auto-pause; AI vs AI autoresolve) | **5** |
| Risiko terhadap kesederhanaan | 4 (mekanik tersembunyi → butuh tooltip breakdown damage) | 2 (matriks counter, terasa game kedua) | 4 (6 stance dalam batas Miller) |
| Kecocokan era | WW1 5, WW2 5, Modern 4 | WW1 3, WW2 4, Modern 4 | WW1 5, WW2 5, Modern 5 |
| Metrik playtest | position-win rate (menang saat rasio <0.8), pocket per perang, tactic flags per combat, pause/menit | popup/menit, waktu di layar vs peta, pemain memilih autoresolve setelah N battle | distribusi stance (80% Assault = gagal), position-win rate, momen narasi per jam |

Tambahan semua opsi: **sim AI-vs-AI headless** 100 perang: encirclement 1 sampai 3 per perang besar, survival pocket, ambush terpicu ≤30% combat.

### 16.5 Sistem pendukung (versi ringan yang diusulkan)
- **Supply**: gabungan adjacency + range. Tiga status: **Supplied**; **Low** (jarak graph ke kota/port terhubung ibukota > R; WW1 R=3, WW2 R=4, Modern R=6; air supply/Logistician +1): attack ×0.9, tidak entrench, morale −1/hari; **Cut Off** (tanpa path): grace 48 tick lalu attack ×0.8, defense ×0.7, HP −1%/hari, morale −3/hari, tanpa reinforcement. Hitung tiap 6 tick dan saat kontrol berubah. Overlay peta 3 warna. (HoI4 hub + rel dinilai terlalu berat.)
- **Morale stack** (tambahan 1 angka per stack, morale provinsi tetap): awal = morale provinsi rekrut; per tick −1 kalah tukar damage, −3 di-flank/Cut Off; +5/hari idle Supplied; damage ×(0.55 + 0.45 × morale/100) (kurva S1914). **Rout** <25: retreat paksa ke supply source, defense ×0.5 saat disengage, tak bisa diperintah 24 tick. **Surrender** bila rout tanpa path: stack hilang, 30% nilai unit menjadi captured equipment pemenang. Hattin tereproduksi: Cut Off + atrisi desert → morale −3/hari → rout → surrender.
- **Fog of war intel 0 sampai 3 per provinsi musuh** (hitung tiap 6 tick): 0 abu; 1 *presence* ("?") dari tetangga langsung; 2 *estimate* ±50% ("5 sampai 15 unit", tipe dominan) dari recon/air/radar; 3 *confirmed* ±10% dari unit di provinsi sama/satelit/spy. Estimasi di-seed deterministik per (provinsi, hari). **AI memakai estimasi yang sama** → diversion, ambush, "kapal lewat darat" ala Mehmed berhasil secara adil. Modern +1 baseline dalam radius radar 2 provinsi (ambush lebih sulit, missile/air menonjol).
- **Commander**: seperti 16.3; biaya 100/200/400 poin militer untuk komandan ke-4 sampai 6.
- **Siege**: `fortLevel 0 sampai 3`; mulai otomatis saat kota terkepung dan ada stack Siege/Hold di tetangga; `progress/hari = 5 + 2×artileri (maks +6) + 3×blockaded + 2×arah tambahan − 3×fortLevel − 2×(garrisonRatio ≥ 1)`; surrender di 100. Contoh: fort 2, 4 artileri, blokade, 2 arah = 10/hari → 10 hari; tanpa blokade dan artileri = macet (pola Konstantinopel tanpa Golden Horn). **Event fase tiap 5 hari** (Supplies shortage −5 morale garrison, Food −10, Water −15 ×2 di desert, Walls breached: penalti assault −25% → −10% selama 48 tick). Defender Hold + Supplied memperbaiki −2/hari; relief yang menembus −10 progress +10 morale (4 kapal 20 April 1453). Fort: received ×(1 − 0.15 × level), −1 level per arah tambahan.

### 16.6 Rekomendasi riset (untuk diputuskan Billy)
**Kandidat utama: "A + C"** (C di atas fondasi A). Alasan: A adalah **prasyarat**, bukan opsi (supply/encirclement/flank/chokepoint/blokade adalah komputasi graph murah yang wajib agar Hattin dan 1453 bisa muncul); C menambah **niat** (Hold/Ambush/Screen/Raid) tanpa layar, seperti Vic3 orders dan HoI4 planning; kecocokan era paling merata; AI simetris; kesederhanaan terjaga asalkan ada **combat breakdown tooltip** ("100 × terrain 0.9 × flanked 1.1 × cut-off 0.8 × stance 1.15").
**Kandidat alternatif: A + B-lite** (panel samping non-modal Balance of Power untuk Major Battle dengan satu pilihan taktik tersembunyi per 6 tick, AI vs AI autoresolve) sebagai eksperimen opsional setelah A+C diuji.
**Tidak direkomendasikan:** B penuh (layar grid ala RP2).
**Urutan bangun:** (1) supply BFS + 3 status + tooltip breakdown; (2) flank, chokepoint, fort-cancel; (3) fog intel 0 sampai 3 dan AI memakai estimasi; (4) morale stack + rout + surrender; (5) 6 stance + komandan 3 sampai 6; (6) siege progress + blockade + naval invasion; (7) sim AI-vs-AI headless; (8) putuskan B-lite.

Catatan aturan 2.1 nomor 5: bahan brainstorming, bukan patokan; Billy bisa memilih B.
