# Phase 6 — assets and loading

Completed on 2026-10-02. This phase reduces startup competition and unnecessary downloads without redesigning the pages. The live lanyard still loads on the first mount, desktop arms remain, and phone arms remain absent. Earlier phase changes are preserved.

## Implemented

- Converted eight PNG assets to full-resolution lossless WebP. Original dimensions and ICC profiles are retained, and decoded comparisons found zero changed visible pixels. Original files remain available. The selected assets total **2,843,996 → 1,616,628 bytes**, saving **1,227,368 bytes**; the portrait alone saves 952,531 bytes.
- Converted 21 local fonts to WOFF2 without subsetting: **1,067,484 → 375,540 bytes**, saving **691,944 bytes**. Glyph order, character maps, advance metrics, outlines and shaping tables match the originals. Self-hosted the exact existing Google Fonts WOFF2 responses for Inter, Outfit and Bebas Neue, preserving weights and Unicode ranges. Their OFL files ship under `public/font-licenses`. Removed duplicate external Google stylesheet requests and preloaded the existing hero typeface. The unrelated external Meta demo font is unchanged.
- Split Work, About and Contact into independent lazy entries rather than loading all three pages and their effects together. Existing text, markup and CSS composition are retained; `WebsiteTestPages.jsx` keeps compatibility re-exports.
- Work images and desktop video URL modules are requested on the first main-page scroll, instead of competing with the hero startup. Offscreen video playback remains visibility-controlled. A stable outer image layer keeps GSAP's targets intact when an image becomes a video. Gallery focus/hover warms component code only; opening it loads its 25 images with a maximum of four concurrent metadata/decode jobs, preserving artwork order.
- Deferred desktop arm artwork until near the final scene. Lightweight SVG animation targets stay mounted, while their mask URLs and ASCII text remain deferred. Asset arrival no longer rebuilds the complete pin timeline or interrupts scrolling. Phone layouts mount no arm SVG.
- Extracted the **unchanged Rapier 0.19.2 WASM binary** from its embedded base64 JavaScript input during production builds. The lanyard JavaScript entry falls from **2,280,995 → 187,339 bytes** (about 92% smaller), but a separate **1,569,397-byte WASM download still occurs immediately**. This is not a 92% reduction in total physics data, nor a change to physics or lanyard appearance. The build checks the loader shape and fails explicitly after an incompatible dependency change. The development loader is unchanged.
- Remuxed the archive background MP4 with metadata before media data. All encoded video/audio stream SHA-256 values match; no re-encoding, quality reduction, or size saving is claimed (8,772,165 → 8,772,173 bytes). Moving MP4 metadata first is the [`faststart` behavior described by FFmpeg](https://ffmpeg.org/ffmpeg-formats.html#mov_002c-mp4_002c-ismv).
- Fixed an existing gallery stacking bug discovered during this check: opening it over a navigation subpage could leave it painted behind that page. It now covers both the subpage and header while remaining below the transition curtain.

The production binary emission uses the supported [Rollup file-URL hook](https://rollupjs.org/plugin-development/#resolvefileurl). Image decode and font preload behavior follow [MDN image guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img) and [link preload guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link). Music files, their quality and cover artwork are unchanged.

## Observed startup payload

These are single settled, untouched landing-page captures from the same Windows Chromium 154 environment, DPR 1, on a loopback production server with no response compression or local response caching. They are not load-duration benchmarks.

| CSS viewport | Before reported transfer | Release reported transfer | Difference |
| --- | ---: | ---: | ---: |
| Phone 390×844 | 4,734,863 bytes | 3,718,702 bytes | 1,016,161 fewer bytes (21.5%) |
| Desktop 1440×900 | 4,983,014 bytes | 3,730,233 bytes | 1,252,781 fewer bytes (25.1%) |

Resource timing can report zero bytes for cached or cross-origin responses; the before captures include such entries. Favicon timing also varies between captures. Snapshot elapsed time records when the agent collected the observation, **not how long loading took**. No claims are made about physical older-device FPS, hosted compression, bandwidth, iOS/Android browser behavior, or statistically repeatable speed gains. Immediate Three/physics work is still a substantial startup cost; the Three entry remains 704,525 bytes and Vite's large-chunk warning remains.

## Verification and provenance

- Production build: 1,260 modules, 4.41 seconds.
- Unit tests: 66 passed, zero failed/skipped/TODO. Four new tests cover bounded asset loading, order/failure behavior, exact WASM extraction, the `.buffer` loader regression, public-base URLs and dependency-change guards.
- Saved-observation assertions: 25 passed, zero failed. The clean phone console sample has zero errors and four existing GSAP null-target warnings; the desktop sample also has zero errors and four warnings and spans the preceding build/reload. Neither is an all-route/lifetime guarantee.
- Lint: the same 28 existing errors, zero warnings; no new findings. Cleanup of these findings belongs to Phase 7.
- `git diff --check`: passed, apart from Git's existing informational LF/CRLF notices.
- Release browser checks cover phone/desktop hero settling, deferred phone images, Work/About/Contact entries, Contact-to-Gallery layering and return, password-protected archive choices and video playback, and desktop artwork loading without interrupting a long scroll. Work-video and case-study playback were also checked on the preceding layer-correction build; those observations are labeled separately.

Release runtime SHA-256: `d0072c1b309a556fa87f857f85e365af6533650c10a1f1c69fa918899519a59c` (137 runtime files).

Build-input SHA-256 (including the WASM build plugin): `75044861744f4f555e381c81e39c12dbf2accdf884aa794e2d7f565d8493020e`.

Emitted-artifact SHA-256: `0a214ac4b0236bb6dfdef955ea3047c487a950f73d742da6396f2d5c512f72a5`.

See [release build](build-release.json), [asset pixel comparisons](images.json), [font comparisons](fonts.json), [Google font provenance](google-fonts.json), [physics build contract](build-contract.json), [video stream hashes](video.json), [before captures](browser-before.json), [final browser observations](browser-final.json), and [validation summary](validation.json). `check-phase6.mjs` checks saved observations; it does not independently drive a second browser session.

Screenshots: [release phone hero](screenshots/final-phone-390x844.jpg), [release desktop hero](screenshots/final-desktop-1440x900.jpg), [correctly layered phone gallery](screenshots/final-gallery-phone-390x844.jpg), [desktop arms](screenshots/final-desktop-arms-1440x900.jpg), [About portrait](screenshots/final-about-phone-390x844.jpg), [work video](screenshots/final-work-media-desktop-1440x900.jpg), and [case study](screenshots/final-case-study-desktop-1440x900.jpg). About/work/case-study captures precede the isolated gallery/arm-target corrections; the hero/gallery/arms captures are from the release build.

Candidate reports are retained intentionally. One WASM candidate failed because the original loader's `.buffer` suffix survived a partial replacement; the corrected extraction and regression test remove it. An earlier comparison resolved a different, unused root Rapier package; final verification resolves from the actual `@react-three/rapier` consumer. Gallery DOM initialization alone initially looked successful, but screenshot inspection revealed its incorrect stacking. A later candidate exposed the deferred-arm timeline interruption, now fixed and browser-checked.

## Handoff

Two phases remain: **7 — cleanup and consistency**, **8 — final QA**. Carry forward G01's long-session/resume regression and S02's breakpoint change during an in-progress Home scroll. Physical low-end-device, touch, browser-chrome, deployment-path and hosted-network checks remain part of final QA; they are not represented by these CSS viewport checks.

No dependency versions, commit, GitHub push, or deployment were changed in this phase. Asset-generation tools were used from temporary/bundled tooling, not added as application dependencies. All owned verification tabs were closed, the viewport override was reset, and the temporary production preview was stopped; port 4173 has zero listeners. Cleanup confirmation is recorded in `validation.json`.
