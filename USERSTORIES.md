# MealMatch - User Stories

**Projet:** MealMatch - Planificateur de repas santé pour étudiants  
**Équipe:** Coding Kitchen  
**Durée:** 7,5 semaines (5 sprints)  
**Méthodologie:** Scrum / Agile

---

## Table des matières

1. [Must Have (Priority 1)](#must-have-priority-1)
2. [Should Have (Priority 2)](#should-have-priority-2)
3. [Could Have (Priority 3)](#could-have-priority-3)
4. [Récapitulatif](#récapitulatif)

---

## Must Have (Priority 1)

### US1: Créer un compte avec restrictions alimentaires

**En tant qu'utilisateur, je veux créer un compte avec mes restrictions alimentaires afin de recevoir des recommandations personnalisées**

**Priorité:** Must Have (P1) | **Estimation:** 5 points | **Sprint:** 1

#### Critères d'acceptation

1. **Inscription complète**
   - L'utilisateur peut s'inscrire avec email et mot de passe
   - Le système envoie un email de confirmation
   - L'utilisateur peut se connecter après vérification

2. **Onboarding - Restrictions alimentaires**
   - L'utilisateur sélectionne restrictions (Végétarien, Végan, Sans gluten, Sans lactose, Halal, Casher, Pescatarien)
   - Multiple selections possibles
   - L'utilisateur peut spécifier allergies textuelles

3. **Persistance**
   - Restrictions sauvegardées dans profil Supabase
   - Utilisées automatiquement pour filtrer recettes futures

#### Notes techniques

- Auth: Supabase Auth | Table: `profiles` (dietary_restrictions, allergies) | UI: HeroUI CheckboxGroup + Textarea

---

### US2: Définir budget hebdomadaire

**En tant qu'utilisateur, je veux définir mon budget hebdomadaire afin d'avoir des plans de repas abordables**

**Priorité:** Must Have (P1) | **Estimation:** 3 points | **Sprint:** 1

#### Critères d'acceptation

1. **Saisie du budget**
   - Budget min/max par semaine (20$ - 200$ USD)
   - Interface: dual-range slider

2. **Validation**
   - budget_min < budget_max
   - Messages d'erreur clairs

3. **Modification**
   - Modifiable dans Settings à tout moment

#### Notes techniques

- Table: `profiles` (budget_min, budget_max) | UI: HeroUI Slider (dual range) | Validation: Zod

---

### US3: Générer plan de repas hebdomadaire

**En tant qu'utilisateur, je veux générer un plan de repas hebdomadaire afin de planifier mes repas**

**Priorité:** Must Have (P1) | **Estimation:** 8 points | **Sprint:** 3

#### Critères d'acceptation

1. **Génération avec Spoonacular**
   - Préférences: diet type, target calories, excluded ingredients
   - Plan pour 7 jours × 3 repas = 21 recettes
   - Généré en <5 secondes avec loading state

2. **Respect contraintes**
   - Budget respecté (±10% tolérance)
   - Restrictions alimentaires respectées
   - Calories cibles atteintes (±150 cal/jour)
   - Recettes variées

3. **Affichage**
   - Vue calendrier hebdomadaire avec date-fns (7 colonnes)
   - Chaque repas: image, titre, temps, calories
   - Total calories par jour et semaine
   - Coût estimé total

#### Notes techniques

- API: Spoonacular `/mealplanner/generate` | Table: `meal_plans` (meals JSONB) | UI: Grid responsive, HeroUI Skeleton | Date: date-fns

---

### US4: Voir recettes avec temps de préparation

**En tant qu'utilisateur, je veux voir les recettes avec temps de préparation afin de choisir des options rapides**

**Priorité:** Must Have (P1) | **Estimation:** 5 points | **Sprint:** 2

#### Critères d'acceptation

1. **Affichage temps**
   - HeroUI Chip avec icône horloge + "15 min"
2. **Filtrage**
   - HeroUI Switch "Recettes rapides" (<30 min)
   - Temps réel sans rechargement

3. **Tri**
   - HeroUI Select: Croissant/Décroissant
   - Combinable avec autres filtres

#### Notes techniques

- API: Spoonacular `/recipes/complexSearch?maxReadyTime=30` | State: Zustand | UI: HeroUI Switch, Select, Chip

---

### US5: Obtenir liste d'épicerie automatique

**En tant qu'utilisateur, je veux obtenir une liste d'épicerie automatique afin de faire mes courses efficacement**

**Priorité:** Must Have (P1) | **Estimation:** 8 points | **Sprint:** 4

#### Critères d'acceptation

1. **Génération automatique**
   - Via Spoonacular `/recipes/informationBulk`
   - Agrégation intelligente des ingrédients
   - Organisation par rayon (Produce, Meat, Dairy, Bakery, Pantry)

2. **Interface interactive**
   - HeroUI Accordion par rayon (collapsible)
   - Checkboxes persistées dans Supabase
   - Barre progression (% cochés)
   - Ajout items custom possible

3. **Coût et export**
   - Coût total estimé affiché
   - Export PDF (optionnel)
   - Félicitations si 100% coché

#### Notes techniques

- API: Spoonacular `/recipes/informationBulk` | Table: `shopping_lists` (items JSONB) | UI: HeroUI Accordion, CheckboxGroup, Progress

---

### US6: Voir informations nutritionnelles

**En tant qu'utilisateur, je veux voir les informations nutritionnelles afin de suivre mes calories**

**Priorité:** Must Have (P1) | **Estimation:** 5 points | **Sprint:** 2

#### Critères d'acceptation

1. **Sur recipe cards**
   - HeroUI Badge "450 cal" visible

2. **Page détail**
   - HeroUI Table: Calories, Protéines, Glucides, Lipides, Fibres, Sodium
   - Par portion

3. **Dans meal plan**
   - Total calories par jour et semaine
   - Graphique ligne (optionnel, Recharts)

#### Notes techniques

- Data: Spoonacular nutrition | UI: HeroUI Table, Badge | Charts: Recharts (optionnel)

---

### US13: Souscrire au plan Premium

**En tant qu'utilisateur gratuit, je veux souscrire au plan premium afin d'accéder à des fonctionnalités avancées illimitées**

**Priorité:** Must Have (P1) | **Estimation:** 13 points | **Sprint:** 4

#### Critères d'acceptation

1. **Page Pricing**
   - Comparaison Free vs Premium (HeroUI Cards)
   - Free: $0, 2 meal plans/mois, 50 recettes, 1 shopping list
   - Premium: $4.99/mois ou $49.99/an, unlimited tout, macros, meal prep, PDF, support
   - Toggle Monthly/Yearly avec badge "Save 17%"

2. **Checkout Stripe**
   - Bouton "Upgrade to Premium" (HeroUI Button color="warning")
   - Création Checkout Session (mode 'subscription')
   - Redirect Stripe hosted page
   - Après paiement: redirect `/success`

3. **Activation automatique**
   - Webhook `checkout.session.completed`
   - Profil: `is_premium = true`, `premium_since = NOW()`
   - Badge "Premium" avec Crown (HeroUI Chip) sur navbar
   - Features débloquées immédiatement

#### Notes techniques

- SDK: stripe, @stripe/stripe-js | Produit: "MealMatch Premium" | Prix: $4.99/$49.99 | Webhooks: `/api/webhooks/stripe` | DB: colonnes stripe_customer_id, is_premium, premium_since

---

### US14: Gérer mon abonnement

**En tant qu'utilisateur premium, je veux gérer mon abonnement afin de modifier mon paiement, voir factures ou annuler**

**Priorité:** Must Have (P1) | **Estimation:** 8 points | **Sprint:** 5

#### Critères d'acceptation

1. **Section Settings**
   - Si Free: Badge + bouton "Upgrade to Premium"
   - Si Premium: Badge status, date "Premium since", bouton "Manage Subscription"
   - Si canceled: Banner warning avec date expiration

2. **Stripe Customer Portal**
   - Portal Session créée
   - Redirect Portal hosted page
   - Permet: view invoices, update payment, cancel, change billing

3. **Gestion changements**
   - Cancel: grace period jusqu'à fin période
   - Status "canceled" mais `is_premium = true` jusqu'à expiration
   - Webhook désactive premium après expiration

#### Notes techniques

- API: `/api/billing/create-portal-session` | Portal: configuré Dashboard Stripe | Webhooks: customer.subscription.updated/deleted | Date: date-fns

---

### US15: Restrictions pour utilisateurs gratuits

**En tant que système, je veux restreindre l'accès aux features premium afin de protéger la monétisation**

**Priorité:** Must Have (P1) | **Estimation:** 5 points | **Sprint:** 4-5

#### Critères d'acceptation

1. **Limitation meal plans**
   - Free: max 2 meal plans/mois
   - Table `meal_plan_usage` track count
   - 3ème attempt: HeroUI Modal paywall
   - Compteur: "1/2 meal plans used" (HeroUI Progress)
   - Reset automatique 1er du mois

2. **Paywall Modal**
   - HeroUI Modal avec Chip "Premium Feature" + Crown
   - Titre: "Unlock Unlimited Meal Plans"
   - Liste benefits avec checkmarks
   - Prix: "$4.99/month"
   - Boutons: "Maybe Later" / "Upgrade to Premium"

3. **Access Control**
   - Macros tracking: Premium only
   - PDF export: Premium only
   - Meal prep guides: Premium only
   - Recettes premium: Premium only
   - Multiple shopping lists: Premium only (Free = 1 max)
   - Middleware vérifie `is_premium`

#### Notes techniques

- Table: meal_plan_usage (user_id, month_year, count) | Components: PaywallModal, UsageIndicator | Date: date-fns

---

## Should Have (Priority 2)

### US7: Sauvegarder recettes favorites

**En tant qu'utilisateur, je veux sauvegarder mes recettes favorites afin d'y accéder rapidement**

**Priorité:** Should Have (P2) | **Estimation:** 3 points | **Sprint:** 2

#### Critères d'acceptation

1. Bouton cœur (HeroUI Button isIconOnly) marque/démarque favori avec animation
2. Page "Mes Favoris" affiche grid de favoris, tri par date
3. Synchronisation entre sessions (persisté DB)

#### Notes techniques

- Table: user_favorites | API: POST/DELETE `/api/favorites` | UI: HeroUI Button, TanStack Query

---

### US8: Filtrer par type alimentaire

**En tant qu'utilisateur, je veux filtrer par type (végétarien, sans gluten) afin de respecter mon régime**

**Priorité:** Should Have (P2) | **Estimation:** 3 points | **Sprint:** 2

#### Critères d'acceptation

1. HeroUI CheckboxGroup: Végétarien, Végan, Sans gluten, Lactose, Pescatarien, Paléo, Cétogène
2. Résultats affichés avec HeroUI Chip count
3. HeroUI Chips actifs avec onClose + bouton "Réinitialiser"

#### Notes techniques

- API: Spoonacular `?diet=vegetarian,gluten-free` | State: Zustand | UI: HeroUI CheckboxGroup, Chip

---

### US9: Voir vidéos de recettes

**En tant qu'utilisateur, je veux voir des vidéos de recettes afin de mieux comprendre la préparation**

**Priorité:** Should Have (P2) | **Estimation:** 3 points | **Sprint:** 5

#### Critères d'acceptation

1. Badge "Vidéo" (HeroUI Chip) avec icône play
2. Lecteur YouTube embedded (react-youtube), responsive 16:9
3. Contrôles natifs YouTube (play, pause, seek, volume, fullscreen)

#### Notes techniques

- Data: video_url Spoonacular | Library: react-youtube | UI: HeroUI Chip

---

### US10: Partager recettes avec amis

**En tant qu'utilisateur, je veux partager des recettes avec des amis afin de découvrir de nouvelles idées**

**Priorité:** Should Have (P2) | **Estimation:** 5 points | **Sprint:** 5

#### Critères d'acceptation

1. Bouton "Partager" (HeroUI Button) ouvre menu ou Web Share API
2. Lien public `/recipes/[id]/share` accessible sans auth, affiche infos essentielles
3. Confirmation HeroUI toast "Lien copié!"

#### Notes techniques

- Web Share API: navigator.share() | Route: /app/(public)/recipes/[id]/share | Library: react-share | Toast: HeroUI/sonner

---

### US16: Recettes Premium exclusives

**En tant qu'utilisateur premium, je veux accéder à des recettes exclusives afin de bénéficier de plus de variété**

**Priorité:** Should Have (P2) | **Estimation:** 5 points | **Sprint:** 5

#### Critères d'acceptation

1. Badge "Premium" (HeroUI Chip color="warning" + Crown) sur recettes `is_premium = true`
2. Free: lock overlay + click → Paywall | Premium: accès normal
3. Script seed 150+ recettes premium (High-protein >30g, Gourmet, Meal prep, Quick <15min, International)

#### Notes techniques

- DB: is_premium BOOLEAN | Spoonacular: critères spécifiques (minProtein, cuisine, etc.) | UI: HeroUI Chip, Modal

---

## Could Have (Priority 3)

### US11: Suggestions de meal prep

**En tant qu'utilisateur, je veux des suggestions de meal prep afin d'économiser du temps**

**Priorité:** Could Have (P3) | **Estimation:** 5 points | **Sprint:** 5 (si temps)

#### Critères d'acceptation

1. Tag "Meal Prep Friendly" (HeroUI Chip) identifié auto
2. Page/section "Meal Prep Guide" avec conseils (recettes, jour, conservation, réchauffage)
3. Calendrier meal plan: indication visuelle recettes prep-able + temps total

#### Notes techniques

- Data: mealPrepFriendly tag | Algorithm: prep_time <60min et servings ≥4 | UI: HeroUI Chip

---

### US12: Suivre macronutriments (PREMIUM)

**En tant qu'utilisateur premium, je veux suivre mes macronutriments afin d'atteindre mes objectifs fitness**

**Priorité:** Could Have (P3) | **Estimation:** 5 points | **Sprint:** 4-5 (Premium)

#### Critères d'acceptation

1. Settings: définir objectifs macros avec presets (Équilibré, High Protein, Low Carb, Custom)
2. Dashboard: 3 graphiques circulaires (Recharts) consommé vs objectif, couleurs vert/orange/rouge
3. HeroUI Progress bars + suggestions déséquilibre + historique 7/14/30 jours

#### Notes techniques

- Table: profiles (protein_goal, carbs_goal, fats_goal) | Charts: Recharts | Data: Spoonacular | UI: HeroUI Progress, Card

---

## Récapitulatif

### Par priorité

| Priorité             | User Stories   | Total Points  | Sprints      |
| -------------------- | -------------- | ------------- | ------------ |
| **Must Have (P1)**   | US1-6, US13-15 | 47 points     | Sprints 1-5  |
| **Should Have (P2)** | US7-10, US16   | 19 points     | Sprints 2, 5 |
| **Could Have (P3)**  | US11-12        | 10 points     | Sprint 4-5   |
| **TOTAL**            | **16 stories** | **76 points** | 5 sprints    |

### Par sprint

| Sprint       | Semaine   | User Stories                         | Points | % Projet |
| ------------ | --------- | ------------------------------------ | ------ | -------- |
| **Sprint 1** | Semaine 2 | US1, US2 + setup                     | 21     | 15%      |
| **Sprint 2** | Semaine 3 | US4, US6, US7, US8                   | 24     | 30%      |
| **Sprint 3** | Semaine 4 | US3 (meal plans)                     | 26     | 45%      |
| **Sprint 4** | Semaine 5 | US5, US13, US15, (US12)              | 40     | 70%      |
| **Sprint 5** | Semaine 6 | US9, US10, US11, US14, US16          | 33     | 95%      |
| **Sprint 6** | Semaine 7 | Bug fixes, déploiement, présentation | -      | 100%     |

### Features Premium

| Feature                | Free Plan | Premium Plan |
| ---------------------- | --------- | ------------ |
| Meal plans/mois        | 2         | Unlimited    |
| Recettes               | 50        | 500+         |
| Shopping lists actives | 1         | Unlimited    |
| Nutrition tracking     | Basique   | Avancé       |
| Macros tracking        | ❌        | ✅           |
| Meal prep guides       | ❌        | ✅           |
| PDF Export             | ❌        | ✅           |
| Recettes premium       | ❌        | ✅           |
| Priority support       | ❌        | ✅           |

### Pricing

- **Monthly:** $4.99/mois
- **Yearly:** $49.99/an (17% discount)

---

## Technologies

### Stack Principal

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, HeroUI
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **State:** Zustand (client), TanStack Query (server)
- **API:** Spoonacular (meal planning, recipes)
- **Payments:** Stripe (subscriptions)
- **Date:** date-fns
- **Charts:** Recharts
- **Deployment:** Vercel + Supabase Cloud

### Database Schema (principal)

- **profiles:** dietary_restrictions[], allergies[], budget_min/max, stripe_customer_id, is_premium, premium_since
- **saved_recipes:** title, image, prep_time, calories, nutrition, is_premium
- **meal_plans:** user_id, week_start_date, meals JSONB, total_calories
- **shopping_lists:** meal_plan_id, items JSONB, total_cost
- **user_favorites:** user_id, recipe_id
- **meal_plan_usage:** user_id, month_year, count

### Stripe

- **SDK:** stripe, @stripe/stripe-js
- **Webhooks:** checkout.session.completed, customer.subscription.updated/deleted
- **Test Cards:** 4242 4242 4242 4242 (success), 4000 0000 0000 0002 (decline)

---

## Definition of Done

Une user story est **"Done"** si:

- ✅ Critères d'acceptation validés
- ✅ Code testé et reviewé
- ✅ PR mergée dans `main`
- ✅ Déployé sur Vercel
- ✅ Tests manuels passés
- ✅ Documentation mise à jour

---

## Contacts

- **Scrum Master:** Rima Nafougui
- **Developers:** Jimmy Chhan, Charly Smith Alcide, Julien Guibord
- **Repository:** https://github.com/Mercuryy200/MealMatch
- **GitHub Projects:** https://github.com/users/Mercuryy200/projects/7

---

**Document créé le:** 30-01-2026  
**Version:** 2.0 (Final)
