# Component Library — MealMatch

All components are written in **TypeScript** with **HeroUI** + **Tailwind CSS v4**. Icons are from **lucide-react**.

---

## Table of Contents

- [Layout](#layout)
- [Dashboard](#dashboard)
- [Meal Plan](#meal-plan)
- [Recipes](#recipes)
- [UI / Plan Gating](#ui--plan-gating)
- [Auth & Login](#auth--login)
- [Onboarding](#onboarding)
- [Signup](#signup)
- [Shared Primitives](#shared-primitives)
- [HeroUI Components Used](#heroui-components-used)

---

## Layout

### `components/layout/Navbar.tsx` — `<AppNavbar>`

Top navigation bar rendered on every page.

```tsx
<AppNavbar user={session?.user ?? null} />
```

| Prop   | Type          | Description                                     |
| ------ | ------------- | ----------------------------------------------- |
| `user` | `any \| null` | Current session user; `null` = logged-out state |

**Behaviour:**

- **Logged out:** shows Connexion + Commencer buttons, public nav links (Accueil, Tarification, Nutrition)
- **Logged in (mobile):** hamburger opens full-screen overlay menu with all nav links + profile links + logout
- **Logged in (desktop):** shows Dashboard + Explorer links, avatar dropdown (hidden on mobile)
- **Avatar dropdown:** hidden on mobile (`hidden sm:flex`) since hamburger covers those links
- **Hydration safe:** `ProfileDropdown` only renders after mount to avoid React Aria ID mismatches
- **Scroll shadow:** adds `shadow-md` after 8px scroll

---

### `components/layout/Footer.tsx`

Simple site footer with links and copyright.

---

## Dashboard

### `components/dashboard/DashboardSidebar.tsx` — `<DashboardSidebar>`

Left sidebar visible on desktop (`lg+`). Hidden on mobile (replaced by horizontal nav strip in layout).

```tsx
<DashboardSidebar
  desktopCollapsed={false}
  onToggleDesktop={() => setDesktopCollapsed((c) => !c)}
/>
```

| Prop               | Type         | Description                  |
| ------------------ | ------------ | ---------------------------- |
| `desktopCollapsed` | `boolean`    | Collapses sidebar to width 0 |
| `onToggleDesktop`  | `() => void` | Toggle collapse handler      |

**Exports:**

```typescript
export const navLinks = [...]       // Base nav items
export const premiumLinks = [...]   // Premium-only nav items
```

These exports are consumed by the dashboard layout to render the mobile horizontal nav strip.

**Nav links:**

| Label                      | Route                     | Icon           |
| -------------------------- | ------------------------- | -------------- |
| Accueil                    | `/dashboard`              | `Home`         |
| Recettes                   | `/dashboard/recettes`     | `Utensils`     |
| Meal Plans                 | `/dashboard/meal-plans`   | `Calendar`     |
| Epicerie                   | `/dashboard/epicerie`     | `ShoppingCart` |
| Favoris                    | `/dashboard/favoris`      | `Heart`        |
| Nutritionniste _(Premium)_ | `/dashboard/nutritionist` | `BrainCircuit` |
| Famille _(Premium)_        | `/dashboard/family`       | `Users`        |

---

### `components/dashboard/ProgressDashboard.tsx` — `<ProgressDashboard>`

Nutrition and activity progress section on the main dashboard page.

```tsx
<ProgressDashboard />
```

No props — fetches its own data internally.

---

## Meal Plan

### `components/meal-plan/MealPlansDashboard.tsx` — `<MealPlansDashboard>`

The main view of the meal plans page, showing the current week's plan and history.

```tsx
<MealPlansDashboard />
```

Internally uses `useMealPlans()`, `useMealPlanDetail()`.

---

### `components/meal-plan/MealPlanCalendar.tsx` — `<MealPlanCalendar>`

Full calendar view of a meal plan with day columns and meal rows.

```tsx
<MealPlanCalendar plan={mealPlan} />
```

| Prop   | Type       | Description                             |
| ------ | ---------- | --------------------------------------- |
| `plan` | `MealPlan` | The meal plan object with `meals` JSONB |

---

### `components/meal-plan/MealPlanGrid.tsx` — `<MealPlanGrid>`

Alternative grid layout for meal plan display.

---

### `components/meal-plan/MealSlot.tsx` — `<MealSlot>`

Individual meal card within the calendar. Shows recipe image, title, calories, macros.

```tsx
<MealSlot
  meal={mealData}
  day="monday"
  mealType="lunch"
  onRegenerate={handleRegenerate}
  onViewDetail={handleViewDetail}
/>
```

| Prop           | Type         | Description                        |
| -------------- | ------------ | ---------------------------------- |
| `meal`         | `MealData`   | Recipe data for this slot          |
| `day`          | `string`     | Day of the week                    |
| `mealType`     | `string`     | `breakfast` \| `lunch` \| `dinner` |
| `onRegenerate` | `() => void` | Regenerate this meal slot          |
| `onViewDetail` | `() => void` | Open detail modal                  |

---

### `components/meal-plan/MealDetailModal.tsx` — `<MealDetailModal>`

Drawer/modal showing full recipe details when clicking a meal slot.

```tsx
<MealDetailModal recipeId={selectedId} isOpen={isOpen} onClose={onClose} />
```

| Prop       | Type             | Description       |
| ---------- | ---------------- | ----------------- |
| `recipeId` | `string \| null` | Recipe to display |
| `isOpen`   | `boolean`        | Modal visibility  |
| `onClose`  | `() => void`     | Close handler     |

---

### `components/generateConfig.tsx` — `<GenerateConfig>`

Configuration panel for the meal plan generator: number of days and meals per day. 4-week planning is gated to premium.

```tsx
<GenerateConfig
  daysCount={daysCount}
  mealsPerDay={mealsPerDay}
  onDaysChange={setDaysCount}
  onMealsChange={setMealsPerDay}
  userPlan="free"
/>
```

---

### `components/meal-plan/MealPlanPaywallModal.tsx` — `<MealPlanPaywallModal>`

Modal shown when a free user hits their monthly generation limit.

```tsx
<MealPlanPaywallModal
  isOpen={showPaywall}
  onClose={() => setShowPaywall(false)}
  count={3}
  limit={5}
/>
```

---

### `components/meal-plan/RepeatMealModal.tsx` — `<RepeatMealModal>`

Modal for cloning an existing plan to a future week.

```tsx
<RepeatMealModal plan={currentPlan} isOpen={isOpen} onClose={onClose} />
```

---

### `components/meal-plan/UsageIndicator.tsx` — `<UsageIndicator>`

Progress bar showing how many meal plans the user has generated this month vs. their limit.

```tsx
<UsageIndicator count={3} limit={5} plan="free" />
```

| Prop    | Type     | Description                   |
| ------- | -------- | ----------------------------- |
| `count` | `number` | Plans generated this month    |
| `limit` | `number` | Monthly limit for user's plan |
| `plan`  | `string` | User's plan name              |

---

### `components/meal-plan/WeeklyCalendar.tsx` — `<WeeklyCalendar>`

Week selector / navigator component.

---

## Recipes

### `components/recipes/recipe-card.tsx` — `<RecipeCard>` + `<RecipeCardSkeleton>`

Recipe card with image, title, macros, prep time, price, and favorite toggle.

```tsx
<RecipeCard
  recipe={recipe}
  isFavorite={true}
  onFavoriteToggle={() => handleToggle(recipe.id)}
/>

// Loading skeleton:
<RecipeCardSkeleton />
```

| Prop               | Type         | Description                                |
| ------------------ | ------------ | ------------------------------------------ |
| `recipe`           | `Recipe`     | Recipe data object                         |
| `isFavorite`       | `boolean`    | Whether the user has favorited this recipe |
| `onFavoriteToggle` | `() => void` | Toggle favorite handler                    |

**Displayed fields:** image, title, meal_type badge, prep_time, calories, protein, price_per_serving, dietary_tags

---

### `components/recipes/AddRecipeModal.tsx` — `<AddRecipeModal>`

Full-featured modal form for creating or editing a personal recipe.

```tsx
<AddRecipeModal
  isOpen={isOpen}
  onClose={onClose}
  editingRecipe={null} // null = create mode, Recipe = edit mode
  onSaved={handleSaved}
/>
```

| Prop            | Type                           | Description                        |
| --------------- | ------------------------------ | ---------------------------------- |
| `isOpen`        | `boolean`                      | Modal visibility                   |
| `onClose`       | `() => void`                   | Close handler                      |
| `editingRecipe` | `UserRecipe \| null`           | Recipe to edit, or null for create |
| `onSaved`       | `(recipe: UserRecipe) => void` | Callback after save                |

**Fields:** title, image_url, prep_time, servings, calories, protein, carbs, fat, price_per_serving, ingredients (textarea), instructions (textarea), dietary_tags (chips)

---

## UI / Plan Gating

### `components/ui/PlanGate.tsx` — `<PlanGate>`

Wraps content that requires a specific plan. Renders children normally if access is granted; renders a blurred overlay with an upgrade CTA if not.

```tsx
<PlanGate requiredPlan="premium" userPlan={userPlan}>
  <NutritionistChat />
</PlanGate>
```

| Prop           | Type                     | Description           |
| -------------- | ------------------------ | --------------------- |
| `requiredPlan` | `"student" \| "premium"` | Minimum plan required |
| `userPlan`     | `string`                 | User's current plan   |
| `children`     | `React.ReactNode`        | Content to gate       |

**When access is denied:**

- Children are rendered but blurred (`blur-sm opacity-60 pointer-events-none`)
- Overlay shows a lock icon, plan name, and "Passer à [Plan]" button linking to `/pricing`

---

## Auth & Login

### `components/login/LoginForm.tsx` — `<LoginForm>`

Email + password sign-in form with error handling.

---

### `components/login/button.tsx` — `<SignInButtonGoogle>` + `<SignInButtonGithub>`

OAuth sign-in buttons that trigger `signIn("google")` / `signIn("github")`.

```tsx
<SignInButtonGoogle />
<SignInButtonGithub />
```

---

### `components/login/dropdown.tsx` — `<ProfileDropdown>`

Avatar button with dropdown menu showing profile links and sign-out.

```tsx
<ProfileDropdown user={session.user} />
```

| Prop   | Type          | Description                              |
| ------ | ------------- | ---------------------------------------- |
| `user` | `SessionUser` | Session user object (name, email, image) |

**Menu items:** Mon Profil, Paramètres, Déconnexion

> Hidden on mobile (`hidden sm:flex`) — the Navbar hamburger menu covers these links.

---

## Onboarding

### `components/onboarding/OnboardingForm.tsx` — `<OnboardingForm>`

Multi-step wizard collecting user profile data after sign-up.

**Steps:**

1. Dietary restrictions & allergies
2. Budget & cooking preferences
3. Body metrics (weight, height, age, gender)
4. Activity level & health goal

Data submitted to `POST /api/profiles/onboarding`.

---

### `components/onboarding/OnboardingSteps.tsx` — `<OnboardingSteps>`

Step indicator / progress bar for the onboarding wizard.

```tsx
<OnboardingSteps currentStep={2} totalSteps={4} />
```

---

## Signup

### `components/signup/SignUpForm.tsx` — `<SignUpForm>`

Registration form with real-time username availability check (debounced 500ms).

**Fields:** name, username, email, password, confirm password
**Validation:** client-side with Zod, server-side in `POST /api/auth/signup`

---

## Shared Primitives

### `components/logo.tsx` — `<Logo>`

MealMatch logo mark (SVG). Used in Navbar and DashboardSidebar.

```tsx
<Logo />
```

---

### `components/theme-switch.tsx` — `<ThemeSwitch>`

Sun/Moon toggle button for switching between light and dark mode. Uses `next-themes`.

```tsx
<ThemeSwitch />
```

---

### `components/icons.tsx`

Collection of custom SVG icons not available in lucide-react.

---

### `components/primitives.ts`

Tailwind class variant functions using `tailwind-variants`:

```typescript
export const title = tv({ ... });       // Heading variants
export const subtitle = tv({ ... });    // Subheading variants
```

---

## HeroUI Components Used

| Component                        | Import                   | Used in                 |
| -------------------------------- | ------------------------ | ----------------------- |
| `Button`                         | `@heroui/button`         | Throughout              |
| `Card`, `CardBody`, `CardHeader` | `@heroui/card`           | Throughout              |
| `Input`                          | `@heroui/input`          | Forms, search           |
| `Select`, `SelectItem`           | `@heroui/select`         | Filters, config         |
| `Tabs`, `Tab`                    | `@heroui/tabs`           | Recettes page, settings |
| `Modal`, `ModalContent`, etc.    | `@heroui/modal`          | Detail modals           |
| `Chip`                           | `@heroui/chip`           | Badges, tags            |
| `Skeleton`                       | `@heroui/skeleton`       | Loading states          |
| `Avatar`                         | `@heroui/avatar`         | Profile dropdown        |
| `Divider`                        | `@heroui/divider`        | Layout separators       |
| `Checkbox`                       | `@heroui/checkbox`       | Shopping list items     |
| `Slider`                         | `@heroui/slider`         | Calorie range filter    |
| `Link`                           | `@heroui/link`           | Internal links          |
| `Navbar`, `NavbarContent`, etc.  | `@heroui/react`          | Top navigation          |
| `useDisclosure`                  | `@heroui/use-disclosure` | Modal state management  |

**Theme:** Configured in `tailwind.config.ts` with custom success (green) as the primary brand color.

---

## Coding Conventions

- **File naming:** `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils
- **Exports:** named exports preferred; default export only for page components
- **Icons:** always `import { IconName } from "lucide-react"` — tree-shaken
- **Styles:** Tailwind utility classes; no inline styles except for dynamic values
- **French UI:** all user-facing strings in French; code/comments in English
- **Loading states:** use HeroUI `<Skeleton>` components matching the loaded layout shape
- **Error states:** inline warning cards with `AlertTriangle` icon + retry button
