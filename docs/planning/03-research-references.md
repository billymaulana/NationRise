# Riset C: Referensi Sekunder dan Paket Adopsi

> Sumber: plan riset Nation Rise, sesi 2026-09-03 sampai 2026-09-04, bagian 6. Dokumen ini bagian dari `docs/planning/`; indeks dan aturan kerja ada di `README.md`. Nomor "bagian N" yang dirujuk di dalam teks mengacu ke penomoran plan asli; petanya ada di README.

## 6. Hasil Riset C: Referensi Sekunder dan Paket Adopsi

### 6.1 Realpolitiks 3 (dan RP1/RP2)
- Resepsi buruk (Steam 39% positif) karena UI padat, sebab-akibat tidak terbaca; pelajaran utama = apa yang dihindari.
- **3 slider ideologi** RP1/RP2 (Interventionism, Personal Control, Militarism) → tipe pemerintahan turunan; perang dan klaim menaikkan Militarism → **adopsi ringan**. Way of Life sebagai lapisan kedua → skip.
- Action points + 700 projects → **adopsi ringan**: satu mata uang politik untuk ~40 sampai 60 policy/project.
- 1000+ event → **adopsi ringan**: ~100 sampai 150 event dengan hasil eksplisit. Randomisasi parsial stat awal → adopsi penuh.
- Espionage untuk fabricate claim sebelum perang → adopsi ringan (3 sampai 4 misi).
- Blok NATO/EU/BRICS dengan standing/favor → adopsi ringan. UN sebagai legitimacy check → digabung dengan infamy.
- Perang abstrak/Frontlines → skip (unit stack CoN lebih baik).
- Difficulty implisit per negara (label Easy/Normal/Hard di layar pemilihan) → adopsi sebagai lapisan pertama.

### 6.2 Ages of Conflict: World War Simulator
- 97% positif; "watch more than you play". Variabel per negara sangat sedikit (gold, income bonus, Combat Efficiency, cores, unity, loyalty/autonomy).
- **Alliance Unity** (naik dari menang perang/anggota baru, turun dari kekalahan/revolt) → aliansi bisa pecah → **adopsi penuh**.
- **Puppet 3 tipe** (Vassal / Puppet / Satellite) dengan skor **Loyalty** dan **Autonomy** → adopsi penuh (model subject state paling ringkas).
- **Lost Territories**: game mengingat pemilik sah; tanah rebutan = occupied sampai di-integrate; negara terhapus bisa bangkit → adopsi penuh.
- **Combat Efficiency / war readiness slider** yang mahal saat aktif → adopsi ringan.
- World AI Options (revolts, alliance formation, capital capture = annex, nukes) + income bonus per negara → jadi bagian difficulty kustom.
- Observer/timelapse + speed control agresif → adopsi penuh. Sistem tile/piksel dan editor peta → skip.

### 6.3 Victoria 3
- **Diplomatic play** 3 fase (Opening Moves, Maneuvering, Countdown) dengan demand, pihak ketiga berpihak, back down → **adopsi penuh, disederhanakan** menjadi Crisis panel ~10 hari game.
- **Infamy** (Reputable <25, Infamous 25 sampai 49, Notorious 50 sampai 99, Pariah ≥100 → containment), decay per tahun → **adopsi penuh**, digabung sanksi UN.
- **AI attitude label** (Protective, Genial, Cooperative, Cautious, Wary, Antagonistic, Belligerent, Domineering) + relations -100..100 → adopsi penuh.
- Market: harga = base × [1 + 0.75 × clamp((buy - sell) / min(buy, sell), ±1)], rentang 25% sampai 175%, shortage penalty → **adopsi ringan** sebagai pasar dunia satu layar (mengganti order book multiplayer CoN yang kosong tanpa pemain lain).
- Buildings berlevel input → output + economies of scale kecil → adopsi ringan.
- Interest groups → **3 sampai 4 faksi tetap** (Military, Business, Populist, Nationalist) dengan approval → adopsi ringan.
- Laws → 8 sampai 10 policy slots tanpa random stall → adopsi ringan.
- Pops, production methods, market access, elections → skip.

### 6.4 Difficulty dan AI (praktik terbaik)
- HoI4: 5 level, angka kecil (±15 sampai 30%), slider per-negara. Stellaris: scaling difficulty (bonus AI naik bertahap) + AI aggressiveness terpisah. Civ VI: bonus yield murni. Humankind: AI persona = archetype + strengths + biases.
- Kritik komunitas: flat bonus besar sejak awal memaksa satu gaya main; AI harus mematuhi aturan yang sama dengan pemain; AI tidak membedakan pemain manusia dari AI lain.
- **Rekomendasi difficulty:** 4 preset (Easy / Normal / Hard / Brutal) = kombinasi multiplier resource pemain dan AI (±15 sampai 30%), AI aggressiveness, infamy decay, kecepatan riset AI; **scaling** bonus AI sampai hari N; **override per negara** (income bonus -100..+100); **toggle dunia** (revolts, alliance formation, capital capture = annex, nukes); pada Easy tampilkan intel lebih banyak.
- **AI nation:** 1 archetype (Expansionist / Defender / Trader / Diplomat / Opportunist) + 1 agenda terlihat + 3 sampai 4 bobot (aggression, loyalty, risk tolerance, economic focus). Keputusan lewat **utility scoring** (6 sampai 8 keputusan strategis, tiap 3 sampai 5 considerations dinormalisasi, personality = bobot, momentum bonus ~25% agar tidak osilasi). Dua lapis: Strategic brain (per beberapa hari game) menetapkan war goal dan posture → Front manager menempatkan stack ke provinsi perbatasan.

### 6.5 Referensi tambahan
- **Supremacy 1914 / Call of War (Bytro):** morale provinsi dipengaruhi jarak ke ibukota, tetangga, perang, bangunan; <30% risiko revolt; produksi = f(morale). Call of War: 4 doktrin sebagai satu pilihan awal.
- **SuperPower 2:** 193 negara AI independen; peringatan Autarky bug (semua negara surplus → perdagangan mati) → simulasi ekonomi global perlu sanity floor.
- **HoI4 National Focus:** satu fokus aktif, pohon bercabang satu layar → national path ringan.
- **Terminal Conflict:** arms race vs disarmament per fokus; konfrontasi tanpa perang total.
- **Dummynation:** resource pada titik yang teraneksasi bertahap setelah penaklukan.
- **CoN mobile:** bukti loop CoN bisa dimampatkan ke sesi pendek dengan waktu dipercepat.

### 6.6 Paket adopsi yang direkomendasikan

**Adopsi penuh:** Infamy + UN containment; Crisis/diplomatic play 3 fase; AI attitude label + relations; Alliance Unity + 3 tipe puppet; Lost Territories & integration; randomisasi parsial stat awal; AI archetype + agenda + utility scoring; observer/timelapse dan speed control.

**Adopsi ringan:** 3 slider ideologi → tipe pemerintahan; satu mata uang politik + policy slots + national path; 3 sampai 4 faksi dengan approval; pasar dunia satu layar dengan rumus clamp; building input → output; war readiness slider; stability/morale satu angka per provinsi; espionage 3 sampai 4 misi; difficulty 4 preset + scaling + override + toggles.

**Skip:** Way of Life, 9 sampai 18 tipe pemerintahan, 700 projects, 1000 events, pops, production methods, market access, elections, law stall, sistem tile, perang QTE/Frontlines.

---
