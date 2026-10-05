# Phase 2 — functional bug fixes

Completed on 1 October 2026 against the [phase-1 baseline](../../baseline/2026-10-01/README.md). This phase repairs the games, music state, broken links/media, and route recovery. It does not implement the later navigation, scrolling, graphics, or asset-performance overhaul.

## Results

- Production build passes: 1,247 modules, Vite reported 4.30 seconds on this machine. The existing large-chunk warning remains.
- All 27 Node tests pass, with no failures, skips, or TODOs. B08 is now an ordinary regression test, not a known-failing TODO.
- Final captured-browser contracts: 19 pass, zero fail, in strict mode.
- Ten additional browser interaction checks pass, including repeated races, current shuffle state at a natural track end, paused track changes, and loaded case-study media.
- Lint still reports the pre-existing 28 errors and two warnings. The music-player hook warning was removed; no lint findings were added by these fixes. Remaining cleanup is scheduled for its own phase.
- No dependency or asset replacements, commit, or GitHub push were made. The temporary verification server was stopped after testing.

Starting commit: `a803ff824399769a59e9ec1e2cb761997b1e4e03`. Final runtime source SHA-256: `ee5502098bd08638d508bddbdd8b43f8b61e136069d2e024b802678f6b2a34fe` (122 source/config files).

## Fixes and evidence

| Area | Change | Verification |
| --- | --- | --- |
| B01 — game controls | Roulette and racing overlays can scroll; tablet layout stacks; number bets wrap into touch-sized columns without horizontal clipping. | 320 × 568, 390 × 844, 768 × 1024, and 1440 × 900 viewport checks. At 320 px, all 37 number buttons are at least 44 px high. |
| B02/B03 — race geometry | Movement uses the measured start/finish distance rather than a percentage of the car's width. The winner reaches the flag and stays furthest forward. Cars reset before each new race. | Desktop and resized phone captures put the winning car within 0.01 px of the finish; repeat-race interaction and all possible winners are covered. |
| B04 — roulette animation | Ball orbit is based on wheel size. Cumulative rotations animate repeated spins without unwinding; the selected pocket finishes beneath the ball. | Captured orbit checks and every pocket in unit tests; sampled landing alignment error below 0.01 degrees. |
| Game state | Bets/stakes/reset are locked during a round, the launch-time bet is used for settlement, duplicate starts are guarded, and green pays the same 35:1 profit as a single number. Crypto choices discard the biased remainder. | State interaction checks and payout/random-selection unit tests. These are virtual credits only, with no real-money transactions. |
| Music | End-of-track handling uses the current shuffle setting. Track changes resume only when appropriate, stale play promises are guarded, and timers/audio are cleaned up. Invalid durations cannot produce infinite progress. | While Chakras played, shuffle was turned off; seeking near its end caused the real `ended` event to advance to Devil in a New Dress and continue playback. Next while paused remained paused. Chakras is still the initial track. |
| B06 — social links | Instagram and LinkedIn labels are real anchors to the existing profile URLs. | DOM link contract. External accounts were not opened or modified. |
| B07 — case-study media | Phones show project artwork instead of an empty video source. Open case studies pick up a desktop video after loading/resizing; a failed video falls back to its image. | Phone image loaded at 735 px natural width, with no video element; after desktop resize the valid video reached ready state 4 at 1280 px width. Error fallback was source-reviewed, not fault-injected. |
| B08 — aborted transition | A removed transition overlay cannot execute its delayed navigation callback. | Four transition tests, including abort followed by a new navigation. A shared cancellation/transition architecture remains a later-phase task. |
| B09 — route recovery | Unknown URLs show a 404 heading and links to home/extras instead of a blank page. | Phone capture and a real recovery-link click back to the extras menu. |

## Artifacts

- [Final build inventory](build-final.json)
- [Final browser observations and interaction checks](browser-final.json): 13 screenshots and their DOM observations, all from the final build.
- [Command validation](validation.json)
- Screenshots: [desktop race](screenshots/final-race-desktop-finished-1440x900.jpg), [small-phone roulette number bets](screenshots/final-roulette-small-phone-number-bets-320x568.jpg), [phone music](screenshots/final-music-phone-initial-390x844.jpg), [phone case study](screenshots/final-case-study-phone-390x844.jpg), [menu links](screenshots/final-menu-phone-390x844.jpg), and [route recovery](screenshots/final-unknown-route-phone-390x844.jpg).

`build.json` and `browser.json` preserve preliminary QA before the small-phone grid follow-up. Use the `*-final.json` files to judge the completed implementation. The original phase-1 snapshots were not overwritten. The DOM observer and browser contract were strengthened to detect horizontal clipping and to measure the circular wheel's real diameter rather than its rotated square bounding box.

## Repeat checks

Run from the repository directory:

```powershell
npm test
npm run build
npm run lint
npm run baseline:check -- --strict docs/verification/phase-2-functional/browser-final.json
```

The last command validates saved measurements; future changes require new browser captures and a matching build hash. It does not independently launch a browser or re-test the current site.

## Limits and next phase

The browser checks used Windows desktop Chromium, DPR 1, with CSS viewport overrides—not physical iOS/Android hardware. They do not prove touch inertia, Safari audio policies, low-end performance, or hosted transfer speeds. No new console errors were reported during the verification session. Existing GSAP/lanyard warnings and large graphics bundles remain for subsequent phases.

B05 (phone contact input font sizes), navigation consistency, safe areas, keyboard/focus behavior, and other responsive/touch issues are next. Broader scrolling and transition changes follow that phase. The live lanyard, desktop arms, header navigation positions, and the music player's established appearance were left unchanged here.
