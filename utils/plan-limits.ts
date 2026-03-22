export type Plan = "free" | "student" | "premium";

export const PLAN_LIMITS = {
  free: {
    mealPlansPerMonth: 2,
    maxRecipes: 50,
    maxFavorites: 10,
    advancedAI: false,
    pdfExport: false,
    premiumRecipes: false,
    weeksPlanning: 1,
    familyPlans: false,
    nutritionist: false,
    calendarExport: false,
    apiAccess: false,
  },
  student: {
    mealPlansPerMonth: Infinity,
    maxRecipes: Infinity,
    maxFavorites: Infinity,
    advancedAI: true,
    pdfExport: true,
    premiumRecipes: false,
    weeksPlanning: 1,
    familyPlans: false,
    nutritionist: false,
    calendarExport: false,
    apiAccess: false,
  },
  premium: {
    mealPlansPerMonth: Infinity,
    maxRecipes: Infinity,
    maxFavorites: Infinity,
    advancedAI: true,
    pdfExport: true,
    premiumRecipes: true,
    weeksPlanning: 4,
    familyPlans: true,
    nutritionist: true,
    calendarExport: true,
    apiAccess: true,
  },
} as const;

export function getLimits(plan: string) {
  return PLAN_LIMITS[(plan as Plan) in PLAN_LIMITS ? (plan as Plan) : "free"];
}

/** Returns true if userPlan meets or exceeds the requiredPlan tier */
export function hasAccess(userPlan: string, requiredPlan: "student" | "premium"): boolean {
  if (requiredPlan === "student") return userPlan === "student" || userPlan === "premium";
  if (requiredPlan === "premium") return userPlan === "premium";
  return true;
}
