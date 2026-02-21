"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Card,
  CardBody,
  Chip,
  Tabs,
  Tab,
  Slider,
} from "@heroui/react";
import {
  Search,
  SlidersHorizontal,
  X,
  Leaf,
  Coffee,
  Cookie,
  UtensilsCrossed,
  ChefHat,
  Clock,
  Flame,
  DollarSign,
  Users,
} from "lucide-react";
import {
  RecipeCard,
  RecipeCardSkeleton,
} from "@/components/recipes/recipe-card";
import { useFavoriteToggle } from "@/hooks/useFavoritesToggle";
import { useFavorites } from "@/hooks/useFavorites";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Filter options ────────────────────────────────────────────────────────────

const DIETARY_OPTIONS = [
  { value: "gluten free", label: "Sans Gluten" },
  { value: "ketogenic", label: "Cétogène" },
  { value: "vegetarian", label: "Végétarien" },
  { value: "lacto ovo vegetarian", label: "Lacto-Ovo Végé." },
  { value: "vegan", label: "Végan" },
  { value: "pescetarian", label: "Pescétarien" },
  { value: "paleo", label: "Paléo" },
  { value: "primal", label: "Primal" },
  { value: "low fodmap", label: "Low FODMAP" },
  { value: "whole30", label: "Whole30" },
  { value: "dairy free", label: "Sans Lactose" },
];

const INTOLERANCE_OPTIONS = [
  { value: "dairy", label: "Lait" },
  { value: "egg", label: "Œuf" },
  { value: "gluten", label: "Gluten" },
  { value: "grain", label: "Céréales" },
  { value: "peanut", label: "Arachides" },
  { value: "seafood", label: "Fruits de mer" },
  { value: "sesame", label: "Sésame" },
  { value: "shellfish", label: "Crustacés" },
  { value: "soy", label: "Soja" },
  { value: "sulfite", label: "Sulfites" },
  { value: "tree nut", label: "Noix" },
  { value: "wheat", label: "Blé" },
];

const MEAL_TABS = [
  { key: "all", label: "Tous", icon: <Leaf size={16} /> },
  { key: "breakfast", label: "Petit-déjeuner", icon: <Coffee size={16} /> },
  { key: "snack", label: "Collation", icon: <Cookie size={16} /> },
  { key: "lunch", label: "Déjeuner", icon: <UtensilsCrossed size={16} /> },
  { key: "dinner", label: "Dîner", icon: <ChefHat size={16} /> },
];

const PREP_TIME_OPTIONS = [
  { value: "15", label: "≤ 15 min" },
  { value: "30", label: "≤ 30 min" },
  { value: "45", label: "≤ 45 min" },
  { value: "60", label: "≤ 60 min" },
];

const SERVINGS_OPTIONS = [
  { value: "1", label: "1 portion" },
  { value: "2", label: "≤ 2 portions" },
  { value: "4", label: "≤ 4 portions" },
  { value: "6", label: "≤ 6 portions" },
  { value: "8", label: "≤ 8 portions" },
];

// ─── RecipeItem sub-component ─────────────────────────────────────────────────

const RecipeItem = ({
  recipe,
  isFav,
  onToggle,
}: {
  recipe: Recipe;
  isFav: boolean;
  onToggle: (id: string, currentValue: boolean) => void;
}) => {
  const favoriteToggle = useFavoriteToggle(recipe.id);
  return (
    <RecipeCard
      recipe={recipe}
      isFavorite={isFav}
      onFavoriteToggle={() => {
        favoriteToggle.mutate(isFav);
        onToggle(recipe.id, isFav);
      }}
    />
  );
};

// ─── Active filter badge ───────────────────────────────────────────────────────

function FilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Chip
      size="sm"
      variant="flat"
      color="success"
      onClose={onRemove}
      classNames={{ base: "h-6" }}
    >
      {label}
    </Chip>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Meal type tab
  const [mealType, setMealType] = useState<string>("all");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedIntolerances, setSelectedIntolerances] = useState<string[]>([]);
  const [maxPrepTime, setMaxPrepTime] = useState<string>("");
  const [calorieRange, setCalorieRange] = useState<[number, number]>([0, 1500]);
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [maxServings, setMaxServings] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const { data: favoriteRecipes = [] } = useFavorites();
  const favoriteIds = favoriteRecipes.map((r: Recipe) => r.id);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);
      if (mealType !== "all") params.append("meal_type", mealType);
      if (selectedDietary.length > 0)
        params.append("dietary_tags", selectedDietary.join(","));
      if (selectedIntolerances.length > 0)
        params.append("intolerances", selectedIntolerances.join(","));
      if (maxPrepTime) params.append("max_prep_time", maxPrepTime);
      if (calorieRange[0] > 0) params.append("min_calories", calorieRange[0].toString());
      if (calorieRange[1] < 1500) params.append("max_calories", calorieRange[1].toString());
      if (maxBudget) params.append("max_price", maxBudget);
      if (maxServings) params.append("max_servings", maxServings);
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
  }, [
    searchQuery,
    mealType,
    selectedDietary,
    selectedIntolerances,
    maxPrepTime,
    calorieRange,
    maxBudget,
    maxServings,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const resetPage = () => setPagination((p) => ({ ...p, page: 1 }));

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDietary([]);
    setSelectedIntolerances([]);
    setMaxPrepTime("");
    setCalorieRange([0, 1500]);
    setMaxBudget("");
    setMaxServings("");
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const toggleTag = (
    value: string,
    current: string[],
    setter: (v: string[]) => void,
  ) => {
    setter(
      current.includes(value)
        ? current.filter((t) => t !== value)
        : [...current, value],
    );
    resetPage();
  };

  const hasActiveFilters =
    searchQuery ||
    selectedDietary.length > 0 ||
    selectedIntolerances.length > 0 ||
    maxPrepTime ||
    calorieRange[0] > 0 ||
    calorieRange[1] < 1500 ||
    maxBudget ||
    maxServings;

  const activeFilterCount = [
    searchQuery ? 1 : 0,
    selectedDietary.length,
    selectedIntolerances.length,
    maxPrepTime ? 1 : 0,
    calorieRange[0] > 0 || calorieRange[1] < 1500 ? 1 : 0,
    maxBudget ? 1 : 0,
    maxServings ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Leaf className="text-success" size={28} />
          Explorer les Recettes
        </h1>
        <p className="text-default-500 text-sm">
          {loading ? "Chargement…" : `${pagination.total} recette${pagination.total > 1 ? "s" : ""} disponibles`}
        </p>
      </div>

      {/* ── Meal type tabs + search row ── */}
      <div className="flex flex-col gap-4">
        {/* Tabs */}
        <Tabs
          aria-label="Type de repas"
          selectedKey={mealType}
          onSelectionChange={(key) => {
            setMealType(key as string);
            resetPage();
          }}
          color="success"
          variant="underlined"
          classNames={{
            tabList: "gap-1 border-b border-divider",
            tab: "h-10",
          }}
        >
          {MEAL_TABS.map((tab) => (
            <Tab
              key={tab.key}
              title={
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  {tab.icon}
                  {tab.label}
                </span>
              }
            />
          ))}
        </Tabs>

        {/* Search + filter toggle */}
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Rechercher une recette..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              resetPage();
            }}
            startContent={<Search size={16} className="text-default-400 shrink-0" />}
            classNames={{
              inputWrapper:
                "bg-default-100 border border-divider hover:border-success/50 transition-colors",
            }}
            size="lg"
            className="flex-1"
          />
          <Button
            variant={showFilters ? "flat" : "bordered"}
            color={showFilters ? "success" : "default"}
            startContent={<SlidersHorizontal size={16} />}
            onPress={() => setShowFilters(!showFilters)}
            size="lg"
            className="shrink-0"
            endContent={
              activeFilterCount > 0 ? (
                <span className="ml-0.5 bg-success text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              ) : undefined
            }
          >
            <span className="hidden sm:inline">Filtres</span>
          </Button>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <Card className="border border-divider/60 shadow-sm">
          <CardBody className="gap-6 p-5">
            {/* Panel header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-success" />
                Filtres avancés
              </h3>
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  startContent={<X size={14} />}
                  onPress={clearFilters}
                >
                  Tout effacer
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {/* ── Régimes alimentaires ── */}
              <div className="space-y-2 md:col-span-2 xl:col-span-2">
                <label className="text-sm font-semibold text-default-700 flex items-center gap-1.5">
                  <Leaf size={14} className="text-success" />
                  Régime alimentaire
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      variant={selectedDietary.includes(opt.value) ? "solid" : "bordered"}
                      color={selectedDietary.includes(opt.value) ? "success" : "default"}
                      className="cursor-pointer select-none text-xs"
                      size="sm"
                      onClick={() =>
                        toggleTag(opt.value, selectedDietary, setSelectedDietary)
                      }
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* ── Temps de préparation ── */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-default-700 flex items-center gap-1.5">
                  <Clock size={14} className="text-primary" />
                  Temps de préparation
                </label>
                <Select
                  placeholder="Sélectionner"
                  selectedKeys={maxPrepTime ? [maxPrepTime] : []}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0] as string;
                    setMaxPrepTime(v || "");
                    resetPage();
                  }}
                  variant="bordered"
                  size="sm"
                >
                  {PREP_TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} textValue={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* ── Intolerances ── */}
              <div className="space-y-2 md:col-span-2 xl:col-span-2">
                <label className="text-sm font-semibold text-default-700 flex items-center gap-1.5">
                  <X size={14} className="text-danger" />
                  Intolérances (à exclure)
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTOLERANCE_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      variant={selectedIntolerances.includes(opt.value) ? "solid" : "bordered"}
                      color={selectedIntolerances.includes(opt.value) ? "danger" : "default"}
                      className="cursor-pointer select-none text-xs"
                      size="sm"
                      onClick={() =>
                        toggleTag(opt.value, selectedIntolerances, setSelectedIntolerances)
                      }
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* ── Budget par recette ── */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-default-700 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-warning" />
                  Budget max par portion
                </label>
                <Select
                  placeholder="Sélectionner"
                  selectedKeys={maxBudget ? [maxBudget] : []}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0] as string;
                    setMaxBudget(v || "");
                    resetPage();
                  }}
                  variant="bordered"
                  size="sm"
                >
                  {[
                    { value: "1", label: "≤ 1 $" },
                    { value: "2", label: "≤ 2 $" },
                    { value: "3", label: "≤ 3 $" },
                    { value: "5", label: "≤ 5 $" },
                    { value: "8", label: "≤ 8 $" },
                  ].map((opt) => (
                    <SelectItem key={opt.value} textValue={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* ── Calories ── */}
              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-semibold text-default-700 flex items-center gap-1.5">
                  <Flame size={14} className="text-danger" />
                  Calories par portion
                  <span className="ml-auto font-normal text-default-500 text-xs">
                    {calorieRange[0]} – {calorieRange[1] >= 1500 ? "1500+" : calorieRange[1]} kcal
                  </span>
                </label>
                <Slider
                  step={50}
                  minValue={0}
                  maxValue={1500}
                  value={calorieRange}
                  onChange={(v) => {
                    setCalorieRange(v as [number, number]);
                    resetPage();
                  }}
                  color="success"
                  size="sm"
                  className="max-w-full"
                />
              </div>

              {/* ── Portions ── */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-default-700 flex items-center gap-1.5">
                  <Users size={14} className="text-secondary" />
                  Nombre de portions
                </label>
                <Select
                  placeholder="Sélectionner"
                  selectedKeys={maxServings ? [maxServings] : []}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0] as string;
                    setMaxServings(v || "");
                    resetPage();
                  }}
                  variant="bordered"
                  size="sm"
                >
                  {SERVINGS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} textValue={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ── Active filter badges ── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-default-500 font-medium">Actifs :</span>

          {selectedDietary.map((tag) => (
            <FilterBadge
              key={tag}
              label={DIETARY_OPTIONS.find((o) => o.value === tag)?.label ?? tag}
              onRemove={() =>
                toggleTag(tag, selectedDietary, setSelectedDietary)
              }
            />
          ))}

          {selectedIntolerances.map((tag) => (
            <FilterBadge
              key={`intol-${tag}`}
              label={`Sans ${INTOLERANCE_OPTIONS.find((o) => o.value === tag)?.label ?? tag}`}
              onRemove={() =>
                toggleTag(tag, selectedIntolerances, setSelectedIntolerances)
              }
            />
          ))}

          {maxPrepTime && (
            <FilterBadge
              label={`≤ ${maxPrepTime} min`}
              onRemove={() => { setMaxPrepTime(""); resetPage(); }}
            />
          )}

          {(calorieRange[0] > 0 || calorieRange[1] < 1500) && (
            <FilterBadge
              label={`${calorieRange[0]}–${calorieRange[1] >= 1500 ? "1500+" : calorieRange[1]} kcal`}
              onRemove={() => { setCalorieRange([0, 1500]); resetPage(); }}
            />
          )}

          {maxBudget && (
            <FilterBadge
              label={`≤ ${maxBudget} $ / portion`}
              onRemove={() => { setMaxBudget(""); resetPage(); }}
            />
          )}

          {maxServings && (
            <FilterBadge
              label={`≤ ${maxServings} portion${parseInt(maxServings) > 1 ? "s" : ""}`}
              onRemove={() => { setMaxServings(""); resetPage(); }}
            />
          )}
        </div>
      )}

      {/* ── Recipe grid ── */}
      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <Card>
          <CardBody className="text-center py-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center">
              <Search size={28} className="text-default-400" />
            </div>
            <div>
              <p className="font-semibold text-default-700">Aucune recette trouvée</p>
              <p className="text-sm text-default-500 mt-1">
                Essayez de modifier vos filtres ou votre recherche.
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                color="success"
                variant="flat"
                size="sm"
                startContent={<X size={14} />}
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
            <RecipeItem
              key={recipe.id}
              recipe={recipe}
              isFav={favoriteIds.includes(recipe.id)}
              onToggle={() => {}}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && recipes.length > 0 && pagination.totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 pt-4">
          <Button
            size="sm"
            variant="flat"
            isDisabled={pagination.page === 1}
            onPress={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
          >
            Précédent
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => {
              if (
                num === 1 ||
                num === pagination.totalPages ||
                (num >= pagination.page - 2 && num <= pagination.page + 2)
              ) {
                return (
                  <Button
                    key={num}
                    size="sm"
                    variant={num === pagination.page ? "solid" : "flat"}
                    color={num === pagination.page ? "success" : "default"}
                    onPress={() => setPagination((p) => ({ ...p, page: num }))}
                  >
                    {num}
                  </Button>
                );
              } else if (num === pagination.page - 3 || num === pagination.page + 3) {
                return (
                  <span key={num} className="px-1 text-sm text-default-500">
                    …
                  </span>
                );
              }
              return null;
            })}
          </div>

          <Button
            size="sm"
            variant="flat"
            isDisabled={pagination.page === pagination.totalPages}
            onPress={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
