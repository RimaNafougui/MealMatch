"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Tabs, Tab } from "@heroui/tabs";
import { Link } from "@heroui/link";
import { useDisclosure } from "@heroui/use-disclosure";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { AddRecipeModal } from "@/components/recipes/AddRecipeModal";
import { useFavoriteToggle } from "@/hooks/useFavoritesToggle";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";
import {
  Search,
  BookOpen,
  Utensils,
  Trash2,
  Plus,
  ChefHat,
  Pencil,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Saved recipe card ────────────────────────────────────────────────────────

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
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        color="default"
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onPress={() => onEdit(recipe)}
        title="Modifier la recette"
      >
        <Pencil size={14} />
      </Button>
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        color="danger"
        className="absolute top-2 left-10 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onPress={() => onDelete(recipe.id)}
        title="Supprimer la recette"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <Card className="p-8 border border-dashed border-divider bg-content2 max-w-sm w-full">
        <CardBody className="flex flex-col items-center gap-4">
          {icon}
          <div>
            <p className="font-semibold text-lg">{title}</p>
            <p className="text-default-400 text-sm mt-1">{subtitle}</p>
          </div>
          {action}
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RecettesPage() {
  const [activeTab, setActiveTab] = useState("saved");

  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);

  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [hasFetchedUser, setHasFetchedUser] = useState(false);

  const [search, setSearch] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editRecipe, setEditRecipe] = useState<UserRecipe | null>(null);

  const { data: favorites } = useFavorites();
  const favoriteIds = new Set<string>(
    (favorites ?? []).map((r: UserRecipe) => r?.id).filter(Boolean),
  );

  // ─── Fetchers ─────────────────────────────────────────────────────────────

  const fetchSaved = useCallback(async () => {
    setSavedLoading(true);
    try {
      const res = await fetch("/api/saved-recipes");
      if (!res.ok) throw new Error();
      const { recipes: data } = await res.json();
      setSavedRecipes(data ?? []);
    } catch {
      toast.error("Impossible de charger vos recettes sauvegardées");
    } finally {
      setSavedLoading(false);
    }
  }, []);

  const fetchUserRecipes = useCallback(async () => {
    setUserLoading(true);
    try {
      const res = await fetch("/api/recipes/user");
      if (!res.ok) throw new Error();
      const { recipes: data } = await res.json();
      setUserRecipes(data ?? []);
    } catch {
      toast.error("Impossible de charger vos recettes");
    } finally {
      setUserLoading(false);
      setHasFetchedUser(true);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  useEffect(() => {
    if (activeTab === "mine" && !hasFetchedUser) {
      fetchUserRecipes();
    }
  }, [activeTab, hasFetchedUser, fetchUserRecipes]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  async function handleUnsave(recipeId: string) {
    try {
      const res = await fetch("/api/saved-recipes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (!res.ok) throw new Error();
      setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      toast.success("Recette retirée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  async function handleDeleteUserRecipe(id: string) {
    try {
      const res = await fetch(`/api/recipes/user/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setUserRecipes((prev) => prev.filter((r) => r.id !== id));
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
      setUserRecipes((prev) => prev.map((x) => (x.id === r.id ? r : x)));
    } else {
      setUserRecipes((prev) => [r, ...prev]);
      setActiveTab("mine");
      if (!hasFetchedUser) setHasFetchedUser(true);
    }
  }

  // ─── Filtered lists ───────────────────────────────────────────────────────

  const filteredSaved = savedRecipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredUser = userRecipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mes Recettes</h1>
          <p className="text-default-500 mt-1 text-sm">
            Vos recettes sauvegardées et celles que vous avez créées.
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

      {/* Tabs */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(k) => {
          setActiveTab(k as string);
          setSearch("");
        }}
        color="success"
        variant="underlined"
        classNames={{ tabList: "border-b border-divider" }}
      >
        {/* ── Sauvegardées ── */}
        <Tab
          key="saved"
          title={
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <BookOpen size={15} />
              Sauvegardées
              {!savedLoading && savedRecipes.length > 0 && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="success"
                  className="h-4 text-[10px] px-1 min-w-0"
                >
                  {savedRecipes.length}
                </Chip>
              )}
            </span>
          }
        >
          {(savedLoading || savedRecipes.length > 0) && (
            <div className="mt-4">
              <Input
                placeholder="Rechercher une recette..."
                value={search}
                onValueChange={setSearch}
                startContent={<Search size={16} className="text-default-400" />}
                variant="flat"
                className="max-w-sm"
              />
            </div>
          )}
          <div className="mt-4">
            {savedLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <RecipeSkeletonCard key={i} />
                ))}
              </div>
            ) : filteredSaved.length === 0 && search ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <Search size={40} className="text-default-300" />
                <p className="text-default-500 font-medium">
                  Aucun résultat pour &quot;{search}&quot;
                </p>
                <Button size="sm" variant="flat" onPress={() => setSearch("")}>
                  Réinitialiser
                </Button>
              </div>
            ) : savedRecipes.length === 0 ? (
              <EmptyState
                icon={<Utensils size={48} className="text-default-300" />}
                title="Aucune recette sauvegardée"
                subtitle="Explorez le catalogue et sauvegardez vos recettes préférées."
                action={
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
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSaved.map((recipe) => (
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
        </Tab>

        {/* ── Mes créations ── */}
        <Tab
          key="mine"
          title={
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <ChefHat size={15} />
              Mes créations
              {!userLoading && userRecipes.length > 0 && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="success"
                  className="h-4 text-[10px] px-1 min-w-0"
                >
                  {userRecipes.length}
                </Chip>
              )}
            </span>
          }
        >
          {(userLoading || userRecipes.length > 0) && (
            <div className="mt-4">
              <Input
                placeholder="Rechercher une recette..."
                value={search}
                onValueChange={setSearch}
                startContent={<Search size={16} className="text-default-400" />}
                variant="flat"
                className="max-w-sm"
              />
            </div>
          )}
          <div className="mt-4">
            {userLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <RecipeSkeletonCard key={i} />
                ))}
              </div>
            ) : filteredUser.length === 0 && search ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <Search size={40} className="text-default-300" />
                <p className="text-default-500 font-medium">
                  Aucun résultat pour &quot;{search}&quot;
                </p>
                <Button size="sm" variant="flat" onPress={() => setSearch("")}>
                  Réinitialiser
                </Button>
              </div>
            ) : userRecipes.length === 0 ? (
              <EmptyState
                icon={<ChefHat size={48} className="text-default-300" />}
                title="Aucune recette créée"
                subtitle="Partagez vos recettes maison avec vos plans de repas."
                action={
                  <Button
                    color="success"
                    variant="flat"
                    startContent={<Plus size={16} />}
                    onPress={handleOpenAdd}
                    className="font-semibold"
                  >
                    Créer une recette
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUser.map((recipe) => (
                  <UserRecipeItem
                    key={recipe.id}
                    recipe={recipe}
                    favoriteIds={favoriteIds}
                    onDelete={handleDeleteUserRecipe}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </div>
        </Tab>
      </Tabs>

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
