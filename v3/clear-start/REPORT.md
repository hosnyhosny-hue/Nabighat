# Clear Start verification — 18 September 2026

## Result and scope
- 88 / 88 UI and game-logic checks passed; zero unhandled JavaScript errors.
- 6 / 6 independent Node domain tests passed.
- Syntax checks passed for all 10 inline JavaScript blocks in the delivered HTML.
- All 19 build anchors matched exactly once against the preserved v3 build.
- Delivered HTML: 491438 bytes, SHA256 `b2e3404fefc29775c0986005dae8c26ab9e989cf25facbf7637da737645d0bc1`.

The browser suite covers a fresh start, all three activity entries, optional training, actual simulated movement/jump/landing, hurdle collision, activity-menu pause/resume, key return, multi-solution bridge, countdown freezing, vehicle steering/hop, saved personal record, all nine runner gates, three chapter completions, legacy save reconstruction, invalid-save rejection, bilingual menus, appearance settings, IBM controls and larger text. Touch/layout cases: 393x852 Arabic, 360x720 Arabic and 852x393 English. Vertical menu scrolling is intentional on short portrait screens; horizontal overflow is not.

## Important limitations
Native WebGL could not initialize in this execution environment (`WEBGL_NOT_AVAILABLE`). Local file navigation was also blocked by browser policy. No policy was changed or bypassed.

The UI suite injects a clearly identified NON-RENDERING renderer adapter in the test document, with the real game's matrices, geometry generation, quest logic and deterministic physics steps. Storage is explicitly simulated. Browser touch events use CDP/tap. The production HTML does not contain this adapter and retains its original renderer.

These results do NOT prove that native GPU drawing, real-origin persistent storage, a hosted preview, a physical phone, battery/performance, child usability or Arabic pronunciation passed. First-screen screenshots are genuine rendered HTML/CSS with existing gameplay thumbnails; they are not newly captured native gameplay scenes. External IBM font loading was unavailable in the test environment, so screenshots may use the declared fallback.

No new publication is authorized by this test report. Review native rendering and phone interaction before approving release.

## Preservation
The complete source text of the following modules is unchanged inside the built HTML:
- N3 renderer/engine, SHA256 `b3b9b9b2333f4840cd39a8d8d1144da1be069313636141e8e8b28aa4fa872d6e`.
- Rayyan model, SHA256 `6d3147c8af7e78771f5b00e81980963d3b274e93c0173a70aa8dd71dd9847f02`.
- Procedural audio, SHA256 `c3f76f7417d33f0092eb9a6233d365bd98b37502556741ee93f032ebeecb68ce`.
- Dialogue, SHA256 `18abcb9a665018dd455a57ee2922f6f94f38e55cd70e7ad9765c8445bc4db76f`.
- Dialogue data, SHA256 `9e0fec8f9072f191fa7c28b6c7e4f7806ee3061890e1a8f4e8a2eb669437f771`.
- Typography JavaScript and CSS, including IBM local/remote fallback and reading-size preferences.

Arabic browser TTS remains disabled; only reviewed recordings may play. No recordings were newly approved. Existing saved data schemas are unchanged; optional tutorial/countdown preferences use the separate `nabigha.clear-start.v1` key. No archive racing assets or font files are included.

## Reproduction and release check
Run `python3 v3/clear-start/build.py`, `node --test v3/core.test.mjs`, then `python3 v3/clear-start/verify.py`. The latter writes all individual results to `_review/verification/results.json`. It is a limited UI/logic test, not a replacement for the real-device approval gate.
