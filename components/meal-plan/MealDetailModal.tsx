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
  ListOrdered,
  Zap,
  Beef,
  Wheat,
  Droplets,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { GeneratedMeal } from "@/types/meal-plan";
import Image from "next/image";

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

  const isAiGenerated = meal.source === "ai";
  const hasInstructions = isAiGenerated && meal.instructions && meal.instructions.length > 0;
  const hasMacros = meal.protein != null || meal.carbs != null || meal.fat != null;

  // Navigate to full recipe detail page
  const handleViewFullRecipe = () => {
    const m = meal as any;
    const id = m.recipe_catalog_id || m.spoonacular_id;
    if (id) {
      router.push(`/explore/${id}`);
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
                Favori
              </Chip>
            )}
            {(meal as any).can_repeat && (
              <Chip variant="flat" size="sm" color="default">
                Répétable
              </Chip>
            )}
            {isAiGenerated && (
              <Chip
                variant="flat"
                size="sm"
                color="secondary"
                startContent={<Sparkles size={11} />}
              >
                Générée par IA
              </Chip>
            )}
          </div>
          <h2 className="text-xl font-extrabold tracking-tight leading-snug pr-8">
            {meal.title}
          </h2>
        </ModalHeader>

        <ModalBody>
          {/* Hero image for AI-generated meals */}
          {isAiGenerated && meal.image_url && (
            <div className="relative w-full h-48 overflow-hidden">
              <img
                src={meal.image_url}
                alt={meal.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )}

          {/* Stats bar */}
          <div className="flex items-center gap-6 px-6 py-4 bg-content2 border-y border-divider flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-warning/10">
                <Clock size={14} className="text-warning" />
              </div>
              <div>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest">
                  Préparation
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
                  Coût
                </p>
                <p className="font-bold text-sm">
                  {meal.estimated_cost_usd?.toFixed(2)} $
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
                    À propos
                  </h3>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {meal.description}
                </p>
              </div>
            )}

            <Divider />

            {/* Full macros breakdown (for AI meals or when macros are available) */}
            {hasMacros && (
              <>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Zap size={15} className="text-foreground/50" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                      Valeurs nutritionnelles
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {meal.protein != null && (
                      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-danger/5 border border-danger/10">
                        <Beef size={16} className="text-danger mb-1" />
                        <p className="text-xs text-foreground/50">Protéines</p>
                        <p className="font-bold text-sm">{meal.protein}g</p>
                      </div>
                    )}
                    {meal.carbs != null && (
                      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-warning/5 border border-warning/10">
                        <Wheat size={16} className="text-warning mb-1" />
                        <p className="text-xs text-foreground/50">Glucides</p>
                        <p className="font-bold text-sm">{meal.carbs}g</p>
                      </div>
                    )}
                    {meal.fat != null && (
                      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <Droplets size={16} className="text-primary mb-1" />
                        <p className="text-xs text-foreground/50">Lipides</p>
                        <p className="font-bold text-sm">{meal.fat}g</p>
                      </div>
                    )}
                  </div>
                </div>
                <Divider />
              </>
            )}

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <ShoppingBasket size={15} className="text-foreground/50" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                    Ingrédients
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

            {/* Step-by-step instructions (AI-generated meals only) */}
            {hasInstructions && (
              <>
                <Divider />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <ListOrdered size={15} className="text-foreground/50" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                      Préparation
                    </h3>
                  </div>
                  <ol className="flex flex-col gap-3">
                    {meal.instructions!.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground/75 leading-relaxed">
                          {step.replace(/^Étape \d+\s*:\s*/i, "").replace(/^\d+\.\s*/, "")}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            )}

            {/* Dietary tags */}
            {meal.dietary_tags?.length > 0 && (
              <>
                <Divider />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Tag size={15} className="text-foreground/50" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                      Informations diététiques
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
            {!hasFullRecipePage && !isAiGenerated && meal.spoonacular_search_query && (
              <>
                <Divider />
                <p className="text-xs text-foreground/40 italic">
                  Ce repas a été généré par IA. Sauvegardez ce plan pour accéder aux détails complets de la recette.
                </p>
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-divider gap-2">
          <Button variant="light" onPress={onClose}>
            Fermer
          </Button>
          {hasFullRecipePage && (
            <Button
              color="primary"
              onPress={handleViewFullRecipe}
              endContent={<ExternalLink size={15} />}
            >
              Voir la recette complète
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
