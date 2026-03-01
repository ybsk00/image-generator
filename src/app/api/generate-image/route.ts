import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { prompt, aspectRatio, resolution, referenceImage, referenceType } = await req.json();

        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
        }

        const validAspectRatio = aspectRatio || '1:1';

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: { apiVersion: 'v1alpha' }
        });

        const parts: any[] = [];

        if (referenceImage && referenceType && referenceType !== 'none') {
            const matches = referenceImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const mimeType = matches[1];
                const data = matches[2];
                // 1. Add the reference image
                parts.push({
                    inlineData: {
                        mimeType: mimeType,
                        data: data
                    }
                });

                // 2. Add the text prompt with special instructions based on the Reference Type
                let enhancedPrompt = prompt;
                if (referenceType === 'subject') {
                    enhancedPrompt += "\n\nCRITICAL INSTRUCTION: Use the provided image as a STRICT SUBJECT REFERENCE. The generated image MUST feature the exact same person, character, or product shown in the uploaded image. Maintain their identity, facial features, and core design perfectly.";
                } else if (referenceType === 'style') {
                    enhancedPrompt += "\n\nCRITICAL INSTRUCTION: Use the provided image as a STRICT STYLE REFERENCE. The generated image MUST perfectly match the artistic style, color palette, lighting, vibe, and aesthetic of the uploaded image. Do not copy the subject, only the style.";
                }
                parts.push({ text: enhancedPrompt });
            } else {
                parts.push({ text: prompt });
            }
        } else {
            parts.push({ text: prompt });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: [
                {
                    role: 'user',
                    parts: parts
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
