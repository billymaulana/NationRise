# Riset Lanjutan: Opsi Model Resource

> Sumber: plan riset Nation Rise, sesi 2026-09-03 sampai 2026-09-04, bagian 17. Dokumen ini bagian dari `docs/planning/`; indeks dan aturan kerja ada di `README.md`. Nomor "bagian N" yang dirujuk di dalam teks mengacu ke penomoran plan asli; petanya ada di README.

## 17. Riset Lanjutan: Opsi Model Resource (hasil; empat opsi dirinci, rekomendasi belum diputuskan Billy)

Terverifikasi: CoN wiki.gg, manual S1914, HoI4/Vic3/EU4 wiki, Wikipedia (Offworld, RoN, SuperPower 2, Civ VI), Steam (AoH3, guide CoW), PDF RP2 Strategic Guide, devlog AoC. Tidak terverifikasi ([UV]): detail market CoN/CoW, angka stockpile Civ6, sektor SP2.

### 17.1 Survei model resource
| Game | Jumlah | Daftar | Pelajaran |
|---|---|---|---|
| **CoN** | 7 + Gold | Supplies, Components, Fuel, Electronics, Rare, Manpower, Money | 1 resource per kota; Rare "almost always in short supply" = bottleneck sengaja; tiap unit menyentuh 3 sampai 5 resource + 4 upkeep |
| **Supremacy 1914** | 7 + Money | Grain, Fish, Iron, Lumber, Coal, Oil, Gas | **3 kategori (Food / Materials / Energy) dengan upkeep substitutable**: 7 barang terasa seperti 3; provinsi ≥90% morale 3.150 t/hari; bursa kuotasi "@3.0"; cap trade 30.000 |
| **Call of War** | 7 | Food, Goods, Manpower, Metal, Oil, Rare, Money | Non-core −75%; "double resource region"; shortage → morale dan efektivitas turun; middle-ground paling mirip target |
| **HoI4** | 7 strategis + Fuel + MP + IC | Oil, Aluminium, Rubber, Tungsten, Steel, Chromium, Coal | Tidak distok, per pabrik; −5% per unit kurang; trade 8 unit per civ factory; Fuel 0 → speed 0.4×, combat 0.1× |
| **Vic3** | ~52 goods | 4 kategori | Formula harga base × [1 + 0.75 × clamp((BUY−SELL)/min, ±1)] → 25 sampai 175%; shortage throughput −5% lalu −1%/hari maks −50% |
| EU4 | 30+ goods | | Trade nodes searah; bagus untuk blokade selat, trade power sulit dipahami |
| AoH3 | 48 | | Bonus untuk produsen terbesar, bukan kebutuhan produksi |
| **Realpolitiks 2** | 3 komoditas + Money + AP + MP | Metals, Fuels, Rare Earth | Contoh 3 komoditas modern yang berjalan; harga bergeser per jumlah beli/jual (spread 25%) |
| SuperPower 2 | ~27 dalam 5 sektor [UV] | | **Autarky bug**: semua surplus barang sama → pasar mati; patch cap GTM 30% |
| Civ VI | 3 kelas | Bonus, Luxury, Strategic | Strategic berlokasi → rebutan tile |
| Rise of Nations | 6 | Food, Timber, Metal, Wealth, Knowledge, Oil (muncul di era industri) | Resource muncul bertahap per era |
| Ages of Conflict | 1 | Gold | Ekstrem sederhana, cocok untuk simulator tanpa pemain |
| Offworld Trading Co. | 13 | | Harga bergeser per transaksi cukup untuk strategi |

Pola: yang "enak" untuk medium complexity ada di **5 sampai 7 resource dengan 2 universal (Money, Manpower) dan sisanya barang berlokasi di peta**. Yang gagal: puluhan barang dengan AI pasar lemah (SP2) atau abstrak total.

### 17.2 Empat opsi
| Kriteria | A: 7 CoN | B: 5 gabungan (Money, Manpower, Supplies, Materials, Energy) | C: 3 abstrak (Treasury, Manpower, Resources) | D: variabel per era pack |
|---|---|---|---|---|
| Spesialisasi kota | Kuat (1 per kota) | Sedang (3 jenis) | Tidak ada | Kuat |
| Embargo / blokade bermakna | Ya | Ya (Energy) | Hampir tidak | Ya |
| Rebutan ladang minyak / tambang | Ya | Ya | Tidak | Ya, historis (Baku, Ploiești, Ruhr) |
| Angka di top bar | 7 | 5 | 3 | 5 sampai 7 (layout tetap) |
| Beban balancing | Tinggi (1 set) | Rendah | Sangat rendah | Tinggi (4 set) |
| Mapping data nyata | Baik (Fuel ← EIA/GEM, Rare ← USGS), proxy untuk Components/Electronics | Baik, mudah dijumlahkan | Buruk (1 skalar, dataset terbuang) | Terbaik (dataset per era) |
| AI / market offline | 5 barang | 3 barang | 1 barang | 3 sampai 5 |
| Lintas era | Buruk (Electronics 1914) | Baik (abstrak) | Baik tapi hambar | By design |
| Risiko utama | Bottleneck Rare tanpa katup Gold; Components vs Electronics membingungkan | "Materials" terlalu lebar; hilang rasa "1 kota = 1 komoditas nyata" | Autarky-by-design, hambar; bukan "strategi kuat" | Konten 4×, drift antar pack |

Detail Opsi A: Rare terkonsentrasi di ~6 negara → distribusi ekstrem; Components/Electronics dari proxy nasional (manufacturing, high-tech exports) dibagi ke provinsi secara sintetis. Opsi B: Rare bisa jadi sub-atribut Materials ("Materials (Rare)" untuk riset tier tinggi). Opsi D: unit didefinisikan dalam **cost class** (light/heavy/mechanized/air/naval), pack memetakan class → resource, sehingga balancing sekali di level class.

### 17.3 Market offline: pasar dunia satu layar (usulan)
1. **Peserta**: tiap AI nation per hari `net = produksi − konsumsi − (target_buffer − stok)/7`, buffer 7 hari upkeep; positif SELL, negatif BUY. Plus peserta virtual **Rest of World** yang selalu menjual di 1.75× base dan membeli di 0.25× base dengan volume terbatas (~10% produksi dunia/hari) = sanity floor dan ceiling, pasar tidak pernah mati.
2. **Harga dunia**: rumus Vic3, dihaluskan EMA (α ≈ 0.2/hari); tampil angka + sparkline 30 hari + panah tren.
3. **Harga lokal pemain**: `local = access × world + (1 − access) × autarky_price`; access = fraksi kapasitas trade terbuka (pelabuhan tidak diblokade, perbatasan darat non-embargo, konvoi tidak dicegat). Blokade total → beli 1.75× dan hanya kuota RoW darat. **Blokade pelabuhan terasa tanpa simulasi rute.**
4. **Embargo**: negara pengembargo keluar dari agregat yang bisa diakses pemain; tie-breaker kelangkaan memakai influence ala HoI4 (opinion, jarak, deal lama).
5. **Transaksi pemain**: slider; harga bergeser 1% per 1% volume dunia harian (dibatasi ±30%/hari); fee 5% sebagai money sink pengganti Gold.
6. **Kuota**: beli harian ≤ 25% total SELL dunia per barang.
7. **Anti-Autarky**: jika ≥80% negara surplus barang X selama 30 hari → naikkan konsumsi sipil X.
Kompleksitas O(negara × barang) per hari, trivial.

### 17.4 Manpower ringan (usulan)
Pool = Σ populasi provinsi × cap status (Homeland 100 / Annexed 50 / Occupied 25%) × **tingkat mobilisasi 3 pilihan**: Peace 1.5% / Partial 5% (−5% Money, morale −5) / Total 10% (−15% Money, morale −10) (kompresi 7 law HoI4). Regen harian (pool_max − pool) × 2%. Dikonsumsi saat **mobilisasi dan reinforcement** (bukan upkeep harian) → satu angka lebih sedikit per kartu unit.

### 17.5 Upkeep dan shortage ringan (usulan)
Upkeep hanya 2 sampai 3 barang per unit (Money + Supplies + Energy untuk unit bermesin). Semua efek shortage berbentuk **ramp Vic3** (mulai −5%, −3%/hari, cap) agar pemain punya 5 sampai 10 hari bereaksi:
| Barang kurang | Efek | Cap |
|---|---|---|
| Supplies/Food | morale semua provinsi turun + HP regen 0 | −50 morale (CoN) |
| Energy/Fuel | unit bermesin speed ×0.5, attack ×0.5 (setengah cliff HoI4); unit kaki aman | |
| Money | morale ramp + antrean konstruksi/riset dijeda; tanpa hutang | −50 |
| Materials/Components/Electronics | produksi baru berhenti, tanpa penalti tempur | |
| Rare | riset berhenti | |
| Manpower | tidak bisa mobilisasi/reinforce | |

### 17.6 Rekomendasi riset (untuk diputuskan Billy)
**Opsi D didisiplinkan kerangka B: engine "Money + Manpower + maksimal 5 goods" dengan slot top bar tetap; isi goods per era pack.** Modern = 7 CoN penuh (goods: Supplies, Components, Fuel, Electronics, Rare) karena identitas clone; PD2 = 5 goods ala CoW (Food, Goods, Metal, Oil, Rare); PD1 = 5 goods S1914 dikompres (Food, Iron, Lumber, Coal, Oil) dengan **upkeep substitutable per kategori** (Food / Materials / Energy); pra-industri = 3 goods (Food, Timber, Metal). Market, manpower, shortage agnostik nama barang (hanya membaca `category` dan `shortageEffect`).

**Skema resource per era pack (konseptual):** `packId, slots {currency, population, goods[]}, resources[] {id, name i18n, icon, category, tradable, basePrice, productionFactor, producers[] (city/province + requiresTag + building), consumers[] (unitClass/building + role build/upkeep), shortageEffect {kind, mul, rampPerDay, startAt}, realData {dataset, field, spatialize, transform}}, unitCostClasses {class: {build, upkeep}}`.

**Mapping data nyata Modern:** Money ← GDP World Bank dibagi ke provinsi via populasi × GDP/kapita; Manpower ← populasi gridded; Supplies ← FAOSTAT + cropland; Components ← manufacturing value added; Fuel ← EIA + GEM GOGET (tag provinsi oilfield); Electronics ← high-tech exports [UV kode]; Rare ← USGS MCS + lokasi tambang. PD2/PD1/pra-industri: Maddison GDP historis, HYDE populasi/cropland, USGS/GEM lokasi tambang dan ladang tua (Baku, Ploiești, Ruhr, Cornwall).

Catatan aturan 2.1 nomor 5: rekomendasi ini bahan brainstorming, bukan patokan; alternatif A dan B tetap terbuka.
