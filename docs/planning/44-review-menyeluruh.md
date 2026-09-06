# Review Menyeluruh Dokumen Perencanaan

> Sesi 5 (2026-09-06). Audit atas 45 berkas, dilakukan secara terprogram terhadap isi berkas, bukan dari ingatan. Menjawab tiga pertanyaan Billy: mana yang perlu riset lanjutan agar konkret, mana yang belum jelas, dan mana yang perlu dipikirkan ulang.

## 1. Metode audit

Tiga pengukuran dijalankan atas seluruh berkas: **jumlah penanda celah** berupa tidak terverifikasi, tidak ditemukan, usulan, dan menunggu; **kepadatan angka dan tabel** sebagai indikator kekonkretan; dan **cakupan topik** yaitu berapa berkas dan berapa baris yang benar-benar membahas sebuah sistem.

Pengukuran ketiga yang paling mengungkap, karena menemukan sistem yang **sering disebut tetapi tidak pernah dirinci**.

---

## 2. Temuan paling serius: dokumen usang yang belum ditandai

Ini ditemukan lewat audit dan **sudah diperbaiki**, tetapi perlu dicatat sebagai risiko yang akan berulang.

Dokumen 24 masih memuat empat pernyataan yang kini terbantah, dan semuanya ditulis dengan nada pasti sehingga berbahaya bila dipakai saat implementasi.

| Pernyataan usang | Kenyataan |
|---|---|
| Total poin kemenangan dunia 7.400 | Sekitar **5.190** |
| Baseline roster 31 unit dengan angka asumsi | **77 kelas dengan angka asli** |
| Mobile SAM sebaiknya bernilai sekitar 14 terhadap sayap tetap | Aslinya **8**; yang bernilai 12 justru Theater Defense System terhadap **misil** |
| Doktrin empat varian | **Dibatalkan** oleh dua keputusan |

**Pelajarannya: dokumen riset lama harus diberi peringatan keusangan di kepalanya, bukan hanya dikoreksi di tengah.** Empat penanda sudah dipasang.

Yang tetap sahih dari dokumen itu justru yang paling penting: konstanta ekonomi 3.000, konstanta tempur 0,35 yang kini terverifikasi, dan kesimpulan bahwa data hanya ada di klien game, yang terbukti benar.

---

## 3. Sistem yang disebut tetapi tidak pernah dirinci

Ini jawaban langsung atas kekhawatiran Billy soal data abstrak. Angka di bawah adalah **jumlah baris yang benar-benar membahas topik** di seluruh 45 berkas.

| Sistem | Baris | Penilaian |
|---|---|---|
| **Aksesibilitas** | **5** | Hanya satu paragraf di spesifikasi layar. Nyaris tidak ada |
| **Audio** | **6** | Hanya satu keputusan bahwa audio minimal di fase 8 |
| **Sifat komandan** | **6** | Hanya pola dari Hearts of Iron, **tanpa satu pun daftar sifat** |
| **Variasi antar kampanye** | **9** | Nyaris tidak ada, padahal ini permainan yang dimainkan berulang |
| **Agenda AI** | **12** | Hanya konsep, tanpa satu pun agenda konkret |
| **Kecerdasan buatan** | **16** | **Paling mengkhawatirkan.** Hanya kerangka arketipe tanpa satu pun bobot angka |
| Intelijen dan spionase | 53 | Tersebar di 24 berkas, **belum pernah dikonsolidasikan** |
| Sistem peristiwa | 105 | Kerangka mesinnya ada, **isinya tidak ada** |

Bandingkan dengan sistem yang sudah konkret: unit punya 41 KB berisi 77 kelas dengan angka penuh, bangunan punya 24 KB dengan biaya per level, dan peta punya 20 KB dengan kriteria terima.

**Ketimpangannya tajam.** Sistem yang menyentuh angka sudah sangat konkret; sistem yang menyentuh perilaku dan konten masih berupa kerangka.

---

## 4. Yang perlu riset lanjutan, diurutkan

### 4.1 Wajib sebelum fase lima

**Kecerdasan buatan.** Ini satu-satunya yang benar-benar memblokir fase berikutnya. Yang dibutuhkan bukan konsep melainkan **tabel bobot utilitas dengan angka**, untuk enam sampai delapan keputusan strategis. Ditambah anggaran komputasi konkret: berapa negara diperbarui per tick dari 195 negara, dalam anggaran 50 sampai 300 milidetik.

Yang juga penting dan sering dilupakan: **kritik komunitas tentang apa yang membuat AI terasa curang**. Tanpa itu, kita berisiko membangun AI yang kompeten tetapi tidak menyenangkan.

### 4.2 Wajib sebelum fase enam

**Daftar konten Modern.** Tiga daftar yang selama ini hanya berupa jumlah: sekitar tiga puluh peristiwa, sepuluh sampai lima belas agenda, dan dua puluh sampai tiga puluh sifat komandan. Ini pekerjaan penulisan yang butuh riset preseden, bukan riset data.

**Konsolidasi sistem intelijen.** Bahannya tersebar di 24 berkas dan belum pernah disatukan menjadi satu sistem dengan biaya, peluang, dan konsekuensi.

### 4.3 Penting tetapi tidak memblokir

**Variasi antar kampanye.** Belum pernah dibahas sama sekali, padahal ini permainan yang Billy mainkan sendiri berulang kali. Pertanyaannya sederhana dan belum terjawab: **apa yang membuat kampanye kedua terasa berbeda dari yang pertama?**

**Aksesibilitas dan audio.** Keduanya nyaris kosong. Untuk pemakaian pribadi ini berisiko rendah, tetapi aksesibilitas menyentuh keterbacaan yang berdampak langsung pada kenyamanan bermain berjam-jam.

### 4.4 Celah kecil yang bisa ditetapkan sendiri

Formula pertumbuhan populasi, persentase rampasan, nilai bonus garnisun, waktu bangun Combat Outpost tingkat tiga, biaya Pontoon, dan pemetaan ikon biaya ke sumber daya. Semuanya bisa diputuskan tanpa riset dan tanpa risiko.

---

## 5. Yang perlu dipikirkan ulang, bukan diriset

Ini bagian yang menurut saya paling penting dan belum pernah kita bahas dengan jujur.

### 5.1 Cakupan sudah membesar jauh melampaui rencana awal

Roadmap memuat **tiga belas fase**, dari nol sampai dua belas, mencakup tiga era historis, editor skenario, sandbox acak, modding, dan lapisan Legends.

Permintaan awal Billy adalah game **medium, mudah dipakai, tidak ribet**. Yang sekarang terdokumentasi adalah proyek berskala studio.

**Ini bukan kritik terhadap dokumennya**, karena tiap fase punya rencana konkret dan itu memang yang diminta aturan enam. Tetapi perlu keputusan sadar: **mana yang benar-benar akan dikerjakan.**

Saran saya, fase satu sampai empat adalah permainan yang sudah bisa dimainkan dan dinikmati. Fase lima sampai delapan membuatnya terasa hidup. Fase sembilan ke atas adalah proyek terpisah.

### 5.2 Gerbang performa belum pernah diuji

Keputusan D22 menetapkan gerbang yang jelas: bila satu tick melebihi 500 milidetik atau frame melebihi 16 milidetik, inti simulasi dipindah ke Rust.

Tetapi **jumlah provinsi sudah naik dari 2.000 ke 2.400** tanpa pengujian apa pun, di laptop dengan memori delapan gigabita. Gerbang itu hanya berguna bila benar-benar dijalankan, dan sebaiknya dijalankan **sebelum** membangun banyak hal di atasnya.

### 5.3 Angka kunci sudah berubah dua kali

Panjang kampanye dan ambang kemenangan sudah bergeser: dari 25 persen berdasar total 7.400, menjadi sekitar 33 persen berdasar total 5.190. Jumlah provinsi juga bergeser.

**Ini perlu dikunci sekali**, karena keduanya menentukan hampir semua kalibrasi lain.

### 5.4 Apakah Legends masih relevan

Lapisan Legends dirancang saat cakupan masih kecil. Sekarang ada 45 dokumen dan tiga belas fase. Pertanyaannya jujur: **apakah Legends masih ingin dikerjakan, atau ia peninggalan dari brainstorming awal?**

Riset menyimpulkan Legends butuh 60 tahap, sekitar 120 peristiwa, dua belas unit puncak, dan tiga puluh situs. Itu lebih besar daripada seluruh konten Modern.

### 5.5 Apa artinya selesai

Untuk permainan yang dimainkan sendiri, **tidak ada tanggal rilis dan tidak ada pemain lain**. Itu kebebasan, tetapi juga berarti tidak ada yang memaksa berhenti.

Menurut saya perlu satu definisi sederhana: **kampanye Indonesia dari hari satu sampai menang, terasa menyenangkan, tanpa bug yang menghentikan permainan.** Semua setelah itu adalah bonus.

---

## 6. Yang sudah tidak perlu diriset lagi

Supaya tidak ada usaha terbuang, berikut yang **sudah tertutup dan tidak perlu disentuh lagi**.

| Bidang | Status |
|---|---|
| Statistik unit | 77 kelas European dengan angka asli, dan Western serta Eastern bisa diturunkan |
| Rumus tempur | Ditetapkan dan diuji terhadap empat skenario |
| Ekonomi | Formula terpecahkan, delapan dari delapan titik data cocok |
| Poin kemenangan | Model terkonfirmasi tanpa sisa |
| Bangunan | Lengkap per level |
| Peta | Angka, aturan, dan kriteria terima lengkap |
| Doktrin | Bonus, pergeseran hari, dan pemetaan negara lengkap |
| Pohon riset | Struktur dan biaya nyata untuk lebih dari 160 node |
| Sumber wiki | **Habis.** Tiga sumber diaudit menyeluruh; tidak ada lagi yang bisa digali |

---

## 7. Rekomendasi urutan tindakan

| Urutan | Tindakan | Alasan |
|---|---|---|
| 1 | **Bangku uji angka** | Angkanya kini asli; ini memvalidasi rumus tempur dan ekonomi sekaligus menghasilkan berkas konten |
| 2 | **Uji gerbang performa lebih awal** | Sebelum membangun di atas asumsi 2.400 provinsi |
| 3 | **Riset kecerdasan buatan** | Satu-satunya yang memblokir fase lima |
| 4 | **Kunci panjang kampanye dan ambang kemenangan** | Menentukan kalibrasi lain |
| 5 | **Putuskan cakupan sebenarnya** | Tiga belas fase perlu dipangkas menjadi janji yang jujur |
| 6 | Riset konten Modern dan intelijen | Sebelum fase enam |
| 7 | Variasi antar kampanye | Penting untuk permainan berulang, tidak memblokir |
