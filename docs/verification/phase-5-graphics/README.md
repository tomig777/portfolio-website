# Phase 5 — graphics lifecycle and rendering work

Completed on 2026-10-01. This phase reduces unnecessary animation, geometry allocation, and renderer churn while retaining the site's composition and live lanyard. Phases 1–4 and their unrelated working-tree changes are preserved.

## Implemented

- Added shared graphics-activity observation: viewport bounds, ancestor display/visibility/opacity, explicit screen activity, and document visibility all control rendering. Mutations/scroll/resize coalesce into one check; paused effects do not continuously poll. Renderers remain mounted across visibility and theme changes rather than being recreated.
- Lanyard assets still load immediately. Its canvas uses demand rendering and becomes idle after the physics bodies and rope smoothing settle. Dragging/movement resumes it. Added finite-value checks and bounded interpolation so a long suspension cannot overshoot rope positions. Canvas touch handling allows native vertical scrolling; cancelled/lost-pointer captures clear dragging.
- The rope initializes with numeric float buffers and updates only changing position/previous/next arrays in place. Static indices, UVs, side/width/counter attributes are retained. Float32-identical updates are skipped. Open/closed endpoints and bounds match the installed MeshLine reference.
- DarkVeil, LightRays, SideRays, ColorBends, Aurora, and Plasma pause when inactive. Props update uniforms rather than replacing renderers. Resize guards avoid redundant allocations; FPS limits can change without duplicating loops. Aurora is capped at 60 FPS instead of display-refresh-rate rendering. Existing shader math, colors, and DarkVeil resolution convention remain intact; ColorBends now initializes its requested palette on first lazy creation.
- CardSwap pauses and resumes its current timeline/order offscreen. Hero role changes and desktop ASCII-arm input work pause behind menus/subpages or while hidden. Arms remain desktop-only, with their appearance unchanged.
- ASCII Vortex caches cell-to-fluid-grid coordinates on resize instead of recalculating them every frame; sampling/glyph layout is unchanged. Glass-lens uniform objects survive resize and frame delta is bounded after suspension.
- Gallery avoids raycasting when the pointer is outside, updates its camera bounds on resize, and releases its context on actual unmount. Shared image textures and instancing remain. Plasma avoids repeated device detection, releases its capability-probe context, cleans up owned resources, and initializes previously undefined GLSL loop accumulators.

Demand rendering follows the [React Three Fiber performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance). The installed [React Three Rapier](https://pmndrs.github.io/react-three-rapier/index.html) implementation was inspected to verify active-body invalidation and fixed-step behavior. Rope sampling retains [Three.js CatmullRomCurve3](https://threejs.org/docs/pages/CatmullRomCurve3.html) behavior; the buffer comparison checks the actual installed MeshLine implementation rather than relying only on documentation.

## Verification

| Check | Result |
| --- | --- |
| Production build | Pass: 1,257 modules, final build 4.19s |
| Unit tests | 62 passed; 0 failed, skipped, or TODO |
| Saved browser-observation assertions | 24 passed; 0 failed |
| Installed rope reference comparison | 500 open/closed frames; finite attributes, matching bounds, stable arrays |
| Lint | 28 existing errors, 0 warnings; no new findings (the earlier 2 Plasma warnings are resolved) |
| Whitespace | `git diff --check` passed; Git emitted only its existing LF/CRLF conversion notices |
| Source provenance | Final source hash matches the verified production build |

Final runtime SHA-256: `3fdb9a25ae8a345d05ba433eafea266eee593bd8dec6a13b273e44aa496961b0` (132 runtime source files). See [build provenance](build-verified.json), [browser observations/assertions](browser-final.json), [console sample](browser-console-final.json), [rope regression](rope-regression.json), and [validation summary](validation.json).

Browser interactions cover phone 390×844, landscape 844×390, tablet 768×1024, desktop 1440×900, and the Plasma route at 1280×720. Checks include hero settling, menu/gallery isolation and return, gallery breakpoint resizing, Work/About/Contact activity, desktop arms, the visible/offscreen contact shader, ASCII sizing, and Gradient Drift color/speed controls. Unit sampling comparisons additionally cover 320×568 and 3840×2160.

These are Windows Chromium 154 checks at DPR 1 with CSS viewport overrides, not physical touch, iOS/Android browser chrome, low-end GPU/CPU throttling, or hosted-network tests. The 24 assertions validate saved public DOM observations; they do not independently drive another browser session. Public activity labels report whether an effect is allowed to run, not GPU frame rate. The lanyard motion label reports its settle/continue-rendering decision. Passive main-thread RAF measurements are not rendered GPU FPS. Canvas object identity was not independently instrumented; renderer retention is verified in the lifecycle implementation.

The main verification tab's bounded console sample has 0 errors and 65 existing GSAP/deprecated-initialization warnings; it spans this turn's candidate rebuilds and final checks. The fresh Plasma route sample has 0 errors and 0 warnings. This is not an all-route/lifetime guarantee.

Screenshots: [final phone hero](screenshots/phone-hero-final-390x844.jpg), [final desktop hero](screenshots/desktop-hero-final-1440x900.jpg), [fully loaded phone gallery](screenshots/phone-gallery-390x844.jpg), [contact shader](screenshots/desktop-contact-shader-1440x900.jpg), [desktop arms](screenshots/desktop-contact-end-1440x900.jpg), [ASCII phone](screenshots/ascii-phone-390x844.jpg), [Gradient tablet](screenshots/gradient-tablet-768x1024.jpg), and [Plasma route](screenshots/record-plasma-1280x720.jpg).

`browser-candidate.json`, `browser-release-candidate.json`, and earlier build reports retain diagnostic history. Early phone observations captured 3D loading and the approach to the final scene, not a fully settled hero or the visible white shader; the final report labels those accordingly. The final phone hero/gallery screenshots replace the earlier initialization captures. One early Node comparison was rejected because it did not assert finite values; the saved rope regression is the corrected finite-value comparison.

## Findings carried forward

- **G01 — non-finite lanyard bounds:** Phase 4's interrupted, long-running session produced geometry-bounds errors. This phase closes unsafe numeric-input and long-delta pathways, and the errors did not recur in the captured checks. A Node interoperability probe reproduces non-finite output when ES-module Three Vector3 objects are passed to the installed MeshLine Node entry; it does **not** establish the browser session's exact historical root cause. Keep the long-session/resume regression in Phase 8.
- **S02 — breakpoint change during Home scroll:** Resizing desktop→phone during an in-progress smooth Home-to-top scroll can interrupt the return when the desktop smoother is replaced. Choosing Home again after the resize returns correctly. This navigation edge case remains for the later interaction/QA pass; it was not folded into the graphics work.
- Existing large chunks remain: Lanyard 2,280,995 bytes (844,543 estimated gzip), Three 704,525 bytes (181,610 estimated gzip). Vite still reports its >500KB chunk warning. This phase does not claim reduced initial network bytes or proven old-device FPS gains.

## Handoff

Three phases remain: **6 — assets/loading**, **7 — cleanup and consistency**, **8 — final QA**. No dependency or media replacements, commit, GitHub push, or deployment were made in this phase.

Both successfully loaded temporary verification tabs were closed, the viewport override was reset, and the temporary production preview on port 4173 was stopped (listener count confirmed zero). The earlier Phase 4 browser-generated error tab was not revisited or bypassed.
