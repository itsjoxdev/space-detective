# Space Detective (محقّق الفضاء الصغير) — Game Design Document

## 1. Vision & Emotional Core

**Space Detective** transforms digital media literacy into a thrilling cosmic adventure. Rather than feeling like a test or classroom quiz, the game invites 4-to-6-year-old players into the role of a capable cosmic explorer. Every interaction is designed to feel magical, celebratory, tactile, and supportive.

---

## 2. Visual Direction & Art Style

- **Theme:** High-End Futuristic Space Adventure for Children.
- **Color Palette:**
  - **Cosmic Void (Background):** Deep Midnight Navy (`#050814`) to Indigo (`#0b102b`).
  - **Cyber Cyan (Interactive / Real):** `#00f2fe` / `#4facfe` (representing real-world clarity and navigation).
  - **Electric Purple / Magenta (Creative / AI):** `#7928ca` / `#ff0080` (representing imagination and AI generation).
  - **Star Gold (Rewards & Badges):** `#ffd700` / `#ffaa00` (celebration stars and progress).
- **3D Robot Mascot (Cosmo / كوزمو):**
  - Friendly cartoon aesthetic built with smooth geometric forms (spherical head, pill-shaped torso, floating magnetic hands, glowing visor eyes).
  - Idle bobbing animation, joyful jumping upon correct answers, and encouraging waving gestures during hints.
- **Planets:**
  - Distinct 3D spheres with stylized textures and subtle orbital rotations.
- **UI Elements:**
  - Holographic frosted glass cards (`backdrop-filter: blur(12px)`).
  - Neon glowing borders and generous button tap targets (minimum 64px height, 24px border radius).
  - Modern Arabic typography with rounded terminals (Cairo / Tajawal).

---

## 3. Screen-by-Screen Flow & Specifications

```
┌─────────────────────────────────────────────────────────────┐
│                 Screen 1: Welcome Screen                    │
│      [3D Space Canvas + Animated Cosmo Robot + Audio]       │
│                  [ابدأ المغامرة (Start)]                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Screen 2: Planet Selection                     │
│  [Moon: Easy (Unlocked)] ──► [Color: Med] ──► [Galaxy: Adv] │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Screen 3: Gameplay Screen                   │
│   [Progress 1/5] [Stars ⭐] [Cosmic Image Display Frame]    │
│            "هل هذه صورة حقيقية أم ذكاء اصطناعي؟"            │
│       [📷 صورة حقيقية (Real)]     [🪄 ذكاء اصطناعي (AI)]     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Screen 4: Feedback Modal                    │
│   Correct: [⭐ أحسنت يا بطل! + الروبوت يحتفل]               │
│   Supportive: [💡 انظر جيداً، كوزمو يساعدك في الملاحظة]      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Screen 5: Victory Screen                    │
│   [احتفال كبير + نجوم متطايرة + وسام المحقق الفضائي]        │
│             [العب مجدداً]  /  [خريطة الكواكب]               │
└─────────────────────────────────────────────────────────────┘
```

---

### Screen 1 — Welcome (شاشة الترحيب)
- **Visuals:**
  - Full-screen real-time Three.js starfield with drifting nebular particles.
  - 3D Cosmo the Robot floating in the center-right, gently hovering and waving.
  - Floating logo: **محقّق الفضاء الصغير** with a soft cosmic neon glow.
- **Audio & Speech:**
  - Robot speaks Arabic greeting: *"أهلاً بك يا بطل! أنا كوزمو، رفيقك في الفضاء. هيا نكتشف أسرار الصور معاً!"*
- **Primary Action:**
  - Prominent, pulsating CTA button: **ابدأ المغامرة** (Start Adventure).

---

### Screen 2 — Planet Selection (اختيار الكوكب)
- **Visuals:**
  - 3D carousel / map displaying three rotating planets:
    1. **Moon Planet (كوكب القمر):** Level 1 — Easy (Unlocked by default). Silvery craters with soft blue halo.
    2. **Colorful Planet (الكوكب الملوّن):** Level 2 — Medium (Locked until Moon completed). Swirling candy-colored rings.
    3. **Galaxy Planet (كوكب المجرة):** Level 3 — Advanced (Locked until Planet 2 completed). Deep violet and gold spirals.
- **Interaction:**
  - Tapping an unlocked planet highlights it with a holographic selection beam, Cosmo points toward it, and the game transitions into the mission.
  - Locked planets display a gentle golden lock icon and Cosmo announces: *"أكمل الكوكب السابق لفتح هذا العالم العجيب!"*

---

### Screen 3 — Gameplay (شاشة التحقيق واللعب)
- **Layout & Structure:**
  - **Top Bar (RTL):**
    - Back button to Planet Map (زر العودة للخريطة).
    - Mission progress indicator (e.g., `المهمة: 1 من 4`).
    - Collected stars counter (`⭐ 3`).
  - **Center Display:**
    - High-tech 3D holographic scanning frame containing the active challenge image.
    - Subtle scanning line effect that sweeps across the picture.
    - Large spoken Arabic prompt: *"هل هذه صورة حقيقية التقطتها الكاميرا، أم صنعها الذكاء الاصطناعي؟"*
    - Speaker replay button (زر إعادة الاستماع) allowing the child to re-trigger the voice instruction anytime.
  - **Bottom Action Area:**
    - Two oversized, high-contrast touch buttons:
      - **Right Button (Green/Cyan):** `📷 صورة حقيقية` (Real Photo).
      - **Left Button (Purple/Pink):** `🪄 ذكاء اصطناعي` (AI-Generated Image).
- **Dataset Integration:**
  - Carefully curated child-safe image items with verified origins.
  - Themes include: Animals (cat, elephant), space phenomena (Earth from orbit, astronaut), nature (rainbow, flowers), and futuristic vehicles.

---

### Screen 4 — Feedback (شاشة التقييم والتوجيه)
- **Correct Selection Flow:**
  - Cheerful sound effect and floating star particle explosion.
  - 3D Cosmo performs a victory spin/jump.
  - Arabic voice praise: *"رائع جداً! ملاحظة ذكية يا بطل!"* or *"ممتاز! لقد عرفت الإجابة الصحيحة!"*
  - Star count increments by +1.
  - Automatically transitions to the next item after 2 seconds or via a "Next" button.
- **Incorrect Selection Flow (Supportive Coaching):**
  - No buzzer or red cross; instead, a soft curious chime plays.
  - Cosmo tilts his head thoughtfully and offers a gentle observational hint in Arabic:
    *"انظر جيداً مع كوزمو.. هذه الصورة التقطتها كاميرا حقيقية على كوكب الأرض!"* (or vice versa).
  - The child is invited to try again or observe the clue without penalty.

---

### Screen 5 — Victory & Mission Celebration (شاشة النصر)
- **Visuals:**
  - Cosmic celebration with bursting Three.js golden star particles and colorful light beams.
  - Cosmo wears a celebratory golden detective visor/badge and does a continuous happy dance.
  - Central holographic badge: **محقّق الفضاء المعتمد** (Certified Space Detective).
  - Total stars collected summary (e.g., `⭐⭐⭐⭐⭐`).
- **Audio & Speech:**
  - Celebratory audio fanfare.
  - Spoken congratulations: *"ألف مبروك يا محقّق الفضاء الرائع! لقد أنجزت المهمة ببراعة واكتشفت جميع الصور!"*
- **Actions:**
  - **العب مجدداً** (Play Again — restarts current planet).
  - **خريطة الكواكب** (Planet Map — returns to select next unlocked planet).

---

## 4. Interaction Flow & Progression Rules

1. **State Machine:**
   - `STATE_WELCOME`: Initial load, 3D starfield idle, Cosmo greeting.
   - `STATE_PLANET_SELECT`: Level navigation, locked/unlocked state validation.
   - `STATE_GAMEPLAY`: Active item presentation, scanning animation, waiting for user input.
   - `STATE_FEEDBACK`: Active reward or hint presentation.
   - `STATE_VICTORY`: Level completion fanfare and summary.

2. **Progression Logic:**
   - **Level 1 (Moon Planet):** 3 image transmissions. High visual distinction.
   - **Level 2 (Colorful Planet):** 4 image transmissions. Moderate visual distinction. Unlocked upon completing Level 1.
   - **Level 3 (Galaxy Planet):** 5 image transmissions. Fine observational details. Unlocked upon completing Level 2.
   - Total stars are preserved in local game state during the session.

---

## 5. Accessibility & Child Usability Checklist

- [x] All buttons exceed 60×60px physical touch area.
- [x] Contrast ratio between text and backgrounds meets WCAG AAA standards.
- [x] Every text element has an audio speech equivalent via Web Speech API.
- [x] Zero penalties, zero countdown clocks, and zero negative reinforcement.
- [x] Fully native RTL text alignment and icon placement.
