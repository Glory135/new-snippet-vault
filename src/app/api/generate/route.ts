
import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Initialize on the server where process.env.AI_API_KEY is available
const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

export async function POST(req: Request) {
    try {
        const { type, prompt, language, code } = await req.json();

        if (type === 'generate') {
            const model = 'gemini-2.5-flash';
            const systemInstruction = `You are an expert senior software engineer. 
        Your task is to generate high-quality, clean, and efficient code snippets based on user requests.
        - ONLY return the code. Do not wrap in markdown code blocks (e.g. no \`\`\`js).
        - If comments are helpful, add them inline.
        - The user wants code in: ${language}.
        `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction,
                    temperature: 0.3,
                }
            });

            return NextResponse.json({ result: response.text || '// No code generated.' });
        }

        if (type === 'explain') {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Explain this code briefly in 2-3 sentences:\n\n${code}`,
            });
            return NextResponse.json({ result: response.text || 'No explanation available.' });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }
}
