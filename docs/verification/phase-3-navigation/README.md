# Phase 3 — navigation and mobile compatibility

Completed on 2026-10-01. This phase improves navigation, keyboard focus, touch targets, and small-screen layout without replacing the established visual design. Scrolling and transition timing remain Phase 4 work.

## Implemented

- Reusable focus scopes isolate modal backgrounds, keep Tab inside dialogs, handle Escape, and restore focus to the opener. Nested dialogs and delayed cleanup are covered by tests. Case studies save their original opener before the background becomes hidden.
- The portfolio menu opens with Space, has a visible keyboard focus ring, and no longer leaves collapsed navigation links tabbable. Work, About, and Contact focus their heading on entry; Escape returns home while the header remains usable.
- The desktop theme picker supports click and keyboard activation, selection, and Escape. Compact header controls are aligned and have 44px touch targets. Back pills retain their small visible shape with larger hit areas; browser hit-testing checked the extra area.
- Compact navigation now includes narrow phone landscape and coarse-pointer tablets. Safe-area offsets and dynamic viewport height are used for main pages, Extras, and dialogs.
- Small-height menus and Extras can scroll to their last controls. Password and archive-choice dialogs remain reachable on short screens. Password animation timers no longer steal focus from Cancel.
- Phone contact fields are at least 16px, addressing baseline issue B05. Contact data entered during testing was never submitted.
- Extras tiles are genuine buttons or links, with keyboard activation and focus restoration. Gallery Back stays above its images, and closing the gallery restores a usable header control if its original menu link has disappeared.
- The résumé dialog uses the same focus lifecycle and no longer overwrites body scroll state. It was source/unit reviewed, not browser exercised: the current main-page résumé control is still a placeholder.

## Verification

| Check | Result |
| --- | --- |
| Production build | Pass: 1,251 modules, Vite reported 4.74s |
| Unit tests | 37 passed; 0 failed, skipped, or TODO |
| Final-build browser interaction checks | 8 passed, 0 failed; 5 screenshots |
| Broader responsive interaction matrix | 29 passed, 0 failed; 15 screenshots on the earlier verified candidate |
| Strict captured browser contracts | 3 passed on the final build; 3 passed on the broader candidate |
| Whitespace check | `git diff --check` passed |
| Lint | Existing 28 errors and 2 warnings remain; no new findings |

The responsive matrix covered 320×568 and 390×844 phones, 390×280/420 short screens, 844×390 landscape, 768×1024 tablet, 1280×800 laptop, and 1440×900 desktop sizes. Checks included menu focus wrapping, theme keyboard operation, page heading focus, small-screen scrolling, archive protection and choices, Extras activation, and gallery isolation. Final-build regression checks re-tested the phone header/menu, Contact, gallery focus return, and case-study opening/closing after the last focus fixes.

Tests used Windows Chromium at DPR 1 with CSS viewport overrides, not physical iOS/Android devices or coarse-pointer emulation. Safe-area behavior is implemented but still needs physical-device QA. Browser contracts validate saved observations rather than independently driving a fresh browser run. The recorded console sample had no error entries and 68 existing GSAP/deprecated-initialization warnings; it is not an all-route error audit.

### Artifact provenance

- [Final build](build-release.json), [final browser checks](browser-release.json), [console sample](browser-console-release.json), and [validation summary](validation.json).
- Final runtime source SHA-256: `3f007bb5c52b1a3e2205bdc440a8c312c7f22a6fdea28e624f5e58a537f1e2a0` (126 runtime source files). The current source hash was checked against this build report after testing.
- [Broader responsive matrix](browser-verified.json) matches [its own candidate build](build-verified.json), SHA-256 `1acf1183a6133569a11f58f630095ef6827a7fea2e1de025a56f4d5433d0f879`. It predates the final opener/focus-restoration corrections and is not represented as a final-source run.
- Preliminary, final-candidate, and completed-candidate files are retained as diagnostic history, including failed probes. `browser-release.json` is the final-build regression evidence. Phase 1 and Phase 2 artifacts were preserved.

Final screenshots: [phone header](screenshots/release-hero-phone-390x844.jpg), [menu opening transition](screenshots/release-menu-phone-390x844.jpg), [Contact](screenshots/release-contact-phone-390x844.jpg), [gallery](screenshots/release-gallery-phone-390x844.jpg), and [case study](screenshots/release-case-study-phone-390x844.jpg). Menu interaction assertions are recorded in the browser reports; the release menu image captures its opening transition rather than the settled panel.

## Next phase / remaining work

N01: rapid navigation can be ignored while the existing 1.68s screen-transition lock is active. For example, Contact can visually close after 760ms, yet immediately choosing About during the remaining lock interval only closes the menu. This was reproduced and recorded; Phase 4 should address navigation interruption and scrolling/transition behavior together.

The existing large Lanyard/Three chunks and lint backlog remain for the planned graphics, asset, and cleanup phases. This phase does not claim improved load times on low-end hardware. Lanyard, arms, music, and media assets were not replaced, and dependencies were not changed.

The temporary verification tab was closed, its viewport override reset, and the agent-created preview server on port 4173 stopped and checked. No commit, GitHub push, or deployment was made.
