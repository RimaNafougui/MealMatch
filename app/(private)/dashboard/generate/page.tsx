"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, Tab, Chip, Button } from "@heroui/react";
import { Sparkles, ChefHat, Settings, CalendarDays, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { GenerateConfig } from "@/components/meal-plan/GenerateConfig";
import { MealPlanGrid } from "@/components/meal-plan/MealPlanGrid";
import { MealPlanPaywallModal } from "@/components/meal-plan/MealPlanPaywallModal";
import { UsageIndicator } from "@/components/meal-plan/UsageIndicator";
import {
  MealPlanConfig,
  GeneratedMealPlan,
  SavedMealPlan,
} from "@/types/meal-plan";
import { format, startOfWeek } from "date-fns";
import { useUserPlan } from "@/hooks/useUserPlan";

// Store generation times locally for future reporting
function recordGenerationTime(ms: number) {
  try {
    const key = "mealmatch_generation_times";
    const existing: number[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    existing.push(ms);
    // Keep last 50 entries
    localStorage.setItem(key, JSON.stringify(existing.slice(-50)));
  } catch {}
}

export default function GenerateMealPlanPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: planData, isLoading: planLoading } = useUserPlan();
  const userPlan = planData?.plan ?? "free";
  const maxSlotRegens = userPlan === "free" ? 2 : Infinity;
  const [slotRegenCount, setSlotRegenCount] = useState(0);

  const [config, setConfig] = useState<MealPlanConfig>({
    days_count: 5,
    meals_per_day: 3,
  });

  const [activeTab, setActiveTab] = useState<"configuration" | "plan">("configuration");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMealPlan | null>(null);
  const [mealLabels, setMealLabels] = useState<string[]>([]);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [hasExistingPlan, setHasExistingPlan] = useState(false);
  const [existingPlanDate, setExistingPlanDate] = useState<string | undefined>();
  const [checkingPlan, setCheckingPlan] = useState(true);

  // Generation timing
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastGenerationTime, setLastGenerationTime] = useState<number | null>(null);
  const generationStartRef = useRef<number | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Paywall + usage counter
  const [showPaywall, setShowPaywall] = useState(false);
  const [monthlyCount, setMonthlyCount] = useState<number | null>(null);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(null);

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

  // Fetch monthly usage for free users
  useEffect(() => {
    if (planLoading || userPlan !== "free") return;
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/meal-plan/usage");
        if (res.ok) {
          const data = await res.json();
          setMonthlyCount(data.count ?? 0);
          setMonthlyLimit(data.limit ?? 2);
        }
      } catch {}
    };
    fetchUsage();
  }, [userPlan, planLoading]);

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
              format(new Date(plan.generated_at || plan.created_at), "MMMM d, yyyy 'at' h:mm a"),
            );
            setGeneratedPlan(plan.meals as GeneratedMealPlan);
            setMealLabels(plan.meal_labels || ["breakfast", "lunch", "dinner"]);
            setSavedPlanId(plan.id);
            setConfig({
              days_count: (plan.days_count as 5 | 7) || 5,
              meals_per_day: (plan.meals_per_day as 1 | 2 | 3) || 3,
            });
            setActiveTab("plan");
          }
        }
      } catch {
        // No existing plan
      } finally {
        setCheckingPlan(false);
      }
    };
    if (session?.user) checkExisting();
    else setCheckingPlan(false);
  }, [session]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    };
  }, []);

  const startElapsedTimer = () => {
    setElapsedSeconds(0);
    generationStartRef.current = Date.now();
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - (generationStartRef.current ?? Date.now())) / 1000));
    }, 1000);
  };

  const stopElapsedTimer = () => {
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
    const elapsed = generationStartRef.current ? Date.now() - generationStartRef.current : 0;
    generationStartRef.current = null;
    return elapsed;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setLastGenerationTime(null);
    setActiveTab("plan");

    const controller = new AbortController();
    abortControllerRef.current = controller;
    startElapsedTimer();

    try {
      const res = await fetch("/api/meal-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
        signal: controller.signal,
      });

      // Non-2xx before stream starts → JSON error
      if (!res.ok) {
        const data = await res.json();
        if (data.error === "monthly_limit_reached") {
          setShowPaywall(true);
          setActiveTab("configuration");
          return;
        }
        throw new Error(data.error || "Failed to generate");
      }

      // Read SSE stream
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          const event = JSON.parse(jsonStr);

          if (event.type === "done") {
            const elapsed = stopElapsedTimer();
            setLastGenerationTime(elapsed);
            recordGenerationTime(elapsed);
            setGeneratedPlan(event.meal_plan);
            setMealLabels(event.config.meal_labels);
            setSavedPlanId(event.plan.id);
            setHasExistingPlan(true);
            setExistingPlanDate(format(new Date(), "MMMM d 'at' h:mm a"));
            setMonthlyCount((c) => (c !== null ? c + 1 : null));
            toast.success(`Plan généré en ${(elapsed / 1000).toFixed(1)}s !`);
            break outer;
          }

          if (event.type === "error") {
            throw new Error(event.error || "Failed to generate meal plan");
          }
        }
      }
    } catch (err: any) {
      stopElapsedTimer();
      if (err.name === "AbortError") {
        toast.info("Génération annulée.");
        if (!generatedPlan) setActiveTab("configuration");
      } else {
        toast.error(err.message || "Failed to generate meal plan");
        setActiveTab("configuration");
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
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
    new Date(startOfWeek(new Date(), { weekStartsOn: 1 }).getTime() + 6 * 24 * 60 * 60 * 1000),
    "MMM d, yyyy",
  );

  const showUsageBar =
    userPlan === "free" && !planLoading && monthlyCount !== null && monthlyLimit !== null;

  // Progress message based on elapsed time
  const progressMessage =
    elapsedSeconds < 8 ? "Analyse de vos préférences..." :
    elapsedSeconds < 18 ? "Sélection des recettes..." :
    elapsedSeconds < 28 ? "Équilibrage nutritionnel..." :
    "Finalisation du plan...";

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-6">
      <MealPlanPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        count={monthlyCount ?? 0}
        limit={monthlyLimit ?? 2}
      />

      {/* Page header */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <ChefHat size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Générer un plan</h1>
            <p className="text-sm text-foreground/50">Semaine du {weekStart} – {weekEnd}</p>
          </div>
          <Chip color="primary" variant="flat" size="sm" className="ml-auto" startContent={<Sparkles size={12} />}>
            IA
          </Chip>
        </div>

        {showUsageBar && (
          <div className="mt-2">
            <UsageIndicator count={monthlyCount!} limit={monthlyLimit!} isPremium={false} />
          </div>
        )}
      </div>

      {checkingPlan || planLoading ? (
        <div className="flex items-center justify-center py-20 text-foreground/40">Loading...</div>
      ) : (
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as "configuration" | "plan")}
          variant="underlined"
          color="primary"
          classNames={{ tabList: "mb-2" }}
        >
          {/* ── Configuration tab ── */}
          <Tab
            key="configuration"
            title={
              <span className="flex items-center gap-2">
                <Settings size={14} />
                Configuration
              </span>
            }
          >
            <div className="mt-4">
              <GenerateConfig
                initialConfig={config}
                onConfigChange={handleConfigChange}
                onGenerate={handleGenerate}
                onCancel={handleCancel}
                isGenerating={isGenerating}
                hasExistingPlan={hasExistingPlan}
                existingPlanDate={existingPlanDate}
                userPlan={userPlan}
              />
            </div>
          </Tab>

          {/* ── Plan proposé tab ── */}
          <Tab
            key="plan"
            title={
              <span className="flex items-center gap-2">
                <CalendarDays size={14} />
                Plan proposé
                {generatedPlan && !isGenerating && (
                  <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                )}
                {isGenerating && (
                  <span className="w-2 h-2 rounded-full bg-warning shrink-0 animate-pulse" />
                )}
              </span>
            }
          >
            <div className="mt-4" id="meal-plan-grid">
              {isGenerating ? (
                /* ── Loading animation ── */
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-3 rounded-full border-2 border-primary/10 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ChefHat size={30} className="text-primary" />
                    </div>
                  </div>

                  <div className="text-center space-y-1.5">
                    <p className="font-bold text-lg">Génération en cours...</p>
                    <p className="text-sm text-foreground/50">{progressMessage}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <Clock size={12} className="text-foreground/30" />
                      <span className="text-xs font-mono text-foreground/40 tabular-nums">
                        {elapsedSeconds}s
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="flat"
                    color="danger"
                    size="sm"
                    startContent={<X size={14} />}
                    onPress={handleCancel}
                  >
                    Annuler la génération
                  </Button>
                </div>
              ) : generatedPlan ? (
                <>
                  {/* Generation time badge */}
                  {lastGenerationTime !== null && (
                    <div className="flex items-center gap-1.5 text-xs text-foreground/40 mb-3">
                      <Clock size={11} />
                      <span>Généré en {(lastGenerationTime / 1000).toFixed(1)}s</span>
                    </div>
                  )}
                  <MealPlanGrid
                    plan={generatedPlan}
                    planId={savedPlanId!}
                    mealLabels={mealLabels}
                    onPlanChange={setGeneratedPlan}
                    onSave={handleSave}
                    isSaving={isSaving}
                    userPlan={userPlan}
                    slotRegenCount={slotRegenCount}
                    maxSlotRegens={maxSlotRegens}
                    onSlotRegenerated={() => setSlotRegenCount((c) => c + 1)}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <div className="p-6 rounded-2xl bg-content2 border border-dashed border-divider">
                    <Sparkles size={40} className="text-foreground/20 mx-auto mb-3" />
                    <p className="text-foreground/40 text-sm max-w-xs">
                      Configurez vos préférences et cliquez{" "}
                      <button
                        className="font-semibold text-primary hover:underline"
                        onClick={() => setActiveTab("configuration")}
                      >
                        Générer le plan
                      </button>{" "}
                      pour commencer.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      )}
    </div>
  );
}
