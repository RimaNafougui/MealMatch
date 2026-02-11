import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/hooks/queryKeys";
import type {
  MealPlan,
  CreateMealPlanPayload,
  UpdateMealPlanPayload,
} from "@/types";

export function useMealPlans() {
  return useQuery({
    queryKey: queryKeys.mealPlans.list(),
    queryFn: () => apiFetch<MealPlan[]>("/api/meal-plans"),
  });
}

export function useMealPlanDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.mealPlans.detail(id!),
    queryFn: () => apiFetch<MealPlan>(`/api/meal-plans/${id}`),
    enabled: !!id,
  });
}

export function useCreateMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMealPlanPayload) =>
      apiFetch<MealPlan>("/api/meal-plans", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.all });
    },
  });
}

export function useUpdateMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateMealPlanPayload) =>
      apiFetch<MealPlan>(`/api/meal-plans/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.mealPlans.list(),
      });
      queryClient.setQueryData(queryKeys.mealPlans.detail(data.id), data);
    },
  });
}

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/meal-plans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingLists.all,
      });
    },
  });
}
