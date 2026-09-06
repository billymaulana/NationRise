# Spesifikasi Bangku Uji Angka (Balance Bench)

> Sesi 5, dibuat 2026-09-05, **dikerjakan 2026-09-06**. Berkasnya ada di `NationRise/tools/balance-bench.html`, berukuran 21 KB tanpa dependensi. Buka dengan klik dua kali.

> Sesi 5 (2026-09-05). Menjawab pertanyaan Billy: apakah dari data riset sekarang sudah bisa dibuat prototipe yang bisa diubah-ubah. Dokumen ini adalah **spesifikasi**, bukan kode. Implementasi menunggu instruksi eksplisit sesuai aturan 1.

## 1. Jawaban singkat dan alasannya

**Bisa, tetapi yang tepat dibuat sekarang bukan prototipe permainan, melainkan bangku uji angka.**

Perbedaannya penting. Prototipe permainan menuntut peta 2.000 provinsi yang berarti seluruh fase 1 data pipeline, ditambah renderer three.js, pathfinding, dan AI. Itu pekerjaan berminggu-minggu sebelum satu pertanyaan desain pun terjawab.

Sementara itu, **pertanyaan yang paling mendesak saat ini semuanya tentang angka**, dan angka bisa diuji tanpa peta sama sekali. Riset sesi ini menghasilkan tiga kategori unit yang angkanya adalah **rancangan yang belum pernah diuji siapa pun**, karena wiki Conflict of Nations terbukti kosong untuk unit udara dan unit laut. Menuliskannya ke dalam kode permainan sebelum diuji berarti membangun di atas tebakan.

## 2. Yang siap diuji sekarang

| Sistem | Status data | Kesiapan |
|---|---|---|
| Ekonomi produksi | Formula terpecahkan, `baseProduction = 3000`, delapan dari delapan titik data Indonesia cocok | **Siap dan bisa divalidasi otomatis** |
| Skala waktu | Tangga kecepatan diputuskan (D23), durasi Conflict of Nations dipertahankan | **Siap** |
| Tempur darat | Rating Conflict of Nations terverifikasi untuk infanteri dan Main Battle Tank | **Siap** |
| Penalti penumpukan dan kesehatan | Rumus terverifikasi | **Siap** |
| Moral dan produksi | Tabel modifier lengkap terverifikasi | **Siap** |

## 3. Yang paling butuh diuji, karena belum teruji sama sekali

| Sistem | Kenapa mendesak |
|---|---|
| **Seluruh angka udara** | Ketujuh belas halaman wiki kosong; semua angka adalah rancangan |
| **Seluruh angka laut** | Dua puluh enam halaman diaudit; nol tabel lengkap; semua angka adalah rancangan |
| **Hardness dan Piercing (D35)** | Mengubah matematika kerusakan secara mendasar dari biner menjadi gradasi |
| **Jam sortie dan selubung anti-udara (D37)** | Klaimnya menurunkan rasio pertukaran dari 10,86 ke 1,4; klaim itu harus dibuktikan lewat simulasi, bukan aritmetika satu tick |
| **Perairan pesisir membalik kekuatan kapal selam (D48)** | Klaim bahwa kapal selam murah mengalahkan kapal selam nuklir di perairan Indonesia |
| **Rasio pengawal tiga banding satu (D49)** | Klaimnya membuat korvet murah tetap layak sampai akhir permainan |

## 4. Bentuk yang diusulkan

**Satu berkas HTML tunggal.** Tanpa peralatan bangun, tanpa dependensi, tanpa server. Dibuka langsung di peramban dengan klik dua kali. Alasannya bukan kemalasan: berkas tunggal berarti Billy bisa membukanya kapan saja tanpa menyiapkan apa pun, dan bisa mengirimkannya ke mana saja.

Isinya empat panel.

### Panel satu, Ekonomi
Penggeser untuk populasi, moral, faktor sumber daya, level Arms Industry, dan status provinsi. Keluarannya produksi harian, dan **di sebelahnya delapan titik data Indonesia sebagai pembanding otomatis** dengan tanda cocok atau tidak. Bila suatu saat formula diubah dan angkanya meleset, kesalahan langsung terlihat.

### Panel dua, Duel tempur
Dua tumpukan yang komposisinya bisa disusun bebas dari seluruh roster darat, udara, dan laut. Keluarannya jalannya pertempuran tick demi tick, lengkap dengan **rincian tiap pengali** dalam bentuk kalimat, misalnya seratus dikali medan nol koma sembilan dikali terkepung satu koma satu dikali sikap satu koma satu lima. Inilah yang menguji apakah komposisi tumpukan benar-benar menghasilkan keputusan, atau semua komposisi berakhir sama.

### Panel tiga, Waktu
Tangga kecepatan Ambient sampai Kilat, dengan tabel yang menampilkan **durasi tiap bangunan, tiap mobilisasi, dan tiap perjalanan dalam menit nyata**. Panel ini langsung menguji dua target Billy: bangunan paling lama sepuluh menit, dan perjalanan antar pulau di bawah dua menit. Bila ada baris yang melanggar, barisnya ditandai merah.

### Panel empat, Tabel unit yang bisa disunting
Seluruh roster dari dokumen 30 sampai 33 ditampilkan sebagai tabel yang **bisa diedit langsung di peramban**. Mengubah satu angka langsung mengubah hasil ketiga panel di atas.

## 5. Kenapa ini bukan pekerjaan yang terbuang

Tabel unit yang disunting di panel empat **diekspor sebagai berkas JSON**, dan berkas itu adalah **format konten sungguhan** yang akan dibaca game di fase 2, sesuai skema era pack di dokumen arsitektur. Jadi bangku uji ini bukan prototipe buang, melainkan **alat pembuat data**. Hasil penyetelan Billy langsung menjadi isi `units.json`.

Selain itu, logika ekonomi dan tempur yang ditulis di sini adalah **fungsi murni yang sama** yang nanti dipindahkan ke lapisan simulasi. Arsitektur sudah mensyaratkan lapisan itu murni tanpa DOM, jadi memindahkannya berarti menyalin, bukan menulis ulang.

## 6. Yang belum bisa dan sebaiknya tidak dipaksakan

Peta sungguhan menunggu fase 1. Rendering three.js, pathfinding, kecerdasan buatan, dan simpan muat semuanya menunggu fasenya masing-masing. Memaksakannya sekarang hanya menghasilkan hal yang harus dibuang.

## 7. Urutan pengerjaan bila diinstruksikan

Panel ekonomi lebih dulu karena datanya paling kuat dan bisa langsung memvalidasi diri terhadap delapan titik data. Lalu panel waktu, karena paling cepat dibuat dan langsung menjawab dua target yang Billy sebutkan. Lalu panel duel, yang paling berat tetapi paling bernilai. Lalu tabel yang bisa disunting beserta ekspornya.

Perkiraan: panel pertama dan kedua selesai dalam satu sesi, panel ketiga dan keempat di sesi berikutnya.
