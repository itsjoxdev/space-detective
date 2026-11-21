const { spawn } = require('child_process');
const path = require('path');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const VIEWPORTS = [
    { name: 'Small mobile', width: 320, height: 568 },
    { name: 'iPhone SE class', width: 375, height: 667 },
    { name: 'Standard mobile', width: 390, height: 844 },
    { name: 'Mobile', width: 412, height: 915 },
    { name: 'Large mobile', width: 430, height: 932 },
    { name: 'Small tablet', width: 768, height: 1024 },
    { name: 'iPad landscape', width: 1024, height: 768 },
    { name: 'Desktop', width: 1366, height: 768 },
    { name: 'Large desktop', width: 1920, height: 1080 }
];

async function run() {
    const tempProfile = path.join(process.cwd(), 'scratch', 'temp_resp_profile');
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9225',
        `--user-data-dir=${tempProfile}`,
        'http://localhost:8888/index.html'
    ]);

    let versionData = null;
    for (let i = 0; i < 20; i++) {
        try {
            const res = await fetch('http://127.0.0.1:9225/json/version');
            if (res.ok) { versionData = await res.json(); break; }
        } catch (e) { await sleep(300); }
    }
    if (!versionData) { console.error('Failed to connect'); chrome.kill(); process.exit(1); }

    const targetsRes = await fetch('http://127.0.0.1:9225/json/list');
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === 'page');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && callbacks.has(msg.id)) {
            const cb = callbacks.get(msg.id);
            callbacks.delete(msg.id);
            if (msg.error) cb.reject(new Error(msg.error.message));
            else cb.resolve(msg.result);
        }
    };

    function sendCommand(method, params = {}) {
        return new Promise((resolve, reject) => {
            const msgId = id++;
            callbacks.set(msgId, { resolve, reject });
            ws.send(JSON.stringify({ id: msgId, method, params }));
        });
    }

    await new Promise(r => ws.onopen = r);
    await sendCommand('Runtime.enable');
    await sendCommand('Page.enable');

    async function evaluate(expression) {
        const res = await sendCommand('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
        if (res.exceptionDetails) throw new Error(res.exceptionDetails.text);
        return res.result ? res.result.value : undefined;
    }

    await sleep(1000);

    console.log('Testing Viewports across screens:');
    for (const vp of VIEWPORTS) {
        await sendCommand('Emulation.setDeviceMetricsOverride', {
            width: vp.width,
            height: vp.height,
            deviceScaleFactor: 1,
            mobile: vp.width <= 768
        });
        await sleep(300);

        // Test Welcome screen
        await evaluate(`SpaceDetective.showWelcomeScreen()`);
        const welcomeOverflow = await evaluate(`({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })`);

        // Test Planet Selection
        await evaluate(`SpaceDetective.showPlanetSelection()`);
        const selectOverflow = await evaluate(`({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })`);

        // Test Mission Intro
        await evaluate(`SpaceDetective.showMissionIntro()`);
        const introOverflow = await evaluate(`({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })`);

        // Test Gameplay
        await evaluate(`SpaceDetective.startPlanetMission('moon')`);
        const gameplayOverflow = await evaluate(`({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })`);

        console.log(`${vp.name} (${vp.width}x${vp.height}): Welcome: ${welcomeOverflow.scrollWidth}/${welcomeOverflow.clientWidth} | Select: ${selectOverflow.scrollWidth}/${selectOverflow.clientWidth} | Intro: ${introOverflow.scrollWidth}/${introOverflow.clientWidth} | Game: ${gameplayOverflow.scrollWidth}/${gameplayOverflow.clientWidth}`);
    }

    ws.close();
    chrome.kill();
}

run().catch(console.error);
