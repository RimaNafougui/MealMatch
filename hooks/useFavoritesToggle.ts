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
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
            if (wasFavorite) {
                toast.success("Retiré des favoris", {
                    action: {
                        label: "Annuler",
                        onClick: () => {
                            fetch("/api/favorites", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ recipeId }),
                            }).then(() => {
                                queryClient.invalidateQueries({ queryKey: ["favorites"] });
                                queryClient.invalidateQueries({ queryKey: ["recipes"] });
                            });
                        },
                    },
                });
            } else {
                toast.success("Ajouté aux favoris");
            }
        },

        onError: () => {
            toast.error("Une erreur est survenue");
        },
    });
}
