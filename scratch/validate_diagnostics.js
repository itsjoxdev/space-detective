/**
 * Syntax & Structure Diagnostics Validator
 * 
 * 1. CSS Syntax Validation: Uses css-tree AST parser to validate complete <style> stylesheet.
 * 2. HTML Boundaries Validation: Checks <style> and <script> tag boundaries and pairing.
 * 3. JS Syntax Validation: Compiles all inline JavaScript using V8 vm.Script compiler.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const csstree = require('css-tree');

const HTML_FILE = path.resolve(__dirname, '..', 'index.html');
const content = fs.readFileSync(HTML_FILE, 'utf8');
const lines = content.split(/\r?\n/);

console.log('═'.repeat(70));
console.log('🔍 RUNNING COMPREHENSIVE DIAGNOSTICS & SYNTAX VALIDATION');
console.log(`Target: ${HTML_FILE} (${lines.length} lines)`);
console.log('═'.repeat(70));

let hasErrors = false;

// ─────────────────────────────────────────────────────────────────────────────
// 1. HTML STRUCTURE & <style> / <script> BOUNDARIES
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- [1/3] HTML TAG BOUNDARIES & STRUCTURE ---');

const styleOpenCount = (content.match(/<style[^>]*>/gi) || []).length;
const styleCloseCount = (content.match(/<\/style>/gi) || []).length;
console.log(`  <style> tags: ${styleOpenCount} opening, ${styleCloseCount} closing`);

if (styleOpenCount !== styleCloseCount) {
    console.error(`  ❌ Mismatched <style> tags: ${styleOpenCount} open vs ${styleCloseCount} close`);
    hasErrors = true;
} else {
    console.log('  ✓ <style> tag boundaries are perfectly matched');
}

const scriptOpenCount = (content.match(/<script[^>]*>/gi) || []).length;
const scriptCloseCount = (content.match(/<\/script>/gi) || []).length;
console.log(`  <script> tags: ${scriptOpenCount} opening, ${scriptCloseCount} closing`);

if (scriptOpenCount !== scriptCloseCount) {
    console.error(`  ❌ Mismatched <script> tags: ${scriptOpenCount} open vs ${scriptCloseCount} close`);
    hasErrors = true;
} else {
    console.log('  ✓ <script> tag boundaries are perfectly matched');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CSS SYNTAX VALIDATION (css-tree AST Parser)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- [2/3] CSS SYNTAX & AST PARSING (css-tree) ---');

const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
let styleMatch;
let styleIndex = 0;
let totalCssErrors = 0;

while ((styleMatch = styleRegex.exec(content)) !== null) {
    styleIndex++;
    const cssText = styleMatch[1];
    
    // Calculate line offset
    const upToMatch = content.substring(0, styleMatch.index);
    const lineOffset = upToMatch.split(/\r?\n/).length;

    console.log(`  Analyzing <style> block #${styleIndex} (starts at line ${lineOffset})...`);

    const parseErrors = [];
    try {
        const ast = csstree.parse(cssText, {
            positions: true,
            onParseError(error) {
                parseErrors.push({
                    message: error.message,
                    line: lineOffset + error.line - 1,
                    column: error.column,
                    rawMessage: error.rawMessage
                });
            }
        });

        if (parseErrors.length === 0) {
            console.log(`  ✓ Style block #${styleIndex}: 0 CSS syntax errors! AST parsed successfully.`);
        } else {
            console.error(`  ❌ Style block #${styleIndex}: ${parseErrors.length} CSS syntax errors found:`);
            parseErrors.forEach(err => {
                console.error(`     Line ${err.line}:${err.column} -> ${err.message}`);
            });
            totalCssErrors += parseErrors.length;
            hasErrors = true;
        }

        // Count rules and at-rules in AST
        let ruleCount = 0;
        let atRuleCount = 0;
        csstree.walk(ast, node => {
            if (node.type === 'Rule') ruleCount++;
            if (node.type === 'Atrule') atRuleCount++;
        });
        console.log(`  ℹ  AST Stats: ${ruleCount} CSS rules, ${atRuleCount} at-rules (@media, @keyframes) parsed.`);

    } catch (fatalErr) {
        console.error(`  ❌ Fatal CSS parse exception: ${fatalErr.message}`);
        totalCssErrors++;
        hasErrors = true;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. JAVASCRIPT SYNTAX VALIDATION (V8 vm.Script)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- [3/3] JAVASCRIPT SYNTAX & V8 COMPILATION ---');

const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let scriptMatch;
let scriptIndex = 0;
let totalJsErrors = 0;

while ((scriptMatch = scriptRegex.exec(content)) !== null) {
    scriptIndex++;
    const jsText = scriptMatch[1];
    const upToMatch = content.substring(0, scriptMatch.index);
    const lineOffset = upToMatch.split(/\r?\n/).length;

    console.log(`  Analyzing inline <script> block #${scriptIndex} (starts at line ${lineOffset})...`);

    try {
        new vm.Script(jsText, {
            filename: `inline-script-${scriptIndex}.js`,
            lineOffset: lineOffset
        });
        console.log(`  ✓ Inline script #${scriptIndex}: 0 JS syntax errors! V8 compiled cleanly.`);
    } catch (jsErr) {
        console.error(`  ❌ Inline script #${scriptIndex} syntax error: ${jsErr.message}`);
        if (jsErr.stack) console.error(jsErr.stack);
        totalJsErrors++;
        hasErrors = true;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY & VERDICT
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(70));
console.log('DIAGNOSTICS VALIDATION SUMMARY:');
console.log(`  HTML Tag Boundaries : ${styleOpenCount === styleCloseCount && scriptOpenCount === scriptCloseCount ? 'PASSED ✅' : 'FAILED ❌'}`);
console.log(`  CSS Syntax Errors   : ${totalCssErrors === 0 ? '0 ERRORS (PASSED ✅)' : `${totalCssErrors} ERRORS (FAILED ❌)`}`);
console.log(`  JS Syntax Errors    : ${totalJsErrors === 0 ? '0 ERRORS (PASSED ✅)' : `${totalJsErrors} ERRORS (FAILED ❌)`}`);
console.log('═'.repeat(70));

if (hasErrors) {
    console.log('💥 RESULT: DIAGNOSTICS DETECTED');
    process.exit(1);
} else {
    console.log('🎉 RESULT: ALL CSS & JS DIAGNOSTICS CLEAN! 0 ERRORS');
    process.exit(0);
}
