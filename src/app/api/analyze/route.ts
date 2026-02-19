import { NextResponse } from "next/server";
import OpenAI from "openai";

const MAX_IMAGE_BYTES = 14 * 1024 * 1024; // ~10MB raw after base64 (~33% overhead)

// 强制使用 JSON 模式的 System Prompt
const SYSTEM_PROMPT = `
You are RizzIQ. Analyze the chat image.
IMPORTANT: Detect the language of the chat in the image, and write your analysis and all reply options in that SAME language (e.g. French chat → French replies, Spanish chat → Spanish replies).
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
If you detect a RED FLAG (harassment/scam/safety), return analysis in the chat's language and empty options:
{
  "analysis": "🛑 RED FLAG DETECTED: [Reason in chat's language]. Do not engage.",
  "options": []
}
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const image = body?.image;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid image. Please upload a screenshot." },
        { status: 400 }
      );
    }
    if (!image.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Image must be a valid data URL (data:image/...)." },
        { status: 400 }
      );
    }

    if (image.length > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          error: `Image too large. Maximum size is 10MB. Please use a smaller screenshot.`,
        },
        { status: 413 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server config error: OPENAI_API_KEY is not set. Add it to .env.local" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey,
      timeout: 120000, // 2 minutes for vision API (image analysis can be slow)
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

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown server error";
    const isTimeout = msg.toLowerCase().includes("timed out") || msg.toLowerCase().includes("timeout");
    const userMessage = isTimeout
      ? "Request timed out. The AI service is slow or unreachable. Check your network, try a smaller image, or try again later."
      : msg;
    console.error("API Error:", error);
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
