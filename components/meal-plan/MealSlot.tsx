"use client";
import { useState } from "react";
import { Card, CardBody, Chip, Button, Spinner } from "@heroui/react";
import {
  RefreshCw,
  Repeat2,
  Clock,
  Flame,
  DollarSign,
  Star,
} from "lucide-react";
import { GeneratedMeal } from "@/types/meal-plan";

interface MealSlotProps {
  meal: GeneratedMeal;
  day: string;
  slot: string;
  allMeals: GeneratedMeal[];
  planId: string;
  onMealUpdate: (day: string, slot: string, meal: GeneratedMeal) => void;
  onRepeatRequest: (day: string, slot: string) => void;
  onViewDetail: (meal: GeneratedMeal) => void;
}

export function MealSlot({
  meal,
  day,
  slot,
  allMeals,
  planId,
  onMealUpdate,
  onRepeatRequest,
  onViewDetail,
}: MealSlotProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/meal-plan/regenerate-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day,
          slot,
          current_meal: meal,
          existing_meals: allMeals,
          plan_id: planId,
        }),
      });
      const data = await res.json();
      if (data.success && data.meal) {
        onMealUpdate(day, slot, data.meal);
      }
    } catch (err) {
      console.error("Regenerate error:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const slotColors: Record<string, string> = {
    breakfast: "text-warning",
    lunch: "text-success",
    dinner: "text-primary",
    meal: "text-secondary",
    "meal 1": "text-warning",
    "meal 2": "text-primary",
  };

  const slotColor = slotColors[slot.toLowerCase()] || "text-default-500";

  return (
    <Card
      className={`
        border transition-all duration-200 group
        ${
          meal.is_favorite
            ? "border-warning/50 bg-warning-50/20 dark:bg-warning-900/10"
            : "border-divider bg-content1 hover:border-primary/30"
        }
      `}
    >
      <CardBody className="p-3 gap-2">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold uppercase tracking-widest ${slotColor}`}
          >
            {slot}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="min-w-6 w-6 h-6"
              onPress={() => onRepeatRequest(day, slot)}
              title="Repeat a meal from another slot"
            >
              <Repeat2 size={13} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="min-w-6 w-6 h-6"
              onPress={handleRegenerate}
              isDisabled={isRegenerating}
              title="Get AI suggestion"
            >
              {isRegenerating ? (
                <Spinner size="sm" color="current" />
              ) : (
                <RefreshCw size={13} />
              )}
            </Button>
          </div>
        </div>

        {/* Meal title */}
        <div className="flex items-start gap-1.5">
          {meal.is_favorite && (
            <Star
              size={13}
              className="text-warning mt-0.5 shrink-0 fill-warning"
            />
          )}
          <button
            className="font-semibold text-sm leading-tight line-clamp-2 text-left hover:text-primary transition-colors cursor-pointer"
            onClick={() => !isRegenerating && onViewDetail(meal)}
          >
            {isRegenerating ? (
              <span className="opacity-50 italic">Finding new recipe...</span>
            ) : (
              meal.title
            )}
          </button>
        </div>

        {/* Description */}
        {!isRegenerating && meal.description && (
          <p className="text-xs text-foreground/50 line-clamp-2 leading-relaxed">
            {meal.description}
          </p>
        )}

        {/* Stats row */}
        {!isRegenerating && (
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-foreground/50">
              <Clock size={11} />
              {meal.prep_time_minutes}m
            </span>
            <span className="flex items-center gap-1 text-xs text-foreground/50">
              <Flame size={11} />
              {meal.calories}
            </span>
            <span className="flex items-center gap-1 text-xs text-foreground/50">
              <DollarSign size={11} />
              {meal.estimated_cost_usd?.toFixed(2)}
            </span>
          </div>
        )}

        {/* Tags */}
        {!isRegenerating && meal.dietary_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {meal.dietary_tags.slice(0, 2).map((tag) => (
              <Chip
                key={tag}
                size="sm"
                variant="flat"
                className="text-[10px] h-4 px-1.5"
              >
                {tag}
              </Chip>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
