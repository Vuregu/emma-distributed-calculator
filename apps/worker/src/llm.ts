import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-proj-dummy', // Use dummy or env
});

export async function getMathInsight(result: number): Promise<string> {
    try {
        if (!process.env.OPENAI_API_KEY) return "Calculated successfully.";

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // or 4o-mini
            messages: [
                {
                    role: "system",
                    content: "You are a mathematician. Provide a short, interesting mathematical property or fact about the given number. Max 1 sentence."
                },
                {
                    role: "user",
                    content: `The number is ${result}.`
                }
            ],
            max_tokens: 60,
        });

        return response.choices[0]?.message?.content || "No insight available.";
    } catch (error) {
        console.error("LLM Error:", error);
        return "Insight generation failed.";
    }
}
