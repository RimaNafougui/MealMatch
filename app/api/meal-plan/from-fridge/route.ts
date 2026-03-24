import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cacheGet, cacheSet } from "@/utils/redis";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DAILY_FRIDGE_LIMIT = 10;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ingredients } = await req.json();
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: "ingredients array is required" }, { status: 400 });
    }

    // Rate limit: DAILY_FRIDGE_LIMIT generations per day
    const today = new Date().toISOString().split("T")[0];
    const rlKey = `ratelimit:fridge:${session.user.id}:${today}`;
    const count = (await cacheGet<number>(rlKey)) ?? 0;
    if (count >= DAILY_FRIDGE_LIMIT) {
      return NextResponse.json(
        { error: `Limite de ${DAILY_FRIDGE_LIMIT} générations par jour atteinte. Revenez demain.` },
        { status: 429 },
      );
    }
    const secondsUntilMidnight = 86400 - (Math.floor(Date.now() / 1000) % 86400);
    await cacheSet(rlKey, count + 1, secondsUntilMidnight);

    const ingredientList = ingredients.slice(0, 20).join(", ");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Tu es un chef cuisinier créatif. L'utilisateur te donne une liste d'ingrédients qu'il a dans son frigo, et tu lui proposes 3 idées de repas réalisables avec ces ingrédients.
Réponds UNIQUEMENT avec un JSON valide, sans texte supplémentaire. Format exact :
{
  "meals": [
    {
      "title": "Nom du repas",
      "description": "Description courte (1-2 phrases)",
      "estimated_time": 30,
      "ingredients_used": ["ingrédient1", "ingrédient2"]
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Voici mes ingrédients : ${ingredientList}. Propose-moi 3 repas.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Attempt regex extraction as fallback
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) {
        return NextResponse.json({ error: "Invalid response from AI" }, { status: 502 });
      }
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        return NextResponse.json({ error: "Invalid response from AI" }, { status: 502 });
      }
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("From-fridge API error:", err);
    return NextResponse.json({ error: "Failed to generate meal suggestions" }, { status: 500 });
  }
}
