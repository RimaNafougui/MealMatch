"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Select,
    SelectItem,
    Slider,
    Textarea,
    Checkbox,
    Spacer,
} from "@heroui/react";
import { Sparkles } from "lucide-react";

// Zod Schema for meal plan form validation
const mealPlanSchema = z.object({
    dietType: z.string().min(1, "Please select a diet type"),
    targetCalories: z.number().min(1200).max(3500),
    excludeIngredients: z.string().optional(),
    useProfilePreferences: z.boolean().default(false),
});

type MealPlanFormValues = z.infer<typeof mealPlanSchema>;

export default function GenerateMealPlanPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MealPlanFormValues>({
        resolver: zodResolver(mealPlanSchema),
        defaultValues: {
            targetCalories: 2000,
            excludeIngredients: "",
            useProfilePreferences: false,
        },
    });

    const useProfilePreferences = watch("useProfilePreferences");

    // TODO: Implement onSubmit handler
    const onSubmit = async (data: MealPlanFormValues) => {
        console.log("Form data:", data);
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <Card className="w-full">
                <CardHeader className="flex flex-col gap-1 pb-0">
                    <h1 className="text-2xl font-bold">Generate Meal Plan</h1>
                    <p className="text-sm text-default-500">
                        Customize your weekly meal plan
                    </p>
                </CardHeader>
                <CardBody className="gap-6 py-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        {/* Use Profile Preferences Checkbox */}
                        <Controller
                            name="useProfilePreferences"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    isSelected={field.value}
                                    onValueChange={field.onChange}
                                    name={field.name}
                                    ref={field.ref}
                                    onBlur={field.onBlur}
                                >
                                    Use my profile preferences
                                </Checkbox>
                            )}
                        />

                        {/* Diet Type Select */}
                        <Controller
                            name="dietType"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Diet Type"
                                    placeholder="Select a diet"
                                    selectedKeys={field.value ? [field.value] : []}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        field.onChange(selected);
                                    }}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    errorMessage={errors.dietType?.message}
                                    isInvalid={!!errors.dietType}
                                    isDisabled={useProfilePreferences}
                                >
                                    <SelectItem key="vegetarian" textValue="Vegetarian">Vegetarian</SelectItem>
                                    <SelectItem key="vegan" textValue="Vegan">Vegan</SelectItem>
                                    <SelectItem key="gluten_free" textValue="Gluten Free">Gluten Free</SelectItem>
                                    <SelectItem key="ketogenic" textValue="Ketogenic">Ketogenic</SelectItem>
                                    <SelectItem key="paleo" textValue="Paleo">Paleo</SelectItem>
                                    <SelectItem key="omnivore" textValue="Omnivore">Omnivore</SelectItem>
                                </Select>
                            )}
                        />

                        {/* Target Calories Slider */}
                        <Controller
                            name="targetCalories"
                            control={control}
                            render={({ field }) => (
                                <div className="flex flex-col gap-2">
                                    <Slider
                                        label="Target Calories (daily)"
                                        step={50}
                                        minValue={1200}
                                        maxValue={3500}
                                        value={field.value}
                                        onChange={(val) => field.onChange(val as number)}
                                        isDisabled={useProfilePreferences}
                                        className="max-w-full"
                                        getValue={(v) => `${v} kcal`}
                                        name={field.name}
                                    />
                                    <p className="text-default-500 text-small">
                                        Selected: {field.value} kcal
                                    </p>
                                </div>
                            )}
                        />

                        {/* Exclude Ingredients Textarea */}
                        <Controller
                            name="excludeIngredients"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    label="Exclude Ingredients"
                                    placeholder="e.g., nuts, shellfish"
                                    description="Separate ingredients with commas"
                                    isDisabled={useProfilePreferences}
                                    errorMessage={errors.excludeIngredients?.message}
                                    isInvalid={!!errors.excludeIngredients}
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                />
                            )}
                        />

                        <Spacer y={2} />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            color="primary"
                            size="lg"
                            isLoading={isSubmitting}
                            startContent={!isSubmitting ? <Sparkles size={20} /> : undefined}
                            className="w-full sm:w-auto self-end font-semibold"
                        >
                            {isSubmitting ? "Generating..." : "Generate Meal Plan"}
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
