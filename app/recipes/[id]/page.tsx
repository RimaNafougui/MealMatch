"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Image } from "@heroui/image";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { Tabs, Tab } from "@heroui/tabs";
import { CheckboxGroup, Checkbox } from "@heroui/checkbox";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Heart, Share2, Clock, Users, Flame, ChefHat } from "lucide-react";

// Mock Data (to be replaced with API call)
const MOCK_RECIPE = {
    id: 1,
    title: "Spaghetti Carbonara Classico",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=1200",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: "Easy",
    calories: 650,
    description: "Un classique italien authentique, crémeux sans crème, juste avec des œufs et du fromage.",
    ingredients: [
        { name: "Spaghetti", amount: "400g" },
        { name: "Guanciale ou Pancetta", amount: "200g" },
        { name: "Oeufs frais", amount: "4 gros" },
        { name: "Pecorino Romano", amount: "100g" },
        { name: "Poivre noir", amount: "Au goût" },
    ],
    instructions: [
        "Faire bouillir de l'eau salée pour les pâtes.",
        "Couper le guanciale en lardons et le faire revenir à la poêle jusqu'à ce qu'il soit croustillant.",
        "Battre les œufs avec le pecorino et beaucoup de poivre dans un bol.",
        "Cuire les pâtes al dente, garder un peu d'eau de cuisson.",
        "Mélanger les pâtes chaudes avec le guanciale, puis hors du feu, ajouter le mélange d'œufs et mélanger vigoureusement pour créer une émulsion crémeuse.",
    ],
    nutrition: [
        { label: "Calories", value: "650", unit: "kcal", daily: 32 },
        { label: "Protein", value: "25", unit: "g", daily: 50 },
        { label: "Carbs", value: "75", unit: "g", daily: 25 },
        { label: "Fat", value: "28", unit: "g", daily: 42 },
        { label: "Fiber", value: "4", unit: "g", daily: 16 },
        { label: "Sodium", value: "500", unit: "mg", daily: 22 },
    ],
    dietary: ["Gluten", "Dairy", "Eggs"],
    videoUrl: "https://www.youtube.com/embed/3AAdKl1UYZs",
};

export default function RecipeDetailPage() {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [recipe, setRecipe] = useState<typeof MOCK_RECIPE | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        // Simulate API fetch
        const timer = setTimeout(() => {
            setRecipe(MOCK_RECIPE);
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, [params.id]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                <Skeleton className="rounded-xl w-full h-[400px]" />
                <div className="space-y-4">
                    <Skeleton className="w-2/3 h-12 rounded-lg" />
                    <Skeleton className="w-1/3 h-8 rounded-lg" />
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Card className="p-8 text-center">
                    <CardBody>
                        <h2 className="text-2xl font-bold">Recette introuvable</h2>
                        <p className="text-default-500">Désolé, nous n'avons pas pu trouver cette recette.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* Hero Section */}
            <section className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
                <Image
                    removeWrapper
                    alt={recipe.title}
                    className="z-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={recipe.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-4 max-w-3xl">
                        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            {recipe.title}
                        </h1>
                        <div className="flex flex-wrap gap-2 md:gap-4">
                            <Chip startContent={<Clock size={16} />} color="primary" variant="solid">
                                Prep: {recipe.prepTime} min
                            </Chip>
                            <Chip startContent={<Flame size={16} />} color="secondary" variant="solid">
                                Cook: {recipe.cookTime} min
                            </Chip>
                            <Chip startContent={<Users size={16} />} color="warning" variant="solid">
                                {recipe.servings} servings
                            </Chip>
                            <Chip startContent={<ChefHat size={16} />} color="success" variant="solid">
                                {recipe.difficulty}
                            </Chip>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            isIconOnly={false}
                            variant={isFavorite ? "solid" : "bordered"}
                            color="danger"
                            className={isFavorite ? "bg-danger text-white" : "text-white border-white hover:bg-white/20"}
                            onPress={() => setIsFavorite(!isFavorite)}
                            startContent={<Heart className={isFavorite ? "fill-current" : ""} />}
                        >
                            Save
                        </Button>
                        <Button
                            isIconOnly
                            variant="flat"
                            className="bg-white/20 text-white backdrop-blur-md"
                        >
                            <Share2 />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section>
                <Card className="w-full">
                    <CardBody className="p-4 md:p-6">
                        <Tabs aria-label="Recipe details" color="primary" variant="underlined" size="lg" className="w-full">

                            {/* INGREDIENTS */}
                            <Tab key="ingredients" title="Ingrédients">
                                <div className="py-6 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-semibold">Ce qu'il vous faut</h3>
                                        <span className="text-default-500 text-sm">{recipe.ingredients.length} articles</span>
                                    </div>

                                    <CheckboxGroup
                                        color="success"
                                        defaultValue={[]}
                                    >
                                        {recipe.ingredients.map((ing, idx) => (
                                            <Checkbox
                                                key={idx}
                                                value={ing.name}
                                                className="w-full max-w-full hover:bg-default-100 p-2 rounded-lg transition-colors"
                                            >
                                                <div className="flex justify-between w-full min-w-[300px] md:min-w-[500px]">
                                                    <span className="font-medium">{ing.name}</span>
                                                    <span className="text-default-500">{ing.amount}</span>
                                                </div>
                                            </Checkbox>
                                        ))}
                                    </CheckboxGroup>

                                    {recipe.dietary.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-4 border-t border-divider">
                                            <span className="text-sm text-default-500 self-center mr-2">Contient:</span>
                                            {recipe.dietary.map((tag) => (
                                                <Chip key={tag} color="danger" variant="flat" size="sm">
                                                    {tag}
                                                </Chip>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Tab>

                            {/* INSTRUCTIONS */}
                            <Tab key="instructions" title="Instructions">
                                <div className="py-6 space-y-6">
                                    <h3 className="text-xl font-semibold">Préparation</h3>
                                    <div className="space-y-6">
                                        {recipe.instructions.map((step, idx) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-large text-default-700 leading-relaxed pt-1">
                                                    {step}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Tab>

                            {/* NUTRITION */}
                            <Tab key="nutrition" title="Nutrition">
                                <div className="py-6 space-y-6">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <Flame className="text-danger" /> Valeurs Nutritionnelles
                                    </h3>
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="flex-1">
                                            <Table removeWrapper aria-label="Nutrition Facts" isStriped className="h-auto">
                                                <TableHeader>
                                                    <TableColumn>NUTRIMENT</TableColumn>
                                                    <TableColumn>QUANTITÉ</TableColumn>
                                                    <TableColumn>% AJR</TableColumn>
                                                </TableHeader>
                                                <TableBody>
                                                    {recipe.nutrition.map((item, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell className="font-medium capitalize">{item.label}</TableCell>
                                                            <TableCell>{item.value}{item.unit}</TableCell>
                                                            <TableCell className="text-default-500">{item.daily}%</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <div className="flex items-center justify-center p-8 bg-default-100 rounded-xl min-w-[200px]">
                                            <div className="text-center">
                                                <span className="text-5xl font-bold text-success">{recipe.calories}</span>
                                                <p className="text-small text-default-500 uppercase font-bold tracking-wider mt-2">Calories / portion</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </CardBody>
                </Card>
            </section>

            {/* Video & Similar Placeholder */}
            <div className="p-8 border-2 border-dashed border-default-300 rounded-xl text-center text-default-500">
                Video & Similar Recipes Section - Coming Soon
            </div>
        </div>
    );
}
