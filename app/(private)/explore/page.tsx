"use client";

import { useState, useEffect } from "react";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import { Search, Filter, X, Leaf } from "lucide-react";
import {
  RecipeCard,
  RecipeCardSkeleton,
} from "@/components/recipes/recipe-card";
import { useFavoriteToggle } from "@/hooks/useFavoritesToggle";

interface Recipe {
  id: string;
  spoonacular_id?: number | null;
  title: string;
  image_url?: string | null;
  prep_time?: number | null;
  servings?: number | null;
  calories?: number | null;
  price_per_serving?: number | null;
  dietary_tags?: string[] | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const dietaryOptions = [
  { value: "vegetarian", label: "Végétarien" },
  { value: "vegan", label: "Végan" },
  { value: "gluten_free", label: "Sans Gluten" },
  { value: "dairy_free", label: "Sans Lactose" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Casher" },
];

const prepTimeOptions = [
  { value: "15", label: "< 15 min" },
  { value: "30", label: "< 30 min" },
  { value: "45", label: "< 45 min" },
  { value: "60", label: "< 1 heure" },
];

const calorieOptions = [
  { value: "300", label: "< 300 cal" },
  { value: "500", label: "< 500 cal" },
  { value: "700", label: "< 700 cal" },
];

// 1. Create a sub-component to handle the hook logic for each recipe
const RecipeItem = ({
  recipe,
  isFav,
  onToggle,
}: {
  recipe: Recipe;
  isFav: boolean;
  onToggle: (id: string) => void;
}) => {
  // Hook is now called at the top level of this child component
  const favoriteToggle = useFavoriteToggle(recipe.id, isFav);

  return (
    <RecipeCard
      recipe={recipe}
      isFavorite={isFav}
      onFavoriteToggle={() => {
        favoriteToggle.mutate();
        onToggle(recipe.id);
      }}
    />
  );
};

export default function ExplorePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [maxPrepTime, setMaxPrepTime] = useState<string>("");
  const [maxCalories, setMaxCalories] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);
      if (selectedDietaryTags.length > 0)
        params.append("dietary_tags", selectedDietaryTags.join(","));
      if (maxPrepTime) params.append("max_prep_time", maxPrepTime);
      if (maxCalories) params.append("max_calories", maxCalories);
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      const res = await fetch(`/api/recipes/catalog?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setRecipes(data.recipes);
        setPagination(data.pagination);
      } else {
        console.error("Failed to fetch recipes:", data.error);
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [
    searchQuery,
    selectedDietaryTags,
    maxPrepTime,
    maxCalories,
    pagination.page,
  ]);

  const toggleFavoriteLocal = (recipeId: string) => {
    setFavorites((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDietaryTags([]);
    setMaxPrepTime("");
    setMaxCalories("");
    setPagination({ ...pagination, page: 1 });
  };

  const hasActiveFilters =
    searchQuery || selectedDietaryTags.length > 0 || maxPrepTime || maxCalories;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Leaf className="text-success" size={32} />
              Explorer les Recettes
            </h1>
            <p className="text-default-500 mt-1">
              Découvrez {pagination.total} recettes adaptées à votre budget
            </p>
          </div>

          <Button
            variant={showFilters ? "flat" : "light"}
            color={showFilters ? "success" : "default"}
            startContent={<Filter size={18} />}
            onPress={() => setShowFilters(!showFilters)}
            className="hidden sm:flex"
          >
            Filtres
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <Input
            placeholder="Rechercher une recette..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
            startContent={<Search size={18} className="text-default-400" />}
            classNames={{
              inputWrapper:
                "bg-default-100 border border-divider hover:border-success/50 transition-colors",
            }}
            size="lg"
          />

          <Button
            isIconOnly
            variant="flat"
            color="success"
            size="lg"
            className="sm:hidden"
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardBody className="gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filtres</h3>
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  startContent={<X size={16} />}
                  onPress={clearFilters}
                >
                  Effacer
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-default-700">
                  Restrictions alimentaires
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <Chip
                      key={option.value}
                      variant={
                        selectedDietaryTags.includes(option.value)
                          ? "solid"
                          : "bordered"
                      }
                      color={
                        selectedDietaryTags.includes(option.value)
                          ? "success"
                          : "default"
                      }
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedDietaryTags((prev) =>
                          prev.includes(option.value)
                            ? prev.filter((tag) => tag !== option.value)
                            : [...prev, option.value],
                        );
                        setPagination({ ...pagination, page: 1 });
                      }}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <Select
                label="Temps de préparation"
                placeholder="Sélectionner"
                selectedKeys={maxPrepTime ? [maxPrepTime] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setMaxPrepTime(value || "");
                  setPagination({ ...pagination, page: 1 });
                }}
                variant="bordered"
              >
                {prepTimeOptions.map((option) => (
                  <SelectItem key={option.value} textValue={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Calories"
                placeholder="Sélectionner"
                selectedKeys={maxCalories ? [maxCalories] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setMaxCalories(value || "");
                  setPagination({ ...pagination, page: 1 });
                }}
                variant="bordered"
              >
                {calorieOptions.map((option) => (
                  <SelectItem key={option.value} textValue={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </CardBody>
        </Card>
      )}

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-default-500">Filtres actifs:</span>
          {selectedDietaryTags.map((tag) => (
            <Chip
              key={tag}
              size="sm"
              variant="flat"
              color="success"
              onClose={() => {
                setSelectedDietaryTags((prev) => prev.filter((t) => t !== tag));
                setPagination({ ...pagination, page: 1 });
              }}
            >
              {dietaryOptions.find((opt) => opt.value === tag)?.label}
            </Chip>
          ))}
          {maxPrepTime && (
            <Chip
              size="sm"
              variant="flat"
              color="success"
              onClose={() => {
                setMaxPrepTime("");
                setPagination({ ...pagination, page: 1 });
              }}
            >
              {prepTimeOptions.find((opt) => opt.value === maxPrepTime)?.label}
            </Chip>
          )}
          {maxCalories && (
            <Chip
              size="sm"
              variant="flat"
              color="success"
              onClose={() => {
                setMaxCalories("");
                setPagination({ ...pagination, page: 1 });
              }}
            >
              {calorieOptions.find((opt) => opt.value === maxCalories)?.label}
            </Chip>
          )}
        </div>
      )}

      {/* Recipe Grid */}
      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-default-500">
              Aucune recette trouvée. Essayez de modifier vos filtres.
            </p>
            {hasActiveFilters && (
              <Button
                color="success"
                variant="flat"
                className="mt-4"
                onPress={clearFilters}
              >
                Effacer les filtres
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {recipes.map((recipe) => (
            // 2. Use the new RecipeItem component here
            <RecipeItem
              key={recipe.id}
              recipe={recipe}
              isFav={favorites.includes(recipe.id)}
              onToggle={toggleFavoriteLocal}
            />
          ))}
        </div>
      )}

      {!loading && recipes.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            size="sm"
            variant="flat"
            isDisabled={pagination.page === 1}
            onPress={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
          >
            Précédent
          </Button>

          <span className="text-sm text-default-500">
            Page {pagination.page} sur {pagination.totalPages}
          </span>

          <Button
            size="sm"
            variant="flat"
            isDisabled={pagination.page === pagination.totalPages}
            onPress={() =>
              setPagination({ ...pagination, page: pagination.page + 1 })
            }
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
