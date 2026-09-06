# Riset Lanjutan: Skala Waktu

> Sumber: plan riset Nation Rise, sesi 2026-09-03 sampai 2026-09-04, bagian 10. Dokumen ini bagian dari `docs/planning/`; indeks dan aturan kerja ada di `README.md`. Nomor "bagian N" yang dirujuk di dalam teks mengacu ke penomoran plan asli; petanya ada di README.

## 10. Riset Lanjutan: Skala Waktu (hasil; rekomendasi, belum diputuskan Billy)

### 10.1 Preseden
- **CoN/Bytro**: hanya 1x dan 4x. Pada 4x **angka durasi in-game tidak berubah, hanya jam nyata dipercepat** (FAQ resmi "Why doesn't the speed change on 4x maps?": konstruksi 1 hari selesai 6 jam nyata). Komentar: 4x "demanding constant vigilance", cocok pemula belajar. Game CoN 20 sampai 30 hari (peta kecil) sampai 40 sampai 60 hari (WW3). Supremacy 1914 speed round 4x, runtime tetap 14 hari nyata. Call of War speed event 2x/4x/6x/10x.
- **Paradox** (detik nyata per hari game, speed 1 sampai 5): EU4 dan CK3: 2 / 1 / 0.5 / 0.2 / unbounded (tick hari). HoI4 (tick jam): 48 / 12 / 4.8 / 2.4 s per hari / unbounded (`GAME_SPEED_SECONDS = {2.0, 0.5, 0.2, 0.1, 0.0}` per jam). EU5: 12 / 6 / 3 / 1.2 / 0.6 / 0.24 / unbounded (7 tingkat). Vic3 tick 6 jam, max ~0.5 s/hari. Pola: 5 tingkat, rasio geometrik ≈ ×2, ×2, ×2.5, rentang speed 1 → 4 = 10x, tingkat terakhir tanpa batas (terbukti membuat pemain melewatkan notifikasi).
- Auto-pause: EU4 "Pause on events"; HoI4 satu toggle "Pause on notifications" (dikeluhkan tidak granular); CK2 prioritas per jenis pesan 1 sampai 5 (popup / feed tinggi / feed rendah / log / sembunyi); Stellaris 3.8 per pesan: disabled / enabled / auto-pause, plus toast.
- Realpolitiks II: hanya Pause / Normal / Fast, dev menolak menambah; membuka Military Staff auto-pause. SuperPower 2: T0 sampai T4, AI rusak di atas 4x. Ages of Conflict: 4 tingkat 0.5x sampai 2x, tick ekonomi 5 detik.
- Prinsip (Shafer, Shamus Young, Soren Johnson): pacing = laju keputusan menarik; RTWP gagal saat "bored or overwhelmed"; auto-pause terkonfigurasi per jenis, abaikan input unpause sesaat setelah auto-pause, gabungkan notifikasi tick yang sama; auto-pause adalah jembatan untuk pemain turn-based; "if a game maintains the same depth, shorter is better". Dua tuas berbeda: **kompresi durasi** (Civ speed 67/100/150/300) vs **kecepatan nyata** (Bytro); jangan dicampur tanpa sadar.
- Pertempuran per tick pada 1 hari = 5 menit: tick 12.5 s (1x), 1.6 s (8x), masih 6 sampai 12× lebih lambat dari HoI4 speed 3 sampai 4 → keterbacaan tick bukan kendala; yang mengikat adalah kepadatan notifikasi. Tampilkan ikon pertempuran berdenyut per tick + dua bar HP agregat + estimasi hasil; countdown tick hanya saat ≤ 2x; log per engagement (bukan per tick); auto-pause hanya awal engagement dan unit hancur/kota jatuh.

### 10.2 Perhitungan skema (durasi CoN dipertahankan dalam jam game)
| Item | A: 1 hari = 2 min | B: 1 hari = 5 min | C: 1 hari = 1 min |
|---|---|---|---|
| Mobilisasi 19h30m | 1x 1m38s; 10x 9.8s | 1x 4m4s; 4x 61s; 8x 30s | 1x 49s |
| Riset 1h30m | 7.5s | 18.8s | 3.8s |
| Konstruksi 28h | 2m20s | 5m50s; 4x 1m28s | 1m10s |
| Perjalanan 6h | 30s | 1m15s | 15s |
| Tick tempur 60m | 5s; 10x 0.5s | 12.5s; 8x 1.6s | 2.5s |
| Kampanye 30 hari | 60 min; 10x 6 min | 2h30m; 4x 37m; 10x 15m | 30 min |
| Kampanye 60 hari | 2h; 10x 12 min | 5h; 4x 75m; 8x 37m | 60 min |

Penilaian: C = RTS, menghapus rasa menunggu CoN, tolak. A = mode cepat, riset hampir instan, kampanye 60 hari hanya 12 menit pada 10x. **B paling dekat "rasa CoN tapi masuk akal"**: mobilisasi 4 menit terasa, unit terlihat bergerak, gating riset per hari = ritual "hari baru" tiap 5 menit, kampanye 30 hari ≈ 50 menit dengan speed campuran ~3x.

### 10.3 Rekomendasi riset (untuk diputuskan Billy)
1. **1 hari game = 5 menit nyata pada 1x** (1 jam game = 12.5 s = 1 tick tempur). Preset saat membuat game: Singkat 3 min/hari, Standar 5 min/hari (default), Panjang 10 min/hari.
2. **Jangan kompres durasi CoN** (ikuti preseden Bytro 4x): semantik "Day 20" dan pengetahuan wiki tetap berlaku; balancing satu tuas. Pengecualian kecil: durasi < 30 menit game dibulatkan ke minimal 1 tick.
3. **Kecepatan: Pause, 1x, 2x, 4x, 8x** (geometrik ×2; tanpa tingkat tak terbatas) + tombol **"Lanjut ke event berikutnya"** dan **"Lanjut ke hari berikutnya"** (jalan 8x, berhenti di auto-pause pertama atau pergantian hari).
4. **Mulai dalam pause** dengan briefing Hari 1; default 1x; kecepatan terakhir disimpan di save; setelah auto-pause kritis, lanjut dibatasi maks 2x sampai engagement selesai.
5. **Auto-pause bertingkat** (per jenis, bisa diubah): **Pause + popup** default: deklarasi perang ke kita, unit musuh masuk wilayah kita, engagement baru melibatkan unit/kota kita, kota/provinsi kita jatuh, unit kita hancur, WMD terdeteksi, tawaran koalisi/aliansi/damai, **pergantian hari** (briefing harian ON, satu klik untuk mematikan). **Feed tanpa pause**: riset/mobilisasi/konstruksi selesai, unit tiba, shortage, morale turun. **Log**: tick tempur, harga pasar, gerak sekutu. Teknis: abaikan unpause 0.5 s setelah auto-pause; opsi auto-unpause setelah toast; gabungkan notifikasi tick yang sama.
6. **Ritual harian**: unlock riset, laporan Newspaper, hitung VP tepat pada pergantian hari, dalam satu layar briefing.

Catatan lintas era (dari sesi 3): PD1/PD2 dengan kampanye bertahun-tahun butuh kebijakan kalender per era (bagian 18); skema di atas adalah untuk Modern.
