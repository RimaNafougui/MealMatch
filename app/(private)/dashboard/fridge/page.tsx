"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { toast } from "sonner";
import { Refrigerator, Clock, Plus, X, Sparkles, ChefHat } from "lucide-react";

interface MealSuggestion {
  title: string;
  description: string;
  estimated_time: number;
  ingredients_used: string[];
}

export default function FridgePage() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);

  function addIngredient() {
    const val = inputValue.trim();
    if (!val) return;
    if (ingredients.includes(val.toLowerCase())) {
      toast.error("Cet ingrédient est déjà dans la liste");
      return;
    }
    setIngredients((prev) => [...prev, val]);
    setInputValue("");
  }

  function removeIngredient(item: string) {
    setIngredients((prev) => prev.filter((i) => i !== item));
  }

  async function handleGenerate() {
    if (ingredients.length === 0) {
      toast.error("Ajoutez au moins un ingrédient");
      return;
    }
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch("/api/meal-plan/from-fridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");
      setSuggestions(data.meals ?? []);
    } catch (err: any) {
      toast.error(err.message ?? "Impossible de générer des repas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <Refrigerator size={28} className="text-primary" />
          Frigo IA
        </h1>
        <p className="text-default-500 mt-1 text-sm">
          Dites-nous ce que vous avez dans votre frigo et obtenez des idées de
          repas instantanées.
        </p>
      </div>

      {/* Ingredient input */}
      <Card className="border border-divider/50">
        <CardHeader className="px-5 pt-4 pb-2">
          <p className="font-semibold text-sm">Mes ingrédients</p>
        </CardHeader>
        <CardBody className="px-5 pb-5 flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: poulet, tomates, riz..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={(e) => e.key === "Enter" && addIngredient()}
              size="sm"
              classNames={{ inputWrapper: "bg-default-50" }}
              endContent={
                <Button
                  isIconOnly
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={addIngredient}
                  className="h-7 w-7 min-w-7"
                >
                  <Plus size={14} />
                </Button>
              }
            />
          </div>

          {ingredients.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((item) => (
                <Chip
                  key={item}
                  onClose={() => removeIngredient(item)}
                  variant="flat"
                  color="primary"
                  size="sm"
                  endContent={<X size={12} />}
                >
                  {item}
                </Chip>
              ))}
            </div>
          ) : (
            <p className="text-default-400 text-sm text-center py-2">
              Tapez un ingrédient et appuyez sur Entrée pour l&apos;ajouter
            </p>
          )}

          <Divider />

          <Button
            color="primary"
            startContent={!loading ? <Sparkles size={16} /> : undefined}
            isLoading={loading}
            onPress={handleGenerate}
            isDisabled={ingredients.length === 0}
            className="font-semibold"
          >
            Générer des repas
          </Button>
        </CardBody>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Spinner size="lg" color="primary" />
          <p className="text-default-400 text-sm">
            Notre IA cherche des idées de repas...
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && suggestions.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-default-400 uppercase tracking-wider">
            Idées de repas ({suggestions.length})
          </h2>
          {suggestions.map((meal, i) => (
            <Card
              key={i}
              className="border border-divider/50 bg-white/50 dark:bg-black/20"
            >
              <CardBody className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
                      <ChefHat size={16} className="text-primary" />
                    </div>
                    <h3 className="font-bold text-base">{meal.title}</h3>
                  </div>
                  {meal.estimated_time > 0 && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color="default"
                      startContent={<Clock size={12} />}
                      className="flex-shrink-0"
                    >
                      {meal.estimated_time} min
                    </Chip>
                  )}
                </div>
                <p className="text-sm text-default-500">{meal.description}</p>
                {meal.ingredients_used.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {meal.ingredients_used.map((ing, j) => (
                      <Chip
                        key={j}
                        size="sm"
                        variant="flat"
                        color="success"
                        className="text-xs"
                      >
                        {ing}
                      </Chip>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
