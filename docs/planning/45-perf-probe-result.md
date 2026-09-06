# Hasil Uji Beban Sintetis

> Sesi 5 (2026-09-06). Menjalankan gerbang D22 lebih awal, tanpa menunggu pipeline peta selesai. Berkasnya di `NationRise/tools/perf-probe.mjs`, dijalankan dengan Node 24.19.

## 1. Kenapa diuji sekarang

Keputusan D22 menetapkan gerbang yang jelas: bila satu tick melebihi 500 milidetik, inti simulasi dipindah ke Rust. Tetapi jumlah provinsi sudah **dinaikkan dari 2.000 ke 2.400 tanpa pengujian apa pun**, di laptop bermemori delapan gigabita.

Gerbang hanya berguna bila dijalankan. Menunggu pipeline peta selesai berarti membangun berbulan-bulan di atas asumsi yang belum diperiksa.

Jalan keluarnya: **bangkitkan graf provinsi berukuran nyata secara sintetis**, lalu ukur tiga beban terberat per tick. Ini tidak menggantikan pengujian sungguhan, tetapi menjawab pertanyaan terpenting lebih awal, yaitu apakah kita berada di orde besaran yang benar.

## 2. Yang diukur

Graf dibangun sebagai **typed array struktur-dari-array**, persis seperti yang disyaratkan arsitektur, dengan 2.400 provinsi, 195 negara, 300 tumpukan, dan derajat ketetanggaan rata-rata 5,4. Tetangga sengaja dibuat berdekatan indeksnya untuk meniru lokalitas geografis.

Tiga beban terberat per tick:

| Beban | Apa yang dikerjakan |
|---|---|
| Penelusuran pasokan | Penelusuran melebar untuk **seluruh 195 negara**, kedalaman enam, menandai terpasok, menipis, dan terputus |
| Pencarian jalur | Pencarian jalur untuk **300 tumpukan** dari dan ke provinsi acak |
| Penilaian AI | Menghitung kekuatan tiap negara lalu menilai **seluruh pasangan 195 kali 195** untuk memilih sasaran |

## 3. Hasil

| Beban | Median | Minimum | Maksimum |
|---|---|---|---|
| Penelusuran pasokan seluruh negara | **0,5 ms** | 0,4 | 1,0 |
| Pencarian jalur 300 tumpukan | **6,3 ms** | 6,0 | 6,8 |
| Penilaian utilitas 195 negara | **0,1 ms** | 0,1 | 1,3 |
| **Total per tick** | **6,9 ms** | | |

**Gerbang D22 adalah 500 milidetik. Kita memakai 1,4 persen dari anggaran itu.**

Memori graf hanya **42 KB**, jauh di bawah kekhawatiran apa pun pada memori delapan gigabita.

### 3.1 Uji margin

Dijalankan ulang pada **5.000 provinsi**, lebih dari dua kali lipat rencana, hasilnya **15,9 milidetik** atau 3,2 persen anggaran.

Artinya **skala bukan masalah**. Bahkan pada dua kali lipat rencana, kita masih tiga puluh kali di bawah gerbang.

## 4. Satu bug yang ditemukan dan diperbaiki

Jalannya pertama memberi hasil nol koma nol milidetik untuk penelusuran pasokan, dan **angka itu mencurigakan terlalu cepat**. Pemeriksaan menemukan bug: pemilihan simpul awal hanya memindai tiap 195 provinsi, sehingga penelusuran nyaris tidak pernah berjalan.

Setelah diperbaiki, angkanya menjadi 0,5 milidetik, yang masuk akal.

**Ini contoh kenapa hasil yang terlalu bagus harus dicurigai.** Kalau bug itu lolos, kita akan menyimpulkan pasokan gratis padahal belum pernah dihitung.

## 5. Kesimpulan dan batasnya

**Keputusan: tetap dengan TypeScript. Tidak ada alasan memindahkan inti ke Rust.** Margin tiga puluh kali lipat terlalu besar untuk dikhawatirkan.

Tetapi tiga hal **belum diuji** dan tidak boleh disamakan dengan lolos:

| Yang belum diuji | Kenapa penting |
|---|---|
| **Rendering** | Frame time WebGL pada layar Retina belum disentuh sama sekali. Gerbang D22 punya dua sisi, dan hanya sisi simulasi yang lolos |
| **Geometri nyata** | Graf sintetis punya derajat seragam. Peta sungguhan punya kepulauan, enklave, dan jalur laut yang membuat pencarian jalur lebih mahal |
| **Beban penuh** | Ekonomi, moral, pertempuran, dan peristiwa belum ikut dihitung. Ketiganya lebih ringan daripada pencarian jalur, tetapi tetap menambah |

**Rekomendasi: jalankan ulang uji ini setelah fase satu selesai**, memakai graf sungguhan, dan tambahkan pengukuran frame time. Sampai saat itu, hasil ini cukup untuk **membenarkan kenaikan ke 2.400 provinsi** dan menghapus kekhawatiran performa dari daftar risiko.
