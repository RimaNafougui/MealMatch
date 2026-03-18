import { NextRequest, NextResponse } from "next/server";

/**
 * Route API pour l'autocomplétion des ingrédients.
 * Utilise l'API Spoonacular en remplacement de FatSecret qui nécessite une licence payante.
 */

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

    if (!apiKey) {
      throw new Error("Clé Spoonacular manquante");
    }

    const url = new URL("https://api.spoonacular.com/food/ingredients/autocomplete");
    url.searchParams.set("query", q);
    url.searchParams.set("number", "6");
    url.searchParams.set("metaInformation", "false");
    url.searchParams.set("apiKey", apiKey);

    const res = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Spoonacular API error:", await res.text());
      return NextResponse.json({ suggestions: [] });
    }

    const data = await res.json();

    // Format retourné par Spoonacular : [{ name: "apple", image: "apple.jpg" }, ...]
    const suggestions = Array.isArray(data) ? data.map((item: any) => item.name) : [];

    return NextResponse.json({ suggestions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return NextResponse.json({ error: message, suggestions: [] }, { status: 500 });
  }
}

