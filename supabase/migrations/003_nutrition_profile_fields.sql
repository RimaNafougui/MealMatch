-- Migration: Add nutrition & body metrics fields to profiles
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gabdhieaiydrybvkwwab/sql/new

ALTER TABLE public.profiles
  -- Body metrics
  ADD COLUMN IF NOT EXISTS birth_year          integer,
  ADD COLUMN IF NOT EXISTS sex                 text CHECK (sex IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS height_cm           numeric,          -- always stored in cm
  ADD COLUMN IF NOT EXISTS weight_kg           numeric,          -- always stored in kg
  ADD COLUMN IF NOT EXISTS height_unit         text DEFAULT 'cm' CHECK (height_unit IN ('cm', 'in')),
  ADD COLUMN IF NOT EXISTS weight_unit         text DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),

  -- Activity
  ADD COLUMN IF NOT EXISTS exercise_days_per_week integer CHECK (exercise_days_per_week BETWEEN 0 AND 7),
  ADD COLUMN IF NOT EXISTS activity_level      text CHECK (activity_level IN ('sedentary', 'moderately_active', 'very_active')),
  -- sedentary        = ≤ 5 000 steps/day
  -- moderately_active= 5 000 – 15 000 steps/day
  -- very_active      = ≥ 15 000 steps/day

  -- Calculated TDEE (total daily energy expenditure) — stored after calculation
  ADD COLUMN IF NOT EXISTS tdee_kcal           integer,

  -- Weight goal
  ADD COLUMN IF NOT EXISTS weight_goal         text CHECK (weight_goal IN ('lose', 'maintain', 'gain')),
  ADD COLUMN IF NOT EXISTS goal_weight_kg      numeric,          -- always stored in kg
  ADD COLUMN IF NOT EXISTS goal_rate           text,
  -- e.g. '0.25kg_week' | '0.5kg_week' | '1kg_week' | '0.25kg_2weeks' etc.

  -- Calculated daily calorie target
  ADD COLUMN IF NOT EXISTS daily_calorie_target integer;
