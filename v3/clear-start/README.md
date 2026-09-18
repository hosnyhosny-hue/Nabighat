# Nabigha 3.0.1 — Clear Start / review only

Base: published `main` commit `b1596357bbd33aae03edbc9738be22f1043238de`.
Branch: `fix/clear-start-guided-training-301`.
**Do not merge or publish without the owner's separate approval.**

## Playable changes
- One Arabic/English start screen with three actual-gameplay cards: restoration adventure, hovercraft racing and sky sprint. No training prerequisite.
- Direct restoration entry at the saved quest; racing has a visible vehicle and explicit start button. Race assists, timing and countdown are optional settings.
- Optional two-step tutorial: walk to the glowing circle, then jump over a low hurdle and land in the next circle. Completing it does not unlock chapters or award religious points.
- A persistent activity selector pauses the current session. Resume retains its position. Switching activity ends only the unfinished run; saved quest/chapter/record progress remains.
- Character appearance, family information and Rayyan's words are secondary tools. The asset lab is under Settings > Developer tools, not the child's start menu.
- No new third-party assets, font binaries or audio. The three WebP thumbnail data URIs are compressed crops of existing actual game screenshots. They are preview images, not new gameplay models.

## Build from this branch

```sh
python3 v3/clear-start/build.py
python3 -m http.server 8080 --directory _review
```

Open `http://localhost:8080`. The output is also a standalone HTML file.
The baseline `v3/build.py` remains integrity-locked and unchanged; it deliberately builds the preserved v3 baseline. Use the Clear Start builder above for this update. The branch root Jekyll template integrates the same clear-start sources at build time, not through a runtime loader.

## Tests

```sh
node --test v3/core.test.mjs
python3 v3/clear-start/verify.py
```

The UI test requires Python Playwright and Chromium at `/usr/lib/chromium/chromium` (adapt that executable path on other systems). The test deliberately uses a NON-RENDERING adapter and simulated localStorage in `about:blank?test`. That adapter is not in the game. Read REPORT.md: these are not GPU, device or hosted-site tests.

Expected review HTML: 491438 bytes; SHA256 `b2e3404fefc29775c0986005dae8c26ab9e989cf25facbf7637da737645d0bc1`.

## Approval gate
Review the chooser and tutorial on a real phone and desktop with native WebGL. Confirm each activity can start, text leaves the character visible, and current-session resume and saved progress work. Resolve visual/input defects, then obtain explicit publication approval. This branch does not change Pages settings or the live main branch.
