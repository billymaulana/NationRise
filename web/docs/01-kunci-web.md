# Keputusan Terkunci — Jalur Web

> Register keputusan **khusus jalur `web/`**. Tidak menggantikan dan tidak
> mengubah `../../docs/planning/KUNCI.md`; berkas itu tetap milik jalur Godot.
>
> Kode keputusan memakai awalan `W`. Terakhir diperbarui: 2026-09-06.

## Hubungan dengan KUNCI.md jalur Godot

Keputusan K01 sampai K37 di jalur Godot **tetap berlaku** untuk jalur web
kecuali yang dicabut secara eksplisit di tabel berikut. Pencabutan hanya
berlaku di dalam `web/`.

| Keputusan lama | Status di jalur web | Alasan |
|---|---|---|
| K06 — tidak harus clone penuh, mekanik boleh berbeda | **Dicabut**, diganti W01 | Justru kepenuhan yang diuji jalur ini |
| K13 — Godot 4 + C# + GDScript | **Dicabut**, diganti W02 | Alasan keberadaan jalur ini |
| K15 — peta strategis 3D | **Diubah**, lihat W07 | CoN sebenarnya 2,5D; meniru persis berarti mengikuti itu |
| K29 — planning dulu, tidak ada kode | **Dicabut** | Billy sudah memberi instruksi kerjakan untuk folder ini |
| K36 — tidak memakai widget pertanyaan | Tetap berlaku | Preferensi lintas jalur |
| K11 — i18n id dan en, default Indonesia | **Sebagian diubah**, lihat W17 | Dua bahasa tetap; defaultnya jadi Inggris |

Sisanya diwarisi: pemain tunggal luring (K02), simpan lokal (K03), tidak
didistribusikan (K04), tingkat kesulitan (K07), data negara realistis (K08),
real-time bisa dipercepat (K09), dunia penuh (K10), i18n dua bahasa (K11, dengan default diubah oleh W17),
main terus setelah menang (K12), target MacBook Air M1 8 GB (K14), empat
skenario dengan Modern lebih dulu (K17), tiga doktrin (K18), tujuh sumber daya
tanpa Gold (K19–K26), dua belas kota Indonesia (K27).

## 1. Identitas jalur

| # | Terkunci | Kapan |
|---|---|---|
| W01 | **Klon penuh Conflict of Nations.** Mikromanajemen ditiru, tidak dipangkas. Bila ragu antara "lebih enak" dan "lebih mirip CoN", pilih lebih mirip | sesi 6 |
| W02 | **Vue 3 + Vite + TypeScript.** Tanpa Godot, tanpa .NET saat runtime | sesi 6 |
| W03 | Jalur ini **berdampingan**, bukan pengganti. Jalur Godot terus hidup dan tidak disentuh | sesi 6 |

## 2. Teknologi

| # | Terkunci | Kapan |
|---|---|---|
| W04 | **Simulasi diport ke TypeScript**, berjalan di Web Worker. Bukan WASM .NET, bukan proses terpisah | sesi 6 |
| W05 | **323 uji C# yang ada ikut diport** ke Vitest dan menjadi kontrak kebenaran port | sesi 6 |
| W06 | **UnoCSS** untuk gaya, **Pinia** untuk state antarmuka. `content.pipeline.include` diset eksplisit sejak commit pertama | sesi 6 |
| W07 | **Peta three.js, bidang miring 2,5D**, bukan 3D penuh. Ini yang sebenarnya dipakai CoN | sesi 6 |
| W08 | **Peramban dulu, tanpa Tauri.** Arsitektur dijaga siap-Tauri, tetapi Rust tidak dipasang sekarang | sesi 6 |
| W09 | Simpan permainan ke **IndexedDB**, ekspor/impor sebagai berkas | sesi 6 |

## 3. Ketepatan visual

| # | Terkunci | Kapan |
|---|---|---|
| W10 | **Token visual diturunkan dari piksel tangkapan layar**, tidak dari perkiraan. Alatnya `tools/measure.py`, hasilnya `03-bahasa-visual.md` | sesi 6 |
| W11 | **Kanvas rujukan 1440 × 784 CSS pada DPR 2.** Semua ukuran dicatat dalam piksel CSS | sesi 6 |
| W12 | Setiap layar yang selesai **diverifikasi dengan `getComputedStyle`**, bukan dinilai dari kode. Nilai spacing unik dikumpulkan dan diperiksa terhadap grid | sesi 6 |
| W13 | Aset gambar unit dan ikon dari CoN **tidak disalin**. Yang ditiru adalah tata letak, palet, dan geometri; gambar dibuat atau diganti | sesi 6 |

## 4. Aturan kerja jalur ini

| # | Terkunci | Kapan |
|---|---|---|
| W14 | **Tidak ada berkas di luar `web/` yang diubah.** Di luar itu hanya dibaca | sesi 6 |
| W15 | Tangkapan layar referensi **tidak masuk git**. `reference/` di-ignore | sesi 6 |
| W16 | Port simulasi dikerjakan **uji dulu**: port berkas uji C#, lihat merah, baru port implementasinya | sesi 6 |
| W17 | **Bahasa antarmuka default Inggris**, bukan Indonesia. K11 tetap berlaku soal i18n dua bahasa sejak awal; yang berubah hanya defaultnya | sesi 6 |

## 5. Yang belum dikunci

| Hal | Status |
|---|---|
| Font | Font CoN belum teridentifikasi. Kandidat pengganti bebas ada di `03-bahasa-visual.md` §5, perlu perbandingan visual |
| Sumber citra peta | CoN memakai citra satelit. Sumber bebas-lisensi yang setara belum dipilih; lihat `07-render-peta.md` |
| Nasib Gold | K26 menghapus Gold, tetapi klon penuh (W01) menyiratkan ada. Belum diputuskan apakah dihidupkan sebagai mata uang non-berbayar |
| Multipemain | Di luar cakupan (K02), tetapi CoN adalah gim multipemain. Struktur giliran AI harus meniru rasa multipemain |
