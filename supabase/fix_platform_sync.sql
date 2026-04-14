-- Fix Platform Data Sync Issues
-- يصلح مشاكل عرض البيانات بين الويب والهاتف

-- =====================================
-- 1. إصلاح challenge_attempts.challenge_id
-- =====================================
-- المشكلة: challenge_id هو UUID لكن التطبيق يستخدم TEXT مثل "ch-1", "py-ch-1"
-- الحل: تحويل challenge_id إلى TEXT وإزالة القيد الخارجي

-- حذف القيد الخارجي على challenge_id
ALTER TABLE challenge_attempts
  DROP CONSTRAINT IF EXISTS challenge_attempts_challenge_id_fkey;

-- تحويل challenge_id من UUID إلى TEXT
ALTER TABLE challenge_attempts
  ALTER COLUMN challenge_id TYPE TEXT USING challenge_id::text;

-- إعادة إنشاء الفهرس
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user_id 
  ON challenge_attempts(user_id);

CREATE INDEX IF NOT EXISTS idx_challenge_attempts_challenge_id 
  ON challenge_attempts(challenge_id);

CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user_challenge 
  ON challenge_attempts(user_id, challenge_id);


-- =====================================
-- 2. إنشاء جدول user_badges إذا لم يكن موجوداً
-- =====================================
-- لمزامنة الشارات بين الأجهزة
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id 
  ON user_badges(user_id);

-- Row Level Security
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can earn badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- =====================================
-- 3. إنشاء جدول app_notifications
-- =====================================
-- لمزامنة الإشعارات بين الأجهزة
CREATE TABLE IF NOT EXISTS app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'badge', 'level_up', 'challenge', 'lesson', 'course', 
    'streak', 'xp', 'purchase', 'system'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_app_notifications_user_id 
  ON app_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_app_notifications_user_read 
  ON app_notifications(user_id, read);

CREATE INDEX IF NOT EXISTS idx_app_notifications_created_at 
  ON app_notifications(created_at DESC);

-- Row Level Security
ALTER TABLE app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON app_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications" ON app_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON app_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON app_notifications
  FOR DELETE USING (auth.uid() = user_id);


-- =====================================
-- 4. إنشاء دوال مساعدة
-- =====================================

-- دالة لتنظيف الإشعارات القديمة (الاحتفاظ بآخر 100 إشعار لكل مستخدم)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM app_notifications
  WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY created_at DESC
      ) as rn
      FROM app_notifications
    ) t
    WHERE rn > 100
  );
END;
$$;

-- جدولة التنظيف (يمكن إضافتها لـ pg_cron إذا كان متاحاً)
-- SELECT cron.schedule('cleanup-notifications', '0 2 * * *', 'SELECT cleanup_old_notifications()');


-- =====================================
-- 5. عرض للحصول على إحصائيات المستخدم
-- =====================================
CREATE OR REPLACE VIEW user_stats_summary AS
SELECT 
  p.id as user_id,
  p.xp,
  p.level,
  p.streak_days,
  COALESCE(lesson_stats.completed_lessons, 0) as completed_lessons,
  COALESCE(challenge_stats.completed_challenges, 0) as completed_challenges,
  COALESCE(badge_stats.earned_badges, 0) as earned_badges,
  COALESCE(notif_stats.unread_notifications, 0) as unread_notifications
FROM profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) as completed_lessons
  FROM user_lesson_progress
  WHERE completed = true
  GROUP BY user_id
) lesson_stats ON p.id = lesson_stats.user_id
LEFT JOIN (
  SELECT user_id, COUNT(DISTINCT challenge_id) as completed_challenges
  FROM challenge_attempts
  WHERE passed = true
  GROUP BY user_id
) challenge_stats ON p.id = challenge_stats.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as earned_badges
  FROM user_badges
  GROUP BY user_id
) badge_stats ON p.id = badge_stats.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as unread_notifications
  FROM app_notifications
  WHERE read = false
  GROUP BY user_id
) notif_stats ON p.id = notif_stats.user_id;

-- منح الصلاحيات
GRANT SELECT ON user_stats_summary TO authenticated;


-- =====================================
-- تم الانتهاء من الإصلاحات
-- =====================================
-- بعد تطبيق هذه الترحيل:
-- 1. ستعمل التحديات بشكل صحيح (challenge_id الآن TEXT)
-- 2. ستتزامن الشارات بين الويب والهاتف (user_badges)
-- 3. ستتزامن الإشعارات بين الويب والهاتف (app_notifications)
-- 4. سيتم عرض جميع الإحصائيات بشكل صحيح (user_stats_summary)
