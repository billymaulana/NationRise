#!/usr/bin/env python3
"""Ukur palet dan geometri dari tangkapan layar referensi.

Dipakai untuk menurunkan design token dari piksel, bukan dari perkiraan.

    python3 tools/measure.py palette <gambar> [<gambar> ...]
    python3 tools/measure.py regions <gambar> <x> <y> <w> <h> [...]
    python3 tools/measure.py bounds  <gambar> <hex> [toleransi]
    python3 tools/measure.py strip   <gambar> row|col <index> [awal] [akhir]
"""
import json
import sys
import warnings
from collections import Counter

warnings.filterwarnings("ignore")
from PIL import Image

DPR = 2


def load(path):
    return Image.open(path).convert("RGB")


def to_hex(c):
    return "#%02x%02x%02x" % c


def from_hex(s):
    s = s.lstrip("#")
    return tuple(int(s[i : i + 2], 16) for i in (0, 2, 4))


def near(a, b, tol):
    return all(abs(a[i] - b[i]) <= tol for i in range(3))


def quantise(c, step=8):
    return tuple(min(255, (v // step) * step + step // 2) for v in c)


def palette(paths, top=14):
    """Warna dominan gabungan, dikuantisasi supaya gradasi halus tidak memecah hitungan."""
    tally = Counter()
    for p in paths:
        img = load(p)
        for c in img.getdata():
            tally[quantise(c)] += 1
    total = sum(tally.values())
    return [
        {"hex": to_hex(c), "share": round(100 * n / total, 2)}
        for c, n in tally.most_common(top)
    ]


def regions(path, boxes):
    img = load(path)
    out = []
    for name, (x, y, w, h) in boxes:
        crop = img.crop((x, y, x + w, y + h))
        tally = Counter(crop.getdata())
        total = sum(tally.values())
        out.append(
            {
                "name": name,
                "box_css": [x / DPR, y / DPR, w / DPR, h / DPR],
                "colours": [
                    {"hex": to_hex(c), "share": round(100 * n / total, 1)}
                    for c, n in tally.most_common(3)
                ],
            }
        )
    return out


def bounds(path, target, tol=10):
    """Kotak pembatas dari semua piksel yang cocok dengan warna target."""
    img = load(path)
    px = img.load()
    w, h = img.size
    xs, ys = [], []
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if near(px[x, y], target, tol):
                xs.append(x)
                ys.append(y)
    if not xs:
        return None
    return {
        "x": min(xs) / DPR,
        "y": min(ys) / DPR,
        "w": (max(xs) - min(xs)) / DPR,
        "h": (max(ys) - min(ys)) / DPR,
        "count": len(xs),
    }


def strip(path, axis, index, start=0, end=None):
    """Deret perubahan warna sepanjang satu baris atau kolom.

    Berguna untuk menemukan tepi panel, lebar sel, dan tebal garis.
    """
    img = load(path)
    px = img.load()
    w, h = img.size
    end = end or (w if axis == "row" else h)
    runs, prev, start_at = [], None, start
    for i in range(start, end):
        c = quantise(px[i, index] if axis == "row" else px[index, i], 12)
        if prev is None:
            prev = c
        elif c != prev:
            if i - start_at >= 3:
                runs.append(
                    {
                        "from_css": start_at / DPR,
                        "to_css": (i - 1) / DPR,
                        "len_css": (i - start_at) / DPR,
                        "hex": to_hex(prev),
                    }
                )
            prev, start_at = c, i
    return runs


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    cmd, args = sys.argv[1], sys.argv[2:]
    if cmd == "palette":
        result = palette(args)
    elif cmd == "regions":
        path, rest = args[0], args[1:]
        boxes = [
            (rest[i], tuple(int(v) for v in rest[i + 1 : i + 5]))
            for i in range(0, len(rest), 5)
        ]
        result = regions(path, boxes)
    elif cmd == "bounds":
        tol = int(args[2]) if len(args) > 2 else 10
        result = bounds(args[0], from_hex(args[1]), tol)
    elif cmd == "strip":
        result = strip(
            args[0],
            args[1],
            int(args[2]),
            int(args[3]) if len(args) > 3 else 0,
            int(args[4]) if len(args) > 4 else None,
        )
    else:
        print(__doc__)
        return 1
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
