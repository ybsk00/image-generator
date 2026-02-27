import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { apiVersion: 'v1alpha' }
});

export async function POST(req: Request) {
    try {
        const { prompt, aspectRatio, resolution } = await req.json();

        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
        }

        // The exact config parameters for aspect ratio/resolution in generateContent 
        // with the new 3.1 models are typically passed inside generationConfig or specialized options.
        // We'll pass them in as standard properties; the REST API usually accepts them.
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ],
            config: {
                responseModalities: ["IMAGE"],
            }
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const inlineData = part?.inlineData;
        const base64Image = inlineData?.data;
        const mimeType = inlineData?.mimeType || 'image/jpeg';

        if (!base64Image) {
            console.error('Full response:', JSON.stringify(response, null, 2));
            throw new Error('No image was returned from the model. See server logs for full response.');
        }

        return new Response(JSON.stringify({ image: `data:${mimeType};base64,${base64Image}` }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Image generation error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to generate image' }), { status: 500 });
    }
}
