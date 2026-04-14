-- ============================================================
-- Kodax: نظام الرسائل العامة من لوحة التحكم
-- Broadcast Messages System Migration
-- ============================================================

-- 1) جدول الرسائل العامة
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- نوع الرسالة: toast أو modal
  type TEXT NOT NULL CHECK (type IN ('toast', 'modal')),
  
  -- المحتوى
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  
  -- سلوك العرض
  -- once: مرة واحدة فقط (toast الافتراضي)
  -- until_dismissed: تبقى حتى يغلقها المستخدم (modal فقط)
  display_mode TEXT NOT NULL DEFAULT 'once' CHECK (display_mode IN ('once', 'until_dismissed')),
  
  -- الجدولة
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- الحالة
  is_active BOOLEAN DEFAULT true,
  
  -- الاستهداف (للتوسعة لاحقاً)
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'premium', 'free')),
  
  -- بيانات وصفية
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) جدول تتبع عرض الرسائل لكل مستخدم
CREATE TABLE IF NOT EXISTS broadcast_message_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES broadcast_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- منع التكرار: مستخدم واحد لا يقرأ نفس الرسالة مرتين
  UNIQUE(message_id, user_id)
);

-- 3) فهارس لتسريع الاستعلامات
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_active 
  ON broadcast_messages(is_active, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_broadcast_messages_type 
  ON broadcast_messages(type);

CREATE INDEX IF NOT EXISTS idx_broadcast_message_reads_user 
  ON broadcast_message_reads(user_id);

CREATE INDEX IF NOT EXISTS idx_broadcast_message_reads_message 
  ON broadcast_message_reads(message_id);

-- 4) تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_broadcast_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_broadcast_messages_updated_at ON broadcast_messages;
CREATE TRIGGER trigger_broadcast_messages_updated_at
  BEFORE UPDATE ON broadcast_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_broadcast_messages_updated_at();

-- 5) دالة لجلب الرسائل غير المقروءة للمستخدم
CREATE OR REPLACE FUNCTION get_unread_broadcast_messages(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  body TEXT,
  image_url TEXT,
  display_mode TEXT,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bm.id,
    bm.type,
    bm.title,
    bm.body,
    bm.image_url,
    bm.display_mode,
    bm.scheduled_at,
    bm.created_at
  FROM broadcast_messages bm
  WHERE bm.is_active = true
    AND bm.scheduled_at <= NOW()
    AND NOT EXISTS (
      SELECT 1 FROM broadcast_message_reads bmr
      WHERE bmr.message_id = bm.id 
        AND bmr.user_id = p_user_id
    )
  ORDER BY bm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6) دالة لتسجيل قراءة رسالة
CREATE OR REPLACE FUNCTION mark_broadcast_message_read(p_message_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO broadcast_message_reads (message_id, user_id)
  VALUES (p_message_id, p_user_id)
  ON CONFLICT (message_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7) سياسات الأمان (RLS)
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_message_reads ENABLE ROW LEVEL SECURITY;

-- المسؤولين يستطيعون كل شيء على الرسائل
CREATE POLICY "Admins can manage broadcast messages"
  ON broadcast_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- المستخدمون يستطيعون قراءة الرسائل النشطة فقط
CREATE POLICY "Users can read active broadcast messages"
  ON broadcast_messages
  FOR SELECT
  USING (is_active = true AND scheduled_at <= NOW());

-- المستخدمون يستطيعون إدارة سجلات قراءتهم فقط
CREATE POLICY "Users can manage their own reads"
  ON broadcast_message_reads
  FOR ALL
  USING (user_id = auth.uid());

-- المسؤولين يستطيعون رؤية جميع سجلات القراءة
CREATE POLICY "Admins can view all reads"
  ON broadcast_message_reads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- انتهى! قم بتشغيل هذا الملف في Supabase SQL Editor
-- ============================================================
