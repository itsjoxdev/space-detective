const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--user-data-dir=scratch/temp_debug',
    'http://localhost:8888/index.html'
]);

async function check() {
    let targets = null;
    for (let i = 0; i < 20; i++) {
        try {
            const res = await fetch('http://127.0.0.1:9223/json/list');
            if (res.ok) {
                targets = await res.json();
                break;
            }
        } catch (e) {
            await new Promise(r => setTimeout(r, 300));
        }
    }
    if (!targets) throw new Error('Could not connect to port 9223');
    const page = targets.find(t => t.type === 'page') || targets[0];
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    
    let id = 1;
    function send(method, params = {}) {
        return new Promise(resolve => {
            const mid = id++;
            const handler = (e) => {
                const msg = JSON.parse(e.data);
                if (msg.id === mid) {
                    ws.removeEventListener('message', handler);
                    resolve(msg.result);
                }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id: mid, method, params }));
        });
    }

    await send('Emulation.setDeviceMetricsOverride', { width: 412, height: 915, deviceScaleFactor: 1, mobile: true });
    await new Promise(r => setTimeout(r, 500));

    const evalRes = await send('Runtime.evaluate', {
        expression: `(() => {
            SpaceDetective.selectPlanet('moon');
            SpaceDetective.startPlanetMission('moon');
            const wide = [];
            document.querySelectorAll('*').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.right > 413 || rect.left < -1) {
                    wide.push({
                        tag: el.tagName,
                        id: el.id,
                        className: typeof el.className === 'string' ? el.className : '',
                        left: Math.round(rect.left),
                        right: Math.round(rect.right),
                        width: Math.round(rect.width)
                    });
                }
            });
            return wide;
        })()`,
        returnByValue: true
    });

    console.log(JSON.stringify(evalRes.result.value, null, 2));
    ws.close();
    chrome.kill();
}
check().catch(err => {
    console.error(err);
    chrome.kill();
});
