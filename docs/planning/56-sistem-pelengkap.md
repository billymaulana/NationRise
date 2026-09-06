# Lima Sistem yang Dirinci Sampai Angka

> Sesi 5 (2026-09-06). Review menyeluruh menandai lima sistem sebagai tercatat tetapi belum berangka: sifat komandan, agenda yang terlihat pemain, keragaman antar kampanye, audio, dan aksesibilitas. Dokumen ini melengkapinya.
>
> Jangkar diambil dari riset yang sudah ada. Yang murni rancangan kami ditandai **[USULAN]**.

---

# BAGIAN 1 — Sifat Komandan

## 1.1 Kerangka yang sudah diputuskan

Tiga sampai enam komandan per negara, satu per kelompok tentara. Keahlian satu sampai lima, memberi **+2,5 persen per tingkat**. Dua sampai empat sifat dari kolam empat belas. Satu kemampuan aktif dengan waktu tunggu 72 tick.

Jangkar dari Hearts of Iron IV: sifat medan memberi +10 persen, Logistics Wizard −15 persen konsumsi pasokan, Fortress Buster +15 persen terhadap benteng. Dari Crusader Kings III: Logistician +40 persen pasokan, Military Engineer −10 persen waktu pengepungan, sifat diperoleh dengan peluang per kemenangan.

## 1.2 Enam sifat medan

Masing-masing memberi **+15 persen serangan dan pertahanan** di medannya. Angka ini di antara Hearts of Iron IV yang +10 dan Crusader Kings III yang memberi keunggulan lebih besar.

| Sifat | Medan | Catatan |
|---|---|---|
| **Ahli Gunung** | pegunungan, perbukitan | Medan tersulit; sifat paling bernilai di Papua dan Sumatra |
| **Ahli Rimba** | hutan, rimba | **Paling relevan untuk Indonesia** |
| **Ahli Kota** | perkotaan, pinggiran | Bernilai saat menyerang kota |
| **Ahli Gurun** | gurun, semak | Nyaris tak berguna bagi Indonesia; berguna bila berekspansi |
| **Ahli Amfibi** | pendaratan pantai | Membatalkan separuh penalti pendaratan yang −50 persen |
| **Penyeberang Sungai** | menyeberang sungai | Membatalkan penalti menyeberang yang ×0,7 |

## 1.3 Delapan sifat fungsi

| Sifat | Efek | Jangkar |
|---|---|---|
| **Ahli Logistik** | Jangkauan pasokan **+1 provinsi**; masa tenggang terputus **72 tick** dari 48 | HoI4 Logistics Wizard |
| **Ahli Zeni** | **+20 persen** terhadap benteng; kecepatan pengepungan **+50 persen** | HoI4 Fortress Buster, CK3 Military Engineer |
| **Penipu** | Intel musuh terhadap tumpukan ini **turun satu tingkat** | HoI4 Trickster |
| **Hati-hati** | Kehilangan moral **×0,7**, tetapi kerusakan **×0,95** | Vic3 Cautious Advance |
| **Nekat** | Kerusakan **×1,15**, kehilangan moral **×1,3** | Vic3 Reckless Advance |
| **Bertahan** | Kecepatan berparit **×1,5** | HoI4 Defensive Doctrine |
| **Perampok** | Gerak **+20 persen** di wilayah musuh; pasokan musuh di provinsi itu **−50 persen** | [USULAN] |
| **Laksamana** | Khusus laut. Rasio blokade turun ke **1,5** dari 2,0 | [USULAN] |

## 1.4 Perolehan sifat

Peluang mendapat sifat setelah kemenangan yang relevan: **(2 + keahlian) persen**. Sifat kedua dan seterusnya **setengahnya**.

Komandan berkeahlian 3 karena itu punya peluang 5 persen per kemenangan untuk sifat pertama, dan 2,5 persen untuk berikutnya. Pada kampanye 45 hari dengan sekitar 20 kemenangan, harapannya sekitar **satu sifat baru per kampanye** per komandan aktif.

Komandan di tumpukan yang menyerah punya peluang **10 persen tertangkap** dan hilang, mengikuti Crusader Kings III.

## 1.5 Empat kemampuan aktif

Waktu tunggu **72 tick**, yaitu tiga hari game. Satu komandan hanya memiliki satu.

| Kemampuan | Efek | Durasi |
|---|---|---|
| **Gerak Paksa** | Kecepatan **+50 persen**, tetapi **−5 HP per jam** | 24 tick |
| **Pasokan Darurat** | Status pasokan dipulihkan ke Supplied | 48 tick |
| **Tipuan** | Perkiraan kekuatan yang dilihat musuh di provinsi lain **×1,5** | 24 tick |
| **Barase Terpusat** | Kerusakan **+50 persen** | 6 tick |

## 1.6 Transparansi

**Sifat komandan musuh terbaca pada intel tingkat 3.** Ini mengikuti prinsip keterbacaan dari riset kecerdasan buatan: pemain harus bisa mengetahui mengapa lawannya kuat, bukan menebaknya.

---

# BAGIAN 2 — Agenda yang Terlihat Pemain

## 2.1 Kalibrasi skala

Hubungan berjalan dari −100 sampai +100 dengan lima ambang sikap:

| Sikap | Ambang |
|---|---|
| Bersekutu | +60 |
| Bersahabat | +25 |
| Netral | −25 sampai +25 |
| Tidak bersahabat | −60 |
| Bermusuhan | −100 |

Jarak antar ambang terkecil adalah **35 poin**. Keputusan D114 membatasi satu pemicuan agenda pada **25 persen jarak antar ambang**, sehingga **modifier maksimum adalah 8**.

Pembandingnya Civilization VI, yang memakai ±6 untuk 50 dari 101 modifiernya. Skala kita sedikit lebih lebar karena rentang hubungannya juga lebih lebar.

## 2.2 Empat belas agenda

Setiap negara mendapat **satu agenda tetap** dari karakter negaranya dan **satu agenda tersembunyi** yang diacak. Yang tersembunyi terungkap pada intel tingkat 2.

| Agenda | Menilai | Modifier |
|---|---|---|
| **Penjaga Selat** | Armada asing di selat wilayahnya | −8 bila ada, +4 bila konsisten menjauh |
| **Anti Ekspansi** | Provinsi yang ditaklukkan pihak lain | **−8 per lima provinsi**, maksimum −40 |
| **Pembangun** | Rasio bangunan berbanding militer | +6 bila tinggi, −6 bila militeristik |
| **Militeris** | Kebalikan Pembangun | +6 bila militernya besar |
| **Pembeli Setia** | Konsistensi berdagang | **+6** setelah 10 transaksi tanpa jeda panjang |
| **Pemburu Teknologi** | Keunggulan riset | +6 bila unggul, netral bila tertinggal |
| **Tetangga Baik** | Pasukan di provinsi perbatasan | −8 bila menumpuk, +4 bila kosong |
| **Anti Nuklir** | Riset senjata pemusnah massal | **−8 tetap** begitu diketahui |
| **Pedagang Bebas** | Embargo yang diberlakukan | −6 per embargo |
| **Pengumpul Sekutu** | Jumlah sekutu pihak lain | +4 bila banyak |
| **Penyendiri** | Kebalikannya | −4 bila banyak |
| **Penuntut Warisan** | Penguasa provinsi yang menjadi `core_of`-nya | **−8 tetap**, tidak bisa hilang selama provinsi dikuasai |
| **Kekuatan Laut** | Ukuran armada pihak lain | −6 bila armadanya besar |
| **Oportunis** | Apakah pihak lain sedang berperang | +6 selama ia sibuk berperang |

**Indonesia mendapat Penjaga Selat sebagai agenda tetap.** Itu langsung dari geografinya: empat dari dua belas kotanya adalah penjaga selat.

**Penuntut Warisan adalah yang paling penting secara sistem**, karena ia menyambung langsung ke `core_of` dari kebijakan batas sengketa. India dan Pakistan bermusuhan karena datanya memang begitu.

## 2.3 Dua batas yang menjaga persepsi

Riset kecerdasan buatan menemukan pemain Civilization VI mengingat penalti −6 sebagai −20, yaitu **3,3 kali lebih besar**, karena frekuensi pemberitahuan.

| Batas | Nilai |
|---|---|
| Pemberitahuan agenda per negara | **maksimum satu per 30 hari game** |
| Bagian jarak antar ambang yang ditutup satu pemicuan | **maksimum 25 persen** |
| Metrik uji | Selisih persepsi ≤ 1,5 kali |

---

# BAGIAN 3 — Keragaman Antar Kampanye

## 3.1 Masalahnya

Tanpa pengacakan, kampanye kedua identik dengan yang pertama: sumber daya di tempat yang sama, negara yang sama menyerang pada hari yang sama. Ini yang membuat game strategi hanya dimainkan sekali.

## 3.2 Lima hal yang diacak [USULAN]

| Yang diacak | Besarnya | Alasan |
|---|---|---|
| **Posisi sumber daya provinsi** | 30 persen provinsi punya sumber daya; posisinya diacak dalam batas realistis per benua | Mengikuti Conflict of Nations yang mengacak posisi resource saat game dibuat |
| **Agenda tersembunyi** | Satu dari 14, acak per negara | Membuat diplomasi tidak dihafal |
| **Arketipe kecerdasan buatan** | **60 persen** ditentukan karakter negara, **40 persen** acak | Rusia hampir selalu agresif, tetapi tidak selalu |
| **Kekuatan awal** | **±15 persen** pada jumlah unit dan stok awal | Mengikuti Realpolitiks; cukup terasa tanpa merusak keseimbangan |
| **Peristiwa dunia** | **Empat dari kolam 30**, dipicu pada hari acak dalam jendelanya | Tiap kampanye punya krisis berbeda |

Batas realistis untuk sumber daya berarti minyak tidak muncul di Swiss dan padi tidak muncul di Sahara. Pengacakan terjadi **di dalam kelompok yang masuk akal**, bukan bebas sepenuhnya.

## 3.3 Seed ditampilkan

Setiap kampanye punya **seed yang terlihat di layar setup dan tersimpan di berkas simpanan**. Pemain bisa memasukkan seed yang sama untuk mengulang dunia yang persis sama.

Ini penting untuk dua hal: penyeimbangan yang bisa diulang, dan pemain yang ingin mencoba strategi berbeda di dunia yang sama.

## 3.4 Yang tidak boleh diacak

| Tetap | Alasan |
|---|---|
| Geometri provinsi dan ketetanggaan | Pengetahuan peta adalah keterampilan yang dibangun pemain |
| Kepemilikan awal | Ini permainan sejarah alternatif, bukan dunia fiksi |
| Lokasi kota | Sama |
| Angka unit dan rumus | Keseimbangan harus bisa dipelajari |

---

# BAGIAN 4 — Audio

## 4.1 Anggaran

| Jenis | Jumlah | Panjang | Ukuran |
|---|---|---|---|
| Ambient damai | 4 | 4 menit | 15,0 MB |
| Ambient perang | 3 | 4 menit | 11,2 MB |
| Ketegangan | 2 | 2,5 menit | 4,7 MB |
| Kemenangan | 1 | 1,5 menit | 1,4 MB |
| Kekalahan | 1 | 1,5 menit | 1,4 MB |
| Menu | 1 | 3 menit | 2,8 MB |
| **Musik** | **12** | | **36,6 MB** |
| Efek suara | 32 | | 1,6 MB |
| **Total** | | | **38,2 MB** |

Format OGG Vorbis 128 kbps stereo, yang didukung Godot secara asli.

## 4.2 Musik mengikuti keadaan

Trek dipilih menurut keadaan permainan, dengan **crossfade tiga detik** agar tidak berganti mendadak.

| Keadaan | Trek |
|---|---|
| Damai, tidak berperang | Ambient damai |
| Berperang | Ambient perang |
| Ibu kota terancam, atau senjata pemusnah massal terdeteksi | Ketegangan |
| Ambang kemenangan tercapai | Kemenangan sekali, lalu kembali ambient |

## 4.3 Tiga puluh dua efek suara

| Kelompok | Jumlah | Contoh |
|---|---|---|
| Antarmuka | 10 | klik, buka panel, tutup, kesalahan, geser slider |
| Pemberitahuan | 8 | pergantian hari, riset selesai, konstruksi selesai, kota jatuh, perang diumumkan |
| Peta | 6 | pilih provinsi, gerakkan unit, unit tiba, jalur digambar |
| Pertempuran | 8 | pertempuran dimulai, tumpukan hancur, pengepungan berakhir, rudal diluncurkan |

## 4.4 Empat bus dan aturan yang tidak boleh dilanggar

Godot menyediakan sistem bus audio. Empat bus dengan slider terpisah: **Master, Musik, Efek, Antarmuka**.

Dua aturan:

**Pemberitahuan tidak pernah berbunyi lebih dari sekali per tick.** Pada kecepatan 8x, satu tick berlangsung 1,6 detik, sehingga tanpa batas ini bunyinya akan menumpuk menjadi derau.

**Bunyi pertempuran dimatikan otomatis di atas kecepatan 4x.** Pada kecepatan itu pemain tidak lagi menonton pertempuran satu per satu.

## 4.5 Sumber aset

| Sumber | Lisensi | Catatan |
|---|---|---|
| freesound.org | CC0 dan CC-BY | Efek suara; saring ke CC0 |
| OpenGameArt | CC0, CC-BY | Musik dan efek |
| Sonniss GDC Bundle | bebas royalti | Pustaka besar, dirilis tahunan |
| Kevin MacLeod | CC-BY | Butuh atribusi; catat di layar Kredit |

---

# BAGIAN 5 — Aksesibilitas

## 5.1 Kontras dan teks

| Ukuran | Nilai |
|---|---|
| Rasio kontras teks normal | **minimum 4,5 banding 1** |
| Rasio kontras teks besar dan ikon | **minimum 3 banding 1** |
| Skala font | **100, 125, dan 150 persen** |
| Ukuran sasaran klik | **minimum 44 kali 44 piksel** |

Angka kontras mengikuti WCAG 2.2 tingkat AA. Ini bukan sekadar kepatuhan: panel biru-baja gelap dengan teks abu, yang menjadi gaya visual acuan, **mudah sekali jatuh di bawah 4,5 banding 1** bila tidak diperiksa dengan alat.

Skala font harus dirancang sejak awal karena sistem tema Godot tidak punya padanan CSS. Menambahkannya belakangan berarti menyentuh setiap panel.

## 5.2 Buta warna

Sekitar **delapan persen laki-laki** mengalami buta warna, dengan deuteranomali sebagai bentuk paling umum. Untuk game yang seluruh petanya adalah wilayah berwarna, ini bukan kasus pinggiran.

**Aturan keras: warna tidak pernah menjadi satu-satunya pembawa informasi.**

| Informasi | Warna | Pendamping wajib |
|---|---|---|
| Kepemilikan provinsi | warna negara | **pola arsir** berbeda untuk sekutu, musuh, netral |
| Status pasokan | hijau, kuning, merah | **ikon** rantai utuh, rantai retak, rantai putus |
| Kesehatan unit | bilah warna | **angka** HP tertulis |
| Hubungan diplomatik | warna | **label teks** sikap |

Tiga preset palet: **deuteranopia, protanopia, tritanopia**, yang mengubah warna negara ke rentang yang dapat dibedakan.

## 5.3 Waktu dan kendali

| Ukuran | Nilai |
|---|---|
| Jeda | **kapan saja, tanpa batas** — sudah menjadi bagian inti |
| Jeda otomatis | bertingkat, bisa diatur per jenis kejadian |
| Kecepatan terendah | Ambient, 60 menit nyata per hari game |
| Papan ketik | seluruh tindakan panel dapat dicapai tanpa tetikus |

Kecepatan Ambient yang 60 menit per hari game awalnya dirancang untuk permainan santai, tetapi ia **sekaligus menjadi fitur aksesibilitas**: pemain yang butuh waktu lebih lama untuk membaca dan memutuskan mendapatkannya tanpa mode khusus.

## 5.4 Yang tidak dijanjikan

Godot tidak punya dukungan pembaca layar bawaan, dan membangunnya sendiri untuk antarmuka sepadat ini berada jauh di luar cakupan proyek pribadi. **Ini dinyatakan terbuka, bukan didiamkan.**

Yang dijanjikan adalah semua yang tercantum di atas, dan semuanya bisa diuji dengan angka.
