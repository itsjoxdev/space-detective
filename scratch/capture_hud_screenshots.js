const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const WebSocket = require('./node_modules/ws');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8889;
const BASE_URL = `http://localhost:${PORT}`;

function startStaticServer(port) {
    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };
    const server = http.createServer((req, res) => {
        let reqPath = decodeURI(req.url.split('?')[0]);
        if (reqPath === '/') reqPath = '/index.html';
        const filePath = path.join(ROOT_DIR, reqPath);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
            fs.createReadStream(filePath).pipe(res);
        } else {
            res.writeHead(404);
            res.end();
        }
    });
    return new Promise(resolve => server.listen(port, () => resolve(server)));
}

(async () => {
    const server = await startStaticServer(PORT);
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const debugPort = 9245;
    const profileDir = path.join(os.tmpdir(), 'chrome-hud-ss-' + Date.now());

    const chromeProc = spawn(chromePath, [
        `--remote-debugging-port=${debugPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        `--user-data-dir=${profileDir}`,
        `${BASE_URL}/index.html`
    ], { stdio: 'ignore' });

    await new Promise(r => setTimeout(r, 2000));
    const tabsData = await new Promise(res => {
        http.get(`http://localhost:${debugPort}/json`, r => {
            let d = ''; r.on('data', c => d += c); r.on('end', () => res(d));
        });
    });
    const wsUrl = JSON.parse(tabsData)[0].webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);
    await new Promise(r => ws.on('open', r));

    let mid = 1;
    const callbacks = new Map();
    ws.on('message', d => {
        const m = JSON.parse(d.toString());
        if (m.id && callbacks.has(m.id)) {
            const { res } = callbacks.get(m.id);
            callbacks.delete(m.id);
            res(m.result);
        }
    });
    function send(method, params = {}) {
        return new Promise(res => {
            const id = mid++;
            callbacks.set(id, { res });
            ws.send(JSON.stringify({ id, method, params }));
        });
    }

    const testVps = [
        { label: '320x568', width: 320, height: 568 },
        { label: '375x667', width: 375, height: 667 },
        { label: '390x844', width: 390, height: 844 }
    ];

    for (const vp of testVps) {
        await send('Emulation.setDeviceMetricsOverride', {
            width: vp.width,
            height: vp.height,
            deviceScaleFactor: 2,
            mobile: true
        });
        await send('Page.navigate', { url: `${BASE_URL}/index.html` });
        await new Promise(r => setTimeout(r, 1200));

        // Click start adventure so back button is visible
        await send('Runtime.evaluate', {
            expression: `document.getElementById('btn-start-adventure').click();`,
        });
        await new Promise(r => setTimeout(r, 800));

        const clip = await send('Runtime.evaluate', {
            expression: `(() => {
                const header = document.querySelector('.header-bar');
                const rect = header.getBoundingClientRect();
                return { x: 0, y: 0, width: window.innerWidth, height: Math.max(120, Math.round(rect.bottom + 20)), scale: 1 };
            })()`,
            returnByValue: true
        });

        const ss = await send('Page.captureScreenshot', {
            format: 'png',
            clip: clip.result.value
        });

        const outPath = path.join(__dirname, `hud_top_polish_${vp.label}.png`);
        fs.writeFileSync(outPath, Buffer.from(ss.data, 'base64'));
        console.log(`Captured: hud_top_polish_${vp.label}.png`);
    }

    ws.close();
    chromeProc.kill();
    server.close();
    try { execSync(`rmdir /s /q "${profileDir}"`, { stdio: 'ignore' }); } catch(e) {}
    console.log('Done capturing HUD screenshots.');
})().catch(e => { console.error(e); process.exit(1); });
