const fs = require('fs');
const sdkContent = fs.readFileSync('node_modules/@google/genai/dist/genai.d.ts', 'utf8');

// Function to extract an interface block
function extractInterface(name) {
    const start = sdkContent.indexOf(`interface ${name}`);
    if (start === -1) return `${name} not found`;
    let openBraces = 0;
    let end = -1;
    for (let i = start; i < sdkContent.length; i++) {
        if (sdkContent[i] === '{') openBraces++;
        if (sdkContent[i] === '}') {
            openBraces--;
            if (openBraces === 0) {
                end = i;
                break;
            }
        }
    }
    return sdkContent.substring(start, end + 1);
}

fs.writeFileSync('api_interfaces.txt',
    extractInterface('GenerateContentConfig') + '\n\n' +
    extractInterface('GenerateImagesConfig') + '\n\n' +
    extractInterface('Part')
);
