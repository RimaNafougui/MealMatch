"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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

/* =========================
   Skeleton (loading state)
========================= */
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

/* =========================
   RecipeCard
========================= */

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

  if (isLoading) {
    return <RecipeCardSkeleton />;
  }

  const imageUrl = recipe.image_url || "/foodPuzzle.png";
  const prepTime = recipe.prep_time || 0;
  const servings = recipe.servings || 4;
  const calories = recipe.calories || 0;
  const pricePerServing = recipe.price_per_serving || 0;

  return (
    <Card isHoverable className="w-full group">
      {/* Clickable wrapper - not using Card's isPressable to avoid nested button issue */}
      <div
        className="cursor-pointer"
        onClick={() => router.push(`/explore/${recipe.id}`)}
      >
        {/* IMAGE */}
        <CardHeader className="p-0 relative">
          <Image
            src={imageUrl}
            alt={recipe.title}
            radius="none"
            className="aspect-video object-cover w-full group-hover:scale-105 transition-transform duration-300"
          />

          {/* Dietary Tags Overlay */}
          {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[calc(100%-1rem)]">
              {recipe.dietary_tags.slice(0, 2).map((tag) => (
                <Chip
                  key={tag}
                  size="sm"
                  variant="flat"
                  color="success"
                  className="text-xs capitalize backdrop-blur-sm bg-success/80 text-white"
                >
                  {tag.replace(/_/g, " ")}
                </Chip>
              ))}
              {recipe.dietary_tags.length > 2 && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="success"
                  className="text-xs backdrop-blur-sm bg-success/80 text-white"
                >
                  +{recipe.dietary_tags.length - 2}
                </Chip>
              )}
            </div>
          )}
        </CardHeader>

        {/* BODY */}
        <CardBody className="space-y-3 p-4">
          <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem]">
            {recipe.title}
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {prepTime > 0 && (
              <Chip
                size="sm"
                variant="flat"
                startContent={<Clock size={14} />}
                className="text-xs"
              >
                {prepTime} min
              </Chip>
            )}

            <Chip
              size="sm"
              variant="flat"
              startContent={<Users size={14} />}
              className="text-xs"
            >
              {servings} portions
            </Chip>

            {calories > 0 && (
              <Chip
                size="sm"
                variant="flat"
                color="warning"
                startContent={<Flame size={14} />}
                className="text-xs"
              >
                {calories} cal
              </Chip>
            )}
          </div>

          {pricePerServing > 0 && (
            <div className="flex items-center gap-1 text-success font-semibold">
              <DollarSign size={16} />
              <span className="text-sm">
                {pricePerServing.toFixed(2)} / portion
              </span>
            </div>
          )}
        </CardBody>
      </div>

      {/* FOOTER - Outside clickable wrapper to prevent nested button */}
      {onFavoriteToggle && (
        <CardFooter className="justify-end pt-0 pb-4 px-4">
          <motion.div
            whileTap={{ scale: 0.85 }}
            animate={{ scale: isFavorite ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Button
              isIconOnly
              variant="light"
              color={isFavorite ? "danger" : "default"}
              size="sm"
              onPress={(e) => {
                //e.stopPropagation();
                onFavoriteToggle();
              }}
            >
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
            </Button>
          </motion.div>
        </CardFooter>
      )}
    </Card>
  );
}
