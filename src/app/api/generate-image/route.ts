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
        // Example valid aspects in API: '1:1', '3:4', '4:3', '9:16', '16:9'
        // ultra-tall/wide ratios like 1:4, 1:8, 4:1, 8:1
        const validAspectRatio = aspectRatio || '1:1';

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
                // Pass aspectRatio here for generateContent in Gemini 3.1
                // The v1alpha types expect "aspectRatio", but some preview APIs need "aspect_ratio" or nested configs.
                // We provide variations to ensure it gets picked up.
                aspectRatio: validAspectRatio,
                aspect_ratio: validAspectRatio,
                imageConfig: {
                    aspectRatio: validAspectRatio,
                },
                imageGenerationConfig: {
                    aspectRatio: validAspectRatio,
                }
                // outputMimeType: 'image/jpeg', // Not typically needed for standard generateContent unless explicitly setting structured text output, but keeping it commented out if needed.
            } as any
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
