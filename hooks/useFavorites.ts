import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { useCurrentUser } from "./useCurrentUser";
import { use } from "react";

export function useFavorites() {
  const user = useCurrentUser();

  return useQuery({
    queryKey: ["favorites", use],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_favorites")
        .select("recipe_catalog(*)")
        .eq("user_id", user.id);

      if (error) throw error;

      return data?.map((item: any) => item.recipe_catalog) ?? [];
    },
    enabled: !!user?.id,
  });
}
