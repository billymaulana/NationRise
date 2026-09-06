# Riset B: Mekanik Conflict of Nations dari Wiki

> Sumber: plan riset Nation Rise, sesi 2026-09-03 sampai 2026-09-04, bagian 5. Dokumen ini bagian dari `docs/planning/`; indeks dan aturan kerja ada di `README.md`. Nomor "bagian N" yang dirujuk di dalam teks mengacu ke penomoran plan asli; petanya ada di README.

## 5. Hasil Riset B: Mekanik CoN dari Wiki

Sumber: wiki resmi `wiki.conflictnations.com`, `conflictofnations.wiki.gg`, Help Center Bytro (`bytro.helpshift.com`), Steam guide komunitas. Catatan: "Air Defense" dan "Missile Silo" tidak ada di CoN (itu Call of War / Supremacy 1914); padanannya unit AA/SAM/TDS dan bangunan Secret Weapons Lab + Bunkers.

### 5.1 Struktur peta
- Setiap provinsi punya **center-point**; menaklukkan = menempatkan unit ber-fitur Conquer Territory di center-point (hanya infantry, kecuali Special Forces dan Mercenaries). Unit diam di center-point otomatis **entrenched**.
- Provinsi non-kota: population 1.0, **1 VP**, cap produksi 50%, sebagian punya resource (posisi diacak saat game dibuat) yang dipanen lewat Local Industry.
- Kota: population 1.0 sampai 10.0 (tumbuh sesuai morale); **VP kota = population** (terverifikasi: USA 118 VP = 73 provinsi + populasi 9 kota 45; Jerman 71 = 37 + 34); strategic site menambah VP flat.
- Tiga status kota: **Homeland** (cap 100%, target morale 90%), **Occupied** (cap 25%, tidak bisa mobilisasi, bisa membangun), **Annexed** (setelah bangun Annex City: cap 50%, bisa mobilisasi; kembali occupied jika direbut). Coastal city punya harbor; provinsi pantai memakai Pontoon.
- Hanya kota yang memobilisasi unit (kecuali Mercenaries via Mercenary Outpost).

**Terrain** (modifier Attack %, Defense %, speed value, HP, sight per unit):
| Terrain | Sifat | Contoh modifier |
|---|---|---|
| Open Ground | mobile, speed maks | Mech Inf +50% atk; Motorized −25% atk; speed 1.00 sampai 1.30 |
| Mountains | speed minimum | speed 0.33 sampai 0.43; MBT −50% atk; Mech −50% atk −25% def |
| Forest | cover | speed 0.66 sampai 0.86; Motorized −25% atk; Mech −25% def |
| Urban | favor defense, anti armor | speed 0.50 sampai 0.65; Motorized +25% def; MBT −25%; Mech −50% atk |
| Suburban | seperti Urban | Mech +25% def |
| Jungle | favor infantry | Special Forces cepat |
| Tundra | disfavor infantry | speed 1.00 sampai 1.30 |
| Desert | mobile | MBT speed 1.30 |
| Coastal Waters | | kapal heal 2 HP/hari; Attack Sub −25% atk; transport 1.3 |
| High Seas | | Attack Sub +25% atk; Corvette HP separuh; transport 2.51 |
| In Flight / On Ground | pesawat | HP/ATK/DEF lebih tinggi saat terbang |

**Mode peta (untuk kalibrasi ambang VP dan skala):**
| Peta | Player | Koalisi maks | VP menang (1 sampai 5 anggota) |
|---|---|---|---|
| World War III | 64 (AI 85) | 5 | 1850 / 2960 / 4255 / 5365 / 5920 |
| Flashpoint Europe | 30 | 3 | 1500 / 1845 / 2250 |
| Overkill | 100 | 3 | 3700 / 6350 / 8050 (12 strategic site +500 VP) |
| Rising Tides (2050) | 100 | 5 | 5475 / 6225 / 7275 / 8150 / 8600 |
| Battleground USA | 32 | 3 | 1700 / 2091 / 2550 |
| Sengoku | 60 | 3 | 2800 / 3444 / 4200 |
| Cold War | 32 | 3 | 1150 / 1414 / 1725 |
| Antarctica | 26 | 10 | 1250 flat |
| Domination mode | | | Control Points menghasilkan VP tiap 6 jam nyata |

Total provinsi per peta tidak ditemukan. Contoh WW3: USA 82 provinsi, 9 kota (Washington pop 6 Rare/HQ, LA 6 Components, NY 5 Electronics, Chicago 5 Components, Hawaii 5 Supplies, St. Louis 5 Supplies, New Orleans 4 Fuel, Portland 4 Fuel, Anchorage 5 Electronics); Jerman 44 provinsi 7 kota. Negara playable 4 sampai 9 kota, 34 sampai 118 VP awal; AI nations 0 sampai 1 kota.

### 5.2 Resources dan produksi
- Kegunaan: Supplies (infantry, support, heli, riset, konstruksi); Components (konstruksi, hampir semua unit); Fuel (konstruksi, upkeep, warhead); Electronics (bangunan kecuali bunker, unit berkendaraan); Rare Materials (**semua riset**, stealth/sub/missile, Arms Industry); Manpower (mobilisasi, upkeep, Annex 1250, Relocate HQ 2500; tidak bisa diperdagangkan); Money (semua, satu-satunya mata uang market).
- **Formula produksi provinsi** (wiki.gg): pop < 5: `floor(base × (morale×0.8 + 0.25) × resourceFactor × (pop×0.2))`; pop ≥ 5: `floor(base × (morale×0.8 + 0.25) × resourceFactor × (pop×0.05 + 0.75))`. resourceFactor: Money 0.375, Rare 0.3, Electronics 0.375, Components 0.45, Fuel 0.525, Supplies 0.525. Konstanta `base` tidak ditemukan (kalibrasi dari angka Indonesia bagian 4.2). Manpower dihitung terpisah dari population (formula tidak ditemukan).
- Efek morale ke produksi: 25% morale → 45%; 70% → 81%; 90% → 97%; 100% → 105%.
- Cap tipe provinsi diterapkan setelah bonus bangunan: Homeland 100%, Annexed 50%, Occupied 25%, Province 50%.
- Bonus bangunan: Arms Industry +10/20/30/40/50% + flat Money 100/135/165/185/200; Air Base +5 sampai +25%; Naval Base +5 sampai +20% (L2 sampai L5); Local Industry +100/150/200% (bukan money/manpower); Recruiting Office manpower +5 sampai +25% + flat 200.
- Upkeep unit harian (Motorized T1: 50 Supplies, 25 Manpower, 25 Fuel, 70 Money); upkeep bangunan 100 sampai 140 Money/hari.
- **Shortage** Supplies/Money (stok 0) → penalti morale sampai −50.
- Menaklukkan kota memberi **loot** sebagian resource kota (persentase tidak ditemukan).
- **Market**: offer AI dan player dikelompokkan per harga; jual dipindahkan ke My Trades sampai terjual; selalu terjual ke bidder tertinggi; harga fluktuatif; Trade Embargo sebagai relasi sudah dihapus. Harga baseline AI tidak ditemukan (acuan screenshot: Supplies 7.4 sampai 8.7, Rare 13.4 sampai 17.9).

### 5.3 Morale
- Awal semua provinsi/kota **70%**; kota baru ditaklukkan **25%**; homeland dibebaskan **55%**.
- Model **target vs current**: bergerak tiap day-change menuju target (Fandom: `(target − current)/8` per hari, belum terverifikasi resmi). Target base: Homeland 90%, Annexed 60 sampai 75%, Occupied 60%, Province 100%.
- Modifier negatif: shortage sampai −50; civilian casualties sampai −30 (pulih 1/3 per hari); tanpa HQ −20; tetangga morale ≤40%: −7 per kota / −4 per provinsi; jarak ke HQ −5 per satuan; provinsi musuh berbatasan (perang) −5 per provinsi; perang −2 per negara musuh (maks −25; negara 0 VP tidak dihitung); unit musuh dekat −1; agen musuh Corruption −10%.
- Modifier positif: tetangga morale 100%: +3 per kota / +1 per provinsi; Underground Bunkers +5/10/20/35/50; Combat Outpost / Field Hospital +10/13/15; HQ +25% ke sekitar. Kehilangan HQ → semua provinsi −20% dan target turun.
- Efek ke waktu konstruksi dan mobilisasi: >90% = 100%; 25 sampai 90%: `1/(0.75 + 0.25×(m−25)/65)`; <25% = 133%; 70% = 108% (cocok dengan "+45min pada 9h45m" di screenshot).
- **Insurgency**: hanya kota; risiko mulai ≤~33%, tajam <25%; pada 25% peluang 50%; roll sekali per hari pada jam acak yang sama untuk semua kota bertipe sama; kota kosong langsung jatuh; garnisun bertempur dengan garrison bonus.

### 5.4 Bangunan (lengkap)
Semua bangunan (kecuali harbor bawaan dan HQ) hancur saat direbut. HP 10 sampai 30. Tidak ada gating hari untuk bangunan.
| Bangunan | Lokasi | Lv | Biaya L1 (S/C/R/F/E/$) | Waktu L1 → L5 | Efek |
|---|---|---|---|---|---|
| Army Base | City | 5 | 250/250/–/500/250/2000 | 90 detik, 28h, 32h, 34h, 36h | Unlock darat: L1 Motorized, Airborne, CRV, Mobile AA; L2 Mech, Naval Inf, AFV, ACV, MBT, TD, Towed Art, Radar; L3 SF, Mobile Art, SAM; L4 MRL; L5 TDS |
| Arms Industry | City | 5 | 400/350/225/350/250/1250 | 9h, 24h, 30h, 36h, 48h | Produksi +10 sampai 50% + flat Money; syarat hampir semua unit non-infantry |
| Air Base | City | 5 | 750/1000/–/1000/500/2750 | 1d, 1d2h, 1d4h, 1d6h, 1d8h | Produksi +5 sampai 25%; unlock L1 Gunship, UAV, ASF; L2 Airmobile, Attack Heli, ASW, Naval ASF, Strike Fighter; L3 Naval SF, NPA, Heavy Bomber; L4 AWACS; L5 Stealth. Embark 30m, disembark 1h, refuel 15m |
| Naval Base | Coastal city | 5 | L1 harbor bawaan; L2 500/750/–/750/500/2000 | 9h, 30h, 32h, 34h | Embark −5 sampai −50%; produksi +5 sampai 20%; unlock L2 Naval Inf, Corvette, Frigate; L3 Destroyer, Attack Sub; L4 Cruiser, BM Sub; L5 Carrier |
| Recruiting Office | City | 5 | 250/250/–/250/250/1350 | 30m, 26h, 28h, 30h, 32h | Manpower +5 sampai 25% + 200; mobilisasi lebih cepat +10/25/45/70/100%; syarat National Guard |
| Military Hospital | City | 5 | 500/500/–/250/250/1350 | 25h, 26h, 28h, 30h, 32h | Heal +1 sampai +5 HP/hari; pop growth +20% |
| Underground Bunkers | City (rahasia) | 5 | 500/750/–/750/–/2000 | 9h, 12h, 15h, 17h, 20h | Morale +5/10/20/35/50; damage diterima −33/−43/−56/−68/−73% (dengan entrench −45 sampai −75%); lindungi pop 2×level dan bangunan |
| Secret Weapons Lab | City (rahasia) | 5 | 750/400/500/250/750/3500 | 25h, 26h, 28h, 31h, 36h | L1 stealth, BM Sub, Conventional Warhead; L2 Chemical; L3 Cruise Launcher; L4 Nuclear, BM Launcher; L5 ICBM |
| Annex City | Occupied city | 1 | 4250/3750/1500/2500/1750/10000 + 1250 MP | 18h | 25% → 50%, buka mobilisasi |
| Relocate HQ | City | 1 | 2500 MP + 15000 $ | 36h | HQ +25% morale sekitar |
| Combat Outpost | Province | 3 | 500/750/–/–/–/2000 | 1h, 4.5h, ? | Damage ke defender −33/−50/−65%; morale +10/13/15 |
| Airfield | Province | 1 | 700/900/–/800/–/2500 | 21h | Operasi pesawat di provinsi |
| Field Hospital | Province | 3 | 750/750/–/–/–/1250 | 9h, 18h, 27h | Heal +1/2/3; morale +10/13/15 |
| Local Industry | Province ber-resource | 3 | 750/750/–/–/–/1500 | 9h, 18h, 27h | Resource +100/150/200% |
| Military Logistics | Province | 1 | 250/250/–/250/–/500 | 3h | Speed darat +150% di provinsi |
| Pontoon / Mercenary Outpost | Province | 1 | tidak ditemukan | | Embark tanpa harbor / mobilisasi Mercenaries |

### 5.5 Unit
- **Stat**: Attack dan Defense rating per **armor type** target (Soft, Hard, Fixed Wing, Rotary Wing, Naval, Submarine, Missile; plus vs Buildings dan Population). HP, speed per terrain, sight, radar range, attack range (ranged), radar signature (tipe × HIGH/LOW), fitur (Stealth, Reveal Stealth, Scout, Sonar, Airlift, Air Assault, Coastal Embark, Conquer, Launch Cruise Missile, WMD protection ~50%).
- Tiga **Tier** (T1 1980 sampai 90an, T2 2000an, T3 2010an) sampai 7 level riset; upgrade otomatis ke unit yang ada.
- **Stack maks tanpa penalti: darat 10, udara 5, laut 5.** Kecepatan stack = unit terlambat.
- **Doktrin**: Western HP tertinggi, biaya tinggi; Eastern HP terendah, biaya rendah; European menengah. Hari ketersediaan riset bergeser per doktrin (mis. Mech Inf European Day 1 vs Eastern Day 2). Tabel angka doktrin hanya gambar, tidak ditemukan dalam teks.
- Roster per kategori dengan syarat bangunan sudah tercakup di 4.2 dan 5.4; tambahan: Insurgents/Enforcers (faksi rogue), Elite units (season, non-inti).
- **Contoh stat Motorized Infantry (Eastern/European)**: T1 HP 15/15/17, ATK/DEF vs Soft 3.0/3.8 → 4.0/5.0, vs Hard 2.0/2.5, DEF vs Fixed Wing 0.3 → 1.0, vs Rotary 0.6 → 1.3, ATK Building 0.1, Population 2.0, sight 25 sampai 35, mobilisasi 18 sampai 20h, biaya 650 S / 350 C / 850 MP / 1000 $, upkeep 50 S / 25 MP / 25 F / 70 $. T2 HP 20, Soft 5.0/6.3, Hard 3.0 sampai 3.5 / 3.8 sampai 4.4, biaya 750/550/1000/1250. T3 HP 22 sampai 25, Soft 6.0 sampai 6.5 / 7.5 sampai 8.1, Hard 4.5/5.6, range 20 (mortar), biaya 950/700/1250/1500.
- Mechanized Eastern: T1 Soft 3/3.8, Hard 5 sampai 6 / 6.3 sampai 7.5; T2 HP 27 sampai 30, Hard 7 sampai 8 / 8.8 sampai 10; T3 HP 35, Soft 6/7.5, Hard 9/11.3. Special Forces EU: T1 HP 15 (12 di terrain lain), Soft 7/4.7; T3 Soft 13/9. Naval Infantry HP 19 sampai 28, Soft 6 sampai 11. Airmobile speed darat 0.10 sampai 0.20. MBT EU Soft 9/9 → 13/13, Hard 8/8 → 13/13, HP 45 → 55.
- **Damage Distribution Weight** (porsi damage masuk = weight ÷ total stack): darat Motorized 3, Mech 7, Airborne 5, Marines 5, SF 1, National Guard 4, Mercenaries 10, CRV 2, AFV 7, ACV 6, MBT 9, TD 8, Towed Art 2, Mobile Art 6, MRL 6, Mobile AA 4, SAM 3, TDS 1, Radar 1; udara ASF 10, Naval ASF 9, Stealth ASF 5, SF 5, UAV 2, Gunship 8, Attack Heli 7, ASW 5, NPA 3, AWACS 1, Heavy Bomber 4, Stealth Bomber 1; laut Corvette 5, Frigate 4, Destroyer 8, Cruiser 5, Carrier 2, Attack Sub 4, BM Sub 1, Transport 3.

### 5.6 Combat model
- **Tick 1 jam**; tick pertama segera saat kontak.
- **Meeting engagement** (defender di luar center-point): A menyerang dengan offensive stats, B bertahan dengan defensive, lalu B counter-attack. **Attack/Defense engagement** (B entrenched): hanya A menyerang, B tidak counter.
- **Strength** = Base Rating × Terrain × Army boost × Doctrine boost × Stacking penalty × Health penalty; `HealthPenalty = 0.25 + 0.75 × HP/maxHP`. Strength stack = jumlah unit.
- **Stacking penalty**: `1 − 0.56·ln(StackSize / MaxNoPenalty)` untuk stack > maks. `Efficiency = (CombatEffectiveness + MovementSpeed)/2`.
- **Damage** ditentukan strength, entrenchment, bunker, DDW, RNG; formula strength → HP **tidak ditemukan** (rating bukan flat damage). Perlu asumsi desain sendiri.
- Entrenchment di kota −25% damage diterima; Outpost dan Bunker seperti 5.4; Special Forces dan bomber tier tinggi mengabaikan bunker.
- **Ranged**: artillery 75, MRL, sub 100, frigate AA 150, mortar 20; menyerang dari jarak tanpa melee.
- **Anti-air**: Point Defense (AA di stack target) menembak setiap missile/aircraft; AA Envelope memakai cooldown.
- **Missile**: Cruise splash 5 (target unit/point, tracking, bisa ditembak); Ballistic dan ICBM hanya center-point (splash 10); warhead dikonsumsi; TDS counter BM; nuklir/kimia melukai unit sendiri, kontaminasi (blok mobilisasi dan pop, harus Decontaminate), morale nasional turun.
- **Air**: patrol auto-engage dalam radius; refuel; tanpa base dalam jangkauan → crash. **Naval**: heal 2 HP/hari coastal.
- **Healing**: kota 1 HP/hari + Hospital; provinsi 0 + Field Hospital; update per jam.
- **Retreat** (darat/laut ke wilayah friendly, bleed HP, cepat); **Rush** +50% speed, −5 HP/jam.
- Tidak ada unit experience/veteran di CoN.

### 5.7 Riset
Pohon per doktrin, hierarkis, **gating hari game**; **2 slot paralel**; biaya Supplies + Rare + Money (ASF 1900 S / 1900 R / 4000 $); waktu per item tidak ditemukan kecuali Motorized T1 1m30s; refund proporsional saat batal. Contoh jadwal hari (EU): Motorized L1 D1; Mech D1/2, 7/8, 11/13, 15/17, 20, 22; Naval Inf D2, 13, 18, 23; Airmobile D1, 5, 11, 14, 17, 21, 25; SF D4 sampai 5, 8, 15, 20, 27; MBT WMD D17; ACV D3, 14, 26; MRL ranged D5; SAM D3, 16, 20; TDS D5, 28; Strike Fighter D2, CM D11; Destroyer D2, CM D13.

### 5.8 Diplomasi
Relasi: **War**, **Peace** (netral), **Right of Way** (lewat, airlift, refuel; bahaya: infantry musuh di dalam bisa merebut saat deklarasi), **Shared Intelligence** (map + intel), **Ceasefire** (transisi, unit disengage, masih dihitung perang untuk morale); Shared Map otomatis koalisi. Dihapus: Trade Embargo, Military Pact. Deklarasi lewat panel atau otomatis saat unit masuk wilayah tanpa RoW (stealth/UAV tidak memicu). Cooldown deklarasi tidak ditemukan. Efek perang −2 morale per musuh (maks −25). Koalisi: maks 3 atau 5 (Antarctica 10); RoW + shared map otomatis; tidak bisa saling serang; VP target dinaikkan; keluar butuh timer 24 sampai 48 jam; leader keluar → bubar 48 jam; homeland yang direbut anggota koalisi otomatis dikembalikan. Trade bilateral lewat Messages & Trades. AI bisa menerima/menolak Peace dan mengusulkan Ceasefire (forum).

### 5.9 Intel
Agen rekrut $10.000, gaji idle $250/hari; misi harian: Counter-Ops $250, Intelligence $2.000 (lihat pasukan, relasi, stok, pesan), Corruption $4.000 (hancurkan produksi / morale −10%), Sabotage $4.000 (rusak bangunan, tunda konstruksi/mobilisasi); maks 3 agen per provinsi musuh; sukses dasar ~50%. Sight range vs radar independen; musuh di luar wilayah kita = Unidentified sampai di-Scout atau combat; Stealth hanya diungkap Reveal Stealth/Sonar/combat; radar signature tipe × ukuran; helikopter NOE tidak terdeteksi SAM/TDS. Satelit tidak ada.

### 5.10 Waktu (durasi nyata CoN)
1 hari game = 24 jam nyata (peta 4x: 6 jam nyata, angka in-game tidak berubah); day change tengah malam server (morale, VP); combat dan healing tick 1 jam; upkeep harian; misi agen harian; mobilisasi 13 jam (UAV) sampai 1d4h (infantry T3); bangunan 90 detik sampai 48 jam; Annex 18 jam; HQ 36 jam; refuel 15 menit; embark pesawat 30 menit; missile reload 2 sampai 3 per 12 jam.

### 5.11 Victory dan eliminasi
Menang = pemain/koalisi pertama mencapai ambang VP **saat day change**; game berakhir tengah malam hari itu. Eliminasi: 0 VP → "defeated" tetapi unit sisa masih bisa merebut wilayah dan kembali. Ranking di Newspaper (Index of Nations) dan Coalition List.

### 5.12 Mobilisasi dan manpower
Manpower dari population (formula tidak ditemukan), cap tipe provinsi, Recruiting Office; sering langka awal game. Konsumsi: mobilisasi 850 sampai 1500 per infantry, upkeep 20 sampai 75/unit/hari, Annex 1250, HQ 2500. Mobilisasi hanya di Homeland/Annexed dengan bangunan prasyarat; antrean 4 per kota (Security Council; non-member implisit 1); rally point.

### 5.13 Insurgents dan AI nations
Insurgency seperti 5.3; unit lemah doktrin Eastern, tidak ekspansi ke luar kota. AI nations: kebanyakan 0 sampai 1 kota; AI mengambil slot pemain abandoned; AI memasang offer market; komunitas: AI mulai deklarasi perang ke pemain sekitar **day 5**, beberapa peta peace period ~7 hari; parameter agresivitas resmi tidak ditemukan.

### 5.14 Newspaper, event log, perintah
Newspaper per hari (relasi, konflik, korban, riset ilegal, artikel, Index of Nations). Event log: unit gugur, combat, riset selesai, crash, Conquered, Looted, dugaan spy. Perintah: Move, Attack, multi-waypoint, Split, Merge, Rush, Retreat, Patrol, Air Assault, Airlift/Ferry, Embark/Disembark, Decontaminate, Launch missile, Fire Control (Hold/Return/Aggressive), Rally Point, multi-select kota. Day change: morale, VP, kemenangan, reset timer insurgency, gaji agen, penyusutan civilian casualties.

### 5.15 Yang tidak ditemukan (butuh asumsi desain sendiri)
Konstanta `baseProduction`; formula manpower; konversi strength → damage dan RNG; harga market AI; waktu riset per item; stat lengkap sebagian besar unit non-infantry; tabel angka doktrin; cooldown deklarasi perang; total provinsi per peta; jumlah spawn insurgent; parameter agresivitas AI; biaya Pontoon dan Mercenary Outpost.

---
