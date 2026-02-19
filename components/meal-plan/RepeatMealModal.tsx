"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import { Clock, Flame, DollarSign, Repeat2 } from "lucide-react";
import { GeneratedDay, GeneratedMeal } from "@/types/meal-plan";

interface RepeatMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (meal: GeneratedMeal) => void;
  days: GeneratedDay[];
  targetDay: string;
  targetSlot: string;
}

export function RepeatMealModal({
  isOpen,
  onClose,
  onSelect,
  days,
  targetDay,
  targetSlot,
}: RepeatMealModalProps) {
  // Collect all meals from all days (excluding the target slot)
  const allMeals: { meal: GeneratedMeal; day: string; slot: string }[] = [];
  days.forEach((d) => {
    d.meals.forEach((m) => {
      if (!(d.day === targetDay && m.slot === targetSlot)) {
        allMeals.push({ meal: m, day: d.day, slot: m.slot });
      }
    });
  });

  // Deduplicate by title
  const seen = new Set<string>();
  const uniqueMeals = allMeals.filter(({ meal }) => {
    if (seen.has(meal.title)) return false;
    seen.add(meal.title);
    return true;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Repeat2 size={18} className="text-primary" />
          <span>Repeat a Meal</span>
        </ModalHeader>
        <ModalBody className="gap-3 pb-4">
          <p className="text-sm text-foreground/60">
            Select a meal from your plan to use for{" "}
            <span className="font-semibold text-foreground capitalize">
              {targetDay} {targetSlot}
            </span>
            :
          </p>
          {uniqueMeals.length === 0 ? (
            <p className="text-sm text-foreground/40 italic text-center py-8">
              No other meals available yet.
            </p>
          ) : (
            uniqueMeals.map(({ meal, day, slot }) => (
              <Card
                key={`${day}-${slot}`}
                isPressable
                onPress={() => onSelect(meal)}
                className="border border-divider hover:border-primary/50 transition-colors"
              >
                <CardBody className="p-3 gap-2">
                  <div className="flex items-center justify-between">
                    <Chip
                      size="sm"
                      variant="flat"
                      className="text-[10px] capitalize"
                    >
                      {day} · {slot}
                    </Chip>
                    {meal.is_favorite && (
                      <Chip
                        size="sm"
                        color="warning"
                        variant="flat"
                        className="text-[10px]"
                      >
                        ★ Fav
                      </Chip>
                    )}
                  </div>
                  <p className="font-semibold text-sm">{meal.title}</p>
                  <p className="text-xs text-foreground/50 line-clamp-1">
                    {meal.description}
                  </p>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1 text-xs text-foreground/40">
                      <Clock size={11} />
                      {meal.prep_time_minutes}m
                    </span>
                    <span className="flex items-center gap-1 text-xs text-foreground/40">
                      <Flame size={11} />
                      {meal.calories} cal
                    </span>
                    <span className="flex items-center gap-1 text-xs text-foreground/40">
                      <DollarSign size={11} />$
                      {meal.estimated_cost_usd?.toFixed(2)}
                    </span>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
