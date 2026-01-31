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

Ces user stories sont **essentielles** au fonctionnement de l'application. Elles constituent le MVP (Minimum Viable Product).

---

### US1: Créer un compte avec restrictions alimentaires

**En tant qu'utilisateur, je veux créer un compte avec mes restrictions alimentaires afin de recevoir des recommandations personnalisées**

**Priorité:** Must Have (P1)  
**Estimation:** 5 points  
**Sprint:** Sprint 1

#### Critères d'acceptation

1. **Inscription complète**
   - L'utilisateur peut s'inscrire avec email et mot de passe
   - Le système envoie un email de confirmation
   - L'utilisateur peut se connecter après vérification de l'email

2. **Onboarding - Restrictions alimentaires**
   - Durant l'onboarding, l'utilisateur peut sélectionner ses restrictions alimentaires parmi une liste prédéfinie (Végétarien, Végan, Sans gluten, Sans lactose, Halal, Casher, Pescatarien)
   - Multiple selections sont possibles
   - L'utilisateur peut aussi spécifier des allergies textuelles

3. **Persistance et utilisation**
   - Les restrictions alimentaires sélectionnées sont sauvegardées dans le profil Supabase
   - Ces restrictions sont automatiquement utilisées pour filtrer les recettes futures
   - L'utilisateur peut voir ses restrictions sur sa page de profil

#### Notes techniques

- Auth: Supabase Auth (email/password)
- Table: `profiles` avec colonnes `dietary_restrictions` (TEXT[]) et `allergies` (TEXT[])
- UI: HeroUI CheckboxGroup + Textarea

#### Definition of Done

- [ ] Code écrit et testé
- [ ] PR reviewée et mergée
- [ ] Tests d'inscription fonctionnent
- [ ] Onboarding flow complet
- [ ] Données sauvegardées dans Supabase
- [ ] Documentation mise à jour

---

### US2: Définir budget hebdomadaire

**En tant qu'utilisateur, je veux définir mon budget hebdomadaire afin d'avoir des plans de repas abordables**

**Priorité:** Must Have (P1)  
**Estimation:** 3 points  
**Sprint:** Sprint 1

#### Critères d'acceptation

1. **Saisie du budget**
   - L'utilisateur peut définir un budget minimum et maximum par semaine (en CAD)
   - Interface: dual-range slider
   - Range autorisé: 20$ - 200$ par semaine

2. **Validation et sauvegarde**
   - Le système valide que budget_min < budget_max
   - Messages d'erreur clairs si validation échoue
   - Budget sauvegardé dans le profil Supabase

3. **Modification ultérieure**
   - L'utilisateur peut modifier son budget à tout moment depuis Settings
   - Les modifications sont prises en compte pour les prochains meal plans

#### Notes techniques

- Table: `profiles` avec colonnes `budget_min` et `budget_max` (DECIMAL)
- UI: HeroUI Slider component (dual range)
- Validation: Zod schema

#### Definition of Done

- [ ] Slider fonctionne correctement
- [ ] Validation des limites implémentée
- [ ] Budget sauvegardé dans DB
- [ ] Page Settings permet modification

---

### US3: Générer plan de repas hebdomadaire

**En tant qu'utilisateur, je veux générer un plan de repas hebdomadaire afin de planifier mes repas**

**Priorité:** Must Have (P1)  
**Estimation:** 8 points  
**Sprint:** Sprint 3

#### Critères d'acceptation

1. **Génération avec Spoonacular API**
   - L'utilisateur peut spécifier ses préférences (diet type, target calories, excluded ingredients)
   - Clic sur bouton "Générer Plan Hebdomadaire"
   - Le système appelle Spoonacular `/mealplanner/generate` API
   - Un plan pour 7 jours (3 repas/jour = 21 recettes) est généré en moins de 5 secondes
   - Loading state élégant pendant génération

2. **Respect des contraintes**
   - Le plan respecte le budget défini (±10% de tolérance)
   - Le plan respecte les restrictions alimentaires du profil
   - Le plan atteint approximativement les calories cibles (±150 cal/jour)
   - Les recettes sont variées (pas de répétitions excessives)

3. **Affichage et détails**
   - Vue calendrier hebdomadaire claire avec date-fns (7 colonnes pour 7 jours)
   - Chaque repas affiche: image, titre cliquable, temps de préparation, calories
   - Total calories affiché par jour
   - Coût estimé total du plan affiché
   - L'utilisateur peut cliquer sur une recette pour voir ses détails complets

#### Notes techniques

- API: Spoonacular `/mealplanner/generate?timeFrame=week&targetCalories=X&diet=Y`
- Table: `meal_plans` avec colonne `meals` (JSONB)
- UI: Grid layout responsive, HeroUI Skeleton loading
- Date utilities: date-fns pour formatage dates
- Cache: Sauvegarder recettes dans `saved_recipes` pour réduire API calls

#### Definition of Done

- [ ] Spoonacular API intégrée
- [ ] Form de préférences fonctionne
- [ ] Génération retourne 21 recettes
- [ ] Vue calendrier affiche correctement
- [ ] Respect budget et restrictions validé
- [ ] Plan sauvegardé dans Supabase
- [ ] Tests manuels passés

---

### US4: Voir recettes avec temps de préparation

**En tant qu'utilisateur, je veux voir les recettes avec temps de préparation afin de choisir des options rapides**

**Priorité:** Must Have (P1)  
**Estimation:** 5 points  
**Sprint:** Sprint 2

#### Critères d'acceptation

1. **Affichage du temps**
   - Chaque recipe card affiche clairement le temps de préparation en minutes
   - Format: HeroUI Chip avec icône horloge + "15 min"
   - Temps visible sans avoir à cliquer sur la recette

2. **Filtrage par temps**
   - L'utilisateur peut activer un filtre "Recettes rapides" (<30 min) avec HeroUI Switch
   - Le filtre s'applique immédiatement (sans recharger la page)
   - Le nombre de résultats filtrés est affiché

3. **Tri par temps**
   - L'utilisateur peut trier les recettes par temps de préparation (HeroUI Select dropdown)
   - Croissant (les plus rapides en premier) ou Décroissant
   - Le tri persiste pendant la session
   - Le tri est combinable avec d'autres filtres

#### Notes techniques

- API: Spoonacular `/recipes/complexSearch?maxReadyTime=30`
- State: Zustand store pour filtres actifs
- UI: HeroUI Switch, Select, Chip

#### Definition of Done

- [ ] Temps affiché sur toutes les recipe cards
- [ ] Filtre <30 min fonctionne
- [ ] Tri croissant/décroissant implémenté
- [ ] Filtres combinables
- [ ] UI responsive

---

### US5: Obtenir liste d'épicerie automatique

**En tant qu'utilisateur, je veux obtenir une liste d'épicerie automatique afin de faire mes courses efficacement**

**Priorité:** Must Have (P1)  
**Estimation:** 8 points  
**Sprint:** Sprint 4

#### Critères d'acceptation

1. **Génération automatique via Spoonacular**
   - Lorsqu'un meal plan est sauvegardé, une shopping list est générée automatiquement
   - Le système extrait tous les ingrédients via Spoonacular `/recipes/informationBulk`
   - Les ingrédients similaires sont agrégés intelligemment
   - La liste est organisée par rayon (Produce, Meat, Dairy, Bakery, Pantry)

2. **Interface interactive**
   - L'utilisateur voit la liste groupée par rayon (HeroUI Accordion collapsible)
   - Chaque item a une checkbox pour marquer "acheté"
   - L'état des checkboxes est persisté dans Supabase
   - Une barre de progression affiche le % d'items cochés
   - L'utilisateur peut ajouter des items custom (hors meal plan)

3. **Coût et export**
   - Le système affiche le coût total estimé de la liste
   - Le coût est basé sur une database de prix moyens par ingrédient
   - L'utilisateur peut exporter la liste en PDF ou l'imprimer (optionnel)
   - Lorsque tous les items sont cochés, félicitations affichées

#### Notes techniques

- API: Spoonacular `/recipes/informationBulk?ids=123,456,789`
- Table: `shopping_lists` avec colonne `items` (JSONB)
- Algorithme: Fonction d'agrégation avec normalisation des unités
- UI: HeroUI Accordion, CheckboxGroup, Progress

#### Definition of Done

- [ ] Shopping list générée automatiquement
- [ ] Agrégation des ingrédients fonctionne
- [ ] Organisation par rayon implémentée
- [ ] Checkboxes persistées dans DB
- [ ] Barre de progression affichée
- [ ] Ajout d'items custom possible
- [ ] Coût total calculé et affiché

---

### US6: Voir informations nutritionnelles

**En tant qu'utilisateur, je veux voir les informations nutritionnelles afin de suivre mes calories**

**Priorité:** Must Have (P1)  
**Estimation:** 5 points  
**Sprint:** Sprint 2

#### Critères d'acceptation

1. **Sur les recipe cards**
   - Chaque recipe card affiche les calories totales de la recette
   - Format: HeroUI Badge "450 cal"
   - Visible sans cliquer sur la recette

2. **Page détail de recette**
   - La page détail affiche un tableau nutritionnel complet (HeroUI Table)
   - Calories (kcal), Protéines (g), Glucides (g), Lipides (g), Fibres (g), Sodium (mg)
   - Les valeurs sont affichées par portion
   - Le nombre de portions est indiqué

3. **Dans le meal plan**
   - Le plan de repas hebdomadaire affiche total calories par jour (somme des 3 repas)
   - Total calories pour la semaine
   - Moyenne calories par jour
   - Un graphique en ligne montre l'évolution des calories sur 7 jours (optionnel, Recharts)

#### Notes techniques

- Data: Nutrition data incluse dans Spoonacular API responses
- UI: HeroUI Table, Badge, Chip
- Charts: Recharts pour graphique (optionnel)

#### Definition of Done

- [ ] Calories affichées sur recipe cards
- [ ] Tableau nutritionnel complet sur page détail
- [ ] Total calories par jour dans meal plan
- [ ] Total hebdomadaire calculé
- [ ] Données Spoonacular correctement affichées

---

### US13: Souscrire au plan Premium

**En tant qu'utilisateur gratuit, je veux souscrire au plan premium afin d'accéder à des fonctionnalités avancées illimitées**

**Priorité:** Must Have (P1)  
**Estimation:** 13 points  
**Sprint:** Sprint 4

#### Critères d'acceptation

1. **Page Pricing et comparaison**
   - Une page `/pricing` affiche un tableau comparatif Free vs Premium (HeroUI Cards)
   - Plan Free: $0/mois, 2 meal plans/mois, 50 recettes, 1 shopping list, nutrition basique
   - Plan Premium: $4.99/mois ou $49.99/an, unlimited meal plans, 500+ recettes, macros tracking, meal prep guides, PDF export, priority support
   - Toggle Monthly/Yearly avec badge "Save 17%"
   - Design responsive

2. **Checkout Stripe**
   - Bouton "Upgrade to Premium" (HeroUI Button color="warning")
   - API call crée Checkout Session avec mode 'subscription'
   - Redirect vers Stripe Checkout hosted page
   - Utilisateur entre informations de paiement
   - Après paiement réussi, redirect vers `/success`

3. **Activation premium automatique**
   - Webhook Stripe écoute événement `checkout.session.completed`
   - Profil user mis à jour: `is_premium = true`, `premium_since = NOW()`
   - Badge "Premium" avec icône Crown (HeroUI Chip) affiché sur navbar
   - Toutes les features premium débloquées immédiatement
   - Page success affiche confirmation avec message de bienvenue

#### Notes techniques

- Stripe SDK: `stripe` et `@stripe/stripe-js`
- Produit Stripe: "MealMatch Premium"
- Prix: Monthly $4.99, Yearly $49.99
- Webhooks: `/api/webhooks/stripe` pour events
- Tables DB: ajouter colonnes `stripe_customer_id`, `stripe_subscription_id`, `is_premium`, `premium_since`, `subscription_status` à `profiles`

#### Definition of Done

- [ ] Page `/pricing` créée avec comparaison Free/Premium
- [ ] Toggle Monthly/Yearly fonctionne
- [ ] Stripe Checkout Session fonctionne
- [ ] Webhook handler traite événements Stripe
- [ ] User devient premium après paiement
- [ ] Badge Premium affiché sur navbar
- [ ] Testé avec cartes test Stripe
- [ ] Page `/success` créée avec confirmation

---

### US14: Gérer mon abonnement

**En tant qu'utilisateur premium, je veux gérer mon abonnement afin de pouvoir modifier mon paiement, voir mes factures ou annuler**

**Priorité:** Must Have (P1)  
**Estimation:** 8 points  
**Sprint:** Sprint 5

#### Critères d'acceptation

1. **Section Subscription dans Settings**
   - Page Settings affiche section "Subscription" (HeroUI Card)
   - Si Free: Badge "Free Plan" + bouton "Upgrade to Premium"
   - Si Premium: Badge status (Active/Canceling/Past Due), date "Premium since", bouton "Manage Subscription"
   - Si status = 'canceled': Banner warning avec date d'expiration

2. **Stripe Customer Portal**
   - Clic "Manage Subscription" crée Portal Session
   - Redirect vers Stripe Customer Portal hosted page
   - Portal permet: view invoices, update payment method, cancel subscription, change billing cycle
   - Return URL: `/settings` après actions

3. **Gestion des changements**
   - Si user cancel: grace period jusqu'à fin de période payée
   - Status devient "canceled" mais `is_premium` reste `true` jusqu'à expiration
   - Banner warning affiché
   - Après expiration: webhook désactive premium (`is_premium = false`)
   - User peut réactiver n'importe quand

#### Notes techniques

- API Route: `/api/billing/create-portal-session`
- Stripe Customer Portal configuré dans Dashboard Stripe
- Webhooks: `customer.subscription.updated`, `customer.subscription.deleted`
- Date formatting: date-fns pour afficher dates

#### Definition of Done

- [ ] Section "Subscription" créée dans Settings
- [ ] Affichage conditionnel Free vs Premium
- [ ] Portal Session créée et redirect OK
- [ ] Customer Portal permet cancel/update payment
- [ ] Grace period respectée après cancel
- [ ] Webhook désactive premium à expiration
- [ ] Banner warning affiché si canceling

---

### US15: Restrictions pour utilisateurs gratuits

**En tant que système, je veux restreindre l'accès aux features premium afin de protéger la monétisation**

**Priorité:** Must Have (P1)  
**Estimation:** 5 points  
**Sprint:** Sprint 4-5

#### Critères d'acceptation

1. **Limitation meal plans (Free users)**
   - Free users limités à 2 meal plans par mois
   - Table `meal_plan_usage` track le count par mois
   - Au 3ème attempt: HeroUI Modal paywall s'affiche
   - Compteur affiché: "1/2 meal plans used this month" (HeroUI Progress bar)
   - Reset automatique le 1er du mois

2. **Paywall Modal**
   - Design: HeroUI Modal avec Chip "Premium Feature" + icône Crown
   - Titre: "Unlock Unlimited Meal Plans"
   - Liste benefits Premium avec checkmarks
   - Prix: "Starting at $4.99/month"
   - Boutons: "Maybe Later" + "Upgrade to Premium"

3. **Access Control autres features**
   - Macros tracking (US12): Premium only
   - PDF export: Premium only
   - Meal prep guides avancés: Premium only
   - Recettes premium: Premium only (badge "Premium" sur cards)
   - Multiple shopping lists: Premium only (Free = 1 active max)
   - Middleware vérifie `is_premium` avant autoriser accès

#### Notes techniques

- Table: `meal_plan_usage` (user_id, month_year, count)
- Functions: `getMealPlanUsage`, `canGenerateMealPlan`
- Components: `<PaywallModal>`, `<UsageIndicator>`
- Date utilities: date-fns pour format month_year

#### Definition of Done

- [ ] Table `meal_plan_usage` créée
- [ ] Free users limités à 2 meal plans/mois
- [ ] Paywall modal s'affiche au 3ème attempt
- [ ] Compteur usage affiché
- [ ] Access control sur features premium
- [ ] Middleware protège routes premium
- [ ] Premium users ont meal plans illimités

---

## Should Have (Priority 2)

Ces user stories **améliorent significativement** l'expérience utilisateur mais ne sont pas critiques pour le MVP.

---

### US7: Sauvegarder recettes favorites

**En tant qu'utilisateur, je veux sauvegarder mes recettes favorites afin d'y accéder rapidement**

**Priorité:** Should Have (P2)  
**Estimation:** 3 points  
**Sprint:** Sprint 2

#### Critères d'acceptation

1. **Marquer comme favori**
   - Chaque recipe card et page détail a un bouton cœur (HeroUI Button isIconOnly)
   - Clic sur le cœur marque/démarque la recette comme favorite
   - Animation de feedback visuel au clic
   - L'état favori est persisté dans Supabase immédiatement

2. **Page Mes Favoris**
   - Un onglet "Mes Favoris" affiche toutes les recettes favorites
   - Layout identique à la page de recherche (grid de cards)
   - Tri par date d'ajout (les plus récents en premier)
   - Message affiché si aucun favori

3. **Synchronisation**
   - Les favoris sont synchronisés entre sessions
   - L'utilisateur peut retirer un favori depuis n'importe quelle page

#### Notes techniques

- Table: `user_favorites` (user_id, recipe_id, created_at)
- API Route: POST/DELETE `/api/favorites`
- UI: HeroUI Button isIconOnly, optimistic updates avec TanStack Query

#### Definition of Done

- [ ] Bouton cœur fonctionnel partout
- [ ] État persisté dans Supabase
- [ ] Page "Mes Favoris" créée
- [ ] Synchronisation entre sessions testée
- [ ] Optimistic updates implémentées

---

### US8: Filtrer par type alimentaire

**En tant qu'utilisateur, je veux filtrer par type (végétarien, sans gluten) afin de respecter mon régime**

**Priorité:** Should Have (P2)  
**Estimation:** 3 points  
**Sprint:** Sprint 2

#### Critères d'acceptation

1. **Filtres multiples**
   - L'utilisateur peut appliquer des filtres alimentaires (HeroUI CheckboxGroup)
   - Options: Végétarien, Végan, Sans gluten, Sans lactose, Pescatarien, Paléo, Cétogène
   - Les filtres s'appliquent en temps réel

2. **Indicateur de résultats**
   - Le nombre de résultats correspondants est affiché (HeroUI Chip)
   - Si 0 résultat, suggestion d'enlever des filtres

3. **Gestion des filtres actifs**
   - Les filtres actifs sont visuellement indiqués (HeroUI Chips avec onClose)
   - Bouton "Réinitialiser tous les filtres" disponible
   - Les filtres actifs persistent pendant la session (Zustand store)

#### Notes techniques

- API: Spoonacular `/recipes/complexSearch?diet=vegetarian,gluten-free`
- State: Zustand store pour filtres actifs
- UI: HeroUI CheckboxGroup, Chip

#### Definition of Done

- [ ] Checkboxes multiples fonctionnelles
- [ ] Filtres appliqués en temps réel
- [ ] Nombre de résultats affiché
- [ ] Chips pour filtres actifs
- [ ] Bouton réinitialiser fonctionne
- [ ] State persisté dans session

---

### US9: Voir vidéos de recettes

**En tant qu'utilisateur, je veux voir des vidéos de recettes afin de mieux comprendre la préparation**

**Priorité:** Should Have (P2)  
**Estimation:** 3 points  
**Sprint:** Sprint 5

#### Critères d'acceptation

1. **Indicateur de vidéo disponible**
   - Les recettes avec vidéos affichent un badge "Vidéo" (HeroUI Chip)
   - Badge avec icône play positionné sur l'image

2. **Lecteur vidéo intégré**
   - Sur la page détail, lecteur vidéo YouTube embedded via iframe ou react-youtube
   - Lecteur responsive (aspect ratio 16:9)

3. **Contrôles vidéo**
   - L'utilisateur peut: Play/Pause, Seek, contrôler volume, plein écran
   - Contrôles natifs YouTube utilisés

#### Notes techniques

- Data: `video_url` depuis Spoonacular (liens YouTube)
- Library: `react-youtube` ou `lite-youtube-embed`
- UI: HeroUI Chip pour badge

#### Definition of Done

- [ ] Badge "Vidéo" affiché si disponible
- [ ] Lecteur YouTube intégré sur page détail
- [ ] Lecteur responsive
- [ ] Contrôles fonctionnels
- [ ] Plein écran possible

---

### US10: Partager recettes avec amis

**En tant qu'utilisateur, je veux partager des recettes avec des amis afin de découvrir de nouvelles idées**

**Priorité:** Should Have (P2)  
**Estimation:** 5 points  
**Sprint:** Sprint 5

#### Critères d'acceptation

1. **Bouton de partage**
   - Chaque page détail a un bouton "Partager" (HeroUI Button)
   - Clic ouvre menu de partage ou Web Share API
   - Options: Copier lien, Email, Facebook, Twitter, WhatsApp, Natif

2. **Lien partageable**
   - Le système génère un lien public: `/recipes/[id]/share`
   - Accessible sans authentification (public route)
   - Page publique affiche: image, titre, description, temps, calories
   - Bouton "Voir la recette complète" (redirige vers signup si pas connecté)

3. **Feedback et tracking**
   - Confirmation visuelle après partage (HeroUI toast "Lien copié!")
   - Compteur de partages par recette (optionnel)

#### Notes techniques

- Web Share API: `navigator.share()` pour mobile
- Route publique: `/app/(public)/recipes/[id]/share/page.tsx`
- Library: `react-share` pour boutons social media
- Toast: HeroUI toast/sonner

#### Definition of Done

- [ ] Bouton "Partager" présent sur page détail
- [ ] Web Share API fonctionnelle sur mobile
- [ ] Lien public généré et accessible
- [ ] Page publique affiche infos essentielles
- [ ] Copier lien fonctionne avec toast
- [ ] Au moins 2 options de partage social

---

### US16: Recettes Premium exclusives

**En tant qu'utilisateur premium, je veux accéder à des recettes exclusives afin de bénéficier de plus de variété**

**Priorité:** Should Have (P2)  
**Estimation:** 5 points  
**Sprint:** Sprint 5

#### Critères d'acceptation

1. **Badge Premium sur recettes**
   - Certaines recettes marquées `is_premium = true` dans DB
   - Recipe cards affichent badge "Premium" (HeroUI Chip color="warning" avec Crown icon)
   - Badge positionné en haut à droite de l'image
   - Free users voient les recettes premium avec lock icon overlay

2. **Access Control**
   - Free users cliquent sur recette premium → Paywall modal s'affiche
   - Premium users accèdent normalement à toutes recettes
   - Filter "Premium Only" disponible pour premium users
   - Count affiché: "500+ premium recipes" pour premium, "50 basic recipes" pour free

3. **Seed Premium Recipes**
   - Script seed 150+ recettes premium depuis Spoonacular
   - Catégories premium: High-protein (>30g protein), Gourmet (international), Meal prep optimized, Quick & easy (<15 min), International cuisines
   - Chaque recette: `is_premium = true`, nutrition data complète, tags categories

#### Notes techniques

- Database: `ALTER TABLE saved_recipes ADD COLUMN is_premium BOOLEAN`
- Spoonacular API: fetch avec critères spécifiques (minProtein=30, cuisine=french, etc.)
- Script: `npm run seed:premium-recipes`
- UI: HeroUI Chip, Modal pour paywall

#### Definition of Done

- [ ] Colonne `is_premium` ajoutée à table
- [ ] Script seed créé et testé
- [ ] 150+ recettes premium seeded
- [ ] Badge "Premium" affiché sur cards
- [ ] Free users voient lock overlay
- [ ] Click premium recipe (free) → Paywall
- [ ] Premium users accèdent normalement
- [ ] Filter "Premium Only" pour premium users

---

## Could Have (Priority 3)

Ces user stories sont **des bonus** qui peuvent être implémentées si le temps le permet.

---

### US11: Suggestions de meal prep

**En tant qu'utilisateur, je veux des suggestions de meal prep afin d'économiser du temps**

**Priorité:** Could Have (P3)  
**Estimation:** 5 points  
**Sprint:** Sprint 5 (si temps disponible)

#### Critères d'acceptation

1. **Identification des recettes meal prep**
   - Le système identifie recettes appropriées au meal prep
   - Tag "Meal Prep Friendly" affiché (HeroUI Chip)
   - Filtre "Meal Prep" disponible dans la recherche

2. **Guide de meal prep**
   - Page ou section "Meal Prep Guide" explique: quelles recettes préparer, jour optimal, durée conservation, instructions réchauffage
   - Suggestions basées sur le meal plan de l'utilisateur

3. **Calendrier meal prep**
   - Sur le meal plan, indication visuelle des recettes "prep-able"
   - Suggestion: "Vous pouvez préparer 4 recettes à l'avance dimanche"
   - Temps total de préparation estimé

#### Notes techniques

- Data: Tag `mealPrepFriendly` ou analyse `dishTypes` Spoonacular
- UI: HeroUI Chip pour badge
- Algorithm: prep_time < 60 min et servings >= 4

#### Definition of Done

- [ ] Tag "Meal Prep Friendly" affiché
- [ ] Page/section guide créée
- [ ] Suggestions basées sur meal plan
- [ ] Liste recettes à préparer générée

---

### US12: Suivre macronutriments (PREMIUM)

**En tant qu'utilisateur premium, je veux suivre mes macronutriments afin d'atteindre mes objectifs fitness**

**Priorité:** Could Have (P3)  
**Estimation:** 5 points  
**Sprint:** Sprint 4-5 (Premium feature)

#### Critères d'acceptation

1. **Définir objectifs de macros**
   - L'utilisateur peut définir objectifs quotidiens dans Settings
   - Presets: Équilibré (30/40/30), High Protein (40/30/30), Low Carb (30/20/50), Custom (sliders)

2. **Dashboard macros**
   - Page "Macros Dashboard" affiche 3 graphiques circulaires (1 par macro, Recharts)
   - Chaque graphique: consommé vs objectif avec couleurs (vert/orange/rouge)
   - Toggle vue jour/semaine

3. **Progression visuelle**
   - Barres de progression colorées (HeroUI Progress)
   - Suggestions si déséquilibre
   - Historique sur 7/14/30 jours (line chart)

#### Notes techniques

- Table: `profiles` avec colonnes `protein_goal`, `carbs_goal`, `fats_goal`
- Charts: Recharts (PieChart, LineChart)
- Data: Nutrition data depuis Spoonacular
- UI: HeroUI Progress, Card

#### Definition of Done

- [ ] Settings permet définir objectifs
- [ ] Presets disponibles
- [ ] Dashboard macros créé
- [ ] 3 graphiques circulaires affichés
- [ ] Toggle jour/semaine implémenté
- [ ] Feature réservée Premium users

---

## Récapitulatif

### Par priorité

| Priorité             | User Stories       | Total Points  | Sprints            |
| -------------------- | ------------------ | ------------- | ------------------ |
| **Must Have (P1)**   | US1-US6, US13-US15 | 47 points     | Sprints 1-5        |
| **Should Have (P2)** | US7-US10, US16     | 19 points     | Sprints 2, 5       |
| **Could Have (P3)**  | US11-US12          | 10 points     | Sprint 4-5 (bonus) |
| **TOTAL**            | **16 stories**     | **76 points** | 5 sprints          |

### Par sprint

| Sprint           | Semaine   | User Stories                         | Points | % Projet |
| ---------------- | --------- | ------------------------------------ | ------ | -------- |
| **Sprint 1**     | Semaine 2 | US1, US2 + setup                     | 21     | 15%      |
| **Sprint 2**     | Semaine 3 | US4, US6, US7, US8                   | 24     | 30%      |
| **Sprint 3**     | Semaine 4 | US3 (meal plans)                     | 26     | 45%      |
| **Sprint 4**     | Semaine 5 | US5, US13, US15, (US12)              | 40     | 70%      |
| **Sprint 5**     | Semaine 6 | US9, US10, US11, US14, US16 + polish | 33     | 95%      |
| **Finalisation** | Semaine 7 | Bug fixes, déploiement, présentation | -      | 100%     |

### Velocity prévue

- **Vélocité moyenne:** ~23 points/sprint (Sprints 1-3)
- **Sprint 4:** 40 points (avec Stripe integration)
- **Sprint 5:** 33 points (avec subscription management)
- **Total story points:** ~149 points (incluant tâches techniques)
- **Capacité équipe:** 3 développeurs × ~7-13 points/dev/sprint

---

### Features Premium débloquées

| Feature                | Free Plan | Premium Plan |
| ---------------------- | --------- | ------------ |
| Meal plans par mois    | 2         | Unlimited    |
| Recettes disponibles   | 50        | 500+         |
| Shopping lists actives | 1         | Unlimited    |
| Nutrition tracking     | Basique   | Avancé       |
| Macros tracking        | ❌        | ✅           |
| Meal prep guides       | ❌        | ✅           |
| PDF Export             | ❌        | ✅           |
| Recettes premium       | ❌        | ✅           |
| Priority support       | ❌        | ✅           |
| Early access           | ❌        | ✅           |

### Pricing

- **Monthly:** $4.99/mois
- **Yearly:** $49.99/an (save $10.89 = 17% discount)

---

## Notes importantes

### Format des User Stories

Toutes les user stories suivent le format standard:

```
En tant que [persona],
Je veux [action/fonctionnalité],
Afin de [bénéfice/valeur].
```

### Critères d'acceptation

- Formulés de manière **testable** (pas d'ambiguïté)
- Incluent des **détails techniques précis**
- Définissent le **comportement attendu**, pas l'implémentation
- Servent de **checklist** durant le développement

### Utilisation dans GitHub Projects

1. **Créer une issue** par user story
2. **Copier les critères d'acceptation** dans la description
3. **Ajouter des labels**: `Priority: P1`, `Sprint: 1`, `Type: Feature`
4. **Cocher les critères** au fur et à mesure du développement
5. **Fermer l'issue** uniquement quand tous les critères sont validés

### Definition of Done (DoD) globale

Une user story est **"Done"** si:

- ✅ Tous les critères d'acceptation sont validés
- ✅ Code écrit, testé et reviewé
- ✅ PR approuvée et mergée dans `main`
- ✅ Déployé sur Vercel (environment preview/prod)
- ✅ Testé manuellement (happy path + edge cases)
- ✅ Documentation mise à jour (README, comments)
- ✅ Aucun bug bloquant

---

### Technologies Stripe

- **SDK:** `stripe` (backend), `@stripe/stripe-js` (frontend)
- **Checkout:** Stripe Checkout Sessions (hosted page)
- **Portal:** Stripe Customer Portal (hosted page)
- **Webhooks:** Signature verification nécessaire
- **Test Cards:**
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`

### Database Schema (ajouts Stripe)

- Profiles: ajouter colonnes `stripe_customer_id`, `stripe_subscription_id`, `is_premium`, `premium_since`, `subscription_status`
- Nouvelle table: `meal_plan_usage` (user_id, month_year, count)
- Saved Recipes: ajouter colonne `is_premium BOOLEAN`

### API Routes Stripe

- `POST /api/checkout/create-session` → Créer Checkout Session
- `POST /api/billing/create-portal-session` → Créer Portal Session
- `POST /api/webhooks/stripe` → Gérer événements Stripe
- `GET /api/meal-plans/usage` → Check usage limits

---

## Annexes

### MoSCoW Method

- **Must Have:** Fonctionnalités essentielles sans lesquelles le produit ne fonctionne pas
- **Should Have:** Fonctionnalités importantes mais pas critiques
- **Could Have:** Fonctionnalités bonus si temps disponible
- **Won't Have (this time):** Fonctionnalités hors scope pour ce projet

### Estimation Fibonacci

- **1 point:** < 2h (fix bug, petite UI)
- **2 points:** 2-4h (composant simple)
- **3 points:** 4-8h (écran complet)
- **5 points:** 1-2 jours (feature avec backend)
- **8 points:** 2-3 jours (feature complexe)
- **13 points:** Trop gros → à diviser en plusieurs stories

### Contacts et ressources

- **Scrum Master:** Rima Nafougui
- **Developers:** Jimmy Chhan, Charly Smith Alcide, Julien Guibord
- **Repository GitHub:** https://github.com/Mercuryy200/MealMatch
- **GitHub Projects:** https://github.com/users/Mercuryy200/projects/7
- **Documentation Spoonacular:** https://spoonacular.com/food-api/docs
- **Documentation Supabase:** https://supabase.com/docs
- **Documentation Stripe:** https://stripe.com/docs

---

**Document créé le:** 30-01-2026  
**Dernière mise à jour:** 30-01-2026  
**Version:** 2.0

---

## Must Have (Priority 1) - STRIPE

### US13: Souscrire au plan Premium

**En tant qu'utilisateur gratuit, je veux souscrire au plan premium afin d'accéder à des fonctionnalités avancées illimitées**

**Priorité:** Must Have (P1)  
**Estimation:** 13 points  
**Sprint:** Sprint 4

#### Critères d'acceptation

1. **Page Pricing et comparaison**
   - Une page `/pricing` affiche un tableau comparatif Free vs Premium (HeroUI Cards côte à côte)
   - Plan Free affiche:
     - Prix: $0/mois
     - 2 meal plans par mois
     - 50 recettes basiques
     - 1 shopping list active
     - Nutrition tracking basique (calories seulement)
     - Badges avec icônes Check (vert) et X (gris) pour features
   - Plan Premium affiche:
     - Prix: $4.99/mois ou $49.99/an
     - Badge "Most Popular" avec icône Crown
     - Unlimited meal plans
     - 500+ recettes premium
     - Unlimited shopping lists
     - Advanced macros tracking
     - Meal prep guides
     - PDF export
     - Priority support
     - Early access to new features
   - Toggle Monthly/Yearly avec badge "Save 17%" pour plan annuel
   - Design responsive (mobile, tablet, desktop)

2. **Checkout Stripe**
   - Bouton "Upgrade to Premium" (HeroUI Button color="warning" size="lg")
   - Click → API call `/api/checkout/create-session` avec priceId ('monthly' ou 'yearly')
   - Checkout Session créé avec:
     - mode: 'subscription'
     - customer: stripe_customer_id (créé si n'existe pas)
     - success_url: `/success?session_id={CHECKOUT_SESSION_ID}`
     - cancel_url: `/pricing`
   - Redirect vers Stripe Checkout hosted page
   - Utilisateur entre ses informations de paiement (carte de crédit) sur page sécurisée Stripe
   - Après paiement réussi, redirect automatique vers `/success`

3. **Activation premium automatique**
   - Webhook Stripe (`/api/webhooks/stripe`) écoute événement `checkout.session.completed`
   - Webhook handler vérifie signature Stripe pour sécurité
   - Profil user mis à jour dans Supabase:
     - `is_premium = true`
     - `premium_since = NOW()`
     - `stripe_subscription_id = session.subscription`
     - `subscription_status = 'active'`
   - Badge "Premium" avec icône Crown (HeroUI Chip color="warning") affiché sur navbar
   - Toutes les features premium débloquées immédiatement
   - Page success affiche:
     - Icône CheckCircle (vert, grande taille)
     - Message: "Welcome to Premium! 🎉"
     - Description benefits débloqués
     - Bouton "Start Creating Meal Plans" → `/meal-plans/generate`

#### Notes techniques

- **Stripe SDK:** `npm install stripe @stripe/stripe-js`
- **Environnement variables:**
  ```env
  STRIPE_SECRET_KEY=sk_test_xxx
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
  STRIPE_WEBHOOK_SECRET=whsec_xxx
  STRIPE_PRICE_ID_MONTHLY=price_xxx
  STRIPE_PRICE_ID_YEARLY=price_xxx
  ```
- **Produit Stripe:** "MealMatch Premium" créé dans Dashboard Stripe
- **Prix configurés:**
  - Monthly: $4.99 USD recurring
  - Yearly: $49.99 USD recurring (17% discount)
- **Webhooks écoutés:**
  - `checkout.session.completed` → activer premium
  - `customer.subscription.updated` → mettre à jour status
  - `customer.subscription.deleted` → désactiver premium
  - `invoice.payment_failed` → notifier user
- **Tables DB modifiées:**
  ```sql
  ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT UNIQUE;
  ALTER TABLE profiles ADD COLUMN stripe_subscription_id TEXT UNIQUE;
  ALTER TABLE profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
  ALTER TABLE profiles ADD COLUMN premium_since TIMESTAMPTZ;
  ALTER TABLE profiles ADD COLUMN subscription_status TEXT;
  ```

#### HeroUI Components utilisés

- Card, CardHeader, CardBody, CardFooter
- Button (with isLoading state)
- Chip, Badge
- Spinner (loading states)
- ButtonGroup (Monthly/Yearly toggle)

#### Definition of Done

- [ ] Page `/pricing` créée avec design comparatif attrayant
- [ ] Toggle Monthly/Yearly fonctionne et met à jour prix affiché
- [ ] Compte Stripe créé (test mode) + produit configuré
- [ ] API route `/api/checkout/create-session` créée et testée
- [ ] Stripe Checkout Session fonctionne et redirige correctement
- [ ] Webhook `/api/webhooks/stripe` configuré et vérifie signature
- [ ] Webhook handler traite `checkout.session.completed` correctement
- [ ] User devient premium après paiement (is_premium = true vérifié en DB)
- [ ] Badge "Premium" affiché sur navbar après activation
- [ ] Page `/success` créée avec message de confirmation
- [ ] Testé avec cartes test Stripe (4242 4242 4242 4242 pour succès)
- [ ] Testé avec carte decline (4000 0000 0000 0002) pour gérer erreurs
- [ ] Documentation API Stripe ajoutée dans README

---

### US14: Gérer mon abonnement

**En tant qu'utilisateur premium, je veux gérer mon abonnement afin de pouvoir modifier mon paiement, voir mes factures ou annuler**

**Priorité:** Must Have (P1)  
**Estimation:** 8 points  
**Sprint:** Sprint 5

#### Critères d'acceptation

1. **Section Subscription dans Settings**
   - Page Settings (`/settings`) affiche section "Subscription" (HeroUI Card dédiée)
   - **Si user est Free:**
     - Badge "Free Plan" (HeroUI Chip color="default")
     - Texte: "2 meal plans per month"
     - Bouton "Upgrade to Premium" (color="warning", fullWidth, icône Crown)
     - Click → redirect `/pricing`
   - **Si user est Premium:**
     - Badge status selon `subscription_status`:
       - 'active' → Chip color="success" "Premium ⭐"
       - 'canceled' → Chip color="warning" "Ending Soon"
       - 'past_due' → Chip color="danger" "Payment Failed"
     - Icône Calendar + texte "Premium since [date formatée]"
     - Si status = 'canceled': Banner warning avec AlertCircle icon
       - "Subscription ending on [current_period_end date]"
       - "You can reactivate anytime"
     - Liste benefits gestion:
       - View and download invoices
       - Update payment method
       - Change billing cycle
       - Cancel or pause subscription
     - Bouton "Manage Subscription" (variant="bordered", icône CreditCard)

2. **Stripe Customer Portal**
   - Click "Manage Subscription" → loading state (isLoading=true)
   - API call POST `/api/billing/create-portal-session`
   - Backend crée Stripe Portal Session:
     - customer: user's stripe_customer_id
     - return_url: `${APP_URL}/settings`
   - Response contient `url` du Customer Portal
   - Frontend redirect: `window.location.href = url`
   - Portal Stripe hosted permet:
     - **View invoices:** Liste des factures avec PDF download
     - **Update payment method:** Ajouter/modifier carte de crédit
     - **Cancel subscription:** Flow de retention (optionnel: survey "Why canceling?")
     - **Change plan:** Switch Monthly ↔ Yearly
   - Après action dans Portal, user redirigé vers `/settings`

3. **Gestion des changements de statut**
   - **Si user cancel subscription:**
     - Webhook `customer.subscription.updated` reçu avec status = 'canceled'
     - DB mise à jour: `subscription_status = 'canceled'`
     - `is_premium` reste `true` jusqu'à `current_period_end` (grace period)
     - Banner warning affiché dans Settings
     - User garde accès premium jusqu'à expiration
   - **À expiration (current_period_end):**
     - Webhook `customer.subscription.deleted` reçu
     - DB mise à jour: `is_premium = false`, `subscription_status = 'canceled'`
     - Badge "Premium" disparaît de navbar
     - Features premium bloquées (paywall affiché)
     - User peut réactiver en cliquant "Upgrade to Premium"
   - **Si payment failed:**
     - Webhook `invoice.payment_failed` reçu
     - Status devient 'past_due'
     - Email notification envoyée (via Stripe ou Resend)
     - Banner critique affiché: "Payment failed. Please update payment method"

#### Notes techniques

- **API Route:** `/api/billing/create-portal-session`
- **Stripe Customer Portal:**
  - Configuré dans Dashboard Stripe: https://dashboard.stripe.com/settings/billing/portal
  - Options activées:
    - ✓ Allow customers to update payment methods
    - ✓ Allow customers to view invoices (last 12 months)
    - ✓ Allow customers to cancel subscriptions
    - ✓ Invoice history
  - Cancellation behavior: "Cancel at end of billing period" (grace period)
- **Webhooks:**
  - `customer.subscription.updated` → update subscription_status
  - `customer.subscription.deleted` → désactiver premium
  - `invoice.payment_failed` → notifier user
- **Date formatting:** `date-fns` pour afficher dates lisibles
  ```ts
  import { format } from "date-fns";
  format(new Date(premiumSince), "MMMM d, yyyy"); // "February 5, 2026"
  ```

#### HeroUI Components utilisés

- Card, CardHeader, CardBody, CardFooter
- Button (with isLoading)
- Chip, Badge (avec couleurs conditionnelles)
- Divider
- Alert-style Card (pour warnings)

#### Definition of Done

- [ ] Section "Subscription" créée dans page Settings
- [ ] Affichage conditionnel Free vs Premium implémenté
- [ ] Badge status affiche correctement selon subscription_status
- [ ] API route `/api/billing/create-portal-session` créée
- [ ] Portal Session créée avec return_url correct
- [ ] Redirect vers Stripe Customer Portal fonctionne
- [ ] Customer Portal permet update payment method
- [ ] Customer Portal permet view invoices
- [ ] Customer Portal permet cancel subscription
- [ ] Grace period respectée après cancel (is_premium reste true)
- [ ] Webhook `customer.subscription.updated` gère status changes
- [ ] Webhook `customer.subscription.deleted` désactive premium à expiration
- [ ] Banner warning affiché si subscription = 'canceled'
- [ ] User peut réactiver après cancel
- [ ] Date "Premium since" formatée correctement avec date-fns

---

### US15: Restrictions pour utilisateurs gratuits

**En tant que système, je veux restreindre l'accès aux features premium afin de protéger la monétisation**

**Priorité:** Must Have (P1)  
**Estimation:** 5 points  
**Sprint:** Sprint 4-5

#### Critères d'acceptation

1. **Limitation meal plans (Free users)**
   - Free users limités à **2 meal plans par mois**
   - Table `meal_plan_usage` créée pour tracker usage:
     ```sql
     CREATE TABLE meal_plan_usage (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
       month_year TEXT NOT NULL, -- Format: '2026-02'
       count INTEGER DEFAULT 0,
       updated_at TIMESTAMPTZ DEFAULT NOW(),
       UNIQUE(user_id, month_year)
     );
     ```
   - Fonction `canGenerateMealPlan(userId, isPremium)` vérifie:
     - Si isPremium → return `{ allowed: true, remaining: Infinity }`
     - Si free → check count dans `meal_plan_usage` pour mois actuel
     - Si count < 2 → return `{ allowed: true, remaining: 2 - count }`
     - Si count >= 2 → return `{ allowed: false, count: 2, limit: 2 }`
   - API route `/api/meal-plans/generate` vérifie avant génération:
     - Si not allowed → return 403 avec `{ code: 'LIMIT_REACHED' }`
   - Après génération réussie, increment count si user est free
   - Reset automatique le 1er du mois (nouveau month_year)
   - Compteur affiché sur page generate: "1/2 meal plans used this month"
     - Component `<UsageIndicator>` avec HeroUI Progress bar
     - Si isPremium → Chip "Unlimited Premium" avec icône Sparkles
     - Si near limit (count >= 1) → text warning color="warning"

2. **Paywall Modal**
   - Component `<PaywallModal>` (HeroUI Modal) affiché quand:
     - Free user clique "Generate" et count >= 2
     - Free user clique sur feature premium (macros, PDF export, etc.)
     - API return 403 LIMIT_REACHED
   - Design Modal:
     - ModalHeader: Chip color="warning" "Premium Feature" avec Crown icon
     - Titre: "Unlock Unlimited Meal Plans"
     - ModalBody:
       - Texte: "You've used {count}/{limit} free meal plans this month"
       - Card background warning avec liste benefits:
         - ✓ Unlimited meal plans every month
         - ✓ 500+ premium recipes
         - ✓ Advanced nutrition tracking
         - ✓ Meal prep guides & PDF export
         - ✓ Priority support
       - Prix: "Starting at $4.99/month" (text-2xl font-bold)
     - ModalFooter:
       - Button "Maybe Later" (variant="light", onClose)
       - Button "Upgrade to Premium" (color="warning", redirect `/pricing`)

3. **Access Control autres features**
   - **Macros Tracking (US12):** Premium only
     - Route `/nutrition/macros` protégée
     - Si free user accède → Paywall modal
   - **PDF Export:** Premium only
     - Bouton "Export PDF" visible mais disabled pour free
     - Click → Paywall modal avec message "PDF export is a Premium feature"
   - **Meal Prep Guides avancés:** Premium only
     - Page `/meal-prep` affiche teaser pour free users
     - Contenu détaillé bloqué avec blur + overlay Paywall
   - **Recettes Premium (US16):** Premium only
     - Recettes avec `is_premium = true` affichent badge "Premium"
     - Free users voient cards avec lock icon
     - Click → Paywall modal "Access 500+ premium recipes"
   - **Multiple Shopping Lists:** Premium only
     - Free users: max 1 active shopping list
     - Si tentative créer 2ème → Paywall modal
   - **Middleware protection:**
     - Routes premium protégées: `/nutrition/macros`, `/meal-prep/advanced`
     - Middleware vérifie `is_premium` before render
     - Si false → redirect `/pricing` ou show Paywall

#### Notes techniques

- **Functions utilities:**
  ```ts
  // lib/usage-limits.ts
  export async function getMealPlanUsage(userId: string);
  export async function incrementMealPlanUsage(userId: string);
  export async function canGenerateMealPlan(userId: string, isPremium: boolean);
  ```
- **API Routes:**
  - `/api/meal-plans/usage` (GET) → return { count, limit, isPremium, remaining }
  - `/api/meal-plans/generate` (POST) → check limits avant génération
- **Components:**
  - `<UsageIndicator count={1} limit={2} isPremium={false} />`
  - `<PaywallModal isOpen={true} onClose={...} count={2} limit={2} />`
  - `<PremiumBadge />` → Crown icon + "Premium" chip
- **Date utilities:** `date-fns` pour format month_year
  ```ts
  import { format } from "date-fns";
  const monthYear = format(new Date(), "yyyy-MM"); // '2026-02'
  ```

#### HeroUI Components utilisés

- Modal, ModalContent, ModalHeader, ModalBody, ModalFooter
- Card, CardBody (pour liste benefits)
- Progress (pour compteur usage)
- Chip, Badge
- Button

#### Definition of Done

- [ ] Table `meal_plan_usage` créée avec schema correct
- [ ] Functions `getMealPlanUsage` et `canGenerateMealPlan` implémentées
- [ ] API route `/api/meal-plans/generate` vérifie limits
- [ ] Free users limités à 2 meal plans/mois (testé)
- [ ] API return 403 LIMIT_REACHED quand limite atteinte
- [ ] Component `<UsageIndicator>` créé et affiche compteur
- [ ] Progress bar affiche 0/2, 1/2, 2/2 correctement
- [ ] Component `<PaywallModal>` créé avec design spec
- [ ] Paywall s'affiche au 3ème attempt de génération
- [ ] Paywall s'affiche sur features premium (macros, PDF, etc.)
- [ ] Premium users ont meal plans illimités (vérifié)
- [ ] Middleware protège routes premium
- [ ] Reset automatique testé (simuler changement de mois)
- [ ] Premium badge affiché sur recettes premium

---

## Should Have (Priority 2) - PREMIUM FEATURES

### US16: Recettes Premium exclusives

**En tant qu'utilisateur premium, je veux accéder à des recettes exclusives afin de bénéficier de plus de variété**

**Priorité:** Should Have (P2)  
**Estimation:** 5 points  
**Sprint:** Sprint 5

#### Critères d'acceptation

1. **Badge Premium sur recettes**
   - Certaines recettes marquées `is_premium = true` dans table `saved_recipes`
   - Recipe cards affichent badge "Premium" si `is_premium = true`:
     - HeroUI Chip color="warning" variant="flat"
     - Icône Crown (lucide-react)
     - Text "Premium"
     - Positionné en haut à droite de l'image (position absolute)
   - Free users voient les recettes premium dans search results:
     - Card affichée avec image légèrement opacity-70
     - Badge "Premium" affiché
     - Lock icon overlay sur image
     - Hover effect différent (cursor not-allowed)
   - Premium users voient les mêmes cards sans lock, fully accessible

2. **Access Control**
   - **Free users cliquent sur recette premium:**
     - Event onClick intercepté
     - Paywall Modal s'affiche:
       - Titre: "Premium Recipe 🍽️"
       - Message: "This recipe is exclusive to Premium members"
       - Preview: Titre, image, temps préparation visible
       - Détails bloqués: Ingredients, instructions, nutrition cachés
       - Liste benefits: "Access 500+ premium recipes, meal plans, and more"
       - Buttons: "Maybe Later" + "Upgrade to Premium"
     - No redirect to recipe detail page
   - **Premium users cliquent sur recette premium:**
     - Navigation normale vers `/recipes/[id]`
     - Accès complet à tous les détails
     - Badge "Premium" affiché sur page détail aussi
   - **Filter "Premium Only":**
     - Filtre disponible uniquement pour premium users
     - CheckboxGroup inclut option "Premium Recipes Only"
     - Free users ne voient pas ce filtre
     - Si premium user active: API filter `is_premium = true`
   - **Count affiché:**
     - Premium users: "500+ premium recipes available"
     - Free users: "50 basic recipes" (sans accès premium)

3. **Seed Premium Recipes**
   - Script `scripts/seed-premium-recipes.ts` créé
   - Fetch 150+ recettes premium depuis Spoonacular avec critères:
     - **High-protein meals:** >30g protein/serving
       - API: `?minProtein=30&type=main course`
       - Tags: "high-protein", "fitness", "bodybuilding"
     - **Gourmet recipes:** cuisine internationale élaborée
       - API: `?cuisine=french,italian,thai&sort=popularity`
       - Tags: "gourmet", "fancy", "date-night"
     - **Meal prep optimized:** grandes portions, bon stockage
       - API: `?type=main course&minServings=6`
       - Tags: "meal-prep", "batch-cooking", "freezer-friendly"
     - **Quick & easy premium:** <15 min mais recettes créatives
       - API: `?maxReadyTime=15&sort=rating`
       - Tags: "quick", "easy", "5-ingredients"
     - **International cuisines:** Thai, Indian, Mexican, Japanese
       - API: `?cuisine=thai,indian,mexican,japanese`
       - Tags: "authentic", "international", "exotic"
   - Pour chaque recette fetched:
     - Insert dans `saved_recipes` avec `is_premium = true`
     - Save nutrition data complète
     - Tag categories pour filtering
   - Script exécutable: `npm run seed:premium-recipes`
   - Progress log: "Seeded 50/150 premium recipes..."
   - Handle rate limiting (delay 500ms entre requests)

#### Notes techniques

- **Database:**
  ```sql
  ALTER TABLE saved_recipes ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
  CREATE INDEX idx_recipes_premium ON saved_recipes(is_premium);
  ```
- **Spoonacular API calls:**
  - High-protein: `/recipes/complexSearch?minProtein=30&number=30`
  - Gourmet: `/recipes/complexSearch?cuisine=french&number=30`
  - Meal prep: `/recipes/complexSearch?minServings=6&number=30`
  - Quick: `/recipes/complexSearch?maxReadyTime=15&sort=rating&number=30`
  - International: `/recipes/complexSearch?cuisine=thai&number=30`
- **Components:**
  - `<PremiumBadge />` → Chip avec Crown icon
  - `<RecipeCard isPremium={true} canAccess={user.isPremium} />`
  - `<PremiumRecipePaywall recipe={...} />`
- **Query filtering:**
  - Premium filter: `?is_premium=true` (only pour premium users)
  - Free users: default `?is_premium=false OR is_premium IS NULL`

#### HeroUI Components utilisés

- Chip, Badge (pour Premium badge)
- Modal (pour paywall)
- Card (avec overlay pour locked state)
- Lock icon (lucide-react)

#### Definition of Done

- [ ] Colonne `is_premium` ajoutée à table `saved_recipes`
- [ ] Script `seed-premium-recipes.ts` créé
- [ ] 150+ recettes premium seeded avec variété (high-protein, gourmet, etc.)
- [ ] Badge "Premium" affiché sur recipe cards premium
- [ ] Free users voient cards premium avec lock overlay
- [ ] Click sur premium recipe (free user) → Paywall modal
- [ ] Premium users accèdent normalement aux recettes premium
- [ ] Filter "Premium Only" disponible pour premium users
- [ ] Count "500+ premium recipes" affiché pour premium
- [ ] Premium badge affiché aussi sur page recipe detail
- [ ] Testé: free user ne peut pas accéder à premium recipe
- [ ] Testé: premium user accède à toutes recettes

---

## Récapitulatif Stripe & Premium

### User Stories ajoutées

| US        | Titre                              | Priorité | Points | Sprint     |
| --------- | ---------------------------------- | -------- | ------ | ---------- |
| US13      | Souscrire au plan Premium          | P1       | 13     | Sprint 4   |
| US14      | Gérer mon abonnement               | P1       | 8      | Sprint 5   |
| US15      | Restrictions utilisateurs gratuits | P1       | 5      | Sprint 4-5 |
| US16      | Recettes Premium exclusives        | P2       | 5      | Sprint 5   |
| **TOTAL** | **4 user stories**                 | -        | **31** | -          |

### Répartition par Sprint (mise à jour)

| Sprint           | User Stories Originales              | User Stories Stripe | Total Points | % Projet |
| ---------------- | ------------------------------------ | ------------------- | ------------ | -------- |
| **Sprint 1**     | US1, US2 + setup                     | -                   | 21           | 15%      |
| **Sprint 2**     | US4, US6, US7, US8                   | -                   | 24           | 30%      |
| **Sprint 3**     | US3 (meal plans)                     | -                   | 26           | 45%      |
| **Sprint 4**     | US5, (US12)                          | **US13, US15**      | **40**       | 70%      |
| **Sprint 5**     | US9, US10, US11                      | **US14, US16**      | **33**       | 95%      |
| **Finalisation** | Bug fixes, déploiement, présentation | -                   | -            | 100%     |

### Total Story Points (avec Stripe)

- **User Stories originales:** 58 points
- **User Stories Stripe:** 31 points
- **Tâches techniques (estimé):** 60 points
- **TOTAL PROJET:** **149 points**

### Velocity ajustée

- **Sprints 1-3:** ~23 points/sprint (moyenne originale)
- **Sprint 4:** 40 points (avec Stripe integration)
- **Sprint 5:** 33 points (avec subscription management)
- **Capacité requise Sprint 4-5:** ~13 points/dev/sprint

### Features Premium débloquées

| Feature                | Free Plan | Premium Plan |
| ---------------------- | --------- | ------------ |
| Meal plans par mois    | 2         | Unlimited    |
| Recettes disponibles   | 50        | 500+         |
| Shopping lists actives | 1         | Unlimited    |
| Nutrition tracking     | Basique   | Avancé       |
| Macros tracking        | ❌        | ✅           |
| Meal prep guides       | ❌        | ✅           |
| PDF Export             | ❌        | ✅           |
| Recettes premium       | ❌        | ✅           |
| Priority support       | ❌        | ✅           |
| Early access           | ❌        | ✅           |

### Pricing

- **Monthly:** $4.99/mois
- **Yearly:** $49.99/an (save $10.89 = 17% discount)

### Technologies Stripe

- **SDK:** `stripe` (backend), `@stripe/stripe-js` (frontend)
- **Checkout:** Stripe Checkout Sessions (hosted page)
- **Portal:** Stripe Customer Portal (hosted page)
- **Webhooks:** Signature verification avec `stripe.webhooks.constructEvent`
- **Test Cards:**
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`

### Database Schema (ajouts)

```sql
-- Profiles (ajouts pour Stripe)
ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN stripe_subscription_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN premium_since TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN subscription_status TEXT;

-- Meal Plan Usage (pour limitations free)
CREATE TABLE meal_plan_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Saved Recipes (marqueur premium)
ALTER TABLE saved_recipes ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
```

### API Routes ajoutées

- `POST /api/checkout/create-session` → Créer Checkout Session
- `POST /api/billing/create-portal-session` → Créer Portal Session
- `POST /api/webhooks/stripe` → Gérer événements Stripe
- `GET /api/meal-plans/usage` → Check usage limits
- `GET /api/subscription/status` → Get current subscription info

---

## Notes importantes pour Stripe

### Configuration Stripe Dashboard

1. **Créer produit:**
   - Nom: "MealMatch Premium"
   - Description: "Unlimited meal plans and premium features"
   - Statement descriptor: "MEALMATCH PRO"

2. **Créer prix:**
   - Price 1: $4.99 USD, recurring monthly, ID: `price_monthly_xxx`
   - Price 2: $49.99 USD, recurring yearly, ID: `price_yearly_xxx`

3. **Configurer webhooks:**
   - URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
   - Signing secret: copier dans `.env.local`

4. **Configurer Customer Portal:**
   - Settings → Billing → Customer Portal
   - Enable portal
   - Allow: update payment, view invoices, cancel subscription
   - Cancellation: "At end of billing period" (grace period)

### Sécurité

- ✅ Vérifier signature webhook TOUJOURS
- ✅ Ne jamais exposer `STRIPE_SECRET_KEY` côté client
- ✅ Utiliser `NEXT_PUBLIC_` uniquement pour publishable key
- ✅ Valider `is_premium` côté serveur (pas juste frontend)
- ✅ RLS policies Supabase pour protéger données premium
- ✅ Logs Stripe events pour debugging

### Testing

**Test Mode (avant production):**

- Cartes test Stripe
- Webhooks via Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Trigger events: `stripe trigger checkout.session.completed`

**Production:**

- Switch to live mode keys
- Update webhook URL to production domain
- Test avec vraie carte (puis refund)

---

**Document créé le:** 30-01-2026  
**Dernière mise à jour:** 30-01-2026  
**Version:** 1.0
