# Pratinjau Pertempuran

> Sesi 5 (2026-09-06). Merinci K28, yang mengunci bahwa layar pertempuran **hanya bersifat pratinjau**, bukan layar tempur dengan kendali taktis.
>
> **Catatan kejujuran:** riset terdelegasi untuk topik ini gagal dua kali karena batas sesi. Rancangan ini disusun dari prinsip yang sudah ditetapkan proyek dan dari preseden yang saya ketahui. Preseden ditandai **[UNV]** karena tidak sempat diverifikasi ulang.

## 1. Angka yang menentukan rancangan

Kampanye 45 hari dengan sekitar enam pertempuran per hari di puncak menghasilkan **sekitar 270 pertempuran**.

| Bila panel muncul untuk | Jumlah panel | Per hari game |
|---|---|---|
| Semua pertempuran | **270** | 6,0 — jelas tidak mungkin |
| **Melibatkan ≥8 unit atau kota** | **40** | **0,9** |
| Hanya kota | 13 | 0,3 |

**Penyaringan bukan pilihan gaya, melainkan keharusan aritmetika.**

---

## 2. Prinsip yang mengikat

Dua keputusan yang sudah diambil menentukan bentuknya.

**K28** mengunci sifatnya sebagai pratinjau. **D112** menetapkan bahwa setiap keputusan besar harus bisa dibuka isinya oleh pemain — pertimbangan, skor, dan mana yang menentukan.

Digabung, keduanya mengarah ke satu kesimpulan: **pratinjau pertempuran adalah alat belajar, bukan tontonan.** Nilainya bukan pada seberapa bagus animasinya, melainkan pada apakah pemain paham mengapa ia menang atau kalah.

Ini juga sejalan dengan pengamatan umum yang saya yakini benar [UNV]: **animasi pertempuran cepat dilewati pemain**, sementara rincian angka tetap dibuka bahkan setelah ratusan jam.

---

## 3. Tiga lapis

### Lapis 1 — Perkiraan sebelum menyerang

**Ini lapis yang paling berharga, dan yang paling murah dibuat.**

Muncul saat pemain mengarahkan serangan, sebelum memerintahkannya. Preseden yang saya ketahui [UNV]: ramalan pertempuran Fire Emblem, pratinjau kerusakan Advance Wars, rincian peluang tembak XCOM, dan pratinjau tempur Civilization VI.

Yang ditampilkan adalah **rantai perkalian kekuatan yang sesungguhnya dipakai mesin**:

| Faktor | Contoh nilai | Sumber |
|---|---|---|
| Peringkat dasar | 42,0 | jumlah unit dalam tumpukan |
| × Medan | 0,66 hutan | tabel medan per kelas unit |
| × Dorongan tentara | 1,10 | komandan dan doktrin |
| × Doktrin | 1,05 | European |
| × Penalti tumpukan | 0,88 | 12 unit dari batas 10 |
| × Penalti kesehatan | 0,94 | `0,25 + 0,75 × HP/maks` |
| **= Kekuatan** | **26,4** | |

Dan hasil yang diperkirakan **sebagai rentang, bukan persentase**:

> Perkiraan 12 sampai 18 tick. Anda kehilangan 3 sampai 5 unit; mereka kehilangan 7 sampai 9.

**Rentang, bukan peluang menang dalam persen.** Alasannya dua. Pertama, itu jujur: rumus kerusakan memang mengandung acakan ±15 persen, sehingga hasilnya memang rentang. Kedua, persentase peluang menang mengundang keluhan bahwa "angkanya bohong" ketika hasil 80 persen ternyata kalah — masalah yang saya yakini pernah dialami XCOM [UNV].

### Lapis 2 — Panel pertempuran berjalan

Muncul otomatis untuk pertempuran yang **melibatkan delapan unit atau lebih, atau menyentuh kota**. Sekitar 40 kali per kampanye.

| Bagian | Isi |
|---|---|
| Dua bilah kesehatan agregat | Total HP kedua pihak, diperbarui tiap tick |
| Modifier aktif | Daftar faktor beserta angkanya, sama seperti Lapis 1 tetapi diperbarui |
| Penghitung tick | Tick keberapa, dan berapa lagi menurut perkiraan |
| Log ringkas | Satu baris per tick, bukan per unit |

Panel **bisa ditutup dan pertempuran tetap berjalan**. Ia jendela, bukan layar modal.

**Pada kecepatan di atas 4x, panel tidak muncul otomatis.** Ini konsisten dengan aturan audio: pada kecepatan itu pemain tidak lagi mengikuti pertempuran satu per satu.

### Lapis 3 — Pratinjau visual tiga dimensi

Muncul **hanya bila pemain menekan tombol** di dalam Lapis 2, dan bisa dimatikan permanen di pengaturan.

| Ukuran | Nilai |
|---|---|
| Resolusi `SubViewport` | **480 × 270**, yaitu 6,2 persen layar penuh |
| Jumlah instance | **20 sampai 30** lewat `MultiMeshInstance3D` |
| Durasi adegan | **5 sampai 8 detik**, berulang |
| Biaya saat tertutup | **nol** — `SubViewport` tidak dirender |

Adegannya bukan simulasi ulang yang akurat, melainkan **representasi**: unit menurut komposisi tumpukan yang sebenarnya, medan menurut provinsinya, dan intensitas menurut seberapa timpang pertempurannya.

Batasan Godot yang berlaku di sini, dari verifikasi sebelumnya: `MultiMesh` **tidak punya culling per instance**, tetapi pada 30 instance dalam satu adegan kecil hal itu tidak relevan.

---

## 4. Kenapa urutannya begini

Ketiga lapis sengaja disusun menurut **nilai per biaya**, bukan menurut kemegahan.

| Lapis | Biaya pembuatan | Nilai bagi pemain |
|---|---|---|
| 1 Perkiraan | **Paling murah** — hanya antarmuka, memakai angka yang sudah dihitung mesin | **Paling tinggi** — mengubah keputusan sebelum diambil |
| 2 Panel berjalan | Sedang | Tinggi — menjelaskan mengapa hasilnya begitu |
| 3 Visual 3D | **Paling mahal** — aset, animasi, adegan | **Paling rendah** — memuaskan beberapa kali lalu dilewati |

**Bila anggaran waktu habis, Lapis 3 yang pertama dipotong**, dan permainan tetap utuh. Bila Lapis 1 dipotong, permainan kehilangan alat belajar utamanya.

Itu sebabnya Lapis 1 masuk Tonggak 1 bersama sistem pertempuran, sementara Lapis 3 berada di Tonggak 3.

---

## 5. Aset yang dibutuhkan Lapis 3

Empat siluet cukup, karena pada 480 × 270 piksel perbedaan model tidak terlihat.

| Kelas | Poligon maksimum | Sumber |
|---|---|---|
| Infanteri | 800 | Quaternius CC0 |
| Kendaraan lapis baja | 1.500 | Quaternius Animated Tanks CC0 |
| Pesawat | 1.200 | Kenney atau Quaternius CC0 |
| Kapal | 1.500 | Kenney Watercraft Kit CC0 |

Total anggaran sekitar **5.000 poligon** untuk seluruh pustaka pratinjau.

---

## 6. Yang sengaja tidak ada

| Ditolak | Alasan |
|---|---|
| Kendali taktis saat bertempur | K28 menguncinya, dan riset combat menolak layar tempur penuh karena membuat permainan terasa seperti dua game berbeda |
| Peluang menang dalam persen | Mengundang keluhan bahwa angkanya bohong; rentang lebih jujur terhadap acakan ±15 persen |
| Panel otomatis untuk semua pertempuran | 270 sembulan per kampanye |
| Animasi yang tidak bisa dilewati | Animasi apa pun cepat menjadi beban; tombol lewati wajib ada sejak awal |
| Simulasi ulang yang akurat secara visual | Mahal, dan tidak menambah pemahaman apa pun di atas Lapis 1 dan 2 |
