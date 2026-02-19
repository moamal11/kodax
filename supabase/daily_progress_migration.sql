-- =============================================
-- Daily Progress System Migration
-- نظام التقدم اليومي المرتبط بقاعدة البيانات
-- =============================================

-- 1. إنشاء جدول التقدم اليومي
CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  lessons_completed INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  goal_lessons INTEGER DEFAULT 2,
  goal_challenges INTEGER DEFAULT 1,
  goal_xp INTEGER DEFAULT 200,
  streak_at_time INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- كل مستخدم يمكنه سجل واحد فقط لكل يوم
  UNIQUE(user_id, date)
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_id ON daily_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON daily_progress(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON daily_progress(user_id, date DESC);

-- =============================================
-- 2. تعديل دالة update_user_streak
-- الجديد: تقليل السلسلة بمقدار الأيام الغائبة بدلاً من إعادة التعيين
-- =============================================
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_active DATE;
  v_current_streak INTEGER;
  v_days_missed INTEGER;
  v_new_streak INTEGER;
BEGIN
  SELECT last_active_date, streak_days INTO v_last_active, v_current_streak
  FROM user_stats
  WHERE user_id = p_user_id;

  IF v_last_active IS NULL THEN
    -- مستخدم جديد: إنشاء سجل
    INSERT INTO user_stats (user_id, streak_days, last_active_date)
    VALUES (p_user_id, 1, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE
    SET streak_days = 1, last_active_date = CURRENT_DATE;
    
    -- تحديث profiles أيضاً
    UPDATE profiles
    SET streak_days = 1
    WHERE id = p_user_id;
    
  ELSIF v_last_active = CURRENT_DATE THEN
    -- نشط اليوم بالفعل، لا تغيير
    RETURN;
    
  ELSIF v_last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    -- يوم متتابع: زيادة السلسلة
    UPDATE user_stats
    SET streak_days = streak_days + 1,
        last_active_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    
    -- تحديث profiles أيضاً
    UPDATE profiles
    SET streak_days = profiles.streak_days + 1
    WHERE id = p_user_id;
    
  ELSE
    -- ✅ الجديد: تقليل بمقدار الأيام الغائبة بدلاً من إعادة التعيين
    -- حساب عدد الأيام الغائبة (ناقص 1 لأن يوم العودة لا يُحسب كغياب)
    v_days_missed := (CURRENT_DATE - v_last_active)::INTEGER - 1;
    
    -- السلسلة الجديدة = الحالية - الأيام الغائبة (بحد أدنى 0) + 1 (يوم العودة)
    v_new_streak := GREATEST(0, v_current_streak - v_days_missed) + 1;
    
    UPDATE user_stats
    SET streak_days = v_new_streak,
        last_active_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    
    -- تحديث profiles أيضاً
    UPDATE profiles
    SET streak_days = v_new_streak
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. دالة لتسجيل التقدم اليومي (server-side)
-- تمنع التلاعب اليدوي بالبيانات
-- =============================================
CREATE OR REPLACE FUNCTION record_daily_progress(
  p_user_id UUID,
  p_lessons INTEGER DEFAULT 0,
  p_challenges INTEGER DEFAULT 0,
  p_xp INTEGER DEFAULT 0
)
RETURNS json AS $$
DECLARE
  v_level INTEGER;
  v_goal_lessons INTEGER;
  v_goal_challenges INTEGER;
  v_goal_xp INTEGER;
  v_result daily_progress;
BEGIN
  -- جلب مستوى المستخدم لتحديد الأهداف التدريجية
  SELECT COALESCE(level, 1) INTO v_level
  FROM user_stats
  WHERE user_id = p_user_id;
  
  IF v_level IS NULL THEN
    v_level := 1;
  END IF;

  -- ✅ نظام الصعوبة التدريجية حسب المستوى
  -- المستوى 1-3: 2 دروس، 1 تحدي، 200 XP
  -- المستوى 4-6: 3 دروس، 1 تحدي، 300 XP
  -- المستوى 7-10: 4 دروس، 2 تحدي، 400 XP
  -- المستوى 11-15: 5 دروس، 2 تحدي، 500 XP
  -- المستوى 16+: 6 دروس، 3 تحديات، 600 XP
  IF v_level <= 3 THEN
    v_goal_lessons := 2;
    v_goal_challenges := 1;
    v_goal_xp := 200;
  ELSIF v_level <= 6 THEN
    v_goal_lessons := 3;
    v_goal_challenges := 1;
    v_goal_xp := 300;
  ELSIF v_level <= 10 THEN
    v_goal_lessons := 4;
    v_goal_challenges := 2;
    v_goal_xp := 400;
  ELSIF v_level <= 15 THEN
    v_goal_lessons := 5;
    v_goal_challenges := 2;
    v_goal_xp := 500;
  ELSE
    v_goal_lessons := 6;
    v_goal_challenges := 3;
    v_goal_xp := 600;
  END IF;

  -- إدراج أو تحديث سجل اليوم
  INSERT INTO daily_progress (
    user_id, date,
    lessons_completed, challenges_completed, xp_earned,
    goal_lessons, goal_challenges, goal_xp,
    streak_at_time, updated_at
  )
  VALUES (
    p_user_id, CURRENT_DATE,
    p_lessons, p_challenges, p_xp,
    v_goal_lessons, v_goal_challenges, v_goal_xp,
    COALESCE((SELECT streak_days FROM user_stats WHERE user_id = p_user_id), 0),
    NOW()
  )
  ON CONFLICT (user_id, date) DO UPDATE
  SET
    lessons_completed = daily_progress.lessons_completed + p_lessons,
    challenges_completed = daily_progress.challenges_completed + p_challenges,
    xp_earned = daily_progress.xp_earned + p_xp,
    goal_lessons = v_goal_lessons,
    goal_challenges = v_goal_challenges,
    goal_xp = v_goal_xp,
    streak_at_time = COALESCE((SELECT streak_days FROM user_stats WHERE user_id = p_user_id), 0),
    updated_at = NOW()
  RETURNING * INTO v_result;

  RETURN json_build_object(
    'lessons_completed', v_result.lessons_completed,
    'challenges_completed', v_result.challenges_completed,
    'xp_earned', v_result.xp_earned,
    'goal_lessons', v_result.goal_lessons,
    'goal_challenges', v_result.goal_challenges,
    'goal_xp', v_result.goal_xp,
    'streak', v_result.streak_at_time,
    'date', v_result.date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. دالة لجلب التقدم اليومي مع الأهداف
-- =============================================
CREATE OR REPLACE FUNCTION get_daily_progress(p_user_id UUID)
RETURNS json AS $$
DECLARE
  v_result daily_progress;
  v_level INTEGER;
  v_goal_lessons INTEGER;
  v_goal_challenges INTEGER;
  v_goal_xp INTEGER;
BEGIN
  -- جلب سجل اليوم
  SELECT * INTO v_result
  FROM daily_progress
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  -- حساب الأهداف بناءً على المستوى
  SELECT COALESCE(level, 1) INTO v_level
  FROM user_stats
  WHERE user_id = p_user_id;
  
  IF v_level IS NULL THEN v_level := 1; END IF;

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

  IF v_result IS NULL THEN
    -- لا يوجد سجل لليوم، إرجاع قيم فارغة مع الأهداف
    RETURN json_build_object(
      'lessons_completed', 0,
      'challenges_completed', 0,
      'xp_earned', 0,
      'goal_lessons', v_goal_lessons,
      'goal_challenges', v_goal_challenges,
      'goal_xp', v_goal_xp,
      'streak', COALESCE((SELECT streak_days FROM user_stats WHERE user_id = p_user_id), 0),
      'date', CURRENT_DATE
    );
  END IF;

  RETURN json_build_object(
    'lessons_completed', v_result.lessons_completed,
    'challenges_completed', v_result.challenges_completed,
    'xp_earned', v_result.xp_earned,
    'goal_lessons', v_goal_lessons,
    'goal_challenges', v_goal_challenges,
    'goal_xp', v_goal_xp,
    'streak', v_result.streak_at_time,
    'date', v_result.date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. سياسات أمان RLS
-- =============================================
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

-- المستخدم يمكنه قراءة بياناته فقط
CREATE POLICY "Users can read own daily progress"
  ON daily_progress FOR SELECT
  USING (auth.uid() = user_id);

-- لا يمكن للمستخدم الإدراج/التعديل مباشرة — فقط عبر الدوال
-- (الدوال تعمل بـ SECURITY DEFINER)
CREATE POLICY "No direct insert on daily progress"
  ON daily_progress FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update on daily progress"
  ON daily_progress FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete on daily progress"  
  ON daily_progress FOR DELETE
  USING (false);

-- =============================================
-- 6. منح الصلاحيات
-- =============================================
GRANT SELECT ON daily_progress TO authenticated;

-- الدوال (SECURITY DEFINER) لها صلاحية كاملة بالفعل
GRANT EXECUTE ON FUNCTION record_daily_progress TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_progress TO authenticated;
