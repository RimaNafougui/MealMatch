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
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 border-b border-divider pb-4">
          <Repeat2 size={18} className="text-primary" />
          <span>Répéter un repas</span>
        </ModalHeader>

        <ModalBody className="gap-4 py-5">
          <p className="text-sm text-foreground/60">
            Choisissez un repas de votre plan à utiliser pour{" "}
            <span className="font-semibold text-foreground capitalize">
              {targetDay} — {targetSlot}
            </span>
          </p>

          {uniqueMeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
              <Repeat2 size={36} className="text-default-300" />
              <p className="text-sm text-foreground/40 italic">
                Aucun autre repas disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {uniqueMeals.map(({ meal, day, slot }) => (
                <Card
                  key={`${day}-${slot}`}
                  isPressable
                  onPress={() => onSelect(meal)}
                  className="border border-divider hover:border-primary/60 hover:shadow-md transition-all"
                >
                  <CardBody className="p-4 gap-3">
                    {/* Top row: day/slot chip + favorite badge */}
                    <div className="flex items-center justify-between gap-2">
                      <Chip
                        size="sm"
                        variant="flat"
                        color="default"
                        className="capitalize text-xs font-medium"
                      >
                        {day} · {slot}
                      </Chip>
                      {meal.is_favorite && (
                        <Chip
                          size="sm"
                          color="warning"
                          variant="flat"
                          className="text-xs"
                        >
                          ★ Favori
                        </Chip>
                      )}
                    </div>

                    {/* Title */}
                    <p className="font-semibold text-base leading-snug">
                      {meal.title}
                    </p>

                    {/* Description */}
                    {meal.description && (
                      <p className="text-sm text-foreground/55 line-clamp-2 leading-relaxed">
                        {meal.description}
                      </p>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center gap-4 pt-1 border-t border-divider/50">
                      <span className="flex items-center gap-1.5 text-sm text-foreground/50">
                        <Clock size={13} className="text-warning" />
                        {meal.prep_time_minutes} min
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-foreground/50">
                        <Flame size={13} className="text-danger" />
                        {meal.calories} kcal
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-foreground/50">
                        <DollarSign size={13} className="text-success" />
                        {meal.estimated_cost_usd?.toFixed(2)} $
                      </span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </ModalBody>

        <ModalFooter className="border-t border-divider">
          <Button variant="light" onPress={onClose}>
            Annuler
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
