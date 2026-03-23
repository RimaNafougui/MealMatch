"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  RotateCcw,
  Printer,
  Download,
  Lock,
  Package,
} from "lucide-react";
import type {
  SavedMealPlan,
  GeneratedMeal,
  GeneratedDay,
} from "@/types/meal-plan";
import { useUserPlan } from "@/hooks/useUserPlan";
import { getLimits } from "@/utils/plan-limits";
import { isMealPrepFriendly } from "@/utils/meal-prep";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner",
  dinner: "Dîner",
  snack: "Collation",
  "meal 1": "Repas 1",
  "meal 2": "Repas 2",
  "meal 3": "Repas 3",
  "meal 4": "Repas 4",
};

const DIETARY_TAG_LABELS: Record<string, string> = {
  vegetarian: "Végétarien",
  vegan: "Végan",
  "gluten free": "Sans gluten",
  "dairy free": "Sans lactose",
  ketogenic: "Cétogène",
  paleo: "Paléo",
  pescetarian: "Pescétarien",
  "lacto ovo vegetarian": "Lacto-ovo végé.",
  primal: "Primal",
  "low fodmap": "Low FODMAP",
  whole30: "Whole30",
  "egg free": "Sans œuf",
  "nut free": "Sans noix",
  "soy free": "Sans soja",
  "wheat free": "Sans blé",
};

const DAY_LABELS: Record<string, string> = {
  Monday: "Lundi",
  monday: "Lundi",
  Tuesday: "Mardi",
  tuesday: "Mardi",
  Wednesday: "Mercredi",
  wednesday: "Mercredi",
  Thursday: "Jeudi",
  thursday: "Jeudi",
  Friday: "Vendredi",
  friday: "Vendredi",
  Saturday: "Samedi",
  saturday: "Samedi",
  Sunday: "Dimanche",
  sunday: "Dimanche",
};

function MealCard({ meal }: { meal: GeneratedMeal }) {
  return (
    <div className="meal-slot-card flex flex-col gap-1.5 p-3 rounded-xl bg-default-50 dark:bg-default-100/10 border border-divider/40">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-default-400 uppercase tracking-wide">
          {MEAL_LABELS[meal.slot] || meal.slot}
        </span>
        {meal.is_favorite && (
          <Chip
            size="sm"
            color="danger"
            variant="flat"
            className="text-[10px] h-4"
          >
            ♥ Favori
          </Chip>
        )}
      </div>
      <p className="font-semibold text-sm line-clamp-2">{meal.title}</p>
      <p className="text-xs text-default-400 line-clamp-2">
        {meal.description}
      </p>
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
            <Chip
              key={tag}
              size="sm"
              variant="flat"
              className="text-[10px] h-4"
            >
              {DIETARY_TAG_LABELS[tag.toLowerCase()] ?? tag}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

function DayCard({ day }: { day: GeneratedDay }) {
  return (
    <Card className="print-card border border-divider/50 bg-white/70 dark:bg-black/30">
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <h3 className="font-bold text-sm">
            {DAY_LABELS[day.day] || day.day}
          </h3>
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

function isCurrentWeek(weekStart: string) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const planDate = new Date(weekStart);
  planDate.setHours(0, 0, 0, 0);
  return planDate.getTime() === monday.getTime();
}

export default function MealPlanDetailPage() {
  const params = useParams();
  const planId = params.id as string;

  const [plan, setPlan] = useState<SavedMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [repeating, setRepeating] = useState(false);

  const { data: planData } = useUserPlan();
  const userPlan: string = planData?.plan ?? "free";
  const limits = getLimits(userPlan);

  const handlePrint = () => window.print();

  const handleCalendarExport = () => {
    const url = `/api/calendar/export?planId=${planId}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = "mealmatch-plan.ics";
    a.click();
  };

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

  const handleRepeat = async () => {
    if (!plan) return;
    setRepeating(true);
    try {
      const res = await fetch("/api/meal-plan/repeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: plan.id, target_week_offset: 1 }),
      });
      const data = await res.json();

      if (res.status === 409) {
        toast.error("Un plan existe déjà pour la semaine prochaine.", {
          description: "Supprimez ou remplacez-le avant de répéter.",
        });
        return;
      }
      if (!res.ok) {
        toast.error(data.error ?? "Impossible de répéter ce plan");
        return;
      }

      toast.success("Plan répété avec succès !", {
        description: "Copié pour la semaine prochaine et activé.",
        action: {
          label: "Voir",
          onClick: () =>
            (window.location.href = `/dashboard/meal-plans/${data.plan.id}`),
        },
      });
    } catch {
      toast.error("Une erreur s'est produite");
    } finally {
      setRepeating(false);
    }
  };

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

  const weekStartLabel = new Date(plan.week_start_date).toLocaleDateString(
    "fr-CA",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
  const weekEndLabel = new Date(plan.week_end_date).toLocaleDateString(
    "fr-CA",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  const isPast =
    !isCurrentWeek(plan.week_start_date) &&
    new Date(plan.week_start_date) < new Date();

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4 sm:gap-6">
      <style>{`
        @media print {
          /* Hide all app chrome */
          nav, aside, header, footer,
          [data-no-print], .no-print { display: none !important; }

          /* Page setup */
          @page { size: A4; margin: 16mm; }
          body { background: white !important; color: #111 !important; font-family: -apple-system, sans-serif; }

          /* Show print-only elements */
          .print-only { display: block !important; }

          /* Reset card backgrounds */
          .print-card {
            background: white !important;
            border: 1px solid #e4e4e7 !important;
            border-radius: 8px !important;
            break-inside: avoid;
            padding: 12px;
            margin-bottom: 8px;
          }

          /* 3-column grid → 2-column on A4 */
          .days-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }

          /* Meal slot cards */
          .meal-slot-card {
            background: #f9f9f9 !important;
            border: 1px solid #e4e4e7 !important;
            border-radius: 6px;
            break-inside: avoid;
            padding: 8px;
            margin-bottom: 6px;
          }

          /* Typography */
          h1 { font-size: 20px !important; }
          h2 { font-size: 14px !important; }
          .text-xs { font-size: 11px !important; }
          .text-sm { font-size: 12px !important; }

          /* Chips: flatten */
          [data-slot="base"] { background: #f4f4f5 !important; color: #3f3f46 !important; border: none !important; }
        }

        /* Hide print-only elements on screen */
        .print-only { display: none; }
      `}</style>

      {/* Print-only header */}
      <div className="print-only" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid #18181b",
            paddingBottom: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
              🍽 MealMatch
            </div>
            <div style={{ fontSize: 12, color: "#71717a", marginTop: 2 }}>
              Plan de repas personnalisé
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#71717a" }}>
            <div>
              Généré le{" "}
              {new Date().toLocaleDateString("fr-CA", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            {plan && (
              <div
                style={{
                  marginTop: 2,
                  fontWeight: 600,
                  color: "#18181b",
                  fontSize: 12,
                }}
              >
                {new Date(plan.week_start_date).toLocaleDateString("fr-CA", {
                  day: "numeric",
                  month: "short",
                })}
                {" → "}
                {new Date(plan.week_end_date).toLocaleDateString("fr-CA", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            )}
          </div>
        </div>
        {plan && (
          <div
            style={{
              display: "flex",
              gap: 24,
              fontSize: 12,
              color: "#3f3f46",
              marginBottom: 4,
            }}
          >
            <span>📅 {plan.days_count} jours</span>
            <span>🍴 {days.reduce((s, d) => s + d.meals.length, 0)} repas</span>
            {avgCalories > 0 && <span>🔥 ~{avgCalories} cal/jour</span>}
            {(plan.total_cost ?? 0) > 0 && (
              <span>💵 ~{Number(plan.total_cost).toFixed(2)} $CA/sem.</span>
            )}
          </div>
        )}
      </div>

      {/* Back */}
      <Button
        as={Link}
        href="/dashboard/meal-plans"
        variant="light"
        startContent={<ArrowLeft size={16} />}
        className="text-default-500 w-fit no-print"
        data-no-print
      >
        Retour aux plans
      </Button>

      {/* Header card */}
      <Card className="p-4 sm:p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
        <CardHeader className="p-0 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 w-full">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <ChefHat size={22} className="text-success" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Plan de repas</h1>
                <p className="text-default-400 text-sm">
                  {weekStartLabel} → {weekEndLabel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPast && (
                <Chip color="default" variant="flat" size="sm">
                  Passé
                </Chip>
              )}
              <Chip
                color={plan.status === "active" ? "success" : "default"}
                variant="flat"
                size="sm"
              >
                {plan.status === "active" ? "Actif" : "Brouillon"}
              </Chip>
            </div>
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
        <div className="days-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day, i) => (
            <DayCard key={i} day={day} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Utensils size={40} className="text-default-300" />
          <p className="text-default-500">Aucun repas trouvé dans ce plan.</p>
        </div>
      )}

      {/* Meal Prep Suggestions */}
      {(() => {
        const prepMeals = days.flatMap((d) =>
          d.meals.filter(isMealPrepFriendly).map((m) => ({ ...m, day: d.day })),
        );
        if (prepMeals.length === 0) return null;
        const totalPrepTime = prepMeals.reduce(
          (s, m) => s + (m.prep_time_minutes || 0),
          0,
        );
        return (
          <Card
            className="border border-secondary/30 bg-secondary/5 no-print"
            data-no-print
          >
            <CardHeader className="px-5 pt-5 pb-2 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10">
                <Package size={18} className="text-secondary" />
              </div>
              <div>
                <h2 className="font-bold text-base">Suggestions Meal Prep</h2>
                <p className="text-default-400 text-xs">
                  {prepMeals.length} repas à préparer dimanche
                  {totalPrepTime > 0 && ` · ~${totalPrepTime} min au total`}
                </p>
              </div>
              <Chip
                size="sm"
                color="secondary"
                variant="flat"
                className="ml-auto text-xs"
              >
                Préparez dimanche
              </Chip>
            </CardHeader>
            <Divider />
            <CardBody className="px-5 py-4 flex flex-col gap-2">
              {prepMeals.map((meal, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                  <span className="text-sm font-medium flex-1 line-clamp-1">
                    {meal.title}
                  </span>
                  <span className="text-xs text-default-400 flex-shrink-0">
                    {DAY_LABELS[meal.day] ?? meal.day}
                  </span>
                  {meal.prep_time_minutes > 0 && (
                    <span className="flex items-center gap-1 text-xs text-default-400 flex-shrink-0">
                      <Clock size={11} /> {meal.prep_time_minutes} min
                    </span>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>
        );
      })()}

      {/* Actions */}
      <div
        className="flex flex-col sm:flex-row gap-3 flex-wrap pb-6 sm:pb-8 no-print"
        data-no-print
      >
        <Button
          as={Link}
          href="/meal-plan/generate"
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
        <Button
          color="success"
          variant="shadow"
          startContent={<RotateCcw size={16} />}
          isLoading={repeating}
          onPress={handleRepeat}
          className="font-semibold text-white"
        >
          {repeating ? "Répétition…" : "Répéter pour la semaine prochaine"}
        </Button>

        {/* PDF Export — student/premium */}
        {limits.pdfExport ? (
          <Button
            variant="flat"
            color="primary"
            startContent={<Printer size={16} />}
            onPress={handlePrint}
            className="font-semibold"
          >
            Exporter en PDF
          </Button>
        ) : (
          <Button
            as={Link}
            href="/pricing"
            variant="flat"
            startContent={<Lock size={16} />}
            className="font-semibold text-default-400 border border-dashed border-default-300"
          >
            Exporter en PDF
            <Chip
              size="sm"
              color="warning"
              variant="flat"
              className="ml-1 text-[10px] h-4"
            >
              Étudiant+
            </Chip>
          </Button>
        )}

        {/* Calendar Export — premium */}
        {limits.calendarExport ? (
          <Button
            variant="flat"
            startContent={<Download size={16} />}
            onPress={handleCalendarExport}
            className="font-semibold"
          >
            Exporter vers calendrier
          </Button>
        ) : (
          <Button
            variant="flat"
            isDisabled
            startContent={<Lock size={16} />}
            className="font-semibold text-default-400"
            title="Disponible avec le plan Premium"
          >
            Exporter vers calendrier
          </Button>
        )}
      </div>
    </div>
  );
}
