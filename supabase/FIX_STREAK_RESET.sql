-- =============================================
-- إصلاح دالة update_user_streak
-- إعادة التعيين إلى 1 عند الغياب أكثر من يوم واحد
-- =============================================

CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_active DATE;
  v_current_streak INTEGER;
BEGIN
  SELECT last_active_date, streak_days INTO v_last_active, v_current_streak
  FROM user_stats
  WHERE user_id = p_user_id;

  IF v_last_active IS NULL THEN
    -- مستخدم جديد: إنشاء سجل بسلسلة 1
    INSERT INTO user_stats (user_id, streak_days, last_active_date)
    VALUES (p_user_id, 1, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE
    SET streak_days = 1, last_active_date = CURRENT_DATE;
    
    UPDATE profiles
    SET streak_days = 1
    WHERE id = p_user_id;
    
  ELSIF v_last_active = CURRENT_DATE THEN
    -- نشط اليوم بالفعل — لا تغيير
    RETURN;
    
  ELSIF v_last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    -- يوم متتابع: زيادة السلسلة +1
    UPDATE user_stats
    SET streak_days = streak_days + 1,
        last_active_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    
    UPDATE profiles
    SET streak_days = profiles.streak_days + 1
    WHERE id = p_user_id;
    
  ELSE
    -- ✅ غياب أكثر من يوم: إعادة التعيين إلى 1
    UPDATE user_stats
    SET streak_days = 1,
        last_active_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    
    UPDATE profiles
    SET streak_days = 1
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
