const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
const lines = content.split('\n');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2B50}\u{2B05}\u{27A1}\u{2190}-\u{2199}]/u;

const matches = [];
lines.forEach((line, idx) => {
    if (emojiRegex.test(line)) {
        matches.push({ lineNum: idx + 1, text: line.trim() });
    }
});

console.log('Total emoji lines:', matches.length);
matches.forEach(m => console.log(`${m.lineNum}: ${m.text}`));
