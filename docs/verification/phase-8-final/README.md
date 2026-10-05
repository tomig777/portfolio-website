# Phase 8 — final QA

Completed on 2026-10-05. This closes the eight planned implementation phases, with the physical-device and hosting limitations below. No commit, push, or deployment was performed. The temporary production preview is stopped after verification.

## Fix made in this phase

**S02 — Home interrupted by a responsive resize:** reproduced at scrollTop 8100. Clicking Home and changing desktop to phone width previously stranded the page at 2346. The scroll intent now retains the requested destination while the scroll owner/timelines are rebuilt. The final build returns to 0. A new wheel, touch, pointer, or scrolling-key gesture cancels that intent; the browser test retained a new reading position at 4241 instead of snapping back to Home. Three regression tests cover preservation, cancellation, and invalid/fractional values. Home also clears any active case study/gallery when leaving an overlay.

The live lanyard, immediately loaded 3D assets, artwork, music, themes, and current visual design are preserved. Desktop arms remain; phone arms remain absent. No dependencies were updated.

## Responsive coverage

The final production build was exercised in Windows Chromium with explicit viewport overrides:

| Viewport | Main-page scrolling |
| --- | --- |
| 320 × 568 | Native |
| 390 × 844 | Native |
| 844 × 390 | Native |
| 768 × 1024 | Native |
| 1024 × 768 | Smooth desktop owner |
| 1366 × 768 | Smooth desktop owner |
| 1440 × 900 | Smooth desktop owner |

The 1024px test used a desktop pointer, not a simulated touch tablet. The existing coarse-pointer query remains in place for actual touch tablets. No horizontal **document** overflow was observed; this is supplemented by screenshot checks, not a claim that every decorative element stays inside its container.

## Interaction checks

- Main-page full scroll reaches the final contact scene on phone and desktop. No grey-screen regression occurred. Phone background canvas fills the hero viewport.
- Case study opens with the phone poster, pill Back owns focus, Escape restores focus and the reading position, and background scroll locking is released.
- Work, About, and Contact open and return correctly at 320px. Contact inputs retain 16px text; keyboard navigation brings the 48px Send control into view. No contact form or external link was submitted.
- Gallery loads its artwork and its Back control is the top hit-test element, above the images. Returning to the main page works.
- Music starts on Chakras with Yandhi artwork. Playback/pause, mute, volume adjustment, shuffle, paused track switching, and finish/background controls were exercised. The final build was rechecked at 320px. Audio/artwork quality is unchanged.
- Sketch board, drawing surface, and both dials fit the narrow screen; the wipe action and Back work. Gradient color and speed controls work at tablet size. ASCII Vortex loads at 320px and Back works. These checks do not simulate actual touch gestures.
- Roulette and One Lap run to a random result using virtual credits only; controls lock during play and become available afterward. Number bets were also exercised in the candidate. The final build completed another round of each game at 320px.
- Incorrect archive code remains in the password gate; the existing correct code opens the two choices. Both mobile preview and website archive load. The preview has the thin device shell and navigation below the Dynamic Island. Archive components are removed on Back. This remains a client-side code gate, not server-side security.
- Unknown URLs show the recovery page and real links to Home and Extras.

## Motion and graphics lifecycle

The loopback server can inject `scripts/qa/environment.js` only when `?qaEnvironment=1` is requested. Its visible test controls simulate the **JavaScript** reduced-motion media query and visibility-change events. It is not imported into the app or emitted in `dist`.

On that test page, reduced motion switches the main page to native scrolling and navigation commits with no curtain. Simulated hiding pauses hero graphics, the live lanyard, and role animation; resuming restarts the visible effects. Unit tests separately cover scheduling, hidden mounts, disposal, and video crossfades.

**G01 — historical lanyard bounds issue:** no non-finite geometry warnings/errors recurred during the bounded production-build session. The final main-page/lanyard instance remained mounted for roughly eight minutes across scrolling, breakpoint changes, case study/gallery/subpage overlays and returns. A separate simulated pause/resume run passed. This does not prove stability for an hours-long session or real phone background/foreground events.

Rapid coordinate-based synthetic taps during a moving menu/header entrance occasionally missed the intended target. Settled pointer clicks and keyboard activation work. This was not established as a product handler bug, so the animations were not changed speculatively; very fast real touch interaction remains a physical-device check.

## Validation and evidence

- Production build succeeds: 1255 transformed modules.
- `npm run lint`: 0 errors, 0 warnings from ESLint.
- `npm test`: 76 tests pass; 0 fail/skip/cancel.
- `git -c core.autocrlf=false diff --check`: passes.
- QA harness syntax checks pass and no QA markers occur in emitted files.
- Captured browser observations contain no console warnings/errors.
- `node scripts/qa/check-final.mjs` verifies saved observations and source/build provenance. It does not run a browser itself.

The existing npm warning about `only-built-dependencies` and Vite warning about the large Three.js chunk remain visible; no warning thresholds or dependency permissions were changed to hide them.

`build-final.json` records runtime/build/emitted-asset hashes. `browser.json` labels earlier candidate and final observations separately. The candidate Contact screenshot includes a menu transition; use `screenshots/final-contact-small-phone-320x568.png` for settled evidence. Screenshots and raw passive-probe readings are retained under this folder.

## Limits and next recommendations

Browser viewport overrides are not iPhone Safari, Android Chrome, actual touch input, mobile keyboards, low-end CPUs/GPUs, throttled networks, or production hosting. The JavaScript harness does not alter CSS media queries or real browser background scheduling. The local machine reports 16 logical cores and 32 GiB device memory. Its local load numbers are **not** older-phone benchmarks. LCP/CLS after a resize or overlay navigation are not clean page-load comparisons.

Before calling this verified on all devices, test the deployed build on a real older iPhone and Android phone: fresh load over cellular, rotation, long scroll, input/keyboard, touch drawing/dragging, fast menu taps, and app background/resume. Inspect hosted compression/cache headers and real request timing. These are follow-up checks, not a request to weaken the immediately live lanyard or replace visuals without approval.

For content polish, the largest remaining opportunity is replacing generic project titles/descriptions with actual client/brief/process/outcome details and filling the case studies with more substantive work. The About résumé currently says “coming soon”; provide a real downloadable résumé when ready. Consider promoting the strongest three projects and keeping the experimental games clearly secondary to the portfolio. No content/design overhaul was made in this QA phase.
