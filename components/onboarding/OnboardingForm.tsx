"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  CheckboxGroup,
  Checkbox,
  Textarea,
} from "@heroui/react";
import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "@/config/site";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Récupérer l'utilisateur actuel
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login"); // redirection si non connecté
      else setUserId(user.id);
    });
  }, []);

  const handleSubmit = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          dietary_restrictions: dietaryRestrictions,
          allergies,
          onboarding_completed: true,
        })
        .eq("id", userId);

      if (error) {
        console.error("Erreur Supabase:", error);
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

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Restrictions alimentaires</h2>
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
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Allergies</h2>
        <Textarea
          placeholder="Listez vos allergies ici..."
          value={allergies.join(", ")}
          onChange={(e) =>
            setAllergies(e.target.value.split(",").map((a) => a.trim()))
          }
        />
      </div>

      <Button color="primary" onPress={handleSubmit} disabled={loading}>
        {loading ? "Sauvegarde..." : "Terminer"}
      </Button>
    </div>
  );
}
