"use client";
import { useState } from "react";
import { Card, CardBody, CardHeader, Chip, Button } from "@heroui/react";
import { Clock, Flame, DollarSign, Star, Calendar } from "lucide-react";
import NextLink from "next/link";
import { SavedMealPlan, GeneratedDay, GeneratedMeal } from "@/types/meal-plan";
import { format, parseISO } from "date-fns";
import { MealDetailModal } from "./MealDetailModal";

interface MealPlanCalendarProps {
  plan: SavedMealPlan;
}

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const SLOT_COLORS: Record<string, string> = {
  breakfast:
    "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400",
  lunch:
    "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400",
  dinner:
    "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400",
  meal: "bg-secondary-100 text-secondary-700",
  "meal 1": "bg-warning-100 text-warning-700",
  "meal 2": "bg-primary-100 text-primary-700",
};

export function MealPlanCalendar({ plan }: MealPlanCalendarProps) {
  const [detailMeal, setDetailMeal] = useState<GeneratedMeal | null>(null);
  const mealPlan = plan.meals as any;
  const days: GeneratedDay[] = mealPlan?.days || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">This Week&apos;s Plan</h2>
          <p className="text-sm text-foreground/50 mt-0.5">
            {format(parseISO(plan.week_start_date), "MMM d")} –{" "}
            {format(parseISO(plan.week_end_date), "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Chip size="sm" variant="flat" color="success">
            ${plan.total_cost?.toFixed(2)} est. total
          </Chip>
          <Chip size="sm" variant="flat" color="warning">
            ~{plan.total_calories} cal/day
          </Chip>
          <Button
            as={NextLink}
            href="/meal-plan/generate"
            size="sm"
            variant="bordered"
            startContent={<Calendar size={14} />}
          >
            Edit Plan
          </Button>
        </div>
      </div>

      {/* Day cards */}
      <div className="flex flex-col gap-4">
        {days.map((day) => (
          <Card key={day.day} className="border border-divider">
            <CardHeader className="pb-0 pt-4 px-5">
              <h3 className="font-bold text-base capitalize">
                {DAY_LABELS[day.day] || day.day}
              </h3>
            </CardHeader>
            <CardBody className="pt-3 px-5 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {day.meals.map((meal) => (
                  <button
                    key={meal.slot}
                    onClick={() => setDetailMeal(meal)}
                    className="flex flex-col gap-2 p-3 rounded-xl bg-content2 border border-divider/50 text-left hover:border-primary/40 hover:bg-content2/80 transition-all cursor-pointer group"
                  >
                    {/* Slot label */}
                    <span
                      className={`
                        self-start text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full
                        ${SLOT_COLORS[meal.slot.toLowerCase()] || "bg-default-100 text-default-600"}
                      `}
                    >
                      {meal.slot}
                    </span>

                    {/* Title */}
                    <div className="flex items-start gap-1.5">
                      {meal.is_favorite && (
                        <Star
                          size={12}
                          className="text-warning fill-warning mt-0.5 shrink-0"
                        />
                      )}
                      <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
                        {meal.title}
                      </p>
                    </div>

                    {/* Description */}
                    {meal.description && (
                      <p className="text-xs text-foreground/50 line-clamp-2">
                        {meal.description}
                      </p>
                    )}

                    {/* Ingredients */}
                    {meal.ingredients_summary && (
                      <p className="text-[11px] text-foreground/40 italic line-clamp-1">
                        {meal.ingredients_summary}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-auto pt-1 border-t border-divider/50">
                      <span className="flex items-center gap-1 text-xs text-foreground/40">
                        <Clock size={11} /> {meal.prep_time_minutes}m
                      </span>
                      <span className="flex items-center gap-1 text-xs text-foreground/40">
                        <Flame size={11} /> {meal.calories}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-foreground/40">
                        <DollarSign size={11} /> $
                        {meal.estimated_cost_usd?.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Detail modal */}
      <MealDetailModal
        meal={detailMeal}
        isOpen={!!detailMeal}
        onClose={() => setDetailMeal(null)}
      />
    </div>
  );
}
