import { NextRequest, NextResponse } from "next/server";

interface Phrase {
  hmong: string;
  meaning: {
    hmong: string;
    english: string;
    lao: string;
    thai: string;
  };
}

const SYSTEM_PROMPT = `You are a Hmong language expert. Generate Hmong phrases with translations.
Return a JSON array of phrases in this exact format:
[
  {
    "hmong": "Hmong phrase here",
    "meaning": {
      "hmong": "Hmong meaning",
      "english": "English translation",
      "lao": "Lao translation",
      "thai": "Thai translation"
    }
  }
]
Only return valid JSON, no markdown or extra text.`;

async function generateWithGemini(
  topic: string,
  count: number,
): Promise<Phrase[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nGenerate ${count} Hmong phrases about: ${topic}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse Gemini response");
  }

  return JSON.parse(jsonMatch[0]);
}

async function generateWithOpenAI(
  topic: string,
  count: number,
): Promise<Phrase[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate ${count} Hmong phrases about: ${topic}`,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse OpenAI response");
  }

  return JSON.parse(jsonMatch[0]);
}

async function generateWithOllama(
  topic: string,
  count: number,
): Promise<Phrase[]> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "qwen3:4b";

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `${SYSTEM_PROMPT}\n\nGenerate ${count} Hmong phrases about: ${topic}`,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error: ${error}`);
  }

  const data = await response.json();
  const text = data.response || "";

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse Ollama response");
  }

  return JSON.parse(jsonMatch[0]);
}

async function generateWithOpenRouter(
  topic: string,
  count: number,
): Promise<Phrase[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
            "X-Title": "Hmong Voice App",
          },
          body: JSON.stringify({
            model:
              process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: `Generate ${count} Hmong phrases about: ${topic}`,
              },
            ],
            temperature: 0.7,
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${error}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Failed to parse OpenRouter response");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.log(`OpenRouter attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }

  throw lastError || new Error("OpenRouter request failed after retries");
}

export async function POST(request: NextRequest) {
  try {
    const { provider, topic, count } = await request.json();

    if (!provider || !topic || !count) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let phrases: Phrase[];

    switch (provider) {
      case "gemini":
        phrases = await generateWithGemini(topic, count);
        break;
      case "openai":
        phrases = await generateWithOpenAI(topic, count);
        break;
      case "ollama":
        phrases = await generateWithOllama(topic, count);
        break;
      case "openrouter":
        phrases = await generateWithOpenRouter(topic, count);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid provider" },
          { status: 400 },
        );
    }

    return NextResponse.json({ phrases });
  } catch (error) {
    console.error("Error generating phrases:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate phrases",
      },
      { status: 500 },
    );
  }
}
