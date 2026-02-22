/**
 * Nutrition calculations: TDEE and calorie targets.
 *
 * Formula: Mifflin-St Jeor BMR → multiply by PAL activity factor → adjust for goal.
 */

export type Sex = "male" | "female" | "other";
export type ActivityLevel = "sedentary" | "moderately_active" | "very_active";
export type WeightGoal = "lose" | "maintain" | "gain";

/** Activity multipliers (PAL) */
const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary:         1.25, // ≤5 000 steps/day, little/no structured exercise
  moderately_active: 1.55, // 5 000–15 000 steps/day
  very_active:       1.80, // ≥15 000 steps/day
};

/** Extra calories burned per structured exercise session (approx 45 min moderate) */
const EXERCISE_KCAL_PER_SESSION = 250;

/**
 * Calculate BMR using Mifflin-St Jeor equation.
 * @param weightKg  body weight in kg
 * @param heightCm  height in cm
 * @param age       age in years
 * @param sex       "male" | "female" | "other"
 */
export function calcBMR(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "male")   return base + 5;
  if (sex === "female") return base - 161;
  // "other" → average of both
  return base - 78;
}

/**
 * Calculate TDEE (total daily energy expenditure).
 */
export function calcTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
  activityLevel: ActivityLevel,
  exerciseDaysPerWeek: number,
): number {
  const bmr = calcBMR(weightKg, heightCm, age, sex);
  const palTDEE = bmr * ACTIVITY_FACTORS[activityLevel];
  // Add exercise bonus spread daily
  const exerciseBonus = (exerciseDaysPerWeek * EXERCISE_KCAL_PER_SESSION) / 7;
  return Math.round(palTDEE + exerciseBonus);
}

/** Weekly deficit/surplus rates in kcal/day mapped to our rate keys */
export const GOAL_RATES: {
  key: string;
  label: string;
  kcalDelta: number; // negative = deficit, positive = surplus
  goalTypes: WeightGoal[];
}[] = [
  // Lose
  { key: "lose_0.25kg_week",   label: "−0,25 kg/semaine (~0,25% du poids)",  kcalDelta: -275,  goalTypes: ["lose"] },
  { key: "lose_0.5kg_week",    label: "−0,5 kg/semaine (~0,5% du poids)",    kcalDelta: -550,  goalTypes: ["lose"] },
  { key: "lose_0.5kg_2weeks",  label: "−0,5 kg/2 semaines (doux)",           kcalDelta: -275,  goalTypes: ["lose"] },
  { key: "lose_1kg_month",     label: "−1 kg/mois (très doux)",              kcalDelta: -230,  goalTypes: ["lose"] },
  // Maintain
  { key: "maintain",           label: "Maintien du poids actuel",            kcalDelta: 0,     goalTypes: ["maintain"] },
  // Gain
  { key: "gain_0.25kg_week",   label: "+0,25 kg/semaine (prise douce)",      kcalDelta: 275,   goalTypes: ["gain"] },
  { key: "gain_0.5kg_week",    label: "+0,5 kg/semaine (~0,5% du poids)",    kcalDelta: 550,   goalTypes: ["gain"] },
];

/**
 * Calculate daily calorie intake target.
 */
export function calcDailyCalorieTarget(tdee: number, goalRate: string): number {
  const rate = GOAL_RATES.find((r) => r.key === goalRate);
  const delta = rate?.kcalDelta ?? 0;
  // Never go below 1 200 kcal (safety floor)
  return Math.max(1200, Math.round(tdee + delta));
}

/** Convert lbs to kg */
export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

/** Convert kg to lbs */
export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

/** Convert inches to cm */
export function inToCm(inches: number): number {
  return inches * 2.54;
}

/** Convert cm to inches */
export function cmToIn(cm: number): number {
  return cm / 2.54;
}
