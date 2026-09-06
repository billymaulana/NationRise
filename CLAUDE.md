# Nation Rise — Aturan Proyek

Game strategi negara pemain tunggal, luring, berbasis Conflict of Nations.
Engine **Godot 4.7 mono**, simulasi **C# murni**, antarmuka **GDScript**.

Keputusan yang sudah dikunci ada di `docs/planning/KUNCI.md`.
Seluruh keputusan beserta alasannya ada di `docs/planning/16-decisions.md`.
Arsitektur ada di `docs/planning/58-arsitektur-godot.md`.

## Batas arsitektur yang tidak boleh dilanggar

Ketergantungan hanya mengalir ke bawah:

```
UI (GDScript) → Renderer (C# + Godot) → Bridge → Simulation Core (C# murni)
```

- **`sim/NationRise.Core` tidak boleh mereferensikan Godot.** Berkas proyeknya
  menggagalkan build bila GodotSharp muncul, dan `LayeringTests` menegaskannya
  lagi dari dalam rangkaian uji.
- **`dotnet test` harus lolos tanpa Godot terpasang.** Bila suatu hari uji
  membutuhkan engine, lapisannya sudah bocor.
- **`game/` mereferensikan `sim/`, tidak pernah sebaliknya.**
- Tipe di Core tidak boleh punya properti bertema tampilan (`Color`, `Mesh`,
  `Texture`, `Screen`). Ada uji yang memindainya.

## Determinisme

- PRNG selalu `DeterministicRandom` berseed; **jangan** `System.Random` atau
  `Random.Shared`.
- Ekonomi memakai bilangan bulat atau titik tetap, bukan titik mengambang.
- Urutan iterasi harus tetap; jangan mengiterasi `Dictionary` untuk logika.
- Satu tick adalah fungsi murni dari state dan seed.

## Gaya kode

- Comment hanya untuk **WHY yang tidak terlihat dari kode**, dan memakai blok
  `/* ... */`. Jangan menjelaskan WHAT.
- **Dilarang** menyebut Claude, AI, agen, atau alat sesi apa pun di dalam kode,
  commit, maupun pull request.
- **Dilarang** merujuk berkas markdown perencanaan dari dalam kode.
- Nama identifier memakai bahasa Inggris; dokumen perencanaan bahasa Indonesia.

## Perintah

```sh
export PATH="$HOME/.dotnet:$PATH"        # .NET terpasang di ~/.dotnet
cd sim  && dotnet test                   # simulasi, tanpa Godot
cd game && dotnet build                  # proyek Godot
~/Applications/Godot_mono.app/Contents/MacOS/Godot --path game
```

## Alur kerja

- **Tuntaskan pekerjaan sampai selesai.** Jangan berhenti di tengah untuk
  melapor dan menunggu. Satu instruksi berarti kerjakan seluruh rantainya:
  rancang, tulis, uji, perbaiki temuan, commit, push. Laporan datang setelah
  pekerjaannya berdiri, bukan sebagai jeda di tengah.
- **Jangan meminta persetujuan berulang untuk pekerjaan yang sudah diinstruksikan.**
  Di proyek ini commit, push, pemasangan alat, dan perubahan berkas dilakukan
  langsung. Berhenti bertanya hanya untuk hal yang benar-benar merusak atau
  yang mengubah arah desain.
- **Bug yang ditemukan di tengah jalan diperbaiki saat itu juga**, tidak
  dicatat untuk nanti, kecuali memang mengubah arah desain.
- Laporkan hasil dan temuan, bukan permintaan izin.

## Git

- Commit semantic satu baris: `<type>(<scope>): <subject>`, maksimal ~72 karakter,
  tanpa badan pesan.
- Tanpa `Co-Authored-By`.
- `git add` selalu menyebut path; jangan `git add .`.
- Jangan pernah commit `bin/`, `obj/`, `.godot/`, `pipeline/raw/`, atau artefak MCP.
