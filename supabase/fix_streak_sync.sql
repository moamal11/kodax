-- Fix sync between user_stats.streak_days and profiles.streak_days
-- المشكلة: update_user_streak تحدث user_stats فقط لكن UI يقرأ من profiles

-- 1. تعديل دالة update_user_streak لتحديث profiles أيضاً
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
    -- First time user
    INSERT INTO user_stats (user_id, streak_days, last_active_date)
    VALUES (p_user_id, 1, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE
    SET streak_days = 1, last_active_date = CURRENT_DATE;
    
    -- ✅ تحديث profiles أيضاً
    UPDATE profiles
    SET streak_days = 1
    WHERE id = p_user_id;
    
  ELSIF v_last_active = CURRENT_DATE THEN
    -- Already active today, no change
    RETURN;
    
  ELSIF v_last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    UPDATE user_stats
    SET streak_days = streak_days + 1,
        last_active_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    
    -- ✅ تحديث profiles أيضاً
    UPDATE profiles
    SET streak_days = profiles.streak_days + 1
    WHERE id = p_user_id;
    
  ELSE
    -- Streak broken, reset to 1
    UPDATE user_stats
    SET streak_days = 1,
        last_active_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    
    -- ✅ تحديث profiles أيضاً
    UPDATE profiles
    SET streak_days = 1
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. مزامنة البيانات الحالية من user_stats إلى profiles
-- (في حال كان هناك اختلاف بين الجدولين)
UPDATE profiles p
SET streak_days = COALESCE(us.streak_days, 0)
FROM user_stats us
WHERE p.id = us.user_id
  AND (p.streak_days IS NULL OR p.streak_days != us.streak_days);

-- 3. إنشاء trigger لمزامنة تلقائية (كخطوة احتياطية)
CREATE OR REPLACE FUNCTION sync_streak_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET streak_days = NEW.streak_days
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- حذف Trigger القديم إن وُجد
DROP TRIGGER IF EXISTS sync_streak_to_profiles_trigger ON user_stats;

-- إنشاء Trigger جديد
CREATE TRIGGER sync_streak_to_profiles_trigger
  AFTER INSERT OR UPDATE OF streak_days ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION sync_streak_to_profiles();
