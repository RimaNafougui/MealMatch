"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingSteps } from "./OnboardingSteps";
import { Button, Slider, Spinner, Chip } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Salad,
  AlertCircle,
  Wallet,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { siteConfig } from "@/config/site";

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

// ─── Steps config ─────────────────────────────────────────────────────────────

const steps = [
  { label: "Régime", icon: "🥗" },
  { label: "Intolérances", icon: "⚠️" },
  { label: "Budget", icon: "💰" },
  { label: "Résumé", icon: "📋" },
];

// ─── Toggle Chip helper ───────────────────────────────────────────────────────

function ToggleChip({
  value,
  label,
  emoji,
  selected,
  onToggle,
}: {
  value: string;
  label: string;
  emoji: string;
  selected: boolean;
  onToggle: (v: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(value)}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium
        transition-all duration-200 cursor-pointer select-none
        ${
          selected
            ? "border-success bg-success/10 text-success dark:bg-success/15 shadow-sm shadow-success/20"
            : "border-divider bg-white/50 dark:bg-white/5 text-default-600 hover:border-success/50 hover:bg-success/5"
        }
      `}
    >
      <span className="text-base">{emoji}</span>
      <span>{label}</span>
      {selected && (
        <CheckCircle2 size={14} className="ml-auto text-success shrink-0" />
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingForm() {
  const router = useRouter();

  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [intolerances, setIntolerances] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([20, 100]);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if onboarding already completed
  useEffect(() => {
    fetch("/api/profiles/onboarding-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.onboardingCompleted) {
          router.push("/dashboard");
        } else {
          setCheckingStatus(false);
        }
      })
      .catch(() => setCheckingStatus(false));
  }, [router]);

  const toggleItem = (
    list: string[],
    setList: (v: string[]) => void,
    value: string
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profiles/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dietary_restrictions: dietaryRestrictions,
          allergies: intolerances,
          budget_min: budgetRange[0],
          budget_max: budgetRange[1],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error("Onboarding error:", data.error);
        setLoading(false);
        return;
      }

      router.push(
        siteConfig.navMenuItems.find((item) => item.label === "Dashboard")
          ?.href || "/dashboard"
      );
    } catch (err) {
      console.error("Onboarding error:", err);
      setLoading(false);
    }
  };

  // ─── Loading state ──────────────────────────────────────────────────────────

  if (checkingStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner size="lg" color="success" />
        <p className="text-default-500 text-sm">Chargement…</p>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

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
          {/* Steps progress */}
          <OnboardingSteps steps={steps} currentStep={currentStep} />

          {/* Step content with animation */}
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
                      <h2 className="font-bold text-lg">
                        Restrictions alimentaires
                      </h2>
                      <p className="text-default-500 text-xs">
                        Sélectionnez tous ceux qui s&apos;appliquent à vous
                      </p>
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
                        onToggle={(v) =>
                          toggleItem(
                            dietaryRestrictions,
                            setDietaryRestrictions,
                            v
                          )
                        }
                      />
                    ))}
                  </div>

                  {dietaryRestrictions.length === 0 && (
                    <p className="text-xs text-default-400 italic">
                      Aucune sélection — vous recevrez toutes les suggestions de
                      recettes.
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
                      <h2 className="font-bold text-lg">
                        Intolérances alimentaires
                      </h2>
                      <p className="text-default-500 text-xs">
                        Indiquez vos allergies ou intolérances
                      </p>
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
                        onToggle={(v) =>
                          toggleItem(intolerances, setIntolerances, v)
                        }
                      />
                    ))}
                  </div>

                  {intolerances.length === 0 && (
                    <p className="text-xs text-default-400 italic">
                      Aucune intolérance sélectionnée.
                    </p>
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
                      <h2 className="font-bold text-lg">
                        Budget hebdomadaire
                      </h2>
                      <p className="text-default-500 text-xs">
                        Définissez votre fourchette de budget alimentaire
                      </p>
                    </div>
                  </div>

                  {/* Budget display */}
                  <div className="flex justify-between items-center px-1">
                    <div className="text-center">
                      <p className="text-xs text-default-400 mb-1">Minimum</p>
                      <p className="text-2xl font-bold text-success">
                        {budgetRange[0]}$
                      </p>
                    </div>
                    <div className="text-default-300 text-xl">—</div>
                    <div className="text-center">
                      <p className="text-xs text-default-400 mb-1">Maximum</p>
                      <p className="text-2xl font-bold text-success">
                        {budgetRange[1]}$
                      </p>
                    </div>
                  </div>

                  <Slider
                    step={5}
                    minValue={0}
                    maxValue={400}
                    value={budgetRange}
                    onChange={(value) =>
                      setBudgetRange(value as [number, number])
                    }
                    color="success"
                    size="lg"
                    className="px-1"
                    showTooltip
                    tooltipValueFormatOptions={{
                      style: "currency",
                      currency: "CAD",
                      maximumFractionDigits: 0,
                    }}
                  />

                  <p className="text-xs text-default-400 text-center">
                    Budget par semaine en dollars canadiens (CAD)
                  </p>
                </div>
              )}

              {/* ── Step 3: Summary ── */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center">
                      <ClipboardList size={20} className="text-success" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">
                        Résumé de vos préférences
                      </h2>
                      <p className="text-default-500 text-xs">
                        Vérifiez vos informations avant de continuer
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Dietary */}
                    <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-divider/40 p-4 space-y-2">
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider">
                        Régime alimentaire
                      </p>
                      {dietaryRestrictions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {dietaryRestrictions.map((v) => {
                            const item = DIETARY_RESTRICTIONS.find(
                              (d) => d.value === v
                            );
                            return (
                              <Chip
                                key={v}
                                size="sm"
                                variant="flat"
                                color="success"
                                className="text-xs"
                              >
                                {item?.emoji} {item?.label ?? v}
                              </Chip>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-default-400 italic">
                          Aucune restriction
                        </p>
                      )}
                    </div>

                    {/* Intolerances */}
                    <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-divider/40 p-4 space-y-2">
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider">
                        Intolérances
                      </p>
                      {intolerances.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {intolerances.map((v) => {
                            const item = INTOLERANCES.find(
                              (i) => i.value === v
                            );
                            return (
                              <Chip
                                key={v}
                                size="sm"
                                variant="flat"
                                color="warning"
                                className="text-xs"
                              >
                                {item?.emoji} {item?.label ?? v}
                              </Chip>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-default-400 italic">
                          Aucune intolérance
                        </p>
                      )}
                    </div>

                    {/* Budget */}
                    <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-divider/40 p-4 space-y-1">
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider">
                        Budget hebdomadaire
                      </p>
                      <p className="text-sm font-semibold text-success">
                        {budgetRange[0]}$ — {budgetRange[1]}$ CAD / semaine
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
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
              endContent={
                !loading && currentStep < steps.length - 1 ? (
                  <ChevronRight size={16} />
                ) : undefined
              }
              className="font-bold text-white shadow-lg shadow-success/20"
            >
              {currentStep < steps.length - 1
                ? "Suivant"
                : loading
                  ? "Sauvegarde…"
                  : "Terminer"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
