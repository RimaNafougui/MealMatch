"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Tabs,
  Tab,
  CheckboxGroup,
  Checkbox,
  Divider,
  Skeleton,
  Image,
} from "@heroui/react";
import {
  Heart,
  Share2,
  Clock,
  Users,
  Flame,
  DollarSign,
  Leaf,
  ArrowLeft,
  AlertTriangle,
  Dumbbell,
  Wheat,
  Droplets,
  ChefHat,
} from "lucide-react";
import { useFavoriteToggle } from "@/hooks/useFavoritesToggle";
import { useFavorites } from "@/hooks/useFavorites";

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  allergens?: string[];
}

interface InstructionStep {
  step: string;
  number: number;
}

interface Recipe {
  id: string;
  spoonacular_id?: number | null;
  title: string;
  image_url?: string | null;
  prep_time?: number | null;
  servings?: number | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  price_per_serving?: number | null;
  ingredients?: Ingredient[] | null;
  instructions?: InstructionStep[] | null;
  dietary_tags?: string[] | null;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function RecipeDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <Skeleton className="h-8 w-32 rounded-lg" />
      <Skeleton className="w-full aspect-[16/7] rounded-2xl" />
      <Card className="border border-divider/50 bg-white/70 dark:bg-black/40 p-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-9 w-3/4 rounded-xl" />
          <div className="flex gap-2 flex-wrap">
            {[120, 90, 110, 100].map((w, i) => (
              <Skeleton key={i} className={`h-7 w-[${w}px] rounded-full`} />
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-10 w-44 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
          <Divider />
          <div className="flex gap-6 border-b border-divider pb-3">
            {["Ingrédients", "Instructions", "Nutrition"].map((_, i) => (
              <Skeleton key={i} className="h-5 w-24 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Nutrition stat card ───────────────────────────────────────────────────────
function NutriCard({
  icon,
  value,
  label,
  colorClass,
  bgClass,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${bgClass}`}
    >
      <div className={colorClass}>{icon}</div>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      <p className={`text-xs font-medium ${colorClass} opacity-80`}>{label}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: favoriteRecipes = [], isLoading: favoritesLoading } = useFavorites();
  const { mutate: toggleFavoriteRemote } = useFavoriteToggle(recipe?.id ?? "");

  // Fetch recipe
  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    fetch(`/api/recipes/catalog/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.recipe) {
          setRecipe(data.recipe);
          setSelectedIngredients(
            (data.recipe.ingredients ?? []).map((_: any, i: number) => i.toString())
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  // Sync optimistic favourite state once both are loaded
  useEffect(() => {
    if (recipe && !favoritesLoading && optimisticFavorite === null) {
      setOptimisticFavorite(favoriteRecipes.some((r: any) => r.id === recipe.id));
    }
  }, [recipe, favoriteRecipes, favoritesLoading, optimisticFavorite]);

  const isFavorite =
    recipe && !favoritesLoading
      ? (optimisticFavorite ?? favoriteRecipes.some((r: any) => r.id === recipe?.id))
      : null;

  function toggleFavorite() {
    if (!recipe) return;
    setOptimisticFavorite(!isFavorite);
    toggleFavoriteRemote(!!isFavorite);
  }

  async function handleShare() {
    if (navigator.share && recipe) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Découvrez cette recette : ${recipe.title}`,
          url: window.location.href,
        });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <RecipeDetailSkeleton />
    </div>
  );

  // ── Not found ────────────────────────────────────────────────────────────
  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center gap-4 text-center">
        <AlertTriangle size={48} className="text-warning" />
        <h2 className="text-xl font-bold">Recette introuvable</h2>
        <p className="text-default-400 text-sm">
          Cette recette n&apos;existe pas ou a été supprimée.
        </p>
        <Button
          variant="flat"
          color="success"
          startContent={<ArrowLeft size={16} />}
          onPress={() => router.push("/explore")}
        >
          Retour aux recettes
        </Button>
      </div>
    );
  }

  const imageUrl = recipe.image_url || "/foodPuzzle.png";
  const prepTime = recipe.prep_time || 0;
  const servings = recipe.servings || 4;
  const calories = recipe.calories || 0;
  const pricePerServing = recipe.price_per_serving || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

      {/* ── Back button ──────────────────────────────────────────────── */}
      <div>
        <Button
          variant="light"
          color="default"
          startContent={<ArrowLeft size={16} />}
          onPress={() => router.back()}
          className="text-default-500 -ml-2"
        >
          Retour
        </Button>
      </div>

      {/* ── Hero image ───────────────────────────────────────────────── */}
      <div className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={recipe.title}
          radius="none"
          removeWrapper
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* ── Main card ────────────────────────────────────────────────── */}
      <Card className="border border-divider/50 bg-white/70 dark:bg-black/40 backdrop-blur-xl">
        <CardHeader className="px-6 pt-6 pb-0 flex flex-col gap-4">

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold">{recipe.title}</h1>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2">
            {prepTime > 0 && (
              <Chip variant="flat" color="primary" startContent={<Clock size={14} />}>
                {prepTime} min
              </Chip>
            )}
            <Chip variant="flat" color="secondary" startContent={<Users size={14} />}>
              {servings} portions
            </Chip>
            {calories > 0 && (
              <Chip variant="flat" color="warning" startContent={<Flame size={14} />}>
                {calories} cal
              </Chip>
            )}
            {pricePerServing > 0 && (
              <Chip variant="flat" color="success" startContent={<DollarSign size={14} />}>
                {pricePerServing.toFixed(2)} $CA / portion
              </Chip>
            )}
          </div>

          {/* Dietary tags */}
          {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.dietary_tags.map((tag) => (
                <Chip
                  key={tag}
                  size="sm"
                  variant="flat"
                  color="success"
                  startContent={<Leaf size={12} />}
                  className="capitalize"
                >
                  {tag.replace(/_/g, " ")}
                </Chip>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pb-2">
            <Button
              color={isFavorite ? "danger" : "default"}
              variant="bordered"
              radius="full"
              startContent={
                isFavorite === null ? (
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin inline-block" />
                ) : (
                  <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                )
              }
              onPress={toggleFavorite}
              isDisabled={isFavorite === null}
              className="font-semibold"
            >
              {isFavorite === null
                ? "Chargement…"
                : isFavorite
                ? "Retirer des favoris"
                : "Ajouter aux favoris"}
            </Button>

            <Button
              variant="flat"
              radius="full"
              startContent={<Share2 size={18} />}
              onPress={handleShare}
              className="font-semibold"
            >
              {copied ? "Lien copié !" : "Partager"}
            </Button>
          </div>

          <Divider />
        </CardHeader>

        <CardBody className="px-6 pb-6 pt-4">
          <Tabs
            aria-label="Détails de la recette"
            color="success"
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-success",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-success font-medium",
            }}
          >
            {/* ── Ingrédients ─────────────────────────────────────── */}
            <Tab key="ingredients" title="Ingrédients" className="pt-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {recipe.ingredients?.length ?? 0} ingrédients
                  </h3>
                  <Chip size="sm" variant="flat" color="default">
                    {selectedIngredients.length} / {recipe.ingredients?.length ?? 0} cochés
                  </Chip>
                </div>

                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <CheckboxGroup
                    value={selectedIngredients}
                    onValueChange={setSelectedIngredients}
                    color="success"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {recipe.ingredients.map((item, index) => (
                        <Checkbox
                          key={index}
                          value={index.toString()}
                          classNames={{
                            base: "max-w-full w-full",
                            label: "w-full",
                          }}
                        >
                          <div className="flex justify-between items-center w-full gap-2">
                            <span className="text-sm">
                              <span className="font-semibold">
                                {item.amount} {item.unit}
                              </span>{" "}
                              {item.name}
                            </span>
                            {item.allergens && item.allergens.length > 0 && (
                              <div className="flex gap-1 flex-shrink-0">
                                {item.allergens.map((allergen) => (
                                  <Chip
                                    key={allergen}
                                    color="danger"
                                    size="sm"
                                    variant="flat"
                                  >
                                    {allergen}
                                  </Chip>
                                ))}
                              </div>
                            )}
                          </div>
                        </Checkbox>
                      ))}
                    </div>
                  </CheckboxGroup>
                ) : (
                  <p className="text-default-400 text-sm py-4">
                    Aucun ingrédient disponible pour cette recette.
                  </p>
                )}
              </div>
            </Tab>

            {/* ── Instructions ────────────────────────────────────── */}
            <Tab key="instructions" title="Instructions" className="pt-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <ChefHat size={18} className="text-success" />
                  <h3 className="text-lg font-semibold">Étapes de préparation</h3>
                </div>

                {recipe.instructions && recipe.instructions.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {recipe.instructions.map((instruction, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 rounded-xl bg-default-50 dark:bg-default-100/10 border border-divider/40 hover:border-success/30 transition-colors"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-success text-white font-bold text-sm">
                          {instruction.number || index + 1}
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/80 pt-1">
                          {instruction.step}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-default-400 text-sm py-4">
                    Aucune instruction disponible pour cette recette.
                  </p>
                )}
              </div>
            </Tab>

            {/* ── Nutrition ───────────────────────────────────────── */}
            <Tab key="nutrition" title="Nutrition" className="pt-4">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold">Valeurs nutritionnelles</h3>

                {calories || recipe.protein || recipe.carbs || recipe.fat ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {calories > 0 && (
                      <NutriCard
                        icon={<Flame size={28} />}
                        value={String(calories)}
                        label="Calories"
                        colorClass="text-warning-600 dark:text-warning-400"
                        bgClass="bg-warning-50 dark:bg-warning/10 border-warning-200 dark:border-warning/20"
                      />
                    )}
                    {recipe.protein != null && recipe.protein > 0 && (
                      <NutriCard
                        icon={<Dumbbell size={28} />}
                        value={`${recipe.protein}g`}
                        label="Protéines"
                        colorClass="text-danger-600 dark:text-danger-400"
                        bgClass="bg-danger-50 dark:bg-danger/10 border-danger-200 dark:border-danger/20"
                      />
                    )}
                    {recipe.carbs != null && recipe.carbs > 0 && (
                      <NutriCard
                        icon={<Wheat size={28} />}
                        value={`${recipe.carbs}g`}
                        label="Glucides"
                        colorClass="text-primary-600 dark:text-primary-400"
                        bgClass="bg-primary-50 dark:bg-primary/10 border-primary-200 dark:border-primary/20"
                      />
                    )}
                    {recipe.fat != null && recipe.fat > 0 && (
                      <NutriCard
                        icon={<Droplets size={28} />}
                        value={`${recipe.fat}g`}
                        label="Lipides"
                        colorClass="text-secondary-600 dark:text-secondary-400"
                        bgClass="bg-secondary-50 dark:bg-secondary/10 border-secondary-200 dark:border-secondary/20"
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-default-400 text-sm py-4">
                    Aucune information nutritionnelle disponible.
                  </p>
                )}

                {pricePerServing > 0 && (
                  <div className="mt-2 flex items-center gap-2 p-4 rounded-xl bg-success/5 border border-success/20">
                    <DollarSign size={18} className="text-success" />
                    <div>
                      <p className="text-sm font-semibold text-success">
                        {pricePerServing.toFixed(2)} $CA par portion
                      </p>
                      <p className="text-xs text-default-400">
                        Estimation du coût des ingrédients
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
