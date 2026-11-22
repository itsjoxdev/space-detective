/**
 * Diagnostic tool to inspect toolbar dimensions, positions, and wrap behavior
 */
const { execSync, spawn } = require('child_process');
const http = require('http');
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

const VIEWPORTS = [
    { label: '320x568', width: 320, height: 568 },
    { label: '360x800', width: 360, height: 800 },
    { label: '375x667', width: 375, height: 667 },
    { label: '390x844', width: 390, height: 844 },
    { label: '412x915', width: 412, height: 915 },
    { label: '430x932', width: 430, height: 932 },
    { label: '844x390', width: 844, height: 390 },
];

(async () => {
    const server = await startStaticServer(PORT);
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const debugPort = 9240;
    const profileDir = path.join(os.tmpdir(), 'chrome-diag-hud-' + Date.now());

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

    console.log('═'.repeat(75));
    console.log('CURRENT TOOLBAR DIAGNOSTIC REPORT (BEFORE FIX)');
    console.log('═'.repeat(75));

    for (const vp of VIEWPORTS) {
        await send('Emulation.setDeviceMetricsOverride', {
            width: vp.width,
            height: vp.height,
            deviceScaleFactor: 2,
            mobile: true
        });

        await send('Page.navigate', { url: `${BASE_URL}/index.html` });
        await new Promise(r => setTimeout(r, 1200));

        // Navigate to planet selection so btn-back-global is visible!
        await send('Runtime.evaluate', {
            expression: `document.getElementById('btn-start-adventure').click();`,
        });
        await new Promise(r => setTimeout(r, 500));

        const res = await send('Runtime.evaluate', {
            expression: `(() => {
                const header = document.querySelector('.header-bar');
                const brand = document.querySelector('.brand-badge');
                const controls = document.querySelector('.header-controls');
                const stars = document.getElementById('header-stars-badge');
                const audio = document.getElementById('btn-audio-toggle');
                const reset = document.getElementById('btn-reset-progress');
                const back = document.getElementById('btn-back-global');

                const r = el => {
                    if (!el) return null;
                    const b = el.getBoundingClientRect();
                    return {
                        top: Math.round(b.top),
                        bottom: Math.round(b.bottom),
                        left: Math.round(b.left),
                        right: Math.round(b.right),
                        w: Math.round(b.width),
                        h: Math.round(b.height),
                        display: window.getComputedStyle(el).display,
                        visible: window.getComputedStyle(el).visibility
                    };
                };

                const hR = r(header);
                const sR = r(stars);
                const bR = r(brand);
                const cR = r(controls);

                return {
                    viewportWidth: window.innerWidth,
                    docScrollWidth: document.documentElement.scrollWidth,
                    hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
                    header: hR,
                    brand: bR,
                    controls: cR,
                    stars: sR,
                    audio: r(audio),
                    reset: r(reset),
                    back: r(back),
                    starsDroppedBelowBrand: sR && bR ? (sR.top >= bR.bottom - 5) : false
                };
            })()`,
            returnByValue: true
        });

        const v = res?.result?.value;
        console.log(`\nViewport: ${vp.label} (W=${vp.width})`);
        console.log(`  Horizontal Scroll: ${v?.hasHorizontalScroll} (docWidth=${v?.docScrollWidth} vs vp=${v?.viewportWidth})`);
        console.log(`  Header Box:        w=${v?.header?.w}px, h=${v?.header?.h}px, top=${v?.header?.top}`);
        console.log(`  Brand Box:         w=${v?.brand?.w}px, top=${v?.brand?.top}→${v?.brand?.bottom}`);
        console.log(`  Controls Box:      w=${v?.controls?.w}px, top=${v?.controls?.top}→${v?.controls?.bottom}`);
        console.log(`  Stars Badge:       w=${v?.stars?.w}px, top=${v?.stars?.top}→${v?.stars?.bottom}`);
        console.log(`  Back Button:       w=${v?.back?.w}px, top=${v?.back?.top}→${v?.back?.bottom}, display=${v?.back?.display}`);
        console.log(`  Reset Button:      w=${v?.reset?.w}px, top=${v?.reset?.top}→${v?.reset?.bottom}`);
        console.log(`  Audio Button:      w=${v?.audio?.w}px, top=${v?.audio?.top}→${v?.audio?.bottom}`);
        console.log(`  Stars Dropped Down: ${v?.starsDroppedBelowBrand ? '⚠️ YES (DROPPED BELOW BRAND ROW)' : 'No (Same Row)'}`);
    }

    ws.close();
    chromeProc.kill();
    server.close();
    try { execSync(`rmdir /s /q "${profileDir}"`, { stdio: 'ignore' }); } catch (e) { }
})().catch(e => { console.error(e); process.exit(1); });

