import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { useCurrentUser } from "./useCurrentUser";

export function useFavorites() {
  const user = useCurrentUser();

  return useQuery({
    // FIX 1: Use 'user?.id' for the key, not the 'use' function
    queryKey: ["favorites", user?.id],

    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_favorites")
        // FIX 2: Use correct plural table name 'recipes_catalog'
        .select("recipes_catalog(*)")
        .eq("user_id", user.id);

      if (error) throw error;

      // FIX 3: Map the correct property name (plural)
      return data?.map((item: any) => item.recipes_catalog) ?? [];
    },
    enabled: !!user?.id,
  });
}
