import { NextRequest, NextResponse } from "next/server";

// Types

interface IngredientInput {
    name: string;
    amount: string; // ex: "200"
    unit: string;   // ex: "g", "ml", "cup", "tbsp", etc.
}

interface Macros {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

// Table de conversion des unités vers grammes ou millilitres
// Les valeurs sont en grammes (ou ml, assumant une densité d'environ 1).

const UNIT_TO_GRAMS: Record<string, number> = {
    // système métrique
    g: 1,
    gram: 1,
    grams: 1,
    kg: 1000,
    kilogram: 1000,
    kilograms: 1000,
    ml: 1,
    milliliter: 1,
    milliliters: 1,
    l: 1000,
    liter: 1000,
    liters: 1000,
    // système impérial ou commun
    oz: 28.35,
    ounce: 28.35,
    ounces: 28.35,
    lb: 453.59,
    pound: 453.59,
    pounds: 453.59,
    // volume (approximatif, densité ≈ 1 pour la plupart des liquides/pâtes)
    cup: 240,
    cups: 240,
    tbsp: 15,
    tablespoon: 15,
    tablespoons: 15,
    tsp: 5,
    teaspoon: 5,
    teaspoons: 5,
    // termes français usuels
    tasse: 240,
    "c. à soupe": 15,
    "c. à thé": 5,
};

function toGrams(amount: string, unit: string): number {
    const qty = parseFloat(amount);
    if (isNaN(qty) || qty <= 0) return 100; // 100g par défaut si la quantité est invalide

    const key = unit.toLowerCase().trim();
    const multiplier = UNIT_TO_GRAMS[key];

    if (multiplier) return qty * multiplier;

    // Unité inconnue → suppose une quantité unitaire (ex: "1 oeuf") — 50g par défaut
    return qty * 50;
}

// Récupération du jeton OAuth 2.0 pour FatSecret

async function getFatSecretToken(): Promise<string> {
    const clientId = process.env.FATSECRET_CLIENT_ID;
    const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("FATSECRET_CLIENT_ID ou FATSECRET_CLIENT_SECRET manquant dans .env.local");
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const res = await fetch("https://oauth.fatsecret.com/connect/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${credentials}`,
        },
        body: "grant_type=client_credentials&scope=premier",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`FatSecret OAuth échoué (${res.status}): ${text}`);
    }

    const json = await res.json();
    return json.access_token as string;
}

// Recherche d'aliments et calcul des macros

interface FatSecretServingRaw {
    serving_description?: string;
    metric_serving_unit?: string;
    calories?: string;
    protein?: string;
    carbohydrate?: string;
    fat?: string;
    metric_serving_amount?: string;
}

interface FatSecretFoodRaw {
    food_name?: string;
    servings?: {
        serving?: FatSecretServingRaw | FatSecretServingRaw[];
    };
}

async function searchFoodMacros(
    token: string,
    ingredient: IngredientInput,
): Promise<Macros | null> {
    // Étape 1 : rechercher l'aliment
    const searchUrl = new URL("https://platform.fatsecret.com/rest/server.api");
    searchUrl.searchParams.set("method", "foods.search");
    searchUrl.searchParams.set("search_expression", ingredient.name);
    searchUrl.searchParams.set("max_results", "1");
    searchUrl.searchParams.set("format", "json");

    const searchRes = await fetch(searchUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const foods = searchData?.foods?.food;
    if (!foods) return null;

    const food = Array.isArray(foods) ? foods[0] : foods;
    const foodId: string = food?.food_id;
    if (!foodId) return null;

    // Étape 2 : obtenir les détails nutritionnels complets (portion de 100g)
    const detailUrl = new URL("https://platform.fatsecret.com/rest/server.api");
    detailUrl.searchParams.set("method", "food.get.v2");
    detailUrl.searchParams.set("food_id", foodId);
    detailUrl.searchParams.set("format", "json");

    const detailRes = await fetch(detailUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!detailRes.ok) return null;

    const detailData = await detailRes.json();
    const foodDetail: FatSecretFoodRaw = detailData?.food;
    if (!foodDetail) return null;

    // Sélectionner la portion de 100g si disponible, sinon la première portion
    const rawServings = foodDetail.servings?.serving;
    const servingsList: FatSecretServingRaw[] = rawServings
        ? Array.isArray(rawServings)
            ? rawServings
            : [rawServings]
        : [];

    const per100 =
        servingsList.find(
            (s) =>
                s.metric_serving_unit?.toLowerCase() === "g" &&
                parseFloat(s.metric_serving_amount ?? "0") === 100,
        ) ?? servingsList[0];

    if (!per100) return null;

    const caloriesPer100 = parseFloat(per100.calories ?? "0");
    const proteinPer100 = parseFloat(per100.protein ?? "0");
    const carbsPer100 = parseFloat(per100.carbohydrate ?? "0");
    const fatPer100 = parseFloat(per100.fat ?? "0");

    const referenceGrams = parseFloat(per100.metric_serving_amount ?? "100");

    // Convertir selon le poids de l'ingrédient demandé
    const ingredientGrams = toGrams(ingredient.amount, ingredient.unit);
    const ratio = ingredientGrams / referenceGrams;

    return {
        calories: Math.round(caloriesPer100 * ratio),
        protein: Math.round(proteinPer100 * ratio * 10) / 10,
        carbs: Math.round(carbsPer100 * ratio * 10) / 10,
        fat: Math.round(fatPer100 * ratio * 10) / 10,
    };
}

// Route de l'API : POST /api/fatsecret/macros

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const ingredients: IngredientInput[] = body.ingredients ?? [];
        const servings: number = Math.max(1, parseInt(body.servings ?? "1", 10));

        const validIngredients = ingredients.filter((i) => i.name.trim());
        if (validIngredients.length === 0) {
            return NextResponse.json(
                { error: "Aucun ingrédient valide fourni" },
                { status: 400 },
            );
        }

        const token = await getFatSecretToken();

        // Récupérer les macros de tous les ingrédients en parallèle
        const results = await Promise.all(
            validIngredients.map((ing) => searchFoodMacros(token, ing)),
        );

        // Additionner les macros ; ignorer les résultats null (non trouvés)
        const total: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        let found = 0;
        for (const m of results) {
            if (m) {
                total.calories += m.calories;
                total.protein += m.protein;
                total.carbs += m.carbs;
                total.fat += m.fat;
                found++;
            }
        }

        if (found === 0) {
            return NextResponse.json(
                { error: "Aucun ingrédient reconnu par FatSecret" },
                { status: 404 },
            );
        }

        // Valeurs par portion
        const perServing: Macros = {
            calories: Math.round(total.calories / servings),
            protein: Math.round((total.protein / servings) * 10) / 10,
            carbs: Math.round((total.carbs / servings) * 10) / 10,
            fat: Math.round((total.fat / servings) * 10) / 10,
        };

        return NextResponse.json({
            perServing,
            total,
            found,
            total_ingredients: validIngredients.length,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur interne";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
