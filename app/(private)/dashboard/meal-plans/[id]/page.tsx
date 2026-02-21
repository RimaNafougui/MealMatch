"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Link } from "@heroui/link";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Utensils,
  ArrowLeft,
  Flame,
  DollarSign,
  AlertTriangle,
  ChefHat,
} from "lucide-react";
import type { SavedMealPlan, GeneratedMeal, GeneratedDay } from "@/types/meal-plan";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner",
  dinner: "Dîner",
  "meal 1": "Repas 1",
  "meal 2": "Repas 2",
};

const DAY_LABELS: Record<string, string> = {
  Monday: "Lundi",
  Tuesday: "Mardi",
  Wednesday: "Mercredi",
  Thursday: "Jeudi",
  Friday: "Vendredi",
  Saturday: "Samedi",
  Sunday: "Dimanche",
};

function MealCard({ meal }: { meal: GeneratedMeal }) {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-default-50 dark:bg-default-100/10 border border-divider/40">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-default-400 uppercase tracking-wide">
          {MEAL_LABELS[meal.slot] || meal.slot}
        </span>
        {meal.is_favorite && (
          <Chip size="sm" color="danger" variant="flat" className="text-[10px] h-4">
            ♥ Favori
          </Chip>
        )}
      </div>
      <p className="font-semibold text-sm line-clamp-2">{meal.title}</p>
      <p className="text-xs text-default-400 line-clamp-2">{meal.description}</p>
      <div className="flex items-center gap-3 mt-1 flex-wrap">
        {meal.prep_time_minutes > 0 && (
          <span className="flex items-center gap-1 text-xs text-default-500">
            <Clock size={11} /> {meal.prep_time_minutes} min
          </span>
        )}
        {meal.calories > 0 && (
          <span className="flex items-center gap-1 text-xs text-warning">
            <Flame size={11} /> {meal.calories} cal
          </span>
        )}
        {meal.estimated_cost_usd > 0 && (
          <span className="flex items-center gap-1 text-xs text-success">
            <DollarSign size={11} /> {meal.estimated_cost_usd.toFixed(2)} $CA
          </span>
        )}
      </div>
      {meal.dietary_tags?.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-1">
          {meal.dietary_tags.slice(0, 3).map((tag) => (
            <Chip key={tag} size="sm" variant="flat" className="text-[10px] h-4">
              {tag}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

function DayCard({ day }: { day: GeneratedDay }) {
  return (
    <Card className="border border-divider/50 bg-white/70 dark:bg-black/30">
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <h3 className="font-bold text-sm">{DAY_LABELS[day.day] || day.day}</h3>
        </div>
      </CardHeader>
      <CardBody className="px-4 pb-4 pt-0 flex flex-col gap-2">
        {day.meals.map((meal, i) => (
          <MealCard key={i} meal={meal} />
        ))}
      </CardBody>
    </Card>
  );
}

function SkeletonPlan() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Card className="p-6 border border-divider/50">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-72 rounded-lg" />
          <Skeleton className="h-4 w-48 rounded-lg" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function MealPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const [plan, setPlan] = useState<SavedMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch(`/api/meal-plan/${planId}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error();
        const { plan: data } = await res.json();
        setPlan(data);
      } catch {
        toast.error("Impossible de charger le plan de repas");
      } finally {
        setLoading(false);
      }
    }
    if (planId) fetchPlan();
  }, [planId]);

  if (loading) return <SkeletonPlan />;

  if (notFound || !plan) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 gap-4 text-center">
        <AlertTriangle size={48} className="text-warning" />
        <h2 className="text-xl font-bold">Plan introuvable</h2>
        <p className="text-default-400">
          Ce plan de repas n&apos;existe pas ou vous n&apos;y avez pas accès.
        </p>
        <Button
          as={Link}
          href="/dashboard/meal-plans"
          variant="flat"
          startContent={<ArrowLeft size={16} />}
        >
          Retour aux plans
        </Button>
      </div>
    );
  }

  const days: GeneratedDay[] = plan.meals?.days ?? [];
  const totalMeals = days.reduce((sum, d) => sum + d.meals.length, 0);
  const avgCalories = Math.round(plan.meals?.total_calories_per_day_avg ?? 0);

  const weekStart = new Date(plan.week_start_date).toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const weekEnd = new Date(plan.week_end_date).toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Back */}
      <div>
        <Button
          as={Link}
          href="/dashboard/meal-plans"
          variant="light"
          startContent={<ArrowLeft size={16} />}
          className="text-default-500"
        >
          Retour aux plans
        </Button>
      </div>

      {/* Header card */}
      <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
        <CardHeader className="p-0 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 w-full">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <ChefHat size={22} className="text-success" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Plan de repas</h1>
                <p className="text-default-400 text-sm">
                  {weekStart} → {weekEnd}
                </p>
              </div>
            </div>
            <Chip
              color={plan.status === "active" ? "success" : "default"}
              variant="flat"
              size="sm"
            >
              {plan.status === "active" ? "Actif" : "Brouillon"}
            </Chip>
          </div>
        </CardHeader>

        <Divider className="mb-4" />

        <CardBody className="p-0">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-default-600">
              <Calendar size={15} className="text-primary" />
              <span>{plan.days_count} jours</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-default-600">
              <Utensils size={15} className="text-success" />
              <span>{totalMeals} repas au total</span>
            </div>
            {avgCalories > 0 && (
              <div className="flex items-center gap-2 text-sm text-default-600">
                <Flame size={15} className="text-warning" />
                <span>~{avgCalories} cal/jour</span>
              </div>
            )}
            {(plan.total_cost ?? 0) > 0 && (
              <div className="flex items-center gap-2 text-sm text-default-600">
                <DollarSign size={15} className="text-success" />
                <span>~{Number(plan.total_cost).toFixed(2)} $CA / semaine</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Days grid */}
      {days.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day, i) => (
            <DayCard key={i} day={day} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Utensils size={40} className="text-default-300" />
          <p className="text-default-500">
            Aucun repas trouvé dans ce plan.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button
          as={Link}
          href="/dashboard/meal-plan/generate"
          color="success"
          variant="flat"
          startContent={<Utensils size={16} />}
          className="font-semibold"
        >
          Générer un nouveau plan
        </Button>
        <Button
          as={Link}
          href={`/dashboard/epicerie?planId=${plan.id}`}
          variant="bordered"
          startContent={<Calendar size={16} />}
          className="font-semibold"
        >
          Voir la liste d&apos;épicerie
        </Button>
      </div>
    </div>
  );
}
