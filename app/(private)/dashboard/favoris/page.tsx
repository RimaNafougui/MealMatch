"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { useFavoriteToggle } from "@/hooks/useFavoritesToggle";
import { Spinner, Card, CardBody } from "@heroui/react";
import { RecipeCard } from "@/components/recipes/recipe-card";

// Wrapper to handle mutation for each item
const FavoriteItem = ({ recipe }: { recipe: any }) => {
  // We know it's a favorite because it's on this page
  const { mutate } = useFavoriteToggle(recipe.id, true);

  return (
    <RecipeCard
      recipe={recipe}
      isFavorite={true}
      onFavoriteToggle={() => mutate()}
    />
  );
};

export default function FavoritesPage() {
  const { data, isLoading } = useFavorites();

  if (isLoading)
    return (
      <div className="flex justify-center mt-10">
        <Spinner size="lg" />
      </div>
    );

  if (!data?.length)
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-default-500">Vous n'avez pas encore de favoris.</p>
        </CardBody>
      </Card>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((recipe) => (
        <FavoriteItem key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
