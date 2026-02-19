"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
} from "@heroui/react";
import {
  Clock,
  Flame,
  DollarSign,
  Star,
  ChefHat,
  ShoppingBasket,
  Tag,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { GeneratedMeal } from "@/types/meal-plan";

interface MealDetailModalProps {
  meal: GeneratedMeal | null;
  isOpen: boolean;
  onClose: () => void;
}

const SLOT_COLORS: Record<
  string,
  "warning" | "success" | "primary" | "secondary" | "default"
> = {
  breakfast: "warning",
  lunch: "success",
  dinner: "primary",
  meal: "secondary",
  "meal 1": "warning",
  "meal 2": "primary",
};

export function MealDetailModal({
  meal,
  isOpen,
  onClose,
}: MealDetailModalProps) {
  const router = useRouter();

  if (!meal) return null;

  const slotColor = SLOT_COLORS[meal.slot?.toLowerCase()] ?? "default";

  const ingredients = meal.ingredients_summary
    ? meal.ingredients_summary
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Navigate to full detail page if a catalog/spoonacular id is available
  const handleViewFullRecipe = () => {
    const m = meal as any;
    if (m.recipe_catalog_id) {
      router.push(`/dashboard/explore/${m.recipe_catalog_id}`);
      onClose();
    } else if (m.spoonacular_id) {
      router.push(`/dashboard/explore/${m.spoonacular_id}`);
      onClose();
    }
  };

  const hasFullRecipePage = !!(
    (meal as any).recipe_catalog_id || (meal as any).spoonacular_id
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
      classNames={{ body: "gap-0 p-0", header: "pb-0" }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-3 pt-5 px-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Chip
              color={slotColor}
              variant="flat"
              size="sm"
              className="capitalize"
            >
              {meal.slot}
            </Chip>
            {meal.is_favorite && (
              <Chip
                color="warning"
                variant="flat"
                size="sm"
                startContent={<Star size={11} className="fill-warning" />}
              >
                Favorite
              </Chip>
            )}
            {(meal as any).can_repeat && (
              <Chip variant="flat" size="sm" color="default">
                Repeatable
              </Chip>
            )}
          </div>
          <h2 className="text-xl font-extrabold tracking-tight leading-snug pr-8">
            {meal.title}
          </h2>
        </ModalHeader>

        <ModalBody>
          {/* Stats bar */}
          <div className="flex items-center gap-6 px-6 py-4 bg-content2 border-y border-divider flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-warning/10">
                <Clock size={14} className="text-warning" />
              </div>
              <div>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest">
                  Prep
                </p>
                <p className="font-bold text-sm">
                  {meal.prep_time_minutes} min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-danger/10">
                <Flame size={14} className="text-danger" />
              </div>
              <div>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest">
                  Calories
                </p>
                <p className="font-bold text-sm">{meal.calories} kcal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-success/10">
                <DollarSign size={14} className="text-success" />
              </div>
              <div>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest">
                  Cost
                </p>
                <p className="font-bold text-sm">
                  ${meal.estimated_cost_usd?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 flex flex-col gap-5">
            {/* Description */}
            {meal.description && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <ChefHat size={15} className="text-foreground/50" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                    About
                  </h3>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {meal.description}
                </p>
              </div>
            )}

            <Divider />

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <ShoppingBasket size={15} className="text-foreground/50" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                    Ingredients
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                      <span className="text-sm text-foreground/70 capitalize">
                        {ing}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dietary tags */}
            {meal.dietary_tags?.length > 0 && (
              <>
                <Divider />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Tag size={15} className="text-foreground/50" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                      Dietary Info
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {meal.dietary_tags.map((tag) => (
                      <Chip key={tag} size="sm" variant="flat" color="success">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* No full recipe available note */}
            {!hasFullRecipePage && meal.spoonacular_search_query && (
              <>
                <Divider />
                <p className="text-xs text-foreground/40 italic">
                  This meal was AI-generated. Save this plan to get full recipe
                  details.
                </p>
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-divider gap-2">
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
          {hasFullRecipePage && (
            <Button
              color="primary"
              onPress={handleViewFullRecipe}
              endContent={<ExternalLink size={15} />}
            >
              View Full Recipe
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
