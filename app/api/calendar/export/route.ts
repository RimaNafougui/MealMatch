import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { getLimits } from "@/utils/plan-limits";
import { addDays, format } from "date-fns";

function toICSDate(date: Date): string {
  return format(date, "yyyyMMdd");
}

function escapeICS(str: string): string {
  return str.replace(/[\\;,]/g, "\\$&").replace(/\n/g, "\\n");
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", session.user.id)
      .single();

    const userPlan = profile?.plan ?? "free";
    const limits = getLimits(userPlan);

    if (!limits.calendarExport) {
      return NextResponse.json(
        { error: "premium_required", message: "L'export calendrier nécessite le plan Premium." },
        { status: 403 },
      );
    }

    const url = new URL(req.url);
    const planId = url.searchParams.get("planId");

    let query = supabase
      .from("meal_plans")
      .select("id, week_start_date, week_end_date, meals, days_count, meals_per_day, meal_labels")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (planId) {
      query = query.eq("id", planId);
    }

    const { data: plans } = await query.limit(4);

    if (!plans || plans.length === 0) {
      return NextResponse.json({ error: "No meal plans found" }, { status: 404 });
    }

    const dayNames: Record<string, number> = {
      monday: 0, tuesday: 1, wednesday: 2, thursday: 3,
      friday: 4, saturday: 5, sunday: 6,
    };

    const events: string[] = [];
    const now = new Date();
    const stampStr = format(now, "yyyyMMdd'T'HHmmss'Z'");

    for (const plan of plans) {
      const weekStart = new Date(plan.week_start_date + "T00:00:00");
      const mealPlan = plan.meals as any;
      if (!mealPlan?.days) continue;

      for (const day of mealPlan.days) {
        const dayOffset = dayNames[day.day?.toLowerCase()] ?? 0;
        const mealDate = addDays(weekStart, dayOffset);
        const dateStr = toICSDate(mealDate);

        const mealSlotHours: Record<string, string> = {
          breakfast: "080000",
          lunch: "120000",
          dinner: "180000",
          "meal 1": "090000",
          "meal 2": "130000",
          meal: "120000",
        };

        for (const meal of day.meals ?? []) {
          const slotHour = mealSlotHours[meal.slot] ?? "120000";
          const uid = `mealmatch-${plan.id}-${day.day}-${meal.slot}@mealmatch.app`;
          const summary = escapeICS(meal.title ?? "Repas");
          const description = escapeICS(
            [
              meal.description ?? "",
              meal.calories ? `${meal.calories} cal` : "",
              meal.prep_time_minutes ? `${meal.prep_time_minutes} min de préparation` : "",
            ].filter(Boolean).join(" | ")
          );

          events.push([
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTAMP:${stampStr}`,
            `DTSTART;VALUE=DATE-TIME:${dateStr}T${slotHour}`,
            `DTEND;VALUE=DATE-TIME:${dateStr}T${slotHour.replace(/^(\d{2})/, (h) => String(parseInt(h) + 1).padStart(2, "0"))}`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${description}`,
            "END:VEVENT",
          ].join("\r\n"));
        }
      }
    }

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//MealMatch//MealMatch Calendar//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:MealMatch – Plans de repas",
      "X-WR-TIMEZONE:America/Toronto",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");

    return new Response(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="mealmatch-plan.ics"`,
      },
    });
  } catch (error) {
    console.error("Calendar export error:", error);
    return NextResponse.json({ error: "Failed to export calendar" }, { status: 500 });
  }
}
