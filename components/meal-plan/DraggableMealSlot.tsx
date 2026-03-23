"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { MealSlot } from "./MealSlot";
import { GeneratedMeal } from "@/types/meal-plan";

interface DraggableMealSlotProps {
  meal: GeneratedMeal;
  day: string;
  slot: string;
  allMeals: GeneratedMeal[];
  planId: string;
  onMealUpdate: (day: string, slot: string, meal: GeneratedMeal) => void;
  onRepeatRequest: (day: string, slot: string) => void;
  onViewDetail: (meal: GeneratedMeal) => void;
  canRegenerate?: boolean;
  onRegenerated?: () => void;
}

export function DraggableMealSlot({
  meal,
  day,
  slot,
  allMeals,
  planId,
  onMealUpdate,
  onRepeatRequest,
  onViewDetail,
  canRegenerate = true,
  onRegenerated,
}: DraggableMealSlotProps) {
  const id = `${day}::${slot}`;

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({ id });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    outline: isOver && !isDragging ? "2px solid hsl(var(--heroui-primary))" : undefined,
    borderRadius: isOver ? "0.75rem" : undefined,
    transition: "outline 0.1s ease",
  };

  // Combine both refs
  function setRef(node: HTMLElement | null) {
    setDragRef(node);
    setDropRef(node);
  }

  return (
    <div ref={setRef} style={style} {...listeners} {...attributes}>
      <MealSlot
        meal={meal}
        day={day}
        slot={slot}
        allMeals={allMeals}
        planId={planId}
        onMealUpdate={onMealUpdate}
        onRepeatRequest={onRepeatRequest}
        onViewDetail={onViewDetail}
        canRegenerate={canRegenerate}
        onRegenerated={onRegenerated}
      />
    </div>
  );
}
