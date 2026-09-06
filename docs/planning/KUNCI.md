# Keputusan Terkunci

> **Dokumen ini berisi hanya hal yang Billy kunci sendiri.** Bukan rekomendasi, bukan hasil riset, bukan usulan Claude. Baca ini lebih dulu sebelum dokumen lain.
>
> Terakhir diperbarui: 2026-09-06 (sesi 5).
> Untuk seluruh keputusan termasuk yang berasal dari riset, lihat `16-decisions.md`. Untuk yang masih terbuka, lihat `17-open-questions.md`.

---

## 1. Fondasi produk

| # | Terkunci | Kapan |
|---|---|---|
| K01 | **Nation Rise**, dua kata, nama final | sesi 4 |
| K02 | **Pemain tunggal, luring penuh.** Tidak ada server, tidak ada API saat berjalan | sesi 1 |
| K03 | **Penyimpanan lokal saja** | sesi 1 |
| K04 | **Hanya dimainkan sendiri.** Tidak untuk didistribusikan | sesi 1 |
| K05 | **Kompleksitas medium**: mudah dipakai, tidak ribet, unsur strategi kuat | sesi 1 |
| K06 | **Berbasis Conflict of Nations**, tetapi **tidak harus clone penuh**; mekanik perang boleh berbeda demi mengurangi mikromanajemen | sesi 1, direvisi sesi 4 |
| K07 | **Wajib ada beberapa tingkat kesulitan** | sesi 1 |
| K08 | **Data negara realistis dan general**: lokasi, bendera, sumber daya, organisasi internasional, doktrin militer | sesi 1 |
| K09 | **Real-time yang bisa dipercepat, dijeda, dan disimpan** | sesi 1 |
| K10 | **Seluruh dunia dengan provinsi dan kota besar** | sesi 1 |
| K11 | **Bahasa Indonesia dan Inggris, i18n sejak awal** | sesi 1 |
| K12 | **Permainan tidak berhenti saat kemenangan tercapai**; pemain boleh melanjutkan untuk membangun dan bereksperimen | sesi 4 |

---

## 2. Teknologi

| # | Terkunci | Kapan |
|---|---|---|
| K13 | **Godot 4** sebagai engine. Versi terverifikasi 4.7.2-stable. **C# untuk simulasi, GDScript untuk antarmuka** | sesi 5 |
| K14 | Target mesin **MacBook Air M1, 8 GB RAM**. Harus ringan dan tidak tersendat | sesi 1 |
| K15 | **Peta strategis 3D** | sesi 5 |
| K16 | Grafis mendekati tangkapan layar Conflict of Nations, **dan lebih baik bila memungkinkan** | sesi 1, diperkuat sesi 5 |

### Empat kriteria penentu (sesi 5)

Dipakai untuk memilih Godot, dan tetap menjadi tolok ukur ke depan:

1. **Peta 3D**
2. **Lancar di laptop**
3. **Grafis lebih baik**
4. **Minim bug, termasuk dari dependency**

Billy menyatakan tidak perlu memahami sisi teknisnya; **yang dinilai adalah hasil**. Pemasangan alat bantu yang diperlukan dipersilakan.

---

## 3. Konten dan cakupan

| # | Terkunci | Kapan |
|---|---|---|
| K17 | **Empat skenario**: Modern 2026, Perang Dunia I 1914, Perang Dunia II 1939, dan custom. **Prioritas pengerjaan adalah era Modern lebih dulu**; era lain menyusul setelahnya | sesi 3, dipertegas sesi 5 |
| K18 | **Doktrin untuk saat ini tiga: Western, Eastern, European**, sama seperti Conflict of Nations. Doktrin keempat hanya boleh ditambahkan bila didukung riset dan data, dan kemungkinan tempatnya era historis | sesi 4, dipertegas sesi 5 |

---

## 4. Sumber daya

Tujuh slot, Gold dihapus.

| # | Slot | Nama | Kapan |
|---|---|---|---|
| K19 | 1 | **Money** | sesi 5 |
| K20 | 2 | **Manpower** | sesi 5 |
| K21 | 3 | **Food** | sesi 5 |
| K22 | 4 | **Fuel** | sesi 5 |
| K23 | 5 | **Materials** | sesi 5 |
| K24 | 6 | **Technology** | sesi 5 |
| K25 | 7 | **Rare Resources** | sesi 5 |

| # | Terkunci | Kapan |
|---|---|---|
| K26 | **Gold dihapus** karena mekanisme berbayar | sesi 5 |

---

## 5. Peta dan kota

| # | Terkunci | Kapan |
|---|---|---|
| K27 | **Indonesia mendapat dua belas kota** | sesi 5 |

---

## 6. Pertempuran

| # | Terkunci | Kapan |
|---|---|---|
| K28 | **Layar pertempuran hanya bersifat pratinjau**, bukan layar tempur penuh dengan kendali taktis. Rinciannya boleh diriset ulang | sesi 5 |

---

## 7. Aturan kerja

| # | Terkunci | Kapan |
|---|---|---|
| K29 | **Planning dulu.** Tidak ada kode, scaffolding, atau git init sampai ada instruksi eksplisit "kerjakan" | sesi 2 |
| K30 | **Selalu catat.** Setiap plan, sesi brainstorming, jawaban, dan keinginan dicatat ke dokumen | sesi 2 |
| K31 | **Riset boleh bebas** menambah game lain sebagai referensi | sesi 3 |
| K32 | Bahan eksternal direkonsiliasi eksplisit dengan keputusan yang ada, **bukan diadopsi mentah** | sesi 3 |
| K33 | **Jawaban Billy dicatat tetapi bukan patokan mati.** Brainstorming tetap luas; jawaban awal boleh ditinjau ulang setelah riset | sesi 3 |
| K34 | **Tidak ada penundaan "nanti saja di fase 2" tanpa rencana.** Setiap fitur yang disebut harus punya rencana konkret | sesi 3 |
| K35 | **Pahami dulu sampai plan dirasa lengkap.** Bila ada pilihan yang belum jelas, riset dan rinci opsinya, simpan pertanyaannya | sesi 3 |
| K36 | **Tidak memakai widget pertanyaan.** Tulis opsi langsung di percakapan | sesi 4 |
| K37 | **Delegasikan agen bila riset memang memerlukannya** | sesi 4 |

---

## 8. Yang belum dikunci

| Hal | Status |
|---|---|
| ~~Bentuk pratinjau pertempuran~~ | **TERJAWAB D136**: tiga lapis. Lihat `57-pratinjau-pertempuran.md` |
| Isi era Perang Dunia I, Perang Dunia II, dan custom | Perlu riset; prioritas setelah Modern selesai (K17) |
| Panjang kampanye dan ambang kemenangan | Sedang dihitung ulang setelah kota menjadi dua belas |
| Cakupan sebenarnya dan pemangkasan fase | Sedang disusun |
