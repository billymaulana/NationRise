# Nation Rise: Dokumen Perencanaan

Game strategi negara single-player offline dengan gameplay inti clone Conflict of Nations: World War 3, scenario Modern 2026 / PD1 1914 / PD2 1939 / custom, dan lapisan alternate history. Folder ini berisi **seluruh hasil riset, keputusan, dan rencana** sebelum satu baris kode pun ditulis.

**Status (2026-09-05):** fase 0 (dokumentasi dan keputusan) selesai; 18 laporan riset dikonsolidasikan ke GDD v0.3. Belum ada kode, scaffolding, maupun repositori git. Implementasi menunggu instruksi eksplisit "kerjakan" dari Billy.

## Aturan kerja proyek

1. **Planning dulu, jangan mengerjakan.** Tidak ada kode, scaffolding, atau git init sampai ada instruksi eksplisit "kerjakan".
2. **Selalu catat.** Setiap plan, setiap sesi brainstorming, setiap jawaban Claude, dan setiap keinginan Billy dicatat ke dokumen perencanaan di `docs/planning/` agar planning ke depan semakin jelas.
3. **Riset boleh bebas** menambah game lain sebagai referensi.
4. Bahan eksternal (mis. sesi ChatGPT, GDD v0.1) dipertimbangkan sebagai riset, direkonsiliasi eksplisit dengan keputusan yang sudah ada, bukan diadopsi mentah.
5. **Setiap pertanyaan Claude dan jawaban Billy dicatat, tetapi bukan patokan mati.** Brainstorming harus tetap luas; jawaban awal boleh ditinjau ulang setelah riset.
6. **Tidak ada penundaan "nanti saja di fase 2" tanpa rencana.** Setiap fitur yang disebut harus punya rencana konkret (data, sistem, UI, AI, dependensi) meskipun dijadwalkan belakangan. Roadmap boleh berfase, tetapi tidak boleh ada fitur yang hanya berupa kata "nanti".
7. **Pahami dulu sampai plan dirasa lengkap.** Jika ada pilihan yang belum jelas, riset dan rinci opsinya, simpan pertanyaannya, jangan langsung memutuskan atau mengerjakan.
8. **Pertanyaan dan opsi ditulis di chat, bukan lewat widget pilihan.** Setiap kali perlu keputusan Billy, opsi dan rekomendasi ditulis sebagai teks di percakapan dan disalin ke `15-brainstorm-log.md`, sehingga jawaban Billy dan opsi yang ditawarkan sama-sama tercatat. (Ditetapkan Billy, sesi 5, 2026-09-04.)
9. **Delegasikan ke agen riset bila memang perlu riset.** Pertanyaan yang butuh verifikasi sumber, survei lintas game, atau pengumpulan data dijalankan lewat subagen paralel, bukan dijawab dari ingatan. (Ditetapkan Billy, sesi 5, 2026-09-05.)
10. jika riset gagal karna session limit, ketika saya bilang lanjut lakukan kembali riset / pekerjaan yang tertunda.

## Cara membaca

1. Mulai dari `00-overview.md` (visi, keputusan pasti, keputusan sementara, target hardware).
2. Baca `12-game-design.md` (GDD) dan `13-architecture.md`.
3. Lihat `14-roadmap.md` untuk urutan fase dan kriteria selesai.
4. Dokumen riset `01` sampai `11` adalah bukti dan alternatif di balik setiap keputusan.
5. `16-decisions.md` merangkum keputusan dan alternatif yang ditolak; `17-open-questions.md` memuat yang belum diputuskan.
6. `15-brainstorm-log.md` mencatat kronologi semua pertanyaan dan jawaban.

## Indeks dokumen dan peta ke bagian plan asli

Teks di dalam dokumen sering merujuk "bagian N"; itu penomoran plan riset asli. Petanya:

| File | Isi | Bagian plan asli |
|---|---|---|
| `00-overview.md` | Context, keputusan pasti, keputusan sementara, aturan kerja, target hardware | 1, 2, 3 |
| `01-research-con-screenshots.md` | Analisis 80 screenshot CoN: layar, angka biaya dan durasi, visual, prinsip | 4 |
| `02-research-con-wiki.md` | Mekanik CoN dari wiki: peta, resource, morale, bangunan, unit, combat, riset, diplomasi, intel, waktu, victory, insurgents | 5 |
| `03-research-references.md` | Realpolitiks 3, Ages of Conflict, Victoria 3, difficulty, AI nation, referensi lain, paket adopsi | 6 |
| `04-research-data-sources.md` | Sumber data dunia nyata dan lisensi, pipeline geometri, mapping atribut, teknologi rendering | 7 |
| `05-research-tech-stack.md` | Perbandingan renderer, teknik peta, simulasi, save, wrapper, aset, stack Vue | 9 |
| `06-research-time-scale.md` | Preseden kecepatan, perhitungan skema, rekomendasi auto-pause | 10 |
| `07-research-chatgpt-gdd.md` | Ringkasan sesi ChatGPT dan GDD v0.1, rekonsiliasi dengan arah CoN | 15 |
| `08-research-combat-options.md` | Tiga opsi model combat, supply, morale stack, fog, komandan, siege | 16 |
| `09-research-resource-options.md` | Survei resource, empat opsi, pasar offline, manpower, shortage, skema per era | 17 |
| `10-research-eras-history.md` | Data batas historis, roster per era, epoch gating, events, custom, kalender, skema era pack | 18 |
| `11-research-legends-layer.md` | Preseden, bahan Nusantara, 12 jalur legenda, tiga opsi, artefak desain | 19 |
| `12-game-design.md` | **GDD v0.3**: konsolidasi 18 laporan riset menjadi satu dokumen kerja dengan angka konkret | 11 + riset sesi 5 |
| `13-architecture.md` | **v0.2**: enam lapisan dan kontraknya, protokol Worker, format save, era pack, pipeline render dan warna, struktur repo, arsitektur test | 12 + riset sesi 5 |
| `14-roadmap.md` | 14 fase dengan **kriteria terima terukur** per fase | 13 + riset sesi 5 |
| `15-brainstorm-log.md` | Log kronologis sesi 1 sampai 3, pertanyaan 1 sampai 22 | 8 |
| `16-decisions.md` | ADR ringkas D01 sampai D19 | 2, 2.0 |
| `17-open-questions.md` | 40 pertanyaan tersimpan dengan status | 20 |
| `18-research-war-automation.md` | Tingkat kontrol perang: manual berbantuan, front order, Operation planner, otomatis penuh; mitigasi waktu tempuh | sesi 4 |
| `19-research-engine-stack.md` | Riset netral engine dan bahasa: web TS, Godot C#/GDScript, Tauri + Rust, Bevy, Unity 6; apakah TypeScript kurang ideal | sesi 4 |
| `20-design-ideas-clarifications.md` | Ide desain asisten (17 ide), celah rencana yang harus diisi, pertanyaan klarifikasi P26 sampai P40, glosarium istilah UI Indonesia | sesi 5 |
| `21-research-disputed-borders.md` | Kebijakan batas sengketa 2026 (P14): representasi Natural Earth, tabel 47 sengketa, daftar entitas | sesi 5 |
| `22-research-province-granularity.md` | Dissolve Admin-1 ke ~2.000 provinsi, 28 grup sub-split hot-zone (P17), aturan kota dan rumus VP, 210 zona laut, terrain 1 km | sesi 5 |
| `23-research-nations-dataset.md` | Heuristik doktrin, persona AI, label kesulitan, tier militer awal, deskripsi negara, skema nations.json | sesi 5 |
| `24-research-unit-stats-vp.md` | Stat CoN tambahan, model strength ke damage, baseline roster Modern, doktrin, kalibrasi VP dan ekonomi, metode balancing | sesi 5 |
| `25-research-movement-speed.md` | Kecepatan gerak unit, jarak Indonesia, analisis kritis skala waktu, toleransi menunggu pemain | sesi 5 |
| `26-research-game-modes.md` | Preset kontrol default (P27), ironman (P30), mode lanjutan setelah menang dengan 12 Proyek Akhir dan Tekanan Dunia (D28) | sesi 5 |
| `27-research-colors-modding.md` | Sistem warna pemilik peta tiga lapis dan gate buta warna (P33), cakupan modding data-only dengan trigger deklaratif (P37) | sesi 5 |
| `28-research-sensitivity-market.md` | Sensitivitas konten, disclaimer, aturan do dan don't, checklist pra-rilis (P39); model pasar dunia AI dengan parameter dan simulasi 10 hari (P15) | sesi 5 |
| `29-screen-specs.md` | Wireframe teks 17 layar dengan layout, data, aksi, dan aturan aksesibilitas | sesi 5 |
| `30-research-military-roster-ground.md` | Roster Infantry, Armored, Support: stat CoN terverifikasi, alutsista per doktrin, hari unlock, DDW, pembanding HoI4, taksonomi nyata, usulan roster dan pohon riset darat | sesi 5 |
| `31-research-military-roster-air.md` | Roster Helicopter, Fighter, Heavies: gerbang Air Base, mekanik NOE dan Air Assault, pembanding HoI4, taksonomi nyata, usulan roster udara plus sistem sortie dan AA envelope | sesi 5 |
| `32-research-military-roster-naval.md` | Roster Naval, Submarine, Missile: gerbang Naval Base dan Secret Weapons Lab, mekanik embarkasi dan deteksi kapal selam, tabel kerusakan Thor, roster PD1 dan PD2, taksonomi kapal dan misil nyata, pohon riset senjata pemusnah massal, usulan roster final, plus pembanding Rule the Waves 3, Cold Waters, Command Modern Operations, dan Victoria 3 | sesi 5 |
| `59-temuan-pipeline-provinsi.md` | **Temuan pipeline**: data Natural Earth tidak seragam, butuh gabung dan pecah, normalisasi berbasis luas per kepadatan | sesi 5 |
| `58-arsitektur-godot.md` | **Arsitektur Godot**: empat lapis, batas ditegakkan build, struktur Province | sesi 5 |
| `57-pratinjau-pertempuran.md` | **Pratinjau pertempuran tiga lapis**: perkiraan sebelum menyerang, panel berjalan, visual SubViewport | sesi 5 |
| `56-sistem-pelengkap.md` | **Lima sistem berangka**: sifat komandan, 14 agenda, keragaman kampanye, audio 38 MB, aksesibilitas | sesi 5 |
| `55-kebijakan-batas-sengketa.md` | **Kebijakan batas sengketa**: owner de facto dengan core_of ganda, 14 wilayah dipetakan, aturan sengketa maritim | sesi 5 |
| `54-jumlah-provinsi-final.md` | **Jumlah provinsi 3.400**: paritas proporsi dengan CoN, kerja manual justru berkurang, ambang sebagai persentase | sesi 5 |
| **`53-draft-planning.md`** | **Draft planning**: review menyeluruh, angka kampanye, cakupan dipangkas, tiga tonggak, gerbang keputusan, risiko | sesi 5 |
| `52-godot-verifikasi.md` | **Verifikasi teknis Godot**: anggaran disk, Metal native di M1, tujuh batasan yang harus dipatuhi | sesi 5 |
| **`KUNCI.md`** | **Hanya hal yang Billy kunci sendiri**, 36 butir. Baca lebih dulu sebelum dokumen lain | sesi 5 |
| `51-analisis-techstack-unity.md` | **Analisis pindah ke Unity 6**: batas hardware terukur, plus minus, hitungan 15 dari 17 layar 2D, alternatif Godot | sesi 5 |
| `50-resource-final.md` | **Susunan sumber daya final**: Food menggantikan Supplies, Materials untuk slot lima, pengali Money komoditas | sesi 5 |
| `49-research-ai-behavior.md` | **Riset kecerdasan buatan**: kompetensi mengalahkan bonus 8-15x, keterbacaan bukan keseimbangan, tangga kesulitan, momentum dan osilasi, metrik uji | sesi 5 |
| `48-desain-resource.md` | **Desain sumber daya**: Gold dihapus, Strategic Materials menggantikan Rare, rempah sebagai pendapatan, angka ketimpangan Indonesia | sesi 5 |
| `47-analisis-jumlah-kota.md` | **Analisis jumlah kota**: cacat Maluku, penilaian kota bersejarah, tegangan rasio, prinsip tiga lapis untuk semua negara | sesi 5 |
| `46-peta-kota-indonesia.md` | **Sepuluh kota Indonesia** dengan populasi, slot, sumber daya, dan peran; analisis beban pengelolaan; jalan keluar bila terasa berat | sesi 5 |
| `45-perf-probe-result.md` | **Hasil uji beban sintetis**: gerbang D22 dijalankan lebih awal, 6,9 milidetik per tick dari anggaran 500, plus batas yang belum diuji | sesi 5 |
| `44-review-menyeluruh.md` | **Audit 45 berkas**: dokumen usang yang ditandai, sistem yang disebut tetapi tidak pernah dirinci, riset lanjutan yang diperlukan, dan lima hal yang perlu dipikirkan ulang | sesi 5 |
| `43-combat-damage-formula.md` | **Rumus kerusakan tempur**: model serang versus tahan, konstanta 0,35, pembagian echelon, dan uji kewajaran terhadap empat skenario dengan angka unit asli | sesi 5 |
| `42-status-kejelasan-data.md` | **Ringkasan status**: apa yang sudah punya data konkret, apa yang masih asumsi, apa yang menunggu keputusan, dan kesiapan per fase | sesi 5 |
| `41-data-unit-stats-european.md` | **Statistik lengkap 77 kelas unit doktrin European** dari panel dalam game: serang dan tahan per sepuluh kolom, jangkauan, HP dan pandang per medan, upkeep. Menutup seluruh lubang data | sesi 5 |
| `40-data-unit-panels-ingame.md` | **Statistik unit dari panel dalam game**, satu-satunya sumber untuk angka yang tidak pernah diterbitkan di wiki. Struktur panel, temuan sepuluh kolom, dan data per unit | sesi 5 |
| `39-tech-tree-unified.md` | **Sintesis** pohon teknologi terpadu: dua belas tab dan 131 node, jadwal hari unlock gabungan seluruh kategori, pergeseran per doktrin, enam aturan pohon, dan skema data node | sesi 5 |
| `38-research-map-design.md` | Peta sebagai sistem gameplay: 3.358 provinsi Conflict of Nations, koreksi total poin kemenangan, distribusi terrain sebagai benchmark, kerangka ALKI, aturan tiga provinsi per teater, aturan pulau berjenjang, model selat, dan aturan amfibi | sesi 5 |
| `37-research-doctrine-historical-basis.md` | Dasar historis doktrin: Blitzkrieg sebagai mitos, doktrin Call of War sebagai arsenal nasional berlabel aliansi, bukti aliansi tidak berbagi doktrin, kandidat doktrin keempat era Perang Dunia 1 | sesi 5 |
| `36-research-buildings-city-management.md` | Bangunan lengkap per level, sebelas bangunan yang belum diketahui termasuk situs strategis, antrean sebagai fitur berbayar Bytro, insurgency dan moral, pembanding lima game, usulan slot berbasis populasi dan Templat Kota | sesi 5 |
| `35-research-con-data-audit.md` | **Audit tiga sumber Conflict of Nations**: cara akses wiki resmi Bytro, sistem Echelon pengganti bobot kerusakan, mekanik anti-udara lengkap dengan cooldown sepuluh menit, nama alutsista per doktrin, hari unlock udara, dan blok statistik baru | sesi 5 |
| `34-prototype-balance-bench.md` | Spesifikasi bangku uji angka: empat panel (ekonomi, duel tempur, waktu, tabel unit yang bisa disunting) dalam satu berkas HTML; menjawab apakah prototipe bisa dibuat sekarang | sesi 5 |
| `33-research-officer-elite-loadout-techtree.md` | Officer, Seasons dan Elite, Loadout, pembanding komandan enam game, struktur pohon teknologi tujuh game, usulan Commander dan tech tree Nation Rise | sesi 5 |
| `appendix/NationRise_GDD_v0.1_chatgpt.md` | Salinan utuh GDD v0.1 hasil sesi ChatGPT Billy | bahan eksternal |

## Referensi eksternal yang dipakai Billy

- Wiki Conflict of Nations: https://wiki.conflictnations.com/ dan https://conflictofnations.wiki.gg/
- Screenshot referensi visual: `~/Downloads/conflictofnations` (80 file, tidak disalin ke repo)
