const { execSync, spawn } = require('child_process');
const http = require('http');
const path = require('path');
const os = require('os');
const WebSocket = require('./node_modules/ws');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getWS(port) {
    for (let i = 0; i < 15; i++) {
        try {
            const data = await new Promise((res, rej) => {
                http.get('http://localhost:' + port + '/json', r => {
                    let d = ''; r.on('data', c => d += c); r.on('end', () => res(d));
                }).on('error', rej);
            });
            const tabs = JSON.parse(data);
            const page = tabs.find(t => t.type === 'page');
            if (page) return page.webSocketDebuggerUrl;
        } catch(e) {}
        await sleep(500);
    }
    throw new Error('no ws');
}

(async () => {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const profileDir = path.join(os.tmpdir(), 'ctest-diag-' + Date.now());
    const proc = spawn(chromePath, [
        '--remote-debugging-port=9232',
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--user-data-dir=' + profileDir,
        'http://localhost:8888/index.html'
    ], {stdio: 'ignore', detached: false});
    
    await sleep(2500);
    const wsUrl = await getWS(9232);
    const ws = new WebSocket(wsUrl);
    let mid = 1;
    const callbacks = new Map();
    ws.on('message', d => {
        const m = JSON.parse(d.toString());
        if (m.id && callbacks.has(m.id)) {
            const {res} = callbacks.get(m.id);
            callbacks.delete(m.id);
            res(m.result);
        }
    });
    await new Promise(r => ws.on('open', r));
    
    function send(method, params) {
        return new Promise(res => {
            const id = mid++;
            callbacks.set(id, {res});
            ws.send(JSON.stringify({id, method, params: params || {}}));
        });
    }
    
    // Listen to console
    await send('Runtime.enable');
    ws.on('message', d => {
        const m = JSON.parse(d.toString());
        if (m.method === 'Runtime.consoleAPICalled') {
            console.log('BROWSER LOG:', m.params.type, m.params.args.map(a => a.value || a.description).join(' '));
        }
        if (m.method === 'Runtime.exceptionThrown') {
            console.log('BROWSER EXCEPTION:', JSON.stringify(m.params.exceptionDetails));
        }
    });

    // Set 320x568 mobile
    await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 568, deviceScaleFactor: 2, mobile: true });
    await send('Page.navigate', { url: 'http://localhost:8888/index.html' });
    await sleep(2500);

    const diag = await send('Runtime.evaluate', {
        expression: `(async () => {
            const log = [];
            const q = (sel) => document.querySelector(sel);
            
            // Step 1: Start
            const btnStart = q('#screen-welcome .btn-cta-large');
            log.push({ step: 'startBtn', found: !!btnStart });
            if (btnStart) btnStart.click();
            await new Promise(r => setTimeout(r, 600));

            // Step 2: Planet
            const planet = q('.planet-select-btn');
            log.push({ step: 'planetBtn', found: !!planet });
            if (planet) planet.click();
            await new Promise(r => setTimeout(r, 600));

            // Step 3: Launch
            const launch = q('.btn-launch-mission');
            log.push({ step: 'launchBtn', found: !!launch });
            if (launch) launch.click();
            await new Promise(r => setTimeout(r, 600));

            // Step 4: Start Gameplay
            const startGp = q('.btn-start-gameplay');
            log.push({ step: 'startGpBtn', found: !!startGp });
            if (startGp) startGp.click();
            await new Promise(r => setTimeout(r, 1200));

            // Step 5: Answer real
            const ansReal = q('#btn-answer-real');
            log.push({ step: 'ansRealBtn', found: !!ansReal, disabled: ansReal ? ansReal.disabled : null });
            if (ansReal) ansReal.click();
            await new Promise(r => setTimeout(r, 800));

            // Step 6: Feedback overlay
            const ov = q('#feedback-overlay');
            const card = q('.feedback-card');
            const nextBtn = q('#btn-next-question');
            
            const ovStyle = ov ? window.getComputedStyle(ov) : null;
            const cardStyle = card ? window.getComputedStyle(card) : null;
            const btnStyle = nextBtn ? window.getComputedStyle(nextBtn) : null;
            const btnRect = nextBtn ? nextBtn.getBoundingClientRect() : null;
            const cardRect = card ? card.getBoundingClientRect() : null;
            const ovRect = ov ? ov.getBoundingClientRect() : null;

            log.push({
                step: 'feedbackCheck',
                overlayFound: !!ov,
                overlayDisplay: ovStyle ? ovStyle.display : null,
                overlayVisibility: ovStyle ? ovStyle.visibility : null,
                overlayRect: ovRect ? { top: Math.round(ovRect.top), bottom: Math.round(ovRect.bottom), height: Math.round(ovRect.height) } : null,
                cardRect: cardRect ? { top: Math.round(cardRect.top), bottom: Math.round(cardRect.bottom), height: Math.round(cardRect.height) } : null,
                nextBtnFound: !!nextBtn,
                nextBtnDisplay: btnStyle ? btnStyle.display : null,
                nextBtnVisibility: btnStyle ? btnStyle.visibility : null,
                nextBtnRect: btnRect ? {
                    top: Math.round(btnRect.top),
                    bottom: Math.round(btnRect.bottom),
                    left: Math.round(btnRect.left),
                    right: Math.round(btnRect.right),
                    width: Math.round(btnRect.width),
                    height: Math.round(btnRect.height)
                } : null,
                windowInner: { w: window.innerWidth, h: window.innerHeight }
            });

            return log;
        })()`,
        awaitPromise: true,
        returnByValue: true
    });

    console.log('Diagnostic result:\n', JSON.stringify(diag && diag.result && diag.result.value, null, 2));

    ws.close();
    proc.kill();
    try { execSync('rmdir /s /q "' + profileDir + '"', {stdio: 'ignore'}); } catch(e) {}
})().catch(e => { console.error(e); process.exit(1); });
