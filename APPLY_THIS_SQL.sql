-- =============================================
-- إصلاح جداول المزامنة للشارات والإشعارات
-- ⚠️ يجب تشغيل هذا في Supabase SQL Editor
-- =============================================

-- =====================================
-- 1. جدول الشارات (user_badges) - إعادة إنشاء
-- =====================================
-- ⚠️ حذف الجدول القديم (قد يكون badge_id من نوع UUID خاطئ)
DROP TABLE IF EXISTS user_badges CASCADE;

-- إنشاء الجدول بالنوع الصحيح (badge_id = TEXT)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- الفهارس
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);

-- Row Level Security
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- ✅ سياسة واحدة FOR ALL (تغطي SELECT + INSERT + UPDATE + DELETE)
-- ضروري لعمل upsert بشكل صحيح
CREATE POLICY "Users can manage their own badges" ON user_badges
  FOR ALL USING (auth.uid() = user_id);


-- =====================================
-- 2. جدول الإشعارات (app_notifications) - إعادة إنشاء
-- =====================================
DROP TABLE IF EXISTS app_notifications CASCADE;

CREATE TABLE app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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

-- الفهارس
CREATE INDEX idx_app_notifications_user_id ON app_notifications(user_id);
CREATE INDEX idx_app_notifications_user_read ON app_notifications(user_id, read);
CREATE INDEX idx_app_notifications_created_at ON app_notifications(created_at DESC);

-- Row Level Security
ALTER TABLE app_notifications ENABLE ROW LEVEL SECURITY;

-- ✅ سياسة واحدة FOR ALL
CREATE POLICY "Users can manage their own notifications" ON app_notifications
  FOR ALL USING (auth.uid() = user_id);


-- =====================================
-- 3. التحقق من النجاح
-- =====================================
-- شغّل هذه الأوامر بعد تشغيل الملف:
-- SELECT * FROM user_badges LIMIT 1;
-- SELECT * FROM app_notifications LIMIT 1;
-- إذا لم تظهر أخطاء = نجح! ✅
