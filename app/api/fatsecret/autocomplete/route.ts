import { NextRequest, NextResponse } from "next/server";

// ─── Helper : OAuth 2.0 token FatSecret ──────────────────────────────────────

async function getFatSecretToken(): Promise<string> {
  const clientId = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "FATSECRET_CLIENT_ID ou FATSECRET_CLIENT_SECRET manquant dans .env.local",
    );
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const res = await fetch("https://oauth.fatsecret.com/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials&scope=premier",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FatSecret OAuth échoué (${res.status}): ${text}`);
  }

  const json = await res.json();
  return json.access_token as string;
}

// ─── Route : GET /api/fatsecret/autocomplete?q=<query> ───────────────────────

/**
 * Autocomplétion des ingrédients via FatSecret `foods.autocomplete`.
 * Utilise OAuth 2.0 Client Credentials (côté serveur uniquement).
 * Les limites FatSecret sont illimitées, contrairement à Spoonacular.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const token = await getFatSecretToken();

    const url = new URL("https://platform.fatsecret.com/rest/server.api");
    url.searchParams.set("method", "foods.autocomplete");
    url.searchParams.set("expression", q);
    url.searchParams.set("max_results", "6");
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("FatSecret autocomplete error:", await res.text());
      return NextResponse.json({ suggestions: [] });
    }

    const data = await res.json();

    // Réponse FatSecret : { suggestions: { suggestion: string | string[] } }
    const raw = data?.suggestions?.suggestion;
    let suggestions: string[] = [];

    if (Array.isArray(raw)) {
      suggestions = raw;
    } else if (typeof raw === "string") {
      suggestions = [raw];
    }

    return NextResponse.json({ suggestions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return NextResponse.json(
      { error: message, suggestions: [] },
      { status: 500 },
    );
  }
}
