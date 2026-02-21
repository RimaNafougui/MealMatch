"use client";
import { useState } from "react";
import { Card, CardBody, Button, Chip, Skeleton } from "@heroui/react";
import { Calendar, UtensilsCrossed, Sparkles } from "lucide-react";
import { MealPlanConfig } from "@/types/meal-plan";

interface GenerateConfigProps {
  initialConfig: MealPlanConfig;
  onConfigChange: (config: MealPlanConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasExistingPlan: boolean;
  existingPlanDate?: string;
}

export function GenerateConfig({
  initialConfig,
  onConfigChange,
  onGenerate,
  isGenerating,
  hasExistingPlan,
  existingPlanDate,
}: GenerateConfigProps) {
  const [config, setConfig] = useState<MealPlanConfig>(initialConfig);

  const update = (patch: Partial<MealPlanConfig>) => {
    const next = { ...config, ...patch } as MealPlanConfig;
    setConfig(next);
    onConfigChange(next);
  };

  const mealLabels: Record<number, string[]> = {
    1: ["1 meal/day"],
    2: ["Lunch + Dinner"],
    3: ["Breakfast + Lunch + Dinner"],
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col gap-6">
        {/* Skeleton for days selector */}
        <Card className="border border-divider bg-content1">
          <CardBody className="gap-4 p-5">
            <Skeleton className="h-4 w-36 rounded-lg" />
            <div className="flex gap-3">
              <Skeleton className="flex-1 h-16 rounded-xl" />
              <Skeleton className="flex-1 h-16 rounded-xl" />
            </div>
          </CardBody>
        </Card>

        {/* Skeleton for meals per day */}
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

        {/* Skeleton for summary chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Skeleton for button */}
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Days selector */}
      <Card className="border border-divider bg-content1">
        <CardBody className="gap-4 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={18} className="text-primary" />
            <span className="font-semibold text-sm uppercase tracking-widest text-foreground/70">
              Number of Days
            </span>
          </div>
          <div className="flex gap-3">
            {([5, 7] as const).map((d) => (
              <button
                key={d}
                onClick={() => update({ days_count: d })}
                className={`
                  flex-1 py-4 rounded-xl border-2 transition-all font-bold text-lg
                  ${
                    config.days_count === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-divider hover:border-primary/50 text-foreground/60"
                  }
                `}
              >
                {d} days
                <span className="block text-xs font-normal mt-0.5 opacity-70">
                  {d === 5 ? "Mon – Fri" : "Mon – Sun"}
                </span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Meals per day selector */}
      <Card className="border border-divider bg-content1">
        <CardBody className="gap-4 p-5">
          <div className="flex items-center gap-2 mb-1">
            <UtensilsCrossed size={18} className="text-primary" />
            <span className="font-semibold text-sm uppercase tracking-widest text-foreground/70">
              Meals Per Day
            </span>
          </div>
          <div className="flex gap-3">
            {([1, 2, 3] as const).map((m) => (
              <button
                key={m}
                onClick={() => update({ meals_per_day: m })}
                className={`
                  flex-1 py-4 rounded-xl border-2 transition-all font-bold text-lg
                  ${
                    config.meals_per_day === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-divider hover:border-primary/50 text-foreground/60"
                  }
                `}
              >
                {m}
                <span className="block text-xs font-normal mt-0.5 opacity-70">
                  {mealLabels[m][0]}
                </span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Summary */}
      <div className="flex items-center gap-2 flex-wrap">
        <Chip color="primary" variant="flat" size="sm">
          {config.days_count} days
        </Chip>
        <span className="text-foreground/40 text-sm">×</span>
        <Chip color="primary" variant="flat" size="sm">
          {config.meals_per_day} meals/day
        </Chip>
        <span className="text-foreground/40 text-sm">=</span>
        <Chip color="success" variant="flat" size="sm">
          {config.days_count * config.meals_per_day} total meals
        </Chip>
      </div>

      {/* Generate button */}
      {hasExistingPlan ? (
        <div className="p-4 rounded-xl bg-warning-50 border border-warning-200 text-warning-700 text-sm">
          <p className="font-semibold">Plan already generated this week</p>
          <p className="text-xs mt-1 opacity-80">
            Generated on {existingPlanDate}. You can edit your current plan
            below.
          </p>
        </div>
      ) : (
        <Button
          color="primary"
          size="lg"
          className="w-full font-bold h-14 text-base shadow-lg shadow-primary/20"
          onPress={onGenerate}
          isLoading={isGenerating}
          startContent={!isGenerating && <Sparkles size={20} />}
        >
          {isGenerating ? "Generating your plan..." : "Generate Meal Plan"}
        </Button>
      )}
    </div>
  );
}
