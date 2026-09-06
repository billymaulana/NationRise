#!/usr/bin/env python3
"""Susun kisi thumbnail dari tangkapan layar supaya banyak layar bisa dikenali sekaligus.

    python3 tools/contactsheet.py <keluaran.png> <kolom> <lebar-thumb> <daftar.txt>

Berkas daftar berisi satu path per baris, sehingga nama berkas berspasi aman.

Setiap petak diberi nomor urut; nomor itu memetakan kembali ke daftar berkas
yang dicetak ke stdout.
"""
import pathlib
import sys
import warnings

warnings.filterwarnings("ignore")
from PIL import Image, ImageDraw

out_path, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
paths = [ln for ln in pathlib.Path(sys.argv[4]).read_text().splitlines() if ln.strip()]
rows = (len(paths) + cols - 1) // cols
th = int(tw * 0.545)
pad = 4
sheet = Image.new("RGB", (cols * (tw + pad) + pad, rows * (th + pad) + pad), "#111")
draw = ImageDraw.Draw(sheet)

for i, p in enumerate(paths):
    try:
        im = Image.open(p).convert("RGB").resize((tw, th), Image.LANCZOS)
    except Exception:
        continue
    x = pad + (i % cols) * (tw + pad)
    y = pad + (i // cols) * (th + pad)
    sheet.paste(im, (x, y))
    draw.rectangle([x, y, x + 26, y + 14], fill="#000")
    draw.text((x + 3, y + 3), str(i), fill="#0f0")
    print(f"{i}\t{p}")

sheet.save(out_path)
print(f"\n-> {out_path} ({sheet.size[0]}x{sheet.size[1]}, {len(paths)} petak)", file=sys.stderr)
