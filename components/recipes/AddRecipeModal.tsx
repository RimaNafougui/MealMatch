"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { ScrollShadow } from "@heroui/scroll-shadow";
import {
  Plus,
  Trash2,
  ChefHat,
  Clock,
  Users,
  Flame,
  DollarSign,
  Beef,
  Wheat,
  Droplets,
  ListOrdered,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface InstructionStep {
  number: number;
  step: string;
}

interface RecipeFormData {
  title: string;
  prep_time: string;
  servings: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  price_per_serving: string;
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  dietary_tags: string[];
}

const DEFAULT_FORM: RecipeFormData = {
  title: "",
  prep_time: "",
  servings: "4",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  price_per_serving: "",
  ingredients: [{ name: "", amount: "", unit: "" }],
  instructions: [{ number: 1, step: "" }],
  dietary_tags: [],
};

const DIETARY_OPTIONS = [
  "gluten free",
  "ketogenic",
  "vegetarian",
  "lacto ovo vegetarian",
  "vegan",
  "pescetarian",
  "paleo",
  "primal",
  "low fodmap",
  "whole30",
  "dairy free",
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

const DIETARY_LABELS: Record<string, string> = {
  "gluten free": "Sans Gluten",
  ketogenic: "Cétogène",
  vegetarian: "Végétarien",
  "lacto ovo vegetarian": "Lacto-Ovo Végé.",
  vegan: "Végan",
  pescetarian: "Pescétarien",
  paleo: "Paléo",
  primal: "Primal",
  "low fodmap": "Low FODMAP",
  whole30: "Whole30",
  "dairy free": "Sans Lactose",
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner",
  dinner: "Dîner",
  snack: "Collation",
};

// ─── Section label helper ─────────────────────────────────────────────────────

function SectionLabel({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-default-700">
      <span className="text-success">{icon}</span>
      {label}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (recipe: Record<string, unknown>) => void;
  /** If provided, the modal is in edit mode */
  editRecipe?: Record<string, unknown> | null;
}

export function AddRecipeModal({
  isOpen,
  onClose,
  onCreated,
  editRecipe = null,
}: AddRecipeModalProps) {
  const isEdit = !!editRecipe;

  const buildFormFromEdit = (): RecipeFormData => {
    if (!editRecipe) return DEFAULT_FORM;
    return {
      title: String(editRecipe.title ?? ""),
      prep_time: editRecipe.prep_time != null ? String(editRecipe.prep_time) : "",
      servings: editRecipe.servings != null ? String(editRecipe.servings) : "4",
      calories: editRecipe.calories != null ? String(editRecipe.calories) : "",
      protein: editRecipe.protein != null ? String(editRecipe.protein) : "",
      carbs: editRecipe.carbs != null ? String(editRecipe.carbs) : "",
      fat: editRecipe.fat != null ? String(editRecipe.fat) : "",
      price_per_serving:
        editRecipe.price_per_serving != null
          ? String(editRecipe.price_per_serving)
          : "",
      ingredients:
        Array.isArray(editRecipe.ingredients) && editRecipe.ingredients.length > 0
          ? (editRecipe.ingredients as Ingredient[])
          : [{ name: "", amount: "", unit: "" }],
      instructions:
        Array.isArray(editRecipe.instructions) && editRecipe.instructions.length > 0
          ? (editRecipe.instructions as InstructionStep[])
          : [{ number: 1, step: "" }],
      dietary_tags: Array.isArray(editRecipe.dietary_tags)
        ? (editRecipe.dietary_tags as string[])
        : [],
    };
  };

  const [form, setForm] = useState<RecipeFormData>(
    isEdit ? buildFormFromEdit() : DEFAULT_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or edit recipe changes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setForm(isEdit ? buildFormFromEdit() : DEFAULT_FORM);
      setErrors({});
      onClose();
    }
  };

  // ─── Field helpers ───────────────────────────────────────────────────────

  const setField = <K extends keyof RecipeFormData>(
    key: K,
    value: RecipeFormData[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  // ─── Ingredient helpers ──────────────────────────────────────────────────

  const addIngredient = () =>
    setField("ingredients", [...form.ingredients, { name: "", amount: "", unit: "" }]);

  const removeIngredient = (idx: number) =>
    setField(
      "ingredients",
      form.ingredients.filter((_, i) => i !== idx),
    );

  const updateIngredient = (
    idx: number,
    field: keyof Ingredient,
    value: string,
  ) =>
    setField(
      "ingredients",
      form.ingredients.map((ing, i) =>
        i === idx ? { ...ing, [field]: value } : ing,
      ),
    );

  // ─── Instruction helpers ─────────────────────────────────────────────────

  const addStep = () =>
    setField("instructions", [
      ...form.instructions,
      { number: form.instructions.length + 1, step: "" },
    ]);

  const removeStep = (idx: number) =>
    setField(
      "instructions",
      form.instructions
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, number: i + 1 })),
    );

  const updateStep = (idx: number, value: string) =>
    setField(
      "instructions",
      form.instructions.map((s, i) => (i === idx ? { ...s, step: value } : s)),
    );

  // ─── Dietary tag toggle ──────────────────────────────────────────────────

  const toggleTag = (tag: string) =>
    setField(
      "dietary_tags",
      form.dietary_tags.includes(tag)
        ? form.dietary_tags.filter((t) => t !== tag)
        : [...form.dietary_tags, tag],
    );

  // ─── Validation ──────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Le titre est requis";
    if (form.ingredients.some((i) => !i.name.trim()))
      errs.ingredients = "Tous les ingrédients doivent avoir un nom";
    if (form.instructions.some((s) => !s.step.trim()))
      errs.instructions = "Toutes les étapes doivent être remplies";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;

    // Filter out empty rows
    const cleanedIngredients = form.ingredients.filter((i) => i.name.trim());
    const cleanedInstructions = form.instructions
      .filter((s) => s.step.trim())
      .map((s, i) => ({ ...s, number: i + 1 }));

    const payload = {
      ...form,
      ingredients: cleanedIngredients,
      instructions: cleanedInstructions,
    };

    setSaving(true);
    try {
      const url = isEdit
        ? `/api/recipes/user/${(editRecipe as Record<string, unknown>).id}`
        : "/api/recipes/user";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      toast.success(
        isEdit ? "Recette mise à jour !" : "Recette créée avec succès !",
      );
      onCreated(data.recipe);
      handleOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        header: "border-b border-divider",
        footer: "border-t border-divider",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <ChefHat size={20} className="text-success" />
              {isEdit ? "Modifier la recette" : "Ajouter une recette"}
            </ModalHeader>

            <ModalBody className="gap-0 px-6 py-4">
              <ScrollShadow className="flex flex-col gap-6 max-h-[60vh] pr-1">

                {/* ── Titre ── */}
                <div className="flex flex-col gap-2">
                  <SectionLabel icon={<ChefHat size={14} />} label="Titre *" />
                  <Input
                    placeholder="Ex : Spaghetti bolognaise maison"
                    value={form.title}
                    onValueChange={(v) => setField("title", v)}
                    variant="bordered"
                    isInvalid={!!errors.title}
                    errorMessage={errors.title}
                  />
                </div>

                <Divider />

                {/* ── Infos générales ── */}
                <div className="flex flex-col gap-2">
                  <SectionLabel icon={<Clock size={14} />} label="Informations générales" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Input
                      label="Temps (min)"
                      placeholder="30"
                      type="number"
                      min={1}
                      value={form.prep_time}
                      onValueChange={(v) => setField("prep_time", v)}
                      variant="bordered"
                      size="sm"
                      startContent={<Clock size={13} className="text-default-400 shrink-0" />}
                    />
                    <Input
                      label="Portions"
                      placeholder="4"
                      type="number"
                      min={1}
                      value={form.servings}
                      onValueChange={(v) => setField("servings", v)}
                      variant="bordered"
                      size="sm"
                      startContent={<Users size={13} className="text-default-400 shrink-0" />}
                    />
                    <Input
                      label="Calories"
                      placeholder="450"
                      type="number"
                      min={0}
                      value={form.calories}
                      onValueChange={(v) => setField("calories", v)}
                      variant="bordered"
                      size="sm"
                      startContent={<Flame size={13} className="text-warning shrink-0" />}
                    />
                    <Input
                      label="Prix / portion ($)"
                      placeholder="2.50"
                      type="number"
                      min={0}
                      step={0.01}
                      value={form.price_per_serving}
                      onValueChange={(v) => setField("price_per_serving", v)}
                      variant="bordered"
                      size="sm"
                      startContent={<DollarSign size={13} className="text-success shrink-0" />}
                    />
                  </div>
                </div>

                <Divider />

                {/* ── Macros ── */}
                <div className="flex flex-col gap-2">
                  <SectionLabel icon={<Beef size={14} />} label="Macronutriments (optionnel)" />
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Protéines (g)"
                      placeholder="25"
                      type="number"
                      min={0}
                      value={form.protein}
                      onValueChange={(v) => setField("protein", v)}
                      variant="bordered"
                      size="sm"
                      startContent={<Beef size={13} className="text-danger shrink-0" />}
                    />
                    <Input
                      label="Glucides (g)"
                      placeholder="60"
                      type="number"
                      min={0}
                      value={form.carbs}
                      onValueChange={(v) => setField("carbs", v)}
                      variant="bordered"
                      size="sm"
                      startContent={<Wheat size={13} className="text-warning shrink-0" />}
                    />
                    <Input
                      label="Lipides (g)"
                      placeholder="15"
                      type="number"
                      min={0}
                      value={form.fat}
                      onValueChange={(v) => setField("fat", v)}
                      variant="bordered"
                      size="sm"
                      startContent={<Droplets size={13} className="text-primary shrink-0" />}
                    />
                  </div>
                </div>

                <Divider />

                {/* ── Ingrédients ── */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <SectionLabel icon={<ListOrdered size={14} />} label="Ingrédients *" />
                    <Button
                      size="sm"
                      variant="flat"
                      color="success"
                      startContent={<Plus size={14} />}
                      onPress={addIngredient}
                    >
                      Ajouter
                    </Button>
                  </div>

                  {errors.ingredients && (
                    <p className="text-danger text-xs">{errors.ingredients}</p>
                  )}

                  <div className="flex flex-col gap-2">
                    {form.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <Input
                          placeholder="Nom de l'ingrédient"
                          value={ing.name}
                          onValueChange={(v) => updateIngredient(idx, "name", v)}
                          variant="bordered"
                          size="sm"
                          className="flex-[2]"
                        />
                        <Input
                          placeholder="Quantité"
                          value={ing.amount}
                          onValueChange={(v) => updateIngredient(idx, "amount", v)}
                          variant="bordered"
                          size="sm"
                          className="flex-[1]"
                        />
                        <Input
                          placeholder="Unité"
                          value={ing.unit}
                          onValueChange={(v) => updateIngredient(idx, "unit", v)}
                          variant="bordered"
                          size="sm"
                          className="flex-[1]"
                        />
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => removeIngredient(idx)}
                          isDisabled={form.ingredients.length === 1}
                          className="mt-0.5 shrink-0"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Divider />

                {/* ── Instructions ── */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <SectionLabel icon={<ListOrdered size={14} />} label="Étapes de préparation *" />
                    <Button
                      size="sm"
                      variant="flat"
                      color="success"
                      startContent={<Plus size={14} />}
                      onPress={addStep}
                    >
                      Ajouter
                    </Button>
                  </div>

                  {errors.instructions && (
                    <p className="text-danger text-xs">{errors.instructions}</p>
                  )}

                  <div className="flex flex-col gap-3">
                    {form.instructions.map((step, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <div className="w-7 h-7 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-xs font-bold text-success shrink-0 mt-1.5">
                          {step.number}
                        </div>
                        <Textarea
                          placeholder={`Décrivez l'étape ${step.number}…`}
                          value={step.step}
                          onValueChange={(v) => updateStep(idx, v)}
                          variant="bordered"
                          size="sm"
                          minRows={2}
                          className="flex-1"
                        />
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => removeStep(idx)}
                          isDisabled={form.instructions.length === 1}
                          className="mt-1 shrink-0"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Divider />

                {/* ── Tags ── */}
                <div className="flex flex-col gap-2">
                  <SectionLabel icon={<Tag size={14} />} label="Type de repas & régime alimentaire" />
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((tag) => (
                      <Chip
                        key={tag}
                        variant={form.dietary_tags.includes(tag) ? "solid" : "bordered"}
                        color={form.dietary_tags.includes(tag) ? "success" : "default"}
                        className="cursor-pointer select-none text-xs"
                        size="sm"
                        onClick={() => toggleTag(tag)}
                      >
                        {DIETARY_LABELS[tag] ?? tag}
                      </Chip>
                    ))}
                  </div>
                </div>

              </ScrollShadow>
            </ModalBody>

            <ModalFooter className="gap-2">
              <Button variant="flat" onPress={() => handleOpenChange(false)}>
                Annuler
              </Button>
              <Button
                color="success"
                onPress={handleSubmit}
                isLoading={saving}
                startContent={!saving && <Plus size={16} />}
                className="font-semibold text-white"
              >
                {isEdit ? "Sauvegarder" : "Créer la recette"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
