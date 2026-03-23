"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { useDisclosure } from "@heroui/use-disclosure";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { AddRecipeModal } from "@/components/recipes/AddRecipeModal";
import { useFavoriteToggle } from "@/hooks/useFavoritesToggle";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";
import {
  Search,
  Utensils,
  Trash2,
  Plus,
  ChefHat,
  Pencil,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRecipe {
  id: string;
  title: string;
  image_url?: string | null;
  prep_time?: number | null;
  servings?: number | null;
  calories?: number | null;
  price_per_serving?: number | null;
  dietary_tags?: string[] | null;
  ingredients?: unknown[];
  instructions?: unknown[];
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  is_user_created: boolean;
  created_by: string;
  created_at: string;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

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

// ─── User recipe card ─────────────────────────────────────────────────────────

function UserRecipeItem({
  recipe,
  favoriteIds,
  onDelete,
  onEdit,
}: {
  recipe: UserRecipe;
  favoriteIds: Set<string>;
  onDelete: (id: string) => void;
  onEdit: (recipe: UserRecipe) => void;
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
      <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          color="default"
          onPress={() => onEdit(recipe)}
          title="Modifier la recette"
          className="bg-white/90 dark:bg-black/70"
        >
          <Pencil size={14} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          color="danger"
          onPress={() => onDelete(recipe.id)}
          title="Supprimer la recette"
          className="bg-white/90 dark:bg-black/70"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RecettesPage() {
  const [recipes, setRecipes] = useState<UserRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editRecipe, setEditRecipe] = useState<UserRecipe | null>(null);

  const { data: favorites } = useFavorites();
  const favoriteIds = new Set<string>(
    (favorites ?? []).map((r: UserRecipe) => r?.id).filter(Boolean),
  );

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/recipes/user");
      if (!res.ok) throw new Error();
      const { recipes: data } = await res.json();
      setRecipes(data ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // ─── Actions ────────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/recipes/user/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Recette supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  function handleEdit(recipe: UserRecipe) {
    setEditRecipe(recipe);
    onOpen();
  }

  function handleOpenAdd() {
    setEditRecipe(null);
    onOpen();
  }

  function handleRecipeCreated(recipe: Record<string, unknown>) {
    const r = recipe as unknown as UserRecipe;
    if (editRecipe) {
      setRecipes((prev) => prev.map((x) => (x.id === r.id ? r : x)));
      toast.success("Recette mise à jour");
    } else {
      setRecipes((prev) => [r, ...prev]);
    }
  }

  // ─── Filtered list ──────────────────────────────────────────────────────────

  const filtered = useMemo(
    () =>
      recipes.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [recipes, search],
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Utensils size={28} className="text-warning" />
            Mes Recettes
          </h1>
          <p className="text-default-500 mt-1 text-sm">
            Vos recettes personnelles — créez, modifiez et retrouvez‑les dans vos plans de repas.
          </p>
        </div>
        <Button
          color="success"
          startContent={<Plus size={16} />}
          onPress={handleOpenAdd}
          className="font-semibold text-white shrink-0"
        >
          Ajouter une recette
        </Button>
      </div>

      {/* Search — only when there are recipes or while loading */}
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

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeSkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Card className="p-8 border border-warning/30 bg-warning/5 max-w-sm w-full">
            <CardBody className="flex flex-col items-center gap-4">
              <AlertTriangle size={48} className="text-warning" />
              <div>
                <p className="font-semibold text-lg">Erreur de chargement</p>
                <p className="text-default-400 text-sm mt-1">
                  Impossible de charger les recettes. Vérifiez votre connexion.
                </p>
              </div>
              <Button
                color="warning"
                variant="flat"
                startContent={<RefreshCw size={16} />}
                onPress={fetchRecipes}
                className="font-semibold"
              >
                Réessayer
              </Button>
            </CardBody>
          </Card>
        </div>
      ) : filtered.length === 0 && search ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Search size={40} className="text-default-300" />
          <p className="text-default-500 font-medium">
            Aucun résultat pour &quot;{search}&quot;
          </p>
          <Button size="sm" variant="flat" onPress={() => setSearch("")}>
            Réinitialiser
          </Button>
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Card className="p-8 border border-dashed border-divider bg-content2 max-w-sm w-full">
            <CardBody className="flex flex-col items-center gap-4">
              <ChefHat size={48} className="text-default-300" />
              <div>
                <p className="font-semibold text-lg">Aucune recette créée</p>
                <p className="text-default-400 text-sm mt-1">
                  Partagez vos recettes maison et retrouvez‑les dans vos plans de repas.
                </p>
              </div>
              <Button
                color="success"
                variant="flat"
                startContent={<Plus size={16} />}
                onPress={handleOpenAdd}
                className="font-semibold"
              >
                Créer ma première recette
              </Button>
            </CardBody>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe) => (
            <UserRecipeItem
              key={recipe.id}
              recipe={recipe}
              favoriteIds={favoriteIds}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AddRecipeModal
        isOpen={isOpen}
        onClose={onClose}
        onCreated={handleRecipeCreated}
        editRecipe={editRecipe as Record<string, unknown> | null}
      />
    </div>
  );
}
