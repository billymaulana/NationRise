# Riset: Warna Pemilik di Peta (P33) dan Cakupan Modding (P37)

> Riset sesi 5 (2026-09-05). Verifikasi lewat Wikipedia, wiki Paradox, dokumentasi resmi (W3C, JSON Schema, Ajv, Factorio Lua API), GitHub. WebSearch tidak tersedia. [UNV] = belum terverifikasi.

# Bagian 1: P33 Sistem warna pemilik

## 1.1 Preseden
| Game | Sumber warna | Format | Catatan |
|---|---|---|---|
| EU4 | per tag, ditulis desainer | `color = { R G B }` di `common/countries/*.txt` | 390+ tag, plus tag dinamis colonial dan client state |
| **HoI4** | satu file terpusat | `color = rgb {}` atau `hsv {}`, plus `color_ui` | **Engine mengalikan saturation kali 0,6 dan value kali 0,8 sebelum render peta.** Nilai di atas 1 diperbolehkan untuk kompensasi |
| **Victoria 3** | per tag + lapisan dinamis | `hsv360{}`, `common/dynamic_country_map_colors`, `named_colors` | Punya **dynamic map colors** berbasis kondisi: "the first dynamic color which returns true is used" |
| **CK3** | palet bernama terpusat | `common/named_colors` dengan `hex{}`, `hsv360{}` | Model paling matang: indirection lewat nama, bukan literal RGB tersebar |
| Civ VI | tabel PlayerColors, pasangan primary dan secondary | XML/SQL | Jumlah pasangan terbatas dan sering bentrok [UNV, fandom 402] |
| AoH2/AoH3, Ages of Conflict, S1914, CoN | per scenario atau color picker bebas | | [UNV] |

**Tiga pola yang diadopsi:** (1) **CK3 named_colors**, jangan sebar literal RGB; definisikan palet bernama sekali dan negara mereferensikan nama, sehingga ganti tema dan mode buta warna menjadi satu operasi swap tabel bukan edit 195 file. (2) **Vic3 dynamic map colors**, warna peta adalah fungsi dari state bukan konstanta; **warna identitas dan warna fill peta adalah dua hal berbeda**. (3) **HoI4 peredaman saturasi**, bukti empiris bahwa warna yang enak di UI hampir selalu terlalu jenuh untuk area besar di peta.

**Berapa warna yang benar-benar dibutuhkan sekaligus?** Jauh lebih kecil dari 195. Pada zoom regional biasanya 8 sampai 25 negara terlihat bersamaan; pada zoom dunia di 2560x1600, negara yang punya luas piksel cukup untuk dibedakan warnanya jarang melebihi 60 sampai 80, sisanya micro-state yang butuh label dan outline bukan fill. **Kesimpulan: tidak perlu 195 warna unik, perlu 195 warna yang dijamin unik secara lokal.**

## 1.2 Teori dan angka terverifikasi
| Metrik | Nilai | Sumber |
|---|---|---|
| JND CIE76 | ΔE*ab sekitar **2,3** | Wikipedia Color difference |
| JND CIE94 dan CIEDE2000 | dirancang agar **1,0 = 1 JND** | idem |
| Batas kelas choropleth memakai value saja | "difficult to practically use more than **seven** classes" | Wikipedia Choropleth map |
| Batas dengan hue plus saturation | "as many as **10-12** classes" | idem |
| Rekomendasi Paul Tol | "no more than **nine** distinct colours" | SRON |
| ColorBrewer qualitative | Set1 9, Set2 8, **Set3 12**, **Paired 12**, Dark2 8 | colorbrewer.js |
| distinctipy | colormap kualitatif umum "no more than 20 colours" | GitHub |
**Konsensus: 8 sampai 12 adalah batas praktis palet kualitatif**, terkonfirmasi dari dua arah independen.

**Ruang warna: pakai OKLCH.** CIELAB punya cacat pergeseran hue pada biru. **Oklab dan OKLCH** (Ottosson, Des 2020, masuk draf CSS Color Level 4 sejak Des 2021) dibangun dari CAM16 dan IPT sehingga "eliminates unexpected hue and lightness changes in blue colors". Rekomendasi: **OKLCH sebagai ruang authoring** (L, C, h mudah dibaca manusia) dan **ΔE2000 sebagai metrik pengukuran** untuk gate otomatis karena punya literatur JND yang bisa dikutip.

**Pembangkit palet:** **Glasbey** (CAM02-UCS, farthest point sampling, punya **block palettes** untuk kategori hierarkis dan bisa extend palet yang di-seed warna brand); distinctipy (`get_colors(N, colorblind_type="Deuteranomaly")`); iwanthue (k-means atau force vector, preset improve for the colorblind); ColorBrewer dan Paul Tol (kurasi manusia, semua skema utama Tol dinyatakan colour-blind safe). **Fitur Glasbey block palettes paling penting** karena persis struktur "keluarga hue per blok, varian per negara" yang dibutuhkan.

**Budget ΔE yang diusulkan** (rekomendasi rekayasa dengan anchor JND, faktor pengali adalah penilaian):
| Relasi | ΔE00 sRGB normal | ΔE00 setelah simulasi deuteranopia |
|---|---|---|
| Bertetangga langsung | **≥ 25** | ≥ 18 |
| Jarak 2 di graph | ≥ 15 | ≥ 12 |
| Global minimum antar slot | ≥ 8 | ≥ 6 |
| Fill versus warna border | rasio kontras WCAG ≥ 3:1 | idem |
Plus aturan OKLCH yang mudah di-enforce: dua negara bertetangga harus memenuhi **ΔL ≥ 0,10 ATAU Δh ≥ 30 derajat dengan kedua C ≥ 0,06**, memastikan pasangan tidak pernah hanya berbeda pada sumbu yang runtuh di mata penderita CVD.

## 1.3 Buta warna
**Prevalensi (populasi keturunan Eropa Utara):** deuteranomaly pria **5,0%** wanita 0,35%; deuteranopia 1,2% dan 0,01%; protanomaly 1,3%; protanopia 1,3%; tritanopia 0,008%; **total merah-hijau sekitar 8% pria** dan 0,4 sampai 0,5% wanita. Wikipedia: "at a minimum, the design should be tested for deutan CVD, the most common kind". **Deuteranomaly sendiri lebih besar dari semua tipe lain digabung**, jadi bila hanya ada anggaran satu mode aksesibilitas, jadikan mode deutan.

**Simulasi: Machado 2009 plus Viénot 1999.** Brettel 1997 memakai dua setengah bidang; Viénot menyederhanakannya menjadi **satu perkalian matriks tunggal** (ideal untuk shader); **Machado 2009** menambah tahap opponent-color dan menyediakan matriks 3x3 terparameterisasi **severity 0,0 sampai 1,0**. Matriks severity 1,0 siap pakai:
```
Protanopia:                    Deuteranopia:                  Tritanopia:
 0.152286  1.052583 -0.204868   0.367322  0.860646 -0.227968   1.255528 -0.076749 -0.178779
 0.114503  0.786281  0.099216   0.280085  0.672501  0.047413  -0.078411  0.930809  0.147602
-0.003882 -0.048116  1.051998  -0.011820  0.042940  0.968881   0.004733  0.691367  0.303900
```
**Peringatan kritis dari DaltonLens yang sering dilewatkan:** matriks ini bekerja di **linear RGB, bukan sRGB**. "Forgetting the sRGB to linearRGB transform makes a big difference and it can invalidate perceptual experiments." Menerapkan matriks langsung pada sRGB 0 sampai 255 membuat hasil simulasi salah dan gate CI memberi rasa aman palsu. Alat manual: **Color Oracle** (filter layar penuh, praktis untuk menguji game yang berjalan) dan Coblis (screenshot lepas).

**Kenapa warna saja tidak cukup:** WCAG 2.2 SC 1.4.11 mewajibkan **rasio kontras minimal 3:1** untuk graphical objects, rasio **tidak boleh dibulatkan** (2,999:1 tidak lolos), dan evaluasi memakai warna dari CSS bukan hasil render (anti-aliasing menurunkan kontras semu). Peta politik jelas termasuk graphical object, jadi border adalah **kanal redundansi wajib**, bersama pola arsiran (koalisi dan okupasi), ketebalan border berjenjang, label dengan halo, dan ikon.

## 1.4 Masalah inti: 195 pemilik jauh melebihi palet aman
**Four color theorem tidak berlaku langsung.** Teorema butuh graph planar **dan setiap region kontigu**. Wikipedia eksplisit: bila seluruh wilayah satu negara harus satu warna, "four colors are not always sufficient", contohnya Alaska. Peta dunia penuh eksklave (Kaliningrad, Alaska, Nakhchivan, koloni seberang laut). **Greedy coloring** waktu linear terhadap jumlah edge dengan batas atas degeneracy plus 1 memakai urutan smallest-last, yang menurut Wikipedia "often yields better results than largest-degree-first". Graph ketetanggaan negara punya derajat rata-rata 3 sampai 6 dan maksimum sekitar 14, realistis menghasilkan **5 sampai 7 kelas**. **Tetapi 5 sampai 7 warna untuk 195 negara adalah desain buruk untuk game**: pemain butuh mengenali Prancis sebagai biru itu lintas sesi, dan pewarnaan graph murni menghapus identitas.

**Solusi: pewarnaan graph pada G kuadrat, bukan G.** Jamin keterbedaan hanya untuk jarak graph maksimal 2, yaitu semua negara yang realistis terlihat bersamaan di satu viewport. Greedy smallest-last pada G kuadrat realistis butuh **15 sampai 25 kelas**, di atas batas palet aman, dan di sinilah struktur dua tingkat masuk.

**Arsitektur tiga lapis:**
```
identityColor  (era pack, dari bendera)  → bendera, panel diplomasi, ikon, grafik
paletteSlot    (graph coloring pada G², build time) = (hueFamily, variantIndex)
mapColor       (runtime = anchor slot + nudge terbatas ke identityColor) → DataTexture
```
**8 hue family** (dari Glasbey atau di-seed Tol muted yang sudah CB-safe) kali **3 varian lightness** = **24 anchor slot**. **Nudge identitas** maksimal hue ±12 derajat dan chroma ±0,02 ke arah identityColor, memberi "Prancis condong biru" tanpa melanggar budget ΔE. **Dua slot cadangan**: negara pemain (warna tetap) dan unclaimed (abu netral). **Warna dari bendera dengan penyesuaian luminance**: ekstrak warna dominan, konversi ke OKLCH, paksa L ke nilai slot, clamp C, pertahankan h. Ini semangat transformasi HoI4 tetapi di ruang perseptual sehingga konsisten lintas hue (versi HSV HoI4 mendegradasi kuning dan biru berbeda).

**Koalisi:** block palette ala Glasbey, satu keluarga hue per blok, varian dibedakan lewat L dan C. Memberi pembacaan strategis satu kilasan ("blok merah sedang menang") yang tidak bisa diberikan pewarnaan acak. Prioritas konflik: **blok menang di atas jarak 2, tetapi tidak di atas jarak 1**; dua anggota blok sama yang bertetangga wajib beda varian L minimal 0,10.

## 1.5 Rekomendasi konkret
**Algoritma build time:** bangun graph provinsi lalu collapse by owner (2.000 menjadi ~195 node), kuadratkan graph, urutkan smallest-last (waktu linear), greedy coloring dengan kandidat slot diurutkan berdasarkan blok negara dan slot cadangan direservasi, lalu materialisasi warna dengan clamp nudge. **Gate yang menggagalkan build:** ΔE2000 tetangga ≥ 25, jarak 2 ≥ 15, dan setelah Machado severity 1,0 untuk protan/deutan/tritan ≥ 18.
**Runtime:** jangan jalankan ulang seluruh graph coloring saat kepemilikan berubah. Simpan slot hasil build sebagai nilai stabil per negara dan jalankan **repair lokal**: bila A menganeksasi hingga berbatasan dengan B yang sewarna, cari slot alternatif untuk negara **dengan luas lebih kecil**, animasikan transisi 400 ms, batasi maksimal 1 sampai 2 negara per event.

**Integrasi dengan ID map:** pecah LUT menjadi tiga tekstur. `provinceIdMap` (RGBA8 atau R16UI, resolusi peta, ID provinsi); **`lutColor`** (RGBA8 DataTexture 64x32 = 2048 texel, RGB warna final plus alpha flag occupied dan sieged); **`lutScalar`** (RG8 2048 texel, R nilai skalar 0 sampai 1 untuk map mode kontinu, G pattern id); **`rampTex`** (RGBA8 256xN, N ramp sequential dan diverging sebagai baris). Map mode kontinu cukup `texture2D(rampTex, vec2(scalar, rampIndex))`; ganti map mode = ganti satu uniform plus tulis ulang lutScalar (2 KB); update saat aneksasi = tulis 4 byte. Border digambar screen-space dari provinceIdMap: ID beda menjadi border provinsi tipis, owner beda menjadi border negara tebal. Arsiran koalisi: `fract(dot(gl_FragCoord.xy, vec2(0.707)) * FREQ)` di-gate pattern id.

**Palet per map mode:** Political qualitative 24 slot; Terrain palet hypsometric tetap; **Morale dan stability diverging RdBu atau PuOr, hindari RdYlGn** (musuh deutan); Supply sequential YlGnBu atau viridis; Development sequential single-hue; Resource **Paul Tol bright** 7 warna CB-safe (`#4477AA #EE6677 #228833 #CCBB44 #66CCEE #AA3377 #BBBBBB`); Front bipolar biru versus oranye plus netral. Prinsip Wikipedia: "any order in the variable should be reflected in the perceived order of the colors", jadi mode sequential **jangan pernah** memakai varian hue, pakai monoton L di OKLCH. Semua ramp didefinisikan di era pack JSON sebagai daftar stop OKLCH dan di-bake ke tekstur 256x1 saat load, sehingga bisa dimod.

**Mode buta warna:** empat preset (off, deutan, protan, tritan) diimplementasikan sebagai **palet alternatif hasil build**, bukan filter post-process (filter mensimulasikan CVD, bukan mengompensasi). Constraint tambahan: hue family turun dari 8 ke **5** terkonsentrasi pada sumbu biru dan kuning yang tetap terpisah pada deutan dan protan; varian lightness naik dari 3 ke **5** karena lightness adalah kanal yang selamat pada semua tipe CVD; gate ΔE dijalankan di ruang tersimulasi; border negara +50% tebal dan arsiran koalisi aktif default.

**Cara mengetes (skrip `pnpm test:colors` di CI):** render offscreen pada 6 kamera kanonik (Eropa, Asia Timur, Amerika, Afrika, Timur Tengah, dunia penuh) di 2560x1600; terapkan matriks Machado di **linear RGB**; untuk tiap pasangan negara bertetangga yang terlihat di frame, sampel fill rata-rata dan hitung ΔE00; gagalkan build bila ada di bawah ambang dan keluarkan **laporan 10 pasangan terburuk dengan crop gambar**; simpan screenshot baseline untuk regresi visual.

# Bagian 2: P37 Cakupan modding v1

## 2.1 Preseden
| Game | Model | Sandbox | Versioning | Beban dukungan |
|---|---|---|---|---|
| Paradox | file teks menimpa seluruh file + skrip deklaratif | tidak perlu (bukan Turing-complete) | `.mod` dengan supported_version, dependencies, replace_path | Sedang; konflik whole-file replacement adalah keluhan paling umum |
| Civ VI | XML + SQL + Lua, manifest `.modinfo` | tidak | per versi | Tinggi [UNV] |
| RimWorld | XML Defs + PatchOperation + assembly C# | tidak (C# = kode arbitrer) | About.xml dengan supportedVersions, modDependencies, loadAfter | Sangat tinggi [UNV] |
| **Factorio** | Lua 5.2.1 terkurung, dua tahap | **ya, ketat** (deterministik demi multiplayer) | `info.json` dengan dependencies berprefix `!` `?` `+` `~` dan operator versi | **Model terbaik dari sisi rekayasa** |
| **Minecraft datapack** | data murni | N/A | `pack.mcmeta` dengan pack_format, min_format, max_format | **Sangat rendah** |
| Minecraft Forge/Fabric, tModLoader | kode arbitrer | tidak | sering pecah; tModLoader punya MigrationGuide dan PortingNotes sebagai bukti | Tinggi |

**Detail Minecraft datapack yang paling instruktif:** "if a file exists in multiple data packs only the file in the last data pack is used", tetapi **file tag digabung** kecuali ditandai `"replace": true`, dan sejak 22w11a datapack bisa memasang **filter** yang memblokir file dari pack yang dimuat lebih awal. Ini model resolusi konflik matang: **last-wins untuk file utuh, merge untuk koleksi, filter eksplisit untuk penghapusan.**

**Data-only versus scripting:** data-only punya permukaan serangan hanya parser dan path handling, kompatibilitas versi bisa dicek mesin lewat schema dan migrasi otomatis, dan error berupa pesan validator baris-kolom. Scripting memberi ekspresivitas tinggi tetapi eksekusi kode arbitrer, tidak bisa dicek versinya sehingga pecah diam-diam, dan error berupa stack trace di dalam game loop pemain.

## 2.2 Rekomendasi v1: data-only plus trigger deklaratif
**Verdict: jangan pasang scripting engine di v1.** Alasan yang menentukan bukan keamanan (game offline pribadi) melainkan **beban pemeliharaan**: begitu mod bisa menjalankan kode, setiap refactor internal menjadi breaking change yang tidak bisa dideteksi mesin. Tetapi data murni terlalu miskin untuk event, sehingga jalan tengahnya adalah **DSL trigger dan effect deklaratif sebagai JSON dengan kosakata opcode tertutup (enum di schema)**:
```json
{ "id": "evt.suez_crisis",
  "trigger": { "all": [
    { "op": "date_after", "value": "1956-07-26" },
    { "op": "nation_controls", "nation": "$ROOT", "province": "prov.suez" },
    { "op": "opinion_below", "from": "GBR", "to": "$ROOT", "value": -30 } ] },
  "effect": [
    { "op": "add_modifier", "target": "$ROOT", "modifier": "mod.crisis", "months": 24 },
    { "op": "change_stability", "target": "$ROOT", "value": -2 } ] }
```
`op` adalah enum dalam JSON Schema sehingga Ajv menolak opcode tak dikenal, dan interpreter adalah `switch` eksplisit. Tanpa eval, tanpa Turing-completeness, tanpa loop tak berujung. **Sekitar 80% kegunaan scripting dengan 5% risikonya.**

**Lima lubang non-VM yang tetap harus ditutup:** (1) **prototype pollution**, `JSON.parse` pada file mod berisi `__proto__` bisa mencemari `Object.prototype`; gunakan reviver yang membuang `__proto__`, `constructor`, `prototype`, atau simpan ke `Object.create(null)`. (2) **Path traversal**, tolak path mengandung `..` atau absolut. (3) **SVG dengan tag script**, render bendera mod lewat `<img src>` atau background-image yang memblokir script, jangan inline ke DOM. (4) **String i18n**, jangan pernah `v-html`. (5) **Zip bomb**, batasi jumlah file, ukuran per file, dan total.

**Catatan Ajv:** Ajv mengompilasi schema menjadi fungsi JS lewat codegen, aman selama **schema dimiliki game bukan mod**. Jangan pernah izinkan mod mengirim JSON Schema sendiri. Untuk startup lebih cepat dan kompatibilitas CSP, **precompile schema saat build** dengan `ajv/standalone` sehingga tidak ada codegen runtime. Rekomendasi draft-2020-12 (punya `$dynamicRef`) atau draft-07 bila prioritasnya kecepatan; jangan campur versi dalam satu instance.

**Versioning:** `$schema` wajib di root dan URI kustom memakai domain sendiri. Manifest punya `schemaVersion` tunggal, dan tiap tipe entity punya versinya sendiri (`contentSchemaVersions: { nation: 2, unit: 3 }`) mirip pack_format Minecraft tetapi granular per tipe, sehingga menambah field ke unit tidak memaksa semua mod nation di-update. Registry migrasi per tipe dijalankan **di memori**, tidak pernah menulis ulang file mod pemain. Versi lebih besar dari yang dikenal menghasilkan error "butuh Nation Rise lebih baru", bukan crash.

## 2.3 Bila kelak ingin scripting
| Opsi | Ukuran | Isolasi | Performa | Verdict |
|---|---|---|---|---|
| **QuickJS** (quickjs-emscripten) | ~500 KB sync, setup minimal 1,3 MB | **Terbaik**: `setMemoryLimit`, `setMaxStackSize`, `setInterruptHandler`, `shouldInterruptAfterDeadline`; mendukung sebagian besar ES2023 | asyncify lebih lambat | **Pilihan v3** |
| wasmoon (Lua 5.4 WASM) | 393 kB, 130 kB gzip | dokumentasi tidak menjelaskan sandbox | heap sort 15,3 ms | Bagus bila mau Lua |
| Fengari (Lua di JS) | 214 kB, 69 kB gzip | sama | heap sort **390 ms**, 25 kali lebih lambat | Hindari untuk simulasi |
| **JSONLogic** | satu file | aturan adalah **data murni** | sangat cepat | **Pilihan v2** untuk formula numerik |
| expr-eval | kecil | variabel di-whitelist | cepat | Alternatif, sintaks lebih enak dibaca modder |
| **eval / new Function** | 0 | **tidak ada**: realm sama, akses penuh prototype chain dan globalThis; tidak bisa dibatasi memori atau diinterupsi, loop tak berujung membekukan render loop three.js permanen; diblokir CSP | | **Tidak pernah** |
Roadmap: **v1 data plus trigger deklaratif, v2 expr-eval atau JSONLogic untuk formula numerik dengan batas iterasi, v3 QuickJS dengan host API eksplisit dan memory limit dan deadline interrupt** (keluaran skrip tetap divalidasi Ajv sebagai data tak terpercaya).

## 2.4 Rekomendasi konkret v1
**Boleh dimod:** era pack (tanggal, kurva teknologi, event pool), unit (stat, biaya, prasyarat, ikon), bangunan, riset, resource, nations (tag, nama, bendera, identityColor, blok, provinsi awal), difficulty (angka), warna dan map mode (named_colors, ramp OKLCH, definisi map mode), i18n, event dan keputusan (trigger dan effect dari kosakata opcode).
**Tidak boleh dimod di v1:** aturan resolusi tempur inti, formula ekonomi tick, pathfinding, format save, renderer dan shader, geometri provinsi (butuh regenerasi ID map, tunda ke v2 dengan build step), kode apa pun, JSON Schema.

**Struktur folder:** `mods/load-order.json` plus per mod `mod.json`, `content/{nations,units,buildings,technologies,resources,events,difficulty,colors,mapmodes}/*.json`, `patches/*.patch.json`, `locale/{en,id}.json`, `assets/{flags,icons}/`.

**Manifest** memuat `$schema`, `manifestVersion`, `id` (reverse-DNS), `name`, `version`, `authors`, `license`, `gameVersion` (rentang semver `>=0.8.0 <0.10.0`), `contentSchemaVersions` per tipe, `dependencies` dengan `kind` required atau optional, `incompatibleWith` dengan `reason`, `loadAfter`, `loadBefore`, `capabilities`, `entrypoints` (glob), dan `contentHash`. Rentang versi memakai sintaks semver karena lebih familier bagi ekosistem TypeScript, semantiknya sama dengan operator Factorio.

**Tiga mode merge eksplisit** (hindari deep-merge implisit yang ambigu untuk array): **`define`** entity baru dan error bila id sudah ada; **`replace`** override penuh (model Paradox dan Minecraft last-wins); **`patch`** daftar operasi RFC 6902 JSON Pointer (`add`, `replace`, `remove`) plus dua ekstensi `append` (push ke array) dan `removeWhere` (filter by predicate), padanan PatchOperation RimWorld dan tag-merge Minecraft.
**Aturan konflik:** dua mod `replace` entity sama tanpa relasi loadAfter menjadi **ERROR**; dengan loadAfter menjadi WARN dan yang belakangan menang; dua `patch` pada JSON Pointer sama menjadi WARN; `patch` pada entity yang dihapus mod lain menjadi ERROR dengan saran menambahkan ke incompatibleWith atau dependencies.

**Urutan muat:** topological sort atas gabungan dependencies, loadAfter, dan invers loadBefore; tie-break memakai `load-order.json` lalu id leksikografis (**determinisme wajib**, hasil merge harus reproducible); siklus menghasilkan error yang **mencetak siklusnya** (`A → B → C → A`), bukan sekadar "cycle detected".

**Checksum save:** save menyimpan daftar mod dengan id, version, contentHash, plus `contentChecksum` (hash graph konten hasil merge setelah normalisasi urutan kunci). Aturan: mod hilang menawarkan muat tanpa mod dengan entity diganti placeholder bukan crash; versi beda dengan migrasi tersedia dijalankan dan ditandai migrated; contentHash beda memberi WARN; contentChecksum beda tetap dimuat tetapi ditandai modified. **Karena game offline pribadi, jangan pernah memblokir load secara keras**; blokir keras hanya masuk akal untuk multiplayer dan achievement yang kita tidak punya.

**Alur validasi 12 langkah:** discover, manifest (Ajv precompiled), resolve (gameVersion, dependencies, incompatibleWith), order (topological), parse (jsonc-parser dengan pelacakan posisi plus reviver anti prototype-pollution), validate (Ajv allErrors), migrate (rantai per tipe di memori), xref (integritas referensial, province id dalam rentang, warna parseable), conflict, merge, invariants (pohon riset asiklik, tanpa orphan, gate warna lolos), report (`mods/.report.json` plus panel in-game).
**Format pesan error** harus presisi dan actionable dengan tiga hal yang sering dilupakan: **baris dan kolom** (butuh parser yang menyimpan posisi, `JSON.parse` biasa tidak bisa), **nama schema plus versinya** sehingga modder tahu kontrak mana yang berlaku, dan **hint berbasis jarak Levenshtein** untuk error enum dan referensi yang menyelesaikan mayoritas typo tanpa membaca dokumentasi. Contoh: `/requiresTech merujuk "tech.armor_iv" yang tidak ada; hint: mungkin maksud Anda "tech.armour_iv"? (jarak edit 1)`. Sediakan flag `--strict` yang menggagalkan build pada WARN dan panel Mods in-game yang menampilkan laporan sama.

## Sumber
Wikipedia (Color_difference, Color_blindness, Four_color_theorem, Greedy_coloring, Choropleth_map, Oklab_color_space) · sronpersonalpages.nl Paul Tol · colorbrewer2.org · GitHub (distinctipy, glasbey, quickjs-emscripten, wasmoon, json-logic-js, colorbrewer) · iwanthue · inf.ufrgs.br CVD Simulation Machado · daltonlens.org · w3.org WCAG22 Non-text Contrast · hoi4/vic3/ck3/eu4 paradoxwikis (Country_creation, Country_modding, Coat_of_arms_modding, Countries, Mod_structure) · minecraft.wiki Data_pack · wiki.factorio.com Modding dan lua-api mod-structure · ajv.js.org · json-schema.org
