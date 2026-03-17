// hooks/useUserPlan.ts
import { useQuery } from "@tanstack/react-query";

export function useUserPlan() {
    return useQuery({
        queryKey: ["user-plan"],
        queryFn: async () => {
            const res = await fetch("/api/user/plan");

            if (!res.ok) throw new Error("Failed to fetch user plan");

            return res.json();
        },
    });
}