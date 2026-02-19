"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Divider, Chip } from "@heroui/react";
import { Sparkles, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { GenerateConfig } from "@/components/meal-plan/GenerateConfig";
import { MealPlanGrid } from "@/components/meal-plan/MealPlanGrid";
import {
  MealPlanConfig,
  GeneratedMealPlan,
  SavedMealPlan,
} from "@/types/meal-plan";
import { format, startOfWeek } from "date-fns";

export default function GenerateMealPlanPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [config, setConfig] = useState<MealPlanConfig>({
    days_count: 5,
    meals_per_day: 3,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMealPlan | null>(
    null,
  );
  const [mealLabels, setMealLabels] = useState<string[]>([]);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [hasExistingPlan, setHasExistingPlan] = useState(false);
  const [existingPlanDate, setExistingPlanDate] = useState<
    string | undefined
  >();
  const [checkingPlan, setCheckingPlan] = useState(true);

  // Load saved config preferences
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch("/api/meal-plan/config");
        if (res.ok) {
          const savedConfig = await res.json();
          setConfig({
            days_count: savedConfig.days_count || 5,
            meals_per_day: savedConfig.meals_per_day || 3,
          });
        }
      } catch {}
    };
    if (session?.user) loadConfig();
  }, [session]);

  // Auto-save config when changed
  const handleConfigChange = async (newConfig: MealPlanConfig) => {
    setConfig(newConfig);
    try {
      await fetch("/api/meal-plan/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
    } catch {}
  };

  // Check if user already has a plan this week (load existing draft if any)
  useEffect(() => {
    const checkExisting = async () => {
      try {
        const res = await fetch("/api/meal-plan/current");
        if (res.ok) {
          const data = await res.json();
          if (data.plan) {
            const plan: SavedMealPlan = data.plan;
            setHasExistingPlan(true);
            setExistingPlanDate(
              format(
                new Date(plan.generated_at || plan.created_at),
                "MMMM d, yyyy 'at' h:mm a",
              ),
            );
            // Load the existing plan into the editor
            setGeneratedPlan(plan.meals as GeneratedMealPlan);
            setMealLabels(plan.meal_labels || ["breakfast", "lunch", "dinner"]);
            setSavedPlanId(plan.id);
            setConfig({
              days_count: (plan.days_count as 5 | 7) || 5,
              meals_per_day: (plan.meals_per_day as 1 | 2 | 3) || 3,
            });
          }
        }
      } catch (err) {
        // No existing plan, that's fine
      } finally {
        setCheckingPlan(false);
      }
    };
    if (session?.user) checkExisting();
    else setCheckingPlan(false);
  }, [session]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/meal-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "already_generated") {
          toast.error("You've already generated a plan this week!");
          setHasExistingPlan(true);
          setExistingPlanDate(
            data.generated_at
              ? format(new Date(data.generated_at), "MMMM d 'at' h:mm a")
              : "earlier this week",
          );
          return;
        }
        throw new Error(data.error || "Failed to generate");
      }

      setGeneratedPlan(data.meal_plan);
      setMealLabels(data.config.meal_labels);
      setSavedPlanId(data.plan.id);
      setHasExistingPlan(true);
      setExistingPlanDate(format(new Date(), "MMMM d 'at' h:mm a"));
      toast.success("Meal plan generated! Review and edit below.");

      // Scroll to plan
      setTimeout(() => {
        document
          .getElementById("meal-plan-grid")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate meal plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPlan || !savedPlanId) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/meal-plan/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: savedPlanId, meals: generatedPlan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      toast.success("Plan saved! Redirecting to your dashboard...");
      setTimeout(() => router.push("/dashboard/meal-plans"), 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to save meal plan");
    } finally {
      setIsSaving(false);
    }
  };

  const weekStart = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    "MMM d",
  );
  const weekEnd = format(
    new Date(
      startOfWeek(new Date(), { weekStartsOn: 1 }).getTime() +
        6 * 24 * 60 * 60 * 1000,
    ),
    "MMM d, yyyy",
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-6">
      {/* Page header */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <ChefHat size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Generate Meal Plan
            </h1>
            <p className="text-sm text-foreground/50">
              Week of {weekStart} – {weekEnd}
            </p>
          </div>
          <Chip
            color="primary"
            variant="flat"
            size="sm"
            className="ml-auto"
            startContent={<Sparkles size={12} />}
          >
            AI-Powered
          </Chip>
        </div>
        <p className="text-foreground/60 text-sm max-w-xl mt-1">
          Your personalized meal plan is generated based on your dietary
          restrictions, budget, and favorite recipes. You can edit any meal
          before saving.
        </p>
      </div>

      {checkingPlan ? (
        <div className="flex items-center justify-center py-20 text-foreground/40">
          Loading...
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left: Config */}
          <div className="xl:w-80 shrink-0">
            <div className="xl:sticky xl:top-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/50 mb-4">
                Configuration
              </h2>
              <GenerateConfig
                initialConfig={config}
                onConfigChange={handleConfigChange}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                hasExistingPlan={hasExistingPlan}
                existingPlanDate={existingPlanDate}
              />
            </div>
          </div>

          <Divider orientation="vertical" className="hidden xl:block" />

          {/* Right: Plan grid */}
          <div className="flex-1 min-w-0" id="meal-plan-grid">
            {generatedPlan ? (
              <>
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/50 mb-4">
                  Your Meal Plan
                  <span className="ml-2 text-foreground/30 font-normal normal-case tracking-normal">
                    — hover any meal to edit
                  </span>
                </h2>
                <MealPlanGrid
                  plan={generatedPlan}
                  planId={savedPlanId!}
                  mealLabels={mealLabels}
                  onPlanChange={setGeneratedPlan}
                  onSave={handleSave}
                  isSaving={isSaving}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="p-6 rounded-2xl bg-content2 border border-dashed border-divider">
                  <Sparkles
                    size={40}
                    className="text-foreground/20 mx-auto mb-3"
                  />
                  <p className="text-foreground/40 text-sm max-w-xs">
                    Configure your preferences and click{" "}
                    <span className="font-semibold text-foreground/60">
                      Generate Meal Plan
                    </span>{" "}
                    to get started.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
