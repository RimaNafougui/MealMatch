"use client";
import { useState, Fragment, useEffect } from "react";
import { Card, CardBody, Chip, Button } from "@heroui/react";
import {
  Clock,
  Flame,
  DollarSign,
  Star,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  addDays,
  addMonths,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  getDate,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { fr } from "date-fns/locale";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { SavedMealPlan, GeneratedDay, GeneratedMeal } from "@/types/meal-plan";
import { MealDetailModal } from "./MealDetailModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OtherPlan {
  id: string;
  week_start_date: string;
  week_end_date: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_OFFSETS: Record<string, number> = {
  monday: 0, tuesday: 1, wednesday: 2, thursday: 3,
  friday: 4, saturday: 5, sunday: 6,
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3,
  Friday: 4, Saturday: 5, Sunday: 6,
};

const DAY_LABELS: Record<string, string> = {
  monday: "Lundi", tuesday: "Mardi", wednesday: "Mercredi",
  thursday: "Jeudi", friday: "Vendredi", saturday: "Samedi", sunday: "Dimanche",
  Monday: "Lundi", Tuesday: "Mardi", Wednesday: "Mercredi",
  Thursday: "Jeudi", Friday: "Vendredi", Saturday: "Samedi", Sunday: "Dimanche",
};

const DAY_NAMES_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const SLOT_LABELS: Record<string, string> = {
  breakfast: "Petit-déj.", lunch: "Déjeuner", dinner: "Dîner",
  snack: "Collation", "meal 1": "Repas 1", "meal 2": "Repas 2",
  "meal 3": "Repas 3", "meal 4": "Repas 4",
};

const SLOT_COLORS: Record<string, string> = {
  breakfast: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400",
  lunch: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400",
  dinner: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400",
  snack: "bg-secondary-100 text-secondary-700",
  "meal 1": "bg-warning-100 text-warning-700",
  "meal 2": "bg-primary-100 text-primary-700",
};

// ─── Meal card (shared between views) ────────────────────────────────────────

function MealCard({ meal, onClick }: { meal: GeneratedMeal; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex flex-col gap-1.5 p-2.5 rounded-xl bg-content2 border border-divider/50 text-left hover:border-primary/30 hover:bg-content2/80 transition-all group"
    >
      <span className={`self-start text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${SLOT_COLORS[meal.slot.toLowerCase()] || "bg-default-100 text-default-600"}`}>
        {SLOT_LABELS[meal.slot.toLowerCase()] ?? meal.slot}
      </span>
      <div className="flex items-start gap-1">
        {meal.is_favorite && <Star size={10} className="text-warning fill-warning mt-0.5 shrink-0" />}
        <p className="font-semibold text-xs leading-snug line-clamp-2 group-hover:text-primary transition-colors">{meal.title}</p>
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <span className="flex items-center gap-0.5 text-[10px] text-default-400"><Flame size={9} />{meal.calories}</span>
        <span className="flex items-center gap-0.5 text-[10px] text-default-400"><Clock size={9} />{meal.prep_time_minutes}m</span>
        <span className="flex items-center gap-0.5 text-[10px] text-default-400"><DollarSign size={9} />{meal.estimated_cost_usd?.toFixed(2)}</span>
      </div>
    </button>
  );
}

// ─── Weekly view ──────────────────────────────────────────────────────────────

function WeekView({
  days,
  getDayDate,
  onMealClick,
}: {
  days: GeneratedDay[];
  getDayDate: (name: string) => Date;
  onMealClick: (meal: GeneratedMeal) => void;
}) {
  const allSlots = Array.from(new Set(days.flatMap((d) => d.meals.map((m) => m.slot.toLowerCase()))));

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-2 min-w-[560px]"
        style={{ gridTemplateColumns: `80px repeat(${days.length}, minmax(140px, 1fr))` }}
      >
        {/* Header row */}
        <div />
        {days.map((day) => (
          <div key={day.day} className="text-center pb-1">
            <p className="font-bold text-sm">{DAY_LABELS[day.day] ?? day.day}</p>
            <p className="text-xs text-default-400">
              {format(getDayDate(day.day), "d MMM", { locale: fr })}
            </p>
          </div>
        ))}

        {/* Slot rows */}
        {allSlots.map((slot) => (
          <Fragment key={slot}>
            <div className="flex items-center pr-2">
              <span className="text-xs font-bold uppercase p-2 tracking-widest text-default-400">
                {SLOT_LABELS[slot] ?? slot}
              </span>
            </div>
            {days.map((day) => {
              const meal = day.meals.find((m) => m.slot.toLowerCase() === slot);
              return (
                <div key={`${day.day}-${slot}`} className="py-1">
                  {meal ? (
                    <MealCard meal={meal} onClick={() => onMealClick(meal)} />
                  ) : (
                    <div className="h-full min-h-[72px] rounded-xl border border-dashed border-divider/40 flex items-center justify-center">
                      <span className="text-xs text-default-300">—</span>
                    </div>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Monthly view ─────────────────────────────────────────────────────────────

function MonthView({
  days,
  getDayDate,
  onMealClick,
  currentPlanId,
}: {
  days: GeneratedDay[];
  getDayDate: (name: string) => Date;
  onMealClick: (meal: GeneratedMeal) => void;
  currentPlanId: string;
}) {
  const router = useRouter();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<GeneratedDay | null>(null);
  const [otherPlans, setOtherPlans] = useState<OtherPlan[]>([]);

  // Fetch all plans so we can show them on the calendar
  useEffect(() => {
    fetch("/api/meal-plan/history")
      .then((r) => r.json())
      .then((data) => {
        setOtherPlans(
          (data.plans ?? []).filter((p: OtherPlan) => p.id !== currentPlanId),
        );
      })
      .catch(() => {});
  }, [currentPlanId]);

  // Build the visible month
  const weekStart = getDayDate("monday");
  const viewMonth = addMonths(weekStart, monthOffset);
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad to Monday-start grid
  const firstDow = (getDay(monthStart) + 6) % 7;
  const cells: (Date | null)[] = [...Array(firstDow).fill(null), ...monthDays];
  while (cells.length % 7 !== 0) cells.push(null);

  function getMealsForDate(date: Date): GeneratedDay | null {
    return days.find((d) => isSameDay(getDayDate(d.day), date)) ?? null;
  }

  function getOtherPlanForDate(date: Date): OtherPlan | null {
    return (
      otherPlans.find((p) =>
        isWithinInterval(date, {
          start: parseISO(p.week_start_date),
          end: parseISO(p.week_end_date),
        }),
      ) ?? null
    );
  }

  const navigate = (offset: number) => {
    setMonthOffset((m) => m + offset);
    setSelectedDay(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <Button isIconOnly variant="flat" size="sm" onPress={() => navigate(-1)}>
          <ChevronLeft size={16} />
        </Button>
        <p className="font-bold text-sm capitalize">
          {format(viewMonth, "MMMM yyyy", { locale: fr })}
        </p>
        <Button isIconOnly variant="flat" size="sm" onPress={() => navigate(1)}>
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES_SHORT.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-default-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="aspect-square" />;

          const planDay = getMealsForDate(date);
          const otherPlan = !planDay ? getOtherPlanForDate(date) : null;
          const isSelected = selectedDay?.day === planDay?.day && planDay != null;

          const handleClick = () => {
            if (planDay) setSelectedDay(isSelected ? null : planDay);
            else if (otherPlan) router.push(`/dashboard/meal-plans/${otherPlan.id}`);
          };

          return (
            <button
              key={date.toISOString()}
              onClick={handleClick}
              disabled={!planDay && !otherPlan}
              title={
                otherPlan
                  ? `Autre plan — ${format(parseISO(otherPlan.week_start_date), "d MMM", { locale: fr })} → ${format(parseISO(otherPlan.week_end_date), "d MMM", { locale: fr })}`
                  : undefined
              }
              className={[
                "aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm font-medium transition-all",
                planDay
                  ? "bg-success/15 hover:bg-success/25 text-success font-bold cursor-pointer"
                  : otherPlan
                    ? "bg-primary/10 hover:bg-primary/20 text-primary font-semibold cursor-pointer"
                    : "text-default-400 cursor-default",
                isSelected ? "ring-2 ring-success bg-success/25" : "",
              ].join(" ")}
            >
              <span>{getDate(date)}</span>
              {planDay && <span className="w-1 h-1 rounded-full bg-success" />}
              {otherPlan && <span className="w-1 h-1 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[11px] text-default-400 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-success/60 shrink-0" />
          Ce plan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary/60 shrink-0" />
          Autre plan (cliquer pour voir)
        </span>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <Card className="border border-success/30 bg-success/5">
          <CardBody className="p-4 flex flex-col gap-3">
            <p className="font-bold text-sm">
              {DAY_LABELS[selectedDay.day]} —{" "}
              {format(getDayDate(selectedDay.day), "d MMMM", { locale: fr })}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {selectedDay.meals.map((meal) => (
                <MealCard key={meal.slot} meal={meal} onClick={() => onMealClick(meal)} />
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface MealPlanCalendarProps {
  plan: SavedMealPlan;
}

export function MealPlanCalendar({ plan }: MealPlanCalendarProps) {
  const [view, setView] = useState<"week" | "month">("week");
  const [detailMeal, setDetailMeal] = useState<GeneratedMeal | null>(null);

  const days: GeneratedDay[] = (plan.meals as any)?.days || [];

  function getDayDate(dayName: string): Date {
    const weekStart = parseISO(plan.week_start_date);
    const offset = DAY_OFFSETS[dayName] ?? 0;
    return addDays(weekStart, offset);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header + view toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold">Plan de la semaine</h2>
          <p className="text-sm text-foreground/50 mt-0.5">
            {format(parseISO(plan.week_start_date), "d MMM", { locale: fr })} –{" "}
            {format(parseISO(plan.week_end_date), "d MMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center border border-divider rounded-lg overflow-hidden text-sm">
            <button
              className={`px-3 py-1.5 font-semibold transition-colors ${view === "week" ? "bg-success text-white" : "text-default-500 hover:bg-default-100"}`}
              onClick={() => setView("week")}
            >
              Semaine
            </button>
            <button
              className={`px-3 py-1.5 font-semibold transition-colors ${view === "month" ? "bg-success text-white" : "text-default-500 hover:bg-default-100"}`}
              onClick={() => setView("month")}
            >
              Mois
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Chip size="sm" variant="flat" color="success">{plan.total_cost?.toFixed(2)} $ est.</Chip>
            <Chip size="sm" variant="flat" color="warning">~{plan.total_calories} cal/jour</Chip>
          </div>
          <Button
            as={NextLink}
            href="/dashboard/meal-plan/generate"
            size="sm"
            variant="bordered"
            startContent={<ExternalLink size={13} />}
          >
            Modifier le plan
          </Button>
        </div>
      </div>

      {/* View content */}
      {view === "week" ? (
        <WeekView days={days} getDayDate={getDayDate} onMealClick={setDetailMeal} />
      ) : (
        <MonthView
          days={days}
          getDayDate={getDayDate}
          onMealClick={setDetailMeal}
          currentPlanId={plan.id}
        />
      )}

      <MealDetailModal meal={detailMeal} isOpen={!!detailMeal} onClose={() => setDetailMeal(null)} />
    </div>
  );
}
