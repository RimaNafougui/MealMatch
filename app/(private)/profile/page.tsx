"use client";
import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import { Skeleton } from "@heroui/skeleton";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Calendar,
  Settings,
  Shield,
  Utensils,
  Heart,
  BarChart3,
  Scale,
  Flame,
  Activity,
  Target,
  TrendingDown,
  TrendingUp,
  Beef,
  Wheat,
  Droplets,
} from "lucide-react";
import { kgToLbs } from "@/utils/nutrition";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatsData {
  savedRecipes: number;
  mealPlans: number;
  favorites: number;
  profile: {
    name: string;
    email: string;
    image?: string;
    plan?: "free" | "premium" | "pro" | null;
    created_at: string;
  } | null;
}

interface Nutrition {
  weight_kg?: number | null;
  weight_unit?: "kg" | "lbs";
  height_unit?: "cm" | "in";
  height_cm?: number | null;
  birth_year?: number | null;
  sex?: string | null;
  activity_level?: string | null;
  tdee_kcal?: number | null;
  weight_goal?: "lose" | "maintain" | "gain" | null;
  goal_weight_kg?: number | null;
  daily_calorie_target?: number | null;
  macro_protein_pct?: number | null;
  macro_carbs_pct?: number | null;
  macro_fat_pct?: number | null;
}

interface WeightLog {
  id: string;
  logged_at: string;
  weight_kg: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMemberSince(dateStr: string) {
  try {
    // Use UTC to avoid timezone-shifting the date from the profiles table
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long" });
  } catch { return "—"; }
}

function dispW(kg: number, unit: "kg" | "lbs") {
  return unit === "lbs" ? `${kgToLbs(kg).toFixed(1)} lbs` : `${kg.toFixed(1)} kg`;
}

function calcBmi(weightKg: number, heightCm: number) {
  const h = heightCm / 100;
  return weightKg / (h * h);
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Insuffisance pondérale", color: "text-primary" };
  if (bmi < 25)   return { label: "Poids normal", color: "text-success" };
  if (bmi < 30)   return { label: "Surpoids", color: "text-warning" };
  return { label: "Obésité", color: "text-danger" };
}

// Mini sparkline for profile page
function MiniSparkline({ logs, color }: { logs: WeightLog[]; color: string }) {
  const W = 160, H = 40;
  if (logs.length < 2) return null;
  const vals = logs.map((l) => l.weight_kg);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 8) - 4;
    return `${x},${y}`;
  });
  return (
    <svg width={W} height={H} className="overflow-visible">
      <defs>
        <linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {(() => {
        const [x, y] = pts[pts.length - 1].split(",").map(Number);
        return <circle cx={x} cy={y} r={3} fill={color} />;
      })()}
    </svg>
  );
}

// SVG macro donut
function MacroDonut({ protein, carbs, fat, size = 72 }: { protein: number; carbs: number; fat: number; size?: number }) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const segs = [
    { pct: protein, color: "#f31260" },
    { pct: carbs,   color: "#f5a524" },
    { pct: fat,     color: "#006fee" },
  ];
  let offset = 0;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e4e4e7" strokeWidth={9} />
      {segs.map((s, i) => {
        const dash = (s.pct / 100) * circ;
        const el = (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={s.color} strokeWidth={9}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary:         "Sédentaire",
  moderately_active: "Modérément actif",
  very_active:       "Très actif",
};

const GOAL_LABELS: Record<string, string> = {
  lose:     "Perdre du poids",
  maintain: "Maintenir",
  gain:     "Prendre du poids",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session } = useSession();
  const [stats, setStats]         = useState<StatsData | null>(null);
  const [nutrition, setNutrition] = useState<Nutrition | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, nutritionRes, logsRes] = await Promise.all([
          fetch("/api/user/stats"),
          fetch("/api/user/nutrition"),
          fetch("/api/user/weight-logs?days=90"),
        ]);
        if (statsRes.ok)     setStats((await statsRes.json()) ?? null);
        if (nutritionRes.ok) setNutrition((await nutritionRes.json()).nutrition ?? null);
        if (logsRes.ok)      setWeightLogs((await logsRes.json()).logs ?? []);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const user        = session?.user;
  const profile     = stats?.profile;
  const displayName = profile?.name || user?.name || "Utilisateur";
  const displayEmail= profile?.email || user?.email || "";
  const displayImage= profile?.image || user?.image || undefined;
  const initials    = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const plan = profile?.plan ?? "free";
  const planLabel = plan === "pro" ? "Pro" : plan === "premium" ? "Premium" : "Gratuit";
  const planColor = plan === "pro" ? "secondary" : plan === "premium" ? "warning" : "default";

  const unit       = (nutrition?.weight_unit as "kg" | "lbs") ?? "kg";
  const latestLog  = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;
  const firstLog   = weightLogs.length > 0 ? weightLogs[0] : null;
  const delta      = latestLog && firstLog && firstLog.id !== latestLog.id
    ? latestLog.weight_kg - firstLog.weight_kg : null;

  const bmi = latestLog && nutrition?.height_cm
    ? calcBmi(latestLog.weight_kg, nutrition.height_cm) : null;
  const bmiInfo = bmi ? bmiCategory(bmi) : null;

  const goalKg     = nutrition?.goal_weight_kg ?? null;
  const remaining  = latestLog && goalKg ? Math.abs(latestLog.weight_kg - goalKg) : null;
  const totalDist  = firstLog && goalKg ? Math.abs(firstLog.weight_kg - goalKg) : null;
  const progressPct= totalDist && latestLog && firstLog
    ? Math.min(100, Math.round((Math.abs(firstLog.weight_kg - latestLog.weight_kg) / totalDist) * 100))
    : null;

  const proteinPct = nutrition?.macro_protein_pct ?? 30;
  const carbsPct   = nutrition?.macro_carbs_pct   ?? 40;
  const fatPct     = nutrition?.macro_fat_pct     ?? 30;
  const dailyCal   = nutrition?.daily_calorie_target ?? null;

  const macroGrams = dailyCal ? {
    protein: Math.round((dailyCal * proteinPct) / 100 / 4),
    carbs:   Math.round((dailyCal * carbsPct)   / 100 / 4),
    fat:     Math.round((dailyCal * fatPct)      / 100 / 9),
  } : null;

  const chartColor = nutrition?.weight_goal === "lose" ? "#17c964"
    : nutrition?.weight_goal === "gain" ? "#006fee" : "#f5a524";

  const age = nutrition?.birth_year
    ? new Date().getFullYear() - nutrition.birth_year : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Mon Profil</h1>

      {/* ── Identity card ── */}
      <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
        <CardBody className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-0">
          {loading ? (
            <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
          ) : (
            <Avatar isBordered color="success" name={initials} src={displayImage}
              className="w-24 m-1 h-24 text-2xl font-bold flex-shrink-0" />
          )}
          <div className="flex flex-col gap-1.5 text-center sm:text-left flex-1">
            {loading ? (
              <><Skeleton className="h-7 w-40 rounded-lg" /><Skeleton className="h-4 w-48 rounded-lg mt-1" /></>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <h2 className="text-2xl font-bold">{displayName}</h2>
                  <Chip color="success" variant="flat" size="sm">Actif</Chip>
                  {plan !== "free" && (
                    <Chip color={planColor} variant="flat" size="sm">{planLabel}</Chip>
                  )}
                </div>
                <p className="text-default-500 text-sm flex items-center gap-1.5 justify-center sm:justify-start">
                  <Mail className="w-3.5 h-3.5" />{displayEmail}
                </p>
                {profile?.created_at && (
                  <p className="text-default-400 text-xs flex items-center gap-1.5 justify-center sm:justify-start">
                    <Calendar className="w-3 h-3" />Membre depuis {formatMemberSince(profile.created_at)}
                  </p>
                )}
                {/* Quick body stats inline */}
                {!loading && (age || nutrition?.height_cm || latestLog) && (
                  <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                    {age && <Chip size="sm" variant="flat" color="default">{age} ans</Chip>}
                    {nutrition?.height_cm && (
                      <Chip size="sm" variant="flat" color="default">
                        {nutrition.height_unit === "in"
                          ? `${Math.floor(nutrition.height_cm / 2.54 / 12)}'${Math.round((nutrition.height_cm / 2.54) % 12)}"`
                          : `${Math.round(nutrition.height_cm)} cm`}
                      </Chip>
                    )}
                    {latestLog && (
                      <Chip size="sm" variant="flat" color="success">
                        {dispW(latestLog.weight_kg, unit)}
                      </Chip>
                    )}
                    {bmi && bmiInfo && (
                      <Chip size="sm" variant="flat" className={bmiInfo.color}>
                        IMC {bmi.toFixed(1)} — {bmiInfo.label}
                      </Chip>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <Button as={Link} href="/settings" variant="flat" color="default"
            startContent={<Settings className="w-4 h-4" />} className="font-semibold flex-shrink-0">
            Modifier
          </Button>
        </CardBody>
      </Card>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        {loading ? [0, 1, 2].map((i) => (
          <Card key={i} className="p-4 border border-divider/50 bg-white/50 dark:bg-black/20 text-center">
            <CardBody className="items-center gap-2 p-2">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-7 w-10 rounded-lg" />
              <Skeleton className="h-3 w-20 rounded-lg" />
            </CardBody>
          </Card>
        )) : [
          { label: "Recettes", value: stats?.savedRecipes ?? 0, icon: <Utensils className="w-4 h-4" />, color: "text-warning" },
          { label: "Plans",    value: stats?.mealPlans    ?? 0, icon: <BarChart3 className="w-4 h-4" />, color: "text-primary" },
          { label: "Favoris",  value: stats?.favorites    ?? 0, icon: <Heart className="w-4 h-4" />,     color: "text-danger" },
        ].map((s, i) => (
          <Card key={i} className="p-4 border border-divider/50 bg-white/50 dark:bg-black/20 text-center">
            <CardBody className="items-center gap-1.5 p-2">
              <div className={s.color}>{s.icon}</div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-default-400 text-xs">{s.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Weight progress card ── */}
        <Card className="p-5 border border-divider/50 bg-white/70 dark:bg-black/40 flex flex-col gap-3">
          <CardHeader className="p-0 pb-1">
            <div className="flex items-center justify-between w-full">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Scale className="w-4 h-4 text-success" />
                Suivi du poids
              </h3>
              {latestLog && (
                <Chip size="sm" variant="flat" color="success">{dispW(latestLog.weight_kg, unit)}</Chip>
              )}
            </div>
          </CardHeader>
          <CardBody className="p-0 flex flex-col gap-3">
            {loading ? (
              <Skeleton className="h-12 w-full rounded-xl" />
            ) : weightLogs.length === 0 ? (
              <p className="text-xs text-default-400 text-center py-4">
                Aucun poids enregistré. Rendez-vous sur le tableau de bord.
              </p>
            ) : (
              <>
                {/* Mini chart */}
                <div className="w-full">
                  <MiniSparkline logs={weightLogs} color={chartColor} />
                </div>

                {/* Delta stats */}
                {delta !== null && (
                  <div className="flex items-center gap-1.5">
                    {delta < 0
                      ? <TrendingDown size={13} className="text-success" />
                      : <TrendingUp size={13} className="text-danger" />}
                    <span className={`text-xs font-semibold ${delta < 0 ? "text-success" : "text-danger"}`}>
                      {delta > 0 ? "+" : ""}{dispW(Math.abs(delta), unit)} depuis le début
                    </span>
                  </div>
                )}

                {/* Goal progress bar */}
                {goalKg !== null && progressPct !== null && remaining !== null && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] text-default-400">
                      <span>Objectif : {dispW(goalKg, unit)}</span>
                      <span>{progressPct}% accompli</span>
                    </div>
                    <div className="w-full bg-default-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full bg-success transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                    <p className="text-[10px] text-default-400 text-right">
                      {remaining < 0.1 ? "🎉 Objectif atteint !" : `${dispW(remaining, unit)} restant`}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>

        {/* ── Nutrition summary card ── */}
        <Card className="p-5 border border-divider/50 bg-white/70 dark:bg-black/40">
          <CardHeader className="p-0 pb-1">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Flame className="w-4 h-4 text-danger" />
              Nutrition
            </h3>
          </CardHeader>
          <CardBody className="p-0 flex flex-col gap-3">
            {loading ? (
              <Skeleton className="h-24 w-full rounded-xl" />
            ) : !nutrition?.daily_calorie_target ? (
              <p className="text-xs text-default-400 text-center py-4">
                Complétez votre profil nutritionnel dans les paramètres.
              </p>
            ) : (
              <>
                {/* TDEE + calorie target */}
                <div className="flex gap-3">
                  {nutrition.tdee_kcal && (
                    <div className="flex-1 p-3 rounded-xl bg-warning/5 border border-warning/15 text-center">
                      <p className="text-[10px] text-default-400 mb-0.5">TDEE</p>
                      <p className="font-bold text-warning text-sm">{nutrition.tdee_kcal.toLocaleString()} kcal</p>
                    </div>
                  )}
                  <div className="flex-1 p-3 rounded-xl bg-primary/5 border border-primary/15 text-center">
                    <p className="text-[10px] text-default-400 mb-0.5">Objectif</p>
                    <p className="font-bold text-primary text-sm">{dailyCal!.toLocaleString()} kcal</p>
                  </div>
                </div>

                {/* Macro ring + breakdown */}
                <div className="flex items-center gap-4">
                  <MacroDonut protein={proteinPct} carbs={carbsPct} fat={fatPct} size={72} />
                  <div className="flex flex-col gap-1.5 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-default-500"><Beef size={11} className="text-danger" />Protéines</span>
                      <span className="font-bold text-danger">{proteinPct}%{macroGrams ? ` · ${macroGrams.protein}g` : ""}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-default-500"><Wheat size={11} className="text-warning" />Glucides</span>
                      <span className="font-bold text-warning">{carbsPct}%{macroGrams ? ` · ${macroGrams.carbs}g` : ""}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-default-500"><Droplets size={11} className="text-primary" />Lipides</span>
                      <span className="font-bold text-primary">{fatPct}%{macroGrams ? ` · ${macroGrams.fat}g` : ""}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* ── Activity & Goals card ── */}
        <Card className="p-5 border border-divider/50 bg-white/70 dark:bg-black/40">
          <CardHeader className="p-0 pb-1">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-warning" />
              Activité & Objectifs
            </h3>
          </CardHeader>
          <CardBody className="p-0 flex flex-col gap-0 divide-y divide-divider/40">
            {loading ? <Skeleton className="h-20 w-full rounded-xl" /> : (
              <>
                {[
                  {
                    label: "Niveau d'activité",
                    value: nutrition?.activity_level
                      ? ACTIVITY_LABELS[nutrition.activity_level] ?? nutrition.activity_level
                      : "—",
                  },
                  {
                    label: "Objectif de poids",
                    value: nutrition?.weight_goal
                      ? GOAL_LABELS[nutrition.weight_goal] ?? nutrition.weight_goal
                      : "—",
                  },
                  {
                    label: "Poids cible",
                    value: nutrition?.goal_weight_kg
                      ? dispW(nutrition.goal_weight_kg, unit)
                      : "—",
                  },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5">
                    <span className="text-xs text-default-400">{row.label}</span>
                    <span className="text-xs font-semibold">{row.value}</span>
                  </div>
                ))}
              </>
            )}
          </CardBody>
        </Card>

        {/* ── Account info card ── */}
        <Card className="p-5 border border-divider/50 bg-white/70 dark:bg-black/40">
          <CardHeader className="p-0 pb-1">
            <h3 className="font-bold text-base flex items-center gap-2">
              <User className="w-4 h-4 text-default-400" />
              Informations du compte
            </h3>
          </CardHeader>
          <CardBody className="p-0 flex flex-col gap-0 divide-y divide-divider/40">
            {[
              { icon: <Mail className="w-3.5 h-3.5 text-default-400" />,     label: "Email",           value: displayEmail || "—" },
              { icon: <Calendar className="w-3.5 h-3.5 text-default-400" />, label: "Membre depuis",   value: profile?.created_at ? formatMemberSince(profile.created_at) : "—" },
              { icon: <Shield className="w-3.5 h-3.5 text-default-400" />,   label: "Plan",            value: planLabel },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2.5">
                <span className="flex items-center gap-1.5 text-xs text-default-400">{row.icon}{row.label}</span>
                {loading
                  ? <Skeleton className="h-3.5 w-24 rounded" />
                  : <span className="text-xs font-semibold">{row.value}</span>}
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* ── Quick links ── */}
      <div>
        <h3 className="text-sm font-semibold text-default-400 uppercase tracking-wider mb-3">Accès rapide</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/dashboard/recettes",    icon: <Utensils className="w-4 h-4 text-warning" />,       label: "Recettes",   bg: "bg-warning/10" },
            { href: "/dashboard/favoris",     icon: <Heart className="w-4 h-4 text-danger" />,           label: "Favoris",    bg: "bg-danger/10" },
            { href: "/dashboard/meal-plans",  icon: <BarChart3 className="w-4 h-4 text-primary" />,      label: "Plans",      bg: "bg-primary/10" },
            { href: "/settings",              icon: <Settings className="w-4 h-4 text-default-500" />,   label: "Paramètres", bg: "bg-default-100" },
          ].map((l) => (
            <Card key={l.href} as={Link} href={l.href} isHoverable isPressable
              className="border border-divider/50 bg-white/50 dark:bg-black/20">
              <CardBody className="flex flex-col items-center gap-2 py-4 px-3">
                <div className={`p-2 rounded-xl ${l.bg}`}>{l.icon}</div>
                <p className="font-semibold text-xs text-center">{l.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
