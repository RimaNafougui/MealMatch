import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/hooks/queryKeys";
import type { ShoppingList, UpdateShoppingListItemPayload } from "@/types";

export function useShoppingList(mealPlanId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.shoppingLists.byMealPlan(mealPlanId!),
    queryFn: () =>
      apiFetch<ShoppingList>(
        `/api/shopping-lists?mealPlanId=${mealPlanId}`,
      ),
    enabled: !!mealPlanId,
  });
}

export function useToggleShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateShoppingListItemPayload) =>
      apiFetch<ShoppingList>(`/api/shopping-lists/${payload.listId}/items`, {
        method: "PATCH",
        body: JSON.stringify({
          itemIndex: payload.itemIndex,
          checked: payload.checked,
        }),
      }),
    onSuccess: (updatedList) => {
      if (updatedList.meal_plan_id) {
        queryClient.setQueryData(
          queryKeys.shoppingLists.byMealPlan(updatedList.meal_plan_id),
          updatedList,
        );
      }
      queryClient.setQueryData(
        queryKeys.shoppingLists.detail(updatedList.id),
        updatedList,
      );
    },
  });
}
