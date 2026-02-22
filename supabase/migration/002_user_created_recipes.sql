-- Migration: Create a separate table for user-created recipes
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.user_recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  image_url text,
  prep_time integer CHECK (prep_time > 0),
  servings integer DEFAULT 4,
  calories integer CHECK (calories >= 0),
  protein numeric,
  carbs numeric,
  fat numeric,
  price_per_serving numeric,
  ingredients jsonb DEFAULT '[]'::jsonb,
  instructions jsonb DEFAULT '[]'::jsonb,
  dietary_tags text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_recipes_pkey PRIMARY KEY (id)
);

-- Index for fast per-user lookup
CREATE INDEX IF NOT EXISTS idx_user_recipes_user_id
  ON public.user_recipes(user_id);

-- Enable RLS
ALTER TABLE public.user_recipes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own recipes
CREATE POLICY "Users can view their own recipes"
  ON public.user_recipes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own recipes
CREATE POLICY "Users can insert their own recipes"
  ON public.user_recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own recipes
CREATE POLICY "Users can update their own recipes"
  ON public.user_recipes
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete their own recipes
CREATE POLICY "Users can delete their own recipes"
  ON public.user_recipes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
