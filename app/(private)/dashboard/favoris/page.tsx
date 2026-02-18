"use client";

import { Spinner } from "@heroui/react";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { useFavorites } from "@/hooks/useFavorites";
import { useFavoriteToggle } from "@/hooks/useFavoritesToggle";

function FavoritesRecipeItem({ recipe }: { recipe: any }) {
  const favoriteToggle = useFavoriteToggle(recipe.id);

  return (
    <RecipeCard
      recipe={recipe}
      isFavorite={true}
      onFavoriteToggle={() => {
        favoriteToggle.mutate(true); // ← on passe "currently favorite"
      }}
    />
  );
}

export default function FavoritesPage() {
  const { data: favorites, isLoading } = useFavorites();

  if (isLoading)
    return (
      <div className="flex justify-center mt-10">
        <Spinner size="lg" />
      </div>
    );

  if (!favorites?.length)
    return (
      <p className="text-center py-12">
        Vous n'avez pas encore de favoris.
      </p>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {favorites.map((recipe: any) => (
        <FavoritesRecipeItem key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
