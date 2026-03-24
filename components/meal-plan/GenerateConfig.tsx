"use client";
import { useState, KeyboardEvent } from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import {
  CalendarDays,
  UtensilsCrossed,
  Sparkles,
  Timer,
  Globe2,
  RefreshCcw,
  X,
  Plus,
  Target,
  Wallet,
} from "lucide-react";
import { format, addDays, differenceInDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { MealPlanConfig } from "@/types/meal-plan";

interface GenerateConfigProps {
  initialConfig: MealPlanConfig;
  onConfigChange: (config: MealPlanConfig) => void;
  onGenerate: () => void;
  onCancel?: () => void;
  isGenerating: boolean;
  hasExistingPlan: boolean;
  existingPlanDate?: string;
  userPlan?: string;
}

const todayStr = format(new Date(), "yyyy-MM-dd");

const CUISINES = [
  { id: "french", label: "Française" },
  { id: "italian", label: "Italienne" },
  { id: "asian", label: "Asiatique" },
  { id: "mexican", label: "Mexicaine" },
  { id: "mediterranean", label: "Méditerranéenne" },
  { id: "american", label: "Américaine" },
  { id: "indian", label: "Indienne" },
  { id: "middle-eastern", label: "Moyen-Orient" },
];

const PREP_OPTIONS: { value: number | null; label: string; sub: string }[] = [
  { value: 20, label: "Rapide", sub: "< 20 min" },
  { value: 45, label: "Moyen", sub: "< 45 min" },
  { value: null, label: "Illimité", sub: "pas de limite" },
];

export function GenerateConfig({
  initialConfig,
  onConfigChange,
  onGenerate,
  onCancel,
  isGenerating,
  hasExistingPlan,
  existingPlanDate,
  userPlan = "free",
}: GenerateConfigProps) {
  const canRegenerate = userPlan === "student" || userPlan === "premium";

  const [config, setConfig] = useState<MealPlanConfig>({
    ...initialConfig,
    start_date: initialConfig.start_date ?? todayStr,
    end_date:
      initialConfig.end_date ?? format(addDays(new Date(), 6), "yyyy-MM-dd"),
    max_prep_time: initialConfig.max_prep_time ?? 45,
    cuisine_types: initialConfig.cuisine_types ?? [],
    allow_repetitions: initialConfig.allow_repetitions ?? false,
    avoid_ingredients: initialConfig.avoid_ingredients ?? [],
  });

  const [avoidInput, setAvoidInput] = useState("");

  const update = (patch: Partial<MealPlanConfig>) => {
    const next = { ...config, ...patch };
    setConfig(next);
    onConfigChange(next);
  };

  const handleDateChange = (start: string, end: string) => {
    if (!start || !end) return;
    const startD = parseISO(start);
    const endD = parseISO(end);
    if (endD < startD) return;
    const days = Math.max(1, Math.min(28, differenceInDays(endD, startD) + 1));
    update({ start_date: start, end_date: end, days_count: days });
  };

  const maxEndDate = config.start_date
    ? format(addDays(parseISO(config.start_date), 27), "yyyy-MM-dd")
    : format(addDays(new Date(), 27), "yyyy-MM-dd");

  const toggleCuisine = (id: string) => {
    const current = config.cuisine_types ?? [];
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    update({ cuisine_types: next });
  };

  const addAvoidIngredient = () => {
    const val = avoidInput.trim();
    if (!val) return;
    const current = config.avoid_ingredients ?? [];
    if (!current.includes(val))
      update({ avoid_ingredients: [...current, val] });
    setAvoidInput("");
  };

  const removeAvoidIngredient = (item: string) => {
    update({
      avoid_ingredients: (config.avoid_ingredients ?? []).filter(
        (i) => i !== item,
      ),
    });
  };

  const handleAvoidKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addAvoidIngredient();
    }
  };

  const mealLabels: Record<number, string> = {
    1: "1 repas/jour",
    2: "Déjeuner + Dîner",
    3: "Petit-déj. + Déjeuner + Dîner",
  };

  const startLabel = config.start_date
    ? format(parseISO(config.start_date), "d MMM", { locale: fr })
    : "—";
  const endLabel = config.end_date
    ? format(parseISO(config.end_date), "d MMM yyyy", { locale: fr })
    : "—";

  return (
    <div className="flex flex-col gap-4">
      {/* ── 1. Date range ── */}
      <Card className="border border-divider bg-content1">
        <CardBody className="gap-4 p-5">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-primary" />
            <span className="font-semibold text-xs uppercase tracking-widest text-foreground/60">
              Période du plan
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-foreground/50 font-medium">
                Début
              </label>
              <input
                type="date"
                value={config.start_date ?? todayStr}
                min={todayStr}
                onChange={(e) => {
                  const newStart = e.target.value;
                  const currentEnd = config.end_date ?? "";
                  const newEnd =
                    currentEnd < newStart
                      ? format(addDays(parseISO(newStart), 6), "yyyy-MM-dd")
                      : currentEnd;
                  handleDateChange(newStart, newEnd);
                }}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-divider bg-content2 text-sm font-medium focus:border-primary focus:outline-none transition-colors cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-foreground/50 font-medium">
                Fin
              </label>
              <input
                type="date"
                value={
                  config.end_date ??
                  format(addDays(new Date(), 6), "yyyy-MM-dd")
                }
                min={config.start_date ?? todayStr}
                max={maxEndDate}
                onChange={(e) =>
                  handleDateChange(
                    config.start_date ?? todayStr,
                    e.target.value,
                  )
                }
                className="w-full px-3 py-2.5 rounded-xl border-2 border-divider bg-content2 text-sm font-medium focus:border-primary focus:outline-none transition-colors cursor-pointer"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Chip size="sm" color="primary" variant="flat">
              {config.days_count} jour{config.days_count !== 1 ? "s" : ""}
            </Chip>
            <span className="text-xs text-foreground/40">
              {startLabel} → {endLabel}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* ── 2. Meals per day ── */}
      <Card className="border border-divider bg-content1">
        <CardBody className="gap-4 p-5">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={16} className="text-primary" />
            <span className="font-semibold text-xs uppercase tracking-widest text-foreground/60">
              Repas par jour
            </span>
          </div>
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((m) => (
              <button
                key={m}
                onClick={() => update({ meals_per_day: m })}
                className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-lg ${
                  config.meals_per_day === m
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-divider hover:border-primary/40 text-foreground/50"
                }`}
              >
                {m}
                <span className="block text-[9px] font-normal mt-0.5 opacity-70 leading-tight px-1">
                  {mealLabels[m]}
                </span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ── 3. Prep time ── */}
      <Card className="border border-divider bg-content1">
        <CardBody className="gap-4 p-5">
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-primary" />
            <span className="font-semibold text-xs uppercase tracking-widest text-foreground/60">
              Temps de préparation max
            </span>
          </div>
          <div className="flex gap-2">
            {PREP_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => update({ max_prep_time: opt.value })}
                className={`flex-1 py-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                  config.max_prep_time === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-divider hover:border-primary/40 text-foreground/50"
                }`}
              >
                {opt.label}
                <span className="block text-[9px] font-normal mt-0.5 opacity-60">
                  {opt.sub}
                </span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ── 4. Cuisine types ── */}
      <Card className="border border-divider bg-content1">
        <CardBody className="gap-4 p-5">
          <div className="flex items-center gap-2">
            <Globe2 size={16} className="text-primary" />
            <span className="font-semibold text-xs uppercase tracking-widest text-foreground/60">
              Types de cuisine
            </span>
            <span className="ml-auto text-[10px] text-foreground/30">
              optionnel
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((c) => {
              const selected = (config.cuisine_types ?? []).includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCuisine(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-divider text-foreground/50 hover:border-primary/40"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          {(config.cuisine_types ?? []).length === 0 && (
            <p className="text-[11px] text-foreground/30">
              Aucune sélection = toutes les cuisines
            </p>
          )}
        </CardBody>
      </Card>

      {/* ── 5. Avoid ingredients ── */}
      <Card className="border border-divider bg-content1">
        <CardBody className="gap-4 p-5">
          <div className="flex items-center gap-2">
            <X size={16} className="text-primary" />
            <span className="font-semibold text-xs uppercase tracking-widest text-foreground/60">
              Ingrédients à éviter
            </span>
            <span className="ml-auto text-[10px] text-foreground/30">
              optionnel
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={avoidInput}
              onChange={(e) => setAvoidInput(e.target.value)}
              onKeyDown={handleAvoidKeyDown}
              placeholder="Ex: brocoli, foie… Entrée pour ajouter"
              className="flex-1 px-3 py-2 rounded-xl border-2 border-divider bg-content2 text-sm focus:border-primary focus:outline-none transition-colors"
            />
            <button
              onClick={addAvoidIngredient}
              disabled={!avoidInput.trim()}
              className="p-2 rounded-xl border-2 border-divider bg-content2 hover:border-primary/50 disabled:opacity-30 transition-all"
            >
              <Plus size={16} className="text-foreground/60" />
            </button>
          </div>
          {(config.avoid_ingredients ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(config.avoid_ingredients ?? []).map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-danger/10 text-danger border border-danger/20"
                >
                  {item}
                  <button
                    onClick={() => removeAvoidIngredient(item)}
                    className="hover:opacity-70"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── 6. Meal prep mode ── */}
      <Card className="border border-divider bg-content1">
        <CardBody className="p-5">
          <button
            onClick={() =>
              update({ allow_repetitions: !config.allow_repetitions })
            }
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${config.allow_repetitions ? "bg-success/10" : "bg-default-100"}`}
              >
                <RefreshCcw
                  size={15}
                  className={
                    config.allow_repetitions
                      ? "text-success"
                      : "text-foreground/40"
                  }
                />
              </div>
              <div className="text-left">
                <p
                  className={`text-sm font-semibold ${config.allow_repetitions ? "text-success" : "text-foreground/70"}`}
                >
                  Mode meal prep
                </p>
                <p className="text-[11px] text-foreground/40">
                  Autoriser la répétition de repas (batch cooking)
                </p>
              </div>
            </div>
            <div
              className={`relative w-10 h-5.5 rounded-full transition-colors ${config.allow_repetitions ? "bg-success" : "bg-default-200"}`}
            >
              <span
                className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${
                  config.allow_repetitions ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>
        </CardBody>
      </Card>

      {/* ── 7. Weekly budget ── */}
      <Card className="border border-divider bg-content1">
        <CardBody className="gap-4 p-5">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-success" />
            <span className="font-semibold text-xs uppercase tracking-widest text-foreground/60">
              Budget épicerie / semaine
            </span>
            <span className="ml-auto text-[10px] text-foreground/30">optionnel</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-foreground/40">$</span>
              <input
                type="number"
                value={config.weekly_budget_cad ?? ""}
                min={10}
                max={500}
                step={5}
                onChange={(e) =>
                  update({ weekly_budget_cad: e.target.value ? Number(e.target.value) : null })
                }
                placeholder="ex: 60"
                className="w-full pl-7 pr-10 py-2.5 rounded-xl border-2 border-divider bg-content2 text-sm font-medium focus:border-success focus:outline-none transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground/30 font-medium">CAD</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[40, 60, 80, 100].map((preset) => (
              <button
                key={preset}
                onClick={() => update({ weekly_budget_cad: config.weekly_budget_cad === preset ? null : preset })}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  config.weekly_budget_cad === preset
                    ? "border-success bg-success/10 text-success"
                    : "border-divider text-foreground/40 hover:border-success/40"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
          {config.weekly_budget_cad && (
            <p className="text-[11px] text-success/70">
              L&apos;IA ciblera ~${(config.weekly_budget_cad / (config.days_count ?? 7)).toFixed(0)}$/jour · ~${(config.weekly_budget_cad / ((config.days_count ?? 7) * (config.meals_per_day ?? 3))).toFixed(2)} par repas
            </p>
          )}
        </CardBody>
      </Card>

      {/* ── 8. Objectifs nutritionnels par repas ── */}
      <Card className="border border-divider bg-content1">
        <CardBody className="gap-4 p-5">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-primary" />
            <span className="font-semibold text-xs uppercase tracking-widest text-foreground/60">
              Objectifs par repas
            </span>
            <span className="ml-auto text-[10px] text-foreground/30">optionnel</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-foreground/50 font-medium">Calories / repas</label>
              <input
                type="number"
                value={config.target_calories_per_meal ?? ""}
                min={100}
                max={1500}
                onChange={(e) =>
                  update({ target_calories_per_meal: e.target.value ? Number(e.target.value) : null })
                }
                placeholder="ex: 500"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-divider bg-content2 text-sm font-medium focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-foreground/50 font-medium">Protéines / repas (g)</label>
              <input
                type="number"
                value={config.target_protein_per_meal ?? ""}
                min={5}
                max={150}
                onChange={(e) =>
                  update({ target_protein_per_meal: e.target.value ? Number(e.target.value) : null })
                }
                placeholder="ex: 30"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-divider bg-content2 text-sm font-medium focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-foreground/50 font-medium">Glucides / repas (g)</label>
              <input
                type="number"
                value={config.target_carbs_per_meal ?? ""}
                min={5}
                max={300}
                onChange={(e) =>
                  update({ target_carbs_per_meal: e.target.value ? Number(e.target.value) : null })
                }
                placeholder="ex: 60"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-divider bg-content2 text-sm font-medium focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-foreground/50 font-medium">Lipides / repas (g)</label>
              <input
                type="number"
                value={config.target_fat_per_meal ?? ""}
                min={2}
                max={100}
                onChange={(e) =>
                  update({ target_fat_per_meal: e.target.value ? Number(e.target.value) : null })
                }
                placeholder="ex: 15"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-divider bg-content2 text-sm font-medium focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
          {(config.target_calories_per_meal || config.target_protein_per_meal || config.target_carbs_per_meal || config.target_fat_per_meal) && (
            <p className="text-[11px] text-foreground/40">
              Ces valeurs serviront de cibles à l'IA pour chaque repas généré.
            </p>
          )}
        </CardBody>
      </Card>

      {/* ── Summary ── */}
      <div className="flex items-center gap-2 flex-wrap px-1">
        <Chip color="primary" variant="flat" size="sm">
          {config.days_count} jours
        </Chip>
        <span className="text-foreground/40 text-sm">×</span>
        <Chip color="primary" variant="flat" size="sm">
          {config.meals_per_day} repas/jour
        </Chip>
        <span className="text-foreground/40 text-sm">=</span>
        <Chip color="success" variant="flat" size="sm">
          {config.days_count * config.meals_per_day} repas
        </Chip>
        {config.weekly_budget_cad && (
          <>
            <span className="text-foreground/40 text-sm">·</span>
            <Chip color="success" variant="flat" size="sm" startContent={<Wallet size={10} />}>
              ${config.weekly_budget_cad} CAD/sem
            </Chip>
          </>
        )}
      </div>

      {/* ── Generate button ── */}
      {hasExistingPlan && !canRegenerate ? (
        <div className="p-4 rounded-xl bg-warning-50 border border-warning-200 text-warning-700 text-sm">
          <p className="font-semibold">Plan déjà généré cette semaine</p>
          <p className="text-xs mt-1 opacity-80">
            Généré le {existingPlanDate}. Vous pouvez modifier votre plan
            ci-dessous.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            color="primary"
            size="lg"
            className="w-full font-bold h-14 text-base shadow-lg shadow-primary/20"
            onPress={onGenerate}
            isDisabled={isGenerating}
            startContent={!isGenerating && <Sparkles size={20} />}
          >
            {isGenerating
              ? "Génération en cours..."
              : hasExistingPlan
                ? "Régénérer le plan"
                : "Générer le plan de repas"}
          </Button>
          {isGenerating && onCancel && (
            <Button
              variant="flat"
              color="danger"
              size="sm"
              className="w-full"
              onPress={onCancel}
              startContent={<X size={14} />}
            >
              Annuler la génération
            </Button>
          )}
          {!isGenerating && hasExistingPlan && (
            <p className="text-xs text-foreground/40 text-center">
              Régénérer remplacera le plan existant pour cette période.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
