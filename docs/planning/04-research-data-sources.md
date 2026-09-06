# Riset D: Sumber Data Dunia Nyata dan Teknologi Peta

> Sumber: plan riset Nation Rise, sesi 2026-09-03 sampai 2026-09-04, bagian 7. Dokumen ini bagian dari `docs/planning/`; indeks dan aturan kerja ada di `README.md`. Nomor "bagian N" yang dirujuk di dalam teks mengacu ke penomoran plan asli; petanya ada di README.

## 7. Hasil Riset D: Sumber Data Dunia Nyata dan Teknologi

Catatan: karena game hanya dimainkan sendiri, lisensi non-komersial pun boleh, tetapi stack di bawah dipilih yang bersih (public domain / CC0 / MIT / CC BY) supaya tidak ada beban di masa depan.

### 7.1 Geometri peta
| Sumber | Lisensi | Catatan |
|---|---|---|
| **Natural Earth v5.1.1** Admin-0 (258 negara) dan **Admin-1 (4,500+ provinsi)** skala 10m | Public domain | **Pilihan utama.** Admin-0 10m 4.7 MB zip, Admin-1 10m 14.2 MB zip. Field `adm0_a3`, `iso_3166_2`, `name`, `type` |
| natural-earth-geojson (martynafford) | CC0 | GeoJSON siap pakai tanpa konversi SHP |
| geoBoundaries gbOpen | CC BY 4.0 (per negara bisa ODbL) | Untuk detail ekstra negara tertentu; cek `boundaryLicense` |
| GADM | Non-komersial | Boleh untuk pemakaian pribadi, tapi tidak perlu |
| OSM boundaries | ODbL | Tidak perlu |

**Pipeline:** Natural Earth Admin-1 → **dissolve** provinsi kecil ke target ~2,000 provinsi (daftar merge manual per negara) → `mapshaper -simplify weighted 8% keep-shapes -clean -o format=topojson quantization=1e5` → TopoJSON 1 sampai 3 MB. TopoJSON menyimpan arc bersama sekali sehingga tidak ada celah antar tetangga. Kebijakan batas sengketa (Kashmir, Krimea, Sahara Barat, Taiwan) harus diputuskan sekali karena memengaruhi ID provinsi; Natural Earth memakai de facto.

### 7.2 Bendera
**flag-icons** (npm, MIT, SVG 4:3 dan 1:1 semua ISO 3166-1) sebagai default. Alternatif country-flag-icons (MIT), flagcdn/Flagpedia (PD), Wikimedia Commons (per file). Logo organisasi (NATO, EU, ASEAN) berstatus trademark → buat simbol generik sendiri.

### 7.3 Data negara umum
| Sumber | Lisensi | Isi |
|---|---|---|
| **CIA World Factbook snapshot Jan 2026** (factbook.json GitHub CC0; Mozilla Data Collective 7.1 MB) | Public domain / CC0 | Government type, international organization participation, natural resources, military. **Factbook resmi dihentikan 4 Feb 2026**, data beku; perlu mapping kode GEC → ISO |
| **REST Countries** `countriesV3.1.json` | MPL 2.0 | cca2/cca3, capital, latlng, borders, area, population, currencies, languages, unMember |
| **World Bank WDI** | CC BY 4.0 | GDP, populasi, natural resources rents (`NY.GDP.TOTL.RT.ZS`) |
| **Wikidata SPARQL** | CC0 | Keanggotaan organisasi (P463): diuji NATO Q7184 → 32 hasil, cocok. QID: UN Q1065, EU Q458, ASEAN Q7768, AU Q7159, BRICS Q47504, OPEC Q7795, SCO Q205995, CSTO Q189347 (cek sebelum pakai) |
| UNdata | bebas + atribusi | Cadangan |

### 7.4 Sumber daya alam
| Sumber | Lisensi | Isi |
|---|---|---|
| USGS Mineral Commodity Summaries 2026 | PD (pemerintah AS) | Produksi 90+ mineral per negara |
| USGS MRDS | PD | Titik deposit mineral global (lat/lon), update berhenti 2011, cukup untuk game |
| EIA International Energy `INTL.zip` 23.5 MB | PD + atribusi | Minyak, gas, batu bara, listrik per negara |
| Global Energy Monitor GOGET (Mar 2026) | CC BY 4.0 | 6,481 area ekstraksi minyak/gas aktif dengan lokasi → **penempatan per provinsi** |
| GEM Global Coal Mine Tracker | CC BY 4.0 | ~7,000 tambang dengan koordinat |
| FAOSTAT | CC BY 4.0 | Pangan |
| WRI Global Power Plant Database | CC BY 4.0 | Pembangkit dengan lat/lon |

Alokasi ke provinsi: point-in-polygon titik GEM/MRDS/GPPD terhadap poligon provinsi saat build (turf.js), lalu normalisasi ke angka nasional USGS/EIA. Peta ke 5 resource CoN: Supplies ← pangan/FAO + populasi; Components ← industri/GDP manufaktur; Fuel ← minyak/gas EIA + GEM; Electronics ← GDP high-tech; Rare Materials ← mineral USGS/MRDS.

### 7.5 Militer
| Sumber | Lisensi | Pakai? |
|---|---|---|
| Wikipedia list military personnel (178 negara) | CC BY-SA | Ya, dibulatkan ke tier game |
| FAS nuclear forces (9 negara, ~12,187 hulu ledak awal 2026) | Fakta ringkas | Ya |
| Factbook "Military expenditures" % GDP × GDP World Bank | PD | Ya, proksi anggaran |
| SIPRI milex / arms transfers | Non-komersial | Boleh untuk pribadi; arms transfers berguna menentukan doktrin |
| IISS, Global Firepower | Berbayar / dilarang | Tidak |

**Doktrin (enum sendiri):** Western / Eastern / European / Non-aligned, diturunkan dari keanggotaan NATO/CSTO/SCO (Wikidata) + pemasok senjata dominan + government type. Angka bonus doktrin dirancang sendiri, bukan salinan Bytro.

### 7.6 Pemerintahan
Factbook `Government type` (PD) sebagai enum utama (presidential republic, parliamentary republic, constitutional monarchy, absolute monarchy, communist state, theocratic republic, military junta, dll). Cross-check Wikipedia. V-Dem (CC BY-SA) opsional untuk skor numerik.

### 7.7 Kota
**Natural Earth Populated Places 10m** (PD, 2.7 MB; ibukota, kota besar, `pop_max`) untuk MVP; GeoNames `cities15000` (CC BY, 3.2 MB) bila perlu lebih padat.

### 7.8 Teknologi rendering peta (ringan, ribuan provinsi, unit realtime)
| Stack | Pro | Kontra |
|---|---|---|
| **PixiJS v8** (WebGL/WebGPU, MIT) | Batching sprite luar biasa untuk unit bergerak; picking; ekosistem web | Poligon konkaf via Graphics harus di-cache, jangan rebuild per frame |
| d3-geo + Canvas 2D | Proyeksi lengkap, TopoJSON native | Tanpa GPU; hanya untuk tahap build (proyeksi) |
| MapLibre GL | Renderer vector tile matang, feature-state | Dibuat untuk peta geografis; unit bergerak butuh renderer kedua; PMTiles butuh HTTP range |
| Phaser | Framework game lengkap | Overhead; UI panel lebih enak di HTML |
| Godot 4 | Native, performa tinggi | Tidak terpasang, bukan keahlian Billy, importer GeoJSON harus ditulis, GDAL plugin GPL |
| Electron | Familiar | RAM 8 GB: Chromium 300 sampai 500 MB, hindari |

**Pendekatan render yang direkomendasikan (pola Paradox):** saat build, rasterisasi semua provinsi ke bitmap **province ID map** (warna unik = ID). Runtime: hover/klik = baca satu pixel → ID (O(1), tanpa point-in-polygon); pewarnaan owner/terrain/heatmap lewat **lookup texture** 1D berindeks ID di shader (mengubah warna 3,000 provinsi = menulis satu texture kecil); garis batas dari geometri TopoJSON digambar sekali ke layer terpisah dan di-cache per zoom; unit = sprite batched di atas. 60 fps stabil, tidak tergantung jumlah poligon.

---
