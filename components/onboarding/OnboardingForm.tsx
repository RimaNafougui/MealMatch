"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingSteps } from "./OnboardingSteps";
import { Button, CheckboxGroup, Checkbox, Textarea } from "@heroui/react";
import { supabase } from "@/utils/supabase";
import { siteConfig } from "@/config/site";

const steps = [
  { label: "Restrictions alimentaires" },
  { label: "Allergies" },
  { label: "Résumé" },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
      else setUserId(user.id);
    });
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dietary_restrictions: dietaryRestrictions, allergies }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Erreur onboarding:", data.error);
        setLoading(false);
        return;
      }

      // Redirection vers dashboard
      router.push(siteConfig.navMenuItems.find(item => item.label === "Dashboard")?.href || "/dashboard");
    } catch (err) {
      console.error("Erreur onboarding:", err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-background rounded-lg shadow-md">
      <h1 className="text-h1 font-bold mb-6">Bienvenue sur MealMatch !</h1>

      {/* Stepper */}
      <OnboardingSteps steps={steps} currentStep={currentStep} />

      {/* Step content */}
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
        <Textarea
          placeholder="Listez vos allergies ici..."
          value={allergies.join(", ")}
          onChange={(e) =>
            setAllergies(e.target.value.split(",").map((a) => a.trim()))
          }
        />
      )}

      {currentStep === 2 && (
        <div>
          <h2 className="font-semibold mb-2">Résumé</h2>
          <p><strong>Restrictions alimentaires:</strong> {dietaryRestrictions.join(", ") || "Aucune"}</p>
          <p><strong>Allergies:</strong> {allergies.join(", ") || "Aucune"}</p>
        </div>
      )}

      <Button
        color="primary"
        onPress={handleNext}
        disabled={loading}
        className="mt-4"
      >
        {currentStep < steps.length - 1 ? "Suivant" : loading ? "Sauvegarde..." : "Terminer"}
      </Button>
    </div>
  );
}
