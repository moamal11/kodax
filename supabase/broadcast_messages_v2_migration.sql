-- ============================================================
-- Kodax: تحديث نظام الرسائل العامة v2
-- إضافة: تاريخ انتهاء + استهداف المستخدمين الحاليين فقط
-- ============================================================

-- 1) إضافة عمود تاريخ الانتهاء (اختياري)
ALTER TABLE broadcast_messages 
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL;

-- 2) إضافة خيار "إرسال فقط للمسجلين قبل تاريخ الإرسال"
ALTER TABLE broadcast_messages 
  ADD COLUMN IF NOT EXISTS only_existing_users BOOLEAN DEFAULT false;

-- 3) تحديث دالة جلب الرسائل غير المقروءة لدعم الانتهاء والاستهداف
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
DECLARE
  v_user_created_at TIMESTAMPTZ;
BEGIN
  -- جلب تاريخ تسجيل المستخدم
  SELECT au.created_at INTO v_user_created_at
  FROM auth.users au
  WHERE au.id = p_user_id;

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
    -- فلتر الانتهاء: إذا وجد تاريخ انتهاء يجب أن لا يكون قد مضى
    AND (bm.expires_at IS NULL OR bm.expires_at > NOW())
    -- فلتر المستخدمين الحاليين: إذا مفعّل يجب أن يكون المستخدم مسجل قبل إرسال الرسالة
    AND (
      bm.only_existing_users = false 
      OR v_user_created_at <= bm.scheduled_at
    )
    -- لم يقرأها المستخدم بعد
    AND NOT EXISTS (
      SELECT 1 FROM broadcast_message_reads bmr
      WHERE bmr.message_id = bm.id 
        AND bmr.user_id = p_user_id
    )
  ORDER BY bm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4) إنشاء bucket للصور (إذا لم يوجد)
-- يجب تشغيل هذا يدوياً في Supabase Dashboard → Storage → New Bucket
-- اسم الـ bucket: broadcast-images
-- نوع: public
-- أو تشغيل هذا:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('broadcast-images', 'broadcast-images', true)
ON CONFLICT (id) DO NOTHING;

-- 5) سياسات Storage للصور
-- السماح للأدمن بالرفع والحذف
CREATE POLICY "Admins can upload broadcast images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'broadcast-images'
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete broadcast images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'broadcast-images'
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- الجميع يستطيع قراءة الصور (public)
CREATE POLICY "Anyone can view broadcast images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'broadcast-images');

-- ============================================================
-- انتهى! قم بتشغيل هذا الملف في Supabase SQL Editor
-- ============================================================
