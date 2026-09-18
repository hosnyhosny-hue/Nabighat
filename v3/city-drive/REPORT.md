# City review verification

Build: 3.0.2-city-review.1. Output: 537004 bytes.
SHA256: 74fdf744d6fb5676d46e4670b412780e3e3a7b2fc63265f7edfcda6e9b1776f0.
Based on branch commit 280c0a4aef80d380231bdb57e3509c5fc54aede7; public main is not modified by this review.

## Passed checks

- 16/16 new Node tests: physical steering in eight headings, gas/brake/reverse, handbrake, road connectivity, upper/lower viaduct separation, actual ramp ascent and airborne/landing movement, hill height, contact, traffic movement/yielding, destination height, untimed mode, save validation, recovery, bounded simulation, and a complete seven-destination tour driven through test steering inputs. The full-tour unit test excludes traffic and building collision fixtures; those are tested separately.
- 6/6 pre-existing domain tests.
- 41/41 browser UI/input checks: real keyboard/touch events feeding the production input handlers with controlled time steps, Arabic/English directions, three mobile layouts, menus/pause, optional delivery, invalid-save atomicity, simulated save reload, world/key access, optional tutorial, legacy sprint gates and IBM settings. Zero uncaught JavaScript exceptions.
- Ten JavaScript blocks passed syntax checks.
- Preserved script blocks 0–7 are byte-identical: renderer, core copy, audio bus, recordings declaration, dialogue text, reviewed recording engine, Rayyan model, and typography. Global expedition source differs only in the route's right-vector correction. New city code is separate.

## What these checks do NOT certify

Native WebGL context creation was unavailable in this container (BindToCurrentSequence failed). Browser tests use an explicitly non-rendering adapter in the test document only, simulated storage and an about:blank document; the distributed game contains the original WebGL renderer and no adapter. No hosted-URL persistence, physical phone, device performance/battery or human Arabic pronunciation approval is claimed.

For visual geometry review, the exact model vertices and model matrices were exported and rasterised through a separate local EGL/GLES renderer. Car, street, bridge and overview images were examined. These are engineering renders of the implemented geometry, NOT screenshots proving native browser gameplay, and use a simplified lighting shader. No image-generation artwork replaced the car model.

The menu's car thumbnail is generated at runtime from the same model geometry, using a small Canvas2D preview renderer. This preview is independent of the 3D gameplay renderer.

No GitHub Actions/Jekyll PASS is presumed. The read-only workflow compares the Jekyll output with the locally compiled HTML if a runner executes it. Its actual result must be read separately after the push. The branch and PR remain review-only; main is not merged.

Reproduce: `python3 v3/city-drive/build.py`, the two Node commands in README, then `python3 v3/city-drive/verify.py` in an environment with Playwright and Chromium. Review the game itself on native WebGL devices before approving publication.
