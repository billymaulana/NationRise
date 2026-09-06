#!/usr/bin/env python3
"""Potong beberapa detail antarmuka lalu susun bertumpuk, masing-masing diperbesar.

    python3 tools/crop.py <keluaran.png> <skala> <gambar> <x> <y> <w> <h> [<gambar> <x> <y> <w> <h> ...]

Dipakai untuk memeriksa bentuk (trapesium, belah ketupat, notch) yang hilang
kalau tangkapan layar penuh dikecilkan.
"""
import sys
import warnings

warnings.filterwarnings("ignore")
from PIL import Image, ImageDraw

out_path, scale = sys.argv[1], float(sys.argv[2])
rest = sys.argv[3:]
groups = [rest[i : i + 5] for i in range(0, len(rest), 5)]

tiles = []
for path, x, y, w, h in groups:
    im = Image.open(path).convert("RGB").crop(
        (int(x), int(y), int(x) + int(w), int(y) + int(h))
    )
    tiles.append(im.resize((int(im.width * scale), int(im.height * scale)), Image.NEAREST))

pad = 10
width = max(t.width for t in tiles) + pad * 2
height = sum(t.height + pad for t in tiles) + pad
sheet = Image.new("RGB", (width, height), "#101418")
draw = ImageDraw.Draw(sheet)

y = pad
for i, t in enumerate(tiles):
    sheet.paste(t, (pad, y))
    draw.rectangle([pad, y, pad + 22, y + 14], fill="#000")
    draw.text((pad + 4, y + 3), str(i), fill="#0f0")
    y += t.height + pad

sheet.save(out_path)
print(f"-> {out_path} ({sheet.size[0]}x{sheet.size[1]}, {len(tiles)} potongan)")
