"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { Spinner } from "@heroui/react";
import { RecipeCard } from "@/components/recipes/recipe-card";

export default function FavoritesPage() {

  const { data, isLoading } = useFavorites();

  if (isLoading)
    return (
      <div className="flex justify-center mt-10">
        <Spinner size="lg" />
      </div>
    );

  if (!data?.length)
    return <p className="text-center py-12">Vous n'avez pas encore de favoris.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} isFavorite={true} onFavoriteToggle={() => { }} />
      ))}
    </div>
  );
}
