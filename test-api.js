const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { apiVersion: 'v1alpha' }
});

async function main() {
    try {
        const response = await ai.models.generateImages({
            model: 'gemini-3.1-flash-image-preview',
            prompt: 'a cute cat',
            config: {
                numberOfImages: 1,
                // aspectRatio: '1:1', // test without aspect ratio first
                outputMimeType: 'image/jpeg',
            }
        });
        console.log(response);
    } catch (e) {
        console.error(e);
    }
}

main();
