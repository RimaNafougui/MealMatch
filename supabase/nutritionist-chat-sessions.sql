-- ─────────────────────────────────────────────────────────────────────────────
-- Nutritionist chat sessions + messages
-- Run this in the Supabase SQL editor: https://supabase.com/dashboard/project/gabdhieaiydrybvkwwab/sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Chat sessions (one per conversation)
CREATE TABLE IF NOT EXISTS nutritionist_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL DEFAULT 'Nouvelle conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS nutritionist_sessions_user_id_idx
  ON nutritionist_sessions (user_id, updated_at DESC);

-- Messages within a session
CREATE TABLE IF NOT EXISTS nutritionist_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES nutritionist_sessions(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS nutritionist_messages_session_id_idx
  ON nutritionist_messages (session_id, created_at ASC);

-- Auto-update updated_at on sessions
CREATE OR REPLACE FUNCTION update_nutritionist_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE nutritionist_sessions SET updated_at = NOW() WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS nutritionist_message_updates_session ON nutritionist_messages;
CREATE TRIGGER nutritionist_message_updates_session
  AFTER INSERT ON nutritionist_messages
  FOR EACH ROW EXECUTE FUNCTION update_nutritionist_session_timestamp();
