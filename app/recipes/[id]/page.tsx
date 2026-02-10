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
    Listbox,
    ListboxItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@heroui/react";
import {
    Heart,
    Share2,
    Clock,
    Users,
    ChefHat,
    Flame,
    Wheat,
    Milk,
    Egg,
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
    // Default checked ingredients (all of them initially)
    const [selectedIngredients, setSelectedIngredients] = React.useState(
        mockRecipe.ingredients.map((i) => i.id)
    );

    return (
        <div className="w-full min-h-screen pb-10">
            {/* Hero Section */}
            <div className="relative w-full h-[500px]">
                {/* Background Image */}
                <Image
                    src={mockRecipe.image}
                    alt={mockRecipe.title}
                    radius="none"
                    width="100%"
                    className="w-full h-full object-cover z-0"
                    isBlurred
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />

                {/* Content Wrapper Card */}
                <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-6 translate-y-1/3 md:translate-y-12 max-w-7xl mx-auto w-full flex justify-center md:justify-start">
                    <Card className="w-full md:max-w-3xl p-4 shadow-xl border border-white/20 backdrop-blur-md bg-background/90 dark:bg-background/80">
                        <CardBody className="gap-4">
                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                {mockRecipe.title}
                            </h1>

                            {/* Metadata Row */}
                            <div className="flex flex-wrap gap-3 items-center">
                                <Chip
                                    variant="flat"
                                    color="primary"
                                    startContent={<Clock size={16} />}
                                >
                                    Prep: {mockRecipe.prepTime}
                                </Chip>
                                <Chip
                                    variant="flat"
                                    color="warning"
                                    startContent={<Flame size={16} />}
                                >
                                    Cook: {mockRecipe.cookTime}
                                </Chip>
                                <Chip
                                    variant="flat"
                                    color="secondary"
                                    startContent={<Users size={16} />}
                                >
                                    {mockRecipe.servings} Servings
                                </Chip>
                                <Chip
                                    variant="flat"
                                    color="success"
                                    startContent={<ChefHat size={16} />}
                                >
                                    {mockRecipe.difficulty}
                                </Chip>
                            </div>

                            {/* Actions Row */}
                            <div className="flex flex-wrap gap-3 pt-2">
                                <Button
                                    color="danger"
                                    variant="bordered"
                                    radius="full"
                                    startContent={
                                        <Heart
                                            size={20}
                                            className={isFavorite ? "fill-current" : ""}
                                        />
                                    }
                                    onPress={() => setIsFavorite(!isFavorite)}
                                >
                                    {isFavorite ? "Favorited" : "Add to Favorites"}
                                </Button>
                                <Button
                                    variant="light"
                                    radius="full"
                                    startContent={<Share2 size={20} />}
                                >
                                    Share Recipe
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Spacer to push content down because of the overlapping card and add separation */}
            <div className="h-40 md:h-32"></div>

            {/* Tabs Section */}
            <div className="max-w-7xl mx-auto px-6 mt-8">
                <Tabs aria-label="Recipe details" color="primary" variant="underlined">
                    {/* Ingredients Tab */}
                    <Tab key="ingredients" title="Ingredients">
                        <Card className="mt-4 shadow-sm">
                            <CardBody>
                                <CheckboxGroup
                                    label="Select ingredients you have"
                                    value={selectedIngredients}
                                    onValueChange={setSelectedIngredients}
                                    color="success"
                                    classNames={{
                                        base: "w-full",
                                    }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        {mockRecipe.ingredients.map((item) => (
                                            <Checkbox
                                                key={item.id}
                                                value={item.id}
                                                classNames={{
                                                    label: "w-full",
                                                    base: "w-full max-w-none border-b border-divider pb-2 mb-2",
                                                }}
                                            >
                                                <div className="flex justify-between items-center w-full gap-4">
                                                    <span className="text-base">
                                                        <span className="font-semibold">
                                                            {item.quantity} {item.unit}
                                                        </span>{" "}
                                                        {item.name}
                                                    </span>
                                                    {item.allergens.length > 0 && (
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
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* Instructions Tab */}
                    <Tab key="instructions" title="Instructions">
                        <Card className="mt-4 shadow-sm">
                            <CardBody>
                                <Listbox
                                    aria-label="Cooking instructions"
                                    variant="flat"
                                    itemClasses={{
                                        base: "py-3 px-2 data-[hover=true]:bg-default-100",
                                        title: "text-base",
                                    }}
                                    className="p-0"
                                >
                                    {mockRecipe.instructions.map((step, index) => (
                                        <ListboxItem
                                            key={index}
                                            textValue={`Step ${index + 1}`}
                                            startContent={
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold mr-2 shrink-0">
                                                    {index + 1}
                                                </div>
                                            }
                                            className="whitespace-normal h-auto"
                                        >
                                            <span className="text-lg leading-relaxed">{step}</span>
                                        </ListboxItem>
                                    ))}
                                </Listbox>
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* Nutrition Tab */}
                    <Tab key="nutrition" title="Nutrition">
                        <Card className="mt-4 shadow-sm">
                            <CardBody>
                                <Table aria-label="Nutrition Facts" isStriped shadow="none">
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
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
}
