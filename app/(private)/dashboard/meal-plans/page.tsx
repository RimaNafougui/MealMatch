import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { redirect } from "next/navigation";
import { format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { SavedMealPlan } from "@/types/meal-plan";
import { MealPlansDashboard } from "@/components/meal-plan/MealPlansDashboard";

export default async function MealPlansDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const supabase = getSupabaseServer();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, "yyyy-MM-dd");

  // Fetch only this week's active plan (scoped to current week_start_date)
  const { data: activePlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("status", "active")
    .gte("week_start_date", weekStartStr)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <MealPlansDashboard
      activePlan={activePlan as SavedMealPlan | null}
      weekLabel={format(weekStart, "d MMMM yyyy", { locale: fr })}
    />
  );
}
