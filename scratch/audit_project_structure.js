const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('=== PROJECT STRUCTURE AUDIT ===');

// 1. Files in root
const rootFiles = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
console.log('\nRoot entries:');
for (const entry of rootFiles) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    console.log(` - [${entry.isDirectory() ? 'DIR' : 'FILE'}] ${entry.name}`);
}

// 2. Check docs/
const docsDir = path.join(ROOT_DIR, 'docs');
if (fs.existsSync(docsDir)) {
    console.log('\nDocs entries:');
    const docFiles = fs.readdirSync(docsDir);
    for (const f of docFiles) {
        console.log(` - ${f}`);
    }
}

// 3. Inspect index.html
const indexPath = path.join(ROOT_DIR, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf-8');

console.log('\nindex.html stats:');
console.log(` - Size: ${indexContent.length} bytes`);
console.log(` - Line count: ${indexContent.split('\n').length}`);

// 4. Check for debug UI
console.log('\nDebug UI Check in index.html:');
const perfMonitorMatch = indexContent.match(/class=["'][^"']*perf-monitor[^"']*["']/g);
console.log(` - .perf-monitor occurrences:`, perfMonitorMatch ? perfMonitorMatch.length : 0);

// Check if perf-monitor has display: none or is shown
const perfMonitorDisplay = indexContent.match(/\.perf-monitor\s*\{[^}]*display:\s*([^;]+);/);
console.log(` - .perf-monitor CSS display:`, perfMonitorDisplay ? perfMonitorDisplay[1].trim() : 'not explicitly set');

// Check if any element with id or class containing 'debug' or 'test' is displayed
const debugMatches = indexContent.match(/id=["'][^"']*debug[^"']*["']/gi) || [];
console.log(` - Debug IDs:`, debugMatches);

// 5. Check for secrets / private tokens
console.log('\nSecrets & Sensitive Data Scan:');
const secretPatterns = [
    /api[_-]?key/i,
    /secret/i,
    /token/i,
    /password/i,
    /bearer/i,
    /auth/i
];

let suspicious = [];
indexContent.split('\n').forEach((line, idx) => {
    // ignore normal words like 'authenticity', 'author', 'authorized'
    for (const p of secretPatterns) {
        if (p.test(line) && !/license|author|authority|authentic/i.test(line)) {
            // Check if it looks like a hardcoded key / token
            if (/['"][A-Za-z0-9_-]{20,}['"]/.test(line)) {
                suspicious.push({ line: idx + 1, text: line.trim() });
            }
        }
    }
});
console.log(` - Suspicious token patterns: ${suspicious.length}`);
suspicious.forEach(s => console.log(`   Line ${s.line}: ${s.text}`));

// 6. Check Duplicate IDs in index.html
console.log('\nDuplicate IDs Check:');
const idRegex = /id=["']([^"']+)["']/g;
let m;
const idCounts = {};
while ((m = idRegex.exec(indexContent)) !== null) {
    idCounts[m[1]] = (idCounts[m[1]] || 0) + 1;
}
const duplicateIds = Object.entries(idCounts).filter(([k, v]) => v > 1);
if (duplicateIds.length === 0) {
    console.log(' ✓ 0 duplicate IDs found across index.html!');
} else {
    console.log(' ⚠️ Found duplicate IDs:', duplicateIds);
}

// 7. Extract Dataset
console.log('\nDataset Extraction:');
const matchDataset = indexContent.match(/const GAME_DATASET\s*=\s*(\{[\s\S]*?\n\s*\};)/);
if (matchDataset) {
    try {
        const datasetCode = 'const data = ' + matchDataset[1] + '; data;';
        const dataset = eval(datasetCode);
        const planets = Object.keys(dataset);
        console.log(` - Planets in dataset:`, planets);
        let totalQ = 0;
        for (const p of planets) {
            console.log(`   * ${p}: ${dataset[p].length} questions`);
            totalQ += dataset[p].length;
        }
        console.log(` - Total questions: ${totalQ}`);
    } catch (e) {
        console.error(' - Error parsing GAME_DATASET:', e.message);
    }
} else {
    console.warn(' - GAME_DATASET match not found!');
}
