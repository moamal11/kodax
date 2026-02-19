-- ==========================================
-- إضافة أنواع إشعارات الدفع إلى app_notifications
-- ==========================================
-- هذا الملف يضيف 'payment_approved' و 'payment_rejected' إلى قائمة الأنواع المسموحة

-- 1. إزالة القيد القديم
ALTER TABLE app_notifications 
  DROP CONSTRAINT IF EXISTS app_notifications_type_check;

-- 2. إضافة القيد الجديد مع الأنواع الإضافية
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
    'payment_approved',
    'payment_rejected',
    'like',
    'comment',
    'follow'
  ));

-- ملاحظة: شغّل هذا الملف قبل sync_payment_notifications.sql
