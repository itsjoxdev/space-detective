const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log('=== Starting Phase 06 Verification Suite ===');

    const tempProfile = path.join(process.cwd(), 'scratch', 'temp_chrome_profile');
    if (!fs.existsSync(tempProfile)) {
        fs.mkdirSync(tempProfile, { recursive: true });
    }

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9222',
        `--user-data-dir=${tempProfile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-background-networking',
        '--disable-gpu-sandbox',
        '--disable-renderer-backgrounding',
        '--autoplay-policy=no-user-gesture-required',
        'http://localhost:8888/index.html'
    ]);

    let exited = false;
    chrome.on('exit', (code) => {
        exited = true;
        console.log(`Chrome process exited with code ${code}`);
    });

    // Wait for CDP to be available
    let versionData = null;
    for (let i = 0; i < 30; i++) {
        try {
            const res = await fetch('http://127.0.0.1:9222/json/version');
            if (res.ok) {
                versionData = await res.json();
                break;
            }
        } catch (e) {
            await sleep(300);
        }
    }

    if (!versionData) {
        console.error('Failed to connect to Chrome on port 9222');
        chrome.kill();
        process.exit(1);
    }
    console.log('Connected to Chrome DevTools Protocol:', versionData.Browser);

    // Get list of targets
    const targetsRes = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === 'page');

    if (!pageTarget) {
        console.error('No page target found');
        chrome.kill();
        process.exit(1);
    }

    console.log('Page target found:', pageTarget.url);
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    const consoleLogs = [];
    const consoleErrors = [];

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
            const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
            consoleLogs.push(`[Browser ${msg.params.type}] ${text}`);
            if (msg.params.type === 'error') {
                consoleErrors.push(text);
            }
        } else if (msg.id && callbacks.has(msg.id)) {
            const cb = callbacks.get(msg.id);
            callbacks.delete(msg.id);
            if (msg.error) {
                cb.reject(new Error(msg.error.message));
            } else {
                cb.resolve(msg.result);
            }
        }
    };

    function sendCommand(method, params = {}) {
        return new Promise((resolve, reject) => {
            const msgId = id++;
            callbacks.set(msgId, { resolve, reject });
            ws.send(JSON.stringify({ id: msgId, method, params }));
        });
    }

    await new Promise(resolve => ws.onopen = resolve);
    console.log('WebSocket connected to page target');

    await sendCommand('Runtime.enable');
    await sendCommand('Page.enable');
    await sendCommand('Console.enable');

    async function evaluate(expression) {
        const res = await sendCommand('Runtime.evaluate', {
            expression,
            returnByValue: true,
            awaitPromise: true
        });
        if (res.exceptionDetails) {
            throw new Error(res.exceptionDetails.text + ' ' + (res.exceptionDetails.exception ? res.exceptionDetails.exception.description : ''));
        }
        return res.result ? res.result.value : undefined;
    }

    async function takeScreenshot(fileName) {
        const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(process.cwd(), 'scratch', fileName);
        fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
        console.log(`Saved screenshot: ${filePath}`);
    }

    await sleep(1500);

    console.log('\n--- Test 1: Page Load & Global SpaceDetective Object ---');
    const isLoaded = await evaluate(`typeof SpaceDetective !== 'undefined'`);
    console.log('SpaceDetective loaded:', isLoaded);

    const exposedKeys = await evaluate(`Object.keys(SpaceDetective)`);
    console.log('Exposed keys:', exposedKeys);

    console.log('\n--- Test 2: Audio Manager Module Verification ---');
    const audioState = await evaluate(`(() => {
        const a = SpaceDetective.getAudio();
        return {
            hasInit: typeof a.init === 'function',
            hasPlay: typeof a.play === 'function',
            hasSetMuted: typeof a.setMuted === 'function',
            hasSetVolume: typeof a.setVolume === 'function',
            hasSetSfx: typeof a.setSfxEnabled === 'function',
            hasSetSpeech: typeof a.setSpeechEnabled === 'function',
            isMuted: a.isMuted(),
            volume: a.getVolume(),
            isSfxEnabled: a.isSfxEnabled(),
            isSpeechEnabled: a.isSpeechEnabled()
        };
    })()`);
    console.log('AudioManager state:', JSON.stringify(audioState, null, 2));

    console.log('\n--- Test 3: Procedural Audio Synthesis (All 12 Sounds) ---');
    const soundTests = await evaluate(`(() => {
        const a = SpaceDetective.getAudio();
        const results = {};
        const sounds = [
            'click', 'startAdventure', 'selectPlanet', 'scanner',
            'correct', 'supportive', 'nextQuestion',
            'star1', 'star2', 'star3', 'unlockPlanet', 'victory'
        ];
        sounds.forEach(s => {
            try {
                a.play(s);
                results[s] = 'OK';
            } catch (err) {
                results[s] = 'ERROR: ' + err.message;
            }
        });
        return results;
    })()`);
    console.log('Procedural sound synth execution results:', JSON.stringify(soundTests, null, 2));

    console.log('\n--- Test 4: Speech Manager Module Verification ---');
    const speechState = await evaluate(`(() => {
        const s = SpaceDetective.getSpeech();
        return {
            isSupported: s.isSupported(),
            voiceStatus: s.voiceStatus,
            hasArabicVoice: !!s.arabicVoice,
            cleanedSample: s.cleanText('<span class="highlight">كوزمو:</span> أهلاً بك يا بطل!'),
            hasSpeak: typeof s.speak === 'function',
            hasStop: typeof s.stop === 'function'
        };
    })()`);
    console.log('SpeechManager state:', JSON.stringify(speechState, null, 2));

    console.log('\n--- Test 5: Audio Settings UI Modal Interaction ---');
    const modalCheck1 = await evaluate(`(() => {
        const btnToggle = document.getElementById('btn-audio-toggle');
        const modal = document.getElementById('audio-settings-modal');
        const initialDisplay = modal.style.display;
        btnToggle.click();
        const openDisplay = modal.style.display;
        return { initialDisplay, openDisplay };
    })()`);
    console.log('Modal open check:', modalCheck1);

    await takeScreenshot('phase06_01_audio_settings_open.png');

    console.log('\n--- Test 6: Mute Toggle & UI Sync ---');
    const muteCheck = await evaluate(`(() => {
        const btnMute = document.getElementById('btn-quick-mute');
        btnMute.click();
        const a = SpaceDetective.getAudio();
        const btnToggle = document.getElementById('btn-audio-toggle');
        const iconSpan = document.getElementById('header-audio-icon') || btnToggle.querySelector('.header-icon');
        return {
            isMuted: a.isMuted(),
            headerIcon: iconSpan ? iconSpan.textContent : null,
            quickMuteText: document.getElementById('btn-quick-mute-text').textContent,
            hasMutedClass: btnToggle.classList.contains('muted')
        };
    })()`);
    console.log('Mute check:', muteCheck);

    await takeScreenshot('phase06_02_muted_state.png');

    console.log('\n--- Test 7: Unmute & Volume / SFX / Speech Controls ---');
    const settingsControlsCheck = await evaluate(`(() => {
        const a = SpaceDetective.getAudio();
        // Unmute
        document.getElementById('btn-quick-mute').click();
        // Change volume to 85%
        const slider = document.getElementById('slider-volume');
        slider.value = 85;
        slider.dispatchEvent(new Event('input'));

        // Toggle SFX off and on
        const toggleSfx = document.getElementById('toggle-sfx');
        toggleSfx.checked = false;
        toggleSfx.dispatchEvent(new Event('change'));
        const sfxOff = a.isSfxEnabled();

        toggleSfx.checked = true;
        toggleSfx.dispatchEvent(new Event('change'));
        const sfxOn = a.isSfxEnabled();

        // Close modal
        document.getElementById('btn-close-audio').click();
        const closedDisplay = document.getElementById('audio-settings-modal').style.display;

        // Check LocalStorage persistence
        const stored = JSON.parse(localStorage.getItem('spaceDetectiveAudioSettings'));

        return {
            unmuted: !a.isMuted(),
            newVolume: a.getVolume(),
            volumeLabel: document.getElementById('volume-label-percent').textContent,
            sfxOff,
            sfxOn,
            closedDisplay,
            storedVolume: stored.volume,
            storedMuted: stored.muted,
            storedSfx: stored.sfxEnabled
        };
    })()`);
    console.log('Controls and persistence check:', settingsControlsCheck);

    console.log('\n--- Test 8: Progress Reset Does NOT Overwrite Audio Settings ---');
    const resetSeparationCheck = await evaluate(`(() => {
        // Set custom audio settings
        SpaceDetective.getAudio().setVolume(0.85);

        // Call resetProgress
        SpaceDetective.resetProgress();

        // Check both storages
        const progressRaw = localStorage.getItem('spaceDetectiveProgress');
        const audioRaw = localStorage.getItem('spaceDetectiveAudioSettings');

        return {
            progressReset: progressRaw === null || JSON.parse(progressRaw).totalStars === 0,
            audioSettingsIntact: audioRaw !== null && JSON.parse(audioRaw).volume === 0.85
        };
    })()`);
    console.log('Storage separation check:', resetSeparationCheck);

    console.log('\n--- Test 9: Dialog Speech Replay Buttons on Screens ---');
    const replayButtonsCheck = await evaluate(`(() => {
        const bWelcome = document.getElementById('btn-speak-welcome');
        const bIntro = document.getElementById('btn-speak-intro');
        const bGameplay = document.getElementById('btn-speak-gameplay');
        const bCompletion = document.getElementById('btn-speak-completion');
        return {
            hasWelcomeSpeak: !!bWelcome,
            hasIntroSpeak: !!bIntro,
            hasGameplaySpeak: !!bGameplay,
            hasCompletionSpeak: !!bCompletion
        };
    })()`);
    console.log('Replay buttons check:', replayButtonsCheck);

    console.log('\n--- Test 10: Gameplay Audio & Flash Glow Verification ---');
    const gameplayCheck = await evaluate(`(() => {
        // Navigate to moon planet and start mission
        SpaceDetective.selectPlanet('moon');
        SpaceDetective.startPlanetMission('moon');

        const engine = SpaceDetective.getEngine();
        const currentQ = engine.questions[engine.currentIndex];

        // Submit the correct answer
        engine.submitAnswer(currentQ.answer);

        const scannerEl = document.querySelector('.scanner-container');
        const hasGlow = scannerEl ? (scannerEl.classList.contains('flash-real') || scannerEl.classList.contains('flash-ai')) : false;

        return {
            screen: SpaceDetective.getState().current,
            questionIndex: engine.currentIndex,
            isAnswerSubmitted: engine.isAnswerSubmitted,
            hasGlow: hasGlow,
            dialogText: document.getElementById('gameplay-cosmo-dialog').textContent
        };
    })()`);
    console.log('Gameplay answer submission check:', gameplayCheck);

    await takeScreenshot('phase06_03_gameplay_speech_btn.png');

    console.log('\n--- Test 11: Multi-Viewport Responsiveness & Overflow Verification ---');
    const viewports = [
        { width: 1366, height: 768, name: 'Desktop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 412, height: 915, name: 'Mobile' }
    ];

    for (const vp of viewports) {
        await sendCommand('Emulation.setDeviceMetricsOverride', {
            width: vp.width,
            height: vp.height,
            deviceScaleFactor: 1,
            mobile: vp.name === 'Mobile'
        });
        await sleep(400);

        const overflowCheck = await evaluate(`(() => {
            return {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth,
                hasHorizontalScrollbar: document.documentElement.scrollWidth > document.documentElement.clientWidth
            };
        })()`);
        console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}):`, overflowCheck);
    }

    console.log('\n--- Console Errors Check ---');
    console.log(`Total console errors recorded: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
        consoleErrors.forEach(err => console.error('Browser error:', err));
    } else {
        console.log('PASS: 0 console errors detected throughout all user flows!');
    }

    // Cleanup
    ws.close();
    chrome.kill();
    console.log('\n=== Phase 06 Verification Complete ===');
}

run().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
