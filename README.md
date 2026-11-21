# Space Detective | محقّق الفضاء الصغير

> **Interactive 3D Educational Browser Game for Children Aged 4–6**  
> **لعبة تعليمية ثلاثية الأبعاد للأطفال لتمييز الصور الحقيقية من المنشأة بالذكاء الاصطناعي**

---

## 1. Project Overview

**Space Detective (محقّق الفضاء الصغير)** is a premium, lightweight, browser-based 3D educational game designed for young children (ages 4–6). Set in a colorful, futuristic deep-space universe, players take on the role of a junior space detective accompanied by a friendly 3D robot companion. Together, they explore diverse planets and inspect cosmic transmissions to learn how to distinguish verified real photographs from AI-generated imagery in a fun, positive, and age-appropriate manner.

---

## 2. Core Architecture & Technologies

The project strictly follows a **Single-File Game Architecture** designed for high accessibility, zero setup friction, and optimal performance across tablets, laptops, and mobile devices.

- **Markup & Styling:** HTML5 & CSS3 (embedded in `index.html`).
- **Logic & Gameplay:** Vanilla JavaScript (ES6+, embedded in `index.html`).
- **3D Graphics Engine:** [Three.js](https://threejs.org/) (loaded via CDN).
- **Animation Support:** [GSAP](https://greensock.com/gsap/) (via CDN, when advanced UI/camera transitions are required).
- **Voice & Accessibility:** Web Speech API (`SpeechSynthesis`) for natural Arabic voice prompts.
- **Language & Orientation:** Native Arabic interface with full Right-to-Left (RTL) layout.

> **Design Principle:** No bundlers, no frameworks (React/Vue/Angular), no TypeScript, no Node.js backend, and no databases. The game runs completely client-side in the browser.

---

## 3. Project Directory Structure

```text
space-detective/
│
├── index.html                      # Single-file game entry point (HTML, CSS, JS, Three.js)
│
├── docs/                           # Architecture, game design, and roadmap documentation
│   ├── project-brief.md            # Vision, pedagogical goals, and constraints
│   ├── game-design.md              # Screen flows, UX specs, robot mascot, and scoring
│   └── implementation-plan.md      # Phased engineering roadmap and acceptance criteria
│
├── README.md                       # Project summary and quickstart guide
│
└── .gitignore                      # Standard OS and IDE exclusions
```

---

## 4. How to Run Locally

Because the game utilizes Three.js shaders and standard web APIs, it must be served through an HTTP server rather than opened via the direct `file://` protocol.

### Option A: Using Python (Recommended)

If Python is installed on your machine:

```bash
# In the space-detective directory:
python -m http.server 8000
```
Then navigate to: `http://localhost:8000`

### Option B: Using Node / npx (Zero Installation)

If Node.js is available:

```bash
npx serve .
# or
npx http-server -p 8000
```

### Option C: VS Code Live Server

1. Open `space-detective` in Visual Studio Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and click **"Open with Live Server"**.

---

## 5. Browser & System Requirements

- **Supported Browsers:** Modern Chromium-based browsers (Google Chrome, Microsoft Edge), Mozilla Firefox, and Apple Safari (macOS / iOS / iPadOS).
- **Hardware Acceleration:** WebGL 1.0 or WebGL 2.0 support enabled.
- **Display:** Responsive design optimized for touch screens (iPad/Android tablets) and desktops (1024×768 up to 4K).
- **Internet / CDN Connection:** Required to load Three.js and Google Fonts from verified CDNs on initial page load.
- **Speech Synthesis:** Requires browser support for the Web Speech API with Arabic (`ar-SA` / `ar`) voice support for optimal audio immersion.

---

## 6. Pedagogical Note

This project is built with care for early-childhood cognitive development:
1. **Positive Reinforcement:** No failure states, timers, or penalizing sounds.
2. **Responsible AI Literacy:** Avoids teaching flawed heuristics (e.g., "AI always makes bad hands"); instead, focuses on guided observation, context, and media origin awareness.
3. **Audio-First RTL Interface:** Large visual cues and spoken Arabic audio instructions minimize dependence on reading skills.

---

## 7. Documentation Index

Detailed project specifications are organized in the `docs/` directory:
- [docs/project-brief.md](file:///e:/projects/space-detective/docs/project-brief.md) — Educational objectives and technical constraints.
- [docs/game-design.md](file:///e:/projects/space-detective/docs/game-design.md) — Complete game loop, screen designs, and art direction.
- [docs/implementation-plan.md](file:///e:/projects/space-detective/docs/implementation-plan.md) — 8-phase execution plan and verification milestones.
