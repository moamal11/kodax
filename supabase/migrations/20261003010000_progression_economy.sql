-- ============================================================================
-- Kodax — التقدم بالتعلم + اقتصاد الكوينات الاختياري + السلسلة الموحّدة + حماية المكافآت
--
-- الفلسفة: التعلم الأساسي مجاني بالكامل. الكوينات للمزايا الاختيارية والاختصارات فقط.
-- الإعلانات (Rewarded فقط) مقابل الاختصارات: الحل الجاهز للتحدي، وطلبات ذكاء إضافية، وكوينات.
--
-- ما يفعله هذا الملف:
--   1. مستوى واحد للمستخدم: kodax_level(xp) = max(1, floor(sqrt(xp/100))).
--   2. user_lesson_progress.verified: الإكمال الموثّق يُكتب على السيرفر فقط (progress_complete_lesson).
--      ما يكتبه التطبيق يُحفظ (النسخ القديمة لا تتعطل) لكنه غير موثّق: لا XP ولا مكافآت ولا سلسلة.
--      الإكمالات الموجودة قبل هذا الملف تُعلَّم "legacy" موثّقة بلا أي مكافأة جديدة.
--   3. فتح الدورات بالتقدم (course_prereqs) بدل الكوينات. الكوينات = فتح مبكر (اختصار) فقط.
--      كل ما فتحه المستخدم سابقاً بالكوينات يبقى مفتوحاً.
--   4. سلسلة موحّدة على السيرفر (user_streaks + user_activity_days) بتوقيت بغداد، مع تجميد مجاني
--      أسبوعي وتجميد يُشترى بالكوينات. update_user_streak / record_daily_progress لم تعودا
--      تقبلان مستخدماً آخر ولا أرقاماً من العميل.
--   5. أهداف يومية/أسبوعية وإنجازات على السيرفر (مكافآتها من النشاط الموثّق فقط).
--   6. الحل الجاهز للتحدي: يُحفظ على السيرفر ويُعرض بعد إعلان Rewarded معتمد (أو بعد الحل).
--      كشف الحل قبل حلّه = لا كوينات للتحدي و XP مخفّض.
--   7. حزمة ذكاء بالكوينات (اختيارية) + تجميد السلسلة بالكوينات.
--   8. أحداث تحليلات (analytics_events) + ملخص للمشرف.
--
-- لا يغيّر: قيم السلّم اليومي، أسعار الدورات، مكافآت التحديات/الإعلانات، حصة الذكاء الأساسية.
-- آمن: لا حذف لأي بيانات، لا تصفير لأرصدة أو XP أو تقدم. قابل للتكرار.
-- يعتمد على: 20260930000000 … 20261002030000 و 20261003000000_progression_catalog.
-- ============================================================================
BEGIN;

-- ----------------------------------------------------------------------------
-- 0) الإعدادات (مكان واحد، قابلة للتعديل من السيرفر). لا تُستبدل قيم موجودة.
-- ----------------------------------------------------------------------------
INSERT INTO coin_config (key, value) VALUES
  ('progression', '{
      "prereq_ratio": 0.7,
      "min_seconds_between_lessons": 20,
      "quiz_required": true
   }'::jsonb),
  ('streak', '{
      "free_freezes_per_week": 1,
      "max_freezes": 2,
      "freeze_price": 30
   }'::jsonb),
  ('goals', '{
      "daily_options": [1, 2, 3],
      "daily_default": 2,
      "daily_rewards": {"1": 5, "2": 8, "3": 10},
      "weekly_days": 5,
      "weekly_reward": 20
   }'::jsonb),
  ('solutions', '{
      "min_failed_attempts": 3,
      "min_minutes_since_first_attempt": 10,
      "xp_ratio_after_reveal": 0.5,
      "daily_ad_limit": 10
   }'::jsonb),
  ('achievements', '{
      "list": [
        {"id": "first_lesson",    "metric": "lessons",    "threshold": 1,   "coins": 5},
        {"id": "lessons_10",      "metric": "lessons",    "threshold": 10,  "coins": 10},
        {"id": "lessons_50",      "metric": "lessons",    "threshold": 50,  "coins": 25},
        {"id": "lessons_100",     "metric": "lessons",    "threshold": 100, "coins": 40},
        {"id": "first_challenge", "metric": "challenges", "threshold": 1,   "coins": 5},
        {"id": "challenges_10",   "metric": "challenges", "threshold": 10,  "coins": 15},
        {"id": "challenges_50",   "metric": "challenges", "threshold": 50,  "coins": 30},
        {"id": "first_course",    "metric": "courses",    "threshold": 1,   "coins": 20},
        {"id": "courses_5",       "metric": "courses",    "threshold": 5,   "coins": 40},
        {"id": "streak_7",        "metric": "streak",     "threshold": 7,   "coins": 15},
        {"id": "streak_30",       "metric": "streak",     "threshold": 30,  "coins": 40}
      ]
   }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- حزمة الذكاء بالكوينات: تُضاف للمفاتيح الموجودة فقط إن لم تكن مضبوطة
UPDATE coin_config
SET value = jsonb_build_object('coin_pack_price', 20, 'coin_pack_amount', 3, 'coin_packs_per_day', 1) || value,
    updated_at = NOW()
WHERE key = 'ai_quota' AND NOT (value ? 'coin_pack_price');

CREATE OR REPLACE FUNCTION _iso_week(p_day DATE)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$ SELECT to_char(p_day, 'IYYY-"W"IW') $$;

-- ----------------------------------------------------------------------------
-- 1) مستوى موحّد (نفس معادلة التطبيق: الحد الأدنى 1)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION kodax_level(p_xp INTEGER)
RETURNS INTEGER LANGUAGE sql IMMUTABLE AS $$
  SELECT GREATEST(1, FLOOR(SQRT(GREATEST(COALESCE(p_xp, 0), 0) / 100.0))::INTEGER);
$$;

CREATE OR REPLACE FUNCTION _xp_award(p_user UUID, p_source TEXT, p_ref TEXT, p_amount INTEGER)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_user IS NULL OR p_amount IS NULL OR p_amount <= 0 THEN
    RETURN 0;
  END IF;
  INSERT INTO xp_awards (user_id, source, ref_id, amount)
  VALUES (p_user, p_source, p_ref, p_amount)
  ON CONFLICT (user_id, source, ref_id) DO NOTHING;
  IF NOT FOUND THEN
    RETURN 0; -- مُنحت سابقاً
  END IF;
  UPDATE profiles
  SET xp = COALESCE(xp, 0) + p_amount,
      level = kodax_level(COALESCE(xp, 0) + p_amount),
      updated_at = now()
  WHERE id = p_user;
  RETURN p_amount;
END;
$$;
REVOKE ALL ON FUNCTION _xp_award(UUID, TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;

-- المستوى المحفوظ يطابق المعادلة (XP نفسه لا يتغير؛ فقط من كان مستواه 0 أو منحرفاً)
UPDATE profiles SET level = kodax_level(xp) WHERE level IS DISTINCT FROM kodax_level(xp);

-- streak_days صار يكتبه السيرفر فقط (كان قابلاً للتعديل من العميل مباشرة)
CREATE OR REPLACE FUNCTION _protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') AND NOT is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.xp := 0;
      NEW.level := 1;
      NEW.is_purchase_blocked := FALSE;
      NEW.streak_days := 0;
    ELSE
      NEW.xp := OLD.xp;
      NEW.level := OLD.level;
      NEW.is_purchase_blocked := OLD.is_purchase_blocked;
      NEW.streak_days := OLD.streak_days;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2) الإكمال الموثّق
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_lesson_progress' AND column_name = 'verified'
  ) THEN
    ALTER TABLE user_lesson_progress ADD COLUMN verified BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE user_lesson_progress ADD COLUMN verified_at TIMESTAMPTZ;
    ALTER TABLE user_lesson_progress ADD COLUMN verified_source TEXT;
    -- مرة واحدة فقط (أول تطبيق): كل إكمال موجود الآن يُعامل كموثّق "قديم" — لا يُسحب من أحد،
    -- ولا يُمنح عليه أي شيء جديد (XP القديم مسجّل في xp_awards، وهذا التحديث لا يطلق trigger الـXP).
    UPDATE user_lesson_progress
    SET verified = TRUE, verified_source = 'legacy',
        verified_at = COALESCE(completed_at, updated_at, created_at, NOW())
    WHERE completed IS TRUE;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_ulp_user_verified ON user_lesson_progress (user_id) WHERE verified;

-- العميل لا يستطيع توثيق إكمال، ولا تعديل صف موثّق (بما فيه completed_at)
CREATE OR REPLACE FUNCTION _ulp_client_guard()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') AND NOT is_admin() THEN
    IF TG_OP = 'UPDATE' AND OLD.verified THEN
      RETURN OLD; -- لا تغيير (بدون خطأ حتى لا تتعطل النسخ القديمة التي تعيد حفظ نفس الدرس)
    END IF;
    NEW.verified := FALSE;
    NEW.verified_at := NULL;
    NEW.verified_source := NULL;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_ulp_client_guard ON user_lesson_progress;
CREATE TRIGGER trg_ulp_client_guard
  BEFORE INSERT OR UPDATE ON user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION _ulp_client_guard();

-- حذف صف موثّق من العميل ممنوع (كان يسمح بإعادة "إكمال" الدرس)
DROP POLICY IF EXISTS ulp_delete_own_lessons ON user_lesson_progress;
CREATE POLICY ulp_delete_own_lessons ON user_lesson_progress
  FOR DELETE USING (auth.uid() = user_id AND course_id <> 'challenges' AND verified IS NOT TRUE);

-- XP الدرس للإكمال الموثّق فقط (بعد علامة legacy أعلاه، حتى لا يُطلق عليها)
CREATE OR REPLACE FUNCTION _ulp_award_lesson_xp()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_xp INTEGER;
BEGIN
  IF NEW.completed IS NOT TRUE OR NEW.verified IS NOT TRUE OR NEW.verified_source = 'legacy'
     OR NEW.course_id = 'challenges' OR NEW.user_id IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT xp INTO v_xp FROM lesson_catalog WHERE lesson_id = NEW.lesson_id;
  IF v_xp IS NULL OR NOT _lesson_accessible(NEW.user_id, NEW.lesson_id) THEN
    RETURN NULL;
  END IF;
  PERFORM _xp_award(NEW.user_id, 'lesson', NEW.lesson_id, v_xp);
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION _ulp_award_lesson_xp() FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3) الوصول للدورات بالتقدم
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION _lesson_done(p_user UUID, p_lesson TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM user_lesson_progress
                 WHERE user_id = p_user AND lesson_id = p_lesson AND completed IS TRUE AND verified);
$$;

-- نسبة الدروس الموثّقة المكتملة من الدورة
CREATE OR REPLACE FUNCTION _course_ratio(p_user UUID, p_course TEXT)
RETURNS NUMERIC LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN t.n = 0 THEN 0 ELSE d.n::NUMERIC / t.n END
  FROM (SELECT COUNT(*) AS n FROM lesson_catalog WHERE course_id = p_course) t,
       (SELECT COUNT(DISTINCT p.lesson_id) AS n
        FROM user_lesson_progress p
        JOIN lesson_catalog lc ON lc.lesson_id = p.lesson_id AND lc.course_id = p_course
        WHERE p.user_id = p_user AND p.completed IS TRUE AND p.verified) d;
$$;

-- الدورة متاحة إذا: بلا متطلب (مبتدئة)، أو تحقق المتطلب بالتعلم، أو فُتحت سابقاً (كوينات/مسار)،
-- أو بدأها المستخدم فعلاً بعد درس المعاينة (تقدم قديم لا يُسحب)، أو مشرف.
CREATE OR REPLACE FUNCTION _course_accessible(p_user UUID, p_course TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    NOT EXISTS (SELECT 1 FROM course_prereqs WHERE course_id = p_course)
    OR COALESCE((_coin_cfg('progression')->>'prereq_ratio')::NUMERIC, 0.7) <= 0
    OR EXISTS (SELECT 1 FROM user_unlocked_courses u WHERE u.user_id = p_user AND u.course_id = p_course)
    OR EXISTS (
      SELECT 1 FROM course_prereqs cp
      WHERE cp.course_id = p_course
        AND _course_ratio(p_user, cp.requires_course_id)
            >= COALESCE(cp.min_ratio, (_coin_cfg('progression')->>'prereq_ratio')::NUMERIC, 0.7)
    )
    OR EXISTS (
      SELECT 1 FROM user_lesson_progress p
      JOIN lesson_catalog lc ON lc.lesson_id = p.lesson_id AND lc.course_id = p_course
      WHERE p.user_id = p_user AND p.completed IS TRUE AND p.verified
        AND lc.position > (SELECT MIN(x.position) FROM lesson_catalog x WHERE x.course_id = p_course)
    )
    OR is_admin(p_user);
$$;

-- الدرس متاح إذا كانت دورته متاحة، أو كان درس المعاينة (الأول)
CREATE OR REPLACE FUNCTION _lesson_accessible(p_user UUID, p_lesson_id TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM lesson_catalog lc
    WHERE lc.lesson_id = p_lesson_id
      AND (
        _course_accessible(p_user, lc.course_id)
        OR lc.position = (SELECT MIN(x.position) FROM lesson_catalog x WHERE x.course_id = lc.course_id)
      )
  );
$$;

-- التحدي متاح بالتقدم في دورته (لا بالكوينات)
CREATE OR REPLACE FUNCTION _challenge_accessible(p_user UUID, p_challenge_id TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM challenge_catalog ch
    WHERE ch.id = p_challenge_id
      AND (ch.required_course_id IS NULL OR _course_accessible(p_user, ch.required_course_id))
  );
$$;

REVOKE ALL ON FUNCTION _lesson_done(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION _course_ratio(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION _course_accessible(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION _lesson_accessible(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION _challenge_accessible(UUID, TEXT) FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4) النشاط والسلسلة (مصدر واحد على السيرفر)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_activity_days (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  lessons INTEGER NOT NULL DEFAULT 0,
  challenges_solved INTEGER NOT NULL DEFAULT 0,
  challenge_attempts INTEGER NOT NULL DEFAULT 0,
  frozen BOOLEAN NOT NULL DEFAULT FALSE,
  first_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, day)
);
CREATE INDEX IF NOT EXISTS idx_activity_days_day ON user_activity_days (day);
ALTER TABLE user_activity_days ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON user_activity_days FROM anon, authenticated;
GRANT SELECT ON user_activity_days TO authenticated;
DROP POLICY IF EXISTS activity_days_select ON user_activity_days;
CREATE POLICY activity_days_select ON user_activity_days FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  best_streak INTEGER NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
  last_active_day DATE,
  freezes INTEGER NOT NULL DEFAULT 0 CHECK (freezes >= 0),
  freezes_used INTEGER NOT NULL DEFAULT 0,
  free_freeze_week TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON user_streaks FROM anon, authenticated;
GRANT SELECT ON user_streaks TO authenticated;
DROP POLICY IF EXISTS user_streaks_select ON user_streaks;
CREATE POLICY user_streaks_select ON user_streaks FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- تهيئة لمرة واحدة من البيانات القديمة: الإكمالات السابقة أيام نشاط، والسلسلة الحالية تبقى كما هي
INSERT INTO user_activity_days (user_id, day, lessons, challenges_solved, first_at)
SELECT p.user_id,
       (COALESCE(p.completed_at, p.updated_at) AT TIME ZONE COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad'))::date,
       COUNT(*) FILTER (WHERE p.course_id <> 'challenges'),
       COUNT(*) FILTER (WHERE p.course_id = 'challenges'),
       MIN(COALESCE(p.completed_at, p.updated_at))
FROM user_lesson_progress p
JOIN profiles pr ON pr.id = p.user_id
WHERE p.completed IS TRUE AND p.verified AND COALESCE(p.completed_at, p.updated_at) IS NOT NULL
GROUP BY 1, 2
ON CONFLICT (user_id, day) DO NOTHING;

INSERT INTO user_streaks (user_id, current_streak, best_streak, last_active_day, freezes, free_freeze_week)
SELECT pr.id,
       COALESCE(pr.streak_days, 0),
       COALESCE(pr.streak_days, 0),
       GREATEST(
         (SELECT us.last_active_date FROM user_stats us WHERE us.user_id = pr.id),
         (SELECT MAX(d.day) FROM user_activity_days d WHERE d.user_id = pr.id)
       ),
       1,
       _iso_week(_coin_today())
FROM profiles pr
ON CONFLICT (user_id) DO NOTHING;

-- تسوية السلسلة حتى اليوم: الأيام الفائتة تُغطّى بالتجميد إن توفر، وإلا تنقطع (بلا أي خصم آخر)
CREATE OR REPLACE FUNCTION _streak_settle(p_user UUID)
RETURNS user_streaks LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cfg JSONB := _coin_cfg('streak');
  v_today DATE := _coin_today();
  v_week TEXT := _iso_week(_coin_today());
  v_max INTEGER := COALESCE((v_cfg->>'max_freezes')::INTEGER, 2);
  v_free INTEGER := COALESCE((v_cfg->>'free_freezes_per_week')::INTEGER, 1);
  v_s user_streaks%ROWTYPE;
  v_missed INTEGER;
BEGIN
  INSERT INTO user_streaks (user_id) VALUES (p_user) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO v_s FROM user_streaks WHERE user_id = p_user FOR UPDATE;

  IF v_s.free_freeze_week IS DISTINCT FROM v_week THEN
    v_s.freezes := GREATEST(v_s.freezes, LEAST(v_max, v_s.freezes + v_free));
    v_s.free_freeze_week := v_week;
  END IF;

  IF v_s.last_active_day IS NOT NULL AND v_s.last_active_day < v_today - 1 AND v_s.current_streak > 0 THEN
    v_missed := (v_today - 1) - v_s.last_active_day;
    IF v_missed <= v_s.freezes THEN
      INSERT INTO user_activity_days (user_id, day, frozen)
      SELECT p_user, g::date, TRUE
      FROM generate_series(v_s.last_active_day + 1, v_today - 1, INTERVAL '1 day') g
      ON CONFLICT (user_id, day) DO NOTHING;
      v_s.freezes := v_s.freezes - v_missed;
      v_s.freezes_used := v_s.freezes_used + v_missed;
      v_s.last_active_day := v_today - 1; -- الأيام المجمّدة تحفظ السلسلة ولا تزيدها
    ELSE
      v_s.current_streak := 0;
    END IF;
  END IF;

  UPDATE user_streaks SET
    current_streak = v_s.current_streak, freezes = v_s.freezes, freezes_used = v_s.freezes_used,
    free_freeze_week = v_s.free_freeze_week, last_active_day = v_s.last_active_day, updated_at = NOW()
  WHERE user_id = p_user;
  UPDATE profiles SET streak_days = v_s.current_streak
  WHERE id = p_user AND streak_days IS DISTINCT FROM v_s.current_streak;
  RETURN v_s;
END;
$$;
REVOKE ALL ON FUNCTION _streak_settle(UUID) FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5) الأهداف والإنجازات
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_goals (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  daily_target INTEGER NOT NULL DEFAULT 2 CHECK (daily_target BETWEEN 1 AND 10),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON user_goals FROM anon, authenticated;
GRANT SELECT ON user_goals TO authenticated;
DROP POLICY IF EXISTS user_goals_select ON user_goals;
CREATE POLICY user_goals_select ON user_goals FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE TABLE IF NOT EXISTS achievements_awarded (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  coins INTEGER NOT NULL DEFAULT 0,
  legacy BOOLEAN NOT NULL DEFAULT FALSE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);
ALTER TABLE achievements_awarded ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON achievements_awarded FROM anon, authenticated;
GRANT SELECT ON achievements_awarded TO authenticated;
DROP POLICY IF EXISTS achievements_awarded_select ON achievements_awarded;
CREATE POLICY achievements_awarded_select ON achievements_awarded FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- حالة الأهداف اليوم/الأسبوع (بدون كتابة)
CREATE OR REPLACE FUNCTION _goals_state(p_user UUID)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cfg JSONB := _coin_cfg('goals');
  v_today DATE := _coin_today();
  v_week TEXT := _iso_week(_coin_today());
  v_target INTEGER;
  v_units INTEGER;
  v_week_days INTEGER;
  v_wtarget INTEGER := COALESCE((v_cfg->>'weekly_days')::INTEGER, 5);
BEGIN
  SELECT daily_target INTO v_target FROM user_goals WHERE user_id = p_user;
  v_target := COALESCE(v_target, (v_cfg->>'daily_default')::INTEGER, 2);
  SELECT lessons + challenges_solved INTO v_units FROM user_activity_days WHERE user_id = p_user AND day = v_today;
  SELECT COUNT(*) INTO v_week_days FROM user_activity_days
  WHERE user_id = p_user AND NOT frozen AND lessons + challenges_solved + challenge_attempts > 0
    AND day BETWEEN date_trunc('week', v_today)::date AND v_today;
  RETURN jsonb_build_object(
    'daily_target', v_target,
    'daily_options', COALESCE(v_cfg->'daily_options', '[1,2,3]'::jsonb),
    'today_units', COALESCE(v_units, 0),
    'daily_done', COALESCE(v_units, 0) >= v_target,
    'daily_reward', COALESCE((v_cfg->'daily_rewards'->>v_target::TEXT)::INTEGER, 0),
    'daily_rewarded', EXISTS (SELECT 1 FROM point_transactions WHERE user_id = p_user AND idempotency_key = 'goal_day:' || v_today),
    'weekly_target_days', v_wtarget,
    'week_active_days', v_week_days,
    'weekly_done', v_week_days >= v_wtarget,
    'weekly_reward', COALESCE((v_cfg->>'weekly_reward')::INTEGER, 0),
    'weekly_rewarded', EXISTS (SELECT 1 FROM point_transactions WHERE user_id = p_user AND idempotency_key = 'goal_week:' || v_week)
  );
END;
$$;

-- منح مكافآت الأهداف (مرة لكل يوم/أسبوع عبر مفتاح عدم التكرار)
CREATE OR REPLACE FUNCTION _goals_award(p_user UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_state JSONB := _goals_state(p_user);
  v_today DATE := _coin_today();
  v_res JSONB;
  v_daily INTEGER := 0;
  v_weekly INTEGER := 0;
BEGIN
  IF _coins_restricted(p_user) THEN
    RETURN v_state || jsonb_build_object('awarded_daily', 0, 'awarded_weekly', 0);
  END IF;
  IF (v_state->>'daily_done')::boolean AND (v_state->>'daily_reward')::INTEGER > 0 THEN
    v_res := _coins_apply(p_user, (v_state->>'daily_reward')::INTEGER, 'goal_daily', 'هدف اليوم',
                          v_today::TEXT, 'goal_day:' || v_today);
    IF NOT COALESCE((v_res->>'duplicate')::boolean, FALSE) THEN v_daily := (v_state->>'daily_reward')::INTEGER; END IF;
  END IF;
  IF (v_state->>'weekly_done')::boolean AND (v_state->>'weekly_reward')::INTEGER > 0 THEN
    v_res := _coins_apply(p_user, (v_state->>'weekly_reward')::INTEGER, 'goal_weekly', 'هدف الأسبوع',
                          _iso_week(v_today), 'goal_week:' || _iso_week(v_today));
    IF NOT COALESCE((v_res->>'duplicate')::boolean, FALSE) THEN v_weekly := (v_state->>'weekly_reward')::INTEGER; END IF;
  END IF;
  RETURN _goals_state(p_user) || jsonb_build_object('awarded_daily', v_daily, 'awarded_weekly', v_weekly);
END;
$$;

-- مقاييس الإنجازات من البيانات الموثّقة فقط
CREATE OR REPLACE FUNCTION _achievement_metrics(p_user UUID)
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'lessons', (SELECT COUNT(*) FROM user_lesson_progress
                WHERE user_id = p_user AND completed IS TRUE AND verified AND course_id <> 'challenges'),
    'challenges', (SELECT COUNT(*) FROM user_lesson_progress
                   WHERE user_id = p_user AND completed IS TRUE AND verified AND course_id = 'challenges'),
    'courses', (SELECT COUNT(*) FROM (
                  SELECT lc.course_id FROM lesson_catalog lc
                  LEFT JOIN user_lesson_progress p
                    ON p.lesson_id = lc.lesson_id AND p.user_id = p_user AND p.completed IS TRUE AND p.verified
                  GROUP BY lc.course_id HAVING COUNT(p.lesson_id) = COUNT(*)) x),
    'streak', COALESCE((SELECT best_streak FROM user_streaks WHERE user_id = p_user), 0)
  );
$$;

-- p_legacy = TRUE: تسجيل ما تحقق مسبقاً بلا كوينات (لا مكافآت بسبب الـmigration)
CREATE OR REPLACE FUNCTION _achievements_check(p_user UUID, p_legacy BOOLEAN DEFAULT FALSE)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_m JSONB := _achievement_metrics(p_user);
  v_a JSONB;
  v_new JSONB := '[]'::jsonb;
  v_coins INTEGER;
  v_restricted BOOLEAN := _coins_restricted(p_user);
BEGIN
  FOR v_a IN SELECT * FROM jsonb_array_elements(COALESCE(_coin_cfg('achievements')->'list', '[]'::jsonb)) LOOP
    IF COALESCE((v_m->>(v_a->>'metric'))::INTEGER, 0) >= COALESCE((v_a->>'threshold')::INTEGER, 2147483647) THEN
      v_coins := CASE WHEN p_legacy OR v_restricted THEN 0 ELSE COALESCE((v_a->>'coins')::INTEGER, 0) END;
      INSERT INTO achievements_awarded (user_id, achievement_id, coins, legacy)
      VALUES (p_user, v_a->>'id', v_coins, p_legacy)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
      IF FOUND THEN
        IF v_coins > 0 THEN
          PERFORM _coins_apply(p_user, v_coins, 'achievement', 'إنجاز: ' || (v_a->>'id'), v_a->>'id', 'achv:' || (v_a->>'id'));
        END IF;
        v_new := v_new || jsonb_build_array(jsonb_build_object('id', v_a->>'id', 'coins', v_coins));
      END IF;
    END IF;
  END LOOP;
  RETURN v_new;
END;
$$;

-- ----------------------------------------------------------------------------
-- 6) التحليلات
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  event TEXT NOT NULL,
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  day DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_event_day ON analytics_events (event, day);
CREATE INDEX IF NOT EXISTS idx_analytics_user_day ON analytics_events (user_id, day);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON analytics_events FROM anon, authenticated;
DROP POLICY IF EXISTS analytics_events_admin_read ON analytics_events;
CREATE POLICY analytics_events_admin_read ON analytics_events FOR SELECT USING (is_admin());

CREATE OR REPLACE FUNCTION _track(p_user UUID, p_event TEXT, p_props JSONB DEFAULT '{}'::jsonb)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO analytics_events (user_id, event, props, day)
  VALUES (p_user, p_event, COALESCE(p_props, '{}'::jsonb), _coin_today());
EXCEPTION WHEN OTHERS THEN
  NULL; -- التحليلات لا تُفشل أي عملية أساسية
END;
$$;
REVOKE ALL ON FUNCTION _track(UUID, TEXT, JSONB) FROM PUBLIC, anon, authenticated;

-- أحداث الواجهة فقط (ما لا يراه السيرفر): قائمة مسموحة، حجم محدود، حد يومي
CREATE OR REPLACE FUNCTION track_event(p_event TEXT, p_props JSONB DEFAULT '{}'::jsonb)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF p_event NOT IN ('app_open', 'lesson_opened', 'challenge_opened', 'ad_requested', 'ad_shown',
                     'ad_completed', 'ad_closed_early', 'ad_failed', 'solution_button_tapped',
                     'ai_quota_exhausted_shown', 'ai_extra_offer_tapped', 'goal_screen_opened') THEN
    RETURN jsonb_build_object('success', false, 'code', 'unknown_event');
  END IF;
  IF length(COALESCE(p_props, '{}'::jsonb)::TEXT) > 1000 THEN
    RETURN jsonb_build_object('success', false, 'code', 'too_large');
  END IF;
  IF (SELECT COUNT(*) FROM analytics_events WHERE user_id = v_uid AND day = _coin_today()) >= 300 THEN
    RETURN jsonb_build_object('success', false, 'code', 'rate_limited');
  END IF;
  -- app_open: مرة واحدة يومياً تكفي لـ DAU والاحتفاظ
  IF p_event = 'app_open' AND EXISTS (
    SELECT 1 FROM analytics_events WHERE user_id = v_uid AND day = _coin_today() AND event = 'app_open'
  ) THEN
    RETURN jsonb_build_object('success', true, 'duplicate', true);
  END IF;
  PERFORM _track(v_uid, p_event, p_props);
  RETURN jsonb_build_object('success', true);
END;
$$;

-- ----------------------------------------------------------------------------
-- 7) لمس النشاط: يُستدعى فقط من مسارات السيرفر الموثّقة (درس، تحدٍ)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION _activity_touch(p_user UUID, p_kind TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_today DATE := _coin_today();
  v_s user_streaks%ROWTYPE;
  v_row user_activity_days%ROWTYPE;
  v_new_day BOOLEAN;
  v_goals JSONB;
  v_achv JSONB;
BEGIN
  v_s := _streak_settle(p_user);
  SELECT * INTO v_row FROM user_activity_days WHERE user_id = p_user AND day = v_today FOR UPDATE;
  v_new_day := NOT FOUND OR v_row.frozen OR (v_row.lessons + v_row.challenges_solved + v_row.challenge_attempts) = 0;

  INSERT INTO user_activity_days (user_id, day, lessons, challenges_solved, challenge_attempts)
  VALUES (p_user, v_today, (p_kind = 'lesson')::INTEGER, (p_kind = 'challenge_solved')::INTEGER,
          (p_kind = 'challenge_attempt')::INTEGER)
  ON CONFLICT (user_id, day) DO UPDATE SET
    lessons = user_activity_days.lessons + EXCLUDED.lessons,
    challenges_solved = user_activity_days.challenges_solved + EXCLUDED.challenges_solved,
    challenge_attempts = user_activity_days.challenge_attempts + EXCLUDED.challenge_attempts,
    frozen = FALSE;

  IF v_new_day THEN
    v_s.current_streak := CASE
      WHEN v_s.last_active_day = v_today - 1 THEN v_s.current_streak + 1
      WHEN v_s.last_active_day = v_today THEN GREATEST(v_s.current_streak, 1)
      ELSE 1 END;
    v_s.best_streak := GREATEST(v_s.best_streak, v_s.current_streak);
    UPDATE user_streaks SET current_streak = v_s.current_streak, best_streak = v_s.best_streak,
      last_active_day = v_today, updated_at = NOW()
    WHERE user_id = p_user;
    UPDATE profiles SET streak_days = v_s.current_streak WHERE id = p_user;
  END IF;

  v_goals := _goals_award(p_user);
  v_achv := _achievements_check(p_user, FALSE);
  RETURN jsonb_build_object('streak', v_s.current_streak, 'best_streak', v_s.best_streak,
                            'freezes', v_s.freezes, 'new_day', v_new_day,
                            'goals', v_goals, 'achievements', v_achv);
END;
$$;
REVOKE ALL ON FUNCTION _activity_touch(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION _goals_state(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION _goals_award(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION _achievement_metrics(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION _achievements_check(UUID, BOOLEAN) FROM PUBLIC, anon, authenticated;

-- إنجازات تحققت قبل هذا الملف: تُسجَّل بلا كوينات (مرة واحدة)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT user_id FROM user_lesson_progress WHERE completed IS TRUE AND verified
           AND user_id IN (SELECT id FROM profiles)
           AND user_id NOT IN (SELECT user_id FROM achievements_awarded) LOOP
    PERFORM _achievements_check(r.user_id, TRUE);
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 8) دوال السلسلة القديمة: لا مستخدم آخر، لا أرقام من العميل، لا anon
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;
  -- لا يضيف نشاطاً: النشاط يُسجَّل من الإكمال الموثّق فقط. هذا يحدّث العرض (التجميد/الانقطاع) فقط.
  PERFORM _streak_settle(p_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION record_daily_progress(p_user_id UUID, p_lessons INTEGER DEFAULT 0,
                                                 p_challenges INTEGER DEFAULT 0, p_xp INTEGER DEFAULT 0)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_today DATE := _coin_today();
  v_a user_activity_days%ROWTYPE;
  v_s user_streaks%ROWTYPE;
  v_level INTEGER;
  v_goal_lessons INTEGER;
  v_goal_challenges INTEGER;
  v_goal_xp INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;
  -- الأرقام المرسلة تُتجاهل: الحالة من النشاط الموثّق
  v_s := _streak_settle(p_user_id);
  SELECT * INTO v_a FROM user_activity_days WHERE user_id = p_user_id AND day = v_today;

  -- نفس الأهداف القديمة حسب المستوى (التطبيق يقسم عليها في شريط التقدم اليومي — لا أصفار)
  -- المستوى من المعادلة الموحّدة (profiles.xp)، لا من user_stats القديم
  v_level := kodax_level((SELECT xp FROM profiles WHERE id = p_user_id));
  IF v_level <= 3 THEN
    v_goal_lessons := 2; v_goal_challenges := 1; v_goal_xp := 200;
  ELSIF v_level <= 6 THEN
    v_goal_lessons := 3; v_goal_challenges := 1; v_goal_xp := 300;
  ELSIF v_level <= 10 THEN
    v_goal_lessons := 4; v_goal_challenges := 2; v_goal_xp := 400;
  ELSIF v_level <= 15 THEN
    v_goal_lessons := 5; v_goal_challenges := 2; v_goal_xp := 500;
  ELSE
    v_goal_lessons := 6; v_goal_challenges := 3; v_goal_xp := 600;
  END IF;

  RETURN json_build_object(
    'lessons_completed', COALESCE(v_a.lessons, 0),
    'challenges_completed', COALESCE(v_a.challenges_solved, 0),
    'xp_earned', COALESCE((SELECT SUM(amount) FROM xp_awards WHERE user_id = p_user_id
                           AND (created_at AT TIME ZONE COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad'))::date = v_today), 0),
    'goal_lessons', v_goal_lessons,
    'goal_challenges', v_goal_challenges,
    'goal_xp', v_goal_xp,
    'streak', v_s.current_streak,
    'date', v_today
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_daily_progress(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN record_daily_progress(p_user_id, 0, 0, 0);
END;
$$;

REVOKE ALL ON FUNCTION update_user_streak(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION record_daily_progress(UUID, INTEGER, INTEGER, INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION get_daily_progress(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION update_user_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_daily_progress(UUID, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_progress(UUID) TO authenticated;
-- daily_progress القديم: لا كتابة من العميل
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON daily_progress FROM anon, authenticated;

-- ----------------------------------------------------------------------------
-- 9) السلّم اليومي: نفس القيم (155/أسبوع)، النشاط الموثّق، والتجميد يحفظ التتابع
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION _coins_has_activity(p_user UUID, p_day DATE)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM user_activity_days
                 WHERE user_id = p_user AND day = p_day AND NOT frozen
                   AND lessons + challenges_solved + challenge_attempts > 0);
$$;

-- هل يتواصل السلّم من آخر مطالبة حتى اليوم؟ (كل يوم بينهما نشط أو مجمّد)
CREATE OR REPLACE FUNCTION _ladder_continues(p_user UUID, p_last DATE, p_today DATE)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p_last IS NOT NULL AND p_last < p_today AND (
    p_last = p_today - 1
    OR NOT EXISTS (
      SELECT 1 FROM generate_series(p_last + 1, p_today - 1, INTERVAL '1 day') g
      WHERE NOT EXISTS (SELECT 1 FROM user_activity_days d WHERE d.user_id = p_user AND d.day = g::date)
    )
  );
$$;
REVOKE ALL ON FUNCTION _ladder_continues(UUID, DATE, DATE) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION coins_claim_daily_reward()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_cfg JSONB := _coin_cfg('daily_ladder');
  v_today DATE := _coin_today();
  v_row user_daily_rewards%ROWTYPE;
  v_day INTEGER;
  v_run INTEGER;
  v_reward INTEGER;
  v_reset BOOLEAN := FALSE;
  v_res JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;

  PERFORM _streak_settle(v_uid);
  INSERT INTO user_daily_rewards (user_id) VALUES (v_uid) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO v_row FROM user_daily_rewards WHERE user_id = v_uid FOR UPDATE;

  IF v_row.last_claim_date = v_today THEN
    RETURN jsonb_build_object('success', false, 'code', 'already_claimed', 'day', v_row.current_day);
  END IF;
  IF COALESCE((v_cfg->>'requires_activity')::boolean, TRUE) AND NOT _coins_has_activity(v_uid, v_today) THEN
    RETURN jsonb_build_object('success', false, 'code', 'activity_required');
  END IF;

  IF _ladder_continues(v_uid, v_row.last_claim_date, v_today) THEN
    v_day := (v_row.current_day % 7) + 1;
    v_run := v_row.run_days + 1;
  ELSE
    v_reset := v_row.last_claim_date IS NOT NULL;
    v_day := 1;
    v_run := 1;
  END IF;

  v_reward := COALESCE((v_cfg->'rewards'->>(v_day - 1))::INTEGER, 5);
  v_res := _coins_apply(v_uid, v_reward, 'daily_reward', 'مكافأة اليوم ' || v_day,
                        v_today::TEXT, 'daily:' || v_today::TEXT);

  UPDATE user_daily_rewards SET
    current_day = v_day, run_days = v_run, best_run = GREATEST(best_run, v_run),
    total_claims = total_claims + 1, last_claim_date = v_today, updated_at = NOW()
  WHERE user_id = v_uid;

  RETURN jsonb_build_object('success', true, 'day', v_day, 'reward', v_reward,
                            'run_days', v_run, 'streak_reset', v_reset, 'balance', v_res->'balance');
END;
$$;

-- ----------------------------------------------------------------------------
-- 10) إكمال الدرس الموثّق + مكافأة إكمال الدورة
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION _course_completion_award(p_user UUID, p_course TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_c course_coin_catalog%ROWTYPE;
  v_total INTEGER;
  v_done INTEGER;
  v_amount INTEGER;
  v_res JSONB;
BEGIN
  IF _coins_restricted(p_user) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;
  SELECT * INTO v_c FROM course_coin_catalog WHERE course_id = p_course;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'unknown_course');
  END IF;
  SELECT COUNT(*) INTO v_total FROM lesson_catalog WHERE course_id = p_course;
  IF v_total = 0 THEN v_total := v_c.total_lessons; END IF;
  SELECT COUNT(DISTINCT p.lesson_id) INTO v_done
  FROM user_lesson_progress p
  JOIN lesson_catalog lc ON lc.lesson_id = p.lesson_id AND lc.course_id = p_course
  WHERE p.user_id = p_user AND p.completed IS TRUE AND p.verified;
  IF v_done < v_total THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_completed', 'completed', v_done, 'total', v_total);
  END IF;
  v_amount := COALESCE((_coin_cfg('course_completion_rewards')->>v_c.difficulty)::INTEGER, 30);
  v_res := _coins_apply(p_user, v_amount, 'course_complete', 'إكمال دورة: ' || v_c.title,
                        p_course, 'course_complete:' || p_course);
  IF (v_res->>'success')::boolean AND NOT COALESCE((v_res->>'duplicate')::boolean, FALSE) THEN
    PERFORM _track(p_user, 'course_completed', jsonb_build_object('course_id', p_course));
  END IF;
  RETURN v_res || jsonb_build_object('reward', v_amount);
END;
$$;
REVOKE ALL ON FUNCTION _course_completion_award(UUID, TEXT) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION coins_reward_course_completion(p_course_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  RETURN _course_completion_award(auth.uid(), p_course_id);
END;
$$;

CREATE OR REPLACE FUNCTION progress_complete_lesson(p_lesson_id TEXT, p_quiz_answer INTEGER DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_cfg JSONB := _coin_cfg('progression');
  v_l lesson_catalog%ROWTYPE;
  v_prev TEXT;
  v_next TEXT;
  v_last TIMESTAMPTZ;
  v_gap INTEGER := COALESCE((v_cfg->>'min_seconds_between_lessons')::INTEGER, 20);
  v_xp_before INTEGER;
  v_xp_after INTEGER;
  v_activity JSONB;
  v_course JSONB := NULL;
  v_req TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  SELECT * INTO v_l FROM lesson_catalog WHERE lesson_id = p_lesson_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'unknown_lesson');
  END IF;

  -- تسلسل كل طلبات المستخدم (الطلبات المتزامنة لا تتجاوز الفاصل ولا تكرر شيئاً)
  PERFORM 1 FROM profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'no_profile');
  END IF;

  IF _lesson_done(v_uid, p_lesson_id) THEN
    RETURN jsonb_build_object('success', true, 'already_completed', true, 'xp_awarded', 0,
                              'course_id', v_l.course_id);
  END IF;

  IF NOT _lesson_accessible(v_uid, p_lesson_id) THEN
    SELECT requires_course_id INTO v_req FROM course_prereqs WHERE course_id = v_l.course_id;
    RETURN jsonb_build_object('success', false, 'code', 'course_locked', 'course_id', v_l.course_id,
      'requires_course_id', v_req,
      'required_ratio', COALESCE((SELECT min_ratio FROM course_prereqs WHERE course_id = v_l.course_id),
                                 (v_cfg->>'prereq_ratio')::NUMERIC, 0.7),
      'progress', CASE WHEN v_req IS NULL THEN NULL ELSE _course_ratio(v_uid, v_req) END);
  END IF;

  -- الدرس السابق في نفس الدورة (إلا إذا وصل المستخدم سابقاً لما بعد هذا الدرس)
  SELECT lesson_id INTO v_prev FROM lesson_catalog
  WHERE course_id = v_l.course_id AND position < v_l.position ORDER BY position DESC LIMIT 1;
  IF v_prev IS NOT NULL AND NOT _lesson_done(v_uid, v_prev) AND NOT EXISTS (
    SELECT 1 FROM user_lesson_progress p
    JOIN lesson_catalog lc ON lc.lesson_id = p.lesson_id AND lc.course_id = v_l.course_id
    WHERE p.user_id = v_uid AND p.completed IS TRUE AND p.verified AND lc.position > v_l.position
  ) THEN
    RETURN jsonb_build_object('success', false, 'code', 'previous_required', 'previous_lesson_id', v_prev);
  END IF;

  IF v_l.quiz_correct IS NOT NULL AND COALESCE((v_cfg->>'quiz_required')::boolean, TRUE) THEN
    IF p_quiz_answer IS NULL THEN
      RETURN jsonb_build_object('success', false, 'code', 'quiz_required');
    END IF;
    IF p_quiz_answer <> v_l.quiz_correct THEN
      PERFORM _track(v_uid, 'lesson_quiz_wrong', jsonb_build_object('lesson_id', p_lesson_id));
      RETURN jsonb_build_object('success', false, 'code', 'wrong_answer'); -- بلا عقوبة: يحاول مرة أخرى
    END IF;
  END IF;

  SELECT MAX(verified_at) INTO v_last FROM user_lesson_progress
  WHERE user_id = v_uid AND verified AND verified_source = 'server';
  IF v_last IS NOT NULL AND v_last > NOW() - make_interval(secs => v_gap) THEN
    RETURN jsonb_build_object('success', false, 'code', 'too_fast',
      'retry_after', CEIL(EXTRACT(EPOCH FROM (v_last + make_interval(secs => v_gap) - NOW()))));
  END IF;

  SELECT COALESCE(xp, 0) INTO v_xp_before FROM profiles WHERE id = v_uid;
  INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed, xp_earned, completed_at,
                                    updated_at, verified, verified_at, verified_source)
  VALUES (v_uid, p_lesson_id, v_l.course_id, TRUE, v_l.xp, NOW(), NOW(), TRUE, NOW(), 'server')
  ON CONFLICT (user_id, lesson_id) DO UPDATE SET
    completed = TRUE, course_id = EXCLUDED.course_id, xp_earned = EXCLUDED.xp_earned,
    completed_at = NOW(), updated_at = NOW(), verified = TRUE, verified_at = NOW(), verified_source = 'server';
  SELECT COALESCE(xp, 0) INTO v_xp_after FROM profiles WHERE id = v_uid;

  v_activity := _activity_touch(v_uid, 'lesson');
  IF _course_ratio(v_uid, v_l.course_id) >= 1 THEN
    v_course := _course_completion_award(v_uid, v_l.course_id);
  END IF;
  SELECT lesson_id INTO v_next FROM lesson_catalog
  WHERE course_id = v_l.course_id AND position > v_l.position ORDER BY position LIMIT 1;

  PERFORM _track(v_uid, 'lesson_completed', jsonb_build_object('lesson_id', p_lesson_id, 'course_id', v_l.course_id));
  RETURN jsonb_build_object(
    'success', true, 'already_completed', false, 'course_id', v_l.course_id,
    'xp_awarded', v_xp_after - v_xp_before, 'xp', v_xp_after, 'level', kodax_level(v_xp_after),
    'next_lesson_id', v_next, 'course_progress', _course_ratio(v_uid, v_l.course_id),
    'course_completion', v_course, 'activity', v_activity
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 11) حالة التقدم للتطبيق (دورات متاحة ولماذا، دروس موثّقة، سلسلة، أهداف)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION progress_get_state()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_s user_streaks%ROWTYPE;
  v_cfg JSONB := _coin_cfg('streak');
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  v_s := _streak_settle(v_uid);
  RETURN jsonb_build_object(
    'success', true,
    'courses', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'course_id', c.course_id,
        'accessible', _course_accessible(v_uid, c.course_id),
        'purchased', EXISTS (SELECT 1 FROM user_unlocked_courses u WHERE u.user_id = v_uid AND u.course_id = c.course_id),
        'requires_course_id', cp.requires_course_id,
        'required_ratio', CASE WHEN cp.course_id IS NULL THEN NULL
                               ELSE COALESCE(cp.min_ratio, (_coin_cfg('progression')->>'prereq_ratio')::NUMERIC, 0.7) END,
        'prereq_progress', CASE WHEN cp.course_id IS NULL THEN NULL ELSE _course_ratio(v_uid, cp.requires_course_id) END,
        'progress', _course_ratio(v_uid, c.course_id),
        'shortcut_cost', c.unlock_cost
      ) ORDER BY c.course_id)
      FROM course_coin_catalog c LEFT JOIN course_prereqs cp ON cp.course_id = c.course_id
      WHERE c.is_active), '[]'::jsonb),
    'completed_lessons', COALESCE((
      SELECT jsonb_agg(lesson_id) FROM user_lesson_progress
      WHERE user_id = v_uid AND completed IS TRUE AND verified AND course_id <> 'challenges'), '[]'::jsonb),
    'unverified_lessons', COALESCE((
      SELECT jsonb_agg(lesson_id) FROM user_lesson_progress
      WHERE user_id = v_uid AND completed IS TRUE AND NOT verified AND course_id <> 'challenges'), '[]'::jsonb),
    'streak', jsonb_build_object(
      'current', v_s.current_streak, 'best', v_s.best_streak, 'freezes', v_s.freezes,
      'max_freezes', COALESCE((v_cfg->>'max_freezes')::INTEGER, 2),
      'freeze_price', COALESCE((v_cfg->>'freeze_price')::INTEGER, 30),
      'free_freezes_per_week', COALESCE((v_cfg->>'free_freezes_per_week')::INTEGER, 1),
      'active_today', _coins_has_activity(v_uid, _coin_today())),
    'goals', _goals_state(v_uid),
    'achievements', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', achievement_id, 'coins', coins, 'awarded_at', awarded_at))
                              FROM achievements_awarded WHERE user_id = v_uid), '[]'::jsonb),
    'level', kodax_level((SELECT xp FROM profiles WHERE id = v_uid))
  );
END;
$$;

CREATE OR REPLACE FUNCTION goals_set(p_daily_target INTEGER)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF NOT (COALESCE(_coin_cfg('goals')->'daily_options', '[1,2,3]'::jsonb) @> to_jsonb(p_daily_target)) THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_target');
  END IF;
  INSERT INTO user_goals (user_id, daily_target) VALUES (v_uid, p_daily_target)
  ON CONFLICT (user_id) DO UPDATE SET daily_target = EXCLUDED.daily_target, updated_at = NOW();
  RETURN jsonb_build_object('success', true) || _goals_state(v_uid);
END;
$$;

CREATE OR REPLACE FUNCTION goals_state()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  RETURN jsonb_build_object('success', true) || _goals_state(auth.uid());
END;
$$;

-- تجميد إضافي بالكوينات (اختياري)
CREATE OR REPLACE FUNCTION streak_freeze_buy()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_cfg JSONB := _coin_cfg('streak');
  v_price INTEGER := COALESCE((_coin_cfg('streak')->>'freeze_price')::INTEGER, 30);
  v_max INTEGER := COALESCE((_coin_cfg('streak')->>'max_freezes')::INTEGER, 2);
  v_s user_streaks%ROWTYPE;
  v_res JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;
  v_s := _streak_settle(v_uid); -- يقفل صف السلسلة حتى نهاية المعاملة
  IF v_s.freezes >= v_max THEN
    RETURN jsonb_build_object('success', false, 'code', 'max_freezes', 'freezes', v_s.freezes, 'max', v_max);
  END IF;
  v_res := _coins_apply(v_uid, -v_price, 'streak_freeze', 'تجميد السلسلة', NULL, NULL);
  IF NOT (v_res->>'success')::boolean THEN
    RETURN v_res || jsonb_build_object('cost', v_price);
  END IF;
  UPDATE user_streaks SET freezes = freezes + 1, updated_at = NOW() WHERE user_id = v_uid;
  PERFORM _track(v_uid, 'streak_freeze_bought', jsonb_build_object('price', v_price));
  RETURN jsonb_build_object('success', true, 'cost', v_price, 'freezes', v_s.freezes + 1, 'max', v_max,
                            'balance', v_res->'balance');
END;
$$;

-- ----------------------------------------------------------------------------
-- 12) الكوينات كاختصار: الفتح المبكر للدورة/المسار (لا يلزم للتعلم)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION coins_unlock_course(p_course_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_c course_coin_catalog%ROWTYPE;
  v_res JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  SELECT * INTO v_c FROM course_coin_catalog WHERE course_id = p_course_id AND is_active;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'unknown_course');
  END IF;
  IF EXISTS (SELECT 1 FROM user_unlocked_courses WHERE user_id = v_uid AND course_id = p_course_id) THEN
    RETURN jsonb_build_object('success', true, 'already_unlocked', true);
  END IF;
  -- متاحة بالتعلم: تُسجَّل مفتوحة بلا أي خصم (توافق مع نسخ التطبيق القديمة التي تقرأ unlocked_courses)
  IF _course_accessible(v_uid, p_course_id) THEN
    INSERT INTO user_unlocked_courses (user_id, course_id) VALUES (v_uid, p_course_id)
    ON CONFLICT (user_id, course_id) DO NOTHING;
    RETURN jsonb_build_object('success', true, 'cost', 0, 'already_accessible', true,
      'balance', (SELECT COALESCE(total_points, 0) FROM user_points WHERE user_id = v_uid));
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;
  IF v_c.unlock_cost > 0 THEN
    v_res := _coins_apply(v_uid, -v_c.unlock_cost, 'unlock_course', 'فتح مبكر لدورة: ' || v_c.title,
                          p_course_id, 'unlock:' || p_course_id);
    IF NOT (v_res->>'success')::boolean THEN
      RETURN v_res || jsonb_build_object('cost', v_c.unlock_cost);
    END IF;
  END IF;
  INSERT INTO user_unlocked_courses (user_id, course_id) VALUES (v_uid, p_course_id)
  ON CONFLICT (user_id, course_id) DO NOTHING;
  PERFORM _track(v_uid, 'course_shortcut_bought', jsonb_build_object('course_id', p_course_id, 'cost', v_c.unlock_cost));
  RETURN jsonb_build_object('success', true, 'cost', v_c.unlock_cost, 'early_access', true,
    'balance', (SELECT total_points FROM user_points WHERE user_id = v_uid));
END;
$$;

CREATE OR REPLACE FUNCTION coins_unlock_field(p_field_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_ids TEXT[];
  v_sum INTEGER;
  v_cost INTEGER;
  v_res JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;
  -- يُدفع فقط عن الدورات غير المتاحة بعد (المتاحة بالتعلم مجانية)
  SELECT ARRAY_AGG(c.course_id ORDER BY c.course_id), COALESCE(SUM(c.unlock_cost), 0)
    INTO v_ids, v_sum
  FROM course_coin_catalog c
  WHERE c.field_id = p_field_id AND c.is_active AND c.unlock_cost > 0
    AND NOT _course_accessible(v_uid, c.course_id);
  IF v_ids IS NULL THEN
    RETURN jsonb_build_object('success', true, 'already_unlocked', true);
  END IF;
  v_cost := ROUND(v_sum * (1 - COALESCE((_coin_cfg('field_bundle')->>'discount')::NUMERIC, 0.15)));
  v_res := _coins_apply(v_uid, -v_cost, 'unlock_field', 'فتح مبكر لمسار كامل: ' || p_field_id,
                        p_field_id, 'unlock_field:' || p_field_id || ':' || md5(array_to_string(v_ids, ',')));
  IF NOT (v_res->>'success')::boolean THEN
    RETURN v_res || jsonb_build_object('cost', v_cost);
  END IF;
  INSERT INTO user_unlocked_courses (user_id, course_id) SELECT v_uid, UNNEST(v_ids)
  ON CONFLICT (user_id, course_id) DO NOTHING;
  PERFORM _track(v_uid, 'field_shortcut_bought', jsonb_build_object('field_id', p_field_id, 'cost', v_cost));
  RETURN jsonb_build_object('success', true, 'cost', v_cost, 'courses', to_jsonb(v_ids), 'balance', v_res->'balance');
END;
$$;

-- ----------------------------------------------------------------------------
-- 13) الحل الجاهز للتحدي (على السيرفر فقط) + إعلانات الحل
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS challenge_solutions (
  challenge_id TEXT PRIMARY KEY,
  solution TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE challenge_solutions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON challenge_solutions FROM anon, authenticated; -- لا قراءة مباشرة إطلاقاً

CREATE TABLE IF NOT EXISTS challenge_solution_reveals (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  via TEXT NOT NULL CHECK (via IN ('ad', 'solved', 'admin')),
  session_id UUID,
  revealed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, challenge_id)
);
ALTER TABLE challenge_solution_reveals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON challenge_solution_reveals FROM anon, authenticated;
GRANT SELECT ON challenge_solution_reveals TO authenticated;
DROP POLICY IF EXISTS solution_reveals_select ON challenge_solution_reveals;
CREATE POLICY solution_reveals_select ON challenge_solution_reveals FOR SELECT USING (auth.uid() = user_id OR is_admin());

ALTER TABLE ad_reward_sessions ADD COLUMN IF NOT EXISTS ref_id TEXT;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ad_reward_sessions_purpose_check') THEN
    ALTER TABLE ad_reward_sessions DROP CONSTRAINT ad_reward_sessions_purpose_check;
  END IF;
  ALTER TABLE ad_reward_sessions ADD CONSTRAINT ad_reward_sessions_purpose_check
    CHECK (purpose IN ('coins', 'ai_quota', 'solution'));
END $$;

-- المحاولات الفاشلة التي يشغّلها التطبيق محلياً (قبل الإرسال للتحقق). تزويرها لا يمنح شيئاً:
-- أقصى أثر أن يُسمح بمشاهدة إعلان الحل أبكر (مع خسارة كوينات التحدي ونصف XP).
CREATE TABLE IF NOT EXISTS challenge_attempt_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  passed_tests INTEGER NOT NULL DEFAULT 0,
  total_tests INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attempt_log_user_ch ON challenge_attempt_log (user_id, challenge_id, created_at);
ALTER TABLE challenge_attempt_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON challenge_attempt_log FROM anon, authenticated;

CREATE OR REPLACE FUNCTION challenge_record_attempt(p_challenge_id TEXT, p_passed INTEGER DEFAULT 0, p_total INTEGER DEFAULT 0)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM challenge_catalog WHERE id = p_challenge_id) THEN
    RETURN jsonb_build_object('success', false, 'code', 'unknown_challenge');
  END IF;
  IF (SELECT COUNT(*) FROM challenge_attempt_log WHERE user_id = v_uid AND created_at > NOW() - INTERVAL '1 hour') >= 120 THEN
    RETURN jsonb_build_object('success', false, 'code', 'rate_limited');
  END IF;
  INSERT INTO challenge_attempt_log (user_id, challenge_id, passed_tests, total_tests)
  VALUES (v_uid, p_challenge_id, GREATEST(0, LEAST(COALESCE(p_passed, 0), 1000)), GREATEST(0, LEAST(COALESCE(p_total, 0), 1000)));
  PERFORM _track(v_uid, 'challenge_local_attempt', jsonb_build_object('challenge_id', p_challenge_id, 'passed', p_passed, 'total', p_total));
  RETURN jsonb_build_object('success', true) || _challenge_attempt_state(v_uid, p_challenge_id);
END;
$$;

-- حالة محاولات المستخدم في التحدي (محاولات التحقق على السيرفر + المحاولات المحلية الفاشلة)
CREATE OR REPLACE FUNCTION _challenge_attempt_state(p_user UUID, p_challenge TEXT)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cfg JSONB := _coin_cfg('solutions');
  v_need INTEGER := COALESCE((v_cfg->>'min_failed_attempts')::INTEGER, 3);
  v_minutes INTEGER := COALESCE((v_cfg->>'min_minutes_since_first_attempt')::INTEGER, 10);
  v_attempts INTEGER;
  v_failed INTEGER;
  v_first TIMESTAMPTZ;
  v_solved BOOLEAN;
  v_revealed BOOLEAN;
  v_minutes_left INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE NOT ok), MIN(at)
    INTO v_attempts, v_failed, v_first
  FROM (
    SELECT all_passed AS ok, created_at AS at FROM challenge_submissions
    WHERE user_id = p_user AND challenge_id = p_challenge
    UNION ALL
    SELECT FALSE, created_at FROM challenge_attempt_log
    WHERE user_id = p_user AND challenge_id = p_challenge
  ) a;
  v_solved := _lesson_done(p_user, p_challenge);
  v_revealed := EXISTS (SELECT 1 FROM challenge_solution_reveals WHERE user_id = p_user AND challenge_id = p_challenge);
  v_minutes_left := CASE WHEN v_first IS NULL THEN v_minutes
                         ELSE GREATEST(0, CEIL(v_minutes - EXTRACT(EPOCH FROM (NOW() - v_first)) / 60)::INTEGER) END;
  RETURN jsonb_build_object(
    'attempts', v_attempts, 'failed_attempts', v_failed, 'solved', v_solved, 'revealed', v_revealed,
    'hint_level', LEAST(2, v_failed),
    'can_reveal', v_solved OR v_revealed OR v_failed >= v_need OR (v_first IS NOT NULL AND v_minutes_left = 0),
    'reveal_needs_ad', NOT (v_solved OR v_revealed),
    'attempts_needed', GREATEST(0, v_need - v_failed),
    'minutes_left', v_minutes_left
  );
END;
$$;
REVOKE ALL ON FUNCTION _challenge_attempt_state(UUID, TEXT) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION challenge_attempt_state(p_challenge_id TEXT)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  RETURN jsonb_build_object('success', true) || _challenge_attempt_state(auth.uid(), p_challenge_id);
END;
$$;

-- بدء جلسة إعلان لإظهار الحل (بعد محاولات كافية أو مدة معقولة). إن كان الحل متاحاً أصلاً: بلا إعلان.
CREATE OR REPLACE FUNCTION challenge_solution_start(p_challenge_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_ads JSONB := _coin_cfg('ads');
  v_today DATE := _coin_today();
  v_gap INTEGER := COALESCE((_coin_cfg('ads')->>'min_seconds_between_ads')::INTEGER, 30);
  v_limit INTEGER := COALESCE((_coin_cfg('solutions')->>'daily_ad_limit')::INTEGER, 10);
  v_state JSONB;
  v_used INTEGER;
  v_pending INTEGER;
  v_last TIMESTAMPTZ;
  v_id UUID;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM challenge_catalog WHERE id = p_challenge_id) THEN
    RETURN jsonb_build_object('success', false, 'code', 'unknown_challenge');
  END IF;
  IF NOT _challenge_accessible(v_uid, p_challenge_id) THEN
    RETURN jsonb_build_object('success', false, 'code', 'locked');
  END IF;
  PERFORM 1 FROM profiles WHERE id = v_uid FOR UPDATE;
  v_state := _challenge_attempt_state(v_uid, p_challenge_id);
  IF NOT (v_state->>'reveal_needs_ad')::boolean THEN
    RETURN jsonb_build_object('success', true, 'reveal_ready', true, 'state', v_state);
  END IF;
  IF NOT (v_state->>'can_reveal')::boolean THEN
    RETURN jsonb_build_object('success', false, 'code', 'try_first', 'state', v_state);
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;

  UPDATE ad_reward_sessions SET status = 'expired'
  WHERE user_id = v_uid AND status = 'pending' AND created_at < NOW() - INTERVAL '1 hour';
  SELECT COUNT(*) FILTER (WHERE status = 'rewarded' AND purpose = 'solution'),
         COUNT(*) FILTER (WHERE status = 'pending' AND created_at > NOW() - INTERVAL '10 minutes'),
         MAX(rewarded_at)
    INTO v_used, v_pending, v_last
  FROM ad_reward_sessions WHERE user_id = v_uid AND ad_date = v_today;
  IF v_used >= v_limit THEN
    RETURN jsonb_build_object('success', false, 'code', 'daily_limit', 'limit', v_limit);
  END IF;
  IF v_last IS NOT NULL AND v_last > NOW() - make_interval(secs => v_gap) THEN
    RETURN jsonb_build_object('success', false, 'code', 'cooldown',
      'retry_after', CEIL(EXTRACT(EPOCH FROM (v_last + make_interval(secs => v_gap) - NOW()))));
  END IF;
  IF v_pending >= 5 THEN
    RETURN jsonb_build_object('success', false, 'code', 'too_many_attempts');
  END IF;

  INSERT INTO ad_reward_sessions (user_id, ad_date, purpose, ref_id)
  VALUES (v_uid, v_today, 'solution', p_challenge_id) RETURNING id INTO v_id;
  RETURN jsonb_build_object('success', true, 'session_id', v_id, 'purpose', 'solution', 'state', v_state);
END;
$$;

-- يعيد الحل فقط لمن شاهد إعلاناً معتمداً لهذا التحدي، أو حلّه بنفسه
CREATE OR REPLACE FUNCTION challenge_reveal_solution(p_challenge_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_solution TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM challenge_solution_reveals WHERE user_id = v_uid AND challenge_id = p_challenge_id) THEN
    IF _lesson_done(v_uid, p_challenge_id) THEN
      -- حلّه بنفسه: الحل النموذجي للمقارنة بلا إعلان (المكافأة أُخذت أصلاً)
      INSERT INTO challenge_solution_reveals (user_id, challenge_id, via) VALUES (v_uid, p_challenge_id, 'solved')
      ON CONFLICT DO NOTHING;
    ELSE
      RETURN jsonb_build_object('success', false, 'code', 'ad_required',
                                'state', _challenge_attempt_state(v_uid, p_challenge_id));
    END IF;
  END IF;
  SELECT solution INTO v_solution FROM challenge_solutions WHERE challenge_id = p_challenge_id;
  IF v_solution IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'no_solution');
  END IF;
  RETURN jsonb_build_object('success', true, 'challenge_id', p_challenge_id, 'solution', v_solution);
END;
$$;

-- اعتماد الإعلان (SSV أو التطبيق حين يُسمح): نفس الدالة السابقة + فرع الحل + أحداث التحليلات
CREATE OR REPLACE FUNCTION _coins_credit_ad_session(p_session UUID, p_via TEXT, p_txn TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cfg JSONB := _coin_cfg('ads');
  v_s ad_reward_sessions%ROWTYPE;
  v_limit INTEGER := COALESCE((v_cfg->>'daily_limit')::INTEGER, 4);
  v_reward INTEGER := COALESCE((v_cfg->>'reward_per_ad')::INTEGER, 15);
  v_bonus INTEGER := COALESCE((v_cfg->>'daily_bonus')::INTEGER, 0);
  v_watched INTEGER;
  v_res JSONB;
  v_bonus_given INTEGER := 0;
  v_state JSONB;
BEGIN
  SELECT * INTO v_s FROM ad_reward_sessions WHERE id = p_session FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_session');
  END IF;
  IF v_s.status = 'rewarded' THEN
    RETURN jsonb_build_object('success', true, 'duplicate', true, 'purpose', v_s.purpose,
      'balance', (SELECT total_points FROM user_points WHERE user_id = v_s.user_id));
  END IF;
  IF v_s.status = 'expired' THEN
    RETURN jsonb_build_object('success', false, 'code', 'expired');
  END IF;

  IF v_s.purpose = 'solution' THEN
    UPDATE ad_reward_sessions SET status = 'rewarded', rewarded_at = NOW(),
      reward_amount = 0, verified_by = p_via, ssv_transaction_id = p_txn
    WHERE id = p_session;
    INSERT INTO challenge_solution_reveals (user_id, challenge_id, via, session_id)
    VALUES (v_s.user_id, v_s.ref_id, 'ad', p_session)
    ON CONFLICT (user_id, challenge_id) DO NOTHING;
    PERFORM _track(v_s.user_id, 'ad_rewarded', jsonb_build_object('purpose', 'solution', 'via', p_via));
    PERFORM _track(v_s.user_id, 'solution_revealed', jsonb_build_object('challenge_id', v_s.ref_id));
    RETURN jsonb_build_object('success', true, 'purpose', 'solution', 'challenge_id', v_s.ref_id, 'reward', 0);
  END IF;

  IF v_s.purpose = 'ai_quota' THEN
    v_state := _ai_quota_state(v_s.user_id);
    IF NOT (v_state->'ads'->>'can_watch')::boolean THEN
      UPDATE ad_reward_sessions SET status = 'expired' WHERE id = p_session;
      RETURN jsonb_build_object('success', false, 'code', 'ai_ad_limit', 'purpose', 'ai_quota', 'quota', v_state);
    END IF;
    UPDATE ad_reward_sessions SET status = 'rewarded', rewarded_at = NOW(),
      reward_amount = 0, verified_by = p_via, ssv_transaction_id = p_txn
    WHERE id = p_session;
    v_state := _ai_quota_state(v_s.user_id);
    PERFORM _track(v_s.user_id, 'ad_rewarded', jsonb_build_object('purpose', 'ai_quota', 'via', p_via));
    RETURN jsonb_build_object('success', true, 'purpose', 'ai_quota', 'reward', 0, 'quota', v_state,
      'bonus_unlocked', (v_state->'ads'->>'progress')::INTEGER = 0
                        AND (v_state->'ads'->>'bonuses_earned')::INTEGER > 0);
  END IF;

  SELECT COUNT(*) INTO v_watched FROM ad_reward_sessions
  WHERE user_id = v_s.user_id AND ad_date = v_s.ad_date AND status = 'rewarded' AND purpose = 'coins';
  IF v_watched >= v_limit THEN
    UPDATE ad_reward_sessions SET status = 'expired' WHERE id = p_session;
    RETURN jsonb_build_object('success', false, 'code', 'daily_limit');
  END IF;

  v_res := _coins_apply(v_s.user_id, v_reward, 'rewarded_ad', 'مشاهدة إعلان مكافأة',
                        p_session::TEXT, 'ad:' || p_session::TEXT);
  UPDATE ad_reward_sessions SET status = 'rewarded', rewarded_at = NOW(),
    reward_amount = v_reward, verified_by = p_via, ssv_transaction_id = p_txn
  WHERE id = p_session;
  IF v_watched + 1 = v_limit AND v_bonus > 0 THEN
    v_res := _coins_apply(v_s.user_id, v_bonus, 'rewarded_ad_bonus', 'تحدي الإعلانات اليومي',
                          v_s.ad_date::TEXT, 'ad_bonus:' || v_s.ad_date::TEXT);
    v_bonus_given := v_bonus;
  END IF;
  PERFORM _track(v_s.user_id, 'ad_rewarded', jsonb_build_object('purpose', 'coins', 'via', p_via));
  RETURN jsonb_build_object('success', true, 'purpose', 'coins', 'reward', v_reward, 'bonus', v_bonus_given,
                            'watched', v_watched + 1, 'limit', v_limit, 'balance', v_res->'balance');
END;
$$;
REVOKE ALL ON FUNCTION _coins_credit_ad_session(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- حالة جلسة إعلان (للتطبيق أثناء انتظار SSV) — صاحب الجلسة فقط
CREATE OR REPLACE FUNCTION ad_session_status(p_session_id UUID)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_s ad_reward_sessions%ROWTYPE;
BEGIN
  SELECT * INTO v_s FROM ad_reward_sessions WHERE id = p_session_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_session');
  END IF;
  RETURN jsonb_build_object('success', true, 'status', v_s.status, 'purpose', v_s.purpose,
                            'ref_id', v_s.ref_id, 'reward', COALESCE(v_s.reward_amount, 0),
                            'verified_by', v_s.verified_by);
END;
$$;

-- ----------------------------------------------------------------------------
-- 14) التحديات: تسجيل المحاولة (service_role) + XP مخفّض وبلا كوينات بعد كشف الحل
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_challenge_submission(
  p_user_id UUID, p_challenge_id TEXT, p_passed_tests INTEGER, p_total_tests INTEGER,
  p_all_passed BOOLEAN, p_code_sha256 TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_points INTEGER;
  v_first BOOLEAN := FALSE;
  v_xp INTEGER := 0;
  v_revealed BOOLEAN;
  v_ratio NUMERIC := COALESCE((_coin_cfg('solutions')->>'xp_ratio_after_reveal')::NUMERIC, 0.5);
  v_activity JSONB := NULL;
BEGIN
  SELECT points INTO v_points FROM challenge_catalog WHERE id = p_challenge_id;
  IF v_points IS NULL THEN
    RAISE EXCEPTION 'unknown challenge %', p_challenge_id USING ERRCODE = '22023';
  END IF;
  IF NOT _challenge_accessible(p_user_id, p_challenge_id) THEN
    RETURN jsonb_build_object('recorded', false, 'first_time', false, 'xp_awarded', 0, 'locked', true);
  END IF;

  INSERT INTO challenge_submissions (user_id, challenge_id, passed_tests, total_tests, all_passed, code_sha256)
  VALUES (p_user_id, p_challenge_id, p_passed_tests, p_total_tests, p_all_passed, p_code_sha256);
  PERFORM _track(p_user_id, 'challenge_attempt', jsonb_build_object(
    'challenge_id', p_challenge_id, 'passed', p_passed_tests, 'total', p_total_tests, 'all_passed', p_all_passed));

  IF NOT p_all_passed THEN
    IF p_passed_tests > 0 THEN
      v_activity := _activity_touch(p_user_id, 'challenge_attempt'); -- محاولة حقيقية تُحتسب نشاطاً
    END IF;
    RETURN jsonb_build_object('recorded', false, 'first_time', false, 'xp_awarded', 0,
      'attempts', _challenge_attempt_state(p_user_id, p_challenge_id), 'activity', v_activity);
  END IF;

  INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed, xp_earned, completed_at, updated_at,
                                    verified, verified_at, verified_source)
  VALUES (p_user_id, p_challenge_id, 'challenges', TRUE, v_points, now(), now(), TRUE, now(), 'challenge')
  ON CONFLICT (user_id, lesson_id) DO UPDATE
    SET completed = TRUE, course_id = 'challenges', xp_earned = EXCLUDED.xp_earned,
        completed_at = now(), updated_at = now(), verified = TRUE, verified_at = now(), verified_source = 'challenge'
    WHERE user_lesson_progress.completed IS DISTINCT FROM TRUE
       OR user_lesson_progress.course_id <> 'challenges'
  RETURNING TRUE INTO v_first;

  v_revealed := EXISTS (SELECT 1 FROM challenge_solution_reveals
                        WHERE user_id = p_user_id AND challenge_id = p_challenge_id AND via = 'ad');
  IF COALESCE(v_first, FALSE) THEN
    v_xp := _xp_award(p_user_id, 'challenge', p_challenge_id,
                      CASE WHEN v_revealed THEN GREATEST(1, ROUND(v_points * v_ratio)::INTEGER) ELSE v_points END);
    v_activity := _activity_touch(p_user_id, 'challenge_solved');
    PERFORM _track(p_user_id, 'challenge_solved', jsonb_build_object('challenge_id', p_challenge_id, 'revealed', v_revealed));
  ELSE
    v_activity := _activity_touch(p_user_id, 'challenge_attempt'); -- إعادة حل تحدٍ محلول = تدريب
  END IF;

  RETURN jsonb_build_object(
    'recorded', true, 'first_time', COALESCE(v_first, FALSE), 'xp_awarded', v_xp,
    'solution_revealed', v_revealed,
    'attempts', _challenge_attempt_state(p_user_id, p_challenge_id), 'activity', v_activity
  );
END;
$$;
REVOKE ALL ON FUNCTION record_challenge_submission(UUID, TEXT, INTEGER, INTEGER, BOOLEAN, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_challenge_submission(UUID, TEXT, INTEGER, INTEGER, BOOLEAN, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION coins_reward_challenge(p_challenge_id TEXT, p_difficulty TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_cfg JSONB := _coin_cfg('challenge_rewards');
  v_cap INTEGER := COALESCE((v_cfg->>'daily_cap')::INTEGER, 60);
  v_today DATE := _coin_today();
  v_tz TEXT := COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad');
  v_difficulty TEXT;
  v_earned INTEGER;
  v_amount INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;
  -- الصعوبة من الكتالوج دائماً (p_difficulty يُتجاهل)
  SELECT difficulty INTO v_difficulty FROM challenge_catalog WHERE id = p_challenge_id;
  IF v_difficulty IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid');
  END IF;
  IF NOT _challenge_accessible(v_uid, p_challenge_id) THEN
    RETURN jsonb_build_object('success', false, 'code', 'locked');
  END IF;
  IF NOT _lesson_done(v_uid, p_challenge_id) THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_completed');
  END IF;
  IF EXISTS (SELECT 1 FROM challenge_solution_reveals
             WHERE user_id = v_uid AND challenge_id = p_challenge_id AND via = 'ad') THEN
    RETURN jsonb_build_object('success', false, 'code', 'solution_revealed', 'reward', 0);
  END IF;

  PERFORM 1 FROM profiles WHERE id = v_uid FOR UPDATE;
  SELECT COALESCE(SUM(amount), 0) INTO v_earned FROM point_transactions
  WHERE user_id = v_uid AND source = 'challenge' AND (created_at AT TIME ZONE v_tz)::date = v_today;
  v_amount := LEAST(COALESCE((v_cfg->>v_difficulty)::INTEGER, 5), v_cap - v_earned);
  IF v_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'daily_cap', 'cap', v_cap);
  END IF;
  RETURN _coins_apply(v_uid, v_amount, 'challenge', 'حل تحدي', p_challenge_id,
                      'challenge:' || p_challenge_id) || jsonb_build_object('reward', v_amount);
END;
$$;

-- تحدي اليوم: اقتراح ثابت ليوم المستخدم من تحديات دوراته المتاحة غير المحلولة (بلا مكافأة إضافية)
CREATE OR REPLACE FUNCTION daily_challenge_get()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_id TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  SELECT ch.id INTO v_id
  FROM challenge_catalog ch
  WHERE _challenge_accessible(v_uid, ch.id) AND NOT _lesson_done(v_uid, ch.id)
    AND (ch.required_course_id IS NULL OR _course_ratio(v_uid, ch.required_course_id) > 0)
  ORDER BY md5(v_uid::TEXT || _coin_today()::TEXT || ch.id)
  LIMIT 1;
  IF v_id IS NULL THEN
    SELECT ch.id INTO v_id FROM challenge_catalog ch
    WHERE ch.required_course_id IS NULL AND NOT _lesson_done(v_uid, ch.id)
    ORDER BY md5(v_uid::TEXT || _coin_today()::TEXT || ch.id) LIMIT 1;
  END IF;
  RETURN jsonb_build_object('success', true, 'challenge_id', v_id, 'day', _coin_today());
END;
$$;

-- ----------------------------------------------------------------------------
-- 15) الذكاء: حزمة بالكوينات (اختيارية) + أحداث التحليلات. الحصة الأساسية كما هي (10 + إعلانات).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION _ai_quota_state(p_user UUID)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_today DATE := _coin_today();
  v_base INTEGER := _ai_cfg_int('daily_limit', 10);
  v_bonus_each INTEGER := _ai_cfg_int('ad_bonus', 3);
  v_per INTEGER := GREATEST(1, _ai_cfg_int('ads_per_bonus', 2));
  v_max_bonuses INTEGER := _ai_cfg_int('max_ad_bonuses_per_day', 2);
  v_pack_amount INTEGER := _ai_cfg_int('coin_pack_amount', 3);
  v_pack_price INTEGER := _ai_cfg_int('coin_pack_price', 20);
  v_packs_max INTEGER := _ai_cfg_int('coin_packs_per_day', 1);
  v_used INTEGER;
  v_ads INTEGER;
  v_bonuses INTEGER;
  v_packs INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT COALESCE(used, 0) INTO v_used FROM ai_daily_usage
  WHERE user_id = p_user AND usage_date = v_today AND bucket = 'gemini';
  v_used := COALESCE(v_used, 0);
  SELECT COUNT(*) INTO v_ads FROM ad_reward_sessions
  WHERE user_id = p_user AND ad_date = v_today AND purpose = 'ai_quota' AND status = 'rewarded';
  SELECT COUNT(*) INTO v_packs FROM point_transactions
  WHERE user_id = p_user AND source = 'ai_pack' AND ref_id = v_today::TEXT;

  -- الزيادات مشتقة من سجلات معتمدة (إعلانات/شراء) لا عدّاد منفصل يمكن التلاعب به
  v_bonuses := LEAST(v_max_bonuses, v_ads / v_per);
  v_limit := v_base + v_bonuses * v_bonus_each + v_packs * v_pack_amount;

  RETURN jsonb_build_object(
    'used', v_used,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_used),
    'base_limit', v_base,
    'bonus', v_bonuses * v_bonus_each + v_packs * v_pack_amount,
    'ads', jsonb_build_object(
      'watched', v_ads,
      'per_bonus', v_per,
      'bonus_amount', v_bonus_each,
      'bonuses_earned', v_bonuses,
      'max_bonuses', v_max_bonuses,
      'progress', CASE WHEN v_bonuses >= v_max_bonuses THEN 0 ELSE v_ads - v_bonuses * v_per END,
      'can_watch', v_bonuses < v_max_bonuses
    ),
    'packs', jsonb_build_object(
      'bought', v_packs, 'max_per_day', v_packs_max, 'amount', v_pack_amount, 'price', v_pack_price,
      'can_buy', v_packs < v_packs_max
    )
  );
END;
$$;
REVOKE ALL ON FUNCTION _ai_quota_state(UUID) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION ai_buy_pack()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_today DATE := _coin_today();
  v_price INTEGER := _ai_cfg_int('coin_pack_price', 20);
  v_max INTEGER := _ai_cfg_int('coin_packs_per_day', 1);
  v_n INTEGER;
  v_res JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;
  IF v_max <= 0 OR v_price <= 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'disabled');
  END IF;
  PERFORM 1 FROM profiles WHERE id = v_uid FOR UPDATE;
  SELECT COUNT(*) INTO v_n FROM point_transactions
  WHERE user_id = v_uid AND source = 'ai_pack' AND ref_id = v_today::TEXT;
  IF v_n >= v_max THEN
    RETURN jsonb_build_object('success', false, 'code', 'pack_limit', 'quota', _ai_quota_state(v_uid));
  END IF;
  v_res := _coins_apply(v_uid, -v_price, 'ai_pack', 'طلبات ذكاء إضافية', v_today::TEXT,
                        'ai_pack:' || v_today || ':' || (v_n + 1));
  IF NOT (v_res->>'success')::boolean THEN
    RETURN v_res || jsonb_build_object('cost', v_price);
  END IF;
  PERFORM _track(v_uid, 'ai_pack_bought', jsonb_build_object('price', v_price));
  RETURN jsonb_build_object('success', true, 'cost', v_price, 'balance', v_res->'balance',
                            'quota', _ai_quota_state(v_uid));
END;
$$;

CREATE OR REPLACE FUNCTION ai_quota_reserve(p_user UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_today DATE := _coin_today();
  v_gday DATE := _ai_global_today();
  v_glimit INTEGER := _ai_cfg_int('global_daily_limit', 200);
  v_state JSONB;
  v_gused INTEGER;
BEGIN
  IF p_user IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'code', 'not_authenticated');
  END IF;
  INSERT INTO ai_daily_usage (user_id, usage_date, bucket, used) VALUES (p_user, v_today, 'gemini', 0)
  ON CONFLICT DO NOTHING;
  INSERT INTO ai_global_usage (usage_date, used) VALUES (v_gday, 0) ON CONFLICT DO NOTHING;
  PERFORM 1 FROM ai_daily_usage WHERE user_id = p_user AND usage_date = v_today AND bucket = 'gemini' FOR UPDATE;
  SELECT used INTO v_gused FROM ai_global_usage WHERE usage_date = v_gday FOR UPDATE;

  v_state := _ai_quota_state(p_user);
  IF (v_state->>'remaining')::INTEGER <= 0 THEN
    PERFORM _track(p_user, 'ai_quota_exhausted', jsonb_build_object('limit', v_state->'limit'));
    RETURN jsonb_build_object('allowed', false, 'code', 'quota_exceeded', 'quota', v_state);
  END IF;
  IF v_gused >= v_glimit THEN
    PERFORM _track(p_user, 'ai_global_limit', '{}'::jsonb);
    RETURN jsonb_build_object('allowed', false, 'code', 'global_limit', 'quota', v_state);
  END IF;
  UPDATE ai_daily_usage SET used = used + 1 WHERE user_id = p_user AND usage_date = v_today AND bucket = 'gemini';
  UPDATE ai_global_usage SET used = used + 1 WHERE usage_date = v_gday;
  PERFORM _track(p_user, 'ai_request', '{}'::jsonb);
  RETURN jsonb_build_object('allowed', true, 'quota', _ai_quota_state(p_user));
END;
$$;
REVOKE ALL ON FUNCTION ai_quota_reserve(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION ai_quota_reserve(UUID) TO service_role;

-- للدالة ai-chat: هل كشف المستخدم حل التحدي؟ (وضع "الحل الكامل" بالذكاء يتطلب ذلك)
CREATE OR REPLACE FUNCTION challenge_solution_unlocked(p_user_id UUID, p_challenge_id TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM challenge_solution_reveals WHERE user_id = p_user_id AND challenge_id = p_challenge_id)
      OR _lesson_done(p_user_id, p_challenge_id);
$$;
REVOKE ALL ON FUNCTION challenge_solution_unlocked(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION challenge_solution_unlocked(UUID, TEXT) TO service_role;

-- ----------------------------------------------------------------------------
-- 16) حالة الكوينات للتطبيق (نفس الشكل + الدورات المتاحة بالتعلم تُعدّ مفتوحة للنسخ القديمة)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION coins_get_state()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_today DATE := _coin_today();
  v_tz TEXT := COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad');
  v_ads JSONB := _coin_cfg('ads');
  v_ladder JSONB := _coin_cfg('daily_ladder');
  v_ch JSONB := _coin_cfg('challenge_rewards');
  v_balance INTEGER;
  v_earned INTEGER;
  v_d user_daily_rewards%ROWTYPE;
  v_claimed_today BOOLEAN;
  v_continues BOOLEAN;
  v_next_day INTEGER;
  v_watched INTEGER;
  v_last_ad TIMESTAMPTZ;
  v_gap INTEGER := COALESCE((v_ads->>'min_seconds_between_ads')::INTEGER, 30);
  v_ch_today INTEGER;
  v_streak INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;

  SELECT COALESCE(total_points, 0), COALESCE(earned_points, 0)
    INTO v_balance, v_earned FROM user_points WHERE user_id = v_uid;
  SELECT * INTO v_d FROM user_daily_rewards WHERE user_id = v_uid;

  v_claimed_today := v_d.last_claim_date = v_today;
  v_continues := v_claimed_today OR _ladder_continues(v_uid, v_d.last_claim_date, v_today);
  v_next_day := CASE WHEN v_continues THEN (COALESCE(v_d.current_day, 0) % 7) + 1 ELSE 1 END;

  SELECT COUNT(*) FILTER (WHERE status = 'rewarded' AND purpose = 'coins'), MAX(rewarded_at)
    INTO v_watched, v_last_ad
  FROM ad_reward_sessions WHERE user_id = v_uid AND ad_date = v_today;

  SELECT COALESCE(SUM(amount), 0) INTO v_ch_today FROM point_transactions
  WHERE user_id = v_uid AND source = 'challenge' AND (created_at AT TIME ZONE v_tz)::date = v_today;

  SELECT CASE WHEN s.last_active_day >= v_today - 1 - s.freezes THEN s.current_streak ELSE 0 END
    INTO v_streak FROM user_streaks s WHERE s.user_id = v_uid;

  RETURN jsonb_build_object(
    'success', true,
    'balance', COALESCE(v_balance, 0),
    'lifetime_earned', COALESCE(v_earned, 0),
    'unlocked_courses', COALESCE((
      SELECT jsonb_agg(c.course_id) FROM course_coin_catalog c
      WHERE c.is_active AND _course_accessible(v_uid, c.course_id)), '[]'::jsonb),
    'purchased_courses', COALESCE((SELECT jsonb_agg(course_id) FROM user_unlocked_courses WHERE user_id = v_uid), '[]'::jsonb),
    'learning_streak', COALESCE(v_streak, 0),
    'daily', jsonb_build_object(
      'rewards', v_ladder->'rewards',
      'claimed_today', COALESCE(v_claimed_today, FALSE),
      'current_day', CASE WHEN v_continues THEN COALESCE(v_d.current_day, 0) ELSE 0 END,
      'next_day', v_next_day,
      'run_days', CASE WHEN v_continues THEN COALESCE(v_d.run_days, 0) ELSE 0 END,
      'best_run', COALESCE(v_d.best_run, 0),
      'streak_broken', v_d.last_claim_date IS NOT NULL AND NOT v_continues,
      'requires_activity', COALESCE((v_ladder->>'requires_activity')::boolean, TRUE),
      'has_activity_today', _coins_has_activity(v_uid, v_today)
    ),
    'ads', jsonb_build_object(
      'reward', COALESCE((v_ads->>'reward_per_ad')::INTEGER, 15),
      'limit', COALESCE((v_ads->>'daily_limit')::INTEGER, 4),
      'bonus', COALESCE((v_ads->>'daily_bonus')::INTEGER, 0),
      'watched_today', COALESCE(v_watched, 0),
      'next_available_at', CASE WHEN v_last_ad IS NULL THEN NULL
                                ELSE v_last_ad + make_interval(secs => v_gap) END,
      'requires_server_verification', NOT COALESCE((v_ads->>'client_claim_enabled')::boolean, TRUE)
    ),
    'challenges', jsonb_build_object(
      'easy', COALESCE((v_ch->>'easy')::INTEGER, 5),
      'medium', COALESCE((v_ch->>'medium')::INTEGER, 10),
      'hard', COALESCE((v_ch->>'hard')::INTEGER, 15),
      'daily_cap', COALESCE((v_ch->>'daily_cap')::INTEGER, 60),
      'earned_today', v_ch_today
    ),
    'course_completion', _coin_cfg('course_completion_rewards'),
    'streak_freeze', jsonb_build_object(
      'price', COALESCE((_coin_cfg('streak')->>'freeze_price')::INTEGER, 30),
      'max', COALESCE((_coin_cfg('streak')->>'max_freezes')::INTEGER, 2),
      'owned', COALESCE((SELECT freezes FROM user_streaks WHERE user_id = v_uid), 0)),
    'recent', COALESCE((
      SELECT jsonb_agg(t ORDER BY t.created_at DESC) FROM (
        SELECT type, amount, reason, source, created_at FROM point_transactions
        WHERE user_id = v_uid ORDER BY created_at DESC LIMIT 15
      ) t), '[]'::jsonb)
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 17) ملخص التحليلات للمشرف (التعلم والعودة أولاً، ثم الإعلانات والاقتصاد)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION admin_analytics_summary(p_days INTEGER DEFAULT 30)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_to DATE := _coin_today();
  v_from DATE := _coin_today() - GREATEST(1, LEAST(p_days, 365)) + 1;
  v_tz TEXT := COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad');
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'code', 'forbidden');
  END IF;
  RETURN jsonb_build_object(
    'success', true, 'from', v_from, 'to', v_to,
    -- نشاط يومي: من فتح التطبيق أو تعلّم فعلاً
    'dau', (SELECT COALESCE(jsonb_agg(jsonb_build_object('day', d, 'users', n, 'learners', l) ORDER BY d), '[]'::jsonb) FROM (
             SELECT g::date AS d,
                    (SELECT COUNT(DISTINCT u) FROM (
                       SELECT user_id u FROM analytics_events WHERE day = g::date AND event = 'app_open'
                       UNION SELECT user_id FROM user_activity_days WHERE day = g::date AND NOT frozen) x) AS n,
                    (SELECT COUNT(*) FROM user_activity_days WHERE day = g::date AND NOT frozen) AS l
             FROM generate_series(v_from, v_to, INTERVAL '1 day') g) s),
    'learning', jsonb_build_object(
      'lesson_completions', (SELECT COUNT(*) FROM analytics_events WHERE event = 'lesson_completed' AND day BETWEEN v_from AND v_to),
      'quiz_wrong_answers', (SELECT COUNT(*) FROM analytics_events WHERE event = 'lesson_quiz_wrong' AND day BETWEEN v_from AND v_to),
      'challenge_attempts', (SELECT COUNT(*) FROM analytics_events WHERE event = 'challenge_attempt' AND day BETWEEN v_from AND v_to),
      'challenges_solved', (SELECT COUNT(*) FROM analytics_events WHERE event = 'challenge_solved' AND day BETWEEN v_from AND v_to),
      'solution_reveals', (SELECT COUNT(*) FROM analytics_events WHERE event = 'solution_revealed' AND day BETWEEN v_from AND v_to),
      'course_completions', (SELECT COUNT(*) FROM analytics_events WHERE event = 'course_completed' AND day BETWEEN v_from AND v_to),
      'median_hours_to_first_challenge', (
        SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (f.first_at - p.created_at)) / 3600)
        FROM profiles p JOIN (SELECT user_id, MIN(created_at) first_at FROM challenge_submissions GROUP BY user_id) f
          ON f.user_id = p.id
        WHERE p.created_at::date BETWEEN v_from AND v_to)
    ),
    'retention', (
      SELECT jsonb_build_object(
        'cohort_users', COUNT(*),
        'd1', ROUND(100.0 * COUNT(*) FILTER (WHERE r1) / NULLIF(COUNT(*) FILTER (WHERE c.first_day <= v_to - 1), 0), 1),
        'd7', ROUND(100.0 * COUNT(*) FILTER (WHERE r7) / NULLIF(COUNT(*) FILTER (WHERE c.first_day <= v_to - 7), 0), 1),
        'd30', ROUND(100.0 * COUNT(*) FILTER (WHERE r30) / NULLIF(COUNT(*) FILTER (WHERE c.first_day <= v_to - 30), 0), 1))
      FROM (
        SELECT f.user_id, f.first_day,
               EXISTS (SELECT 1 FROM user_activity_days a WHERE a.user_id = f.user_id AND a.day = f.first_day + 1 AND NOT a.frozen) r1,
               EXISTS (SELECT 1 FROM user_activity_days a WHERE a.user_id = f.user_id AND a.day = f.first_day + 7 AND NOT a.frozen) r7,
               EXISTS (SELECT 1 FROM user_activity_days a WHERE a.user_id = f.user_id AND a.day = f.first_day + 30 AND NOT a.frozen) r30
        FROM (SELECT user_id, MIN(day) first_day FROM user_activity_days WHERE NOT frozen GROUP BY user_id) f
        WHERE f.first_day BETWEEN v_from AND v_to) c),
    'streaks', (SELECT jsonb_build_object(
        'users_with_streak', COUNT(*) FILTER (WHERE current_streak > 0),
        'streak_7_plus', COUNT(*) FILTER (WHERE current_streak >= 7),
        'avg_best', ROUND(AVG(best_streak), 1),
        'freezes_used', SUM(freezes_used)) FROM user_streaks),
    'ai', jsonb_build_object(
      'requests', (SELECT COUNT(*) FROM analytics_events WHERE event = 'ai_request' AND day BETWEEN v_from AND v_to),
      'quota_exhausted_events', (SELECT COUNT(*) FROM analytics_events WHERE event = 'ai_quota_exhausted' AND day BETWEEN v_from AND v_to),
      'users_exhausted', (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event = 'ai_quota_exhausted' AND day BETWEEN v_from AND v_to),
      'global_limit_hits', (SELECT COUNT(*) FROM analytics_events WHERE event = 'ai_global_limit' AND day BETWEEN v_from AND v_to)),
    'ads', jsonb_build_object(
      'requested', (SELECT COUNT(*) FROM analytics_events WHERE event = 'ad_requested' AND day BETWEEN v_from AND v_to),
      'impressions', (SELECT COUNT(*) FROM analytics_events WHERE event = 'ad_shown' AND day BETWEEN v_from AND v_to),
      'closed_early', (SELECT COUNT(*) FROM analytics_events WHERE event = 'ad_closed_early' AND day BETWEEN v_from AND v_to),
      'rewarded_by_purpose', (SELECT COALESCE(jsonb_object_agg(purpose, n), '{}'::jsonb) FROM (
          SELECT purpose, COUNT(*) n FROM ad_reward_sessions
          WHERE status = 'rewarded' AND ad_date BETWEEN v_from AND v_to GROUP BY purpose) x),
      'verified_by', (SELECT COALESCE(jsonb_object_agg(COALESCE(verified_by, 'none'), n), '{}'::jsonb) FROM (
          SELECT verified_by, COUNT(*) n FROM ad_reward_sessions
          WHERE status = 'rewarded' AND ad_date BETWEEN v_from AND v_to GROUP BY verified_by) x),
      'watchers_in_period', (SELECT COUNT(DISTINCT user_id) FROM ad_reward_sessions WHERE status = 'rewarded' AND ad_date BETWEEN v_from AND v_to),
      'active_users_in_period', (SELECT COUNT(DISTINCT user_id) FROM user_activity_days WHERE day BETWEEN v_from AND v_to AND NOT frozen),
      'ever_watched_pct', (SELECT ROUND(100.0 * COUNT(DISTINCT a.user_id) / NULLIF((SELECT COUNT(*) FROM profiles), 0), 1)
                           FROM ad_reward_sessions a WHERE a.status = 'rewarded')),
    'coins', jsonb_build_object(
      'earned_by_source', (SELECT COALESCE(jsonb_object_agg(COALESCE(source, 'other'), n), '{}'::jsonb) FROM (
          SELECT source, SUM(amount) n FROM point_transactions
          WHERE type = 'earned' AND (created_at AT TIME ZONE v_tz)::date BETWEEN v_from AND v_to GROUP BY source) x),
      'spent_by_source', (SELECT COALESCE(jsonb_object_agg(COALESCE(source, 'other'), n), '{}'::jsonb) FROM (
          SELECT source, SUM(amount) n FROM point_transactions
          WHERE type = 'spent' AND (created_at AT TIME ZONE v_tz)::date BETWEEN v_from AND v_to GROUP BY source) x),
      'balance_distribution', (SELECT jsonb_build_object(
          '0', COUNT(*) FILTER (WHERE total_points = 0),
          '1-99', COUNT(*) FILTER (WHERE total_points BETWEEN 1 AND 99),
          '100-499', COUNT(*) FILTER (WHERE total_points BETWEEN 100 AND 499),
          '500-1999', COUNT(*) FILTER (WHERE total_points BETWEEN 500 AND 1999),
          '2000+', COUNT(*) FILTER (WHERE total_points >= 2000),
          'median', percentile_cont(0.5) WITHIN GROUP (ORDER BY total_points)) FROM user_points))
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 18) الصلاحيات: دوال العميل للمسجّلين فقط؛ الداخلية لا أحد؛ دوال السيرفر لـ service_role
-- ----------------------------------------------------------------------------
DO $$
DECLARE f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'progress_complete_lesson(text, integer)', 'progress_get_state()', 'goals_set(integer)', 'goals_state()',
    'streak_freeze_buy()', 'ai_buy_pack()', 'challenge_attempt_state(text)', 'challenge_solution_start(text)',
    'challenge_reveal_solution(text)', 'ad_session_status(uuid)', 'daily_challenge_get()', 'challenge_record_attempt(text, integer, integer)',
    'track_event(text, jsonb)', 'admin_analytics_summary(integer)',
    'coins_get_state()', 'coins_claim_daily_reward()', 'coins_unlock_course(text)', 'coins_unlock_field(text)',
    'coins_reward_challenge(text, text)', 'coins_reward_course_completion(text)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;
  FOREACH f IN ARRAY ARRAY[
    '_iso_week(date)', '_coins_has_activity(uuid, date)', '_streak_settle(uuid)', '_track(uuid, text, jsonb)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', f);
  END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION kodax_level(INTEGER) TO anon, authenticated, service_role;

-- trigger XP: يُطلق أيضاً عند التوثيق (verified) — يُعاد إنشاؤه بعد علامة legacy أعلاه
DROP TRIGGER IF EXISTS trg_ulp_award_lesson_xp ON user_lesson_progress;
CREATE TRIGGER trg_ulp_award_lesson_xp
  AFTER INSERT OR UPDATE OF completed, lesson_id, course_id, verified ON user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION _ulp_award_lesson_xp();

COMMIT;
