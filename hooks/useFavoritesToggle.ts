import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useFavoriteToggle(recipeId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (wasFavorite: boolean) => {
            const res = await fetch("/api/favorites", {
                method: wasFavorite ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipeId }),
            });

            if (!res.ok) throw new Error("Failed");
        },

        onSuccess: (_data, wasFavorite) => {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });

            toast.success(
                wasFavorite
                    ? "Removed from favorites"
                    : "Added to favorites"
            );
        },

        onError: () => {
            toast.error("Something went wrong");
        },
    });
}
