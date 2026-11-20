# Vice Cover Studio

[![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/adzinsyariif/vice-cover-maker/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/adzinsyariif/vice-cover-maker/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Vice Cover Studio is a fully offline web app that turns your own photos plus a caption into bold multi-panel cover art. Several photo panels are separated by thick diagonal dividers, graded with a sunset or neon colour wash, and finished with big condensed caption lettering — ready to post.

Everything runs locally in the browser. Photos are read on your device and never uploaded; there are no accounts, no network calls and no tracking.

## Features

- Three panel layouts with slanted dividers: Hero Duo (one hero plus two panels), Hero Trio (one hero plus three panels) and Diptych (a strong diagonal split plus a slim strip). Each layout adapts to square, portrait and wide posters.
- Four colour grades: Sunset, Neon, Daylight and Dusk, each with its own photo filter, overlay washes and accent colour.
- Five built-in sample photos, so a first cover is two clicks away: pick a sample, then Export PNG.
- Your own photos: add several at once, click a poster panel to select it, then click a thumbnail to fill it. A Fill all panels button repeats the last photo everywhere.
- Per-panel reframing: drag a photo inside its panel, scroll to zoom, or use the Zoom, Nudge X and Nudge Y sliders, with a Centre button to reset.
- Editable Title and Subtitle caption, auto-fitted in a condensed display face with a dark outline and an accent rule.
- Three export sizes: 1080 x 1080 (Square), 1080 x 1350 (Portrait) and 1920 x 1080 (Wide), exported as PNG at exactly the chosen size.

## How to run

From the repository root:

```
node serve.ts --port 8123
```

Then open the local page the server prints in your browser. No build step and no install are needed.

## Controls in brief

- Size segmented control (top right): choose Square, Portrait or Wide; Export PNG saves the poster.
- Photos (left rail): add your own images, or click a sample chip to fill the selected panel.
- Panels: click the poster to select a panel; drag to move its photo, scroll to zoom, sliders for fine nudges.
- Layout and Grade: switch presets at any time; your photos and caption stay in place.
- Caption: type a Title and Subtitle and watch the poster update live.

## Credits

- Sample photos: the pier and boulevard photos ship with the starter kit; the convertible, yacht and beach photos were generated for this entry.
- Caption and heading typeface: Anton, licensed under the SIL Open Font License.
- All code in `app/` was written for this entry, with no libraries.
