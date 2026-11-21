/**
 * Mobile Feedback Overlay Verification Script
 * Tests that #btn-next-question is fully visible after answering a question
 * across 7 mobile viewports + 2 desktop viewports.
 * 
 * Uses Chrome DevTools Protocol (CDP) with Puppeteer-compatible headless Chrome.
 */

const { execSync, spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:8888';
const SCREENSHOTS_DIR = path.join(__dirname, '.');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// ───────────────────────────────────────────────────────────────────────────────
// VIEWPORTS TO TEST
// ───────────────────────────────────────────────────────────────────────────────
const VIEWPORTS = [
    // Mobile Portrait
    { label: '320x568_SE',         width: 320,  height: 568,  mobile: true },
    { label: '375x667_iPhone6',    width: 375,  height: 667,  mobile: true },
    { label: '390x844_iPhone12',   width: 390,  height: 844,  mobile: true },
    { label: '412x915_Pixel5',     width: 412,  height: 915,  mobile: true },
    { label: '430x932_iPhone15',   width: 430,  height: 932,  mobile: true },
    // Mobile Landscape
    { label: '844x390_landscape',  width: 844,  height: 390,  mobile: true },
    // Tablet
    { label: '768x1024_iPad',      width: 768,  height: 1024, mobile: true },
    // Desktop
    { label: '1366x768_desktop',   width: 1366, height: 768,  mobile: false },
    { label: '1920x1080_FHD',      width: 1920, height: 1080, mobile: false },
];

// ───────────────────────────────────────────────────────────────────────────────
// CHROME LAUNCH
// ───────────────────────────────────────────────────────────────────────────────
const CHROME_PATHS = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

function findChrome() {
    for (const p of CHROME_PATHS) {
        if (fs.existsSync(p)) return p;
    }
    throw new Error('Chrome not found');
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ───────────────────────────────────────────────────────────────────────────────
// CDP HELPER
// ───────────────────────────────────────────────────────────────────────────────
class CDPSession {
    constructor(wsUrl) {
        this.wsUrl = wsUrl;
        this.ws = null;
        this.msgId = 1;
        this.callbacks = new Map();
        this.eventHandlers = new Map();
    }

    connect() {
        return new Promise((resolve, reject) => {
            const WebSocket = require('ws');
            this.ws = new WebSocket(this.wsUrl);
            this.ws.on('open', resolve);
            this.ws.on('error', reject);
            this.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.id && this.callbacks.has(msg.id)) {
                    const { resolve, reject } = this.callbacks.get(msg.id);
                    this.callbacks.delete(msg.id);
                    if (msg.error) reject(new Error(msg.error.message));
                    else resolve(msg.result);
                }
                if (msg.method) {
                    const handler = this.eventHandlers.get(msg.method);
                    if (handler) handler(msg.params);
                }
            });
        });
    }

    send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = this.msgId++;
            this.callbacks.set(id, { resolve, reject });
            this.ws.send(JSON.stringify({ id, method, params }));
        });
    }

    on(event, handler) {
        this.eventHandlers.set(event, handler);
    }

    close() {
        if (this.ws) this.ws.close();
    }
}

async function getDebuggerUrl(port) {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/json`, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const tabs = JSON.parse(data);
                    const page = tabs.find(t => t.type === 'page');
                    resolve(page ? page.webSocketDebuggerUrl : null);
                } catch(e) { reject(e); }
            });
        });
        req.on('error', reject);
    });
}

// ───────────────────────────────────────────────────────────────────────────────
// MAIN TEST RUNNER
// ───────────────────────────────────────────────────────────────────────────────
async function runTests() {
    // Check ws module availability
    try { require('ws'); } catch(e) {
        console.error('❌ ws module not found. Run: npm install ws');
        process.exit(1);
    }

    const chromePath = findChrome();
    const debugPort = 9229;
    const profileDir = path.join(__dirname, 'chrome-profile-mobile-test-' + Date.now());

    console.log('🚀 Launching Chrome...');
    const chromeProc = spawn(chromePath, [
        `--remote-debugging-port=${debugPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        `--user-data-dir=${profileDir}`,
        '--window-size=1920,1080',
        BASE_URL,
    ], { stdio: 'ignore', detached: false });

    await sleep(2500);

    let wsUrl;
    for (let i = 0; i < 10; i++) {
        try { wsUrl = await getDebuggerUrl(debugPort); if (wsUrl) break; }
        catch(e) {}
        await sleep(500);
    }
    if (!wsUrl) throw new Error('Could not connect to Chrome debugger');

    const cdp = new CDPSession(wsUrl);
    await cdp.connect();
    console.log('✅ Connected to Chrome CDP\n');

    // Enable domains
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });

    const results = [];

    for (const vp of VIEWPORTS) {
        console.log(`\n📱 Testing viewport: ${vp.label} (${vp.width}×${vp.height})`);

        // Set device metrics
        await cdp.send('Emulation.setDeviceMetricsOverride', {
            width: vp.width,
            height: vp.height,
            deviceScaleFactor: vp.mobile ? 2 : 1,
            mobile: vp.mobile,
        });

        // Navigate fresh
        await cdp.send('Page.navigate', { url: BASE_URL + '/index.html' });
        await sleep(2500); // Wait for Three.js + game to init

        // Skip welcome → planet selection → mission intro → gameplay
        const setupResult = await cdp.send('Runtime.evaluate', {
            expression: `
                (async () => {
                    try {
                        // Click start if welcome screen active
                        const btnStart = document.querySelector('#screen-welcome .btn-cta-large');
                        if (btnStart && btnStart.offsetParent) { btnStart.click(); await new Promise(r => setTimeout(r, 600)); }

                        // Click first planet
                        const planet = document.querySelector('.planet-select-btn');
                        if (planet && planet.offsetParent) { planet.click(); await new Promise(r => setTimeout(r, 600)); }

                        // Click launch mission
                        const launch = document.querySelector('.btn-launch-mission');
                        if (launch && launch.offsetParent) { launch.click(); await new Promise(r => setTimeout(r, 600)); }

                        // Click start gameplay
                        const startGame = document.querySelector('.btn-start-gameplay');
                        if (startGame && startGame.offsetParent) { startGame.click(); await new Promise(r => setTimeout(r, 1200)); }

                        // Wait for image to load
                        await new Promise(r => setTimeout(r, 1500));

                        // Check gameplay screen visible
                        const gpScreen = document.getElementById('screen-gameplay');
                        const isVisible = gpScreen && window.getComputedStyle(gpScreen).display !== 'none';

                        return { ok: isVisible, screen: gpScreen ? window.getComputedStyle(gpScreen).display : 'NOT_FOUND' };
                    } catch(err) {
                        return { ok: false, error: err.message };
                    }
                })()
            `,
            awaitPromise: true,
            returnByValue: true,
        });

        const setupOk = setupResult?.result?.value?.ok;
        if (!setupOk) {
            console.log(`  ⚠️  Setup failed: ${JSON.stringify(setupResult?.result?.value)}`);
            results.push({ viewport: vp.label, setup: 'FAILED', btnVisible: false, btnInViewport: false });
            continue;
        }

        // Now answer the first question (click btn-answer-real)
        const answerResult = await cdp.send('Runtime.evaluate', {
            expression: `
                (async () => {
                    const btn = document.getElementById('btn-answer-real');
                    if (!btn) return { ok: false, reason: 'btn-answer-real not found' };
                    btn.click();
                    // Wait for feedback overlay to appear
                    await new Promise(r => setTimeout(r, 800));
                    const overlay = document.getElementById('feedback-overlay');
                    const display = overlay ? window.getComputedStyle(overlay).display : 'NOT_FOUND';
                    return { ok: display === 'flex' || display === 'block', display };
                })()
            `,
            awaitPromise: true,
            returnByValue: true,
        });

        const feedbackVisible = answerResult?.result?.value?.ok;
        if (!feedbackVisible) {
            console.log(`  ⚠️  Feedback overlay not shown: ${JSON.stringify(answerResult?.result?.value)}`);
            results.push({ viewport: vp.label, setup: 'OK', feedbackShown: false, btnVisible: false, btnInViewport: false });
            continue;
        }

        // Measure the Next Question button
        const measureResult = await cdp.send('Runtime.evaluate', {
            expression: `
                (() => {
                    const btn = document.getElementById('btn-next-question');
                    if (!btn) return { found: false };
                    const r = btn.getBoundingClientRect();
                    const vw = window.innerWidth;
                    const vh = window.innerHeight;
                    const inViewport = r.top >= 0 && r.bottom <= vh && r.left >= 0 && r.right <= vw;
                    const partiallyVisible = r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
                    return {
                        found: true,
                        top: Math.round(r.top),
                        bottom: Math.round(r.bottom),
                        left: Math.round(r.left),
                        right: Math.round(r.right),
                        width: Math.round(r.width),
                        height: Math.round(r.height),
                        vw, vh,
                        inViewport,
                        partiallyVisible,
                        overflowBottom: Math.round(r.bottom - vh),
                        overlayDisplay: (window.getComputedStyle(document.getElementById('feedback-overlay'))).display,
                        overlayPosition: (window.getComputedStyle(document.getElementById('feedback-overlay'))).position,
                    };
                })()
            `,
            returnByValue: true,
        });

        const m = measureResult?.result?.value;
        
        const pass = m?.found && m?.inViewport && m?.height >= 44;
        const status = pass ? '✅ PASS' : '❌ FAIL';
        
        console.log(`  ${status} | btn: top=${m?.top} bottom=${m?.bottom} h=${m?.height} | vh=${m?.vh} | inVP=${m?.inViewport} | overflow=${m?.overflowBottom}px`);
        console.log(`         | overlay: display=${m?.overlayDisplay} position=${m?.overlayPosition}`);
        
        results.push({
            viewport: vp.label,
            width: vp.width,
            height: vp.height,
            setup: 'OK',
            feedbackShown: feedbackVisible,
            btnFound: m?.found,
            btnTop: m?.top,
            btnBottom: m?.bottom,
            btnHeight: m?.height,
            vw: m?.vw,
            vh: m?.vh,
            inViewport: m?.inViewport,
            overflowBottom: m?.overflowBottom,
            overlayPosition: m?.overlayPosition,
            pass,
        });

        // Take screenshot for key viewports
        if (['390x844_iPhone12', '844x390_landscape', '375x667_iPhone6'].includes(vp.label)) {
            const screenshotResult = await cdp.send('Page.captureScreenshot', { format: 'png' });
            if (screenshotResult?.data) {
                const screenshotPath = path.join(SCREENSHOTS_DIR, `mobile_feedback_${vp.label}.png`);
                fs.writeFileSync(screenshotPath, Buffer.from(screenshotResult.data, 'base64'));
                console.log(`  📸 Screenshot: ${screenshotPath}`);
            }
        }
    }

    cdp.close();
    chromeProc.kill();

    // Clean up profile dir
    try { execSync(`rmdir /s /q "${profileDir}"`, { stdio: 'ignore' }); } catch(e) {}

    // ───── SUMMARY ─────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(70));
    console.log('TEST SUMMARY — Mobile Feedback Next Button Visibility');
    console.log('═'.repeat(70));
    
    let totalPassed = 0;
    let totalFailed = 0;

    for (const r of results) {
        const status = r.pass ? '✅ PASS' : '❌ FAIL';
        const detail = r.pass 
            ? `btn [${r.btnTop}→${r.btnBottom}] inside vh=${r.vh}` 
            : (r.setup === 'FAILED' ? 'NAVIGATION FAILED' : 
               !r.feedbackShown ? 'FEEDBACK NOT SHOWN' :
               !r.btnFound ? 'BUTTON NOT FOUND' :
               `OVERFLOW by ${r.overflowBottom}px below vh=${r.vh}`);
        console.log(`  ${status} | ${r.viewport.padEnd(22)} | ${detail}`);
        if (r.pass) totalPassed++; else totalFailed++;
    }

    console.log('═'.repeat(70));
    console.log(`TOTAL: ${totalPassed} PASSED, ${totalFailed} FAILED`);
    console.log('═'.repeat(70));

    if (totalFailed === 0) {
        console.log('\n🎉 MOBILE GAMEPLAY RESPONSIVENESS FIX: PASSED');
    } else {
        console.log('\n💥 MOBILE GAMEPLAY RESPONSIVENESS FIX: FAILED');
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
