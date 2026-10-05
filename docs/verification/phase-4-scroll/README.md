# Phase 4 — scrolling and transitions

Completed on 2026-10-01, including verification resumed after a usage-limit interruption. This phase changes scroll ownership and transition handling while retaining the site's content, media, and visual choreography. Graphics optimization is the next phase, not part of this implementation.

## Implemented

- Compact phone/tablet layouts now use native browser scrolling instead of initializing Lenis. Desktop keeps its existing smooth-wheel settings. Reduced-motion preference also selects native scrolling.
- Native scrolling uses transform-based pins. The first candidate retained fixed pins and stalled around the featured-work entry in browser testing; the corrected version scrolls through the entire page to the final contact scene.
- Work animation follow-through is reduced from 1.08 seconds to 0.28 seconds on compact layouts and 0.65 seconds on desktop. Compact contact follow-through is 0.18 seconds; desktop remains 0.4 seconds. Reduced motion removes this catch-up delay.
- Compact featured-work pin length is modestly shorter: 582% to 522%. Compact contact length is 1120% to 980%. Desktop pin lengths are unchanged. The section order and animation composition remain intact.
- Home pins stay mounted behind case studies and subpages. Opening and closing them no longer removes spacers, clamps the underlying position, or rebuilds the complete scroll timeline.
- Position restoration has one owner and runs once after pin measurement. Removed the repeated animation-frame/120ms case-study restoration writes that could override a later gesture. Extras return restores its saved reading position and menu after measurement.
- Background scroll locking is shared across menus, subpages, case studies, gallery, and résumé. The opened surface retains its own scrolling. Breakpoint changes replace the desktop smoother without duplicating pins or losing the lock.
- Rapid navigation is accepted instead of ignored during the 1.68-second transition lifetime. Before the curtain commits, the latest destination wins; after a commit, a new request can start while the previous curtain leaves. Each controller cleans up only its own timers and curtains. This closes Phase 3 issue N01.
- Home on the home page scrolls to the top without another full-page wipe. Reduced motion makes scrolling/navigation immediate and avoids animated curtains. The preference is observed live.
- Timeline cleanup is scoped to its GSAP context. Font refresh callbacks are disposal-guarded, and small touch-browser height changes do not trigger the usual mobile resize refresh.

The native-touch policy follows [Lenis's documented input options](https://github.com/darkroomengineering/lenis). Scoped cleanup and refresh handling follow the [GSAP context](https://gsap.com/docs/v3/GSAP/gsap.context()/), [refresh](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.refresh()/), and [mobile-resize configuration](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config()/) documentation. Physical address-bar/safe-area behavior still needs device QA; suppressing small height-only refreshes is not a guarantee for every mobile browser.

## Verification

| Check | Result |
| --- | --- |
| Production build | Pass: 1,253 modules; final rerun reported 5.01s |
| Unit tests | 46 passed; 0 failed, skipped, or TODO |
| Verified browser interaction assertions | 24 passed; 0 failed in the final selected report |
| Browser captures | 12 screenshots/DOM observations |
| Strict saved browser contracts | 3 passed: menu links, phone input sizing, case-study media |
| Whitespace | `git diff --check` passed |
| Lint | Existing 28 errors and 2 warnings; no new findings |
| Source provenance | Current runtime hash matches tested source and final rebuilt output |

Responsive checks cover 320×568 and 390×844 phones, 844×390 landscape, 768×1024 tablet, 1280×800 laptop, and 1440×900 desktop. Checks exercise full-page scroll reachability, case-study position/focus return, no delayed rewind, menu locking, rapid Contact→Home→About navigation, Extras position/menu return, Home-to-top behavior, desktop inertia settling, breakpoint mode changes, and gallery isolation across tablet/phone resizing. Contact's own scroll reaches its end without moving the underlying home scene. No form was submitted.

Tests used Windows Chromium at DPR 1 with CSS viewport overrides and real browser scroll/keyboard controls. They do not emulate physical touch, low-end CPU/GPU throttling, iOS browser chrome, or an OS reduced-motion change. Reduced-motion policy/controller behavior is unit tested, not a complete graphics accessibility audit. The strict checker validates saved DOM observations; it does not independently drive the browser.

### Console finding for the graphics phase

G01: the long-running preview's console sample contains 250 captured error entries (the requested limit) reporting non-finite Three.js geometry bounds. This is a bounded sample, not the total error count. The session included the usage-limit interruption and multiple resizes; the cause and exact trigger are not yet established. The lanyard's frame interpolation/resume path is a candidate for investigation, not a confirmed diagnosis.

A fresh document, initially loaded at desktop size and then resized to phone, had **0 error entries and 13 existing warnings** after opening Gallery, resizing to tablet/phone, and closing it. Native scrolling to the final scene also passed on that fresh document. This does not establish long-session stability, and this phase does not claim an error-free all-route audit. G01 is explicitly carried into Phase 5 with the existing GSAP/deprecated-initialization warnings and large Lanyard/Three chunks.

### Artifacts and diagnostic history

- [Final build rerun](build-release.json), [verified assertions](browser-final.json), [long-session console](browser-console-final.json), [fresh-document console](browser-console-fresh.json), and [validation summary](validation.json).
- Runtime source SHA-256: `792ee9a7a14f4c0850faf28e392684d425765404ce45304f7792852b3cbe67c3` (128 runtime source files). The source hash and emitted asset names/sizes agree with the build used for the corrected browser checks.
- `browser-candidate.json`/`build-candidate.json` preserve the actual fixed-pin scrolling failure before the native pin correction.
- `browser-native-pin.json` retains the full same-source diagnostic history, including four superseded assertions: two compared case position before locator auto-scroll rather than at modal opening; one sampled desktop inertia before it settled; one used an incorrect gallery-observer selector. Corrected measurements and a fresh gallery re-test are included in `browser-final.json`. The final report deliberately selects verified assertions; it does not represent every preliminary probe as successful.
- New-document checks were run after restarting the temporary preview, which had stopped during the interruption. The earlier loaded document remained usable for the resumed interaction checks. The final production rebuild has the same runtime source hash and emitted asset names/sizes.

Clean screenshots: [phone case study](screenshots/final-case-study-phone-390x844.jpg), [Contact](screenshots/final-contact-phone-390x844.jpg), and [fresh phone final scene](screenshots/final-fresh-contact-scene-phone-390x844.jpg).

## Handoff

Next is Phase 5: graphics lifecycle, GPU/CPU work, lanyard resume stability (G01), and low-end-device rendering. Asset optimization, lint/dead-code cleanup, and final device QA remain later planned work. This phase does not claim measured improvements to mobile network load time or old-device frame rate.

No dependencies or media assets were replaced. The accumulated changes from earlier phases were preserved. No commit, GitHub push, or deployment was made.

Both successfully loaded verification tabs were closed and the viewport override reset. The temporary production preview on port 4173 was stopped; the listener count was confirmed as zero. One failed-load temporary tab could not be closed because the browser tool's URL safety check rejected its browser-generated `data:` error page; no safety restriction was bypassed.
