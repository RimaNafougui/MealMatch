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
    CardFooter,
    Button,
    Select,
    SelectItem,
    Slider,
    Textarea,
    Checkbox,
    Spacer,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@heroui/react";
import { Sparkles } from "lucide-react";
import type { Selection } from "@react-types/shared";
import type { FieldErrors } from "react-hook-form";

// Zod Schema for meal plan form validation
const mealPlanSchema = z.object({
    dietType: z.string().min(1, "Please select a diet type"),
    targetCalories: z.number().min(1200).max(3500),
    excludeIngredients: z.string().optional(),
    useProfilePreferences: z.boolean(),
});

type MealPlanFormValues = z.infer<typeof mealPlanSchema>;

export default function GenerateMealPlanClient() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [errorMessage, setErrorMessage] = useState("");

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MealPlanFormValues>({
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
            setValue("targetCalories", 1800);
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
            setErrorMessage(message);
            onOpen();
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
                    <h1 className="text-2xl font-bold">Générer un plan de repas</h1>
                    <p className="text-sm text-default-500">
                        Personnalisez votre plan de repas hebdomadaire
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
                                    Utiliser mes préférences de profil
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
                                    <SelectItem key="vegetarian">Végétarien</SelectItem>
                                    <SelectItem key="vegan">Végétalien</SelectItem>
                                    <SelectItem key="gluten_free">Sans Gluten</SelectItem>
                                    <SelectItem key="ketogenic">Cétogène</SelectItem>
                                    <SelectItem key="paleo">Paléo</SelectItem>
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
                                        onChange={(val) => field.onChange(Array.isArray(val) ? val[0] : val)}
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

                        <CardFooter className="px-0 pb-0 justify-end">
                            {/* Submit Button */}
                            <Button
                                type="submit"
                                color="primary"
                                size="lg"
                                isLoading={isSubmitting}
                                startContent={!isSubmitting ? <Sparkles size={20} /> : undefined}
                                className="w-full sm:w-auto font-semibold"
                            >
                                {isSubmitting ? "Générer le plan" : "Générer le plan de repas"}
                            </Button>
                        </CardFooter>
                    </form>
                </CardBody>
            </Card>

            {/* Error Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-danger">Génération échouée</ModalHeader>
                            <ModalBody>
                                <p>{errorMessage}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Fermer
                                </Button>
                                <Button color="primary" onPress={onClose}>
                                    Essayer à nouveau
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}