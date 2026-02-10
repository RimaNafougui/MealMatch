import type { RecipeFilters } from "@/types";

export const queryKeys = {
  recipes: {
    all: ["recipes"] as const,
    list: (filters?: RecipeFilters) =>
      ["recipes", "list", filters ?? {}] as const,
    detail: (id: string) => ["recipes", "detail", id] as const,
  },
  favorites: {
    all: ["favorites"] as const,
    list: () => ["favorites", "list"] as const,
  },
  mealPlans: {
    all: ["mealPlans"] as const,
    list: () => ["mealPlans", "list"] as const,
    detail: (id: string) => ["mealPlans", "detail", id] as const,
  },
  shoppingLists: {
    all: ["shoppingLists"] as const,
    byMealPlan: (mealPlanId: string) =>
      ["shoppingLists", "byMealPlan", mealPlanId] as const,
    detail: (id: string) => ["shoppingLists", "detail", id] as const,
  },
};
