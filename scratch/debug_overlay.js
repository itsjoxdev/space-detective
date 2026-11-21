const { execSync, spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
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
    const profileDir = path.join(os.tmpdir(), 'ctest-' + Date.now());
    const proc = spawn(chromePath, [
        '--remote-debugging-port=9230',
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--user-data-dir=' + profileDir,
        'http://localhost:8888/index.html'
    ], {stdio: 'ignore', detached: false});
    
    await sleep(2500);
    const wsUrl = await getWS(9230);
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
    
    // Set 320x568 mobile
    await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 568, deviceScaleFactor: 2, mobile: true });
    await send('Page.navigate', { url: 'http://localhost:8888/index.html' });
    await sleep(3000);
    
    // Navigate to gameplay
    const navScript = `(async function() {
        const b = document.querySelector('#screen-welcome .btn-cta-large');
        if (b) b.click();
        await new Promise(function(r) { setTimeout(r, 600); });
        const p = document.querySelector('.planet-select-btn');
        if (p) p.click();
        await new Promise(function(r) { setTimeout(r, 600); });
        const l = document.querySelector('.btn-launch-mission');
        if (l) l.click();
        await new Promise(function(r) { setTimeout(r, 600); });
        const s = document.querySelector('.btn-start-gameplay');
        if (s) s.click();
        await new Promise(function(r) { setTimeout(r, 1500); });
        const btn = document.getElementById('btn-answer-real');
        if (btn) btn.click();
        await new Promise(function(r) { setTimeout(r, 800); });
        return 'done';
    })()`;
    
    const r1 = await send('Runtime.evaluate', { expression: navScript, awaitPromise: true, returnByValue: true });
    console.log('Nav result:', r1 && r1.result && r1.result.value);
    
    // Measure overlay and button
    const measureScript = `(function() {
        var ov = document.getElementById('feedback-overlay');
        var btn = document.getElementById('btn-next-question');
        var ovR = ov ? ov.getBoundingClientRect() : {};
        var btnR = btn ? btn.getBoundingClientRect() : {};
        var ovSt = ov ? window.getComputedStyle(ov) : {};
        return {
            overlayH: Math.round(ovR.height || 0),
            overlayTop: Math.round(ovR.top || 0),
            overlayBottom: Math.round(ovR.bottom || 0),
            btnBottom: Math.round(btnR.bottom || 0),
            btnTop: Math.round(btnR.top || 0),
            btnH: Math.round(btnR.height || 0),
            overlayDisplay: ovSt.display,
            overlayPosition: ovSt.position,
            overlayOverflow: ovSt.overflow,
            overlayBoxSizing: ovSt.boxSizing,
            overlayHeight: ovSt.height,
            innerH: window.innerHeight,
            screenH: window.screen.height
        };
    })()`;
    
    const r2 = await send('Runtime.evaluate', { expression: measureScript, returnByValue: true });
    const v = r2 && r2.result && r2.result.value;
    console.log('Measurements at 320x568:');
    console.log(JSON.stringify(v, null, 2));
    
    ws.close();
    proc.kill();
    
    try { execSync('rmdir /s /q "' + profileDir + '"', {stdio: 'ignore'}); } catch(e) {}
})().catch(function(e) { console.error(e); process.exit(1); });
