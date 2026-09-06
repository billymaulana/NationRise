# Asset licences

Every third-party file under `game/assets/` is recorded here with the URL it
came from and the licence it ships under. Nothing goes into this folder without
an entry. Licences were read from each asset's own metadata, not from the page
that linked to it.

---

## Interface font — `assets/fonts/`

| File | Licence |
| --- | --- |
| `TitilliumWeb-Regular.ttf` | SIL Open Font License 1.1 |
| `TitilliumWeb-SemiBold.ttf` | SIL Open Font License 1.1 |
| `TitilliumWeb-Bold.ttf` | SIL Open Font License 1.1 |
| `OFL-TitilliumWeb.txt` | the licence text itself, copied verbatim from the source directory |

- **Family:** Titillium Web 1.002
- **Designer:** Accademia di Belle Arti di Urbino and the students of its MA
  course in Visual Design
- **Copyright:** `Copyright (c) 2009-2011 by Accademia di Belle Arti di Urbino
  and students of MA course of Visual design. Some rights reserved.`
- **Source:** <https://github.com/google/fonts/tree/main/ofl/titilliumweb>
  (files fetched from `https://raw.githubusercontent.com/google/fonts/main/ofl/titilliumweb/<file>`,
  repository at commit `5e35378e6bda`)
- **Upstream project:** <https://github.com/campivisivi/titillium>

Licence verified from inside each `.ttf` rather than from the repository layout.
The `name` table of all three files carries:

- name ID 13 (License Description): *“This Font Software is licensed under the
  SIL Open Font License, Version 1.1. This license is available with a FAQ at:
  http://scripts.sil.org/OFL”*
- name ID 14 (License Info URL): `http://scripts.sil.org/OFL`

The OFL permits bundling and redistribution inside a program, including a
commercial one, provided the fonts are not sold on their own and the licence
travels with them — hence `assets/fonts/OFL-TitilliumWeb.txt`. The Reserved Font
Name clause is not engaged: the copyright notice declares no reserved name, and
the files are shipped byte for byte as published.

**Why this family and not Exo 2.** Both are named in the visual research as
close matches for the reference interface. Rendering the same figures in both at
the sizes the bar actually uses put them within 1% of each other on width, so
the choice came down to the letterforms: Titillium's flat-sided digits and short
flag on the `1` sit closer to the reference than Exo 2's more geometric shapes.
Titillium also ships real static weights, so no variable-font instancing step
stands between the upstream file and the one in this repository.

---

## Monospace font — `assets/fonts/`

| File | Licence |
| --- | --- |
| `RobotoMono-Variable.ttf` | SIL Open Font License 1.1 |
| `OFL-RobotoMono.txt` | the licence text itself, copied verbatim from the source directory |

- **Family:** Roboto Mono
- **Designer:** Christian Robertson
- **Copyright:** `Copyright 2015 The Roboto Mono Project Authors
  (https://github.com/googlefonts/robotomono)`
- **Source:** <https://github.com/google/fonts/tree/main/ofl/robotomono>, file
  `RobotoMono[wght].ttf`, repository at commit `5e35378e6bda`
- **Modification:** none. The bytes are the upstream file; only the filename is
  spelled without the axis brackets, which the licence does not govern. The
  weight axis defaults to 400, so loading the file plain yields Regular.

Licence verified from the font's own `name` table: ID 13 carries the SIL Open
Font License 1.1 grant, ID 14 points at <https://openfontlicense.org>. The
copyright notice declares no reserved font name.

It is here for one job. The battle forecast lays its factors out as a table
padded with spaces, and in Titillium a space is 220 units against a digit's 560,
so those columns never lined up — the panel's own comment claimed a monospace
face it did not have. Every advance width in Roboto Mono is 1229/2048, so the
columns line up now.

---

## Resource icons — `assets/icons/`

| File | Source symbol | Drawn for |
| --- | --- | --- |
| `money.png` | `payments` | `Resource.Money` |
| `manpower.png` | `groups` | `Resource.Manpower` |
| `food.png` | `restaurant` | `Resource.Food` |
| `fuel.png` | `local_gas_station` | `Resource.Fuel` |
| `materials.png` | `inventory_2` | `Resource.Materials` |
| `technology.png` | `memory` | `Resource.Technology` |
| `rare-resources.png` | `diamond` | `Resource.RareResources` |

- **Set:** Material Symbols Rounded, filled (`FILL` 1), optical size 24
- **Licence:** Apache License 2.0 — full text in
  `assets/icons/LICENSE-Apache-2.0.txt`, copied verbatim from the source
  repository. That repository publishes no `NOTICE` file, so there is no notice
  to carry forward.
- **Copyright:** Google LLC
- **Source:** <https://github.com/google/material-design-icons> at commit
  `0cbb08816df0`; each glyph fetched from
  `https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/<symbol>/materialsymbolsrounded/<symbol>_fill1_24px.svg`

The unmodified SVGs are kept beside the bitmaps in `assets/icons/svg/` so the
provenance of each PNG is checkable without a network round trip.

**Modifications**, all permitted by Apache 2.0 §4: each SVG was rasterised to
48×48 RGBA and its colour channels set to white while its coverage was kept in
the alpha channel, so the running interface can tint one file per resource. The
geometry is untouched. They are shipped at twice their drawn size of 24×24 so
the bar stays sharp when the window is scaled.

**Why this set.** Game-icons.net was the richer match thematically but is CC BY
3.0 and would put an attribution obligation on anything shipping the game.
Lucide (ISC) is stroke-drawn and goes thin and grey at 24 px against a busy map.
Material Symbols is Apache 2.0 with no attribution requirement, and its filled
variant holds a solid silhouette at the size the bar draws it, which is what the
reference interface does too.

---

## Not sourced

No national flag is bundled. Province colour already carries nationality on the
map, so a flag would repeat information the player already has.
