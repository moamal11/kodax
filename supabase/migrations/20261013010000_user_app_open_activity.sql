-- App openings are distinct from authentication events and learning activity.
-- No historical backfill: signing in is not evidence of a later app opening.
BEGIN;

CREATE TABLE IF NOT EXISTS public.user_app_activity (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_opened_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE public.user_app_activity ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_app_activity FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.user_app_activity TO authenticated;
GRANT ALL ON public.user_app_activity TO service_role;
DROP POLICY IF EXISTS user_app_activity_admin_read ON public.user_app_activity;
CREATE POLICY user_app_activity_admin_read ON public.user_app_activity
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.record_app_open()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_user UUID := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;
  -- Minute precision is sufficient; repeated openings within a minute do not write.
  INSERT INTO public.user_app_activity AS activity (user_id, last_opened_at)
  VALUES (v_user, date_trunc('minute', clock_timestamp()))
  ON CONFLICT (user_id) DO UPDATE SET last_opened_at = EXCLUDED.last_opened_at
  WHERE activity.last_opened_at < EXCLUDED.last_opened_at;
END;
$$;
REVOKE ALL ON FUNCTION public.record_app_open() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_app_open() TO authenticated;

-- Existing admin payload fields remain available for older dashboards.

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
             au.email, au.last_sign_in_at, activity.last_opened_at AS last_app_open_at,
             COALESCE(up.total_points, 0) AS coins,
             COALESCE(us.current_streak, 0) AS streak,
             (SELECT COUNT(*) FROM user_lesson_progress u WHERE u.user_id = p.id AND u.verified AND u.completed) AS lessons_completed,
             (SELECT COUNT(*) FROM content_reports r WHERE r.reported_user_id = p.id) AS reports_received,
             (SELECT COUNT(*) FROM user_blocks b WHERE b.blocked_id = p.id) AS blocked_by_count,
             EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin') AS is_admin
      FROM profiles p
      LEFT JOIN auth.users au ON au.id = p.id
      LEFT JOIN public.user_app_activity activity ON activity.user_id = p.id
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
            CASE WHEN p_sort = 'last_app_open' THEN last_app_open_at END DESC NULLS LAST,
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
    'last_app_open_at', (SELECT last_opened_at FROM public.user_app_activity WHERE user_id = p_user),
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


REVOKE ALL ON FUNCTION public.admin_list_users(TEXT, TEXT, TEXT, INTEGER, INTEGER), public.admin_user_detail(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users(TEXT, TEXT, TEXT, INTEGER, INTEGER), public.admin_user_detail(UUID) TO authenticated;

COMMIT;
