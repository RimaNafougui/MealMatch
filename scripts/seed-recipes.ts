import { createClient } from "@supabase/supabase-js";

// Config

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SPOONACULAR_KEY = process.env.SPOONACULAR_API_KEY!;
const SPOONACULAR_BASE = "https://api.spoonacular.com";

const TARGET_COUNT = 40;

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
  number: number,
): Promise<SpoonacularRecipeDetail[]> {
  const params = new URLSearchParams({
    apiKey: SPOONACULAR_KEY,
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

// Main Seed Loop

async function seed() {
  console.log(
    `Starting seed for ${TARGET_COUNT} recipes into 'recipes_catalog'...`,
  );

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SPOONACULAR_KEY) {
    console.error("Missing env vars.");
    process.exit(1);
  }

  let totalFetched = 0;
  let inserted = 0;
  let failed = 0;

  while (totalFetched < TARGET_COUNT) {
    const remaining = TARGET_COUNT - totalFetched;
    const batchSize = Math.min(remaining, 100);

    console.log(
      `\nFetching batch of ${batchSize} (Progress: ${totalFetched}/${TARGET_COUNT})...`,
    );

    try {
      const recipes = await getRandomRecipes(batchSize);

      if (!recipes || recipes.length === 0) {
        console.log("API returned no recipes. Stopping.");
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

      if (totalFetched < TARGET_COUNT) {
        console.log("Pausing 2s before next batch...");
        await sleep(2000);
      }
    } catch (err: any) {
      console.error(`Batch failed: ${err.message}`);
      break;
    }
  }

  console.log(`\nSeed complete!`);
  console.log(`   Target:   ${TARGET_COUNT}`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Failed:   ${failed}`);
}

seed().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
