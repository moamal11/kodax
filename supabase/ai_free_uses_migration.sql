-- ===== AI Free Uses Migration =====
-- يضيف أعمدة تتبع الاستخدام المجاني للذكاء الاصطناعي
-- كل مستخدم يحصل على 3 استخدامات حل + 3 استخدامات شرح مجانية (مرة واحدة فقط)

-- إضافة الأعمدة لجدول profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ai_solve_uses_remaining INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS ai_explain_uses_remaining INTEGER DEFAULT 3;

-- دالة لاستخدام محاولة حل/شرح بالذكاء (atomic decrement)
CREATE OR REPLACE FUNCTION use_ai_free_attempt(
  p_user_id UUID,
  p_type TEXT -- 'solve' or 'explain'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining INTEGER;
  v_column TEXT;
BEGIN
  -- تحديد العمود المناسب
  IF p_type = 'solve' THEN
    v_column := 'ai_solve_uses_remaining';
  ELSIF p_type = 'explain' THEN
    v_column := 'ai_explain_uses_remaining';
  ELSE
    RETURN json_build_object('success', false, 'error', 'Invalid type. Use solve or explain');
  END IF;

  -- جلب القيمة الحالية
  EXECUTE format('SELECT %I FROM profiles WHERE id = $1', v_column)
    INTO v_remaining
    USING p_user_id;

  -- التحقق من وجود المستخدم
  IF v_remaining IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found', 'remaining', 0);
  END IF;

  -- التحقق من وجود محاولات متبقية
  IF v_remaining <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'No free uses remaining', 'remaining', 0);
  END IF;

  -- إنقاص المحاولة (atomic)
  EXECUTE format('UPDATE profiles SET %I = %I - 1 WHERE id = $1 AND %I > 0', v_column, v_column, v_column)
    USING p_user_id;

  RETURN json_build_object('success', true, 'remaining', v_remaining - 1);
END;
$$;

-- دالة لجلب المحاولات المتبقية
CREATE OR REPLACE FUNCTION get_ai_free_uses(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_solve INTEGER;
  v_explain INTEGER;
BEGIN
  SELECT ai_solve_uses_remaining, ai_explain_uses_remaining
  INTO v_solve, v_explain
  FROM profiles
  WHERE id = p_user_id;

  IF v_solve IS NULL THEN
    RETURN json_build_object('solve', 3, 'explain', 3);
  END IF;

  RETURN json_build_object('solve', COALESCE(v_solve, 3), 'explain', COALESCE(v_explain, 3));
END;
$$;
