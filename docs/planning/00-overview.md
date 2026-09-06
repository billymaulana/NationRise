# Nation Rise: Ringkasan, Keputusan, Target Hardware

> Sumber: plan riset Nation Rise, sesi 2026-09-03 sampai 2026-09-04, bagian 1, 2, 3. Dokumen ini bagian dari `docs/planning/`; indeks dan aturan kerja ada di `README.md`. Nomor "bagian N" yang dirujuk di dalam teks mengacu ke penomoran plan asli; petanya ada di README.

## 1. Context

Billy ingin membuat game simulasi mengatur negara, single-player, offline. Inti gameplay adalah **clone penuh gameplay Conflict of Nations: World War 3 (CoN)**: pilih negara nyata, kelola provinsi dan kota, produksi resources, bangun bangunan, riset unit, kelola unit stack di peta, perang dan ekspansi, diplomasi. Ide tambahan diambil selektif dari **Realpolitiks 3**, **Ages of Conflict: World War**, **Victoria 3**, dan game lain yang relevan untuk memperkuat unsur strategi dan geopolitik tanpa membuat game ribet.

Yang diminta pada tahap ini: **riset, pemetaan, dan pencatatan rencana**. Tidak ada implementasi sampai rencana disetujui. Setiap plan dicatat.

## 2. Keputusan yang Sudah Pasti (dari Billy)

| Aspek | Keputusan |
|---|---|
| Mode | Single-player, offline penuh; tidak ada server, tidak ada API runtime |
| Penyimpanan | Lokal saja (save game, settings, data negara di-bundle) |
| Kompleksitas | Medium: mudah dipakai, tidak ribet, unsur strategi kuat |
| Gameplay inti | **Direvisi 2026-09-04 (sesi 4):** CoN sebagai basis dan referensi utama, **tidak harus clone penuh**; mekanik perang diriset ulang karena memindahkan unit manual di CoN terasa lambat dan membosankan |
| Level kesulitan | Wajib ada beberapa level kesulitan |
| Data negara | Realistis dan general: lokasi, bendera, resources, organisasi internasional, doktrin militer, dll |
| Grafis | Sebisa mungkin menyerupai screenshot referensi CoN |
| Platform | Web atau desktop; prioritas **ringan, tidak lag** di laptop Billy |
| **Model waktu** | **Real-time yang bisa dipercepat, pause, dan save** (bukan 1 hari = 24 jam nyata seperti CoN) |
| **Cakupan peta** | **Seluruh dunia dengan provinsi dan kota besar** |
| **Bahasa UI** | **Indonesia + English, i18n dari awal** |
| **Distribusi** | **Hanya dimainkan sendiri** (lisensi longgar, tapi tetap hindari menyalin aset CoN langsung) |
| **Nama kerja** | **Nation Rise** (dari sesi ChatGPT; nama final ditentukan setelah gameplay matang) |
| **Scenario/era** | **Modern 2026, PD1 1914, PD2 1939, dan custom** (keempat arti: modding folder, editor scenario, preset alt-history era pack, sandbox acak) |
| **Legends** | **Jalur B lalu A**: alt-history realistis dulu, lalu mode Legends toggle (default OFF); C tidak dikerjakan kecuali A lolos playtest |

### 2.0 Keputusan sementara (diterima Billy 2026-09-04, bisa diubah; alternatif tersimpan di bagian 9, 10, 16, 17)
| Aspek | Keputusan sementara |
|---|---|
| Tech stack | **Dikonfirmasi ulang sesi 4 (P25) setelah riset netral lintas engine:** Vue 3.5 + Vite 8 + TypeScript; three.js WebGLRenderer untuk peta (province ID map + lookup texture) dan unit 3D low-poly instanced + counter 2D overlay Vue; Vue + UnoCSS untuk panel; Web Worker + bitecs + Comlink untuk simulasi; idb + fflate untuk save + ekspor file; PWA dulu, Tauri v2 opsional; cadangan PixiJS + sprite 8 arah. **Arsitektur siap-Rust dan gerbang pengukuran (D22)**: simulasi modul murni SoA yang bisa diganti inti Rust/WASM jika tick > 500 ms atau frame > 16 ms. Alternatif tersimpan: Godot 4.7 + C# |
| Skala waktu | Tick 1 jam game; 1 hari game = 5 menit nyata pada 1x (preset 3/5/10); kecepatan Pause/1x/2x/4x/8x + "lanjut ke event/hari berikutnya"; mulai pause dengan briefing; auto-pause bertingkat popup/feed/log; durasi CoN tidak dikompres; kalender naratif per era |
| Combat | A + C: taktik emergent dari graph provinsi (encirclement via BFS supply, flanking multi-arah, ambush intel <2, siege progress, blockade, naval invasion, diversion via fog, retreat, chokepoint) + 6 stance per stack (Assault/Hold/Ambush/Siege/Screen/Raid) + komandan 3 sampai 6 per negara dengan trait dan 1 kemampuan aktif; supply 3 status; morale stack + rout + surrender; intel 0 sampai 3; combat breakdown tooltip; tanpa layar battle (B-lite opsional belakangan) |
| Kontrol perang (sesi 4) | Berlapis: default L2 Front/Theater (front digambar pemain, objective, misi laut per zona, AI mengeksekusi) + L3 kartu operasi berprasyarat + override L1 tanpa penalti + toggle L4 delegasi per front; satu planner untuk AI musuh dan pemain; mitigasi waktu tempuh: fast forward sampai tiba + auto-pause, strategic redeployment rel/udara |
| Resource | Engine Money + Manpower + ≤5 goods dengan slot top bar tetap; Modern = 7 CoN penuh; PD2 = 5 goods CoW; PD1 = 5 goods S1914 dikompres dengan upkeep substitutable; pra-industri 3; pasar dunia satu layar dengan Rest of World floor/ceiling; manpower pool dengan 3 tingkat mobilisasi; shortage ramp |

### 2.1 Aturan kerja proyek (dari Billy, 2026-09-04)
1. **Planning dulu, jangan mengerjakan.** Tidak ada kode, scaffolding, atau git init sampai ada instruksi eksplisit "kerjakan".
2. **Selalu catat.** Setiap plan, setiap sesi brainstorming, setiap jawaban Claude, dan setiap keinginan Billy dicatat ke dokumen perencanaan di `docs/planning/` agar planning ke depan semakin jelas.
3. **Riset boleh bebas** menambah game lain sebagai referensi.
4. Bahan eksternal (mis. sesi ChatGPT, GDD v0.1) dipertimbangkan sebagai riset, direkonsiliasi eksplisit dengan keputusan yang sudah ada, bukan diadopsi mentah.
5. **Setiap pertanyaan Claude dan jawaban Billy dicatat, tetapi bukan patokan mati.** Brainstorming harus tetap luas; jawaban awal boleh ditinjau ulang setelah riset.
6. **Tidak ada penundaan "nanti saja di fase 2" tanpa rencana.** Setiap fitur yang disebut harus punya rencana konkret (data, sistem, UI, AI, dependensi) meskipun dijadwalkan belakangan. Roadmap boleh berfase, tetapi tidak boleh ada fitur yang hanya berupa kata "nanti".
7. **Pahami dulu sampai plan dirasa lengkap.** Jika ada pilihan yang belum jelas, riset dan rinci opsinya, simpan pertanyaannya, jangan langsung memutuskan atau mengerjakan.
8. **Pertanyaan dan opsi ditulis di chat, bukan lewat widget pilihan.** Setiap kali perlu keputusan Billy, opsi dan rekomendasi ditulis sebagai teks di percakapan dan disalin ke `15-brainstorm-log.md`, sehingga jawaban Billy dan opsi yang ditawarkan sama-sama tercatat. (Ditetapkan Billy, sesi 5, 2026-09-04.)
9. **Delegasikan ke agen riset bila memang perlu riset.** Pertanyaan yang butuh verifikasi sumber, survei lintas game, atau pengumpulan data dijalankan lewat subagen paralel, bukan dijawab dari ingatan. (Ditetapkan Billy, sesi 5, 2026-09-05.)

## 3. Target Hardware (terukur dari laptop Billy)

| Item | Nilai |
|---|---|
| Mesin | MacBook Air, Apple M1 (4P + 4E core), GPU 7-core |
| RAM | 8 GB (batasan utama: hindari Electron; simulasi harus hemat memori) |
| Layar | 2560 x 1600 Retina (DPR 2; render layer peta pada DPR 1 sampai 1.5) |
| Disk kosong | ~23 GB |
| Toolchain tersedia | Node v24.19.0, pnpm 10.17.1 |
| Tidak tersedia | Rust/cargo (dibutuhkan Tauri), Godot |

Implikasi: stack web TypeScript paling sejalan dengan toolchain dan keahlian Billy (Vue, UnoCSS, Vitest, pnpm). Pembungkus desktop (Tauri) opsional belakangan.

---
