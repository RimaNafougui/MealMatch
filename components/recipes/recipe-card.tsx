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
    Badge,
    Button,
    Skeleton,
} from "@heroui/react";
import { Heart, Clock, Users } from "lucide-react";

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
        id: number;
        title: string;
        image: string;
        readyInMinutes: number;
        servings: number;
        calories: number;
    };
    onFavoriteToggle: () => void;
    isFavorite: boolean;
    isLoading?: boolean;
}

export function RecipeCard({
    recipe,
    onFavoriteToggle,
    isFavorite,
    isLoading = false,
}: RecipeCardProps) {
    const router = useRouter();

    if (isLoading) {
        return <RecipeCardSkeleton />;
    }

    return (
        <Card isHoverable className="w-full" onClick={() => router.push(`/recipes/${recipe.id}`)}>
            {/* IMAGE */}
            <CardHeader className="p-0">
                <Image
                    src={recipe.image}
                    alt={recipe.title}
                    radius="none"
                    isZoomed
                    className="aspect-video object-cover"
                />
            </CardHeader>

            {/* BODY */}
            <CardBody className="space-y-3">
                <h3 className="font-semibold text-base line-clamp-2">
                    {recipe.title}
                </h3>

                <div className="flex items-center gap-2 flex-wrap">
                    <Chip size="sm" startContent={<Clock size={14} />}>
                        {recipe.readyInMinutes} min
                    </Chip>

                    <Chip size="sm" startContent={<Users size={14} />}>
                        {recipe.servings} portions
                    </Chip>

                    <Badge color="success" variant="flat">
                        {recipe.calories} cal
                    </Badge>
                </div>
            </CardBody>

            {/* FOOTER */}
            <CardFooter className="justify-end">
                <motion.div
                    whileTap={{ scale: 0.85 }}
                    animate={{ scale: isFavorite ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Button
                        isIconOnly
                        variant="light"
                        color={isFavorite ? "danger" : "default"}
                        onPress={(e) => {
                            e.continuePropagation(); // ✅ permet au parent Card de recevoir ou stopper
                            onFavoriteToggle();
                        }}
                    >
                        <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                    </Button>


                </motion.div>
            </CardFooter>
        </Card>
    );
}
