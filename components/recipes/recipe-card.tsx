"use client";

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
import { Heart, Clock, Users, DollarSign, Flame } from "lucide-react";


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
  if (isLoading) return <RecipeCardSkeleton />;

  const imageUrl = recipe.image_url || "/foodPuzzle.png";
  const prepTime = recipe.prep_time || 0;
  const servings = recipe.servings || 4;
  const calories = recipe.calories || 0;
  const pricePerServing = recipe.price_per_serving || 0;

  return (
    <Card isHoverable className="w-full group">
      <div
        className="cursor-pointer"
        onClick={() => router.push(`/explore/${recipe.id}`)}
      >
        <CardHeader className="p-0 relative">
          <Image
            src={imageUrl}
            alt={recipe.title}
            radius="none"
            className="aspect-video object-cover w-full group-hover:scale-105 transition-transform duration-300"
          />
        </CardHeader>

        <CardBody className="space-y-3 p-4">
          <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem]">
            {recipe.title}
          </h3>
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

      {onFavoriteToggle && (
        <CardFooter className="justify-end pt-0 pb-4 px-4">
          <Button
            isIconOnly
            variant="light"
            color={isFavorite ? "danger" : "default"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation?.(); // sécuritaire
              onFavoriteToggle();
            }}
          >
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

