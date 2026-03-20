# MealMatch

Application web qui génère des plans de repas hebdomadaires adaptés au budget étudiant, avec recettes faciles, liste d'épicerie automatique et suivi nutritionnel.

---

## Aperçu

![Landing Page](./public/screenshots/LandingPage.png)
![On Boarding](./public/screenshots/Onboarding.png)
![Dashboard](./public/screenshots/Dashboard.png)
![Explore](./public/screenshots/Explore.png)

## Fonctionnalités

- **Exploration de recettes** — recherche filtrée par ingrédients, nutriments, régime alimentaire et allergies
- **Génération de plan de repas** — planning hebdomadaire adapté au budget et aux préférences
- **Liste d'épicerie automatique** — générée à partir du plan de repas
- **Suivi nutritionnel** — calories, protéines, glucides, lipides par repas
- **Favoris** — sauvegarder et retrouver ses recettes préférées
- **Partage de recette** — via lien URL
- **Onboarding personnalisé** — profil utilisateur (budget, restrictions, objectifs, métriques corporelles)
- **Abonnements** — plans Free, Premium et Pro via Stripe
- **Thème clair / sombre** — basculement automatique ou manuel
- **Authentification** — Google, GitHub, ou courriel + mot de passe

---

## Tech Stack

- Frontend: Next.js (TypeScript)
- Styling: Tailwind
- Database: Supabase
- Authentification: OAuth , NextAuth (Google , Apple)
- API Recipe: Spoonacular API.
- API Nutrition: FatSecret API.
- State Management: TanStack Query
- Payments: Stripe
- Caching: Redis (Optional)

# NextAuth
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# Spoonacular
SPOONACULAR_API_KEY=

# OpenAI
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Scripts disponibles

```bash
pnpm dev          # Démarrage en développement (Turbopack)
pnpm build        # Build de production
pnpm start        # Démarrage en production
pnpm lint         # Lint + auto-fix
pnpm seed:recipes # Seed des recettes en base de données
```

---

## Documentation technique

### Spoonacular API

Utilisée pour les recettes, vidéos, valeurs nutritionnelles et listes d'épicerie.

| Endpoint                             | Description                              |
| ------------------------------------ | ---------------------------------------- |
| `/recipes/complexSearch`             | Recherche par mots-clés, filtres, budget |
| `/recipes/{id}/analyzedInstructions` | Instructions de préparation              |
| `/recipes/findByNutrients`           | Recettes par nutriments (min/max)        |
| `/recipes/findByIngredients`         | Recettes par ingrédients disponibles     |
| `/food/videos/search`                | Vidéos YouTube associées                 |

### Supabase

Stockage des données utilisateurs : profil, favoris, plans de repas, préférences et métriques. Les migrations sont dans `supabase/migrations/`.

### NextAuth v5

Authentification JWT avec trois providers : Google, GitHub et Credentials (email/mot de passe). La session est accessible côté serveur via `auth()` et côté client via `useSession()`.

## API FatSecret
FatSecret API est utilisée pour l'autocomplétion des ingrédients et le calcul des macronutriments (calories, protéines, glucides, lipides) lors de la création de recettes. Elle utilise OAuth 2.0 Client Credentials (scope `premier`) côté serveur.

- Obtenir un token OAuth 2.0 :
  - `POST https://oauth.fatsecret.com/connect/token` avec `grant_type=client_credentials&scope=premier`

- Autocomplétion des aliments :
  - `GET https://platform.fatsecret.com/rest/server.api?method=foods.autocomplete&expression=apple&max_results=6&format=json`

- Rechercher un aliment :
  - `GET https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=apple&max_results=1&format=json`

- Obtenir les détails nutritionnels d'un aliment (par `food_id`) :
  - `GET https://platform.fatsecret.com/rest/server.api?method=food.get.v2&food_id=XXXX&format=json`

## TanStack Query
TanStack Query est utilisé pour gérer les appels à l’API Spoonacular et à Supabase, en assurant un cache intelligent des recettes, une interface réactive et une synchronisation automatique après les actions de l’utilisateur (favoris, menus, etc.).

Gère le cache des appels Spoonacular et Supabase. Assure la synchronisation après chaque action utilisateur (favoris, menus, profil).

### Stripe

Trois plans d'abonnement (Free, Premium, Pro). Les webhooks Stripe mettent à jour le plan utilisateur dans Supabase en temps réel.

### Upstash Redis

Cache des réponses Spoonacular pour réduire la consommation d'API et améliorer les temps de réponse.

---

## Design System

Consulter [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) avant de contribuer. Ce document définit les règles de couleurs, typographie, composants, icônes et animations à respecter dans tout le projet.

---

- https://spoonacular.com/food-api
- https://nextjs.org/docs
- https://tailwindcss.com/
- https://supabase.com/docs
- https://next-auth.js.org/
- https://tanstack.com/query/latest
- https://docs.stripe.com/
- https://platform.fatsecret.com
