# Nabigha / نابغة — Sky Sprint

## Mobile playfield fix 2.2.3

- Compact top progress strip instead of large duplicated mission cards.
- Brief memory preview while running; full questions appear only at safe stops.
- Tappable lane choices and explicit confirmation in a bottom dock.
- Portrait and landscape layouts keep the runner and track visible.
- The ? button pauses play and opens full help. Keyboard focus does not accidentally submit an answer.
- Keeps the original character/art, IBM font configuration, three chapters, Arabic/English, progress schema, and reviewed-Arabic-audio-only policy.

## Build and source layout

GitHub Pages already uses its standard Jekyll build for this repository. `index.html` is now a small build-time Liquid template. It emits the standalone game HTML, not a browser-side patcher or iframe. It preserves the exact original 2.2.2 file in `_includes/sky-sprint-2.2.2.html`, inserts the mobile CSS, then applies the reviewed Unicode-offset release delta in `_data/mobile_update.json`. No custom Jekyll plugins or extra Actions workflow are required.

To create the identical downloadable HTML locally:

```sh
python3 _tools/build_release.py
```

Output: `_release/index.html`. Open that generated file for standalone play; the root `index.html` is the Pages build template. Do not edit the preserved base without regenerating the delta. A future release may replace the template with a compiled standalone HTML file.

## Verification

The exact 2.2.3 output was tested in Chromium with real WebGL and simulated touch: 6 release smoke checks plus 41 functional checks, all passed. Includes all nine gates, incorrect/correct answers, help pause, rotation, import, plaza, dialogue retention, and desktop labels. Physical iPhone/Android devices were not tested. External IBM font downloads were blocked in local tests; the Arabic fallback was used.

Base SHA256: `9c4f548e7dbe948d150d8f6caed5159056d225151e9ae9cb203ada589b36f36b`

Output SHA256: `548eb0097ca4239269f86246598f9dabbd2ab8be90a6130ce71347b5de2993e6`

No font files are distributed. IBM font loading and fallback behavior are unchanged.
