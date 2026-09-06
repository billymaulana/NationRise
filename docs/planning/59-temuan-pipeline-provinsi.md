# Temuan Pipeline Provinsi

> Sesi 5 (2026-09-06). Hasil pengukuran nyata terhadap data Natural Earth, bukan perkiraan. **Mengoreksi asumsi D128.**

## 1. Apa yang diasumsikan, dan apa kenyataannya

D128 menetapkan target 3.400 provinsi dengan alasan pipeline hanya perlu **1.100 penggabungan** dari 4.500 unit Natural Earth, lebih sedikit daripada 2.100 penggabungan untuk target 2.400.

**Asumsi itu salah dalam dua hal.**

### 1.1 Data tidak seragam sama sekali

| Negara | Unit admin-1 |
|---|---|
| Britania Raya | **232** |
| Slovenia | **193** |
| Latvia | 119 |
| Filipina | 118 |
| **Indonesia** | **33** |
| Kanada | **13** |
| Australia | **11** |

Slovenia yang luasnya 20.000 kilometer persegi punya **193 unit**, sementara Australia yang 7,7 juta kilometer persegi hanya punya **11**. Natural Earth mencampur tingkat pemerintahan yang sama sekali berbeda: municipality Eropa disandingkan dengan negara bagian benua.

**Jumlah unit administratif tidak berkorelasi dengan luas maupun kepentingan permainan.**

### 1.2 Pipeline butuh dua arah, bukan satu

Dengan alokasi per negara menurut model dunia:

| Operasi | Jumlah |
|---|---|
| Perlu digabung | 2.385 unit |
| **Perlu dipecah** | **1.506 unit** |
| Sudah pas | 44 negara |

Pemecahan tidak pernah diperhitungkan, dan ia jauh lebih sulit daripada penggabungan.

---

## 2. Sebaran luas yang sebenarnya

Diukur dengan proyeksi luas sama (`+proj=cea`) terhadap 4.590 unit:

| Ukuran | Luas |
|---|---|
| Persentil 10 | 49 km² |
| Persentil 25 | 406 km² |
| **Median** | **3.386 km²** |
| Persentil 75 | 13.810 km² |
| Persentil 90 | 60.730 km² |
| Persentil 99 | 463.777 km² |
| Maksimum | **12.335.436 km²** (Antartika) |

Luas total daratan 146,8 juta kilometer persegi. Untuk 3.400 provinsi, **luas ideal 43.184 km²**, yaitu petak bersisi sekitar 208 kilometer.

Bandingkan median 3.386 dengan ideal 43.184: **median unit Natural Earth tiga belas kali lebih kecil daripada yang dibutuhkan.**

Bila ambangnya dipasang pada 0,25 dan 2,5 kali luas ideal:

| Kategori | Jumlah |
|---|---|
| Terlalu kecil, perlu digabung | **3.297 unit**, yaitu 72 persen |
| Terlalu besar, perlu dipecah | 274 unit, menghasilkan **2.095 provinsi baru** |

---

## 3. Kenapa luas saja tidak cukup

Pemecahan murni berdasarkan luas menghasilkan hal yang tidak masuk akal:

| Unit | Luas | Provinsi bila dipecah rata |
|---|---|---|
| Antartika | 12,3 juta km² | **286** |
| Sakha, Siberia | 3,1 juta km² | **71** |
| Australia Barat | 2,5 juta km² | 59 |
| Nunavut, Kanada | 2,1 juta km² | 48 |

Tujuh puluh satu provinsi untuk Siberia yang nyaris tak berpenduduk adalah pemborosan: tidak ada keputusan menarik di sana, hanya lebih banyak petak untuk dilewati pasukan.

**Provinsi seharusnya kecil di tempat padat dan besar di tempat kosong.** Itulah yang membuat peta strategi terasa benar, dan itu berarti kriterianya bukan luas melainkan **luas dibagi kepadatan penduduk**.

---

## 4. Tiga pilihan

| Pilihan | Hasil | Kerja | Risiko |
|---|---|---|---|
| **A. Gabung saja, tanpa pecah** | sekitar 2.300 provinsi | paling sedikit | Australia tetap 11 provinsi; satu provinsi sebesar Eropa Barat |
| **B. Gabung dan pecah dengan bobot kepadatan** | sekitar 3.400 sesuai target | sedang, butuh raster kepadatan penduduk | Batas hasil pemecahan tidak mengikuti batas administratif nyata |
| **C. Turunkan target ke sekitar 2.400** | sesuai kemampuan data | paling sedikit | Membatalkan D128 dan mengembalikan masalah proporsi Indonesia |

**Rekomendasi: B.** Alasannya, pemecahan hanya menyentuh wilayah yang memang tidak punya batas administratif halus karena tidak ada yang tinggal di sana. Memecah gurun Australia atau tundra Siberia menjadi beberapa provinsi buatan **tidak menghilangkan apa pun yang dikenali pemain**, sementara membiarkannya utuh membuat pergerakan di sana terasa salah.

Syaratnya pemecahan harus **deterministik** dan memakai seed tetap, agar peta yang sama dihasilkan setiap kali pipeline dijalankan.

---

## 5. Yang dibutuhkan untuk pilihan B

| Kebutuhan | Sumber |
|---|---|
| Raster kepadatan penduduk | GPWv4 atau WorldPop, keduanya bebas dipakai |
| Algoritma pemecahan | Voronoi dari titik berseed, dibobot kepadatan |
| Algoritma penggabungan | tetangga terdekat sampai ambang luas efektif tercapai |
| Aturan khusus | Antartika dikecualikan atau dibatasi beberapa provinsi saja |

---

## 6. Status D128

**Target 3.400 tetap berlaku, tetapi alasannya berubah.** Klaim bahwa target lebih besar berarti kerja lebih sedikit **tidak benar** — data ternyata butuh penggabungan besar-besaran di Eropa dan pemecahan besar-besaran di negara berpenduduk jarang, apa pun targetnya.

Yang tetap benar dari D128 adalah alasan proporsinya: dengan 3.400 provinsi Indonesia menempati 1,58 persen dunia, sama persis dengan Conflict of Nations.
