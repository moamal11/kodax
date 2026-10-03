-- ============================================================================
-- Phases E–J: خلفية لوحة الإدارة (كل الدوال: مشرف فقط عبر auth.uid() + سجل تدقيق)
-- ----------------------------------------------------------------------------
--  1) admin_audit_log + _admin_audit
--  2) التوثيق: profiles.is_verified (لا يعدّله إلا المشرف) + admin_set_verified
--  3) تعديل الكوينات: admin_adjust_coins (سبب إلزامي، idempotent، عبر _coins_apply)
--  4) الإشراف: نموذج عتبة للبلاغات + بلاغات المستخدمين/الرسائل + مراجعة المشرف
--  5) المحتوى: نظرة على الدورات/الدروس/التحديات + المتطلبات المسبقة (مع تحقق) + كشف الحل (مسجّل)
--  6) المستخدمون: قائمة وتفاصيل (بريد وآخر دخول من auth.users للمشرف فقط)
--  7) لوحة الإحصاءات: أرقام محسوبة من الجداول الفعلية بتوقيت بغداد، وما لا يُحسب يُعلَن unavailable
-- لا حذف بيانات. لا تغيير في قيم المكافآت.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) سجل التدقيق
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  reason TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON admin_audit_log (target_type, target_id);
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON admin_audit_log FROM anon, authenticated;
GRANT SELECT ON admin_audit_log TO authenticated;
DROP POLICY IF EXISTS admin_audit_log_admin_read ON admin_audit_log;
CREATE POLICY admin_audit_log_admin_read ON admin_audit_log FOR SELECT TO authenticated USING (is_admin());

CREATE OR REPLACE FUNCTION public._admin_audit(p_action TEXT, p_target_type TEXT, p_target_id TEXT, p_reason TEXT, p_details JSONB DEFAULT '{}'::jsonb)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO admin_audit_log (actor_id, action, target_type, target_id, reason, details)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, NULLIF(LEFT(p_reason, 500), ''), COALESCE(p_details, '{}'::jsonb));
$$;
REVOKE ALL ON FUNCTION public._admin_audit(TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;

-- مشرف حقيقي من الجلسة (لا يُقبل معرّف من العميل)
CREATE OR REPLACE FUNCTION public._require_admin()
RETURNS UUID LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v UUID := auth.uid();
BEGIN
  IF v IS NULL OR NOT is_admin(v) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN v;
END;
$$;
REVOKE ALL ON FUNCTION public._require_admin() FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2) التوثيق
-- ----------------------------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_by UUID;

CREATE OR REPLACE FUNCTION public._protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') AND NOT is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.xp := 0;
      NEW.level := 1;
      NEW.is_purchase_blocked := FALSE;
      NEW.streak_days := 0;
      NEW.is_banned := FALSE;
      NEW.ban_reason := NULL;
      NEW.banned_at := NULL;
      NEW.banned_by := NULL;
      NEW.followers_count := 0;
      NEW.following_count := 0;
      NEW.store_credits := 0;
      NEW.xp_points := 0;
      NEW.ai_solve_uses_remaining := 3;
      NEW.ai_explain_uses_remaining := 3;
      NEW.is_verified := FALSE;
      NEW.verified_at := NULL;
      NEW.verified_by := NULL;
    ELSE
      NEW.xp := OLD.xp;
      NEW.level := OLD.level;
      NEW.is_purchase_blocked := OLD.is_purchase_blocked;
      NEW.streak_days := OLD.streak_days;
      NEW.is_banned := OLD.is_banned;
      NEW.ban_reason := OLD.ban_reason;
      NEW.banned_at := OLD.banned_at;
      NEW.banned_by := OLD.banned_by;
      NEW.followers_count := OLD.followers_count;
      NEW.following_count := OLD.following_count;
      NEW.store_credits := OLD.store_credits;
      NEW.xp_points := OLD.xp_points;
      NEW.ai_solve_uses_remaining := OLD.ai_solve_uses_remaining;
      NEW.ai_explain_uses_remaining := OLD.ai_explain_uses_remaining;
      NEW.is_verified := OLD.is_verified;
      NEW.verified_at := OLD.verified_at;
      NEW.verified_by := OLD.verified_by;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_verified(p_user UUID, p_verified BOOLEAN, p_reason TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin UUID := _require_admin(); v_old BOOLEAN;
BEGIN
  SELECT is_verified INTO v_old FROM profiles WHERE id = p_user FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'code', 'user_not_found'); END IF;
  UPDATE profiles
  SET is_verified = COALESCE(p_verified, FALSE),
      verified_at = CASE WHEN p_verified THEN NOW() END,
      verified_by = CASE WHEN p_verified THEN v_admin END
  WHERE id = p_user;
  PERFORM _admin_audit(CASE WHEN p_verified THEN 'verify_user' ELSE 'unverify_user' END, 'user', p_user::text, p_reason,
                       jsonb_build_object('old', v_old, 'new', p_verified));
  RETURN jsonb_build_object('success', true, 'is_verified', p_verified);
END;
$$;

-- ----------------------------------------------------------------------------
-- 3) تعديل الكوينات (المشرف فقط؛ العميل لا يملك أي مسار لتغيير رصيده)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_adjust_coins(p_user UUID, p_delta INTEGER, p_reason TEXT, p_request_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin UUID := _require_admin(); v_res JSONB;
BEGIN
  IF p_user IS NULL OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user) THEN
    RETURN jsonb_build_object('success', false, 'code', 'user_not_found');
  END IF;
  IF p_delta IS NULL OR p_delta = 0 OR ABS(p_delta) > 100000 THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_amount');
  END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) < 3 THEN
    RETURN jsonb_build_object('success', false, 'code', 'reason_required');
  END IF;
  IF p_request_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'request_id_required');
  END IF;
  v_res := _coins_apply(p_user, p_delta, 'admin_adjust', 'تعديل إداري: ' || LEFT(trim(p_reason), 200),
                        v_admin::text, 'admin_adjust:' || p_request_id::text);
  IF COALESCE((v_res->>'success')::boolean, false) AND NOT COALESCE((v_res->>'duplicate')::boolean, false) THEN
    PERFORM _admin_audit('adjust_coins', 'user', p_user::text, p_reason,
                         jsonb_build_object('delta', p_delta, 'balance_after', v_res->'balance', 'request_id', p_request_id));
  END IF;
  RETURN v_res;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4) الإشراف والبلاغات
-- ----------------------------------------------------------------------------
ALTER TABLE content_reports ALTER COLUMN snippet_id DROP NOT NULL;
ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS target_type TEXT NOT NULL DEFAULT 'snippet';
ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS message_id UUID REFERENCES messages(id) ON DELETE SET NULL;
ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS message_excerpt TEXT;
ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS counts_toward_threshold BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS resolution TEXT;
ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS admin_note TEXT;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_reports_target_type_check') THEN
    ALTER TABLE content_reports DROP CONSTRAINT content_reports_target_type_check;
  END IF;
  ALTER TABLE content_reports ADD CONSTRAINT content_reports_target_type_check CHECK (target_type IN ('snippet', 'user', 'message'));
  -- أسباب بلاغ المستخدم/الرسالة (القيم القديمة باقية)
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_reports_reason_check') THEN
    ALTER TABLE content_reports DROP CONSTRAINT content_reports_reason_check;
  END IF;
  ALTER TABLE content_reports ADD CONSTRAINT content_reports_reason_check CHECK (
    reason IN ('phishing', 'malicious', 'offensive', 'spam', 'copyright', 'other', 'harassment', 'impersonation'));
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_reports_target_present') THEN
    ALTER TABLE content_reports DROP CONSTRAINT content_reports_target_present;
  END IF;
  ALTER TABLE content_reports ADD CONSTRAINT content_reports_target_present CHECK (
    (target_type = 'snippet' AND snippet_id IS NOT NULL) OR
    (target_type IN ('user', 'message') AND reported_user_id IS NOT NULL)
  );
END $$;
-- بلاغ واحد لكل مُبلِّغ لكل هدف
CREATE UNIQUE INDEX IF NOT EXISTS uq_reports_user_target ON content_reports (reporter_id, reported_user_id) WHERE target_type = 'user';
CREATE UNIQUE INDEX IF NOT EXISTS uq_reports_message_target ON content_reports (reporter_id, message_id) WHERE target_type = 'message';
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON content_reports (status, created_at DESC);

-- عتبة الإخفاء المؤقت (من حسابات مختلفة ومؤهلة) وعمر الحساب الأدنى ليُحتسب بلاغه
INSERT INTO coin_config (key, value) VALUES
  ('moderation', '{"auto_hide_threshold": 3, "min_reporter_account_age_days": 3}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- هل يُحتسب بلاغ هذا المستخدم في العتبة؟ (حساب قديم بما يكفي، غير محظور، غير مقيّد)
CREATE OR REPLACE FUNCTION public._reporter_qualifies(p_reporter UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = p_reporter
      AND NOT COALESCE(p.is_banned, false)
      AND NOT COALESCE(p.is_purchase_blocked, false)
      AND p.created_at <= NOW() - make_interval(days => COALESCE((_coin_cfg('moderation')->>'min_reporter_account_age_days')::int, 3))
  );
$$;
REVOKE ALL ON FUNCTION public._reporter_qualifies(UUID) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.report_snippet(p_snippet_id UUID, p_reason TEXT, p_details TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_owner UUID;
  v_open INTEGER;
  v_qualified INTEGER;
  v_threshold INTEGER := COALESCE((_coin_cfg('moderation')->>'auto_hide_threshold')::int, 3);
  v_hidden BOOLEAN := FALSE;
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
  INSERT INTO content_reports (reporter_id, snippet_id, target_type, reported_user_id, reason, details, counts_toward_threshold)
  VALUES (v_uid, p_snippet_id, 'snippet', v_owner, p_reason, NULLIF(left(p_details, 500), ''), _reporter_qualifies(v_uid))
  ON CONFLICT (reporter_id, snippet_id) DO NOTHING;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', true, 'duplicate', true);
  END IF;

  SELECT COUNT(*), COUNT(DISTINCT reporter_id) FILTER (WHERE counts_toward_threshold)
  INTO v_open, v_qualified
  FROM content_reports WHERE snippet_id = p_snippet_id AND status = 'open';

  PERFORM set_config('kodax.moderation', 'on', true);
  -- بلاغ واحد أو اثنان: تتبع فقط. العتبة من حسابات مختلفة مؤهلة: إخفاء مؤقت بانتظار مراجعة المشرف
  UPDATE code_snippets SET
    report_count = v_open,
    is_hidden = is_hidden OR v_qualified >= v_threshold,
    hidden_reason = CASE WHEN is_hidden THEN hidden_reason
                         WHEN v_qualified >= v_threshold THEN 'auto:reports' ELSE hidden_reason END
  WHERE id = p_snippet_id
  RETURNING is_hidden INTO v_hidden;
  RETURN jsonb_build_object('success', true, 'hidden', v_hidden);
END;
$$;
REVOKE ALL ON FUNCTION public.report_snippet(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.report_snippet(UUID, TEXT, TEXT) TO authenticated;

-- بلاغ عن مستخدم أو رسالة خاصة (لا إجراء تلقائي؛ قائمة مراجعة للمشرف)
CREATE OR REPLACE FUNCTION public.report_user(p_user UUID, p_reason TEXT, p_details TEXT DEFAULT NULL, p_message_id UUID DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_excerpt TEXT;
  v_sender UUID;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'code', 'not_authenticated'); END IF;
  IF p_user IS NULL OR p_user = v_uid OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user) THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_target');
  END IF;
  IF p_reason NOT IN ('spam', 'harassment', 'offensive', 'phishing', 'malicious', 'impersonation', 'other') THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_reason');
  END IF;
  IF p_message_id IS NOT NULL THEN
    -- المُبلِّغ يجب أن يكون طرفاً في المحادثة، والرسالة من المستخدم المُبلَّغ عنه
    SELECT m.sender_id, LEFT(m.content, 500) INTO v_sender, v_excerpt
    FROM messages m
    WHERE m.id = p_message_id
      AND EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = m.conversation_id AND cp.user_id = v_uid);
    IF v_sender IS NULL OR v_sender <> p_user THEN
      RETURN jsonb_build_object('success', false, 'code', 'invalid_message');
    END IF;
    INSERT INTO content_reports (reporter_id, target_type, reported_user_id, message_id, message_excerpt, reason, details, counts_toward_threshold)
    VALUES (v_uid, 'message', p_user, p_message_id, v_excerpt, p_reason, NULLIF(left(p_details, 500), ''), _reporter_qualifies(v_uid))
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO content_reports (reporter_id, target_type, reported_user_id, reason, details, counts_toward_threshold)
    VALUES (v_uid, 'user', p_user, p_reason, NULLIF(left(p_details, 500), ''), _reporter_qualifies(v_uid))
    ON CONFLICT DO NOTHING;
  END IF;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', true, 'duplicate', true); END IF;
  RETURN jsonb_build_object('success', true);
END;
$$;
REVOKE ALL ON FUNCTION public.report_user(UUID, TEXT, TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.report_user(UUID, TEXT, TEXT, UUID) TO authenticated;

-- إجراء المشرف على محتوى (مع سجل)؛ الاستعادة تُسقط البلاغات المفتوحة
CREATE OR REPLACE FUNCTION public.admin_moderate_snippet(p_snippet_id UUID, p_action TEXT, p_note TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin UUID; v_owner UUID;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'code', 'forbidden');
  END IF;
  v_admin := auth.uid();
  SELECT user_id INTO v_owner FROM code_snippets WHERE id = p_snippet_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'code', 'not_found'); END IF;
  PERFORM set_config('kodax.moderation', 'on', true);
  IF p_action = 'hide' THEN
    UPDATE code_snippets SET is_hidden = TRUE, hidden_reason = COALESCE(NULLIF(p_note, ''), 'admin') WHERE id = p_snippet_id;
    UPDATE content_reports SET status = 'reviewed', resolution = 'hidden', reviewed_by = v_admin, reviewed_at = NOW(), admin_note = p_note
    WHERE snippet_id = p_snippet_id AND status = 'open';
  ELSIF p_action = 'restore' THEN
    UPDATE code_snippets SET is_hidden = FALSE, hidden_reason = NULL, report_count = 0 WHERE id = p_snippet_id;
    UPDATE content_reports SET status = 'dismissed', resolution = 'restored', reviewed_by = v_admin, reviewed_at = NOW(), admin_note = p_note
    WHERE snippet_id = p_snippet_id AND status = 'open';
  ELSIF p_action = 'delete' THEN
    PERFORM _admin_audit('delete_snippet', 'snippet', p_snippet_id::text, p_note, jsonb_build_object('owner', v_owner));
    DELETE FROM code_snippets WHERE id = p_snippet_id;
    RETURN jsonb_build_object('success', true);
  ELSE
    RETURN jsonb_build_object('success', false, 'code', 'invalid_action');
  END IF;
  PERFORM _admin_audit(p_action || '_snippet', 'snippet', p_snippet_id::text, p_note, jsonb_build_object('owner', v_owner));
  RETURN jsonb_build_object('success', true);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_moderate_snippet(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_moderate_snippet(UUID, TEXT, TEXT) TO authenticated;

-- مراجعة بلاغ مستخدم/رسالة (رفض أو اتخاذ إجراء — الحظر نفسه عبر admin_toggle_ban)
CREATE OR REPLACE FUNCTION public.admin_resolve_report(p_report_id UUID, p_resolution TEXT, p_note TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin UUID := _require_admin(); v_type TEXT; v_target UUID;
BEGIN
  IF p_resolution NOT IN ('dismissed', 'actioned') THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_resolution');
  END IF;
  UPDATE content_reports
  SET status = CASE WHEN p_resolution = 'dismissed' THEN 'dismissed' ELSE 'reviewed' END,
      resolution = p_resolution, reviewed_by = v_admin, reviewed_at = NOW(), admin_note = p_note
  WHERE id = p_report_id
  RETURNING target_type, reported_user_id INTO v_type, v_target;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'code', 'not_found'); END IF;
  PERFORM _admin_audit('report_' || p_resolution, v_type, COALESCE(v_target::text, p_report_id::text), p_note,
                       jsonb_build_object('report_id', p_report_id));
  RETURN jsonb_build_object('success', true);
END;
$$;

-- قائمة الإشراف: بلاغات الأكواد مجمّعة لكل كود + بلاغات المستخدمين/الرسائل
CREATE OR REPLACE FUNCTION public.admin_moderation_queue(p_status TEXT DEFAULT 'open')
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM _require_admin();
  RETURN jsonb_build_object(
    'snippets', COALESCE((
      SELECT jsonb_agg(row_to_json(x) ORDER BY x.last_report DESC) FROM (
        SELECT s.id, s.title, s.language, s.is_hidden, s.hidden_reason, s.report_count, s.is_public,
               s.user_id AS owner_id, op.username AS owner_username, op.full_name AS owner_name,
               COUNT(r.*) AS reports, COUNT(DISTINCT r.reporter_id) FILTER (WHERE r.counts_toward_threshold) AS qualified_reporters,
               MAX(r.created_at) AS last_report,
               jsonb_agg(jsonb_build_object('id', r.id, 'reason', r.reason, 'details', r.details, 'status', r.status,
                         'created_at', r.created_at, 'reporter_id', r.reporter_id, 'reporter', rp.username,
                         'counts', r.counts_toward_threshold, 'resolution', r.resolution, 'reviewed_at', r.reviewed_at)
                         ORDER BY r.created_at DESC) AS history
        FROM content_reports r
        JOIN code_snippets s ON s.id = r.snippet_id
        LEFT JOIN profiles op ON op.id = s.user_id
        LEFT JOIN profiles rp ON rp.id = r.reporter_id
        WHERE r.target_type = 'snippet'
          AND (p_status = 'all' OR EXISTS (SELECT 1 FROM content_reports r2 WHERE r2.snippet_id = s.id AND r2.status = p_status))
        GROUP BY s.id, op.username, op.full_name
      ) x), '[]'::jsonb),
    'users', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id', r.id, 'target_type', r.target_type, 'reason', r.reason, 'details', r.details,
               'message_excerpt', r.message_excerpt, 'status', r.status, 'resolution', r.resolution, 'created_at', r.created_at,
               'reporter_id', r.reporter_id, 'reporter', rp.username,
               'reported_user_id', r.reported_user_id, 'reported', up.username, 'reported_name', up.full_name,
               'reported_is_banned', up.is_banned) ORDER BY r.created_at DESC)
      FROM content_reports r
      LEFT JOIN profiles rp ON rp.id = r.reporter_id
      LEFT JOIN profiles up ON up.id = r.reported_user_id
      WHERE r.target_type IN ('user', 'message') AND (p_status = 'all' OR r.status = p_status)), '[]'::jsonb)
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 5) المحتوى
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_content_overview()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM _require_admin();
  RETURN jsonb_build_object(
    'courses', COALESCE((
      SELECT jsonb_agg(row_to_json(c) ORDER BY c.field_id, c.position_hint, c.course_id) FROM (
        SELECT lc.course_id,
               cc.field_id, cc.title, cc.difficulty, cc.unlock_cost, cc.is_active,
               COUNT(*) AS lessons,
               MIN(lc.position) AS position_hint,
               (SELECT COUNT(*) FROM generate_series(1, MAX(lc.position)) g WHERE NOT EXISTS (
                  SELECT 1 FROM lesson_catalog l2 WHERE l2.course_id = lc.course_id AND l2.position = g)) AS position_gaps,
               (SELECT COUNT(*) FROM (SELECT position FROM lesson_catalog l3 WHERE l3.course_id = lc.course_id GROUP BY position HAVING COUNT(*) > 1) d) AS position_duplicates,
               cp.requires_course_id, cp.min_ratio,
               (SELECT COUNT(DISTINCT u.user_id) FROM user_lesson_progress u WHERE u.course_id = lc.course_id AND u.verified AND u.completed) AS learners,
               (SELECT COUNT(*) FROM (
                  SELECT u.user_id FROM user_lesson_progress u
                  WHERE u.course_id = lc.course_id AND u.verified AND u.completed
                  GROUP BY u.user_id
                  HAVING COUNT(DISTINCT u.lesson_id) >= (SELECT COUNT(*) FROM lesson_catalog l4 WHERE l4.course_id = lc.course_id)) z) AS completers,
               (SELECT COUNT(*) FROM user_lesson_progress u WHERE u.course_id = lc.course_id AND u.verified AND u.completed) AS lesson_completions
        FROM lesson_catalog lc
        LEFT JOIN course_coin_catalog cc ON cc.course_id = lc.course_id
        LEFT JOIN course_prereqs cp ON cp.course_id = lc.course_id
        GROUP BY lc.course_id, cc.field_id, cc.title, cc.difficulty, cc.unlock_cost, cc.is_active, cp.requires_course_id, cp.min_ratio
      ) c), '[]'::jsonb),
    'challenges', COALESCE((
      SELECT jsonb_agg(row_to_json(ch) ORDER BY ch.id) FROM (
        SELECT cc.id, cc.difficulty, cc.points,
               COALESCE(cc.required_course_id, (SELECT l.course_id FROM lesson_catalog l WHERE l.lesson_id = cc.after_lesson_id)) AS course_id,
               cc.after_lesson_id,
               (SELECT COUNT(*) FROM challenge_submissions s WHERE s.challenge_id = cc.id) AS submissions,
               (SELECT COUNT(*) FROM challenge_submissions s WHERE s.challenge_id = cc.id AND s.all_passed) AS passed,
               (SELECT COUNT(DISTINCT s.user_id) FROM challenge_submissions s WHERE s.challenge_id = cc.id AND s.all_passed) AS solvers,
               (SELECT COUNT(*) FROM challenge_attempt_log a WHERE a.challenge_id = cc.id) AS local_attempts,
               (SELECT COUNT(*) FROM challenge_solution_reveals r WHERE r.challenge_id = cc.id AND r.via = 'ad') AS reveals,
               EXISTS (SELECT 1 FROM challenge_solutions so WHERE so.challenge_id = cc.id) AS has_solution
        FROM challenge_catalog cc
      ) ch), '[]'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_course_lessons(p_course TEXT)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM _require_admin();
  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
             'lesson_id', l.lesson_id, 'position', l.position, 'xp', l.xp, 'has_quiz', l.quiz_correct IS NOT NULL,
             'quiz_options', l.quiz_options, 'est_seconds', l.est_seconds,
             'completions', (SELECT COUNT(*) FROM user_lesson_progress u WHERE u.lesson_id = l.lesson_id AND u.verified AND u.completed),
             'quiz_wrong', (SELECT COUNT(*) FROM analytics_events e WHERE e.event = 'lesson_quiz_wrong' AND e.props->>'lesson_id' = l.lesson_id),
             'opened', (SELECT COUNT(*) FROM analytics_events e WHERE e.event = 'lesson_opened' AND e.props->>'lesson_id' = l.lesson_id))
             ORDER BY l.position)
    FROM lesson_catalog l WHERE l.course_id = p_course), '[]'::jsonb);
END;
$$;

-- المتطلب المسبق لدورة (تحقق: دورات موجودة، لا متطلب ذاتي، لا دورات حلقية، نسبة بين 0 و1)
CREATE OR REPLACE FUNCTION public.admin_set_course_prereq(p_course TEXT, p_requires TEXT, p_min_ratio NUMERIC DEFAULT NULL, p_reason TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin UUID := _require_admin(); v_old JSONB; v_cur TEXT; v_steps INTEGER := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM lesson_catalog WHERE course_id = p_course) THEN
    RETURN jsonb_build_object('success', false, 'code', 'course_not_found');
  END IF;
  SELECT to_jsonb(cp) INTO v_old FROM course_prereqs cp WHERE course_id = p_course;
  IF p_requires IS NULL THEN
    DELETE FROM course_prereqs WHERE course_id = p_course;
    PERFORM _admin_audit('remove_prereq', 'course', p_course, p_reason, jsonb_build_object('old', v_old));
    RETURN jsonb_build_object('success', true, 'removed', true);
  END IF;
  IF p_requires = p_course THEN RETURN jsonb_build_object('success', false, 'code', 'self_reference'); END IF;
  IF NOT EXISTS (SELECT 1 FROM lesson_catalog WHERE course_id = p_requires) THEN
    RETURN jsonb_build_object('success', false, 'code', 'required_course_not_found');
  END IF;
  IF p_min_ratio IS NOT NULL AND (p_min_ratio <= 0 OR p_min_ratio > 1) THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_ratio');
  END IF;
  -- منع الحلقات: المسار من الدورة المطلوبة لا يعود للدورة نفسها
  v_cur := p_requires;
  WHILE v_cur IS NOT NULL AND v_steps < 100 LOOP
    IF v_cur = p_course THEN RETURN jsonb_build_object('success', false, 'code', 'cycle'); END IF;
    SELECT requires_course_id INTO v_cur FROM course_prereqs WHERE course_id = v_cur;
    IF NOT FOUND THEN v_cur := NULL; END IF;
    v_steps := v_steps + 1;
  END LOOP;
  INSERT INTO course_prereqs (course_id, requires_course_id, min_ratio, updated_at)
  VALUES (p_course, p_requires, p_min_ratio, NOW())
  ON CONFLICT (course_id) DO UPDATE SET requires_course_id = EXCLUDED.requires_course_id, min_ratio = EXCLUDED.min_ratio, updated_at = NOW();
  PERFORM _admin_audit('set_prereq', 'course', p_course, p_reason,
                       jsonb_build_object('old', v_old, 'requires', p_requires, 'min_ratio', p_min_ratio));
  RETURN jsonb_build_object('success', true);
END;
$$;

-- كشف الحل الجاهز للمشرف فقط، ومسجّل
CREATE OR REPLACE FUNCTION public.admin_get_challenge_solution(p_challenge_id TEXT, p_reason TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin UUID := _require_admin(); v_solution TEXT;
BEGIN
  IF p_reason IS NULL OR length(trim(p_reason)) < 3 THEN
    RETURN jsonb_build_object('success', false, 'code', 'reason_required');
  END IF;
  SELECT solution INTO v_solution FROM challenge_solutions WHERE challenge_id = p_challenge_id;
  IF v_solution IS NULL THEN RETURN jsonb_build_object('success', false, 'code', 'not_found'); END IF;
  PERFORM _admin_audit('view_solution', 'challenge', p_challenge_id, p_reason, '{}'::jsonb);
  RETURN jsonb_build_object('success', true, 'solution', v_solution);
END;
$$;

-- ----------------------------------------------------------------------------
-- 6) المستخدمون
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_search TEXT DEFAULT NULL, p_filter TEXT DEFAULT 'all', p_sort TEXT DEFAULT 'created',
  p_limit INTEGER DEFAULT 25, p_offset INTEGER DEFAULT 0
) RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_q TEXT := NULLIF(trim(COALESCE(p_search, '')), '');
BEGIN
  PERFORM _require_admin();
  RETURN (
    WITH base AS (
      SELECT p.id, p.username, p.full_name, p.avatar_url, p.xp, kodax_level(COALESCE(p.xp, 0)) AS level,
             p.is_banned, p.is_purchase_blocked, p.is_verified, p.created_at,
             au.email, au.last_sign_in_at,
             COALESCE(up.total_points, 0) AS coins,
             COALESCE(us.current_streak, 0) AS streak,
             (SELECT COUNT(*) FROM user_lesson_progress u WHERE u.user_id = p.id AND u.verified AND u.completed) AS lessons_completed,
             (SELECT COUNT(*) FROM content_reports r WHERE r.reported_user_id = p.id) AS reports_received,
             (SELECT COUNT(*) FROM user_blocks b WHERE b.blocked_id = p.id) AS blocked_by_count,
             EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin') AS is_admin
      FROM profiles p
      LEFT JOIN auth.users au ON au.id = p.id
      LEFT JOIN user_points up ON up.user_id = p.id
      LEFT JOIN user_streaks us ON us.user_id = p.id
    ), filtered AS (
      SELECT * FROM base b
      WHERE (v_q IS NULL OR b.username ILIKE '%' || v_q || '%' OR b.full_name ILIKE '%' || v_q || '%'
             OR b.email ILIKE '%' || v_q || '%' OR b.id::text = v_q)
        AND CASE COALESCE(p_filter, 'all')
              WHEN 'banned' THEN COALESCE(b.is_banned, false)
              WHEN 'restricted' THEN COALESCE(b.is_purchase_blocked, false)
              WHEN 'verified' THEN b.is_verified
              WHEN 'reported' THEN b.reports_received > 0
              WHEN 'admins' THEN b.is_admin
              ELSE TRUE END
    )
    SELECT jsonb_build_object(
      'total', (SELECT COUNT(*) FROM filtered),
      'rows', COALESCE((
        SELECT jsonb_agg(row_to_json(f)) FROM (
          SELECT * FROM filtered
          ORDER BY
            CASE WHEN p_sort = 'xp' THEN xp END DESC NULLS LAST,
            CASE WHEN p_sort = 'coins' THEN coins END DESC NULLS LAST,
            CASE WHEN p_sort = 'last_sign_in' THEN last_sign_in_at END DESC NULLS LAST,
            CASE WHEN p_sort = 'reports' THEN reports_received END DESC NULLS LAST,
            created_at DESC
          LIMIT LEAST(GREATEST(COALESCE(p_limit, 25), 1), 100) OFFSET GREATEST(COALESCE(p_offset, 0), 0)
        ) f), '[]'::jsonb)
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_user_detail(p_user UUID)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_tz TEXT := COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad');
BEGIN
  PERFORM _require_admin();
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user) THEN
    RETURN jsonb_build_object('success', false, 'code', 'user_not_found');
  END IF;
  RETURN jsonb_build_object(
    'success', true,
    'profile', (SELECT to_jsonb(p) - 'ai_solve_uses_remaining' - 'ai_explain_uses_remaining' - 'store_credits' - 'xp_points'
                       || jsonb_build_object('level_computed', kodax_level(COALESCE(p.xp, 0)))
                FROM profiles p WHERE p.id = p_user),
    'auth', (SELECT jsonb_build_object('email', au.email, 'created_at', au.created_at, 'last_sign_in_at', au.last_sign_in_at,
                    'provider', au.raw_app_meta_data->>'provider', 'email_confirmed_at', au.email_confirmed_at)
             FROM auth.users au WHERE au.id = p_user),
    'is_admin', EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user AND role = 'admin'),
    'coins', jsonb_build_object(
      'balance', COALESCE((SELECT total_points FROM user_points WHERE user_id = p_user), 0),
      'earned', COALESCE((SELECT earned_points FROM user_points WHERE user_id = p_user), 0),
      'spent', COALESCE((SELECT spent_points FROM user_points WHERE user_id = p_user), 0),
      'recent', COALESCE((SELECT jsonb_agg(t ORDER BY t.created_at DESC) FROM (
                  SELECT type, amount, source, reason, balance_after, created_at FROM point_transactions
                  WHERE user_id = p_user ORDER BY created_at DESC LIMIT 30) t), '[]'::jsonb)),
    'streak', (SELECT to_jsonb(s) - 'user_id' FROM user_streaks s WHERE s.user_id = p_user),
    'goal', (SELECT daily_target FROM user_goals WHERE user_id = p_user),
    'courses', COALESCE((SELECT jsonb_agg(c ORDER BY c.completed DESC) FROM (
                  SELECT u.course_id, COUNT(DISTINCT u.lesson_id) AS completed,
                         (SELECT COUNT(*) FROM lesson_catalog l WHERE l.course_id = u.course_id) AS total,
                         MAX(u.completed_at) AS last_at
                  FROM user_lesson_progress u
                  WHERE u.user_id = p_user AND u.verified AND u.completed AND u.course_id <> 'challenges'
                  GROUP BY u.course_id) c), '[]'::jsonb),
    'unverified_lessons', (SELECT COUNT(*) FROM user_lesson_progress u WHERE u.user_id = p_user AND u.completed AND NOT u.verified AND u.course_id <> 'challenges'),
    'challenges', jsonb_build_object(
      'submissions', (SELECT COUNT(*) FROM challenge_submissions WHERE user_id = p_user),
      'solved', (SELECT COUNT(DISTINCT challenge_id) FROM challenge_submissions WHERE user_id = p_user AND all_passed),
      'solution_reveals', (SELECT COUNT(*) FROM challenge_solution_reveals WHERE user_id = p_user AND via = 'ad')),
    'achievements', (SELECT COUNT(*) FROM achievements_awarded WHERE user_id = p_user),
    'certificates', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', id, 'course_id', course_id, 'level', level, 'status', status, 'issued_at', issued_at))
                              FROM certificates WHERE user_id = p_user), '[]'::jsonb),
    'ads', jsonb_build_object(
      'rewarded_total', (SELECT COUNT(*) FROM ad_reward_sessions WHERE user_id = p_user AND status = 'rewarded'),
      'rewarded_7d', (SELECT COUNT(*) FROM ad_reward_sessions WHERE user_id = p_user AND status = 'rewarded' AND ad_date > _coin_today() - 7),
      'by_verification', COALESCE((SELECT jsonb_object_agg(COALESCE(verified_by, 'none'), n) FROM (
                  SELECT verified_by, COUNT(*) n FROM ad_reward_sessions WHERE user_id = p_user AND status = 'rewarded' GROUP BY verified_by) x), '{}'::jsonb)),
    'ai', jsonb_build_object(
      'used_today', COALESCE((SELECT SUM(used) FROM ai_daily_usage WHERE user_id = p_user AND usage_date = _coin_today()), 0),
      'used_30d', COALESCE((SELECT SUM(used) FROM ai_daily_usage WHERE user_id = p_user AND usage_date > _coin_today() - 30), 0)),
    'social', jsonb_build_object(
      'snippets', (SELECT COUNT(*) FROM code_snippets WHERE user_id = p_user),
      'hidden_snippets', (SELECT COUNT(*) FROM code_snippets WHERE user_id = p_user AND is_hidden),
      'comments', (SELECT COUNT(*) FROM code_comments WHERE user_id = p_user),
      'followers', (SELECT COUNT(*) FROM follows WHERE following_id = p_user),
      'following', (SELECT COUNT(*) FROM follows WHERE follower_id = p_user),
      'messages_sent', (SELECT COUNT(*) FROM messages WHERE sender_id = p_user),
      'blocked_by', (SELECT COUNT(*) FROM user_blocks WHERE blocked_id = p_user),
      'blocking', (SELECT COUNT(*) FROM user_blocks WHERE blocker_id = p_user)),
    'reports_received', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', r.id, 'target_type', r.target_type, 'reason', r.reason,
                                  'status', r.status, 'created_at', r.created_at, 'snippet_id', r.snippet_id, 'message_excerpt', r.message_excerpt)
                                  ORDER BY r.created_at DESC)
                                  FROM content_reports r WHERE r.reported_user_id = p_user), '[]'::jsonb),
    'reports_made', (SELECT COUNT(*) FROM content_reports WHERE reporter_id = p_user),
    'history', COALESCE((SELECT jsonb_agg(h ORDER BY h.created_at DESC) FROM (
                  SELECT * FROM (
                    SELECT 'audit' AS src, a.action, a.reason, a.details, a.created_at, ap.username AS actor
                    FROM admin_audit_log a LEFT JOIN profiles ap ON ap.id = a.actor_id
                    WHERE a.target_type = 'user' AND a.target_id = p_user::text
                    UNION ALL
                    SELECT 'restriction', l.action, l.reason, '{}'::jsonb, l.created_at, lp.username
                    FROM user_restriction_logs l LEFT JOIN profiles lp ON lp.id = l.performed_by
                    WHERE l.user_id = p_user
                  ) hh ORDER BY hh.created_at DESC LIMIT 100) h), '[]'::jsonb),
    'last_activity_day', (SELECT MAX(day) FROM user_activity_days WHERE user_id = p_user AND NOT frozen),
    'timezone', v_tz
  );
END;
$$;

-- سجل الإدارة الموحّد (السجل الجديد + سجلات الحظر/القيود + الحذف)
CREATE OR REPLACE FUNCTION public.admin_audit_feed(p_limit INTEGER DEFAULT 100, p_offset INTEGER DEFAULT 0, p_action TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM _require_admin();
  RETURN COALESCE((
    SELECT jsonb_agg(x ORDER BY x.created_at DESC) FROM (
      SELECT * FROM (
        SELECT 'audit' AS src, a.action, a.target_type, a.target_id, a.reason, a.details, a.created_at,
               a.actor_id::text AS actor_id, ap.username AS actor,
               CASE WHEN a.target_type = 'user' THEN (SELECT username FROM profiles WHERE id::text = a.target_id) END AS target_name
        FROM admin_audit_log a LEFT JOIN profiles ap ON ap.id = a.actor_id
        UNION ALL
        SELECT 'restriction', l.action, 'user', l.user_id::text, l.reason, '{}'::jsonb, l.created_at,
               l.performed_by::text, lp.username, tp.username
        FROM user_restriction_logs l LEFT JOIN profiles lp ON lp.id = l.performed_by LEFT JOIN profiles tp ON tp.id = l.user_id
        UNION ALL
        SELECT 'deletion', 'delete_account', 'user', d.user_id::text, d.reason,
               jsonb_build_object('status', d.status, 'storage_objects', d.storage_objects, 'self', d.initiated_by IS NULL),
               d.created_at, d.initiated_by::text, ip.username, NULL
        FROM account_deletions d LEFT JOIN profiles ip ON ip.id = d.initiated_by
      ) u
      WHERE p_action IS NULL OR u.action = p_action
      ORDER BY u.created_at DESC
      LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 500) OFFSET GREATEST(COALESCE(p_offset, 0), 0)
    ) x), '[]'::jsonb);
END;
$$;

-- ----------------------------------------------------------------------------
-- 7) لوحة الإحصاءات (بتوقيت بغداد؛ ما لا يُحسب = null وسببه في unavailable)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_dashboard_stats(p_days INTEGER DEFAULT 30)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tz TEXT := COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad');
  v_today DATE := _coin_today();
  v_days INTEGER := GREATEST(1, LEAST(COALESCE(p_days, 30), 365));
  v_from DATE;
  v_ad_limit INTEGER := COALESCE((_coin_cfg('ads')->>'daily_limit')::int, 4);
  v_summary JSONB;
  v_act JSONB;
BEGIN
  PERFORM _require_admin();
  v_from := v_today - v_days + 1;
  v_summary := admin_analytics_summary(v_days);

  -- النشاط اليومي: فتح التطبيق، أيام التعلم، التحديات، المساعد، إكمال الدروس (آخر 60 يوماً)
  WITH act AS (
    SELECT user_id, day FROM analytics_events WHERE event = 'app_open' AND user_id IS NOT NULL AND day > v_today - 60
    UNION SELECT user_id, day FROM user_activity_days WHERE NOT frozen AND day > v_today - 60
    UNION SELECT user_id, (created_at AT TIME ZONE v_tz)::date FROM challenge_submissions WHERE created_at > NOW() - INTERVAL '61 days'
    UNION SELECT user_id, usage_date FROM ai_daily_usage WHERE used > 0 AND usage_date > v_today - 60
    UNION SELECT user_id, (completed_at AT TIME ZONE v_tz)::date FROM user_lesson_progress
          WHERE completed AND completed_at > NOW() - INTERVAL '61 days' AND course_id <> 'challenges'
  )
  SELECT jsonb_build_object(
    'dau', (SELECT COUNT(DISTINCT user_id) FROM act WHERE day = v_today),
    'wau', (SELECT COUNT(DISTINCT user_id) FROM act WHERE day > v_today - 7),
    'mau', (SELECT COUNT(DISTINCT user_id) FROM act WHERE day > v_today - 30),
    'by_day', COALESCE((SELECT jsonb_agg(jsonb_build_object('day', g::date,
                'users', (SELECT COUNT(DISTINCT user_id) FROM act WHERE day = g::date)) ORDER BY g)
                FROM generate_series(v_from, v_today, INTERVAL '1 day') g), '[]'::jsonb)
  ) INTO v_act;

  RETURN jsonb_build_object(
    'generated_at', NOW(), 'timezone', v_tz, 'today', v_today, 'from', v_from, 'days', v_days,
    'users', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM profiles),
      'new_today', (SELECT COUNT(*) FROM profiles WHERE (created_at AT TIME ZONE v_tz)::date = v_today),
      'new_in_period', (SELECT COUNT(*) FROM profiles WHERE (created_at AT TIME ZONE v_tz)::date >= v_from),
      'new_by_day', COALESCE((SELECT jsonb_agg(jsonb_build_object('day', g::date, 'users',
                    (SELECT COUNT(*) FROM profiles WHERE (created_at AT TIME ZONE v_tz)::date = g::date)) ORDER BY g)
                    FROM generate_series(v_from, v_today, INTERVAL '1 day') g), '[]'::jsonb),
      'dau', v_act->'dau', 'wau', v_act->'wau', 'mau', v_act->'mau', 'active_by_day', v_act->'by_day',
      'active_learners_7d', (SELECT COUNT(DISTINCT user_id) FROM user_activity_days WHERE NOT frozen AND day > v_today - 7),
      'retention', v_summary->'retention',
      'level_distribution', (SELECT jsonb_build_object(
          '1-3', COUNT(*) FILTER (WHERE l BETWEEN 1 AND 3), '4-6', COUNT(*) FILTER (WHERE l BETWEEN 4 AND 6),
          '7-10', COUNT(*) FILTER (WHERE l BETWEEN 7 AND 10), '11-15', COUNT(*) FILTER (WHERE l BETWEEN 11 AND 15),
          '16+', COUNT(*) FILTER (WHERE l >= 16)) FROM (SELECT kodax_level(COALESCE(xp, 0)) l FROM profiles) z),
      'xp_distribution', (SELECT jsonb_build_object(
          '0', COUNT(*) FILTER (WHERE x = 0), '1-99', COUNT(*) FILTER (WHERE x BETWEEN 1 AND 99),
          '100-499', COUNT(*) FILTER (WHERE x BETWEEN 100 AND 499), '500-1999', COUNT(*) FILTER (WHERE x BETWEEN 500 AND 1999),
          '2000-4999', COUNT(*) FILTER (WHERE x BETWEEN 2000 AND 4999), '5000+', COUNT(*) FILTER (WHERE x >= 5000),
          'total_xp', SUM(x), 'median', percentile_cont(0.5) WITHIN GROUP (ORDER BY x))
          FROM (SELECT COALESCE(xp, 0) x FROM profiles) z),
      'streaks', (SELECT jsonb_build_object(
          'active', COUNT(*) FILTER (WHERE current_streak > 0), 'week_plus', COUNT(*) FILTER (WHERE current_streak >= 7),
          'month_plus', COUNT(*) FILTER (WHERE current_streak >= 30),
          'avg_active', ROUND(AVG(current_streak) FILTER (WHERE current_streak > 0), 1),
          'best_ever', MAX(best_streak), 'freezes_used', COALESCE(SUM(freezes_used), 0)) FROM user_streaks)
    ),
    'learning', jsonb_build_object(
      'lessons_opened', (SELECT COUNT(*) FROM analytics_events WHERE event = 'lesson_opened' AND day >= v_from),
      'lessons_completed', (SELECT COUNT(*) FROM user_lesson_progress WHERE verified AND completed AND course_id <> 'challenges'
                            AND (completed_at AT TIME ZONE v_tz)::date >= v_from),
      'lessons_completed_unverified', (SELECT COUNT(*) FROM user_lesson_progress WHERE NOT verified AND completed AND course_id <> 'challenges'
                            AND (completed_at AT TIME ZONE v_tz)::date >= v_from),
      'quiz_wrong', (SELECT COUNT(*) FROM analytics_events WHERE event = 'lesson_quiz_wrong' AND day >= v_from),
      'course_completions', (SELECT COUNT(*) FROM analytics_events WHERE event = 'course_completed' AND day >= v_from),
      'courses', COALESCE((SELECT jsonb_agg(c ORDER BY c.learners DESC) FROM (
          SELECT l.course_id, COUNT(*) AS lessons,
                 (SELECT COUNT(DISTINCT u.user_id) FROM user_lesson_progress u WHERE u.course_id = l.course_id AND u.verified AND u.completed) AS learners,
                 (SELECT COUNT(*) FROM (SELECT u.user_id FROM user_lesson_progress u WHERE u.course_id = l.course_id AND u.verified AND u.completed
                    GROUP BY u.user_id HAVING COUNT(DISTINCT u.lesson_id) >= (SELECT COUNT(*) FROM lesson_catalog l2 WHERE l2.course_id = l.course_id)) z) AS completers
          FROM lesson_catalog l GROUP BY l.course_id) c), '[]'::jsonb),
      'challenge_submissions', (SELECT COUNT(*) FROM challenge_submissions WHERE (created_at AT TIME ZONE v_tz)::date >= v_from),
      'challenge_passed', (SELECT COUNT(*) FROM challenge_submissions WHERE all_passed AND (created_at AT TIME ZONE v_tz)::date >= v_from),
      'challenge_local_attempts', (SELECT COUNT(*) FROM challenge_attempt_log WHERE (created_at AT TIME ZONE v_tz)::date >= v_from),
      'challenge_solvers', (SELECT COUNT(DISTINCT user_id) FROM challenge_submissions WHERE all_passed AND (created_at AT TIME ZONE v_tz)::date >= v_from),
      'hardest_challenges', COALESCE((SELECT jsonb_agg(h) FROM (
          SELECT challenge_id, COUNT(*) AS submissions, COUNT(*) FILTER (WHERE all_passed) AS passed,
                 ROUND(100.0 * COUNT(*) FILTER (WHERE all_passed) / COUNT(*), 1) AS pass_rate
          FROM challenge_submissions GROUP BY challenge_id HAVING COUNT(*) >= 5
          ORDER BY 4 ASC, 2 DESC LIMIT 10) h), '[]'::jsonb),
      'solution_reveals', (SELECT COUNT(*) FROM challenge_solution_reveals WHERE via = 'ad' AND (revealed_at AT TIME ZONE v_tz)::date >= v_from),
      'median_hours_to_first_challenge', v_summary->'learning'->'median_hours_to_first_challenge'
    ),
    'economy', jsonb_build_object(
      'earned', COALESCE((SELECT SUM(amount) FROM point_transactions WHERE type = 'earned' AND (created_at AT TIME ZONE v_tz)::date >= v_from), 0),
      'spent', COALESCE((SELECT SUM(amount) FROM point_transactions WHERE type = 'spent' AND (created_at AT TIME ZONE v_tz)::date >= v_from), 0),
      'earned_by_source', v_summary->'coins'->'earned_by_source',
      'spent_by_source', v_summary->'coins'->'spent_by_source',
      'balance_distribution', v_summary->'coins'->'balance_distribution',
      'total_in_circulation', COALESCE((SELECT SUM(total_points) FROM user_points), 0),
      'unlocks', (SELECT COUNT(*) FROM point_transactions WHERE source IN ('unlock_course', 'unlock_field') AND (created_at AT TIME ZONE v_tz)::date >= v_from),
      'ads', v_summary->'ads',
      'admin_adjustments', (SELECT COUNT(*) FROM point_transactions WHERE source = 'admin_adjust' AND (created_at AT TIME ZONE v_tz)::date >= v_from),
      'suspicious', jsonb_build_object(
        'ad_cap_users', COALESCE((SELECT jsonb_agg(s) FROM (
            SELECT a.user_id, p.username, COUNT(*) AS capped_days FROM (
              SELECT user_id, ad_date FROM ad_reward_sessions
              WHERE status = 'rewarded' AND purpose = 'coins' AND ad_date >= v_from
              GROUP BY user_id, ad_date HAVING COUNT(*) >= v_ad_limit) a
            LEFT JOIN profiles p ON p.id = a.user_id
            GROUP BY a.user_id, p.username HAVING COUNT(*) >= 3 ORDER BY 3 DESC LIMIT 20) s), '[]'::jsonb),
        'client_verified_rewards', (SELECT COUNT(*) FROM ad_reward_sessions WHERE status = 'rewarded' AND verified_by = 'client' AND ad_date >= v_from),
        'top_earners', COALESCE((SELECT jsonb_agg(t) FROM (
            SELECT pt.user_id, p.username, SUM(pt.amount) AS earned,
                   COALESCE(SUM(pt.amount) FILTER (WHERE pt.source LIKE 'ad%'), 0) AS from_ads,
                   COALESCE(SUM(pt.amount) FILTER (WHERE pt.source = 'admin_adjust'), 0) AS from_admin
            FROM point_transactions pt LEFT JOIN profiles p ON p.id = pt.user_id
            WHERE pt.type = 'earned' AND (pt.created_at AT TIME ZONE v_tz)::date >= v_from
            GROUP BY pt.user_id, p.username ORDER BY 3 DESC LIMIT 10) t), '[]'::jsonb))
    ),
    'ai', jsonb_build_object(
      'by_day', COALESCE((SELECT jsonb_agg(jsonb_build_object('day', g::date,
                  'requests', COALESCE((SELECT SUM(used) FROM ai_daily_usage WHERE usage_date = g::date), 0),
                  'users', (SELECT COUNT(DISTINCT user_id) FROM ai_daily_usage WHERE usage_date = g::date AND used > 0)) ORDER BY g)
                  FROM generate_series(v_from, v_today, INTERVAL '1 day') g), '[]'::jsonb),
      'requests', COALESCE((SELECT SUM(used) FROM ai_daily_usage WHERE usage_date >= v_from), 0),
      'unique_users', (SELECT COUNT(DISTINCT user_id) FROM ai_daily_usage WHERE usage_date >= v_from AND used > 0),
      'quota_hits', v_summary->'ai'->'quota_exhausted_events',
      'users_hit_quota', v_summary->'ai'->'users_exhausted',
      'global_limit_hits', v_summary->'ai'->'global_limit_hits',
      'cache_entries', (SELECT COUNT(*) FROM ai_response_cache WHERE expires_at > NOW()),
      'cache_hits_total', COALESCE((SELECT SUM(hits) FROM ai_response_cache), 0),
      'errors', NULL
    ),
    'social', jsonb_build_object(
      'snippets', (SELECT COUNT(*) FROM code_snippets),
      'snippets_public', (SELECT COUNT(*) FROM code_snippets WHERE is_public AND NOT is_hidden),
      'snippets_new', (SELECT COUNT(*) FROM code_snippets WHERE (created_at AT TIME ZONE v_tz)::date >= v_from),
      'likes', (SELECT COUNT(*) FROM code_likes) + (SELECT COUNT(*) FROM snippet_likes),
      'comments', (SELECT COUNT(*) FROM code_comments),
      'comments_new', (SELECT COUNT(*) FROM code_comments WHERE (created_at AT TIME ZONE v_tz)::date >= v_from),
      'follows', (SELECT COUNT(*) FROM follows),
      'dm_messages', (SELECT COUNT(*) FROM messages),
      'dm_messages_new', (SELECT COUNT(*) FROM messages WHERE (created_at AT TIME ZONE v_tz)::date >= v_from),
      'conversations', (SELECT COUNT(*) FROM conversations),
      'reports_open', (SELECT COUNT(*) FROM content_reports WHERE status = 'open'),
      'reports_total', (SELECT COUNT(*) FROM content_reports),
      'hidden_snippets', (SELECT COUNT(*) FROM code_snippets WHERE is_hidden),
      'blocks', (SELECT COUNT(*) FROM user_blocks)
    ),
    'support', jsonb_build_object(
      'by_status', COALESCE((SELECT jsonb_object_agg(status, n) FROM (SELECT status, COUNT(*) n FROM support_tickets GROUP BY status) x), '{}'::jsonb),
      'new_in_period', (SELECT COUNT(*) FROM support_tickets WHERE (created_at AT TIME ZONE v_tz)::date >= v_from),
      'median_first_response_hours', (
        SELECT ROUND((percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (f.first_reply - t.created_at)) / 3600))::numeric, 1)
        FROM support_tickets t
        JOIN LATERAL (SELECT MIN(m.created_at) first_reply FROM support_messages m WHERE m.ticket_id = t.id AND m.sender_type = 'admin') f ON f.first_reply IS NOT NULL
        WHERE (t.created_at AT TIME ZONE v_tz)::date >= v_from),
      'unanswered', (SELECT COUNT(*) FROM support_tickets t WHERE t.status IN ('open', 'in_progress')
                     AND NOT EXISTS (SELECT 1 FROM support_messages m WHERE m.ticket_id = t.id AND m.sender_type = 'admin'))
    ),
    'unavailable', jsonb_build_object(
      'ai.errors', 'أخطاء Gemini لا تُسجَّل في قاعدة البيانات (تُرجَع الحصة فقط)',
      'session_length', 'مدة الجلسة والوقت داخل التطبيق لا يُسجَّلان',
      'ad_revenue', 'إيرادات الإعلانات في AdMob وليست في قاعدة البيانات',
      'analytics_since', 'أحداث analytics_events (فتح التطبيق/الدروس/الإعلانات) بدأت مع نشر نظام التقدم؛ ما قبله غير مسجّل'
    )
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- الصلاحيات: دوال المشرف للمسجّلين (وتتحقق داخلياً من الدور)
-- ----------------------------------------------------------------------------
DO $$
DECLARE f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'admin_set_verified(uuid, boolean, text)', 'admin_adjust_coins(uuid, integer, text, uuid)',
    'admin_resolve_report(uuid, text, text)', 'admin_moderation_queue(text)', 'admin_content_overview()',
    'admin_course_lessons(text)', 'admin_set_course_prereq(text, text, numeric, text)',
    'admin_get_challenge_solution(text, text)', 'admin_list_users(text, text, text, integer, integer)',
    'admin_user_detail(uuid)', 'admin_audit_feed(integer, integer, text)', 'admin_dashboard_stats(integer)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;
END $$;
