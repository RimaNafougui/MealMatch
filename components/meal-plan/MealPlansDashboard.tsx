"use client";

import { useState, useCallback } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Skeleton } from "@heroui/skeleton";
import { Tabs, Tab } from "@heroui/tabs";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { toast } from "sonner";
import {
  Sparkles,
  CalendarDays,
  History,
  ChefHat,
  Flame,
  DollarSign,
  Utensils,
  RotateCcw,
  ArrowRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { MealPlanCalendar } from "@/components/meal-plan/MealPlanCalendar";
import type { SavedMealPlan } from "@/types/meal-plan";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HistoryPlan {
  id: string;
  week_start_date: string;
  week_end_date: string;
  total_calories: number;
  total_cost: number;
  days_count: number;
  meals_per_day: number;
  status: string;
  is_active: boolean;
  created_at: string;
}

interface MealPlansDashboardProps {
  activePlan: SavedMealPlan | null;
  weekLabel: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatWeekRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "long",
  });
  const e = new Date(end).toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${s} → ${e}`;
}

function isCurrentWeek(weekStart: string) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const planDate = new Date(weekStart);
  planDate.setHours(0, 0, 0, 0);
  return planDate.getTime() === monday.getTime();
}

// ─── History Plan Card ────────────────────────────────────────────────────────

function HistoryPlanCard({
  plan,
  onRepeat,
  repeating,
}: {
  plan: HistoryPlan;
  onRepeat: (id: string) => void;
  repeating: boolean;
}) {
  const current = isCurrentWeek(plan.week_start_date);

  return (
    <Card className="backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50 hover:border-success/30 transition-colors">
      <CardHeader className="px-5 pt-5 pb-3 flex flex-col gap-0">
        <div className="flex items-start justify-between w-full gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <ChefHat size={18} className="text-success" />
            </div>
            <div>
              <p className="font-bold text-sm">
                {formatWeekRange(plan.week_start_date, plan.week_end_date)}
              </p>
              <p className="text-xs text-default-400">
                {plan.days_count} jours · {plan.meals_per_day} repas/jour
              </p>
            </div>
          </div>
          {current && (
            <Chip size="sm" color="success" variant="flat" className="shrink-0 text-xs font-semibold">
              Cette semaine
            </Chip>
          )}
        </div>
      </CardHeader>

      <Divider className="opacity-50" />

      <CardBody className="px-5 py-4 flex flex-col gap-4">
        {/* Stats row */}
        <div className="flex flex-wrap gap-4 text-sm">
          {plan.total_calories > 0 && (
            <span className="flex items-center gap-1.5 text-default-500">
              <Flame size={13} className="text-warning" />
              ~{Math.round(plan.total_calories)} cal/jour
            </span>
          )}
          {plan.total_cost > 0 && (
            <span className="flex items-center gap-1.5 text-default-500">
              <DollarSign size={13} className="text-success" />
              ~{Number(plan.total_cost).toFixed(2)} $CA
            </span>
          )}
          <span className="flex items-center gap-1.5 text-default-500">
            <Utensils size={13} className="text-primary" />
            {plan.days_count * plan.meals_per_day} repas
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            as={Link}
            href={`/dashboard/meal-plans/${plan.id}`}
            size="sm"
            variant="flat"
            color="default"
            endContent={<ArrowRight size={13} />}
            className="font-semibold text-xs"
          >
            Voir le plan
          </Button>

          {!current && (
            <Button
              size="sm"
              color="success"
              variant="flat"
              isLoading={repeating}
              startContent={!repeating && <RotateCcw size={13} />}
              onPress={() => onRepeat(plan.id)}
              className="font-semibold text-xs"
            >
              {repeating ? "Répétition…" : "Répéter la semaine prochaine"}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ─── History Tab Content ──────────────────────────────────────────────────────

function HistoryTab() {
  const [plans, setPlans] = useState<HistoryPlan[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [repeatingId, setRepeatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await fetch("/api/meal-plan/history");
      const data = await res.json();
      setPlans(data.plans ?? []);
    } catch {
      toast.error("Impossible de charger l'historique");
      setPlans([]);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [loaded]);

  // Load on first render of this tab
  useState(() => {
    load();
  });

  const handleRepeat = async (planId: string) => {
    setRepeatingId(planId);
    try {
      const res = await fetch("/api/meal-plan/repeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId, target_week_offset: 1 }),
      });
      const data = await res.json();

      if (res.status === 409) {
        toast.error("Un plan existe déjà pour la semaine prochaine.", {
          description: "Consultez votre plan actif ou supprimez-le d'abord.",
        });
        return;
      }
      if (!res.ok) {
        toast.error(data.error ?? "Impossible de répéter ce plan");
        return;
      }

      toast.success("Plan répété avec succès !", {
        description: "Le plan a été copié pour la semaine prochaine et est maintenant actif.",
        action: {
          label: "Voir",
          onClick: () => (window.location.href = `/dashboard/meal-plans/${data.plan.id}`),
        },
      });
    } catch {
      toast.error("Une erreur s'est produite");
    } finally {
      setRepeatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-default-100 dark:bg-default-50/10 flex items-center justify-center">
          <History size={28} className="text-default-300" />
        </div>
        <div>
          <h3 className="font-bold text-base">Aucun historique</h3>
          <p className="text-default-400 text-sm mt-1">
            Vos plans de repas passés apparaîtront ici.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-success/5 border border-success/20 text-sm text-default-600">
        <RotateCcw size={16} className="text-success mt-0.5 shrink-0" />
        <p>
          Vous pouvez <strong>répéter n&apos;importe quel plan passé</strong> pour la semaine
          prochaine — les mêmes repas seront copiés et activés automatiquement.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <HistoryPlanCard
            key={plan.id}
            plan={plan}
            onRepeat={handleRepeat}
            repeating={repeatingId === plan.id}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function MealPlansDashboard({
  activePlan,
  weekLabel,
}: MealPlansDashboardProps) {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center">
            <CalendarDays size={22} className="text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Plans de repas
            </h1>
            <p className="text-sm text-default-400">Semaine du {weekLabel}</p>
          </div>
        </div>
        <Button
          as={NextLink}
          href="/meal-plan/generate"
          color="success"
          variant={activePlan ? "bordered" : "solid"}
          startContent={<Sparkles size={16} />}
          className="font-bold text-white"
        >
          {activePlan ? "Modifier le plan" : "Générer un plan"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        aria-label="Meal plan tabs"
        color="success"
        variant="underlined"
        classNames={{
          tabList: "gap-6 border-b border-divider",
          cursor: "bg-success",
          tab: "font-semibold text-sm",
        }}
      >
        {/* ── Tab 1: This week ── */}
        <Tab
          key="current"
          title={
            <div className="flex items-center gap-2">
              <Calendar size={15} />
              <span>Cette semaine</span>
              {activePlan && (
                <span className="w-2 h-2 rounded-full bg-success inline-block" />
              )}
            </div>
          }
        >
          <div className="pt-4">
            {activePlan ? (
              <div className="flex flex-col gap-4">
                {/* Active plan summary bar */}
                <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-success/5 border border-success/20">
                  <CheckCircle2 size={16} className="text-success shrink-0" />
                  <span className="text-sm font-semibold text-success">
                    Plan actif cette semaine
                  </span>
                  <div className="flex gap-3 ml-auto flex-wrap text-xs text-default-500">
                    {activePlan.total_calories > 0 && (
                      <span className="flex items-center gap-1">
                        <Flame size={12} className="text-warning" />
                        ~{Math.round(activePlan.total_calories)} cal/jour
                      </span>
                    )}
                    {activePlan.total_cost > 0 && (
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} className="text-success" />
                        ~{Number(activePlan.total_cost).toFixed(2)} $CA
                      </span>
                    )}
                  </div>
                </div>
                <MealPlanCalendar plan={activePlan} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
                <div className="p-6 rounded-2xl bg-default-100/50 dark:bg-default-50/5 border border-dashed border-divider max-w-sm">
                  <div className="w-14 h-14 rounded-2xl bg-default-100 dark:bg-default-50/10 flex items-center justify-center mx-auto mb-4">
                    <CalendarDays size={26} className="text-default-300" />
                  </div>
                  <h3 className="font-bold text-base mb-2">
                    Aucun plan cette semaine
                  </h3>
                  <p className="text-default-400 text-sm mb-5">
                    Générez un plan IA en moins d&apos;une minute, ou répétez
                    un plan passé depuis l&apos;historique.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      as={NextLink}
                      href="/meal-plan/generate"
                      color="success"
                      className="w-full font-bold text-white"
                      startContent={<Sparkles size={15} />}
                    >
                      Générer mon plan
                    </Button>
                  </div>
                </div>

                {/* Hint to check history */}
                <div className="flex items-center gap-2 text-xs text-default-400">
                  <AlertCircle size={13} />
                  Vous avez déjà des plans passés ? Consultez l&apos;
                  <span className="text-success font-semibold">Historique</span>
                  {" "}pour les répéter.
                </div>
              </div>
            )}
          </div>
        </Tab>

        {/* ── Tab 2: History ── */}
        <Tab
          key="history"
          title={
            <div className="flex items-center gap-2">
              <History size={15} />
              <span>Historique</span>
            </div>
          }
        >
          <div className="pt-4">
            <HistoryTab />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
