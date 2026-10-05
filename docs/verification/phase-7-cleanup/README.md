# Phase 7 — cleanup and consistency

Completed on 2026-10-05. Earlier phase changes and the current design are preserved. The live lanyard still loads immediately; desktop arms remain, and phone arms remain absent. No commit, push, deployment, dependency-version change, or Phase 8 implementation was performed.

## Implemented

- Fixed all 28 existing lint findings without disabling rules or weakening the lint configuration. Removed unused refs, state, imports, props and handlers. Motion namespace imports now use a JSX component-style alias; their animations were not removed. The polymorphic StarBorder still honors its `as` prop.
- Removed the unused fixed-theme React context and hook. The same dark theme is now declared in the initial HTML, avoiding an unnecessary provider and post-mount attribute update. The Violet/Red appearance picker is unchanged.
- Removed the unreachable previous contact implementation, its feature flag, the unused alternate ASCII-arm component and the never-revealed bubble disc. Removed confirmed obsolete contact, About, project-card and menu-contact CSS, retaining live selectors from mixed rules and the active project/contact effect styles. The current About page, archived Home, alternative effects and original source assets remain intentionally available.
- Guarded animation setup against the intentionally absent phone arms. An explicit timeline hold preserves the original final-scene timing instead of shortening its scroll choreography. The four fresh-phone GSAP null-target warnings are gone in the captured session; the scroll content remains exactly 15,209 CSS pixels at 390×844.
- Gave the archive video crossfade one owned monitor. Each fade starts once rather than scheduling repeated nested frame callbacks and style writes. Playback pauses in hidden documents, resumes from its existing positions, and both videos and monitoring stop on exit. The same video and three-second opacity transition remain; monitoring is capped at 30 Hz, not video playback.
- Removed the fake phone number and non-interactive contact placeholder list from the desktop menu, matching the existing phone menu. The real Contact action and social links remain. The Budapest clock now derives its GMT offset from the date rather than incorrectly labeling winter time GMT+2. The phone folder hint reads “Tap to open”; desktop retains “Click to open.”

## Verification

- `npm run lint`: zero errors and zero warnings. The pre-existing npm warning about pnpm's `only-built-dependencies` project setting is separate from ESLint and is unchanged; package-manager/build permissions were not altered.
- `npm test`: **73 passed**, zero failed, cancelled, skipped or TODO. Seven new tests cover video-loop ownership, completion, visibility/resume, disposal, missing metadata and summer/winter clock formatting.
- Production build: **1,255 modules**, successful. Vite's existing >500 KB Three chunk warning remains. No size-warning suppression was added.
- `node scripts/cleanup/check-phase7.mjs`: **27 checks passed**. It validates source/build provenance and saved browser observations; it does not independently drive a second browser session.
- `git diff --check`: passed; Git's informational LF/CRLF notices are unchanged.
- Windows Chromium browser checks: 390×844 phone hero, final contact scene, Work/About/Contact navigation and sizing; 1440×900 desktop hero, deferred arm artwork and final contact scene, cleaned menu, protected archive choices, archive playback, one real video swap and archive exit. The captured phone and desktop/archive sessions each contain zero console errors/warnings. No contact form or external social link was submitted/opened.
- All owned browser tabs were closed and the viewport override reset. The temporary production preview was stopped; port 4173 has zero listeners. No development server was left running.

The compiled main-page CSS falls from **66,874 to 49,180 bytes** (17,694 fewer bytes, about 26.5%); estimated gzip falls from 13,268 to 9,981 bytes. The main-page JavaScript falls from 132,258 to 131,396 bytes. These are build-size comparisons, not measured load-time or FPS improvements. Much of the deleted JavaScript was already tree-shaken. Artwork, font assets, music quality and physics binary are unchanged.

Runtime source SHA-256: `a814432b5d43827786db2ffc13216ea3d9ce8f9c0f8101316ac7164ee9098cd4` (138 runtime files).

Build-input SHA-256: `8265b4e336b661513c3e61a08b6a89145c1aefef1ab46144c53124c5e88335c1`.

Emitted-artifact SHA-256: `63f0705e9ddecddf6181d964db111bad0ffb08fc37b9c68c408104a4fa39aeac`.

See [build provenance](build-final.json), [before browser observations](browser-before.json), [final browser observations](browser-final.json), [removed CSS selectors](css-cleanup.json) and [validation summary](validation.json).

Screenshots: [phone hero](screenshots/final-phone-390x844.png), [phone contact scene](screenshots/final-phone-contact-390x844.png), [desktop hero](screenshots/final-desktop-1440x900.png), [desktop arms](screenshots/final-desktop-arms-1440x900.png), [desktop menu](screenshots/final-desktop-menu-1440x900.png), and [archive](screenshots/final-archive-desktop-1440x900.png). An initial default-viewport screenshot is labeled 1280×720 and is not treated as a phone result.

## Handoff — one phase remains

**Phase 8 — final QA** remains: the broader responsive/interaction matrix, reduced-motion and visibility/resume checks, long-session lanyard regression G01, and breakpoint changes during an in-progress Home scroll (S02). Also check early user taps during the moving menu entrance; one synthetic automation click missed a moving target, while settled-menu navigation succeeded. A test assumption that About had a Back button or that Home automatically restored the menu was corrected to use the actual Home behavior.

These checks use CSS viewport sizes on Windows Chromium, not physical older phones, touch emulation, iOS/Android Safari/Chrome, CPU/network throttling, hosted compression or real browser-chrome safe areas. They do not establish an all-device or all-route performance guarantee. The existing client-side archive gate is retained, not upgraded to server-side security.
