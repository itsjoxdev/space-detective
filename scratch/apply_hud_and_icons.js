const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

console.log('Original length:', html.length);

// 1. Define the SVG icons constants for both CSS and JS
const ICONS = {
    rocket: `<svg class="ui-icon ui-icon-rocket" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4.5c1.45-1.47 4.5-2 4.5-2"/><path d="M15 15v5s3.03-.55 4.5-2c1.47-1.45 2-4.5 2-4.5"/></svg>`,
    star: `<svg class="ui-icon ui-icon-star" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    starEmpty: `<svg class="ui-icon ui-icon-star-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    volume: `<svg class="ui-icon ui-icon-volume" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
    volumeMute: `<svg class="ui-icon ui-icon-volume-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
    refresh: `<svg class="ui-icon ui-icon-refresh" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
    arrowBack: `<svg class="ui-icon ui-icon-arrow-back" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 19 12 12 5"/></svg>`,
    arrowNext: `<svg class="ui-icon ui-icon-arrow-next" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 5 12 12 19"/></svg>`,
    robot: `<svg class="ui-icon ui-icon-robot" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="10" rx="3"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8.01" y2="15" stroke-width="3"/><line x1="16" y1="15" x2="16.01" y2="15" stroke-width="3"/><line x1="9" y1="18" x2="15" y2="18"/><path d="M1 15h2M21 15h2"/></svg>`,
    camera: `<svg class="ui-icon ui-icon-camera" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    sparkles: `<svg class="ui-icon ui-icon-sparkles" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M19 3v4"/><path d="M21 5h-4"/></svg>`,
    trophy: `<svg class="ui-icon ui-icon-trophy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
    lock: `<svg class="ui-icon ui-icon-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    unlock: `<svg class="ui-icon ui-icon-unlock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
    search: `<svg class="ui-icon ui-icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    lightbulb: `<svg class="ui-icon ui-icon-lightbulb" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg>`,
    check: `<svg class="ui-icon ui-icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    close: `<svg class="ui-icon ui-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    planet: `<svg class="ui-icon ui-icon-planet" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M2.5 15.5c4-2 15-5 19-3"/><path d="M5 8.5c3-1 11-2 14 0"/></svg>`,
    moon: `<svg class="ui-icon ui-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="14" r="2" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/></svg>`,
    ringed: `<svg class="ui-icon ui-icon-ringed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="6"/><path d="M3 13.5c2.5-3 12.5-5 18-2"/><path d="M6 10c2.5-2 9-3 12-1"/></svg>`,
    galaxy: `<svg class="ui-icon ui-icon-galaxy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 2a10 10 0 0 1 8.66 5M22 12a10 10 0 0 1-5 8.66M12 22a10 10 0 0 1-8.66-5M2 12a10 10 0 0 1 5-8.66"/></svg>`,
    speech: `<svg class="ui-icon ui-icon-speech" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    alert: `<svg class="ui-icon ui-icon-alert" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
};

// Split into HTML head/style, HTML body, and Script
const scriptSeparator = '<script>';
const scriptParts = html.split(scriptSeparator);
if (scriptParts.length !== 2) {
    console.error('Expected exactly one <script> tag!');
    process.exit(1);
}

let preScript = scriptParts[0];
let scriptContent = scriptParts[1];

// 2. CSS Replacement in preScript
const oldHeaderCSS = `        /* Header Bar */
        .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            pointer-events: auto;
            width: 100%;
            max-width: 1240px;
            margin: 0 auto;
        }

        .brand-badge {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            padding: 0.6rem 1.25rem;
            border-radius: 20px;
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45), 0 0 15px rgba(0, 242, 254, 0.15);
        }

        .brand-logo {
            font-size: 1.5rem;
            filter: drop-shadow(0 0 8px var(--color-cyan));
        }

        .brand-text h1 {
            font-size: 1.25rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--color-cyan), #ffffff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1.2;
        }

        .brand-text .subtitle {
            font-size: 0.75rem;
            color: var(--color-gold);
            font-weight: 700;
        }

        .header-controls {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(0, 242, 254, 0.12);
            border: 1px solid var(--color-cyan);
            color: var(--color-cyan);
            padding: 0.45rem 1rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 700;
            backdrop-filter: blur(10px);
        }

        .status-pill .pulse-dot {
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background-color: var(--color-cyan);
            box-shadow: 0 0 8px var(--color-cyan);
            animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.75); }
        }

        .btn-nav-back {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(121, 40, 202, 0.25);
            border: 1px solid var(--color-purple);
            color: #ffffff;
            padding: 0.5rem 1.2rem;
            border-radius: 50px;
            font-family: var(--font-family);
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.25s ease;
        }

        .btn-nav-back:hover {
            background: var(--color-purple);
            box-shadow: 0 0 15px var(--color-pink-glow);
            transform: translateX(4px);
        }

        /* Phase 05: Header Total Stars Badge */
        .header-stars-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            background: rgba(255, 215, 0, 0.12);
            border: 1px solid rgba(255, 215, 0, 0.4);
            padding: 0.4rem 0.95rem;
            border-radius: 50px;
            font-size: 0.92rem;
            font-weight: 900;
            color: var(--color-gold);
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.25);
            backdrop-filter: blur(10px);
            user-select: none;
        }

        .header-stars-badge .star-icon {
            font-size: 1.15rem;
            line-height: 1;
            filter: drop-shadow(0 0 5px var(--color-gold));
        }

        /* Phase 05: Reset Progress Button */
        .btn-reset-progress {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            background: rgba(239, 68, 68, 0.12);
            border: 1px solid rgba(239, 68, 68, 0.35);
            color: #fca5a5;
            padding: 0.4rem 0.85rem;
            border-radius: 50px;
            font-family: var(--font-family);
            font-size: 0.82rem;
            font-weight: 800;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.25s ease;
        }

        .btn-reset-progress:hover {
            background: rgba(239, 68, 68, 0.28);
            border-color: #ef4444;
            color: #ffffff;
            transform: scale(1.03);
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.35);
        }

        /* Phase 06: Header Audio Toggle Button */
        .btn-audio-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            background: rgba(0, 242, 254, 0.12);
            border: 1px solid rgba(0, 242, 254, 0.4);
            color: var(--color-cyan);
            border-radius: 50%;
            font-size: 1.15rem;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.25s ease;
        }

        .btn-audio-toggle:hover {
            background: rgba(0, 242, 254, 0.25);
            border-color: var(--color-cyan);
            box-shadow: 0 0 15px var(--color-cyan-glow);
            transform: scale(1.05);
        }

        .btn-audio-toggle.muted {
            background: rgba(148, 163, 184, 0.15);
            border-color: rgba(148, 163, 184, 0.4);
            color: #94a3b8;
        }`;

const newHeaderCSS = `        /* Header Bar (Top HUD) & Icon System Polish */
        .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            pointer-events: auto;
            width: 100%;
            max-width: 1240px;
            margin: 0 auto;
            gap: 0.5rem;
        }

        .brand-badge {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            padding: 0.5rem 1.15rem;
            border-radius: 20px;
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45), 0 0 15px rgba(0, 242, 254, 0.15);
            flex-shrink: 1;
            min-width: 0;
        }

        .brand-logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--color-cyan);
            filter: drop-shadow(0 0 8px var(--color-cyan));
        }

        .brand-logo .ui-icon-rocket {
            width: 1.6rem;
            height: 1.6rem;
        }

        .brand-text {
            min-width: 0;
        }

        .brand-text h1 {
            font-size: 1.25rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--color-cyan), #ffffff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1.2;
            margin: 0;
        }

        .brand-text .subtitle {
            font-size: 0.75rem;
            color: var(--color-gold);
            font-weight: 700;
        }

        .header-controls {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            flex-shrink: 0;
        }

        .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(0, 242, 254, 0.12);
            border: 1px solid var(--color-cyan);
            color: var(--color-cyan);
            padding: 0.45rem 1rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 700;
            backdrop-filter: blur(10px);
        }

        .status-pill .pulse-dot {
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background-color: var(--color-cyan);
            box-shadow: 0 0 8px var(--color-cyan);
            animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.75); }
        }

        .btn-nav-back {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            background: rgba(121, 40, 202, 0.25);
            border: 1px solid var(--color-purple);
            color: #ffffff;
            height: 44px;
            min-height: 44px;
            padding: 0 1.15rem;
            border-radius: 50px;
            font-family: var(--font-family);
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.25s ease;
            flex-shrink: 0;
        }

        .btn-nav-back:hover {
            background: var(--color-purple);
            box-shadow: 0 0 15px var(--color-pink-glow);
            transform: translateX(4px);
        }

        /* Phase 05: Header Total Stars Badge */
        .header-stars-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.45rem;
            background: rgba(255, 215, 0, 0.12);
            border: 1px solid rgba(255, 215, 0, 0.4);
            padding: 0 0.85rem;
            height: 44px;
            min-height: 44px;
            border-radius: 50px;
            font-size: 0.92rem;
            font-weight: 900;
            color: var(--color-gold);
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.25);
            backdrop-filter: blur(10px);
            user-select: none;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .header-stars-badge .star-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--color-gold);
            filter: drop-shadow(0 0 5px var(--color-gold));
        }

        .header-stars-badge .star-icon .ui-icon-star {
            width: 1.25rem;
            height: 1.25rem;
        }

        /* Phase 05: Reset Progress Button */
        .btn-reset-progress {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.35rem;
            background: rgba(239, 68, 68, 0.12);
            border: 1px solid rgba(239, 68, 68, 0.35);
            color: #fca5a5;
            height: 44px;
            min-height: 44px;
            padding: 0 0.95rem;
            border-radius: 50px;
            font-family: var(--font-family);
            font-size: 0.82rem;
            font-weight: 800;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.25s ease;
            flex-shrink: 0;
        }

        .btn-reset-progress:hover {
            background: rgba(239, 68, 68, 0.28);
            border-color: #ef4444;
            color: #ffffff;
            transform: scale(1.03);
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.35);
        }

        /* Phase 06: Header Audio Toggle Button */
        .btn-audio-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            min-width: 44px;
            min-height: 44px;
            background: rgba(0, 242, 254, 0.12);
            border: 1px solid rgba(0, 242, 254, 0.4);
            color: var(--color-cyan);
            border-radius: 50%;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.25s ease;
            padding: 0;
            flex-shrink: 0;
        }

        .btn-audio-toggle:hover {
            background: rgba(0, 242, 254, 0.25);
            border-color: var(--color-cyan);
            box-shadow: 0 0 15px var(--color-cyan-glow);
            transform: scale(1.05);
        }

        .btn-audio-toggle.muted {
            background: rgba(148, 163, 184, 0.15);
            border-color: rgba(148, 163, 184, 0.4);
            color: #94a3b8;
        }

        /* Unified Professional UI Icon System */
        .ui-icon {
            display: inline-block;
            width: 1.2em;
            height: 1.2em;
            vertical-align: -0.22em;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            flex-shrink: 0;
            pointer-events: none;
        }

        .ui-icon-star {
            color: var(--color-gold);
            fill: currentColor;
            filter: drop-shadow(0 0 5px var(--color-gold));
        }

        .ui-icon-star-empty {
            color: rgba(255, 255, 255, 0.3);
            fill: none;
        }

        .btn-nav-back .ui-icon, .btn-reset-progress .ui-icon, .btn-audio-toggle .ui-icon {
            width: 1.25rem;
            height: 1.25rem;
        }

        .cosmo-avatar .ui-icon-robot {
            width: 1.6rem;
            height: 1.6rem;
            color: var(--color-cyan);
            filter: drop-shadow(0 0 6px var(--color-cyan));
        }

        .completion-badge-icon .ui-icon-trophy {
            width: 3.8rem;
            height: 3.8rem;
            color: var(--color-gold);
            filter: drop-shadow(0 0 16px var(--color-gold));
        }

        .star-reward-slot .ui-icon-star {
            width: 2.6rem;
            height: 2.6rem;
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .feedback-icon .ui-icon {
            width: 2rem;
            height: 2rem;
        }

        .reset-modal-icon .ui-icon-refresh {
            width: 2.8rem;
            height: 2.8rem;
            color: #ef4444;
        }

        .audio-modal-icon .ui-icon-volume {
            width: 1.6rem;
            height: 1.6rem;
            color: var(--color-cyan);
        }

        .control-emoji .ui-icon {
            width: 1.5rem;
            height: 1.5rem;
            color: var(--color-cyan);
        }

        .planet-icon .ui-icon, .summary-icon .ui-icon {
            width: 1.5rem;
            height: 1.5rem;
            vertical-align: middle;
        }

        .btn-cta-large .ui-icon, .btn-launch-mission .ui-icon, .btn-next-question .ui-icon,
        .btn-replay-mission .ui-icon, .btn-next-planet .ui-icon, .btn-return-map .ui-icon,
        .btn-answer .ui-icon {
            margin-left: 0.35rem;
            vertical-align: -0.18em;
        }`;

if (!preScript.includes(oldHeaderCSS)) {
    console.error('ERROR: oldHeaderCSS match not found in preScript!');
    process.exit(1);
}
preScript = preScript.replace(oldHeaderCSS, newHeaderCSS);

// Responsive Media Queries Replacement in preScript
const oldMediaQueries = `        /* Responsive Tweaks (Phase 07 Comprehensive Multi-Device Optimization) */
        @media (max-width: 768px) {
            #ui-layer { padding: max(0.4rem, env(safe-area-inset-top)) max(0.5rem, env(safe-area-inset-right)) max(0.4rem, env(safe-area-inset-bottom)) max(0.5rem, env(safe-area-inset-left)); max-width: 100vw; overflow-x: hidden; }
            .header-bar { gap: 0.35rem; }
            .brand-badge { padding: 0.35rem 0.65rem; }
            .brand-text h1 { font-size: 0.95rem; }
            .status-pill { display: none; }
            .planets-grid { grid-template-columns: 1fr; gap: 0.55rem; }
            .selection-action-bar { flex-direction: column; align-items: stretch; gap: 0.5rem; }
            .hud-bar { flex-wrap: wrap; gap: 0.35rem; padding: 0.45rem 0.75rem; }
            .hud-progress-info { order: 3; width: 100%; max-width: 100%; margin: 0.2rem 0 0 0; }
            .question-strip { flex-wrap: wrap; gap: 0.35rem; padding: 0.45rem 0.75rem; }
            .question-title { font-size: 0.92rem; }
            .scanner-image-viewport { height: 180px; max-height: 180px; }
            .btn-answer { min-height: 64px; font-size: 1.1rem; }
            .btn-cta-large, .btn-launch-mission, .btn-start-gameplay, .btn-next-question, .btn-next-planet, .btn-replay-mission, .btn-return-map { min-height: 64px; }
            .answer-buttons-row { grid-template-columns: 1fr; gap: 0.6rem; }
            .completion-actions { grid-template-columns: 1fr; gap: 0.6rem; }
            .completion-actions button { min-height: 60px; width: 100%; }
            .audio-settings-card { padding: 1.15rem; max-width: 95vw; }
            .dialog-bubble { padding: 0.55rem 0.85rem; }
            .dialog-text { font-size: 0.92rem; }
            .btn-speech-repeat { width: 44px; height: 44px; min-width: 44px; min-height: 44px; font-size: 1.25rem; }
            .btn-audio-toggle { width: 44px; height: 44px; min-width: 44px; min-height: 44px; }
        }

        /* Small Mobile Devices (e.g., iPhone SE, Galaxy S, 320px - 480px) */
        @media (max-width: 480px) {
            .brand-text .subtitle { display: none; }
            .welcome-title { font-size: clamp(1.2rem, 5vw, 1.8rem); }
            .welcome-desc { font-size: 0.92rem; }
            .scanner-image-viewport { height: clamp(140px, 24vh, 190px); max-height: 190px; }
            .feedback-overlay { padding: max(0.45rem, env(safe-area-inset-top)) max(0.45rem, env(safe-area-inset-right)) max(0.45rem, env(safe-area-inset-bottom)) max(0.45rem, env(safe-area-inset-left)); }
            .feedback-card { padding: 0.85rem 1rem; gap: 0.65rem; border-radius: 20px; max-height: calc(100vh - 1rem); max-height: calc(100dvh - 1rem); }
            .feedback-header { gap: 0.6rem; }
            .feedback-icon { font-size: 1.8rem; }
            .feedback-title { font-size: 1.15rem; }
            .feedback-body { padding: 0.75rem 0.9rem; gap: 0.45rem; }
            .feedback-explanation { font-size: 0.9rem; line-height: 1.45; }
            .feedback-source-meta { font-size: 0.78rem; padding-top: 0.35rem; }
            .btn-next-question { min-height: 52px; font-size: 1.05rem; }
            .audio-control-row { padding: 0.7rem 0.85rem; }
            .audio-control-info { gap: 0.5rem; }
            .control-text strong { font-size: 0.92rem; }
            .control-text span { font-size: 0.75rem; }
            .mission-completion-card { padding: 1.15rem 1rem; }
            .completion-title { font-size: 1.35rem; }
            .star-reward-slot { font-size: 2.4rem; }
            .stars-awarded-text { font-size: 1rem; }
            .completion-stats-box { padding: 0.5rem 0.8rem; gap: 0.5rem; }
            .stat-number { font-size: 1.25rem; }
            .stat-label { font-size: 0.75rem; }
        }

        /* Ultra-compact Mobile (<= 360px width, e.g. 320x568) */
        @media (max-width: 360px) {
            .brand-badge { padding: 0.25rem 0.45rem; gap: 0.35rem; }
            .brand-logo { font-size: 1.15rem; }
            .brand-text h1 { font-size: 0.82rem; }
            .header-stars-badge { padding: 0.25rem 0.45rem; font-size: 0.75rem; }
            .btn-reset-progress .btn-reset-text { display: none; }
            .btn-nav-back .nav-back-text { display: none; }
            .btn-audio-toggle { width: 38px; height: 38px; min-width: 38px; min-height: 38px; }
            .btn-reset-progress { min-width: 38px; padding: 0.4rem; }
            .btn-nav-back { min-width: 38px; padding: 0.4rem; }
            .dialog-bubble { padding: 0.4rem 0.65rem; }
            .dialog-text { font-size: 0.84rem; }
            .cosmo-avatar { font-size: 1.5rem !important; }
            .hud-planet-tag { font-size: 0.82rem; }
            .hud-score-badge { font-size: 0.78rem; padding: 0.2rem 0.5rem; }
            .progress-text { font-size: 0.8rem; }
            .feedback-card { padding: 0.65rem 0.75rem; gap: 0.45rem; border-radius: 16px; max-height: calc(100vh - 0.7rem); max-height: calc(100dvh - 0.7rem); }
            .feedback-header { gap: 0.5rem; }
            .feedback-icon { font-size: 1.5rem; }
            .feedback-title { font-size: 1.05rem; }
            .feedback-body { padding: 0.55rem 0.7rem; gap: 0.3rem; }
            .feedback-explanation { font-size: 0.82rem; line-height: 1.38; }
            .feedback-source-meta { font-size: 0.72rem; }
            .btn-next-question { min-height: 48px; font-size: 0.98rem; }
        }`;

const newMediaQueries = `        /* Responsive Tweaks (Phase 07 Comprehensive Multi-Device Optimization & Top HUD Polish) */
        @media (max-width: 768px) {
            #ui-layer { padding: max(0.4rem, env(safe-area-inset-top)) max(0.5rem, env(safe-area-inset-right)) max(0.4rem, env(safe-area-inset-bottom)) max(0.5rem, env(safe-area-inset-left)); max-width: 100vw; overflow-x: hidden; }
            .header-bar { gap: 0.35rem; }
            .brand-badge { padding: 0.3rem 0.6rem; height: 44px; min-height: 44px; border-radius: 16px; gap: 0.45rem; flex-shrink: 1; min-width: 0; }
            .brand-text h1 { font-size: clamp(0.78rem, 2.5vw, 0.95rem); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
            .brand-text .subtitle { display: none; }
            .status-pill { display: none; }
            .header-controls { gap: 0.35rem; flex-shrink: 0; }
            .btn-reset-progress .btn-reset-text { display: none; }
            .btn-nav-back .nav-back-text { display: none; }
            .btn-reset-progress, .btn-nav-back { width: 44px; height: 44px; min-width: 44px; min-height: 44px; padding: 0; border-radius: 50%; }
            .btn-audio-toggle { width: 44px; height: 44px; min-width: 44px; min-height: 44px; border-radius: 50%; }
            .header-stars-badge { height: 44px; min-height: 44px; padding: 0 0.65rem; border-radius: 50px; font-size: 0.88rem; flex-shrink: 0; }
            .planets-grid { grid-template-columns: 1fr; gap: 0.55rem; }
            .selection-action-bar { flex-direction: column; align-items: stretch; gap: 0.5rem; }
            .hud-bar { flex-wrap: wrap; gap: 0.35rem; padding: 0.45rem 0.75rem; }
            .hud-progress-info { order: 3; width: 100%; max-width: 100%; margin: 0.2rem 0 0 0; }
            .question-strip { flex-wrap: wrap; gap: 0.35rem; padding: 0.45rem 0.75rem; }
            .question-title { font-size: 0.92rem; }
            .scanner-image-viewport { height: 180px; max-height: 180px; }
            .btn-answer { min-height: 64px; font-size: 1.1rem; }
            .btn-cta-large, .btn-launch-mission, .btn-start-gameplay, .btn-next-question, .btn-next-planet, .btn-replay-mission, .btn-return-map { min-height: 64px; }
            .answer-buttons-row { grid-template-columns: 1fr; gap: 0.6rem; }
            .completion-actions { grid-template-columns: 1fr; gap: 0.6rem; }
            .completion-actions button { min-height: 60px; width: 100%; }
            .audio-settings-card { padding: 1.15rem; max-width: 95vw; }
            .dialog-bubble { padding: 0.55rem 0.85rem; }
            .dialog-text { font-size: 0.92rem; }
            .btn-speech-repeat { width: 44px; height: 44px; min-width: 44px; min-height: 44px; font-size: 1.25rem; }
        }

        /* Small Mobile Devices (e.g., iPhone SE, Galaxy S, 320px - 480px) */
        @media (max-width: 480px) {
            .header-bar { gap: 0.25rem; }
            .header-controls { gap: 0.25rem; }
            .brand-badge { padding: 0.25rem 0.45rem; gap: 0.3rem; }
            .brand-logo .ui-icon-rocket { width: 1.35rem; height: 1.35rem; }
            .brand-text h1 { font-size: 0.85rem; }
            .header-stars-badge { padding: 0 0.5rem; font-size: 0.82rem; gap: 0.25rem; }
            .welcome-title { font-size: clamp(1.2rem, 5vw, 1.8rem); }
            .welcome-desc { font-size: 0.92rem; }
            .scanner-image-viewport { height: clamp(140px, 24vh, 190px); max-height: 190px; }
            .feedback-overlay { padding: max(0.45rem, env(safe-area-inset-top)) max(0.45rem, env(safe-area-inset-right)) max(0.45rem, env(safe-area-inset-bottom)) max(0.45rem, env(safe-area-inset-left)); }
            .feedback-card { padding: 0.85rem 1rem; gap: 0.65rem; border-radius: 20px; max-height: calc(100vh - 1rem); max-height: calc(100dvh - 1rem); }
            .feedback-header { gap: 0.6rem; }
            .feedback-icon { font-size: 1.8rem; }
            .feedback-title { font-size: 1.15rem; }
            .feedback-body { padding: 0.75rem 0.9rem; gap: 0.45rem; }
            .feedback-explanation { font-size: 0.9rem; line-height: 1.45; }
            .feedback-source-meta { font-size: 0.78rem; padding-top: 0.35rem; }
            .btn-next-question { min-height: 52px; font-size: 1.05rem; }
            .audio-control-row { padding: 0.7rem 0.85rem; }
            .audio-control-info { gap: 0.5rem; }
            .control-text strong { font-size: 0.92rem; }
            .control-text span { font-size: 0.75rem; }
            .mission-completion-card { padding: 1.15rem 1rem; }
            .completion-title { font-size: 1.35rem; }
            .star-reward-slot { font-size: 2.4rem; }
            .stars-awarded-text { font-size: 1rem; }
            .completion-stats-box { padding: 0.5rem 0.8rem; gap: 0.5rem; }
            .stat-number { font-size: 1.25rem; }
            .stat-label { font-size: 0.75rem; }
        }

        /* Ultra-compact Mobile (<= 360px width, e.g. 320x568) */
        @media (max-width: 360px) {
            #ui-layer { padding: max(0.3rem, env(safe-area-inset-top)) max(0.35rem, env(safe-area-inset-right)) max(0.3rem, env(safe-area-inset-bottom)) max(0.35rem, env(safe-area-inset-left)); }
            .header-bar { gap: 0.2rem; }
            .brand-badge { padding: 0.2rem 0.35rem; gap: 0.25rem; max-width: 95px; }
            .brand-logo .ui-icon-rocket { width: 1.2rem; height: 1.2rem; }
            .brand-text h1 { font-size: 0.74rem; }
            .header-controls { gap: 0.2rem; }
            .header-stars-badge { padding: 0 0.35rem; font-size: 0.76rem; gap: 0.2rem; }
            .btn-audio-toggle, .btn-reset-progress, .btn-nav-back { width: 44px; height: 44px; min-width: 44px; min-height: 44px; }
            .dialog-bubble { padding: 0.4rem 0.65rem; }
            .dialog-text { font-size: 0.84rem; }
            .cosmo-avatar { font-size: 1.5rem !important; }
            .hud-planet-tag { font-size: 0.82rem; }
            .hud-score-badge { font-size: 0.78rem; padding: 0.2rem 0.5rem; }
            .progress-text { font-size: 0.8rem; }
            .feedback-card { padding: 0.65rem 0.75rem; gap: 0.45rem; border-radius: 16px; max-height: calc(100vh - 0.7rem); max-height: calc(100dvh - 0.7rem); }
            .feedback-header { gap: 0.5rem; }
            .feedback-icon { font-size: 1.5rem; }
            .feedback-title { font-size: 1.05rem; }
            .feedback-body { padding: 0.55rem 0.7rem; gap: 0.3rem; }
            .feedback-explanation { font-size: 0.82rem; line-height: 1.38; }
            .feedback-source-meta { font-size: 0.72rem; }
            .btn-next-question { min-height: 48px; font-size: 0.98rem; }
        }`;

if (!preScript.includes(oldMediaQueries)) {
    console.error('ERROR: oldMediaQueries match not found in preScript!');
    process.exit(1);
}
preScript = preScript.replace(oldMediaQueries, newMediaQueries);

// Top Header HTML structure in preScript
const oldHeaderHTML = `        <!-- Persistent Header Bar -->
        <header class="header-bar">
            <div class="brand-badge">
                <span class="brand-logo">🚀</span>
                <div class="brand-text">
                    <h1>محقّق الفضاء الصغير</h1>
                    <span class="subtitle">Space Detective — مغامرة الصور الذكية</span>
                </div>
            </div>

            <div class="header-controls">
                <div class="header-stars-badge" id="header-stars-badge" title="مجموع النجوم المكتسبة">
                    <span class="star-icon">⭐</span>
                    <span id="header-stars-count">٠ / ٩</span>
                </div>
                <button class="btn-audio-toggle" id="btn-audio-toggle" title="إعدادات الصوت والمؤثرات" aria-label="إعدادات الصوت والمؤثرات">
                    <span id="header-audio-icon">🔊</span>
                </button>
                <button class="btn-reset-progress" id="btn-reset-progress" title="إعادة ضبط المغامرة" aria-label="إعادة ضبط المغامرة">
                    <span class="btn-reset-icon">🔄</span>
                    <span class="btn-reset-text"> إعادة الرحلة</span>
                </button>
                <button class="btn-nav-back" id="btn-back-global" style="display: none;" title="العودة للخلف" aria-label="العودة للخلف">
                    <span class="nav-back-icon">⬅</span>
                    <span class="nav-back-text"> العودة</span>
                </button>
                <div class="status-pill">
                    <span class="pulse-dot"></span>
                    <span id="system-status">بيئة Three.js نشطة</span>
                </div>
            </div>
        </header>`;

const newHeaderHTML = `        <!-- Persistent Header Bar -->
        <header class="header-bar">
            <div class="brand-badge">
                <span class="brand-logo">${ICONS.rocket}</span>
                <div class="brand-text">
                    <h1>محقّق الفضاء الصغير</h1>
                    <span class="subtitle">Space Detective — مغامرة الصور الذكية</span>
                </div>
            </div>

            <div class="header-controls">
                <div class="header-stars-badge" id="header-stars-badge" title="مجموع النجوم المكتسبة">
                    <span class="star-icon">${ICONS.star}</span>
                    <span id="header-stars-count">٠ / ٩</span>
                </div>
                <button class="btn-audio-toggle" id="btn-audio-toggle" title="إعدادات الصوت والمؤثرات" aria-label="إعدادات الصوت والمؤثرات">
                    <span id="header-audio-icon">${ICONS.volume}</span>
                </button>
                <button class="btn-reset-progress" id="btn-reset-progress" title="إعادة ضبط المغامرة" aria-label="إعادة ضبط المغامرة">
                    <span class="btn-reset-icon">${ICONS.refresh}</span>
                    <span class="btn-reset-text"> إعادة الرحلة</span>
                </button>
                <button class="btn-nav-back" id="btn-back-global" style="display: none;" title="العودة للخلف" aria-label="العودة للخلف">
                    <span class="nav-back-icon">${ICONS.arrowBack}</span>
                    <span class="nav-back-text"> العودة</span>
                </button>
                <div class="status-pill">
                    <span class="pulse-dot"></span>
                    <span id="system-status">بيئة Three.js نشطة</span>
                </div>
            </div>
        </header>`;

if (!preScript.includes(oldHeaderHTML)) {
    console.error('ERROR: oldHeaderHTML match not found in preScript!');
    process.exit(1);
}
preScript = preScript.replace(oldHeaderHTML, newHeaderHTML);

// Replace Static UI emojis strictly inside preScript (the HTML section)
const htmlReplacements = [
    // Welcome Screen
    ['<div class="cosmo-avatar">🤖</div>', `<div class="cosmo-avatar">${ICONS.robot}</div>`],
    ['<button class="btn-speech-repeat" id="btn-speak-welcome" title="استمع لصوت كوزمو" aria-label="استمع لصوت كوزمو">🔊</button>', `<button class="btn-speech-repeat" id="btn-speak-welcome" title="استمع لصوت كوزمو" aria-label="استمع لصوت كوزمو">${ICONS.volume}</button>`],
    ['<span>🚀 ابدأ المغامرة</span>', `<span>${ICONS.rocket} ابدأ المغامرة</span>`],

    // Planet Selection Screen
    ['<h2>🪐 اختر كوكب مغامرتك!</h2>', `<h2>${ICONS.planet} اختر كوكب مغامرتك!</h2>`],
    ['<span class="planet-icon">🌕</span>', `<span class="planet-icon">${ICONS.moon}</span>`],
    ['<span class="status-lock-pill unlocked">🔓 مفتوح ومتاح للعب</span>', `<span class="status-lock-pill unlocked">${ICONS.unlock} مفتوح ومتاح للعب</span>`],
    ['<span class="planet-icon">🪐</span>', `<span class="planet-icon">${ICONS.ringed}</span>`],
    ['<span class="status-lock-pill locked-text">🔒 يتطلب إكمال كوكب القمر</span>', `<span class="status-lock-pill locked-text">${ICONS.lock} يتطلب إكمال كوكب القمر</span>`],
    ['<span class="planet-icon">🌌</span>', `<span class="planet-icon">${ICONS.galaxy}</span>`],
    ['<span class="status-lock-pill locked-text">🔒 يتطلب إكمال الكوكب الملوّن</span>', `<span class="status-lock-pill locked-text">${ICONS.lock} يتطلب إكمال الكوكب الملوّن</span>`],
    ['<span class="summary-icon" id="summary-icon">🌕</span>', `<span class="summary-icon" id="summary-icon">${ICONS.moon}</span>`],
    ['<span>🚀 ابدأ المهمة</span>', `<span>${ICONS.rocket} ابدأ المهمة</span>`],

    // Mission Intro Screen
    ['<button class="btn-speech-repeat" id="btn-speak-intro" title="استمع لصوت كوزمو" aria-label="استمع لصوت كوزمو">🔊</button>', `<button class="btn-speech-repeat" id="btn-speak-intro" title="استمع لصوت كوزمو" aria-label="استمع لصوت كوزمو">${ICONS.volume}</button>`],
    ['<span>اختر الزر المناسب: صورة حقيقية 📷 أم ذكاء اصطناعي 🪄.</span>', `<span>اختر الزر المناسب: صورة حقيقية ${ICONS.camera} أم ذكاء اصطناعي ${ICONS.sparkles}.</span>`],

    // Gameplay Screen
    ['<span>🌕</span> <span id="hud-planet-name">كوكب القمر</span>', `<span>${ICONS.moon}</span> <span id="hud-planet-name">كوكب القمر</span>`],
    ['<span>⭐</span> <span id="hud-score-count">٠ إجابات</span>', `<span>${ICONS.star}</span> <span id="hud-score-count">٠ إجابات</span>`],
    ['<span>🔍</span>', `<span>${ICONS.search}</span>`],
    ['<div class="cosmo-avatar" style="font-size: 1.8rem;">🤖</div>', `<div class="cosmo-avatar">${ICONS.robot}</div>`],
    ['<button class="btn-speech-repeat" id="btn-speak-gameplay" title="استمع لصوت كوزمو" aria-label="استمع لصوت كوزمو">🔊</button>', `<button class="btn-speech-repeat" id="btn-speak-gameplay" title="استمع لصوت كوزمو" aria-label="استمع لصوت كوزمو">${ICONS.volume}</button>`],
    ['<span>📷 صورة حقيقية</span>', `<span>${ICONS.camera} صورة حقيقية</span>`],
    ['<span>✨ من الذكاء الاصطناعي</span>', `<span>${ICONS.sparkles} من الذكاء الاصطناعي</span>`],

    // Mission Completion Screen
    ['<div class="completion-badge-icon">🏆</div>', `<div class="completion-badge-icon">${ICONS.trophy}</div>`],
    ['<span class="star-reward-slot" id="reward-star-1">⭐</span>', `<span class="star-reward-slot" id="reward-star-1">${ICONS.star}</span>`],
    ['<span class="star-reward-slot" id="reward-star-2">⭐</span>', `<span class="star-reward-slot" id="reward-star-2">${ICONS.star}</span>`],
    ['<span class="star-reward-slot" id="reward-star-3">⭐</span>', `<span class="star-reward-slot" id="reward-star-3">${ICONS.star}</span>`],
    ['<button class="btn-speech-repeat" id="btn-speak-completion" title="استمع لصوت كوزمو" aria-label="استمع لصوت كوزمو">🔊</button>', `<button class="btn-speech-repeat" id="btn-speak-completion" title="استمع لصوت كوزمو" aria-label="استمع لصوت كوزمو">${ICONS.volume}</button>`],
    ['<span>🔄 العب مجدداً</span>', `<span>${ICONS.refresh} العب مجدداً</span>`],
    ['<span>🚀 الكوكب التالي</span>', `<span>${ICONS.rocket} الكوكب التالي</span>`],
    ['<span>🪐 خريطة الكواكب</span>', `<span>${ICONS.planet} خريطة الكواكب</span>`],

    // Feedback Modal Overlay
    ['<span class="feedback-icon" id="fb-icon">⭐</span>', `<span class="feedback-icon" id="fb-icon">${ICONS.star}</span>`],
    ['<span>السؤال التالي ⬅</span>', `<span>السؤال التالي ${ICONS.arrowNext}</span>`],

    // Modals
    ['<div class="reset-modal-icon">🔄</div>', `<div class="reset-modal-icon">${ICONS.refresh}</div>`],
    ['<span class="audio-modal-icon">🔊</span>', `<span class="audio-modal-icon">${ICONS.volume}</span>`],
    ['<button class="btn-close-audio" id="btn-close-audio" aria-label="إغلاق نافذة إعدادات الصوت">✕</button>', `<button class="btn-close-audio" id="btn-close-audio" aria-label="إغلاق نافذة إعدادات الصوت">${ICONS.close}</button>`],
    ['<span class="control-emoji">✨</span>', `<span class="control-emoji">${ICONS.sparkles}</span>`],
    ['<span class="control-emoji">🗣️</span>', `<span class="control-emoji">${ICONS.speech}</span>`],
    ['<span id="btn-quick-mute-icon">🔇</span>', `<span id="btn-quick-mute-icon">${ICONS.volumeMute}</span>`],
    ['<h2>⚠️ تعذر تشغيل الرسوم ثلاثية الأبعاد</h2>', `<h2>${ICONS.alert} تعذر تشغيل الرسوم ثلاثية الأبعاد</h2>`]
];

for (const [target, replacement] of htmlReplacements) {
    if (!preScript.includes(target)) {
        console.warn(`WARNING: Target string not found in preScript: ${target.slice(0, 40)}...`);
    } else {
        preScript = preScript.split(target).join(replacement);
    }
}
console.log('Finished preScript HTML replacements.');

// 3. Inject ICONS into scriptContent
const jsIconsDef = `
        // Phase 07 Polish: Unified Inline SVG Icon System
        const ICONS = ${JSON.stringify(ICONS, null, 12)};
`;

const jsInsertionTarget = `        /**
         * Space Detective (محقّق الفضاء الصغير) — Phase 04 Investigation Engine`;

if (!scriptContent.includes(jsInsertionTarget)) {
    console.error('ERROR: jsInsertionTarget not found in scriptContent!');
    process.exit(1);
}
scriptContent = scriptContent.replace(jsInsertionTarget, `${jsIconsDef}\n${jsInsertionTarget}`);

// 4. Update dynamic JS references inside scriptContent
const jsReplacements = [
    // HUD planet tag
    [
        `const pNames = { moon: 'كوكب القمر', colorful: 'الكوكب الملوّن', galaxy: 'كوكب المجرة' };
                    const pIcons = { moon: '🌕', colorful: '🪐', galaxy: '🌌' };
                    document.getElementById('hud-planet-name').textContent = pNames[planetId] || planetId;
                    document.getElementById('hud-planet-tag').firstElementChild.textContent = pIcons[planetId] || '🪐';`,
        `const pNames = { moon: 'كوكب القمر', colorful: 'الكوكب الملوّن', galaxy: 'كوكب المجرة' };
                    const pIcons = { moon: ICONS.moon, colorful: ICONS.ringed, galaxy: ICONS.galaxy };
                    document.getElementById('hud-planet-name').textContent = pNames[planetId] || planetId;
                    document.getElementById('hud-planet-tag').firstElementChild.innerHTML = pIcons[planetId] || ICONS.planet;`
    ],
    // Feedback icon & next button
    [
        `if (isCorrect) {
                        fbIcon.textContent = '⭐';`,
        `if (isCorrect) {
                        fbIcon.innerHTML = ICONS.star;`
    ],
    [
        `} else {
                        fbIcon.textContent = '💡';`,
        `} else {
                        fbIcon.innerHTML = ICONS.lightbulb;`
    ],
    [
        `const isLast = (this.currentIndex + 1 >= this.questions.length);
                    btnNext.firstElementChild.textContent = isLast ? 'عرض نتيجة المهمة 🏆' : 'السؤال التالي ⬅';`,
        `const isLast = (this.currentIndex + 1 >= this.questions.length);
                    btnNext.firstElementChild.innerHTML = isLast ? \`عرض نتيجة المهمة \${ICONS.trophy}\` : \`السؤال التالي \${ICONS.arrowNext}\`;`
    ],
    // Audio toggle icon update
    [
        `if (iconSpan) {
                            iconSpan.textContent = this.settings.muted ? '🔇' : '🔊';
                        }`,
        `if (iconSpan) {
                            iconSpan.innerHTML = this.settings.muted ? ICONS.volumeMute : ICONS.volume;
                        }`
    ],
    // Quick mute icon
    [
        `if (btnQuickMuteIcon) btnQuickMuteIcon.textContent = this.settings.muted ? '🔊' : '🔇';`,
        `if (btnQuickMuteIcon) btnQuickMuteIcon.innerHTML = this.settings.muted ? ICONS.volume : ICONS.volumeMute;`
    ],
    // Planet cards status pill and stars
    [
        `if (prog.completed) {
                            statusPill.className = 'status-lock-pill unlocked';
                            statusPill.innerHTML = \`✔ مكتمل (أفضل نتيجة: \${toArNum(prog.bestCorrect)}/\${toArNum(totalQ)})\`;
                        } else if (isUnlocked) {
                            statusPill.className = 'status-lock-pill unlocked';
                            statusPill.innerHTML = '🔓 مفتوح ومتاح للعب';
                        } else {
                            statusPill.className = 'status-lock-pill locked-text';
                            const reqNames = { colorful: 'كوكب القمر', galaxy: 'الكوكب الملوّن' };
                            statusPill.innerHTML = \`🔒 يتطلب إكمال \${reqNames[pid] || 'الكوكب السابق'}\`;
                        }`,
        `if (prog.completed) {
                            statusPill.className = 'status-lock-pill unlocked';
                            statusPill.innerHTML = \`\${ICONS.check} مكتمل (أفضل نتيجة: \${toArNum(prog.bestCorrect)}/\${toArNum(totalQ)})\`;
                        } else if (isUnlocked) {
                            statusPill.className = 'status-lock-pill unlocked';
                            statusPill.innerHTML = \`\${ICONS.unlock} مفتوح ومتاح للعب\`;
                        } else {
                            statusPill.className = 'status-lock-pill locked-text';
                            const reqNames = { colorful: 'كوكب القمر', galaxy: 'الكوكب الملوّن' };
                            statusPill.innerHTML = \`\${ICONS.lock} يتطلب إكمال \${reqNames[pid] || 'الكوكب السابق'}\`;
                        }`
    ],
    [
        `starHtml += '<span class="star-earned">⭐</span>';
                        } else {
                            starHtml += '<span class="star-empty">★</span>';`,
        `starHtml += \`<span class="star-earned">\${ICONS.star}</span>\`;
                        } else {
                            starHtml += \`<span class="star-empty">\${ICONS.starEmpty}</span>\`;`
    ],
    // GameState.planets icons
    [
        `moon: { id: 'moon', name: 'كوكب القمر', difficulty: 'سهل', diffClass: 'diff-easy', desc: 'لنبدأ باكتشاف الصور الحقيقية مع كوزمو!', unlocked: true, icon: '🌕' },
                    colorful: { id: 'colorful', name: 'الكوكب الملوّن', difficulty: 'متوسط', diffClass: 'diff-medium', desc: 'مغامرة جديدة وأسرار أكثر بين الحلقات الملونة!', unlocked: false, icon: '🪐' },
                    galaxy: { id: 'galaxy', name: 'كوكب المجرة', difficulty: 'متقدم', diffClass: 'diff-hard', desc: 'هل أنت مستعد للتحدي الأكبر وسط النجوم اللامعة؟', unlocked: false, icon: '🌌' }`,
        `moon: { id: 'moon', name: 'كوكب القمر', difficulty: 'سهل', diffClass: 'diff-easy', desc: 'لنبدأ باكتشاف الصور الحقيقية مع كوزمو!', unlocked: true, icon: ICONS.moon },
                    colorful: { id: 'colorful', name: 'الكوكب الملوّن', difficulty: 'متوسط', diffClass: 'diff-medium', desc: 'مغامرة جديدة وأسرار أكثر بين الحلقات الملونة!', unlocked: false, icon: ICONS.ringed },
                    galaxy: { id: 'galaxy', name: 'كوكب المجرة', difficulty: 'متقدم', diffClass: 'diff-hard', desc: 'هل أنت مستعد للتحدي الأكبر وسط النجوم اللامعة؟', unlocked: false, icon: ICONS.galaxy }`
    ],
    // selectPlanet summary icon & launch button
    [
        `document.getElementById('summary-icon').textContent = planetData.icon;`,
        `document.getElementById('summary-icon').innerHTML = planetData.icon;`
    ],
    [
        `btnLaunch.innerHTML = prog.completed ? '<span>🔄 إعادة الاستكشاف</span>' : '<span>🚀 ابدأ المهمة</span>';
                } else {
                    btnLaunch.classList.add('disabled');
                    btnLaunch.innerHTML = '<span>🔒 كوكب مقفل</span>';`,
        `btnLaunch.innerHTML = prog.completed ? \`<span>\${ICONS.refresh} إعادة الاستكشاف</span>\` : \`<span>\${ICONS.rocket} ابدأ المهمة</span>\`;
                } else {
                    btnLaunch.classList.add('disabled');
                    btnLaunch.innerHTML = \`<span>\${ICONS.lock} كوكب مقفل</span>\`;`
    ],
    // Next planet button labels in completion
    [
        `const nextLabels = { colorful: '🚀 انطلق للكوكب الملوّن', galaxy: '🚀 انطلق لكوكب المجرة' };
                        btnNext.firstElementChild.textContent = nextLabels[result.newlyUnlocked] || '🚀 الكوكب التالي';`,
        `const nextLabels = { colorful: \`\${ICONS.rocket} انطلق للكوكب الملوّن\`, galaxy: \`\${ICONS.rocket} انطلق لكوكب المجرة\` };
                        btnNext.firstElementChild.innerHTML = nextLabels[result.newlyUnlocked] || \`\${ICONS.rocket} الكوكب التالي\`;`
    ],
    [
        `const nextLabels = { colorful: '🚀 انطلق للكوكب الملوّن', galaxy: '🚀 انطلق لكوكب المجرة' };
                            btnNext.firstElementChild.textContent = nextLabels[candidateNext] || '🚀 الكوكب التالي';`,
        `const nextLabels = { colorful: \`\${ICONS.rocket} انطلق للكوكب الملوّن\`, galaxy: \`\${ICONS.rocket} انطلق لكوكب المجرة\` };
                            btnNext.firstElementChild.innerHTML = nextLabels[candidateNext] || \`\${ICONS.rocket} الكوكب التالي\`;`
    ]
];

for (const [target, replacement] of jsReplacements) {
    if (!scriptContent.includes(target)) {
        console.error(`ERROR: JS target not found:\n${target}`);
        process.exit(1);
    }
    scriptContent = scriptContent.replace(target, replacement);
}
console.log('Finished JS dynamic icon replacements.');

// Reassemble HTML
const newHtml = preScript + '<script>' + scriptContent;
fs.writeFileSync(indexPath, newHtml, 'utf-8');
console.log('Successfully written updated index.html! New length:', newHtml.length);
