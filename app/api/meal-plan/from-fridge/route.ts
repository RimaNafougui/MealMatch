import { NextResponse } from "next/server";
import { auth } from "@/auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    const parsed = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("From-fridge API error:", err);
    return NextResponse.json({ error: "Failed to generate meal suggestions" }, { status: 500 });
  }
}
