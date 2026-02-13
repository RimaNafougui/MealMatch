-- PROFILES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique, -- AJOUT: unique constraint
  username text, -- AJOUT: pour affichage
  budget_min numeric check (budget_min >= 0), -- AJOUT: validation
  budget_max numeric check (budget_max >= budget_min), -- AJOUT: validation
  dietary_restrictions text[] default '{}', -- AJOUT: default
  allergies text[] default '{}', -- AJOUT: default
  is_premium boolean default false, -- AJOUT: gestion premium
  premium_expires_at timestamp with time zone, -- AJOUT: expiration premium
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(), -- AJOUT: tracking modifications
  onboarding_completed boolean default false

);

-- SAVED RECIPES
create table saved_recipes (
  id uuid primary key default gen_random_uuid(),
  spoonacular_id integer unique, -- AJOUT: éviter doublons API
  title text not null,
  image_url text,
  prep_time integer check (prep_time > 0), -- AJOUT: validation
  servings integer default 4, -- AJOUT: important pour portions
  calories integer check (calories >= 0), -- AJOUT: validation
  protein numeric, -- AJOUT: macros
  carbs numeric, -- AJOUT: macros
  fat numeric, -- AJOUT: macros
  price_per_serving numeric, -- AJOUT: crucial pour budget
  ingredients jsonb, -- AJOUT: liste ingrédients structurée
  instructions jsonb, -- AJOUT: étapes de préparation
  dietary_tags text[], -- AJOUT: vegan, gluten-free, etc.
  spoonacular_data jsonb, -- Garder pour données brutes complètes
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- MEAL PLANS
create table meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null,
  week_end_date date not null, -- AJOUT: clarté
  meals jsonb not null, -- Structure: {monday: {breakfast: recipe_id, lunch:...}, tuesday:...}
  total_calories integer,
  total_cost numeric, -- AJOUT: coût total du plan
  is_active boolean default true, -- AJOUT: plan actuel vs historique
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint valid_week check (week_end_date > week_start_date), -- AJOUT: validation
  constraint unique_active_plan unique (user_id, week_start_date) -- AJOUT: un seul plan par semaine
);

-- SHOPPING LISTS
create table shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_plan_id uuid references meal_plans(id) on delete cascade, -- CHANGEMENT: cascade au lieu de set null
  items jsonb not null, -- Structure: [{name, quantity, unit, price, checked}]
  total_cost numeric check (total_cost >= 0), -- AJOUT: validation
  is_completed boolean default false, -- AJOUT: statut liste
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone, -- AJOUT: tracking complétion
  updated_at timestamp with time zone default now()
);

-- USER FAVORITES
create table user_favorites (
  user_id uuid references auth.users(id) on delete cascade,
  recipe_id uuid references saved_recipes(id) on delete cascade,
  notes text, -- AJOUT: notes personnelles
  created_at timestamp with time zone default now(),
  primary key (user_id, recipe_id)
);

-- AJOUT: Table pour historique de recherches (analytics/recommendations)
create table search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  search_query text,
  filters_applied jsonb,
  results_count integer,
  created_at timestamp with time zone default now()
);

-- AJOUT: Table pour feedback utilisateur
create table recipe_ratings (
  user_id uuid references auth.users(id) on delete cascade,
  recipe_id uuid references saved_recipes(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default now(),
  primary key (user_id, recipe_id)
);

-- INDEX pour performance
create index idx_meal_plans_user_date on meal_plans(user_id, week_start_date desc);
create index idx_shopping_lists_user on shopping_lists(user_id, created_at desc);
create index idx_user_favorites_user on user_favorites(user_id);
create index idx_saved_recipes_spoonacular on saved_recipes(spoonacular_id);
create index idx_saved_recipes_tags on saved_recipes using gin(dietary_tags);
create index idx_search_history_user on search_history(user_id, created_at desc);

-- Fonction pour auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers pour updated_at
create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();
  
create trigger update_saved_recipes_updated_at before update on saved_recipes
  for each row execute function update_updated_at_column();
  
create trigger update_meal_plans_updated_at before update on meal_plans
  for each row execute function update_updated_at_column();
  
create trigger update_shopping_lists_updated_at before update on shopping_lists
  for each row execute function update_updated_at_column();

-- RLS (Row Level Security)
alter table profiles enable row level security;
alter table meal_plans enable row level security;
alter table shopping_lists enable row level security;
alter table user_favorites enable row level security;
alter table saved_recipes enable row level security;
alter table search_history enable row level security;
alter table recipe_ratings enable row level security;

-- Policies améliorées
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile" -- AJOUT: manquait
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users manage own meal plans"
  on meal_plans for all
  using (auth.uid() = user_id);

create policy "Users manage own shopping lists"
  on shopping_lists for all
  using (auth.uid() = user_id);

create policy "Users manage favorites"
  on user_favorites for all
  using (auth.uid() = user_id);

create policy "Authenticated users read recipes"
  on saved_recipes for select
  to authenticated
  using (true);

create policy "Users manage own search history"
  on search_history for all
  using (auth.uid() = user_id);

create policy "Users manage own ratings"
  on recipe_ratings for all
  using (auth.uid() = user_id);

create policy "Users read all ratings" -- AJOUT: voir ratings des autres
  on recipe_ratings for select
  to authenticated
  using (true);

-- Données de test améliorées
insert into saved_recipes (spoonacular_id, title, image_url, prep_time, servings, calories, protein, carbs, fat, price_per_serving, dietary_tags, ingredients, instructions)
values
(12345, 'Pasta Alfredo', 'https://example.com/pasta.jpg', 25, 4, 650, 18, 75, 32, 3.50, 
 array['vegetarian'], 
 '[{"name": "pasta", "amount": 400, "unit": "g"}, {"name": "cream", "amount": 200, "unit": "ml"}]'::jsonb,
 '[{"step": 1, "description": "Boil pasta"}, {"step": 2, "description": "Make sauce"}]'::jsonb),

(12346, 'Veggie Stir Fry', 'https://example.com/stirfry.jpg', 20, 2, 450, 12, 55, 18, 2.75,
 array['vegan', 'gluten-free'],
 '[{"name": "broccoli", "amount": 200, "unit": "g"}, {"name": "tofu", "amount": 150, "unit": "g"}]'::jsonb,
 '[{"step": 1, "description": "Prep vegetables"}, {"step": 2, "description": "Stir fry"}]'::jsonb),

(12347, 'Chicken Salad', 'https://example.com/salad.jpg', 15, 2, 400, 35, 25, 15, 4.25,
 array['gluten-free', 'high-protein'],
 '[{"name": "chicken breast", "amount": 200, "unit": "g"}, {"name": "lettuce", "amount": 100, "unit": "g"}]'::jsonb,
 '[{"step": 1, "description": "Grill chicken"}, {"step": 2, "description": "Assemble salad"}]'::jsonb);