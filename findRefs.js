const fs = require('fs');
const sdkContent = fs.readFileSync('node_modules/@google/genai/dist/genai.d.ts', 'utf8');
const lines = sdkContent.split('\n');
const results = [];
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('SubjectReferenceImage') || lines[i].includes('StyleReferenceImage') || lines[i].includes('referenceImages')) {
        results.push(`--- MATCH at line ${i} ---`);
        for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 3); j++) {
            results.push(`${j}: ${lines[j]}`);
        }
    }
}
fs.writeFileSync('ref_search_results.txt', results.join('\n'));
