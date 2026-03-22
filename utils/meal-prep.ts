import type { GeneratedMeal } from "@/types/meal-plan";

/**
 * Determines if a generated meal (from a meal plan) is meal-prep friendly.
 * Criteria: not breakfast, prep time < 60 min, and has enough calories to be a proper meal.
 */
export function isMealPrepFriendly(meal: GeneratedMeal): boolean {
  if (meal.slot === "breakfast") return false;
  if (meal.prep_time_minutes > 0 && meal.prep_time_minutes >= 60) return false;
  if (meal.calories > 0 && meal.calories < 200) return false;
  return true;
}

/**
 * Determines if a catalog recipe is meal-prep friendly.
 * Criteria: servings >= 4, prep time < 60 min.
 */
export function isMealPrepFriendlyRecipe(recipe: {
  prep_time?: number | null;
  servings?: number | null;
}): boolean {
  if (recipe.servings != null && recipe.servings < 4) return false;
  if (recipe.prep_time != null && recipe.prep_time >= 60) return false;
  return true;
}
