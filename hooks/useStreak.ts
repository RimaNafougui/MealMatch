import { useQuery } from "@tanstack/react-query";

interface StreakData {
  streak: number;
  lastPlanned: string | null;
}

export function useStreak() {
  return useQuery<StreakData>({
    queryKey: ["streak"],
    queryFn: async () => {
      const res = await fetch("/api/user/streak");
      if (!res.ok) throw new Error("Failed to fetch streak");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
