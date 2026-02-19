"use client";
import React, { useState } from "react";
import { Button, Chip, Card, CardBody } from "@heroui/react";
import { CheckCircle, DollarSign, Flame, TrendingUp } from "lucide-react";
import {
  GeneratedDay,
  GeneratedMeal,
  GeneratedMealPlan,
} from "@/types/meal-plan";
import { MealSlot } from "./MealSlot";
import { RepeatMealModal } from "./RepeatMealModal";
import { MealDetailModal } from "./MealDetailModal";

interface MealPlanGridProps {
  plan: GeneratedMealPlan;
  planId: string;
  mealLabels: string[];
  onPlanChange: (plan: GeneratedMealPlan) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function MealPlanGrid({
  plan,
  planId,
  mealLabels,
  onPlanChange,
  onSave,
  isSaving,
}: MealPlanGridProps) {
  const [repeatModal, setRepeatModal] = useState<{
    isOpen: boolean;
    day: string;
    slot: string;
  }>({ isOpen: false, day: "", slot: "" });
  const [detailMeal, setDetailMeal] = useState<GeneratedMeal | null>(null);

  const handleMealUpdate = (
    day: string,
    slot: string,
    newMeal: GeneratedMeal,
  ) => {
    const updatedDays = plan.days.map((d) => {
      if (d.day !== day) return d;
      return {
        ...d,
        meals: d.meals.map((m) => (m.slot === slot ? newMeal : m)),
      };
    });
    onPlanChange({ ...plan, days: updatedDays });
  };

  const handleRepeatRequest = (day: string, slot: string) => {
    setRepeatModal({ isOpen: true, day, slot });
  };

  const handleRepeatSelect = (meal: GeneratedMeal) => {
    handleMealUpdate(repeatModal.day, repeatModal.slot, {
      ...meal,
      slot: repeatModal.slot as GeneratedMeal["slot"],
    });
    setRepeatModal({ isOpen: false, day: "", slot: "" });
  };

  const allMeals = plan.days.flatMap((d) => d.meals);

  // Calculate per-day totals
  const getDayTotals = (day: GeneratedDay) => ({
    calories: day.meals.reduce((sum, m) => sum + (m.calories || 0), 0),
    cost: day.meals.reduce((sum, m) => sum + (m.estimated_cost_usd || 0), 0),
  });

  const dayLabels: Record<string, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Summary bar */}
      <Card className="border border-divider bg-content1">
        <CardBody className="p-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-success" />
              <div>
                <p className="text-xs text-foreground/50 uppercase tracking-widest">
                  Total Cost
                </p>
                <p className="font-bold text-lg">
                  ${plan.total_estimated_cost?.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-warning" />
              <div>
                <p className="text-xs text-foreground/50 uppercase tracking-widest">
                  Avg Cal/Day
                </p>
                <p className="font-bold text-lg">
                  {plan.total_calories_per_day_avg}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              <div>
                <p className="text-xs text-foreground/50 uppercase tracking-widest">
                  Total Meals
                </p>
                <p className="font-bold text-lg">{allMeals.length}</p>
              </div>
            </div>
            <div className="ml-auto">
              <Chip color="warning" variant="flat" size="sm">
                {allMeals.filter((m) => m.is_favorite).length} favorites
                included
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Grid - horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-2">
        <div
          className="grid gap-3 min-w-[640px]"
          style={{
            gridTemplateColumns: `120px repeat(${plan.days.length}, minmax(180px, 1fr))`,
          }}
        >
          {/* Header row */}
          <div /> {/* empty corner */}
          {plan.days.map((day) => {
            const totals = getDayTotals(day);
            return (
              <div key={day.day} className="text-center pb-1">
                <p className="font-bold text-sm capitalize">
                  {dayLabels[day.day] || day.day}
                </p>
                <p className="text-xs text-foreground/40">
                  {totals.calories} cal · ${totals.cost.toFixed(2)}
                </p>
              </div>
            );
          })}
          {/* Meal rows */}
          {mealLabels.map((label) => (
            <React.Fragment key={label}>
              {/* Row label */}
              <div className="flex items-center pr-3">
                <span className="text-xs font-bold uppercase tracking-widest text-foreground/40 capitalize">
                  {label}
                </span>
              </div>

              {/* Meal slots for this row */}
              {plan.days.map((day) => {
                const meal = day.meals.find(
                  (m) => m.slot.toLowerCase() === label.toLowerCase(),
                );
                return (
                  <div key={`${day.day}-${label}`}>
                    {meal ? (
                      <MealSlot
                        meal={meal}
                        day={day.day}
                        slot={label}
                        allMeals={allMeals}
                        planId={planId}
                        onMealUpdate={handleMealUpdate}
                        onRepeatRequest={handleRepeatRequest}
                        onViewDetail={setDetailMeal}
                      />
                    ) : (
                      <div className="h-full min-h-[100px] rounded-xl border border-dashed border-divider flex items-center justify-center">
                        <span className="text-xs text-foreground/30">—</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-foreground/40 text-center">
        Hover over any meal to swap, regenerate with AI, or repeat from another
        slot
      </p>

      {/* Accept & Save */}
      <Button
        color="success"
        size="lg"
        className="w-full font-bold h-14 text-base shadow-lg shadow-success/20"
        onPress={onSave}
        isLoading={isSaving}
        startContent={!isSaving && <CheckCircle size={20} />}
      >
        {isSaving ? "Saving to dashboard..." : "Accept & Save to Dashboard"}
      </Button>

      {/* Repeat modal */}
      <RepeatMealModal
        isOpen={repeatModal.isOpen}
        onClose={() => setRepeatModal({ isOpen: false, day: "", slot: "" })}
        onSelect={handleRepeatSelect}
        days={plan.days}
        targetDay={repeatModal.day}
        targetSlot={repeatModal.slot}
      />

      {/* Detail modal */}
      <MealDetailModal
        meal={detailMeal}
        isOpen={!!detailMeal}
        onClose={() => setDetailMeal(null)}
      />
    </div>
  );
}
