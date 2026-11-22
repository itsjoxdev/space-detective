/**
 * Mobile Feedback Overlay Comprehensive Verification Script
 * 
 * Tests that #btn-next-question is fully visible, reachable, and clickable
 * after answering questions (both correct and incorrect feedback) across:
 * - 7 mobile/tablet viewports (including portrait, landscape, small/large)
 * - 2 desktop viewports (regression check)
 * 
 * Also verifies:
 * - Touch clickability and question transition
 * - Mission completion screen usability
 * - document.elementFromPoint confirms button is NOT covered
 * - Captures required screenshots
 */

const { execSync, spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
const WebSocket = require('./node_modules/ws');

const ROOT_DIR = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.resolve(__dirname, '.');
const PORT = 8889; // Use dedicated verification port
const BASE_URL = `http://localhost:${PORT}`;

// ───────────────────────────────────────────────────────────────────────────────
// EMBEDDED ZERO-DEPENDENCY HTTP SERVER
// ───────────────────────────────────────────────────────────────────────────────
function startStaticServer(port) {
    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };

    const server = http.createServer((req, res) => {
        let reqPath = decodeURI(req.url.split('?')[0]);
        if (reqPath === '/') reqPath = '/index.html';
        const filePath = path.join(ROOT_DIR, reqPath);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            res.writeHead(200, {
                'Content-Type': mimeTypes[ext] || 'application/octet-stream',
                'Access-Control-Allow-Origin': '*'
            });
            fs.createReadStream(filePath).pipe(res);
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
    });

    return new Promise((resolve) => {
        server.listen(port, () => {
            console.log(`📡 Internal HTTP server running at ${BASE_URL}`);
            resolve(server);
        });
    });
}

// ───────────────────────────────────────────────────────────────────────────────
// TARGET VIEWPORTS (From Section 5 of Prompt)
// ───────────────────────────────────────────────────────────────────────────────
const VIEWPORTS = [
    // 7 Mobile / Tablet viewports
    { label: '320x568_SmallMobile',     width: 320,  height: 568,  mobile: true  },
    { label: '375x667_iPhoneSE',        width: 375,  height: 667,  mobile: true  },
    { label: '390x844_StandardMobile',   width: 390,  height: 844,  mobile: true  },
    { label: '412x915_AndroidMobile',    width: 412,  height: 915,  mobile: true  },
    { label: '430x932_LargeMobile',      width: 430,  height: 932,  mobile: true  },
    { label: '844x390_MobileLandscape',  width: 844,  height: 390,  mobile: true  },
    { label: '768x1024_SmallTablet',     width: 768,  height: 1024, mobile: true  },
    // 2 Desktop regression viewports
    { label: '1366x768_Desktop',         width: 1366, height: 768,  mobile: false },
    { label: '1920x1080_FHDDesktop',     width: 1920, height: 1080, mobile: false }
];

// ───────────────────────────────────────────────────────────────────────────────
// CHROME LAUNCH & CDP HELPERS
// ───────────────────────────────────────────────────────────────────────────────
const CHROME_PATHS = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

function findChrome() {
    for (const p of CHROME_PATHS) {
        if (fs.existsSync(p)) return p;
    }
    throw new Error('Chrome executable not found');
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

class CDPSession {
    constructor(wsUrl) {
        this.wsUrl = wsUrl;
        this.ws = null;
        this.msgId = 1;
        this.callbacks = new Map();
    }

    connect() {
        return new Promise((resolve, reject) => {
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

    close() {
        if (this.ws) this.ws.close();
    }
}

async function getDebuggerUrl(port) {
    for (let i = 0; i < 15; i++) {
        try {
            const data = await new Promise((res, rej) => {
                http.get(`http://localhost:${port}/json`, r => {
                    let d = ''; r.on('data', c => d += c); r.on('end', () => res(d));
                }).on('error', rej);
            });
            const tabs = JSON.parse(data);
            const page = tabs.find(t => t.type === 'page');
            if (page) return page.webSocketDebuggerUrl;
        } catch(e) {}
        await sleep(500);
    }
    throw new Error('Could not connect to Chrome debugging endpoint');
}

// ───────────────────────────────────────────────────────────────────────────────
// MAIN VERIFICATION SUITE
// ───────────────────────────────────────────────────────────────────────────────
async function runVerification() {
    console.log('═'.repeat(75));
    console.log(' SPACE DETECTIVE — MOBILE NEXT BUTTON VERIFICATION SUITE');
    console.log('═'.repeat(75));

    const server = await startStaticServer(PORT);
    const chromePath = findChrome();
    const debugPort = 9235;
    const profileDir = path.join(os.tmpdir(), 'chrome-mob-verify-' + Date.now());

    console.log('🚀 Launching Headless Chrome...');
    const chromeProc = spawn(chromePath, [
        `--remote-debugging-port=${debugPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        `--user-data-dir=${profileDir}`,
        '--window-size=1920,1080',
        `${BASE_URL}/index.html`
    ], { stdio: 'ignore', detached: false });

    await sleep(2500);
    const wsUrl = await getDebuggerUrl(debugPort);
    const cdp = new CDPSession(wsUrl);
    await cdp.connect();
    console.log('✅ Connected to Chrome CDP session\n');

    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });

    const allResults = [];

    for (const vp of VIEWPORTS) {
        console.log(`\n───────────────────────────────────────────────────────────────────────────`);
        console.log(`📱 TESTING VIEWPORT: ${vp.label} (${vp.width} × ${vp.height}) [mobile=${vp.mobile}]`);
        console.log(`───────────────────────────────────────────────────────────────────────────`);

        // Set device metrics
        await cdp.send('Emulation.setDeviceMetricsOverride', {
            width: vp.width,
            height: vp.height,
            deviceScaleFactor: vp.mobile ? 2 : 1,
            mobile: vp.mobile
        });

        // Navigate clean
        await cdp.send('Page.navigate', { url: `${BASE_URL}/index.html` });
        await sleep(2000);

        // Step 1: Navigate through Welcome -> Moon Planet -> Mission Intro -> Gameplay
        const navRes = await cdp.send('Runtime.evaluate', {
            expression: `(async () => {
                try {
                    // Click Start Adventure
                    const btnStart = document.getElementById('btn-start-adventure');
                    if (!btnStart) return { ok: false, step: 'btn-start-adventure missing' };
                    btnStart.click();
                    await new Promise(r => setTimeout(r, 600));

                    // Click Moon Planet (first planet)
                    const moonBtn = document.getElementById('card-planet-moon');
                    if (!moonBtn) return { ok: false, step: 'card-planet-moon missing' };
                    moonBtn.click();
                    await new Promise(r => setTimeout(r, 600));

                    // Click Launch Mission
                    const launchBtn = document.getElementById('btn-launch-mission');
                    if (!launchBtn) return { ok: false, step: 'btn-launch-mission missing' };
                    launchBtn.click();
                    await new Promise(r => setTimeout(r, 600));

                    // Click Start Gameplay (Confirm Mission)
                    const startGpBtn = document.getElementById('btn-confirm-mission') || document.querySelector('.btn-start-gameplay');
                    if (!startGpBtn) return { ok: false, step: 'btn-confirm-mission missing' };
                    startGpBtn.click();
                    await new Promise(r => setTimeout(r, 1500));

                    const gpScreen = document.getElementById('screen-gameplay');
                    const isVisible = gpScreen && window.getComputedStyle(gpScreen).display !== 'none';
                    return { ok: isVisible, step: 'gameplayReady' };
                } catch(e) {
                    return { ok: false, step: 'error: ' + e.message };
                }
            })()`,
            awaitPromise: true,
            returnByValue: true
        });

        if (!navRes?.result?.value?.ok) {
            console.log(`  ❌ Gameplay navigation failed: ${JSON.stringify(navRes?.result?.value)}`);
            allResults.push({ vp: vp.label, pass: false, error: 'Gameplay navigation failed' });
            continue;
        }

        // ───────────────────────────────────────────────────────────────────
        // TEST A: SUBMIT CORRECT ANSWER & MEASURE
        // ───────────────────────────────────────────────────────────────────
        const correctTestRes = await cdp.send('Runtime.evaluate', {
            expression: `(async () => {
                // Find correct answer from SpaceDetective / QuestionEngine
                const engine = window.SpaceDetective.getEngine();
                const currentQ = engine.questions[engine.currentIndex];
                const correctAnswer = currentQ.answer; // 'real' or 'ai'
                
                const btnToClick = correctAnswer === 'real'
                    ? document.getElementById('btn-answer-real')
                    : document.getElementById('btn-answer-ai');
                
                btnToClick.click();
                await new Promise(r => setTimeout(r, 700));

                const ov = document.getElementById('feedback-overlay');
                const btn = document.getElementById('btn-next-question');
                const card = document.querySelector('.feedback-card');

                const r = btn.getBoundingClientRect();
                const ovStyle = window.getComputedStyle(ov);
                const btnStyle = window.getComputedStyle(btn);
                const vh = window.innerHeight;
                const vw = window.innerWidth;

                // Check if button center is covered by another element
                const btnCenterX = r.left + r.width / 2;
                const btnCenterY = r.top + r.height / 2;
                const topElement = document.elementFromPoint(btnCenterX, btnCenterY);
                const isCovered = !(topElement === btn || btn.contains(topElement));

                return {
                    isCorrectFeedback: ov.querySelector('.feedback-title').classList.contains('correct'),
                    overlayDisplay: ovStyle.display,
                    overlayPosition: ovStyle.position,
                    btnDisplay: btnStyle.display,
                    btnVisibility: btnStyle.visibility,
                    top: Math.round(r.top),
                    bottom: Math.round(r.bottom),
                    left: Math.round(r.left),
                    right: Math.round(r.right),
                    width: Math.round(r.width),
                    height: Math.round(r.height),
                    vh, vw,
                    inViewport: r.top >= 0 && r.bottom <= vh && r.left >= 0 && r.right <= vw,
                    overflowBottom: Math.round(r.bottom - vh),
                    isCovered,
                    topElementName: topElement ? (topElement.id || topElement.className) : 'null'
                };
            })()`,
            awaitPromise: true,
            returnByValue: true
        });

        const cMeas = correctTestRes?.result?.value;
        const cPass = cMeas && cMeas.inViewport && !cMeas.isCovered && cMeas.height >= 44 && cMeas.overlayDisplay === 'flex';
        console.log(`  [CORRECT FEEDBACK]`);
        console.log(`    Status:     ${cPass ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`    Position:   top=${cMeas?.top}px, bottom=${cMeas?.bottom}px (vh=${cMeas?.vh}px, overflow=${cMeas?.overflowBottom}px)`);
        console.log(`    Size:       ${cMeas?.width}px × ${cMeas?.height}px (Touch Target >= 44px: ${cMeas?.height >= 44 ? 'YES' : 'NO'})`);
        console.log(`    Visibility: display=${cMeas?.btnDisplay}, visibility=${cMeas?.btnVisibility}, isCovered=${cMeas?.isCovered}`);

        // Capture Screenshot for 390x844 (Mobile Portrait Correct)
        if (vp.label === '390x844_StandardMobile') {
            const sc = await cdp.send('Page.captureScreenshot', { format: 'png' });
            if (sc?.data) {
                const scPath = path.join(SCREENSHOTS_DIR, 'mobile_feedback_correct_390x844.png');
                fs.writeFileSync(scPath, Buffer.from(sc.data, 'base64'));
                console.log(`    📸 Screenshot saved: ${scPath}`);
            }
        }
        if (vp.label === '844x390_MobileLandscape') {
            const sc = await cdp.send('Page.captureScreenshot', { format: 'png' });
            if (sc?.data) {
                const scPath = path.join(SCREENSHOTS_DIR, 'mobile_feedback_landscape_844x390.png');
                fs.writeFileSync(scPath, Buffer.from(sc.data, 'base64'));
                console.log(`    📸 Screenshot saved: ${scPath}`);
            }
        }

        // ───────────────────────────────────────────────────────────────────
        // TEST B: TAP NEXT QUESTION & VERIFY EXACTLY ONE NEXT QUESTION LOADS
        // ───────────────────────────────────────────────────────────────────
        const nextClickRes = await cdp.send('Runtime.evaluate', {
            expression: `(async () => {
                const engine = window.SpaceDetective.getEngine();
                const beforeIndex = engine.currentIndex;
                
                const btn = document.getElementById('btn-next-question');
                btn.click();
                await new Promise(r => setTimeout(r, 600));

                const afterIndex = engine.currentIndex;
                const ov = document.getElementById('feedback-overlay');
                const overlayHidden = window.getComputedStyle(ov).display === 'none';

                return {
                    beforeIndex,
                    afterIndex,
                    advancedByOne: (afterIndex === beforeIndex + 1),
                    overlayHidden
                };
            })()`,
            awaitPromise: true,
            returnByValue: true
        });

        const nextInfo = nextClickRes?.result?.value;
        const nextPass = nextInfo?.advancedByOne && nextInfo?.overlayHidden;
        console.log(`  [NEXT BUTTON CLICK & TRANSITION]`);
        console.log(`    Status:     ${nextPass ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`    Transition: Q${nextInfo?.beforeIndex + 1} -> Q${nextInfo?.afterIndex + 1} (Advanced by 1: ${nextInfo?.advancedByOne}, Overlay Hidden: ${nextInfo?.overlayHidden})`);

        // ───────────────────────────────────────────────────────────────────
        // TEST C: SUBMIT INCORRECT (SUPPORTIVE) ANSWER & MEASURE
        // ───────────────────────────────────────────────────────────────────
        const incorrectTestRes = await cdp.send('Runtime.evaluate', {
            expression: `(async () => {
                const engine = window.SpaceDetective.getEngine();
                const currentQ = engine.questions[engine.currentIndex];
                // Deliberately pick opposite answer to trigger incorrect/supportive feedback
                const wrongAnswer = currentQ.answer === 'real' ? 'ai' : 'real';
                
                const btnToClick = wrongAnswer === 'real'
                    ? document.getElementById('btn-answer-real')
                    : document.getElementById('btn-answer-ai');
                
                btnToClick.click();
                await new Promise(r => setTimeout(r, 700));

                const ov = document.getElementById('feedback-overlay');
                const btn = document.getElementById('btn-next-question');
                const r = btn.getBoundingClientRect();
                const ovStyle = window.getComputedStyle(ov);
                const btnStyle = window.getComputedStyle(btn);
                const vh = window.innerHeight;
                const vw = window.innerWidth;

                const btnCenterX = r.left + r.width / 2;
                const btnCenterY = r.top + r.height / 2;
                const topElement = document.elementFromPoint(btnCenterX, btnCenterY);
                const isCovered = !(topElement === btn || btn.contains(topElement));

                return {
                    isSupportiveFeedback: ov.querySelector('.feedback-title').classList.contains('supportive'),
                    feedbackTitleText: ov.querySelector('.feedback-title').textContent,
                    overlayDisplay: ovStyle.display,
                    btnDisplay: btnStyle.display,
                    btnVisibility: btnStyle.visibility,
                    top: Math.round(r.top),
                    bottom: Math.round(r.bottom),
                    left: Math.round(r.left),
                    right: Math.round(r.right),
                    width: Math.round(r.width),
                    height: Math.round(r.height),
                    vh, vw,
                    inViewport: r.top >= 0 && r.bottom <= vh && r.left >= 0 && r.right <= vw,
                    overflowBottom: Math.round(r.bottom - vh),
                    isCovered
                };
            })()`,
            awaitPromise: true,
            returnByValue: true
        });

        const incMeas = incorrectTestRes?.result?.value;
        const incPass = incMeas && incMeas.inViewport && !incMeas.isCovered && incMeas.height >= 44 && incMeas.overlayDisplay === 'flex';
        console.log(`  [INCORRECT / SUPPORTIVE FEEDBACK]`);
        console.log(`    Status:     ${incPass ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`    Position:   top=${incMeas?.top}px, bottom=${incMeas?.bottom}px (vh=${incMeas?.vh}px, overflow=${incMeas?.overflowBottom}px)`);
        console.log(`    Supportive: title="${incMeas?.feedbackTitleText}", class='supportive': ${incMeas?.isSupportiveFeedback}`);

        // Capture Screenshot for 390x844 (Mobile Portrait Incorrect)
        if (vp.label === '390x844_StandardMobile') {
            const sc = await cdp.send('Page.captureScreenshot', { format: 'png' });
            if (sc?.data) {
                const scPath = path.join(SCREENSHOTS_DIR, 'mobile_feedback_incorrect_390x844.png');
                fs.writeFileSync(scPath, Buffer.from(sc.data, 'base64'));
                console.log(`    📸 Screenshot saved: ${scPath}`);
            }
        }

        // ───────────────────────────────────────────────────────────────────
        // TEST D: COMPLETE ENTIRE MISSION (5/5) & VERIFY COMPLETION SCREEN
        // ───────────────────────────────────────────────────────────────────
        const completionTestRes = await cdp.send('Runtime.evaluate', {
            expression: `(async () => {
                const isOverlayOpen = () => {
                    const ov = document.getElementById('feedback-overlay');
                    return ov && window.getComputedStyle(ov).display === 'flex';
                };

                let safety = 0;
                while (window.SpaceDetective.getState().current !== 'mission-completion' && safety < 25) {
                    safety++;
                    const nextBtn = document.getElementById('btn-next-question');
                    if (isOverlayOpen()) {
                        if (nextBtn) nextBtn.click();
                        await new Promise(r => setTimeout(r, 600));
                    } else {
                        const ansBtn = document.getElementById('btn-answer-real');
                        if (ansBtn && !ansBtn.disabled) {
                            ansBtn.click();
                            await new Promise(r => setTimeout(r, 600));
                        } else {
                            await new Promise(r => setTimeout(r, 200));
                        }
                    }
                }

                const compScreen = document.getElementById('screen-mission-completion');
                const compVisible = compScreen && window.getComputedStyle(compScreen).display !== 'none';
                const replayBtn = document.getElementById('btn-replay-mission');
                const returnMapBtn = document.getElementById('btn-return-map');
                const fbOverlay = document.getElementById('feedback-overlay');

                return {
                    compVisible,
                    replayBtnVisible: replayBtn ? window.getComputedStyle(replayBtn).display !== 'none' : false,
                    returnMapBtnVisible: returnMapBtn ? window.getComputedStyle(returnMapBtn).display !== 'none' : false,
                    overlayHidden: fbOverlay ? window.getComputedStyle(fbOverlay).display === 'none' : true
                };
            })()`,
            awaitPromise: true,
            returnByValue: true
        });

        const compInfo = completionTestRes?.result?.value;
        const compPass = compInfo?.compVisible && compInfo?.replayBtnVisible && compInfo?.returnMapBtnVisible && compInfo?.overlayHidden;
        console.log(`  [MISSION COMPLETION SCREEN USABILITY]`);
        console.log(`    Status:     ${compPass ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`    Usable:     Completion Screen Visible=${compInfo?.compVisible}, Replay Btn=${compInfo?.replayBtnVisible}, Return Map=${compInfo?.returnMapBtnVisible}`);

        const vpPass = cPass && nextPass && incPass && compPass;
        allResults.push({
            vp: vp.label,
            width: vp.width,
            height: vp.height,
            mobile: vp.mobile,
            cMeas,
            incMeas,
            cPass,
            incPass,
            nextPass,
            compPass,
            pass: vpPass
        });
    }

    cdp.close();
    chromeProc.kill();
    server.close();
    try { execSync(`rmdir /s /q "${profileDir}"`, { stdio: 'ignore' }); } catch(e) {}

    // ───────────────────────────────────────────────────────────────────────
    // FINAL SUMMARY TABLE & VERDICT
    // ───────────────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(80));
    console.log(' COMPLETE VIEWPORT TEST MATRIX SUMMARY');
    console.log('═'.repeat(80));
    console.log(
        'Viewport'.padEnd(26) +
        'Correct Top/Btm'.padEnd(18) +
        'Incorr Top/Btm'.padEnd(18) +
        'Height'.padEnd(10) +
        'Result'
    );
    console.log('─'.repeat(80));

    let passCount = 0;
    let failCount = 0;

    for (const r of allResults) {
        if (r.pass) passCount++;
        else failCount++;

        const cRange = r.cMeas ? `${r.cMeas.top}→${r.cMeas.bottom}px` : 'N/A';
        const incRange = r.incMeas ? `${r.incMeas.top}→${r.incMeas.bottom}px` : 'N/A';
        const h = r.cMeas ? `${r.cMeas.height}px` : 'N/A';
        const res = r.pass ? '✅ PASS' : '❌ FAIL';

        console.log(
            r.vp.padEnd(26) +
            cRange.padEnd(18) +
            incRange.padEnd(18) +
            h.padEnd(10) +
            res
        );
    }

    console.log('═'.repeat(80));
    console.log(`TOTAL VIEWPORTS TESTED: ${allResults.length}`);
    console.log(`PASSED: ${passCount} | FAILED: ${failCount}`);
    console.log('═'.repeat(80));

    if (failCount === 0) {
        console.log('\n>>> MOBILE GAMEPLAY RESPONSIVENESS FIX: PASSED <<<\n');
    } else {
        console.log('\n>>> MOBILE GAMEPLAY RESPONSIVENESS FIX: FAILED <<<\n');
        process.exit(1);
    }
}

runVerification().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
});
