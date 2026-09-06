# Kebijakan Batas Sengketa

> Sesi 5 (2026-09-06). Menentukan perlakuan wilayah sengketa sebelum pipeline data dibuat.
>
> **Catatan kejujuran:** riset terdelegasi untuk topik ini **gagal karena batas sesi**. Dokumen ini disusun dari pengetahuan saya sendiri. Angka luas wilayah dan status penguasaan saya yakini benar, tetapi **klaim tentang nama berkas Natural Earth dan kasus pemblokiran game ditandai [UNV] dan wajib diverifikasi** sebelum pipeline dijalankan.

## 1. Konteks yang mengubah bobot pertanyaan

Nation Rise **luring, tidak didistribusikan, dan hanya dimainkan pembuatnya sendiri**. Risiko hukum dan politik yang biasanya mendominasi keputusan ini **praktis nol**.

Yang tersisa hanya tiga pertimbangan nyata:

1. **Kestabilan teknis** — identitas provinsi dirujuk seluruh sistem dan tidak boleh berubah setelah pipeline jalan
2. **Nilai gameplay** — apakah wilayah sengketa bisa menjadi sumber ketegangan yang menarik
3. **Kenyamanan** — pemainnya orang Indonesia

---

## 2. Rancangan kita sudah punya jawabannya

Ini temuan yang membuat pertanyaan ini jauh lebih mudah daripada dugaan saya.

Skema kepemilikan provinsi yang dirancang untuk era historis sudah memuat persis yang dibutuhkan:

```
{ province_id, owner, sovereign, subject_type, core_of: [...], confidence }
```

Medan `core_of` adalah **daftar negara yang menganggap provinsi ini wilayah sahnya**. Ia dirancang agar Austria-Hungaria bisa pecah menjadi Austria, Hungaria, Cekoslowakia, dan Yugoslavia tanpa data tambahan.

Dan sistem **Lost Territories** sudah diadopsi penuh dari Ages of Conflict: permainan mengingat pemilik sah, tanah rebutan berstatus diduduki sampai diintegrasikan, dan negara yang terhapus bisa bangkit.

**Wilayah sengketa modern adalah kasus yang sama persis.** Tidak perlu sistem baru.

---

## 3. Kebijakan yang direkomendasikan

**Kepemilikan awal mengikuti keadaan nyata di lapangan; klaim yang bersaing dicatat sebagai `core_of` ganda.**

| Unsur | Nilai |
|---|---|
| `owner` | siapa yang benar-benar menguasai hari ini |
| `core_of` | **semua** pihak yang mengklaim, termasuk penguasanya |
| Akibat gameplay | negara dengan klaim mendapat **casus belli** dan pengurangan infamy saat merebutnya |

Tiga alasan mengapa ini lebih baik daripada memilih satu pihak:

**Pertama, tidak memihak.** Kedua klaim tercatat sebagai data, bukan satu dihapus.

**Kedua, teknisnya stabil.** `owner` menentukan keadaan awal dan tidak pernah ambigu, sehingga identitas provinsi aman.

**Ketiga, dan ini yang membuatnya menarik: wilayah sengketa berubah dari beban menjadi mesin cerita.** Klaim yang belum terpenuhi adalah alasan perang yang sudah tertanam di peta sejak hari pertama, tanpa perlu event yang ditulis tangan. India dan Pakistan punya alasan berkelahi karena datanya memang begitu, bukan karena diskenariokan.

---

## 4. Wilayah yang cukup besar menjadi provinsi

Dengan 3.400 provinsi untuk sekitar 149 juta kilometer persegi daratan, provinsi rata-rata sekitar **44.000 kilometer persegi**.

| Wilayah | Luas | Provinsi | `owner` | `core_of` |
|---|---|---|---|---|
| **Sahara Barat** | 266.000 | 6 | Maroko untuk bagian yang dikuasai | Maroko, Sahrawi |
| **Kashmir** | 222.000 | 5 | terbagi sesuai garis kendali nyata | India, Pakistan, Tiongkok |
| **Somaliland** | 176.000 | 4 | Somaliland | Somaliland, Somalia |
| **Arunachal Pradesh** | 84.000 | 2 | India | India, Tiongkok |
| **Aksai Chin** | 38.000 | 1 | Tiongkok | Tiongkok, India |
| **Taiwan** | 36.000 | 1 | Taiwan | Taiwan, Tiongkok |
| **Krimea** | 27.000 | 1 | Rusia | Rusia, Ukraina |

**Kashmir adalah kasus tersulit** karena terbagi tiga pihak sekaligus. Solusinya: setiap provinsi Kashmir mendapat `owner` sesuai penguasa nyatanya, dengan `core_of` memuat ketiga pihak. Itu membuat wilayahnya secara alami menjadi titik panas.

---

## 5. Wilayah yang terlalu kecil untuk menjadi provinsi

Tujuh wilayah berada jauh di bawah ukuran provinsi rata-rata dan **digabungkan ke provinsi tetangga**, dengan `core_of` diwarisi ke provinsi gabungannya.

| Wilayah | Luas | Digabung ke |
|---|---|---|
| Kosovo | 10.900 | provinsi Serbia selatan, `core_of` Kosovo dan Serbia |
| Kepulauan Kuril | 10.500 | provinsi Sakhalin, `core_of` Rusia dan Jepang |
| Abkhazia | 8.660 | provinsi Georgia barat |
| Palestina | 6.000 | provinsi Israel dengan `core_of` ganda |
| Transnistria | 4.163 | provinsi Moldova timur |
| Ossetia Selatan | 3.900 | provinsi Georgia tengah |
| Siprus Utara | 3.355 | provinsi Siprus |

Menggabungkan bukan menghapus. Klaimnya tetap hidup lewat `core_of`, hanya tidak mendapat petak sendiri di peta.

---

## 6. Konteks Indonesia

Karena pemainnya orang Indonesia, tiga hal ini layak diperlakukan dengan benar:

| Wilayah | Perlakuan |
|---|---|
| **Laut Natuna Utara** | Provinsi Natuna milik Indonesia. Klaim sembilan garis putus Tiongkok **tidak memberi `core_of`** karena ia klaim wilayah laut, bukan klaim kedaulatan daratan |
| **Blok Ambalat** | Sengketa laut dengan Malaysia, bukan daratan. Tidak menjadi provinsi |
| **Papua** | Provinsi Indonesia dengan `core_of` tunggal. Tidak ada klaim negara lain yang diakui |

**Sengketa maritim tidak diterjemahkan menjadi klaim provinsi darat.** Ini aturan umum, bukan pengecualian untuk Indonesia — berlaku juga untuk Spratly dan Paracel, yang pulau-pulaunya terlalu kecil untuk menjadi provinsi.

---

## 7. Yang wajib diverifikasi sebelum pipeline dijalankan

| Hal | Status |
|---|---|
| Nama berkas Natural Earth untuk wilayah sengketa, kemungkinan `ne_10m_admin_0_disputed_areas` dan `ne_10m_admin_0_breakaway_disputed_areas` | **[UNV]** |
| Apakah Natural Earth menyediakan berkas **sudut pandang per negara**, dan apakah ada varian Indonesia | **[UNV]** — bila ada, ia bisa menjadi dasar `core_of` yang lebih rapi daripada kurasi manual |
| Kasus game yang diblokir karena penggambaran wilayah sengketa | **[UNV]** — tidak memengaruhi keputusan karena game ini tidak didistribusikan |
| Kebijakan resmi Natural Earth soal batas sengketa | **[UNV]** — riset awal menyebut Natural Earth memakai de facto, sejalan dengan rekomendasi ini |

Tidak satu pun dari ini mengubah kebijakannya. Yang berubah hanya **dari mana datanya diambil**, bukan bagaimana ia diperlakukan.
