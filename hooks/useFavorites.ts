import { useQuery } from "@tanstack/react-query";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");

      if (!res.ok) throw new Error("Failed to fetch favorites");

      return res.json();
    },
  });
}
