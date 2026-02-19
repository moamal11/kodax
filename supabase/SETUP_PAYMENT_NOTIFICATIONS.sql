-- ==========================================
-- إصلاح شامل لنظام إشعارات الدفع - Kodax
-- ==========================================
-- هذا الملف يطبق جميع التعديلات المطلوبة لإشعارات الدفع
-- يجب تطبيقه على قاعدة بيانات Supabase

-- =====================================
-- الخطوة 1: إضافة أنواع الإشعارات الجديدة
-- =====================================
-- إزالة القيد القديم
ALTER TABLE app_notifications 
  DROP CONSTRAINT IF EXISTS app_notifications_type_check;

-- إضافة القيد الجديد مع أنواع الدفع
ALTER TABLE app_notifications 
  ADD CONSTRAINT app_notifications_type_check 
  CHECK (type IN (
    'badge', 
    'level_up', 
    'challenge', 
    'lesson', 
    'course', 
    'streak', 
    'xp', 
    'purchase', 
    'system',
    'payment_approved',    -- ✅ جديد
    'payment_rejected',    -- ✅ جديد
    'like',
    'comment',
    'follow'
  ));

-- =====================================
-- الخطوة 2: إنشاء دالة المزامنة
-- =====================================
CREATE OR REPLACE FUNCTION sync_payment_notification_to_app()
RETURNS TRIGGER AS $$
BEGIN
  -- نسخ الإشعار من payment_notifications إلى app_notifications
  INSERT INTO app_notifications (
    user_id,
    type,
    title,
    message,
    read,
    metadata,
    created_at
  ) VALUES (
    NEW.user_id,
    CASE 
      WHEN NEW.type = 'order_approved' THEN 'payment_approved'
      WHEN NEW.type = 'order_rejected' THEN 'payment_rejected'
      ELSE 'system'
    END,
    NEW.title,
    NEW.message,
    NEW.read,
    jsonb_build_object(
      'orderId', NEW.order_id,
      'navigateTo', '/payment/orders'
    ),
    NEW.created_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- الخطوة 3: إنشاء Trigger
-- =====================================
DROP TRIGGER IF EXISTS payment_notification_sync_trigger ON payment_notifications;

CREATE TRIGGER payment_notification_sync_trigger
  AFTER INSERT ON payment_notifications
  FOR EACH ROW
  EXECUTE FUNCTION sync_payment_notification_to_app();

-- =====================================
-- الخطوة 4: التحقق من النجاح
-- =====================================
-- يمكنك تجربة الإشعار يدوياً:
/*
INSERT INTO payment_notifications (user_id, order_id, type, title, message)
VALUES (
  'your-user-id-here',
  gen_random_uuid(),
  'order_approved',
  'تم اختبار الإشعار',
  'هذا إشعار تجريبي للتأكد من عمل النظام'
);

-- ثم تحقق من app_notifications:
SELECT * FROM app_notifications 
WHERE type IN ('payment_approved', 'payment_rejected')
ORDER BY created_at DESC
LIMIT 5;
*/

-- =====================================
-- ملاحظات مهمة
-- =====================================
-- 1. تأكد من وجود جدول payment_notifications (من payment_system_migration.sql)
-- 2. تأكد من وجود جدول app_notifications
-- 3. الآن عند موافقة/رفض طلب من لوحة التحكم، سيصل الإشعار للمستخدم تلقائياً!
-- 4. الإشعار يحتوي على رابط للانتقال إلى صفحة الطلبات

SELECT 'تم إصلاح نظام الإشعارات بنجاح! ✅' AS status;
