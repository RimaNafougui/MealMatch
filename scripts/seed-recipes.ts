import { createClient } from "@supabase/supabase-js";

// ── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SPOONACULAR_KEY = process.env.SPOONACULAR_API_KEY!;
const SPOONACULAR_BASE = "https://api.spoonacular.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Types ───────────────────────────────────────────────────────────────────

interface SpoonacularSearchResult {
  id: number;
  title: string;
  image: string;
}

interface SpoonacularRecipeDetail {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  pricePerServing: number;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  diets: string[];
  dishTypes: string[];
  extendedIngredients: {
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }[];
  analyzedInstructions: {
    name: string;
    steps: {
      number: number;
      step: string;
    }[];
  }[];
  nutrition?: {
    nutrients: {
      name: string;
      amount: number;
      unit: string;
    }[];
  };
}

interface SavedRecipe {
  spoonacular_id: number;
  title: string;
  image_url: string | null;
  prep_time: number | null;
  servings: number;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  price_per_serving: number | null;
  ingredients: object;
  instructions: object;
  dietary_tags: string[];
  spoonacular_data: object;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getNutrient(
  nutrients: { name: string; amount: number }[] | undefined,
  name: string,
): number | null {
  if (!nutrients) return null;
  const n = nutrients.find(
    (x) => x.name.toLowerCase() === name.toLowerCase(),
  );
  return n ? Math.round(n.amount) : null;
}

function buildDietaryTags(recipe: SpoonacularRecipeDetail): string[] {
  const tags: string[] = [];
  if (recipe.vegan) tags.push("vegan");
  if (recipe.vegetarian && !recipe.vegan) tags.push("vegetarian");
  if (recipe.glutenFree) tags.push("gluten-free");
  if (recipe.dairyFree) tags.push("dairy-free");

  for (const diet of recipe.diets) {
    const normalized = diet.toLowerCase();
    if (!tags.includes(normalized)) {
      tags.push(normalized);
    }
  }

  if (recipe.dishTypes) {
    for (const dt of recipe.dishTypes) {
      const normalized = dt.toLowerCase();
      if (
        ["breakfast", "lunch", "dinner", "snack", "dessert"].includes(
          normalized,
        )
      ) {
        if (!tags.includes(normalized)) tags.push(normalized);
      }
    }
  }

  if (tags.length === 0) tags.push("omnivore");
  return tags;
}

function parseIngredients(recipe: SpoonacularRecipeDetail) {
  return (recipe.extendedIngredients || []).map((ing) => ({
    id: ing.id,
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
    original: ing.original,
  }));
}

function parseInstructions(recipe: SpoonacularRecipeDetail) {
  if (!recipe.analyzedInstructions?.length) return [];
  return recipe.analyzedInstructions[0].steps.map((s) => ({
    number: s.number,
    step: s.step,
  }));
}

function toSavedRecipe(detail: SpoonacularRecipeDetail): SavedRecipe {
  const nutrients = detail.nutrition?.nutrients;
  return {
    spoonacular_id: detail.id,
    title: detail.title,
    image_url: detail.image || null,
    prep_time: detail.readyInMinutes > 0 ? detail.readyInMinutes : null,
    servings: detail.servings || 4,
    calories: getNutrient(nutrients, "Calories"),
    protein: getNutrient(nutrients, "Protein"),
    carbs: getNutrient(nutrients, "Carbohydrates"),
    fat: getNutrient(nutrients, "Fat"),
    price_per_serving: detail.pricePerServing
      ? Math.round(detail.pricePerServing) / 100
      : null,
    ingredients: parseIngredients(detail),
    instructions: parseInstructions(detail),
    dietary_tags: buildDietaryTags(detail),
    spoonacular_data: detail,
  };
}

// ── API calls ───────────────────────────────────────────────────────────────

async function searchRecipes(
  diet: string | null,
  mealType: string | null,
  number: number,
  offset: number = 0,
): Promise<SpoonacularSearchResult[]> {
  const params = new URLSearchParams({
    apiKey: SPOONACULAR_KEY,
    number: String(number),
    offset: String(offset),
    sort: "random",
    addRecipeInformation: "false",
  });
  if (diet) params.set("diet", diet);
  if (mealType) params.set("type", mealType);

  const url = `${SPOONACULAR_BASE}/recipes/complexSearch?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Search failed (${res.status}): ${await res.text()}`,
    );
  }
  const data = await res.json();
  return data.results as SpoonacularSearchResult[];
}

async function fetchRecipeDetail(
  id: number,
): Promise<SpoonacularRecipeDetail> {
  const params = new URLSearchParams({
    apiKey: SPOONACULAR_KEY,
    includeNutrition: "true",
  });
  const url = `${SPOONACULAR_BASE}/recipes/${id}/information?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Detail fetch failed for ${id} (${res.status}): ${await res.text()}`,
    );
  }
  return (await res.json()) as SpoonacularRecipeDetail;
}

// ── Seed logic ──────────────────────────────────────────────────────────────

interface BatchConfig {
  label: string;
  diet: string | null;
  mealType: string | null;
  count: number;
}

const BATCHES: BatchConfig[] = [
  // 30 vegetarian — spread across meal types
  { label: "vegetarian/breakfast", diet: "vegetarian", mealType: "breakfast", count: 8 },
  { label: "vegetarian/main course", diet: "vegetarian", mealType: "main course", count: 12 },
  { label: "vegetarian/snack", diet: "vegetarian", mealType: "snack", count: 5 },
  { label: "vegetarian/dessert", diet: "vegetarian", mealType: "dessert", count: 5 },

  // 20 vegan
  { label: "vegan/main course", diet: "vegan", mealType: "main course", count: 10 },
  { label: "vegan/breakfast", diet: "vegan", mealType: "breakfast", count: 5 },
  { label: "vegan/snack", diet: "vegan", mealType: "snack", count: 5 },

  // 20 gluten-free
  { label: "gluten-free/main course", diet: "gluten free", mealType: "main course", count: 10 },
  { label: "gluten-free/breakfast", diet: "gluten free", mealType: "breakfast", count: 5 },
  { label: "gluten-free/dessert", diet: "gluten free", mealType: "dessert", count: 5 },

  // 30 omnivore (no diet filter) — varied meal types
  { label: "omnivore/breakfast", diet: null, mealType: "breakfast", count: 8 },
  { label: "omnivore/main course", diet: null, mealType: "main course", count: 12 },
  { label: "omnivore/snack", diet: null, mealType: "snack", count: 5 },
  { label: "omnivore/dessert", diet: null, mealType: "dessert", count: 5 },
];

async function seed() {
  console.log("🚀 Starting recipe seed...\n");

  // Validate env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SPOONACULAR_KEY) {
    console.error(
      "❌ Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SPOONACULAR_API_KEY",
    );
    process.exit(1);
  }

  // Collect all unique recipe IDs across batches
  const collectedIds = new Set<number>();
  const batchIds: Map<string, number[]> = new Map();

  for (const batch of BATCHES) {
    console.log(
      `🔍 Searching ${batch.count} recipes [${batch.label}]...`,
    );
    // Fetch a bit more than needed to allow for dedup
    const results = await searchRecipes(
      batch.diet,
      batch.mealType,
      batch.count + 10,
    );
    await sleep(300);

    const ids: number[] = [];
    for (const r of results) {
      if (!collectedIds.has(r.id) && ids.length < batch.count) {
        collectedIds.add(r.id);
        ids.push(r.id);
      }
    }
    batchIds.set(batch.label, ids);
    console.log(`   → Found ${ids.length} unique IDs`);
  }

  const allIds = Array.from(collectedIds);
  console.log(`\n📋 Total unique recipe IDs collected: ${allIds.length}\n`);

  // Fetch details + insert one by one with rate limiting
  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < allIds.length; i++) {
    const id = allIds[i];
    try {
      const detail = await fetchRecipeDetail(id);
      await sleep(250); // ~4 requests/sec to stay under rate limit

      const row = toSavedRecipe(detail);

      // Skip recipes with prep_time <= 0 (constraint check)
      if (!row.prep_time || row.prep_time <= 0) {
        row.prep_time = 15; // default fallback
      }

      const { error } = await supabase
        .from("saved_recipes")
        .upsert(row, { onConflict: "spoonacular_id" });

      if (error) {
        console.error(`   ❌ Insert failed for "${detail.title}": ${error.message}`);
        failed++;
      } else {
        inserted++;
      }
    } catch (err: any) {
      console.error(`   ❌ Error for ID ${id}: ${err.message}`);
      failed++;
      // If rate limited, wait longer
      if (err.message?.includes("402") || err.message?.includes("429")) {
        console.log("   ⏳ Rate limited — waiting 60s...");
        await sleep(60_000);
      }
    }

    // Log progress every 10 recipes
    const total = i + 1;
    if (total % 10 === 0 || total === allIds.length) {
      console.log(
        `📊 Progress: ${total}/${allIds.length} processed (${inserted} inserted, ${skipped} skipped, ${failed} failed)`,
      );
    }
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped:  ${skipped}`);
  console.log(`   Failed:   ${failed}`);
}

seed().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
