export type MealLabel = "breakfast" | "lunch" | "dinner" | "meal 1" | "meal 2";

export interface GeneratedMeal {
  slot: MealLabel;
  title: string;
  description: string;
  prep_time_minutes: number;
  calories: number;
  estimated_cost_usd: number;
  dietary_tags: string[];
  ingredients_summary: string;
  is_favorite: boolean;
  can_repeat?: boolean;
  spoonacular_search_query: string;
  image_url?: string;
  // Set after matching against catalog — enables "View Full Recipe" navigation
  recipe_catalog_id?: string;
  spoonacular_id?: number;
  // AI-generated meal enriched fields (present when source === "ai")
  source?: "catalog" | "user_recipe" | "ai";
  protein?: number;
  carbs?: number;
  fat?: number;
  instructions?: string[]; // step-by-step instructions in French
  // For catalog/user_recipe sourced meals, reference their ID
  user_recipe_id?: string;
}

export interface GeneratedDay {
  day: string;
  meals: GeneratedMeal[];
}

export interface GeneratedMealPlan {
  days: GeneratedDay[];
  total_estimated_cost: number;
  total_calories_per_day_avg: number;
}

export interface MealPlanConfig {
  days_count: 5 | 7;
  meals_per_day: 1 | 2 | 3;
}

export interface SavedMealPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  meals: GeneratedMealPlan;
  total_calories: number;
  total_cost: number;
  days_count: number;
  meals_per_day: number;
  meal_labels: string[];
  status: "draft" | "active";
  is_active: boolean;
  generated_at: string;
  created_at: string;
}
