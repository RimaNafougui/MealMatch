# API Routes — MealMatch

All routes live under `/app/api/`. Every protected route requires a valid NextAuth session (`auth()` returns a session with `user.id`). Routes that are plan-gated will return `403` with `{ error: "premium_required" }` when the user's plan is insufficient.

---

## Table of Contents

- [Authentication](#authentication)
- [User](#user)
- [Recipes](#recipes)
- [Meal Plans](#meal-plans)
- [Shopping Lists](#shopping-lists)
- [Favorites](#favorites)
- [Nutritionist IA](#nutritionist-ia-premium)
- [Family](#family-premium)
- [Calendar](#calendar-premium)
- [Stripe & Billing](#stripe--billing)
- [Profiles & Onboarding](#profiles--onboarding)

---

## Authentication

### `GET/POST /api/auth/[...nextauth]`
NextAuth.js catch-all handler. Manages OAuth flows (Google, GitHub) and credentials sign-in/sign-out.

### `POST /api/auth/signup`
Register a new user with email + password.

- **Auth required:** No
- **Rate limited:** Yes (per IP)
- **Body:**
```json
{
  "name": "string",
  "email": "string",
  "username": "string",
  "password": "string"
}
```
- **Response `201`:**
```json
{ "message": "Compte créé avec succès" }
```
- **Errors:** `400` (validation), `409` (email/username taken), `429` (rate limited)

### `GET /api/auth/check-credentials`
Check if an email/username is already taken (used during signup form).

- **Auth required:** No
- **Query params:** `?email=` or `?username=`
- **Response:**
```json
{ "available": true }
```

### `GET /api/users/check-username`
Check username availability in real-time (debounced during signup).

- **Auth required:** No
- **Query params:** `?username=string`
- **Response:** `{ "available": boolean }`

---

## User

### `GET /api/user/plan`
Returns the authenticated user's current subscription plan.

- **Auth required:** Yes
- **Response:**
```json
{ "plan": "free" | "student" | "premium" }
```

### `GET /api/user/subscription`
Returns full subscription details for the settings page.

- **Auth required:** Yes
- **Response:**
```json
{
  "plan": "free" | "student" | "premium",
  "subscription_status": "active" | "canceled" | "past_due" | null,
  "current_period_end": "2025-12-31T00:00:00Z" | null,
  "has_stripe_customer": boolean,
  "has_subscription": boolean
}
```

### `GET /api/user/stats`
Returns dashboard statistics for the current user.

- **Auth required:** Yes
- **Response:**
```json
{
  "savedRecipes": 12,
  "mealPlans": 4,
  "favorites": 8,
  "profile": { "name": "string", "plan": "free" }
}
```

### `GET /api/user/profile`
Fetch full user profile data.

- **Auth required:** Yes
- **Response:** Full `profiles` row

### `GET /api/user/nutrition`
Fetch user nutrition targets (TDEE, macros).

- **Auth required:** Yes
- **Response:**
```json
{
  "tdee_kcal": 2100,
  "macro_protein_pct": 30,
  "macro_carbs_pct": 45,
  "macro_fat_pct": 25,
  "daily_calorie_target": 1800
}
```

### `GET /api/user/weight-logs`
Fetch weight tracking history.

- **Auth required:** Yes
- **Response:** `{ "logs": WeightLog[] }`

### `PATCH /api/user/password`
Update the user's password (credentials accounts only).

- **Auth required:** Yes
- **Body:** `{ "currentPassword": "string", "newPassword": "string" }`
- **Response:** `{ "message": "Mot de passe mis à jour" }`

### `PATCH /api/user/preferences`
Update notification and display preferences.

- **Auth required:** Yes

### `PATCH /api/user/notifications`
Update notification settings.

- **Auth required:** Yes

---

## Recipes

### `GET /api/recipes/catalog`
Paginated recipe catalog with filtering. Free users are capped at 50 recipes total; premium-only recipes are hidden from free/student users. Results are cached in Redis.

- **Auth required:** Yes
- **Query params:**

| Param | Type | Description |
|---|---|---|
| `search` | string | Full-text search |
| `meal_type` | string | `breakfast`, `lunch`, `dinner`, `snack` |
| `dietary_tags` | string | Comma-separated: `vegan,gluten-free` |
| `intolerances` | string | Comma-separated: `dairy,peanut` |
| `max_prep_time` | number | Max preparation time (minutes) |
| `min_calories` | number | Minimum calories per serving |
| `max_calories` | number | Maximum calories per serving |
| `max_price` | number | Max price per serving ($) |
| `max_servings` | number | Max number of servings |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 12, max: 50) |

- **Response:**
```json
{
  "recipes": [
    {
      "id": "uuid",
      "title": "Pâtes carbonara",
      "image_url": "https://...",
      "prep_time": 20,
      "calories": 450,
      "protein": 22,
      "carbs": 55,
      "fat": 18,
      "price_per_serving": 3.50,
      "dietary_tags": ["gluten-free"],
      "meal_type": "dinner",
      "servings": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 245,
    "totalPages": 21
  },
  "plan_limited": false
}
```

### `GET /api/recipes/catalog/[id]`
Fetch a single recipe by ID (includes ingredients and instructions).

- **Auth required:** Yes
- **Response:** Full recipe object with `ingredients` and `instructions` arrays

### `GET /api/recipes/user`
Fetch all recipes created by the authenticated user.

- **Auth required:** Yes
- **Response:** `{ "recipes": UserRecipe[] }`

### `POST /api/recipes/user`
Create a new personal recipe.

- **Auth required:** Yes
- **Body:**
```json
{
  "title": "Ma recette",
  "image_url": "https://...",
  "prep_time": 30,
  "servings": 4,
  "calories": 400,
  "protein": 25,
  "carbs": 40,
  "fat": 15,
  "price_per_serving": 4.00,
  "ingredients": ["200g pâtes", "2 œufs"],
  "instructions": ["Faire bouillir l'eau", "..."],
  "dietary_tags": ["vegetarian"]
}
```
- **Response `201`:** `{ "recipe": UserRecipe }`

### `GET /api/recipes/user/[id]`
Fetch a single user-created recipe.

### `PATCH /api/recipes/user/[id]`
Update a user-created recipe.

### `DELETE /api/recipes/user/[id]`
Delete a user-created recipe.

---

## Meal Plans

### `POST /api/meal-plan/generate`
Generate an AI-powered weekly meal plan. Enforces monthly generation limits (5 for free, unlimited for paid). Rate-limited per user.

- **Auth required:** Yes
- **Plan limit:** 5/month (free), unlimited (student/premium)
- **Body:**
```json
{
  "days": 7,
  "mealsPerDay": 3,
  "budget": 50,
  "dietaryRestrictions": ["vegetarian"],
  "allergies": ["peanuts"],
  "calorieTarget": 2000,
  "weekOffset": 0
}
```
- **Response:**
```json
{
  "mealPlan": {
    "id": "uuid",
    "week_start_date": "2025-01-06",
    "week_end_date": "2025-01-12",
    "meals": { "monday": { "breakfast": {...}, "lunch": {...}, "dinner": {...} } },
    "total_calories": 14200,
    "total_cost": 47.80,
    "days_count": 7,
    "meals_per_day": 3
  },
  "usage": { "count": 3, "limit": 5 }
}
```
- **Errors:** `429` (monthly limit reached), `402` (plan required)

### `GET /api/meal-plan/[id]`
Fetch a single meal plan by ID (must belong to authenticated user).

- **Auth required:** Yes
- **Response:** `{ "plan": MealPlan }`

### `DELETE /api/meal-plan/[id]`
Delete a meal plan.

- **Auth required:** Yes
- **Response:** `{ "success": true }`

### `GET /api/meal-plan/current`
Fetch the active meal plan for the current week. Cached in Redis.

- **Auth required:** Yes
- **Response:** `{ "plan": MealPlan | null }`

### `POST /api/meal-plan/repeat`
Clone an existing meal plan to a different week.

- **Auth required:** Yes
- **Body:** `{ "plan_id": "uuid", "target_week_offset": 1 }`
- **Response:** `{ "plan": MealPlan }`
- **Errors:** `409` (plan already exists for target week)

### `GET /api/meal-plan/config`
Fetch available meal plan configuration options (days, meals per day). 4-week planning requires premium.

- **Auth required:** Yes
- **Response:**
```json
{
  "availableDays": [5, 7],
  "availableMealsPerDay": [1, 2, 3],
  "maxWeeks": 1
}
```

### `GET /api/meal-plan/history`
Fetch all past meal plans for the user.

- **Auth required:** Yes
- **Response:** `{ "plans": MealPlan[] }`

### `GET /api/meal-plan/usage`
Fetch the user's current month meal plan generation count.

- **Auth required:** Yes
- **Response:** `{ "count": 3, "limit": 5, "reset_date": "2025-02-01" }`

### `POST /api/meal-plan/regenerate-slot`
Regenerate a single meal slot in an existing plan.

- **Auth required:** Yes
- **Body:** `{ "planId": "uuid", "day": "monday", "mealType": "lunch" }`
- **Response:** `{ "meal": MealSlot, "plan": MealPlan }`

---

## Shopping Lists

### `GET /api/shopping-lists`
Fetch all shopping lists for the user, or filter by meal plan.

- **Auth required:** Yes
- **Query params:** `?mealPlanId=uuid` (optional)
- **Response:** `{ "lists": ShoppingList[] }` or single `ShoppingList` when filtered

### `POST /api/shopping-lists`
Create a new shopping list manually.

- **Auth required:** Yes
- **Body:**
```json
{
  "mealPlanId": "uuid",
  "items": [
    { "name": "Pâtes", "quantity": 500, "unit": "g", "price": 1.50, "aisle": "Pâtes & riz" }
  ]
}
```

### `POST /api/shopping-lists/generate`
Generate an intelligent shopping list from a meal plan. Free users get a flat list; student/premium users get an aisle-organized list with store suggestions.

- **Auth required:** Yes
- **Body:** `{ "mealPlanId": "uuid" }`
- **Response:** `ShoppingList` with organized `items` array

### `POST /api/shopping-lists/[id]/items`
Add a custom item to an existing shopping list.

- **Auth required:** Yes
- **Body:** `{ "itemName": "string", "aisle": "string" }`
- **Response:** Updated `ShoppingList`

### `DELETE /api/shopping-lists/[id]/items`
Delete a custom item by index.

- **Auth required:** Yes
- **Body:** `{ "itemIndex": 0 }`

### `PATCH /api/shopping-lists/[id]/items`
Toggle an item's checked state. Automatically marks the list as completed when all items are checked.

- **Auth required:** Yes
- **Body:** `{ "itemIndex": 0, "checked": true }`
- **Response:** Updated `ShoppingList`

---

## Favorites

### `GET /api/favorites`
Fetch the user's favorite recipes.

- **Auth required:** Yes
- **Response:** `Recipe[]`

### `POST /api/favorites`
Add a recipe to favorites. Free users are limited to 10.

- **Auth required:** Yes
- **Body:** `{ "recipeId": "uuid" }`
- **Errors:** `403` (limit reached for free plan)

### `DELETE /api/favorites`
Remove a recipe from favorites.

- **Auth required:** Yes
- **Body:** `{ "recipeId": "uuid" }`

---

## Nutritionist IA (Premium)

### `GET /api/nutritionist/sessions`
List all chat sessions for the user.

- **Auth required:** Yes
- **Plan required:** Premium
- **Response:** `{ "sessions": ChatSession[] }`

### `POST /api/nutritionist/sessions`
Create a new chat session (auto-titled after first message).

- **Auth required:** Yes
- **Plan required:** Premium
- **Response:** `{ "session": ChatSession }`

### `GET /api/nutritionist/sessions/[id]`
Fetch a session with all its messages.

- **Auth required:** Yes
- **Response:** `{ "session": ChatSession, "messages": Message[] }`

### `DELETE /api/nutritionist/sessions/[id]`
Delete a chat session and all its messages.

- **Auth required:** Yes
- **Response:** `{ "success": true }`

### `POST /api/nutritionist`
Send a message to the AI nutritionist. Only responds to nutrition/fitness questions.

- **Auth required:** Yes
- **Plan required:** Premium
- **Body:**
```json
{
  "message": "Combien de protéines dois-je manger?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "session_id": "uuid"
}
```
- **Response:**
```json
{ "reply": "Pour votre profil, je recommande...", "session_id": "uuid" }
```

---

## Family (Premium)

### `GET /api/family`
List all family members.

- **Auth required:** Yes
- **Plan required:** Premium
- **Response:** `FamilyMember[]` (max 4)

### `POST /api/family`
Add a new family member.

- **Auth required:** Yes
- **Plan required:** Premium
- **Body:**
```json
{
  "name": "Sophie",
  "dietary_restrictions": ["vegetarian"],
  "allergies": ["peanuts"]
}
```
- **Response `201`:** `FamilyMember`
- **Errors:** `403` (max 4 members reached)

### `DELETE /api/family`
Remove a family member.

- **Auth required:** Yes
- **Body:** `{ "id": "uuid" }`

---

## Calendar (Premium)

### `GET /api/calendar/export`
Export a meal plan as an `.ics` calendar file (importable into Google Calendar, Apple Calendar, etc.).

- **Auth required:** Yes
- **Plan required:** Premium
- **Query params:** `?planId=uuid`
- **Response:** `text/calendar` file download

---

## Stripe & Billing

### `POST /api/stripe/checkout`
Create a Stripe Checkout session for upgrading to a paid plan.

- **Auth required:** Yes
- **Body:** `{ "plan": "student" | "premium", "successUrl": "string", "cancelUrl": "string" }`
- **Response:** `{ "url": "https://checkout.stripe.com/..." }`

### `POST /api/stripe/portal`
Create a Stripe Customer Portal session (manage subscription, update payment method, cancel).

- **Auth required:** Yes
- **Requires:** Active Stripe customer
- **Response:** `{ "url": "https://billing.stripe.com/..." }`

### `POST /api/stripe/webhook`
Stripe webhook handler. Verifies signature and processes subscription lifecycle events.

- **Auth required:** No (Stripe signature verification)
- **Events handled:**
  - `customer.subscription.created` → sets user plan in Supabase
  - `customer.subscription.updated` → updates plan and status
  - `customer.subscription.deleted` → reverts to free plan
  - `checkout.session.completed` → links Stripe customer to user

### `POST /api/stripe/cancel-subscription`
Cancel the user's active subscription immediately.

- **Auth required:** Yes

---

## Profiles & Onboarding

### `POST /api/profiles/onboarding`
Save the user's onboarding data (called after signup wizard).

- **Auth required:** Yes
- **Body:**
```json
{
  "dietary_restrictions": ["vegetarian"],
  "allergies": ["dairy"],
  "budget_per_week": 60,
  "activity_level": "moderate",
  "goal": "lose_weight",
  "weight_kg": 70,
  "height_cm": 172,
  "age": 22,
  "gender": "female"
}
```
- **Response:** `{ "message": "Profil complété" }`

### `GET /api/profiles/onboarding-status`
Check whether the user has completed onboarding (used to redirect new users).

- **Auth required:** Yes
- **Response:** `{ "completed": boolean }`

### `GET /api/saved-recipes`
Fetch the user's saved recipes (different from favorites — includes personal notes and cook count).

- **Auth required:** Yes
- **Response:** `{ "recipes": SavedRecipe[] }`

### `GET /api/stores/nearby`
Find nearby grocery stores (uses geolocation).

- **Auth required:** Yes
- **Query params:** `?lat=45.5&lng=-73.5`

---

## Error Responses

All routes use consistent error responses:

```json
{ "error": "Error message in French or English" }
```

| HTTP Status | Meaning |
|---|---|
| `400` | Bad request / validation error |
| `401` | Not authenticated |
| `402` | Payment required (plan upgrade needed) |
| `403` | Forbidden (plan limit or wrong ownership) |
| `404` | Resource not found |
| `409` | Conflict (duplicate resource) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |
