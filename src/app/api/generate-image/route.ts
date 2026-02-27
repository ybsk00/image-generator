import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
    try {
        const { prompt, aspectRatio, resolution } = await req.json();

        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
        }

        // Example valid aspects in API: '1:1', '3:4', '4:3', '9:16', '16:9'
        // The user requested ultra-tall/wide ratios like 1:4, 1:8, 4:1, 8:1
        // We pass what they select. If the model throws an error for unsupported ratios, it will be caught.
        const validAspectRatio = aspectRatio || '1:1';

        const response = await ai.models.generateImages({
            model: 'gemini-3.1-flash-image-preview',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: validAspectRatio,
                outputMimeType: 'image/jpeg',
            }
        });

        const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
        if (!base64Image) {
            throw new Error('No image was returned from the model');
        }

        return new Response(JSON.stringify({ image: `data:image/jpeg;base64,${base64Image}` }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Image generation error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to generate image' }), { status: 500 });
    }
}
