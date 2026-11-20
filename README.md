# Vice Cover Studio

[![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/adzinsyariif/vice-cover-maker/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/adzinsyariif/vice-cover-maker/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Vice Cover Studio is a fully offline web app that turns your own photos plus a caption into multi-panel cover art in a retro vice-city style: several photo panels separated by bold diagonal dividers, a sunset and neon colour grade, and big condensed caption lettering.

## Features

- Three panel layouts (Hero Duo, Hero Trio, Diptych), each with a poster variant and a wide variant chosen automatically by aspect, built from shared slanted boundary lines so panels tile the poster exactly.
- Four colour grades (Sunset, Neon, Daylight, Dusk) combining a photo filter with layered overlay gradients, a vignette and a subtle outer frame.
- Your own photos, read locally in the browser and never uploaded, plus five built-in sample photos so a first cover is two clicks away.
- Direct manipulation: click the poster to select a panel, drag to move its photo, scroll to zoom, with sliders and a Centre button for fine control.
- Caption editor with an auto-fitted condensed title, a letter-spaced subtitle in the grade accent colour, and an accent rule.
- One-click PNG export at the exact chosen size.

## Run it

```sh
node serve.ts
```

Then open the local page it prints in your browser. Everything runs from the files under `app/`; no network connection is needed.

## Controls in brief

- Photos: add image files, click a sample chip, or click a tray thumbnail to assign it to the selected panel. "Fill all panels" assigns the most recently clicked photo everywhere.
- Panels: click the poster to select a panel; drag moves its photo and the wheel zooms it. The Zoom, Nudge X and Nudge Y sliders plus Centre adjust the selected panel precisely.
- Layout and Grade: preset buttons switch the panel geometry and the colour grade.
- Caption: Title and Subtitle text fields feed the poster lettering.
- Size and Export: the segmented control in the header picks the export size and Export PNG saves the file.

## Export sizes

- 1080 x 1080 (Square)
- 1080 x 1350 (Portrait)
- 1920 x 1080 (Wide)

## Credits

- Sample photos were generated for this entry.
- The Anton font is used under the SIL Open Font License.
