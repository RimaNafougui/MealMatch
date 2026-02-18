"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingSteps } from "./OnboardingSteps";
import {
  Button,
  CheckboxGroup,
  Checkbox,
  Slider,
  Spinner,
} from "@heroui/react";
import { siteConfig } from "@/config/site";

const steps = [
  { label: "Restrictions alimentaires" },
  { label: "Allergies" },
  { label: "Budget" },
  { label: "Résumé" },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([20, 100]);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    fetch("/api/profiles/onboarding-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.onboardingCompleted) {
          router.push("/dashboard");
        } else {
          setCheckingStatus(false);
        }
      })
      .catch(() => {
        setCheckingStatus(false);
      });
  }, [router]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profiles/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dietary_restrictions: dietaryRestrictions,
          allergies,
          budget_min: budgetRange[0],
          budget_max: budgetRange[1],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Erreur onboarding:", data.error);
        setLoading(false);
        return;
      }

      router.push(
        siteConfig.navMenuItems.find((item) => item.label === "Dashboard")
          ?.href || "/dashboard",
      );
    } catch (err) {
      console.error("Erreur onboarding:", err);
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-background rounded-lg shadow-md">
      <h1 className="text-h1 font-bold mb-6">Bienvenue sur MealMatch !</h1>

      <OnboardingSteps steps={steps} currentStep={currentStep} />

      {currentStep === 0 && (
        <CheckboxGroup
          value={dietaryRestrictions}
          onChange={setDietaryRestrictions}
          orientation="vertical"
        >
          <Checkbox value="vegetarian">Végétarien</Checkbox>
          <Checkbox value="vegan">Végan</Checkbox>
          <Checkbox value="gluten_free">Sans gluten</Checkbox>
          <Checkbox value="lactose_free">Sans lactose</Checkbox>
          <Checkbox value="halal">Halal</Checkbox>
          <Checkbox value="kosher">Casher</Checkbox>
          <Checkbox value="pescatarian">Pescatarien</Checkbox>
        </CheckboxGroup>
      )}

      {currentStep === 1 && (
        <CheckboxGroup
          value={dietaryRestrictions}
          onChange={setAllergies}
          orientation="vertical"
        >
          <Checkbox value="Dairy">Produit Laitier</Checkbox>
          <Checkbox value="Egg">Oeufs</Checkbox>
          <Checkbox value="Gluten">Gluten</Checkbox>
          <Checkbox value="Grain">Grain</Checkbox>
          <Checkbox value="Peanut">Arachides</Checkbox>
          <Checkbox value="Seafood">Fruit de Mer</Checkbox>
          <Checkbox value="Sesame">Sésame</Checkbox>
          <Checkbox value="Shellfish">Coquillages</Checkbox>
          <Checkbox value="Soy">Soya</Checkbox>
          <Checkbox value="Tree Nut">Noix</Checkbox>
          <Checkbox value="Wheat">Blé</Checkbox>
        </CheckboxGroup>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="font-semibold">Budget hebdomadaire</h2>
          <Slider
            label="Sélectionnez votre fourchette de budget"
            step={5}
            minValue={0}
            maxValue={200}
            value={budgetRange}
            onChange={(value) => setBudgetRange(value as [number, number])}
            formatOptions={{ style: "currency", currency: "CAD" }}
          />
          <p className="text-sm text-default-500">
            {budgetRange[0]}$ — {budgetRange[1]}$ par semaine
          </p>
        </div>
      )}

      {currentStep === 3 && (
        <div>
          <h2 className="font-semibold mb-2">Résumé</h2>
          <p>
            <strong>Restrictions alimentaires:</strong>{" "}
            {dietaryRestrictions.join(", ") || "Aucune"}
          </p>
          <p>
            <strong>Allergies:</strong> {allergies.join(", ") || "Aucune"}
          </p>
          <p>
            <strong>Budget:</strong> {budgetRange[0]}$ — {budgetRange[1]}$ par
            semaine
          </p>
        </div>
      )}

      <Button
        color="primary"
        onPress={handleNext}
        disabled={loading}
        className="mt-4"
      >
        {currentStep < steps.length - 1
          ? "Suivant"
          : loading
            ? "Sauvegarde..."
            : "Terminer"}
      </Button>
    </div>
  );
}
