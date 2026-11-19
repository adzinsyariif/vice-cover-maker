# Vice Cover Studio

[![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/adzinsyariif/vice-cover-maker/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/adzinsyariif/vice-cover-maker/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Vice Cover Studio turns your own photos plus a caption into bold, multi-panel
cover art in a sunset-and-neon vice style: several photo panels cut apart by
thick diagonal dividers with heavy off-white borders, a saturated colour
grade laid over the whole poster, and big condensed caption lettering along
the foot. It runs entirely offline in the browser — photos are read locally
and never uploaded — and exports a finished PNG you can post anywhere.

## Features

- **Three panel layouts**, each drawn in a poster and a wide variant chosen
  by the export aspect: Hero Duo (one hero plus two panels), Hero Trio (one
  hero plus three) and Diptych (two large panels split by a strong diagonal
  plus a slim third). Panel edges are derived from shared slanted boundary
  lines, so the collage tiles perfectly with no gaps.
- **Four colour grades** — Sunset, Neon, Daylight and Dusk — each combining a
  photo filter (saturation, contrast, brightness, hue) with layered gradient
  washes, glow and a vignette.
- **Your photos or the built-in samples**: five sample photos are bundled, so
  a first cover is two clicks away; add your own with the file picker
  (multiple at once) and click any thumbnail to place it in the selected
  panel, or fill every panel with one photo.
- **Direct manipulation**: click the poster to select a panel, drag its photo
  to reframe it, scroll to zoom, or use the Zoom / Nudge X / Nudge Y sliders
  and the Centre button. Vertical framing anchors toward the top of a photo,
  so faces survive short, wide panels.
- **Caption editor**: title and subtitle, set in a heavy condensed display
  face, auto-fitted to the poster width, with an accent rule and a
  letter-spaced subtitle in the grade's accent colour.
- **Empty panels** are filled with a purple-teal placeholder wash, a faint
  panel number and a palm-frond motif, so a work in progress still looks
  designed.

## Export sizes

- Square — 1080 x 1080
- Portrait — 1080 x 1350
- Wide — 1920 x 1080

Pick a size in the header, then press **Export PNG**; the file is saved as
`vice-cover-<width>x<height>.png`.

## Run it locally

```sh
node serve.ts
```

Then open the local page the server prints (it serves the `app/` folder).
No build step, no dependencies, no network: every script, style, font and
image the page loads lives under `app/`.

To hand the entry in the way the grader runs it:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json`.

## Controls in brief

- **Photos** — add your own, or click a sample chip; click a tray thumbnail
  to assign it to the selected panel; "Fill all panels" repeats the last
  photo everywhere.
- **Panels** — click the poster to select; drag to move the photo, scroll to
  zoom; sliders and Centre do the same job precisely.
- **Layout / Grade** — three layout presets and four grade presets, applied
  instantly.
- **Caption** — title and subtitle text fields.
- **Header** — export size segmented control and the Export PNG button. A
  status line under the poster reports every action.

## Credits

- Sample photos in `app/samples/` were generated for this entry.
- The display font is **Anton** by Vernon Adams, bundled at
  `app/fonts/Anton-Regular.ttf` and used under the **SIL Open Font License
  1.1**.
- All code was written for this entry; no libraries are used.
