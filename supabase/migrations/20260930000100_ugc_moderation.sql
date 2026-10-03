-- ============================================================================
-- Kodax — User-generated content moderation for published code/projects
-- ============================================================================
-- Published snippets/projects are user content that other people can open and
-- run, so they get: report, block, unpublish, auto-hide after repeated
-- reports, and admin moderation. Nothing existing is deleted.
-- Requires is_admin() (created in 20260930000000_free_coins_system.sql).
-- Idempotent.
-- ============================================================================

BEGIN;

ALTER TABLE code_snippets ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE code_snippets ADD COLUMN IF NOT EXISTS report_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE code_snippets ADD COLUMN IF NOT EXISTS hidden_reason TEXT;

-- ----------------------------------------------------------------------------
-- Reports
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snippet_id UUID NOT NULL REFERENCES code_snippets(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN
    ('spam', 'phishing', 'malicious', 'offensive', 'copyright', 'other')),
  details TEXT CHECK (details IS NULL OR length(details) <= 500),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reporter_id, snippet_id)
);
CREATE INDEX IF NOT EXISTS idx_content_reports_snippet ON content_reports (snippet_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports (status, created_at DESC);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS content_reports_select ON content_reports;
DROP POLICY IF EXISTS content_reports_admin_update ON content_reports;
CREATE POLICY content_reports_select ON content_reports
  FOR SELECT USING (reporter_id = auth.uid() OR is_admin());
CREATE POLICY content_reports_admin_update ON content_reports
  FOR UPDATE USING (is_admin());
-- Inserts only through report_snippet().

-- ----------------------------------------------------------------------------
-- Blocks
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_blocks_own ON user_blocks;
CREATE POLICY user_blocks_own ON user_blocks
  FOR ALL USING (blocker_id = auth.uid()) WITH CHECK (blocker_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Visibility: hidden snippets are only visible to their owner and admins.
-- ----------------------------------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'code_snippets' AND cmd = 'SELECT' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.code_snippets', r.policyname);
  END LOOP;
END $$;
CREATE POLICY code_snippets_visible ON code_snippets
  FOR SELECT USING (
    (is_public = TRUE AND is_hidden = FALSE)
    OR auth.uid() = user_id
    OR is_admin()
  );

-- Owners must not be able to un-hide a moderated snippet themselves.
CREATE OR REPLACE FUNCTION _protect_snippet_moderation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT is_admin() AND current_setting('kodax.moderation', true) IS DISTINCT FROM 'on' THEN
    NEW.is_hidden := OLD.is_hidden;
    NEW.report_count := OLD.report_count;
    NEW.hidden_reason := OLD.hidden_reason;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_protect_snippet_moderation ON code_snippets;
CREATE TRIGGER trg_protect_snippet_moderation
  BEFORE UPDATE ON code_snippets
  FOR EACH ROW EXECUTE FUNCTION _protect_snippet_moderation();

-- ----------------------------------------------------------------------------
-- RPCs
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION report_snippet(p_snippet_id UUID, p_reason TEXT, p_details TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_owner UUID;
  v_count INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  SELECT user_id INTO v_owner FROM code_snippets WHERE id = p_snippet_id;
  IF v_owner IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_found');
  END IF;
  IF v_owner = v_uid THEN
    RETURN jsonb_build_object('success', false, 'code', 'own_content');
  END IF;

  INSERT INTO content_reports (reporter_id, snippet_id, reason, details)
  VALUES (v_uid, p_snippet_id, p_reason, NULLIF(left(p_details, 500), ''))
  ON CONFLICT (reporter_id, snippet_id) DO NOTHING;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', true, 'duplicate', true);
  END IF;

  SELECT COUNT(*) INTO v_count FROM content_reports
  WHERE snippet_id = p_snippet_id AND status = 'open';

  PERFORM set_config('kodax.moderation', 'on', true);
  UPDATE code_snippets SET
    report_count = v_count,
    -- auto-hide pending review: 3 reports, or 1 report for phishing/malicious
    is_hidden = is_hidden OR v_count >= 3 OR p_reason IN ('phishing', 'malicious'),
    hidden_reason = CASE
      WHEN is_hidden THEN hidden_reason
      WHEN v_count >= 3 OR p_reason IN ('phishing', 'malicious') THEN 'auto:reports'
      ELSE hidden_reason END
  WHERE id = p_snippet_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION admin_moderate_snippet(p_snippet_id UUID, p_action TEXT, p_note TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'code', 'forbidden');
  END IF;
  PERFORM set_config('kodax.moderation', 'on', true);
  IF p_action = 'hide' THEN
    UPDATE code_snippets SET is_hidden = TRUE, hidden_reason = COALESCE(p_note, 'admin') WHERE id = p_snippet_id;
    UPDATE content_reports SET status = 'reviewed' WHERE snippet_id = p_snippet_id AND status = 'open';
  ELSIF p_action = 'restore' THEN
    UPDATE code_snippets SET is_hidden = FALSE, hidden_reason = NULL, report_count = 0 WHERE id = p_snippet_id;
    UPDATE content_reports SET status = 'dismissed' WHERE snippet_id = p_snippet_id AND status = 'open';
  ELSIF p_action = 'delete' THEN
    DELETE FROM code_snippets WHERE id = p_snippet_id;
  ELSE
    RETURN jsonb_build_object('success', false, 'code', 'invalid_action');
  END IF;
  RETURN jsonb_build_object('success', true);
END;
$$;

DO $$
DECLARE f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY['report_snippet(uuid, text, text)', 'admin_moderate_snippet(uuid, text, text)'] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;
END $$;

COMMIT;
