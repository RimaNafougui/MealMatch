"use client";

import React from "react";
import { useParams } from "next/navigation";
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
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Divider,
} from "@heroui/react";
import {
    Heart,
    Share2,
    Clock,
    Users,
    ChefHat,
    Flame,
} from "lucide-react";

// Mock data
const mockRecipe = {
    id: "1",
    title: "Spicy Garlic Shrimp Pasta",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    prepTime: "15 min",
    cookTime: "10 min",
    servings: 2,
    difficulty: "Easy",
    description: "A quick and delicious pasta dish with spicy garlic shrimp, fresh parsley, and a hint of lemon.",
    ingredients: [
        { id: "1", name: "Spaghetti", quantity: "200", unit: "g", allergens: ["Gluten"] },
        { id: "2", name: "Shrimp", quantity: "200", unit: "g", allergens: ["Shellfish"] },
        { id: "3", name: "Garlic", quantity: "4", unit: "cloves", allergens: [] },
        { id: "4", name: "Olive Oil", quantity: "2", unit: "tbsp", allergens: [] },
        { id: "5", name: "Red Pepper Flakes", quantity: "1", unit: "tsp", allergens: [] },
        { id: "6", name: "Parsley", quantity: "1/4", unit: "cup", allergens: [] },
        { id: "7", name: "Lemon", quantity: "1/2", unit: "fruit", allergens: [] },
        { id: "8", name: "Parmesan Cheese", quantity: "1/4", unit: "cup", allergens: ["Dairy"] },
    ],
    instructions: [
        "Boil a large pot of salted water. Cook spaghetti according to package instructions until al dente.",
        "While pasta cooks, heat olive oil in a large skillet over medium heat.",
        "Add minced garlic and red pepper flakes. Sauté for 1 minute until fragrant.",
        "Add shrimp to the skillet. Cook for 2-3 minutes per side until pink and opaque.",
        "Drain pasta, reserving 1/4 cup of pasta water.",
        "Toss pasta and reserved water into the skillet with the shrimp.",
        "Squeeze lemon juice and stir in chopped parsley.",
        "Serve immediately topped with grated Parmesan cheese.",
    ],
    nutrition: [
        { label: "Calories", amount: "450", dailyValue: "22%" },
        { label: "Protein", amount: "28g", dailyValue: "56%" },
        { label: "Carbs", amount: "55g", dailyValue: "18%" },
        { label: "Fats", amount: "14g", dailyValue: "21%" },
        { label: "Fiber", amount: "4g", dailyValue: "16%" },
        { label: "Sodium", amount: "680mg", dailyValue: "28%" },
    ],
};

export default function RecipeDetailPage() {
    const params = useParams();
    const [isFavorite, setIsFavorite] = React.useState(false);

    // Default checked ingredients
    const [selectedIngredients, setSelectedIngredients] = React.useState(
        mockRecipe.ingredients.map((i) => i.id)
    );

    return (
        <div className="w-full min-h-screen pb-10 bg-gray-50 dark:bg-zinc-950">
            {/* Hero Section */}
            <div className="relative w-full h-[400px] md:h-[500px]">
                {/* Background Image */}
                <Image
                    src={mockRecipe.image}
                    alt={mockRecipe.title}
                    radius="none"
                    width="100%"
                    className="w-full h-full object-cover z-0"
                    isBlurred
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none" />
            </div>

            {/* Main Content - Overlapping Card */}
            <div className="relative z-20 px-4 md:px-6 -mt-24 md:-mt-32 max-w-5xl mx-auto w-full">
                <Card className="w-full shadow-large border border-white/20 backdrop-blur-md bg-background/95">
                    <CardBody className="p-6 md:p-8 gap-6">

                        {/* Header Section */}
                        <div className="flex flex-col gap-4">
                            <h1 className="text-3xl md:text-5xl font-bold text-foreground">
                                {mockRecipe.title}
                            </h1>

                            <div className="flex flex-wrap gap-3 items-center">
                                <Chip variant="flat" color="primary" startContent={<Clock size={16} />}>
                                    Prep: {mockRecipe.prepTime}
                                </Chip>
                                <Chip variant="flat" color="warning" startContent={<Flame size={16} />}>
                                    Cook: {mockRecipe.cookTime}
                                </Chip>
                                <Chip variant="flat" color="secondary" startContent={<Users size={16} />}>
                                    {mockRecipe.servings} Servings
                                </Chip>
                                <Chip variant="flat" color="success" startContent={<ChefHat size={16} />}>
                                    {mockRecipe.difficulty}
                                </Chip>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <Button
                                    color="danger"
                                    variant="bordered"
                                    radius="full"
                                    startContent={<Heart size={20} className={isFavorite ? "fill-current" : ""} />}
                                    onPress={() => setIsFavorite(!isFavorite)}
                                >
                                    {isFavorite ? "Favorited" : "Add to Favorites"}
                                </Button>
                                <Button variant="light" radius="full" startContent={<Share2 size={20} />}>
                                    Share Recipe
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
                                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                cursor: "w-full bg-primary",
                                tab: "max-w-fit px-0 h-12",
                                tabContent: "group-data-[selected=true]:text-primary font-medium text-lg"
                            }}
                        >
                            {/* Ingredients Tab */}
                            <Tab key="ingredients" title="Ingredients" className="pt-4">
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-xl font-semibold">Shopping List</h3>
                                    <CheckboxGroup
                                        value={selectedIngredients}
                                        onValueChange={setSelectedIngredients}
                                        color="success"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                            {mockRecipe.ingredients.map((item) => (
                                                <Checkbox
                                                    key={item.id}
                                                    value={item.id}
                                                    classNames={{
                                                        base: "max-w-full w-full",
                                                        label: "w-full",
                                                    }}
                                                >
                                                    <div className="flex justify-between items-center w-full gap-2">
                                                        <span>
                                                            <span className="font-bold">{item.quantity} {item.unit}</span> {item.name}
                                                        </span>
                                                        {item.allergens.length > 0 && (
                                                            <div className="flex gap-1">
                                                                {item.allergens.map((allergen) => (
                                                                    <Chip key={allergen} color="danger" size="sm" variant="flat">
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
                                </div>
                            </Tab>

                            {/* Instructions Tab */}
                            <Tab key="instructions" title="Instructions" className="pt-4">
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-xl font-semibold">Directions</h3>
                                    <div className="space-y-4">
                                        {mockRecipe.instructions.map((step, index) => (
                                            <div key={index} className="flex gap-4 p-4 rounded-lg bg-default-50 hover:bg-default-100 transition-colors">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                                                    {index + 1}
                                                </div>
                                                <p className="text-base leading-relaxed text-default-800">
                                                    {step}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Tab>

                            {/* Nutrition Tab */}
                            <Tab key="nutrition" title="Nutrition" className="pt-4">
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-xl font-semibold">Nutrition Facts</h3>
                                    <Table aria-label="Nutrition Facts" isStriped shadow="none" removeWrapper>
                                        <TableHeader>
                                            <TableColumn>NUTRIENT</TableColumn>
                                            <TableColumn>AMOUNT</TableColumn>
                                            <TableColumn>% DAILY VALUE</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {mockRecipe.nutrition.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{item.label}</TableCell>
                                                    <TableCell>{item.amount}</TableCell>
                                                    <TableCell className="text-default-500">{item.dailyValue}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Tab>
                        </Tabs>

                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
