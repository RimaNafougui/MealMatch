"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Link } from "@heroui/link";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { useFavoriteToggle } from "@/hooks/useFavoritesToggle";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";
import { Search, BookOpen, Utensils, Trash2 } from "lucide-react";

interface SavedRecipe {
  savedId: string;
  id: string;
  title: string;
  image_url?: string | null;
  prep_time?: number | null;
  servings?: number | null;
  calories?: number | null;
  price_per_serving?: number | null;
  dietary_tags?: string[] | null;
  notes?: string | null;
  timesCooked?: number;
  savedAt: string;
}

function RecipeSkeletonCard() {
  return (
    <Card className="w-full">
      <Skeleton className="aspect-video rounded-t-xl" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

function SavedRecipeItem({
  recipe,
  favoriteIds,
  onUnsave,
}: {
  recipe: SavedRecipe;
  favoriteIds: Set<string>;
  onUnsave: (recipeId: string) => void;
}) {
  const favoriteToggle = useFavoriteToggle(recipe.id);
  const isFavorite = favoriteIds.has(recipe.id);

  return (
    <div className="relative group">
      <RecipeCard
        recipe={recipe}
        isFavorite={isFavorite}
        onFavoriteToggle={() => favoriteToggle.mutate(isFavorite)}
      />
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        color="danger"
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onPress={() => onUnsave(recipe.id)}
        title="Retirer des recettes sauvegardées"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}

export default function RecettesPage() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { data: favorites } = useFavorites();

  const favoriteIds = new Set<string>(
    (favorites ?? []).map((r: any) => r?.id).filter(Boolean)
  );

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/saved-recipes");
      if (!res.ok) throw new Error();
      const { recipes: data } = await res.json();
      setRecipes(data ?? []);
    } catch {
      toast.error("Impossible de charger vos recettes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  async function handleUnsave(recipeId: string) {
    try {
      const res = await fetch("/api/saved-recipes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (!res.ok) throw new Error();
      setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      toast.success("Recette retirée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mes Recettes</h1>
          <p className="text-default-500 mt-1 text-sm">
            Les recettes que vous avez sauvegardées.
          </p>
        </div>
        {!loading && recipes.length > 0 && (
          <Chip color="success" variant="flat" size="sm">
            {recipes.length} recette{recipes.length > 1 ? "s" : ""}
          </Chip>
        )}
      </div>

      {/* Search */}
      {(loading || recipes.length > 0) && (
        <Input
          placeholder="Rechercher une recette..."
          value={search}
          onValueChange={setSearch}
          startContent={<Search size={16} className="text-default-400" />}
          variant="flat"
          className="max-w-sm"
        />
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeSkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 && search ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Search size={40} className="text-default-300" />
          <p className="text-default-500 font-medium">
            Aucun résultat pour &quot;{search}&quot;
          </p>
          <Button size="sm" variant="flat" onPress={() => setSearch("")}>
            Réinitialiser la recherche
          </Button>
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Card className="p-8 border border-dashed border-divider bg-content2 max-w-sm w-full">
            <CardBody className="flex flex-col items-center gap-4">
              <Utensils size={48} className="text-default-300" />
              <div>
                <p className="font-semibold text-lg">
                  Aucune recette sauvegardée
                </p>
                <p className="text-default-400 text-sm mt-1">
                  Explorez le catalogue et sauvegardez vos recettes préférées.
                </p>
              </div>
              <Button
                as={Link}
                href="/explore"
                color="success"
                variant="flat"
                startContent={<BookOpen size={16} />}
                className="font-semibold"
              >
                Explorer les recettes
              </Button>
            </CardBody>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe) => (
            <SavedRecipeItem
              key={recipe.savedId}
              recipe={recipe}
              favoriteIds={favoriteIds}
              onUnsave={handleUnsave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
