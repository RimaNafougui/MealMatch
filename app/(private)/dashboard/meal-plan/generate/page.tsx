"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Divider,
  Chip,
  Progress,
  Spinner,
  Skeleton,
  Card,
  CardBody,
} from "@heroui/react";
import { Sparkles, ChefHat, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@heroui/button";
import { toast } from "sonner";
import { GenerateConfig } from "@/components/meal-plan/GenerateConfig";
import { MealPlanGrid } from "@/components/meal-plan/MealPlanGrid";
import {
  MealPlanConfig,
  GeneratedMealPlan,
  SavedMealPlan,
} from "@/types/meal-plan";
import { format, startOfWeek } from "date-fns";

// Skeleton grid shown while generating
function MealPlanGridSkeleton({ days, meals }: { days: number; meals: number }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Summary bar skeleton */}
      <Card className="border border-divider bg-content1">
        <CardBody className="p-4">
          <div className="flex flex-wrap items-center gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-5 w-12 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Grid skeleton */}
      <div className="overflow-x-auto pb-2">
        <div
          className="grid gap-3 min-w-[640px]"
          style={{
            gridTemplateColumns: `120px repeat(${days}, minmax(180px, 1fr))`,
          }}
        >
          {/* Header row */}
          <div />
          {Array.from({ length: days }).map((_, i) => (
            <div key={i} className="text-center pb-1 flex flex-col items-center gap-1">
              <Skeleton className="h-4 w-10 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          ))}

          {/* Meal rows */}
          {Array.from({ length: meals }).map((_, row) => (
            <>
              <div key={`label-${row}`} className="flex items-center pr-3">
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              {Array.from({ length: days }).map((_, col) => (
                <Card
                  key={`cell-${row}-${col}`}
                  className="border border-divider bg-content1"
                >
                  <CardBody className="p-3 flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-2/3 rounded" />
                    <div className="flex gap-2 mt-1">
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </>
          ))}
        </div>
      </div>

      {/* Save button skeleton */}
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  );
}

export default function GenerateMealPlanPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [config, setConfig] = useState<MealPlanConfig>({
    days_count: 5,
    meals_per_day: 3,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMealPlan | null>(null);
  const [mealLabels, setMealLabels] = useState<string[]>([]);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [hasExistingPlan, setHasExistingPlan] = useState(false);
  const [existingPlanDate, setExistingPlanDate] = useState<string | undefined>();
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planReady, setPlanReady] = useState(false);

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

  // Check if user already has a plan this week
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
            setGeneratedPlan(plan.meals as GeneratedMealPlan);
            setMealLabels(plan.meal_labels || ["breakfast", "lunch", "dinner"]);
            setSavedPlanId(plan.id);
            setConfig({
              days_count: (plan.days_count as 5 | 7) || 5,
              meals_per_day: (plan.meals_per_day as 1 | 2 | 3) || 3,
            });
            setPlanReady(true);
          }
        }
      } catch {
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
    setError(null);
    setPlanReady(false);
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

      // Slight delay for fade-in animation
      setTimeout(() => {
        setPlanReady(true);
        document
          .getElementById("meal-plan-grid")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err: any) {
      setError(err.message || "Failed to generate meal plan");
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

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "MMM d");
  const weekEnd = format(
    new Date(
      startOfWeek(new Date(), { weekStartsOn: 1 }).getTime() + 6 * 24 * 60 * 60 * 1000,
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
          restrictions, budget, and favourite recipes. You can edit any meal
          before saving.
        </p>

        {/* Indeterminate progress bar during generation */}
        {isGenerating && (
          <Progress
            isIndeterminate
            color="success"
            size="sm"
            className="mt-3"
            aria-label="Generating meal plan..."
          />
        )}
      </div>

      {checkingPlan ? (
        /* Initial load skeleton */
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="xl:w-80 shrink-0 flex flex-col gap-6">
            <Skeleton className="h-4 w-28 rounded" />
            <Card className="border border-divider bg-content1">
              <CardBody className="gap-4 p-5">
                <Skeleton className="h-4 w-36 rounded-lg" />
                <div className="flex gap-3">
                  <Skeleton className="flex-1 h-16 rounded-xl" />
                  <Skeleton className="flex-1 h-16 rounded-xl" />
                </div>
              </CardBody>
            </Card>
            <Card className="border border-divider bg-content1">
              <CardBody className="gap-4 p-5">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <div className="flex gap-3">
                  <Skeleton className="flex-1 h-16 rounded-xl" />
                  <Skeleton className="flex-1 h-16 rounded-xl" />
                  <Skeleton className="flex-1 h-16 rounded-xl" />
                </div>
              </CardBody>
            </Card>
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <Divider orientation="vertical" className="hidden xl:block" />
          <div className="flex-1 min-w-0 flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" color="success" />
              <p className="text-foreground/40 text-sm">Loading your plan...</p>
            </div>
          </div>
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
          <div className="flex-1 min-w-0 relative" id="meal-plan-grid">

            {/* Spinner overlay during generation */}
            {isGenerating && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 backdrop-blur-sm bg-background/60 rounded-2xl">
                <Spinner size="lg" color="success" />
                <div className="text-center">
                  <p className="font-semibold text-foreground/80">
                    Generating your meal plan...
                  </p>
                  <p className="text-xs text-foreground/40 mt-1">
                    Our AI is crafting {config.days_count * config.meals_per_day} personalized meals for you
                  </p>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !isGenerating && (
              <Card className="border border-danger/30 bg-danger/5 mb-6">
                <CardBody className="flex flex-row items-center gap-4 p-4">
                  <div className="p-2 rounded-xl bg-danger/10 shrink-0">
                    <AlertTriangle size={20} className="text-danger" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-danger">
                      Generation failed
                    </p>
                    <p className="text-xs text-foreground/50 mt-0.5">{error}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    startContent={<RefreshCw size={14} />}
                    onPress={handleGenerate}
                  >
                    Retry
                  </Button>
                </CardBody>
              </Card>
            )}

            {/* Skeleton grid while generating (when no existing plan yet) */}
            {isGenerating && !generatedPlan && (
              <MealPlanGridSkeleton
                days={config.days_count}
                meals={config.meals_per_day}
              />
            )}

            {/* Generated plan with fade-in */}
            {generatedPlan && !isGenerating && (
              <div
                className={`transition-opacity duration-500 ${
                  planReady ? "opacity-100" : "opacity-0"
                }`}
              >
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
              </div>
            )}

            {/* Empty state */}
            {!generatedPlan && !isGenerating && !error && (
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
