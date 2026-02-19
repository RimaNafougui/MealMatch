"use client";
import { Button } from "@heroui/react";
import NextLink from "next/link";
import { Sparkles, CalendarDays } from "lucide-react";
import { MealPlanCalendar } from "@/components/meal-plan/MealPlanCalendar";
import { SavedMealPlan } from "@/types/meal-plan";

interface MealPlansDashboardProps {
  activePlan: SavedMealPlan | null;
  weekLabel: string;
}

export function MealPlansDashboard({
  activePlan,
  weekLabel,
}: MealPlansDashboardProps) {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <CalendarDays size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Meal Plans
            </h1>
            <p className="text-sm text-foreground/50">Week of {weekLabel}</p>
          </div>
        </div>
        <Button
          as={NextLink}
          href="/meal-plan/generate"
          color="primary"
          variant={activePlan ? "bordered" : "solid"}
          startContent={<Sparkles size={16} />}
        >
          {activePlan ? "Edit Plan" : "Generate Plan"}
        </Button>
      </div>

      {activePlan ? (
        <MealPlanCalendar plan={activePlan} />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <div className="p-8 rounded-2xl bg-content2 border border-dashed border-divider max-w-sm">
            <CalendarDays
              size={48}
              className="text-foreground/20 mx-auto mb-4"
            />
            <h3 className="font-bold text-lg mb-2">No plan this week</h3>
            <p className="text-foreground/50 text-sm mb-6">
              Generate your AI-powered meal plan for the week. It takes under a
              minute!
            </p>
            <Button
              as={NextLink}
              href="/meal-plan/generate"
              color="primary"
              className="w-full font-bold"
              startContent={<Sparkles size={16} />}
            >
              Generate My Meal Plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
