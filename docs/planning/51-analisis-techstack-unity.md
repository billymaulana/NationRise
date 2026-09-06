# Analisis Perubahan Tech Stack ke Unity 6

> Sesi 5 (2026-09-06). Menanggapi rencana Billy mengganti stack dari Vue dan three.js ke Unity 6 dengan C# dan URP. Analisis, bukan keputusan.

## 1. Dua batas keras yang ditemukan lebih dulu

Diukur langsung dari mesin Billy, bukan diperkirakan:

| Ukuran | Nilai sekarang |
|---|---|
| RAM total | **8,0 GB** |
| RAM bebas dan tidak aktif | **1,6 GB** |
| Disk tersisa | **14 GB** dari 228 GB |
| .NET SDK terpasang | **tidak ada** |
| Unity atau Godot terpasang | **tidak ada** |

Catatan arsitektur lama menyebut sisa disk 23 GB. **Sekarang tinggal 14 GB.**

Kebutuhan Unity 6, perkiraan yang saya yakini tetapi tidak diverifikasi langsung karena belum terpasang: Unity Hub sekitar 0,5 GB, Editor Apple Silicon sekitar 5 sampai 7 GB, dan **cache Library per proyek 2 sampai 20 GB** bergantung aset. Totalnya **8 sampai 12 GB untuk satu proyek kecil**.

Dengan sisa 14 GB, itu meninggalkan **2 sampai 6 GB**, sementara macOS juga memerlukan ruang untuk swap. Dan RAM 1,6 GB yang bebas berarti Unity Editor, yang idle saja memakai 2 sampai 4 GB, **akan menukar memori ke disk terus-menerus**.

**Ini bukan soal kurang nyaman, melainkan soal apakah bisa dijalankan sama sekali.**

---

## 2. Keunggulan Unity yang nyata dan tidak boleh dikecilkan

| Keunggulan | Nilainya di proyek ini |
|---|---|
| **Battle 3D menjadi mudah** | Animasi, skinning, mesin keadaan, kamera, efek — semuanya bawaan. Di three.js semua itu ditulis sendiri |
| **Asset Store** | Ribuan model militer dan efek siap pakai; untuk pengembang tunggal ini menghemat ratusan jam |
| **Editor visual** | Inspector, scene view, profiler, frame debugger. Untuk kerja 3D jauh lebih produktif daripada menulis kode lalu menyegarkan browser |
| **C# untuk simulasi** | Struct dan value type tanpa tekanan pengumpul sampah; Burst dan Job System mendekati performa native |
| **ECS resmi** | Kita berencana memakai bitecs, pustaka pihak ketiga 5 KB. Unity punya paket Entities resmi |
| **Build native** | Bebas dari penghapusan penyimpanan Safari, bebas dari urusan WebGL2 berbanding WebGPU, bebas dari batas memori tekstur browser |

Untuk game yang **sebagian besar 3D**, Unity adalah pilihan yang lebih baik daripada three.js. Itu tidak diperdebatkan.

---

## 3. Kelemahan yang harus dihadapi jujur

| Kelemahan | Besarnya |
|---|---|
| **Hardware tidak sanggup** | Lihat bagian 1. Ini penghalang keras, bukan preferensi |
| **Kurva belajar dari nol** | Seluruh konteks proyek menunjukkan Billy adalah pengembang web: Nuxt, Vue, UnoCSS, ESLint, pnpm. Unity, C#, URP, dan DOTS semuanya baru |
| **UI padat data lebih menyakitkan** | Ini poin terbesar, dibahas di bagian 4 |
| **Riset arsitektur sebagian gugur** | Dokumen 13 merinci Web Worker, Comlink, snapshot biner. Di Unity semuanya diganti Job System; konsepnya mirip, implementasinya berbeda total |
| **Gerbang performa harus diuji ulang** | Hasil 6,9 milidetik berlaku untuk JavaScript. C# akan lebih cepat sehingga ini bukan risiko, tetapi angkanya tidak lagi berlaku |
| **Iterasi lebih lambat** | Web: simpan berkas, segarkan, satu detik. Unity: kompilasi C# ditambah domain reload, lima sampai tiga puluh detik. Untuk penyeimbangan yang butuh ratusan iterasi, ini terasa |

---

## 4. Menghitung berapa persen game ini sebenarnya 3D

Ini pertimbangan yang paling menentukan, dan angkanya sudah ada di dokumen 29.

**NationRise punya tujuh belas layar.** Menurut daftar Billy sendiri:

| Bagian | Dimensi | Jumlah layar |
|---|---|---|
| Strategic World | **3D** | 1 |
| Battle | **3D** | 1 |
| Strategic UI, City, Tech Tree, Diplomacy, Economy, Politics | **2D** | **15** |

**Lima belas dari tujuh belas layar adalah antarmuka dua dimensi padat data**: tabel, daftar, kisi riset, buku pesanan pasar, panel kota. Untuk pekerjaan seperti itu, **HTML dan CSS adalah alat terbaik yang pernah dibuat**, dan Billy sudah menguasainya.

Unity UI Toolkit meniru HTML dan CSS lewat UXML dan USS, tetapi lebih terbatas: tidak ada padanan penuh untuk grid, tata letak teks lebih kaku, dan alat pengembangnya jauh di belakang DevTools. uGUI lebih buruk lagi untuk antarmuka padat data.

Artinya: **pindah ke Unity mempermudah dua layar dan mempersulit lima belas.**

---

## 5. Pertentangan yang perlu diselesaikan lebih dulu

Daftar Billy memuat **BATTLE: 3D**. Ini hal baru yang belum pernah ada dalam rencana.

Riset combat menghasilkan keputusan yang sudah tercatat: **taktik emergent dari manuver peta, tanpa layar battle**. Opsi layar battle terpisah ditolak dengan tiga alasan, yaitu kelelahan sembulan pada kecepatan tinggi, menambah layar besar yang harus dipelajari, dan membuat permainan terasa seperti dua game berbeda.

**Kalau keputusan itu tetap berlaku, maka satu-satunya alasan terkuat untuk pindah ke Unity hilang**, karena peta strategis 3D bisa dikerjakan di three.js dengan pola yang sudah dirancang rinci, dan lima belas layar sisanya justru lebih mudah di web.

**Kalau keputusan itu diubah dan battle 3D benar-benar diinginkan**, maka pertimbangannya berubah total dan pindah engine menjadi masuk akal.

Ini pertanyaan yang harus dijawab sebelum yang lain.

---

## 6. Kalau memang pindah engine, Unity bukan satu-satunya

| | **Unity 6** | **Godot 4 .NET** | **Tetap web** |
|---|---|---|---|
| Ukuran editor | 5 sampai 7 GB | **sekitar 200 MB** | 0 |
| Ditambah SDK | termasuk | .NET sekitar 1 GB | Node sudah ada |
| RAM editor saat idle | 2 sampai 4 GB | **sekitar 0,3 sampai 0,6 GB** | browser saja |
| **Muat di 14 GB dan 8 GB RAM** | **tidak** | **ya** | **ya** |
| C# | ya | ya | tidak, TypeScript |
| 3D | sangat matang | cukup untuk low-poly | ditulis sendiri |
| Toko aset | **sangat besar** | kecil | tidak ada |
| ECS dan Burst | ya | tidak ada padanan | bitecs |
| Lisensi | berbayar di atas ambang | **MIT, tanpa royalti** | MIT |
| Keahlian Billy | nol | nol | **sudah ada** |

**Godot 4 sekitar delapan kali lebih ringan di disk daripada Unity** dan tetap memberi tiga hal yang Billy inginkan: C#, 3D, dan editor visual. Untuk unit militer low-poly di peta strategis, kematangan 3D Godot sudah cukup.

Yang benar-benar hilang di Godot adalah Asset Store besar dan Burst. Untuk proyek pribadi yang tidak dikejar tenggat, keduanya bisa diterima.

---

## 7. Rekomendasi

**Tetap di stack web, kecuali battle 3D benar-benar wajib.**

Tiga alasan, berurut menurut kekuatan:

**Pertama, hardware tidak sanggup menjalankan Unity.** Sisa disk 14 GB dan RAM bebas 1,6 GB bukan angka yang bisa disiasati dengan disiplin. Ini penghalang keras yang akan terasa setiap hari.

**Kedua, lima belas dari tujuh belas layar adalah antarmuka padat data**, tempat HTML dan CSS unggul dan Billy sudah menguasainya. Pindah ke Unity mempermudah dua layar dan mempersulit lima belas.

**Ketiga, gerbang performa sudah lolos dengan margin tiga puluh kali.** Hasil 6,9 milidetik dari anggaran 500 pada 2.400 provinsi membuktikan arsitektur web sanggup menanggung simulasi ini. Itu bukan dugaan melainkan hasil ukur.

### Bila battle 3D memang wajib

Ada dua jalan, dan keduanya lebih baik daripada Unity di mesin ini.

**Jalan pertama, tambahkan battle 3D di three.js.** Battle strategi tidak butuh animasi karakter kelas AAA. Unit low-poly yang bergerak, menembak, dan hancur bisa dikerjakan dengan InstancedMesh dan interpolasi sederhana. Ini menjaga seluruh riset arsitektur tetap berlaku.

**Jalan kedua, pindah ke Godot 4 dengan C#, bukan Unity 6.** Delapan kali lebih ringan, muat di hardware yang ada, dan tetap memberi C# serta editor visual.

### Yang tidak berubah apa pun engine-nya

Seluruh riset desain tetap berlaku: rumus ekonomi, rantai pertempuran, sebelas kota, tujuh sumber daya, bobot kecerdasan buatan, dan angka kampanye. **Yang berubah hanya cara menjalankannya, bukan apa yang dijalankan.** Itu sebabnya keputusan ini bisa ditunda tanpa membuang pekerjaan yang sudah selesai.
