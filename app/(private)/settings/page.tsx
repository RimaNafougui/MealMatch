"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Skeleton } from "@heroui/skeleton";
import { Slider } from "@heroui/slider";
import { useSession } from "next-auth/react";
import {
  User,
  Bell,
  Shield,
  Globe,
  Trash2,
  Save,
  LogOut,
  KeyRound,
  Flame,
  Activity,
  Target,
  Scale,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { toast } from "sonner";
import {
  calcTDEE,
  calcDailyCalorieTarget,
  lbsToKg,
  kgToLbs,
  inToCm,
  cmToIn,
  GOAL_RATES,
  type Sex,
  type ActivityLevel,
  type WeightGoal,
} from "@/utils/nutrition";

const dietaryOptions = [
  { key: "none", label: "Aucun régime particulier" },
  { key: "vegetarian", label: "Végétarien" },
  { key: "vegan", label: "Végétalien / Vegan" },
  { key: "gluten-free", label: "Sans gluten" },
  { key: "dairy-free", label: "Sans lactose" },
  { key: "keto", label: "Keto / Cétogène" },
  { key: "halal", label: "Halal" },
  { key: "kosher", label: "Casher" },
];


const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: "sedentary",         label: "Sédentaire",          desc: "≤ 5 000 pas/jour" },
  { value: "moderately_active", label: "Modérément actif",    desc: "5 000 – 15 000 pas/jour" },
  { value: "very_active",       label: "Très actif",          desc: "≥ 15 000 pas/jour" },
];

const GOAL_OPTIONS: { value: WeightGoal; label: string }[] = [
  { value: "lose",     label: "Perdre du poids" },
  { value: "maintain", label: "Maintenir mon poids" },
  { value: "gain",     label: "Prendre du poids" },
];

type Section = "profile" | "preferences" | "nutrition" | "progression" | "notifications" | "privacy";

interface WeightLog {
  id: string;
  logged_at: string;
  weight_kg: number;
  note?: string | null;
}

function formatLogDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-CA", { weekday: "short", month: "short", day: "numeric" });
}

function SectionSkeleton() {
  return (
    <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
      <div className="flex flex-col gap-5">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [savingNutrition, setSavingNutrition] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [preferences, setPreferences] = useState({
    dietary: "none",
    allergies: [] as string[],
  });
  const [budgetPeriod, setBudgetPeriod] = useState<"week" | "month">("week");
  const [budgetRange, setBudgetRange] = useState<[number, number]>([20, 100]);
  const [notifications, setNotifications] = useState({
    mealReminders: true,
    weeklyPlan: true,
    newRecipes: false,
    newsletter: false,
    tips: true,
  });

  // ── Nutrition state ──────────────────────────────────────────────────────────
  const [birthYear, setBirthYear] = useState<string>("");
  const [sex, setSex] = useState<Sex | "">("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [heightCm, setHeightCm] = useState<string>("");
  const [heightFt, setHeightFt] = useState<string>("");
  const [heightIn, setHeightIn] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [weightRaw, setWeightRaw] = useState<string>("");
  const [exerciseDays, setExerciseDays] = useState<number>(3);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">("");
  const [weightGoal, setWeightGoal] = useState<WeightGoal | "">("");
  const [goalWeightRaw, setGoalWeightRaw] = useState<string>("");
  const [goalRate, setGoalRate] = useState<string>("");
  const [tdee, setTdee] = useState<number | null>(null);
  const [dailyCalories, setDailyCalories] = useState<number | null>(null);
  const [proteinPct, setProteinPct] = useState(30);
  const [carbsPct, setCarbsPct] = useState(40);
  const [fatPct, setFatPct] = useState(30);

  // ── Weight log state ─────────────────────────────────────────────────────────
  const [weightLogs, setWeightLogs]   = useState<WeightLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);

  const fetchWeightLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const r = await fetch("/api/user/weight-logs?days=90");
      const d = await r.json();
      setWeightLogs(d.logs ?? []);
    } catch {}
    setLoadingLogs(false);
  }, []);

  async function deleteWeightLog(id: string) {
    await fetch("/api/user/weight-logs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setWeightLogs((prev) => prev.filter((l) => l.id !== id));
  }

  const macroGrams = (calories: number | null) => {
    if (!calories) return null;
    return {
      protein: Math.round((calories * proteinPct) / 100 / 4),
      carbs:   Math.round((calories * carbsPct)   / 100 / 4),
      fat:     Math.round((calories * fatPct)      / 100 / 9),
    };
  };

  // Fetch weight logs when section becomes active
  useEffect(() => {
    if (activeSection === "progression") fetchWeightLogs();
  }, [activeSection, fetchWeightLogs]);

  // Recalculate when inputs change
  useEffect(() => {
    if (!birthYear || !sex || !weightRaw || !activityLevel) return;
    const hCm = heightUnit === "cm"
      ? Number(heightCm)
      : inToCm(Number(heightFt) * 12 + Number(heightIn || 0));
    if (!hCm) return;
    const wKg = weightUnit === "kg" ? Number(weightRaw) : lbsToKg(Number(weightRaw));
    const age = new Date().getFullYear() - Number(birthYear);
    if (!age || !wKg) return;
    const t = calcTDEE(wKg, hCm, age, sex as Sex, activityLevel as ActivityLevel, exerciseDays);
    setTdee(t);
    if (goalRate) setDailyCalories(calcDailyCalorieTarget(t, goalRate));
  }, [birthYear, sex, heightCm, heightFt, heightIn, heightUnit, weightRaw, weightUnit, activityLevel, exerciseDays, goalRate]);

  useEffect(() => {
    if (tdee && goalRate) setDailyCalories(calcDailyCalorieTarget(tdee, goalRate));
  }, [goalRate, tdee]);

  // Load all data on mount
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [profileRes, prefsRes, notifsRes, nutritionRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/preferences"),
          fetch("/api/user/notifications"),
          fetch("/api/user/nutrition"),
        ]);

        if (profileRes.ok) {
          const { profile } = await profileRes.json();
          setProfileForm({
            name: profile?.name || session?.user?.name || "",
            email: profile?.email || session?.user?.email || "",
          });
        }

        if (prefsRes.ok) {
          const data = await prefsRes.json();
          setPreferences({
            dietary: data.dietary || "none",
            allergies: data.allergies || [],
          });
          if (data.budget_min != null && data.budget_max != null) {
            setBudgetRange([data.budget_min, data.budget_max]);
          }
        }

        if (notifsRes.ok) {
          const { notifications: n } = await notifsRes.json();
          setNotifications(n);
        }

        if (nutritionRes.ok) {
          const { nutrition } = await nutritionRes.json();
          if (nutrition) {
            if (nutrition.birth_year) setBirthYear(String(nutrition.birth_year));
            if (nutrition.sex) setSex(nutrition.sex);
            if (nutrition.height_unit) setHeightUnit(nutrition.height_unit);
            if (nutrition.height_cm) {
              if (nutrition.height_unit === "in") {
                const totalIn = cmToIn(nutrition.height_cm);
                setHeightFt(String(Math.floor(totalIn / 12)));
                setHeightIn(String(Math.round(totalIn % 12)));
              } else {
                setHeightCm(String(Math.round(nutrition.height_cm)));
              }
            }
            if (nutrition.weight_unit) setWeightUnit(nutrition.weight_unit);
            if (nutrition.weight_kg) {
              setWeightRaw(
                nutrition.weight_unit === "lbs"
                  ? String(kgToLbs(nutrition.weight_kg).toFixed(1))
                  : String(nutrition.weight_kg)
              );
            }
            if (nutrition.exercise_days_per_week != null) setExerciseDays(nutrition.exercise_days_per_week);
            if (nutrition.activity_level) setActivityLevel(nutrition.activity_level);
            if (nutrition.tdee_kcal) setTdee(nutrition.tdee_kcal);
            if (nutrition.weight_goal) setWeightGoal(nutrition.weight_goal);
            if (nutrition.goal_weight_kg) {
              setGoalWeightRaw(
                nutrition.weight_unit === "lbs"
                  ? String(kgToLbs(nutrition.goal_weight_kg).toFixed(1))
                  : String(nutrition.goal_weight_kg)
              );
            }
            if (nutrition.goal_rate) setGoalRate(nutrition.goal_rate);
            if (nutrition.daily_calorie_target) setDailyCalories(nutrition.daily_calorie_target);
            if (nutrition.macro_protein_pct) setProteinPct(nutrition.macro_protein_pct);
            if (nutrition.macro_carbs_pct)   setCarbsPct(nutrition.macro_carbs_pct);
            if (nutrition.macro_fat_pct)     setFatPct(nutrition.macro_fat_pct);
          }
        }
      } catch {
        toast.error("Impossible de charger les paramètres");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileForm.name }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profil mis à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword() {
    if (!passwordForm.password) return;
    if (passwordForm.password.length < 8) { toast.error("Le mot de passe doit contenir au moins 8 caractères"); return; }
    if (passwordForm.password !== passwordForm.confirmPassword) { toast.error("Les mots de passe ne correspondent pas"); return; }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordForm.password, confirmPassword: passwordForm.confirmPassword }),
      });
      if (!res.ok) throw new Error();
      setPasswordForm({ password: "", confirmPassword: "" });
      toast.success("Mot de passe mis à jour !");
    } catch {
      toast.error("Erreur lors du changement de mot de passe");
    } finally {
      setSavingPassword(false);
    }
  }

  async function savePreferences() {
    setSavingPrefs(true);
    try {
      // Always store weekly values in the DB
      const weeklyMin = budgetPeriod === "month" ? Math.round(budgetRange[0] / 4.33) : budgetRange[0];
      const weeklyMax = budgetPeriod === "month" ? Math.round(budgetRange[1] / 4.33) : budgetRange[1];
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...preferences, budget_min: weeklyMin, budget_max: weeklyMax }),
      });
      if (!res.ok) throw new Error();
      toast.success("Préférences sauvegardées !");
    } catch {
      toast.error("Erreur lors de la sauvegarde des préférences");
    } finally {
      setSavingPrefs(false);
    }
  }

  async function saveNotifications() {
    setSavingNotifs(true);
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });
      if (!res.ok) throw new Error();
      toast.success("Notifications mises à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour des notifications");
    } finally {
      setSavingNotifs(false);
    }
  }

  async function saveNutrition() {
    setSavingNutrition(true);
    try {
      const finalHeightCm = heightUnit === "cm"
        ? Number(heightCm)
        : inToCm(Number(heightFt) * 12 + Number(heightIn || 0));
      const finalWeightKg = weightUnit === "kg" ? Number(weightRaw) : lbsToKg(Number(weightRaw));
      const goalWeightKg = goalWeightRaw
        ? (weightUnit === "kg" ? Number(goalWeightRaw) : lbsToKg(Number(goalWeightRaw)))
        : null;
      const age = new Date().getFullYear() - Number(birthYear);
      const finalTdee = (sex && activityLevel && finalHeightCm && finalWeightKg && age)
        ? calcTDEE(finalWeightKg, finalHeightCm, age, sex as Sex, activityLevel as ActivityLevel, exerciseDays)
        : tdee;
      const finalCalories = finalTdee && goalRate
        ? calcDailyCalorieTarget(finalTdee, goalRate)
        : finalTdee;

      const res = await fetch("/api/user/nutrition", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birth_year: Number(birthYear) || null,
          sex: sex || null,
          height_cm: finalHeightCm || null,
          weight_kg: finalWeightKg || null,
          height_unit: heightUnit,
          weight_unit: weightUnit,
          exercise_days_per_week: exerciseDays,
          activity_level: activityLevel || null,
          tdee_kcal: finalTdee || null,
          weight_goal: weightGoal || null,
          goal_weight_kg: goalWeightKg,
          goal_rate: goalRate || null,
          daily_calorie_target: finalCalories || null,
          macro_protein_pct: proteinPct,
          macro_carbs_pct: carbsPct,
          macro_fat_pct: fatPct,
        }),
      });
      if (!res.ok) throw new Error();
      if (finalTdee) setTdee(finalTdee);
      if (finalCalories) setDailyCalories(finalCalories);
      toast.success("Profil nutritionnel mis à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour nutritionnelle");
    } finally {
      setSavingNutrition(false);
    }
  }

  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "profile",       label: "Profil",          icon: <User className="w-4 h-4" /> },
    { key: "preferences",   label: "Préférences",     icon: <Globe className="w-4 h-4" /> },
    { key: "nutrition",     label: "Nutrition",        icon: <Flame className="w-4 h-4" /> },
    { key: "progression",   label: "Progression",     icon: <Scale className="w-4 h-4" /> },
    { key: "notifications", label: "Notifications",   icon: <Bell className="w-4 h-4" /> },
    { key: "privacy",       label: "Confidentialité", icon: <Shield className="w-4 h-4" /> },
  ];

  const initials = (session?.user?.name || session?.user?.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const filteredRates = GOAL_RATES.filter(
    (r) => !weightGoal || r.goalTypes.includes(weightGoal as WeightGoal)
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Paramètres</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <nav className="flex lg:flex-col gap-2 lg:w-48 flex-shrink-0 flex-wrap">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left w-full ${
                activeSection === s.key
                  ? "bg-success/10 text-success"
                  : "text-default-500 hover:text-foreground hover:bg-default-100"
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
          <Divider className="my-2 hidden lg:block" />
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors text-left w-full lg:flex hidden"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </nav>

        {/* Content */}
        <div className="flex-1">

          {/* ── Profile ── */}
          {activeSection === "profile" &&
            (loading ? <SectionSkeleton /> : (
              <div className="flex flex-col gap-4">
                <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                  <CardHeader className="pb-2 p-0 mb-6">
                    <h2 className="font-bold text-xl">Informations du profil</h2>
                  </CardHeader>
                  <CardBody className="p-0 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <Avatar
                        isBordered
                        color="success"
                        name={initials}
                        src={session?.user?.image || undefined}
                        className="w-16 m-1 h-16 text-xl font-bold"
                      />
                      <div>
                        <p className="font-semibold">{session?.user?.name || "Utilisateur"}</p>
                        <p className="text-default-400 text-xs">{session?.user?.email}</p>
                      </div>
                    </div>
                    <Divider className="bg-divider/50" />
                    <div className="flex flex-col gap-4">
                      <Input
                        label="Nom d'affichage"
                        placeholder="Ton prénom ou pseudo"
                        value={profileForm.name}
                        onValueChange={(v) => setProfileForm({ ...profileForm, name: v })}
                        variant="flat"
                      />
                      <Input
                        label="Adresse email"
                        placeholder="ton@email.com"
                        type="email"
                        value={profileForm.email}
                        variant="flat"
                        isReadOnly
                        description="L'adresse email ne peut pas être modifiée ici."
                      />
                    </div>
                    <Button
                      color="success"
                      className="font-semibold w-fit"
                      startContent={<Save className="w-4 h-4" />}
                      onPress={saveProfile}
                      isLoading={savingProfile}
                    >
                      Sauvegarder le profil
                    </Button>
                  </CardBody>
                </Card>

                <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                  <CardHeader className="pb-2 p-0 mb-6">
                    <h2 className="font-bold text-xl flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-default-400" />
                      Changer le mot de passe
                    </h2>
                  </CardHeader>
                  <CardBody className="p-0 flex flex-col gap-4">
                    <Input
                      label="Nouveau mot de passe"
                      placeholder="Minimum 8 caractères"
                      type="password"
                      value={passwordForm.password}
                      onValueChange={(v) => setPasswordForm({ ...passwordForm, password: v })}
                      variant="flat"
                    />
                    <Input
                      label="Confirmer le mot de passe"
                      placeholder="Répète le nouveau mot de passe"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onValueChange={(v) => setPasswordForm({ ...passwordForm, confirmPassword: v })}
                      variant="flat"
                      isInvalid={passwordForm.confirmPassword.length > 0 && passwordForm.password !== passwordForm.confirmPassword}
                      errorMessage="Les mots de passe ne correspondent pas"
                    />
                    <Button
                      color="success"
                      variant="flat"
                      className="font-semibold w-fit"
                      startContent={<KeyRound className="w-4 h-4" />}
                      onPress={savePassword}
                      isLoading={savingPassword}
                      isDisabled={!passwordForm.password}
                    >
                      Mettre à jour le mot de passe
                    </Button>
                  </CardBody>
                </Card>
              </div>
            ))}

          {/* ── Preferences ── */}
          {activeSection === "preferences" &&
            (loading ? <SectionSkeleton /> : (
              <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                <CardHeader className="pb-2 p-0 mb-6">
                  <h2 className="font-bold text-xl">Préférences alimentaires</h2>
                </CardHeader>
                <CardBody className="p-0 flex flex-col gap-5">
                  <Select
                    label="Régime alimentaire"
                    selectedKeys={[preferences.dietary]}
                    onSelectionChange={(keys) => setPreferences({ ...preferences, dietary: Array.from(keys)[0] as string })}
                    variant="flat"
                  >
                    {dietaryOptions.map((opt) => <SelectItem key={opt.key}>{opt.label}</SelectItem>)}
                  </Select>
                  {/* Budget period toggle + slider */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-default-700">Budget alimentaire</p>
                      <div className="flex gap-1 p-0.5 rounded-lg bg-default-100">
                        {(["week", "month"] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              if (p === budgetPeriod) return;
                              if (p === "month") {
                                setBudgetRange([Math.round(budgetRange[0] * 4.33 / 5) * 5, Math.round(budgetRange[1] * 4.33 / 5) * 5]);
                              } else {
                                setBudgetRange([Math.round(budgetRange[0] / 4.33 / 5) * 5, Math.round(budgetRange[1] / 4.33 / 5) * 5]);
                              }
                              setBudgetPeriod(p);
                            }}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all
                              ${budgetPeriod === p ? "bg-white dark:bg-black shadow text-foreground" : "text-default-400 hover:text-default-600"}`}
                          >
                            {p === "week" ? "Semaine" : "Mois"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <p className="text-xs text-default-400 mb-0.5">Minimum</p>
                        <p className="text-xl font-bold text-success">{budgetRange[0]} $</p>
                      </div>
                      <span className="text-default-300">—</span>
                      <div className="text-center">
                        <p className="text-xs text-default-400 mb-0.5">Maximum</p>
                        <p className="text-xl font-bold text-success">{budgetRange[1]} $</p>
                      </div>
                    </div>

                    <Slider
                      step={5}
                      minValue={0}
                      maxValue={budgetPeriod === "month" ? 1600 : 400}
                      value={budgetRange}
                      onChange={(value) => setBudgetRange(value as [number, number])}
                      color="success"
                      size="md"
                      showTooltip
                      tooltipValueFormatOptions={{ style: "currency", currency: "CAD", maximumFractionDigits: 0 }}
                    />

                    <p className="text-xs text-default-400 text-center">
                      {budgetPeriod === "week"
                        ? `≈ ${Math.round(budgetRange[0] * 4.33)} $ — ${Math.round(budgetRange[1] * 4.33)} $ / mois`
                        : `≈ ${Math.round(budgetRange[0] / 4.33)} $ — ${Math.round(budgetRange[1] / 4.33)} $ / semaine`}
                    </p>
                  </div>
                  <Button
                    color="success"
                    className="font-semibold w-fit"
                    startContent={<Save className="w-4 h-4" />}
                    onPress={savePreferences}
                    isLoading={savingPrefs}
                  >
                    Sauvegarder les préférences
                  </Button>
                </CardBody>
              </Card>
            ))}

          {/* ── Nutrition & Goals ── */}
          {activeSection === "nutrition" &&
            (loading ? <SectionSkeleton /> : (
              <div className="flex flex-col gap-4">

                {/* Body metrics card */}
                <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                  <CardHeader className="pb-2 p-0 mb-6">
                    <h2 className="font-bold text-xl flex items-center gap-2">
                      <User className="w-5 h-5 text-default-400" />
                      Informations physiques
                    </h2>
                  </CardHeader>
                  <CardBody className="p-0 flex flex-col gap-5">

                    {/* Birth year */}
                    <Input
                      label="Année de naissance"
                      placeholder="ex. 2000"
                      type="number"
                      value={birthYear}
                      onValueChange={setBirthYear}
                      variant="flat"
                    />

                    {/* Sex */}
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-default-700">Sexe biologique</p>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: "male",   label: "Homme", emoji: "♂️" },
                          { value: "female", label: "Femme",  emoji: "♀️" },
                          { value: "other",  label: "Autre",  emoji: "⚧️" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setSex(opt.value as Sex)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer
                              ${sex === opt.value
                                ? "border-success bg-success/10 text-success"
                                : "border-divider bg-white/50 dark:bg-white/5 text-default-600 hover:border-success/50"
                              }`}
                          >
                            <span>{opt.emoji}</span>{opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Height */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-default-700">Taille</p>
                        <div className="flex gap-1 p-0.5 rounded-lg bg-default-100">
                          {(["cm", "in"] as const).map((u) => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => setHeightUnit(u)}
                              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all
                                ${heightUnit === u ? "bg-white dark:bg-black shadow text-foreground" : "text-default-400"}`}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      </div>
                      {heightUnit === "cm" ? (
                        <Input
                          placeholder="ex. 170"
                          type="number"
                          value={heightCm}
                          onValueChange={setHeightCm}
                          variant="flat"
                          endContent={<span className="text-default-400 text-sm">cm</span>}
                        />
                      ) : (
                        <div className="flex gap-2">
                          <Input placeholder="5" type="number" value={heightFt} onValueChange={setHeightFt} variant="flat" endContent={<span className="text-default-400 text-sm">ft</span>} />
                          <Input placeholder="8" type="number" value={heightIn} onValueChange={setHeightIn} variant="flat" endContent={<span className="text-default-400 text-sm">in</span>} />
                        </div>
                      )}
                    </div>

                    {/* Weight */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-default-700">Poids</p>
                        <div className="flex gap-1 p-0.5 rounded-lg bg-default-100">
                          {(["kg", "lbs"] as const).map((u) => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => setWeightUnit(u)}
                              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all
                                ${weightUnit === u ? "bg-white dark:bg-black shadow text-foreground" : "text-default-400"}`}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Input
                        placeholder={weightUnit === "kg" ? "ex. 70" : "ex. 155"}
                        type="number"
                        value={weightRaw}
                        onValueChange={setWeightRaw}
                        variant="flat"
                        endContent={<span className="text-default-400 text-sm">{weightUnit}</span>}
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Activity card */}
                <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                  <CardHeader className="pb-2 p-0 mb-6">
                    <h2 className="font-bold text-xl flex items-center gap-2">
                      <Activity className="w-5 h-5 text-default-400" />
                      Niveau d&apos;activité
                    </h2>
                  </CardHeader>
                  <CardBody className="p-0 flex flex-col gap-5">

                    {/* Exercise days slider */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-default-700">Séances d&apos;exercice / semaine</p>
                        <span className="text-xl font-bold text-warning">{exerciseDays}</span>
                      </div>
                      <Slider
                        step={1}
                        minValue={0}
                        maxValue={7}
                        value={exerciseDays}
                        onChange={(v) => setExerciseDays(v as number)}
                        color="warning"
                        size="lg"
                        showTooltip
                        marks={[0, 1, 2, 3, 4, 5, 6, 7].map((v) => ({ value: v, label: String(v) }))}
                      />
                    </div>

                    {/* Activity level */}
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-default-700">Niveau de pas quotidiens</p>
                      <div className="flex flex-col gap-2">
                        {ACTIVITY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setActivityLevel(opt.value)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all cursor-pointer
                              ${activityLevel === opt.value
                                ? "border-warning bg-warning/10 text-warning"
                                : "border-divider bg-white/50 dark:bg-white/5 hover:border-warning/40"
                              }`}
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{opt.label}</p>
                              <p className="text-xs text-default-400">{opt.desc}</p>
                            </div>
                            {activityLevel === opt.value && <span className="w-3 h-3 rounded-full bg-warning shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* TDEE display */}
                    {tdee && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-warning/5 border border-warning/20">
                        <Flame size={20} className="text-warning shrink-0" />
                        <div>
                          <p className="text-xs text-default-500">Dépense énergétique estimée (TDEE)</p>
                          <p className="font-bold text-lg text-warning">{tdee.toLocaleString()} kcal/jour</p>
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Goals card */}
                <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                  <CardHeader className="pb-2 p-0 mb-6">
                    <h2 className="font-bold text-xl flex items-center gap-2">
                      <Target className="w-5 h-5 text-default-400" />
                      Objectifs
                    </h2>
                  </CardHeader>
                  <CardBody className="p-0 flex flex-col gap-5">

                    {/* Goal type */}
                    <Select
                      label="Objectif de poids"
                      selectedKeys={weightGoal ? [weightGoal] : []}
                      onSelectionChange={(keys) => {
                        setWeightGoal(Array.from(keys)[0] as WeightGoal);
                        setGoalRate("");
                      }}
                      variant="flat"
                    >
                      {GOAL_OPTIONS.map((opt) => <SelectItem key={opt.value}>{opt.label}</SelectItem>)}
                    </Select>

                    {/* Target weight */}
                    {weightGoal && weightGoal !== "maintain" && (
                      <Input
                        label={`Poids cible (${weightUnit})`}
                        placeholder={weightUnit === "kg" ? "ex. 65" : "ex. 143"}
                        type="number"
                        value={goalWeightRaw}
                        onValueChange={setGoalWeightRaw}
                        variant="flat"
                        endContent={<span className="text-default-400 text-sm">{weightUnit}</span>}
                      />
                    )}

                    {/* Rate */}
                    {weightGoal && (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-default-700">Rythme de progression</p>
                        <div className="flex flex-col gap-2">
                          {filteredRates.map((r) => (
                            <button
                              key={r.key}
                              type="button"
                              onClick={() => setGoalRate(r.key)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm text-left transition-all cursor-pointer
                                ${goalRate === r.key
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-divider bg-white/50 dark:bg-white/5 text-default-600 hover:border-primary/40"
                                }`}
                            >
                              <span className={`w-3 h-3 rounded-full shrink-0 ${goalRate === r.key ? "bg-primary" : "border-2 border-divider"}`} />
                              <span className="font-medium">{r.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Daily calorie target */}
                    {dailyCalories && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                        <Flame size={20} className="text-primary shrink-0" />
                        <div>
                          <p className="text-xs text-default-500">Objectif calorique journalier</p>
                          <p className="font-bold text-lg text-primary">{dailyCalories.toLocaleString()} kcal/jour</p>
                          {tdee && (
                            <p className="text-xs text-default-400">
                              TDEE {tdee.toLocaleString()} → {dailyCalories > tdee ? "+" : ""}{dailyCalories - tdee} kcal
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  </CardBody>
                </Card>

                {/* Macro targets card */}
                <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                  <CardHeader className="pb-2 p-0 mb-6">
                    <h2 className="font-bold text-xl flex items-center gap-2">
                      <span>🥩</span>
                      Répartition des macronutriments
                    </h2>
                  </CardHeader>
                  <CardBody className="p-0 flex flex-col gap-5">
                    {/* Total warning */}
                    {proteinPct + carbsPct + fatPct !== 100 && (
                      <div className="px-3 py-2 rounded-xl bg-warning/10 border border-warning/30">
                        <span className="text-warning text-xs font-semibold">
                          Total : {proteinPct + carbsPct + fatPct}% — doit être égal à 100%
                        </span>
                      </div>
                    )}

                    {/* Bar */}
                    <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                      <div className="bg-danger transition-all duration-300" style={{ width: `${proteinPct}%` }} />
                      <div className="bg-warning transition-all duration-300" style={{ width: `${carbsPct}%` }} />
                      <div className="bg-primary transition-all duration-300" style={{ width: `${fatPct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs -mt-1">
                      <span className="text-danger font-medium">Protéines {proteinPct}%</span>
                      <span className="text-warning font-medium">Glucides {carbsPct}%</span>
                      <span className="text-primary font-medium">Lipides {fatPct}%</span>
                    </div>

                    {/* Protein */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-danger">🥩 Protéines</p>
                        <span className="text-lg font-bold text-danger">{proteinPct}%</span>
                      </div>
                      <Slider
                        step={5} minValue={5} maxValue={60}
                        value={proteinPct}
                        onChange={(v) => { const val = v as number; setProteinPct(val); setFatPct(Math.max(5, Math.min(60, 100 - val - carbsPct))); }}
                        color="danger" size="md" showTooltip
                      />
                    </div>

                    {/* Carbs */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-warning">🌾 Glucides</p>
                        <span className="text-lg font-bold text-warning">{carbsPct}%</span>
                      </div>
                      <Slider
                        step={5} minValue={5} maxValue={70}
                        value={carbsPct}
                        onChange={(v) => { const val = v as number; setCarbsPct(val); setFatPct(Math.max(5, Math.min(60, 100 - proteinPct - val))); }}
                        color="warning" size="md" showTooltip
                      />
                    </div>

                    {/* Fat */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-primary">🫒 Lipides</p>
                        <span className="text-lg font-bold text-primary">{fatPct}%</span>
                      </div>
                      <Slider
                        step={5} minValue={5} maxValue={60}
                        value={fatPct}
                        onChange={(v) => { const val = v as number; setFatPct(val); setCarbsPct(Math.max(5, Math.min(70, 100 - proteinPct - val))); }}
                        color="primary" size="md" showTooltip
                      />
                    </div>

                    {/* Gram preview */}
                    {dailyCalories && (() => {
                      const g = macroGrams(dailyCalories);
                      return g ? (
                        <div className="flex gap-3">
                          <div className="flex-1 p-3 rounded-xl bg-danger/5 border border-danger/15 text-center">
                            <p className="text-xs text-default-400">Protéines</p>
                            <p className="font-bold text-danger">{g.protein}g</p>
                          </div>
                          <div className="flex-1 p-3 rounded-xl bg-warning/5 border border-warning/15 text-center">
                            <p className="text-xs text-default-400">Glucides</p>
                            <p className="font-bold text-warning">{g.carbs}g</p>
                          </div>
                          <div className="flex-1 p-3 rounded-xl bg-primary/5 border border-primary/15 text-center">
                            <p className="text-xs text-default-400">Lipides</p>
                            <p className="font-bold text-primary">{g.fat}g</p>
                          </div>
                        </div>
                      ) : null;
                    })()}

                    <Button
                      color="success"
                      className="font-semibold w-fit"
                      startContent={<Save className="w-4 h-4" />}
                      onPress={saveNutrition}
                      isLoading={savingNutrition}
                    >
                      Sauvegarder le profil nutritionnel
                    </Button>
                  </CardBody>
                </Card>
              </div>
            ))}

          {/* ── Progression ── */}
          {activeSection === "progression" && (
            <div className="flex flex-col gap-4">
              <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                <CardHeader className="pb-2 p-0 mb-4">
                  <div className="flex items-center justify-between w-full">
                    <h2 className="font-bold text-xl flex items-center gap-2">
                      <Scale className="w-5 h-5 text-default-400" />
                      Historique du poids
                    </h2>
                    {weightLogs.length > 0 && (
                      <Chip size="sm" variant="flat" color="success">
                        {weightLogs.length} entrées
                      </Chip>
                    )}
                  </div>
                </CardHeader>
                <CardBody className="p-0 flex flex-col gap-4">
                  {loadingLogs ? (
                    <div className="flex flex-col gap-2">
                      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
                    </div>
                  ) : weightLogs.length === 0 ? (
                    <p className="text-sm text-default-400 text-center py-6">
                      Aucune donnée de poids. Commencez à enregistrer depuis le tableau de bord.
                    </p>
                  ) : (
                    <>
                      {/* Summary stats */}
                      {weightLogs.length >= 2 && (() => {
                        const latest = weightLogs[weightLogs.length - 1];
                        const first  = weightLogs[0];
                        const delta  = latest.weight_kg - first.weight_kg;
                        const dispUnit = weightUnit as "kg" | "lbs";
                        const dispVal  = (kg: number) => dispUnit === "lbs" ? `${kgToLbs(kg).toFixed(1)} lbs` : `${kg.toFixed(1)} kg`;
                        return (
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl bg-default-100 text-center">
                              <p className="text-[10px] text-default-400 mb-0.5">Départ</p>
                              <p className="font-bold text-sm">{dispVal(first.weight_kg)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-default-100 text-center">
                              <p className="text-[10px] text-default-400 mb-0.5">Actuel</p>
                              <p className="font-bold text-sm text-success">{dispVal(latest.weight_kg)}</p>
                            </div>
                            <div className={`p-3 rounded-xl text-center ${delta < 0 ? "bg-success/10" : delta > 0 ? "bg-danger/10" : "bg-default-100"}`}>
                              <p className="text-[10px] text-default-400 mb-0.5">Variation</p>
                              <div className="flex items-center justify-center gap-1">
                                {delta < 0 ? <TrendingDown size={12} className="text-success" /> : delta > 0 ? <TrendingUp size={12} className="text-danger" /> : null}
                                <p className={`font-bold text-sm ${delta < 0 ? "text-success" : delta > 0 ? "text-danger" : "text-default-400"}`}>
                                  {delta > 0 ? "+" : ""}{dispVal(delta)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Log list */}
                      <div className="flex flex-col divide-y divide-divider/40">
                        {(showAllLogs ? [...weightLogs] : [...weightLogs].slice(-10)).reverse().map((log) => (
                          <div key={log.id} className="flex items-center justify-between py-2.5 gap-3">
                            <span className="text-xs text-default-400 w-28 shrink-0">{formatLogDate(log.logged_at)}</span>
                            <span className="text-sm font-semibold flex-1">
                              {weightUnit === "lbs"
                                ? `${kgToLbs(log.weight_kg).toFixed(1)} lbs`
                                : `${log.weight_kg.toFixed(1)} kg`}
                            </span>
                            {log.note && (
                              <span className="text-xs text-default-400 italic truncate max-w-32">{log.note}</span>
                            )}
                            <button
                              type="button"
                              onClick={() => deleteWeightLog(log.id)}
                              className="p-1.5 rounded-lg hover:bg-danger/10 text-default-300 hover:text-danger transition-colors shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {weightLogs.length > 10 && (
                        <button
                          type="button"
                          onClick={() => setShowAllLogs((s) => !s)}
                          className="flex items-center gap-1 text-xs text-default-400 hover:text-foreground transition-colors self-start"
                        >
                          {showAllLogs ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          {showAllLogs ? "Voir moins" : `Voir les ${weightLogs.length - 10} entrées plus anciennes`}
                        </button>
                      )}
                    </>
                  )}
                </CardBody>
              </Card>

              {/* Goal progress card */}
              {weightLogs.length > 0 && goalWeightRaw && weightGoal && (
                <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                  <CardHeader className="pb-2 p-0 mb-4">
                    <h2 className="font-bold text-xl flex items-center gap-2">
                      <Target className="w-5 h-5 text-default-400" />
                      Progression vers l&apos;objectif
                    </h2>
                  </CardHeader>
                  <CardBody className="p-0 flex flex-col gap-4">
                    {(() => {
                      const latest   = weightLogs[weightLogs.length - 1];
                      const first    = weightLogs[0];
                      const goalKg   = weightUnit === "lbs"
                        ? Number(goalWeightRaw) / 2.20462
                        : Number(goalWeightRaw);
                      const totalDist = Math.abs(first.weight_kg - goalKg);
                      const covered   = Math.abs(first.weight_kg - latest.weight_kg);
                      const pct       = totalDist > 0 ? Math.min(100, Math.round((covered / totalDist) * 100)) : 0;
                      const remaining = Math.abs(latest.weight_kg - goalKg);
                      const dispVal   = (kg: number) => weightUnit === "lbs"
                        ? `${kgToLbs(kg).toFixed(1)} lbs`
                        : `${kg.toFixed(1)} kg`;

                      return (
                        <>
                          <div className="flex justify-between text-xs text-default-400 mb-1">
                            <span>Départ : {dispVal(first.weight_kg)}</span>
                            <span>Objectif : {dispVal(goalKg)}</span>
                          </div>
                          <div className="w-full bg-default-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-success transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-default-400">{pct}% accompli</span>
                            <Chip size="sm" variant="flat" color={remaining < 1 ? "success" : "primary"}>
                              {remaining < 0.1 ? "Objectif atteint ! 🎉" : `${dispVal(remaining)} restant`}
                            </Chip>
                          </div>
                        </>
                      );
                    })()}
                  </CardBody>
                </Card>
              )}
            </div>
          )}

          {/* ── Notifications ── */}
          {activeSection === "notifications" &&
            (loading ? <SectionSkeleton /> : (
              <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                <CardHeader className="pb-2 p-0 mb-6">
                  <h2 className="font-bold text-xl">Préférences de notification</h2>
                </CardHeader>
                <CardBody className="p-0 flex flex-col gap-0">
                  {(
                    [
                      { key: "mealReminders" as const, label: "Rappels de repas", desc: "Notifications pour les repas planifiés" },
                      { key: "weeklyPlan" as const, label: "Résumé hebdomadaire", desc: "Récapitulatif de ton plan de la semaine" },
                      { key: "newRecipes" as const, label: "Nouvelles recettes", desc: "Alertes lors de l'ajout de nouvelles recettes" },
                      { key: "tips" as const, label: "Conseils nutritionnels", desc: "Astuces et conseils pour mieux manger" },
                      { key: "newsletter" as const, label: "Newsletter", desc: "Actualités et offres de MealMatch" },
                    ] as { key: keyof typeof notifications; label: string; desc: string }[]
                  ).map((item, i, arr) => (
                    <div key={item.key}>
                      <div className="flex items-center justify-between py-4">
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-default-400 text-xs">{item.desc}</p>
                        </div>
                        <Switch
                          isSelected={notifications[item.key]}
                          onValueChange={(v) => setNotifications({ ...notifications, [item.key]: v })}
                          color="success"
                          size="sm"
                        />
                      </div>
                      {i < arr.length - 1 && <Divider className="bg-divider/50" />}
                    </div>
                  ))}
                  <Button
                    color="success"
                    className="font-semibold mt-4 w-fit"
                    startContent={<Save className="w-4 h-4" />}
                    onPress={saveNotifications}
                    isLoading={savingNotifs}
                  >
                    Sauvegarder les notifications
                  </Button>
                </CardBody>
              </Card>
            ))}

          {/* ── Privacy ── */}
          {activeSection === "privacy" && (
            <div className="flex flex-col gap-4">
              <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                <CardHeader className="pb-2 p-0 mb-4">
                  <h2 className="font-bold text-xl">Confidentialité et données</h2>
                </CardHeader>
                <CardBody className="p-0 flex flex-col gap-4">
                  <p className="text-default-500 text-sm">
                    Tes données personnelles sont protégées et ne sont jamais partagées avec des tiers sans ton consentement explicite.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button variant="flat" color="default" className="font-semibold justify-start" as="a" href="/privacy">
                      Lire la politique de confidentialité
                    </Button>
                    <Button variant="flat" color="default" className="font-semibold justify-start" as="a" href="/terms">
                      Conditions d&apos;utilisation
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <Card className="p-6 border border-danger/30 bg-danger/5">
                <CardHeader className="pb-2 p-0 mb-4">
                  <h2 className="font-bold text-xl text-danger">Zone dangereuse</h2>
                </CardHeader>
                <CardBody className="p-0 flex flex-col gap-3">
                  <p className="text-default-500 text-sm">
                    La suppression de ton compte est irréversible. Toutes tes données, recettes et plans de repas seront définitivement supprimés.
                  </p>
                  <Button color="danger" variant="bordered" startContent={<Trash2 className="w-4 h-4" />} className="font-semibold w-fit">
                    Supprimer mon compte
                  </Button>
                </CardBody>
              </Card>

              <div className="lg:hidden">
                <Button color="danger" variant="flat" startContent={<LogOut className="w-4 h-4" />} className="font-semibold w-full" onPress={() => logout()}>
                  Déconnexion
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
