"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Image,
  Card,
  CardBody,
  Chip,
  Button,
  Tabs,
  Tab,
  CheckboxGroup,
  Checkbox,
  Divider,
  Spinner,
} from "@heroui/react";
import {
  Heart,
  Share2,
  Clock,
  Users,
  ChefHat,
  Flame,
  DollarSign,
  Leaf,
} from "lucide-react";
import { useFavoriteToggle } from "@/hooks/useFavoritesToggle";
import { useFavorites } from "@/hooks/useFavorites"; // hook global des favoris

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  allergens?: string[];
}

interface InstructionStep {
  step: string; // The instruction text
  number: number; // The step number
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
  created_at?: string;
  updated_at?: string;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null);
  const { data: favoriteRecipes = [], isLoading: favoritesLoading } = useFavorites();

  const fetchRecipe = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recipes/catalog/${id}`);
      const data = await response.json();

      if (response.ok) {
        setRecipe(data.recipe);
        if (data.recipe.ingredients) {
          setSelectedIngredients(
            data.recipe.ingredients.map((_: any, idx: number) =>
              idx.toString(),
            ),
          );
        }



      } else {
        console.error("Failed to fetch recipe:", data.error);
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (params.id) {
      fetchRecipe(params.id as string);
    }
  }, [params.id]);
  useEffect(() => {
    if (recipe && !favoritesLoading && optimisticFavorite === null) {
      setOptimisticFavorite(favoriteRecipes.some((r: any) => r.id === recipe.id)
      );
    }
  }, [recipe, favoriteRecipes, favoritesLoading, optimisticFavorite]);
  const isFavorite =
    recipe && !favoritesLoading
      ? optimisticFavorite ?? favoriteRecipes.some((r: any) => r.id === recipe.id)

      : null;


  // Crée mutate uniquement si recipe existe
  const { mutate: toggleFavoriteRemote } = useFavoriteToggle(recipe ? recipe.id : "");



  /// toggle favori
  const toggleFavorite = () => {
    if (!recipe) return;

    const nextValue = !isFavorite;
    setOptimisticFavorite(nextValue);      // effet immédiat sur UI
    toggleFavoriteRemote(isFavorite);        // envoi au serveur
  };
  const handleShare = async () => {
    if (navigator.share && recipe) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Découvrez cette recette: ${recipe.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Lien copié!");
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" color="success" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-default-500">Recette introuvable</p>
        <Button
          color="success"
          variant="flat"
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
    <div className="w-full min-h-screen pb-10 bg-gray-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <div className="relative w-full h-[450px] md:h-[550px] overflow-hidden">
        {/* Background Image */}
        <Image
          src={imageUrl}
          alt={recipe.title}
          radius="none"
          width="100%"
          className="w-full h-full object-cover object-center z-0 scale-105"
          removeWrapper
        />

        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Main Content - Overlapping Card */}
      <div className="relative z-20 px-4 md:px-6 -mt-28 md:-mt-36 max-w-5xl mx-auto w-full">
        <Card className="w-full shadow-large border border-white/20 backdrop-blur-md bg-background/95">
          <CardBody className="p-6 md:p-8 gap-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground">
                {recipe.title}
              </h1>

              <div className="flex flex-wrap gap-3 items-center">
                {prepTime > 0 && (
                  <Chip
                    variant="flat"
                    color="primary"
                    startContent={<Clock size={16} />}
                  >
                    Préparation: {prepTime} min
                  </Chip>
                )}

                <Chip
                  variant="flat"
                  color="secondary"
                  startContent={<Users size={16} />}
                >
                  {servings} Portions
                </Chip>

                {calories > 0 && (
                  <Chip
                    variant="flat"
                    color="warning"
                    startContent={<Flame size={16} />}
                  >
                    {calories} cal
                  </Chip>
                )}

                {pricePerServing > 0 && (
                  <Chip
                    variant="flat"
                    color="success"
                    startContent={<DollarSign size={16} />}
                  >
                    ${pricePerServing.toFixed(2)} / portion
                  </Chip>
                )}
              </div>

              {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recipe.dietary_tags.map((tag) => (
                    <Chip
                      key={tag}
                      size="sm"
                      variant="flat"
                      color="success"
                      startContent={<Leaf size={14} />}
                      className="capitalize"
                    >
                      {tag.replace(/_/g, " ")}
                    </Chip>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  color={isFavorite ? "danger" : "default"}
                  variant="bordered"
                  radius="full"
                  startContent={
                    isFavorite === null
                      ? <Spinner size="sm" />
                      : <Heart size={20} className={isFavorite ? "fill-current" : ""} />
                  }
                  onPress={toggleFavorite}
                  isDisabled={isFavorite === null}
                >
                  {isFavorite === null
                    ? "Chargement..."
                    : isFavorite
                      ? "Retirer des Favoris"
                      : "Ajouter aux Favoris"}
                </Button>




                <Button
                  variant="light"
                  radius="full"
                  startContent={<Share2 size={20} />}
                  onPress={handleShare}
                >
                  Partager
                </Button>
              </div>
            </div>

            <Divider className="my-2" />

            {/* Tabs Section within the Card */}
            <Tabs
              aria-label="Recipe details"
              color="primary"
              variant="underlined"
              classNames={{
                tabList:
                  "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary",
                tab: "max-w-fit px-0 h-12",
                tabContent:
                  "group-data-[selected=true]:text-primary font-medium text-lg",
              }}
            >
              {/* Ingredients Tab */}
              <Tab key="ingredients" title="Ingrédients" className="pt-4">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-semibold">Liste de courses</h3>
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    <CheckboxGroup
                      value={selectedIngredients}
                      onValueChange={setSelectedIngredients}
                      color="success"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
                              <span>
                                <span className="font-bold">
                                  {item.amount} {item.unit}
                                </span>{" "}
                                {item.name}
                              </span>
                              {item.allergens && item.allergens.length > 0 && (
                                <div className="flex gap-1">
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
                    <p className="text-default-500">
                      Aucun ingrédient disponible
                    </p>
                  )}
                </div>
              </Tab>

              {/* Instructions Tab */}
              <Tab key="instructions" title="Instructions" className="pt-4">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-semibold">Préparation</h3>
                  {recipe.instructions && recipe.instructions.length > 0 ? (
                    <div className="space-y-4">
                      {recipe.instructions.map((instruction, index) => (
                        <div
                          key={index}
                          className="flex gap-4 p-4 rounded-lg bg-default-50 hover:bg-default-100 transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                            {instruction.number || index + 1}
                          </div>
                          <p className="text-base leading-relaxed text-default-800">
                            {instruction.step}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-default-500">
                      Aucune instruction disponible
                    </p>
                  )}
                </div>
              </Tab>

              {/* Nutrition Tab */}
              <Tab key="nutrition" title="Nutrition" className="pt-4">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-semibold">
                    Valeurs nutritionnelles
                  </h3>
                  {recipe.calories ||
                    recipe.protein ||
                    recipe.carbs ||
                    recipe.fat ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {calories > 0 && (
                        <Card className="bg-warning-50 border-warning-200">
                          <CardBody className="text-center p-4">
                            <Flame
                              size={32}
                              className="text-warning mx-auto mb-2"
                            />
                            <p className="text-2xl font-bold text-warning">
                              {calories}
                            </p>
                            <p className="text-sm text-warning-700">Calories</p>
                          </CardBody>
                        </Card>
                      )}

                      {recipe.protein && recipe.protein > 0 && (
                        <Card className="bg-danger-50 border-danger-200">
                          <CardBody className="text-center p-4">
                            <ChefHat
                              size={32}
                              className="text-danger mx-auto mb-2"
                            />
                            <p className="text-2xl font-bold text-danger">
                              {recipe.protein}g
                            </p>
                            <p className="text-sm text-danger-700">Protéines</p>
                          </CardBody>
                        </Card>
                      )}

                      {recipe.carbs && recipe.carbs > 0 && (
                        <Card className="bg-primary-50 border-primary-200">
                          <CardBody className="text-center p-4">
                            <Leaf
                              size={32}
                              className="text-primary mx-auto mb-2"
                            />
                            <p className="text-2xl font-bold text-primary">
                              {recipe.carbs}g
                            </p>
                            <p className="text-sm text-primary-700">Glucides</p>
                          </CardBody>
                        </Card>
                      )}

                      {recipe.fat && recipe.fat > 0 && (
                        <Card className="bg-secondary-50 border-secondary-200">
                          <CardBody className="text-center p-4">
                            <DollarSign
                              size={32}
                              className="text-secondary mx-auto mb-2"
                            />
                            <p className="text-2xl font-bold text-secondary">
                              {recipe.fat}g
                            </p>
                            <p className="text-sm text-secondary-700">
                              Lipides
                            </p>
                          </CardBody>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <p className="text-default-500">
                      Aucune information nutritionnelle disponible
                    </p>
                  )}
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
