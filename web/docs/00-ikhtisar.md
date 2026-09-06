# Ikhtisar Jalur Web

> Dokumen pertama jalur `web/`. Ditulis 2026-09-06.
> Indeks lengkap ada di `../README.md`.

## Kenapa jalur ini ada

Jalur Godot di `../../game` sudah berjalan: simulasi C# lengkap dengan 323 uji
hijau, pipeline data dunia, dan peta 3D yang bisa dimainkan. Yang tidak
memuaskan adalah **tampilannya**. Billy menilai antarmuka Godot jelek, dan
menginginkan opsi kedua yang dikerjakan paralel, bukan pengganti.

Jalur ini menjawab itu dengan menukar lapisan yang bermasalah saja. Data dunia,
formula ekonomi, dan riset antarmuka Conflict of Nations tetap dipakai; yang
ditulis ulang adalah penyaji dan antarmukanya.

## Perbedaan filosofi yang disengaja

Jalur Godot terikat K06 di `../../docs/planning/KUNCI.md`: *berbasis CoN, tetapi
tidak harus clone penuh; mekanik perang boleh berbeda demi mengurangi
mikromanajemen*.

Jalur web mengambil sikap sebaliknya, dan itulah alasan ia ada sebagai jalur
terpisah: **meniru Conflict of Nations sepersis mungkin**, termasuk
mikromanajemen yang sengaja dipangkas di jalur Godot. Lihat W01 di
`01-kunci-web.md`.

Dua jalur, dua taruhan. Jalur Godot bertaruh bahwa menyederhanakan CoN
menghasilkan permainan yang lebih enak; jalur web bertaruh bahwa yang membuat
CoN terasa enak justru kepadatannya, dan yang perlu diperbaiki hanya
penyajiannya.

## Batas yang dipegang jalur ini

- **Tidak menyentuh apa pun di luar `web/`.** `../../docs/planning`,
  `../../sim`, `../../game`, dan `../../pipeline` hanya dibaca.
- **Data dunia tidak digandakan sebagai sumber kebenaran.** Berkas di
  `../../pipeline/out/game/` disalin ke aset publik saat build; pipeline tetap
  satu-satunya penghasilnya.
- **Simulasi C# adalah implementasi rujukan, bukan dependensi runtime.**
  Port TypeScript-nya harus berdiri sendiri di peramban.

## Yang diwarisi, yang ditulis ulang

| Lapisan | Status |
|---|---|
| Data dunia (`provinces.geojson`, `world.bin`, `nations.json`, `bathymetry.bin`) | Diwarisi apa adanya |
| Riset antarmuka CoN (`../../docs/planning/01-research-con-screenshots.md`, `29-screen-specs.md`) | Diwarisi sebagai masukan |
| Formula ekonomi dan tempur (`43-combat-damage-formula.md`, `50-resource-final.md`) | Diwarisi sebagai spesifikasi |
| Simulasi (6.148 baris C#, 323 uji) | Diport ke TypeScript, uji ikut diport |
| Penyaji peta | Ditulis ulang dengan three.js |
| Antarmuka | Ditulis ulang dengan Vue 3 |

## Kriteria berhasil

Jalur ini dianggap berhasil bila, disandingkan dengan tangkapan layar
Conflict of Nations asli pada resolusi yang sama, perbedaannya harus dicari —
bukan langsung terlihat. Ukurannya konkret dan ada di `03-bahasa-visual.md`:
palet, geometri, dan tipografi diturunkan dari piksel tangkapan layar, lalu
diverifikasi ulang dengan `getComputedStyle` setelah dibangun.
