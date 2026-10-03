-- ============================================================================
-- XP يُحسب على السيرفر فقط
--
-- قبل هذا الملف:
--   update_user_xp(user_id, xp_amount) يقبل حتى 350 XP في كل استدعاء بلا حد لعدد الاستدعاءات:
--   أي مستخدم يستطيع تكرار الاستدعاء ورفع XP بلا سقف.
--
-- بعد هذا الملف:
--   * XP الدرس يُمنح تلقائياً على السيرفر (trigger) عند أول إكمال للدرس، بالقيمة من
--     lesson_catalog.xp — لا بالقيمة التي يرسلها العميل.
--   * كل مكافأة XP تُسجَّل في xp_awards بمفتاح (user_id, source, ref_id): نفس المكافأة لا تُمنح
--     مرتين، حتى لو حُذف صف التقدم وأُعيد إنشاؤه أو أُعيد الطلب بالتوازي.
--   * XP درس في دورة مدفوعة مقفولة لا يُمنح (الدرس الأول معاينة مجانية كما في التطبيق).
--   * update_user_xp لم تعد تغيّر XP (تبقى بنفس التوقيع حتى لا تتعطل نسخ التطبيق القديمة،
--     فهي تحفظ التقدم أولاً ثم تستدعيها — والـ trigger منح XP بالفعل).
--
-- يعتمد على: 20261001020000 (lesson_catalog.xp) و 20261002000000 (حماية أعمدة profiles).
-- آمن: لا يحذف أي بيانات. التقدم المكتمل سابقاً يُسجَّل كمكافأة قديمة (amount = 0) حتى لا
-- يُمنح XP مرة ثانية. قابل للتكرار.
-- ============================================================================
BEGIN;

-- 1) سجل مكافآت XP (مرة واحدة لكل مصدر)
CREATE TABLE IF NOT EXISTS xp_awards (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('lesson', 'challenge')),
  ref_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  legacy BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, source, ref_id)
);

ALTER TABLE xp_awards ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON xp_awards FROM anon, authenticated;
GRANT SELECT ON xp_awards TO authenticated;
DROP POLICY IF EXISTS xp_awards_select_own ON xp_awards;
CREATE POLICY xp_awards_select_own ON xp_awards
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- 2) الإكمالات السابقة حصلت على XP بالطريقة القديمة: تُسجَّل بلا XP جديد
INSERT INTO xp_awards (user_id, source, ref_id, amount, legacy)
SELECT DISTINCT p.user_id,
       CASE WHEN p.course_id = 'challenges' THEN 'challenge' ELSE 'lesson' END,
       p.lesson_id, 0, TRUE
FROM user_lesson_progress p
JOIN profiles pr ON pr.id = p.user_id
WHERE p.completed IS TRUE
ON CONFLICT (user_id, source, ref_id) DO NOTHING;

-- 3) منح XP (داخلي فقط): ذري — المفتاح الأساسي يمنع المنح المكرر حتى مع الطلبات المتزامنة
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
      level = FLOOR(SQRT((COALESCE(xp, 0) + p_amount) / 100)),
      updated_at = now()
  WHERE id = p_user;
  RETURN p_amount;
END;
$$;
REVOKE ALL ON FUNCTION _xp_award(UUID, TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;

-- 4) هل يحق للمستخدم XP هذا الدرس؟ (نفس قاعدة التطبيق: دورة مجانية، أو مفتوحة، أو الدرس الأول معاينة)
CREATE OR REPLACE FUNCTION _lesson_accessible(p_user UUID, p_lesson_id TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM lesson_catalog lc
    WHERE lc.lesson_id = p_lesson_id
      AND (
        COALESCE((SELECT c.unlock_cost <= 0 FROM course_coin_catalog c WHERE c.course_id = lc.course_id), TRUE)
        OR EXISTS (SELECT 1 FROM user_unlocked_courses u WHERE u.user_id = p_user AND u.course_id = lc.course_id)
        OR lc.position = (SELECT MIN(x.position) FROM lesson_catalog x WHERE x.course_id = lc.course_id)
        OR is_admin(p_user)
      )
  );
$$;
REVOKE ALL ON FUNCTION _lesson_accessible(UUID, TEXT) FROM PUBLIC, anon, authenticated;

-- 5) XP الدرس عند الإكمال (أي مسار يكتب التقدم: التطبيق الجديد، القديم، أو المزامنة المؤجلة)
CREATE OR REPLACE FUNCTION _ulp_award_lesson_xp()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_xp INTEGER;
BEGIN
  -- التحديات تُمنح عبر record_challenge_submission فقط
  IF NEW.completed IS NOT TRUE OR NEW.course_id = 'challenges' OR NEW.user_id IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT xp INTO v_xp FROM lesson_catalog WHERE lesson_id = NEW.lesson_id;
  IF v_xp IS NULL OR NOT _lesson_accessible(NEW.user_id, NEW.lesson_id) THEN
    RETURN NULL; -- درس غير موجود في الكتالوج أو مقفول: التقدم يُحفظ لكن بلا XP
  END IF;
  PERFORM _xp_award(NEW.user_id, 'lesson', NEW.lesson_id, v_xp);
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION _ulp_award_lesson_xp() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_ulp_award_lesson_xp ON user_lesson_progress;
CREATE TRIGGER trg_ulp_award_lesson_xp
  AFTER INSERT OR UPDATE OF completed, lesson_id, course_id ON user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION _ulp_award_lesson_xp();

-- 6) update_user_xp: توافق مع النسخ القديمة فقط — لا يغيّر XP
--    (DROP أولاً لأن نسخة قديمة في الإنتاج قد تستخدم أسماء معاملات مختلفة لنفس التوقيع)
DROP FUNCTION IF EXISTS update_user_xp(UUID, INTEGER);
CREATE FUNCTION update_user_xp(user_id UUID, xp_amount INTEGER) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> update_user_xp.user_id THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;
  -- لا شيء: XP الدرس يُمنح على السيرفر عند حفظ الإكمال (trg_ulp_award_lesson_xp)
END;
$$;
REVOKE ALL ON FUNCTION update_user_xp(UUID, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION update_user_xp(UUID, INTEGER) TO authenticated, service_role;

-- 7) award_xp (قديمة في الإنتاج، لا يستخدمها التطبيق): كانت متاحة لـ anon و authenticated
DO $$
BEGIN
  IF to_regprocedure('public.award_xp(uuid, integer)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.award_xp(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

COMMIT;
