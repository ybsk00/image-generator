const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

async function test() {
    try {
        const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
        const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (!apiKeyMatch) throw new Error("No API key");

        const ai = new GoogleGenAI({
            apiKey: apiKeyMatch[1].trim(),
            httpOptions: { apiVersion: 'v1alpha' }
        });

        const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        const response = await ai.models.generateImages({
            model: 'gemini-3.1-flash',
            prompt: 'A person wearing a red hat, like in the image [1]',
            referenceImages: [
                {
                    referenceType: 'SUBJECT',
                    referenceImage: {
                        image: {
                            imageBytes: dummyBase64
                        }
                    },
                    referenceId: 1
                }
            ],
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg'
            }
        });

        console.log("Success! Response object keys:", Object.keys(response || {}));
        if (response.generatedImages) console.log("Images count:", response.generatedImages.length);
    } catch (e) {
        console.error("Error details:");
        console.error(e);
    }
}
test();
