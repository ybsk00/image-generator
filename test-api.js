const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    // v1alpha might be needed for generateContent with 3.1
    httpOptions: { apiVersion: 'v1alpha' }
});

async function main() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: [
                {
                    role: 'user',
                    parts: [{ text: 'Generate an image of a cute cat' }]
                }
            ]
        });
        console.log("Success! Parts:", response.candidates?.[0]?.content?.parts?.length);
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
