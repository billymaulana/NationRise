# Riset: Granularitas Provinsi, Kota, Zona Laut, dan Terrain

> Riset sesi 5 (2026-09-05). Verifikasi lewat naturalearthdata.com, GitHub natural-earth-vector, Wikipedia, situs penyedia data. WebSearch tidak tersedia. [UNV] = konsisten dengan pengetahuan umum tetapi tidak dicek di sesi ini.

> **KOREKSI (dokumen 38).** Asumsi bahwa Hearts of Iron IV punya sekitar 150 sea region **salah jauh**. Angka sebenarnya **304 strategic region dan 3.133 sea province**, sehingga Hearts of Iron IV justru model paling halus di seluruh perbandingan, bukan model kasar. Benchmark zona laut kita dinaikkan ke 240.

## 1. Jumlah unit Admin-1 dan koreksi penting

**Delapan angka yang perlu dikoreksi:**
| Negara | Perkiraan awal | Terverifikasi | Catatan |
|---|---|---|---|
| **Aljazair** | 58 | **69 wilaya** | 48 (1984) → 58 (Des 2019) → 69 (**16 Nov 2025**). **Natural Earth hampir pasti masih 48** |
| **Vietnam** | 63 | **34** (26 provinsi + 8 kota) efektif **1 Juli 2025** | NE masih 63, butuh dissolve manual |
| **Kazakhstan** | 20 | **21** (17 region + 4 kota termasuk Baikonur) | Reformasi Mar 2022 menambah Abai, Ulytau, Jetisu |
| **Myanmar** | 21 | **15** first-level | Angka 21 menghitung Self-Administered Zones yang sebenarnya sub-divisi |
| **Peru** | 25 | **26** (24 departemen + Lima + Callao) | Lima dan Callao bukan bagian departemen |
| **DR Kongo** | 26 | **26**, tetapi NE lama memakai struktur pra-2015 (**11**) | Cek versi |
| **Rusia** | 83+ | **83** diakui internasional, 89 klaim Rusia | Krimea sebagai unit terpisah |
| **Finlandia** | 19 | 18 daratan + Åland = **19** | Sumber lain menyebut 18 |

**Masalah struktural Natural Earth.** Kutipan resmi: "Many countries, like France, include top level regions and departments, both as admin-1 ranking" dan "Still in beta" dengan pengecualian untuk Antartika, wilayah sengketa, negara pulau kecil, dan kepangeranan. **Tidak bisa diasumsikan satu fitur NE sama dengan satu admin-1 resmi.** Untuk Prancis, Britania Raya, Italia, Spanyol ini fatal. Britania Raya [UNV]: ISO 3166-2 GB mendaftarkan sekitar 220 kode; GitHub issue nvkelso/natural-earth-vector#54 mengonfirmasi NE menyimpan UK pada tingkat counties dan unitary authorities, bukan 4 negara konstituen. Perkirakan **190 sampai 230 fitur UK**.

**Perintah audit wajib dijalankan pertama kali** (lebih otoritatif daripada riset web mana pun):
```bash
ogrinfo -dialect SQLite -sql \
 "SELECT adm0_a3, iso_a2, COUNT(*) AS n FROM ne_10m_admin_1_states_provinces \
  GROUP BY adm0_a3 ORDER BY n DESC" ne_10m_admin_1_states_provinces.shp
```
Risiko tinggi (NE kemungkinan usang): Aljazair, Vietnam, DR Kongo, Norwegia (11 vs 15), Ethiopia (pemekaran 2020 sampai 2023), Indonesia (4 provinsi Papua baru 2022), Kenya (mungkin 8 provinsi lama), Kazakhstan. Kritis: Britania Raya dan Prancis (campur tingkat).

## 2. Rencana dissolve ke ~2.000 provinsi
**Kelas negara:** Mayor 40 sampai 82 provinsi dan 8 sampai 12 kota (luas di atas 2 juta km2 atau PDB 15 besar atau great power historis di dua era); Menengah 12 sampai 40 dan 4 sampai 8 kota (populasi di atas 15 juta atau luas di atas 300 ribu km2 atau anggota NATO/G20); Kecil 3 sampai 12 dan 1 sampai 3 kota; Mikro 1 sampai 2 (luas di bawah 3.000 km2).
Skor otomatis lalu koreksi manual: `score = 0.35·log10(luas) + 0.35·log10(populasi) + 0.30·strategic_weight`.

**Tujuh invarian merge yang tidak boleh dilanggar:** (1) kota besar tidak pernah digabung dengan kota besar lain, satu provinsi maksimal satu kota; (2) unit pantai tidak pernah menjadi landlocked, setiap segmen pantai harus punya minimal satu provinsi pantai agar adjacency ke Coastal Waters dan invasi amfibi tetap mungkin; (3) jangan merge lintas batas negara; (4) **jangan merge lintas garis hot-zone historis** (bagian 3), inilah yang membuat era PD1 dan PD2 bisa dipakai tanpa geometri kedua; (5) pertahankan unit perbatasan agar koridor darat tidak hilang; (6) kekompakan, tolak merge bila Polsby-Popper `PP = 4π·Area/Perimeter²` di bawah 0,18 atau hasilnya multipolygon terputus kecuali kepulauan; (7) keseragaman ukuran, koefisien variasi luas dalam satu negara di bawah 0,9 (longgarkan ke 1,5 untuk Rusia, Kanada, Australia).

**Algoritma:** greedy region-merging berbobot dengan `cost = w1·(pop_u+pop_v) + w2·(area_u+area_v) − w3·ΔPP − w4·same_region`; kunci unit yang berisi kota terpilih, exclave, pulau utama, atau hot-zone; simpan hasil sebagai **CSV yang bisa diedit tangan** (`ne_adm1_code` → `province_id`), bukan output algoritma yang tidak bisa diintervensi, karena sekitar 150 keputusan pasti perlu koreksi manual.

**Target per negara (57 negara utama ≈ 1.472 provinsi):** USA 82 (**split**, paritas CoN: Texas 6, California 6, Alaska 3, NY 4), Rusia 72 (merge Siberia), China 68 (split Sichuan 4, Guangdong 4, Xinjiang 4), India 60, Brasil 48, **Indonesia 44**, Jerman 44 (paritas CoN), Kanada 40, Prancis 40 (rebuild dari 96 departemen), Jepang 40, Meksiko 36, Britania Raya 36 (England 24, Scotland 7, Wales 3, N.Ireland 2), Filipina 36, Australia 34, Turki 34, Iran 32, Italia 32, Spanyol 30, Argentina 30, Nigeria 30, Ukraina 27, Pakistan 26, Thailand 26, Aljazair 24, Kazakhstan 24, DR Kongo 24, Polandia 24, Mesir 22, Vietnam 22, Kolombia 22, Arab Saudi 20, Afrika Selatan 20, Peru 20, Rumania 18, Myanmar 18, Venezuela 18, Chile 16, Malaysia 16, Irak 16, Kenya 16, Korea Selatan 14, Ethiopia 14, Swedia 14, Bangladesh 12, Mongolia 12, Suriah 12, Norwegia 12, Papua Nugini 12, Finlandia 10, Belanda 10, Swiss 10, Yunani 10, Portugal 10, Selandia Baru 10, Austria 9, Belgia 8, Israel 6. **Sisa ~138 negara ≈ 528 provinsi** (rata-rata 3,8). **Total ≈ 2.000.**

**Kasus khusus.** Kepulauan: jangan merge dua pulau berbeda kecuali keduanya di bawah 2.000 km2 dan berjarak di bawah 50 km; **adjacency antar pulau harus lewat zona laut**, bukan darat, inilah yang membuat angkatan laut punya arti. Indonesia 44 = Jawa 10, Sumatra 10, Kalimantan 8, Sulawesi 6, Papua 6, Nusa Tenggara dan Bali 3, Maluku 1. Filipina 36 = Luzon 16, Visayas 9, Mindanao 11. Jepang 40 = Honshu 26, Kyushu 6, Hokkaido 3, Shikoku 2, Okinawa 1. Rusia, Kanada, Australia: naikkan bobot luas tiga kali dan turunkan bobot populasi; provinsi tundra raksasa dengan populasi 0 sampai 1 memang benar sebagai ruang manuver. Alaska 3 dan Hawaii 1 **non-adjacent** ke daratan, hanya lewat Coastal Waters, agar skenario Pearl Harbor berfungsi. Wilayah seberang laut sebagai provinsi metropole dengan flag `overseas=true` dan penalti supply: Guyana Prancis, Réunion dan Mayotte, Guadeloupe dan Martinique, Puerto Rico dan Virgin Islands (populasi 3), Guam dan Mariana Utara (kunci Pasifik PD2), Kaledonia Baru, Polinesia, Falkland, Gibraltar, Bermuda, Greenland 2, Faroe 1. Mikro: Singapura 1 provinsi kota (Urban, populasi 5, chokepoint darat ke Malaka); Vatikan, Monako, San Marino, Liechtenstein tidak punya admin-1 di NE, rekomendasi **diserap ke provinsi tetangga**.

## 3. Sub-split hot-zone PD1 dan PD2 (jawaban P17)
**Prinsip:** provinsi adalah unit tetap lintas era, jadi garis batas 1914 dan 1939 harus sudah ada di geometri 2026 sebagai batas internal. Kriteria: bila irisan terbesar unit modern dengan negara mana pun di era target **di bawah 70%**, unit itu dipecah. Efek samping bagus: menambah granularitas di Eropa Tengah yang memang zona paling diperebutkan.

**28 grup split, +30 provinsi:**
| # | Unit modern | Era | Terbelah menjadi | Split |
|---|---|---|---|---|
| 1 | FR Grand Est | 14+39 | Alsace-Moselle (Jerman 1871 sampai 1918, 1940 sampai 44) dan Champagne-Lorraine | +1 |
| 2 | DK Syddanmark | 14 | Nordslesvig (Jerman sampai 1920) dan Fyn-Sydjylland | +1 |
| 3 | PL Kujawsko-Pomorskie | 14 | Prusia Barat dan Kongres Polandia | +1 |
| 4 | PL Śląskie | 14 | Oberschlesien, Cieszyn, Zagłębie | +2 |
| 5 | PL Pomorskie | 14+39 | **Danzig** (Free City 1920 sampai 39) dan Pomerelia | +1 |
| 6 | PL Małopolskie | 14 | Galicia Barat dan Miechów-Olkusz | +1 |
| 7 | IT Friuli-Venezia Giulia | 14 | Udine dan **Trieste-Gorizia** (Austria) | +1 |
| 8 | GR Anat. Makedonia-Thraki | 14 | Makedonia Timur dan **Thrace Barat** (Bulgaria sampai 1919) | +1 |
| 9 | RO Suceava | 14 | **Bukovina Selatan** dan Moldova Lama | +1 |
| 10 | UA Chernivtsi | 14 | **Bukovina Utara** dan Khotyn/Bessarabia | +1 |
| 11 | UA Odesa | 14+39 | **Budjak** (Rumania 1918 sampai 40) dan Odesa | +1 |
| 12 | RU Leningrad | 39 | **Tanah Genting Karelia** (Finlandia sampai 1940) dan Ingria | +1 |
| 13 | RU Karelia | 39 | **Ladoga Karelia** dan Karelia Timur | +1 |
| 14 | RU Murmansk | 39 | **Petsamo** (Finlandia 1920 sampai 44) dan Kola | +1 |
| 15 | BY Vitsebsk | 39 | Kresy (Polandia 1921 sampai 39) dan Vitsebsk timur | +1 |
| 16 | BY Minsk | 39 | Barat (Polandia) dan Timur (USSR) | +1 |
| 17 sampai 21 | CZ Královéhradecký, Plzeňský, Jihočeský, Olomoucký, Moravskoslezský | 39 | **Sudetenland** dan Bohemia/Moravia dalam | +5 |
| 22 sampai 24 | SK Nitriansky, Banskobystrický, Košický | 39 | Strip Hungaria (Vienna Award I) dan utara | +3 |
| 25 | CN Nei Mongol | 39 | Hulunbuir (Manchukuo), Chahar-Suiyuan (**Mengjiang**), Alxa | +2 |
| 26 | CN Hebei | 39 | **Rehe/Jehol** (Manchukuo) dan Hebei inti | +1 |
| 27 | NG Adamawa dan Taraba | 14+39 | **Kamerun Britania** dan Nigeria | +1 |
| 28 | MA Oriental | 14+39 | **Maroko Spanyol (Rif)** dan Maroko Prancis | +1 |

Kompensasi agar tetap ~2.000: kurangi 30 provinsi dari negara tundra dan gurun (Rusia 72 ke 68, Kanada 40 ke 38, Australia 34 ke 32, Aljazair 24 ke 22, Kazakhstan 24 ke 22, Mongolia 12 ke 10, Arab Saudi 20 ke 18, Libya, Mali, Niger, Chad masing-masing minus 2).

**Yang SUDAH bersih, cukup batasi merge (penghematan effort terbesar):** South Tyrol (seluruh Trentino-Alto Adige Austria 1914, flip 100%), Istria (admin-1 sendiri), Memel (Klaipėda County), Vilnius (Vilnius County), Galicia Timur (Lviv, Ivano-Frankivsk, Ternopil, jangan merge dengan Volhynia), Zakarpattia, Transylvania dan Banat (judeţ tidak melintasi garis 1918 kecuali Suceava), Vojvodina, Bessarabia (Moldova negara sendiri), Dobruja Selatan, Togoland (Volta dan Oti sudah admin-1), Namibia, Tanganyika, Rwanda-Urundi, Timur Tengah Ottoman 1914 (perubahan tingkat negara; jaga Nejd, Hejaz, Al-Hasa, Asir terpisah di Saudi), India 1914 dan 1939 (partisi 1947 adalah batas negara, semua bersih). **Princely states India: pakai flag `princely=true` dan `paramountcy=GBR`, bukan geometri** — 565 negara pangeran mustahil dipetakan dan nilai gameplaynya tidak sepadan.

**Implementasi:** satu file geometri `provinces.gpkg` (immutable) plus tiga file kepemilikan (`ownership_modern_2026.csv`, `ownership_ww1_1914.csv`, `ownership_ww2_1939.csv`). `merge_groups` sebaiknya **satu daftar global constraint** `never_merge`, bukan per era, agar mustahil out-of-sync.

## 4. Aturan pemilihan kota
**Field NE Populated Places:** `pop_max` (estimasi metropolitan dari LandScan, dipakai sebagai skor utama dan VP), `pop_min`, `adm0cap`, `adm1cap`, `featurecla`, `scalerank`, `rank_max`, `worldcity`, `megacity`. Peringatan: `pop_max` adalah nilai metro, sering jauh lebih besar dari populasi administratif (Jakarta 9,1 juta = Jabodetabek, bukan DKI); konsisten pakai `pop_max` saja. Lisensi Natural Earth **public domain**. GeoNames `cities15000` CC BY 4.0 [UNV] dipakai hanya sebagai cross-check untuk kota tanpa `pop_max` (~10%), jangan dicampur ke rumus yang sama karena memakai populasi administratif.

**Algoritma:** `score = 100·(adm0cap) + 30·(adm1cap) + 12·log10(max(pop_max,10000)) + 20·is_strategic_port + 10·(scalerank ≤ 2) + 8·(megacity)`. Aturan keras: ibu kota negara selalu terpilih; `pop_max ≥ 2 juta` selalu terpilih. Lalu urutkan sampai cap kelas. **Separasi minimum** 250 km (mayor) atau 120 km (lainnya) kecuali `pop_max ≥ 5 juta`, mencegah Ruhr atau Randstad memakan seluruh slot. **Kuota geografis** minimal satu kota per makro-region (Indonesia: Sumatra, Jawa, Kalimantan, Sulawesi, Papua/Maluku wajib), yang menjelaskan mengapa CoN memilih Padang (840 ribu) di atas Bandung.

**Rumus VP:** `pop_game = clamp(round(1.72·log10(pop_max) − 6.0), 1, 10) + (1 bila ibu kota)`.
| Kota | `pop_max` | Rumus | CoN | Selisih |
|---|---|---|---|---|
| Jakarta | 9.125.000 | 6 | 6 | 0 |
| Surabaya | 2.509.000 | 5 | 5 | 0 |
| Medan | 2.220.000 | 5 | 5 | 0 |
| Palembang | 1.573.000 | 5 | 5 | 0 |
| Makassar | 1.321.000 | 5 | 4 | +1 |
| Padang | 840.000 | 4 | 5 | −1 |
| Banjarmasin | 627.000 | 4 | 4 | 0 |
| **Total** | | **34** | **34** | **0** |
Total VP identik dengan CoN; deviasi Makassar dan Padang saling meniadakan dan menunjukkan CoN memakai hand-tuning. Sediakan kolom `vp_override` untuk sekitar 50 kota.
**USA 9 kota (paritas CoN):** New York 7, Los Angeles 6, Chicago 6, Miami 6, Washington DC 6 (ibu kota), Houston 5, Seattle 5, San Francisco 5, Denver 5. Total 51. Rasio USA banding Indonesia 51 banding 34 sekitar 1,5 banding 1, sepadan dengan bobot ekonomi CoN.
**Resource utama kota:** Urban padat → Industrial Goods atau Electronics; pantai dengan pelabuhan → Fuel bila ada ladang atau Consumer Goods; tetangga pegunungan → Rare Materials; pertanian → Food. Jangan dua kota dengan resource sama dalam radius 2 provinsi, agar perdagangan internal terpaksa terjadi.

## 5. Desain zona laut
Benchmark [UNV]: HoI4 sekitar 150 sea regions, Vic3 sea nodes abstrak, EU4 sekitar 600 sea provinces. **Rekomendasi model HoI4**; 600 terlalu berat untuk 2.000 provinsi darat (rasio 1 banding 3,3, laut mendominasi pathfinding), Vic3 terlalu abstrak untuk game yang punya Strait sebagai terrain.

**Target ~210 zona:** Coastal Waters ~115 (panjang pantai 400 sampai 800 km, lebar ~200 km, adjacent ke 3 sampai 8 provinsi darat, mengizinkan invasi amfibi dan blokade pelabuhan dan bombardir pantai); High Seas ~70 (diameter 700 sampai 1.400 km, hanya adjacent ke laut, tanpa supply darat); **Strait 25 sampai 26** (chokepoint, adjacency wajib).

**Daftar strait:** Malaka, Sunda, Lombok, Torres, Bass, Cook, Hormuz, Bab-el-Mandeb, Suez, Gibraltar, Bosporus, **Dardanelles** (ditambahkan: Gallipoli tanpa Dardanelles adalah kehilangan skenario PD1 terbaik), Otranto, Selat Sisilia, Kerch, Øresund, Skagerrak, Dover, Panama, Taiwan, Tsushima, Luzon, Bering, Drake, Magellan, Good Hope.

**Metode hybrid tiga fase** (Voronoi murni buruk di teluk sempit; H3 murni memotong selat sembarangan): fase 1 digitize 25 chokepoint manual di QGIS (~3 jam kerja); fase 2 Coastal Waters via seed sepanjang garis pantai (spacing 450 km, offset 70 km ke arah laut) lalu Voronoi; fase 3 High Seas via seed H3 resolusi 1 (edge ~418 km, luas ~607.000 km2) yang berjarak lebih dari 400 km dari pantai; gabung, Voronoi, clip ke `ne_10m_ocean`, buang sliver di bawah 20.000 km2. **Adjacency kritis:** tetangga sah hanya bila panjang batas bersama di atas 25 km, tanpa ini zona yang bersentuhan di satu titik menjadi tetangga dan armada menembus daratan secara diagonal.
**Penamaan:** overlay dengan `ne_10m_geography_marine_polys` (public domain) dan ambil nama dari poligon dengan irisan terbesar. **Lewati IHO Sea Areas** (marineregions.org): lisensi per dataset tidak dinyatakan eksplisit [UNV], dan NE marine polys sudah cukup.

## 6. Sumber data terrain
| Dataset | Resolusi | Lisensi | Ukuran | Status |
|---|---|---|---|---|
| ESA WorldCover v200 (2021) | 10 m, 11 kelas | **CC BY 4.0** | **117 GB**, akurasi 76,7% | terverifikasi |
| Copernicus GLC 100 m | 100 m | CC BY 4.0 | ~20 GB | [UNV] |
| **Köppen-Geiger Beck 2023** | **1 km** | **CC BY 4.0** | 1901 sampai 2099, 7 SSP | terverifikasi |
| SRTM GL1 | 30 m | Public domain | di atas 100 GB | [UNV] |
| **GMTED2010** | 30 arc-sec | Public domain USGS | 1 sampai 2 GB | [UNV] |
| **GHS-SMOD R2023A** | 100 m dan 1 km, Mollweide | JRC open, atribusi | ~200 MB | sebagian |
| **WorldPop** | 100 m dan 1 km | **CC BY 4.0** | ~1 GB | terverifikasi |

**Stack yang direkomendasikan (~6 GB, offline penuh):** resolusi 10 m adalah pemborosan 117 GB untuk hasil identik, karena provinsi rata-rata 68.000 km2 sudah memberi 68.000 sampel pada grid 1 km. Pakai GHS-SMOD 1 km (Urban dan Suburban, 200 MB), Köppen-Geiger 1 km (Desert, Tundra, Jungle, 150 MB), GMTED2010 mean dan std (Mountains, 1,5 GB), Copernicus GLC 100 m (Forest, ~3 GB), GHS-POP 1 km (sanity check, 1 GB). Bila tetap ingin WorldCover: file adalah Cloud-Optimized GeoTIFF di AWS S3 tanpa autentikasi, baca overview level 5 (~320 m) lewat rasterio, bukan 117 GB.

**Aturan klasifikasi (first match wins).** CRS kerja **EPSG:6933 (equal-area) wajib**; menghitung fraksi luas di EPSG:4326 salah lebih dari 40% di lintang tinggi.
1 **Urban**: SMOD urban centre ≥ 15% luas atau built-up ≥ 20%. 2 **Suburban**: SMOD 21 sampai 23 ≥ 25% atau densitas di atas 400 per km2. 3 **Mountains**: mean slope ≥ 8 derajat atau p90 dikurangi p10 elevasi ≥ 900 m atau fraksi slope di atas 15 derajat ≥ 30%. 4 **Tundra**: Köppen ET, EF, Dfd, Dwd ≥ 50%. 5 **Desert**: Köppen BW dan BS ≥ 60% dan tree cover di bawah 10%. 6 **Jungle**: tree cover ≥ 40% dan Köppen Af, Am, Aw ≥ 50%. 7 **Forest**: tree cover ≥ 35%. 8 **Open Ground**: sisanya.
**Prioritas Urban di atas Mountains disengaja**: La Paz, Kabul, Denver secara terrain pegunungan tetapi secara gameplay harus Urban; bila ingin keduanya tambahkan modifier `mountain_city=true`. Provinsi kota yang tidak lolos ambang Urban (Banjarmasin, Padang) dipaksa Suburban.

**Pipeline:** pakai **exactextract**, bukan rasterstats (menghitung fraksi piksel parsial, penting di batas provinsi, sekitar 40 kali lebih cepat). Langkah: `gdaldem slope` dari GMTED; `gdalwarp` semua raster ke EPSG:6933 pada 1 km; satu perintah `exactextract` untuk semua raster menghasilkan `terrain_stats.csv`. Runtime perkiraan **2 sampai 5 menit** untuk 2.000 poligon kali 5 raster di laptop. Unduhan ~6 GB sekali saja. Klasifikasi final adalah skrip Python 40 baris.

## 7. Ringkasan rekomendasi
1. **Jalankan `ogrinfo` count per `adm0_a3` sebelum apa pun**; ini menjawab UK, Prancis, Italia, Spanyol, DR Kongo, Norwegia, Aljazair, Vietnam sekaligus.
2. **Empat negara akan mengecewakan di NE 10m**: Vietnam, Aljazair, DR Kongo, Norwegia. Semua butuh sumber pengganti atau dissolve manual.
3. **1.472 (57 negara utama) + 528 (sisa dunia) = 2.000**; kompensasi +30 hot-zone dengan mengurangi provinsi tundra dan gurun.
4. **28 grup hot-zone split cukup**; separuh daftar tidak perlu geometri baru, hanya constraint jangan merge. Princely states India pakai flag.
5. **Rumus VP `round(1.72·log10(pop_max) − 6.0)` mereproduksi total VP Indonesia CoN persis (34)**; sediakan `vp_override`.
6. **Model laut HoI4 (~210 zona)** hybrid: 25 chokepoint manual + Voronoi pantai + H3 resolusi 1. Lewati IHO Sea Areas.
7. **Terrain stack 1 km (~6 GB), bukan WorldCover 10 m (117 GB)**; kerjakan di EPSG:6933 dengan exactextract; prioritas Urban di atas Mountains.

## Sumber
naturalearthdata.com (10m-admin-1-states-provinces, 10m-populated-places, 10m-physical-vectors) · github.com/nvkelso/natural-earth-vector (issue #54) · Wikipedia (Provinces_of_Vietnam, ISO_3166-2, Federal_subjects_of_Russia, List_of_administrative_divisions_by_country, Provinces_of_Algeria, Regions_of_Peru, Regions_of_Kazakhstan, Administrative_divisions_of_Myanmar) · esa-worldcover.org · gloh2o.org/koppen · hub.worldpop.org · human-settlement.emergency.copernicus.eu · marineregions.org
