# Nabigha v3 — complete playable branch preview

## Status
The complete renderer/UI integration is now tracked on `feature/global-expedition-v3`. This is no longer the domain-only foundation. PR #2 remains draft; do not merge or deploy without separate approval. `main` and the published GitHub Pages game are not changed by this branch update.

## Build and play locally
```sh
python3 v3/build.py --export-source
node --test v3/core.test.mjs
python3 -m http.server 8080 --directory _preview
```
Open localhost:8080. Use Start the expedition / ابدأ بعثة الإعمار, Horizon circuit / مضمار الآفاق, or Local asset lab. The older Sky Sprint chapters remain available.

All required code and the previously approved character illustrations are already tracked in this branch. No conversation file, archive, package download or private asset is needed to build. The only optional runtime fetch is the existing IBM webfont; fallback fonts remain available.

## Source layout
The established repository stores the complete legacy game in `_includes/sky-sprint-2.2.2.html`, with the reviewed mobile integration in `_data/mobile_update.json` and `_includes/mobile-hud.css`. These include the renderer, character, approved illustrations, Arabic/English copy, sound policy and nine thinking gates.

`v3/src/expedition-01.js` through `04.js` are ordered source fragments of the full new expedition module, not four independent scripts. They contain the entire UI, world geometry, quests, water graph, construction, vehicle, circuit, replay, input and local lab. `v3/src/expedition.css` contains the complete new layout. `_data/global_update.json` connects this module to the existing renderer, animation loop, camera, input and home buttons. All integration is build-time; the output has no runtime loader, iframe, eval, server or asset fetcher.

`index.html` now assembles v3 using the same standard Jekyll mechanism as the repository's previous release. `v3/build.py` performs the identical assembly offline and verifies the parent and final SHA-256. It fails rather than silently falling back to an old version. `--export-source` additionally writes every editable JS/CSS module, template and the three existing hero images to `_preview/source`; that folder rebuilds independently with its own `build.py`.

Original conversation preview SHA-256: `31b4084bea0074a28d99fc3816c162b93b646dffa06bc34f5da5ca1a544953a1`.
Integrated preview SHA-256: `1d2aa8dae91948da9f20c1a76733c9f9eb1221c8f063e2bb6813cd054bd1a1ba` (435867 bytes). The sole gameplay-source difference is one insignificant whitespace character in a pointer-event handler. Features and rules are unchanged.

## Included gameplay
- Return Salim's key; construct a physical 8m bridge with multiple solutions and undo; Noor holds the pump while the player connects the water; visible oasis restoration and journal.
- Original hovercraft circuit, steering assist, hop/boost/brake, checkpoints, local personal replay and untimed exploration. Three visual biomes share one route geometry.
- Local route import and GLB metadata inspection, not compressed-model rendering or multiplayer.
- Legacy chapters, compact mobile HUD, Arabic/English, IBM font settings and reviewed-Arabic-recordings-only policy are preserved.

## Safety and review limits
No archive models, textures, sounds, route coordinates or font binaries are uploaded. No child accounts, chat, ads, loot boxes or religious scoring. No new Arabic recording is approved. This is not a commercial/store-ready product. Physical-phone, pronunciation, child usability and performance review remain separate.

The branch-only Actions workflow has `contents: read`, checks builds/tests and stores a review artifact. It has no deployment step, Pages permission, environment, ref mutation or write token. Browser verification results are recorded separately in this PR after retrieving/verifying the branch snapshot.
