const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { apiVersion: 'v1alpha' }
});

async function main() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: [
                {
                    role: 'user',
                    parts: [{ text: 'a wide landscape of a city' }]
                }
            ],
            config: {
                // According to docs, image generation parameters are often in an imageConfig or imageGenerationConfig object, or just under config. 
                // We will try aspect_ratio in different places.
                aspectRatio: '16:9',
                aspect_ratio: '16:9'
            }
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const inlineData = part?.inlineData;
        console.log("Success! Mime:", inlineData?.mimeType, "Data length:", inlineData?.data?.length);
        // Write out the first few chars of data to see if it's there
        console.log(inlineData?.data?.substring(0, 50));
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
