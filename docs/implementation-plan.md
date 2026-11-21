# Space Detective (محقّق الفضاء الصغير) — Phased Implementation Plan

## 1. Roadmap Overview

This implementation roadmap outlines the structured, milestone-driven execution for developing **Space Detective** as a high-performance single-file browser game inside `index.html`. Each phase includes discrete objectives, deliverables, and verifiable acceptance criteria.

---

## 2. Implementation Phases

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 01: Project Initialization & Technical Foundation                │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 02: Three.js 3D Environment & Cosmo Robot Character              │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 03: Welcome Screen & Planet Selection Engine                     │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 04: Gameplay Core & Curated Image Dataset                        │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 05: Feedback Modals, Star Scoring & Reward System                │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 06: Audio FX, Arabic Speech Synthesis & Micro-Animations         │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 07: Cross-Device Responsive Optimization & Usability Testing     │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 08: Final Polish, Performance Profiling & Delivery               │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 01: Project Initialization & Technical Foundation
- **Objectives:**
  - Establish the clean workspace directory structure.
  - Define architectural guidelines, technical constraints, and documentation.
  - Prepare `index.html` as the future single-file container with proper HTML5 boilerplate, RTL direction, meta tags, and CDN hooks.
- **Key Deliverables:**
  - Clean repository with `.gitignore`, `README.md`, and complete `docs/` suite.
  - Valid `index.html` structure ready for single-file integration without prematurely embedding gameplay code.
- **Acceptance Criteria:**
  - [x] Directory contains strictly the approved structure.
  - [x] No npm packages, frameworks, or build configurations introduced.
  - [x] `index.html` validates as clean HTML5 with `dir="rtl"` and UTF-8 charset.
  - [x] Documentation provides unambiguous technical and design direction.

---

### Phase 02: Three.js 3D Environment & Cosmo Robot Character (Completed & Verified)
- **Objectives:**
  - Implement the WebGL rendering pipeline inside `index.html`.
  - Build the cosmic deep-space environment (procedural starfield, glowing nebula particles, ambient and point lighting).
  - Create the procedural 3D mascot "Cosmo" (كوزمو) using Three.js geometries, smooth materials, and animated parts (floating head, glowing visor eyes, hovering body, magnetic hands).
  - Implement continuous animation loops (idle hovering, breathing, and eye blinking).
- **Key Deliverables:**
  - Embedded Three.js scene manager with window resize handler.
  - Procedural 3D planetary models: Moon Planet (craters & blue glow), Colorful Planet (striped bands & candy rings), Galaxy Planet (swirls & particle orbits).
  - Procedural Cosmo robot character hierarchy with customizable animation states (`idle`, `greeting`, `happy`, `thinking`, `excited`).
  - Interactive temporary showcase HUD with camera transitions and live state controllers.
- **Acceptance Criteria:**
  - [x] 3D scene renders smoothly at stable 60 FPS on standard desktop and mobile browsers.
  - [x] Cosmo responds gracefully to screen resize events without distortion or clipping.
  - [x] Memory consumption remains low with proper geometry and material reuse.
  - [x] All 5 robot animation states verified and interactively tested.
  - [x] All 3 procedural 3D planets verified in scene with axial rotation and atmospheric styling.
  - [x] Camera parallax and cinematic transition sweeps verified with 0 console errors.

---

### Phase 03: Welcome Screen & Planet Selection Engine (Completed & Verified)
- **Objectives:**
  - Build the UI layer overlay using semantic HTML and frosted-glass CSS.
  - Create the animated Welcome Screen with large Arabic CTA ("ابدأ المغامرة").
  - Construct the 3D Planet Selection screen with three rotating celestial bodies:
    - Moon Planet (كوكب القمر)
    - Colorful Planet (الكوكب الملوّن)
    - Galaxy Planet (كوكب المجرة)
  - Implement the sequential level-unlocking mechanism.
- **Key Deliverables:**
  - Responsive UI overlay manager managing multi-screen view transitions (`welcome`, `planet-selection`, `mission-intro`).
  - Interactive planet selection cards and direct 3D raycasting planet selection.
  - 3D holographic selection ring marking the active planet destination.
  - Sequential level locking/unlocking with child-friendly non-punitive explanations.
  - Mission introduction briefing screen with clear instructional steps.
- **Acceptance Criteria:**
  - [x] Welcome screen renders with Cosmo mascot, Arabic title, dialog bubble, and "ابدأ المغامرة" CTA.
  - [x] Welcome screen start button triggers Cosmo's greeting animation and transitions smoothly to Planet Selection.
  - [x] All 3 procedural 3D planets are visible, rotating, and interactive.
  - [x] Moon Planet is unlocked by default; Colorful Planet and Galaxy Planet remain locked with clear feedback.
  - [x] Selecting a planet updates the UI details, moves the 3D selection ring, and triggers smooth camera transitions.
  - [x] Mission Introduction screen opens for the unlocked Moon Planet with Cosmo's briefing and "هيا نبدأ!" CTA.
  - [x] Two-way back navigation functions reliably between all screens.
  - [x] Mobile and desktop responsive layout verified with 0 horizontal overflow.
  - [x] Verified in browser with 0 console errors or exceptions.

---

### Phase 04: Gameplay Core & Curated Image Dataset (Completed & Verified)
- **Objectives:**
  - Implement the core game loop for image inspection and decision making.
  - Build the 3D holographic scanning frame with laser sweep animation.
  - Integrate a verified, child-friendly image dataset with known ground-truth labels (Real vs. AI).
  - Construct the dual-choice Arabic action buttons (`صورة حقيقية` vs. `ذكاء اصطناعي`).
- **Key Deliverables:**
  - Complete 20-question structured JavaScript dataset across 3 planets (Moon: 5, Colorful: 7, Galaxy: 8) with documented provenance, source URLs, creators, and licenses.
  - Reusable Question & Investigation Engine (`startPlanetMission`, `loadQuestion`, `submitAnswer`, `showAnswerFeedback`, `nextQuestion`, `finishPlanetMission`, `restartPlanetMission`).
  - Holographic image scanner with cyber cyan laser sweep and responsive image viewport.
  - Dual tactile child-friendly answer buttons (>=64px height) with double-click submission lock.
  - Immediate non-punitive feedback overlay explaining the verified origin from documented records.
  - Mission completion recap screen with accuracy percentage and replay/map options.
  - Automatic fallback handler for offline/rate-limited image requests.
- **Acceptance Criteria:**
  - [x] Each planet presents its designated sequence of image transmissions with randomized order.
  - [x] Action buttons register immediate touch/click events with distinct visual feedback and disable on submission.
  - [x] Dataset images render cleanly in the scanner viewport without aspect ratio distortion.
  - [x] Verified dataset includes 20 documented items (10 Real, 10 AI) with authentic source provenance records.
  - [x] Correct answers trigger celebratory feedback and Cosmo's happy animation.
  - [x] Incorrect answers trigger supportive educational coaching revealing the documented origin without punishment.
  - [x] Mission completion screen calculates statistics accurately and supports mission replay and map return.
  - [x] Responsive layout verified across desktop (1366x768), tablet (768x1024), and mobile (412x915) with zero overflow.
  - [x] Tested in automated headless browser with 0 console errors.

---

### Phase 05: Feedback Modals, Star Scoring & Reward System (COMPLETED)
- **Objectives:**
  - Design the star reward system (1–3 stars per mission based on ratio thresholds: ≥80% = 3 stars, ≥60% = 2 stars, <60% = 1 star).
  - Implement sequential planet unlocking (Moon -> Colorful -> Galaxy -> Game Completed).
  - Ensure replaying an unlocked planet preserves earned stars (`Math.max(previous, new)`) and best scores without decrementing.
  - Implement robust browser persistence using `localStorage` (`spaceDetectiveProgress` key, versioned schema, graceful in-memory fallback).
  - Provide reset progress functionality with a child-friendly confirmation modal.
  - Complete exhaustive image dataset audit verifying all 20 image records and sources.
- **Key Deliverables:**
  - Integrated `ProgressionManager` module handling scoring, unlocks, and persistence inside `index.html`.
  - Header persistent star counter (`⭐ ٠ / ٩`) and Reset Progress button with confirmation modal.
  - Planet selection cards dynamically showing star ratings (`⭐⭐⭐`), status lock badges, and best scores.
  - Enhanced Mission Completion Screen with sequential star pop-in animation, high-score banner, unlock notification, and "Next Planet" action button.
  - Complete 20-item dataset provenance audit with direct canonical Wikimedia URLs.
- **Acceptance Criteria:**
  - [x] Star reward formula implemented with exact thresholds: 1 star for completion, 2 stars for ≥60%, 3 stars for ≥80%. Zero stars never awarded for completion.
  - [x] Sequential planet progression model implemented: Moon unlocked by default, completing Moon unlocks Colorful, completing Colorful unlocks Galaxy, completing Galaxy marks game completed.
  - [x] Replay preservation rule verified: replaying completed levels never decreases stars, never relocks planets, and preserves highest scores.
  - [x] LocalStorage persistence verified: data survives full page reloads, missing/corrupted storage falls back to default structure without crashing.
  - [x] Reset progress verified: child-friendly confirmation dialog cleanly resets progression to initial state.
  - [x] Dataset provenance audit completed: all 20 entries audited, direct canonical URLs updated, fallback SVGs active.
  - [x] Automated CDP test suite executed: verified scoring thresholds (17/17 cases), unlock chain, persistence across reload, and reset with 0 console errors.

---

### Phase 06: Audio FX, Arabic Speech Synthesis & Micro-Animations (Completed & Verified)
- **Objectives:**
  - Build procedural Web Audio API sound synthesis engine for 12 child-friendly sound effects without external audio files.
  - Integrate the Web Speech API (`speechSynthesis`) for natural Arabic voice instruction prioritized for Egyptian Arabic (`ar-EG` / `ar-*`).
  - Synthesize spoken guidance for:
    - Welcome greeting and start of adventure.
    - Planet descriptions and mission briefings.
    - Scanner analysis, cheerful praise upon correct answers, and supportive clues for mistakes.
    - Star award celebrations, level unlock announcements, and grand victory.
  - Implement full Audio Settings modal with independent toggles for SFX, Speech, Master Volume slider, Quick Mute, and voice status feedback.
  - Separate settings persistence (`spaceDetectiveAudioSettings`) from progression data (`spaceDetectiveProgress`).
  - Polish UI and mascot micro-interactions with button active press scaling, holographic scanner flash glow, and lively Cosmo robotic head nodding and antenna pulse during speech.
- **Key Deliverables:**
  - Self-contained `AudioManager` and `SpeechManager` modules inside `index.html`.
  - Comprehensive procedural synth engine: `click`, `startAdventure`, `selectPlanet`, `scanner`, `correct`, `supportive`, `nextQuestion`, `star1`, `star2`, `star3`, `unlockPlanet`, `victory`.
  - Audio Settings Modal triggered via header button `#btn-audio-toggle` with volume slider, SFX toggle, Speech toggle, and quick mute.
  - Dialog bubble speech replay buttons on all screens (`#btn-speak-welcome`, `#btn-speak-intro`, `#btn-speak-gameplay`, `#btn-speak-completion`).
  - Strict browser autoplay compliance: AudioContext lazily resumed on first user interaction.
  - Cosmo robotic micro-animation: dynamic head tilt and head nod during active speech narration (`isSpeaking`).
  - Accessible design: full support for `@media (prefers-reduced-motion: reduce)`, visual-only playability when muted.
- **Acceptance Criteria:**
  - [x] Web Audio API procedural synthesis implemented: 12 unique sound effects generated in real-time, zero external audio asset dependencies.
  - [x] Web Speech API integration verified: voice discovery for `ar-EG` / `ar-*` with graceful fallback and overlap cancellation.
  - [x] Speech narration connected to all game milestones: welcome, planet selection, mission briefing, question loading, correct/supportive feedback, and mission completion.
  - [x] Speech replay buttons active on all dialog bubbles.
  - [x] Audio settings modal fully functional with live volume slider, SFX switch, speech switch, quick mute, and status badge.
  - [x] Separate `localStorage` persistence under `spaceDetectiveAudioSettings`: resetting game progression leaves audio settings untouched.
  - [x] Micro-animations implemented: button active press scale (0.96), scanner flash glow (`.flash-real`, `.flash-ai`), and Cosmo speech head nodding and antenna pulse.
  - [x] Automated CDP verification suite executed: 0 console errors, zero horizontal overflow across Desktop (1366×768), Tablet (768×1024), and Mobile (412×915). All screenshots verified.

---

### Phase 07: Cross-Device Responsive Optimization & Usability Testing (Completed & Verified)
- **Objectives:**
  - Test and refine layout across mobile devices, tablets (iPad/Android), and desktop displays across 9 standard viewports.
  - Verify touch-target ergonomics (minimum 64px interactive buttons, >= 44px secondary controls).
  - Eliminate all horizontal overflow across all 10 game screens and modals down to 320px width.
  - Profile WebGL draw calls, GPU utilization, and fill rate to maintain smooth, stable rendering on low-power devices.
  - Implement a dynamic Three.js QualityManager with DPR clamping (1.0 for low, 1.5 for medium, 2.0 for high) and adaptive starfield counts (400 / 750 / 1300).
  - Implement dynamic automatic downgrade when sustained low frame rates (< 28 FPS for 3s) are detected.
  - Implement on-demand question image loading with in-memory Map caching and asynchronous next-question preloading.
  - Add page visibility management (`visibilitychange`) to pause audio and animation when backgrounded and resume cleanly without frame jumps.
  - Add developer performance monitor (`#perf-monitor` via `?debug=true` or `Alt+D` / `Ctrl+Shift+D`).
  - Introduce child-friendly double-tap/rapid-tap debouncing on navigation and answer submissions.
- **Key Deliverables:**
  - Viewport-adaptive responsive CSS with safe-area insets (`env(safe-area-inset-top)` etc.), flex wrap bars, and fluid typography.
  - Dedicated media query tiers: `<= 768px` (mobile/tablet), `<= 480px` (standard mobile), `<= 360px` (ultra-compact 320px), and `<= 600px` height (landscape layout).
  - Single-file `QualityManager` and `PerformanceMonitor` modules inside `index.html`.
  - Dynamic Three.js starfield reconstruction with geometry/material disposal on quality tier change.
  - In-memory `imageCache = new Map()` in `QuestionEngine` with `preloadNextQuestion(nextIdx)` and late-response race condition protection (`loadRequestId`).
  - Shared `safeNavigate()` debounce wrapper for navigation CTAs.
  - Automated CDP verification suites `scratch/verify_phase07.js` and `scratch/verify_phase07_closure.js`.
  - Deep provenance verification audit `scratch/audit_provenance.js` querying Wikimedia Commons API for all 20 dataset items.
  - Visual verification screenshots captured:
    - `scratch/phase07_01_mobile_320x568_gameplay.png`
    - `scratch/phase07_02_tablet_768x1024_planet_select.png`
    - `scratch/phase07_03_desktop_perf_monitor.png`
    - `scratch/phase07_closure_01_desktop_perf.png`
    - `scratch/phase07_closure_02_mobile_touch.png`
    - `scratch/phase07_closure_03_all_clear_victory.png`
- **Acceptance Criteria:**
  - [x] Zero horizontal scrolling or layout breakage across all 9 target viewports (`320×568`, `375×667`, `390×844`, `412×915`, `430×932`, `768×1024`, `1024×768`, `1366×768`, `1920×1080`).
  - [x] All 10 screens and modals verified: Welcome, Planet Selection, Mission Intro, Gameplay, Feedback Overlay (correct/supportive), Mission Completion, Game Completion, Audio Modal, Reset Modal.
  - [x] Child touch target ergonomics validated: primary action buttons `>= 64px` height (Welcome CTA: 69px, Answer buttons: 64px), secondary touch targets `>= 44px`.
  - [x] Touch safety CSS active: `-webkit-user-select: none`, `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent`.
  - [x] Adaptive Three.js quality system verified: `low` (max DPR 1.0, 400 stars), `medium` (max DPR 1.5, 750 stars), `high` (max DPR 2.0, 1300 stars). Scene graph star count dynamically updates with 0 geometry memory leaks.
  - [x] Dynamic frame-drop downgrade verified: sustained low FPS (<28 FPS for 3s) auto-downgrades quality tier with hysteresis preventing loops.
  - [x] In-engine performance monitor verified: toggleable via query param `?debug=true`, keyboard shortcut `Alt+D`, or `SpaceDetective.togglePerformanceMonitor(true)`. Live metrics: FPS, frame time, draw calls (15), triangles (9,288), textures, geometries.
  - [x] Page visibility handling verified: 10 consecutive hide/show cycles executed with 0 errors. AudioContext suspended/resumed safely, speech stopped on hide, clock delta reset without frame spikes.
  - [x] Image optimization & race condition guard verified: on-demand loading, verified SVG fallbacks, in-memory Map caching, next-question preloading, and late response discard protection.
  - [x] Rapid-tap / accidental double-click debounce verified: rapid 5x taps result in exactly 1 clean transition; locked planet click protection active.
  - [x] Educational image provenance audit complete: all 20 entries verified via Wikimedia Commons API metadata (11 real photographs, 9 AI-generated images, 0 invalid, 0 needs review).
  - [x] 0 console errors during full automated suite execution across all test conditions.

---

### Phase 08: Final Polish, Performance Profiling & Delivery
- **Objectives:**
  - Perform full end-to-end playtesting of the entire detective journey.
  - Verify that the game remains completely self-contained in `index.html`.
  - Audit all educational messaging to ensure alignment with ethical AI literacy guidelines.
  - Finalize documentation and release verification.
- **Key Deliverables:**
  - Production-ready, polished `index.html`.
  - Complete, verified project workspace.
- **Acceptance Criteria:**
  - Entire game launches smoothly from a local HTTP server with zero runtime errors in browser console.
  - Single-file architectural integrity strictly preserved.
  - Child usability validated through end-to-end simulated playthrough.
