# Inventaris Tangkapan Layar Referensi

> Sumber: `~/Downloads/conflictofnations` — **797 tangkapan layar, 2,6 GB**.
> Tidak masuk git (W15). Dokumen ini memetakan isinya supaya berkas yang tepat
> bisa ditemukan tanpa membuka satu per satu.

## Koreksi terhadap catatan lama

`../../docs/planning/01-research-con-screenshots.md` menyebut "80 screenshot"
dari sesi 3–4 September. Pemeriksaan ulang menemukan korpusnya jauh lebih
besar, dan batch terbesar justru belum pernah dianalisis:

| Batch | Jumlah | Isi |
|---|---|---|
| 2026-09-03 | 86 | HUD utama, peta, pasar, intelijen, diplomasi, panel kota, mobilisasi |
| 2026-09-04 | 7 | Nation Selection, peta |
| 2026-09-05 | 672 | **Pohon riset lengkap + kartu rincian unit** |
| 2026-09-06 | 32 | Panel agen, bangunan, peta |

Batch 5 September berisi penelusuran sistematis seluruh pohon riset doktrin
European beserta kartu statistik tiap unit. Itu memberi data yang jauh melebihi
kebutuhan antarmuka: statistik unit, prasyarat, biaya, dan durasi riset,
langsung dari permainan.

Semua resolusinya 2880 × 1568 fisik (sebagian terpotong), DPR 2, sehingga
kanvas rujukannya 1440 × 784 CSS (W11).

## Layar yang tersedia

Dikonfirmasi ada di korpus:

| Layar | Batch | Catatan |
|---|---|---|
| Nation Selection | 09-03, 09-04 | Peta pemilih, daftar negara, deskripsi, doktrin |
| HUD peta utama | 09-03 | Resource bar, panel pemain, tab samping, minimap |
| Map mode per sumber daya | 09-03 | Overlay SUPPLIES, ELECTRONICS, MONEY |
| Market | 09-03 | Order book, tab TOP/ALL/MY TRADES |
| Intelligence | 09-03 | Agen, empat kategori operasi |
| Panel kota | 09-03, 09-06 | Jakarta, Sulawesi, Singapura |
| Modal konstruksi | 09-03 | Antrean, tab kategori, prasyarat |
| Modal mobilisasi | 09-03 | Tab cabang, biaya, penalti morale |
| Panel unit / army | 09-03 | 4th Fighter Squadron, 8th Mt. Guard Battalion |
| Diplomacy | 09-03 | Information, Messages & Trades |
| Events | 09-03 | Umpan kartu bertimestamp |
| Research | 09-03, 09-05 | Seluruh tab doktrin European |
| Kartu rincian unit | 09-05, 09-06 | Statistik, medan, properti tempur |
| Panel agen | 09-06 | Rekrut, tugaskan misi |

Belum ditemukan di korpus: layar pertempuran, panel provinsi non-kota,
pengaturan, tutorial, hasil perang, insurgents. Sama dengan catatan lama.

## Pembanding di luar CoN

Ada juga tangkapan layar gim lain sebagai pembanding, di folder `MAPS` dan
`scene`: Crusader Kings III, Espiocracy, States of Power, Victoria 3, Hearts of
Iron IV. Berguna untuk membandingkan kepadatan informasi, tetapi **bukan target
tiruan** — W01 mengunci CoN sebagai satu-satunya acuan.

## Cara mengindeks ulang

```sh
cd ~/Downloads/conflictofnations
ls -1d "$PWD"/Screenshot*.png | awk 'NR % 26 == 1' > /tmp/sample.txt
python3 tools/contactsheet.py /tmp/sheet.png 5 340 /tmp/sample.txt > /tmp/index.tsv
```

`contactsheet.py` menyusun kisi thumbnail bernomor dan mencetak pemetaan nomor
ke path. Membuka satu lembar kontak menggantikan membuka tiga puluh berkas.

Berkas daftar dipakai alih-alih argumen langsung karena nama tangkapan layar
macOS mengandung spasi **dan** U+202F sebelum `PM`/`AM`; keduanya memecah
pemisahan kata di shell.

## Kurasi

`../reference/` menampung salinan terkurasi — satu berkas rujukan terbaik per
layar, dinormalkan namanya. Folder itu di-ignore git (W15); korpus penuh tetap
di `~/Downloads`. Aset gambar dari CoN tidak disalin ke dalam produk (W13);
yang ditiru tata letak, palet, dan geometrinya.
