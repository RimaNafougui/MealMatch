"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingSteps } from "./OnboardingSteps";
import { Button, Slider, Spinner, Chip, Input, Select, SelectItem } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Salad,
  AlertCircle,
  Wallet,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  User,
  Activity,
  Target,
  Flame,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  calcTDEE,
  calcDailyCalorieTarget,
  lbsToKg,
  kgToLbs,
  inToCm,
  cmToIn,
  GOAL_RATES,
  type Sex,
  type ActivityLevel,
  type WeightGoal,
} from "@/utils/nutrition";

// ─── Data ────────────────────────────────────────────────────────────────────

const DIETARY_RESTRICTIONS = [
  { value: "gluten free", label: "Gluten Free", emoji: "🌾" },
  { value: "ketogenic", label: "Keto", emoji: "🥑" },
  { value: "vegetarian", label: "Végétarien", emoji: "🥦" },
  { value: "lacto-vegetarian", label: "Lacto-Végétarien", emoji: "🥛" },
  { value: "ovo-vegetarian", label: "Ovo-Végétarien", emoji: "🥚" },
  { value: "vegan", label: "Végétalien", emoji: "🌱" },
  { value: "pescetarian", label: "Pescétarien", emoji: "🐟" },
  { value: "paleo", label: "Paléo", emoji: "🍖" },
  { value: "primal", label: "Primal", emoji: "🦴" },
  { value: "low fodmap", label: "Low FODMAP", emoji: "🫙" },
  { value: "whole30", label: "Whole30", emoji: "🥗" },
];

const INTOLERANCES = [
  { value: "Dairy", label: "Produits Laitiers", emoji: "🥛" },
  { value: "Egg", label: "Œufs", emoji: "🥚" },
  { value: "Gluten", label: "Gluten", emoji: "🌾" },
  { value: "Grain", label: "Grains", emoji: "🌽" },
  { value: "Peanut", label: "Arachides", emoji: "🥜" },
  { value: "Seafood", label: "Fruits de Mer", emoji: "🦞" },
  { value: "Sesame", label: "Sésame", emoji: "🫘" },
  { value: "Shellfish", label: "Coquillages", emoji: "🦪" },
  { value: "Soy", label: "Soya", emoji: "🫛" },
  { value: "Sulfite", label: "Sulfites", emoji: "🍷" },
  { value: "Tree Nut", label: "Noix", emoji: "🌰" },
  { value: "Wheat", label: "Blé", emoji: "🍞" },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string; emoji: string }[] = [
  {
    value: "sedentary",
    label: "Sédentaire",
    desc: "≤ 5 000 pas/jour",
    emoji: "🛋️",
  },
  {
    value: "moderately_active",
    label: "Modérément actif",
    desc: "5 000 – 15 000 pas/jour",
    emoji: "🚶",
  },
  {
    value: "very_active",
    label: "Très actif",
    desc: "≥ 15 000 pas/jour",
    emoji: "🏃",
  },
];

const GOAL_OPTIONS: { value: WeightGoal; label: string; emoji: string; desc: string }[] = [
  { value: "lose",     label: "Perdre du poids",   emoji: "📉", desc: "Déficit calorique ciblé" },
  { value: "maintain", label: "Maintenir mon poids", emoji: "⚖️", desc: "Rester au même poids" },
  { value: "gain",     label: "Prendre du poids",   emoji: "📈", desc: "Surplus calorique progressif" },
];

// ─── Steps config ─────────────────────────────────────────────────────────────

const steps = [
  { label: "Régime",       icon: "🥗" },
  { label: "Intolérances", icon: "⚠️" },
  { label: "Budget",       icon: "💰" },
  { label: "Metrics",      icon: "📏" },
  { label: "Activité",     icon: "🏃" },
  { label: "Objectifs",    icon: "🎯" },
  { label: "Macros",       icon: "🥩" },
  { label: "Résumé",       icon: "📋" },
];

// ─── Toggle Chip helper ───────────────────────────────────────────────────────

function ToggleChip({
  value, label, emoji, selected, onToggle,
}: {
  value: string; label: string; emoji: string; selected: boolean; onToggle: (v: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(value)}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium
        transition-all duration-200 cursor-pointer select-none
        ${selected
          ? "border-success bg-success/10 text-success dark:bg-success/15 shadow-sm shadow-success/20"
          : "border-divider bg-white/50 dark:bg-white/5 text-default-600 hover:border-success/50 hover:bg-success/5"
        }
      `}
    >
      <span className="text-base">{emoji}</span>
      <span>{label}</span>
      {selected && <CheckCircle2 size={14} className="ml-auto text-success shrink-0" />}
    </button>
  );
}

// ─── Selectable Card ──────────────────────────────────────────────────────────

function SelectCard({
  selected, onClick, emoji, label, desc, color = "success",
}: {
  selected: boolean; onClick: () => void; emoji: string; label: string; desc: string; color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-4 p-4 rounded-2xl border-2 text-left w-full
        transition-all duration-200 cursor-pointer
        ${selected
          ? `border-${color} bg-${color}/10 shadow-sm shadow-${color}/20`
          : "border-divider bg-white/50 dark:bg-white/5 hover:border-default-300"
        }
      `}
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <p className={`font-semibold text-sm ${selected ? `text-${color}` : ""}`}>{label}</p>
        <p className="text-xs text-default-400">{desc}</p>
      </div>
      {selected && <CheckCircle2 size={16} className={`text-${color} shrink-0`} />}
    </button>
  );
}

// ─── Summary Row ──────────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-divider/40 last:border-0">
      <span className="text-xs text-default-500">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingForm() {
  const router = useRouter();

  // ── Existing fields ──
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [intolerances, setIntolerances] = useState<string[]>([]);
  const [budgetPeriod, setBudgetPeriod] = useState<"week" | "month">("week");
  const [budgetRange, setBudgetRange] = useState<[number, number]>([20, 100]);

  // ── Step 3: Body metrics ──
  const [birthYear, setBirthYear] = useState<string>("");
  const [sex, setSex] = useState<Sex | "">("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [heightCm, setHeightCm] = useState<string>("");
  const [heightFt, setHeightFt] = useState<string>("");   // feet part when in inches
  const [heightIn, setHeightIn] = useState<string>("");   // inches remainder
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [weight, setWeight] = useState<string>("");

  // ── Step 4: Activity ──
  const [exerciseDays, setExerciseDays] = useState<number>(3);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">("");

  // ── Step 5: Goals ──
  const [weightGoal, setWeightGoal] = useState<WeightGoal | "">("");
  const [goalWeightRaw, setGoalWeightRaw] = useState<string>("");
  const [goalRate, setGoalRate] = useState<string>("");

  // ── Step 6: Macro split ──
  const [proteinPct, setProteinPct] = useState(30);
  const [carbsPct, setCarbsPct] = useState(40);
  const [fatPct, setFatPct] = useState(30);

  // Computed grams from percentages
  const macroGrams = (calories: number | null) => {
    if (!calories) return null;
    return {
      protein: Math.round((calories * proteinPct) / 100 / 4),
      carbs:   Math.round((calories * carbsPct)   / 100 / 4),
      fat:     Math.round((calories * fatPct)      / 100 / 9),
    };
  };

  // ── Calculated values ──
  const [tdee, setTdee] = useState<number | null>(null);
  const [dailyCalories, setDailyCalories] = useState<number | null>(null);

  // ── UI ──
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if onboarding already completed
  useEffect(() => {
    fetch("/api/profiles/onboarding-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.onboardingCompleted) router.push("/dashboard");
        else setCheckingStatus(false);
      })
      .catch(() => setCheckingStatus(false));
  }, [router]);

  // Recalculate TDEE whenever relevant fields change
  useEffect(() => {
    if (!birthYear || !sex || !heightCm && !heightFt || !weight || !activityLevel) return;
    const age = new Date().getFullYear() - Number(birthYear);
    const hCm = heightUnit === "cm"
      ? Number(heightCm)
      : inToCm(Number(heightFt) * 12 + Number(heightIn || 0));
    const wKg = weightUnit === "kg" ? Number(weight) : lbsToKg(Number(weight));
    if (!age || !hCm || !wKg || !sex || !activityLevel) return;
    const t = calcTDEE(wKg, hCm, age, sex as Sex, activityLevel as ActivityLevel, exerciseDays);
    setTdee(t);
    if (goalRate) setDailyCalories(calcDailyCalorieTarget(t, goalRate));
  }, [birthYear, sex, heightCm, heightFt, heightIn, heightUnit, weight, weightUnit, activityLevel, exerciseDays, goalRate]);

  // When goalRate changes recalculate calories
  useEffect(() => {
    if (tdee && goalRate) setDailyCalories(calcDailyCalorieTarget(tdee, goalRate));
  }, [goalRate, tdee]);

  const toggleItem = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  // Validation per step
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 3) {
      const year = Number(birthYear);
      const currentYear = new Date().getFullYear();
      if (!birthYear || year < 1920 || year > currentYear - 10)
        newErrors.birthYear = "Entrez une année de naissance valide";
      if (!sex) newErrors.sex = "Sélectionnez votre sexe";

      const hNum = heightUnit === "cm"
        ? Number(heightCm)
        : Number(heightFt) * 12 + Number(heightIn || 0);
      if (!hNum || hNum < 50 || hNum > 300)
        newErrors.height = heightUnit === "cm" ? "Entrez une taille entre 50 et 300 cm" : "Entrez une taille valide";

      const wNum = Number(weight);
      if (!wNum || wNum < 20 || wNum > 500)
        newErrors.weight = "Entrez un poids valide";
    }

    if (currentStep === 4) {
      if (!activityLevel) newErrors.activityLevel = "Sélectionnez votre niveau d'activité";
    }

    if (currentStep === 5) {
      if (!weightGoal) newErrors.weightGoal = "Sélectionnez un objectif";
      if (!goalRate) newErrors.goalRate = "Sélectionnez un rythme";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Build stored values (always in metric)
      const age = new Date().getFullYear() - Number(birthYear);
      const finalHeightCm = heightUnit === "cm"
        ? Number(heightCm)
        : inToCm(Number(heightFt) * 12 + Number(heightIn || 0));
      const finalWeightKg = weightUnit === "kg"
        ? Number(weight)
        : lbsToKg(Number(weight));
      const goalWeightKg = goalWeightRaw
        ? (weightUnit === "kg" ? Number(goalWeightRaw) : lbsToKg(Number(goalWeightRaw)))
        : null;
      const finalTdee = tdee ?? (sex && activityLevel
        ? calcTDEE(finalWeightKg, finalHeightCm, age, sex as Sex, activityLevel as ActivityLevel, exerciseDays)
        : null);
      const finalCalories = finalTdee && goalRate
        ? calcDailyCalorieTarget(finalTdee, goalRate)
        : finalTdee;

      const res = await fetch("/api/profiles/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dietary_restrictions: dietaryRestrictions,
          allergies: intolerances,
          budget_min: budgetPeriod === "month" ? Math.round(budgetRange[0] / 4.33) : budgetRange[0],
          budget_max: budgetPeriod === "month" ? Math.round(budgetRange[1] / 4.33) : budgetRange[1],
          birth_year: Number(birthYear),
          sex,
          height_cm: finalHeightCm,
          weight_kg: finalWeightKg,
          height_unit: heightUnit,
          weight_unit: weightUnit,
          exercise_days_per_week: exerciseDays,
          activity_level: activityLevel,
          tdee_kcal: finalTdee,
          weight_goal: weightGoal,
          goal_weight_kg: goalWeightKg,
          goal_rate: goalRate,
          daily_calorie_target: finalCalories,
          macro_protein_pct: proteinPct,
          macro_carbs_pct: carbsPct,
          macro_fat_pct: fatPct,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error("Onboarding error:", data.error);
        setLoading(false);
        return;
      }

      router.push(
        siteConfig.navMenuItems.find((item) => item.label === "Dashboard")?.href || "/dashboard"
      );
    } catch (err) {
      console.error("Onboarding error:", err);
      setLoading(false);
    }
  };

  // ─── Derived display helpers ─────────────────────────────────────────────────

  const displayHeight = () => {
    if (heightUnit === "cm") return heightCm ? `${heightCm} cm` : "—";
    return heightFt ? `${heightFt}'${heightIn || 0}"` : "—";
  };
  const displayWeight = (kg: number | null) => {
    if (!kg) return "—";
    return weightUnit === "kg"
      ? `${kg.toFixed(1)} kg`
      : `${kgToLbs(kg).toFixed(1)} lbs`;
  };

  const filteredRates = GOAL_RATES.filter(
    (r) => !weightGoal || r.goalTypes.includes(weightGoal as WeightGoal)
  );

  // ─── Loading state ───────────────────────────────────────────────────────────

  if (checkingStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner size="lg" color="success" />
        <p className="text-default-500 text-sm">Chargement…</p>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tighter uppercase italic">
            Bienvenue sur MealMatch !
          </h1>
          <p className="text-default-500 text-sm tracking-wide">
            Personnalisez votre expérience en quelques étapes
          </p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50 rounded-3xl shadow-xl p-6 sm:p-8">
          <OnboardingSteps steps={steps} currentStep={currentStep} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >

              {/* ── Step 0: Dietary Restrictions ── */}
              {currentStep === 0 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center">
                      <Salad size={20} className="text-success" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Restrictions alimentaires</h2>
                      <p className="text-default-500 text-xs">Sélectionnez tous ceux qui s&apos;appliquent</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {DIETARY_RESTRICTIONS.map((item) => (
                      <ToggleChip
                        key={item.value}
                        value={item.value}
                        label={item.label}
                        emoji={item.emoji}
                        selected={dietaryRestrictions.includes(item.value)}
                        onToggle={(v) => toggleItem(dietaryRestrictions, setDietaryRestrictions, v)}
                      />
                    ))}
                  </div>
                  {dietaryRestrictions.length === 0 && (
                    <p className="text-xs text-default-400 italic">
                      Aucune sélection — vous recevrez toutes les suggestions.
                    </p>
                  )}
                </div>
              )}

              {/* ── Step 1: Intolerances ── */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-warning/10 flex items-center justify-center">
                      <AlertCircle size={20} className="text-warning" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Intolérances alimentaires</h2>
                      <p className="text-default-500 text-xs">Indiquez vos allergies ou intolérances</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {INTOLERANCES.map((item) => (
                      <ToggleChip
                        key={item.value}
                        value={item.value}
                        label={item.label}
                        emoji={item.emoji}
                        selected={intolerances.includes(item.value)}
                        onToggle={(v) => toggleItem(intolerances, setIntolerances, v)}
                      />
                    ))}
                  </div>
                  {intolerances.length === 0 && (
                    <p className="text-xs text-default-400 italic">Aucune intolérance sélectionnée.</p>
                  )}
                </div>
              )}

              {/* ── Step 2: Budget ── */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Wallet size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Budget alimentaire</h2>
                      <p className="text-default-500 text-xs">Définissez votre fourchette de budget en CAD</p>
                    </div>
                  </div>

                  {/* Period toggle */}
                  <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-default-100 self-center w-fit mx-auto">
                    {(["week", "month"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          if (p === budgetPeriod) return;
                          // Convert existing values to the new period
                          if (p === "month") {
                            setBudgetRange([Math.round(budgetRange[0] * 4.33 / 5) * 5, Math.round(budgetRange[1] * 4.33 / 5) * 5]);
                          } else {
                            setBudgetRange([Math.round(budgetRange[0] / 4.33 / 5) * 5, Math.round(budgetRange[1] / 4.33 / 5) * 5]);
                          }
                          setBudgetPeriod(p);
                        }}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all
                          ${budgetPeriod === p
                            ? "bg-white dark:bg-black shadow text-foreground"
                            : "text-default-400 hover:text-default-600"
                          }`}
                      >
                        {p === "week" ? "Par semaine" : "Par mois"}
                      </button>
                    ))}
                  </div>

                  {/* Range display */}
                  <div className="flex justify-between items-center px-1">
                    <div className="text-center">
                      <p className="text-xs text-default-400 mb-1">Minimum</p>
                      <p className="text-2xl font-bold text-success">{budgetRange[0]} $</p>
                    </div>
                    <div className="text-default-300 text-xl">—</div>
                    <div className="text-center">
                      <p className="text-xs text-default-400 mb-1">Maximum</p>
                      <p className="text-2xl font-bold text-success">{budgetRange[1]} $</p>
                    </div>
                  </div>

                  <Slider
                    step={5}
                    minValue={0}
                    maxValue={budgetPeriod === "month" ? 1600 : 400}
                    value={budgetRange}
                    onChange={(value) => setBudgetRange(value as [number, number])}
                    color="success"
                    size="lg"
                    className="px-1"
                    showTooltip
                    tooltipValueFormatOptions={{ style: "currency", currency: "CAD", maximumFractionDigits: 0 }}
                  />

                  <div className="text-center space-y-1">
                    <p className="text-xs text-default-400">
                      Budget {budgetPeriod === "week" ? "par semaine" : "par mois"} en dollars canadiens (CAD)
                    </p>
                    {budgetPeriod === "month" && (
                      <p className="text-xs text-default-500 font-medium">
                        ≈ {Math.round(budgetRange[0] / 4.33)} $ — {Math.round(budgetRange[1] / 4.33)} $ / semaine
                      </p>
                    )}
                    {budgetPeriod === "week" && (
                      <p className="text-xs text-default-500 font-medium">
                        ≈ {Math.round(budgetRange[0] * 4.33)} $ — {Math.round(budgetRange[1] * 4.33)} $ / mois
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 3: Body Metrics ── */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                      <User size={20} className="text-secondary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Vos informations physiques</h2>
                      <p className="text-default-500 text-xs">Utilisées pour calculer votre dépense énergétique</p>
                    </div>
                  </div>

                  {/* Birth year */}
                  <Input
                    label="Année de naissance"
                    placeholder="ex. 2000"
                    type="number"
                    value={birthYear}
                    onValueChange={setBirthYear}
                    variant="flat"
                    isInvalid={!!errors.birthYear}
                    errorMessage={errors.birthYear}
                    min={1920}
                    max={new Date().getFullYear() - 10}
                  />

                  {/* Sex */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Sexe biologique</p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { value: "male",   label: "Homme", emoji: "♂️" },
                        { value: "female", label: "Femme",  emoji: "♀️" },
                        { value: "other",  label: "Autre",  emoji: "⚧️" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSex(opt.value as Sex)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer
                            ${sex === opt.value
                              ? "border-secondary bg-secondary/10 text-secondary"
                              : "border-divider bg-white/50 dark:bg-white/5 text-default-600 hover:border-secondary/50"
                            }`}
                        >
                          <span>{opt.emoji}</span>{opt.label}
                          {sex === opt.value && <CheckCircle2 size={14} className="text-secondary" />}
                        </button>
                      ))}
                    </div>
                    {errors.sex && <p className="text-danger text-xs">{errors.sex}</p>}
                  </div>

                  {/* Height */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Taille</p>
                      <div className="flex gap-1 p-0.5 rounded-lg bg-default-100">
                        {(["cm", "in"] as const).map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setHeightUnit(u)}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all
                              ${heightUnit === u ? "bg-white dark:bg-black shadow text-foreground" : "text-default-400"}`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                    {heightUnit === "cm" ? (
                      <Input
                        placeholder="ex. 170"
                        type="number"
                        value={heightCm}
                        onValueChange={setHeightCm}
                        variant="flat"
                        endContent={<span className="text-default-400 text-sm">cm</span>}
                        isInvalid={!!errors.height}
                        errorMessage={errors.height}
                      />
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="5"
                          type="number"
                          value={heightFt}
                          onValueChange={setHeightFt}
                          variant="flat"
                          endContent={<span className="text-default-400 text-sm">ft</span>}
                          isInvalid={!!errors.height}
                        />
                        <Input
                          placeholder="8"
                          type="number"
                          value={heightIn}
                          onValueChange={setHeightIn}
                          variant="flat"
                          endContent={<span className="text-default-400 text-sm">in</span>}
                        />
                      </div>
                    )}
                    {errors.height && heightUnit === "in" && (
                      <p className="text-danger text-xs">{errors.height}</p>
                    )}
                  </div>

                  {/* Weight */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Poids</p>
                      <div className="flex gap-1 p-0.5 rounded-lg bg-default-100">
                        {(["kg", "lbs"] as const).map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setWeightUnit(u)}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all
                              ${weightUnit === u ? "bg-white dark:bg-black shadow text-foreground" : "text-default-400"}`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input
                      placeholder={weightUnit === "kg" ? "ex. 70" : "ex. 155"}
                      type="number"
                      value={weight}
                      onValueChange={setWeight}
                      variant="flat"
                      endContent={<span className="text-default-400 text-sm">{weightUnit}</span>}
                      isInvalid={!!errors.weight}
                      errorMessage={errors.weight}
                    />
                  </div>
                </div>
              )}

              {/* ── Step 4: Activity ── */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-warning/10 flex items-center justify-center">
                      <Activity size={20} className="text-warning" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Niveau d&apos;activité</h2>
                      <p className="text-default-500 text-xs">Ces informations affinent votre dépense calorique</p>
                    </div>
                  </div>

                  {/* Exercise days */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Séances d&apos;exercice par semaine</p>
                      <span className="text-2xl font-bold text-warning">{exerciseDays}</span>
                    </div>
                    <Slider
                      step={1}
                      minValue={0}
                      maxValue={7}
                      value={exerciseDays}
                      onChange={(v) => setExerciseDays(v as number)}
                      color="warning"
                      size="lg"
                      showTooltip
                      marks={[0, 1, 2, 3, 4, 5, 6, 7].map((v) => ({ value: v, label: String(v) }))}
                    />
                  </div>

                  {/* Activity level */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Niveau de pas quotidiens</p>
                    <div className="flex flex-col gap-2">
                      {ACTIVITY_OPTIONS.map((opt) => (
                        <SelectCard
                          key={opt.value}
                          selected={activityLevel === opt.value}
                          onClick={() => setActivityLevel(opt.value)}
                          emoji={opt.emoji}
                          label={opt.label}
                          desc={opt.desc}
                          color="warning"
                        />
                      ))}
                    </div>
                    {errors.activityLevel && (
                      <p className="text-danger text-xs">{errors.activityLevel}</p>
                    )}
                  </div>

                  {/* Live TDEE preview */}
                  {tdee && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-warning/5 border border-warning/20">
                      <Flame size={20} className="text-warning shrink-0" />
                      <div>
                        <p className="text-xs text-default-500">Dépense énergétique estimée (TDEE)</p>
                        <p className="font-bold text-lg text-warning">{tdee.toLocaleString()} kcal/jour</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 5: Goals ── */}
              {currentStep === 5 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Target size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Vos objectifs</h2>
                      <p className="text-default-500 text-xs">Calculons votre apport calorique idéal</p>
                    </div>
                  </div>

                  {/* Goal type */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Objectif de poids</p>
                    <div className="flex flex-col gap-2">
                      {GOAL_OPTIONS.map((opt) => (
                        <SelectCard
                          key={opt.value}
                          selected={weightGoal === opt.value}
                          onClick={() => { setWeightGoal(opt.value); setGoalRate(""); }}
                          emoji={opt.emoji}
                          label={opt.label}
                          desc={opt.desc}
                          color="primary"
                        />
                      ))}
                    </div>
                    {errors.weightGoal && <p className="text-danger text-xs">{errors.weightGoal}</p>}
                  </div>

                  {/* Target weight */}
                  {weightGoal && weightGoal !== "maintain" && (
                    <Input
                      label={`Poids cible (${weightUnit})`}
                      placeholder={weightUnit === "kg" ? "ex. 65" : "ex. 143"}
                      type="number"
                      value={goalWeightRaw}
                      onValueChange={setGoalWeightRaw}
                      variant="flat"
                      endContent={<span className="text-default-400 text-sm">{weightUnit}</span>}
                    />
                  )}

                  {/* Rate */}
                  {weightGoal && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium">Rythme de progression</p>
                      <div className="flex flex-col gap-2">
                        {filteredRates.map((r) => (
                          <button
                            key={r.key}
                            type="button"
                            onClick={() => setGoalRate(r.key)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm text-left transition-all cursor-pointer
                              ${goalRate === r.key
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-divider bg-white/50 dark:bg-white/5 text-default-600 hover:border-primary/40"
                              }`}
                          >
                            {goalRate === r.key
                              ? <CheckCircle2 size={16} className="text-primary shrink-0" />
                              : <span className="w-4 h-4 rounded-full border-2 border-divider shrink-0" />}
                            <span className="font-medium">{r.label}</span>
                          </button>
                        ))}
                      </div>
                      {errors.goalRate && <p className="text-danger text-xs">{errors.goalRate}</p>}
                    </div>
                  )}

                  {/* Calorie target preview */}
                  {dailyCalories && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                      <Flame size={20} className="text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-default-500">Objectif calorique journalier calculé</p>
                        <p className="font-bold text-lg text-primary">{dailyCalories.toLocaleString()} kcal/jour</p>
                        {tdee && <p className="text-xs text-default-400">TDEE : {tdee.toLocaleString()} kcal → {dailyCalories > tdee ? "+" : ""}{dailyCalories - tdee} kcal</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 6: Macro Split ── */}
              {currentStep === 6 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-danger/10 flex items-center justify-center">
                      <span className="text-xl">🥩</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Répartition des macronutriments</h2>
                      <p className="text-default-500 text-xs">Définissez la part de chaque groupe nutritionnel</p>
                    </div>
                  </div>

                  {/* Total must = 100 warning */}
                  {proteinPct + carbsPct + fatPct !== 100 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/10 border border-warning/30">
                      <span className="text-warning text-xs font-semibold">
                        Total : {proteinPct + carbsPct + fatPct}% — doit être égal à 100%
                      </span>
                    </div>
                  )}

                  {/* Visual bar */}
                  <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                    <div className="bg-danger transition-all duration-300" style={{ width: `${proteinPct}%` }} />
                    <div className="bg-warning transition-all duration-300" style={{ width: `${carbsPct}%` }} />
                    <div className="bg-primary transition-all duration-300" style={{ width: `${fatPct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-default-400 -mt-1">
                    <span className="text-danger font-medium">Protéines {proteinPct}%</span>
                    <span className="text-warning font-medium">Glucides {carbsPct}%</span>
                    <span className="text-primary font-medium">Lipides {fatPct}%</span>
                  </div>

                  {/* Protein slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-danger">🥩 Protéines</p>
                      <span className="text-lg font-bold text-danger">{proteinPct}%</span>
                    </div>
                    <Slider
                      step={5} minValue={5} maxValue={60}
                      value={proteinPct}
                      onChange={(v) => {
                        const val = v as number;
                        setProteinPct(val);
                        // auto-adjust fat to keep sum = 100
                        const remaining = 100 - val - carbsPct;
                        setFatPct(Math.max(5, Math.min(60, remaining)));
                      }}
                      color="danger" size="md" showTooltip
                    />
                  </div>

                  {/* Carbs slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-warning">🌾 Glucides</p>
                      <span className="text-lg font-bold text-warning">{carbsPct}%</span>
                    </div>
                    <Slider
                      step={5} minValue={5} maxValue={70}
                      value={carbsPct}
                      onChange={(v) => {
                        const val = v as number;
                        setCarbsPct(val);
                        const remaining = 100 - proteinPct - val;
                        setFatPct(Math.max(5, Math.min(60, remaining)));
                      }}
                      color="warning" size="md" showTooltip
                    />
                  </div>

                  {/* Fat slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-primary">🫒 Lipides</p>
                      <span className="text-lg font-bold text-primary">{fatPct}%</span>
                    </div>
                    <Slider
                      step={5} minValue={5} maxValue={60}
                      value={fatPct}
                      onChange={(v) => {
                        const val = v as number;
                        setFatPct(val);
                        const remaining = 100 - proteinPct - val;
                        setCarbsPct(Math.max(5, Math.min(70, remaining)));
                      }}
                      color="primary" size="md" showTooltip
                    />
                  </div>

                  {/* Gram preview */}
                  {dailyCalories && (() => {
                    const g = macroGrams(dailyCalories);
                    return g ? (
                      <div className="flex gap-3 pt-1">
                        <div className="flex-1 p-3 rounded-xl bg-danger/5 border border-danger/15 text-center">
                          <p className="text-xs text-default-400">Protéines</p>
                          <p className="font-bold text-danger">{g.protein}g</p>
                        </div>
                        <div className="flex-1 p-3 rounded-xl bg-warning/5 border border-warning/15 text-center">
                          <p className="text-xs text-default-400">Glucides</p>
                          <p className="font-bold text-warning">{g.carbs}g</p>
                        </div>
                        <div className="flex-1 p-3 rounded-xl bg-primary/5 border border-primary/15 text-center">
                          <p className="text-xs text-default-400">Lipides</p>
                          <p className="font-bold text-primary">{g.fat}g</p>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  <p className="text-xs text-default-400 text-center">
                    Valeurs typiques : Protéines 25–35% • Glucides 35–50% • Lipides 20–35%
                  </p>
                </div>
              )}

              {/* ── Step 7: Summary ── */}
              {currentStep === 7 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center">
                      <ClipboardList size={20} className="text-success" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Résumé de vos préférences</h2>
                      <p className="text-default-500 text-xs">Vérifiez vos informations avant de continuer</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Dietary */}
                    <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-divider/40 p-4 space-y-2">
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider">Régime alimentaire</p>
                      {dietaryRestrictions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {dietaryRestrictions.map((v) => {
                            const item = DIETARY_RESTRICTIONS.find((d) => d.value === v);
                            return <Chip key={v} size="sm" variant="flat" color="success" className="text-xs">{item?.emoji} {item?.label ?? v}</Chip>;
                          })}
                        </div>
                      ) : <p className="text-sm text-default-400 italic">Aucune restriction</p>}
                    </div>

                    {/* Intolerances */}
                    <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-divider/40 p-4 space-y-2">
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider">Intolérances</p>
                      {intolerances.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {intolerances.map((v) => {
                            const item = INTOLERANCES.find((i) => i.value === v);
                            return <Chip key={v} size="sm" variant="flat" color="warning" className="text-xs">{item?.emoji} {item?.label ?? v}</Chip>;
                          })}
                        </div>
                      ) : <p className="text-sm text-default-400 italic">Aucune intolérance</p>}
                    </div>

                    {/* Budget */}
                    <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-divider/40 p-4 space-y-1">
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider">Budget</p>
                      <p className="text-sm font-semibold text-success">
                        {budgetRange[0]} $ — {budgetRange[1]} $ CAD / {budgetPeriod === "week" ? "semaine" : "mois"}
                      </p>
                      {budgetPeriod === "month" && (
                        <p className="text-xs text-default-400">
                          ≈ {Math.round(budgetRange[0] / 4.33)} $ — {Math.round(budgetRange[1] / 4.33)} $ / semaine
                        </p>
                      )}
                      {budgetPeriod === "week" && (
                        <p className="text-xs text-default-400">
                          ≈ {Math.round(budgetRange[0] * 4.33)} $ — {Math.round(budgetRange[1] * 4.33)} $ / mois
                        </p>
                      )}
                    </div>

                    {/* Body & Activity */}
                    <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-divider/40 p-4 space-y-1">
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-2">Profil physique</p>
                      <SummaryRow label="Année de naissance" value={birthYear || "—"} />
                      <SummaryRow label="Sexe" value={sex === "male" ? "Homme" : sex === "female" ? "Femme" : sex === "other" ? "Autre" : "—"} />
                      <SummaryRow label="Taille" value={displayHeight()} />
                      <SummaryRow label="Poids" value={weight ? `${weight} ${weightUnit}` : "—"} />
                      <SummaryRow label="Exercice" value={`${exerciseDays} jour${exerciseDays > 1 ? "s" : ""}/semaine`} />
                      <SummaryRow label="Activité" value={ACTIVITY_OPTIONS.find((a) => a.value === activityLevel)?.label || "—"} />
                    </div>

                    {/* Calorie targets */}
                    {tdee && (
                      <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 space-y-1">
                        <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-2">Objectifs caloriques</p>
                        <SummaryRow label="Dépense énergétique (TDEE)" value={`${tdee.toLocaleString()} kcal/jour`} />
                        <SummaryRow label="Objectif" value={GOAL_OPTIONS.find((g) => g.value === weightGoal)?.label || "—"} />
                        {goalWeightRaw && <SummaryRow label="Poids cible" value={`${goalWeightRaw} ${weightUnit}`} />}
                        <SummaryRow label="Rythme" value={GOAL_RATES.find((r) => r.key === goalRate)?.label || "—"} />
                        {dailyCalories && (
                          <div className="mt-2 pt-2 border-t border-primary/20">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-primary">Apport calorique cible</span>
                              <span className="text-lg font-extrabold text-primary">{dailyCalories.toLocaleString()} kcal</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Macros */}
                    <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-divider/40 p-4 space-y-2">
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-2">Macronutriments</p>
                      <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-2">
                        <div className="bg-danger" style={{ width: `${proteinPct}%` }} />
                        <div className="bg-warning" style={{ width: `${carbsPct}%` }} />
                        <div className="bg-primary" style={{ width: `${fatPct}%` }} />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 text-center">
                          <p className="text-xs text-default-400">Protéines</p>
                          <p className="font-bold text-sm text-danger">{proteinPct}%{dailyCalories ? ` · ${macroGrams(dailyCalories)?.protein}g` : ""}</p>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-xs text-default-400">Glucides</p>
                          <p className="font-bold text-sm text-warning">{carbsPct}%{dailyCalories ? ` · ${macroGrams(dailyCalories)?.carbs}g` : ""}</p>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-xs text-default-400">Lipides</p>
                          <p className="font-bold text-sm text-primary">{fatPct}%{dailyCalories ? ` · ${macroGrams(dailyCalories)?.fat}g` : ""}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-divider/40">
            <Button
              variant="flat"
              onPress={handleBack}
              isDisabled={currentStep === 0}
              startContent={<ChevronLeft size={16} />}
              className="font-semibold"
            >
              Retour
            </Button>

            <span className="text-xs text-default-400">
              {currentStep + 1} / {steps.length}
            </span>

            <Button
              color="success"
              onPress={handleNext}
              isLoading={loading}
              endContent={!loading && currentStep < steps.length - 1 ? <ChevronRight size={16} /> : undefined}
              className="font-bold text-white shadow-lg shadow-success/20"
            >
              {currentStep < steps.length - 1 ? "Suivant" : loading ? "Sauvegarde…" : "Terminer"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
