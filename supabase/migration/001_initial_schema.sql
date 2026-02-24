
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
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  username text,
  budget_min numeric CHECK (budget_min >= 0::numeric),
  budget_max numeric,
  dietary_restrictions ARRAY DEFAULT '{}'::text[],
  allergies ARRAY DEFAULT '{}'::text[],
  is_premium boolean DEFAULT false,
  premium_expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  name text,
  image text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  meal_plan_days integer DEFAULT 5,
  meal_plan_meals_per_day integer DEFAULT 3,
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
  CONSTRAINT recipes_catalog_pkey PRIMARY KEY (id)
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