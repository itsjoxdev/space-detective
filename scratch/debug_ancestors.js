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
    const profileDir = path.join(os.tmpdir(), 'ctest-' + Date.now());
    const proc = spawn(chromePath, [
        '--remote-debugging-port=9231',
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--user-data-dir=' + profileDir,
        'http://localhost:8888/index.html'
    ], {stdio: 'ignore', detached: false});
    
    await sleep(2500);
    const wsUrl = await getWS(9231);
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
    
    // Navigate to gameplay and show feedback
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
    
    await send('Runtime.evaluate', { expression: navScript, awaitPromise: true, returnByValue: true });
    
    // Check stacking context creators on ancestors
    const ancestorScript = `(function() {
        var ov = document.getElementById('feedback-overlay');
        if (!ov) return { error: 'no overlay' };
        var el = ov.parentElement;
        var results = [];
        while (el && el !== document.documentElement) {
            var st = window.getComputedStyle(el);
            var hasTransform = st.transform !== 'none';
            var hasFilter = st.filter !== 'none';
            var hasPerspective = st.perspective !== 'none';
            var hasWillChange = st.willChange !== 'auto';
            var hasContain = st.contain !== 'none';
            var overflow = st.overflow;
            var overflowX = st.overflowX;
            var overflowY = st.overflowY;
            var r = el.getBoundingClientRect();
            if (hasTransform || hasFilter || hasPerspective || hasWillChange || hasContain) {
                results.push({
                    id: el.id,
                    class: el.className.substring(0, 50),
                    transform: hasTransform ? st.transform : null,
                    filter: hasFilter ? st.filter : null,
                    willChange: hasWillChange ? st.willChange : null,
                    contain: hasContain ? st.contain : null,
                    top: Math.round(r.top),
                    overflow: overflow
                });
            }
            el = el.parentElement;
        }
        return results;
    })()`;
    
    const r2 = await send('Runtime.evaluate', { expression: ancestorScript, returnByValue: true });
    console.log('Ancestors with stacking context creators:');
    console.log(JSON.stringify(r2 && r2.result && r2.result.value, null, 2));
    
    // Also check header height
    const headerScript = `(function() {
        var header = document.querySelector('.header-bar');
        if (!header) return { error: 'no header' };
        var r = header.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) };
    })()`;
    
    const r3 = await send('Runtime.evaluate', { expression: headerScript, returnByValue: true });
    console.log('Header:', JSON.stringify(r3 && r3.result && r3.result.value));
    
    // Check scroll positions
    const scrollScript = `(function() {
        return {
            uiLayerScrollTop: document.getElementById('ui-layer') ? document.getElementById('ui-layer').scrollTop : -1,
            bodyScrollTop: document.body.scrollTop,
            windowScrollY: window.scrollY,
            screensContainerTop: document.querySelector('.screens-container') ? Math.round(document.querySelector('.screens-container').getBoundingClientRect().top) : -1
        };
    })()`;
    
    const r4 = await send('Runtime.evaluate', { expression: scrollScript, returnByValue: true });
    console.log('Scroll:', JSON.stringify(r4 && r4.result && r4.result.value));
    
    ws.close();
    proc.kill();
    
    try { execSync('rmdir /s /q "' + profileDir + '"', {stdio: 'ignore'}); } catch(e) {}
})().catch(function(e) { console.error(e); process.exit(1); });
