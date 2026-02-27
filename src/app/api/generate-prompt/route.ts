import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [{ text: `You are an expert image generation prompt engineer. Rewrite and enhance the following simple idea into a highly detailed, descriptive English prompt suitable for a high-end AI image generator. Focus on lighting, mood, camera angle, texture, and style. Return ONLY the enhanced prompt string, nothing else. The idea: "${prompt}"` }]
                }
            ]
        });

        const enhancedPrompt = response.text?.trim() || prompt;

        return new Response(JSON.stringify({ prompt: enhancedPrompt }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Prompt generation error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to generate prompt' }), { status: 500 });
    }
}
