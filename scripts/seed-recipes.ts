import { createClient } from "@supabase/supabase-js";

// Config

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SPOONACULAR_BASE = "https://api.spoonacular.com";

// Collect all available keys from environment variables
const API_KEYS = [
  process.env.SPOONACULAR_API_KEY,
  process.env.SPOONACULAR_API_KEY_2,
  process.env.SPOONACULAR_API_KEY_3,
].filter((key): key is string => !!key && key.length > 0);

const TARGET_COUNT_PER_KEY = 40;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Types

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

// Matches your "recipes_catalog" table schema
interface RecipeCatalogItem {
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

// Helpers
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getNutrient(
  nutrients: { name: string; amount: number }[] | undefined,
  name: string,
): number | null {
  if (!nutrients) return null;
  const n = nutrients.find((x) => x.name.toLowerCase() === name.toLowerCase());
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

function toRecipeCatalogItem(
  detail: SpoonacularRecipeDetail,
): RecipeCatalogItem {
  const nutrients = detail.nutrition?.nutrients;

  let prepTime = detail.readyInMinutes;
  if (!prepTime || prepTime <= 0) {
    prepTime = 15;
  }

  return {
    spoonacular_id: detail.id,
    title: detail.title,
    image_url: detail.image || null,
    prep_time: prepTime,
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

// API Logic

async function getRandomRecipes(
  apiKey: string,
  number: number,
): Promise<SpoonacularRecipeDetail[]> {
  const params = new URLSearchParams({
    apiKey: apiKey,
    number: String(number),
    includeNutrition: "true",
    limitLicense: "true",
  });

  const url = `${SPOONACULAR_BASE}/recipes/random?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Random fetch failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.recipes as SpoonacularRecipeDetail[];
}

async function runBatch(apiKey: string, batchIndex: number) {
  const keySnippet = apiKey.slice(0, 4) + "...";
  console.log(
    `\n--- Starting Batch ${batchIndex + 1} (Key: ${keySnippet}) ---`,
  );
  console.log(`Target: ${TARGET_COUNT_PER_KEY} recipes for this key.`);

  let totalFetched = 0;
  let inserted = 0;
  let failed = 0;

  while (totalFetched < TARGET_COUNT_PER_KEY) {
    const remaining = TARGET_COUNT_PER_KEY - totalFetched;
    const requestSize = Math.min(remaining, 100);

    console.log(
      `Fetching ${requestSize} recipes (Progress: ${totalFetched}/${TARGET_COUNT_PER_KEY})...`,
    );

    try {
      const recipes = await getRandomRecipes(apiKey, requestSize);

      if (!recipes || recipes.length === 0) {
        console.log("API returned no recipes. Stopping this batch.");
        break;
      }

      for (const detail of recipes) {
        try {
          const row = toRecipeCatalogItem(detail);

          const { error } = await supabase
            .from("recipes_catalog")
            .upsert(row, { onConflict: "spoonacular_id" });

          if (error) {
            console.error(`DB Error (${detail.title}): ${error.message}`);
            failed++;
          } else {
            inserted++;
          }
        } catch (err: any) {
          console.error(`Processing Error: ${err.message}`);
          failed++;
        }
      }

      totalFetched += recipes.length;

      if (totalFetched < TARGET_COUNT_PER_KEY) {
        await sleep(1000);
      }
    } catch (err: any) {
      console.error(`Batch execution failed: ${err.message}`);
      break;
    }
  }

  console.log(`\nBatch ${batchIndex + 1} complete!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Failed:   ${failed}`);
}

// Main Execution Loop
async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing Supabase env vars.");
    process.exit(1);
  }

  if (API_KEYS.length === 0) {
    console.error("No Spoonacular API keys found in env vars.");
    console.error(
      "Please set SPOONACULAR_API_KEY, SPOONACULAR_API_KEY_2, etc.",
    );
    process.exit(1);
  }

  console.log(`Starting multi-key seed with ${API_KEYS.length} keys found.`);

  for (let i = 0; i < API_KEYS.length; i++) {
    await runBatch(API_KEYS[i], i);
    if (i < API_KEYS.length - 1) {
      console.log("Switching keys in 2 seconds...");
      await sleep(2000);
    }
  }

  console.log("\nAll seed batches finished.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
