import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/hooks/queryKeys";
import type { Recipe, RecipeFilters, PaginatedResponse } from "@/types";

export function useRecipes(filters?: RecipeFilters) {
  return useQuery({
    queryKey: queryKeys.recipes.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();

      if (filters?.query) params.set("query", filters.query);
      if (filters?.dietaryTags?.length)
        params.set("dietaryTags", filters.dietaryTags.join(","));
      if (filters?.maxPrepTime != null)
        params.set("maxPrepTime", String(filters.maxPrepTime));
      if (filters?.minCalories != null)
        params.set("minCalories", String(filters.minCalories));
      if (filters?.maxCalories != null)
        params.set("maxCalories", String(filters.maxCalories));
      if (filters?.maxPrice != null)
        params.set("maxPrice", String(filters.maxPrice));
      if (filters?.page != null) params.set("page", String(filters.page));
      if (filters?.limit != null) params.set("limit", String(filters.limit));

      const qs = params.toString();
      return apiFetch<PaginatedResponse<Recipe>>(
        `/api/recipes${qs ? `?${qs}` : ""}`,
      );
    },
  });
}
