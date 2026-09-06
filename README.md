# Nation Rise

Game strategi negara pemain tunggal yang berjalan luring, dengan peta dunia
3.400 provinsi dan 195 negara yang dikendalikan komputer.

## Struktur

| Direktori | Isi |
|---|---|
| `sim/NationRise.Core` | Simulasi, C# murni tanpa ketergantungan engine |
| `sim/NationRise.Core.Tests` | Uji unit dan uji batas arsitektur |
| `game/` | Proyek Godot: renderer, antarmuka, jembatan ke simulasi |
| `pipeline/` | Skrip Node.js yang membangun data peta saat build |
| `docs/planning/` | Dokumen desain dan riset |
| `tools/` | Bangku uji keseimbangan dan pengukur performa |

## Menjalankan

```sh
export PATH="$HOME/.dotnet:$PATH"

cd sim && dotnet test
cd game && dotnet build
~/Applications/Godot_mono.app/Contents/MacOS/Godot --path game
```

Simulasi sengaja dapat diuji tanpa Godot terpasang. Bila itu berubah, batas
antar lapisan sudah bocor.

## Dokumen yang perlu dibaca lebih dulu

- `docs/planning/KUNCI.md` — keputusan yang sudah dikunci
- `docs/planning/58-arsitektur-godot.md` — arsitektur
- `docs/planning/53-draft-planning.md` — rencana kerja dan tonggak
