"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import type { Selection } from "@react-types/shared";
import type { FieldErrors } from "react-hook-form";

// Zod Schema for meal plan form validation
const mealPlanSchema = z.object({
    dietType: z.string().min(1, "Please select a diet type"),

    targetCalories: z
        .union([z.number(), z.array(z.number())])
        .transform((val) => (Array.isArray(val) ? val[0] : val))
        .pipe(z.number().min(1200).max(3500)),

    excludeIngredients: z.string().optional(),
    useProfilePreferences: z.boolean().default(false),
});

type MealPlanFormInput = z.input<typeof mealPlanSchema>;
type MealPlanFormValues = z.output<typeof mealPlanSchema>;


export default function GenerateMealPlanPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MealPlanFormInput>({
        resolver: zodResolver(mealPlanSchema),
        defaultValues: {
            dietType: "",
            targetCalories: 2000,
            excludeIngredients: "",
            useProfilePreferences: false,
        },
    });


    const useProfilePreferences = watch("useProfilePreferences");

    // Auto-fill from profile when checkbox is checked
    const handleProfilePrefChange = (isSelected: boolean) => {
        if (isSelected) {
            // Mock data from user profile
            setValue("dietType", "vegetarian");
            setValue("targetCalories", 1800 as MealPlanFormInput["targetCalories"]);
            setValue("excludeIngredients", "peanuts");
        }
    };

    // Submit handler with simulated API call
    const onSubmit = async (data: MealPlanFormValues) => {
        setIsSubmitting(true);

        try {
            console.log("Form Data:", data);

            await new Promise<string>((resolve, reject) => {
                setTimeout(() => {
                    const isSuccess = Math.random() > 0.1;
                    if (isSuccess) resolve("Success");
                    else reject(new Error("Failed to generate meal plan. Please try again."));
                }, 1500);
            });

            const mockPlanId = "plan-" + Date.now();
            router.push(`/dashboard/meal-plans/${mockPlanId}`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred.";
            console.error("Generation error:", error);
            alert(message);
        } finally {
            setIsSubmitting(false);
        }
    };
    const onError = (errors: FieldErrors<MealPlanFormValues>) => {
        console.log("VALIDATION ERRORS:", errors);
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
                    <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-6">
                        {/* Use Profile Preferences Checkbox */}
                        <Controller
                            name="useProfilePreferences"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    isSelected={field.value}
                                    onValueChange={(isSelected: boolean) => {
                                        field.onChange(isSelected);
                                        handleProfilePrefChange(isSelected);
                                    }}
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
                            render={({ field, fieldState }) => (
                                <Select
                                    label="Diet Type"
                                    placeholder="Select a diet"
                                    selectedKeys={field.value ? new Set([field.value]) : new Set()}
                                    onSelectionChange={(keys: Selection) => {
                                        if (keys === "all") return;
                                        const value = Array.from(keys)[0];
                                        if (typeof value === "string") {
                                            field.onChange(value);
                                        }
                                    }}
                                    onBlur={field.onBlur}
                                    isInvalid={!!fieldState.error}
                                    errorMessage={fieldState.error?.message}
                                    isDisabled={useProfilePreferences}
                                >
                                    <SelectItem key="vegetarian">Vegetarian</SelectItem>
                                    <SelectItem key="vegan">Vegan</SelectItem>
                                    <SelectItem key="gluten_free">Gluten Free</SelectItem>
                                    <SelectItem key="ketogenic">Ketogenic</SelectItem>
                                    <SelectItem key="paleo">Paleo</SelectItem>
                                    <SelectItem key="omnivore">Omnivore</SelectItem>
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
                                        onChange={(val: number | number[]) => field.onChange(val)}
                                        isDisabled={useProfilePreferences}
                                        className="max-w-full"
                                        getValue={(v) => `${Array.isArray(v) ? v[0] : v} kcal`}
                                    />
                                    <p className="text-default-500 text-small">
                                        Selected: {Array.isArray(field.value) ? field.value[0] : field.value} kcal
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
