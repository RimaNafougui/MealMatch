-- Plan Gating Feature Migration
-- Run these statements in your Supabase SQL editor

-- 1. Add is_premium column to recipes_catalog (for premium-only recipes)
ALTER TABLE public.recipes_catalog
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- 2. Family members table (premium feature)
CREATE TABLE IF NOT EXISTS public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  dietary_restrictions text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS family_members_owner_id_idx ON public.family_members(owner_id);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'family_members' AND policyname = 'family_members_owner_select'
  ) THEN
    CREATE POLICY "family_members_owner_select" ON public.family_members
      FOR SELECT USING (auth.uid() = owner_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'family_members' AND policyname = 'family_members_owner_insert'
  ) THEN
    CREATE POLICY "family_members_owner_insert" ON public.family_members
      FOR INSERT WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'family_members' AND policyname = 'family_members_owner_delete'
  ) THEN
    CREATE POLICY "family_members_owner_delete" ON public.family_members
      FOR DELETE USING (auth.uid() = owner_id);
  END IF;
END $$;

-- 3. API keys table (premium developer access)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash text NOT NULL,
  label text,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz
);

CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON public.api_keys(user_id);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'api_keys' AND policyname = 'api_keys_owner_select'
  ) THEN
    CREATE POLICY "api_keys_owner_select" ON public.api_keys
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'api_keys' AND policyname = 'api_keys_owner_insert'
  ) THEN
    CREATE POLICY "api_keys_owner_insert" ON public.api_keys
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'api_keys' AND policyname = 'api_keys_owner_delete'
  ) THEN
    CREATE POLICY "api_keys_owner_delete" ON public.api_keys
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
