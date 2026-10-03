-- ============================================================================
-- Phase B (تكملة): مفاتيح NO ACTION غير مباشرة تمنع حذف المستخدم
-- ----------------------------------------------------------------------------
-- اكتُشفت باختبار حذف حقيقي داخل معاملة مُلغاة على الإنتاج: طلبات الدفع القديمة للمستخدم تُحذف
-- CASCADE، لكن سجل المشرف (admin_action_log.order_id) يشير إليها بـ NO ACTION فيفشل الحذف.
-- ============================================================================
DO $$
BEGIN
  -- سجل المشرف يبقى، ويُزال ربطه بالطلب المحذوف
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_action_log_order_id_fkey') THEN
    ALTER TABLE admin_action_log DROP CONSTRAINT admin_action_log_order_id_fkey;
  END IF;
  ALTER TABLE admin_action_log ADD CONSTRAINT admin_action_log_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES payment_orders(id) ON DELETE SET NULL;

  -- إشعارات الدفع تتبع طلبها
  IF to_regclass('public.payment_notifications') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_notifications_order_id_fkey') THEN
      ALTER TABLE payment_notifications DROP CONSTRAINT payment_notifications_order_id_fkey;
    END IF;
    ALTER TABLE payment_notifications ADD CONSTRAINT payment_notifications_order_id_fkey
      FOREIGN KEY (order_id) REFERENCES payment_orders(id) ON DELETE CASCADE;
  END IF;

  -- ترقية الشهادة تشير للشهادة السابقة (نفس المستخدم)
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'certificates_upgraded_from_fkey') THEN
    ALTER TABLE certificates DROP CONSTRAINT certificates_upgraded_from_fkey;
  END IF;
  ALTER TABLE certificates ADD CONSTRAINT certificates_upgraded_from_fkey
    FOREIGN KEY (upgraded_from) REFERENCES certificates(id) ON DELETE SET NULL;
END $$;
