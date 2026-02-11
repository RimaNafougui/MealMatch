import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/hooks/queryKeys";
import type { Recipe } from "@/types";

export function useRecipeDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.recipes.detail(id!),
    queryFn: () => apiFetch<Recipe>(`/api/recipes/${id}`),
    enabled: !!id,
  });
}
