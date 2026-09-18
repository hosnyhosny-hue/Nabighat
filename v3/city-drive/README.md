# Nabigha 3.0.2 — Noor City driving review

Branch: `fix/clear-start-guided-training-301`. This extends the unmerged Clear Start review. Do not merge or publish without owner approval.

## Build and play

```sh
python3 v3/city-drive/build.py
node --test v3/city-drive/core.test.cjs
node --test v3/core.test.mjs
python3 -m http.server 8080 --directory _city_review
```

Open `http://localhost:8080`, select **Noor City driving**, then **Start driving**. Use the city builder above, not the older v3/clear-start builders, for this revision. The branch homepage also compiles this revision through its Jekyll template.

## Implemented

Original four-wheel electric coupe with sloped glass, body panels, mirrors, lamps, spoiler, 32-segment tyre surfaces and animated wheel rolling/front-wheel steering. It is an original stylised model, not a licensed real manufacturer's model or photorealistic asset.

Free ground-plane driving (world X/Z), acceleration, braking/reverse, handbrake, speed-sensitive steering, ten simulated traffic cars, building/vehicle contact without damage, safe recovery, and an optional personal recorded replay. This is no longer automatic progress around a circle. The original local-route inspection tool remains separate; its reversed route-right vector is corrected too.

One finite city: 10 connected streets / 25 junctions, 16 blocks, 53 buildings, two parks, library arcade, waterfront, northern climb, elevated viaduct with two approach ramps and ground-level underpasses, and a low waterfront launch ramp. Street extent is approximately 380 by 380 game metres. No building interiors, multiplayer, traffic-law simulator, pedestrians or branded car assets.

Seven destinations form an optional timed tour. Untimed free driving remains open-ended. Three optional deliveries require stopping and interaction; they record completion, not religious or morality points. The overpass destination directs ground-level players to an approach ramp rather than underneath the bridge.

Controls: ArrowUp/W gas; ArrowDown/S brake then reverse; ArrowLeft/Right or A/D steer; Space handbrake; ShiftLeft temporary boost; E delivery; M map; Esc pause. Touch buttons have invariant LTR physical placement in Arabic and English. No button makes the car jump: airborne movement comes from the ramp.

## Preservation and storage

Renderer, Rayyan model, shared music/dialogue/reviewed-Arabic-only recording policy, and IBM typography modules are unchanged. Existing saves are untouched. City deliveries and best completed tours use `nabigha.city-drive.v1`; export/import has bounded validation. Position and unfinished tour are not persisted after closing. Ghost recording is bounded to 8,000 samples; completed tours lasting 1,280 seconds or more do not replace the best replay.

No binaries from the supplied racing archive, no embedded font files, no account system or advertisements. Read REPORT.md for explicit test limits. This remains a reviewable prototype, not a global-quality/store-ready release.
