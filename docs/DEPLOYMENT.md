# Deployment — MealMatch

MealMatch is deployed on **Vercel** with **Supabase** as the database backend. The deployment pipeline is automatic: every push to `main` triggers a production deploy on Vercel.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deploying to Vercel](#deploying-to-vercel)
- [Supabase Setup](#supabase-setup)
- [Stripe Setup](#stripe-setup)
- [Upstash Redis Setup](#upstash-redis-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
GitHub (main branch)
    │
    │  push / merge PR
    ▼
Vercel (auto-deploy)
    │
    ├── Next.js build (Turbopack)
    ├── Edge/Node API routes
    └── Static assets → CDN
            │
            ├── Supabase (PostgreSQL) ← Database
            ├── Upstash Redis         ← Cache
            ├── OpenAI                ← AI generation
            ├── Spoonacular           ← Recipe data
            └── Stripe                ← Payments
```

---

## Prerequisites

Accounts required before deploying:

| Service | Free tier | Purpose |
|---|---|---|
| [Vercel](https://vercel.com) | Yes | Hosting + CI/CD |
| [Supabase](https://supabase.com) | Yes (500MB) | Database + Auth |
| [Upstash](https://upstash.com) | Yes (10k req/day) | Redis cache |
| [Spoonacular](https://spoonacular.com/food-api) | Yes (150 req/day) | Recipes |
| [OpenAI](https://platform.openai.com) | No (pay-per-use) | AI features |
| [Stripe](https://stripe.com) | Yes (test mode) | Payments |

---

## Environment Variables

Set all of the following in Vercel's project settings (`Settings → Environment Variables`) for **Production**, **Preview**, and **Development** environments.

### Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> **Where to find:** Supabase Dashboard → Project Settings → API

### NextAuth

```env
AUTH_SECRET=<random-64-char-string>
AUTH_URL=https://your-domain.vercel.app

AUTH_GOOGLE_ID=<from Google Cloud Console>
AUTH_GOOGLE_SECRET=<from Google Cloud Console>

AUTH_GITHUB_ID=<from GitHub OAuth App>
AUTH_GITHUB_SECRET=<from GitHub OAuth App>
```

> **Generate AUTH_SECRET:** `openssl rand -base64 32`

> **Google OAuth:** [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client ID
>
> **GitHub OAuth:** [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App

### Spoonacular

```env
SPOONACULAR_API_KEY=<from spoonacular.com/food-api/console-dashboard>
```

### OpenAI

```env
OPENAI_API_KEY=sk-...
```

> **Where to find:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Stripe

```env
STRIPE_SECRET_KEY=sk_live_...          # or sk_test_... for staging
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> **Where to find:** [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
>
> **Webhook secret:** Created when setting up the webhook endpoint (see Stripe Setup section)

### Upstash Redis

```env
UPSTASH_REDIS_REST_URL=https://[region].upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...
```

> **Where to find:** [console.upstash.com](https://console.upstash.com) → Select Redis database → REST API

---

## Deploying to Vercel

### First Deployment

1. **Push the project to GitHub** (if not already done)

2. **Import on Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select "Import Git Repository"
   - Select your `MealMatch` repository
   - Framework: **Next.js** (auto-detected)

3. **Add environment variables** (all variables listed above)

4. **Deploy** — Vercel runs `pnpm build` and deploys automatically

5. **Set your domain** in Vercel Project Settings → Domains

### Subsequent Deployments

Every push to `main` automatically triggers a new production deployment. Pull requests generate **Preview deployments** with unique URLs for testing.

```bash
# To deploy manually via CLI:
npm i -g vercel
vercel --prod
```

---

## Supabase Setup

### 1. Create a Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your Vercel deployment region
3. Note your **Project URL** and **API keys**

### 2. Apply the Database Schema

Run the migration files in order in the Supabase SQL editor:

```bash
# Option A: Supabase CLI (recommended)
supabase login
supabase link --project-ref [your-project-ref]
supabase db push

# Option B: Manual — paste each file into the SQL editor:
# 1. supabase/DBSchema.sql
# 2. supabase/plan-gating-migration.sql
# 3. supabase/nutritionist-chat-sessions.sql
```

### 3. Enable Row Level Security

RLS is configured in the migration files. Verify via:
- Supabase Dashboard → Table Editor → Select a table → RLS tab

### 4. Configure OAuth Providers (Optional)

If using Supabase Auth directly (not NextAuth), configure OAuth providers under:
- Authentication → Providers → Enable Google / GitHub

> **Note:** MealMatch uses **NextAuth.js** for authentication, not Supabase Auth directly. Supabase is used only as the database.

### 5. Seed the Recipe Catalog

```bash
# After setting up your .env.local:
pnpm seed:recipes
```

This populates `recipes_catalog` with recipes from Spoonacular.

---

## Stripe Setup

### 1. Create Products and Prices

In the [Stripe Dashboard](https://dashboard.stripe.com):

1. Go to **Products** → Add product
2. Create two products:
   - **MealMatch Étudiant** — monthly recurring price
   - **MealMatch Premium** — monthly recurring price
3. Note the **Price IDs** (`price_...`) for each

4. Update the price ID mapping in `app/api/stripe/checkout/route.ts`:
```typescript
const PRICE_IDS: Record<string, string> = {
  student: "price_xxxxx",   // ← your actual Stripe price ID
  premium: "price_xxxxx",   // ← your actual Stripe price ID
};
```

### 2. Configure the Customer Portal

Go to [dashboard.stripe.com/settings/billing/portal](https://dashboard.stripe.com/settings/billing/portal) and enable:
- Allow customers to cancel subscriptions
- Allow customers to update payment methods

### 3. Set Up Webhooks

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. **Endpoint URL:** `https://your-domain.vercel.app/api/stripe/webhook`
3. **Events to listen for:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
4. Copy the **Signing secret** → add as `STRIPE_WEBHOOK_SECRET`

### 4. Test Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login and forward events
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger a test event
stripe trigger customer.subscription.created
```

---

## Upstash Redis Setup

1. Go to [console.upstash.com](https://console.upstash.com) → Create Database
2. Choose **Regional** (single region, lower latency) or **Global**
3. Select a region matching your Vercel deployment
4. Copy **REST URL** and **REST Token** to environment variables

**Verify connection:**
```bash
curl -X POST https://[your-url].upstash.io/set/test/hello \
  -H "Authorization: Bearer [your-token]"
```

---

## CI/CD Pipeline

MealMatch uses **Vercel's built-in CI/CD**:

```
Developer → git push origin feature/...
    │
    ▼
GitHub Pull Request
    │
    ├── Vercel Preview Deploy (auto)
    │       URL: https://mealmatch-git-feature-xxx.vercel.app
    │
    └── Code review + merge to main
                │
                ▼
        Vercel Production Deploy (auto)
                URL: https://mealmatch.vercel.app
```

### Lint Check (Manual)

```bash
pnpm lint        # ESLint with auto-fix
pnpm build       # Type check + Next.js build
```

> **Recommended:** Add a GitHub Actions workflow for automated lint/build checks on PRs:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
      # ... other required env vars
```

---

## Monitoring

### Vercel Analytics

Enable in Vercel Dashboard → Your Project → Analytics:
- Web Vitals (FCP, LCP, CLS, TTI)
- Deployment logs
- Function logs (API routes)

### Supabase Monitoring

- Dashboard → Reports → API usage
- Table → RLS violations (if any)
- Logs → PostgREST errors

### Upstash

- Console → Redis → Metrics (requests/sec, latency, memory)

### Recommended: Sentry (Optional)

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add `SENTRY_DSN` to environment variables for error tracking.

---

## Troubleshooting

### Build Fails: "Module not found"

```bash
# Clean install
rm -rf node_modules .next
pnpm install
pnpm build
```

### `AUTH_SECRET` Error in Production

Ensure `AUTH_SECRET` is set in Vercel environment variables for **all** environments (Production, Preview, Development).

### Supabase Connection Refused

- Check that `NEXT_PUBLIC_SUPABASE_URL` does not have a trailing slash
- Verify `SUPABASE_SERVICE_ROLE_KEY` is the service role key, not the anon key
- Check Supabase project is not paused (free tier pauses after 1 week of inactivity)

### Stripe Webhook Returns 400

- Verify `STRIPE_WEBHOOK_SECRET` matches the secret from the Stripe Dashboard webhook endpoint
- Check that the endpoint URL is correct (must be the production URL for live webhooks)
- Ensure the webhook endpoint handles raw body (Next.js App Router handles this automatically)

### OpenAI Rate Limit (429)

- The free tier has very low rate limits — upgrade to a pay-as-you-go plan
- Meal plan generation is already rate-limited per user to prevent abuse

### Upstash Rate Limit Exceeded

- Free tier: 10,000 requests/day. Monitor in Upstash console.
- Increase TTL values in `utils/redis.ts` to reduce cache misses:
```typescript
export const TTL = {
  RECIPES: 60 * 60 * 2,     // 2 hours (was 1 hour)
  MEAL_PLAN: 60 * 30,        // 30 minutes (was 15)
};
```

### Spoonacular Quota Exceeded (402)

- Free tier: 150 requests/day. The recipe seeding script may consume most of the quota.
- Run `pnpm seed:recipes` only once, or upgrade to a paid Spoonacular plan.
- All catalog queries go through Redis cache, minimizing live API calls.

### Images Not Loading from Google/GitHub

Ensure `next.config.ts` has the correct `remotePatterns`:
```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "avatars.githubusercontent.com" },
    { protocol: "https", hostname: "lh3.googleusercontent.com" },
    { protocol: "https", hostname: "img.spoonacular.com" },
  ],
},
```
