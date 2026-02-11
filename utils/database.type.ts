export interface Profile {
  username: string;
  profilePublic: boolean;
  id: string;
  email: string;
  name?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
  subscription_status: "free" | "premium";
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_period_end?: string;
}

// Global recipe catalog (seeded from Spoonacular)
export interface RecipeCatalog {
  id: string;
  spoonacular_id?: number;
  title: string;
  image_url?: string;
  prep_time?: number;
  servings: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  price_per_serving?: number;
  ingredients?: any; // JSONB
  instructions?: any; // JSONB
  dietary_tags?: string[];
  spoonacular_data?: any; // JSONB
  created_at: string;
  updated_at: string;
}

// User's saved recipes (references catalog)
export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_id: string; // References recipes_catalog
  notes?: string;
  custom_servings?: number;
  last_cooked_at?: string;
  times_cooked: number;
  created_at: string;
  updated_at: string;
}

// Combined view of user recipe with catalog details
export interface UserRecipeView {
  saved_recipe_id: string;
  user_id: string;
  recipe_id: string;
  spoonacular_id?: number;
  title: string;
  image_url?: string;
  prep_time?: number;
  servings: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  price_per_serving?: number;
  dietary_tags?: string[];
  notes?: string;
  custom_servings?: number;
  times_cooked: number;
  last_cooked_at?: string;
  saved_at: string;
  is_favorite: boolean;
}

export interface UserFavorite {
  user_id: string;
  recipe_id: string; // References recipes_catalog
  notes?: string;
  created_at: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  meals: any; // JSONB - structure: {monday: {breakfast: recipe_id, lunch:...}, ...}
  total_calories?: number;
  total_cost?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  meal_plan_id?: string;
  items: any; // JSONB - structure: [{name, quantity, unit, price, checked}]
  total_cost?: number;
  is_completed: boolean;
  created_at: string;
  completed_at?: string;
  updated_at: string;
}

export interface RecipeRating {
  user_id: string;
  recipe_id: string; // References recipes_catalog
  rating: number; // 1-5
  comment?: string;
  created_at: string;
}
