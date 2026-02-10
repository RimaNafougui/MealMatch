"use client";

import { useState } from "react";
import { RecipeCard, RecipeCardSkeleton } from "@/components/recipes/recipe-card";

const sampleRecipes = [
    {
        id: 1,
        title: "Pasta Alfredo (Remote Image)",
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=1200",
        readyInMinutes: 25,
        servings: 4,
        calories: 650,
    },
    {
        id: 2,
        title: "Veggie Stir Fry",
        image: "/foodPuzzle.png",
        readyInMinutes: 20,
        servings: 2,
        calories: 450,
    },
    {
        id: 3,
        title: "Chicken Salad",
        image: "/foodPuzzle.png",
        readyInMinutes: 15,
        servings: 2,
        calories: 400,
    },
];

export default function TestRecipeCardPage() {
    const [favorites, setFavorites] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const toggleFavorite = (id: number) => {
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Recipe Card Test</h1>

            {/* Bouton pour tester le loading state */}
            <button
                className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={() => setLoading(!loading)}
            >
                Toggle Loading State
            </button>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <RecipeCardSkeleton key={i} />)
                    : sampleRecipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            isFavorite={favorites.includes(recipe.id)}
                            onFavoriteToggle={() => toggleFavorite(recipe.id)}
                        />
                    ))}
            </div>
        </div>
    );
}