# Portfolio baseline — 1 October 2026

Phase 1 is complete: record the existing site, add repeatable measurement tools, and preserve regression evidence before implementing fixes. No production component, stylesheet, route, asset, or visual behavior was changed. The temporary measurement server injects a probe into its HTTP response only; the probe is not in the production bundle.

## Reference and validation

- Starting commit: `a803ff824399769a59e9ec1e2cb761997b1e4e03` (`Add archive choices and extra games`).
- Runtime source SHA-256: `b77d9eebd0868a085833cefdafc53f22703eb9217d41fcd446dc4f1853af4f9e`.
- Hash covers 118 files: source JS/JSX/CSS, `index.html`, and `vite.config.js`. It does not cover assets, dependencies, test files, or documentation; keep the commit and build inventory alongside it.
- Production build: passes, 1,243 modules; final validation build took 5.95 seconds on this machine. The existing large-chunk warning remains.
- Node tests: 16 pass and one explicitly recorded, currently failing TODO (B08). There were five tests before this phase. The test command exits successfully because B08 is marked TODO, not because that bug is fixed.
- Lint: the existing 28 errors and three warnings remain. No lint findings were added in the baseline scripts or tests.
- Captured-browser checks: one passing observation and nine known failing observations across seven issue IDs. Default mode allows listed baseline failures; `--strict` correctly exits with status 1.

The application diff (`src`, `index.html`, `vite.config.js`) is empty. Changes are limited to package scripts, tests, measurement tools, and these reference artifacts. Nothing was committed or pushed.

## Artifacts

- [Build and asset inventory](build.json): raw emitted sizes and calculated compression estimates.
- [Browser measurements](browser.json): 23 viewport screenshots paired with DOM observations and passive timing samples.
- [Console observations](browser-console.json): 57 warning entries collected across the browsing session, not 57 distinct bugs.
- [Validation summary](validation.json): final command outcomes, including expected failures.
- [Read-only DOM observer](../../../scripts/baseline/observe.js): reusable browser capture function.
- [Measurement server and probe](../../../scripts/baseline/preview.mjs): loopback-only production preview.

## Build and transfer baseline

These are emitted file sizes, not the entire initial download. Lazy routes, music, and videos are included in the build inventory but are not necessarily requested on the landing page. Gzip and Brotli figures are calculated estimates; hosting compression was not tested.

| Emitted asset | Raw bytes | Gzip estimate | Brotli estimate |
| --- | ---: | ---: | ---: |
| Lanyard JS | 2,279,827 | 844,040 | 626,989 |
| Three.js module | 704,525 | 181,610 | 146,950 |
| Main entry JS | 235,174 | 75,841 | 65,622 |
| About portrait PNG | 2,365,311 | Not measured | Not measured |

Fresh landing captures reported approximately 4.72–4.98 MB of resource transfer on the uncompressed, no-store local server. Zero-size entries can be cached or unavailable to resource timing. The probe's own modules are excluded. Overlay captures accumulate resources from the same document and must not be interpreted as separate cold loads.

## Viewport and layout baseline

All dimensions below are CSS pixels with DPR 1, using the same Windows desktop Chromium browser. Phone and tablet labels describe viewport sizes, not physical-device emulation.

| Landing viewport | Main scroll height | Viewport lengths | Local LCP | Local load event |
| --- | ---: | ---: | ---: | ---: |
| Desktop 1440 × 900 | 17,568 px | 19.52 | 496 ms | 65.3 ms |
| Laptop 1280 × 720 | 14,054 px | 19.52 | 480 ms | 88.5 ms |
| Phone 390 × 844 | 16,897 px | 20.02 | 424 ms | 51.9 ms |
| Small phone 320 × 568 | 11,372 px | 20.02 | 440 ms | 64.3 ms |
| Tablet 768 × 1024 | 20,501 px | 20.02 | 416 ms | 59.4 ms |
| Phone landscape 844 × 390 | 7,652 px | 19.62 | 516 ms | 128.6 ms |

The long landing-page scroll includes pinned animation sequences; it is evidence for the later scroll review, not automatically a bug. The 844 px landscape viewport switches to the desktop layout. A resize-only capture retains the original document's load/LCP values, so those timings are deliberately excluded from this table. Main-wrapper scroll measurements behind open overlays do not describe the overlays' scrollable length.

### Screenshot index

Screenshots are layout references, not deterministic pixel-diff goldens: the lanyard, background, gallery, and games animate or use random state.

| Area | References |
| --- | --- |
| Hero | [Desktop](screenshots/hero-desktop-1440x900.jpg), [laptop](screenshots/hero-laptop-1280x720.jpg), [phone](screenshots/hero-phone-390x844.jpg), [small phone](screenshots/hero-small-phone-320x568.jpg), [tablet](screenshots/hero-tablet-768x1024.jpg), [landscape](screenshots/hero-phone-landscape-844x390.jpg), [desktop-to-phone resize](screenshots/hero-phone-after-desktop-resize-390x844.jpg) |
| Main navigation | [Menu](screenshots/menu-phone-390x844.jpg), [work](screenshots/work-phone-390x844.jpg), [about](screenshots/about-phone-390x844.jpg), [contact](screenshots/contact-phone-390x844.jpg), [extras](screenshots/extras-phone-390x844.jpg) |
| Games | [Race before start](screenshots/racing-phone-clipped-390x844.jpg), [race result](screenshots/racing-phone-finished-390x844.jpg), [roulette](screenshots/roulette-phone-390x844.jpg) |
| Creative controls | [Music phone](screenshots/music-phone-390x844.jpg), [music small phone](screenshots/music-small-phone-320x568.jpg), [sketch](screenshots/sketch-phone-390x844.jpg) |
| Projects and gallery | [Scrolled project section](screenshots/project-scroll-phone-390x844.jpg), [case study](screenshots/case-study-phone-390x844.jpg), [gallery phone](screenshots/gallery-phone-390x844.jpg), [gallery after landscape resize](screenshots/gallery-phone-landscape-after-resize-844x390.jpg) |
| Route recovery | [Unknown route](screenshots/unknown-route-phone-390x844.jpg) |

## Regression ledger

These issues are preserved for subsequent implementation phases; none was fixed here.

| ID | Existing behavior and evidence | Check |
| --- | --- | --- |
| B01 | At 390 × 844, the race action ends at y = 887.7 px and the roulette action at y = 853.3 px. Their fixed overlays have no effective scrolling ancestor to reach the clipped controls. | Three failing captured observations: race before/after finish and roulette. |
| B02 | The sampled winning car's front stops at x = 175.0 px while the finish line is x = 326.0 px, approximately 151 px short. | Failing finished-race geometry contract. |
| B03 | The displayed winner is also the furthest car forward in the sampled race. | Passing finished-race consistency contract; not a statistical test of randomness. |
| B04 | The roulette ball's centre is only 6.0 px from the wheel centre; the wheel radius is 152.7 px. | Failing wheel-track geometry contract. |
| B05 | Contact inputs have a computed font size of 14.7 px rather than the planned 16 px phone minimum. | Failing computed-style contract. Actual iOS keyboard/zoom behavior still requires a physical Safari check. |
| B06 | Instagram and LinkedIn in the open menu are spans without links. | Failing semantic-link contract. |
| B07 | The case-study media contains one empty video source and displays an unavailable-media message. | Failing DOM media-source contract. |
| B08 | Removing an in-progress route-transition overlay leaves its scheduled navigation callback running. | A real failing assertion against the existing utility, recorded as a TODO in `tests/pageTransition.test.js`. |
| B09 | An unknown path renders no recovery heading or visible action. | Failing route-recovery contract. |

Console warning groups: 48 GSAP null-target messages, eight deprecated initialization warnings from the lanyard bundle, and one unmatched-route warning from the intentional missing-route test. These are counts across repeated reloads/navigation, not unique defects or proof of a crash.

The music player's stale shuffle/end-of-track state remains a source-review follow-up, not a runtime-confirmed result of this phase. Archive unlocking, every theme, every project, all media playback, and the full ASCII/gradient interaction flows are not claimed as covered by these 23 captures.

## Repeating the baseline

Run from the repository directory. No new dependencies are required.

```powershell
npm run build
npm test
npm run lint
npm run baseline:build -- --out docs/baseline/<new-run>/build.json
npm run baseline:preview
```

The report writer refuses to overwrite an existing report. Use a new run directory rather than replacing this reference. The preview listens only at `http://127.0.0.1:4173/`; `BASELINE_PORT` can select another local port. Stop it with Ctrl+C when finished.

For browser captures:

1. Use a browser viewport control to test the six dimensions in the table. Freshly reload the hero for each loading comparison; record resize-only cases separately.
2. Wait for the intended UI state and an approximately eight-second visible sampling window. Record the actual capture time; do not treat an arbitrary animation frame as a deterministic golden.
3. Evaluate the exported function from `scripts/baseline/observe.js` in a read-only DOM scope. Supported kinds are `layout`, `menu`, `contact`, `racing`, `race-finished`, `roulette`, `case-study`, and `missing-route`. Invoke the function rather than returning its definition.
4. Save a full-viewport JPEG and pair the observer result with `name`, `kind`, `capturedAt`, and the relative screenshot path. Save the resulting snapshot array with the schema used by `browser.json`, including the current commit and runtime hash.
5. Preserve failed observations. Record known issue IDs explicitly so a new regression is not silently treated as expected.
6. Check the new captured data, then reset the viewport and close the temporary browser tab.

```powershell
npm run baseline:check -- docs/baseline/<new-run>/browser.json
npm run baseline:check -- --strict docs/baseline/<new-run>/browser.json
```

`baseline:check` validates saved browser measurements; it does not launch or drive a browser. Re-running it against this unchanged JSON cannot verify a future code fix. New measurements must be captured from the new build. The default command rejects unlisted failures; strict mode rejects every failed contract. Remove B08's TODO marker when implementing its fix so a future regression fails the unit-test command.

## Measurement limits and next-stage device checks

- This is one unthrottled loopback session on a desktop with 16 reported logical processors and 32 GiB reported memory, not an older phone/laptop benchmark or hosted-site performance result.
- Local responses are uncompressed and use `Cache-Control: no-store`; externally loaded resources may have separate cache behavior. Network latency, real hosting headers, and repeat-visit caching need separate measurements.
- rAF intervals are a main-thread scheduling proxy, not rendered FPS or GPU timing. Canvas backing dimensions describe allocation, not whether a canvas is actively rendering.
- LCP, load, and layout-shift observations belong to the initial document, not each overlay. They do not establish when every hero effect is ready. The probe's `cls` is a cumulative no-recent-input layout-shift sum, not a full Core Web Vitals session-window CLS calculation.
- The probe itself adds one rAF callback, performance observers, and a hidden output updated once per second. No INP, CPU throttling, GPU profiling, field percentiles, battery, or thermal measurements were collected.
- Physical Safari and Android checks are still needed for finger scrolling, safe areas, browser chrome height changes, keyboard behavior, audio autoplay rules, and landscape rotation.
- Later QA should also cover reduced motion, background/resume behavior, low-memory/WebGL context loss, archive password flow, and repeated open/close navigation without leaked work.

Keep the live lanyard from initial load and the desktop arms as agreed; performance changes should be compared with these references before changing the design.
