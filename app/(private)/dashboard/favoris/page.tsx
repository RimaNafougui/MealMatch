"use client";

import { Spinner } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { Heart } from "lucide-react";
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
        favoriteToggle.mutate(true);
      }}
    />
  );
}

export default function FavoritesPage() {
  const { data: favorites, isLoading } = useFavorites();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mes Favoris</h1>
        <p className="text-default-500 mt-1 text-sm">
          Les recettes que vous avez ajoutées à vos favoris.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !favorites?.length ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Card className="p-8 border border-dashed border-divider bg-content2 max-w-sm w-full">
            <CardBody className="flex flex-col items-center gap-4">
              <Heart size={48} className="text-default-300" />
              <div>
                <p className="font-semibold text-lg">Aucun favori</p>
                <p className="text-default-400 text-sm mt-1">
                  Explorez les recettes et ajoutez vos préférées ici.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((recipe: any) => (
            <FavoritesRecipeItem key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
