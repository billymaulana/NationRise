# Nation Rise — Jalur Web

Klon Conflict of Nations berbasis web. Jalur ini **berdiri sendiri** di samping
jalur Godot di `../game`, dan sengaja mengambil arah yang berbeda: meniru
Conflict of Nations sepersis mungkin, termasuk mikromanajemennya.

```
web/
  docs/     dokumen perencanaan jalur ini
  tools/    alat ukur tangkapan layar referensi
  reference/ tangkapan layar terkurasi (tidak masuk git)
```

## Hubungan dengan jalur Godot

| | `../game` (Godot) | `web/` (jalur ini) |
|---|---|---|
| Filosofi | Berbasis CoN, mekanik boleh menyimpang (K06) | Klon penuh, meniru persis |
| Antarmuka | GDScript + Control | Vue 3 + UnoCSS |
| Simulasi | C# di `../sim` | TypeScript di Web Worker |
| Peta | Godot 3D | three.js |

Keduanya memakai **data yang sama** dari `../pipeline/out/game/`. Tidak ada
berkas di luar `web/` yang diubah oleh jalur ini; `../docs/planning` hanya
dibaca.

## Mulai dari mana

1. `docs/00-ikhtisar.md` — kenapa jalur ini ada dan apa batasnya
2. `docs/01-kunci-web.md` — keputusan yang sudah dikunci untuk jalur ini
3. `docs/03-bahasa-visual.md` — palet dan geometri hasil pengukuran piksel
4. `docs/08-roadmap.md` — urutan pengerjaan

## Perintah

```sh
python3 tools/measure.py palette <gambar>        # turunkan token dari piksel
python3 tools/contactsheet.py out.png 6 300 daftar.txt
```
