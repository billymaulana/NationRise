# Verifikasi Teknis Godot

> Sesi 5 (2026-09-06). Hasil riset yang memverifikasi keputusan D121. **Keputusan tetap berdiri**, tetapi beberapa klaim saya salah dan ada tujuh batasan yang harus dipatuhi saat membangun.
>
> [V] terverifikasi dari sumber resmi. [UNV] tidak berhasil diverifikasi.

## 1. Versi dan anggaran disk [V]

**Godot 4.7.2-stable**, rilis 18 Agustus 2026.

| Berkas | Ukuran unduhan |
|---|---|
| Editor macOS universal standard | 162,7 MB |
| **Editor macOS universal .NET** | **191,5 MB** |
| Export templates .NET | 1,15 GB |
| .NET SDK 10 macOS arm64 | 215,1 MB |
| **Total unduhan** | **sekitar 1,56 GB** |

Kebutuhan penyimpanan menurut dokumentasi resmi: **200 MB** untuk editor saja, **1,5 GB** termasuk seluruh export template. Ditambah .NET SDK terpasang yang tidak dipublikasikan ukurannya [UNV], perkiraan total **2 sampai 2,5 GB**, ditambah proyek 1 sampai 2 GB.

**Dari 14 GB tersisa, ini aman.** Bandingkan Unity yang butuh 8 sampai 12 GB.

### RAM [V]

Dokumentasi resmi menyebut **Apple M1 secara eksplisit** di baris minimum maupun rekomendasi.

| | RAM | Storage |
|---|---|---|
| Editor minimum | 4 GB | 200 MB |
| **Editor rekomendasi** | **8 GB** | 1,5 GB |
| Game hasil export | 2 sampai 4 GB | 150 MB |

**Mesin Billy tepat di angka rekomendasi, bukan di atasnya.** Editor .NET ditambah .NET SDK ditambah editor kode di 8 GB akan sempit, meski jauh lebih lapang daripada Unity.

---

## 2. Kabar baik yang memperkuat keputusan

### 2.1 Metal native, bukan MoltenVK [V]

Ini temuan penting yang membalik asumsi saya. Dari `ProjectSettings` cabang 4.7, kunci `rendering/rendering_device/driver.macos`:

> "`metal` (**default**), Metal from native drivers, **only supported on Apple Silicon Macs**."

Saya sebelumnya menyebut Godot memakai Vulkan lewat MoltenVK di macOS. **Itu tidak lagi benar.** Di M1, Godot 4.7 memakai driver Metal native, dan MoltenVK hanya fallback untuk Mac Intel. Ini berarti satu lapisan penerjemahan hilang.

Pencarian isu terbuka dengan "Apple Silicon" di judul hanya menghasilkan tiga hasil, dan tidak satu pun soal rendering desktop. **Tidak ada masalah rendering M1 yang menonjol.**

### 2.2 Threading benar-benar mumpuni [V]

`Thread`, `Mutex`, `Semaphore`, dan `WorkerThreadPool` tersedia. Dokumentasi menyatakan: *"Most Global Scope singletons are thread-safe by default."*

Menjalankan tick simulasi 195 negara di thread terpisah **aman dan didukung**, selama datanya struktur murni dan hasilnya dikirim ke antarmuka lewat `call_deferred`.

### 2.3 MultiMesh untuk ribuan unit [V]

Dokumentasi: *"can draw up to millions of objects in one go"* dalam **satu draw call**. Contoh kode resmi memakai 10.000 instance.

---

## 3. Tujuh batasan yang harus dipatuhi

### 3.1 `Tree` hanya melakukan draw-culling, bukan virtualisasi [V, diverifikasi dari kode sumber]

Ini koreksi terhadap asumsi saya. Dari `scene/gui/tree.cpp` cabang 4.7, untuk baris **di atas** viewport kode tidak keluar lebih awal; ia tetap menjalankan `set_width()` dan `compute_item_height()` sebelum `continue`.

Tiga akibatnya:

| Akibat | Besarnya |
|---|---|
| Penelusuran tetap **O(n) per redraw** | Scroll ke baris 2.000 tetap menyisir 2.000 baris kali jumlah kolom |
| Memori **O(baris kali kolom)** | Setiap sel punya `TextLine` sendiri |
| **Redraw penuh dipicu gerakan tetikus** | `whole_needs_redraw` saat hover pindah baris header |

**Penilaian untuk proyek ini:** tabel terbesar kita adalah daftar diplomasi 195 negara. Pada 195 baris kali sekitar 8 kolom, biayanya masih kecil. **Batasan ini tidak menggigit selama tidak ada layar berisi daftar seluruh 2.400 provinsi**, dan menurut dokumen 29 memang tidak ada.

### 3.2 `Tree` tidak punya penyortiran bawaan [V]

Tidak ada satu pun method sort di kelas `Tree`. Yang ada hanya sinyal `column_title_clicked`.

**Konsekuensi:** penyortiran dilakukan pada data lalu **seluruh Tree dibangun ulang**. Untuk 195 baris ini murah, tetapi harus ditulis sendiri dan dipakai konsisten di semua tabel.

### 3.3 Tidak ada virtualisasi daftar untuk konten Control kustom [V]

Proposal utamanya masih terbuka sejak Mei 2024, dan duplikatnya ditutup Mei 2026 tanpa solusi di core. Kutipan maintainer: *"10000 entries in the list currently require the creation of 10000 control nodes, while in practice no more than 10 such controls can be visible at the same time."*

**Konsekuensi:** untuk daftar panjang berkonten kustom, pakai `ItemList` yang **benar-benar melakukan virtualisasi** lewat pencarian biner, atau bangun sendiri. Jangan memakai `VBoxContainer` di dalam `ScrollContainer` untuk daftar panjang.

### 3.4 Tidak ada padanan CSS [V]

Tidak ada cascade, tidak ada selector, tidak ada breakpoint. Tata letak dikerjakan lewat anchor, container, dan stretch ratio. `GridContainer` bahkan tidak mendukung stretch ratio per sel.

**Konsekuensi:** sistem tema harus dirancang sekali di awal sebagai kumpulan Theme Type Variation, lalu dipakai konsisten. Menunda ini akan menghasilkan penyalinan gaya berulang, yang persis dikeluhkan komunitas.

### 3.5 Bahasa: C# untuk simulasi, GDScript untuk antarmuka [V]

Ini nuansa yang memperkuat rekomendasi sebelumnya dengan alasan yang lebih tepat. FAQ resmi:

> "C# can be faster **in situations with few calls to Godot engine code**."
> "C# can be **slower than GDScript when making many Godot API calls, due to the cost of marshalling**."

**Dua bagian terberat proyek ini jatuh di dua sisi berlawanan.** Simulasi ekonomi dan kecerdasan buatan adalah komputasi murni dengan sedikit panggilan engine, sehingga C# menang. Antarmuka padat data memanggil `Tree.create_item()` dan `set_text()` ribuan kali, sehingga GDScript justru bisa lebih cepat.

**Keputusan: C# untuk lapisan simulasi, GDScript untuk lapisan antarmuka.** Godot mendukung keduanya dalam satu proyek.

### 3.6 Jangan pakai Node untuk entitas data [V]

Tidak ada ECS di core Godot. Dokumentasi optimasi menyatakan scene system punya *"extra layer of complexity"* dan *"It is not possible to use multiple threads to control them"*.

**Konsekuensi:** 2.400 provinsi disimpan sebagai **struktur array**, bukan sebagai node. Visualnya lewat `RenderingServer` dan `MultiMesh`. Ini sudah menjadi rencana kita sejak awal, jadi tidak ada perubahan.

### 3.7 MultiMesh tidak punya culling per instance [V]

Dokumentasi: *"there is no screen or frustum culling possible for individual instances"* dan *"if the instances are too far away from each other, performance may be reduced"*.

**Konsekuensi:** jangan satu MultiMesh global untuk seluruh unit di peta dunia. **Pecah per teater atau benua** agar culling all-or-none tetap berguna.

---

## 4. Dua hal lain yang perlu diingat

**`AStar2D` dan `AStar3D` tidak thread-safe [V].** Pathfinding harus dilindungi mutex atau memakai implementasi sendiri di dalam thread simulasi. Karena kita sudah merancang A* sendiri di atas graf provinsi, ini tidak menjadi masalah.

**Isu Metal saat FPS dibatasi [V].** Isu terbuka `#114258` menyebut *"Severe process time increase when max_fps is capped"* di macOS. Kita berencana membatasi FPS untuk hemat baterai, jadi **ini harus diuji sejak awal**, bukan diasumsikan bekerja.

**Alat inspeksi mati di atas sekitar 3.000 node [V].** Remote Scene Tree menjadi lambat mulai sekitar 3.000 node. Karena antarmuka kita bisa punya ribuan Control, alat inspeksi justru melemah di layar yang paling membutuhkannya. Mitigasinya: jaga jumlah node antarmuka tetap rendah dengan memakai `Tree` dan `ItemList` alih-alih ratusan Control terpisah.

---

## 5. Yang tidak berhasil diverifikasi

Ukuran terpasang persis berkas `.app` dan .NET SDK; biaya konkret 2.400 Node2D dalam MB atau mikrodetik; batas praktis MultiMesh pada M1 dalam angka; keluhan komunitas soal kualitas penggambaran teks. Situs benchmark resmi Godot mengembalikan 404.

Ketidakpastian ini tidak mengubah keputusan, tetapi berarti **gerbang performa harus diukur ulang di Godot pada fase 1**, sama seperti yang sudah kita lakukan untuk JavaScript.
