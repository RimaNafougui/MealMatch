-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  provider text NOT NULL,
  provider_account_id text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT accounts_pkey PRIMARY KEY (id),
  CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  key_hash text NOT NULL,
  label text,
  created_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,
  CONSTRAINT api_keys_pkey PRIMARY KEY (id),
  CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.family_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  dietary_restrictions ARRAY DEFAULT '{}'::text[],
  allergies ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT family_members_pkey PRIMARY KEY (id),
  CONSTRAINT family_members_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);
CREATE TABLE public.meal_plan_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start_date date NOT NULL,
  generated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT meal_plan_usage_pkey PRIMARY KEY (id),
  CONSTRAINT meal_plan_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.meal_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  meals jsonb NOT NULL,
  total_calories integer,
  total_cost numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  days_count integer DEFAULT 5,
  meals_per_day integer DEFAULT 3,
  meal_labels ARRAY DEFAULT ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text],
  status text DEFAULT 'draft'::text,
  generated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT meal_plans_pkey PRIMARY KEY (id),
  CONSTRAINT meal_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.nutritionist_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text])),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT nutritionist_messages_pkey PRIMARY KEY (id),
  CONSTRAINT nutritionist_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.nutritionist_sessions(id)
);
CREATE TABLE public.nutritionist_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Nouvelle conversation'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT nutritionist_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT nutritionist_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  username text,
  budget_min numeric CHECK (budget_min >= 0::numeric),
  budget_max numeric,
  dietary_restrictions ARRAY DEFAULT '{}'::text[],
  allergies ARRAY DEFAULT '{}'::text[],
  premium_expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  name text,
  image text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  meal_plan_days integer DEFAULT 5,
  meal_plan_meals_per_day integer DEFAULT 3,
  birth_year integer,
  sex text CHECK (sex = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])),
  height_cm numeric,
  weight_kg numeric,
  height_unit text DEFAULT 'cm'::text CHECK (height_unit = ANY (ARRAY['cm'::text, 'in'::text])),
  weight_unit text DEFAULT 'kg'::text CHECK (weight_unit = ANY (ARRAY['kg'::text, 'lbs'::text])),
  exercise_days_per_week integer CHECK (exercise_days_per_week >= 0 AND exercise_days_per_week <= 7),
  activity_level text CHECK (activity_level = ANY (ARRAY['sedentary'::text, 'moderately_active'::text, 'very_active'::text])),
  tdee_kcal integer,
  weight_goal text CHECK (weight_goal = ANY (ARRAY['lose'::text, 'maintain'::text, 'gain'::text])),
  goal_weight_kg numeric,
  goal_rate text,
  daily_calorie_target integer,
  macro_protein_pct integer DEFAULT 30 CHECK (macro_protein_pct >= 5 AND macro_protein_pct <= 80),
  macro_carbs_pct integer DEFAULT 40 CHECK (macro_carbs_pct >= 5 AND macro_carbs_pct <= 80),
  macro_fat_pct integer DEFAULT 30 CHECK (macro_fat_pct >= 5 AND macro_fat_pct <= 80),
  plan text NOT NULL DEFAULT 'free'::text CHECK (plan = ANY (ARRAY['free'::text, 'student'::text, 'premium'::text, 'pro'::text])),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  subscription_status text,
  current_period_end timestamp with time zone,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.recipe_ratings (
  user_id uuid NOT NULL,
  recipe_id uuid NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT recipe_ratings_pkey PRIMARY KEY (user_id, recipe_id),
  CONSTRAINT recipe_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT recipe_ratings_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes_catalog(id)
);
CREATE TABLE public.recipes_catalog (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  spoonacular_id integer UNIQUE,
  title text NOT NULL,
  image_url text,
  prep_time integer CHECK (prep_time > 0),
  servings integer DEFAULT 4,
  calories integer CHECK (calories >= 0),
  protein numeric,
  carbs numeric,
  fat numeric,
  price_per_serving numeric,
  ingredients jsonb,
  instructions jsonb,
  dietary_tags ARRAY,
  spoonacular_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_user_created boolean NOT NULL DEFAULT false,
  created_by uuid,
  is_premium boolean DEFAULT false,
  CONSTRAINT recipes_catalog_pkey PRIMARY KEY (id),
  CONSTRAINT recipes_catalog_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.saved_recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipe_id uuid NOT NULL,
  notes text,
  custom_servings integer,
  last_cooked_at timestamp with time zone,
  times_cooked integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_recipes_pkey PRIMARY KEY (id),
  CONSTRAINT saved_recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT saved_recipes_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes_catalog(id)
);
CREATE TABLE public.search_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  search_query text,
  filters_applied jsonb,
  results_count integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT search_history_pkey PRIMARY KEY (id),
  CONSTRAINT search_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.shopping_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  meal_plan_id uuid,
  items jsonb NOT NULL,
  total_cost numeric CHECK (total_cost >= 0::numeric),
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shopping_lists_pkey PRIMARY KEY (id),
  CONSTRAINT shopping_lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT shopping_lists_meal_plan_id_fkey FOREIGN KEY (meal_plan_id) REFERENCES public.meal_plans(id)
);
CREATE TABLE public.user_favorites (
  user_id uuid NOT NULL,
  recipe_id uuid NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_favorites_pkey PRIMARY KEY (user_id, recipe_id),
  CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_favorites_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes_catalog(id)
);
CREATE TABLE public.user_recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  image_url text,
  prep_time integer,
  servings integer DEFAULT 4,
  calories integer,
  protein numeric,
  carbs numeric,
  fat numeric,
  price_per_serving numeric,
  ingredients jsonb DEFAULT '[]'::jsonb,
  instructions jsonb DEFAULT '[]'::jsonb,
  dietary_tags ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_recipes_pkey PRIMARY KEY (id),
  CONSTRAINT user_recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.weight_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  logged_at date NOT NULL DEFAULT CURRENT_DATE,
  weight_kg numeric NOT NULL,
  note text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT weight_logs_pkey PRIMARY KEY (id),
  CONSTRAINT weight_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);