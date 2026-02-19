-- ==========================================
-- مزامنة إشعارات الدفع مع app_notifications
-- ==========================================
-- هذا الملف يضيف trigger لنسخ الإشعارات من payment_notifications
-- إلى app_notifications حتى تظهر في التطبيق

-- دالة المزامنة
CREATE OR REPLACE FUNCTION sync_payment_notification_to_app()
RETURNS TRIGGER AS $$
BEGIN
  -- إنشاء إشعار في app_notifications عند إضافة إشعار دفع
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

-- إنشاء Trigger
DROP TRIGGER IF EXISTS payment_notification_sync_trigger ON payment_notifications;
CREATE TRIGGER payment_notification_sync_trigger
  AFTER INSERT ON payment_notifications
  FOR EACH ROW
  EXECUTE FUNCTION sync_payment_notification_to_app();

-- ملاحظة: تأكد من تطبيق هذا الملف بعد payment_system_migration.sql
