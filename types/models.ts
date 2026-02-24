export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface InstructionStep {
  step: number;
  description: string;
}

export interface Recipe {
  id: string;
  spoonacular_id: number | null;
  title: string;
  image_url: string | null;
  prep_time: number | null;
  servings: number;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  price_per_serving: number | null;
  ingredients: Ingredient[] | null;
  instructions: InstructionStep[] | null;
  dietary_tags: string[] | null;
  spoonacular_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  user_id: string;
  recipe_id: string;
  notes: string | null;
  created_at: string;
  recipe?: Recipe;
}

export interface MealSlot {
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
}

export type MealPlanMeals = Record<string, MealSlot>;

export interface MealPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  meals: MealPlanMeals;
  total_calories: number | null;
  total_cost: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  name: string;
  quantity: number;
  unit: string;
  price: number | null;
  checked: boolean;
  aisle?: string;
  category?: string;
  emoji?: string;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  meal_plan_id: string | null;
  items: ShoppingListItem[];
  total_cost: number | null;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface RecipeFilters {
  query?: string;
  dietaryTags?: string[];
  maxPrepTime?: number;
  minCalories?: number;
  maxCalories?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface ToggleFavoritePayload {
  recipeId: string;
}

export interface CreateMealPlanPayload {
  week_start_date: string;
  week_end_date: string;
  meals: MealPlanMeals;
}

export interface UpdateMealPlanPayload {
  id: string;
  meals?: MealPlanMeals;
  is_active?: boolean;
}

export interface UpdateShoppingListItemPayload {
  listId: string;
  itemIndex: number;
  checked: boolean;
}
