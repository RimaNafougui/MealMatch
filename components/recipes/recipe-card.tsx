"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Chip,
  Button,
  Skeleton,
} from "@heroui/react";
import { Heart, Clock, Users, DollarSign, Flame, Sparkles, Utensils } from "lucide-react";
import { isMealPrepFriendlyRecipe } from "@/utils/meal-prep";
import { QuickAskModal } from "@/components/ai/QuickAskModal";


export function RecipeCardSkeleton() {
  return (
    <Card className="w-full space-y-4 p-3">
      <Skeleton className="aspect-video rounded-lg" />
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </Card>
  );
}

export interface RecipeCardProps {
  recipe: {
    id: string;
    spoonacular_id?: number | null;
    title: string;
    image_url?: string | null;
    prep_time?: number | null;
    servings?: number | null;
    calories?: number | null;
    price_per_serving?: number | null;
    dietary_tags?: string[] | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
  };
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
  isLoading?: boolean;
}

export function RecipeCard({
  recipe,
  onFavoriteToggle,
  isFavorite = false,
  isLoading = false,
}: RecipeCardProps) {
  const router = useRouter();
  const [quickAskOpen, setQuickAskOpen] = useState(false);

  if (isLoading) return <RecipeCardSkeleton />;

  const imageUrl = recipe.image_url || null;
  const prepTime = recipe.prep_time || 0;
  const servings = recipe.servings || 4;
  const calories = recipe.calories || 0;
  const pricePerServing = recipe.price_per_serving || 0;
  const mealPrepFriendly = isMealPrepFriendlyRecipe({ prep_time: recipe.prep_time, servings: recipe.servings });

  const hasMacros = recipe.protein != null || recipe.carbs != null || recipe.fat != null;

  return (
    <>
      <Card isHoverable className="w-full group transition-shadow duration-200 hover:shadow-lg">
        <div
          className="cursor-pointer"
          onClick={() => router.push(`/explore/${recipe.id}`)}
        >
          <CardHeader className="p-0">
          {/* Wrapper gives us a stable relative context for overlays */}
          <div className="relative w-full overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={recipe.title}
                radius="none"
                classNames={{ wrapper: "w-full" }}
                className="aspect-video object-cover w-full group-hover:scale-[1.03] transition-transform duration-200"
              />
            ) : (
              <div className="aspect-video w-full bg-default-100 flex items-center justify-center">
                <Utensils size={40} className="text-default-300" />
              </div>
            )}

            {/* Top-right button row — heart + sparkles */}
            <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                className="p-1.5 rounded-full bg-primary/80 backdrop-blur-sm hover:bg-primary"
                onClick={(e) => { e.stopPropagation(); setQuickAskOpen(true); }}
                aria-label="Demander à l'IA"
              >
                <Sparkles size={14} className="text-white" />
              </button>
              {onFavoriteToggle && (
                <button
                  className="p-1.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70"
                  onClick={(e) => { e.stopPropagation(); onFavoriteToggle(); }}
                  aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Heart size={14} className={isFavorite ? "text-danger" : "text-white"} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              )}
            </div>

            {/* Macro pills — bottom overlay, always rendered when data present */}
            {hasMacros && (
              <div className="absolute bottom-0 left-0 right-0 z-20 px-2 pb-2 pt-4 flex gap-1.5 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {recipe.protein != null && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-danger/90 text-white">
                    P {recipe.protein}g
                  </span>
                )}
                {recipe.carbs != null && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-warning/90 text-white">
                    G {recipe.carbs}g
                  </span>
                )}
                {recipe.fat != null && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-success/90 text-white">
                    L {recipe.fat}g
                  </span>
                )}
              </div>
            )}
          </div>
          </CardHeader>

          <CardBody className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem] flex-1">
                {recipe.title}
              </h3>
              {/* "Voir →" chip */}
              <span className="text-[11px] text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 mt-1">
                Voir →
              </span>
            </div>
            {mealPrepFriendly && (
              <Chip size="sm" color="secondary" variant="flat" className="text-[11px]">
                Meal Prep Friendly
              </Chip>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {prepTime > 0 && <Chip size="sm" variant="flat" startContent={<Clock size={14} />}>{prepTime} min</Chip>}
              <Chip size="sm" variant="flat" startContent={<Users size={14} />}>{servings} portions</Chip>
              {calories > 0 && <Chip size="sm" variant="flat" color="warning" startContent={<Flame size={14} />}>{calories} cal</Chip>}
            </div>
            {pricePerServing > 0 && (
              <div className="flex items-center gap-1 text-success font-semibold">
                <DollarSign size={16} />
                <span className="text-sm">{pricePerServing.toFixed(2)} / portion</span>
              </div>
            )}
          </CardBody>
        </div>

      </Card>

      <QuickAskModal
        isOpen={quickAskOpen}
        onClose={() => setQuickAskOpen(false)}
        initialMessage={`Adapte cette recette pour moi : ${recipe.title}`}
      />
    </>
  );
}
