# Riset: Kebijakan Batas Sengketa (Modern 2026)

> Sumber: riset sesi 5 (2026-09-05). Verifikasi lewat naturalearthdata.com, GitHub nvkelso/natural-earth-vector, Wikipedia. WebSearch tidak tersedia. Item bertanda [UNV] belum terverifikasi dan harus dicek lokal setelah data diunduh.
>
> **Keputusan Billy (D26): gunakan de facto saja.** `owner` diambil dari layer default Natural Earth tanpa varian point of view. Riset di bawah tetap disimpan lengkap karena memuat tabel sengketa, daftar entitas, dan mekanik klaim yang dipakai fase 1.

## 1. Representasi sengketa di Natural Earth

**Filosofi resmi:** de facto, bukan de jure. Kutipan halaman kebijakan: "We show who actually controls the situation on the ground because it turns out laws vary country to country." Halaman Admin-0 Details menambahkan: "Please feel free to mashup our countries and disputed areas themes to match your particular political outlook." Taiwan muncul sebagai negara terpisah; Palestina pada teks lama ditampilkan sebagai bagian Israel, tetapi sejak v4/v5 ada entitas Palestine di beberapa layer [UNV].

**Worldview:** sejak versi 5 (Desember 2021) tersedia 31 varian point of view (`arg, bdg, bra, chn, deu, egy, esp, fra, gbr, grc, idn, ind, isl, ita, jpn, kor, mar, nep, nld, pak, pol, prt, pse, rus, sau, swe, tur, twn, ukr, usa, vnm` plus varian ISO). Penting: **tidak perlu mengunduh 31 shapefile**; kolom keluarga `FCLASS_*` di file default sudah memuat klasifikasi tiap fitur per worldview (Admin-0 country, Unrecognized, Disputed, dan seterusnya). Karena D26 memakai de facto saja, kolom ini hanya disimpan sebagai metadata, tidak dipakai untuk toggle.

**Layer yang dipakai:**
| Layer | Isi | Kegunaan |
|---|---|---|
| `ne_10m_admin_0_countries` | Poligon de facto default | **Sumber `owner`** |
| `ne_10m_admin_0_disputed_areas` | Klaim de jure yang bertabrakan | Sumber `core_of[]` |
| `ne_10m_admin_0_breakaway_disputed_areas` | Entitas separatis | Sumber `recognition` rendah |
| `ne_10m_admin_0_sovereignty` | Level tertinggi, koloni digabung ke metropol | Isi `sovereign` |
| `ne_10m_admin_0_map_units` / `_map_subunits` | Bagian semi-independen dan non-kontigu | Opsional |
| `ne_10m_admin_0_antarctic_claims` | 7 klaim sektor | Zona khusus |
Field kunci: `SOVEREIGNT`, `ADMIN`, `ADM0_A3`, `GEOUNIT`, `SUBUNIT`, `ISO_A3`, `ISO_A3_EH`, `TYPE`, `FCLASS_*`. Daftar nilai `TYPE` (Country, Sovereign country, Dependency, Disputed, Indeterminate, Lease) belum terverifikasi dari sumber primer; README di GitHub 404.

**Admin-1:** berisi lebih dari 4.500 unit; varian standar 14,22 MB, `_scale_ranks` 12,83 MB, `_without_large_lakes` 14,36 MB, `_lines` 5,72 MB. **Pengecualian eksplisit:** "Antarctica, some disputed areas, tiny island nations, and principalities such as Monaco, Andorra, Liechtenstein, and San Marino" tidak punya unit Admin-1. Artinya sebagian wilayah sengketa harus dibuat manual dari layer `disputed_areas`.

**Verifikasi lokal yang wajib dijalankan setelah unduh:**
```
ogrinfo -al -so ne_10m_admin_0_countries.shp
ogr2ogr -f CSV /dev/stdout ne_10m_admin_0_countries.shp -dialect SQLite \
  -sql "SELECT DISTINCT TYPE FROM ne_10m_admin_0_countries"
ogr2ogr -f CSV /dev/stdout ne_10m_admin_1_states_provinces.shp -dialect SQLite \
  -sql "SELECT name, admin, adm0_a3, iso_3166_2, type_en FROM ne_10m_admin_1_states_provinces \
        WHERE adm0_a3 IN ('IND','PAK','CHN','UKR','RUS','MAR','TWN')"
```
Ekspektasi: Kashmir terpecah menjadi Jammu and Kashmir dan Ladakh di bawah IND, Azad Kashmir dan Gilgit-Baltistan di bawah PAK; Aksai Chin sering tanpa unit Admin-1; Krimea dua unit (Crimea dan Sevastopol) dengan `adm0_a3` yang harus dicek; Sahara Barat kemungkinan dikecualikan; Taiwan punya Admin-1 termasuk **Kinmen dan Matsu** yang menempel ke Fujian daratan.

**Pipeline yang direkomendasikan:** Admin-1 (geometri) → spatial join ke Admin-0 countries (isi `owner` dan `sovereign`) → spatial join ke disputed dan breakaway (isi `core_of[]` dan flag `contested`) → override manual dari tabel bagian 2.

## 2. Tabel sengketa Modern 2026 (47 kasus)

DF = pengendali de facto 2026. A1 = punya entitas Admin-1. Sens = sensitivitas (R rendah, S sedang, T tinggi).

| # | Wilayah | DF 2026 | Penuntut | A1 | `owner` | `core_of[]` | Perlakuan | Sens |
|---|---|---|---|---|---|---|---|---|
| 1 | Jammu & Kashmir | India (~55% bersama Ladakh) | IND, PAK, CHN | Ya | IND | IND, PAK | Provinsi + flag disputed | T |
| 2 | Ladakh | India (reorganisasi 2019) | IND, PAK, CHN | Ya | IND | IND, PAK, CHN | Provinsi | T |
| 3 | Azad Kashmir | Pakistan (~30% bersama GB) | PAK, IND | Ya | PAK | PAK, IND | Provinsi, `subject_type: autonomous` | T |
| 4 | Gilgit-Baltistan | Pakistan | PAK, IND | Ya | PAK | PAK, IND | Provinsi | T |
| 5 | Aksai Chin | China (~15% Kashmir) | CHN, IND | Kemungkinan tidak | CHN | CHN, IND | Geometri manual | T |
| 6 | Arunachal Pradesh | India | IND, CHN | Ya | IND | IND, CHN | Provinsi | T |
| 7 | Krimea dan Sevastopol | Rusia 100% (Des 2024) | UKR, RUS | Ya (2 unit) | RUS | UKR, RUS | `occupied` sejak 2014 | T |
| 8 | Luhansk | Rusia ~99% (Des 2024) | UKR, RUS | Ya | RUS | UKR, RUS | Split garis depan | T |
| 9 | Donetsk | Rusia ~72% (Des 2024) | UKR, RUS | Ya | Split | UKR, RUS | Sub-provinsi | T |
| 10 | Zaporizhzhia | Rusia ~74% (Des 2024) | UKR, RUS | Ya | Split | UKR, RUS | Split | T |
| 11 | Kherson | Rusia ~76%, kota Kherson di Ukraina | UKR, RUS | Ya | Split | UKR, RUS | Split di Dnipro | T |
| 12 | Transnistria | PMR de facto, 1.200 sampai 1.500 tentara Rusia | MDA, PMR | [UNV] | PMR | MDA, PMR | Negara, recognition 0 | S |
| 13 | Abkhazia | De facto sejak 1993 | GEO | [UNV] | ABK | GEO, ABK | Negara, recognition 4 | S |
| 14 | Ossetia Selatan | De facto sejak 2008 | GEO | [UNV] | RSO | GEO, RSO | Negara, recognition 4 | S |
| 15 | Nagorno-Karabakh | **Azerbaijan penuh sejak 20 Sep 2023; Artsakh bubar 1 Jan 2024** | AZE | Bagian AZE | AZE | AZE saja | **Jangan buat Artsakh** | T |
| 16 | Sahara Barat | Maroko ~70% (barat berm), Polisario ~30% | MAR, SADR | Kemungkinan tidak | MAR / SADR | MAR, SADR | Dua zona, barat `occupied` | T |
| 17 | Taiwan | ROC; 11 anggota PBB + Takhta Suci (Jan 2024) | ROC, PRC | Ya | TWN | TWN, CHN | Negara, recognition 11 | T |
| 18 | Kinmen dan Matsu | ROC | ROC, PRC | Ya | TWN | TWN, CHN | Provinsi terpisah, strategis | T |
| 19 | Spratly | VNM 29 fitur, PHL 8, MYS 5, CHN 5 + 7 pulau buatan, TWN 1 | 6 negara | Tidak | zona laut | | **Zona laut** `contested_by[]` | T |
| 20 | Paracel | RRC seluruhnya | CHN, VNM, TWN | Tidak | CHN | CHN, VNM, TWN | Provinsi laut kecil | T |
| 21 | Scarborough Shoal | RRC efektif; arbitrase 2016 menolak nine-dash line | CHN, PHL, TWN | Tidak | zona laut | | Zona laut | T |
| 22 | Senkaku | Jepang [UNV] | JPN, CHN, TWN | Tidak | JPN | JPN, CHN, TWN | Provinsi laut | T |
| 23 | Kuril Selatan | Rusia [UNV] | RUS, JPN | Ya (Sakhalin) | RUS | RUS, JPN | Provinsi | S |
| 24 | Dokdo | Korea Selatan [UNV] | KOR, JPN | Bagian Gyeongbuk | KOR | KOR, JPN | Gabung ke provinsi | T |
| 25 | Golan | Israel, aneksasi 1981; zona penyangga UNDOF sejak Des 2024 | ISR, SYR | [UNV] | ISR | SYR, ISR | `occupied` + buffer terpisah | T |
| 26 | Tepi Barat | Israel (Area C + keamanan B), PA di A/B | PSE, ISR | [UNV] | Split | PSE, ISR | A+B → PSE autonomous, C → ISR occupied | T |
| 27 | Gaza | **Gencatan senjata 10 Okt 2025 Yellow Line; Israel ~53% Okt 2025 naik ~70% Apr sampai Jul 2026; administrasi Hamas mundur 6 Jul 2026** | PSE, ISR | [UNV] | Split di Yellow Line | PSE | Barat → PSE transitional; timur → ISR occupied | T |
| 28 | Siprus Utara | De facto sejak 1974, diakui Turki saja | CYP, TRNC | [UNV] | TRNC | CYP, TRNC | Negara, recognition 1 | T |
| 29 | Kosovo | ~110 anggota PBB (19 Des 2025) | SRB, KOS | Ya | KOS | KOS, SRB | Negara, recognition 110 | T |
| 30 | Somaliland | De facto sejak 1991; **Israel mengakui 26 Des 2025**; SSC-Khatumo di timur | SOM, SOL | [UNV] | SOL | SOM, SOL | Negara recognition 1; SSC-Khatumo = provinsi contested | S |
| 31 | Gibraltar | Britania Raya | GBR, ESP | Tidak | GBR | GBR, ESP | `overseas_territory` | S |
| 32 | Falklands | Britania Raya [UNV] | GBR, ARG | Tidak | GBR | GBR, ARG | `overseas_territory` | T |
| 33 | Ceuta dan Melilla | Spanyol [UNV] | ESP, MAR | Ya | ESP | ESP, MAR | Provinsi enklave | S |
| 34 | Hala'ib | Mesir sejak 1994 sampai 2000 | EGY, SDN | [UNV] | EGY | EGY, SDN | Provinsi disputed | R |
| 35 | Bir Tawil | **Terra nullius, tidak diklaim siapa pun** | tidak ada | Tidak | `null` | kosong | Provinsi tak bertuan | R |
| 36 | Abyei | Sudan de facto sejak Mei 2011, UNISFA | SDN, SSD | Tidak | SDN | SDN, SSD | Flag `un_administered` | S |
| 37 | Chagos / BIOT | **Britania Raya; traktat 22 Mei 2025 belum diratifikasi, Apr 2026 gagal disetujui parlemen** | GBR, MUS | Tidak | GBR | GBR, MUS | `overseas_territory`; Diego Garcia sewa | S |
| 38 | Guyana Esequiba | **Guyana de facto**; Venezuela hanya Pulau Ankoko; ICJ 1 Des 2023 | GUY, VEN | Ya | GUY | GUY, VEN | Provinsi GUY + core VEN | T |
| 39 | Belize | Belize | BLZ, GTM | Ya | BLZ | BLZ, GTM | Provinsi + core GTM | S |
| 40 | Ambalat | Laut Sulawesi; Sipadan-Ligitan ke Malaysia (ICJ 2002) | IDN, MYS | Tidak | zona laut | | Zona laut `contested_by` | S |
| 41 | Laut Natuna Utara | Indonesia; nine-dash line tumpang tindih ZEE | IDN vs klaim CHN | Ya (Kep. Riau) | IDN | IDN | Provinsi + zona laut contested | T |
| 42 | Hong Kong | RRC SAR | CHN | Ya | CHN | CHN | `subject_type: sar` | S |
| 43 | Makau | RRC SAR | CHN | Ya | CHN | CHN | `subject_type: sar` | R |
| 44 | Antarktika | **7 klaim (ARG, AUS, CHL, FRA, NZL, NOR, GBR); Marie Byrd Land tak diklaim** | 7 negara | **Tidak ada** | `null` | 7 penuntut | Zona non-playable, `treaty_frozen` | R |
| 45 | Svalbard | Norwegia berdaulat [UNV] | NOR | [UNV] | NOR | NOR | Provinsi + flag demilitarized | R |
| 46 | Papua dan Papua Barat | Indonesia, **bukan sengketa antarnegara** | IDN | Ya (6 provinsi) | IDN | IDN | Provinsi normal | T domestik |
| 47 | Akrotiri dan Dhekelia | Britania Raya (Sovereign Base Areas) [UNV] | GBR | Tidak | GBR | GBR, CYP | `subject_type: military_lease` | R |

**Catatan Papua:** tidak ada negara lain yang mengklaim, jadi diperlakukan sebagai provinsi Indonesia biasa sesuai de facto. Yang dihindari: menambahkan "West Papua" sebagai negara playable. Prinsip yang sama berlaku untuk Xinjiang, Tibet, Catalunya, Kurdistan, Balochistan, Chechnya: kalau tidak ada entitas de facto yang mengontrol wilayah, jangan buat negara; cukup mekanik `separatism` di level provinsi.

**Catatan Ukraina:** persentase per oblast bertanggal Desember 2024. Yang terverifikasi untuk 2026: counteroffensive Ukraina dimulai 11 Feb 2026 dan masih berlangsung per Agustus 2026 di tiga front; Syrskyi menyebut 600 km2 direbut kembali per 8 Jun 2026, Zelenskyy menyebut 745 km2 dan 26 permukiman per Agustus 2026. Tidak ada gencatan senjata per Agustus 2026. **Garis depan bergerak, jangan di-hardcode**: simpan `front_line_2026.geojson` terpisah dengan field `as_of`.

## 3. Cara game lain memperlakukan sengketa
**Paradox** adalah model kanonik: `owner` (pengendali) dipisah dari `controller` (pendudukan sementara saat perang), plus `cores` (klaim permanen yang meluruh) dan `claims` (klaim sementara pemberi casus belli murah); HoI4 menambah `subject` berjenjang; wilayah tak bertuan memakai unclaimed (berguna untuk Bir Tawil dan Antarktika). **Age of History 3**, **Realpolitiks**, **SuperPower 2** [UNV]: granularitas lebih kasar atau tanpa sistem klaim; nilai referensi rendah. **Kebijakan platform** [UNV]: tidak relevan untuk pemakaian pribadi, tetapi arsitekturnya sudah aman karena data peta dipisah dari kode sebagai JSON eksternal.

## 4. Rekomendasi kebijakan (disesuaikan dengan D26)
**(a) `owner` = de facto Natural Earth** tanpa varian POV. Override manual hanya untuk 47 baris di tabel bagian 2. Kolom `FCLASS_*` tetap disimpan sebagai metadata untuk keperluan masa depan, tidak dipakai di v1.

**(b) `core_of[]` sebagai mekanik gameplay** (bukan kebijakan batas): setiap penuntut yang tercatat di `disputed_areas` masuk `core_of[]`, termasuk pengendali de facto. Efek: punya core memberi casus belli otomatis; merebut provinsi yang jadi core sendiri tidak menambah infamy; merebut yang bukan core kena infamy penuh; core yang tidak dikuasai lebih dari N tahun meluruh menjadi klaim biasa. Ini yang membuat India bisa menyerbu Azad Kashmir dengan murah tetapi tidak Punjab. **Status: menunggu konfirmasi Billy** apakah mekanik klaim ini dipakai atau cukup de facto polos.

**(c) Entitas de facto → negara terpisah dengan `recognition`** berupa jumlah anggota PBB yang mengakui: Palestina 157, Kosovo 110, SADR 46, Taiwan 11, Abkhazia 4, Ossetia Selatan 4, Siprus Utara 1, Somaliland 1 (Israel, 26 Des 2025), Transnistria 0. Recognition menentukan akses diplomatik, biaya perdagangan, kelayakan aliansi, dan keanggotaan organisasi. `subject_type` protektorat: Abkhazia, Ossetia Selatan, Transnistria di bawah Rusia; Siprus Utara di bawah Turki.

**(d) Pendudukan aktif** → `owner` pengendali, `sovereign` pemilik sah, `status: occupied`, `occupied_since`. Provinsi occupied memberi pajak dan manpower berkurang, menaikkan unrest, dan menimbulkan penalti opini internasional berkelanjutan. Berlaku untuk Krimea dan oblast timur, Golan, Tepi Barat Area C, Gaza timur Yellow Line, Sahara Barat barat berm, Siprus Utara.

**(e) Zona laut sengketa** sebagai tipe entitas kedua:
```json
{ "id": "sea_spratly", "type": "maritime_zone", "name": "Kepulauan Spratly",
  "contested_by": ["CHN","TWN","VNM","PHL","MYS","BRN"],
  "occupied_features": { "VNM": 29, "PHL": 8, "MYS": 5, "CHN": 5, "TWN": 1 },
  "resources": ["oil","gas","fisheries"], "escalation_risk": 0.85 }
```
Pola sama untuk Scarborough, Ambalat, Natuna Utara, Senkaku, Aegea. Kontrol zona memberi ZEE dan sumber daya tetapi memicu insiden tanpa perang total.

**(f) Toggle POV: tidak dipakai** (D26). Disclaimer satu paragraf tetap ditampilkan di layar scenario: batas mengikuti Natural Earth de facto dan tidak mencerminkan posisi hukum.

**(g) Interaksi Historical PD1 dan PD2:** skema `owner`/`sovereign`/`core_of[]` sama, hanya nilainya berbeda. `subject_type` jauh lebih penting (koloni, protektorat, dominion, mandat Liga Bangsa-Bangsa, condominium seperti Sudan Anglo-Mesir dan New Hebrides), jadi enum harus dirancang sekarang. `core_of[]` menjadi mesin naratif: Alsace-Lorraine core Prancis di tangan Jerman (1914), Sudetenland dan Koridor Danzig (1939). Geometri Admin-1 modern dipakai sebagai atom dan provinsi historis didefinisikan sebagai grup atom; yang tidak akurat adalah Prusia Timur, Silesia, dan perbatasan Polandia (perlu geometri manual).

**Contoh `political.json`** (ringkas):
```json
{ "schema_version": "1.0", "scenario": "modern_2026", "as_of": "2026-09-05",
  "map_source": { "admin0": "ne_10m_admin_0_countries v5.x", "worldview": "de_facto_default" },
  "provinces": [
    { "id": "UKR_crimea", "name": "Crimea", "owner": "RUS", "sovereign": "UKR",
      "status": "occupied", "occupied_since": "2014-03-18", "core_of": ["UKR","RUS"],
      "core_primary": "UKR", "contested": true, "unrest_base": 3 },
    { "id": "TWN_kinmen", "name": "Kinmen", "owner": "TWN", "sovereign": "TWN",
      "core_of": ["TWN","CHN"], "contested": true, "strategic": true,
      "adjacency_override": ["CHN_fujian_xiamen"] },
    { "id": "CHN_aksai_chin", "name": "Aksai Chin", "owner": "CHN", "sovereign": "CHN",
      "core_of": ["CHN","IND"], "contested": true, "manual_geometry": true }
  ] }
```

## 5. Daftar entitas Admin-0 untuk `nations.json` (~250 entri)
**A.** 193 anggota PBB, playable. **B.** 2 pengamat: Palestina (playable) dan Takhta Suci (non-playable). **C.** 8 negara de facto non-PBB: Taiwan, Kosovo, Siprus Utara, Somaliland, Abkhazia, Ossetia Selatan, Transnistria, SADR. **Artsakh tidak dimasukkan** (bubar 1 Jan 2024). **D.** Asosiasi bebas: Kepulauan Cook, Niue. **E.** ~45 dependensi non-playable lewat `subject_type`.

**Butuh keputusan manual (14 kasus):** Palestina satu entitas atau dua (rekomendasi: satu dengan provinsi terpecah, karena Gaza masih transisi per Agustus 2026); SADR sebagai negara (rekomendasi ya, menguasai Free Zone); SSC-Khatumo sebagai provinsi contested bukan negara; Chagos tetap GBR dengan event ratifikasi; Antarktika tipe entitas khusus; Bir Tawil `owner: null` butuh dukungan engine; Kepulauan Cook dan Niue playable atau tidak; geometri manual Sahara Barat dan Aksai Chin; empat oblast Ukraina terpecah butuh Admin-2 atau pemotongan geometri; Gaza terpecah di Yellow Line; Golan plus zona penyangga UNDOF; Akrotiri dan Dhekelia sebagai preseden `military_lease` (berguna untuk Diego Garcia dan Guantanamo); Hong Kong dan Makau sebagai SAR.

## Sumber
naturalearthdata.com (disputed-boundaries-policy, 10m-admin-0-countries, 10m-admin-0-details, 10m-admin-1-states-provinces) · github.com/nvkelso/natural-earth-vector/tree/master/10m_cultural · Wikipedia: Russian-occupied_territories_of_Ukraine, 2026_Ukrainian_counteroffensive, Gaza_war, Israeli-occupied_territories, Chagos_Archipelago_sovereignty_dispute, Nagorno-Karabakh_conflict, List_of_states_with_limited_recognition, International_recognition_of_Kosovo, Somaliland, Western_Sahara, Transnistria, Abyei, Hala'ib_Triangle, Kashmir_conflict, Territorial_disputes_in_the_South_China_Sea, Guayana_Esequiba, Foreign_relations_of_Taiwan, Antarctic_Treaty_System, List_of_territorial_disputes · Gagal: README NE (404), Steam Age of History 3, Realpolitiks, SuperPower 2, kebijakan platform, Svalbard, Senkaku/Kuril/Dokdo.
