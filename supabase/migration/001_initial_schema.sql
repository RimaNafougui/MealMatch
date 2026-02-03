-- Enable extensions
create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  budget_min numeric,
  budget_max numeric,
  dietary_restrictions text[],
  allergies text[],
  created_at timestamp with time zone default now()
);

-- SAVED RECIPES
create table saved_recipes (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  image_url text,
  prep_time integer,
  calories integer,
  spoonacular_data jsonb,
  created_at timestamp with time zone default now()
);

-- MEAL PLANS
create table meal_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  week_start_date date not null,
  meals jsonb not null,
  total_calories integer,
  created_at timestamp with time zone default now()
);

-- SHOPPING LISTS
create table shopping_lists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  meal_plan_id uuid references meal_plans(id) on delete set null,
  items jsonb not null,
  total_cost numeric,
  created_at timestamp with time zone default now()
);

-- USER FAVORITES
create table user_favorites (
  user_id uuid references auth.users(id) on delete cascade,
  recipe_id uuid references saved_recipes(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, recipe_id)
);

alter table profiles enable row level security;
alter table meal_plans enable row level security;
alter table shopping_lists enable row level security;
alter table user_favorites enable row level security;
alter table saved_recipes enable row level security;

create policy "Users can view own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);

create policy "Users manage own meal plans"
on meal_plans for all
using (auth.uid() = user_id);

create policy "Users manage own shopping lists"
on shopping_lists for all
using (auth.uid() = user_id);

create policy "Users manage favorites"
on user_favorites for all
using (auth.uid() = user_id);

create policy "Read recipes"
on saved_recipes for select
to authenticated
using (true);


insert into saved_recipes (title, image_url, prep_time, calories, spoonacular_data)
values
('Pasta Alfredo', null, 25, 650, '{}'::jsonb),
('Veggie Stir Fry', null, 20, 450, '{}'::jsonb),
('Chicken Salad', null, 15, 400, '{}'::jsonb);

