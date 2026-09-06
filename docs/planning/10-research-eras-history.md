# Riset Lanjutan: Sistem Era, Data Historis, Custom Scenario

> Sumber: plan riset Nation Rise, sesi 2026-09-03 sampai 2026-09-04, bagian 18. Dokumen ini bagian dari `docs/planning/`; indeks dan aturan kerja ada di `README.md`. Nomor "bagian N" yang dirujuk di dalam teks mengacu ke penomoran plan asli; petanya ada di README.

## 18. Riset Lanjutan: Sistem Era, Data Historis, Custom Scenario (hasil)

Terverifikasi: CShapes, historical-basemaps, Thenmap (sebagian), OpenHistoricalMap, Euratlas, Natural Earth, manual S1914, guide resmi Call of War, Steam CoW/CoN/S1914/AoC2/Ages of Conflict, HoI4 wiki (National focus, Event modding, Land units, Defines, Triggers, Game rules), Vic3 Journal, Kaiserreich, Wikipedia (1914/1939, Entente, Central Powers, Allies, Axis, Majapahit, Cold War). Angka doktrin CoW, gating hari CoN, dan hari unlock S1914 **belum terverifikasi** (wiki Bytro 403).

### 18.1 Data batas politik historis
| Sumber | Cakupan | Format | Lisensi | Cocok |
|---|---|---|---|---|
| **CShapes 2.0** (ETH Zürich) | 1886 sampai 2019 (Eropa dari 1816); negara dan dependent territories; ibu kota | GeoJSON, SHP, CSV, R package | **CC BY-NC-SA 4.0** (aman untuk pribadi) | **1914, 1939, 1962: sumber utama** |
| **aourednik/historical-basemaps** | BC 123000 sampai 2010; tahun relevan 1300, 1400, 1500, 1600, 1650, 1700, 1715, 1783, 1800, 1815, 1880, 1900, **1914**, 1920, 1930, **1938**, 1945, **1960**, 1994, 2000 | GeoJSON; atribut NAME, SUBJECTO (colonial power), PARTOF, BORDERPRECISION 1 sampai 3 | GPL-3.0 | Era pra-1886 (1350 pakai 1300/1400; 1600; 1803 pakai 1800/1815); cross-check 1914/1938 |
| Thenmap | 1945 sampai sekarang | GeoJSON/TopoJSON API | belum terverifikasi | 1962 saja |
| **OpenHistoricalMap** | Sepanjang sejarah, tag start/end_date | Overpass, dump | **CC0** | Lisensi terbaik, batas politik belum lengkap; jalur bersih jangka panjang |
| Euratlas | Eropa, tiap 100 tahun | Berbayar | Komersial | Tidak perlu |
| GeaCron | View-only | | Proprietary | Referensi visual |
| Wikipedia daftar negara 1914 (~50 sampai 60) dan 1939 (77) | | Teks | CC BY-SA | `nations.json`, ibu kota, protektorat |

**Pendekatan penyelarasan (keputusan arsitektur paling mahal jika berubah):** **geometri provinsi Natural Earth tetap unit permainan di semua era; yang berubah per era hanya tabel kepemilikan** (`political.json`). Pipeline offline: ambil polygon historis untuk tanggal target → untuk tiap provinsi NE hitung **irisan luas terbesar** (bukan centroid) → owner = share terbesar, simpan `confidence` → `confidence < 0.7` masuk `review.json` (perkiraan 150 sampai 300 kasus di 1914: Polandia, Alsace-Lorraine, Silesia, Bessarabia, Balkan, Afrika kolonial; 100 sampai 200 di 1939) → `overrides.json` per era menang atas hasil otomatis → `aliases.json` nama era (Batavia/Jakarta, Königsberg/Kaliningrad, Konstantinopel/Istanbul, Petrograd/Leningrad).

**Model dua lapis `owner` dan `sovereign`:** `{province_id, owner: "DEI", sovereign: "NLD", subject_type: "colony", core_of: ["IDN"], confidence}`. British Raj dan Hindia Belanda = colony (produksi untuk sovereign dengan efisiensi lebih rendah, tanpa diplomasi sendiri); Dominion (Kanada, Australia) = dominion (diplomasi terbatas, ikut perang sovereign otomatis); Austria-Hungaria satu tag AUH dengan `core_of` ganda (AUT/HUN/CZE/YUG) sehingga event dissolusi 1918 melepaskan negara baru tanpa data tambahan; Ottoman `core_of` IRQ/SYR/HJZ; Uni Soviet `core_of` republik; Manchukuo = puppet (AI sendiri, kebijakan luar negeri terkunci ke Jepang; template untuk Slovakia 1939, negara klien Jerman 1918). Kompromi: batas 1914 mengikuti provinsi modern (identik kompromi Call of War); opsi terukur: **sub-split 20 sampai 40 provinsi hot-zone** (Polandia, Silesia, Alsace, Trieste, Transylvania, Makedonia) dengan `merge_groups` per era.

### 18.2 Roster unit dan doktrin per era (pemetaan ke 8 kategori CoN)
| Kategori | PD1 1914 (S1914 + HoI4) | PD2 1939 (CoW/HoI4) | Modern 2026 (CoN) |
|---|---|---|---|
| Infantry | Infantry, Cavalry, Stormtroopers (epoch 1918), Colonial Levies | Militia, Infantry, Motorized, Mechanized, Paratroopers, Commandos | roster CoN |
| Armor | Armoured Car, Tank (epoch 1916), Heavy Tank | Armored Car, Light/Medium/Heavy Tank, Tank Destroyer | MBT, AFV, CRV, ACV |
| Support | Artillery, Heavy Artillery, Railgun, Observation Balloon, Engineers | Artillery, Anti-Tank, Anti-Air, Rocket Artillery, SP Artillery, SP AA | Towed/Mobile Art, MRL, AA, SAM, Radar, TDS |
| Helicopter | **nonaktif** | **nonaktif** | Attack Heli, Gunship, ASW |
| Fixed-Wing | Fighter, Bomber, Zeppelin | Interceptor, Tactical/Attack/Strategic/Naval Bomber, Rocket Fighter | ASF, Strike, Stealth, Bomber, AWACS, UAV, NPA |
| Naval | Destroyer, Light Cruiser, Battleship, Transport | Destroyer, Cruiser, Battleship, Carrier, Convoy | Corvette, Frigate, Destroyer, Cruiser, Carrier |
| Submarine | U-boat | Submarine | Attack Sub, BM Sub |
| Missile | **nonaktif** | V-1, V-2, Nuclear Bomber (epoch 1945) | Cruise, Ballistic, ICBM |

Roster ringkas: PD1 16 unit (infanteri murah, artileri raja, tank lambat), PD2 ~20 unit (combined arms, carrier vs battleship, strategic bombing), Modern 20 unit CoN. **Doktrin per era** (lapisan modifier + 1 sampai 2 signature unit, pola CoN): PD1 Entente (naval/industri) / Central Powers (kualitas darat, Stormtroopers awal) / Peripheral (murah, riset lambat); PD2 Axis / Allies / Comintern / Pan-Asian (skema CoW; angka = hipotesis desain); Modern Western / Eastern / European (+ Non-aligned); Cold War NATO / Warsaw Pact / Non-Aligned (NAM 1961).

### 18.3 Riset per era: "epoch gating"
HoI4 mengikat riset ke tahun (BASE_TECH_COST 110 hari; ahead-of-time 1 tahun = kecepatan 1/3); Bytro mengikat ke hari ronde. Usulan gabungan: `era.json` mendefinisikan `epochs` (label, start_day); node riset punya `epoch` dan `duration_hours`; hari unlock dihitung dari era sehingga `research.json` tetap valid jika kampanye 60 → 90 hari. **AOT ringan:** satu epoch lebih awal dengan durasi ×3, tidak boleh dua. Slot 2 dasar +1 bangunan +1 doktrin (maks 4). Durasi T1 6h, T2 12h, T3 24h, T4 36h, T5 48h; 4 slot × 60 hari ≈ 70% tree.
| Era | Kampanye | Epoch → hari |
|---|---|---|
| PD1 1914 | 52 hari | Ags 1914@1 · 1915@6 · 1916@18 · 1917@30 · 1918@42 · Armistice@52 |
| PD2 1939 | 60 sampai 72 hari | 1939@1 · 1940@8 · 1941@18 · 1942@30 · 1943@42 · 1944@52 · 1945@60 |
| Modern 2026 | 30 sampai 60 hari | 2026@1 · 2027@10 · … · 2031@50 (tanpa tekanan historis) |
| Cold War 1962 | 45 hari | 1962@1 · 1964@10 · 1966@20 · 1968@30 · 1970@40 |

### 18.4 Historical events dan divergensi
Sumber: HoI4 focus (70 PP/70 hari), event modding (trigger, mean_time_to_happen, fire_only_once, option dengan `ai_chance`), `is_historical_focus_on`; Vic3 Journal (visibility → activation → completion/failure/timeout); Kaiserreich (divergensi lewat konten, bukan mekanik); CoW tanpa event.
**Sistem event ringan (30 sampai 60 per era):** `events.json` dengan `scope`, `window {from_day, to_day}`, **trigger deklaratif** (owner_of, controller_of, at_war, at_war_with, alliance_member, has_researched, nation_exists, government_is, flag_set) dicek per hari game, `once`, `options[]` dengan `effects` dari **~15 verba** (declare_war, make_peace, join_alliance, transfer_provinces, release_nation via `core_of`, annex, set_government, rename_nation, set_flag_asset, move_capital, spawn_units, add_resource, add_modifier, set_ai_stance, unlock_research, fire_event) dan `ai_weight {historical, free}`; `chronicle` template; `fallback_if_invalid: log_divergence`. **Toggle Historical AI vs Free AI** saat setup (AI memakai bobot historical atau free; pemain selalu bebas). **Divergensi dicatat, bukan dipaksa**: event yang prasyaratnya gugur ditandai `diverged` dan Chronicle mencatat "Sejarah menyimpang: X tidak terjadi karena Y". **Pemain dikecualikan dari skrip identitas** (hanya ditawarkan); AI dapat dipaksa event terdesain (RUS → SOV 1917). **Journal ringan** 3 sampai 5 tujuan per negara mayor per era (pengganti focus tree).
Backbone contoh PD1 (~12 dari 40): Serbia-AUH dan Belgia (day 1), Jepang, Ottoman (day ~3), Italia (day ~10), Bulgaria (day ~15), Portugal/Rumania (day 20 sampai 25), AS (day ~32), Revolusi Rusia (day ~35), Brest-Litovsk (day ~43, release Finlandia/Ukraina/Baltik), Armistice/dissolusi AUH (day 52). PD2: Polandia/GBR-FRA (day 1), Winter War, Fall Gelb, Italia (Jun 1940), Tripartite, Barbarossa (Jun 1941), Pearl Harbor (Des 1941), PBB (Jan 1942), Italia berbalik 1943, pemerintahan pengasingan (`exile_government`), bom atom 1945. Modern: ~30 krisis fiksional-generik tanpa tokoh nyata (Sandbox-first).

### 18.5 Empat arti "masa custom" (semua direncanakan)
| Arti | Data | UI | Effort | Nilai replay |
|---|---|---|---|---|
| **(a) Preset alt-history sebagai era pack** (Cold War 1962, Napoleonic 1803, Age of Sail 1600, Majapahit 1350, Ancient) | Folder era penuh: political (historical-basemaps / CShapes), roster, riset, 20 sampai 40 event | Kartu era di layar mulai | Tinggi per pack; Cold War termurah (roster Modern tier rendah), Majapahit termahal (roster jong, gajah; 5 kategori mati) | Tinggi |
| **(b) Editor scenario in-game** (pilih era pack, cat pemilik provinsi, kekuatan awal ×0.5 sampai ×2, aliansi, toggle event, ibu kota) | Hanya `political.json` + `scenario.json` overlay | Brush owner + undo + validasi (semua provinsi punya owner, peringatan kontiguitas) | Sedang (2 sampai 3 minggu) | Sangat tinggi |
| **(c) Sandbox acak / shattered world** (seed, 20 sampai 120 negara, ukuran, kontiguitas, generator nama per kultur) | Seed + parameter | Layar Generate: seed, slider, preview, reroll | Rendah sampai sedang (1 minggu; BFS region growing) | Tinggi untuk pemain sistemik |
| **(d) Modding folder** (drop `mods/eras/*`) | Skema JSON + validator + contoh pack | Daftar era membaca `content/eras/*` dan `mods/eras/*`; laporan error | Rendah jika skema dibangun sejak Modern | Tinggi jangka panjang |
Preseden: AoC2 (Scenario/Map Editor, Civilization Creator, Flag Maker, Workshop), Ages of Conflict (Scenario Creator, God Mode, undo 20, name culture). Rekomendasi urutan: (d) fondasi sejak Modern → (b) setelah PD2 → (c) daur ulang brush (b) → (a) bertahap mulai Cold War 1962.

### 18.6 Model waktu per era
**Tick tetap 1 jam game, 24 tick = 1 hari game di semua era** (semua angka ekonomi/gerak/riset CoN dikalibrasi ke unit ini). Yang berubah per era = **kalender naratif**: `calendar {start_date, hist_days_per_game_day}`.
| Era | Kampanye | Rasio | Tampilan |
|---|---|---|---|
| Modern 2026 | 30 sampai 60 hari | 1 hari game = 1 hari kalender | "Hari 12 · 13 Mar 2026" |
| PD2 1939 | 60 sampai 72 hari | 1 hari game ≈ 30 sampai 36 hari sejarah (Sep 1939 → Sep 1945) | "Hari 21 · Juni 1941" |
| PD1 1914 | 52 hari | 1 hari game ≈ 30 hari (Ags 1914 → Nov 1918) | "Hari 32 · April 1917" |
| Cold War 1962 | 45 hari | ≈ 2 bulan | "Hari 10 · 1964" |
| Majapahit 1350 | 45 hari | ≈ 1 tahun | "Hari 15 · 1365" |
Konsekuensi: gerak unit tidak diskalakan (abstraksi yang sama dengan S1914/CoW, pemain berpikir dalam hari ronde); **keuntungan**: musim (atrisi Rusia Nov sampai Mar, monsun, badai Atlantik) dan event dipicu tanggal naratif; Chronicle mencatat `day` dan `date`; speed 1x/2x/4x/8x hanya mengubah durasi nyata tick.

### 18.7 Skema era pack
```
content/shared/   provinces.geojson, adjacency.json, terrain.json, cities.json, sea_zones.json, unit_categories.json
content/eras/<era>/   era.json (meta, calendar, epochs, disabled_categories, doctrines, alliances), political.json, nations.json (tag, nama, bendera, ibu kota, pemerintahan, doktrin, ai persona, identity_locked), resources.json, units.json, research.json, buildings.json, events.json, rules.json (supply range, morale, musim, WMD), aliases.json, overrides.json, assets/flags/
content/scenarios/    overlay editor (b) dan sandbox (c)
mods/eras/            drop-in (d), skema identik
```
Lintas era (shared): geometri, adjacency, terrain, sea zones, kunci kota, 8 kategori dan engine combat, formula ekonomi, mesin event dan verba, Chronicle, skema AI. Per era: kepemilikan/core/subject, alias, roster dan `disabled_categories`, daftar resource dan yield per terrain, konten event/journal/kalender/epoch, bobot historis, aliansi awal.
**Validasi (build dan saat memuat mod):** JSON Schema (Ajv) + `schema_version`; integritas referensi (owner/sovereign ada di nations, doctrine ada di era, category ada di shared, epoch ada di era, scope/efek merujuk tag/provinsi valid); cakupan 100% provinsi punya owner (atau `UNCOLONIZED`); epoch monoton ≤ campaign_days; tiap kategori aktif punya ≥1 unit di epoch pertama; total unit ≤ 24; laporan provinsi `confidence < 0.7` tanpa override.
**Chronicle** = log append-only `{day, date, actor, kind, payload, text}` (war_declared, province_captured, event_choice, divergence, identity_change, research_done, alliance) → timeline dan peta bertahap di layar akhir. **Nation evolution**: `nation_state.history[]` di save (nama, bendera, ibu kota, pemerintahan, doktrin, day); tag tidak berubah sehingga referensi event tetap valid; bendera custom pemain = SVG dari palet + simbol, disimpan di save.

### 18.8 Urutan pembangunan era
| Tahap | Alasan | Risiko |
|---|---|---|
| 1. Modern 2026 (skema + loader + validator + Chronicle) | Roster/doktrin/resource CoN = core; political = Natural Earth apa adanya | Godaan hard-code "hanya modern" |
| 2. PD2 1939 | Referensi paling lengkap (CoW, HoI4, Kaiserreich); CShapes 1939 bersih; 77 negara + puppet jelas; hanya Helicopter mati | Pipeline koloni/puppet = kerja data terbesar; balancing 4 doktrin; 40 event |
| 3. PD1 1914 | Daur ulang pipeline; roster kecil; uji `disabled_categories` dan `release_nation` skala besar | Provinsi modern paling "salah" (Polandia, Balkan, Afrika); Armor kosong sampai day 18 |
| 4. Custom (d) + (b) | Skema stabil setelah 3 era; editor hanya `political.json` | Validasi kontiguitas, UX brush |
| 5. Cold War 1962 (a) | CShapes 1962; roster Modern tier rendah; blok terverifikasi; Cuban Missile Crisis flagship | Nuklir sebagai deterrent, bukan alat menang |
| 6. Sandbox acak (c) | Murah setelah editor | Nama/bendera generatif terasa slop jika tidak dikurasi per kultur |
| 7. Napoleonic / Age of Sail / Majapahit | Replay tinggi; roster dan resource baru; historical-basemaps presisi benua | 5 kategori mati; pertimbangkan `category_overrides` |

**Rekomendasi penutup:** kunci "provinsi tetap, kepemilikan per era" + pipeline overlay + overrides sebelum konten historis; CShapes untuk 1914/1939/1962 (pribadi), historical-basemaps untuk pra-1886, OHM (CC0) sebagai jalur bersih; epoch gating dengan AOT ×3; event deklaratif dengan bobot historical/free dan divergensi dicatat; tick 1 jam tetap dengan kalender naratif per era; verifikasi manual angka doktrin CoW dan gating CoN sebelum menyalin.
