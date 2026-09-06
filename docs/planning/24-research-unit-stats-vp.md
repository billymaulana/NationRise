# Riset: Stat Unit, Model Damage, Kalibrasi VP dan Ekonomi

> Riset sesi 5 (2026-09-05). Penanda: **[VERIFIED]** dikutip dari sumber, **[DERIVED]** dihitung mundur dari data verified, **[ASUMSI]** usulan desain tanpa sumber. Verifikasi lewat conflictofnations.wiki.gg dan hoi4.paradoxwikis.com. WebSearch tidak tersedia.

> **KOREKSI (dokumen 38).** Angka total poin kemenangan dunia sebesar **7.400 tidak didukung data**. Scraping 149 halaman negara World War III memberi **sekitar 5.190 poin kemenangan awal**, dari 64 negara pemain dikali rata-rata 68,72 ditambah 85 negara AI dikali 9,31. Dengan itu, ambang menang 1.850 berarti **35,6 persen dari total awal, bukan 25 persen**. Selisihnya kemungkinan karena populasi kota tumbuh sepanjang permainan. **Rekomendasi: ambang kemenangan Nation Rise dinaikkan dari 25 ke sekitar 33 persen.** Yang justru terkonfirmasi tanpa sisa adalah model kita bahwa poin kemenangan sama dengan provinsi non-kota ditambah total populasi kota: Indonesia 53 provinsi, 7 kota, 80 poin, dan jumlah populasi ketujuh kotanya persis 34.

> **PERINGATAN KEUSANGAN.** Dokumen ini ditulis sebelum data panel dalam game tersedia. **Empat pernyataan di bawah kini terbantah** dan tidak boleh dipakai saat implementasi:
> 1. **Total poin kemenangan 7.400 salah**; angka sebenarnya sekitar 5.190 (dokumen 38).
> 2. **Baseline roster 31 unit dengan angka asumsi sudah usang**; 77 kelas unit dengan angka asli tersedia di dokumen 41.
> 3. **Usulan Mobile SAM dengan serangan sayap tetap sekitar 14 salah**; angka aslinya 8, dan yang bernilai 12 justru Theater Defense System terhadap misil (dokumen 41).
> 4. **Bagian doktrin empat varian dibatalkan** oleh D53 dan D79.
>
> Yang **tetap sahih dan terbukti**: konstanta ekonomi 3.000 dengan dua koreksinya, konstanta k sebesar 0,35 yang kini terverifikasi lewat uji empat skenario di dokumen 43, dan kesimpulan bahwa wiki bukan sumber statistik sehingga data hanya ada di klien game, yang justru terbukti benar dan sekarang sudah didapat.

## 0. Enam temuan yang bisa langsung dipakai
1. **Total VP dunia CoN World War III = 7.400** [DERIVED]. Ambang menjadi persentase bulat: 25% / 40% / 57,5% / 72,5% / 80%. Terkonfirmasi silang: 7400 dibagi 100 negara = 74 VP rata-rata, konsisten dengan USA 118, Indonesia 80, Jerman 71.
2. **baseProduction = 3.000 persis** [DERIVED], dengan dua koreksi terhadap formula yang kita punya: **Electronics resourceFactor = 0,25** (bukan 0,375) dan **popFactor(6) = 1,1025** (bukan 1,05). Delapan dari delapan data point Indonesia cocok tanpa sisa.
3. **k = 0,35** untuk konversi strength ke damage, menghasilkan duel referensi selesai tepat 12 tick. k hanya menskala waktu, bukan hasil, jadi aman di-tune untuk pacing.
4. **Unit udara tidak bisa diseimbangkan lewat rating.** DEF infanteri terhadap Fixed Wing = 0,3 [VERIFIED] membuat exchange ratio 10,86. Wajib sortie limit 3 tick, cooldown 4 jam, dan Mobile SAM dengan ATK Fixed Wing sekitar 14.
5. **Wiki CoN bukan sumber stat.** 26 dari 28 halaman unit tanpa angka; halaman Damage, Strength, Combat, Terrain, Research semuanya kosong dari konstanta. **Jangan rencanakan scraping wiki**; data numerik lengkap hanya ada di klien game.
6. Rasio efisiensi armor **1,75 di open ground menjadi 0,56 di urban** = faktor 3,1 kali. Itu ukuran kuantitatif "rock-paper-scissors yang terbaca".

## 1. Stat CoN yang ditemukan
**Main Battle Tank doktrin European [VERIFIED]:**
| Level | HP | Soft A/D | Hard A/D | Rotary DEF | Building | Population |
|---|---|---|---|---|---|---|
| 1 | 45 | 9,0/9,0 | 8,0/8,0 | 1,0 | 0,3 | 3,0 |
| 4 | 52 | 11/11 | 10,0/10,0 | 1,5 | 0,3 | 3,0 |
| 6 | 55 | 13/13 | 12/12 | 2,0 | 0,4 | 3,0 |
| 7 | 55 | 13/13 | 13/13 | 2,0 | 0,4 | 3,0 |
MBT **nol** terhadap Fixed Wing, Missile, Naval, Submarine: unit darat berat buta terhadap udara.

**Ballistic Missile PGM-17 Thor T1 [VERIFIED]:** Conventional Soft 25 / Hard 80 / Fixed Wing 75; Chemical Soft 125 / Hard 20 / FW 40; Nuclear Soft 250 / Hard 250. Splash 10 (Cruise Missile 5). Warhead adalah **matriks rock-paper-scissors tersendiri**: conventional anti-armor, chemical anti-infanteri dan populasi, nuclear anti-segalanya.

**Morale [VERIFIED]:** awal 70% semua provinsi; produksi = morale × 0,8 + 0,25 (70% menjadi 81%); waktu konstruksi di atas 90% morale = 100%, turun linear ke 75% kecepatan pada 25%, di bawah 25% = 133,33% waktu (pada 70% = 108,33%); target kota homeland 90%, aneksasi dan okupasi 60%, provinsi 100%; ambang pemberontakan 25% morale = 50% peluang; modifier kehilangan HQ −20, jarak ke HQ −5 per satuan, perang −2 per negara maksimal −25, tetangga musuh −5 per provinsi, bunker +5 sampai +50, outpost dan field hospital +10 sampai +15.

**Attack Submarine [VERIFIED]:** attack +25% di High Seas; attack dan defense −25% di Coastal Waters. Ini satu-satunya angka terrain modifier eksplisit di seluruh wiki, dipakai sebagai kalibrasi magnitudo ±25%.

Parsial lainnya: Frigate AA range 150, unlock Day 2 dan Day 24; Towed Artillery range 75; ASF riset 1.900 supplies + 1.900 rare + 4.000 money; Heavy Bomber 3 cruise missile per 12 jam; Destroyer 2 per 12 jam; MRL Ranged Combat Day 5, Airlift Day 27; Mobile SAM Day 3, 16, 20. **Doktrin CoN hanya 3** dan hubungannya kualitatif: Western HP tertinggi dan termahal, Eastern HP terendah dan termurah, European menengah.

## 2. Model konversi strength ke damage [ASUMSI, DIGANTIKAN dokumen 43]
**Perbandingan keluarga model.** HoI4 [VERIFIED]: jumlah serangan = round(attack/10), hit chance 10% selama defense bertahan lalu 40%, damage per hit d2 strength dengan pengali 0,06 dan d4 organisation dengan 0,053; presisi tinggi tetapi terlalu banyak state (organisation, hardness, piercing) yang akan mengubah rasa game. Lanchester: model CoN pada dasarnya **square yang di-damp**, dan **stacking penalty 1 − 0,56·ln(n/max) adalah rem eksplisit terhadap Lanchester square**; tanpa rem itu satu-satunya strategi optimal adalah doomstack. Ini insight desain terpenting dari data yang sudah dimiliki.

**Spesifikasi yang diusulkan** (per tick 1 jam):
```
rawStrength(S,T) = Σ rating(u, armorClass lawan) × healthPenalty(u)
                   healthPenalty = 0.25 + 0.75 × hp/maxHp
stackMod  = clamp(1 − 0.56·ln(n/10), 0.35, 1.0)
protectMod = entrench (kota 0.75) × bunker (lvl 1..5 = 0.67 … 0.27)
rngMod    = 1 + 0.15 × (2u − 1), u = mulberry32(hash(seed, battleId, tick, sideId))
damage    = rawStrength × stackMod × terrainMod × protectMod × k × rngMod
distribusi ke unit target proporsional DDW, overflow di-respread
k = 0.35
```
DEF dipakai sebagai rating balasan bertahan, yang membuat entrenched defender berbahaya dan sesuai perilaku CoN (Motorized DEF Soft 3,8 lebih besar dari ATK 3,0). RNG **wajib deterministik**, tanpa itu matriks duel tidak bisa di-snapshot.

**Kalibrasi k.** Target 12 tick untuk duel referensi (setengah hari game: cukup lama untuk mengirim bala bantuan atau menarik mundur, cukup pendek agar satu hari memuat dua pertempuran). Sweep: k 0,30 = 14 tick; **k 0,35 = 12 tick**; k 0,50 = 8 tick; k 0,70 = 6 tick. HP defender tersisa hampir invarian (63 sampai 65%) untuk seluruh rentang k, yang berarti **k hanya mengubah skala waktu, bukan siapa yang menang**. Semua keputusan balance ada di rating dan modifier, bukan di k.

**Tabel terrain modifier [ASUMSI, magnitudo ±25% dari anchor Attack Submarine]:**
| Terrain | Infanteri | Armor | Artileri | Rotary | Fixed Wing | Naval |
|---|---|---|---|---|---|---|
| Open Ground | 0,90 | **1,25** | 1,10 | 1,10 | 1,10 | |
| Desert | 0,85 | **1,25** | 1,15 | 1,15 | 1,15 | |
| Urban | **1,15** | 0,70 | 0,85 | 0,80 | 0,85 | |
| Suburban | **1,10** | 0,85 | 0,95 | 0,90 | 0,95 | |
| Forest | **1,10** | 0,80 | 0,85 | 0,85 | 0,80 | |
| Jungle | **1,20** | 0,60 | 0,75 | 0,75 | 0,70 | |
| Mountains | **1,15** | 0,65 | 0,90 | 0,85 | 0,85 | |
| Tundra | 0,85 | 1,05 | 1,00 | 1,00 | 1,00 | |
| High Seas | | | | 0,90 | 1,00 | **1,15** |
| Coastal Waters | | | | 1,10 | 1,10 | 0,85 |

**Tiga duel contoh (k = 0,35, RNG dimatikan):**
- **Duel 1** 10 Motorized menyerang 10 Motorized entrenched di kota: tick 1 damage penyerang 7,09 HP, bertahan 15,29 HP. **Penyerang musnah total di tick 12; bertahan kehilangan 35% HP, nol unit.** Serangan frontal 1 banding 1 ke infanteri entrenched adalah bunuh diri. Kebutuhan untuk menang: 12 unit kalah (15 tick), 16 kalah, **18 menang tipis** (32 tick, sisa 1,6 HP), 20 menang dengan sisa 14%, 24 menang dengan sisa 24%. **Rasio pemenang sekitar 1,8 banding 1**, dan penambahan 18 ke 24 mempersingkat waktu tetapi stacking penalty membuat marginal return menurun tajam. Kurva insentif yang benar: massa dibutuhkan, doomstack dihukum.
- **Duel 2** 5 MBT + 5 Mechanized menyerang 10 Motorized di open ground: **menang telak dalam 6 tick, penyerang kehilangan hanya 9,2% HP**. HP pool 350 melawan 150. Kontra-uji: di kota entrenched 16 tick dengan rugi 28,5%, di jungle 14 tick dengan rugi 26%. Efisiensi ternormalisasi **1,75 open ground menjadi 0,56 urban = faktor 3,1 kali**.
- **Duel 3** 3 Strike Fighter melawan 10 Motorized tanpa AA: exchange ratio **10,86**, efisiensi ternormalisasi 11,3. **Rusak.** Karena DEF infanteri terhadap udara 0,3, tidak ada nilai ATK udara yang menghasilkan pertukaran adil. **Balance udara harus datang dari luar rumus damage**: (1) sortie limit maksimal 3 tick lalu wajib kembali ke pangkalan, menurunkan exchange ke 7,93; (2) refuel dan rearm cooldown 4 jam; (3) AA envelope ranged yang menembak saat pesawat masuk radius. Kalibrasi: agar efisiensi turun ke 1,3 atau kurang, penyerang harus kehilangan minimal 34% HP per sortie; dengan 2 Mobile SAM ber-ATK Fixed Wing 14, damage envelope 9,8 HP per tick kali 3 tick = 29,4 HP = 32,7%. **Mobile AA saja (ATK 8) belum cukup, Mobile SAM wajib.**

## 3. Baseline roster Modern 31 unit [ASUMSI, DIGANTIKAN dokumen 41 yang memuat 77 kelas dengan angka asli]
Kelas biaya (CP index): C1 = 100, C2 = 180, C3 = 320, C4 = 560, C5 = 1.000 (rasio 1,75 kali). Waktu mobilisasi 4 / 7 / 12 / 20 / 34 jam. 1 CP setara 10 poin resource.

**Infanteri (armor Soft):** Motorized HP **15**, Soft **3,0/3,8**, Hard **2,0/2,5**, FW DEF **0,3**, Rotary **0,6**, DDW 1,0, C1. National Guard HP 20, Soft 2,0/5,0, C1. Special Forces HP **15**, Soft **7,0/4,7**, sight 45, C2. Naval Infantry HP **19**, Soft 4,0/4,5, C2.
**Armor (armor Hard):** Mechanized HP 25, Soft **3,0/3,8**, Hard **5,0/6,3**, C2. Combat Recon HP 22, sight **60**, speed 80, C1. AFV HP 30, Hard 5,0/4,5, C2. Tank Destroyer HP 32, Hard **12,0**/7,0, C3 (counter-armor murni yang tidak bisa memegang lini). MBT HP **45**, Soft **9,0/9,0**, Hard **8,0/8,0**, Rotary DEF **1,0**, DDW 1,6, C3.
**Support:** Towed Artillery HP 18, Soft 10,0/1,5, range **75**, C2. Mobile Artillery HP 26, Soft 12,0, range 90, C3. MRL HP 24, Soft **18,0**, range **110**, C3 (hukuman stack diam: damage penuh sementara stack 20 unit terkena stackMod 0,612). Mobile AA HP 26, FW 8,0/6,0, Rotary 10,0/7,0, C2. **Mobile SAM** HP 24, FW **14,0**/10,0, Missile 8,0, range **120**, C3. Theater Defense HP 28, Missile **20,0**, range **250**, C4.
**Rotary:** Helicopter Gunship HP 28, Soft 12,0, speed 200, C2. Attack Helicopter HP 32, Hard **14,0**, C3. ASW Helicopter HP 26, Submarine **16,0**, sonar 60, C3.
**Fixed Wing:** UAV HP 14, sight **90**, DDW 0,6, C1. Strike Fighter HP 30, Soft **12,0**, C3. Air Superiority Fighter HP 34, FW **16,0**/12,0, C4. Naval Patrol HP 26, Naval 12,0, Submarine **14,0**, sight **120**, C3. AWACS HP 30, sight **200**, tanpa serangan, memberi aura +10% ATK udara friendly radius 200 dan reveal stealth, C4. Heavy Bomber HP 40, Soft **20,0**, Building **25,0**, C5.
**Naval:** Corvette HP 35, Naval 8,0/6,0, C2. Frigate HP 50, FW **12,0/10,0**, AA range **150**, C3. Destroyer HP 70, Naval **16,0**, range 120, C4. Cruiser HP 90, Naval **22,0**, C5. Aircraft Carrier HP **120**, kapasitas 6 pesawat, DDW **2,0** (magnet damage, wajib dikawal), C5. Attack Submarine HP 45, Naval **24,0**/6,0, sonar dan range 100, C4 (glass cannon ekstrem; +25% High Seas, −25% Coastal Waters [VERIFIED]). BM Sub HP 50, C5.
**Missile [VERIFIED]:** Cruise Soft 40, Hard 40, Building 60, splash 5, range 300, C3. Ballistic Conventional 25/80, Chemical 125/20, Nuclear 250/250, splash 10, range 1.500, C4 sampai C5.

**Pengali tier 1 ke 3.** CoN memakai laju berbeda per kelas: Motorized naik 2,17 kali pada Soft ATK sementara MBT hanya 1,44 kali [VERIFIED]. Itu desain, bukan inkonsistensi: unit murah tetap relevan di late game, unit mahal tidak menjadi tak tersentuh.
| Kelas | ATK/DEF T2 | ATK/DEF T3 | HP T2 | HP T3 |
|---|---|---|---|---|
| Infanteri dan ringan | 1,45 | **2,10** | 1,20 | 1,50 |
| Armor dan berat | 1,20 | **1,45** | 1,08 | 1,22 |
| Artileri dan support | 1,35 | 1,75 | 1,15 | 1,30 |
| Rotary dan Fixed Wing | 1,35 | 1,80 | 1,15 | 1,35 |
| Naval | 1,25 | 1,55 | 1,12 | 1,30 |
| Missile | 1,50 | 2,20 | | |
Validasi: Motorized T3 prediksi 6,3 Soft (CoN 6,5), HP 22,5 (CoN 22 sampai 25); Special Forces T3 14,7 (CoN 13); MBT level 6 sampai 7 = 13,05 (CoN 13). Cocok.

**Lingkaran rock-paper-scissors:** Armor mengalahkan Infanteri di open ground; Infanteri mengalahkan Armor di urban, jungle, mountain; Tank Destroyer mengalahkan Armor; Mobile SAM dan TDS mengalahkan Fixed Wing dan Missile; Attack Submarine mengalahkan Naval permukaan; ASW Heli dan Naval Patrol mengalahkan Submarine; MRL dan Mobile Artillery menghukum stack besar dan diam; ASF mengalahkan Heli dan Bomber; Heli mengalahkan Armor terisolasi (MBT Rotary DEF hanya 1,0 [VERIFIED]).

## 4. Doktrin 4 varian [ASUMSI, DIBATALKAN oleh D53 dan D79]
| Doktrin | HP | Biaya produksi | Biaya riset | Waktu riset | Waktu mobilisasi | Manpower |
|---|---|---|---|---|---|---|
| Western | 1,10 | 1,15 | 1,15 | 1,10 | 1,00 | 0,90 |
| European | 1,00 | 1,00 | 1,00 | 1,00 | 1,00 | 1,00 |
| Eastern | 0,90 | 0,85 | 0,85 | 0,90 | 0,90 | 1,15 |
| Non-aligned | 0,95 | 0,80 | 0,95 | **1,20** | 0,85 | 1,25 |
Identitas: Western kualitas mahal (armada kecil elit); Eastern kuantitas murah cepat; European fleksibel; Non-aligned swarm murah dan cepat dibangun tetapi terkunci di teknologi rendah.
**Spesialisasi:** Western Fixed Wing dan Naval ATK 1,10 dan HP 1,15, malus artileri 0,92. Eastern artileri dan missile ATK 1,12 dan biaya 0,80, malus naval HP 0,85. European Mechanized dan Armor ATK 1,08 dan Mobile SAM 1,10, malus Heavy Bomber tidak tersedia sebelum Day 20. Non-aligned infanteri biaya 0,65 dan HP 1,05 dan Special Forces ATK 1,15, malus Fixed Wing dan Naval biaya 1,20 dan maksimal tier 2.
**Pergeseran hari riset** (baseline European): Infanteri T1/T2/T3 = 0/6/16; Armor 2/9/20; Artileri 3/10/21; Anti-Air 3/11/22; Rotary 4/12/24; Fixed Wing 5/14/26; Naval 4/13/25; Submarine 7/16/28; Missile 9/18/30. Western: Fixed Wing −3, Rotary −2, Naval −2, artileri +3. Eastern: artileri −3, missile −3, armor −2, Fixed Wing +3. Non-aligned: infanteri −3, Fixed Wing +6, Naval +6.
**Waktu riset per item** [ASUMSI]: `jam = base_family × tier_mult × doctrine_mult`, base 6 jam (infanteri) sampai 20 jam (naval dan missile), tier 1,0 / 2,2 / 4,5. Maksimal 2 riset paralel [VERIFIED]. **Biaya riset** dari anchor ASF (1.900 supplies + 1.900 rare + 4.000 money): `cost_money = 4000 × (CP/560) × tier_mult`, supplies dan rare masing-masing 0,475 kali cost_money.

## 5. Kalibrasi VP dan panjang kampanye (jawaban P38 dan P20)
**Rekonstruksi CoN [DERIVED]:** total VP dunia World War III = **7.400**, karena semua ambang menjadi persentase bulat:
| Anggota koalisi | Ambang | % dari 7.400 | % per anggota |
|---|---|---|---|
| 1 solo | 1.850 | **25,00%** | 25,00% |
| 2 | 2.960 | **40,00%** | 20,00% |
| 3 | 4.255 | **57,50%** | 19,17% |
| 4 | 5.365 | **72,50%** | 18,13% |
| 5 | 5.920 | **80,00%** | 16,00% |
Kurva per anggota turun (25 ke 16%) adalah desain sadar: koalisi besar butuh lebih banyak total tetapi lebih sedikit per kepala, insentif berkoalisi tanpa menjadikannya jalan pintas.

**Peta Nation Rise (2.000 provinsi, 600 kota).** Distribusi populasi kota yang diusulkan (skew ke bawah seperti distribusi kota nyata): pop 1 sampai 10 berjumlah 80 / 110 / 115 / 100 / 80 / 50 / 35 / 20 / 7 / 3 kota. VP dari kota = **2.243** (rata-rata pop 3,74); provinsi non-kota 1.400 kali 1 VP = **1.400**; **total VP dunia = 3.643**, rata-rata 1,82 VP per provinsi.

**Ambang yang diusulkan** (menerapkan persentase CoN): solo **911**, koalisi 2 = 1.457, 3 = 2.095, 4 = 2.641, 5 = 2.914. Tambahan untuk game offline yang tidak ada di CoN: **ambang naik bertahap seiring hari**, `threshold(day) = base × (1 + 0.004 × max(0, day − 30))`, agar AI yang stagnan tidak menang karena bosan; pada hari 60 ambang solo menjadi 1.020 (+12%).

**Victory alternatif [ASUMSI]:** **Regional Hegemon** (target hari 22 sampai 30) kuasai minimal 60% VP satu benua (437 VP dengan 5 benua) **dan** minimal 8% VP dunia (291 VP), syarat ganda mencegah menang dari benua mikro. **Superpower** (hari 35 sampai 50) peringkat 1 pada Economic Index dan Military Index simultan selama 10 hari game berturut-turut, dengan lantai 15% VP dunia (546 VP); kehilangan status satu hari mereset counter. **Survivor** semua AI mayor tereliminasi, fallback bukan target desain.

**Panjang kampanye.** Posisi awal rata-rata 36 VP. Untuk mencapai 911 VP: 30 hari butuh 16,0 provinsi per hari (5,9 grup tentara); **40 hari butuh 12,0 provinsi per hari (4,4 grup)**; 45 hari 10,7 (4,0 grup); 60 hari 8,0 (3,0 grup). Satu grup tentara realistis mengambil 2,7 provinsi per hari (sekitar 1 provinsi per 9 jam: 4 jam gerak dan 5 jam tempur). **Target median 40 hari membutuhkan 4 sampai 5 grup tentara aktif**, angka yang masuk akal untuk pemain tunggal.

**Balancing lewat sim AI vs AI:** 100 seed kampanye penuh sampai victory atau day 90. Target distribusi hari kemenangan: **median 35 sampai 50, P10 minimal 25, P90 maksimal 65, tanpa pemenang di day 90 di bawah 5%**. Knob berurutan: persentase ambang solo (paling linear), k combat (menggeser distribusi tanpa mengubah pemenang), waktu mobilisasi, baseProduction. Distribusi terlalu lebar (P90 dikurangi P10 di atas 45 hari) menandakan snowballing berlebihan, perbaiki dengan memperkuat penalti morale provinsi teraneksasi dan menaikkan biaya supply per jarak dari HQ.

## 6. Konstanta ekonomi (rekonstruksi penuh)
**Formula final [DERIVED]:**
```
output_harian = floor( base × (morale × 0.8 + 0.25) × resourceFactor × popFactor )
base = 3000
moraleFactor(0.70) = 0.81
popFactor(p) = p × 0.2                 untuk p ≤ 5
popFactor(p) = 1.1025^(p−5)            untuk p ≥ 5
```
**Dua koreksi:** Electronics resourceFactor = **0,25** (dengan 0,375 hasilnya 911, bukan 607; dengan 0,25 hasilnya tepat 607). popFactor(6) = **1,1025** = 1,05 kuadrat (formula `pop × 0.05 + 0.75` memberi 1,05 dan meleset di kedua data point pop 6).

**Verifikasi 8 dari 8 cocok tanpa sisa:** Jakarta Components pop 6 = 1.205; Banjarmasin Supplies pop 4 = 1.020; Medan Electronics pop 5 = 607; Palembang Fuel pop 5 = 1.275; Surabaya Rare pop 5 = 729; Money pop 5 = 911, pop 4 = 729, pop 6 = 1.004. Contoh hitung Jakarta: 3000 × 0,81 = 2430; × 0,45 = 1093,5; × 1,1025 = 1205,58; floor = **1205**.

**resourceFactor final:** Electronics 0,25 → 607; Rare 0,300 → 729; Money 0,375 → 911; Components 0,450 → 1.093; Fuel 0,525 → 1.275; Supplies 0,525 → 1.275. Beda sekitar 0,075 antar tingkat; resourceFactor **berbanding terbalik dengan kelangkaan strategis**. Pertahankan skala ini.

**popFactor di atas 6 [UNVERIFIED]:** hanya pop 6 yang punya data, sehingga geometrik `1.1025^(p−5)` dan linear `1 + 0.1025×(p−5)` tidak bisa dibedakan (identik di pop 5 dan 6, berbeda 7,7% di pop 10). **Rekomendasi: pakai yang linear** karena diminishing return lebih kuat dan mencegah megakota menjadi pemenang otomatis.

**Manpower [UNVERIFIED, 1 data point]:** pop 5 = +132 memberi `base_mp` antara 163,0 dan 164,2. Dua hipotesis tidak bisa dibedakan: memakai skeleton sama dengan base 163, atau tidak memakai moraleFactor dengan base 132. **Usulan bersih:** `manpower = floor(160 × moraleFactor × popFactor × doctrineManpowerMult)`, memberi 129 pada pop 5 morale 70% European (deviasi 2,3% dari CoN). Manpower **harus** dipengaruhi morale karena itu satu-satunya rem terhadap over-expansion: kota aneksasi bermorale 60% hanya memberi 90% manpower dari kota homeland setara.

**baseProduction untuk Nation Rise: pertahankan 3.000 persis**, karena sudah diseimbangkan terhadap tabel biaya unit CoN doktrin European yang kita miliki lengkap. Kalibrasi biaya: C1 (100 CP) = 1.000 poin resource setara 1,1 hari output kota pop 5; C3 = 3,5 hari; C5 = 11 hari. Negara dengan 8 kota rata-rata pop 4 menghasilkan sekitar 5.800 money per hari, cukup untuk 1 unit C3 per hari, ritme yang tepat untuk kampanye 40 hari.

## 7. Metode balancing
**Simulator wajib murni:** `simulate(config, seed) → result`, tanpa I/O, tanpa `Date.now()`, tanpa `Math.random()`; semua randomness dari `mulberry32(seed)`. Struktur: `sim/engine/combat.ts`, `battle.ts`, `rng.ts`, `sim/data/units.ts` (roster sebagai data murni bukan class agar bisa di-JSON-snapshot), `terrain.ts`, `sim/scenarios/duel.ts`, `campaign.ts`.

**Matriks duel 31 kali 31:** untuk tiap pasangan, tiap terrain (10), tiap tier (3), **samakan anggaran CP bukan jumlah unit** (`n = round(1000/CP)`, minimal 1 maksimal 20) karena membandingkan 10 MBT dengan 10 Motorized tidak bermakna (MBT 3,2 kali lebih mahal); 5 seed per sel karena RNG ±15% membuat 1 seed terlalu bising. Total 144.150 pertempuran, sekitar 4,3 juta iterasi tick, beberapa detik di Node, layak untuk CI.

**Lima metrik:** (1) **Cost-efficiency** `CE = CP hancur musuh / CP hilang sendiri`, dinormalisasi, diambil **median** bukan mean karena mean dirusak outlier; target `max CE ≤ 1,3 × median CE`. (2) **Position-win rate** target 40% sampai 60%; di atas 75% dominan, di bawah 25% unit mati. (3) **Time-to-victory** target 8 sampai 20 tick; di bawah 6 terlalu swingy, di atas 30 membosankan. (4) **Terrain spread** `TS = CE terbaik / CE terburuk`, **target minimal 2,0 untuk setiap unit darat**; unit dengan TS di bawah 1,5 tidak punya identitas. MBT saat ini TS = 3,1. (5) **Counter coverage**: setiap unit harus punya minimal satu counter dengan CE ternormalisasi minimal 1,6.

Catatan penting: **matriks duel murni tidak boleh menjadi satu-satunya gerbang.** Fixed Wing punya CE 11,3 tanpa AA; test harus mem-flag setiap unit yang CE-nya berubah lebih dari 3 kali antara duel telanjang dan duel dengan counter yang tepat, dan unit seperti itu wajib punya constraint non-combat yang terdokumentasi.

**Skenario kampanye 100 seed:** 8 AI, peta 2.000 provinsi, sampai victory atau day 90. Test komposisi: **tidak ada satu tipe unit boleh melebihi 25% total CP tentara pemenang**. Test doktrin: win rate tiap doktrin 25% plus minus 8%.

**Struktur test Vitest:** `duel-matrix.spec.ts` (snapshot matriks CE yang dikomit, assert kelima metrik); **`anchors.spec.ts`** sebagai pertahanan utama yang mengunci rasa game ke angka konkret (Duel 1 selesai tepat 12 tick dengan defender sisa 97,2 HP plus minus 0,5; Duel 2 selesai 6 tick dengan attacker sisa 318,0 HP; Duel 3 dengan 2 Mobile SAM attacker rugi minimal 30% per sortie; 18 Motorized adalah minimum untuk mengalahkan 10 entrenched di kota); `campaign.spec.ts` (lambat, nightly); `production.spec.ts` (8 data point Indonesia direproduksi persis).

**Loop kerja:** ubah stat, jalankan matriks duel (~10 detik), baca diff snapshot, kalau lolos jalankan kampanye (nightly, ~5 menit), setiap perubahan snapshot harus punya alasan tertulis di commit. **Yang tidak boleh: menyetel k untuk memperbaiki balance**; k hanya menggeser skala waktu, jadi kalau unit terlalu kuat perbaiki rating atau terrain modifier-nya.

## Sumber
conflictofnations.wiki.gg: Main_Battle_Tank, Ballistic_Missile, Morale, Attack_Submarine, Frigate, Towed_Artillery, Air_Superiority_Fighter, Heavy_Bomber, Cruise_Missile, Doctrine, Victory_Points, Terrain, Research, Damage, Strength, Combat · hoi4.paradoxwikis.com/Land_battle
