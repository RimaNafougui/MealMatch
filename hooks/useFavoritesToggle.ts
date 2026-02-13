import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useFavoriteToggle(
    recipeId: string,
    isFavorite: boolean
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/favorites", {
                method: isFavorite ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipeId }),
            });

            if (!res.ok) throw new Error("Failed");
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });

            toast.success(
                isFavorite
                    ? "Removed from favorites"
                    : "Added to favorites"
            );
        },

        onError: () => {
            toast.error("Something went wrong");
        },
    });
}
