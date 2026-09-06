# Jumlah Provinsi Final

> Sesi 5 (2026-09-06). Menyelesaikan pertentangan antara angka 3.358 dan 2.400. Ternyata bukan pertentangan, melainkan **kesalahan saya membaca dua hal berbeda** — tetapi di baliknya ada masalah nyata.

## 1. Klarifikasi: apa yang sebenarnya bertentangan

**3.358 bukan usulan kita.** Itu **jumlah provinsi Conflict of Nations World War III yang terverifikasi**, dipakai sebagai pembanding di riset peta.

**2.400 adalah target kita**, ditetapkan D81 setelah dinaikkan dari 2.000.

Jadi keduanya bisa benar bersamaan. **Yang bermasalah bukan angkanya, melainkan proporsinya.**

---

## 2. Masalah sebenarnya: Indonesia terlalu besar

Rekonstruksi model Conflict of Nations dari angka terverifikasi, dan hasilnya nyaris tepat:

| | Perhitungan | Hasil |
|---|---|---|
| 64 negara bisa dipilih | × 46 provinsi | 2.944 |
| 85 negara komputer | × 5 provinsi | 425 |
| **Total** | | **3.369** (aktual 3.358, meleset 11) |

Sekarang bandingkan porsi Indonesia:

| Susunan | Indonesia | Porsi dunia |
|---|---|---|
| Conflict of Nations | 53 dari 3.358 | **1,58 persen** |
| **Target kita 2.400** | 54 dari 2.400 | **2,25 persen** |
| Target 3.400 | 54 dari 3.410 | **1,58 persen** |

**Dengan 2.400 provinsi, Indonesia menjadi 42 persen lebih besar relatif terhadap dunia dibandingkan di Conflict of Nations.** Itu membuat permainan lebih mudah tanpa disengaja, dan mengubah seluruh kalibrasi ambang kemenangan.

---

## 3. Argumen yang saya kira menentukan, dan ternyata terbalik

Saya semula menolak angka besar karena mengira 3.400 provinsi berarti 42 persen lebih banyak kurasi data. **Itu salah, dan arahnya justru berlawanan.**

Pipeline dimulai dari **Natural Earth Admin-1 yang punya sekitar 4.500 provinsi**, lalu **digabungkan turun** ke target. Bagian manualnya adalah daftar penggabungan per negara.

| Target | Penggabungan yang harus diputuskan |
|---|---|
| 2.400 | **2.100** |
| 3.400 | **1.100** |

**Target yang lebih besar justru menghemat seribu keputusan penggabungan manual.**

Dan atribut per provinsi hampir seluruhnya otomatis: nama dari Natural Earth, medan dari raster, sumber daya dari titik USGS dan GEM lewat point-in-polygon, ketetanggaan dari topologi, kepemilikan dari kode negara. **Jumlah provinsi yang lebih besar tidak menambah kerja manual di sana.**

---

## 4. Keputusan: 3.400 provinsi

| Alasan | Bukti |
|---|---|
| **Paritas dengan referensi utama** | Indonesia 1,58 persen dunia, sama persis dengan Conflict of Nations |
| **Kerja manual setengahnya** | 1.100 penggabungan berbanding 2.100 |
| **Performa aman** | Sekitar 10 milidetik dari anggaran 500; hasil ukur menunjukkan 6,9 pada 2.400 dan 15,9 pada 5.000 |
| **Negara menengah punya kedalaman** | 22 provinsi berbanding 16, sehingga perang melawan tetangga tidak selesai dalam dua hari |

Indonesia **tetap 54 provinsi**. Yang berubah hanya dunia di sekitarnya, dan itu justru mengembalikan proporsi yang benar.

### 4.1 Model dunia final

| Golongan | Negara | Provinsi | Kota | Populasi kota |
|---|---|---|---|---|
| Besar | 20 | 1.560 | 220 | 1.100 |
| Menengah | 50 | 1.100 | 250 | 1.000 |
| Kecil | 125 | 750 | 125 | 375 |
| **Total** | **195** | **3.410** | **595** | **2.475** |

**Total poin kemenangan dunia: 5.290** dari 2.815 provinsi non-kota ditambah 2.475 populasi kota.

---

## 5. Ambang kemenangan sebagai persentase, bukan angka tetap

Ini penting agar jumlah provinsi bisa diubah kemudian tanpa merusak keseimbangan. D81 sudah menetapkan jumlah provinsi sebagai **parameter pipeline**, jadi ambangnya harus mengikuti.

| Preset | Hari game | Bagian dunia | Ambang | Kelipatan awal | Poin per hari | Jam nyata |
|---|---|---|---|---|---|---|
| Singkat | 30 | 25 persen | 1.322 | 13,5 kali | 41 | 2,5 |
| **Standar** | **45** | **30 persen** | **1.587** | **16,2 kali** | **33** | **3,8** |
| Panjang | 60 | 35 persen | 1.851 | 18,9 kali | 29 | 5,0 |

Pembanding Conflict of Nations menuntut 23 kali poin awal dengan laju 35 per hari. **Preset Standar kita menuntut 16,2 kali dengan laju 33** — hampir sama lajunya, tetapi target akhirnya lebih ringan karena tidak ada koalisi manusia yang mempercepat penaklukan.

**Ambang dihitung saat permainan dibuat**, dari total poin dunia yang sebenarnya, bukan disimpan sebagai konstanta.

---

## 6. Yang perlu diperbarui karena keputusan ini

| Dokumen | Perubahan |
|---|---|
| D81 | Target provinsi 2.400 menjadi **3.400** |
| D126 | Poin dunia 3.970 menjadi **5.290**; ambang Standar 1.191 menjadi **1.587** |
| `53-draft-planning.md` | Model dunia dan tabel ambang |
| Gerbang performa | Diukur ulang pada **3.400**, bukan 2.400 |
