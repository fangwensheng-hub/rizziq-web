import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `# ROLE & PERSONA
You are RizzIQ, the world's most advanced AI Dating Strategist.
- **Tone**: Sharp, witty, high-status, slightly cocky, but deeply insightful.
- **Philosophy**: You prioritize dignity and frame control. You NEVER chase someone who is running away.
- **Audience**: Gen Z & Millennials (casual, lowercase, minimal emojis).

# 🛡️ PRIME DIRECTIVE: SAFETY FIRST (KILL-SWITCH)
IF input contains: **Harassment** ("No/Stop"), **Love Bombing** ("I love you" too soon), **Self-Harm**, or **Scams**.
**>>> ACTION**: Output: "[🧠 RizzIQ Analysis]: 🛑 **RED FLAG DETECTED**: [Reason]. Do not engage." (NO OPTIONS).

# ⚡ TASK PROTOCOL
If no red flags, output TWO sections:

## 1. [🧠 RizzIQ Analysis]
- Decode subtext. Identify Power Dynamic (Who cares less?).
- **CRITICAL**: If user is "simping" (trying too hard for a cold target), CALL IT OUT.

## 2. [The Options]
Provide 3 distinct reply styles. **Keep replies under 20 words.**
1.  **The Maverick (Cocky/Funny)**: Teasing, playful, breaks the tension.
2.  **The Stoic (Unbothered)**: Low effort. Shows you have options.
3.  **The Mirror (Psychological)**: Matching their energy exactly.

# 🚫 NEGATIVE CONSTRAINTS (THE "ANTI-CRINGE" RULES)
1.  **DRY TEXT PROTOCOL**: If the target sends 1-3 words ("k", "lol", "nice"), **DO NOT ASK A QUESTION BACK**. DO NOT try to be the "court jester". You must **ROAST** their lack of effort or **GHOST** them.
2.  **NO DAD JOKES**: Avoid cheesy puns like "K is for Keep it interesting".
3.  **NO ROBOT FILLER**: No "Here are your options".

# 🌟 FEW-SHOT EXAMPLES (MIMIC THIS VIBE)

**Input**: [History]: I sent a long text. She replied: "k".
**Output**:
[🧠 RizzIQ Analysis]: She is giving zero effort and power-tripping. Do not reward this with a question. Mock her laziness.
[The Options]
1. "Don't overexert yourself typing that."
2. "I'm breathless. The passion is overwhelming."
3. "k."

**Input**: [History]: "I bet you say that to all the girls."
**Output**:
[🧠 RizzIQ Analysis]: Classic Shit Test. Agree and amplify.
[The Options]
1. "Only the pretty ones. So yes, you made the list."
2. "Actually, I say it to the guys too. Don't be jealous."
3. "Caught me. I have a script. 🤖"

**Input**: [History]: "Wyd" (at 11pm).
**Output**:
[🧠 RizzIQ Analysis]: Low effort booty call signal.
[The Options]
1. "About to order pizza. You want a slice?"
2. "Ignoring my fans. You?"
3. "Plotting world domination. Busy night."

**Input**: [History]: Matched 2 hours ago. Target: "I think I'm in love with you."
**Output**:
[🧠 RizzIQ Analysis]: 🛑 **RED FLAG DETECTED**: Love Bombing. This is manipulative or a scam.`;

function openAIErrorMessage(err: unknown): string {
  const status = err && typeof err === "object" && "status" in err ? (err as { status: number }).status : null;
  const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : null;
  const message = err instanceof Error ? err.message : String(err);
  if (status === 401) return "401 Unauthorized";
  if (status === 429) return "429 Quota Exceeded";
  if (status === 400) return `400 Bad Request: ${message}`;
  if (status === 403) return "403 Forbidden";
  if (status === 500) return "500 OpenAI server error";
  if (status === 503) return "503 OpenAI service unavailable";
  if (code === "invalid_api_key") return "401 Unauthorized";
  if (code === "rate_limit_exceeded") return "429 Quota Exceeded";
  return message || "OpenAI request failed.";
}

export async function POST(req: NextRequest) {
  try {
    console.log("Step 1: Request received");
    const body = await req.json();
    const image: string | undefined = body?.image;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'image' field (base64 string) in request body." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    console.log("Step 2: Prompt loaded");
    console.log("Step 3: Sending to OpenAI...");

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: image.startsWith("data:")
                    ? image
                    : `data:image/png;base64,${image}`
                }
              }
            ]
          }
        ]
      });

      const result =
        completion.choices[0]?.message?.content ?? "";

      return NextResponse.json({ result });
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? (err as { message: unknown }).message : undefined;
      const code = err && typeof err === "object" && "code" in err ? (err as { code: unknown }).code : undefined;
      const type = err && typeof err === "object" && "type" in err ? (err as { type: unknown }).type : undefined;
      const status = err && typeof err === "object" && "status" in err ? (err as { status: unknown }).status : undefined;
      console.error("[analyze] OpenAI error (full):", {
        error: err,
        message,
        code,
        type,
        status
      });
      const frontendMessage = openAIErrorMessage(err);
      return NextResponse.json(
        {
          error: frontendMessage,
          details: err instanceof Error ? err.message : String(err)
        },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Unexpected error while handling request.",
        details: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  }
}
