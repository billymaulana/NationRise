# Riset: Dataset Negara untuk `nations.json` (Modern 2026)

> Sumber: riset sesi 5 (2026-09-04). Verifikasi lewat SIPRI fact sheet 2025 dan 2026 (ekstraksi PDF), Wikipedia (militer, belanja, konflik, pantai, sengketa, keanggotaan), FAS nuklir 2026. WebSearch tidak tersedia. Wiki Conflict of Nations tidak dapat diakses (402/403), sehingga frasa deskripsi CoN ditandai [UNVERIFIED]. Bagian dari `docs/planning/`; indeks di `README.md`.

## 1. Heuristik doktrin militer

**Bloc pemasok** dihitung dari SIPRI TIV 2021 sampai 25 (fallback 2020 sampai 24): `W` = USA, Kanada, Australia, Jepang, Korea Selatan, Israel; `EU` = Prancis, Jerman, Italia, Inggris, Spanyol, Swedia, Belanda, Norwegia, Ceko, Polandia, Swiss, Denmark, Turki; `E` = Rusia, China, Belarus, Iran, Korea Utara, Ukraina (legacy ke China). SIPRI hanya memublikasikan 3 pemasok teratas per negara; di luar top-40 pakai infobox Wikipedia dan tandai share belum terverifikasi.

**Aturan urut (first match wins):**
```
R0  manual_override
R1  USA → Western (anchor); RUS, CHN → Eastern (anchor)
R2  NATO dan region Eropa → European (termasuk TUR, GRC, GBR)
R2b EU atau EFTA (AUT, IRL, CYP, MLT, CHE) → European
R3  NATO non-Eropa (CAN) → Western
R4  MNNA atau sekutu perjanjian AS (JPN, KOR, AUS, NZL, PHL, THA, TWN, ISR) dan share_W >= 40 → Western
R5  CSTO (BLR, KAZ, KGZ, TJK) atau satu partai komunis (VNM, LAO, CUB, PRK) atau share_E >= 50 → Eastern
R6  share_EU >= 50 dan bukan NATO → Non-aligned, lean european
R7  share_W >= 40 (non-sekutu) → Non-aligned, lean western
R8  sisanya → Non-aligned, lean = argmax(bloc) jika >= 35, selain itu mixed
```
Keanggotaan: NATO 32; CSTO 6 (Armenia membekukan partisipasi Feb 2024, Uzbekistan keluar 2012); MNNA 22 (Arab Saudi dan Peru 2026, Kenya 2024, Kolombia dan Qatar 2022); SCO 10 (Iran 2023, Belarus 2024); BRICS 10 penuh (Indonesia 2025) + 12 partner.

**Tabel doktrin (ringkas, share SIPRI 2021 sampai 25):**
| Negara | Pemasok 1/2/3 (%) | Rule | Doktrin | Catatan |
|---|---|---|---|---|
| USA | UK 17 / FRA 14 / ITA 13 | R1 | Western | anchor |
| Rusia | Iran (drone), DPRK (arty); 0.4% impor global | R1 | Eastern | anchor |
| China | RUS 66 / UKR 15 / FRA 13 | R1 | Eastern | sub-variant Sino |
| Inggris | USA 85 / ISR 8.2 / DEU 2.7 | R2 | European | |
| Prancis | eksportir #2 (9.8%) | R2 | European | |
| Jerman | ISR 55 / USA 37 / SWE 2.8 | R2 | European | |
| Italia | USA 93 | R2 | European | |
| Spanyol | USA 49 / CHE 25 / FRA 9.1 | R2 | European | |
| Polandia | KOR 47 / USA 44 / ITA 2.2 | R2 | European | milex 4.5% PDB |
| Yunani | FRA 68 / USA 17 / ITA 4.4 | R2 | European | |
| Turki | DEU 31 / ESP 29 / ITA 19 | R2 | European | **review**: industri domestik besar, S-400 Rusia |
| Kanada | USA 32 / ESP 26 / AUS 11 | R3 | Western | |
| Jepang | USA 95 / UK 3.4 | R4 | Western | |
| Korea Selatan | USA 93 | R4 | Western | |
| Australia | USA 85 / ESP 6.5 | R4 | Western | |
| Taiwan | USA 96 | R4 | Western | |
| Israel | USA 68 / DEU 31 | R4 | Western | |
| Filipina | KOR 42 / ISR 20 / USA 15 | R4 | Western | share_W 77 |
| Arab Saudi | USA 77 / ESP 9.5 / FRA 4.6 | R4 (MNNA 2026) | Western | |
| Maroko | USA 60 / ISR 24 / FRA 10 | R4 | Western | |
| Thailand | CHN 49 / USA 15 / ISR 9.2 | R8 | Non-aligned | lean eastern; MNNA hedging |
| Mesir | FRA 39 / DEU 30 / ITA 18 | R6 | Non-aligned | lean european; MNNA + BRICS |
| **Indonesia** | ITA 40 / USA 16 / FRA 14 (2020 sampai 24: USA 33 / FRA 15 / KOR 12) | R6 | **Non-aligned** | lean european/mixed; legacy Su-27/30 |
| Singapura | DEU 40 / USA 33 / ISR 12 | R7 | Non-aligned | lean western; FPDA |
| Brasil | FRA 62 / SWE 18 / ITA 8.6 | R6 | Non-aligned | lean european; MNNA 2019 |
| India | RUS 40 / FRA 29 / ISR 15 | R8 | Non-aligned | lean eastern menurun; SCO + BRICS + Quad |
| UEA | USA 42 / FRA 18 / KOR 10 | R7 | Non-aligned | lean western |
| Ukraina | USA 41 / DEU 14 / POL 9.4 | R7 | Non-aligned | lean western; **review**: inventaris hybrid |
| Pakistan | CHN 80 / TUR 7 / NLD 4.6 | R5 | Eastern | |
| Aljazair | RUS 39 / CHN 27 / DEU 18 | R5 (share_E 66) | Eastern | |
| Kazakhstan | RUS 83 / ESP 7.9 | R5 (CSTO) | Eastern | |
| Belarus | RUS 100 | R5 | Eastern | |
| Serbia | CHN 61 / FRA 12 / RUS 7 | R5 (share_E 68) | Eastern | **review**: Rafale 2024, PfP |
| Vietnam | RUS legacy dominan | R5 (komunis) | Eastern | |
| Korea Utara, Kuba, Laos | RUS/CHN legacy | R5 | Eastern | |
| Iran | domestik mayoritas + RUS, CHN | R0 manual | Eastern | SCO + BRICS |
| Venezuela, Myanmar, Bangladesh | RUS/CHN dominan | R5 | Eastern | Bangladesh lean sino |
| Uzbekistan, Armenia, Azerbaijan, Irak, Malaysia, Ethiopia, Nigeria, Chile, Peru, Afrika Selatan | campuran | R8 | Non-aligned | mixed |
| Argentina, Meksiko, Oman | USA/EU | R7 | Non-aligned | lean western |

Default sisanya (~135 negara): jalankan R2 sampai R8 otomatis; tanpa data impor → Non-aligned lean mixed dengan `doctrine_confidence: default`. Eksportir 2021 sampai 25: USA 42%, Prancis 9.8, Rusia 6.8 (turun 64% vs 2016 sampai 20), Jerman 5.7, China 5.6 (61% ekspornya ke Pakistan).

## 2. Heuristik persona AI

**Input terukur:** `milex_gdp` (SIPRI 2025: Ukraina 39.6, Aljazair 8.83, Israel 7.81, Rusia 7.50, Saudi 6.48, Azerbaijan 6.47, Armenia 6.09, Oman 5.68, Kuwait 4.69, Yordania 4.56, Polandia 4.50, Maroko 3.54, USA 3.1, Jerman 2.3, India 2.3, China 1.7, Jepang 1.4); `conflict_active` (Wikipedia ongoing armed conflicts: perang besar 2026 = Israel-Iran dan proxy, Myanmar, Sudan, DRC, Somalia, Sahel, Meksiko, Rusia-Ukraina); `coast_ratio` m/km2 (Norwegia 274, Singapura 272, Denmark 179, Filipina 122, Yunani 105, Jepang 81.6, Inggris 51, Taiwan 49, **Indonesia 30 dengan 54.716 km**, Italia 26, Kanada 22 dengan 202.080 km, Malaysia 14, Vietnam 11, Turki 9.4, Australia 3.4 dengan 25.760 km, Rusia 2.3, China 1.6); `claims` (Venezuela atas Essequibo, Guatemala atas Belize, Argentina atas Falklands, Maroko atas Ceuta/Melilla, India-Pakistan Kashmir, Iran-UEA Abu Musa, Israel Golan, Mesir-Sudan Hala'ib, Ethiopia-Sudan Al-Fashaga, Malaysia-Indonesia Ambalat); `power_rel`; `gdp_pc`; `regime`.

**Aturan urut:**
```
P1 Expansionist: klaim >= 2 provinsi luar batas atau >= 10% luas sendiri, dan power_rel >= 1.5
P2 Militarist:   milex_gdp >= 4.0 dan konflik aktif atau perang antarnegara <= 10 tahun; atau nuklir dan pariah
P3 Naval:        (coast_ratio >= 40 atau coastline >= 10.000 km atau kepulauan) dan kapal utama >= 10
P4 Economic:     gdp_pc >= 30.000 dan milex_gdp < 2.0 dan tanpa konflik; atau trade_gdp >= 100 dan milex < 3.5
P5 Defensive:    default
```
**Bobot:** `aggression = clamp(0.15 + 0.35·konflik + 0.03·milex_gdp + 0.20·expansionist − 0.10·demokrasi)`; `loyalty = clamp(0.30 + 0.40·aliansi formal + 0.20·(pemasok teratas >= 70) − 0.20·multi-vector)`; `risk_tolerance = clamp(0.25 + 0.25·otoriter + 0.15·nuklir + 0.20·konflik − 0.15·(gdp_pc >= 30.000))`; `economic_focus = clamp(0.30 + 0.35·(gdp_pc >= 30.000) + 0.20·(trade_gdp >= 80) − 0.30·konflik)`.

**Katalog agenda (18):** REGIONAL_HEGEMON, GREAT_POWER_RESTORATION, MIDDLE_KINGDOM, BLOC_LOYALIST, FRONTLINE_BASTION, OIL_GUARDIAN, ISLAND_FORTRESS, REUNIFICATION, BUFFER_STATE, TRADE_REPUBLIC, REVANCHIST, PACIFIST_CONSTITUTION, FORTRESS_NEUTRALITY, STRAITS_KEEPER, SIEGE_ECONOMY, COUNTERINSURGENCY_STATE, WATER_SECURITY, CONTINENTAL_BALANCER.

**Persona terpilih:**
| Negara | Persona | Agenda | agg / loy / risk / econ |
|---|---|---|---|
| USA | Militarist (override Hegemon) | REGIONAL_HEGEMON global | .55 / .70 / .45 / .55 |
| China | Expansionist | MIDDLE_KINGDOM, REUNIFICATION | .60 / .40 / .50 / .60 |
| Rusia | Expansionist | GREAT_POWER_RESTORATION | .85 / .50 / .75 / .20 |
| India | Expansionist lemah | REGIONAL_HEGEMON | .45 / .30 / .40 / .50 |
| Turki | Expansionist | REGIONAL_HEGEMON | .55 / .45 / .55 / .40 |
| Venezuela | Expansionist | REVANCHIST (Essequibo) | .60 / .35 / .65 / .15 |
| Israel | Militarist | FRONTLINE_BASTION | .80 / .75 / .70 / .35 |
| Arab Saudi | Militarist | OIL_GUARDIAN | .55 / .65 / .45 / .55 |
| Korea Utara | Militarist | SIEGE_ECONOMY, REUNIFICATION | .75 / .40 / .85 / .05 |
| Ukraina | Militarist | FRONTLINE_BASTION | .70 / .60 / .70 / .15 |
| Iran | Militarist | SIEGE_ECONOMY | .65 / .35 / .70 / .20 |
| Ethiopia | Militarist | WATER_SECURITY | .60 / .25 / .60 / .20 |
| Jepang | Naval | PACIFIST_CONSTITUTION → ISLAND_FORTRESS | .20 / .85 / .25 / .70 |
| Inggris | Naval | BLOC_LOYALIST | .40 / .85 / .40 / .55 |
| **Indonesia** | **Naval** | **STRAITS_KEEPER** | .30 / .25 / .35 / .55 |
| Filipina | Naval | ISLAND_FORTRESS | .35 / .60 / .40 / .40 |
| Yunani | Naval | FRONTLINE_BASTION vs Turki | .40 / .70 / .40 / .40 |
| Australia | Naval | BLOC_LOYALIST (AUKUS) | .35 / .85 / .35 / .60 |
| Norwegia | Naval | FRONTLINE_BASTION Arktik | .25 / .85 / .30 / .65 |
| Jerman | Economic | BLOC_LOYALIST | .25 / .80 / .25 / .80 |
| Swiss | Economic | FORTRESS_NEUTRALITY | .05 / .10 / .10 / .90 |
| Singapura | Economic | TRADE_REPUBLIC, STRAITS_KEEPER | .20 / .45 / .25 / .90 |
| Vietnam | Defensive | FORTRESS_NEUTRALITY (Four No's) | .30 / .20 / .40 / .50 |
| Taiwan | Defensive | ISLAND_FORTRESS | .25 / .70 / .45 / .55 |
| Polandia | Defensive → Militarist | FRONTLINE_BASTION | .40 / .90 / .40 / .45 |
| Serbia | Defensive | BUFFER_STATE, revanchist Kosovo | .40 / .30 / .40 / .40 |
| Kazakhstan | Defensive | BUFFER_STATE multi-vector | .15 / .55 / .20 / .60 |
| Brasil | Defensive | CONTINENTAL_BALANCER | .20 / .30 / .25 / .60 |
| Meksiko, Kolombia, Irak | Defensive | COUNTERINSURGENCY_STATE | .20 sampai .35 |
Default sisanya: Defensive dengan BUFFER_STATE bila di antara dua Tier >= 4, FORTRESS_NEUTRALITY bila netral konstitusional, TRADE_REPUBLIC bila trade/PDB >= 100, selain itu BLOC_LOYALIST bila anggota aliansi.

## 3. Label kesulitan pemain
```
D = 0.25·S + 0.25·T + 0.20·G + 0.15·R + 0.15·E
S = 1 − norm(log VP_awal)
T = min(1, tetangga_lebih_kuat/3)·0.7 + 0.3·(tetangga nuklir bermusuhan)
G = 0.4·kepulauan + 0.2·wilayah terbelah + 0.2·landlocked + 0.2·(gunung+hutan >= 0.5)
R = 1 − jenis_resource_dimiliki / total
E = 1 − norm(log PDB)
Label: < 0.30 Easy | 0.30 sampai 0.50 Normal | 0.50 sampai 0.68 Hard | >= 0.68 Very Hard
Modifier: −0.05 bila Tier militer >= 4; +0.05 bila konflik internal aktif
```
Contoh: USA .01 Easy; China .07 Easy; Rusia .08 Easy; Brasil .12 Easy; India .17; Australia .27 Normal; Jerman .20; Jepang .36 Normal; Korea Selatan .43; **Indonesia .43 Hard** (kepulauan .80, Papua +.05); **Vietnam .39 Hard**; Malaysia .47 Hard; Filipina .50 Hard; Iran .34 Hard; Pakistan .46 Hard; Yunani .57 Hard; Ukraina .49 Very Hard; Israel .55 Very Hard; Taiwan .65 Very Hard; Singapura .72 Very Hard.

## 4. Tier militer awal
```
M = 0.35·norm(log personel) + 0.30·norm(log milex) + 0.20·equip_index + 0.15·nuklir
equip_index = norm(0.3·log(tank+1) + 0.3·log(pesawat+1) + 0.4·log(kapal + 3·kapal selam + 10·kapal induk + 1))
Tier 5 >= 0.85 | Tier 4 0.65 sampai 0.85 | Tier 3 0.45 sampai 0.65 | Tier 2 0.28 sampai 0.45 | Tier 1 < 0.28
Modifier obsolete: milex/personel < US$15k per prajurit → semua unit awal level 1
```
| Tier | Stack | Komposisi (Inf / Armor+Recon / Arty+AA / Air / Naval) | Riset Day 1 |
|---|---|---|---|
| 5 | 24 | 8 / 5 / 3 / 5 / 3 | Motorized L2, MBT L2, AA, Multirole L2, Strike Fighter, Attack Heli, Destroyer, Submarine, Cruise Missile, Ballistic (+ICBM bila nuklir) |
| 4 | 18 | 7 / 4 / 2 / 3 / 2 | Motorized L2, MBT L1, AA, Multirole L1, Attack Heli, Frigate, Submarine, Cruise Missile |
| 3 | 14 | 6 / 3 / 2 / 2 / 1 | Motorized L1, MBT L1, Towed Arty, AA, Strike Fighter L1, Frigate atau Corvette |
| 2 | 10 | 5 / 2 / 1 / 1 / 1 | Motorized L1, Combat Recon, Towed Arty, Interceptor L1, Corvette |
| 1 | 6 | 4 / 1 / 1 / 0 / 0 | Motorized L1, Towed Arty (+1 Corvette bila pesisir) |
Penyesuaian persona: Naval memindahkan 2 stack darat ke laut (+1 kapal selam); Militarist +1 arty +1 air; Economic −2 stack +10% resource awal; landlocked tanpa naval.
Nuklir hanya 9 negara (FAS 2026: Rusia 5.420, USA 5.042, China 620, Prancis 370, Inggris 225, India 190, Pakistan 170, Israel 90, Korea Utara 60; total ~12.187) dengan `nuclear_start_warheads` RUS 6, USA 6, CHN 3, FRA 2, GBR 2, IND 2, PAK 2, ISR 1 (ambigu), PRK 1; sisanya 0 dan riset nuklir terkunci sampai >= Day 15. Toggle `settings.nuclear_start`.

**Tier per negara:** Tier 5 = USA (1.34 jt personel; US$954 mld; 11 kapal induk, 68 kapal selam), China (2.03 jt; 336; 3 CV, 47 SS), Rusia (1.26 jt; 190; 28 SS). Tier 4 = India, Inggris, Prancis, Jepang, Jerman, Korea Selatan, Turki, Israel, Arab Saudi, Pakistan, Iran, Korea Utara (obsolete), Italia, Ukraina. Tier 3 = Mesir, **Indonesia (404.500 personel, 4 kapal selam, 31 kapal utama)**, Brasil, Polandia, Taiwan, Australia, Spanyol, Kanada, UEA, Aljazair, Vietnam (obsolete parsial), Thailand, Yunani, Belanda, Singapura, Irak, Meksiko, Kolombia, Maroko, Kazakhstan, Nigeria, Ethiopia (obsolete), Bangladesh, Swedia, Norwegia, Myanmar. Tier 2 = Malaysia, Filipina, Argentina, Chile, Peru, Venezuela (obsolete), Azerbaijan, Uzbekistan, Serbia, Rumania, Ceko, Belgia, Denmark, Finlandia, Portugal, Hungaria, Kuwait, Qatar, Oman, Yordania, Kuba (obsolete), Afrika Selatan, Angola, Sudan, Eritrea (obsolete), Kamboja, Selandia Baru, Swiss, Austria, Belarus, Armenia, Suriah. Tier 1 = sisanya (~120 negara).

Ketidaksesuaian sumber yang ditemukan (pilih IISS dan simpan `source_year`): Kazakhstan 39.000 vs 110.000; Indonesia 433.700 vs 404.500; Turki 355.200 vs 481.000; Nigeria 143.000 vs 230.000; Bangladesh 171.250 vs 204.000. Data peralatan Wikipedia berasal dari Military Balance 2020 (pesawat 2015), jadi hanya untuk peringkat relatif.

## 5. Deskripsi negara dan saran strategi
**Template:** kalimat 1 geografi (`{size_label} {geo_type} di {region}, {coast_phrase}, {terrain_phrase}`), kalimat 2 kekuatan dan kelemahan, kalimat 3 saran plus frasa kesulitan (Easy "Awal yang memaafkan untuk pemain baru", Normal "Awal yang seimbang", Hard "Cocok untuk pemain berpengalaman", Very Hard "Disarankan hanya untuk veteran").

**Indonesia (ID):** Negara kepulauan berukuran menengah di Asia Tenggara dengan 54.716 km garis pantai yang membentang di Selat Malaka, Sunda, dan Lombok. Kekuatannya adalah populasi besar, resource lengkap, dan posisi penjaga selat; kelemahannya adalah logistik antar-pulau yang lambat dan armada yang tersebar. Bangun angkatan laut dan transport amfibi sejak hari pertama, kunci Jawa dan Sumatra sebagai inti industri, lalu ekspansi ke Malaysia atau Australia utara. Cocok untuk pemain berpengalaman.
**(EN):** A medium-sized archipelagic nation in Southeast Asia with 54,716 km of coastline commanding the Malacca, Sunda and Lombok straits. Its strengths are a large population, a complete resource set and chokepoint control; its weakness is slow inter-island logistics and a dispersed fleet. Invest in naval and amphibious lift from Day 1, secure Java and Sumatra as the industrial core, then expand toward Malaysia or northern Australia. Best suited for experienced players.

Sembilan contoh lain tersedia di laporan riset asli: Malaysia (wilayah terbelah, Hard), Vietnam (perang hutan, China di utara, Hard), Australia (benua terisolasi, Normal), India (dua front nuklir, Normal), China (14 tetangga, lingkaran sekutu AS, Easy), Jepang (kepulauan tanpa kedalaman, Normal), Turki (jembatan dua benua, Bosporus, Normal), Jerman (jantung Eropa tanpa penghalang, Easy sampai Normal), Brasil (kontinental aman, belanja rendah, Easy).

## 6. Skema dan pipeline `nations.json`
**Field dan sumber:** `iso3`, `name_en`, `name_id` (ISO/Wikidata); `region`, `subregion` (UN M49); `government_type`, `regime_score` (Factbook Jan 2026); `gdp_usd`, `gdp_pc_usd`, `population`, `trade_gdp` (World Bank); `milex_usd`, `milex_gdp` (SIPRI); `personnel_active/reserve/paramilitary` (IISS); `equipment` (Military Balance 2020, tua); `nuclear` (FAS 2026); `memberships` (Wikidata + Factbook; FPDA/Quad/AUKUS manual); `arms_suppliers` dan `bloc_share` (SIPRI top-40, sisanya infobox); `doctrine`, `doctrine_lean`, `doctrine_rule`, `doctrine_confidence`; `coastline_km`, `coast_ratio`, `is_archipelago`, `is_landlocked`, `is_split_territory`, `terrain_share`; `claims` (manual); `conflicts`; `persona`, `agenda`, `weights`; `difficulty`; `military_tier`, `start_stacks`, `day1_research`, `obsolete_modifier`; `description` dan `strategy_hint` (id, en); `meta` (source_year, manual_overrides, unverified).

**Wajib kurasi manual:** `claims` (tidak ada dataset lengkap; mulai dari 25 sengketa utama), doktrin negara berlabel review (TUR, SRB, UKR, IRN, EGY, SGP, ARE, ARG), `is_archipelago` dan `is_split_territory` dan `terrain_share`, persona dan agenda Tier >= 3 (60 negara), deskripsi negara playable unggulan, personel bila dua sumber berbeda lebih dari 20%.

**Refresh tahunan:** Maret SIPRI Arms Transfers (ekstrak `pdftotext -layout`, parse Table 1 dan 2, hitung ulang bloc_share, jalankan R1 sampai R8, diff doktrin untuk review); April SIPRI Military Expenditure; Februari IISS via Wikipedia; Januari sampai Maret FAS nuklir; kapan saja Factbook, World Bank, Wikidata, konflik. Validasi: jumlah doktrin per bloc, Tier 5 hanya 3 negara, nuklir hanya 9 iso3, jumlah start_stacks sesuai tabel tier, tiap `claims.target_iso3` ada di peta.

**Contoh `nations.json` Indonesia** (ringkas; versi penuh di laporan riset):
```json
{
  "iso3": "IDN", "name_id": "Indonesia", "region": "Asia", "subregion": "South-eastern Asia",
  "government_type": "presidential_republic", "regime_score": 0.65,
  "personnel_active": 404500, "personnel_reserve": 401000, "paramilitary": 63850,
  "equipment": { "tanks": 313, "combat_aircraft": 97, "principal_ships": 31, "submarines": 4, "carriers": 0, "source_year": 2020 },
  "nuclear": { "warheads": 0, "start_warheads": 0 },
  "memberships": ["ASEAN", "BRICS", "G20", "OIC", "NAM"],
  "arms_suppliers": [{ "iso3": "ITA", "share": 40, "period": "2021-25" }, { "iso3": "USA", "share": 16 }, { "iso3": "FRA", "share": 14 }],
  "bloc_share": { "W": 16, "EU": 54, "E": 0 },
  "doctrine": "Non-aligned", "doctrine_lean": "european", "doctrine_rule": "R6",
  "coastline_km": 54716, "coast_ratio": 30.2, "is_archipelago": true, "is_split_territory": true,
  "terrain_share": { "mountain": 0.25, "jungle": 0.55, "desert": 0.0 },
  "claims": [{ "province_id": "ambalat", "target_iso3": "MYS", "strength": 0.3 }],
  "conflicts": [{ "name": "Papua conflict", "intensity": "100-999", "type": "internal" }],
  "persona": "Naval", "agenda": "STRAITS_KEEPER",
  "weights": { "aggression": 0.30, "loyalty": 0.25, "risk_tolerance": 0.35, "economic_focus": 0.55 },
  "difficulty": { "score": 0.43, "label": "Hard" },
  "military_tier": 3, "start_stacks": { "infantry": 5, "armor": 2, "artillery_aa": 2, "air": 2, "naval": 3 }
}
```

## Sumber
SIPRI fact sheets https://www.sipri.org/sites/default/files/2026-03/fs_2603_at_2025.pdf dan .../2025-03/fs_2503_at_2024.pdf · Wikipedia: List_of_countries_by_arms_exports, List_of_countries_by_military_expenditures, List_of_ongoing_armed_conflicts, List_of_countries_by_number_of_military_and_paramilitary_personnel, List_of_countries_by_level_of_military_equipment, Member_states_of_NATO, Collective_Security_Treaty_Organization, Major_non-NATO_ally, Shanghai_Cooperation_Organisation, BRICS, List_of_countries_by_length_of_coastline, List_of_territorial_disputes, dan ~25 halaman "Military of X" · FAS https://fas.org/initiative/status-world-nuclear-forces/ · Gagal diakses: wiki CoN (402/403), web.archive.org, Wikipedia arms imports dan naval strength dan military aircraft (404).
