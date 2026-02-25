    -- Migration: Weight logs table + macro targets on profiles
    -- Run in Supabase SQL Editor:
    -- https://supabase.com/dashboard/project/gabdhieaiydrybvkwwab/sql/new

    -- 1. Daily weight log table
    CREATE TABLE IF NOT EXISTS public.weight_logs (
      id          uuid NOT NULL DEFAULT gen_random_uuid(),
      user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      logged_at   date NOT NULL DEFAULT CURRENT_DATE,
      weight_kg   numeric NOT NULL,
      note        text,
      created_at  timestamp with time zone DEFAULT now(),
      CONSTRAINT weight_logs_pkey PRIMARY KEY (id),
      CONSTRAINT weight_logs_user_date_unique UNIQUE (user_id, logged_at)
    );

    ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage own weight logs"
      ON public.weight_logs
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    -- 2. Macro target percentages on profiles (must sum to 100)
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS macro_protein_pct integer DEFAULT 30
        CHECK (macro_protein_pct BETWEEN 5 AND 80),
      ADD COLUMN IF NOT EXISTS macro_carbs_pct   integer DEFAULT 40
        CHECK (macro_carbs_pct   BETWEEN 5 AND 80),
      ADD COLUMN IF NOT EXISTS macro_fat_pct     integer DEFAULT 30
        CHECK (macro_fat_pct     BETWEEN 5 AND 80);
