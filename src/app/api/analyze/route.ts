import { NextResponse } from "next/server";
import OpenAI from "openai";

// 强制使用 JSON 模式的 System Prompt
const SYSTEM_PROMPT = `
You are RizzIQ. Analyze the chat image.
CRITICAL: You MUST return a valid JSON object. Do not return markdown or plain text.
The JSON structure must be exactly:
{
  "analysis": "Your psychological analysis here (under 30 words).",
  "options": [
    { "title": "The Maverick", "content": "Reply option 1 here" },
    { "title": "The Stoic", "content": "Reply option 2 here" },
    { "title": "The Mirror", "content": "Reply option 3 here" }
  ]
}
If you detect a RED FLAG (harassment/scam/safety), return:
{
  "analysis": "🛑 RED FLAG DETECTED: [Reason]. Do not engage.",
  "options": []
}
`;

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    
    // 初始化 OpenAI (确保 .env.local 里有 OPENAI_API_KEY)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this chat." },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
      response_format: { type: "json_object" }, // 关键：强制 JSON 模式
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    
    // 尝试解析 JSON
    try {
      const jsonResult = JSON.parse(content || "{}");
      return NextResponse.json(jsonResult);
    } catch (e) {
      console.error("JSON Parse Error:", content);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
