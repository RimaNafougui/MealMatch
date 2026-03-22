<p align="center">
  <img src="./public/favicon.ico" width="80" alt="MealMatch Logo" />
</p>

<h1 align="center">MealMatch</h1>

<p align="center">
  <strong>Planification de repas intelligente pour étudiants — propulsée par l'IA</strong>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js 16" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white" alt="Supabase" /></a>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

<p align="center">
  <a href="#-aperçu">Aperçu</a> ·
  <a href="#-fonctionnalités">Fonctionnalités</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-installation">Installation</a> ·
  <a href="#-équipe">Équipe</a>
</p>

---

## 🍽️ À propos de MealMatch

MealMatch est une application web de planification de repas conçue pour les **étudiants**. Elle résout le problème quotidien de savoir quoi manger tout en respectant un budget serré, en combinant l'intelligence artificielle, une base de milliers de recettes et des outils pratiques comme la liste d'épicerie automatique et le suivi nutritionnel.

**Problème résolu :** Les étudiants manquent de temps, d'argent et d'inspiration pour bien manger. MealMatch génère en quelques secondes un plan de repas hebdomadaire personnalisé selon leur budget, leurs restrictions alimentaires et leurs préférences — sans effort.

**Utilisateurs cibles :** Étudiants, jeunes professionnels, toute personne voulant mieux manger sans se prendre la tête.

---

## ✨ Fonctionnalités

|     | Fonctionnalité                      | Description                                                                                                         |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 🤖  | **Génération IA de plans de repas** | Plan hebdomadaire personnalisé généré par GPT-4o-mini selon le budget, les allergies et les objectifs nutritionnels |
| 🔍  | **Exploration de recettes**         | Recherche avancée filtrée par type de repas, régime alimentaire, allergies, calories et budget                      |
| 🛒  | **Liste d'épicerie automatique**    | Générée depuis le plan de repas, organisée par rayon (Premium)                                                      |
| 📊  | **Suivi nutritionnel**              | Calories, protéines, glucides, lipides — avec graphiques et progression (Student+)                                  |
| ⭐  | **Favoris**                         | Sauvegarde et retrouver ses recettes préférées                                                                      |
| 🧑‍🍳  | **Recettes personnelles**           | Créer et gérer ses propres recettes                                                                                 |
| 🧠  | **Nutritionniste IA**               | Chat avec un assistant IA spécialisé en nutrition (Premium)                                                         |
| 👨‍👩‍👧  | **Gestion de la famille**           | Plans de repas adaptés à chaque membre de la famille (Premium)                                                      |
| 📅  | **Export calendrier**               | Exporter le plan de repas au format .ics (Premium)                                                                  |
| 🔐  | **Authentification sécurisée**      | Google, GitHub ou courriel + mot de passe                                                                           |
| 🌙  | **Thème clair / sombre**            | Basculement manuel ou automatique                                                                                   |
| 📱  | **Entièrement responsive**          | Optimisé mobile, tablette et bureau                                                                                 |

---

## 📸 Aperçu

| Landing Page                                          | Onboarding                                         |
| ----------------------------------------------------- | -------------------------------------------------- |
| ![Landing Page](./public/screenshots/LandingPage.png) | ![Onboarding](./public/screenshots/Onboarding.png) |

| Dashboard                                        | Explore                                      |
| ------------------------------------------------ | -------------------------------------------- |
| ![Dashboard](./public/screenshots/Dashboard.png) | ![Explore](./public/screenshots/Explore.png) |

---

## 🚀 Tech Stack

### Frontend

| Outil                                                     | Rôle                                            |
| --------------------------------------------------------- | ----------------------------------------------- |
| [Next.js 16](https://nextjs.org) (App Router + Turbopack) | Framework React avec rendu hybride              |
| [TypeScript](https://www.typescriptlang.org)              | Typage statique                                 |
| [Tailwind CSS v4](https://tailwindcss.com)                | Styling utility-first                           |
| [HeroUI](https://www.heroui.com)                          | Composants UI accessibles (basé sur React Aria) |
| [Poppins](https://fonts.google.com/specimen/Poppins)      | Police principale (via next/font)               |
| [lucide-react](https://lucide.dev)                        | Icônes                                          |
| [framer-motion](https://www.framer.com/motion/)           | Animations et transitions                       |
| [sonner](https://sonner.emilkowal.ski/)                   | Notifications toast                             |

### Backend & Services

| Outil                                               | Rôle                                               |
| --------------------------------------------------- | -------------------------------------------------- |
| [Supabase](https://supabase.com)                    | Base de données PostgreSQL + Auth                  |
| [NextAuth v5](https://authjs.dev)                   | Authentification JWT (Google, GitHub, Credentials) |
| [OpenAI GPT-4o-mini](https://platform.openai.com)   | Génération de plans de repas et nutritionniste IA  |
| [Spoonacular API](https://spoonacular.com/food-api) | Catalogue de recettes et données nutritionnelles   |
| [Stripe](https://stripe.com)                        | Abonnements et paiements                           |
| [Upstash Redis](https://upstash.com)                | Cache des réponses API                             |

### State & Data

| Outil                                                                   | Rôle                                 |
| ----------------------------------------------------------------------- | ------------------------------------ |
| [TanStack Query v5](https://tanstack.com/query)                         | Cache et synchronisation des données |
| [react-hook-form](https://react-hook-form.com) + [Zod](https://zod.dev) | Formulaires et validation            |

### Déploiement

| Outil                        | Rôle                               |
| ---------------------------- | ---------------------------------- |
| [Vercel](https://vercel.com) | Hébergement et déploiement continu |

---

## 🛠️ Installation

### Prérequis

- **Node.js** 20+
- **pnpm** — `npm install -g pnpm`
- Comptes : [Supabase](https://supabase.com), [Spoonacular](https://spoonacular.com/food-api), [Stripe](https://stripe.com), [Upstash](https://upstash.com), [OpenAI](https://platform.openai.com)

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/RimaNafougui/MealMatch.git
cd MealMatch

# 2. Installer les dépendances
pnpm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# → Remplir .env.local (voir section ci-dessous)

# 4. Lancer le serveur de développement
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Scripts disponibles

```bash
pnpm dev          # Démarrage en développement (Turbopack)
pnpm build        # Build de production
pnpm start        # Serveur de production
pnpm lint         # Lint + auto-fix
pnpm seed:recipes # Seeder les recettes en base de données
```

---

## 🔑 Variables d'environnement

Créer un fichier `.env.local` à la racine avec les variables suivantes :

```env
# ── Supabase ──────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ── NextAuth ──────────────────────────────────────────
AUTH_SECRET=                        # openssl rand -base64 32
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# ── Spoonacular ───────────────────────────────────────
SPOONACULAR_API_KEY=

# ── OpenAI ────────────────────────────────────────────
OPENAI_API_KEY=

# ── Stripe ────────────────────────────────────────────
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# ── Upstash Redis ─────────────────────────────────────
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> **Note :** Ne jamais committer `.env.local`. Il est inclus dans `.gitignore`.

---

## 🗄️ Schéma de base de données

Les migrations Supabase se trouvent dans `supabase/migrations/`.

**Tables principales :**

| Table                   | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `profiles`              | Profil utilisateur (plan, préférences, métriques corporelles) |
| `recipes_catalog`       | Catalogue de recettes (depuis Spoonacular)                    |
| `user_recipes`          | Recettes créées par les utilisateurs                          |
| `saved_recipes`         | Recettes sauvegardées par l'utilisateur                       |
| `favorites`             | Favoris de l'utilisateur                                      |
| `meal_plans`            | Plans de repas hebdomadaires générés                          |
| `meal_plan_usage`       | Suivi de l'utilisation mensuelle (gating)                     |
| `shopping_lists`        | Listes d'épicerie liées aux plans de repas                    |
| `family_members`        | Membres de la famille (Premium)                               |
| `nutritionist_sessions` | Sessions de chat avec le nutritionniste IA (Premium)          |
| `nutritionist_messages` | Messages du chat nutritionniste                               |

---

## 📡 Routes API

**Authentification**

- `POST /api/auth/[...nextauth]` — Handlers NextAuth (Google, GitHub, Credentials)
- `GET /api/auth/check-credentials` — Vérification des identifiants

**Recettes**

- `GET /api/recipes/catalog` — Liste paginée avec filtres
- `GET /api/recipes/catalog/[id]` — Détail d'une recette
- `GET /api/recipes/user` — Recettes créées par l'utilisateur
- `POST /api/recipes/user` — Créer une recette

**Plans de repas**

- `POST /api/meal-plan/generate` — Générer un plan IA
- `GET /api/meal-plan/[id]` — Détail d'un plan
- `DELETE /api/meal-plan/[id]` — Supprimer un plan
- `GET /api/meal-plan/current` — Plan de la semaine courante
- `POST /api/meal-plan/repeat` — Répéter un plan existant
- `GET /api/meal-plan/config` — Configuration de génération

**Shopping & Favoris**

- `GET/POST /api/shopping-lists` — Listes d'épicerie
- `POST /api/shopping-lists/generate` — Générer depuis un plan
- `POST/DELETE/PATCH /api/shopping-lists/[id]/items` — Gestion des items
- `GET/POST/DELETE /api/favorites` — Favoris

**Fonctionnalités Premium**

- `GET/POST /api/nutritionist/sessions` — Sessions nutritionniste
- `GET/DELETE /api/nutritionist/sessions/[id]` — Session individuelle
- `POST /api/nutritionist` — Envoyer un message au nutritionniste IA
- `GET/POST/DELETE /api/family` — Membres de la famille
- `GET /api/calendar/export` — Export .ics du plan de repas

**Utilisateur & Abonnement**

- `GET /api/user/plan` — Plan actuel de l'utilisateur
- `GET /api/user/subscription` — Détails de l'abonnement Stripe
- `POST /api/stripe/portal` — Portail client Stripe

---

## 🤝 Contribuer

1. **Fork** le dépôt
2. **Créer** une branche feature : `git checkout -b feature/ma-fonctionnalite`
3. **Lire** [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) avant de modifier l'interface
4. **Committer** les changements : `git commit -m "feat: ajouter ma fonctionnalité"`
5. **Push** : `git push origin feature/ma-fonctionnalite`
6. **Ouvrir** une Pull Request vers `main`

**Conventions de commit :**

```
feat:     Nouvelle fonctionnalité
fix:      Correction de bug
refactor: Refactoring sans changement fonctionnel
style:    Changements de style/CSS
docs:     Documentation
chore:    Maintenance (deps, config)
```

---

## 💎 Plans & Tarification

| Fonctionnalité           |   Gratuit   | Étudiant  |   Premium    |
| ------------------------ | :---------: | :-------: | :----------: |
| Exploration de recettes  | ✅ (50 max) |    ✅     |      ✅      |
| Génération de plans IA   |   5/mois    |    ✅     |      ✅      |
| Liste d'épicerie         |   Basique   | Organisée | Intelligente |
| Suivi nutritionnel       |      —      |    ✅     |      ✅      |
| Export PDF plan          |      —      |    ✅     |      ✅      |
| Nutritionniste IA        |      —      |     —     |      ✅      |
| Gestion famille          |      —      |     —     |      ✅      |
| Export calendrier (.ics) |      —      |     —     |      ✅      |
| Favoris                  |   10 max    |    ✅     |      ✅      |

---

## 👥 Équipe

| Membre                  | Rôle                        | GitHub                                             |
| ----------------------- | --------------------------- | -------------------------------------------------- |
| **Rima Nafougui**       | Scrum Master & Développeure | [@RimaNafougui](https://github.com/RimaNafougui)   |
| **Jimmy Chhan**         | Développeur                 | [@JimmyChhan](https://github.com/JimmyChhan)       |
| **Charly Smith Alcide** | Développeur                 | [@AlcideCharly](https://github.com/alcidecharly)   |
| **Julien Guibord**      | Développeur & Testeur       | [@JulienGuibord](https://github.com/JulienGuibord) |

---

## 📄 Licence

Ce projet est distribué sous la licence **MIT**. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- [Cégep Ahuntsic](https://www.collegeahuntsic.qc.ca/) — projet réalisé dans le cadre du programme Techniques de l'informatique
- [Spoonacular](https://spoonacular.com/food-api) — API de recettes et données nutritionnelles
- [Supabase](https://supabase.com) — base de données et authentification
- [Stripe](https://stripe.com) — infrastructure de paiement
- [OpenAI](https://platform.openai.com) — modèles de langage pour la génération IA
- [HeroUI](https://www.heroui.com) — bibliothèque de composants UI
- [Vercel](https://vercel.com) — hébergement et déploiement

---

<p align="center">
  Fait avec ❤️ par l'équipe MealMatch · Cégep Ahuntsic
</p>
