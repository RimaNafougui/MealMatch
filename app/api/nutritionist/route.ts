import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { getLimits } from "@/utils/plan-limits";
import { cacheGet, cacheSet } from "@/utils/redis";
import OpenAI from "openai";

const DAILY_MSG_LIMIT = 30;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, dietary_restrictions, allergies, daily_calorie_target, weight_goal, tdee_kcal")
      .eq("id", session.user.id)
      .single();

    const userPlan = profile?.plan ?? "free";
    const limits = getLimits(userPlan);

    if (!limits.nutritionist) {
      return NextResponse.json(
        { error: "premium_required", message: "L'accès au nutritionniste IA nécessite le plan Premium." },
        { status: 403 },
      );
    }

    const { message, history, session_id } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    // Rate limit: DAILY_MSG_LIMIT messages per day
    const today = new Date().toISOString().split("T")[0];
    const rlKey = `ratelimit:nutritionist:${session.user.id}:${today}`;
    const count = (await cacheGet<number>(rlKey)) ?? 0;
    if (count >= DAILY_MSG_LIMIT) {
      return NextResponse.json(
        { error: "daily_limit_reached", message: `Limite de ${DAILY_MSG_LIMIT} messages par jour atteinte. Revenez demain.` },
        { status: 429 },
      );
    }
    const secondsUntilMidnight = 86400 - (Math.floor(Date.now() / 1000) % 86400);
    await cacheSet(rlKey, count + 1, secondsUntilMidnight);

    // Verify session ownership if session_id provided
    if (session_id) {
      const { data: chatSession } = await supabase
        .from("nutritionist_sessions")
        .select("id")
        .eq("id", session_id)
        .eq("user_id", session.user.id)
        .single();
      if (!chatSession) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
    }

    // Fetch recent meal plan for context
    const { data: recentPlan } = await supabase
      .from("meal_plans")
      .select("meals, total_calories, days_count")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const profileContext = [
      profile?.dietary_restrictions?.length ? `Restrictions alimentaires : ${profile.dietary_restrictions.join(", ")}` : null,
      profile?.allergies?.length ? `Allergies : ${profile.allergies.join(", ")}` : null,
      profile?.daily_calorie_target ? `Objectif calorique journalier : ${profile.daily_calorie_target} kcal` : null,
      profile?.weight_goal ? `Objectif de poids : ${profile.weight_goal}` : null,
      recentPlan ? `Plan de repas récent : ${recentPlan.days_count} jours, ~${recentPlan.total_calories} cal/jour` : null,
    ].filter(Boolean).join("\n");

    const systemPrompt = `Tu es une nutritionniste diplômée et enregistrée, spécialisée dans la nutrition des étudiants universitaires au Canada.
Tu fournis des conseils nutritionnels personnalisés, scientifiquement fondés et adaptés au mode de vie étudiant.
Réponds toujours en français. Sois bienveillante, encourageante et pratique.
Ne remplace pas un avis médical — redirige vers un professionnel de santé pour les questions médicales.

Tu es experte dans TOUS les sujets liés à :
• La nourriture, les aliments, les ingrédients, les comparaisons alimentaires (ex. pain multigrain vs levain, riz brun vs blanc, etc.)
• La nutrition, les macronutriments, micronutriments, calories, valeur nutritive
• Les plans de repas, les recettes, les habitudes alimentaires, le budget alimentaire
• L'activité physique, l'entraînement, la récupération, le sommeil
• La gestion du poids, la composition corporelle, les objectifs santé
• La santé digestive, l'hydratation, les suppléments, les intolérances alimentaires

Pour les questions clairement hors-sujet (technologie, politique, mathématiques, actualités, programmation, etc.), décline poliment en une phrase et redirige vers les sujets nutritionnels.
En cas de doute, interprète la question dans un contexte nutritionnel et réponds.

Profil de l'utilisateur :
${profileContext || "Non renseigné"}`;

    // Build conversation history for context (exclude the welcome message if it's the system one)
    const conversationHistory = (Array.isArray(history) ? history : [])
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .slice(-10)
      .map((m: any) => ({ role: m.role as "user" | "assistant", content: String(m.content) }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = completion.choices[0]?.message?.content ?? "";

    // Persist messages to DB if a session is active
    if (session_id) {
      await supabase.from("nutritionist_messages").insert([
        { session_id, role: "user", content: message },
        { session_id, role: "assistant", content: reply },
      ]);

      // Auto-title session after first real user message (if still default)
      const { data: sess } = await supabase
        .from("nutritionist_sessions")
        .select("title")
        .eq("id", session_id)
        .single();
      if (sess?.title === "Nouvelle conversation") {
        const autoTitle = message.length > 60 ? message.slice(0, 57) + "…" : message;
        await supabase
          .from("nutritionist_sessions")
          .update({ title: autoTitle })
          .eq("id", session_id);
      }
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Nutritionist API error:", error);
    return NextResponse.json({ error: "Failed to get nutritionist response" }, { status: 500 });
  }
}
