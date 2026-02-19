"use client";

import { useState } from "react";
import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  subDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardHeader, CardBody, CardFooter, Chip, Button, Tabs, Tab } from "@heroui/react";

type ViewMode = "day" | "week" | "month";

export function MealCalendar({ mealPlan }: { mealPlan: any }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [view, setView] = useState<ViewMode>("week");

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  const handleNext = () => {
    if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    if (view === "month") setCurrentDate(addDays(endOfMonth(currentDate), 1));
    if (view === "day") setCurrentDate(addDays(currentDate, 1));
  };

  const handlePrev = () => {
    if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    if (view === "month") setCurrentDate(subWeeks(currentDate, 1));
    if (view === "day") setCurrentDate(subDays(currentDate, 1));
  };

  const renderDays = () => {
    let days: Date[] = [];

    if (view === "day") {
      days = [currentDate];
    }

    if (view === "week") {
      days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }

    if (view === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    }

    return (
      <div
        className={`grid ${
          view === "month"
            ? "grid-cols-7 gap-1"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4"
        }`}
      >
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          const dayMeal = mealPlan.days[i] || { breakfast: null, lunch: null, dinner: null, totalCalories: 0 };

          return (
            <Card key={i} className={isToday ? "border-green-500 bg-green-50" : ""}>
              <CardHeader className="p-4">
                <div>
                  <h3 className="font-semibold capitalize">{format(day, "EEEE", { locale: fr })}</h3>
                  <p className="text-sm text-default-500">{format(day, "d MMM", { locale: fr })}</p>
                </div>
              </CardHeader>

              <CardBody className="space-y-2">
                <MealSlot label="Déjeuner" meal={dayMeal.breakfast} />
                <MealSlot label="Dîner" meal={dayMeal.lunch} />
                <MealSlot label="Souper" meal={dayMeal.dinner} />
              </CardBody>

              <CardFooter>
                <Chip color="success" size="sm">{dayMeal.totalCalories} cal</Chip>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  function MealSlot({ label, meal }: { label: string; meal: any }) {
    return (
      <div className="flex justify-between items-center text-sm">
        <span className="text-default-600">{label}</span>
        <Chip size="sm" variant="flat">{meal ? meal.name : "Vide"}</Chip>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button size="sm" variant="light" onPress={handlePrev}>Précédent</Button>
          <Button size="sm" variant="light" onPress={handleNext}>Suivant</Button>
          <Button size="sm" variant="light" onPress={() => setCurrentDate(today)}>Aujourd'hui</Button>
        </div>

        <Tabs selectedKey={view} onSelectionChange={(key) => setView(key as ViewMode)} size="md" variant="solid" color="primary">
          <Tab key="day" title="Jour" />
          <Tab key="week" title="Semaine" />
          <Tab key="month" title="Mois" />
        </Tabs>
      </div>

      {renderDays()}
    </div>
  );
}
