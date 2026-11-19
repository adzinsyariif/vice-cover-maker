# Vice Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/adzinsyariif/vice-cover-maker/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/adzinsyariif/vice-cover-maker/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Cover Studio is an offline cover art maker that turns your own photos
into a bold multi-panel poster in a palm-city sunset style. Pick photos,
drop them into slanted panels, choose a colour grade, write your caption,
and export a print-ready PNG in the size you need. Everything runs locally
in the browser: your photos are read on your own machine and never
uploaded anywhere.

## Features

- Three multi-panel layouts, each with a poster and a wide variant:
  Hero Duo, Hero Trio, and Diptych. Neighbouring panels share the same
  slanted boundary lines, so the artwork tiles edge to edge with crisp
  white separators and a framed finish.
- Bring your own photos with the multi-file picker, or start from the
  five built-in illustrated samples. Click a photo, then a panel to place
  it, or use Fill all panels to cycle your photos across the poster.
- Per-panel framing: zoom and nudge sliders, a Centre button, plus direct
  manipulation on the poster itself — click to select a panel, drag to
  move its photo, scroll to zoom it.
- Four colour grades — Sunset, Neon Nights, Daylight Vice, and Dusk —
  each with its own photo treatment, layered poster washes, and accent
  colour for the caption.
- An editable caption: a letter-spaced subtitle in the grade accent
  colour above a big auto-fitted title, set over a soft bottom scrim so
  it stays readable on any photo.
- Empty panels are designed too, with a grade-tinted gradient, a palm
  motif, and an ADD PHOTO marker, so a work in progress still looks
  deliberate.

## How to run

No build step and no network are needed. Either open `app/index.html`
directly in desktop Chrome, or serve the folder with the bundled helper
from the repository root:

    node serve.ts --port 8123

and then visit the local address it prints. The app works fully offline
either way.

## Exporting

Use the size switch in the header to choose 1080 x 1080, 1080 x 1350, or
1920 x 1080, then press Export PNG. The poster is rendered fresh at the
full chosen resolution on an offscreen canvas and downloaded as a PNG.
Scripts can do the same through `window.__viceStudio.exportPNG(w, h)`,
which renders at any requested size and returns a PNG data URL.

A shot mode is built in for taking clean pictures of a finished cover:
open the app with query parameters such as `?shot=cover` together with
`layout`, `grade`, `size`, `photos`, `title`, and `subtitle` values, and
the editor chrome hides so only the poster fills the window.
`?shot=editor` loads the same scene with the controls visible.

## Credits and license

The caption typeface is Anton by Vernon Adams, bundled under `app/fonts/`
and licensed under the SIL Open Font License 1.1. The built-in sample
photos are original illustrated scenes made for this project.

Vice Cover Studio is released under the MIT License; see `LICENSE`.
